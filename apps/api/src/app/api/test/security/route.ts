import { NextRequest, NextResponse } from 'next/server'
import { withPublicRateLimit } from '@/lib/middleware'
import { MonitoringContext } from '@/lib/monitoring'
import { validateRequest, Schemas, logSecurityEvent } from '@/lib/security'

export async function GET(request: NextRequest) {
  return withPublicRateLimit(request, async (context: MonitoringContext) => {
    return NextResponse.json({
      success: true,
      message: 'Security test endpoint',
      timestamp: new Date().toISOString(),
      path: '/api/test/security',
      requestId: context.requestId,
      security: {
        headers: {
          'X-Frame-Options': 'DENY',
          'X-Content-Type-Options': 'nosniff',
          'X-XSS-Protection': '1; mode=block',
          'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
        },
        cors: 'enabled',
        rateLimiting: 'enabled',
        inputValidation: 'enabled'
      }
    })
  })
}

export async function POST(request: NextRequest) {
  return withPublicRateLimit(request, async (context: MonitoringContext) => {
    try {
      const body = await request.json()

      // Test email validation
      const emailValidation = validateRequest(Schemas.register.pick({ email: true }), body)

      // Test SQL injection protection
      const hasSQLInjection = (body.test || '').includes('SELECT') || (body.test || '').includes('DROP')

      if (hasSQLInjection) {
        logSecurityEvent('SQL_INJECTION_ATTEMPT', 'high', {
          ip: request.headers.get('x-forwarded-for') || 'unknown',
          endpoint: '/api/test/security',
          details: `Suspicious input: ${body.test}`,
          requestId: context.requestId
        })
      }

      return NextResponse.json({
        success: true,
        message: 'Security validation test',
        timestamp: new Date().toISOString(),
        requestId: context.requestId,
        validation: {
          email: emailValidation.success ? 'valid' : emailValidation.error,
          sqlInjection: hasSQLInjection ? 'DETECTED' : 'none',
          xss: body.test ? (body.test.includes('<script>') ? 'DETECTED' : 'none') : 'none'
        },
        security: {
          rateLimiting: 'active',
          headers: 'applied',
          cors: 'enabled',
          validation: 'enabled'
        }
      })

    } catch (error) {
      return NextResponse.json({
        success: false,
        message: 'Invalid JSON payload',
        error: 'Invalid input',
        requestId: context.requestId
      }, { status: 400 })
    }
  })
}