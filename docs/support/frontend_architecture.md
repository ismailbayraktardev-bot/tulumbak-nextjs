# Frontend Architecture — Tulumbak (Storefront + Admin)

> Amaç: **Next.js (App Router)** + **shadcn/ui** + **Tailwind** üzerinde; **storefront** ve **admin** için tutarlı, hızlı ve bakım kolay mimari. Bu belge, render stratejileri (RSC/SSR/ISR/CSR), veri alma/önbellek, durum yönetimi, routing, formlar, SEO, performans ve güvenlik prensiplerini içerir.

---

## 1) Hedefler & İlkeler
- **Hızlı ilk yük** (LCP < 2.5s store), **düşük kıpırdanma** (CLS < 0.1).
- **Sunucu‑öncelikli**: RSC/SSR ile veri; client bileşenleri yalnız etkileşim için.
- **Basit durum**: Global state minimum; istekler idempotent; URL arayüzün kaynağı.
- **Tek tasarım sistemi**: `design-brief.md` token’larına sadık shadcn bileşenleri.
- **Erişilebilirlik**: AA kontrast; klavye; aria.

---

## 2) Monorepo & Yol Yapısı
```
apps/
  store/                 # Müşteri mağazası (SSR/RSC ağırlıklı)
  admin-dashboard/       # Operasyon paneli (CSR ağırlıklı listeler)
packages/
  ui/                    # Ortak UI (Button, Card, Badge, etc.)
  config/                # ESLint/Prettier/Tailwind config
```

---

## 3) Render Stratejisi
### Storefront (SSR/RSC ağırlıklı)
- **Sayfalar**: Home, PLP, PDP, Blog: **RSC** ile `fetch` (server) + **ISR**/`revalidate`.
- **Sepet/Checkout**: CSR gerektiği yerde küçük ada bileşenler (formlar), ama sipariş oluşturma **server action/route handler**.
- **Önbellek**:
  - Home/PLP: `revalidate: 60`
  - PDP: `revalidate: 300`
  - Blog: `revalidate: 600`
- **Arama/filtre**: URL **search params** (kaynak gerçek); server fetch paramları buradan okunur.

### Admin (CSR + kısmi SSR)
- **Listeler** (Products, Orders): **TanStack Query** (CSR) ile sayfalama/filtre/sort.
- **Detay sayfaları**: SSR veya RSC + hydration; gerçek zamanlı olaylar WebSocket/Supabase Channel.
- **Modaller/Form**: CSR; mutasyonlar Query invalidate ile tazelenir.

---

## 4) Veri Alma Katmanı
### Ortak `lib/api.ts`
- **Store**: RSC `fetch` wrapper (`next: { revalidate }`, `cache: 'force-cache'|'no-store'`).
- **Admin**: TanStack Query `fetcher` (JSON, hata şeması).
- **Hata şeması**: `{ error: { code, message, fields? } }` (bkz. api-specifications.md).

```ts
// apps/store/(lib)/api.ts (örnek)
export async function apiGet<T>(path: string, init?: RequestInit & { revalidate?: number }){
  const res = await fetch(`${process.env.API_URL}/api/v1${path}`, {
    ...init,
    next: { revalidate: init?.revalidate ?? 60 },
    headers: { 'accept': 'application/json' }
  });
  if(!res.ok) throw new Error(`GET ${path}: ${res.status}`);
  return res.json() as Promise<T>;
}
```

---

## 5) Durum Yönetimi
- **Storefront**:
  - **URL odaklı** filtreler → component state yerine `useSearchParams`.
  - **Sepet**: Sunucu taraflı kimlik `cart_id` (cookie). UI için hafif local state (adet seçici). İstekler: server routes.
  - Global state gerekiyorsa **Zustand** (küçük store) kullan.
- **Admin**:
  - **TanStack Query**: listeler, detaylar, mutasyonlar; optimistic update opsiyonel.
  - Realtime olaylar: kanal aboneliği ile Query invalidate/patch.

---

## 6) Routing & URL Sözleşmesi
- Store URL’leri: `/kategori/[slug]`, `/urun/[slug]`, `/blog/[slug]`.
- PLP arama/filtre: `?q=&weight=1&min=100&max=400&sort=price_asc&page=2`.
- Admin: `/products`, `/orders?status=preparing&branch=...`.

---

## 7) Formlar & Doğrulama
- **React Hook Form + Zod**.
- **Server Actions / Route Handlers** ile POST/PATCH; client yalın.

```ts
// örnek zod
const ProductSchema = z.object({
  name: z.string().min(2),
  type: z.enum(['simple','variable']),
  price: z.number().nonnegative().optional(),
});
```

---

## 8) Stil & Design Tokens
- Tailwind config `extend.colors` `#FCA311` / `#FFF9F3` / `#1E293B` vb. (bkz. design-brief.md §12).
- **shadcn/ui** bileşenleri: token’lar ile temalandırılmış; radius: `lg:12 / xl:16 / 2xl:20`.
- **Oranlar**: Hero 16:9; kart 3:2.

---

## 9) Erişilebilirlik
- Form label/aria bağlantıları; modallerde **focus trap**.
- Tablo başlıklarında `aria-sort`.
- VariantSelector `role="radiogroup"`.

---

## 10) Performans
- `next/image` + `sizes`; yalnız hero `priority`.
- Kritik JS küçük: Admin'de sayfa bazlı **code‑split** (`dynamic()` modaller).
- **HTTP cache**: Vercel edge CDN, `stale-while-revalidate` davranışı.
- **WebP** varsayılan; AVIF opsiyonel.

