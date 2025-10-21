# FE-05: Ana Sayfa (Home) Implementation Planı

## 📋 Component Implementation Detayları

### 1. Header Components

#### HomeHeader.tsx
```typescript
interface HomeHeaderProps {
  className?: string;
}

// Sticky header with logo, search, cart, account
// Responsive navigation menu
// Mobile hamburger menu
```

**Features:**
- Sticky positioning
- Logo + "Tulumbak" text
- Search bar (hidden on mobile)
- Cart & account icons
- Mobile menu toggle
- Category navigation menu

#### NavigationMenu.tsx
```typescript
interface NavigationMenuProps {
  categories: Category[];
  className?: string;
}

// Horizontal category navigation
// Mobile: hamburger menu
// Desktop: full menu
```

**Features:**
- Category links: Baklava, Lokum, Künefe, Tatlılar, Hediye Kutuları
- Mobile: slide-in drawer
- Desktop: horizontal menu
- Active state indicators

#### SearchBar.tsx
```typescript
interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
}

// Search input with icon
// Auto-suggestions (future)
```

**Features:**
- Search icon
- Full-width on desktop
- Hidden on mobile
- Focus states

### 2. Hero Section

#### HeroSection.tsx
```typescript
interface HeroSectionProps {
  title: string;
  subtitle: string;
  cta: {
    label: string;
    href: string;
  };
  backgroundImage: string;
  className?: string;
}

// Full-width hero with background image
// Gradient overlay
// Centered content
// CTA button
```

**Features:**
- Background image with gradient overlay
- Centered content
- Responsive typography
- CTA button with hover effect
- Mobile-first responsive

### 3. Product Components

#### FeaturedDesserts.tsx
```typescript
interface FeaturedDessertsProps {
  products: Product[];
  title?: string;
  className?: string;
}

// Horizontal scroll carousel
// Product cards
// Navigation arrows (desktop)
// Touch scroll (mobile)
```

**Features:**
- Horizontal scroll carousel
- Desktop: navigation arrows
- Mobile: touch scroll
- Snap scrolling
- Scroll indicators

#### FeaturedProductCard.tsx
```typescript
interface FeaturedProductCardProps {
  product: Product;
  onProductClick?: (product: Product) => void;
  className?: string;
}

// Product card with image, title, description, price
// "View Product" button
// Shadow effect
// Hover states
```

**Features:**
- Product image
- Product title
- Product description
- Price display
- "View Product" button
- Shadow effect
- Hover states

#### RecentlyViewed.tsx
```typescript
interface RecentlyViewedProps {
  products: Product[];
  title?: string;
  className?: string;
}

// Smaller product cards
// Horizontal scroll
// Link to product pages
```

**Features:**
- Smaller product cards
- Horizontal scroll
- Link to product pages
- Hover effects

#### RecentlyViewedCard.tsx
```typescript
interface RecentlyViewedCardProps {
  product: Product;
  className?: string;
}

// Compact product card
- Product image
- Product title
- Link wrapper
```

**Features:**
- Compact design
- Product image
- Product title
- Link wrapper
- Hover effects

### 4. Content Components

#### CustomerReviews.tsx
```typescript
interface CustomerReviewsProps {
  reviews: Review[];
  title?: string;
  className?: string;
}

// 3-column grid (desktop)
// 1-column grid (mobile)
// Review cards
```

**Features:**
- Responsive grid layout
- Review cards
- Star ratings
- Customer testimonials

#### ReviewCard.tsx
```typescript
interface ReviewCardProps {
  review: Review;
  className?: string;
}

// Review card with rating, quote, customer name
// Shadow effect
// Hover states
```

**Features:**
- Star rating display
- Review quote
- Customer name
- Shadow effect
- Hover states

#### OurStory.tsx
```typescript
interface OurStoryProps {
  title: string;
  content: string;
  videoUrl?: string;
  videoAlt?: string;
  className?: string;
}

// 2-column layout (desktop)
// Video player + text content
// Stacked layout (mobile)
```

**Features:**
- 2-column layout (desktop)
- Video player
- Story content
- Stacked layout (mobile)

#### HomeFooter.tsx
```typescript
interface HomeFooterProps {
  className?: string;
}

// 4-column grid
// Logo + brand info
// Quick links
// Shop links
// Social media icons
```

**Features:**
- 4-column grid (desktop)
- 1-column grid (mobile)
- Logo + brand info
- Quick links
- Shop links
- Social media icons

## 🎨 Styling Guidelines

