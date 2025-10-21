# Tulumbak Backend - Product Requirements Document (PRD)

## 1. Proje Tanımı
Tulumbak Backend, Next.js tabanlı e-ticaret sisteminin tüm iş mantığı, veri yönetimi ve entegrasyonlarını yöneten sunucu tarafıdır. Amaç, kendi kurye sistemiyle entegre çalışabilen, güvenli, performanslı ve yönetilebilir bir e-ticaret altyapısı kurmaktır.

Backend; API katmanı, veritabanı şeması, kurye ve ödeme entegrasyonları, bildirim servisleri ve yönetim paneli için veri servislerini kapsar.

---

## 2. Hedefler
- **Full API coverage:** Ürün, kategori, sipariş, kullanıcı, kurye, ödeme, bildirim modüllerini kapsayan REST API.
- **Kurye entegrasyonu:** Çift yönlü haberleşme (API çağrısı + imzalı webhook’lar).
- **Yönetilebilirlik:** Admin panelinden tüm verilerin kontrol edilebilmesi.
- **Gerçek zamanlı veri:** Sipariş durumu ve kurye takibi.
- **Performans ve güvenlik:** İmzalı webhooks, idempotency, JWT, rate limiting.

---

## 3. Mimari Genel Bakış
```
services/api/
├─ src/
│  ├─ modules/
│  │  ├─ auth/
│  │  ├─ products/
│  │  ├─ categories/
│  │  ├─ orders/
│  │  ├─ courier/
│  │  ├─ payments/
│  │  └─ notifications/
│  ├─ middleware/
│  ├─ utils/
│  ├─ config/
│  └─ index.ts
└─ tests/
```

**Teknolojiler:**
- Node.js 20 + TypeScript
- Express.js (API)
- PostgreSQL + Prisma ORM
- Redis (queue & idempotency)
- BullMQ (bildirim kuyruğu)
- Zod (validasyon)
- Supabase Realtime (isteğe bağlı canlı veri)
- PayTR, NetGSM, Resend, Twilio (entegrasyonlar)

---

## 4. Modüller

### 4.1 Auth
- JWT tabanlı oturum (Access + Refresh token)
- Roller: `customer`, `admin`, `super_admin`
- Giriş, kayıt, şifre sıfırlama endpointleri

### 4.2 Products
- CRUD: listeleme, filtreleme, varyant yönetimi
- SEO alanları (slug, meta_title, meta_description)
- Görsel yönetimi (upload, WebP optimize, alt text)
- CSV import/export (SKU bazlı idempotent işlem)

### 4.3 Categories
- CRUD (isim, açıklama, görsel, sıralama)
- Hiyerarşik yapı (parent_id desteği)

### 4.4 Orders
- Durum akışı: `pending → confirmed → preparing → ready → on_delivery → delivered (+ cancelled)`
- Sipariş oluşturma (checkout API)
- Durum geçmişi tablosu (`order_status_history`)
- Teslimat adresi, ödeme yöntemi, sipariş notu

### 4.5 Courier Integration
#### Outgoing (bizden kurye sistemine)
- `POST /api/courier/orders/create`
- `POST /api/courier/orders/:id/assign`
- `GET /api/courier/couriers/available`

#### Incoming (kurye sisteminden bize)
- Webhook Event’leri: `order-assigned`, `order-picked`, `order-delivered`, `order-failed`
- HMAC-SHA256 imzalı, `X-Webhook-Signature` header’ı ile doğrulama
- Idempotent event işleme (`event_id` unique constraint)

### 4.6 Payments (PayTR)
- Token oluşturma (iframe akışı)
- Callback endpoint (sipariş durumu güncelleme)
- Idempotency-Key desteği
- Fraud guard (tekrar callback’te durum eşleşmezse uyarı logu)

### 4.7 Notifications
- Kanallar: Email, WhatsApp, SMS
- Template sistemi (değişken destekli)
- Kuyruk tabanlı gönderim (BullMQ + Redis)
- Admin panelinden test gönderimi

---

## 5. Veri Modeli (Basitleştirilmiş)

**users**
- id (uuid)
- email
- password_hash
- role (enum)
- created_at

**products**
- id
- name
- slug
- description
- price
- sku
- stock
- images (jsonb)
- category_id

**orders**
- id
- user_id
- total
- status
- payment_method
- delivery_address (jsonb)
- courier_id (nullable)
- created_at

**order_status_history**
- id
- order_id
- status
- timestamp

**courier_events**
- id (uuid)
- event_id (unique)
- event_type
- payload (jsonb)
- created_at

**notifications**
- id
- type (email, sms, whatsapp)
- template_id
- payload
- status
- created_at

---

## 6. API Standartları
- Base URL: `/api/v1`
- Auth: `Authorization: Bearer <token>`
- Response format:
```json
{
  "success": true,
  "data": {}
}
```
Error:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email",
    "fields": { "email": "Invalid" }
  }
}
```
- Tüm POST isteklerinde `Idempotency-Key` desteği
- Webhook doğrulama: `crypto.timingSafeEqual`

---

## 7. Performans ve Güvenlik
- Rate limiting (IP başına 1000/10dk)
- Input sanitization (Zod + escape)
- JWT Access: 15 dk, Refresh: 7 gün
- Dosya yüklemede mime/size kontrol
- Logging (PII maskeli)
- Metrics: webhook_latency, order_create_latency, delivery_eta_error

---

## 8. Test & QA
- Unit: Jest (utils, services)
- API: Supertest (auth, orders, courier)
- E2E: Playwright (checkout + webhook senaryosu)
- Smoke testler CI pipeline’da zorunlu

---

## 9. Deployment & Env
- Ortamlar: `dev`, `staging`, `prod`
- CI/CD: Lint → Test → Build → Deploy (Render/Fly/Vercel)
- `.env` değişkenleri: API_URL, DATABASE_URL, REDIS_URL, PAYTR_KEY, COURIER_WEBHOOK_SECRET, RESEND_API_KEY, NETGSM_USER, NETGSM_PASS

---

## 10. Başarı Kriterleri
- Checkout başarı oranı ≥ %95
- Webhook latency < 1000ms
- Sipariş atama medyan süresi < 3dk
- 5xx hata oranı < %0.2

---

## 11. MVP Kapsamı
1. Ürün & kategori API + admin entegrasyonu
2. Sipariş oluşturma akışı
3. PayTR iframe ödeme
4. Kurye create & webhook temel entegrasyonu
5. Bildirim servisi (email/whatsapp stub)
6. Realtime sipariş listesi (Supabase/Socket)

---

## 12. Faz 2 (Opsiyonel Geliştirmeler)
- Çoklu depo yönetimi
- Bölgesel teslimat zaman pencereleri
- Admin için sürükle-bırak dashboard bileşenleri
- Gelişmiş raporlama (grafik + CSV)

---

Bu PRD, Tulumbak projesinin backend mimarisi ve gereksinimlerini yönlendiren referans dokümandır. Tüm geliştirmeler bu belgedeki API, veri modeli ve güvenlik ilkeleriyle uyumlu yürütülmelidir.

