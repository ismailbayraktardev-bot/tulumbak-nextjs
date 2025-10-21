# Admin Dashboard Brief — Tulumbak

> Amaç: Operasyon ekibinin **hızlı, hatasız ve çok şubeli** çalışma ihtiyaçlarını tek panelde çözmek. Bu brief; bilgi mimarisi (IA), rol/yetki modeli (RBAC), ekran/komponent kapsamı, gerçek‑zamanlı davranışlar, tema/tasarım kuralları ve kabul kriterlerini içerir.

---

## 1) Kullanıcılar & Roller (RBAC)
- **super_admin**: Tüm modüller + tüm şubeler; ayarlar, entegrasyonlar, rol yönetimi.
- **admin**: Tüm modüller ama global ayarların bir kısmı sınırlı; tüm şubeleri görüntüleme.
- **branch_admin** (şube yetkilisi): Yalnızca **kendi şubesine** bağlı veri (ürün, stok, sipariş, kurye). Bölge/zon ve kurumsal ayarlar kapalı.
- **customer**: Admin paneline erişimi yok.

**Row‑level veri kısıtı:** `branch_admin` için liste ve detay sorguları **branch_id** ile otomatik filtrelenir.

---

## 2) Bilgi Mimarisi (IA) & Navigasyon
Sol sabit **Sidebar** aşağıdaki gruplar ile gelir. Üst bar sticky.

- **Catalog**  
  - Products  
  - Categories
- **Operations**  
  - Orders (Realtime)  
  - Couriers  
  - Delivery Zones (Bölgeler)
- **Content**  
  - Pages (statik sayfalar: Hakkımızda, İade/İptal vb.)  
  - Slider/Banner
- **Messaging**  
  - Notifications (Email/SMS şablonları)  
  - WhatsApp CTA (floating button ayarları)
- **Analytics**  
  - Overview (KPI + grafikler)  
  - Product Performance  
  - Region Heatmap (en çok sipariş gelen bölge)
- **Settings**  
  - Payments (PayTR)  
  - Courier Integration  
  - Rate Limit & Security  
  - Branches (Şube bilgileri)  
  - Users & Roles

---

## 3) App Shell Kuralları
- **Yerleşim:** Sol **Sidebar (sabit)** + Üst **Topbar (sticky)** + yalnız **içerik alanı scroll**.
- **Padding:** İçerik konteyneri `24–32px` (md: 24, lg: 32).
- **Breadcrumbs:** Sayfa başlığının hemen üstünde, içerik alanında.
- **Global header/footer yok.**
- **Komut paleti:** `⌘K / Ctrl+K` Quick Search (ürün/sipariş/kullanıcı/şube).

---

## 4) Tema & Design Tokens
- **Renkler:**  
  `--primary: #FCA311` (Amber)  
  `--background: #FFF9F3` (Pastel bej)  
  `--foreground: #1E293B` (Slate)  
  `--muted: #F1F5F9`  
  `--destructive: #DC2626`
- **Tipografi:** **Lato** (UI), **Merriweather** (başlık/paragraf yoğun sayfalar).  
- **Radius:** `lg:12 / xl:16 / 2xl:20`  
- **Gölge:** `card: 0 6px 20px rgba(0,0,0,0.05)`
- **Dark mode:** **yok** (MVP).

> Uygulama: shadcn/ui theme değişkenleri Tailwind config’te bu token’larla eşleştirilir.

---

## 5) Modül Kapsamları & Ekranlar

### 5.1 Products
- **Liste**: arama, kategori filtresi, stok durumu, fiyat aralığı; kolonlar: Görsel, Ad, SKU, Tip (Basit/Varyant), Fiyat, Stok, Branch, Durum, İşlemler.
- **Toplu işlemler**: Publish/Unpublish, CSV import/export (SheetJS ile), Fiyat güncelle, Silme.  
- **Ekle/Düzenle**:  
  - **Ürün tipi**: Basit Ürün veya Varyantlı Ürün.  
  - **Varyantlar**: **Ağırlık (kg)**, **Kişi (3–5 kişilik, vb.)**; varyant bazlı **fiyat** ve **stok** opsiyonel.  
  - **Fiyat**: varyanta göre **veya** sabit; kampanya/indirim alanları.  
  - **SKU/Formül**: öneri butonu → `CAT-SKU-VAR-WT` formatında otomatik üret.  
  - **Görseller**: drag&drop, otomatik WebP, alt text.

### 5.2 Categories
- CRUD + hiyerarşi (opsiyonel). Ürün sayısına göre rozet.

### 5.3 Orders (Realtime)
- **Liste**: canlı akış; filtre: durum, şube, zaman dilimi, bölge.  
  Kolonlar: Sipariş No, Müşteri, Tutar, Slot, Şube, Durum (badge), Oluşturma Tarihi, İşlemler.  
