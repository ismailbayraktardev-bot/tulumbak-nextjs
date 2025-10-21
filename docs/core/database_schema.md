# Tulumbak — Database Schema (PostgreSQL + (opsiyonel) PostGIS)

> Amaç: Ürün/varyant, çok şubeli stok, sipariş/ödeme, slot, kurye entegrasyonu (webhook log), bildirim şablonları ve basit CMS ihtiyacını kapsayan **MVP şema**.  
> Not: Supabase Auth kullanılacağı için **kimlik** tabloları Supabase’in kendi şemasıyla gelir. Biz yalnızca `public.profile` gibi minimal ek tabloları tanımlarız.

---

## 0) Temeller
- **Dil & Para**: TR, TL (numeric(12,2)). Varsayılan **KDV dahil** kayıt (ayar ile değiştirilebilir).
- **Zaman**: `timestamptz` (UTC sakla, TR görüntüle).
- **Kimlikler**: `uuid` (gen_random_uuid()).
- **Arama**: Türkçe dil desteği için `pg_trgm` + (opsiyonel) `unaccent`.
- **Coğrafi**: Bölge/zon için **PostGIS** (önerilir) veya `jsonb` fallback.
- **Enum’lar**: `order_status`, `product_type`, `stock_mode`, `variant_kind`, `billing_type`, `delivery_status`.

```sql
-- Gerekli uzantılar
CREATE EXTENSION IF NOT EXISTS pgcrypto;    -- gen_random_uuid
CREATE EXTENSION IF NOT EXISTS pg_trgm;     -- fuzzy/LIKE arama
-- Opsiyonel
-- CREATE EXTENSION IF NOT EXISTS postgis; -- zone için geometry(Polygon,4326)
```

---

## 1) Enum Tipleri
```sql
CREATE TYPE order_status   AS ENUM ('pending','confirmed','preparing','ready','on_delivery','delivered','cancelled','failed');
CREATE TYPE product_type   AS ENUM ('simple','variable');
CREATE TYPE stock_mode     AS ENUM ('product','variant');
CREATE TYPE variant_kind   AS ENUM ('weight','serving');
CREATE TYPE billing_type   AS ENUM ('individual','corporate');
CREATE TYPE delivery_status AS ENUM ('pending','assigned','picked','on_the_way','delivered','failed','cancelled');
```

---

## 2) Katalog (Categories, Products, Variants)
```sql
CREATE TABLE category (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 120),
  slug text NOT NULL UNIQUE,
  parent_id uuid REFERENCES category(id) ON DELETE SET NULL,
  image_url text,
  image_alt text,
  position int DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE product (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type product_type NOT NULL DEFAULT 'simple',
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  category_id uuid NOT NULL REFERENCES category(id) ON DELETE RESTRICT,
  description text,
  sku text UNIQUE,
  price numeric(12,2),                -- simple ise zorunlu, variable ise NULL olabilir
  stock_mode stock_mode NOT NULL DEFAULT 'product',
  stock_qty int,                       -- stock_mode='product' ise anlamlı
  tax_included boolean NOT NULL DEFAULT true,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT sku_format CHECK (sku IS NULL OR sku ~ '^[A-Z0-9-]{3,32}$')
);

CREATE TABLE product_image (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES product(id) ON DELETE CASCADE,
  url text NOT NULL,
  alt text,
  position int DEFAULT 0
);

-- Varyant opsiyon tanımı (şematik)
CREATE TABLE product_option (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES product(id) ON DELETE CASCADE,
  kind variant_kind NOT NULL,     -- weight | serving
  label text NOT NULL             -- örn. "Gramaj" / "Kişi"
);

CREATE TABLE product_variant (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES product(id) ON DELETE CASCADE,
  sku text UNIQUE,
  attrs jsonb NOT NULL,           -- {"weight":1} veya {"serving":"3-5"}
  price numeric(12,2) NOT NULL,
  stock_qty int,                  -- stock_mode='variant' ise anlamlı
  barcode text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT sku_format_var CHECK (sku IS NULL OR sku ~ '^[A-Z0-9-]{3,32}$')
);

CREATE INDEX idx_product_category ON product(category_id);
CREATE INDEX idx_product_name_trgm ON product USING gin (name gin_trgm_ops);
CREATE INDEX idx_product_slug ON product(slug);
```

> **Not:** `attrs` içinde `weight` değeri **(0.5,1,2,3,4)**, `serving` değeri **"3-5"** gibi string tutulur. Bu doğrulamalar uygulama katmanında veya trigger ile yapılabilir.

---

## 3) Şube & Bölge (Branch, Delivery Zone)
```sql
CREATE TABLE branch (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  lat double precision,
  lng double precision,
  open_hours text,
  active boolean NOT NULL DEFAULT true
);

-- PostGIS varsa geometry ile
-- geometry(Polygon,4326) | MultiPolygon
-- Fallback: geojson jsonb
CREATE TABLE delivery_zone (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid NOT NULL REFERENCES branch(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('polygon','radius')),
  geojson jsonb NOT NULL,           -- { type: 'Polygon', coordinates: [...] } veya { center:{lat,lng}, radius_m }
  min_order_total numeric(12,2) DEFAULT 0,
  active_hours text,
  active boolean NOT NULL DEFAULT true
);

CREATE INDEX idx_zone_branch ON delivery_zone(branch_id);
```

