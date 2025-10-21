# FE-03 Sprint Todo List - Frontend Development

> Backend authentication sistemi tamamlandı. Bu todo listesi FE-03 sprint hedeflerini kapsar.
> Performans hedefi: **LCP < 1.5s (hedef 1s altı)**

## 📋 GÜN 1: Cart + User Integration

### Cart Management System
- [ ] **Cart Store (Zustand)**
  - [ ] Cart state management setup
  - [ ] Guest cart vs authenticated cart logic
  - [ ] Local storage persistence for guest carts
  - [ ] Cart sync with backend API

- [ ] **Cart Page Components**
  - [ ] Cart page layout (`/sepet`)
  - [ ] Cart item component with quantity controls
  - [ ] Cart summary component (subtotal, tax, total)
  - [ ] Empty cart state component
  - [ ] Cart loading/skeleton states

- [ ] **Cart API Integration**
  - [ ] `GET /api/v1/carts/{id}` - fetch cart details
  - [ ] `PUT /api/v1/carts/{id}/items` - add/update items
  - [ ] `DELETE /api/v1/carts/{id}/items/{item_id}` - remove items
  - [ ] `POST /api/v1/carts/{id}/merge` - merge guest cart to user cart

- [ ] **User Dashboard Integration**
  - [ ] Update `/hesabim` with cart history
  - [ ] Order history component
  - [ ] Saved addresses (v1: single address)
  - [ ] Account settings integration

## 📋 GÜN 2: Checkout Flow (Auth Ready)

### Multi-Step Checkout
- [ ] **Checkout Layout & Navigation**
  - [ ] Checkout page layout (`/odeme`)
  - [ ] Step indicator component (5 steps)
  - [ ] Step navigation (back/next)
  - [ ] Progress persistence across steps

- [ ] **Step 1: Contact Information**
  - [ ] Contact form (name, email, phone)
  - [ ] Auto-populate for authenticated users
  - [ ] Turkish phone number formatting
  - [ ] Form validation with Turkish messages

- [ ] **Step 2: Shipping Address**
  - [ ] Address form (text, city, district)
  - [ ] Address validation & formatting
  - [ ] Zone lookup integration
  - [ ] Address suggestions widget

- [ ] **Step 3: Delivery Time Slot**
  - [ ] Time slot selection component
  - [ ] Slot availability checking
  - [ ] Date picker for delivery
  - [ ] Time slot validation

- [ ] **Step 4: Billing Information**
  - [ ] Billing type toggle (individual/corporate)
  - [ ] Individual billing form (TCKN)
  - [ ] Corporate billing form (VKN, company)
  - [ ] Tax ID validation algorithms

- [ ] **Step 5: Order Summary & Payment**
  - [ ] Order summary component
  - [ ] Coupon code input & validation
  - [ ] KVKK & terms checkboxes
  - [ ] "Siparişi Oluştur ve Ödemeye Geç" CTA

### Checkout State Management
- [ ] **Checkout Form Provider**
  - [ ] RHF + Zod integration across all steps
  - [ ] Form data persistence
  - [ ] Step validation logic
  - [ ] Error handling & recovery

## 📋 GÜN 3: PayTR + Payment Integration

### Payment Processing
- [ ] **PayTR Integration Setup**
  - [ ] PayTR iFrame component
  - [ ] Payment page layout (`/odeme/odeme`)
  - [ ] Payment loading states
  - [ ] Payment error handling

- [ ] **Payment API Integration**
  - [ ] `POST /api/v1/payments/paytr/init` - initialize payment
  - [ ] `GET /api/v1/payments/status` - check payment status
  - [ ] Payment status polling logic
  - [ ] Payment timeout handling

- [ ] **Order Creation**
  - [ ] `POST /api/v1/orders` - create order from checkout
  - [ ] Order creation loading states
  - [ ] Order validation before creation
  - [ ] Order success/failure handling

- [ ] **Payment Flow UX**
  - [ ] Payment processing animations
  - [ ] Payment success page (`/siparis/basarili`)
  - [ ] Payment failure recovery
  - [ ] Payment retry logic

## 📋 GÜN 4: Admin Panel + Auth

### Admin Authentication Integration
- [ ] **Admin Panel Auth**
  - [ ] Admin authentication context
  - [ ] Role-based route protection
  - [ ] Admin user menu component
  - [ ] Admin session management

### Admin CRUD Operations
- [ ] **Products Management**
  - [ ] Product create/edit form
  - [ ] Product image upload component
  - [ ] Product variant editor
  - [ ] Product delete confirmation
  - [ ] CSV import/export functionality

- [ ] **Categories Management**
  - [ ] Category CRUD forms
  - [ ] Category hierarchy management
  - [ ] Category image upload
  - [ ] Category product count badge

- [ ] **Realtime Orders**
  - [ ] Orders list with real-time updates
  - [ ] Order status badges
  - [ ] Order detail view
  - [ ] Order status update modals
  - [ ] Branch assignment widget

