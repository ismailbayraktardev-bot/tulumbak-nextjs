# Tulumbak Frontend - Product Requirements Document (PRD)

## 1. Proje Tanımı
Tulumbak Frontend, e-ticaret müşterilerinin ve yönetim ekibinin sistemi kullanabilmesi için geliştirilen **Next.js tabanlı kullanıcı arayüzü** katmanıdır. İki ayrı uygulamadan oluşur:

- **Storefront (apps/store-frontend):** Müşterilerin ürünleri inceleyip satın aldığı arayüz.
- **Admin Dashboard (apps/admin-dashboard):** Ekip üyelerinin ürün, sipariş, kurye ve içerik yönetimini yaptığı panel.

Bu iki arayüz, backend API katmanı (services/api) ile REST üzerinden haberleşir.

---

## 2. Hedefler
- **Storefront:** Hızlı, mobil-öncelikli, SEO-dostu bir alışveriş deneyimi.
- **Admin Dashboard:** Tam yönetilebilir operasyon paneli (App Shell yapısı).
- **Gerçek zamanlı:** Sipariş durumları, kurye atamaları anında güncellensin.
- **Bütünleşik deneyim:** PayTR ödeme, WhatsApp/email bildirimleri, kurye entegrasyonu sorunsuz çalışsın.
- **Performans:** Lighthouse ≥ 90, LCP < 2.5s, CLS < 0.1.

---

## 3. Mimari Genel Bakış
```
apps/
├─ store-frontend/        # Müşteri sitesi (Next.js 15 App Router)
└─ admin-dashboard/       # Yönetim paneli (Next.js 15 App Router)

packages/
├─ ui/                    # Ortak bileşen kütüphanesi (shadcn/ui + Tailwind)
├─ config/                # Ortak config, env, eslint, tailwind
└─ shared/                # Tipler (DTO'lar), util fonksiyonlar, API client
```

**Teknolojiler:**
- Next.js 15 (App Router)
- TypeScript (strict mode)
- Tailwind CSS + Shadcn/UI
- React Hook Form + Zod
- Zustand / Server Actions
- Framer Motion (animasyonlar)
- Next Image (WebP optimizasyonu)

---

## 4. Storefront Özellikleri

### 4.1 Ana Sayfa
- Hero banner (dinamik yönetilebilir)
- Kategoriler grid
- Öne çıkan ürünler
- Kampanya/slider alanları

### 4.2 Ürün Sayfası (PLP - Product Listing Page)
- Filtreler: kategori, fiyat, gramaj, stok durumu
- Sıralama: yeni, fiyat artan/azalan, popüler
- Infinite scroll veya sayfalama

### 4.3 Ürün Detay Sayfası (PDP)
- Görseller (WebP format, zoom)
- Ürün açıklaması, varyant/gramaj seçimi
- Fiyat ve stok durumu
- Sepete ekle butonu + dinamik toast bildirimi

### 4.4 Sepet & Checkout
- Sepet özeti, ürün silme/güncelleme
- Teslimat adresi formu (şehir/ilçe/mahalle)
- Ödeme yöntemi seçimi (PayTR iframe)
- Sipariş özeti ve onay ekranı

### 4.5 Sipariş Takibi
- Giriş yapan kullanıcı için geçmiş siparişler
- Sipariş durum akışı: preparing → on_delivery → delivered
- Kurye bilgisi (isim, telefon, ETA)

### 4.6 Hesap & Kimlik
- Kayıt, giriş, parola sıfırlama
- Profil bilgileri
- Sipariş geçmişi

### 4.7 Bildirimler
- Sipariş sonrası e-posta ve WhatsApp bildirimleri
- Toast/Modal ile anlık bildirim gösterimi (ör: “Siparişiniz yolda!”)

---

## 5. Admin Dashboard Özellikleri

### 5.1 App Shell
- Sol sabit sidebar (navigasyon)
- Sticky üst bar (arama, kullanıcı menüsü)
- Scrollable içerik alanı
- Tutarlı padding (24–32px)
- Breadcrumbs + sayfa başlığı içerik alanında

### 5.2 Modüller
#### Ürünler
- Liste (server-side filtre/sort)
- Ekle/Düzenle formu (çoklu görsel upload)
- CSV import/export

#### Kategoriler
- CRUD + hiyerarşik liste

#### Siparişler
- Liste (durum filtreleri, gerçek zamanlı güncelleme)
- Sipariş detay ekranı (ürünler, adres, notlar)
- Durum değiştir (hazırlanıyor, yolda, teslim edildi)

#### Kurye Yönetimi
- Mevcut kuryeler ve konum
- Siparişe kurye ata (manuel veya otomatik)
- Webhook loglarını görüntüle

