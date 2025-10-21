# Checkout UX — PRD (Tulumbak)

> **Amaç:** Kullanıcıyı en az adım ve en az sürtünmeyle siparişe ulaştıran, **PayTR** ile entegre, **şube/zon** uyumlu ve **TR** mikrocopy’li bir Checkout deneyimi. Bu PRD; akış, ekranlar, alanlar/validasyonlar, API entegrasyonları, hata durumları, A11y/performans ve kabul kriterlerini tanımlar.

---

## 1) Kapsam
- **Dahil:**
  - Çok adımlı Checkout (İletişim → Adres → Zaman Dilimi → Fatura → Özet & Ödeme).
  - Kupon/Hediye Kartı alanı (MVP: tek kod, kombinasyon yok).
  - PayTR iFrame/redirect akışı (bkz. *paytr-integration.md*).
  - Şube/zon kontrolü ve önerilen şube.
  - TR vergi/fatura senaryoları (Bireysel/Kurumsal).
  - KVKK & Şartlar onayı.
- **Hariç (v2):**
  - Kapıda ödeme.
  - Adres defteri, kayıtlı kart.
  - Canlı kurye konumu.

---

## 2) Kullanıcı Akışı (Yüksek seviye)
```
Sepet → Checkout Step 1 (İletişim)
      → Step 2 (Adres + Zon kontrol)
      → Step 3 (Teslim Zaman Dilimi)
      → Step 4 (Fatura: Bireysel/Kurumsal)
      → Step 5 (Özet + Kupon + KVKK)
      → Sipariş Oluştur (pending)
      → Ödeme (PayTR iFrame)
      → Başarılı → Order Success / Başarısız → Checkout'a geri
```

- **Geri dönüş**: Her adımda geri butonu; form state saklanır.
- **Hesaplı kullanıcı**: Oturum varsa ilgili alanlar otomatik doldurulur.

---

## 3) Ekranlar & Bileşenler
### 3.1 Step 1 — İletişim
Alanlar:
- **Ad Soyad** (zorunlu)
- **E‑posta** (zorunlu; e‑posta onay e‑postaları için)
- **Telefon** (zorunlu; E.164 `+90…`)

UI:
- Tek sütun form; alt sticky çubukta *Devam Et*.
- Sağda (lg+): Sipariş Özeti kartı (ara toplam, vergi/KDV dâhil notu, tahmini teslim aralığı adımı gelince görünür).

### 3.2 Step 2 — Adres
Alanlar:
- **Adres metni** (zorunlu, min 12 karakter)
- **İl / İlçe** (dropdown)
- **Konum pin’i** (opsiyonel; lat/lng) — mobilde *Konumumu Kullan* (izin verilen).

İş mantığı:
- Adres girildiğinde **/admin/zones/lookup** eşleniği olan **public lookup** servisine istek atılır (bkz. API). Sonuçta `branch_id` önerisi ve `zone_match` döner.
- `zone_match=false` ise checkout ilerlemez; kullanıcıya destek mesajı + WhatsApp CTA.

### 3.3 Step 3 — Zaman Dilimi (Slot)
- Varsayılan slot: **14:00–16:00**; plan sayfasına göre admin değiştirir.
- Slot listesi API’den gelir (o gün için uygun aralıklar). Seçim zorunlu.

### 3.4 Step 4 — Fatura Bilgisi
Toggle: **Bireysel** / **Kurumsal**
- **Bireysel**: TCKN (11 haneli, opsiyonel), Ad Soyad, e‑posta; adres eşitlenebilir.
- **Kurumsal**: **VKN** (10 haneli, zorunlu), **Unvan** (zorunlu). E‑fatura/earsiv notu bilgi amaçlı.

### 3.5 Step 5 — Özet & Ödeme
- Sipariş kalemleri, ara toplam, indirim, kargo (0), vergi (KDV dâhil), genel toplam.
- **Kupon kodu** alanı + *Uygula*.
- KVKK & Şartlar onay checkbox’ları (zorunlu).
- **“Siparişi Oluştur ve Ödemeye Geç”** (primary) → `/checkouts/create-order` (pending).
- Başarılıysa **Ödeme Sayfası**na yönlendir.

---

## 4) Alanlar & Validasyonlar
**İletişim**
- `name` → 2–80 karakter.
- `email` → RFC5322 formatı.
- `phone` → `^\+90\d{10}$` (örn. `+905321234567`).

**Adres**
- `text` → min 12, max 280 karakter.
- `city` → zorunlu; `district` → zorunlu.
- `lat/lng` → opsiyonel; varsa sayı aralığı kontrol.

**Slot**
- `from < to`, ISO‑8601 TR saati; mağaza çalışma saatleri içinde.

**Fatura**
- `billing.type` → `individual|corporate`.
- `tckn` (opsiy.) → `^\d{11}$`.
- `vkn` (zorunlu kurumsal) → `^\d{10}$`.
- `company` (kurumsal) → 2–120 karakter.

**Kupon**
- `code` → büyük/küçük duyarsız; boşluk kırpılır. Geçersiz → kullanıcıya anlaşılır mesaj.

Hata mesajları (örnek):
- “Lütfen geçerli bir telefon numarası girin. Örn: +905xx…”
- “Adres Menemen/Ulukent bölgeleri dışında görünüyor. Yine de devam etmek için bizimle iletişime geçin.”

---

## 5) API Entegrasyonları
### 5.1 Ürün & Sepet
- **GET** `/products`, `/carts/{id}` (özet sağ kart)
- **POST** `/carts/{id}/apply-coupon` → { code }

### 5.2 Zon Lookup (public)
- **POST** `/zones/lookup` → `{ lat, lng | addressText }` ⇒ `{ zone_match: boolean, branch_id, nearest_km? }`
  - *Not:* Admin uçunun public muadili; rate limit’li.

