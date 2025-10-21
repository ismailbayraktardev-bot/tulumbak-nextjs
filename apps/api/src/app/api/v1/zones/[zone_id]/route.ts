import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/postgres'
import { validateRequest, Schemas } from '@/lib/security'
import { ApiAnalytics } from '@/lib/monitoring'

// GET /api/v1/zones/[zone_id] - Get zone details
export async function GET(
  request: NextRequest,
  { params }: { params: { zone_id: string } }
) {
  const startTime = performance.now()

  try {
    const zoneId = parseInt(params.zone_id)
    if (isNaN(zoneId)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_ZONE_ID',
            message: 'Zone ID must be a valid number'
          }
        },
        { status: 400 }
      )
    }

    const query = `
      SELECT
        z.*,
        b.name as branch_name,
        b.address as branch_address,
        b.phone as branch_phone,
        b.email as branch_email,
        COUNT(DISTINCT p.id) as order_count,
        COUNT(DISTINCT CASE WHEN p.status = 'delivered' THEN p.id END) as delivered_orders,
        SUM(p.total_amount) FILTER (WHERE p.status = 'delivered') as total_revenue
      FROM zones z
      LEFT JOIN branches b ON z.branch_id = b.id
      LEFT JOIN orders p ON z.city = p.delivery_city AND z.district = p.delivery_district
      WHERE z.id = $1
      GROUP BY z.id, b.name, b.address, b.phone, b.email
    `

    const result = await pool.query(query, [zoneId])

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ZONE_NOT_FOUND',
            message: 'Zone not found'
          }
        },
        { status: 404 }
      )
    }

    const response = {
      success: true,
      data: {
        zone: result.rows[0]
      }
    }

    const duration = performance.now() - startTime
    ApiAnalytics.recordEndpointAccess('/api/v1/zones/[zone_id]', duration, true)

    return NextResponse.json(response, {
      headers: {
        'X-Response-Time': `${Math.round(duration)}ms`
      }
    })

  } catch (error) {
    console.error('Zone GET error:', error)

    const duration = performance.now() - startTime
    ApiAnalytics.recordEndpointAccess('/api/v1/zones/[zone_id]', duration, false)

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch zone'
        }
      },
      { status: 500 }
    )
  }
}

// PUT /api/v1/zones/[zone_id] - Update zone
export async function PUT(
  request: NextRequest,
  { params }: { params: { zone_id: string } }
) {
  const startTime = performance.now()

  try {
    const zoneId = parseInt(params.zone_id)
    if (isNaN(zoneId)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_ZONE_ID',
            message: 'Zone ID must be a valid number'
          }
        },
        { status: 400 }
      )
    }

    const body = await request.json()

    const validation = validateRequest(Schemas.zoneUpdate, body)
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

    const updates = []
    const params = []
    let paramIndex = 1

    // Build dynamic update query
    Object.entries(validation.data).forEach(([key, value]) => {
      if (value !== undefined) {
        updates.push(`${key} = $${paramIndex}`)
        params.push(value)
        paramIndex++
      }
    })

    if (updates.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NO_UPDATES',
            message: 'No valid fields to update'
          }
        },
        { status: 400 }
      )
    }

    // Add updated_at timestamp
    updates.push(`updated_at = CURRENT_TIMESTAMP`)

    // If branch_id is being updated, verify branch exists
    if (validation.data.branch_id) {
      const branchQuery = `SELECT id FROM branches WHERE id = $1 AND is_active = true`
      const branchResult = await pool.query(branchQuery, [validation.data.branch_id])

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

    params.push(zoneId)

    const updateQuery = `
      UPDATE zones
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `

    const result = await pool.query(updateQuery, params)

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ZONE_NOT_FOUND',
            message: 'Zone not found'
          }
        },
        { status: 404 }
      )
    }

    const response = {
      success: true,
      data: {
        zone: result.rows[0]
      }
    }

    const duration = performance.now() - startTime
    ApiAnalytics.recordEndpointAccess('/api/v1/zones/[zone_id]', duration, true)

    return NextResponse.json(response, {
      headers: {
        'X-Response-Time': `${Math.round(duration)}ms`
      }
    })

  } catch (error) {
    console.error('Zone update error:', error)

    const duration = performance.now() - startTime
    ApiAnalytics.recordEndpointAccess('/api/v1/zones/[zone_id]', duration, false)

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update zone'
        }
      },
      { status: 500 }
    )
  }
}

// DELETE /api/v1/zones/[zone_id] - Delete zone (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { zone_id: string } }
) {
  const startTime = performance.now()

  try {
    const zoneId = parseInt(params.zone_id)
    if (isNaN(zoneId)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_ZONE_ID',
            message: 'Zone ID must be a valid number'
          }
        },
        { status: 400 }
      )
    }

    // Check if zone has any active orders
    const ordersQuery = `
      SELECT COUNT(*) as active_orders
      FROM orders
      WHERE delivery_city = (SELECT city FROM zones WHERE id = $1)
      AND delivery_district = (SELECT district FROM zones WHERE id = $1)
      AND status NOT IN ('delivered', 'cancelled')
    `

    const ordersResult = await pool.query(ordersQuery, [zoneId])
    const activeOrders = parseInt(ordersResult.rows[0].active_orders)

    if (activeOrders > 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ZONE_HAS_ORDERS',
            message: 'Cannot delete zone with active orders',
            details: {
              active_orders: activeOrders
            }
          }
        },
        { status: 409 }
      )
    }

    // Soft delete by setting is_active = false
    const deleteQuery = `
      UPDATE zones
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `

    const result = await pool.query(deleteQuery, [zoneId])

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ZONE_NOT_FOUND',
            message: 'Zone not found'
          }
        },
        { status: 404 }
      )
    }

    const response = {
      success: true,
      data: {
        zone: result.rows[0],
        message: 'Zone deactivated successfully'
      }
    }

    const duration = performance.now() - startTime
    ApiAnalytics.recordEndpointAccess('/api/v1/zones/[zone_id]', duration, true)

    return NextResponse.json(response, {
      headers: {
        'X-Response-Time': `${Math.round(duration)}ms`
      }
    })

  } catch (error) {
    console.error('Zone deletion error:', error)

    const duration = performance.now() - startTime
    ApiAnalytics.recordEndpointAccess('/api/v1/zones/[zone_id]', duration, false)

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete zone'
        }
      },
      { status: 500 }
    )
  }
}