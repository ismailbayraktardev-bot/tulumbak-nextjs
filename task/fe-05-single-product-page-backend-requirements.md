# FE-05: Single Product Page Backend Requirements

## 🎯 Overview

Single Product Page (PDP) için gerekli backend API'leri, veri yapıları ve entegrasyon gereksinimleri.

## 📋 API Endpoints

### 1. Product Details API
```typescript
// Product detaylarını getir
GET /api/v1/products/[slug]

// Response Format
{
  "success": true,
  "data": {
    "id": "prod_123",
    "slug": "fistikli-baklava",
    "name": "Fıstıklı Baklava",
    "description": "Katmanlı hamur ve fıstık ile hazırlanan geleneksel Türk tatlısı...",
    "price": 450.00,
    "originalPrice": 550.00,
    "images": [
      "https://example.com/image1.jpg",
      "https://example.com/image2.jpg",
      "https://example.com/image3.jpg",
      "https://example.com/image4.jpg"
    ],
    "rating": 4.5,
    "reviewCount": 12,
    "weightOptions": [
      {
        "id": "weight_1",
        "label": "0.5 KG (13-15 Adet Kutuda)",
        "price": 250.00,
        "stock": 50
      },
      {
        "id": "weight_2",
        "label": "1 KG (27-30 Adet Kutuda)",
        "price": 450.00,
        "stock": 30
      },
      {
        "id": "weight_3",
        "label": "2 KG (55-57 Adet Tepside)",
        "price": 850.00,
        "stock": 20
      },
      {
        "id": "weight_4",
        "label": "3 KG (80-85 Adet Tepside)",
        "price": 1200.00,
        "stock": 15
      }
    ],
    "inStock": true,
    "category": {
      "id": "cat_1",
      "name": "Baklava",
      "slug": "baklava"
    },
    "tags": ["fıstıklı", "geleneksel", "taze"],
    "nutritionInfo": {
      "calories": 450,
      "protein": 8,
      "carbs": 65,
      "fat": 18
    },
    "ingredients": ["Buğday unu", "Fıstık", "Tereyağı", "Şerbet"],
    "allergens": ["Gluten", "Fındık"],
    "deliveryInfo": {
      "standardDelivery": "2-3 iş günü",
      "expressDelivery": "Aynı gün (İzmir için)"
    },
    "seo": {
      "title": "Fıstıklı Baklava | Tulumbak",
      "description": "Taze fıstıklü baklava...",
      "keywords": "baklava, fıstıklı, tatlı"
    },
    "createdAt": "2025-10-21T10:00:00Z",
    "updatedAt": "2025-10-21T15:30:00Z"
  }
}
```

### 2. Product Reviews API
```typescript
// Ürün yorumlarını getir
GET /api/v1/products/[slug]/reviews?page=1&limit=5&rating=5

// Response Format
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "review_123",
        "rating": 5,
        "title": "Harika bir lezzet!",
        "content": "Yaptığım en iyi baklava alışverişiydi. Taze ve lezzetli...",
        "reviewer": {
          "name": "Ayşe Y.",
          "avatar": "https://example.com/avatar.jpg"
        },
        "date": "2025-10-15T14:30:00Z",
        "verified": true,
        "helpful": 12
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 5,
      "total": 12,
      "totalPages": 3
    },
    "ratingSummary": {
      "average": 4.5,
      "distribution": {
        "5": 8,
        "4": 2,
        "3": 1,
        "2": 1,
        "1": 0
      }
    }
  }
}

// Yeni yorum ekle
POST /api/v1/products/[slug]/reviews

// Request Body
{
  "rating": 5,
  "title": "Mükemmel ürün",
  "content": "Gerçekten çok lezzetli...",
  "reviewerName": "Mehmet K."
}

// Response Format
{
  "success": true,
  "data": {
    "id": "review_124",
    "rating": 5,
    "title": "Mükemmel ürün",
    "content": "Gerçekten çok lezzetli...",
    "reviewer": {
      "name": "Mehmet K.",
      "avatar": "https://example.com/default-avatar.jpg"
    },
    "date": "2025-10-21T17:00:00Z",
    "verified": false,
    "helpful": 0
  }
}
```

### 3. Recently Viewed Products API
```typescript
// Son görüntülenen ürünleri getir
GET /api/v1/products/recently-viewed?limit=5

// Response Format
{
  "success": true,
  "data": [
    {
      "id": "prod_456",
      "slug": "cevizli-sultan-rotasi",
      "name": "Cevizli Sultan Rotası",
      "price": 380.00,
      "image": "https://example.com/product1.jpg",
      "category": {
        "name": "Sultan Rotası"
      }
    }
  ]
}

// Son görüntülenen ürünleri kaydet
POST /api/v1/products/recently-viewed

// Request Body
{
  "productId": "prod_123",
  "userId": "user_456" // Opsiyonel, guest için null
}
```

