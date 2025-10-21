import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/postgres'

// Generate guest cart ID function
function generateGuestCartId(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substr(2, 9)
  return `guest_${timestamp}_${random}`
}

// POST /api/v1/carts/guest - Create guest cart
export async function POST(request: NextRequest) {
  try {
    // Generate guest cart ID
    const guestCartId = generateGuestCartId()

    // Generate session token
    const sessionToken = Buffer.from(`${guestCartId}_${Date.now()}`).toString('base64')

    // Create guest cart
    const insertQuery = `
      INSERT INTO carts (guest_cart_id, session_token, status, expires_at)
      VALUES ($1, $2, 'active', NOW() + INTERVAL '24 hours')
      RETURNING id, guest_cart_id, session_token, status, expires_at, created_at
    `
    const result = await query(insertQuery, [guestCartId, sessionToken])
    const cart = result.rows[0]

    return NextResponse.json({
      success: true,
      data: {
        id: cart.id,
        guest_cart_id: cart.guest_cart_id,
        session_token: cart.session_token,
        expires_at: cart.expires_at,
        status: cart.status,
        created_at: cart.created_at
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Guest cart creation error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create guest cart' } },
      { status: 500 }
    )
  }
}