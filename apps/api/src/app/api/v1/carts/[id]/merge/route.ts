import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/postgres'

// PUT /api/v1/carts/[id]/merge - Merge guest cart into user cart
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { guest_cart_id, user_id } = body

    // Validate required fields
    if (!guest_cart_id || !user_id) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Guest cart ID and user ID are required' } },
        { status: 400 }
      )
    }

    // Find guest cart
    const guestCartQuery = `
      SELECT * FROM carts
      WHERE guest_cart_id = $1 AND status = 'active' AND expires_at > NOW()
    `
    const guestCartResult = await query(guestCartQuery, [guest_cart_id])

    if (guestCartResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Guest cart not found or expired' } },
        { status: 404 }
      )
    }

    const guestCart = guestCartResult.rows[0]

    // Find or create user cart
    let userCart = null
    const existingUserCartQuery = `
      SELECT * FROM carts
      WHERE user_id = $1 AND status = 'active'
      ORDER BY created_at DESC
      LIMIT 1
    `
    const existingUserCartResult = await query(existingUserCartQuery, [user_id])

    if (existingUserCartResult.rows.length > 0) {
      userCart = existingUserCartResult.rows[0]
    } else {
      // Create new user cart
      const newUserCartQuery = `
        INSERT INTO carts (user_id, status)
        VALUES ($1, 'active')
        RETURNING *
      `
      const newUserCartResult = await query(newUserCartQuery, [user_id])
      userCart = newUserCartResult.rows[0]
    }

    // Get items from guest cart
    const guestItemsQuery = `
      SELECT ci.*,
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
    const guestItemsResult = await query(guestItemsQuery, [guestCart.id])
    const guestItems = guestItemsResult.rows

    let mergedItemsCount = 0

    // Merge items
    for (const guestItem of guestItems) {
      // Check if item already exists in user cart
      const existingItemQuery = `
        SELECT * FROM cart_items
        WHERE cart_id = $1 AND product_id = $2
      `
      const existingItemResult = await query(existingItemQuery, [userCart.id, guestItem.product_id])

      if (existingItemResult.rows.length > 0) {
        // Update existing item quantity
        const existingItem = existingItemResult.rows[0]
        const newQuantity = existingItem.quantity + guestItem.quantity
        const newTotalPrice = parseFloat(existingItem.unit_price) * newQuantity

        const updateQuery = `
          UPDATE cart_items
          SET quantity = $1, total_price = $2, updated_at = NOW()
          WHERE id = $3
        `
        await query(updateQuery, [newQuantity, newTotalPrice, existingItem.id])
        mergedItemsCount++
      } else {
        // Move item to user cart
        const moveQuery = `
          UPDATE cart_items
          SET cart_id = $1, updated_at = NOW()
          WHERE id = $2
        `
        await query(moveQuery, [userCart.id, guestItem.id])
        mergedItemsCount++
      }
    }

    // Mark guest cart as converted
    const updateGuestCartQuery = `
      UPDATE carts
      SET status = 'converted', updated_at = NOW()
      WHERE id = $1
    `
    await query(updateGuestCartQuery, [guestCart.id])

    // Get final merged cart summary
    const mergedCartQuery = `
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
    const mergedCartResult = await query(mergedCartQuery, [userCart.id])

    const items = mergedCartResult.rows.map(item => ({
      id: item.id,
      product_id: item.product_id,
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
    const kdvRate = 0.18 // 18% KDV
    const kdv = subtotal * kdvRate
    const total = subtotal + kdv

    return NextResponse.json({
      success: true,
      data: {
        merged_items: mergedItemsCount,
        user_cart: {
          id: userCart.id,
          user_id: userCart.user_id,
          status: userCart.status,
          items,
          summary: {
            items_count: items.length,
            subtotal: parseFloat(subtotal.toFixed(2)),
            kdv: parseFloat(kdv.toFixed(2)),
            total: parseFloat(total.toFixed(2))
          },
          updated_at: new Date().toISOString()
        },
        message: 'Guest cart successfully merged into user cart'
      }
    })

  } catch (error) {
    console.error('Cart merge error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to merge carts' } },
      { status: 500 }
    )
  }
}