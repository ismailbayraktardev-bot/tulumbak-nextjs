# Tulumbak — API Specifications (v1)

> **Amaç:** Storefront ve Admin Dashboard için tek ve tutarlı bir REST API sözleşmesi.
> **Stack:** Next.js (App Router) + Node/TypeScript. Auth: **Supabase Auth** (JWT, httpOnly cookie).
> **Para birimi:** TL, varsayılan **KDV dahil** (ayar ile değiştirilebilir).

---

## 0) Konvansiyonlar
- **Base URL:** `https://api.tulumbak.com/api/v1`
- **İçerik türü:** `application/json; charset=utf-8`
- **Authentication:**
  - Storefront: Supabase session (httpOnly cookie) → public GET’ler auth’suz; sepete/checkout’a cookie gerekir.
  - Admin: `Authorization: Bearer <token>` (Supabase service role veya RLS uygun JWT).
- **Rate limit (varsayılan):** IP başına **1000/10dk**. Aşımda `429` + `Retry-After`.
- **İdempotency:** Yazma istekleri için `Idempotency-Key: <uuid>` desteklenir.
- **Sayfalama:** `page` (1..n), `per_page` (max 50). Yanıtta `meta: { page, per_page, total }`.
- **Sıralama:** `sort=price_asc|price_desc|newest|bestseller`.
- **Hata formatı:**
```json
{ "error": { "code": "VALIDATION_ERROR", "message": "…", "fields": { "name": "Required" } } }
```

---

## 1) Enum’lar & Durumlar
- **OrderStatus:** `pending | confirmed | preparing | ready | on_delivery | delivered | cancelled | failed`
- **ProductType:** `simple | variable`
- **StockMode:** `product | variant`  (ürün toplam stoğu veya varyant bazlı)
- **VariantKind:** `weight | serving`  (kg / kişi sayısı)
- **BillingType:** `individual | corporate`

---

## 2) Şemalar (DTO)

### 2.1 Category
```json
{
  "id": "uuid",
  "name": "Tulumbalar",
  "slug": "tulumbalar",
  "parent_id": null,
  "image": { "url": "https://…/tulumba.webp", "alt": "Tulumba" },
  "position": 1,
  "is_active": true
}
```

### 2.2 Product (Basit & Varyantlı)
```json
{
  "id": "uuid",
  "type": "simple|variable",
  "name": "Antep Fıstıklı Tulumba",
  "slug": "antep-fistikli-tulumba",
  "category_id": "uuid",
  "description": "…",
  "images": [ {"url":"https://…/fistikli.webp","alt":"Antep fıstıklı tulumba"} ],
  "sku": "TLM-FST",
  "price": 220.0,               // simple ise zorunlu, variable ise opsiyonel
  "stock_mode": "product|variant",
  "stock_qty": 120,              // stock_mode=product ise kullanılır
  "options": [                   // variable ise zorunlu
    { "kind": "weight",  "values": [0.5, 1, 2, 3, 4] },
    { "kind": "serving", "values": ["3-5"] }
  ],
  "variants": [                  // variable ise zorunlu
    {
      "id": "uuid",
      "sku": "TLM-FST-1KG",
      "attrs": { "weight": 1 },
      "price": 390.0,
      "stock_qty": 20,
      "barcode": "869…"
    }
  ],
  "tax_included": true,
  "is_active": true,
  "created_at": "2025-10-20T12:00:00Z"
}
```

### 2.3 Branch & DeliveryZone
```json
{
  "id": "uuid",
  "name": "İzmir Ulukent",
  "location": { "lat": 38.6, "lng": 27.07 },
  "open_hours": "Mon–Sun 09:00–21:00",
  "active": true
}
```
```json
{
  "id": "uuid",
  "branch_id": "uuid",
  "kind": "polygon|radius",
  "geojson": { "type": "Polygon", "coordinates": [[[27.07,38.6],[…]]] },
  "min_order_total": 0,
  "active_hours": null,
  "active": true
}
```

### 2.4 Cart & CartItem
```json
{
  "id": "cr_abc123",          // cookie veya header ile ilişir
  "items": [
    {
      "id": "ci_1",
      "product_id": "uuid",
      "variant_id": "uuid|null",
      "name": "Fıstıklı Tulumba",
      "attrs": { "weight": 1 },
      "qty": 1,
      "unit_price": 390.0,      // o anki fiyat snapshot
      "line_total": 390.0
    }
  ],
  "subtotal": 390.0,
  "discount_total": 0,
  "shipping_total": 0,
  "tax_total": 0,
  "grand_total": 390.0
}
```

