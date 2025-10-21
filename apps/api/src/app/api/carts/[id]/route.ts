import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/postgres'

// GET /api/carts/[id] - Get cart with items and calculations
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get cart details
    const cartQuery = `
      SELECT * FROM carts
      WHERE id = $1 AND status = 'active'
    `
    const cartResult = await query(cartQuery, [id])

    if (cartResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Cart not found' } },
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
        c.name as category_name,
        c.slug as category_slug
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      WHERE ci.cart_id = $1
      ORDER BY ci.created_at DESC
    `
    const itemsResult = await query(itemsQuery, [id])

    // Calculate totals
    const items = itemsResult.rows.map(item => ({
      id: item.id,
      product_id: item.product_id,
      variant_id: item.variant_id,
      quantity: item.quantity,
      unit_price: parseFloat(item.unit_price),
      total_price: parseFloat(item.total_price),
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

    const subtotal = items.reduce((sum, item) => sum + item.total_price, 0)
    const tax_total = subtotal * 0.18 // 18% KDV
    const shipping_total = 0 // Ücretsiz kargo
    const grand_total = subtotal + tax_total + shipping_total

    return NextResponse.json({
      success: true,
      data: {
        ...cart,
        items,
        summary: {
          subtotal: parseFloat(subtotal.toFixed(2)),
          tax_total: parseFloat(tax_total.toFixed(2)),
          shipping_total: parseFloat(shipping_total.toFixed(2)),
          grand_total: parseFloat(grand_total.toFixed(2)),
          currency: cart.currency
        }
      }
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}