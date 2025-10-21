import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/postgres'
import crypto from 'crypto'

// POST /api/auth/register - User registration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, phone } = body

    // Basic validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Name, email and password are required' } },
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

    // Password validation (min 6 characters)
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Password must be at least 6 characters' } },
        { status: 400 }
      )
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

    // Hash password (simple hash for now - in production use bcrypt)
    const password_hash = crypto.createHash('sha256').update(password).digest('hex')

    // Create user
    const insertQuery = `
      INSERT INTO users (name, email, password_hash, phone, role, is_active, created_at)
      VALUES ($1, $2, $3, $4, 'customer', true, NOW())
      RETURNING id, name, email, role, created_at
    `
    const values = [name, email, password_hash, phone || null]

    const result = await query(insertQuery, values)
    const user = result.rows[0]

    // TODO: Generate JWT tokens (Sprint 4 implementation)
    // For now, return user without tokens

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
        message: 'User registered successfully'
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Registration failed' } },
      { status: 500 }
    )
  }
}