> **Geo Alternatifleri**: PostGIS kullanılacaksa `geometry` alanıyla ve `ST_Contains` / `ST_DWithin` sorgularıyla çalışılır. MVP’de `jsonb` + turf.js yeterlidir.

---

## 4) Stok (Global + Şube Bazlı Override)
```sql
-- Şube bazlı stok (ürün VEYA varyant). Öncelik: branch bazlı kayıt varsa globali override eder.
CREATE TABLE branch_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid NOT NULL REFERENCES branch(id) ON DELETE CASCADE,
  product_id uuid REFERENCES product(id) ON DELETE CASCADE,
  variant_id uuid REFERENCES product_variant(id) ON DELETE CASCADE,
  stock_qty int NOT NULL,
  UNIQUE (branch_id, COALESCE(product_id, variant_id))
);
```

> **Kural**: `product.stock_mode='variant'` ise `branch_inventory` satırında **variant_id** kullanılmalı; `product` stok alanları ihmal edilir. Uygulama katmanında doğrulanır.

---

## 5) Sepet & Kupon
```sql
CREATE TABLE cart (
  id text PRIMARY KEY,                -- örn. cr_abc123 (cookie ile ilişir)
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE cart_item (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id text NOT NULL REFERENCES cart(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES product(id) ON DELETE RESTRICT,
  variant_id uuid REFERENCES product_variant(id) ON DELETE RESTRICT,
  attrs jsonb,
  qty int NOT NULL CHECK (qty > 0),
  unit_price numeric(12,2) NOT NULL,
  line_total numeric(12,2) NOT NULL
);

CREATE TABLE coupon (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  type text NOT NULL CHECK (type IN ('percent','fixed')),
  value numeric(12,2) NOT NULL,
  min_subtotal numeric(12,2) DEFAULT 0,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE cart_coupon (
  cart_id text PRIMARY KEY REFERENCES cart(id) ON DELETE CASCADE,
  coupon_id uuid NOT NULL REFERENCES coupon(id) ON DELETE RESTRICT
);
```

---

## 6) Sipariş & Ödeme
```sql
CREATE TABLE "order" (
  id text PRIMARY KEY,                -- ord_100234 gibi
  customer_id uuid,                   -- supabase auth.user id (opsiyonel)
  status order_status NOT NULL DEFAULT 'pending',
  customer_name text NOT NULL,
  customer_email text,
  customer_phone text,
  billing_type billing_type NOT NULL DEFAULT 'individual',
  billing_tckn text,
  billing_vkn text,
  billing_company text,
  shipping_address text NOT NULL,
  city text, district text,
  lat double precision, lng double precision,
  slot_from timestamptz,             -- 2025-10-21T14:00+03:00
  slot_to   timestamptz,             -- 2025-10-21T16:00+03:00
  branch_id uuid REFERENCES branch(id),
  zone_match boolean,
  subtotal numeric(12,2) NOT NULL,
  discount_total numeric(12,2) NOT NULL DEFAULT 0,
  shipping_total numeric(12,2) NOT NULL DEFAULT 0,
  tax_total numeric(12,2) NOT NULL DEFAULT 0,
  grand_total numeric(12,2) NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE order_item (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id text NOT NULL REFERENCES "order"(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES product(id),
  variant_id uuid REFERENCES product_variant(id),
  name text NOT NULL,
  attrs jsonb,
  qty int NOT NULL,
  unit_price numeric(12,2) NOT NULL,
  line_total numeric(12,2) NOT NULL
);

CREATE TABLE order_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id text NOT NULL REFERENCES "order"(id) ON DELETE CASCADE,
  status order_status NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- PayTR
CREATE TABLE payment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id text NOT NULL REFERENCES "order"(id) ON DELETE CASCADE,
  provider text NOT NULL DEFAULT 'paytr',
  status text NOT NULL CHECK (status IN ('initiated','paid','failed')),
  ref text,                           -- PayTR ref
  payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_order_created ON "order"(created_at DESC);
CREATE INDEX idx_order_status ON "order"(status);
```

---

## 7) Kurye & Teslimat (Webhook Log dahil)
```sql
CREATE TABLE courier (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  vehicle_type text CHECK (vehicle_type IN ('bike','motorcycle','car')),
  active boolean NOT NULL DEFAULT true
);

CREATE TABLE delivery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id text NOT NULL UNIQUE REFERENCES "order"(id) ON DELETE CASCADE,
  branch_id uuid NOT NULL REFERENCES branch(id),
  courier_id uuid REFERENCES courier(id),
  address text,
  lat double precision, lng double precision,
  slot_from timestamptz, slot_to timestamptz,
  status delivery_status NOT NULL DEFAULT 'pending',
  courier_ref text,                 -- karşı servisteki id
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE courier_event (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text NOT NULL UNIQUE,
  event_type text NOT NULL,         -- order-assigned|picked|on-the-way|delivered|failed|location-update
  payload jsonb NOT NULL,
  signature_valid boolean,
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_delivery_status ON delivery(status);
```

