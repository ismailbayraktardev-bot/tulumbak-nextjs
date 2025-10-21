import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Security headers configuration
export const SECURITY_HEADERS = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-XSS-Protection': '1; mode=block',
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Resource-Policy': 'same-origin'
}

// CORS configuration
export const CORS_CONFIG = {
  development: {
    origins: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', 'http://localhost:3004'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    headers: ['Content-Type', 'Authorization', 'X-Requested-With']
  },
  production: {
    origins: process.env.ALLOWED_ORIGINS?.split(',') || [],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    headers: ['Content-Type', 'Authorization', 'X-Requested-With']
  }
}

// Input validation schemas
export const Schemas = {
  // User registration validation
  register: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
    phone: z.string()
      .regex(/^(\+90|0)?\s*([1-9]\d{2})\s*(\d{3})\s*(\d{2})\s*(\d{2})$/, 'Invalid Turkish phone number format')
  }),

  // User login validation
  login: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required')
  }),

  // Turkish ID validation
  tckn: z.string()
    .regex(/^[1-9]\d{10}$/, 'Invalid Turkish ID number format')
    .refine((tckn) => {
      // Basic TCKN validation algorithm
      let sum = 0
      for (let i = 0; i < 9; i++) {
        sum += parseInt(tckn[i]) * (7 - (i % 2))
      }
      const tenthDigit = (sum % 10).toString()
      const eleventhDigit = ((tckn.split('').slice(0, 9).reduce((acc, digit) => acc + parseInt(digit), 0) + parseInt(tenthDigit)) % 10).toString()
      return tckn[9] === tenthDigit && tckn[10] === eleventhDigit
    }, 'Invalid Turkish ID number'),

  // Address validation
  address: z.object({
    title: z.string().min(1, 'Address title is required').max(50, 'Address title must be less than 50 characters'),
    name: z.string().min(1, 'Recipient name is required').max(100, 'Name must be less than 100 characters'),
    phone: z.string().regex(/^(\+90|0)?\s*([1-9]\d{2})\s*(\d{3})\s*(\d{2})\s*(\d{2})$/, 'Invalid Turkish phone number format'),
    city: z.string().min(1, 'City is required').max(50, 'City must be less than 50 characters'),
    district: z.string().min(1, 'District is required').max(50, 'District must be less than 50 characters'),
    neighborhood: z.string().min(1, 'Neighborhood is required').max(50, 'Neighborhood must be less than 50 characters'),
    addressLine: z.string().min(5, 'Address line must be at least 5 characters').max(255, 'Address line must be less than 255 characters'),
    postalCode: z.string().regex(/^\d{5}$/, 'Invalid postal code format'),
    tckn: z.string().optional(),
    tcknType: z.enum(['individual', 'corporate']).optional(),
    companyName: z.string().optional(),
    taxNumber: z.string().regex(/^\d{10}$/, 'Invalid tax number format').optional()
  }),

  // Product search validation
  search: z.object({
    query: z.string().min(1, 'Search query is required').max(100, 'Search query must be less than 100 characters'),
    category: z.string().optional(),
    minPrice: z.number().min(0, 'Minimum price cannot be negative').optional(),
    maxPrice: z.number().min(0, 'Maximum price cannot be negative').optional(),
    sortBy: z.enum(['name', 'price', 'rating', 'created_at']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    page: z.number().int().min(1, 'Page must be at least 1').optional(),
    limit: z.number().int().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').optional()
  }),

  // Product creation validation (Admin)
  productCreate: z.object({
    name: z.string().min(1, 'Product name is required').max(255, 'Product name must be less than 255 characters'),
    description: z.string().max(2000, 'Product description must be less than 2000 characters').optional(),
    price: z.number().min(0, 'Price must be positive').max(999999.99, 'Price cannot exceed 999,999.99'),
    category_id: z.number().int().min(1, 'Valid category ID is required'),
    stock: z.number().int().min(0, 'Stock cannot be negative').max(999999, 'Stock cannot exceed 999,999').default(0),
    is_active: z.boolean().default(true),
    image_url: z.string().url('Invalid image URL format').optional(),
    sku: z.string().max(100, 'SKU must be less than 100 characters').optional(),
    barcode: z.string().max(50, 'Barcode must be less than 50 characters').optional(),
    weight: z.number().min(0, 'Weight cannot be negative').max(999999, 'Weight cannot exceed 999,999').optional(),
    dimensions: z.string().max(100, 'Dimensions must be less than 100 characters').optional()
  }),

  // Product update validation (Admin)
  productUpdate: z.object({
    name: z.string().min(1, 'Product name is required').max(255, 'Product name must be less than 255 characters').optional(),
    description: z.string().max(2000, 'Product description must be less than 2000 characters').optional(),
    price: z.number().min(0, 'Price must be positive').max(999999.99, 'Price cannot exceed 999,999.99').optional(),
    category_id: z.number().int().min(1, 'Valid category ID is required').optional(),
    stock: z.number().int().min(0, 'Stock cannot be negative').max(999999, 'Stock cannot exceed 999,999').optional(),
    is_active: z.boolean().optional(),
    image_url: z.string().url('Invalid image URL format').optional(),
    sku: z.string().max(100, 'SKU must be less than 100 characters').optional(),
    barcode: z.string().max(50, 'Barcode must be less than 50 characters').optional(),
    weight: z.number().min(0, 'Weight cannot be negative').max(999999, 'Weight cannot exceed 999,999').optional(),
    dimensions: z.string().max(100, 'Dimensions must be less than 100 characters').optional()
  }),

  // Category creation validation (Admin)
  categoryCreate: z.object({
    name: z.string().min(1, 'Category name is required').max(100, 'Category name must be less than 100 characters'),
    description: z.string().max(500, 'Category description must be less than 500 characters').optional(),
    image_url: z.string().url('Invalid image URL format').optional(),
    parent_id: z.number().int().min(1, 'Valid parent category ID is required').optional(),
    sort_order: z.number().int().min(0, 'Sort order cannot be negative').default(0),
    is_active: z.boolean().default(true)
  }),

  // Category update validation (Admin)
  categoryUpdate: z.object({
    name: z.string().min(1, 'Category name is required').max(100, 'Category name must be less than 100 characters').optional(),
    description: z.string().max(500, 'Category description must be less than 500 characters').optional(),
    image_url: z.string().url('Invalid image URL format').optional(),
    parent_id: z.number().int().min(1, 'Valid parent category ID is required').optional(),
    sort_order: z.number().int().min(0, 'Sort order cannot be negative').optional(),
    is_active: z.boolean().optional()
  }),

  // Order status update validation (Admin)
  orderStatusUpdate: z.object({
    status: z.enum(['pending', 'confirmed', 'preparing', 'ready', 'shipped', 'delivered', 'cancelled'], {
      errorMap: (issue, ctx) => ({
        message: 'Status must be one of: pending, confirmed, preparing, ready, shipped, delivered, cancelled'
      })
    }),
    note: z.string().max(500, 'Note must be less than 500 characters').optional(),
    branch_id: z.number().int().min(1, 'Valid branch ID is required').optional()
  }),

  // Branch creation validation (Admin)
  branchCreate: z.object({
    name: z.string().min(1, 'Branch name is required').max(100, 'Branch name must be less than 100 characters'),
    address: z.string().min(5, 'Address must be at least 5 characters').max(255, 'Address must be less than 255 characters'),
    phone: z.string().regex(/^(\+90|0)?\s*([1-9]\d{2})\s*(\d{3})\s*(\d{2})\s*(\d{2})$/, 'Invalid Turkish phone number format'),
    city: z.string().min(1, 'City is required').max(50, 'City must be less than 50 characters'),
    district: z.string().min(1, 'District is required').max(50, 'District must be less than 50 characters'),
    email: z.string().email('Invalid email format').optional(),
    working_hours: z.string().max(100, 'Working hours must be less than 100 characters').optional(),
    is_active: z.boolean().default(true)
  }),

  // Branch update validation (Admin)
  branchUpdate: z.object({
    name: z.string().min(1, 'Branch name is required').max(100, 'Branch name must be less than 100 characters').optional(),
    address: z.string().min(5, 'Address must be at least 5 characters').max(255, 'Address must be less than 255 characters').optional(),
    phone: z.string().regex(/^(\+90|0)?\s*([1-9]\d{2})\s*(\d{3})\s*(\d{2})\s*(\d{2})$/, 'Invalid Turkish phone number format').optional(),
    city: z.string().min(1, 'City is required').max(50, 'City must be less than 50 characters').optional(),
    district: z.string().min(1, 'District is required').max(50, 'District must be less than 50 characters').optional(),
    email: z.string().email('Invalid email format').optional(),
    working_hours: z.string().max(100, 'Working hours must be less than 100 characters').optional(),
    is_active: z.boolean().optional()
  }),

  // Zone lookup validation
  zoneLookup: z.object({
    city: z.string().min(1, 'City is required').max(50, 'City must be less than 50 characters'),
    district: z.string().min(1, 'District is required').max(50, 'District must be less than 50 characters'),
    postal_code: z.string().regex(/^\d{5}$/, 'Invalid postal code format').optional(),
    neighborhood: z.string().max(50, 'Neighborhood must be less than 50 characters').optional(),
    address_line: z.string().max(255, 'Address line must be less than 255 characters').optional()
  }),

  // Zone creation validation (Admin)
  zoneCreate: z.object({
    name: z.string().min(1, 'Zone name is required').max(100, 'Zone name must be less than 100 characters'),
    city: z.string().min(1, 'City is required').max(50, 'City must be less than 50 characters'),
    district: z.string().min(1, 'District is required').max(50, 'District must be less than 50 characters'),
    postal_codes: z.array(z.string().regex(/^\d{5}$/, 'Invalid postal code format')).min(1, 'At least one postal code is required').optional(),
    branch_id: z.number().int().min(1, 'Valid branch ID is required').optional(),
    delivery_fee: z.number().min(0, 'Delivery fee cannot be negative').default(0),
    estimated_delivery_time: z.number().int().min(1, 'Estimated delivery time must be at least 1 minute').default(60),
    min_order_amount: z.number().min(0, 'Minimum order amount cannot be negative').default(0),
    is_active: z.boolean().default(true)
  }),

  // Zone update validation (Admin)
  zoneUpdate: z.object({
    name: z.string().min(1, 'Zone name is required').max(100, 'Zone name must be less than 100 characters').optional(),
    city: z.string().min(1, 'City is required').max(50, 'City must be less than 50 characters').optional(),
    district: z.string().min(1, 'District is required').max(50, 'District must be less than 50 characters').optional(),
    postal_codes: z.array(z.string().regex(/^\d{5}$/, 'Invalid postal code format')).min(1, 'At least one postal code is required').optional(),
    branch_id: z.number().int().min(1, 'Valid branch ID is required').optional(),
    delivery_fee: z.number().min(0, 'Delivery fee cannot be negative').optional(),
    estimated_delivery_time: z.number().int().min(1, 'Estimated delivery time must be at least 1 minute').optional(),
    min_order_amount: z.number().min(0, 'Minimum order amount cannot be negative').optional(),
    is_active: z.boolean().optional()
  })
}

