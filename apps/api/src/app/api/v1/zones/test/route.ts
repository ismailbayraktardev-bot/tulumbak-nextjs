import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/postgres'

// Simple test for zones lookup
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Request body:', body)

    const { city, district, postal_code } = body

    const query = `
      SELECT
        z.id as zone_id,
        z.name as zone_name,
        z.branch_id,
        z.delivery_fee,
        z.estimated_delivery_time,
        b.name as branch_name,
        b.address as branch_address
      FROM zones z
      LEFT JOIN branches b ON z.branch_id = b.id
      WHERE z.is_active = true
      AND LOWER(z.city) = LOWER($1)
      AND LOWER(z.district) = LOWER($2)
      LIMIT 1
    `

    console.log('Executing query with params:', [city, district])
    const result = await pool.query(query, [city, district])
    console.log('Query result:', result.rows)

    return NextResponse.json({
      success: true,
      data: {
        result: result.rows,
        params: [city, district, postal_code]
      }
    })

  } catch (error) {
    console.error('Test error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Test failed',
          details: error.message
        }
      },
      { status: 500 }
    )
  }
}