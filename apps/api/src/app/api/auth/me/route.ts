import { NextRequest, NextResponse } from 'next/server'
import { withOptionalAuth } from '@/lib/middleware'

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

      return NextResponse.json({
        success: true,
        data: {
          user: {
            id: user.userId,
            name: user.name,
            email: user.email,
            role: user.role
          }
        }
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