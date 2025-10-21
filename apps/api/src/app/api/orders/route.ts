import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/postgres'

// POST /api/orders - Create new order from cart
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      cart_id,
      customer_name,
      customer_email,
      customer_phone,
      billing_type = 'individual',
      billing_tax_number,
      billing_company,
      shipping_address,
      delivery_slot,
      notes
    } = body

    // Basic validation
    if (!cart_id || !customer_name || !customer_email || !shipping_address) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Cart ID, customer name, email and shipping address are required' } },
        { status: 400 }
      )
    }

    // Get cart details
    const cartQuery = `
      SELECT c.*,
             COUNT(ci.id) as item_count,
             SUM(ci.total_price) as cart_total
      FROM carts c
      LEFT JOIN cart_items ci ON c.id = ci.cart_id
      WHERE c.id = $1 AND c.status = 'active'
      GROUP BY c.id
    `
    const cartResult = await query(cartQuery, [cart_id])

    if (cartResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'CART_NOT_FOUND', message: 'Cart not found or not active' } },
        { status: 404 }
      )
    }

    const cart = cartResult.rows[0]

    if (parseInt(cart.item_count) === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'EMPTY_CART', message: 'Cannot create order from empty cart' } },
        { status: 400 }
      )
    }

    // Get cart items for order snapshot
    const cartItemsQuery = `
      SELECT ci.*, p.name as product_name, p.sku
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = $1
    `
    const cartItemsResult = await query(cartItemsQuery, [cart_id])

    const cartItems = cartItemsResult.rows
    const subtotal = parseFloat(cart.cart_total)
    const tax_rate = 0.18 // 18% KDV
    const tax_total = subtotal * tax_rate
    const shipping_total = 0 // Will be calculated based on delivery zone
    const grand_total = subtotal + tax_total + shipping_total

    // Generate order number
    const order_no = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`

    // Create order
    const orderQuery = `
      INSERT INTO orders (
        order_no, cart_id, customer_name, customer_email, customer_phone,
        billing_type, billing_tax_number, billing_company, shipping_address,
        delivery_slot, subtotal, tax_total, shipping_total, grand_total,
        status, notes, created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW()
      )
      RETURNING *
    `

    const orderValues = [
      order_no, cart_id, customer_name, customer_email, customer_phone,
      billing_type, billing_tax_number || null, billing_company || null,
      JSON.stringify(shipping_address), delivery_slot ? JSON.stringify(delivery_slot) : null,
      subtotal, tax_total, shipping_total, grand_total,
      'pending', notes || null
    ]

    const orderResult = await query(orderQuery, orderValues)
    const order = orderResult.rows[0]

    // Create order status history entry
    const historyQuery = `
      INSERT INTO order_status_history (order_id, status, notes, created_at)
      VALUES ($1, $2, $3, NOW())
    `
    await query(historyQuery, [order.id, 'pending', 'Order created from cart'])

    // Update cart status to converted
    await query('UPDATE carts SET status = $1, updated_at = NOW() WHERE id = $2', ['converted', cart_id])

    return NextResponse.json({
      success: true,
      data: {
        order: {
          id: order.id,
          order_no: order.order_no,
          status: order.status,
          customer_name: order.customer_name,
          customer_email: order.customer_email,
          subtotal: parseFloat(order.subtotal),
          tax_total: parseFloat(order.tax_total),
          shipping_total: parseFloat(order.shipping_total),
          grand_total: parseFloat(order.grand_total),
          created_at: order.created_at
        },
        items: cartItems.map(item => ({
          product_name: item.product_name,
          sku: item.sku,
          quantity: item.quantity,
          unit_price: parseFloat(item.unit_price),
          total_price: parseFloat(item.total_price)
        }))
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Order creation failed' } },
      { status: 500 }
    )
  }
}

// GET /api/orders - Get orders (with filters)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const status = searchParams.get('status') || undefined
    const page = Number(searchParams.get('page')) || 1
    const per_page = Math.min(Number(searchParams.get('per_page')) || 20, 50)

    // Build WHERE conditions
    const conditions: string[] = []
    const values: any[] = []
    let paramIndex = 1

    if (status) {
      conditions.push(`status = $${paramIndex}`)
      values.push(status)
      paramIndex++
    }

    // TODO: Add user authentication filter
    // conditions.push(`user_id = $${paramIndex}`)
    // values.push(currentUserId)

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM orders ${whereClause}`
    const countResult = await query(countQuery, values)
    const total = parseInt(countResult.rows[0]?.total || '0', 10)

    // Apply pagination
    const offset = (page - 1) * per_page
    const limit = per_page

    // Get orders with pagination
    const dataQuery = `
      SELECT
        id, order_no, status, customer_name, customer_email, customer_phone,
        subtotal, tax_total, shipping_total, grand_total, payment_status,
        created_at, updated_at
      FROM orders
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    const dataResult = await query(dataQuery, values)
    const orders = dataResult.rows.map((order: any) => ({
      id: order.id,
      order_no: order.order_no,
      status: order.status,
      customer_name: order.customer_name,
      customer_email: order.customer_email,
      customer_phone: order.customer_phone,
      subtotal: parseFloat(order.subtotal),
      tax_total: parseFloat(order.tax_total),
      shipping_total: parseFloat(order.shipping_total),
      grand_total: parseFloat(order.grand_total),
      payment_status: order.payment_status,
      created_at: order.created_at,
      updated_at: order.updated_at
    }))

    const total_pages = Math.ceil(total / per_page)

    return NextResponse.json({
      success: true,
      data: orders,
      meta: {
        page,
        per_page,
        total,
        total_pages
      }
    })

  } catch (error) {
    console.error('Orders fetch error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch orders' } },
      { status: 500 }
    )
  }
}