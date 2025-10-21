import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const healthCheck = {
      status: 'healthy',
      service: 'store',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '0.1.0',
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100,
      },
      features: {
        payments: process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === 'true',
        analytics: process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true',
        realtime: process.env.NEXT_PUBLIC_REALTIME_ENABLED === 'true',
        search: process.env.NEXT_PUBLIC_SEARCH_ENABLED === 'true',
      },
      endpoints: {
        api: process.env.NEXT_PUBLIC_API_URL,
        ws: process.env.NEXT_PUBLIC_WS_URL,
      },
    };

    return NextResponse.json(healthCheck, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        service: 'store',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}