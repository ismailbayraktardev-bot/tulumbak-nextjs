import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/postgres'
import { AuthService, TokenPair } from '@/lib/auth'

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

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid email format' } },
        { status: 400 }
      )
    }

    // Find user by email
    const userQuery = `
      SELECT id, name, email, password_hash, role, is_active, created_at, updated_at
      FROM users
      WHERE email = $1
    `
    const result = await query(userQuery, [email])

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

    // Verify password
    const isValidPassword = await AuthService.verifyPassword(password, user.password_hash)
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } },
        { status: 401 }
      )
    }

    // Generate JWT tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    }

    const tokens: TokenPair = AuthService.generateTokenPair(tokenPayload)

    // Set secure HTTP-only cookies for tokens
    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          created_at: user.created_at
        },
        message: 'Login successful'
      }
    })

    // Set access token cookie (15 minutes)
    response.cookies.set('access_token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 minutes
      path: '/'
    })

    // Set refresh token cookie (7 days)
    response.cookies.set('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Login failed' } },
      { status: 500 }
    )
  }
}