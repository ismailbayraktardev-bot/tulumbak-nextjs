import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/postgres'
import { AuthService, TokenPair } from '@/lib/auth'

// POST /api/auth/register - User registration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { first_name, last_name, email, password, phone } = body

    // Basic validation
    if (!first_name || !last_name || !email || !password) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'First name, last name, email and password are required' } },
        { status: 400 }
      )
    }

    // Name validation
    const firstName = first_name.trim()
    const lastName = last_name.trim()
    const fullName = `${firstName} ${lastName}`

    if (firstName.length < 2 || firstName.length > 50) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'First name must be between 2 and 50 characters' } },
        { status: 400 }
      )
    }

    if (lastName.length < 2 || lastName.length > 50) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Last name must be between 2 and 50 characters' } },
        { status: 400 }
      )
    }

    if (fullName.length > 120) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Full name must be less than 120 characters' } },
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

    // Password validation
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Password must be at least 6 characters' } },
        { status: 400 }
      )
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Password must contain at least one lowercase letter, one uppercase letter, and one number' } },
        { status: 400 }
      )
    }

    // Phone validation (optional)
    if (phone && phone.trim()) {
      const phoneRegex = /^\+?[\d\s\-\(\)]+$/
      if (!phoneRegex.test(phone) || phone.replace(/\D/g, '').length < 10) {
        return NextResponse.json(
          { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid phone number' } },
          { status: 400 }
        )
      }
    }

    // Check if user already exists
    const existingUserQuery = `SELECT id FROM users WHERE email = $1`
    const existingUserResult = await query(existingUserQuery, [email])

    if (existingUserResult.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: { code: 'USER_EXISTS', message: 'User with this email already exists' } },
        { status: 409 }
      )
    }

    // Hash password using bcrypt
    const password_hash = await AuthService.hashPassword(password)

    // Create user
    const insertQuery = `
      INSERT INTO users (name, first_name, last_name, email, password_hash, phone, role, is_active, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, 'customer', true, NOW(), NOW())
      RETURNING id, name, first_name, last_name, email, role, is_active, created_at
    `
    const values = [fullName, firstName, lastName, email.toLowerCase().trim(), password_hash, phone?.trim() || null]

    const result = await query(insertQuery, values)
    const user = result.rows[0]

    // Generate JWT tokens for immediate login
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
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          role: user.role,
          is_active: user.is_active,
          created_at: user.created_at,
          updated_at: user.updated_at
        },
        message: 'User registered successfully'
      }
    }, { status: 201 })

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
    console.error('Registration error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Registration failed' } },
      { status: 500 }
    )
  }
}