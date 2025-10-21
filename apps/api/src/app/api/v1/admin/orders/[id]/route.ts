import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/middleware'
import { pool } from '@/lib/postgres'
import { validateRequest, Schemas } from '@/lib/security'
import { ApiAnalytics } from '@/lib/monitoring'
import { z } from 'zod'

// GET /api/v1/admin/orders/[id] - Get order details (Admin)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAdminAuth(request, async (req, user) => {
    const startTime = performance.now()
    const orderId = params.id

    try {
      // Validate order ID
      const orderIdNum = parseInt(orderId)
      if (isNaN(orderIdNum)) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_ORDER_ID',
              message: 'Order ID must be a valid number'
            }
          },
          { status: 400 }
        )
      }

      // Get order with detailed information
      const orderQuery = `
        SELECT
          o.*,
          u.name as customer_name,
          u.email as customer_email,
          u.phone as customer_phone,
          u.role as customer_role,
          p.status as payment_status,
          p.merchant_oid,
          p.amount as payment_amount,
          p.payment_method,
          p.created_at as payment_created_at,
          b.name as branch_name,
          b.address as branch_address,
          b.phone as branch_phone
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        LEFT JOIN payments p ON o.id = p.order_id
        LEFT JOIN branches b ON o.branch_id = b.id
        WHERE o.id = $1
      `

      const orderResult = await pool.query(orderQuery, [orderIdNum])

      if (orderResult.rows.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'ORDER_NOT_FOUND',
              message: 'Order not found'
            }
          },
          { status: 404 }
        )
      }

      const order = orderResult.rows[0]

      // Get order items
      const itemsQuery = `
        SELECT
          oi.*,
          p.name as product_name,
          p.image_url as product_image,
          p.sku as product_sku
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = $1
        ORDER BY oi.id
      `

      const itemsResult = await pool.query(itemsQuery, [orderIdNum])

      // Get order status history
      const statusHistoryQuery = `
        SELECT
          osh.*,
          u.name as changed_by_name
        FROM order_status_history osh
        LEFT JOIN users u ON osh.changed_by_user_id = u.id
        WHERE osh.order_id = $1
        ORDER BY osh.created_at DESC
      `

      let statusHistory = []
      try {
        const statusHistoryResult = await pool.query(statusHistoryQuery, [orderIdNum])
        statusHistory = statusHistoryResult.rows
      } catch (error) {
        console.log('Order status history table not found, skipping')
      }

      // Get delivery information if available
      let deliveryInfo = null
      try {
        const deliveryQuery = `
          SELECT
            d.*,
            c.name as courier_name,
            c.phone as courier_phone,
            c.vehicle_type
          FROM deliveries d
          LEFT JOIN couriers c ON d.courier_id = c.id
          WHERE d.order_id = $1
        `
        const deliveryResult = await pool.query(deliveryQuery, [orderIdNum])
        if (deliveryResult.rows.length > 0) {
          deliveryInfo = deliveryResult.rows[0]
        }
      } catch (error) {
        console.log('Delivery table not found, skipping')
      }

      const response = {
        success: true,
        data: {
          order: {
            ...order,
            items: itemsResult.rows,
            status_history: statusHistory,
            delivery_info: deliveryInfo,
            analytics: {
              total_items: itemsResult.rows.length,
              total_quantity: itemsResult.rows.reduce((sum, item) => sum + parseInt(item.quantity), 0),
              order_age_days: Math.floor((Date.now() - new Date(order.created_at).getTime()) / (1000 * 60 * 60 * 24))
            }
          }
        }
      }

      // Record analytics
      const duration = performance.now() - startTime
      ApiAnalytics.recordEndpointAccess('/api/v1/admin/orders/[id]', duration, true)

      return NextResponse.json(response, {
        headers: {
          'X-Response-Time': `${Math.round(duration)}ms`
        }
      })

    } catch (error) {
      console.error('Admin order fetch error:', error)

      const duration = performance.now() - startTime
      ApiAnalytics.recordEndpointAccess('/api/v1/admin/orders/[id]', duration, false)

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to fetch order'
          }
        },
        { status: 500 }
      )
    }
  })
}

