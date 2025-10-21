<!-- 4b99aba9-92c7-41b2-be4e-9b7d87bf02c9 8a74b418-09c5-4422-a2b0-643523079410 -->
# FE-02 Sprint: Storefront Polish + Admin Data Tables

## Phase 0: TypeScript & Dev Experience Fixes (BLOCKER)

### 0.1 Fix TypeScript Project References

**Problem**: `packages/config` and `packages/shared` missing tsconfig.json causing build errors

**Fix `packages/config/tsconfig.json`**:

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "composite": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**Fix `packages/shared/tsconfig.json`**:

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "composite": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**Fix `packages/ui/tsconfig.json`** - Remove `noEmit` conflict:

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "composite": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 0.2 Fix Next.js Config Warnings

**Update `apps/store/next.config.ts` and `apps/admin-dashboard/next.config.ts`**:

- Remove deprecated `swcMinify: true` (default in Next.js 15)
- Rename `experimental.serverComponentsExternalPackages` → `serverExternalPackages`
```typescript
const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  serverExternalPackages: ['pg', 'redis'], // Renamed from experimental
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: 'cdn.tulumbak.com' },
    ],
    formats: ['image/webp', 'image/avif'],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};
```


### 0.3 Clean Build Test

```bash
pnpm install
pnpm --filter packages/ui build
pnpm --filter packages/shared build
pnpm --filter packages/config build
pnpm validate-ports
```

---

## Phase 1: Track-S (Storefront Polish + Live API)

### 1.1 Next Image Migration - Critical Components

**Update `apps/store/src/components/storefront/product-card.tsx`**:

```typescript
import Image from 'next/image'

// Replace <img> with:
<Image
  src={product.image?.url || '/media/placeholder.jpg'}
  alt={product.image?.alt || product.name}
  width={400}
  height={300}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
  priority={false}
/>
```

**Update `apps/store/src/components/storefront/hero.tsx`**:

```typescript
<Image
  src={image.src}
  alt={image.alt}
  fill
  sizes="100vw"
  priority={true} // LCP optimization
  className="object-cover"
/>
```

**Update `apps/store/src/components/storefront/category-tiles.tsx`**:

```typescript
<Image
  src={item.image.src}
  alt={item.image.alt}
  width={600}
  height={450}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
/>
```

**Update `apps/store/src/app/urun/[slug]/page.tsx`** - PDP main image:

```typescript
<Image
  src={product.images[0]?.url}
  alt={product.images[0]?.alt || product.name}
  fill
  sizes="(max-width: 768px) 100vw, 50vw"
  priority={true}
  className="object-cover"
/>
```

### 1.2 Responsive Grid & Touch Improvements

**Update `apps/store/src/components/storefront/product-grid.tsx`**:

```typescript
// Enhanced grid with better breakpoints
const gridClasses = `
  grid gap-4 md:gap-6 lg:gap-8
  grid-cols-1
  sm:grid-cols-${columns.sm}
  md:grid-cols-${columns.md}
  lg:grid-cols-${columns.lg}
  touch-action-manipulation
`

// Add to ProductCard wrapper
className="group cursor-pointer tap-highlight-transparent min-h-[44px]"
```

### 1.3 Hover & Transition Polish

**Update `apps/store/src/components/storefront/product-card.tsx`**:

```typescript
<div className="group relative overflow-hidden rounded-12 bg-white shadow-card transition-all duration-250 hover:shadow-lg hover:-translate-y-1">
  {/* Image container */}
  <div className="relative aspect-[3/2] overflow-hidden bg-gray-100">
    <Image ... className="transition-transform duration-300 group-hover:scale-105" />
  </div>
  
  {/* Content with subtle hover opacity */}
  <div className="p-4 transition-opacity duration-200 group-hover:opacity-90">
    ...
  </div>
</div>
```

### 1.4 Live API Integration - PLP

**Update `apps/store/src/app/kategori/[slug]/page.tsx`**:

```typescript
// Replace mock products with live API call
const { data: products, meta } = await apiGet<PaginatedResponse<ProductSummary>>(
  `/products?category=${slug}&page=${page}&per_page=12&sort=${sort}${weight ? `&weight=${weight}` : ''}${min_price ? `&min_price=${min_price}` : ''}${max_price ? `&max_price=${max_price}` : ''}`,
  60 // revalidate 60s
)

// Handle empty state
if (!products || products.length === 0) {
  return <EmptyState ... />
}
```

### 1.5 Live API Integration - PDP

**Update `apps/store/src/app/urun/[slug]/page.tsx`**:

```typescript
// Replace mock import with live API
const product = await apiGet<ApiResponse<Product>>(
  `/products/${slug}`,
  60
)

if (!product.data) {
  return <NotFound />
}

// Use product.data instead of mock
const { name, images, price_from, variants, description } = product.data
```

### 1.6 Enhanced Skeleton & Empty States

**Create `apps/store/src/components/storefront/skeletons.tsx`**:

```typescript
export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/2] bg-gray-200 rounded-12" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  )
}

export function ProductGridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}
```