### 5.3 Sipariş Oluşturma
- **POST** `/checkouts/create-order`
  - Gövde: Checkout form snapshot (bkz. *api-specifications.md §3.6*).
  - Yanıt: `Order` (status=`pending`, `payment.status=initiated`).

### 5.4 Ödeme Başlatma
- **POST** `/payments/paytr/init` → `{ order_id }` ⇒ `{ iframe_token | redirect_url }` (bkz. *paytr-integration.md*).

### 5.5 Bildirim
- `order_created` e‑postası tetiklenir (bkz. *integration-notifications.md*).

---

## 6) Hata Durumları & Edge Cases
- **Zon dışında**: `zone_match=false` → ilerleme kilidi + *“Bölgenizde henüz hizmet veremiyoruz.”* + WhatsApp CTA.
- **Slot tükenmiş**: Seçilen slot kapasite dışı → slot listesi yeniden yüklenir; kullanıcıya info toast.
- **Kupon geçersiz**: “Kupon bulunamadı veya süresi dolmuş.”
- **Payment init failed**: Ödeme sayfası yerine hata kartı + “Tekrar Dene” + WhatsApp CTA.
- **Webhook gecikti**: Polling 60s sonunda sonuç yoksa “Ödeme sonucunu bekliyoruz. İşleminiz tamamlanmadıysa destekle iletişime geçin.”

---

## 7) A11y & Mikrocopy
- Form etiketleri (`<label for>`), hata metni `aria‑errormessage` ile ilişik.
- Odak tuşu sırası mantıklı; Enter ile bir sonraki adıma geçilebilir.
- **Mikrocopy** örnekleri:
  - Step başlıkları: “İletişim Bilgileri”, “Teslimat Adresi”, “Teslim Zamanı”, “Fatura Bilgisi”, “Sipariş Özeti”.
  - CTA: “Devam Et”, “Geri”, “Uygula”, “Siparişi Oluştur ve Ödemeye Geç”.
  - Yardım ipuçları: Telefon format örneği, KDV dâhil açıklaması.

---

## 8) Performans
- Her adım ayrı route segmenti (`/odeme?step=2` ya da nested routes) → **kısmi render**.
- `next/image` ürün küçük resimleri; minimal JS.
- Form yaprak bileşenleri `dynamic()` (modaller, kupon).

---

## 9) Güvenlik & Uyumluluk
- **CSRF**: Checkout POST’larında token.
- **RLS**: Müşteri yalnız kendi sepeti/siparişini görür.
- **Rate limit**: `POST /zones/lookup` ve ödeme init çağrıları (IP başına 1000/10dk genel limit dâhil).
- **KVKK**: Yalnız gerekli PII toplanır; sipariş e‑postasında adresin yalnız ilk satırı.

---

## 10) Analytics & Ölçüm (GA4)
Eventler:
- `begin_checkout` (step=1)
- `add_payment_info` (provider=paytr)
- `add_shipping_info` (slot)
- `apply_promo` (code)
- `purchase` (order_id, value)
- `filter_change` (PLP’den gelen)

---

## 11) Kabul Kriterleri (MVP)
1. 5 adımlı checkout akışı, *mobilde tek baş* (<= 360px) sorunsuz işler.
2. Zon kontrolü çalışır; zon dışı engeli doğru mesajla gösterilir.
3. Slot seçimi zorunlu; seçilen slot siparişe kaydolur.
4. Bireysel/Kurumsal fatura alanları validasyonlarıyla birlikte çalışır (TCKN/VKN).
5. Kupon uygulama/iptal akışı çalışır.
6. “Siparişi Oluştur ve Ödemeye Geç” → order `pending`, ödeme iFrame/redirect başlatılır.
7. Başarılı ödeme → Order Success; başarısız → Checkout’a dönüş ve bilgilendirme.
8. Erişilebilirlik ve performans kuralları sağlanır (Lighthouse iyi).

---

## 12) UI Durumları (States)
- **loading / empty / error / ready** şablonu.
- Sticky özet kartı (lg+), mobilde altta *sipariş toplamı* çubuğu.

---

## 13) DTO Örneği — `create-order` payload
```json
{
  "cart_id": "cr_abc123",
  "customer": { "name": "Ali Veli", "email": "ali@example.com", "phone": "+905551112233" },
  "billing": { "type": "corporate", "vkn": "1234567890", "company": "Tulumbak AŞ" },
  "shipping_address": { "text": "Cengiz Topel Cd. No:…", "city": "İzmir", "district": "Menemen", "lat": 38.61, "lng": 27.07 },
  "slot": { "from": "2025-10-21T14:00:00+03:00", "to": "2025-10-21T16:00:00+03:00" }
}
```

---

## 14) QA Senaryoları
1. **Mutlu Yol**: Sepet → Checkout → tüm adımlar → PayTR → Success.
2. **Zon Dışı**: Ulukent/ Menemen dışı adres → bloke + WhatsApp CTA.
3. **Kurumsal Fatura**: VKN 10 haneli değilse hata.
4. **Kupon**: Geçerli/Geçersiz/İptal akışları.
5. **Ödeme Başarısız**: iFrame → failed → geri dönüş.
6. **Mobil (iOS Safari)**: Klavye/odak ve sticky bar davranışları.

---

## 15) Açık Sorular & V2
- Slot kapasite yönetimi (branch bazlı quota) — v2.
- Adres defteri ve kaydetme — v2.
- E‑fatura entegrasyonu — planlı.

> Bu PRD, *api-specifications.md*, *database-schema.md*, *paytr-integration.md* ve *storefront-sections.md* ile uyumludur. Geliştirme sırasında herhangi bir çelişki bulunursa **ADR** açılm