### Colors
```css
:root {
  --stitch-primary: #ec7813;
  --stitch-background-light: #f8f7f6;
  --stitch-background-dark: #221810;
  --stitch-text-primary: #1b140d;
  --stitch-text-secondary: #9a704c;
}
```

### Typography
```css
.font-display {
  font-family: 'Manrope', sans-serif;
}

/* Font weights */
.font-light { font-weight: 200; }
.font-normal { font-weight: 400; }
.font-medium { font-weight: 500; }
.font-semibold { font-weight: 600; }
.font-bold { font-weight: 700; }
.font-extrabold { font-weight: 800; }
```

### Border Radius
```css
.rounded-sm { border-radius: 0.25rem; } /* 4px */
.rounded { border-radius: 0.5rem; } /* 8px */
.rounded-lg { border-radius: 0.75rem; } /* 12px */
.rounded-full { border-radius: 9999px; }
```

## 📱 Responsive Breakpoints

```css
/* Mobile (default) */
@media (min-width: 768px) {
  /* Tablet styles */
}

@media (min-width: 1024px) {
  /* Desktop styles */
}
```

## 🔧 Implementation Structure

```
apps/store/src/
├── app/
│   └── page.tsx (main home page)
├── components/
│   └── features/
│       └── home/
│           ├── HomeHeader.tsx
│           ├── NavigationMenu.tsx
│           ├── SearchBar.tsx
│           ├── HeroSection.tsx
│           ├── FeaturedDesserts.tsx
│           ├── FeaturedProductCard.tsx
│           ├── RecentlyViewed.tsx
│           ├── RecentlyViewedCard.tsx
│           ├── CustomerReviews.tsx
│           ├── ReviewCard.tsx
│           ├── OurStory.tsx
│           └── HomeFooter.tsx
├── lib/
│   └── mock-data.ts (updated with home page data)
└── types/
    └── home.ts (home page specific types)
```

## 📝 Türkçe Çeviriler

### Hero Section
```typescript
const heroContent = {
  title: "Otantik Türk Tatlılarının Tadını Çıkarın",
  subtitle: "Sevgiyle hazırlanmış, kapınıza teslim edilir",
  cta: {
    label: "Koleksiyonumuzu Keşfedin",
    href: "/kategori/tulumbalar"
  }
};
```

### Navigation
```typescript
const navigationItems = [
  { label: "Baklava", href: "/kategori/baklavalar" },
  { label: "Lokum", href: "/kategori/lokumlar" },
  { label: "Künefe", href: "/kategori/kunefeler" },
  { label: "Tatlılar", href: "/kategori/tatlilar" },
  { label: "Hediye Kutuları", href: "/kategori/hediye-kutulari" }
];
```

### Sections
```typescript
const sectionTitles = {
  featuredDesserts: "Öne Çıkan Tatlılar",
  recentlyViewed: "Son Görüntülenenler",
  customerReviews: "Müşteriler Ne Diyor",
  ourStory: "Bizim Hikayemiz"
};
```

## 🚀 Performance Optimizations

### Image Optimization
- Next.js Image component
- Lazy loading
- Responsive sizes
- WebP format

### Code Splitting
- Dynamic imports for components
- Route-based code splitting
- Bundle optimization

### Loading States
- Skeleton components
- Loading indicators
- Progressive enhancement

## ✅ Testing Plan

### Visual Testing
- Design consistency
- Responsive behavior
- Hover states
- Transition effects

### Functional Testing
- Navigation links
- Search functionality
- Product cards
- Form interactions

### Performance Testing
- Lighthouse scores
- Core Web Vitals
- Bundle size
- Image optimization

## 📅 Implementation Timeline

### Day 1: Header & Navigation
- HomeHeader component
- NavigationMenu component
- SearchBar component
- Mobile menu toggle

### Day 2: Hero Section
- HeroSection component
- Background image optimization
- CTA button
- Responsive typography

### Day 3: Product Sections
- FeaturedDesserts carousel
- FeaturedProductCard component
- RecentlyViewed carousel
- RecentlyViewedCard component

### Day 4: Content Sections
- CustomerReviews grid
- ReviewCard component
- OurStory section
- Video player integration

### Day 5: Footer & Integration
- HomeFooter component
- Main page integration
- Responsive testing
- Performance optimization

---

**Not**: Tüm component'ler mobile-first responsive olacak. Türkçe içerik kullanılacak. Mevcut font'lar (Playfair Display + Manrope) korunacak.