// Input sanitization
export class InputSanitizer {
  static sanitizeString(input: string): string {
    return input
      .trim()
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/<[^>]*>/g, '') // Remove all HTML tags
      .replace(/javascript:/gi, '') // Remove javascript protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
  }

  static sanitizeEmail(email: string): string {
    return email.toLowerCase().trim()
  }

  static sanitizePhone(phone: string): string {
    return phone.replace(/\s+/g, '').replace(/[()-]/g, '')
  }

  static sanitizeNumeric(input: string): number {
    const num = parseInt(input.replace(/[^\d]/g, ''))
    return isNaN(num) ? 0 : num
  }
}

// SQL Injection prevention
export const SQL_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
  /(\b(OR|AND)\s+\w+\s*=\s*\w+)/i,
  /(--|#|\/\*|\*\/)/i,
  /(\bWHERE\b.*\bOR\b.*\b1\s*=\s*1)/i,
  /(\bWHERE\b.*\bAND\b.*\b1\s*=\s*1)/i
]

// XSS prevention patterns
export const XSS_PATTERNS = [
  /<script[^>]*>.*?<\/script>/gi,
  /<iframe[^>]*>.*?<\/iframe>/gi,
  /<object[^>]*>.*?<\/object>/gi,
  /<embed[^>]*>.*?<\/embed>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<img[^>]*src[^>]*javascript:/gi
]