- **Detay**: ürünler, adres haritası, seçilen slot, ödeme özeti, notlar, **durum zaman çizgisi**.  
- **Realtime Toast**: durum güncellemesi ve yeni siparişte ekran köşesinde bildirim.  
- **Durum geçişleri**: `pending → confirmed → preparing → ready → on_delivery → delivered` (+ `cancelled|failed`).

### 5.4 Couriers
- **Siparişe kurye atama**: manuel atama (modal/drawer) veya kurye önerisi.  
- **Kurye listesi**: mevcut/uygun; **v2**: konum göstergesi (yalnız demo).  
- **Webhook logları**: son 100 olay, imza doğrulama sonucu, idempotency notu.

### 5.5 Delivery Zones (Bölgeler)
- **Şube yönetimi**: her şubenin adresi, koordinatı, çalışma saatleri.  
- **Bölge ekle**: çokgen veya yarıçap; **şube eşle**; min. sepet tutarı, aktif saatler.  
- **Adres → Şube atama**: yeni siparişte adresin **hangi bölgeye düştüğünü** hesapla; **“Önerilen Şube” widget’ı** göster (aşağıda bkz.).

### 5.6 Pages (CMS Lite)
- Basit statik sayfalar: Hakkımızda, İade/İptal politikası, KVKK, Teslimat.

### 5.7 Slider/Banner
- Ana sayfa slider’ları, kampanya banner’ları; yayınlama tarih/saat aralığı.

### 5.8 Notifications
- **Şablonlar**: Email ve SMS (TR).  
- **Tetikleyiciler**: üye aktivasyon, sipariş alındı/hazırlanıyor/yolda/teslim/başarısız.  
- **WhatsApp CTA**: "+90…" numara, ön yazı metni; storefront’ta floating button.

### 5.9 Analytics
- **KPI**: Bugün sipariş, Gelir, İptal oranı, Teslim süresi medyan.  
- **Grafik**: Son 24s / 1 hafta / 1 ay sipariş sayısı & gelir.  
- **En çok satan ürünler** ve **en çok sipariş gelen bölge** heatmap (v1: tablo + basit harita).

### 5.10 Settings
- PayTR, Courier, Rate Limit, Branches, Users & Roles, Taxes (KDV dahil/haric), Para birimi (TL), Tarih/saat (TR), Domain/SEO başlıkları.

---

## 6) "Sipariş → Şube Atama" Widget’ı (Kritik)
**Amaç:** Yeni sipariş geldiğinde, adrese göre **önerilen şubeyi** bulmak ve operatörün tek tıklama ile atamasını sağlamak.

1) **Otomatik hesap**  
   - Adres koordinatı → **zone lookup** (çokgen/yarıçap).  
   - Hiçbiri eşleşmezse: **en yakın şube** (Haversine) ve uyarı rozeti: “Bölge dışı (yakın: Ulukent)”.
2) **Widget (Orders listesinde yeni satırda veya detay görünümde)**  
   - “Önerilen: **Menemen Lise Yolu** (2.1 km)”  
   - Butonlar: **Ata**, **Değiştir…** (açılır listede diğer şubeler mesafe ile)  
   - Not: atama sonrası kurye atama modal’ı açılabilir.
3) **Kurallar**  
   - Zone > Mesafe önceliği.  
   - Çalışma saatleri dışında ise uyarı: “Şube kapalı, diğerini öner.”  
   - Idempotent: aynı sipariş için birden fazla atama engeli.

---

## 7) Tablolar & A11y Standartları
- **TanStack Table**: server‑side `?page, q, sort, filter` senkronu; sütun görünürlüğü; CSV export.  
- **Satır yoğunluğu**: rahat; zebra opsiyonel.  
- **Durum rozetleri**:  
  - `pending` gray, `confirmed` blue, `preparing` amber, `ready` amber/600, `on_delivery` sky, `delivered` green, `cancelled|failed` red.  
- **A11y**: Klavye navigasyon, `aria-sort`, focus ring; modal'larda focus trap & escape; ikonlu butonlarda `aria-label`.

### 7.1. TanStack Table Implementation (FE-02)

**Implemented Features**
- **Pagination** · **Sorting** · **Search**
- **Column visibility toggle**
- **Filters** (Select / Text)
- **Row selection**
- **Data fetch via API** (`/admin/products`, `/admin/categories`)

**Components**
- **`useDataTable` hook**: State + query sync management
- **`AdminDataTable` component**: Full table implementation with TanStack Table
- **`AdminFormDrawer` shell**: For CRUD operations (placeholder)
- **Toast notifications**: Success/error feedback