### 2.5 Checkout & Order
```json
{
  "id": "ord_100234",
  "cart_id": "cr_abc123",
  "status": "pending",
  "customer": { "name": "Ali Veli", "email": "ali@…", "phone": "+90…" },
  "billing": { "type": "individual", "tckn": "…", "vkn": null, "company": null },
  "shipping_address": {
    "text": "…", "city": "İzmir", "district": "Menemen",
    "lat": 38.61, "lng": 27.07
  },
  "slot": { "from": "2025-10-21T14:00:00+03:00", "to": "2025-10-21T16:00:00+03:00" },
  "branch_id": null,               // atama sonrası dolar
  "zone_match": true,              // adres bir zone’a düştü mü
  "items": [ /* cart snapshot */ ],
  "amount": { "subtotal": 390, "discount": 0, "grand_total": 390 },
  "payment": { "provider": "paytr", "status": "initiated|paid|failed", "ref": "…" },
  "created_at": "…"
}
```

### 2.6 NotificationTemplate
```json
{
  "id": "uuid",
  "channel": "email|sms",
  "event": "order_created|order_on_delivery|order_delivered|user_activation",
  "language": "tr",
  "subject": "Siparişiniz alındı",
  "body": "Merhaba {{name}}, sipariş no: {{order_no}} toplam: {{total}} …",
  "enabled": true
}
```

---

## 3) Storefront API’leri

### 3.1 Kategoriler
`GET /categories`
- **Sorgu:** `parent_id` (ops.)
- **Yanıt:** `[Category]`

### 3.2 Ürün Listeleme (PLP)
`GET /products`
- **Sorgu:**
  - `category` (slug veya id)
  - `q` (arama)
  - `min_price`, `max_price`
  - `weight` (0.5|1|2|3|4)  
  - `page`, `per_page`, `sort`
- **Yanıt:** `{ data: [ProductSummary], meta }`
- **ProductSummary:** `{ id, name, slug, image, price_from, price_to, is_variable }`

### 3.3 Ürün Detay (PDP)
`GET /products/{slug}`
- **Yanıt:** `Product` (varyantlar dahil)

### 3.4 Sepet
- `POST /carts` → yeni sepet veya mevcut döner `{ id }`
- `GET /carts/{id}` → `Cart`
- `POST /carts/{id}/items`
```json
{ "product_id":"uuid", "variant_id":null, "attrs": {"weight":1}, "qty":1 }
```
- `PATCH /carts/{id}/items/{item_id}` → `{ "qty": 2 }`
- `DELETE /carts/{id}/items/{item_id}`

### 3.5 Kupon (MVP iskelet)
- `POST /carts/{id}/apply-coupon` → `{ "code": "TATLI10" }`
- `DELETE /carts/{id}/coupon`

### 3.6 Checkout → Sipariş
`POST /checkouts/create-order`
```json
{
  "cart_id": "cr_abc123",
  "customer": {"name":"Ali", "email":"…", "phone":"…"},
  "billing": {"type":"individual", "tckn":"…"},
  "shipping_address": {"text":"…", "city":"İzmir", "district":"Menemen", "lat":38.61, "lng":27.07},
  "slot": {"from":"2025-10-21T14:00:00+03:00", "to":"2025-10-21T16:00:00+03:00"}
}
```
- **Yanıt:** `Order` (`status=pending`, `payment.status=initiated`)

### 3.7 Ödeme (PayTR — Basit Akış)
- `POST /payments/paytr/init` → `{ order_id }`  ⇒ `{ iframe_token | redirect_url, ref }`
- **Webhook:** `POST /webhooks/paytr`  
  - İmza doğrulama, ödeme sonucu `paid|failed` → Order güncelle.

### 3.8 Sipariş Görüntüleme (Müşteri)
- `GET /orders/{order_id}` (auth gerekli) → `Order`

---

## 4) Admin API’leri

### 4.1 Products
- `GET /admin/products`  (filtre: `q, category, type, is_active`)
- `POST /admin/products`  → `Product` (create)
- `GET /admin/products/{id}` → `Product`
- `PUT /admin/products/{id}` → `Product`
- `DELETE /admin/products/{id}` → `{ success:true }`
- **CSV:**
  - `POST /admin/products/import` (SheetJS CSV)  
  - `GET /admin/products/export` (CSV)

### 4.2 Categories
- CRUD uçları (`/admin/categories` …)

### 4.3 Orders
- `GET /admin/orders` (filtre: `status, branch_id, from, to, q`)
- `GET /admin/orders/{id}`
- `PATCH /admin/orders/{id}/status` → `{ status: "preparing" }`
- **Şubeye atama:** `POST /admin/orders/{id}/assign-branch` → `{ branch_id }`
- **Kurye atama:** `POST /admin/orders/{id}/assign-courier` → `{ courier_id }`

### 4.4 Couriers
- CRUD + `GET /admin/couriers/availability`

### 4.5 Branches & Delivery Zones
- `GET/POST/PUT/DELETE /admin/branches`
- `GET/POST/PUT/DELETE /admin/zones`
- **Öneri servisi (zone lookup):** `POST /admin/zones/lookup` → `{ lat, lng }` ⇒ `{ branch_id, nearest_km? }`

