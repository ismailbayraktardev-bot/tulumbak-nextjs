import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/postgres'
import { validateRequest, Schemas } from '@/lib/security'
import { ApiAnalytics } from '@/lib/monitoring'

// GET /api/v1/zones - List all zones (Admin)
export async function GET(request: NextRequest) {
  const startTime = performance.now()

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const city = searchParams.get('city')
    const is_active = searchParams.get('is_active')
    const branch_id = searchParams.get('branch_id')

    const offset = (page - 1) * limit

    // Build WHERE clause
    const conditions = []
    const params = []
    let paramIndex = 1

    if (city) {
      conditions.push(`LOWER(z.city) = LOWER($${paramIndex})`)
      params.push(city)
      paramIndex++
    }

    if (is_active !== null) {
      conditions.push(`z.is_active = $${paramIndex}`)
      params.push(is_active === 'true')
      paramIndex++
    }

    if (branch_id) {
      conditions.push(`z.branch_id = $${paramIndex}`)
      params.push(branch_id)
      paramIndex++
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    const query = `
      SELECT
        z.id,
        z.name,
        z.city,
        z.district,
        z.postal_codes,
        z.branch_id,
        z.delivery_fee,
        z.estimated_delivery_time,
        z.min_order_amount,
        z.is_active,
        z.sort_order,
        z.created_at,
        z.updated_at,
        b.name as branch_name,
        COUNT(DISTINCT p.id) as order_count
      FROM zones z
      LEFT JOIN branches b ON z.branch_id = b.id
      LEFT JOIN orders p ON z.city = p.delivery_city AND z.district = p.delivery_district
      ${whereClause}
      GROUP BY z.id, b.name
      ORDER BY z.sort_order ASC, z.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `

    params.push(limit, offset)

    const result = await pool.query(query, params)

    // Get total count
    const countQuery = `
      SELECT COUNT(DISTINCT z.id) as total
      FROM zones z
      ${whereClause}
    `

    const countParams = params.slice(0, -2) // Remove limit and offset
    const countResult = await pool.query(countQuery, countParams)
    const total = parseInt(countResult.rows[0].total)

    const response = {
      success: true,
      data: {
        zones: result.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    }

    const duration = performance.now() - startTime
    ApiAnalytics.recordEndpointAccess('/api/v1/zones', duration, true)

    return NextResponse.json(response, {
      headers: {
        'X-Response-Time': `${Math.round(duration)}ms`
      }
    })

  } catch (error) {
    console.error('Zones GET error:', error)

    const duration = performance.now() - startTime
    ApiAnalytics.recordEndpointAccess('/api/v1/zones', duration, false)

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch zones'
        }
      },
      { status: 500 }
    )
  }
}

// POST /api/v1/zones - Create new zone (Admin)
export async function POST(request: NextRequest) {
  const startTime = performance.now()

  try {
    const body = await request.json()

    const validation = validateRequest(Schemas.zoneCreate, body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid zone data',
            details: validation.error
          }
        },
        { status: 400 }
      )
    }

    const {
      name,
      city,
      district,
      postal_codes,
      branch_id,
      delivery_fee = 0,
      estimated_delivery_time = 60,
      min_order_amount = 0,
      is_active = true,
      sort_order = 0
    } = validation.data

    // Check if zone already exists for the same city/district
    const existingQuery = `
      SELECT id FROM zones
      WHERE LOWER(city) = LOWER($1) AND LOWER(district) = LOWER($2)
    `
    const existingResult = await pool.query(existingQuery, [city, district])

    if (existingResult.rows.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ZONE_EXISTS',
            message: 'Zone already exists for this city and district'
          }
        },
        { status: 409 }
      )
    }

    // If branch_id is provided, verify branch exists
    if (branch_id) {
      const branchQuery = `SELECT id FROM branches WHERE id = $1 AND is_active = true`
      const branchResult = await pool.query(branchQuery, [branch_id])

      if (branchResult.rows.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'BRANCH_NOT_FOUND',
              message: 'Branch not found or inactive'
            }
          },
          { status: 404 }
        )
      }
    }

    const insertQuery = `
      INSERT INTO zones (
        name, city, district, postal_codes, branch_id,
        delivery_fee, estimated_delivery_time, min_order_amount,
        is_active, sort_order
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `

    const result = await pool.query(insertQuery, [
      name, city, district, postal_codes, branch_id,
      delivery_fee, estimated_delivery_time, min_order_amount,
      is_active, sort_order
    ])

    const response = {
      success: true,
      data: {
        zone: result.rows[0]
      }
    }

    const duration = performance.now() - startTime
    ApiAnalytics.recordEndpointAccess('/api/v1/zones', duration, true)

    return NextResponse.json(response, {
      status: 201,
      headers: {
        'X-Response-Time': `${Math.round(duration)}ms`
      }
    })

  } catch (error) {
    console.error('Zone creation error:', error)

    const duration = performance.now() - startTime
    ApiAnalytics.recordEndpointAccess('/api/v1/zones', duration, false)

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create zone'
        }
      },
      { status: 500 }
    )
  }
}