// Database Types
export interface Category {
  id: string
  name: string
  slug: string
  parent_id: string | null
  position: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  type: 'simple' | 'variable'
  name: string
  slug: string
  category_id: string
  description: string | null
  sku: string
  price: number | null
  stock_mode: 'product' | 'variant'
  stock_qty: number | null
  images: ProductImage[] | null
  tax_included: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ProductImage {
  url: string
  alt: string
}

export interface ProductSummary {
  id: string
  name: string
  slug: string
  image: ProductImage | null
  price_from: number
  price_to: number
  is_variable: boolean
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    fields?: Record<string, string>
  }
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  meta: {
    page: number
    per_page: number
    total: number
    total_pages: number
  }
}

// Input Types
export interface CreateCategoryInput {
  name: string
  slug?: string
  parent_id?: string | null
  position?: number
  is_active?: boolean
}

export interface UpdateCategoryInput {
  name?: string
  slug?: string
  parent_id?: string | null
  position?: number
  is_active?: boolean
}

export interface CreateProductInput {
  type?: 'simple' | 'variable'
  name: string
  slug?: string
  category_id: string
  description?: string
  sku?: string
  price?: number
  stock_mode?: 'product' | 'variant'
  stock_qty?: number
  images?: ProductImage[]
  tax_included?: boolean
  is_active?: boolean
}

export interface UpdateProductInput {
  type?: 'simple' | 'variable'
  name?: string
  slug?: string
  category_id?: string
  description?: string
  sku?: string
  price?: number
  stock_mode?: 'product' | 'variant'
  stock_qty?: number
  images?: ProductImage[]
  tax_included?: boolean
  is_active?: boolean
}

// Query Types
export interface ProductQuery {
  category?: string
  q?: string
  min_price?: number
  max_price?: number
  page?: number
  per_page?: number
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'bestseller'
  is_active?: boolean
}

// Validation Types
export interface ValidationError {
  field: string
  message: string
}