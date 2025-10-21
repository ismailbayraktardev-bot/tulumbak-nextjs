// Storefront UI Types
export interface ProductCard {
  product: {
    id: string
    name: string
    slug: string
    image?: {
      url: string
      alt?: string
    }
    price_from: number
    price_to: number
    is_variable: boolean
  }
  ctaLabel?: string
}

export interface FilterState {
  category?: string
  weight?: number | null
  priceRange?: [number, number]
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'bestseller'
  page?: number
}

export interface CheckoutStep {
  id: string
  title: string
  description?: string
  completed: boolean
  current: boolean
}

export interface VariantOption {
  kind: 'weight' | 'serving'
  values: (number | string)[]
}

export interface VariantSelector {
  options: VariantOption[]
  selected: Record<string, string | number | undefined>
  onSelect: (next: Record<string, string | number | undefined>) => void
}

export interface HeroProps {
  title: string
  subtitle?: string
  cta: {
    label: string
    href: string
  }
  image: {
    src: string
    alt: string
  }
}

export interface CategoryTile {
  title: string
  href: string
  image: {
    src: string
    alt?: string
  }
}

export interface CategoryTilesProps {
  items: CategoryTile[]
}

export interface ProductGridProps {
  products: ProductCard['product'][]
  columns?: {
    sm: number
    md: number
    lg: number
  }
}

export interface FilterBarProps {
  categories: Array<{
    id: string
    name: string
    slug: string
  }>
  selectedCategory?: string
  weight?: number | null
  priceRange?: [number, number]
  onChange: (state: FilterState) => void
}

export interface AccordionSpecItem {
  title: string
  content: string
}

export interface AccordionSpecProps {
  items: AccordionSpecItem[]
}

export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

// Admin Types
export interface KPIStatCard {
  title: string
  value: string | number
  delta?: {
    value: number
    trend: 'up' | 'down' | 'neutral'
  }
  description?: string
}

export interface AdminDataTableColumn<T = any> {
  key: keyof T
  title: string
  sortable?: boolean
  render?: (value: any, row: T) => React.ReactNode
}

export interface AdminDataTableProps<T = any> {
  data: T[]
  columns: AdminDataTableColumn<T>[]
  loading?: boolean
  pagination?: {
    page: number
    perPage: number
    total: number
    onPageChange: (page: number) => void
  }
  actions?: {
    onEdit?: (row: T) => void
    onDelete?: (row: T) => void
    onView?: (row: T) => void
  }
}

export interface AdminFormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: React.ReactNode
  onSubmit?: () => void
  onCancel?: () => void
  loading?: boolean
}
