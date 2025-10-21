import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/middleware'
import { pool } from '@/lib/postgres'
import { validateRequest, Schemas } from '@/lib/security'
import { ApiAnalytics } from '@/lib/monitoring'

// GET /api/v1/admin/orders - List all orders (Admin)
export async function GET(request: NextRequest) {
  return withAdminAuth(request, async (req, user) => {
    const startTime = performance.now()

    try {
      const { searchParams } = new URL(req.url)
      const page = parseInt(searchParams.get('page') || '1')
      const limit = parseInt(searchParams.get('limit') || '20')
      const status = searchParams.get('status')
      const payment_status = searchParams.get('payment_status')
      const search = searchParams.get('search')
      const date_from = searchParams.get('date_from')
      const date_to = searchParams.get('date_to')
      const sort_by = searchParams.get('sort_by') || 'created_at'
      const sort_order = searchParams.get('sort_order') || 'DESC'

      const offset = (page - 1) * limit

      // Build WHERE clause
      const whereConditions = []
      const queryParams = []
      let paramIndex = 1

      if (status) {
        whereConditions.push(`o.status = $${paramIndex++}`)
        queryParams.push(status)
      }

      if (payment_status) {
        whereConditions.push(`o.payment_status = $${paramIndex++}`)
        queryParams.push(payment_status)
      }

      if (search) {
        whereConditions.push(`(
          u.name ILIKE $${paramIndex++} OR
          u.email ILIKE $${paramIndex++} OR
          o.id::text ILIKE $${paramIndex++}
        )`)
        queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`)
      }

      if (date_from) {
        whereConditions.push(`o.created_at >= $${paramIndex++}`)
        queryParams.push(date_from)
      }

      if (date_to) {
        whereConditions.push(`o.created_at <= $${paramIndex++}`)
        queryParams.push(date_to)
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

      // Validate sort_by parameter
      const allowedSortFields = ['id', 'status', 'total', 'payment_status', 'created_at', 'updated_at']
      const validSortBy = allowedSortFields.includes(sort_by) ? sort_by : 'created_at'
      const validSortOrder = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        ${whereClause}
      `

      const countResult = await pool.query(countQuery, queryParams)
      const total = parseInt(countResult.rows[0].total)

      // Get orders with pagination
      const ordersQuery = `
        SELECT
          o.*,
          u.name as customer_name,
          u.email as customer_email,
          u.phone as customer_phone,
          p.status as payment_status,
          p.merchant_oid,
          p.amount as payment_amount,
          COUNT(oi.id) as item_count
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        LEFT JOIN payments p ON o.id = p.order_id
        LEFT JOIN order_items oi ON o.id = oi.order_id
        ${whereClause}
        GROUP BY o.id, u.name, u.email, u.phone, p.status, p.merchant_oid, p.amount
        ORDER BY o.${validSortBy} ${validSortOrder}
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
      `

      queryParams.push(limit, offset)
      const ordersResult = await pool.query(ordersQuery)

      // Get order statistics
      const statsQuery = `
        SELECT
          COUNT(*) as total_orders,
          COUNT(CASE WHEN o.status = 'pending' THEN 1 END) as pending_orders,
          COUNT(CASE WHEN o.status = 'confirmed' THEN 1 END) as confirmed_orders,
          COUNT(CASE WHEN o.status = 'preparing' THEN 1 END) as preparing_orders,
          COUNT(CASE WHEN o.status = 'ready' THEN 1 END) as ready_orders,
          COUNT(CASE WHEN o.status = 'shipped' THEN 1 END) as shipped_orders,
          COUNT(CASE WHEN o.status = 'delivered' THEN 1 END) as delivered_orders,
          COUNT(CASE WHEN o.status = 'cancelled' THEN 1 END) as cancelled_orders,
          COUNT(CASE WHEN o.payment_status = 'pending' THEN 1 END) as pending_payments,
          COUNT(CASE WHEN o.payment_status = 'paid' THEN 1 END) as paid_payments,
          COUNT(CASE WHEN o.payment_status = 'failed' THEN 1 END) as failed_payments,
          COALESCE(SUM(o.total), 0) as total_revenue,
          COALESCE(SUM(CASE WHEN o.status = 'delivered' THEN o.total ELSE 0 END), 0) as delivered_revenue
        FROM orders o
        LEFT JOIN payments p ON o.id = p.order_id
      `

      const statsResult = await pool.query(statsQuery)
      const stats = statsResult.rows[0]

      const response = {
        success: true,
        data: {
          orders: ordersResult.rows,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNext: page < Math.ceil(total / limit),
            hasPrev: page > 1
          },
          filters: {
            status: status || null,
            payment_status: payment_status || null,
            search: search || null,
            date_from: date_from || null,
            date_to: date_to || null,
            sort_by: validSortBy,
            sort_order: validSortOrder
          },
          statistics: {
            total_orders: parseInt(stats.total_orders),
            pending_orders: parseInt(stats.pending_orders),
            confirmed_orders: parseInt(stats.confirmed_orders),
            preparing_orders: parseInt(stats.preparing_orders),
            ready_orders: parseInt(stats.ready_orders),
            shipped_orders: parseInt(stats.shipped_orders),
            delivered_orders: parseInt(stats.delivered_orders),
            cancelled_orders: parseInt(stats.cancelled_orders),
            payment_stats: {
              pending: parseInt(stats.pending_payments),
              paid: parseInt(stats.paid_payments),
              failed: parseInt(stats.failed_payments)
            },
            revenue: {
              total: parseFloat(stats.total_revenue),
              delivered: parseFloat(stats.delivered_revenue)
            }
          }
        }
      }

      // Record analytics
      const duration = performance.now() - startTime
      ApiAnalytics.recordEndpointAccess('/api/v1/admin/orders', duration, true)

      return NextResponse.json(response, {
        headers: {
          'X-Response-Time': `${Math.round(duration)}ms`
        }
      })

    } catch (error) {
      console.error('Admin orders fetch error:', error)

      const duration = performance.now() - startTime
      ApiAnalytics.recordEndpointAccess('/api/v1/admin/orders', duration, false)

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to fetch orders'
          }
        },
        { status: 500 }
      )
    }
  })
}