// Security validation functions
export function validateInput(input: string, type: 'string' | 'email' | 'phone' | 'numeric' | 'sql' | 'xss' = 'string'): boolean {
  const sanitized = InputSanitizer.sanitizeString(input)

  switch (type) {
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitized)
    case 'phone':
      return /^(\+90|0)?\s*([1-9]\d{2})\s*(\d{3})\s*(\d{2})\s*(\d{2})$/.test(sanitized)
    case 'numeric':
      return /^\d+$/.test(sanitized)
    case 'sql':
      return !SQL_PATTERNS.some(pattern => pattern.test(input))
    case 'xss':
      return !XSS_PATTERNS.some(pattern => pattern.test(input))
    default:
      return sanitized.length > 0 && sanitized.length <= 1000
  }
}

// Rate limiting for suspicious activities
export const SECURITY_RATE_LIMITS = {
  login: { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // 5 attempts per 15 minutes
  register: { windowMs: 60 * 60 * 1000, maxRequests: 3 }, // 3 attempts per hour
  passwordReset: { windowMs: 60 * 60 * 1000, maxRequests: 3 }, // 3 attempts per hour
  search: { windowMs: 60 * 1000, maxRequests: 30 }, // 30 searches per minute
  upload: { windowMs: 60 * 1000, maxRequests: 10 } // 10 uploads per minute
}

// Add security headers to response
export function addSecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  return response
}

