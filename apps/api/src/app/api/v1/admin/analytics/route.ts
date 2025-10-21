import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/middleware'
import { pool } from '@/lib/postgres'
import { ApiAnalytics } from '@/lib/monitoring'

// GET /api/v1/admin/analytics - Get comprehensive analytics data (Admin)
export async function GET(request: NextRequest) {
  return withAdminAuth(request, async (req, user) => {
    const startTime = performance.now()

    try {
      const { searchParams } = new URL(req.url)
      const period = searchParams.get('period') || '30' // Default last 30 days
      const type = searchParams.get('type') || 'overview' // overview, sales, products, customers

      const days = parseInt(period)
      const dateFilter = `CURRENT_DATE - INTERVAL '${days} days'`

      // Base analytics data
      const baseQuery = `
        SELECT
          -- Order statistics
          COUNT(CASE WHEN o.created_at >= ${dateFilter} THEN 1 END) as total_orders,
          COUNT(CASE WHEN o.status = 'delivered' AND o.created_at >= ${dateFilter} THEN 1 END) as completed_orders,
          COUNT(CASE WHEN o.status = 'cancelled' AND o.created_at >= ${dateFilter} THEN 1 END) as cancelled_orders,

          -- Revenue statistics
          COALESCE(SUM(CASE WHEN o.created_at >= ${dateFilter} THEN o.total ELSE 0 END), 0) as total_revenue,
          COALESCE(SUM(CASE WHEN o.status = 'delivered' AND o.created_at >= ${dateFilter} THEN o.total ELSE 0 END), 0) as completed_revenue,

          -- Average order value
          COALESCE(AVG(CASE WHEN o.created_at >= ${dateFilter} THEN o.total ELSE NULL END), 0) as avg_order_value,

          -- Payment statistics
          COUNT(CASE WHEN o.created_at >= ${dateFilter} THEN 1 END) as orders_with_payments,
          COUNT(CASE WHEN p.status = 'success' AND o.created_at >= ${dateFilter} THEN 1 END) as successful_payments,
          COUNT(CASE WHEN p.status = 'failed' AND o.created_at >= ${dateFilter} THEN 1 END) as failed_payments,

          -- Customer statistics
          COUNT(DISTINCT CASE WHEN o.created_at >= ${dateFilter} THEN o.user_id END) as unique_customers,

          -- Product statistics
          COUNT(DISTINCT CASE WHEN oi.created_at >= ${dateFilter} THEN oi.product_id END) as products_sold

        FROM orders o
        LEFT JOIN payments p ON o.id = p.order_id
        LEFT JOIN order_items oi ON o.id = oi.order_id
      `

      const baseResult = await pool.query(baseQuery)
      const baseStats = baseResult.rows[0]

      let analyticsData: any = {
        overview: {
          total_orders: parseInt(baseStats.total_orders),
          completed_orders: parseInt(baseStats.completed_orders),
          cancelled_orders: parseInt(baseStats.cancelled_orders),
          completion_rate: parseInt(baseStats.total_orders) > 0
            ? Math.round((parseInt(baseStats.completed_orders) / parseInt(baseStats.total_orders)) * 100)
            : 0,
          total_revenue: parseFloat(baseStats.total_revenue),
          completed_revenue: parseFloat(baseStats.completed_revenue),
          avg_order_value: parseFloat(baseStats.avg_order_value),
          payment_stats: {
            total_orders: parseInt(baseStats.orders_with_payments),
            successful: parseInt(baseStats.successful_payments),
            failed: parseInt(baseStats.failed_payments),
            success_rate: parseInt(baseStats.orders_with_payments) > 0
              ? Math.round((parseInt(baseStats.successful_payments) / parseInt(baseStats.orders_with_payments)) * 100)
              : 0
          },
          customer_stats: {
            unique_customers: parseInt(baseStats.unique_customers),
            products_sold: parseInt(baseStats.products_sold)
          }
        }
      }

      // Sales trends (daily data)
      if (type === 'sales' || type === 'overview') {
        const salesTrendsQuery = `
          SELECT
            DATE(o.created_at) as date,
            COUNT(*) as orders,
            COALESCE(SUM(o.total), 0) as revenue,
            COUNT(DISTINCT o.user_id) as unique_customers,
            COALESCE(AVG(o.total), 0) as avg_order_value
          FROM orders o
          WHERE o.created_at >= ${dateFilter}
          GROUP BY DATE(o.created_at)
          ORDER BY date DESC
          LIMIT ${days}
        `

        const salesTrendsResult = await pool.query(salesTrendsQuery)
        analyticsData.sales_trends = salesTrendsResult.rows.reverse() // Reverse to show chronological order
      }

      // Top products
      if (type === 'products' || type === 'overview') {
        const topProductsQuery = `
          SELECT
            p.id,
            p.name,
            p.image_url,
            p.price,
            COUNT(oi.id) as order_count,
            SUM(oi.quantity) as total_quantity,
            SUM(oi.total_price) as total_revenue
          FROM products p
          JOIN order_items oi ON p.id = oi.product_id
          JOIN orders o ON oi.order_id = o.id
          WHERE o.created_at >= ${dateFilter}
          GROUP BY p.id, p.name, p.image_url, p.price
          ORDER BY total_revenue DESC
          LIMIT 10
        `

        const topProductsResult = await pool.query(topProductsQuery)
        analyticsData.top_products = topProductsResult.rows
      }

      // Customer analytics
      if (type === 'customers' || type === 'overview') {
        const customerAnalyticsQuery = `
          SELECT
            -- New customers over time
            COUNT(CASE WHEN u.created_at >= ${dateFilter} THEN 1 END) as new_customers,

            -- Customer repeat purchase rate
            COUNT(DISTINCT CASE WHEN o.created_at >= ${dateFilter} THEN o.user_id END) as returning_customers,

            -- Average orders per customer
            COALESCE(AVG(customer_order_counts.order_count), 0) as avg_orders_per_customer,

            -- Top customers by revenue
            (
              SELECT JSON_AGG(
                JSON_BUILD_OBJECT(
                  'customer_id', customer_stats.user_id,
                  'customer_name', customer_stats.name,
                  'customer_email', customer_stats.email,
                  'order_count', customer_stats.order_count,
                  'total_spent', customer_stats.total_spent
                )
              )
              FROM (
                SELECT
                  u.id as user_id,
                  u.name,
                  u.email,
                  COUNT(o.id) as order_count,
                  COALESCE(SUM(o.total), 0) as total_spent
                FROM users u
                JOIN orders o ON u.id = o.user_id
                WHERE o.created_at >= ${dateFilter}
                GROUP BY u.id, u.name, u.email
                ORDER BY total_spent DESC
                LIMIT 5
              ) customer_stats
            ) as top_customers
          FROM users u
          LEFT JOIN orders o ON u.id = o.user_id
          LEFT JOIN (
            SELECT
              user_id,
              COUNT(*) as order_count
            FROM orders
            WHERE created_at >= ${dateFilter}
            GROUP BY user_id
          ) customer_order_counts ON u.id = customer_order_counts.user_id
        `

        const customerResult = await pool.query(customerAnalyticsQuery)
        const customerStats = customerResult.rows[0]

        analyticsData.customer_analytics = {
          new_customers: parseInt(customerStats.new_customers),
          returning_customers: parseInt(customerStats.returning_customers),
          avg_orders_per_customer: parseFloat(customerStats.avg_orders_per_customer),
          top_customers: customerStats.top_customers || []
        }
      }

      // Order status distribution
      if (type === 'orders' || type === 'overview') {
        const statusDistributionQuery = `
          SELECT
            status,
            COUNT(*) as count,
            COALESCE(SUM(total), 0) as revenue
          FROM orders
          WHERE created_at >= ${dateFilter}
          GROUP BY status
          ORDER BY count DESC
        `

        const statusResult = await pool.query(statusDistributionQuery)
        analyticsData.order_status_distribution = statusResult.rows
      }

      // Category performance
      if (type === 'categories' || type === 'overview') {
        const categoryPerformanceQuery = `
          SELECT
            c.id,
            c.name,
            COUNT(DISTINCT oi.product_id) as products_sold,
            SUM(oi.quantity) as total_quantity,
            SUM(oi.total_price) as total_revenue,
            COUNT(DISTINCT o.id) as order_count
          FROM categories c
          JOIN products p ON c.id = p.category_id
          JOIN order_items oi ON p.id = oi.product_id
          JOIN orders o ON oi.order_id = o.id
          WHERE o.created_at >= ${dateFilter}
          GROUP BY c.id, c.name
          ORDER BY total_revenue DESC
          LIMIT 10
        `

        const categoryResult = await pool.query(categoryPerformanceQuery)
        analyticsData.category_performance = categoryResult.rows
      }

      // Response with requested data type
      const responseData = type === 'overview'
        ? analyticsData
        : { [type]: analyticsData[type] || {} }

      const response = {
        success: true,
        data: {
          ...responseData,
          period: {
            days: days,
            start_date: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            end_date: new Date().toISOString().split('T')[0]
          },
          generated_at: new Date().toISOString()
        }
      }

      // Record analytics
      const duration = performance.now() - startTime
      ApiAnalytics.recordEndpointAccess('/api/v1/admin/analytics', duration, true)

      return NextResponse.json(response, {
        headers: {
          'X-Response-Time': `${Math.round(duration)}ms`
        }
      })

    } catch (error) {
      console.error('Admin analytics fetch error:', error)

      const duration = performance.now() - startTime
      ApiAnalytics.recordEndpointAccess('/api/v1/admin/analytics', duration, false)

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to fetch analytics data'
          }
        },
        { status: 500 }
      )
    }
  })
}