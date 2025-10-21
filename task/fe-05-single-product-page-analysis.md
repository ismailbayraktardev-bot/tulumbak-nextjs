# FE-05: Single Product Page Design Analysis & Implementation Plan

## 🎯 Overview

Tulumbak Single Product Page (PDP) için Stitch tasarımının analizi ve implementation planı. Header ve footer dışında tüm sayfa birebir implement edilecek.

## 📋 Design System Analysis

### 1. Color Palette
```javascript
colors: {
  "primary": "#800020",           // Kırmızı ana renk
  "secondary": "#fdf8f4",          // Açık bej arka plan
  "accent": "#c9a16b",            // Bronz vurgu rengi
  "warm-button": "#A97431",       // Sıcak buton rengi
  "background-light": "#fdf8f4",   // Açık bej arka plan
  "background-dark": "#221810",   // Koyu kahve arka plan
  "text-light": "#1f1f1f",        // Koyu metin
  "text-dark": "#fdf8f4",         // Açık metin
  "subtext-light": "#6b6b6b",     // Gri alt metin
  "subtext-dark": "#a1a1a1",      // Açık gri alt metin
}
```

### 2. Typography
```javascript
fontFamily: {
  "display": ["Playfair Display", "serif"],  // Başlık fontu
  "body": ["Manrope", "sans-serif"],        // Gövde fontu
}
```

### 3. Border Radius
```javascript
borderRadius: {
  "DEFAULT": "0.5rem",    // 8px
  "lg": "0.75rem",        // 12px
  "xl": "1rem",           // 16px
  "full": "9999px"        // Tam yuvarlak
}
```

### 4. Layout Structure
- **Container**: `px-4 md:px-10 lg:px-20 xl:px-40`
- **Max Width**: `max-w-[1200px]`
- **Grid**: `grid-cols-1 lg:grid-cols-2`
- **Gap**: `gap-12`

## 🏗️ Page Structure Analysis

### 1. Breadcrumbs
- **Path**: Home → Desserts → Product Name
- **Style**: `/` separator ile
- **Color**: `text-subtext-light`

### 2. Product Gallery (Left Column)
- **Main Image**: Aspect square, zoom effect
- **Thumbnail Grid**: 4 columns grid
- **Active State**: Border highlight
- **Hover Effect**: Scale transform

### 3. Product Info (Right Column)
- **Title**: `text-4xl lg:text-5xl font-display`
- **Rating**: Star system with review count
- **Description**: Leading-relaxed
- **Price**: `$24.99` with strikethrough
- **Quantity Selector**: Circular buttons
- **Weight Selector**: Dropdown with options
- **Add to Cart**: Full-width button

### 4. Delivery Options
- **Section Title**: "Teslimat seçenekleri"
- **Standard/Hızlı**: Two options
- **Style**: Sm text with bold labels

### 5. Share Section
- **Social Icons**: Facebook, Twitter, Instagram
- **Style**: Circular border icons

### 6. Product Tabs
- **Tabs**: Description, Ingredients, Nutritional, Reviews
- **Active Tab**: Reviews (12)
- **Border Bottom**: Active state indicator

### 7. Reviews Section
- **Customer Reviews**: Left column
- **Write a Review**: Right column with form
- **Rating System**: 5-star interactive
- **Review Cards**: Border bottom separation

### 8. Recently Viewed
- **Section Title**: "Recently Viewed Products"
- **Navigation**: Arrow buttons
- **Product Cards**: Horizontal scroll
- **Hover Effect**: Image scale

## 📱 Mobile-First Considerations

### 1. Responsive Breakpoints
- **Mobile**: Default (single column)
- **Tablet**: `md:` (768px+)
- **Desktop**: `lg:` (1024px+)
- **Large Desktop**: `xl:` (1280px+)

### 2. Mobile Adaptations
- **Gallery**: Single column on mobile
- **Tabs**: Horizontal scroll on mobile
- **Reviews**: Single column on mobile
- **Recently Viewed**: Horizontal scroll

### 3. Touch Targets
- **Button Height**: 56px (Add to Cart)
- **Thumbnail Size**: Touch-friendly
- **Spacing**: Adequate for touch

## 🛠️ Implementation Plan

### Phase 1: Design System Setup
1. **Update Tailwind Config**: Add new color palette
2. **Font Integration**: Playfair Display + Manrope
3. **CSS Variables**: Consistent theming
4. **Global Styles**: Import fonts

### Phase 2: Component Implementation
1. **ProductGallery**: Image gallery with zoom
2. **ProductInfo**: Product details and pricing
3. **QuantitySelector**: Circular quantity controls
4. **WeightSelector**: Dropdown component
5. **ProductTabs**: Tab navigation system
6. **ReviewSection**: Reviews and review form
7. **RecentlyViewed**: Horizontal product carousel

### Phase 3: Page Integration
1. **Product Page Layout**: Complete page structure
2. **State Management**: Product data and cart integration
3. **Form Handling**: Review form submission
4. **Image Optimization**: Gallery performance

## 📦 Component Structure

