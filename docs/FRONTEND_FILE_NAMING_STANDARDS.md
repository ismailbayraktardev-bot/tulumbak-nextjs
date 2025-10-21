# 🏗️ Tulumbak Frontend Dosya İsimlendirme Standartları

## 📋 Özet

Bu doküman, Tulumbak e-ticaret platformu için frontend dosya isimlendirme standartlarını ve best practice'lerini tanımlar. Müşteriye sunulacak profesyonel bir proje için dosya isimlendirmesinin tutarlı, anlaşılır ve maintain edilebilir olması kritik öneme sahiptir.

---

## 🎯 Temel İlkeler

### 1. **Anlaşılırlık (Clarity)**
- Dosya adı, içeriğini net bir şekilde ifade etmelidir
- Kısaltmalardan kaçının (kullanılmayacaksa dokümente edilmelidir)
- Tekrarlayan isimlerden kaçının

### 2. **Tutarlılık (Consistency)**
- Proje genelinde aynı naming convention kullanılmalı
- Benzer amaçlı dosyalar aynı pattern'e göre isimlendirilmeli
- Case sensitivity tutarlı olmalı

### 3. **Bakım Kolaylığı (Maintainability)**
- Geliştiriciler dosya adından amacı anlayabilmeli
- Arama ve filtreleme kolay olmalı
- Versiyon kontrolünde değişiklikler takip edilebilmeli

---

## 📁 Dosya İsimlendirme Kuralları

### **Component Dosyaları**

#### ✅ Doğru İsimlendirme
```
components/
├── ui/
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Modal.tsx
│   └── Card.tsx
├── layout/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── Sidebar.tsx
│   └── Navigation.tsx
├── features/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── AuthGuard.tsx
│   ├── checkout/
│   │   ├── CheckoutForm.tsx
│   │   ├── PaymentStep.tsx
│   │   ├── OrderSummary.tsx
│   │   └── ProgressBar.tsx
│   └── products/
│       ├── ProductCard.tsx
│       ├── ProductList.tsx
│       ├── ProductFilter.tsx
│       └── ProductDetails.tsx
```

#### ❌ Yanlış İsimlendirme
```
components/
├── stitch-checkout-form.tsx        // Prefix kullanılmamalı
├── stitch-progress-bar.tsx        // Prefix kullanılmamalı
├── button-component.tsx          // "-component" gereksiz
├── ButtonComponent.tsx           // "Component" gereksiz
├── btn.tsx                      // Kısaltma yapılmamalı
├── checkout_form.tsx             // Snake case kullanılmamalı
└── CheckoutFormStep2.tsx         // Suffix numaraları kullanılmamalı
```

### **Page Dosyaları**

#### ✅ Doğru İsimlendirme
```
app/
├── (auth)/
│   ├── login/
│   │   └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   └── forgot-password/
│       └── page.tsx
├── products/
│   ├── page.tsx                  // List page
│   ├── [slug]/
│   │   └── page.tsx              // Detail page
│   └── category/
│       └── [category]/
│           └── page.tsx
├── checkout/
│   ├── page.tsx                  // Main checkout
│   ├── payment/
│   │   └── page.tsx              // Payment step
│   └── success/
│       └── page.tsx              // Success page
└── account/
    ├── page.tsx                  // Dashboard
    ├── orders/
    │   └── page.tsx
    └── profile/
        └── page.tsx
```

### **Hook Dosyaları**

#### ✅ Doğru İsimlendirme
```
hooks/
├── useAuth.ts
├── useCart.ts
├── useCheckout.ts
├── useProducts.ts
├── useLocalStorage.ts
├── useDebounce.ts
└── useApi.ts
```

### **Utility ve Helper Dosyaları**

#### ✅ Doğru İsimlendirme
```
lib/
├── utils/
│   ├── format.ts
│   ├── validation.ts
│   ├── constants.ts
│   └── helpers.ts
├── api/
│   ├── client.ts
│   ├── endpoints.ts
│   └── types.ts
├── store/
│   ├── cart-store.ts
│   ├── auth-store.ts
│   └── product-store.ts
└── styles/
    ├── globals.css
    └── components.css
```

---

## 🏷️ Naming Convention'ler

### **PascalCase (Component'ler için)**
- React component'leri
- TypeScript class'lar
- Interface'ler (I prefix olmadan)

```typescript
// ✅ Doğru
export const Button = () => { ... }
export const CheckoutForm = () => { ... }
export interface ProductData { ... }
export class ApiService { ... }

// ❌ Yanlış
export const button = () => { ... }
export const checkout_form = () => { ... }
export interface IProductData { ... }
export class apiService { ... }
```

