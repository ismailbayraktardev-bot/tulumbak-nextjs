# QA Test Plan — Tulumbak (MVP)

> Amaç: 3 günlük MVP yayını öncesi **storefront**, **checkout/ödeme (PayTR)**, **admin dashboard**, **bildirimler** ve **kurye entegrasyonu** için yürütülecek testlerin kapsamı, senaryoları, verileri ve kabul kriterlerini tanımlamak. Bu plan; manuel E2E, API testleri (Supertest), Playwright E2E ve temel performans/A11y kontrollerini içerir.

İlgili belgeler: `frontend-architecture.md`, `storefront-sections.md`, `checkout-ux-prd.md`, `api-specifications.md`, `database-schema.md`, `paytr-integration.md`, `integration-notifications.md`, `admin-components.md`.

---

## 1) Kapsam & Ortamlar
- **Ortamlar:**
  - `dev` (geliştirme), `staging` (UAT), `prod` (yayın)
- **Tarayıcılar:** Chrome (son), Safari iOS (son), Firefox (son)
- **Cihazlar:** iPhone 13/14 (375×812), Android Pixel 7, Desktop 1440×900
- **Dil/para:** TR / TL (formatlar `1.234,56 TL`)
- **Zaman dilimi:** Europe/Istanbul

---

## 2) Roller & Test Verisi
- **Roller:** misafir kullanıcı, kayıtlı müşteri, `admin`, `branch_admin` (3 şube), `courier` (opsiyonel)
- **Seed verisi:**
  - Kategoriler: Tulumbalar, Sütlü Tatlılar, Şerbetli Tatlılar
  - Ürünler: Kullanıcı listesine göre (bkz. `data-seed.md` hazırlanır)
  - Kupon: `TATLI10` (10% indirim, min 100 TL)
  - Şubeler: Menemen Lise Yolu, Menemen Cengiz Topel Cd., Ulukent
  - Bölgeler: her şube için polygon/radius (MVP JSON)
  - Slotlar (bugün): 14:00–16:00, 16:00–18:00

---

## 3) Test Türleri
- **E2E (Playwright)** — müşteri akışları, admin ana akışları
- **API (Supertest)** — ürün/PLP, sepet, checkout, ödeme init, webhook
- **Unit** — yardımcılar (TL format, zon lookup hesapları)
- **A11y** — temel kontroller (tab erişimi, aria)
- **Performans** — Lighthouse hızlı tarama (LCP/CLS), network waterfall

---

## 4) Başlangıç Kontrol Listesi
- [ ] `.env` değerleri (PayTR sandbox, Resend API) tanımlı
- [ ] DB migrasyonları uygulandı, seed tamam
- [ ] Vercel Preview URL hazır (staging)
- [ ] CSP’de `frame-src` PayTR domaini eklendi
- [ ] E-posta gönderen alan adı doğrulandı (Resend)

---

## 5) E2E Senaryolar (Storefront)

### E2E‑S1 — Mutlu Yol: Misafir → Checkout → PayTR → Success
**Adımlar**
1. Home’a git; menüden `Tulumbalar` → PLP.
2. PLP filtre: Gramaj `1 kg`, Fiyat `100–400`.
3. Ürüne git (PDP); varyant seç (`1 kg`), `Sepete Ekle`.
4. Sepet → `Checkout`.
5. Step1: İletişim bilgileri (adı/eposta/telefon) → Devam.
6. Step2: Adres (Menemen içi) → zon lookup `zone_match=true` → Devam.
7. Step3: Slot `14:00–16:00` → Devam.
8. Step4: Fatura `Bireysel` → Devam.
9. Step5: Kupon `TATLI10` → Uygula; KVKK/Şartlar onay; `Siparişi Oluştur`.
10. Ödeme sayfasında PayTR iFrame görünür; sandbox kartla ödeme → başarılı.
11. Order Success sayfasına yönlen.

**Beklenen**
- TL formatları doğru, toplam indirim yansıdı.
- `order.status=confirmed` (webhook sonrası), `payment.status=paid`.
- `order_created` ve (teslimatta) `order_on_delivery` e‑postaları (staging’de gerçek posta kutusuna gelmeli).

---

### E2E‑S2 — Zon Dışı Adres Blokesi
1. Checkout Step2’de adresi Menemen/Ulukent dışına gir.
2. Zon lookup `zone_match=false` döner.
**Beklenen**: Devam butonu pasif; kullanıcıya mesaj + WhatsApp CTA linki.

---

### E2E‑S3 — Kurumsal Fatura (VKN kontrolü)
1. Checkout Step4’te `Kurumsal` seç.
2. VKN `123456789` (9 haneli) gir → hata.
3. `1234567890` gir → kabul.
**Beklenen**: Hata metinleri TR ve sahaya bağlı (`aria-errormessage`).

---