### 4. Product Availability API
```typescript
// Ürün stok durumunu kontrol et
GET /api/v1/products/[slug]/availability?weightId=weight_2

// Response Format
{
  "success": true,
  "data": {
    "inStock": true,
    "stock": 30,
    "weightId": "weight_2",
    "nextRestock": null, // Stok yoksa sonraki stok tarihi
    "maxQuantity": 10 // Maksimum sipariş miktarı
  }
}
```

## 🗄️ Database Schema Updates

### 1. Products Table Extensions
```sql
-- Mevcut products tablosuna eklenecek kolonlar
ALTER TABLE products ADD COLUMN IF NOT EXISTS 
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  original_price DECIMAL(10,2),
  images JSONB DEFAULT '[]',
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  in_stock BOOLEAN DEFAULT true,
  tags JSONB DEFAULT '[]',
  nutrition_info JSONB,
  ingredients JSONB DEFAULT '[]',
  allergens JSONB DEFAULT '[]',
  delivery_info JSONB,
  seo JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Index'ler
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_rating ON products(rating DESC);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(in_stock);
```

### 2. Product Weight Options Table
```sql
CREATE TABLE IF NOT EXISTS product_weight_options (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  label VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_weight_options_product ON product_weight_options(product_id);
CREATE INDEX IF NOT EXISTS idx_weight_options_active ON product_weight_options(is_active);
```

### 3. Product Reviews Table
```sql
CREATE TABLE IF NOT EXISTS product_reviews (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  reviewer_name VARCHAR(255),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  content TEXT,
  verified BOOLEAN DEFAULT false,
  helpful INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON product_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON product_reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_created ON product_reviews(created_at DESC);
```

### 4. Recently Viewed Products Table
```sql
CREATE TABLE IF NOT EXISTS recently_viewed_products (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  session_id VARCHAR(255), -- Guest kullanıcılar için
  viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id, user_id),
  UNIQUE(product_id, session_id)
);

CREATE INDEX IF NOT EXISTS idx_recently_product ON recently_viewed_products(product_id);
CREATE INDEX IF NOT EXISTS idx_recently_user ON recently_viewed_products(user_id);
CREATE INDEX IF NOT EXISTS idx_recently_session ON recently_viewed_products(session_id);
CREATE INDEX IF NOT EXISTS idx_recently_viewed ON recently_viewed_products(viewed_at DESC);
```

## 🔧 Business Logic Requirements

### 1. Product Slug Generation
```typescript
// Otomatik slug generation
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
}

// Unique slug kontrolü
async function ensureUniqueSlug(name: string, productId?: string): Promise<string> {
  let slug = generateSlug(name);
  let counter = 1;
  
  while (await slugExists(slug, productId)) {
    slug = `${generateSlug(name)}-${counter}`;
    counter++;
  }
  
  return slug;
}
```

### 2. Rating Calculation
```typescript
// Otomatik rating güncelleme
async function updateProductRating(productId: string): Promise<void> {
  const result = await db.query(`
    SELECT 
      AVG(rating) as average_rating,
      COUNT(*) as total_reviews
    FROM product_reviews 
    WHERE product_id = $1 AND status = 'approved'
  `, [productId]);
  
  const { average_rating, total_reviews } = result.rows[0];
  
  await db.query(`
    UPDATE products 
    SET 
      rating = $1,
      review_count = $2,
      updated_at = NOW()
    WHERE id = $3
  `, [average_rating, total_reviews, productId]);
}
```

### 3. Stock Management
```typescript
// Stok kontrolü ve güncelleme
async function checkAndUpdateStock(
  productId: string, 
  weightId: string, 
  quantity: number
): Promise<boolean> {
  const result = await db.query(`
    SELECT stock 
    FROM product_weight_options 
    WHERE product_id = $1 AND id = $2 AND is_active = true
  `, [productId, weightId]);
  
  if (result.rows[0].stock >= quantity) {
    await db.query(`
      UPDATE product_weight_options 
      SET stock = stock - $1 
      WHERE product_id = $2 AND id = $3
    `, [quantity, productId, weightId]);
    
    return true;
  }
  
  return false;
}
```

### 4. Recently Viewed Logic
```typescript
// Son görüntülenen ürünleri kaydet
async function addToRecentlyViewed(
  productId: string, 
  userId?: string, 
  sessionId?: string
): Promise<void> {
  const identifier = userId ? 'user_id' : 'session_id';
  const identifierValue = userId || sessionId;
  
  await db.query(`
    INSERT INTO recently_viewed_products (product_id, ${identifier})
    VALUES ($1, $2)
    ON CONFLICT (product_id, ${identifier})
    DO UPDATE SET viewed_at = NOW()
  `, [productId, identifierValue]);
  
  // Son 20 kayıttan fazlasını temizle
  await db.query(`
    DELETE FROM recently_viewed_products 
    WHERE ${identifier} = $1 
    AND id NOT IN (
      SELECT id FROM recently_viewed_products 
      WHERE ${identifier} = $1 
      ORDER BY viewed_at DESC 
      LIMIT 20
    )
  `, [identifierValue]);
}
```