### 4.6 Pages (CMS Lite)
- CRUD: `/admin/pages` (Hakkımızda, İade/İptal, KVKK, vb.)

### 4.7 Slider/Banner
- CRUD: `/admin/sliders`

### 4.8 Notifications
- CRUD: `/admin/notification-templates`
- **Test gönder:** `POST /admin/notification-templates/{id}/test` → `{ to:"…" }`
- **WhatsApp CTA Ayarı:** `/admin/settings/whatsapp-cta` → `{ phone:"+90…", default_message:"Merhaba…" }`

### 4.9 Analytics
- `GET /admin/analytics/summary?range=24h|7d|30d`
- `GET /admin/analytics/top-products?limit=10`
- `GET /admin/analytics/regions` (en çok sipariş gelen bölge)

### 4.10 Settings
- `GET/PUT /admin/settings/payments` (PayTR key’leri)
- `GET/PUT /admin/settings/rate-limit` (varsayılan 1000/10dk)
- `GET/PUT /admin/settings/tax` (KDV dahil/haric, oran)
- `GET/PUT /admin/settings/branches-roles` (kullanıcı → branch map)

---

## 5) Webhook’lar
### 5.1 Courier (ayrıntı: `integration-courier.md`)
- Endpoint: `POST /webhooks/courier`  
- Olaylar: `order-assigned|order-picked|on-the-way|delivered|failed|location-update(v2)`  
- Güvenlik: `X-Webhook-Signature` (HMAC-SHA256) + idempotency.

### 5.2 PayTR
- Endpoint: `POST /webhooks/paytr`
- Güvenlik: PayTR imza kontrolü; `order_id` ile eşleştirme; `paid|failed`.

---

## 6) Validasyon Kuralları (Özet)
- **Ürün adı:** 2–120 karakter.  
- **SKU:** `^[A-Z0-9-]{3,32}$`.  
- **Fiyat:** `>= 0`.  
- **Variant weight:** `[0.5,1,2,3,4]` (kg)  
- **Serving:** `"3-5"` formatı `^\d+-\d+$`.  
- **Telefon:** E.164 `+90…`  
- **Slot:** ISO-8601; `from < to`; servis saatleri içinde.

---

## 7) Güvenlik & RLS
- **RLS (Supabase):**
  - Storefront müşteri: yalnız **kendi order’larını** okuyabilir.  
  - Admin: role claim → tüm veriler veya branch kısıtı (branch_admin).  
- **CSRF:** Storefront formlarında CSRF token; admin Bearer ile.

---

## 8) Örnekler

### 8.1 PLP — Ürün Listeleme
`GET /products?category=tulumbalar&weight=1&min_price=100&max_price=400&sort=price_asc&page=1&per_page=12`
```json
{
  "data": [
    { "id":"…","name":"Tulumba Tatlısı","slug":"tulumba-tatlisi","image":{"url":"…"},"price_from":120,"price_to":120,"is_variable":false },
    { "id":"…","name":"Antep Fıstıklı Tulumba","slug":"antep-fistikli-tulumba","image":{"url":"…"},"price_from":220,"price_to":390,"is_variable":true }
  ],
  "meta": { "page":1, "per_page":12, "total":37 }
}
```

### 8.2 Sipariş Oluşturma
`POST /checkouts/create-order`
```json
{
  "cart_id":"cr_abc123",
  "customer":{"name":"Ali Veli","email":"ali@…","phone":"+90555…"},
  "billing":{"type":"corporate","vkn":"1234567890","company":"Tulumbak AŞ"},
  "shipping_address":{"text":"Cengiz Topel Cd. …","city":"İzmir","district":"Menemen","lat":38.61,"lng":27.07},
  "slot":{"from":"2025-10-21T14:00:00+03:00","to":"2025-10-21T16:00:00+03:00"}
}
```
**201** → `Order (status=pending)`

---

## 9) Hata Kodları (Seçme)
- `VALIDATION_ERROR` — alan hatası (400)
- `NOT_FOUND` — kayıt yok (404)
- `AUTH_REQUIRED` — oturum yok (401)
- `FORBIDDEN` — yetki yok (403)
- `RATE_LIMITED` — sınır aşıldı (429)
- `CONFLICT` — çakışma (409; idempotency veya stok)
- `PAYMENT_FAILED` — ödeme başarısız (402/400)
- `COURIER_ERROR` — kurye servisinden hata (502)

---

## 10) MVP Kabul Kriterleri
- PLP/PDP/CART/CHECKOUT uçları ve şemaları **tamam**; TL + KDV dahil gösterim.  
- Order → PayTR init → webhook → `paid|failed` güncelleme.  
- Admin: Products, Orders, Branches/Zones, Couriers, Notifications uçları **CRUD** çalışır.  
- Rate limit, idempotency ve hata şeması standarttır.  
- Courier webhook’ları `integration-courier.md` ile birebir uyumlu.

