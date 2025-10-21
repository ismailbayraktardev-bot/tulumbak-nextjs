# FE-04: Checkout Page Stitch Design Analysis

## Design System Analysis

### 1. Color Palette
```javascript
colors: {
  "primary": "#ec7813",           // Turuncu ana renk
  "background-light": "#f8f7f6",  // Açık bej arka plan
  "background-dark": "#221810",   // Koyu kahve arka plan
  "text-primary": "#1b140d",      // Koyu kahve metin
  "text-secondary": "#9a704c",    // Orta kahve metin
  "border-color": "#e7dacf",     // Açık bej border
}
```

### 2. Typography
```javascript
fontFamily: {
  "display": ["Manrope", "sans-serif"]  // Ana font family
}
```

### 3. Border Radius
```javascript
borderRadius: {
  "DEFAULT": "0.25rem",  // 4px
  "lg": "0.5rem",       // 8px
  "xl": "0.75rem",      // 12px
  "full": "9999px"       // Tam yuvarlak
}
```

### 4. Layout Structure
- **Container**: `px-4 md:px-10 lg:px-20`
- **Max Width**: `max-w-7xl`
- **Grid**: `grid-cols-1 lg:grid-cols-3`
- **Gap**: `gap-8`

## Component Analysis

### 1. Page Header
- **Title**: "Checkout" - `text-4xl font-black`
- **Progress Bar**: 3 adım (Shipping → Payment → Review)
- **Current Step**: Shipping (33% progress)

### 2. Shipping Form
- **Card**: Rounded-xl with border and shadow
- **Grid**: 2 column layout on desktop
- **Input Style**: 
  - Height: `h-14` (56px)
  - Border: `border-[#e7dacf]`
  - Focus: `ring-2 ring-primary/50`
  - Padding: `p-[15px]`

### 3. Form Fields
- **Full Name**: Full width (md:col-span-2)
- **Email**: Full width (md:col-span-2)
- **Address**: Full width (md:col-span-2)
- **City**: Half width
- **Postal Code**: Half width
- **Country**: Full width (md:col-span-2)

### 4. Order Summary
- **Sticky**: `sticky top-28`
- **Card**: Same styling as form card
- **Product Items**: Image + Name + Quantity + Price
- **Pricing**: Subtotal + Shipping + Taxes + Total

### 5. Button Styling
- **Primary Button**: 
  - Background: `bg-primary`
  - Text: `text-white`
  - Height: `h-12` (48px)
  - Min Width: `min-w-[180px]`
  - Hover: `hover:bg-primary/90`

## Mobile-First Considerations

### 1. Responsive Breakpoints
- **Mobile**: Default (single column)
- **Tablet**: `md:` (768px+)
- **Desktop**: `lg:` (1024px+)

### 2. Mobile Adaptations
- **Form Grid**: Single column on mobile
- **Button**: Full width on mobile
- **Order Summary**: Below form on mobile
- **Sticky**: Disabled on mobile

### 3. Touch Targets
- **Input Height**: 56px (touch-friendly)
- **Button Height**: 48px (touch-friendly)
- **Spacing**: Adequate spacing for touch

## Implementation Plan

### Phase 1: Design System Setup
1. **Update Tailwind Config**: Add Stitch colors and typography
2. **Create CSS Variables**: For consistent theming
3. **Update Global Styles**: Import Manrope font

### Phase 2: Component Implementation
1. **CheckoutForm**: New form component with Stitch styling
2. **OrderSummary**: Updated order summary with new design
3. **ProgressBar**: Step indicator component
4. **FormInputs**: Consistent input styling

### Phase 3: Page Integration
1. **Checkout Page**: Complete page restructure
2. **Form Validation**: Client-side validation
3. **State Management**: Form state handling
4. **Navigation**: Step navigation logic

## Technical Requirements

### 1. Dependencies
- **@tailwindcss/forms**: For form styling
- **@tailwindcss/container-queries**: For responsive containers
- **Manrope Font**: Google Fonts import

### 2. File Structure
```
apps/store/src/
├── app/
│   └── odeme/
│       └── page.tsx (updated)
├── components/
│   └── checkout/
│       ├── checkout-form.tsx (new)
│       ├── order-summary.tsx (updated)
│       ├── progress-bar.tsx (new)
│       └── form-inputs.tsx (new)
├── lib/
│   └── stitch-theme.ts (new)
└── styles/
    └── globals.css (updated)
```

### 3. State Management
- **Form State**: React useState for form data
- **Validation**: Client-side form validation
- **Navigation**: Step navigation state
- **Cart Integration**: Connect with existing cart store

## Success Criteria

### 1. Design Fidelity
- [ ] 100% Stitch design match
- [ ] All colors and typography correct
- [ ] All spacing and layout accurate
- [ ] Responsive behavior matches design

### 2. Functionality
- [ ] Form validation works
- [ ] Step navigation functional
- [ ] Cart integration working
- [ ] Mobile-first responsive

### 3. Performance
- [ ] Lighthouse score > 90
- [ ] Bundle size optimized
- [ ] Image optimization
- [ ] Fast load times

## Next Steps

1. **Setup Design System**: Update Tailwind config
2. **Implement Components**: Create new components
3. **Integrate Page**: Update checkout page
4. **Test & QA**: Comprehensive testing
5. **Deploy**: Production deployment

## Timeline Estimate
- **Design System Setup**: 0.5 gün
- **Component Implementation**: 2 gün
- **Page Integration**: 1 gün
- **Testing & QA**: 0.5 gün
- **Total**: 4 gün

## Notes
- Maintain mobile-first approach
- Preserve existing functionality
- Ensure accessibility compliance
- Keep performance optimized