### Admin Performance
- [ ] **Admin Panel Optimization**
  - [ ] Table virtualization for large datasets
  - [ ] Lazy loading for admin components
  - [ ] Admin panel code splitting
  - [ ] Admin bundle optimization

## 📋 GÜN 5: Performance Optimization

### Critical Performance Optimization (LCP < 1.5s)
- [ ] **Image Optimization**
  - [ ] Critical image preloading
  - [ ] WebP format conversion
  - [ ] Responsive image sizing
  - [ ] Image lazy loading implementation

- [ ] **Bundle Optimization**
  - [ ] Route-based code splitting
  - [ ] Component lazy loading
  - [ ] Tree shaking unused imports
  - [ ] Bundle analyzer integration

- [ ] **Critical Path Optimization**
  - [ ] Critical CSS inlining
  - [ ] Font optimization (preload, display: swap)
  - [ ] Resource hints (preconnect, prefetch)
  - [ ] Above-the-fold content prioritization

- [ ] **Caching Strategy**
  - [ ] Static asset caching headers
  - [ ] API response caching
  - [ ] Browser caching optimization
  - [ ] CDN caching setup

### Performance Monitoring
- [ ] **Performance Metrics Setup**
  - [ ] Lighthouse CI integration
  - [ ] Core Web Vitals monitoring
  - [ ] Performance budget setup
  - [ ] Real User Monitoring (RUM)

## 🎨 Design System Implementation

### Component Library
- [ ] **Missing Components**
  - [ ] Cart item component
  - [ ] Checkout step components
  - [ ] Payment iFrame wrapper
  - [ ] Admin form components
  - [ ] Loading/skeleton states

### Responsive Design
- [ ] **Mobile Optimization**
  - [ ] Cart mobile layout
  - [ ] Checkout mobile flow
  - [ ] Admin mobile tables
  - [ ] Touch-friendly interactions

### Accessibility (A11y)
- [ ] **Accessibility Improvements**
  - [ ] Keyboard navigation for checkout
  - [ ] Screen reader support
  - [ ] ARIA labels for forms
  - [ ] Focus management in modals

## 🔧 Integration & Testing

### API Integration
- [ ] **API Client Updates**
  - [ ] Cart API client functions
  - [ ] Checkout API client functions
  - [ ] Payment API client functions
  - [ ] Admin CRUD API clients

### Error Handling
- [ ] **Comprehensive Error Handling**
  - [ ] API error boundary components
  - [ ] Network error recovery
  - [ ] User-friendly error messages
  - [ ] Error logging integration

### Testing
- [ ] **Unit Tests**
  - [ ] Cart store tests
  - [ ] Checkout form validation tests
  - [ ] Payment flow tests
  - [ ] Admin component tests

- [ ] **Integration Tests**
  - [ ] Full checkout flow E2E
  - [ ] Payment flow E2E
  - [ ] Admin CRUD E2E
  - [ ] Cross-browser testing

## 📊 Success Metrics & KPIs

### Performance Targets
- [ ] **Core Web Vitals**
  - [ ] LCP < 1.5s (target < 1s)
  - [ ] FCP < 1.0s
  - [ ] TTI < 2.0s
  - [ ] CLS < 0.1

### Business Metrics
- [ ] **Conversion Metrics**
  - [ ] Cart abandonment rate < 20%
  - [ ] Checkout completion rate ≥ 95%
  - [ ] Payment success rate ≥ 98%
  - [ ] Mobile conversion rate > 2%

## 🚀 Deployment & Monitoring

### Production Readiness
- [ ] **Build Optimization**
  - [ ] Production build configuration
  - [ ] Environment variables setup
  - [ ] Build size optimization
  - [ ] Asset optimization

### Monitoring Setup
- [ ] **Analytics Integration**
  - [ ] GA4 e-commerce events
  - [ ] Performance monitoring
  - [ ] Error tracking setup
  - [ ] User behavior analytics

---

## 📝 Notes & Dependencies

### Backend Dependencies:
- ✅ Authentication system (completed)
- 🔄 Cart API endpoints (needed Day 1)
- 🔄 Order creation API (needed Day 2)
- 🔄 PayTR integration (needed Day 3)
- 🔄 Admin CRUD APIs (needed Day 4)

### Critical Path:
1. **Day 1**: Cart system (blocks checkout flow)
2. **Day 2**: Checkout flow (blocks payment)
3. **Day 3**: Payment integration (blocks revenue)
4. **Day 4**: Admin panel (operations)
5. **Day 5**: Performance optimization (UX)

### Risk Mitigation:
- Cart system can work with mock data initially
- Payment flow can be tested with sandbox mode
- Admin panel can use mock data for UI development
- Performance optimization can be done incrementally

---

**Bu todo listesi FE-03 sprint'in tamamını kapsar. Her günün sonunda progress kontrolü yapılacak ve ertesi günün planı güncellenecektir.**