// PUT /api/v1/admin/orders/[id]/status - Update order status (Admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAdminAuth(request, async (req, user) => {
    const startTime = performance.now()
    const orderId = params.id

    try {
      // Validate order ID
      const orderIdNum = parseInt(orderId)
      if (isNaN(orderIdNum)) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_ORDER_ID',
              message: 'Order ID must be a valid number'
            }
          },
          { status: 400 }
        )
      }

      const body = await req.json()

      // Validate request body
      const statusUpdateSchema = Schemas.orderStatusUpdate

      const validation = validateRequest(statusUpdateSchema, body)
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

      const { status, note, branch_id } = body

      // Check if order exists
      const existingOrder = await pool.query(
        'SELECT * FROM orders WHERE id = $1',
        [orderIdNum]
      )

      if (existingOrder.rows.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'ORDER_NOT_FOUND',
              message: 'Order not found'
            }
          },
          { status: 404 }
        )
      }

      const currentOrder = existingOrder.rows[0]

      // Validate status transitions
      const validTransitions = {
        'pending': ['confirmed', 'cancelled'],
        'confirmed': ['preparing', 'cancelled'],
        'preparing': ['ready', 'cancelled'],
        'ready': ['shipped', 'cancelled'],
        'shipped': ['delivered', 'cancelled'],
        'delivered': [], // Terminal state
        'cancelled': []  // Terminal state
      }

      if (!validTransitions[currentOrder.status].includes(status)) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_STATUS_TRANSITION',
              message: `Cannot transition from ${currentOrder.status} to ${status}`
            }
          },
          { status: 400 }
        )
      }

      // Check if branch exists (if provided)
      if (branch_id) {
        const branchCheck = await pool.query(
          'SELECT id FROM branches WHERE id = $1 AND is_active = true',
          [branch_id]
        )

        if (branchCheck.rows.length === 0) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'BRANCH_NOT_FOUND',
                message: 'Branch not found or inactive'
              }
            },
            { status: 404 }
          )
        }
      }

      // Update order status
      const updateQuery = `
        UPDATE orders
        SET status = $1, branch_id = COALESCE($2, branch_id), updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING *
      `

      const updateValues = [status, branch_id, orderIdNum]
      const result = await pool.query(updateQuery, updateValues)
      const updatedOrder = result.rows[0]

      // Record status history
      try {
        const historyQuery = `
          INSERT INTO order_status_history (order_id, old_status, new_status, note, changed_by_user_id, created_at)
          VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
        `
        await pool.query(historyQuery, [
          orderIdNum,
          currentOrder.status,
          status,
          note || null,
          user.id
        ])
      } catch (error) {
        console.log('Status history logging failed:', error)
      }

      // Log status update
      console.log(`Order ${orderIdNum} status updated from ${currentOrder.status} to ${status} by admin ${user.id}`)

      const response = {
        success: true,
        data: {
          order: updatedOrder,
          previous_status: currentOrder.status,
          new_status: status,
          message: 'Order status updated successfully'
        }
      }

      // Record analytics
      const duration = performance.now() - startTime
      ApiAnalytics.recordEndpointAccess('/api/v1/admin/orders/[id]/status', duration, true)

      return NextResponse.json(response, {
        headers: {
          'X-Response-Time': `${Math.round(duration)}ms`
        }
      })

    } catch (error) {
      console.error('Admin order status update error:', error)

      const duration = performance.now() - startTime
      ApiAnalytics.recordEndpointAccess('/api/v1/admin/orders/[id]/status', duration, false)

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to update order status'
          }
        },
        { status: 500 }
      )
    }
  })
}