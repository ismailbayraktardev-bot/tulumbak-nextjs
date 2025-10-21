import { NextResponse } from 'next/server'

// GET /api/test - Simple test endpoint
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'API is working!',
    timestamp: new Date().toISOString()
  })
}