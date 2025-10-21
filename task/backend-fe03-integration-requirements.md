# Backend FE-03 Integration Requirements - Complete Guide

> Frontend ekibinin FE-03 sprint'i için backend'den gereken tüm API'ler, özellikler ve entegrasyon gereksinimleri.
> Bu dosya tüm backend task'larını birleştirir ve karmaşık olmaması için ana bağlamı korur.

## 🎯 Genel Bakış

Frontend ekibi FE-03 sprint'i şu özellikleri geliştiriyor:
- **Cart Management**: Sepet yönetimi (guest + authenticated)
- **Checkout Flow**: 5 adımlı checkout süreci
- **PayTR Integration**: Turkish ödeme sistemi
- **Order Management**: Sipariş takip ve yönetimi
- **Admin Panel**: CRUD işlemleri ve realtime özellikler

## ✅ Mevcut Backend Durumu
- ✅ JWT Authentication System (access/refresh tokens)
- ✅ User Registration/Login endpoints
- ✅ Database schema with users table
- ✅ HTTP-only cookie implementation
- ✅ Basic cart system (partial)

---

## 🚀 KRİTİK ÖNCELİK (Gün 1-3)

### 1. Cart Management API

#### Endpoint'ler:
```typescript
// Guest cart operations
POST /api/v1/carts/guest                    // Yeni guest cart oluştur
PUT /api/v1/carts/{id}/items               // Ürün ekle/güncelle
DELETE /api/v1/carts/{id}/items/{item_id}  // Ürün çıkar
GET /api/v1/carts/{id}                      // Sepet detayları
GET /api/v1/carts/{id}/summary             // Sepet özeti

// Cart merging (guest → user)
PUT /api/v1/carts/{id}/merge                // Guest cart'ı user cart'ına birleştir
POST /api/v1/carts/{id}/extend              // Guest cart süresini uzat
```

#### Database Schema Updates:
```sql
ALTER TABLE carts ADD COLUMN guest_cart_id VARCHAR(36) UNIQUE;
ALTER TABLE carts ADD COLUMN expires_at TIMESTAMP;
ALTER TABLE carts ADD COLUMN session_token VARCHAR(255);
CREATE INDEX idx_carts_guest_id ON carts(guest_cart_id);
CREATE INDEX idx_carts_expires_at ON carts(expires_at);
```

#### Özellikler:
- Guest cart (localStorage ID) ve authenticated cart ayrımı
- 24 saat guest cart timeout + otomatik temizleme
- Real-time stock validation
- Cart item price calculations (variants, discounts)
- Cart merging logic (duplicate items, quantity management)

---

### 2. Order Creation & Management

#### Endpoint'ler:
```typescript
POST /api/v1/orders                        // Sipariş oluştur (checkout sonrası)
GET /api/v1/orders/{id}                    // Sipariş detayı
GET /api/v1/users/{user_id}/orders         // Kullanıcı siparişleri
PUT /api/v1/orders/{id}/status             // Sipariş durumu güncelle
GET /api/v1/orders/{id}/track              // Sipariş takip (public)
```

#### Order Creation Payload:
```json
{
  "cart_id": "cr_abc123",
  "customer": {
    "name": "Ali Veli",
    "email": "ali@example.com", 
    "phone": "+905551112233"
  },
  "billing": {
    "type": "corporate|individual",
    "tckn": "12345678901",           // Individual billing
    "vkn": "1234567890",            // Corporate billing
    "company": "Tulumbak AŞ",
    "tax_office": "Bornova"
  },
  "shipping_address": {
    "text": "Cengiz Topel Cd. No:123 D:4",
    "city": "İzmir",
    "district": "Menemen", 
    "postal_code": "35620",
    "coordinates": {
      "lat": 38.6131,
      "lng": 27.0723
    }
  },
  "delivery_slot": {
    "from": "2025-10-21T14:00:00+03:00",
    "to": "2025-10-21T16:00:00+03:00",
    "branch_id": 1
  },
  "notes": "Kapı önü teslimat",
  "payment_method": "paytr"
}
```

