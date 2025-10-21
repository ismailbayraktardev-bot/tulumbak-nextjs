# Frontend Mock Data Setup - FE-03 Sprint

> Backend API'leri hazır olana kadar frontend'i mock data ile çalıştırmak için yapılandırma.

## 🎯 Hedef
- Backend bağımlılıkları olmadan frontend geliştirmeye devam etmek
- Auth ve cart sistemlerini mock data ile simüle etmek
- Port standartlarına uygun çalışma (API:3001, Admin:3002, Store:3003)

## 📋 Yapılacaklar

### 1. Port Configuration Düzeltmeleri
- [ ] Store port'unu 3006 → 3003'e çevir
- [ ] Admin dashboard port'unu kontrol et
- [ ] API port'unu kontrol et

### 2. Auth Store Mock Configuration
- [ ] API call'ları development'da disable et
- [ ] Mock user data ile auth'ı simüle et
- [ ] Auth provider'daki infinite loop'u düzelt

### 3. Cart Store Mock Data
- [ ] Mock cart items oluştur
- [ ] Backend sync'ini development'da kapat
- [ ] Local storage persistence'i koru

### 4. Component Import Hataları
- [ ] Cart component import path'lerini düzelt
- [ ] TypeScript hatalarını gider
- [ ] UI component'lerini düzgün yapılandır

### 5. Development Ortamı Test
- [ ] Port yönetimi ile başlat
- [ ] http://localhost:3003/store test et
- [ ] Sepet sayfasını test et

## 🔧 Mock Data Stratejisi

### Auth Mock Data
```typescript
const mockUser = {
  id: "user_123",
  email: "test@tulumbak.com",
  name: "Test Kullanıcı",
  role: "customer"
}
```

### Cart Mock Data
```typescript
const mockCartItems = [
  {
    id: "item_1",
    product_id: "prod_1",
    name: "Fıstıklı Baklava",
    variant: { weight: 1000, serving: null },
    quantity: 2,
    unit_price: 450.00,
    total_price: 900.00
  }
]
```

## 🚀 Kurulum Adımları

1. **Portları düzelt**
2. **Auth store'u mock'la**
3. **Cart store'u yapılandır**
4. **Component'leri düzelt**
5. **Test et**

---

**Not:** Backend hazır olunca mock data'ları kolayca kaldırıp gerçek API'lere geçebiliriz.