### File Organization
```
apps/store/src/
├── app/
│   └── urun/
│       └── [slug]/
│           └── page.tsx (updated)
├── components/
│   └── features/
│       └── product/
│           ├── ProductGallery.tsx
│           ├── ProductInfo.tsx
│           ├── QuantitySelector.tsx
│           ├── WeightSelector.tsx
│           ├── ProductTabs.tsx
│           ├── ReviewSection.tsx
│           ├── ReviewForm.tsx
│           └── RecentlyViewed.tsx
├── lib/
│   └── product-types.ts
└── styles/
    └── globals.css (updated)
```

### Component Dependencies
```typescript
// ProductGallery.tsx
interface ProductGalleryProps {
  images: string[];
  alt: string;
}

// ProductInfo.tsx
interface ProductInfoProps {
  product: Product;
  onAddToCart: (quantity: number, weight: string) => void;
}

// ReviewSection.tsx
interface ReviewSectionProps {
  reviews: Review[];
  onReviewSubmit: (review: ReviewData) => void;
}
```

## 🎨 Creative Features

### 1. Image Zoom Effect
```css
.zoom-container {
  overflow: hidden;
}
.zoom-container img {
  transition: transform 0.3s ease;
}
.zoom-container:hover img {
  transform: scale(1.2);
}
```

### 2. Interactive Rating System
- **Hover States**: Star preview
- **Click Events**: Rating selection
- **Visual Feedback**: Fill/unfill animation

### 3. Smooth Transitions
- **Tab Switching**: Smooth content transitions
- **Button Hover**: Color and scale effects
- **Card Hover**: Image zoom with shadow

## 🔧 Technical Requirements

### 1. Dependencies
- **@tailwindcss/forms**: Form styling
- **@tailwindcss/container-queries**: Responsive containers
- **Playfair Display**: Google Fonts import
- **Manrope**: Google Fonts import
- **Material Symbols**: Icon system

### 2. State Management
- **Product Data**: Static/loaded from API
- **Cart Integration**: Connect with existing cart store
- **Review Form**: Form state management
- **Tab State**: Active tab tracking

### 3. Performance Optimization
- **Image Optimization**: WebP conversion
- **Lazy Loading**: Gallery images
- **Code Splitting**: Component-level splitting
- **Bundle Optimization**: Tree shaking

## 📊 Backend Requirements

### 1. Product API
```typescript
// Product Details API
GET /api/v1/products/[slug]

// Reviews API
GET /api/v1/products/[slug]/reviews
POST /api/v1/products/[slug]/reviews

// Recently Viewed API
GET /api/v1/products/recently-viewed
```

### 2. Data Structure
```typescript
interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  rating: number;
  reviewCount: number;
  weightOptions: WeightOption[];
  inStock: boolean;
}

interface Review {
  id: string;
  rating: number;
  title: string;
  content: string;
  reviewer: string;
  date: string;
}
```

## 🧪 Testing Requirements

### 1. Unit Tests
- Product gallery functionality
- Quantity selector logic
- Review form validation
- Tab navigation

### 2. Integration Tests
- Add to cart functionality
- Review submission
- Image gallery navigation

### 3. E2E Tests
- Complete product page flow
- Mobile responsiveness
- Cross-browser compatibility

## 📈 Success Metrics

### 1. Performance Targets
- **LCP**: < 1.5s
- **FID**: < 100ms
- **CLS**: < 0.1
- **Bundle Size**: < 200KB

### 2. User Experience Targets
- **Image Load Time**: < 2s
- **Add to Cart**: < 1s response
- **Form Submission**: < 2s response
- **Mobile Score**: > 90

## 🚀 Implementation Timeline

### **Phase 1: Design System** (1 gün)
- Tailwind config setup
- Font integration
- CSS variables

### **Phase 2: Core Components** (2 gün)
- Product gallery
- Product info
- Quantity/weight selectors

### **Phase 3: Advanced Features** (2 gün)
- Product tabs
- Review system
- Recently viewed

### **Phase 4: Integration & Testing** (1 gün)
- Page integration
- API integration
- Testing & QA

**Total: 6 gün**

## 📝 Notes & Considerations

### 1. Exclusions
- **Header**: Alma (existing)
- **Footer**: Alma (existing)
- **Mini-sepet**: Alma (existing)

### 2. Inclusions
- **All content**: Breadcrumbs to recently viewed
- **Interactions**: Hover effects, transitions, forms
- **Responsive**: Mobile-first approach
- **Creative**: Animations and micro-interactions

### 3. Design Flexibility
- **Fonts**: Maintain existing font system
- **Animations**: Creative enhancements allowed
- **Layout**: Can be adapted for better UX

## 🎯 Next Steps

1. **Design System Setup**: Update Tailwind config
2. **Component Development**: Start with core components
3. **Page Integration**: Build complete page structure
4. **Testing & QA**: Comprehensive testing
5. **Deployment**: Production ready

---

*Bu doküman Single Product Page için complete implementation planını içerir.*
*Oluşturulma: 21 Ekim 2025*
*Proje: Tulumbak E-ticaret Platformu*