#### Database Schema Updates:
```sql
ALTER TABLE orders ADD COLUMN customer_type VARCHAR(20) DEFAULT 'individual';
ALTER TABLE orders ADD COLUMN customer_phone VARCHAR(20);
ALTER TABLE orders ADD COLUMN billing_info JSONB;
ALTER TABLE orders ADD COLUMN shipping_address JSONB;
ALTER TABLE orders ADD COLUMN delivery_slot JSONB;
ALTER TABLE orders ADD COLUMN notes TEXT;
ALTER TABLE orders ADD COLUMN payment_method VARCHAR(50);
ALTER TABLE orders ADD COLUMN payment_status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN delivery_fee DECIMAL(10,2) DEFAULT 0;
```

#### Özellikler:
- Turkish billing system (TCKN/VKN validation)
- Order number generation (ORD-20251021-001 format)
- Order status transitions (pending → confirmed → preparing → ready → delivered)
- Delivery slot management
- Order history and tracking

---

### 3. Address & Zone Management

#### Endpoint'ler:
```typescript
// Public endpoints
POST /api/v1/zones/lookup                  // Adres → bölge/şube eşleştirme
POST /api/v1/zones/geocode                 // Adres → koordinat dönüşüm
GET /api/v1/delivery-slots                 // Teslimat zaman dilimleri

// Admin endpoints
GET /api/v1/zones                          // Bölge listesi
POST /api/v1/zones                         // Bölge oluştur
GET /api/v1/branches                       // Şube listesi
```

#### Zone Database Schema:
```sql
CREATE TABLE zones (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  branch_id INTEGER REFERENCES branches(id),
  zone_type VARCHAR(20) DEFAULT 'delivery',
  polygon_data JSONB NOT NULL,              // GeoJSON polygon
  center_lat DECIMAL(10,8) NOT NULL,
  center_lng DECIMAL(11,8) NOT NULL,
  radius_km DECIMAL(5,2) DEFAULT 5.0,
  delivery_fee DECIMAL(10,2) DEFAULT 25.00,
  free_delivery_threshold DECIMAL(10,2) DEFAULT 500.00,
  estimated_delivery_time INTEGER DEFAULT 45,
  is_active BOOLEAN DEFAULT true,
  operating_hours JSONB,
  delivery_slots JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE delivery_slots (
  id SERIAL PRIMARY KEY,
  zone_id INTEGER REFERENCES zones(id),
  date DATE NOT NULL,
  from_time TIME NOT NULL,
  to_time TIME NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 20,
  reserved INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(zone_id, date, from_time, to_time)
);
```

#### Zone Lookup Response:
```json
{
  "success": true,
  "data": {
    "in_service_area": true,
    "zone": {
      "id": 12,
      "name": "Menemen Merkez",
      "branch": {
        "id": 3,
        "name": "Menemen Şubesi",
        "distance_km": 2.3
      },
      "delivery_info": {
        "fee": 25.00,
        "estimated_time": 45,
        "free_delivery_threshold": 500.00
      }
    }
  }
}
```

---

### 4. PayTR Payment Integration

#### Endpoint'ler:
```typescript
POST /api/v1/payments/paytr/init          // Ödeme başlat
GET /api/v1/payments/status?order_id=123 // Ödeme durumu sorgula
POST /api/v1/webhooks/paytr               // PayTR callback webhook
GET /api/v1/payments/{payment_id}         // Payment detayları
```

#### Payment Database Schema:
```sql
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  paytr_token VARCHAR(255) UNIQUE NOT NULL,
  merchant_oid VARCHAR(255) UNIQUE NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'TRY',
  status VARCHAR(20) DEFAULT 'pending',
  payment_method VARCHAR(50),
  paid_amount DECIMAL(12,2),
  commission_fee DECIMAL(12,2),
  hash_data VARCHAR(255),
  callback_data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);
```

