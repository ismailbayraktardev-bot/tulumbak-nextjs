import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/postgres'

// GET /api/v1/carts/[id]/summary - Get cart summary with items and totals
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Find cart (supports both user and guest carts)
    const cartQuery = `
      SELECT * FROM carts
      WHERE (id = $1 OR guest_cart_id = $1)
      AND status = 'active'
      AND (guest_cart_id IS NULL OR expires_at > NOW())
    `
    const cartResult = await query(cartQuery, [id])

    if (cartResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Cart not found or expired' } },
        { status: 404 }
      )
    }

    const cart = cartResult.rows[0]

    // Get cart items with product details
    const itemsQuery = `
      SELECT
        ci.*,
        p.name as product_name,
        p.slug as product_slug,
        p.images as product_images,
        p.price as current_product_price,
        p.stock_qty as current_stock,
        p.is_active as product_active,
        c.name as category_name,
        c.slug as category_slug
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      WHERE ci.cart_id = $1
      ORDER BY ci.created_at DESC
    `
    const itemsResult = await query(itemsQuery, [cart.id])

    // Process items and check validity
    const items = []
    let invalidItems = 0

    for (const item of itemsResult.rows) {
      const isItemValid = item.product_active && item.current_stock >= item.quantity

      items.push({
        id: item.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: parseFloat(item.unit_price),
        total_price: parseFloat(item.total_price),
        attributes: item.attributes,
        is_valid: isItemValid,
        validation_issues: !isItemValid ? [
          !item.product_active ? 'Product is no longer available' : null,
          item.current_stock < item.quantity ? `Insufficient stock (${item.current_stock} available)` : null
        ].filter(Boolean) : [],
        product: {
          name: item.product_name,
          slug: item.product_slug,
          images: item.product_images,
          current_price: parseFloat(item.current_product_price),
          stock_qty: item.current_stock,
          is_active: item.product_active,
          category: {
            name: item.category_name,
            slug: item.category_slug
          }
        },
        created_at: item.created_at,
        updated_at: item.updated_at
      })

      if (!isItemValid) {
        invalidItems++
      }
    }

    // Calculate totals only for valid items
    const validItems = items.filter(item => item.is_valid)
    const subtotal = validItems.reduce((sum, item) => sum + item.total_price, 0)
    const kdvRate = 0.18 // 18% KDV
    const kdv = subtotal * kdvRate
    const total = subtotal + kdv

    // Determine if cart can be checked out
    const canCheckout = validItems.length > 0 && invalidItems === 0

    return NextResponse.json({
      success: true,
      data: {
        id: cart.id,
        guest_cart_id: cart.guest_cart_id,
        user_id: cart.user_id,
        status: cart.status,
        expires_at: cart.expires_at,
        items_count: items.length,
        valid_items_count: validItems.length,
        invalid_items_count: invalidItems,
        can_checkout: canCheckout,
        items,
        summary: {
          subtotal: parseFloat(subtotal.toFixed(2)),
          kdv: parseFloat(kdv.toFixed(2)),
          total: parseFloat(total.toFixed(2)),
          currency: 'TRY'
        },
        created_at: cart.created_at,
        updated_at: cart.updated_at
      }
    })

  } catch (error) {
    console.error('Cart summary error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get cart summary' } },
      { status: 500 }
    )
  }
}