import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/postgres'

// GET /api/v1/orders/[id] - Get order details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get order details
    const orderQuery = `
      SELECT * FROM orders WHERE id = $1
    `
    const orderResult = await query(orderQuery, [id])

    if (orderResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } },
        { status: 404 }
      )
    }

    const order = orderResult.rows[0]

    // Get order items (from cart snapshot or current product data)
    const itemsQuery = `
      SELECT
        ci.*,
        p.name as product_name,
        p.slug as product_slug,
        p.images as product_images,
        c.name as category_name,
        c.slug as category_slug
      FROM cart_items ci
      JOIN carts o ON ci.cart_id = o.id
      JOIN products p ON ci.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      WHERE ci.cart_id = $1
      ORDER BY ci.created_at DESC
    `
    const itemsResult = await query(itemsQuery, [order.cart_id])

    const items = itemsResult.rows.map(item => ({
      id: item.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: parseFloat(item.unit_price),
      total_price: parseFloat(item.total_price),
      kdv_rate: 0.18,
      kdv_amount: parseFloat(item.total_price) * 0.18,
      attributes: item.attributes,
      product: {
        name: item.product_name,
        slug: item.product_slug,
        images: item.product_images,
        category: {
          name: item.category_name,
          slug: item.category_slug
        }
      }
    }))

    // Get order status history
    const historyQuery = `
      SELECT * FROM order_status_history
      WHERE order_id = $1
      ORDER BY created_at ASC
    `
    const historyResult = await query(historyQuery, [id])

    const status_history = historyResult.rows.map(entry => ({
      status: entry.status,
      notes: entry.notes,
      timestamp: entry.created_at
    }))

    // Format response
    return NextResponse.json({
      success: true,
      data: {
        id: order.id,
        order_no: order.order_no,
        status: order.status,
        payment_status: order.payment_status,
        payment_method: order.payment_method,
        customer: {
          name: order.customer_name,
          email: order.customer_email,
          phone: order.customer_phone
        },
        billing: {
          type: order.billing_type,
          tax_number: order.billing_tax_number,
          company: order.billing_company
        },
        shipping_address: JSON.parse(order.shipping_address),
        delivery_slot: order.delivery_slot ? JSON.parse(order.delivery_slot) : null,
        items,
        summary: {
          subtotal: parseFloat(order.subtotal),
          tax_total: parseFloat(order.tax_total),
          delivery_fee: parseFloat(order.shipping_total),
          grand_total: parseFloat(order.grand_total),
          currency: 'TRY'
        },
        status_history,
        notes: order.notes,
        created_at: order.created_at,
        updated_at: order.updated_at
      }
    })

  } catch (error) {
    console.error('Order details error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get order details' } },
      { status: 500 }
    )
  }
}

// PUT /api/v1/orders/[id]/status - Update order status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, note, notify_customer = true } = body

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'on_delivery', 'delivered', 'cancelled', 'failed']
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid order status' } },
        { status: 400 }
      )
    }

    // Get current order
    const orderQuery = `SELECT status FROM orders WHERE id = $1`
    const orderResult = await query(orderQuery, [id])

    if (orderResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } },
        { status: 404 }
      )
    }

    const currentStatus = orderResult.rows[0].status

    // Validate status transition
    const validTransitions = {
      'pending': ['confirmed', 'cancelled', 'failed'],
      'confirmed': ['preparing', 'cancelled', 'failed'],
      'preparing': ['ready', 'cancelled'],
      'ready': ['on_delivery', 'cancelled'],
      'on_delivery': ['delivered', 'cancelled'],
      'delivered': [], // Terminal state
      'cancelled': [], // Terminal state
      'failed': ['pending'] // Can retry
    }

    if (!validTransitions[currentStatus]?.includes(status)) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_TRANSITION', message: `Cannot transition from ${currentStatus} to ${status}` } },
        { status: 400 }
      )
    }

    // Update order status
    const updateQuery = `
      UPDATE orders
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, status, updated_at
    `
    await query(updateQuery, [status, id])

    // Create status history entry
    const historyQuery = `
      INSERT INTO order_status_history (order_id, status, notes, created_at)
      VALUES ($1, $2, $3, NOW())
    `
    await query(historyQuery, [id, status, note || `Status changed from ${currentStatus} to ${status}`])

    // TODO: Send notification if notify_customer is true
    // This would integrate with a notification service

    return NextResponse.json({
      success: true,
      data: {
        id: parseInt(id),
        status,
        previous_status: currentStatus,
        timestamp: new Date().toISOString(),
        note: note || `Status changed from ${currentStatus} to ${status}`
      }
    })

  } catch (error) {
    console.error('Order status update error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update order status' } },
      { status: 500 }
    )
  }
}