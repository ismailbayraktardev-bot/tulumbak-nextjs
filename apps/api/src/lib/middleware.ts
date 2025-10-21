import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest, authorize, JWTPayload } from './auth'
import { applyRateLimit } from './rate-limiter'
import { withMonitoring, MonitoringContext } from './monitoring'
import { addSecurityHeaders, handleCORS, validateInput, Schemas, logSecurityEvent } from './security'

/**
 * Rate limiting middleware wrapper
 */
async function withRateLimit(
  request: NextRequest,
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  const path = new URL(request.url).pathname
  const rateLimitResult = await applyRateLimit(request, path)

  if (!rateLimitResult.success) {
    return rateLimitResult
  }

  const response = await handler()

  // Add rate limit headers to successful responses
  if (rateLimitResult.headers) {
    Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
  }

  return response
}

/**
 * Authentication middleware for API routes
 */
export async function withAuth(
  request: NextRequest,
  handler: (request: NextRequest, user: JWTPayload, context: MonitoringContext) => Promise<NextResponse>,
  requiredRole?: string
): Promise<NextResponse> {
  return withMonitoring(request, async (context) => {
    return withRateLimit(request, async () => {
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

        // Add user ID to monitoring context
        context.userId = authResult.user.id

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

        // Execute handler with authenticated user and context
        return await handler(request, authResult.user, context)
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
    })
  })
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
  handler: (request: NextRequest, user?: JWTPayload, context?: MonitoringContext) => Promise<NextResponse>
): Promise<NextResponse> {
  return withMonitoring(request, async (context) => {
    return withRateLimit(request, async () => {
      try {
        const authResult = authenticateRequest(request)

        // Add user ID to monitoring context if authenticated
        if (authResult.success && authResult.user) {
          context.userId = authResult.user.id
        }

        // Continue with or without user
        return await handler(request, authResult.success ? authResult.user : undefined, context)
      } catch (error) {
        console.error('Optional auth middleware error:', error)
        // Continue without user on error
        return await handler(request, undefined, context)
      }
    })
  })
}

/**
 * Public middleware with rate limiting only (no authentication)
 */
export async function withPublicRateLimit(
  request: NextRequest,
  handler: (request: NextRequest, context: MonitoringContext) => Promise<NextResponse>
): Promise<NextResponse> {
  return withMonitoring(request, async (context) => {
    return withRateLimit(request, async () => {
      return await handler(request, context)
    })
  })
}