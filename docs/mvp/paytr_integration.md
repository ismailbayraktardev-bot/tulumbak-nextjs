# PayTR Integration — Tulumbak (Frontend + Backend)

> Amaç: **MVP**’de PayTR ile ödeme akışını uçtan uca tanımlamak. Bu doküman; akış diyagramı, API uçları, imza/güvenlik, frontend gömme (iframe/redirect), webhook işleme, hata durumları, test senaryoları ve kabul kriterlerini içerir. (Not: Alan adları/parametreler için **PayTR resmi dökümanıyla** birebir eşitleme yapılmalıdır; bu belge mimari ve kontrat seviyesinde rehberdir.)

---

## 1) Özet Akış

```
Cart → Checkout → Create Order(pending) → /payments/paytr/init → { iframe_token, ref }
   ↳ Storefront: ödeme sayfasında PayTR iFrame yüklenir
   ↳ Kullanıcı: kart bilgilerini PayTR sayfasında girer
   ↳ PayTR: ödeme sonucu → Tulumbak webhook /webhooks/paytr (paid|failed)
   ↳ Backend: Order.status = paid|failed, payment.status = paid|failed
   ↳ Storefront: polling/SSE ile sonuç → success/failed sayfaları
```

**Varsayılan:** iFrame. **Alternatif:** redirect (mobil eski tarayıcılar için) — aynı init uçtan dönen `redirect_url` kullanılır.

---

## 2) Ortam Değişkenleri (.env)
```
# Backend
PAYTR_MERCHANT_ID=***
PAYTR_MERCHANT_KEY=***
PAYTR_MERCHANT_SALT=***
PAYTR_SANDBOX=true|false
PAYTR_IFRAME_HOST=https://iframe.paytr.com  # (dokümana göre doğrulanacak)
PAYMENT_RETURN_URL=https://tulumbak.com/odeme/sonuc

# Frontend
NEXT_PUBLIC_PAYTR_IFRAME_HOST=https://iframe.paytr.com
```

> **CSP**: `frame-src 'self' https://*.paytr.com; connect-src https://api.tulumbak.com …` (PayTR dokümanındaki tam alan adına göre güncelle).

---

## 3) Backend Uçları (API)

### 3.1 Init — `POST /api/v1/payments/paytr/init`
**Girdi**
```json
{
  "order_id": "ord_100234",
  "return_url": "https://tulumbak.com/odeme/sonuc"  // ops.; .env default
}
```
**İşleyiş**
1. `order_id` doğrulanır: `status = pending`, `amount.grand_total > 0`.
2. PayTR token isteği için gerekli alanlar hazırlanır (müşteri e‑posta/telefon, tutar, taksit kısıtları vb.).
3. **İmza** oluşturulur (merchant key + salt + payload) → HMAC (dokümana göre algoritma).
4. PayTR init API çağrılır → `token` ve/veya `redirect_url` alınır.
5. DB `payment` kaydı güncellenir: `status=initiated`, `ref=<paytr_ref>`, `payload=req/resp`.

**Yanıt**
```json
{
  "success": true,
  "iframe_token": "…",   // iFrame gömmek için
  "redirect_url": "…",    // alternatif akış için
  "ref": "paytr_…"
}
```
**Hata**: `400 VALIDATION_ERROR | 409 CONFLICT | 500 PROVIDER_ERROR`

### 3.2 Status — `GET /api/v1/payments/status?order_id=…`
- Storefront polling/SSE için özet döner: `{ status: 'initiated|paid|failed', order_status: 'pending|…' }`

### 3.3 Webhook — `POST /api/v1/webhooks/paytr`
- **İmza doğrulama** (HMAC — `X-Signature` veya PayTR’nin belirttiği başlık/alan)
- **Idempotency**: PayTR callback `merchant_oid`/`order_id` + `status` kombinasyonu **tekil** işlenir.
- **İşleyiş**
  - `paid` → `payment.status=paid`, `order.status=confirmed` (veya `preparing`), **order_status_history** kaydı.
  - `failed` → `payment.status=failed`, `order.status=pending` kalabilir, Checkout’ta “başarısız” ekranı.
- **Yanıt**: 200 JSON `{ success: true }` (PayTR tarafının retry politikasıyla uyumlu)

---

## 4) Güvenlik & İmza
- **Sunucu tarafı** (backend) sırlar: `MERCHANT_KEY`, `MERCHANT_SALT` **asla FE’ye sızmaz**.
- İmza algoritması ve alan birleştirme sıralaması **PayTR dökümanıyla** doğrulanır. (Genelde: `HMAC-SHA256`/`base64` → `merchant_id + user_ip + amount + salt` benzeri bir preimage; **tam sırayı** dokümandan alın.)
- **Timing‑safe** karşılaştırma (Node `crypto.timingSafeEqual`).
- **Idempotency**: init isteklerinde `Idempotency-Key` kabul edilir; aynı key tekrarı `409 CONFLICT`.

---

## 5) Frontend (Storefront) — Ödeme Sayfası
**Route:** `app/odeme/page.tsx` (checkout’ta order yaratıldıktan sonra buraya yönlenir)

### 5.1 UI Durumları
- **loading**: init çağrısı → spinner + sipariş özeti (tutar, teslimat slotu).
- **iframe-ready**: iFrame container göster, 100vh’e yakın dikey alan, sticky özet kart.
- **success/failed**: callback/polling sonucu → yönlendirme.

