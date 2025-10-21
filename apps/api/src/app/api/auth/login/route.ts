import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/postgres'
import crypto from 'crypto'

// POST /api/auth/login - User login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Email and password are required' } },
        { status: 400 }
      )
    }

    // Hash password to match database
    const password_hash = crypto.createHash('sha256').update(password).digest('hex')

    // Find user by email and password
    const userQuery = `
      SELECT id, name, email, role, is_active, created_at
      FROM users
      WHERE email = $1 AND password_hash = $2
    `
    const result = await query(userQuery, [email, password_hash])

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } },
        { status: 401 }
      )
    }

    const user = result.rows[0]

    // Check if user is active
    if (!user.is_active) {
      return NextResponse.json(
        { success: false, error: { code: 'ACCOUNT_DISABLED', message: 'Account is disabled' } },
        { status: 403 }
      )
    }

    // TODO: Generate JWT tokens (Sprint 4 implementation)
    // For now, return user without tokens
    // const accessToken = jwt.sign(...)
    // const refreshToken = jwt.sign(...)

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          created_at: user.created_at
        },
        // TODO: Add tokens when JWT is implemented
        // access_token: accessToken,
        // refresh_token: refreshToken,
        message: 'Login successful'
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Login failed' } },
      { status: 500 }
    )
  }
}