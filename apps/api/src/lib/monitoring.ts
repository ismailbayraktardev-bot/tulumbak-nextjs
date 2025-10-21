import { NextRequest, NextResponse } from 'next/server'
import { logger, PerformanceMonitor, HealthMetrics } from './logger'
import { addSecurityHeaders, handleCORS } from './security'

export interface MonitoringContext {
  requestId: string
  startTime: number
  userId?: string
  endpoint?: string
  method?: string
}

// Middleware for request monitoring
export async function withMonitoring(
  request: NextRequest,
  handler: (context: MonitoringContext) => Promise<NextResponse>
): Promise<NextResponse> {
  const startTime = performance.now()
  const requestId = logger.logRequest(request)

  const context: MonitoringContext = {
    requestId,
    startTime,
    method: request.method,
    endpoint: new URL(request.url).pathname
  }

  try {
    const response = await handler(context)

    const duration = performance.now() - startTime
    const statusCode = response.status

    // Log response with timing
    logger.logResponse(requestId, statusCode, duration, {
      endpoint: context.endpoint,
      method: context.method
    })

    // Record metrics
    HealthMetrics.recordRequest(duration, statusCode < 400)

    // Add monitoring headers
    response.headers.set('X-Request-ID', requestId)
    response.headers.set('X-Response-Time', `${Math.round(duration)}ms`)

    // Add security headers and handle CORS
    addSecurityHeaders(response)
    handleCORS(request, response)

    return response

  } catch (error) {
    const duration = performance.now() - startTime

    // Log error
    logger.error('Request failed', {
      requestId,
      endpoint: context.endpoint,
      method: context.method,
      duration,
      error: error instanceof Error ? error.message : 'Unknown error'
    })

    // Record metrics
    HealthMetrics.recordRequest(duration, false)

    // Return error response
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
          requestId
        }
      },
      {
        status: 500,
        headers: {
          'X-Request-ID': requestId,
          'X-Response-Time': `${Math.round(duration)}ms`
        }
      }
    )
  }
}

// Enhanced error monitoring
export function monitorError(
  error: Error,
  context: {
    endpoint?: string
    method?: string
    userId?: string
    requestId?: string
    [key: string]: any
  }
) {
  logger.error('Application error', {
    error: error.message,
    stack: error.stack,
    ...context
  })
}

// Performance monitoring for database operations
export async function monitorDbOperation<T>(
  operation: string,
  fn: () => Promise<T>,
  context?: { [key: string]: any }
): Promise<T> {
  return PerformanceMonitor.logDbQuery(operation, fn, context)
}

// Security event monitoring
export function logSecurityEvent(
  event: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  context: {
    ip?: string
    userAgent?: string
    userId?: string
    endpoint?: string
    [key: string]: any
  }
) {
  logger.warn(`Security event: ${event}`, {
    securityEvent: event,
    severity,
    ...context
  })
}

// API usage analytics
export class ApiAnalytics {
  private static stats = new Map<string, {
    count: number
    totalTime: number
    errors: number
    lastAccess: number
  }>()

  static recordEndpointAccess(
    endpoint: string,
    duration: number,
    success: boolean
  ) {
    if (!this.stats.has(endpoint)) {
      this.stats.set(endpoint, {
        count: 0,
        totalTime: 0,
        errors: 0,
        lastAccess: Date.now()
      })
    }

    const stats = this.stats.get(endpoint)!
    stats.count++
    stats.totalTime += duration
    stats.lastAccess = Date.now()

    if (!success) {
      stats.errors++
    }
  }

  static getEndpointStats() {
    return Array.from(this.stats.entries()).map(([endpoint, stats]) => ({
      endpoint,
      requests: stats.count,
      averageResponseTime: Math.round(stats.totalTime / stats.count),
      errorRate: Math.round((stats.errors / stats.count) * 100),
      lastAccess: new Date(stats.lastAccess).toISOString()
    }))
  }

  static getTopEndpoints(limit = 10) {
    return this.getEndpointStats()
      .sort((a, b) => b.requests - a.requests)
      .slice(0, limit)
  }

  static getSlowEndpoints(limit = 10) {
    return this.getEndpointStats()
      .filter(endpoint => endpoint.requests > 5) // Only endpoints with at least 5 requests
      .sort((a, b) => b.averageResponseTime - a.averageResponseTime)
      .slice(0, limit)
  }

  static reset() {
    this.stats.clear()
  }
}