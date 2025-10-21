import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/postgres'

// TCKN validation function
function validateTCKN(tckn: string): boolean {
  if (!/^[0-9]{11}$/.test(tckn)) return false;

  const digits = tckn.split('').map(Number);
  const sum1to9 = digits.slice(0, 9).reduce((a, b) => a + b, 0);
  const sum1to10 = sum1to9 + digits[9];

  const tenthDigit = sum1to9 % 10;
  const eleventhDigit = sum1to10 % 10;

  return digits[9] === tenthDigit && digits[10] === eleventhDigit;
}

// VKN validation function
function validateVKN(vkn: string): boolean {
  return /^[0-9]{10}$/.test(vkn);
}

// Turkish phone number validation
function validateTurkishPhone(phone: string): boolean {
  const cleaned = phone.replace(/[^0-9+]/g, '');
  return /^(\+90|0)?[5][0-9][0-9]{7}$/.test(cleaned);
}

// Generate order number with date format
async function generateOrderNumber(): Promise<string> {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');

  // Get today's order count
  const countQuery = `
    SELECT COUNT(*) as count
    FROM orders
    WHERE DATE(created_at) = CURRENT_DATE
  `;
  const result = await query(countQuery);
  const count = parseInt(result.rows[0].count) + 1;

  return `ORD-${date}-${count.toString().padStart(3, '0')}`;
}

// POST /api/v1/orders - Create enhanced order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      cart_id,
      customer,
      billing,
      shipping_address,
      delivery_slot,
      notes,
      payment_method = 'paytr'
    } = body

    // Validate required fields
    if (!cart_id || !customer || !shipping_address) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Cart ID, customer info and shipping address are required' } },
        { status: 400 }
      )
    }

    // Validate customer info
    if (!customer.name || !customer.email) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Customer name and email are required' } },
        { status: 400 }
      )
    }

    // Validate Turkish phone number
    if (customer.phone && !validateTurkishPhone(customer.phone)) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid Turkish phone number format' } },
        { status: 400 }
      )
    }

    // Validate billing information
    if (billing) {
      if (billing.type === 'individual') {
        if (!billing.tckn || !validateTCKN(billing.tckn)) {
          return NextResponse.json(
            { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid TCKN format' } },
            { status: 400 }
          )
        }
      } else if (billing.type === 'corporate') {
        if (!billing.vkn || !validateVKN(billing.vkn) || !billing.company) {
          return NextResponse.json(
            { success: false, error: { code: 'VALIDATION_ERROR', message: 'VKN and company name are required for corporate billing' } },
            { status: 400 }
          )
        }
      }
    }

    // Validate shipping address
    if (!shipping_address.text || !shipping_address.city || !shipping_address.district) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Complete shipping address is required' } },
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
      WHERE (c.id = $1 OR c.guest_cart_id = $1)
      AND c.status = 'active'
      AND (c.guest_cart_id IS NULL OR c.expires_at > NOW())
      GROUP BY c.id
    `
    const cartResult = await query(cartQuery, [cart_id])

    if (cartResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'CART_NOT_FOUND', message: 'Cart not found, inactive, or expired' } },
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
      SELECT ci.*, p.name as product_name, p.sku, p.price as current_price, p.is_active
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = $1
    `
    const cartItemsResult = await query(cartItemsQuery, [cart_id])
    const cartItems = cartItemsResult.rows

    // Validate all products are still available
    const unavailableProducts = cartItems.filter(item => !item.is_active)
    if (unavailableProducts.length > 0) {
      return NextResponse.json(
        { success: false, error: { code: 'PRODUCTS_UNAVAILABLE', message: 'Some products in cart are no longer available' } },
        { status: 400 }
      )
    }

    const subtotal = parseFloat(cart.cart_total)
    const tax_rate = 0.18 // 18% KDV
    const tax_total = subtotal * tax_rate

    // Calculate delivery fee (basic for now, will be enhanced with zones)
    let delivery_fee = 25.0;
    if (subtotal >= 500) delivery_fee = 0; // Free delivery for orders over 500 TRY

    const grand_total = subtotal + tax_total + delivery_fee;

    // Generate order number
    const order_no = await generateOrderNumber()

    // Prepare billing info
    const billing_type = billing?.type || 'individual';
    const billing_tax_number = billing?.tckn || billing?.vkn || null;
    const billing_company = billing?.company || null;

    // Create order
    const orderQuery = `
      INSERT INTO orders (
        order_no, cart_id, user_id, customer_name, customer_email, customer_phone,
        billing_type, billing_tax_number, billing_company, shipping_address,
        delivery_slot, subtotal, tax_total, shipping_total, grand_total,
        payment_method, payment_status, status, notes, created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, NOW()
      )
      RETURNING *
    `

    const orderValues = [
      order_no, cart.id, cart.user_id, customer.name, customer.email, customer.phone || null,
      billing_type, billing_tax_number, billing_company, JSON.stringify(shipping_address),
      delivery_slot ? JSON.stringify(delivery_slot) : null,
      subtotal, tax_total, delivery_fee, grand_total,
      payment_method, 'pending', 'pending', notes || null
    ]

    const orderResult = await query(orderQuery, orderValues)
    const order = orderResult.rows[0]

    // Create order status history entry
    const historyQuery = `
      INSERT INTO order_status_history (order_id, status, notes, created_at)
      VALUES ($1, $2, $3, NOW())
    `
    await query(historyQuery, [order.id, 'pending', 'Order created successfully'])

    // Update cart status to converted
    await query('UPDATE carts SET status = $1, updated_at = NOW() WHERE id = $2', ['converted', cart.id])

    return NextResponse.json({
      success: true,
      data: {
        id: order.id,
        order_no: order.order_no,
        status: order.status,
        payment_status: order.payment_status,
        customer: {
          name: order.customer_name,
          email: order.customer_email,
          phone: order.customer_phone
        },
        billing: billing_type === 'corporate' ? {
          type: billing_type,
          company: billing_company,
          vkn: billing_tax_number
        } : {
          type: billing_type,
          tckn: billing_tax_number
        },
        shipping_address: JSON.parse(order.shipping_address),
        delivery_slot: order.delivery_slot ? JSON.parse(order.delivery_slot) : null,
        summary: {
          subtotal: parseFloat(order.subtotal),
          tax_total: parseFloat(order.tax_total),
          delivery_fee: parseFloat(order.shipping_total),
          grand_total: parseFloat(order.grand_total),
          currency: 'TRY'
        },
        payment_method: order.payment_method,
        created_at: order.created_at
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Enhanced order creation error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Order creation failed' } },
      { status: 500 }
    )
  }
}