import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/postgres'

// POST /api/carts/[id]/items - Add item to cart
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { product_id, variant_id, quantity, attributes } = body

    // Validate required fields
    if (!product_id || !quantity || quantity <= 0) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Product ID and quantity are required' } },
        { status: 400 }
      )
    }

    // Check if cart exists
    const cartQuery = `SELECT * FROM carts WHERE id = $1 AND status = 'active'`
    const cartResult = await query(cartQuery, [id])

    if (cartResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Cart not found' } },
        { status: 404 }
      )
    }

    // Get product details
    const productQuery = `
      SELECT p.*
      FROM products p
      WHERE p.id = $1 AND p.is_active = true
    `
    const productResult = await query(productQuery, [product_id])

    if (productResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Product not found' } },
        { status: 404 }
      )
    }

    const product = productResult.rows[0]
    const unitPrice = parseFloat(product.price)
    const totalPrice = unitPrice * quantity

    // Check if item already exists in cart
    const existingItemQuery = `
      SELECT * FROM cart_items
      WHERE cart_id = $1 AND product_id = $2
      ${variant_id ? 'AND variant_id = $3' : 'AND variant_id IS NULL'}
    `
    const existingItemResult = await query(existingItemQuery,
      variant_id ? [id, product_id, variant_id] : [id, product_id]
    )

    if (existingItemResult.rows.length > 0) {
      // Update existing item
      const existingItem = existingItemResult.rows[0]
      const newQuantity = existingItem.quantity + quantity
      const newTotalPrice = unitPrice * newQuantity

      const updateQuery = `
        UPDATE cart_items
        SET quantity = $1, total_price = $2, updated_at = NOW()
        WHERE id = $3
      `
      await query(updateQuery, [newQuantity, newTotalPrice, existingItem.id])

      return NextResponse.json({
        success: true,
        data: {
          id: existingItem.id,
          cart_id: id,
          product_id,
          variant_id,
          quantity: newQuantity,
          unit_price: unitPrice,
          total_price: newTotalPrice,
          action: 'updated'
        }
      })
    } else {
      // Add new item
      const insertQuery = `
        INSERT INTO cart_items (cart_id, product_id, variant_id, quantity, unit_price, total_price, attributes)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `
      const insertResult = await query(insertQuery, [
        id, product_id, variant_id, quantity, unitPrice, totalPrice, attributes || {}
      ])

      return NextResponse.json({
        success: true,
        data: {
          ...insertResult.rows[0],
          action: 'added'
        }
      }, { status: 201 })
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

// GET /api/carts/[id]/items - Get cart items
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

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
    const result = await query(itemsQuery, [id])

    const items = result.rows.map(item => ({
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

    return NextResponse.json({
      success: true,
      data: items
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}