---

## 8) Bildirimler & WhatsApp CTA
```sql
CREATE TABLE notification_template (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel text NOT NULL CHECK (channel IN ('email','sms')),
  event text NOT NULL,
  language text NOT NULL DEFAULT 'tr',
  subject text,
  body text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE notification_message (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES notification_template(id) ON DELETE SET NULL,
  order_id text REFERENCES "order"(id) ON DELETE SET NULL,
  channel text NOT NULL,
  to_address text NOT NULL,
  payload jsonb,
  status text NOT NULL DEFAULT 'queued',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Storefront WhatsApp floating button ayarı
CREATE TABLE setting (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
-- örn. INSERT INTO setting(key,value) VALUES ('whatsapp_cta', '{"phone":"+90…","message":"Merhaba…"}');
```

---

## 9) CMS (Pages, Slider/Banner, Blog)
```sql
CREATE TABLE page (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  body text NOT NULL,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE slider (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  image_url text NOT NULL,
  link_url text,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE blog_post (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  cover_url text,
  category text,
  body text NOT NULL,
  published boolean NOT NULL DEFAULT true,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

---

## 10) Arama & Analitik Yardımcıları
```sql
-- Fulltext alanı (ürün adı + açıklama)
CREATE MATERIALIZED VIEW product_search_mv AS
SELECT p.id,
       setweight(to_tsvector('turkish', coalesce(p.name,'')), 'A') ||
       setweight(to_tsvector('turkish', coalesce(p.description,'')), 'C') AS ts
FROM product p
WHERE p.is_active = true;

CREATE INDEX idx_product_search_gin ON product_search_mv USING gin (ts);
```

> Alternatif/ek: `gin_trgm_ops` ile `ILIKE` hızlandırma zaten eklendi (`idx_product_name_trgm`).

---

## 11) RLS & Yetki Örnekleri (Supabase)
> RLS politikaları örnektir; gerçek claim alan adlarını Supabase konfigürasyonuna göre set edin.

```sql
-- Örnek: branch_admin yalnız kendi şubesinin kayıtlarını görebilsin
ALTER TABLE "order" ENABLE ROW LEVEL SECURITY;
CREATE POLICY order_branch_admin_read ON "order"
  FOR SELECT USING (
    auth.role() IN ('admin','super_admin') OR
    (auth.role() = 'branch_admin' AND branch_id = (current_setting('request.jwt.claims', true)::jsonb->>'branch_id')::uuid)
  );
```

---

## 12) İndeks & Performans Kontrol Listesi
- [x] `product(category_id)`, `product(slug)`  
- [x] `product name trgm`  
- [x] `order(created_at)`, `order(status)`  
- [x] `delivery(status)`  
- [x] `category(slug)`  
- [x] `blog_post(slug, published_at)`  
- [x] `branch_inventory(branch_id, product_id|variant_id)` unique

---

## 13) Migrasyon Notları
1. Uzantıları yükle (`pg_trgm`, ops. `postgis`).  
2. Enum tiplerini oluştur.  
3. Temel tablolar: category → product → product_variant → branch → delivery_zone.  
4. Sepet/sipariş/ödeme.  
5. Kurye/delivery + webhook log.  
6. Notification/template + settings.  
7. CMS tabloları.  
8. İndeksler & mat. view.

**Seed Önerisi (örnek kategoriler/ürünler)**
- Kategoriler: Tulumbalar, Sütlü Tatlılar, Şerbetli Tatlılar.  
- Ürünler: Kullanıcının verdiği listeye göre insert (SKU formatı `TLM-…`, `BKL-…`).

---

## 14) ER Diyagramı (özet, ASCII)
```
category 1—* product 1—* product_variant
                     \           \
                      * product_image

branch 1—* delivery_zone
branch 1—* branch_inventory *—1 product_variant
                               \—1 product

cart 1—* cart_item → product (opt variant)

order 1—* order_item (snapshot)
order 1—1 payment
order 1—1 delivery 1—* courier_event

notification_template 1—* notification_message

setting (KV)
page/slider/blog_post (CMS)
```

---

## 15) Kabul Kriterleri (DB — MVP)
- Ürün/varyant + stok modu (ürün/varyant) ve **şube bazlı override** destekleniyor.  
- Sipariş → slot, şube atama alanları mevcut; durum geçmişi kaydı var.  
- Kurye teslimat ve webhook log tabloları hazır, idempotent alan (`event_id`) unique.  
- Bildirim şablonları ve mesaj kuyruğu tabloları hazır.  
- WhatsApp CTA ayarı `setting` tablosunda saklanıyor.  
- CMS (sayfa/slider/blog) temel gereksinimleri karşılıyor.  
- Arama ve indeksler performans hede