### E2E‑S4 — PayTR Başarısız Ödeme
1. E2E‑S1 adımlarını uygula; ödeme ekranında sandbox ile **başarısız** kart sonucu üret.
2. Webhook `failed` gelir.
**Beklenen**: Checkout’a geri yönlendirme + bilgi mesajı; sipariş `pending` kalabilir, `payment.status=failed`.

---

### E2E‑S5 — Kupon Geçersiz / Süresi Dolmuş
1. Step5’te `KAPANMIS50` gir → mesaj: *“Kupon bulunamadı veya süresi dolmuş.”*
2. `TATLI10` gir → indirim uygula.

---

### E2E‑S6 — Mobil Safari A11y
- Klavye açılıp kapanınca CTAlar (alt sticky bar) üstüne binmiyor.
- Form alanları doğru odağı alıyor, `Enter` ile adım geçilebilir.

---

## 6) E2E Senaryolar (Admin)

### E2E‑A1 — Orders Realtime + Toast
1. Admin → Orders sayfasını aç.
2. Ayrı bir pencerede S1’i çalıştır (yeni sipariş).
**Beklenen**: Yeni sipariş satırı 1–2 sn içinde görünür (realtime); kısa toast: `#<id> alındı`.

### E2E‑A2 — BranchSuggest Widget
1. Orders listesinde yeni sipariş için `Önerilen Şube` rozetini gör.
2. `Ata` butonuna bas → şube atandı.
**Beklenen**: Sipariş detayında `branch_id` güncellendi; tarihçe kaydı oluştu.

### E2E‑A3 — Assign Courier Dialog
1. Sipariş detayında `Kurye Ata` → listeden bir kurye seç.
2. `order.status → on_delivery`.
**Beklenen**: Kullanıcıya `order_on_delivery` e‑postası gider.

### E2E‑A4 — Notification Templates Test Gönder
1. Admin → Notifications → bir şablon seç → `Test Gönder`.
**Beklenen**: `notification_message.status=sent` kayıt; e‑posta ulaştı.

---

## 7) API Testleri (Supertest)
- `GET /products` — filtre/sayfalama/price range çalışıyor.
- `GET /products/{slug}` — varyant ve stok alanları dolu.
- `POST /zones/lookup` — Menemen içi/dışı senaryolar, rate limit.
- `POST /checkouts/create-order` — zorunlu alan kontrolleri (email/telefon/adres/slot).
- `POST /payments/paytr/init` — uygun `iframe_token/redirect_url` sahası; `initiated` durum.
- `POST /webhooks/paytr` — imza doğrulama; `paid`/`failed` durum güncellemeleri; idempotency.

---

## 8) Performans & A11y
- **Lighthouse (storefront Home/PLP/PDP)**
  - LCP < 2.5s (staging, 4x CPU/Slow 4G)
  - CLS < 0.1
- **A11y**
  - Kontrast AA
  - Tab navigation, `aria-sort` (tablo), `role="radiogroup"` (VariantSelector)

---

## 9) Hata Durumları & Mesajlar Doğrulama
- Payment init 4xx/5xx: kullanıcı dostu mesajlar + tekrar dene.
- Slot tükenmiş: Step3’te bilgilendirme ve slotların tazelenmesi.
- 404/500 sayfaları (store & admin) özel şablon.

---

## 10) Playwright — Örnek Test İskeleti
```ts
import { test, expect } from '@playwright/test';

test('E2E-S1: guest → checkout → paytr success', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Ürünler' }).click();
  await page.getByText('1 kg').click();
  await page.getByRole('link', { name: 'Seçenekleri görüntüle' }).first().click();
  await page.getByRole('button', { name: 'Sepete Ekle' }).click();
  await page.goto('/sepet');
  await page.getByRole('button', { name: 'Checkout' }).click();
  // … adımlar …
  await expect(page).toHaveURL(/.*siparis\/basarili/);
});
```

---

## 11) Raporlama & Önceliklendirme
- **Öncelik P0**: Ödeme tamamlanamıyor, zon kontrolü yanlış, checkout form blokesi, prod 500.
- **P1**: UI kırılması (mobil), toplamların yanlış görünmesi, e‑posta gitmemesi.
- **P2**: Mikrocopy/dilbilgisi, görsel orantılar.
- **Rapor**: her bug için ekran görüntüsü, adımlar, beklenen/gerçek sonuç, ortam bilgisi.

---

## 12) Kabul Kriterleri (MVP)
- S1–S6 ve A1–A4 senaryoları **yeşil**.
- API testleri en az %50 kapsama ile yeşil.
- Lighthouse hedefleri sağlanır; A11y temel kontrolleri geçer.
- E‑postalar staging’de gerçek alıcıya ulaşır (Resend).

---

## 13) V2 / Gelecek Testleri (Şimdilik Hariç)
- Canlı kurye konum takibi ve durum güncellemeleri.
- Bölge çizim/editör UI (polygon editor) ve PostGIS doğrulama testleri.
- Admin CSV import otomasyonu ve büyük veri (10k ürün) sanallaştırma testleri.

