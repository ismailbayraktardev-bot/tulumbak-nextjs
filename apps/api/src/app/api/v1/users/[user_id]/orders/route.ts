import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/postgres'

// GET /api/v1/users/[user_id]/orders - Get user orders with pagination
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ user_id: string }> }
) {
  try {
    const { user_id } = await params
    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const status = searchParams.get('status') || undefined
    const start_date = searchParams.get('start_date') || undefined
    const end_date = searchParams.get('end_date') || undefined
    const page = Math.max(Number(searchParams.get('page')) || 1, 1)
    const limit = Math.min(Number(searchParams.get('limit')) || 10, 50)

    // Build WHERE conditions
    const conditions: string[] = ['user_id = $1']
    const values: any[] = [user_id]
    let paramIndex = 2

    if (status) {
      conditions.push(`status = $${paramIndex}`)
      values.push(status)
      paramIndex++
    }

    if (start_date) {
      conditions.push(`created_at >= $${paramIndex}`)
      values.push(start_date)
      paramIndex++
    }

    if (end_date) {
      conditions.push(`created_at <= $${paramIndex}`)
      values.push(end_date)
      paramIndex++
    }

    const whereClause = conditions.join(' AND ')

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM orders WHERE ${whereClause}`
    const countResult = await query(countQuery, values)
    const total = parseInt(countResult.rows[0]?.total || '0', 10)

    // Apply pagination
    const offset = (page - 1) * limit

    // Get orders with pagination
    const dataQuery = `
      SELECT
        id, order_no, status, payment_status, payment_method,
        customer_name, customer_email, customer_phone,
        subtotal, tax_total, shipping_total, grand_total,
        billing_type, billing_company, shipping_address,
        delivery_slot, notes, created_at, updated_at
      FROM orders
      WHERE ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `
    values.push(limit, offset)

    const dataResult = await query(dataQuery, values)
    const orders = dataResult.rows.map((order: any) => ({
      id: order.id,
      order_no: order.order_no,
      status: order.status,
      payment_status: order.payment_status,
      payment_method: order.payment_method,
      customer: {
        name: order.customer_name,
        email: order.customer_email,
        phone: order.customer_phone
      },
      billing: {
        type: order.billing_type,
        company: order.billing_company
      },
      shipping_address: JSON.parse(order.shipping_address),
      delivery_slot: order.delivery_slot ? JSON.parse(order.delivery_slot) : null,
      summary: {
        subtotal: parseFloat(order.subtotal),
        tax_total: parseFloat(order.tax_total),
        delivery_fee: parseFloat(order.shipping_total),
        grand_total: parseFloat(order.grand_total),
        currency: 'TRY'
      },
      notes: order.notes,
      created_at: order.created_at,
      updated_at: order.updated_at
    }))

    const total_pages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total,
          total_pages,
          has_next: page < total_pages,
          has_prev: page > 1
        }
      }
    })

  } catch (error) {
    console.error('User orders fetch error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch user orders' } },
      { status: 500 }
    )
  }
}