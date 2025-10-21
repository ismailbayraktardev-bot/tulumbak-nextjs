// API Types - Backend ile uyumlu
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

export interface ProductImage {
  url: string
  alt: string
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

export interface ProductSummary {
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

// Cart Types
export interface CartItem {
  id: string
  cart_id: string
  product_id: string
  variant: Record<string, any>
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
  updated_at: string
}

export interface Cart {
  id: string
  user_id?: string
  guest_cart_id?: string
  status: 'active' | 'abandoned' | 'converted'
  items: CartItem[]
  subtotal: number
  tax: number
  total: number
  currency: string
  expires_at?: string
  created_at: string
  updated_at: string
}

// Order Types
export interface Order {
  id: string
  user_id?: string
  cart_id: string
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'on_delivery' | 'delivered' | 'cancelled' | 'failed'
  subtotal: number
  tax: number
  shipping_cost: number
  discount: number
  grand_total: number
  currency: string
  
  // Customer info
  customer: {
    name: string
    email: string
    phone: string
  }
  
  // Address info
  shipping_address: {
    text: string
    city: string
    district: string
    lat?: number
    lng?: number
  }
  
  // Billing info
  billing: {
    type: 'individual' | 'corporate'
    tckn?: string
    vkn?: string
    company?: string
  }
  
  // Delivery info
  slot: {
    from: string
    to: string
  }
  
  // Payment info
  payment: {
    method: string
    status: 'pending' | 'initiated' | 'paid' | 'failed' | 'refunded'
    paytr_ref?: string
  }
  
  created_at: string
  updated_at: string
}

// Payment Types
export interface PaymentInitRequest {
  order_id: string
  return_url?: string
}

export interface PaymentInitResponse {
  success: boolean
  iframe_token?: string
  redirect_url?: string
  ref?: string
}

export interface PaymentStatusResponse {
  status: 'initiated' | 'paid' | 'failed'
  order_status: string
}

// Zone Types
export interface ZoneLookupRequest {
  address_text?: string
  lat?: number
  lng?: number
}

export interface ZoneLookupResponse {
  zone_match: boolean
  branch_id?: string
  branch_name?: string
  nearest_km?: number
  message?: string
}

export interface DeliverySlot {
  id: string
  from: string
  to: string
  date: string
  available: boolean
  max_orders?: number
  current_orders?: number
}

// Validation Types
export interface ValidationError {
  field: string
  message: string
}