### 10.1. Live API Integration Layer (FE-02)

**Status:** Mock→API migration complete.

**Endpoints Used:**
- `/categories` (Home, FilterBar)
- `/products?category=slug` (PLP)
- `/products/{slug}` (PDP)

**Implementation**

```typescript
export async function apiGet<T>(path: string, revalidate = 60) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    headers: { accept: 'application/json' },
    next: { revalidate }
  });
  if (!res.ok) throw new Error(`${res.status} GET ${path}`);
  return res.json() as Promise<T>;
}
```

**Caching Strategy:**
- Home/PLP: `revalidate: 60` (1 minute)
- PDP: `revalidate: 300` (5 minutes)
- Error handling: 404→`not-found.tsx`, 5xx→`error.tsx`

**Error Handling Patterns:**
- Graceful fallbacks for API failures
- User-friendly error messages in Turkish
- Console logging for debugging (development)

---

## 11) SEO & Schema
- **Metadata API**: her sayfada `generateMetadata()`.
- **Schema.org**: Product, Breadcrumb, Organization JSON‑LD (PDP/PLP/Home).
- **Open Graph/Twitter**: Başlık + kapak görsel (hero/ürün).

---

## 12) Analytics
- **GA4**: `add_to_cart`, `begin_checkout`, `purchase`, `filter_change`, `search`, `select_item_variant`.
- Admin’de yalnız sayfa görüntüleme (gizlilik).

---

## 13) Hata Yönetimi
- `error.tsx`, `not-found.tsx` (Store ve Admin’de).
- API hata mesajlarını kullanıcı dilinde göster; admin’de teknik detay logla.
- Toast/Snackbar: shadcn `use-toast` (admin) — kısa, eylemli.

---

## 14) Güvenlik
- Auth: **Supabase Auth** (httpOnly cookie). RLS kuralları ile admin branch kısıtı.
- **CSP**: img-src (Vercel domainleri), connect-src (API), frame-src (PayTR).
- **CSRF**: Storefront form akışlarında token; admin Bearer.
- **Rate limit**: public POST & webhook’larda (bkz. api-specifications.md).

---

## 15) Ortam Değişkenleri (FE)
- `NEXT_PUBLIC_API_URL` (read‑only)
- `NEXT_PUBLIC_GA_ID`
- (Admin) `NEXT_PUBLIC_WS_URL` (realtime)

*Gizli anahtarlar frontend’e **sızdırılmaz***.

---

## 16) Dosya İskeletleri
### Storefront
```
app/
  layout.tsx            # <Navbar/><Footer/>
  page.tsx              # Home compose
  kategori/[slug]/page.tsx
  urun/[slug]/page.tsx
components/storefront/
  navbar.tsx hero.tsx product-card.tsx product-grid.tsx
  filter-bar.tsx variant-selector.tsx accordion-spec.tsx
  category-tiles.tsx breadcrumbs.tsx cta-section.tsx footer.tsx
lib/
  api.ts types.ts format.ts
```

### Admin
```
app/(dashboard)/layout.tsx
app/(dashboard)/orders/page.tsx
components/
  data-table/* forms/* modals/* widgets/* analytics/*
lib/
  api.ts query-client.ts status.ts table-helpers.ts
```

---

## 17) Kod Parçaları (Özet)
**PLP Server Fetch** (Storefront)
```tsx
// app/kategori/[slug]/page.tsx
import { apiGet } from '@/lib/api';
export default async function PLP({ params, searchParams }:{ params:{slug:string}, searchParams:any }){
  const qs = new URLSearchParams({
    category: params.slug,
    q: searchParams.q ?? '',
    weight: searchParams.weight ?? '',
    min_price: searchParams.min ?? '',
    max_price: searchParams.max ?? '',
    sort: searchParams.sort ?? 'price_asc',
    page: searchParams.page ?? '1', per_page: '12'
  }).toString();
  const { data, meta } = await apiGet(`/products?${qs}`, { revalidate: 60 });
  return /* compose: <FilterBar/> + <ProductGrid/> + Pagination */
}
```

**Admin Orders (Query)**
```tsx
// app/(dashboard)/orders/page.tsx
const { data } = useQuery({ queryKey:['orders', filters], queryFn: ()=>api.get('/admin/orders', { params: filters }) });
```

---

## 18) QA & Kabul Kriterleri
- Store: Home/PLP/PDP sayfaları **SSR/RSC** ile çalışır; PLP filtreleri URL senkron; TL ve tarih formatları TR.
- Sepet → Checkout akışı sorunsuz; PayTR init → webhook sonrası Order güncellenir.
- Admin: Products & Orders listeleri TanStack Query’li; realtime toast’lar tetiklenir; Assign Branch/Courier modalleri çalışır.
- SEO: PDP’de Product JSON‑LD var; Open Graph meta dolu.
- Performans hedefleri ilk ölçümde karşılanır (Lighthouse dev).

---

## 19) Uygulama Planı (MVP ‑ 3 Gün)
**Gün 1**
- Store: Navbar, Hero, ProductCard, ProductGrid; PLP server fetch & FilterBar (URL senkron).  
- Admin: App shell (`dashboard-01`), Orders listesi iskeleti.

**Gün 2**
- Store: PDP (VariantSelector, Accordions, Related).  
- Checkout form (iskele) + Order create.
- Admin: Products CRUD formu (Zod + RHF), CSV import dialog (iskele).

**Gün 3**
- PayTR init + webhook bağlama (mock); Notifications (order_created).  
- Delivery Zones UI (iskele) + BranchSuggest widget.  
- SEO/Analytics, A11y pass, performans ince ayarları.