**Update `apps/store/src/app/kategori/[slug]/page.tsx`**:

```typescript
import { Suspense } from 'react'
import { ProductGridSkeleton } from '@/components/storefront/skeletons'

export default function PLP({ params, searchParams }: PageProps) {
  return (
    <Suspense fallback={<ProductGridSkeleton />}>
      <PLPContent params={params} searchParams={searchParams} />
    </Suspense>
  )
}
```

---

## Phase 2: Track-A (Admin Dashboard Data Tables)

### 2.1 TanStack Table Wrapper Implementation

**Create `apps/admin-dashboard/src/components/admin/data-table/use-data-table.tsx`**:

```typescript
'use client'
import { 
  useReactTable, 
  getCoreRowModel, 
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
} from '@tanstack/react-table'
import { useState } from 'react'

export function useDataTable<T>(data: T[], columns: ColumnDef<T>[]) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return table
}
```

**Update `apps/admin-dashboard/src/components/admin/admin-data-table.tsx`**:

```typescript
'use client'
import { flexRender } from '@tanstack/react-table'
import { useDataTable } from './data-table/use-data-table'
import { Button, Input } from 'tulumbak-ui'
import { ChevronDown, Search } from 'lucide-react'

export function AdminDataTable<T>({ data, columns, loading }: AdminDataTableProps<T>) {
  const table = useDataTable(data, columns)
  
  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <div className="flex items-center justify-between">
        <Input
          placeholder="Ara..."
          icon={<Search className="h-4 w-4" />}
          onChange={(e) => table.setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />
        
        {/* Column Visibility Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Kolonlar <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {table.getAllColumns()
              .filter(col => col.getCanHide())
              .map(col => (
                <DropdownMenuCheckboxItem
                  key={col.id}
                  checked={col.getIsVisible()}
                  onCheckedChange={col.toggleVisibility}
                >
                  {col.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id} className="px-4 py-3 text-left">
                    {header.isPlaceholder ? null : (
                      <div 
                        className={header.column.getCanSort() ? 'cursor-pointer select-none' : ''}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: ' 🔼',
                          desc: ' 🔽',
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} / {table.getFilteredRowModel().rows.length} satır seçili
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Önceki
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Sonraki
          </Button>
        </div>
      </div>
    </div>
  )
}
```

### 2.2 Products Page - Live Data Integration

**Update `apps/admin-dashboard/src/app/products/page.tsx`**:

```typescript
import { apiGet } from '@/lib/api'
import { AdminDataTable } from '@/components/admin/admin-data-table'
import { ColumnDef } from '@tanstack/react-table'
import { Badge, Button } from 'tulumbak-ui'
import Image from 'next/image'

type Product = {
  id: string
  name: string
  category: string
  price: string
  stock: number
  status: 'active' | 'inactive'
}

export default async function ProductsPage() {
  const { data: products } = await apiGet<ApiResponse<Product[]>>('/products', 30)
  
  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: 'name',
      header: 'Ürün Adı',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Image src={row.original.image} alt="" width={40} height={40} className="rounded" />
          <span>{row.getValue('name')}</span>
        </div>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Kategori',
    },
    {
      accessorKey: 'price',
      header: 'Fiyat',
      cell: ({ row }) => `₺${row.getValue('price')}`,
    },
    {
      accessorKey: 'stock',
      header: 'Stok',
    },
    {
      accessorKey: 'status',
      header: 'Durum',
      cell: ({ row }) => (
        <Badge variant={row.getValue('status') === 'active' ? 'success' : 'secondary'}>
          {row.getValue('status') === 'active' ? 'Aktif' : 'Pasif'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <Button variant="ghost" size="sm">Düzenle</Button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Ürünler</h1>
        <Button>Yeni Ürün</Button>
      </div>
      <AdminDataTable data={products} columns={columns} />
    </div>
  )
}
```

### 2.3 Categories Page - Live Data Integration

**Similar structure to Products page** with live `/categories` API endpoint

---

## Phase 3: RHF + Zod Setup (Checkout Foundation)

### 3.1 Install Dependencies (already done)

```bash
pnpm add react-hook-form zod @hookform/resolvers
```

### 3.2 Create Form Provider

**Create `apps/store/src/lib/form/checkout-form-provider.tsx`**:

```typescript
'use client'
import { createContext, useContext, useState } from 'react'
import { UseFormReturn, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// Checkout form schema
const checkoutSchema = z.object({
  contact: z.object({
    email: z.string().email('Geçerli bir email girin'),
    phone: z.string().min(10, 'Telefon numarası en az 10 karakter olmalı'),
  }),
  address: z.object({
    street: z.string().min(5, 'Adres en az 5 karakter olmalı'),
    city: z.string().min(2, 'Şehir gerekli'),
    postalCode: z.string().min(5, 'Posta kodu gerekli'),
  }),
  billing: z.object({
    type: z.enum(['individual', 'corporate']),
    name: z.string().min(2, 'İsim gerekli'),
    taxId: z.string().optional(),
  }),
})

type CheckoutFormData = z.infer<typeof checkoutSchema>

const CheckoutFormContext = createContext<UseFormReturn<CheckoutFormData> | null>(null)

export function CheckoutFormProvider({ children }: { children: React.ReactNode }) {
  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    mode: 'onBlur',
  })

  return (
    <CheckoutFormContext.Provider value={form}>
      {children}
    </CheckoutFormContext.Provider>
  )
}

export function useCheckoutForm() {
  const context = useContext(CheckoutFormContext)
  if (!context) throw new Error('useCheckoutForm must be used within CheckoutFormProvider')
  return context
}
```

