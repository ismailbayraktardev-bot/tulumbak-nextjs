import { NextRequest, NextResponse } from 'next/server'
import { AuthService, extractTokenFromHeader } from '@/lib/auth'

// POST /api/auth/refresh - Refresh access token using refresh token
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const refreshTokenFromHeader = extractTokenFromHeader(authHeader)

    // Try to get refresh token from Authorization header first
    let refreshToken = refreshTokenFromHeader

    // Fall back to cookie
    if (!refreshToken) {
      const cookieHeader = request.headers.get('cookie')
      if (cookieHeader) {
        const cookies = cookieHeader.split(';').map(cookie => cookie.trim())
        const refreshCookie = cookies.find(cookie => cookie.startsWith('refresh_token='))
        if (refreshCookie) {
          refreshToken = refreshCookie.substring('refresh_token='.length)
        }
      }
    }

    if (!refreshToken) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Refresh token is required'
          }
        },
        { status: 400 }
      )
    }

    // Verify refresh token
    const decoded = AuthService.verifyRefreshToken(refreshToken)

    // Get user from database (you'll need to implement this)
    // For now, we'll create a basic token pair
    const tokenPayload = {
      userId: decoded.userId,
      email: '', // You'll need to fetch this from database
      role: 'customer', // Default role, should be fetched from database
      name: '' // You'll need to fetch this from database
    }

    // Generate new token pair
    const newTokens = AuthService.generateTokenPair(tokenPayload)

    // Set new access token cookie
    const response = NextResponse.json({
      success: true,
      data: {
        message: 'Token refreshed successfully'
      }
    })

    response.cookies.set('access_token', newTokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 minutes
      path: '/'
    })

    // Optionally update refresh token cookie with new one
    response.cookies.set('refresh_token', newTokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Token refresh error:', error)

    // Clear invalid tokens
    const response = NextResponse.json(
      {
        success: false,
        error: {
          code: 'TOKEN_REFRESH_FAILED',
          message: error instanceof Error ? error.message : 'Failed to refresh token'
        }
      },
      { status: 401 }
    )

    // Clear cookies on error
    response.cookies.delete('access_token', { path: '/' })
    response.cookies.delete('refresh_token', { path: '/' })

    return response
  }
}