#### PayTR Init Response:
```json
{
  "success": true,
  "data": {
    "paytr_token": "abc123def456...",
    "payment_url": "https://www.paytr.com/odeme/GuV9ZmXpL2k8",
    "merchant_oid": "ORD20251021001",
    "expires_at": "2025-10-21T13:00:00+03:00"
  }
}
```

#### Özellikler:
- PayTR merchant credentials management
- HMAC-SHA256 signature validation
- Idempotent webhook processing
- Payment retry logic
- Security (IP whitelisting, signature verification)

---

## 🔧 ÖNEMLİ ÖNCELİK (Gün 4-5)

### 5. File Upload System

#### Endpoint'ler:
```typescript
POST /api/v1/upload/products              // Ürün görselleri yükle
DELETE /api/v1/upload/{file_id}           // Görsel sil
GET /api/v1/upload/{file_id}              // Görsel bilgileri
```

#### Özellikler:
- WebP automatic conversion
- Image optimization (resize, compress)
- Alt text storage
- File size validation (max 5MB)
- CDN integration

---

### 6. Admin CRUD Operations

#### Products:
```typescript
POST /api/v1/admin/products               // Ürün oluştur
PUT /api/v1/admin/products/{id}          // Ürün güncelle
DELETE /api/v1/admin/products/{id}       // Ürün sil
POST /api/v1/admin/products/import       // CSV import
GET /api/v1/admin/products/export        // CSV export
```

#### Categories:
```typescript
POST /api/v1/admin/categories            // Kategori oluştur
PUT /api/v1/admin/categories/{id}       // Kategori güncelle
DELETE /api/v1/admin/categories/{id}    // Kategori sil
```

#### Özellikler:
- Server-side pagination, filtering, sorting
- Image upload with multiple files
- CSV import/export (SheetJS integration)
- Bulk operations
- Audit logging

---

### 7. Realtime Features

#### WebSocket/SSE Events:
```typescript
// Events
order.created          // Yeni sipariş
order.updated          // Sipariş durumu değişti
product.updated        // Ürün/stok güncellemesi
courier.assigned       // Kurye ataması

// Endpoints
GET /api/v1/admin/realtime/orders       // Realtime orders stream
POST /api/v1/admin/orders/{id}/assign   // Kurye atama
```

#### Özellikler:
- Admin panel realtime updates
- Order status notifications
- WebSocket connection management
- Event broadcasting

---

## 🛡️ GÜVENLİK VE PERFORMANS

### 8. Admin Panel Security

#### RBAC Implementation:
```typescript
// Roles
super_admin    // Full access
admin          // All modules except global settings
branch_admin   // Only assigned branch data

// Middleware
Route protection by role
Row-level data filtering (branch_id)
Audit logging for admin actions
```

---

### 9. Performance & Monitoring

#### API Optimizations:
- Response time < 200ms for critical endpoints
- Database query optimization
- Caching headers (Cache-Control, ETag)
- Rate limiting (1000 req/10min per IP)

#### Monitoring:
- API response time tracking
- Error rate monitoring
- Performance metrics dashboard

---

### 10. Data Validation & Error Handling

#### Validation Rules:
```typescript
// Turkish phone number: +905XX XXX XX XX
/^\+90\d{3}\s\d{3}\s\d{2}\s\d{2}$/

// TCKN validation (11 digits, algorithm)
function validateTCKN(tckn: string): boolean

// VKN validation (10 digits)
/^[0-9]{10}$/
```

