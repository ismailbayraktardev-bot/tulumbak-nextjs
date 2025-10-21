import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/middleware'
import { pool } from '@/lib/postgres'
import { validateRequest, Schemas } from '@/lib/security'
import { ApiAnalytics } from '@/lib/monitoring'

// GET /api/v1/admin/products - List all products (Admin)
export async function GET(request: NextRequest) {
  return withAdminAuth(request, async (req, user) => {
    const startTime = performance.now()

    try {
      const { searchParams } = new URL(req.url)
      const page = parseInt(searchParams.get('page') || '1')
      const limit = parseInt(searchParams.get('limit') || '20')
      const category_id = searchParams.get('category_id')
      const search = searchParams.get('search')
      const status = searchParams.get('status')
      const sort_by = searchParams.get('sort_by') || 'created_at'
      const sort_order = searchParams.get('sort_order') || 'DESC'

      const offset = (page - 1) * limit

      // Build WHERE clause
      const whereConditions = []
      const queryParams = []
      let paramIndex = 1

      if (category_id) {
        whereConditions.push(`p.category_id = $${paramIndex++}`)
        queryParams.push(category_id)
      }

      if (search) {
        whereConditions.push(`(p.name ILIKE $${paramIndex++} OR p.description ILIKE $${paramIndex++})`)
        queryParams.push(`%${search}%`, `%${search}%`)
      }

      if (status === 'active') {
        whereConditions.push(`p.is_active = true`)
      } else if (status === 'inactive') {
        whereConditions.push(`p.is_active = false`)
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

      // Validate sort_by parameter
      const allowedSortFields = ['id', 'name', 'price', 'stock', 'is_active', 'created_at', 'updated_at']
      const validSortBy = allowedSortFields.includes(sort_by) ? sort_by : 'created_at'
      const validSortOrder = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM products p
        ${whereClause}
      `

      const countResult = await pool.query(countQuery, queryParams)
      const total = parseInt(countResult.rows[0].total)

      // Get products with pagination
      const productsQuery = `
        SELECT
          p.*,
          c.name as category_name,
          COALESCE(SUM(oi.quantity), 0) as total_sold
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN order_items oi ON p.id = oi.product_id
        ${whereClause}
        GROUP BY p.id, c.name
        ORDER BY p.${validSortBy} ${validSortOrder}
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
      `

      queryParams.push(limit, offset)
      const productsResult = await pool.query(productsQuery, queryParams)

      // Get low stock products count
      const lowStockQuery = `
        SELECT COUNT(*) as low_stock_count
        FROM products
        WHERE stock < 10 AND is_active = true
      `
      const lowStockResult = await pool.query(lowStockQuery)
      const lowStockCount = parseInt(lowStockResult.rows[0].low_stock_count)

      const response = {
        success: true,
        data: {
          products: productsResult.rows,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNext: page < Math.ceil(total / limit),
            hasPrev: page > 1
          },
          filters: {
            category_id: category_id || null,
            search: search || null,
            status: status || null,
            sort_by: validSortBy,
            sort_order: validSortOrder
          },
          stats: {
            totalProducts: total,
            lowStockProducts: lowStockCount,
            activeProducts: productsResult.rows.filter(p => p.is_active).length,
            inactiveProducts: productsResult.rows.filter(p => !p.is_active).length
          }
        }
      }

      // Record analytics
      const duration = performance.now() - startTime
      ApiAnalytics.recordEndpointAccess('/api/v1/admin/products', duration, true)

      return NextResponse.json(response, {
        headers: {
          'X-Response-Time': `${Math.round(duration)}ms`
        }
      })

    } catch (error) {
      console.error('Admin products fetch error:', error)

      const duration = performance.now() - startTime
      ApiAnalytics.recordEndpointAccess('/api/v1/admin/products', duration, false)

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to fetch products'
          }
        },
        { status: 500 }
      )
    }
  })
}

// POST /api/v1/admin/products - Create new product (Admin)
export async function POST(request: NextRequest) {
  return withAdminAuth(request, async (req, user) => {
    const startTime = performance.now()

    try {
      const body = await req.json()

      // Validate required fields
      const validation = validateRequest(Schemas.productCreate, body)
      if (!validation.success) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid input data',
              details: validation.error
            }
          },
          { status: 400 }
        )
      }

      const {
        name,
        description,
        price,
        category_id,
        stock = 0,
        is_active = true,
        image_url,
        sku,
        barcode,
        weight,
        dimensions
      } = body

      // Check if category exists
      const categoryCheck = await pool.query(
        'SELECT id FROM categories WHERE id = $1 AND is_active = true',
        [category_id]
      )

      if (categoryCheck.rows.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'CATEGORY_NOT_FOUND',
              message: 'Category not found or inactive'
            }
          },
          { status: 404 }
        )
      }

      // Check if SKU already exists
      if (sku) {
        const skuCheck = await pool.query(
          'SELECT id FROM products WHERE sku = $1',
          [sku]
        )

        if (skuCheck.rows.length > 0) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'SKU_EXISTS',
                message: 'Product SKU already exists'
              }
            },
            { status: 409 }
          )
        }
      }

      // Insert new product
      const insertQuery = `
        INSERT INTO products (
          name, description, price, category_id, stock, is_active,
          image_url, sku, barcode, weight, dimensions, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        ) RETURNING *
      `

      const values = [
        name, description, price, category_id, stock, is_active,
        image_url, sku, barcode, weight, dimensions
      ]

      const result = await pool.query(insertQuery, values)
      const newProduct = result.rows[0]

      // Log product creation
      console.log(`Product created by admin ${user.id}: ${newProduct.id} - ${newProduct.name}`)

      const response = {
        success: true,
        data: {
          product: newProduct,
          message: 'Product created successfully'
        }
      }

      // Record analytics
      const duration = performance.now() - startTime
      ApiAnalytics.recordEndpointAccess('/api/v1/admin/products', duration, true)

      return NextResponse.json(response, {
        status: 201,
        headers: {
          'X-Response-Time': `${Math.round(duration)}ms`
        }
      })

    } catch (error) {
      console.error('Admin product creation error:', error)

      const duration = performance.now() - startTime
      ApiAnalytics.recordEndpointAccess('/api/v1/admin/products', duration, false)

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to create product'
          }
        },
        { status: 500 }
      )
    }
  })
}