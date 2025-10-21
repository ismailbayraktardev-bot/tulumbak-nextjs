# FE-05: Ana Sayfa (Home) Yeni Tasarım Implementation

## 📋 Görev Özeti

Stitch tasarımına uygun yeni Ana Sayfa (Home) implementation'ı. HTML yapısı ve görsel referans sağlandı.

## 🎯 Hedefler

- ✅ Stitch design system'ine uygun Ana Sayfa
- ✅ Türkçe içerik (İngilizce metinler çevrilecek)
- ✅ Mevcut font'ları kullan (Playfair Display + Manrope)
- ✅ Mobile-first responsive tasarım
- ✅ Component-based mimari

## 📱 Tasarım Analizi

### Header (Sticky Navigation)
- Logo + "Tulumbak" başlığı
- Arama çubuğu (mobil'de gizli)
- Sepet ve hesap ikonları
- Kategori navigasyon menüsü
- Sticky positioning

### Hero Section
- Arka plan görseli + gradient overlay
- Başlık: "Otantik Türk Tatlılarının Tadını Çıkarın"
- Alt başlık: "Sevgiyle hazırlanmış, kapınıza teslim edilir"
- CTA buton: "Koleksiyonumuzu Keşfedin"

### Featured Desserts
- Horizontal scroll carousel
- Product cards (görsel, başlık, açıklama, fiyat)
- "View Product" butonları
- Shadow effect'li kartlar

### Recently Viewed
- Daha küçük product cards
- Link'ler ile ürün detayına yönlendirme
- Horizontal scroll

### Customer Reviews
- 3 sütun grid (mobile'de 1 sütun)
- Yıldız puanları
- Alıntılar + müşteri adı

### Our Story
- 2 sütun layout (video + metin)
- Video player + marka hikayesi

### Footer
- 4 sütun grid
- Logo + marka bilgisi
- Quick links
- Shop links
- Sosyal medya ikonları

## 🎨 Design System

### Renkler
```javascript
colors: {
  "primary": "#ec7813",           // CTA butonlar, link'ler
  "background-light": "#f8f7f6", // Ana arka plan
  "background-dark": "#221810",  // Dark mode
  "text-primary": "#1b140d",     // Ana metin rengi
  "text-secondary": "#9a704c",   // Secondary metin
}
```

### Font'lar
- **Display Font**: Manrope (Playfair Display yerine)
- **Body Font**: Manrope
- **Weights**: 400, 500, 600, 700, 800

### Border Radius
- Default: 0.25rem (4px)
- Large: 0.5rem (8px)
- XL: 0.75rem (12px)
- Full: 9999px

## 🔧 Component Planı

### 1. Header Components
```
components/features/home/
├── HomeHeader.tsx (sticky header)
├── NavigationMenu.tsx (kategori navigasyonu)
└── SearchBar.tsx (arama çubuğu)
```

### 2. Hero Section
```
components/features/home/
└── HeroSection.tsx (hero + CTA)
```

### 3. Product Components
```
components/features/home/
├── FeaturedDesserts.tsx (carousel)
├── FeaturedProductCard.tsx
├── RecentlyViewed.tsx (carousel)
└── RecentlyViewedCard.tsx
```

### 4. Content Components
```
components/features/home/
├── CustomerReviews.tsx
├── ReviewCard.tsx
├── OurStory.tsx
└── HomeFooter.tsx
```

## 📱 Responsive Behavior

### Mobile (Default)
- Horizontal scroll carousels
- Hamburger menu
- Stacked layout
- Touch-friendly targets

### Tablet (md: 768px+)
- 2 sütun grid'ler
- Arama çubuğu görünür
- Better spacing

### Desktop (lg: 1024px+)
- 3 sütun grid'ler
- Full navigation
- Hover effects

## 🔄 Implementation Adımları

### Phase 1: Header & Navigation
1. HomeHeader component'i (sticky)
2. NavigationMenu component'i
3. SearchBar component'i
4. Responsive menu toggle

### Phase 2: Hero Section
1. HeroSection component'i
2. Gradient overlay
3. CTA buton
4. Background image optimization

### Phase 3: Product Sections
1. FeaturedDesserts carousel
2. FeaturedProductCard component'i
3. RecentlyViewed carousel
4. RecentlyViewedCard component'i

### Phase 4: Content Sections
1. CustomerReviews grid
2. ReviewCard component'i
3. OurStory 2-sütun layout
4. Video player integration

### Phase 5: Footer
1. HomeFooter component'i
2. 4-sütun grid
3. Sosyal medya ikonları
4. Link'ler

## 📝 Türkçe Çeviriler

### Hero Section
- "Experience the Authentic Taste of Turkish Desserts" → "Otantik Türk Tatlılarının Tadını Çıkarın"
- "Handcrafted with love, delivered to your door" → "Sevgiyle hazırlanmış, kapınıza teslim edilir"
- "Explore Our Collection" → "Koleksiyonumuzu Keşfedin"

### Navigation
- "Baklava" → "Baklava"
- "Lokum" → "Lokum"
- "Künefe" → "Künefe"
- "Pastries" → "Tatlılar"
- "Gift Boxes" → "Hediye Kutuları"

### Sections
- "Featured Desserts" → "Öne Çıkan Tatlılar"
- "Recently Viewed" → "Son Görüntülenenler"
- "What Our Customers Say" → "Müşteriler Ne Diyor"
- "Our Story" → "Bizim Hikayemiz"

## 🚀 Performance Optimizasyonu

### Image Optimization
- Next.js Image component
- Lazy loading
- Responsive image sizes
- WebP format desteği

### Code Splitting
- Component-based lazy loading
- Dynamic imports
- Bundle optimization

### SEO
- Meta tag'ler
- Structured data
- Semantic HTML
- Alt text'ler

## ✅ Success Criteria

1. **Design Fidelity**: Stitch tasarımına %100 uyum
2. **Responsive**: Mobile-first responsive tasarım
3. **Performance**: LCP < 1.5s
4. **Accessibility**: WCAG 2.1 AA uyumluluğu
5. **Turkish Content**: Tüm metinler Türkçe
6. **Font Consistency**: Belirlenen font'ların kullanımı
7. **Component Architecture**: Reusable component'ler
8. **Code Quality**: TypeScript, ESLint, Prettier

## 📅 Timeline

- **Day 1**: Header & Navigation implementation
- **Day 2**: Hero Section & Product Components
- **Day 3**: Content Sections & Footer
- **Day 4**: Integration & Testing
- **Day 5**: Polish & Deployment

## 🎯 Deliverables

1. Component'ler (`components/features/home/`)
2. Ana sayfa (`app/page.tsx`)
3. Mock data güncellemeleri
4. Responsive test sonuçları
5. Performance metrikleri
6. Deployment hazır kod

---

**Not**: Mevcut font'ları kullanmaya özen göster. İçerik tamamen Türkçe olacak. Mobile-first responsive tasarım prensiplerine uyulacak.