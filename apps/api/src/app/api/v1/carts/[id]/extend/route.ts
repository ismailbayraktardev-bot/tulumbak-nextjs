import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/postgres'

// POST /api/v1/carts/[id]/extend - Extend guest cart expiration
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { hours = 24 } = body

    // Validate hours
    if (!Number.isInteger(hours) || hours < 1 || hours > 168) { // Max 1 week
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Hours must be between 1 and 168' } },
        { status: 400 }
      )
    }

    // Extend guest cart expiration using database function
    const extendQuery = `
      SELECT extend_guest_cart_expiration($1, $2) as success
    `
    const result = await query(extendQuery, [id, hours])
    const wasExtended = result.rows[0].success

    if (!wasExtended) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Guest cart not found, expired, or cannot be extended' } },
        { status: 404 }
      )
    }

    // Get updated cart info
    const cartQuery = `
      SELECT id, guest_cart_id, expires_at, status, updated_at
      FROM carts
      WHERE guest_cart_id = $1
    `
    const cartResult = await query(cartQuery, [id])

    if (cartResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Cart not found after extension' } },
        { status: 404 }
      )
    }

    const cart = cartResult.rows[0]

    return NextResponse.json({
      success: true,
      data: {
        id: cart.id,
        guest_cart_id: cart.guest_cart_id,
        expires_at: cart.expires_at,
        status: cart.status,
        extended_by_hours: hours,
        extended_at: cart.updated_at,
        message: `Guest cart extended by ${hours} hours`
      }
    })

  } catch (error) {
    console.error('Cart extension error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to extend cart expiration' } },
      { status: 500 }
    )
  }
}