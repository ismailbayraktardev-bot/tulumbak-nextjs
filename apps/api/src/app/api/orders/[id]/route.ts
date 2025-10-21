import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/postgres'

// GET /api/orders/[id] - Get order details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get order details
    const orderQuery = `
      SELECT
        o.*,
        c.user_id
      FROM orders o
      LEFT JOIN carts c ON o.cart_id = c.id
      WHERE o.id = $1
    `
    const orderResult = await query(orderQuery, [id])

    if (orderResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } },
        { status: 404 }
      )
    }

    const order = orderResult.rows[0]

    // TODO: Add user authorization check
    // if (order.user_id !== currentUserId && userRole !== 'admin') {
    //   return NextResponse.json(
    //     { success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } },
    //     { status: 403 }
    //   )
    // }

    // Get order items from cart
    const itemsQuery = `
      SELECT
        ci.*,
        p.name as product_name,
        p.slug as product_slug,
        p.images as product_images,
        c.name as category_name,
        c.slug as category_slug
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      WHERE ci.cart_id = $1
      ORDER BY ci.created_at DESC
    `
    const itemsResult = await query(itemsQuery, [order.cart_id])

    const orderItems = itemsResult.rows.map(item => ({
      product_name: item.product_name,
      product_slug: item.product_slug,
      product_images: item.product_images,
      category_name: item.category_name,
      category_slug: item.category_slug,
      quantity: item.quantity,
      unit_price: parseFloat(item.unit_price),
      total_price: parseFloat(item.total_price),
      attributes: item.attributes
    }))

    // Get order status history
    const historyQuery = `
      SELECT status, notes, created_at
      FROM order_status_history
      WHERE order_id = $1
      ORDER BY created_at ASC
    `
    const historyResult = await query(historyQuery, [id])

    const statusHistory = historyResult.rows.map(entry => ({
      status: entry.status,
      notes: entry.notes,
      created_at: entry.created_at
    }))

    return NextResponse.json({
      success: true,
      data: {
        id: order.id,
        order_no: order.order_no,
        status: order.status,
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        customer_phone: order.customer_phone,
        billing_type: order.billing_type,
        billing_tax_number: order.billing_tax_number,
        billing_company: order.billing_company,
        shipping_address: JSON.parse(order.shipping_address),
        delivery_slot: order.delivery_slot ? JSON.parse(order.delivery_slot) : null,
        items: orderItems,
        totals: {
          subtotal: parseFloat(order.subtotal),
          tax_total: parseFloat(order.tax_total),
          shipping_total: parseFloat(order.shipping_total),
          grand_total: parseFloat(order.grand_total)
        },
        payment: {
          provider: order.payment_provider,
          status: order.payment_status,
          ref: order.payment_ref
        },
        status_history: statusHistory,
        notes: order.notes,
        created_at: order.created_at,
        updated_at: order.updated_at
      }
    })

  } catch (error) {
    console.error('Order fetch error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch order' } },
      { status: 500 }
    )
  }
}

// PATCH /api/orders/[id] - Update order status (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, notes } = body

    // Basic validation
    if (!status) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Status is required' } },
        { status: 400 }
      )
    }

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'on_delivery', 'delivered', 'cancelled', 'failed']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid status' } },
        { status: 400 }
      )
    }

    // TODO: Add admin authorization check
    // if (userRole !== 'admin' && userRole !== 'super_admin') {
    //   return NextResponse.json(
    //     { success: false, error: { code: 'FORBIDDEN', message: 'Admin access required' } },
    //     { status: 403 }
    //   )
    // }

    // Get current order
    const currentOrderQuery = `SELECT status FROM orders WHERE id = $1`
    const currentOrderResult = await query(currentOrderQuery, [id])

    if (currentOrderResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } },
        { status: 404 }
      )
    }

    const currentStatus = currentOrderResult.rows[0].status

    // Check if status change is allowed
    const allowedTransitions: { [key: string]: string[] } = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['preparing', 'cancelled'],
      'preparing': ['ready', 'cancelled'],
      'ready': ['on_delivery'],
      'on_delivery': ['delivered', 'failed'],
      'delivered': [],
      'cancelled': [],
      'failed': ['pending'] // Allow retry
    }

    if (!allowedTransitions[currentStatus]?.includes(status)) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_TRANSITION', message: `Cannot change status from ${currentStatus} to ${status}` } },
        { status: 400 }
      )
    }

    // Update order status
    const updateQuery = `
      UPDATE orders
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `
    const updateResult = await query(updateQuery, [status, id])
    const updatedOrder = updateResult.rows[0]

    // Create status history entry
    const historyQuery = `
      INSERT INTO order_status_history (order_id, status, notes, created_at)
      VALUES ($1, $2, $3, NOW())
    `
    await query(historyQuery, [id, status, notes || null])

    return NextResponse.json({
      success: true,
      data: {
        id: updatedOrder.id,
        order_no: updatedOrder.order_no,
        status: updatedOrder.status,
        updated_at: updatedOrder.updated_at,
        message: 'Order status updated successfully'
      }
    })

  } catch (error) {
    console.error('Order update error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update order' } },
      { status: 500 }
    )
  }
}