#### Error Response Format:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Geçersiz telefon numarası formatı",
    "fields": {
      "phone": "Lütfen +905XX XXX XX XX formatında girin"
    }
  }
}
```

---

## 📊 ÖNCELİK SIRALAMASI

### 🔥 HIGH PRIORITY (Gün 1-3 - Blocker):
1. **Cart Management API** - Checkout akışını bloklar
2. **Order Creation** - Sipariş oluşturamazsak olmaz
3. **PayTR Integration** - Ödeme alamazsak gelir yok
4. **Address Zone Lookup** - Teslimat yapamazsak

### ⚡ MEDIUM PRIORITY (Gün 4-5 - Important):
5. **File Upload System** - Ürün yönetimi için gerekli
6. **Admin CRUD Operations** - Operasyon için gerekli
7. **Realtime Features** - Admin experience için önemli

### 🔧 LOW PRIORITY (Sonraki Sprint):
8. **Advanced Monitoring** - Analytics ve reporting
9. **Performance Optimizations** - Scale için gerekli
10. **Enhanced Security Features** - Ek güvenlik katmanları

---

## 🔄 ENTegrasyon TIMELINE

### Hafta İçi Plan:
- **Gün 1**: Cart API'leri devreye al
- **Gün 2**: Order creation + Address zone lookup
- **Gün 3**: PayTR integration + webhook setup
- **Gün 4**: Admin CRUD operations
- **Gün 5**: Realtime features + testing

### Test Planı:
- **Gün 3**: Payment flow entegrasyon testi
- **Gün 4**: Admin panel entegrasyon testi
- **Gün 5**: End-to-end testing

---

## 🧪 TEST REQUIREMENTS

### Unit Tests:
- Cart calculations and validations
- Order creation logic
- Payment flow edge cases
- Zone matching algorithms
- TCKN/VKN validation

### Integration Tests:
- Full checkout flow (cart → order → payment)
- Payment webhook processing
- Admin CRUD operations
- Realtime event handling

### Load Testing:
- Cart operations (1000 concurrent users)
- Checkout process (500 concurrent users)
- Admin panel operations (100 concurrent admins)

---

## 📞 İLETİŞİM VE KOORDINASYON

### Daily Sync:
- Her sabah 10:00'da brief call
- Blocker'ları anlık paylaşım
- Progress updates via Slack

### Critical Path:
1. **Cart API olmadan** → Checkout akışı başlayamaz
2. **Order creation olmadan** → Sipariş alınamaz
3. **PayTR olmadan** → Ödeme alınamaz
4. **Admin CRUD olmadan** → Operasyon yapılamaz

### Risk Mitigation:
- Frontend mock data ile geliştirmeye devam edebilir
- Sandbox mode ile payment testleri yapılabilir
- Incremental deployment ile risk azaltılır

---

## 🎯 SUCCESS METRICS

### Backend Targets:
- **API response time < 200ms** (critical endpoints)
- **99.9% uptime** for payment endpoints
- **Zero data loss** for orders and payments
- **Sub-second** cart operations

### Integration Targets:
- **Cart → Order flow** success rate ≥ 99%
- **Payment success rate** ≥ 98%
- **Admin operations** response time < 300ms
- **Realtime updates** latency < 1s

---

## 📝 SON NOTLAR

### Frontend-Backend Contract:
- Tüm endpoint'ler JSON formatında consistent response döndürür
- Authentication HTTP-only JWT cookies ile yapılır
- CORS frontend domain'leri için configure edilmiştir
- API versioning `/api/v1/` formatındadır

### Critical Dependencies:
- ✅ Authentication system (completed)
- 🔄 Cart API endpoints (needed Day 1)
- 🔄 Order creation API (needed Day 2)
- 🔄 PayTR integration (needed Day 3)
- 🔄 Admin CRUD APIs (needed Day 4)

### Environment Variables:
```bash
# PayTR Credentials
PAYTR_MERCHANT_ID=your_merchant_id
PAYTR_MERCHANT_KEY=your_merchant_key
PAYTR_MERCHANT_SALT=your_merchant_salt

# File Upload
UPLOAD_MAX_SIZE=5242880  # 5MB
UPLOAD_ALLOWED_TYPES=jpg,jpeg,png,webp

# Rate Limiting
RATE_LIMIT_WINDOW=600000  # 10 minutes
RATE_LIMIT_MAX=1000       # requests per window
```

---

**Bu dosya frontend ekibinin FE-03 sprint'i için backend'den gereken tüm özellikleri kapsar. Öncelik sırasına göre development planlanmalı ve daily sync ile koordinasyon sağlanmalıdır.**

**Tulumbak Frontend Team** 🚀