**Server-side Integration**
- URL parameter synchronization (`?page=1&q=search&sort=name:asc`)
- Automatic re-fetch on filter changes
- Optimistic UI updates for better UX

**Next Step (FE-03)**
- Drawer → real mutations (POST/PUT/DELETE)
- Inline edit & bulk actions
- Export CSV/Excel support

---

## 8) Gerçek Zamanlı Davranışlar
- **Sipariş kanal adı:** `admin-orders`.  
- **Olaylar:** order.created, order.updated(status).  
- **UI:** Toast + liste satırı highlight; badge animasyonu hafif.
- **Kuryeler (v2):** demo konum güncellemesi (harita üzerinde pulse).

---

## 9) shadcn/ui Bileşen Haritası
- Çekirdek: `button`, `input`, `form`, `select`, `dialog`, `dropdown-menu`, `sheet`, `tabs`, `accordion`, `badge`, `separator`, `toast`, `table`, `pagination`, `tooltip`, `scroll-area`, `avatar`.  
- Ek: `slider` (fiyat), `toggle-group` (varyant), `command` (⌘K search), `map` (custom bileşen / harita lib).  
- **Başlangıç bloğu:** `dashboard-01` → app shell temeli.

---

## 10) İçerik & Mikrocopy Rehberi
- **Dil:** TR, kısa ve açıklayıcı.  
- **Hata mesajları:** kullanıcı dilinde, çözüm önerili.  
- **CTA metinleri:** “Kaydet”, “Yayınla”, “CSV Dışa Aktar”, “Kurye Ata”, “Şubeye Ata”.

---

## 11) Ölçüm & Analytics (Admin)
- **KPI kartları**: Sipariş sayısı, Toplam gelir, İptal oranı, Teslim süresi medyan.  
- **Grafikler**: Zaman serisi; bölge bazlı tablolar; en çok satan ürünler listesi.

---

## 12) Güvenlik
- **Auth:** Supabase Auth; httpOnly cookie; oturum yenileme.  
- **RBAC guard**: route middleware + server tarafı sorgu filtresi (branch_id).  
- **Rate limit:** Ayarlar sayfasından konfigüre; varsayılan **IP başına 1000/10dk**.  
- **Log/PII:** Maskeleme; webhook imza doğrulama sonuçları loglanır.

---

## 13) Kabul Kriterleri (DOD — MVP)
- App shell kuralları (sabit/sticky/scroll) **doğru çalışıyor**.  
- `Products` | `Categories` | `Orders` | `Couriers` | `Delivery Zones` | `Pages` | `Slider/Content` | `Notifications` | `Analytics` | `Settings` modülleri **navigasyonda** var ve temel ekranlar açılıyor.  
- **Orders** listesi realtime güncelleniyor; toast tetikleniyor.  
- **Şube atama widget’ı** adres → bölgeye göre öneri veriyor; tek tıkla atama.  
- Varyantlı ürün formu (kg/kişi) ve stok seçenekleri (ürün/varyant) çalışıyor.  
- WhatsApp CTA ayarları storefront’a yansıyor.  
- CSV import/export (SheetJS) **Products** için çalışır.  
- A11y kontrolleri (klavye, aria, focus) temel akışlarda geçer.  
- Lighthouse (admin) ilk yük **< 1.5s (local)**; route change **< 300ms**.

---

## 14) Test & QA
- **Unit**: helper & service fonksiyonları (ör. bölge eşleşme).  
- **API**: orders list/filters; zone lookup; courier assign (Supertest).  
- **E2E**: ürün ekle → sipariş akışı (mock) → şube atama widget’ı → kurye atama modali.

---

## 15) Teknik Notlar
- **Adres → koordinat:** Geocoding sağlayıcı (örn. Nominatim/Google) ile bir kez çözümlenip veritabanında saklanır.  
- **Zone verisi:** GeoJSON (çokgen) + radius; PostGIS veya düz JSON + turf.js (server) ile nokta‑içinde‑çokgen / mesafe hesapları.  
- **Idempotency:** Kurye ve şube atama işlemlerinde **event_id**/`Idempotency-Key` kullan.

---

## 16) Yol Haritası Parçalama (MVP)
1) **App Shell** (dashboard‑01 tabanlı)  
2) **Products** (varyant formu + CSV import)  
3) **Orders** (realtime + status badges)  
4) **Delivery Zones** (şube, bölge ekle, öneri motoru)  
5) **Couriers** (manuel atama + webhook log)  
6) **Notifications** (şablonlar + WhatsApp CTA ayarı)  
7) **Analytics** (KPI + basit grafik)  
8) **Settings** (PayTR, Rate limit, Branches, Roles)

> Hazır olduğunda, bir sonraki dosya: **`design-brief.md`**.

