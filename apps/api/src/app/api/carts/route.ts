import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/postgres'
import { randomUUID } from 'crypto'

// POST /api/carts - Create or get cart
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { session_id, user_id } = body

    // If session_id provided, try to find existing cart
    if (session_id) {
      const existingCartQuery = `
        SELECT * FROM carts
        WHERE session_id = $1 AND status = 'active'
        ORDER BY created_at DESC
        LIMIT 1
      `
      const existingResult = await query(existingCartQuery, [session_id])

      if (existingResult.rows.length > 0) {
        return NextResponse.json({
          success: true,
          data: existingResult.rows[0]
        })
      }
    }

    // Create new cart
    const createCartQuery = `
      INSERT INTO carts (session_id, user_id, status)
      VALUES ($1, $2, 'active')
      RETURNING *
    `

    const sessionId = session_id || randomUUID()
    const result = await query(createCartQuery, [sessionId, user_id || null])

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

// GET /api/carts - List carts (admin only)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const session_id = searchParams.get('session_id')
    const user_id = searchParams.get('user_id')

    let whereClause = 'WHERE status = \'active\''
    const params: any[] = []
    let paramIndex = 1

    if (session_id) {
      whereClause += ` AND session_id = $${paramIndex}`
      params.push(session_id)
      paramIndex++
    }

    if (user_id) {
      whereClause += ` AND user_id = $${paramIndex}`
      params.push(user_id)
      paramIndex++
    }

    const cartsQuery = `
      SELECT * FROM carts
      ${whereClause}
      ORDER BY created_at DESC
    `

    const result = await query(cartsQuery, params)

    return NextResponse.json({
      success: true,
      data: result.rows
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}