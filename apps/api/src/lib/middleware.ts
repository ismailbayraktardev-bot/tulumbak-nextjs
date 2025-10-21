import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest, authorize, JWTPayload } from './auth'

/**
 * Authentication middleware for API routes
 */
export async function withAuth(
  request: NextRequest,
  handler: (request: NextRequest, user: JWTPayload) => Promise<NextResponse>,
  requiredRole?: string
): Promise<NextResponse> {
  try {
    // Authenticate user
    const authResult = authenticateRequest(request)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: authResult.error || 'Authentication required'
          }
        },
        { status: 401 }
      )
    }

    // Check role authorization if required
    if (requiredRole) {
      const authzResult = authorize(authResult.user, requiredRole)
      if (!authzResult.success) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: authzResult.error || 'Insufficient permissions'
            }
          },
          { status: 403 }
        )
      }
    }

    // Execute handler with authenticated user
    return await handler(request, authResult.user)
  } catch (error) {
    console.error('Auth middleware error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Authentication failed'
        }
      },
      { status: 500 }
    )
  }
}

/**
 * Middleware for admin-only routes
 */
export async function withAdminAuth(
  request: NextRequest,
  handler: (request: NextRequest, user: JWTPayload) => Promise<NextResponse>
): Promise<NextResponse> {
  return withAuth(request, handler, 'admin')
}

/**
 * Middleware for super admin-only routes
 */
export async function withSuperAdminAuth(
  request: NextRequest,
  handler: (request: NextRequest, user: JWTPayload) => Promise<NextResponse>
): Promise<NextResponse> {
  return withAuth(request, handler, 'super_admin')
}

/**
 * Optional authentication middleware (doesn't fail if no token)
 */
export async function withOptionalAuth(
  request: NextRequest,
  handler: (request: NextRequest, user?: JWTPayload) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    const authResult = authenticateRequest(request)

    // Continue with or without user
    return await handler(request, authResult.success ? authResult.user : undefined)
  } catch (error) {
    console.error('Optional auth middleware error:', error)
    // Continue without user on error
    return await handler(request, undefined)
  }
}