### **camelCase (Functions, Variables, Hooks için)**
- Fonksiyonlar
- Değişkenler
- Custom hook'lar
- Method'lar

```typescript
// ✅ Doğru
const handleSubmit = () => { ... }
const userData = { ... }
export const useAuth = () => { ... }
const formatPrice = (price: number) => { ... }

// ❌ Yanlış
const Handle_Submit = () => { ... }
const user_data = { ... }
export const UseAuth = () => { ... }
const FormatPrice = (price: number) => { ... }
```

### **kebab-case (CSS class'ları ve file name'ler için)**
- CSS class'ları
- Dosya adları (component'ler hariç)
- URL slug'lar

```css
/* ✅ Doğru */
.checkout-form { ... }
.product-card { ... }
.auth-modal { ... }

/* ❌ Yanlış */
.checkoutForm { ... }
.product_card { ... }
.authModal { ... }
```

---

## 📂 Dosya Yapısı Organizasyonu

### **Feature-Based Structure**
```
src/
├── components/
│   ├── ui/                    // Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Modal.tsx
│   ├── layout/                // Layout components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Sidebar.tsx
│   └── features/              // Feature-specific components
│       ├── auth/
│       │   ├── LoginForm.tsx
│       │   └── RegisterForm.tsx
│       ├── checkout/
│       │   ├── CheckoutForm.tsx
│       │   ├── PaymentStep.tsx
│       │   └── OrderSummary.tsx
│       └── products/
│           ├── ProductCard.tsx
│           └── ProductList.tsx
├── hooks/                     // Custom hooks
├── lib/                       // Utilities and helpers
├── store/                     // State management
├── types/                     // TypeScript types
└── styles/                    // CSS and styling
```

### **Atomic Design Structure (Alternatif)**
```
src/
├── components/
│   ├── atoms/                 // Smallest building blocks
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Icon.tsx
│   ├── molecules/             // Combinations of atoms
│   │   ├── SearchBox.tsx
│   │   ├── ProductCard.tsx
│   │   └── LoginForm.tsx
│   ├── organisms/             // Complex UI sections
│   │   ├── Header.tsx
│   │   ├── CheckoutForm.tsx
│   │   └── ProductGrid.tsx
│   ├── templates/             // Page layouts
│   │   ├── CheckoutPage.tsx
│   │   └── ProductPage.tsx
│   └── pages/                 // Entry points
│       ├── HomePage.tsx
│       └── CheckoutPage.tsx
```

---

## 🔄 Dosya Yeniden Adlandırma (Refactoring)

### **Mevcut Sorunlu Dosyalar**
```
// ❌ Mevcut sorunlu dosyalar
components/checkout/stitch-checkout-form.tsx
components/checkout/stitch-progress-bar.tsx
components/checkout/stitch-order-summary.tsx
components/checkout/stitch-form-inputs.tsx
components/checkout/stitch-multi-step-checkout.tsx
```

### **✅ Düzeltilmiş Dosyalar**
```
// ✅ Düzeltilmiş dosyalar
components/features/checkout/CheckoutForm.tsx
components/features/checkout/ProgressBar.tsx
components/features/checkout/OrderSummary.tsx
components/features/checkout/FormInputs.tsx
components/features/checkout/MultiStepCheckout.tsx
```

---

## 📋 İsimlendirme Checklist'i

### **Component Dosyaları için**
- [ ] PascalCase kullanılıyor mu?
- [ ] "Component" suffix'i yok mu?
- [ ] Anlaşılır bir isim mi?
- [ ] Tekrarlayan prefix yok mu?
- [ ] Kısaltma yapılmamış mı?

### **Page Dosyaları için**
- [ ] Doğru klasör yapısında mı?
- [ ] Route ile uyumlu mu?
- [ ] Anlaşılır bir isim mi?
- [ ] Dynamic route'lar doğru formatta mı?

### **Hook Dosyaları için**
- [ ] "use" prefix'i var mı?
- [ ] camelCase kullanılıyor mu?
- [ ] Anlaşılır bir isim mi?
- [ ] Tekil isim mi (useAuth, useCart)?

### **Utility Dosyaları için**
- [ ] Doğru klasörde mi?
- [ ] camelCase kullanılıyor mu?
- [ ] Anlaşılır bir isim mi?
- [ ] Amacını ifade ediyor mu?

---

## 🛠️ Otomasyon Araçları

### **ESLint Rules**
```json
{
  "rules": {
    "react/display-name": "error",
    "react/jsx-pascal-case": "error",
    "camelcase": ["error", { "properties": "never" }],
    "filename-case": ["error", { "case": "PascalCase" }]
  }
}
```

### **VSCode Settings**
```json
{
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  }
}
```

---

## 🎯 Örnek Proje Yapısı

```
tulumbak/
├── apps/
│   └── store/
│       ├── src/
│       │   ├── app/
│       │   │   ├── (auth)/
│       │   │   │   ├── login/
│       │   │   │   │   └── page.tsx
│       │   │   │   └── register/
│       │   │   │       └── page.tsx
│       │   │   ├── products/
│       │   │   │   ├── page.tsx
│       │   │   │   └── [slug]/
│       │   │   │       └── page.tsx
│       │   │   ├── checkout/
│       │   │   │   ├── page.tsx
│       │   │   │   ├── payment/
│       │   │   │   │   └── page.tsx
│       │   │   │   └── success/
│       │   │   │       └── page.tsx
│       │   │   └── layout.tsx
│       │   ├── components/
│       │   │   ├── ui/
│       │   │   │   ├── Button.tsx
│       │   │   │   ├── Input.tsx
│       │   │   │   ├── Modal.tsx
│       │   │   │   └── Card.tsx
│       │   │   ├── layout/
│       │   │   │   ├── Header.tsx
│       │   │   │   ├── Footer.tsx
│       │   │   │   └── Navigation.tsx
│       │   │   └── features/
│       │   │       ├── auth/
│       │   │       │   ├── LoginForm.tsx
│       │   │       │   ├── RegisterForm.tsx
│       │   │       │   └── AuthGuard.tsx
│       │   │       ├── checkout/
│       │   │       │   ├── CheckoutForm.tsx
│       │   │       │   ├── PaymentStep.tsx
│       │   │       │   ├── OrderSummary.tsx
│       │   │       │   └── ProgressBar.tsx
│       │   │       └── products/
│       │   │           ├── ProductCard.tsx
│       │   │           ├── ProductList.tsx
│       │   │           └── ProductDetails.tsx
│       │   ├── hooks/
│       │   │   ├── useAuth.ts
│       │   │   ├── useCart.ts
│       │   │   ├── useCheckout.ts
│       │   │   └── useProducts.ts
│       │   ├── lib/
│       │   │   ├── utils/
│       │   │   │   ├── format.ts
│       │   │   │   ├── validation.ts
│       │   │   │   └── constants.ts
│       │   │   ├── api/
│       │   │   │   ├── client.ts
│       │   │   │   ├── endpoints.ts
│       │   │   │   └── types.ts
│       │   │   └── store/
│       │   │       ├── cart-store.ts
│       │   │       ├── auth-store.ts
│       │   │       └── product-store.ts
│       │   ├── types/
│       │   │   ├── auth.ts
│       │   │   ├── product.ts
│       │   │   └── checkout.ts
│       │   └── styles/
│       │       ├── globals.css
│       │       └── components.css
│       ├── tailwind.config.js
│       ├── next.config.js
│       └── package.json
├── docs/
├── packages/
└── docker-compose.yml
```

---

## 📚 Kaynaklar

### **Best Practice Referansları**
- [Airbnb React/JSX Style Guide](https://github.com/airbnb/javascript/tree/master/react)
- [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)
- [Next.js File Conventions](https://nextjs.org/docs/app/building-your-application/routing/file-conventions)
- [React Component Naming](https://reactjs.org/docs/thinking-in-react.html)

### **Otomasyon Araçları**
- [ESLint](https://eslint.org/)
- [Prettier](https://prettier.io/)
- [Husky](https://typicode.github.io/husky/)
- [lint-staged](https://github.com/okonet/lint-staged)

---

## 🏆 Sonuç

Bu standartlara uyarak:
- ✅ **Profesyonel görünümlü** bir proje oluşturulur
- ✅ **Müşteri güveni** artar
- ✅ **Takım çalışması** kolaylaşır
- ✅ **Bakım ve geliştirme** maliyetleri düşer
- ✅ **Yeni geliştiriciler** kolay adapte olur

**Unutmayın:** Dosya isimlendirmesi, kod kalitesinin ilk göstergesidir!

---

*Oluşturulma: 21 Ekim 2025*
*Versiyon: 1.0.0*
*Proje: Tulumbak E-ticaret Platformu*