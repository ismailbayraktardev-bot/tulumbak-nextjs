import { NextRequest, NextResponse } from 'next/server'
import { withOptionalAuth } from '@/lib/middleware'
import { query } from '@/lib/postgres'

// GET /api/auth/me - Get current authenticated user
export async function GET(request: NextRequest) {
  return withOptionalAuth(request, async (request, user) => {
    try {
      if (!user) {
        return NextResponse.json({
          success: false,
          error: {
            code: 'NOT_AUTHENTICATED',
            message: 'User not authenticated'
          }
        }, { status: 401 })
      }

      // Get full user data from database
      const userQuery = `
        SELECT id, name, first_name, last_name, email, phone, role, is_active, created_at, updated_at
        FROM users
        WHERE id = $1
      `
      const result = await query(userQuery, [user.userId])

      if (result.rows.length === 0) {
        return NextResponse.json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found'
          }
        }, { status: 404 })
      }

      const userData = result.rows[0]

      return NextResponse.json({
        success: true,
        data: userData
      })

    } catch (error) {
      console.error('Get user info error:', error)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to get user info'
          }
        },
        { status: 500 }
      )
    }
  })
}