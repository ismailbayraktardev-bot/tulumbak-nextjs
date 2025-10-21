import { NextRequest, NextResponse } from 'next/server'
import { getRedisClient } from './redis'

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  keyGenerator?: (request: NextRequest) => string // Custom key generator
  skipSuccessfulRequests?: boolean // Don't count successful requests
  skipFailedRequests?: boolean // Don't count failed requests
}

interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  resetTime: number
  retryAfter?: number
}

export class RateLimiter {
  private redis = getRedisClient()

  constructor(private config: RateLimitConfig) {}

  // Default key generator based on IP and optionally user ID
  private defaultKeyGenerator(request: NextRequest): string {
    const ip = request.ip ||
               request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               'unknown'

    const userId = request.headers.get('x-user-id')
    return userId ? `rate_limit:user:${userId}` : `rate_limit:ip:${ip}`
  }

  // Sliding window rate limiting using Redis
  async checkLimit(request: NextRequest): Promise<RateLimitResult> {
    const keyGenerator = this.config.keyGenerator || this.defaultKeyGenerator
    const key = keyGenerator(request)
    const now = Date.now()
    const window = this.config.windowMs
    const maxRequests = this.config.maxRequests

    try {
      // Use Redis pipeline for atomic operations
      const pipeline = this.redis.pipeline()

      // Remove expired entries
      pipeline.zremrangebyscore(key, 0, now - window)

      // Count current requests in window
      pipeline.zcard(key)

      // Add current request
      pipeline.zadd(key, now, `${now}-${Math.random()}`)

      // Set expiration for the key
      pipeline.expire(key, Math.ceil(window / 1000))

      const results = await pipeline.exec()
      const currentCount = results?.[1]?.[1] as number || 0

      const success = currentCount < maxRequests
      const remaining = Math.max(0, maxRequests - currentCount - 1)
      const resetTime = now + window

      if (!success) {
        // Find the oldest request to calculate retry after
        const oldest = await this.redis.zrange(key, 0, 0, 'WITHSCORES')
        if (oldest.length > 0) {
          const oldestTime = parseInt(oldest[1])
          const retryAfter = Math.ceil((oldestTime + window - now) / 1000)
          return {
            success: false,
            limit: maxRequests,
            remaining: 0,
            resetTime,
            retryAfter
          }
        }
      }

      return {
        success,
        limit: maxRequests,
        remaining,
        resetTime
      }

    } catch (error) {
      console.error('Rate limiting error:', error)
      // If Redis fails, allow the request (fail open)
      return {
        success: true,
        limit: maxRequests,
        remaining: maxRequests - 1,
        resetTime: now + window
      }
    }
  }

  // Middleware function
  async middleware(request: NextRequest) {
    const result = await this.checkLimit(request)

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Too Many Requests',
          message: 'Rate limit exceeded',
          limit: result.limit,
          resetTime: result.resetTime
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': result.limit.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': result.resetTime.toString(),
            'Retry-After': (result.retryAfter || 60).toString(),
            'Cache-Control': 'no-store, no-cache, must-revalidate'
          }
        }
      )
    }

    return {
      success: true,
      headers: {
        'X-RateLimit-Limit': result.limit.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': result.resetTime.toString()
      }
    }
  }
}

// Predefined rate limiters for different use cases
export const rateLimiters = {
  // General API limiter - 100 requests per 15 minutes
  api: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100
  }),

  // Strict limiter for authentication endpoints - 5 requests per minute
  auth: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5
  }),

  // Payment endpoints limiter - 10 requests per minute
  payment: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10
  }),

  // Very strict limiter for password reset - 3 requests per hour
  passwordReset: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3
  }),

  // Upload endpoints limiter - 20 requests per 5 minutes
  upload: new RateLimiter({
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 20
  }),

  // Search endpoints limiter - 60 requests per minute
  search: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60
  })
}

// Helper function to apply rate limiting based on path
export function getRateLimiterForPath(path: string): RateLimiter {
  if (path.startsWith('/api/auth/login') || path.startsWith('/api/auth/register')) {
    return rateLimiters.auth
  }
  if (path.startsWith('/api/payments') || path.startsWith('/api/webhooks')) {
    return rateLimiters.payment
  }
  if (path.startsWith('/api/auth/reset-password')) {
    return rateLimiters.passwordReset
  }
  if (path.startsWith('/api/upload')) {
    return rateLimiters.upload
  }
  if (path.startsWith('/api/search')) {
    return rateLimiters.search
  }

  return rateLimiters.api
}

// Rate limiting middleware wrapper
export async function applyRateLimit(request: NextRequest, path: string) {
  const rateLimiter = getRateLimiterForPath(path)
  return await rateLimiter.middleware(request)
}