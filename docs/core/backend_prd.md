# Tulumbak Backend - Product Requirements Document (PRD)
**Version 2.0 - Updated 2025-10-21**

## 1. Proje Tanımı
Tulumbak Backend, Next.js 15 tabanlı e-ticaret sisteminin tüm iş mantığı, veri yönetimi ve entegrasyonlarını yöneten sunucu tarafıdır. Amaç, kendi kurye sistemiyle entegre çalışabilen, güvenli, performanslı ve yönetilebilir bir e-ticaret altyapısı kurmaktır.

Backend; API katmanı, PostgreSQL veritabanı, kurye ve ödeme entegrasyonları, bildirim servisleri ve yönetim paneli için veri servislerini kapsar.

**🎯 DURUM: SPRINT 1 TAMAMLANDI ✅**

---

## 2. Hedefler
- **✅ Full API coverage:** Ürün, kategori, sipariş, kullanıcı, kurye, ödeme, bildirim modüllerini kapsayan REST API.
- **🔄 Kurye entegrasyonu:** Çift yönlü haberleşme (API çağrısı + imzalı webhook'lar).
- **✅ Yönetilebilirlik:** Admin panelinden tüm verilerin kontrol edilebilmesi.
- **🔄 Gerçek zamanlı veri:** Sipariş durumu ve kurye takibi.
- **🔄 Performans ve güvenlik:** İmzalı webhooks, idempotency, JWT, rate limiting.

### 🎯 SPRINT 1 BAŞARILARI (2025-10-21)
- ✅ PostgreSQL database kurulumu ve bağlantısı
- ✅ Categories API (GET, POST) - Türkçe kategori verileri
- ✅ Products API (GET, POST) - Filtreleme, pagination, search
- ✅ TypeScript types ve validation schemas
- ✅ Turkish sample data (12 ürün, 3 kategori)
- ✅ Project structure migration completed

---

## 3. Mimari Genel Bakış
```
apps/api/
├─ src/
│  ├─ app/api/
│  │  ├─ test/
│  │  ├─ categories/
│  │  ├─ products/
│  │  ├─ orders/ (Sprint 2)
│  │  ├─ auth/ (Sprint 2)
│  │  ├─ courier/ (Sprint 3)
│  │  └─ payments/ (Sprint 3)
│  ├─ lib/
│  │  ├─ postgres.ts ✅
│  │  ├─ validations.ts ✅
│  │  └─ types.ts ✅
│  └─ database/
│     ├─ schema.sql ✅
│     └─ seed.sql ✅
└─ tests/
```

**✅ MEVCUT TEKNOLOJİLER:**
- Next.js 15 + TypeScript
- PostgreSQL (Doğrudan bağlantı) ✅
- Docker (PostgreSQL container) ✅
- Zod (validasyon) ✅
- PNPM (package management) ✅

**🔄 PLANLI TEKNOLOJİLER:**
- Redis (cache & queues) - Sprint 2
- JWT Authentication - Sprint 2
- PayTR Integration - Sprint 3
- BullMQ (notification queues) - Sprint 3

---

## 4. Modüller - DURUM

### 4.1 ✅ Categories (Sprint 1 - TAMAMLANDI)
- **Endpoints:**
  - `GET /api/categories` - Kategori listesi
  - `POST /api/categories` - Kategori oluşturma
- **Features:**
  - ✅ Hiyerarşik yapı (parent_id desteği)
  - ✅ Sıralama (position field)
  - ✅ Active/Inactive status
  - ✅ Türkçe kategori verileri (Tatlılar, İçecekler, Tulumbalar)

### 4.2 ✅ Products (Sprint 1 - TAMAMLANDI)
- **Endpoints:**
  - `GET /api/products` - Ürün listesi (filtreleme, pagination)
  - `POST /api/products` - Ürün oluşturma
  - `GET /api/products/[slug]` - Ürün detayı
- **Features:**
  - ✅ Kategori filtreleme (`?category=tatlilar`)
  - ✅ Search (`?q=tulumba`)
  - ✅ Fiyat filtreleme (`?min_price=50&max_price=100`)
  - ✅ Pagination (page, per_page, total)
  - ✅ Sıralama (newest, price_asc, price_desc)
  - ✅ SEO alanları (slug, images)
  - ✅ 12 Türkçe tatlı ürünü

### 4.3 🔄 Auth (Sprint 2 - PLANLANDI)
- JWT tabanlı oturum (Access + Refresh token)
- Roller: `customer`, `admin`, `super_admin`
- Giriş, kayıt, şifre sıfırlama endpointleri

### 4.4 🔄 Orders (Sprint 2 - PLANLANDI)
- Durum akışı: `pending → confirmed → preparing → ready → on_delivery → delivered (+ cancelled)`
- Sipariş oluşturma (checkout API)
- Durum geçmişi tablosu (`order_status_history`)
- Teslimat adresi, ödeme yöntemi, sipariş notu

### 4.5 🔄 Courier Integration (Sprint 3 - PLANLANDI)
#### Outgoing (bizden kurye sistemine)
- `POST /api/courier/orders/create`
- `POST /api/courier/orders/:id/assign`
- `GET /api/courier/couriers/available`

#### Incoming (kurye sisteminden bize)
- Webhook Event'leri: `order-assigned`, `order-picked`, `order-delivered`, `order-failed`
- HMAC-SHA256 imzalı, `X-Webhook-Signature` header'ı ile doğrulama
- Idempotent event işleme (`event_id` unique constraint)

### 4.6 🔄 Payments (PayTR) (Sprint 3 - PLANLANDI)
- Token oluşturma (iframe akışı)
- Callback endpoint (sipariş durumu güncelleme)
- Idempotency-Key desteği
- Fraud guard (tekrar callback'te durum eşleşmezse uyarı logu)

### 4.7 🔄 Notifications (Sprint 3 - PLANLANDI)
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

## 11. 🚀 SPRINT PLANLARI (2025-10-21 GÜNCEL)

### ✅ SPRINT 1 - COMPLETED (21 Ekim 2025)
**Duration: 1 Gün | Status: BAŞARILI**
- ✅ PostgreSQL setup & connection
- ✅ Categories API (GET, POST)
- ✅ Products API (GET, POST) with filtering
- ✅ Turkish sample data (12 ürün, 3 kategori)
- ✅ Project structure migration
- ✅ TypeScript types & validation
- **Result:** Working API with Turkish dessert data

### 🎯 SPRINT 2 - AUTH & ORDERS (Haftası: 22-28 Ekim 2025)
**Duration: 1 Hafta | Priority: YÜKSEK**
- 🎯 **Authentication System**
  - JWT tokens (Access: 15dk, Refresh: 7 gün)
  - User roles (customer, admin, super_admin)
  - Login, register, password reset endpoints
  - Admin protection middleware

- 🎯 **Orders Module**
  - Orders table & schema
  - Order creation API
  - Status flow implementation
  - Order history tracking
  - Customer order management

- 🎯 **Database Extensions**
  - Users table creation
  - Orders table setup
  - Order status history table
  - Foreign key relationships

**Deliverables:**
- Complete auth system
- Basic order management
- User registration/login
- Admin dashboard integration

### 🎯 SPRINT 3 - E-COMMERCE CORE (Haftası: 29 Ekim - 4 Kasım 2025)
**Duration: 1 Hafta | Priority: YÜKSEK**
- 🎯 **Payment Integration (PayTR)**
  - Token creation API
  - Callback handling
  - Payment status tracking
  - Error handling & retry logic

- 🎯 **Cart System**
  - Cart table & API
  - Add/remove items
  - Cart persistence
  - Guest cart support

- 🎯 **Advanced Product Features**
  - Product variants (size, color)
  - Inventory management
  - Stock tracking
  - Product images upload

**Deliverables:**
- Working payment system
- Shopping cart functionality
- Advanced product management
- Inventory tracking

### 🎯 SPRINT 4 - COURIER & NOTIFICATIONS (Haftası: 5-11 Kasım 2025)
**Duration: 1 Hafta | Priority: ORTA**
- 🎯 **Courier Integration**
  - Courier API endpoints
  - Webhook handling
  - Order assignment
  - Delivery tracking

- 🎯 **Notification System**
  - Redis + BullMQ setup
  - Email templates
  - SMS integration (NetGSM)
  - WhatsApp integration

- 🎯 **Admin Dashboard APIs**
  - Order management
  - Customer management
  - Product management
  - Analytics endpoints

**Deliverables:**
- Courier integration
- Notification system
- Complete admin APIs
- Basic analytics

### 🎯 SPRINT 5 - OPTIMIZATION & TESTING (Haftası: 12-18 Kasım 2025)
**Duration: 1 Hafta | Priority: DÜŞÜK**
- 🎯 **Performance Optimization**
  - Redis caching implementation
  - Query optimization
  - API response caching
  - Image optimization

- 🎯 **Testing & Quality**
  - Unit tests (Jest)
  - API tests (Supertest)
  - Integration tests
  - Error handling improvements

- 🎯 **Documentation & Deployment**
  - API documentation (Swagger)
  - Deployment setup
  - Environment configuration
  - CI/CD pipeline

**Deliverables:**
- Optimized performance
- Complete test suite
- API documentation
- Production ready deployment

---

## 12. 📊 CURRENT STATUS METRICS

### ✅ COMPLETED FEATURES
- **API Endpoints:** 3 working (`/api/test`, `/api/categories`, `/api/products`)
- **Database Tables:** 2 created (categories, products)
- **Sample Data:** 15 records (3 categories, 12 products)
- **Response Times:** < 200ms average
- **Error Rate:** 0% on tested endpoints

### 🔄 IN PROGRESS
- **Project Structure:** ✅ Completed
- **Database Setup:** ✅ Completed
- **Frontend Integration:** 🔄 Ready to start

### 📈 UPCOMING PRIORITIES
1. **Authentication System** (Sprint 2)
2. **Orders Module** (Sprint 2)
3. **Payment Integration** (Sprint 3)
4. **Cart System** (Sprint 3)

---

## 13. 🎯 SUCCESS CRITERIA (Updated)

### Immediate (Sprint 2)
- Authentication success rate ≥ 95%
- Order creation success rate ≥ 98%
- API response time < 500ms

### Short Term (Sprint 3-4)
- Payment success rate ≥ 90%
- Cart abandonment rate < 70%
- Admin panel efficiency ≥ 80%

### Long Term (Sprint 5+)
- 5xx error rate < 0.2%
- Customer satisfaction ≥ 4.5/5
- Order delivery accuracy ≥ 95%

---

Bu PRD, Tulumbak projesinin backend mimarisi ve gereksinimlerini yönlendiren canlı dokümandır. Tüm geliştirmeler bu belgedeki API, veri modeli ve güvenlik ilkeleriyle uyumlu yürütülmelidir.

**Son Güncelleme: 21 Ekim 2025 - Sprint 1 Başarıyla Tamamlandı** 🎉