### 3.3 Update Checkout Page

**Update `apps/store/src/app/odeme/page.tsx`**:

```typescript
import { CheckoutFormProvider } from '@/lib/form/checkout-form-provider'
import { CheckoutSteps } from '@/components/storefront/checkout-steps'

export default function CheckoutPage() {
  return (
    <CheckoutFormProvider>
      <div className="min-h-screen bg-tulumbak-beige">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-serif font-bold mb-8">Siparişi Tamamla</h1>
          <CheckoutSteps />
        </main>
        <Footer />
      </div>
    </CheckoutFormProvider>
  )
}
```

### 3.4 Connect Form to Steps

**Update `apps/store/src/components/storefront/checkout-form.tsx`**:

```typescript
'use client'
import { useCheckoutForm } from '@/lib/form/checkout-form-provider'
import { Input } from 'tulumbak-ui'

export function CheckoutForm() {
  const { register, formState: { errors } } = useCheckoutForm()

  return (
    <div className="space-y-4">
      <div>
        <Input
          {...register('contact.email')}
          placeholder="Email"
          type="email"
        />
        {errors.contact?.email && (
          <p className="text-sm text-red-600 mt-1">{errors.contact.email.message}</p>
        )}
      </div>
      
      <div>
        <Input
          {...register('contact.phone')}
          placeholder="Telefon"
        />
        {errors.contact?.phone && (
          <p className="text-sm text-red-600 mt-1">{errors.contact.phone.message}</p>
        )}
      </div>
    </div>
  )
}
```

---

## Phase 4: Final Validation & Testing

### 4.1 Build Test

```bash
pnpm validate-ports
pnpm --filter apps/store build
pnpm --filter apps/admin-dashboard build
```

### 4.2 Manual Testing Checklist

- [ ] Storefront: All images load with Next Image
- [ ] Storefront: PLP shows live products from API
- [ ] Storefront: PDP shows live product details
- [ ] Storefront: Skeleton states appear during loading
- [ ] Admin: Products table shows live data with sorting
- [ ] Admin: Categories table functional
- [ ] Admin: Column visibility toggle works
- [ ] Checkout: Form validation shows errors
- [ ] TypeScript: No build errors
- [ ] ESLint: Clean build

### 4.3 Performance Metrics

- [ ] Lighthouse LCP < 2.5s on Home
- [ ] Lighthouse LCP < 2.5s on PDP
- [ ] No console errors
- [ ] Mobile responsive (test 375px, 768px, 1024px)

---

## Acceptance Criteria (PRD Aligned)

### Storefront (@storefront_sections.md)

- [x] Next Image migration complete (Hero, ProductCard, CategoryTiles, PDP)
- [x] Responsive grids with proper breakpoints
- [x] Hover/transition polish (250ms, opacity + lift)
- [x] Skeleton & empty states active
- [x] PLP live API integration
- [x] PDP live API integration

### Admin Dashboard (@admin_dashboard_brief.md)

- [x] TanStack Table MVP with 5 features (pagination, sort, search, column visibility, row selection)
- [x] Products page live data
- [x] Categories page live data

### Checkout (@checkout_ux_prd.md)

- [x] RHF + Zod setup complete
- [x] Provider & form state connected
- [x] Basic validation working

### Dev Experience (@frontend_architecture.md)

- [x] TypeScript strict mode active, no errors
- [x] ESLint clean build
- [x] Port protection system working

### To-dos

- [ ] Fix TypeScript config errors (packages/config, packages/shared tsconfig.json)
- [ ] Fix Next.js config warnings (remove swcMinify, rename serverComponentsExternalPackages)
- [ ] Migrate critical components to Next Image (ProductCard, Hero, CategoryTiles, PDP)
- [ ] Update ProductGrid with responsive breakpoints and touch improvements
- [ ] Add hover/transition polish to ProductCard (250ms, shadow, lift)
- [ ] Replace mock products with live API in PLP (kategori/[slug]/page.tsx)
- [ ] Replace mock products with live API in PDP (urun/[slug]/page.tsx)
- [ ] Enhance skeleton & empty states with Suspense boundaries
- [ ] Implement TanStack Table wrapper with sorting, filtering, pagination
- [ ] Update Products page with live API data and TanStack Table
- [ ] Update Categories page with live API data and TanStack Table
- [ ] Create CheckoutFormProvider with RHF + Zod schema
- [ ] Connect checkout form to RHF provider with validation
- [ ] Run build tests for store and admin-dashboard
- [ ] Complete manual testing checklist and performance metrics