// CORS middleware
export function handleCORS(request: NextRequest, response: NextResponse): NextResponse {
  const origin = request.headers.get('origin')
  const config = CORS_CONFIG[process.env.NODE_ENV as 'development' | 'production'] || CORS_CONFIG.development

  // Set CORS headers
  if (origin && config.origins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
  }

  response.headers.set('Access-Control-Allow-Methods', config.methods.join(', '))
  response.headers.set('Access-Control-Allow-Headers', config.headers.join(', '))
  response.headers.set('Access-Control-Allow-Credentials', config.credentials.toString())
  response.headers.set('Access-Control-Max-Age', '86400') // 24 hours

  return response
}

// Security event logging
export function logSecurityEvent(
  event: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  details: {
    ip?: string
    userAgent?: string
    userId?: string
    endpoint?: string
    details?: string
    [key: string]: any
  }
) {
  const securityLog = {
    timestamp: new Date().toISOString(),
    event,
    severity,
    ...details
  }

  // Log to console (in production, this would go to a security monitoring system)
  console.warn('SECURITY EVENT:', JSON.stringify(securityLog))

  // In production, you might want to:
  // - Send to SIEM system
  // - Send alerts to security team
  // - Block IP if critical
  // - Store in security logs database
}

// Input validation middleware
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  try {
    const validated = schema.parse(data)
    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(err => err.message).join(', ')
      return { success: false, error: errorMessage }
    }
    return { success: false, error: 'Invalid input data' }
  }
}