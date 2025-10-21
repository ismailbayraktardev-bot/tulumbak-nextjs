import { NextRequest, NextResponse } from 'next/server'

// POST /api/auth/logout - Logout user and clear tokens
export async function POST(request: NextRequest) {
  try {
    // Clear authentication cookies
    const response = NextResponse.json({
      success: true,
      data: {
        message: 'Logged out successfully'
      }
    })

    // Clear access token cookie
    response.cookies.delete('access_token', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })

    // Clear refresh token cookie
    response.cookies.delete('refresh_token', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })

    return response

  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Logout failed'
        }
      },
      { status: 500 }
    )
  }
}