import { NextRequest, NextResponse } from 'next/server'
import { withPublicRateLimit } from '@/lib/middleware'
import { MonitoringContext } from '@/lib/monitoring'

export async function GET(request: NextRequest) {
  return withPublicRateLimit(request, async (context: MonitoringContext) => {
    return NextResponse.json({
      success: true,
      message: 'Rate limiting test endpoint',
      timestamp: new Date().toISOString(),
      path: '/api/test/rate-limit',
      requestId: context.requestId,
      monitoring: {
        endpoint: context.endpoint,
        method: context.method,
        startTime: context.startTime
      }
    })
  })
}

export async function POST(request: NextRequest) {
  return withPublicRateLimit(request, async (context: MonitoringContext) => {
    const body = await request.json().catch(() => ({}))

    return NextResponse.json({
      success: true,
      message: 'Rate limiting POST test',
      timestamp: new Date().toISOString(),
      received: body,
      requestId: context.requestId,
      monitoring: {
        endpoint: context.endpoint,
        method: context.method,
        startTime: context.startTime
      }
    })
  })
}