## 🛡️ Validation & Security

### 1. Review Validation
```typescript
// Yorum validasyon kuralları
const reviewValidation = {
  rating: {
    required: true,
    min: 1,
    max: 5,
    type: 'integer'
  },
  title: {
    required: true,
    minLength: 3,
    maxLength: 255,
    type: 'string'
  },
  content: {
    required: true,
    minLength: 10,
    maxLength: 2000,
    type: 'string'
  },
  reviewerName: {
    required: true,
    minLength: 2,
    maxLength: 100,
    type: 'string'
  }
};
```

### 2. Rate Limiting
```typescript
// Review gönderme için rate limiting
const reviewRateLimit = {
  window: 3600000, // 1 saat
  maxRequests: 5, // Maksimum 5 yorum
  identifier: 'ip' // IP bazlı
};

// Recently viewed için rate limiting
const recentlyViewedRateLimit = {
  window: 60000, // 1 dakika
  maxRequests: 100, // Maksimum 100 istek
  identifier: 'session' // Session bazlı
};
```

### 3. Content Moderation
```typescript
// Otomatik content filtering
const forbiddenWords = [
  'spam', 'scam', 'fake', 'illegal',
  // Add more words as needed
];

function moderateContent(content: string): boolean {
  const lowerContent = content.toLowerCase();
  return !forbiddenWords.some(word => lowerContent.includes(word));
}
```

## 📊 Performance Optimization

### 1. Caching Strategy
```typescript
// Product detayları için cache
const productCache = {
  key: `product:${slug}`,
  ttl: 3600, // 1 saat
  tags: ['product', 'details']
};

// Reviews için cache
const reviewsCache = {
  key: `reviews:${slug}:${page}:${limit}`,
  ttl: 1800, // 30 dakika
  tags: ['product', 'reviews']
};

// Recently viewed için cache
const recentlyViewedCache = {
  key: `recently:${userId || sessionId}`,
  ttl: 300, // 5 dakika
  tags: ['product', 'recently']
};
```

### 2. Database Optimization
```sql
-- Partial index for active products
CREATE INDEX idx_products_active_in_stock 
ON products(id) WHERE in_stock = true;

-- Composite index for reviews
CREATE INDEX idx_reviews_product_status_created 
ON product_reviews(product_id, status, created_at DESC);

-- Partitioning for large review tables (isteğe bağlı)
CREATE TABLE product_reviews_2025 PARTITION OF product_reviews
FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
```

## 🔄 API Response Format Standards

### 1. Success Response
```typescript
interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  meta?: {
    pagination?: PaginationMeta;
    timestamp: string;
    requestId: string;
  };
}
```

### 2. Error Response
```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    fields?: Record<string, string>;
  };
  meta: {
    timestamp: string;
    requestId: string;
  };
}
```

## 🧪 Testing Requirements

### 1. Unit Tests
- Product slug generation
- Rating calculation logic
- Stock management functions
- Review validation

### 2. Integration Tests
- Product details API
- Review submission flow
- Recently viewed tracking
- Stock update operations

### 3. Load Tests
- Product page load (1000 concurrent users)
- Review submission (100 concurrent users)
- Recently viewed updates (500 concurrent users)

## 📝 Implementation Notes

### 1. Priority Order
1. **Product Details API** - Critical (Day 1)
2. **Product Reviews API** - Important (Day 2)
3. **Recently Viewed API** - Nice to have (Day 3)
4. **Availability API** - Important (Day 2)

### 2. Dependencies
- ✅ Products table exists
- ✅ Users table exists
- 🔄 New tables need to be created
- 🔄 Indexes need to be added

### 3. Migration Strategy
```sql
-- Migration script
BEGIN;

-- Add new columns to products
ALTER TABLE products ADD COLUMN slug VARCHAR(255);
ALTER TABLE products ADD COLUMN rating DECIMAL(3,2);
-- ... other columns

-- Create new tables
CREATE TABLE product_weight_options (...);
CREATE TABLE product_reviews (...);
CREATE TABLE recently_viewed_products (...);

-- Generate slugs for existing products
UPDATE products 
SET slug = LOWER(REPLACE(REPLACE(name, ' ', '-'), '.', ''))
WHERE slug IS NULL;

COMMIT;
```

---

*Bu doküman Single Product Page için gerekli olan tüm backend gereksinimlerini kapsar.*
*Oluşturulma: 21 Ekim 2025*
*Proje: Tulumbak E-ticaret Platformu*