import { z } from 'zod'

// Category Schemas
export const createCategorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(120, 'Name must be less than 120 characters'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  parent_id: z.string().uuid().nullable().optional(),
  position: z.number().int().min(0, 'Position must be a non-negative integer').default(0),
  is_active: z.boolean().default(true)
})

export const updateCategorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(120, 'Name must be less than 120 characters').optional(),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens').optional(),
  parent_id: z.string().uuid().nullable().optional(),
  position: z.number().int().min(0, 'Position must be a non-negative integer').optional(),
  is_active: z.boolean().optional()
})

// Product Schemas
export const createProductSchema = z.object({
  type: z.enum(['simple', 'variable']).default('simple'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(200, 'Name must be less than 200 characters'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  category_id: z.string().uuid('Invalid category ID'),
  description: z.string().max(2000, 'Description must be less than 2000 characters').nullable().optional(),
  sku: z.string().regex(/^[A-Z0-9-]{3,32}$/, 'SKU must contain only uppercase letters, numbers, and hyphens (3-32 characters)').optional(),
  price: z.number().min(0, 'Price must be non-negative').nullable().optional(),
  stock_mode: z.enum(['product', 'variant']).default('product'),
  stock_qty: z.number().int().min(0, 'Stock quantity must be non-negative').nullable().optional(),
  images: z.array(z.object({
    url: z.string().url('Invalid image URL'),
    alt: z.string().max(200, 'Alt text must be less than 200 characters')
  })).optional(),
  tax_included: z.boolean().default(true),
  is_active: z.boolean().default(true)
})

export const updateProductSchema = z.object({
  type: z.enum(['simple', 'variable']).optional(),
  name: z.string().min(2, 'Name must be at least 2 characters').max(200, 'Name must be less than 200 characters').optional(),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens').optional(),
  category_id: z.string().uuid('Invalid category ID').optional(),
  description: z.string().max(2000, 'Description must be less than 2000 characters').nullable().optional(),
  sku: z.string().regex(/^[A-Z0-9-]{3,32}$/, 'SKU must contain only uppercase letters, numbers, and hyphens (3-32 characters)').optional(),
  price: z.number().min(0, 'Price must be non-negative').nullable().optional(),
  stock_mode: z.enum(['product', 'variant']).optional(),
  stock_qty: z.number().int().min(0, 'Stock quantity must be non-negative').nullable().optional(),
  images: z.array(z.object({
    url: z.string().url('Invalid image URL'),
    alt: z.string().max(200, 'Alt text must be less than 200 characters')
  })).optional(),
  tax_included: z.boolean().optional(),
  is_active: z.boolean().optional()
})

// Query Schemas
export const productQuerySchema = z.object({
  category: z.string().optional(),
  q: z.string().max(100, 'Search query must be less than 100 characters').optional(),
  min_price: z.number().min(0, 'Minimum price must be non-negative').optional(),
  max_price: z.number().min(0, 'Maximum price must be non-negative').optional(),
  page: z.coerce.number().int().min(1, 'Page must be a positive integer').default(1),
  per_page: z.coerce.number().int().min(1, 'Per page must be a positive integer').max(50, 'Per page must be less than 50').default(12),
  sort: z.enum(['price_asc', 'price_desc', 'newest', 'bestseller']).default('newest'),
  is_active: z.coerce.boolean().default(true)
})

// Helper function to validate and get errors
export function getValidationErrors(error: any): Record<string, string> {
  if (error instanceof z.ZodError) {
    const errors: Record<string, string> = {}
    error.errors.forEach((err) => {
      if (err.path.length > 0) {
        errors[err.path.join('.')] = err.message
      }
    })
    return errors
  }
  return { general: 'Validation failed' }
}