### 5.2 iFrame Gömme
```tsx
// components/payments/PayTRIframe.tsx
export function PayTRIframe({ token }: { token: string }){
  const src = `${process.env.NEXT_PUBLIC_PAYTR_IFRAME_HOST}?token=${encodeURIComponent(token)}`;
  return (
    <iframe src={src} title="PayTR" className="h-[70vh] w-full rounded-2xl border" allow="payment *" />
  );
}
```
> **Not:** Host ve query param adı PayTR dokümanıyla doğrulanır. Gerekirse script embed yöntemi kullanılır.

### 5.3 Init Çağrısı & Polling
```tsx
// app/odeme/page.tsx (özet)
const res = await fetch(`/api/v1/payments/paytr/init`, { method: 'POST', body: JSON.stringify({ order_id }) });
const { iframe_token, redirect_url } = await res.json();
// iFrame’i göster → aynı anda /payments/status?order_id=… endpoint’ini 2sn aralıklarla yokla
```

### 5.4 Hata Durumları (FE)
- Init 4xx → kart container yerine **hata kartı**: “Ödeme başlatılamadı, lütfen tekrar deneyin.”
- Init 5xx → “Geçici bir sorun oluştu.” Yeniden dene CTA (idempotency key değiştirerek).
- iFrame yüklenemiyor → **redirect** fallback butonu: “Ödemeyi Güvenli Sayfada Tamamla”.

---

## 6) Admin Ayarları
- `Settings → Payments (PayTR)`
  - **Merchant ID/Key/Salt** alanları
  - **Sandbox** toggle
  - **Taksit seçenekleri** (opsiyonel whitelist)
  - **Max tek çekim** (ops.)
- Kaydet → backend secret store (Vercel Env veya KMS).

---

## 7) Hata Kodları & Mesajlar
- `PAYMENT_INIT_FAILED` — provider hata döndürdü.
- `PAYMENT_SIGNATURE_INVALID` — webhook imzası hatalı.
- `PAYMENT_DUPLICATE_CALLBACK` — aynı sonuç ikinci kez geldi (idempotent ok).
- `ORDER_NOT_ELIGIBLE` — order pending değil, tutar 0 vb.

UI’da kullanıcıya **insani** metin, log’da teknik hata kodu.

---

## 8) Test Senaryoları (QA)
1. **Başarılı ödeme**: iFrame → webhook `paid` → order `confirmed` → success sayfası.  
2. **Başarısız ödeme**: iFrame → webhook `failed` → checkout “başarısız” state.  
3. **Webhook imzası geçersiz**: 401/403, event işlenmez.  
4. **Idempotent callback**: aynı `merchant_oid` ikinci kez geldiğinde 200+dudak, state değişmez.  
5. **Redirect fallback**: iFrame yüklenmezse redirect ile ödeme tamamlanır.  
6. **Sandbox**: test kartıyla akış baştan sona.

---

## 9) Kabul Kriterleri (MVP)
- `/payments/paytr/init` iFrame token veya redirect URL döner; `payment.status=initiated`.
- `/webhooks/paytr` imza doğrular; `paid|failed` sonuçları doğru işler; idempotent.
- Storefront ödeme sayfası **iFrame** ile sorunsuz; fallback redirect butonu var.
- Başarılı sonuçta **Order Success** sayfasına yönlendirilir; `integration-notifications.md`’deki `order_created` e‑postası zaten gitmiştir, ödeme sonrası `order_on_delivery` süreci normal işler.
- CSP ve frame izinleri doğru yapılandırılmıştır.

---

## 10) Uygulama İskeleti (Backend örnekleri)

### 10.1 İmza Yardımcısı (Node)
```ts
import crypto from 'node:crypto';
export function hmac(data: string, key: string){
  return crypto.createHmac('sha256', key).update(data, 'utf8').digest('base64');
}
export function timingSafeEq(a: string, b: string){
  const ba = Buffer.from(a); const bb = Buffer.from(b);
  return ba.length===bb.length && crypto.timingSafeEqual(ba, bb);
}
```

### 10.2 Webhook Route (Next.js)
```ts
// app/api/webhooks/paytr/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEq } from '@/lib/crypto';
export async function POST(req: NextRequest){
  const raw = await req.text();
  const sig = req.headers.get('x-paytr-signature') || '';
  const expected = '…hmac of raw…'; // PayTR dokümanına göre hesapla
  if(!timingSafeEq(sig, expected)){
    return NextResponse.json({ success:false, error:'PAYMENT_SIGNATURE_INVALID' }, { status:401 });
  }
  const evt = JSON.parse(raw);
  // idempotency: if processed → return 200
  // map status → order/payment update
  return NextResponse.json({ success:true });
}
```

### 10.3 Init Route (Backend → PayTR)
```ts
// app/api/payments/paytr/init/route.ts
import { NextRequest, NextResponse } from 'next/server';
export async function POST(req: NextRequest){
  const { order_id } = await req.json();
  // load order, validate
  // build payload to PayTR, sign, call provider
  // save payment ref/status
  return NextResponse.json({ success:true, iframe_token:'…', redirect_url:'…', ref:'…' });
}
```

> **Not:** Gerçek alan adları, parametre adları ve imza formülü PayTR resmi dokümanıyla 1:1 eşleştirildikten sonra bu iskelette doldurulacaktır.

