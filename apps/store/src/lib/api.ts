// import { ApiResponse, PaginatedResponse } from 'tulumbak-shared' // Will be used for type safety

import {
  mockCategories,
  mockProducts,
  getMockProductsByCategory,
  getMockProductBySlug,
  getMockFeaturedProducts,
  getMockCategoryBySlug,
  mockApiResponses
} from './mock-data'

// Development mode flag
const USE_MOCK_DATA = process.env.NODE_ENV === 'development' || process.env.USE_MOCK_DATA === 'true'

export async function apiGet<T>(path: string, revalidate = 60): Promise<T> {
  // Use mock data in development or when explicitly enabled
  if (USE_MOCK_DATA) {
    console.log(`🔧 Using mock data for: ${path}`)
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Return mock data based on path
    if (path === '/categories') {
      return mockApiResponses.categories as T
    }
    
    if (path === '/products') {
      return mockApiResponses.products as T
    }
    
    // Handle product detail
    if (path.startsWith('/products/') && path.length > 10) {
      const slug = path.replace('/products/', '')
      const product = getMockProductBySlug(slug)
      if (!product) {
        throw new Error(`Product not found: ${slug}`)
      }
      return {
        success: true,
        data: product
      } as T
    }
    
    // Handle category products
    if (path.includes('category=')) {
      const categoryMatch = path.match(/category=([^&]+)/)
      if (categoryMatch) {
        const categorySlug = categoryMatch[1]
        const products = getMockProductsByCategory(categorySlug)
        return {
          success: true,
          data: products,
          meta: {
            page: 1,
            per_page: products.length,
            total: products.length
          }
        } as T
      }
    }
    
    // Handle featured products
    if (path.includes('featured=true')) {
      const products = getMockFeaturedProducts()
      return {
        success: true,
        data: products,
        meta: {
          page: 1,
          per_page: products.length,
          total: products.length
        }
      } as T
    }
    
    // Default fallback
    throw new Error(`Mock data not available for: ${path}`)
  }

  // Real API call for production
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
  const res = await fetch(`${base}${path}`, {
    headers: { accept: 'application/json' },
    next: { revalidate }
  })
  if (!res.ok) throw new Error(`${res.status} GET ${path}`)
  return res.json() as Promise<T>
}

export async function apiPost<T>(path: string, data: unknown): Promise<T> {
  // Use mock data in development
  if (USE_MOCK_DATA) {
    console.log(`🔧 Using mock POST for: ${path}`)
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Return success response for most POST operations
    return {
      success: true,
      data: { id: `mock_${Date.now()}`, ...(data as Record<string, unknown>) }
    } as T
  }

  // Real API call
  const base = process.env.NEXT_PUBLIC_API_URL!
  const res = await fetch(`${base}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      accept: 'application/json'
    },
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error(`${res.status} POST ${path}`)
  return res.json() as Promise<T>
}

export async function apiPut<T>(path: string, data: unknown): Promise<T> {
  // Use mock data in development
  if (USE_MOCK_DATA) {
    console.log(`🔧 Using mock PUT for: ${path}`)
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return {
      success: true,
      data: { ...(data as Record<string, unknown>), updated_at: new Date().toISOString() }
    } as T
  }

  // Real API call
  const base = process.env.NEXT_PUBLIC_API_URL!
  const res = await fetch(`${base}${path}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      accept: 'application/json'
    },
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error(`${res.status} PUT ${path}`)
  return res.json() as Promise<T>
}

export async function apiDelete<T>(path: string): Promise<T> {
  // Use mock data in development
  if (USE_MOCK_DATA) {
    console.log(`🔧 Using mock DELETE for: ${path}`)
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return {
      success: true,
      data: { deleted: true }
    } as T
  }

  // Real API call
  const base = process.env.NEXT_PUBLIC_API_URL!
  const res = await fetch(`${base}${path}`, {
    method: 'DELETE',
    headers: { accept: 'application/json' }
  })
  if (!res.ok) throw new Error(`${res.status} DELETE ${path}`)
  return res.json() as Promise<T>
}
