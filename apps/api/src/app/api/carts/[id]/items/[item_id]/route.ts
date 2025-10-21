import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/postgres'

// PATCH /api/carts/[id]/items/[item_id] - Update cart item quantity
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; item_id: string }> }
) {
  try {
    const { id, item_id } = await params
    const body = await request.json()
    const { quantity } = body

    if (!quantity || quantity <= 0) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Valid quantity is required' } },
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

    // Get cart item details
    const itemQuery = `
      SELECT ci.*, p.price
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.id = $1 AND ci.cart_id = $2
    `
    const itemResult = await query(itemQuery, [item_id, id])

    if (itemResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Cart item not found' } },
        { status: 404 }
      )
    }

    const item = itemResult.rows[0]
    const unitPrice = parseFloat(item.price)
    const newTotalPrice = unitPrice * quantity

    // Update cart item
    const updateQuery = `
      UPDATE cart_items
      SET quantity = $1, total_price = $2, updated_at = NOW()
      WHERE id = $3 AND cart_id = $4
      RETURNING *
    `
    const updateResult = await query(updateQuery, [quantity, newTotalPrice, item_id, id])

    return NextResponse.json({
      success: true,
      data: {
        ...updateResult.rows[0],
        action: 'updated'
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

// DELETE /api/carts/[id]/items/[item_id] - Remove item from cart
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; item_id: string }> }
) {
  try {
    const { id, item_id } = await params

    // Check if cart exists
    const cartQuery = `SELECT * FROM carts WHERE id = $1 AND status = 'active'`
    const cartResult = await query(cartQuery, [id])

    if (cartResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Cart not found' } },
        { status: 404 }
      )
    }

    // Delete cart item
    const deleteQuery = `
      DELETE FROM cart_items
      WHERE id = $1 AND cart_id = $2
      RETURNING *
    `
    const deleteResult = await query(deleteQuery, [item_id, id])

    if (deleteResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Cart item not found' } },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        ...deleteResult.rows[0],
        action: 'deleted'
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