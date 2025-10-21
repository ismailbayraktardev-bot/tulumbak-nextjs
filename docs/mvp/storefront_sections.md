# Storefront Sections & Components — (No‑Relume Plan)

> Relume iptal ✅. Bu belge, **Next.js + shadcn/ui + Tailwind** ile doğrudan geliştireceğimiz **storefront** katmanının section ve komponent sözleşmesini içerir. Sitemap’taki tüm sayfalar için bileşen haritası, props şemaları, route yapısı ve veri akışı burada netleşir.

---

## 1) Hedefler
- **Hızlı üretim**: hazır section bileşenleri → sayfa kompozisyonu.
- **Tutarlılık**: Design Brief (Lato/Merriweather, amber/bej palet) ile birebir.
- **Performans**: `next/image`, RSC (React Server Components), akıllı `revalidate`.
- **Erişilebilirlik**: AA kontrast, klavye navigasyon, anlamlı alt metin.

---

## 2) Route & Klasör Yapısı (Next.js App Router)
```
apps/store/app/
  layout.tsx                 # Navbar + Footer (store)
  page.tsx                   # Home
  kategori/[slug]/page.tsx   # PLP
  urun/[slug]/page.tsx       # PDP
  blog/page.tsx              # Blog list
  blog/[slug]/page.tsx       # Blog post
  hakkimizda/page.tsx        # About
  iletisim/page.tsx          # Contact
  sepet/page.tsx             # Cart
  odeme/page.tsx             # Checkout
  siparis/basarili/page.tsx  # Order Success
  sss/page.tsx               # FAQ
  sartlar/page.tsx           # Terms & Conditions
  gizlilik/page.tsx          # Privacy Policy

  (components)/storefront/... # Aşağıdaki bileşenler
  (lib)/api.ts               # fetch yardımcıları
  (lib)/types.ts             # DTO eşlemeleri
  (lib)/format.ts            # TL/slot formatlayıcılar
```

> URL yapısı **onaylı**: `/urun/{slug}`, `/kategori/{slug}` (bkz. API specs).

---

## 3) Temel DTO tipleri (özet)
```ts
// lib/types.ts
export type ProductSummary = {
  id: string; name: string; slug: string;
  image: { url: string; alt?: string } | null;
  price_from: number; price_to: number; is_variable: boolean;
}
export type Product = ProductSummary & {
  description?: string;
  images: { url: string; alt?: string }[];
  type: 'simple' | 'variable';
  options?: { kind: 'weight'|'serving'; values: (number|string)[] }[];
  variants?: Array<{
    id: string; sku: string; attrs: Record<string, number|string>;
    price: number; stock_qty?: number; barcode?: string;
  }>
}
export type Category = { id: string; name: string; slug: string; image?: {url:string;alt?:string} }
```

---

## 4) Bileşen Kütüphanesi (props sözleşmeleri)

### 4.1 **Navbar** — `components/storefront/navbar.tsx`
Props:
```ts
{
  links: { label: string; href: string }[];
  cartCount: number;
  onSearch?: (q: string) => void; // mobilde ayrı sayfaya yönlendirilebilir
}
```
Davranış: Sticky; mobilde hamburger; arama input’u md+ görünür, sm’de Search Page.

