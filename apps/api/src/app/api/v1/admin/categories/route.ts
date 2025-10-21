import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/middleware'
import { pool } from '@/lib/postgres'
import { validateRequest, Schemas } from '@/lib/security'
import { ApiAnalytics } from '@/lib/monitoring'

// GET /api/v1/admin/categories - List all categories (Admin)
export async function GET(request: NextRequest) {
  return withAdminAuth(request, async (req, user) => {
    const startTime = performance.now()

    try {
      const { searchParams } = new URL(req.url)
      const include_inactive = searchParams.get('include_inactive') === 'true'
      const include_stats = searchParams.get('include_stats') === 'true'

      // Build WHERE clause
      const whereClause = include_inactive ? '' : 'WHERE c.is_active = true'

      let categoriesQuery = `
        SELECT
          c.*,
          pc.name as parent_category_name,
          COUNT(p.id) as product_count
        FROM categories c
        LEFT JOIN categories pc ON c.parent_id = pc.id
        LEFT JOIN products p ON c.id = p.category_id ${include_inactive ? '' : 'AND p.is_active = true'}
        ${whereClause}
        GROUP BY c.id, pc.name
        ORDER BY c.sort_order ASC, c.name ASC
      `

      const categoriesResult = await pool.query(categoriesQuery)

      let categories = categoriesResult.rows

      // Add statistics if requested
      if (include_stats) {
        categories = await Promise.all(categories.map(async (category) => {
          try {
            const statsQuery = `
              SELECT
                COUNT(DISTINCT o.id) as orders_count,
                SUM(oi.quantity) as total_sold,
                SUM(oi.total_price) as total_revenue,
                COALESCE(AVG(oi.unit_price), 0) as avg_price
              FROM categories c
              JOIN products p ON c.id = p.category_id
              JOIN order_items oi ON p.id = oi.product_id
              JOIN orders o ON oi.order_id = o.id
              WHERE c.id = $1 AND o.created_at >= CURRENT_DATE - INTERVAL '30 days'
            `

            const statsResult = await pool.query(statsQuery, [category.id])
            const stats = statsResult.rows[0]

            return {
              ...category,
              stats: {
                orders_last_30_days: parseInt(stats.orders_count) || 0,
                items_sold_last_30_days: parseInt(stats.total_sold) || 0,
                revenue_last_30_days: parseFloat(stats.total_revenue) || 0,
                avg_price_last_30_days: parseFloat(stats.avg_price) || 0
              }
            }
          } catch (error) {
            return {
              ...category,
              stats: {
                orders_last_30_days: 0,
                items_sold_last_30_days: 0,
                revenue_last_30_days: 0,
                avg_price_last_30_days: 0
              }
            }
          }
        }))
      }

      // Build hierarchical structure
      const buildHierarchy = (categories: any[], parentId: number | null = null): any[] => {
        return categories
          .filter(cat => cat.parent_id === parentId)
          .map(cat => ({
            ...cat,
            children: buildHierarchy(categories, cat.id)
          }))
      }

      const hierarchicalCategories = buildHierarchy(categories)

      const response = {
        success: true,
        data: {
          categories: hierarchicalCategories,
          flat_list: categories, // Keep flat list for easier processing
          summary: {
            total_categories: categories.length,
            active_categories: categories.filter(c => c.is_active).length,
            inactive_categories: categories.filter(c => !c.is_active).length,
            root_categories: categories.filter(c => !c.parent_id).length,
            total_products: categories.reduce((sum, cat) => sum + parseInt(cat.product_count), 0)
          },
          filters: {
            include_inactive,
            include_stats
          }
        }
      }

      // Record analytics
      const duration = performance.now() - startTime
      ApiAnalytics.recordEndpointAccess('/api/v1/admin/categories', duration, true)

      return NextResponse.json(response, {
        headers: {
          'X-Response-Time': `${Math.round(duration)}ms`
        }
      })

    } catch (error) {
      console.error('Admin categories fetch error:', error)

      const duration = performance.now() - startTime
      ApiAnalytics.recordEndpointAccess('/api/v1/admin/categories', duration, false)

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to fetch categories'
          }
        },
        { status: 500 }
      )
    }
  })
}

// POST /api/v1/admin/categories - Create new category (Admin)
export async function POST(request: NextRequest) {
  return withAdminAuth(request, async (req, user) => {
    const startTime = performance.now()

    try {
      const body = await req.json()

      // Validate required fields
      const validation = validateRequest(Schemas.categoryCreate, body)
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
        image_url,
        parent_id,
        sort_order = 0,
        is_active = true
      } = body

      // Check if parent category exists (if provided)
      if (parent_id) {
        const parentCheck = await pool.query(
          'SELECT id FROM categories WHERE id = $1 AND is_active = true',
          [parent_id]
        )

        if (parentCheck.rows.length === 0) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'PARENT_CATEGORY_NOT_FOUND',
                message: 'Parent category not found or inactive'
              }
            },
            { status: 404 }
          )
        }
      }

      // Check if category name already exists (at same level)
      const nameCheck = await pool.query(
        `SELECT id FROM categories
         WHERE name ILIKE $1 AND parent_id IS NOT DISTINCT FROM $2`,
        [name, parent_id || null]
      )

      if (nameCheck.rows.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'CATEGORY_NAME_EXISTS',
              message: 'Category with this name already exists at this level'
            }
          },
          { status: 409 }
        )
      }

      // Insert new category
      const insertQuery = `
        INSERT INTO categories (
          name, description, image_url, parent_id, sort_order, is_active, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        ) RETURNING *
      `

      const values = [
        name, description, image_url, parent_id || null, sort_order, is_active
      ]

      const result = await pool.query(insertQuery, values)
      const newCategory = result.rows[0]

      // Get parent category name for response
      if (parent_id) {
        const parentQuery = 'SELECT name FROM categories WHERE id = $1'
        const parentResult = await pool.query(parentQuery, [parent_id])
        if (parentResult.rows.length > 0) {
          newCategory.parent_category_name = parentResult.rows[0].name
        }
      }

      // Log category creation
      console.log(`Category created by admin ${user.id}: ${newCategory.id} - ${newCategory.name}`)

      const response = {
        success: true,
        data: {
          category: newCategory,
          message: 'Category created successfully'
        }
      }

      // Record analytics
      const duration = performance.now() - startTime
      ApiAnalytics.recordEndpointAccess('/api/v1/admin/categories', duration, true)

      return NextResponse.json(response, {
        status: 201,
        headers: {
          'X-Response-Time': `${Math.round(duration)}ms`
        }
      })

    } catch (error) {
      console.error('Admin category creation error:', error)

      const duration = performance.now() - startTime
      ApiAnalytics.recordEndpointAccess('/api/v1/admin/categories', duration, false)

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to create category'
          }
        },
        { status: 500 }
      )
    }
  })
}