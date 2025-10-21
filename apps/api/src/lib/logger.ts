import { NextRequest } from 'next/server'

export interface LogContext {
  requestId?: string
  userId?: string
  ip?: string
  userAgent?: string
  method?: string
  url?: string
  statusCode?: number
  duration?: number
  error?: string
  [key: string]: any
}

export interface LogEntry {
  timestamp: string
  level: 'debug' | 'info' | 'warn' | 'error'
  message: string
  context?: LogContext
  service: string
  version?: string
}

class Logger {
  private serviceName = 'tulumbak-api'
  private version = process.env.npm_package_version || '1.0.0'

  private formatLog(entry: LogEntry): string {
    return JSON.stringify({
      ...entry,
      timestamp: new Date().toISOString(),
      service: this.serviceName,
      version: this.version
    })
  }

  private shouldLog(level: string): boolean {
    const logLevel = process.env.LOG_LEVEL || 'info'
    const levels = { debug: 0, info: 1, warn: 2, error: 3 }
    return levels[level as keyof typeof levels] >= levels[logLevel as keyof typeof levels]
  }

  private log(level: LogEntry['level'], message: string, context?: LogContext) {
    if (!this.shouldLog(level)) return

    const entry: LogEntry = {
      level,
      message,
      context,
      service: this.serviceName,
      version: this.version
    }

    const formatted = this.formatLog(entry)

    switch (level) {
      case 'debug':
        console.debug(formatted)
        break
      case 'info':
        console.info(formatted)
        break
      case 'warn':
        console.warn(formatted)
        break
      case 'error':
        console.error(formatted)
        break
    }
  }

  debug(message: string, context?: LogContext) {
    this.log('debug', message, context)
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context)
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context)
  }

  error(message: string, context?: LogContext) {
    this.log('error', message, context)
  }

  // Request-specific logging
  logRequest(request: NextRequest, context: Partial<LogContext> = {}) {
    const requestId = this.generateRequestId()
    const logContext: LogContext = {
      requestId,
      method: request.method,
      url: request.url,
      ip: this.getClientIP(request),
      userAgent: request.headers.get('user-agent') || undefined,
      ...context
    }

    this.info('Incoming request', logContext)
    return requestId
  }

  logResponse(requestId: string, statusCode: number, duration: number, context: Partial<LogContext> = {}) {
    const logContext: LogContext = {
      requestId,
      statusCode,
      duration,
      ...context
    }

    if (statusCode >= 400) {
      this.warn('Request completed with error', logContext)
    } else {
      this.info('Request completed', logContext)
    }
  }

  logError(error: Error, context: Partial<LogContext> = {}) {
    const logContext: LogContext = {
      error: error.message,
      stack: error.stack,
      ...context
    }

    this.error('Request error', logContext)
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private getClientIP(request: NextRequest): string {
    return (
      request.ip ||
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown'
    )
  }
}

export const logger = new Logger()

// Performance monitoring
export class PerformanceMonitor {
  private static timers = new Map<string, number>()

  static startTimer(name: string): string {
    const id = `${name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    this.timers.set(id, performance.now())
    return id
  }

  static endTimer(id: string): number {
    const startTime = this.timers.get(id)
    if (!startTime) {
      logger.warn('Timer not found', { timerId: id })
      return 0
    }

    const duration = performance.now() - startTime
    this.timers.delete(id)

    logger.debug('Performance timer', {
      timerId: id,
      duration: Math.round(duration * 100) / 100
    })

    return duration
  }

  // Database query performance
  static async logDbQuery<T>(
    query: string,
    fn: () => Promise<T>,
    context: Partial<LogContext> = {}
  ): Promise<T> {
    const timerId = this.startTimer('db_query')

    try {
      const result = await fn()
      const duration = this.endTimer(timerId)

      logger.debug('Database query completed', {
        query: query.substring(0, 100) + (query.length > 100 ? '...' : ''),
        duration,
        ...context
      })

      return result
    } catch (error) {
      const duration = this.endTimer(timerId)

      logger.error('Database query failed', {
        query: query.substring(0, 100) + (query.length > 100 ? '...' : ''),
        duration,
        error: error instanceof Error ? error.message : 'Unknown error',
        ...context
      })

      throw error
    }
  }
}

// Health check metrics
export class HealthMetrics {
  private static metrics = {
    requestsTotal: 0,
    requestsSuccess: 0,
    requestsError: 0,
    averageResponseTime: 0,
    uptime: Date.now()
  }

  static recordRequest(duration: number, success: boolean) {
    this.metrics.requestsTotal++

    if (success) {
      this.metrics.requestsSuccess++
    } else {
      this.metrics.requestsError++
    }

    // Update average response time
    this.metrics.averageResponseTime =
      (this.metrics.averageResponseTime * (this.metrics.requestsTotal - 1) + duration) /
      this.metrics.requestsTotal
  }

  static getMetrics() {
    return {
      ...this.metrics,
      uptime: Date.now() - this.metrics.uptime,
      errorRate: this.metrics.requestsTotal > 0
        ? (this.metrics.requestsError / this.metrics.requestsTotal) * 100
        : 0
    }
  }

  static reset() {
    this.metrics = {
      requestsTotal: 0,
      requestsSuccess: 0,
      requestsError: 0,
      averageResponseTime: 0,
      uptime: Date.now()
    }
  }
}