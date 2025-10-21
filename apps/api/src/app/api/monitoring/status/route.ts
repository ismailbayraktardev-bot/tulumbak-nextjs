import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const startTime = performance.now()
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  try {
    // Basic health checks
    const memUsage = process.memoryUsage()
    const uptime = process.uptime()

    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Math.round(uptime),
      memory: {
        used: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
        total: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
        external: Math.round(memUsage.external / 1024 / 1024) // MB
      },
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      request: {
        id: requestId,
        endpoint: '/api/monitoring/status',
        method: 'GET'
      }
    }

    const duration = performance.now() - startTime

    return NextResponse.json(healthData, {
      status: 200,
      headers: {
        'X-Request-ID': requestId,
        'X-Response-Time': `${Math.round(duration)}ms`,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })

  } catch (error) {
    const duration = performance.now() - startTime

    return NextResponse.json(
      {
        status: 'error',
        message: 'Health check failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        request: {
          id: requestId,
          endpoint: '/api/monitoring/status'
        }
      },
      {
        status: 503,
        headers: {
          'X-Request-ID': requestId,
          'X-Response-Time': `${Math.round(duration)}ms`
        }
      }
    )
  }
}