### 4.2 **Hero** (16:9) — `components/storefront/hero.tsx`
```ts
{
  title: string; subtitle?: string;
  cta: { label: string; href: string };
  image: { src: string; alt: string };
}
```
UI: Sol metin, sağ görsel; CTA primary (#FCA311), subtle gölge, radius 2xl.

### 4.3 **CategoryTiles** (4:3) — `components/storefront/category-tiles.tsx`
```ts
{ items: { title: string; href: string; image: {src:string;alt?:string} }[] }
```
Davranış: 5 kutu; hover’da hafif kaldırma.

### 4.4 **ProductCard** (3:2) — `components/storefront/product-card.tsx`
```ts
{
  product: ProductSummary;
  ctaLabel?: string; // varsayılan: "Seçenekleri Görüntüle"
}
```
Kurallar: İsim max 2 satır; fiyat aralığı `formatTL(price_from)`–`formatTL(price_to)`.

### 4.5 **ProductGrid** — `components/storefront/product-grid.tsx`
```ts
{ products: ProductSummary[]; columns?: { sm:number; md:number; lg:number } }
```
Varsayılan kolonlar: sm:1, md:2, lg:3.

### 4.6 **FilterBar (PLP)** — `components/storefront/filter-bar.tsx`
```ts
{
  categories: Category[];
  selectedCategory?: string; // slug
  weight?: number|null;      // 0.5|1|2|3|4
  priceRange?: [number, number];
  onChange: (state: {
    category?: string; weight?: number|null; price?: [number,number];
    page?: number; sort?: 'price_asc'|'price_desc'|'newest'|'bestseller'
  }) => void;
}
```
Davranış: Sticky top; mobilde yatay scroll pill’ler; fiyat Slider (shadcn `slider`).

### 4.7 **Breadcrumbs** — `components/storefront/breadcrumbs.tsx`
```ts
{ items: { label: string; href?: string }[] }
```

### 4.8 **VariantSelector** — `components/storefront/variant-selector.tsx`
```ts
{
  options: { kind: 'weight'|'serving'; values: (number|string)[] }[];
  selected: Record<string, number|string|undefined>;
  onSelect: (next: Record<string, number|string>) => void;
}
```
UI: pill butonlar; seçili state belirgin; klavye erişimi.

### 4.9 **AccordionSpec** — `components/storefront/accordion-spec.tsx`
```ts
{ items: { title: string; content: string }[] }
```
Kullanım: İçindekiler, Besin Değerleri, Ustanın Önerisi.

### 4.10 **BlogCard** — `components/storefront/blog-card.tsx`
```ts
{ post: { title: string; slug: string; cover?: string; category?: string; excerpt?: string } }
```

### 4.11 **CTASection** — `components/storefront/cta-section.tsx`
```ts
{ title: string; subtitle?: string; ctas: { label: string; href: string }[] }
```
Örnek: Delivery & Contact CTA.

### 4.12 **Footer** — `components/storefront/footer.tsx`
```ts
{ columns: { title: string; links: {label:string;href:string}[] }[] }
```

---

## 5) Sayfa Kompozisyonları (Wire akışı)

### 5.1 Home — `app/page.tsx`
Sıra: Navbar → Hero → Bestsellers(ProductGrid) → CategoryTiles → Brand Story teaser → Blog 3‑Card → CTASection → Footer.

### 5.2 PLP — `app/kategori/[slug]/page.tsx`
Header → **FilterBar (sticky)** → ProductGrid (3 kolon) → Pagination.

### 5.3 PDP — `app/urun/[slug]/page.tsx`
Product Header (sol görsel, sağ bilgi) → VariantSelector → CTA (Sepete Ekle/Hemen Satın Al) → AccordionSpec → Related ProductGrid.

### 5.4 Blog List / Post
List: Featured header → 3 kolon BlogCard grid.  
Post: Başlık + hero görsel + tipografi → Related posts.

### 5.5 Cart / Checkout / Order Success
Cart: Satır listesi + özet kart (lg+ sticky) + Checkout CTA.  
Checkout: 3 adım (İletişim → Adres → Ödeme).  
Order Success: Teşekkür + sipariş no + sosyal/whatsapp CTA.

---

## 6) Veri Akışı & Önbellekleme
- **GET** uçları: `GET /products`, `GET /products/{slug}`, `GET /categories` (bkz. API specs).
- **RSC** ile sunucu tarafında fetch; revalidate önerileri:
  - Home & PLP: `revalidate: 60`  
  - PDP: `revalidate: 300` (varyant ve stok anlık değişirse `no-store` düşünülür)  
  - Blog list/post: `revalidate: 600`
- **Query → URL senkronu**: FilterBar `?weight=1&min_price=100&max_price=400&sort=price_asc` paramlarına yazar/okur.

---

## 7) Erişilebilirlik & Mikrocopy
- **Buton etiketleri**: “Sepete ekle”, “Hemen satın al”, “Filtreleri sıfırla”, “Daha fazla oku”.
- **Alt metin**: “Fıstıklı tulumba, 1 kg” gibi varyantlı alt metin.
- **Klavye**: VariantSelector pill’leri `role="radiogroup"`, ok tuşu/space/enter ile seçim.

---

## 8) Skeleton/Empty/Loading Durumları
- ProductCard skeleton: görsel placeholder + 2 satır metin.
- PLP empty: “Kriterlere uyan ürün bulunamadı.” + Filtreleri Sıfırla.
- PDP loading: görsel shimmer, sağ panel skeleton.

---

## 9) Performans Kuralları
- `next/image` tüm görseller; kart görseli **3:2** `sizes` tanımıyla.  
- `priority` yalnız hero/above-the-fold.  
- Clientside kodu minimum; FilterBar hesapları hafif.  
- Liste sanallaştırma **gerekmez** (3×N grid), plak hızında render hedefi.

---

## 10) İzleme & Analytics (GA4)
- Event’ler: `add_to_cart`, `begin_checkout`, `purchase`, `filter_change`, `search`.  
- PDP varyant seçimi → `select_item_variant` (attrs payload).

---

## 11) Geliştirici Hızlandırıcılar
- **Mock veri**: `apps/store/app/(dev)/mock/*.json` (bestsellers, categories).  
- **UI Kit**: `packages/ui` içinde tekrar kullanılabilir kart/cta/accordion.  
- **Scaffold komutları** (opsiyonel Hygen/Plop):
```
# örn. yeni section
pnpm run gen section Hero
pnpm run gen section ProductGrid
```

---

## 12) QA Kontrol Listesi (Storefront)
- [ ] Navbar sticky + mobil arama sayfası  
- [ ] Hero 16:9, CTA #FCA311  
- [ ] ProductCard oran 3:2; ad 2 satır ellipsis  
- [ ] FilterBar sticky + URL senkron  
- [ ] PDP VariantSelector erişilebilir  
- [ ] Related products 3–4 kart  
- [ ] TL formatları doğru  
- [ ] LCP < 2.5s, CLS < 0.1

### 12.1. Image & Responsiveness Implementation (FE-02)

**Next.js Image Migration**
- All product/hero/category visuals now use `next/image`
- **Ratios**: ProductCard 3:2 · Hero 16:9 · CategoryTile 4:3
- **sizes attribute**:
  - Cards: `(max-width:640px)100vw,(max-width:1024px)50vw,33vw`
  - Hero: `100vw`
- **Loading strategy**: Default `loading="lazy"`; Hero `priority={true}`

**Hover/Transition Polish**
- **Duration**: 250ms `ease-in-out`
- **Effects**: 
  - Opacity: `80→100` on hover
  - Transform: `translate-y-[1px]` lift effect
  - Scale: `group-hover:scale-105` for images
- **Touch optimization**: `touch-action-manipulation` for better mobile experience

**Skeleton & Loading States**
- **Suspense boundaries**: Each grid wrapped with `<Suspense>`
- **Components**: `ProductCardSkeleton`, `ProductGridSkeleton`, `CategoryTilesSkeleton`
- **Implementation**: `animate-pulse` with proper aspect ratios

**Responsive Breakpoints**
- **Grid columns**: `sm:1 md:2 lg:3` (configurable via props)
- **Touch targets**: Minimum 44px for mobile accessibility
- **Image optimization**: WebP/AVIF formats with fallbacks

---

## 13) Sonraki Adımlar
1) **Navbar/Hero/ProductCard** bileşenlerini çıkart.  
2) **PLP FilterBar**’ı URL senkronlu kur.  
3) **PDP VariantSelector** ve AccordionSpec.  
4) Home/PLP/PDP sayfa kompozisyonlarını tamamla.  
5) GA4 event’lerini bağla.