#### Bildirim Yönetimi
- E-posta & WhatsApp şablonları (değişken destekli)
- Test gönderimi (örnek sipariş ID ile)

#### Slider & İçerik
- Banner/slider CRUD (ana sayfa için)
- Görsel önizleme, sıralama

#### Analitik & Raporlar
- Sipariş sayısı, satış toplamı, teslimat süreleri
- Grafik bileşenleri (Recharts)

#### Ayarlar
- Ödeme, kurye, API anahtarları, roller

---

## 6. API Entegrasyonları
- Backend `/api/v1` uçları ile haberleşme (fetch veya axios wrapper)
- Kimlik: `Authorization: Bearer <accessToken>`
- Gerçek zamanlı: Supabase Realtime veya WebSocket (orders channel)
- Ödeme: PayTR iframe entegrasyonu
- Bildirim: Backend’den gelen event’ler (toasts)

---

## 7. UI/UX Standartları
- Renk paleti: açık ve koyu mod destekli, kontrast ≥ AA
- Yazı tipi: Inter, 16–18px base, 1.5 line-height
- Bileşenler: ui/ paketinden (Button, Input, Table, Tabs, Modal)
- İkonlar: Lucide Icons
- Görsel oranları: 3:2 ürünler, 16:9 banner
- Duyarlılık: 360px – 1440px arası optimize
- Animasyon: Framer Motion (yumuşak geçişler)

---

## 8. Performans & Güvenlik
- Next.js statik önbellekleme + ISR
- Route-level cache (kategori, ürün)
- lazy load (img, komponent)
- Giriş bilgileri httpOnly cookie
- CSRF koruması ödeme ve hesap sayfalarında

---

## 9. Test & QA
- Unit test: bileşen testleri (React Testing Library)
- E2E test: Playwright (ürün → sepete ekle → ödeme → sipariş oluştur)
- Görsel regresyon testi: Percy (isteğe bağlı)
- Lighthouse analizi (LCP, CLS, SEO)

---

## 10. MVP Kapsamı
- Store: ürün liste/detay, sepete ekle, checkout, sipariş takibi
- Admin: ürün/kategori/sipariş yönetimi, kurye atama, slider, temel bildirim
- PayTR iframe ödeme akışı
- WhatsApp/email bildirim tetikleme
- Realtime sipariş güncelleme (admin & müşteri)

---

## 11. Faz 2 (Opsiyonel Geliştirmeler)
- Müşteri puan sistemi / sadakat modülü
- Çoklu dil (i18n)
- Fırsatlar / kampanyalar modülü
- PWA desteği (Add to Home Screen)
- Raporlama & analitik geliştirmeleri (grafik ve CSV export)

---

## 12. Başarı Kriterleri
- LCP < 2.5s, CLS < 0.1, Lighthouse ≥ 90
- Checkout başarı oranı ≥ %95
- Realtime sipariş güncelleme gecikmesi < 1s
- Admin tablo render süresi < 300ms
- 404 ve hata sayfaları tasarıma uygun (soft redirect)

---

## 13. Sprint History

### 13.1. FE-02 Sprint Outcome (October 2025)

**Sprint Goal:** Live API integration, admin data tables, and checkout foundation.

**Summary of Work**

✅ TypeScript & DX fixes (Phase 0)

✅ Storefront polish + responsive (Track-S)

✅ Live API integration for PLP & PDP

✅ Admin dashboard TanStack Table integration (Track-A)

✅ RHF + Zod form provider (Track-C foundation)

**Key Deliverables**

| Area | Deliverable |
|------|-------------|
| Storefront | Next Image migration, responsive grids, hover/transition polish, live PLP/PDP data |
| Admin Dashboard | Products & Categories tables with pagination, sort, filters, row selection |
| Checkout | RHF + Zod setup, Turkish validation messages |
| DX | Clean TypeScript build, zero lint errors |

**Kabul Kriterleri**

- [x] Storefront renders with live API (/products, /categories)
- [x] Admin tables functional with TanStack integration
- [x] Checkout forms validated with RHF + Zod
- [x] TypeScript build succeeds, no lint errors

**Next Step → FE-03**

- Cart + Checkout full integration (PayTR)
- Admin CRUD drawer mutations
- Performance polish (LCP, bundle size)

---

Bu PRD, Tulumbak projesinin frontend tarafında kullanıcı deneyimi, performans ve entegrasyon hedeflerini tanımlar. Geliştirmeler, backend PRD'deki API sözleşmeleriyle tam uyumlu olacak şekilde yürütülmelidir.