import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/postgres'

// GET /api/v1/payments/status - Get payment status by order_id or merchant_oid
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('order_id')
    const merchantOid = searchParams.get('merchant_oid')
    const paymentId = searchParams.get('payment_id')

    // Validate parameters
    if (!orderId && !merchantOid && !paymentId) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'order_id, merchant_oid, or payment_id is required' } },
        { status: 400 }
      )
    }

    let paymentQuery = ''
    let queryParams: any[] = []
    let paramIndex = 1

    if (paymentId) {
      paymentQuery = 'SELECT * FROM payments WHERE id = $1'
      queryParams = [paymentId]
    } else if (merchantOid) {
      paymentQuery = 'SELECT * FROM payments WHERE merchant_oid = $1'
      queryParams = [merchantOid]
    } else {
      paymentQuery = `
        SELECT p.* FROM payments p
        JOIN orders o ON p.order_id = o.id
        WHERE o.id = $1
      `
      queryParams = [orderId]
    }

    const paymentResult = await query(paymentQuery, queryParams)

    if (paymentResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Payment not found' } },
        { status: 404 }
      )
    }

    const payment = paymentResult.rows[0]

    // Get order details
    const orderQuery = 'SELECT * FROM orders WHERE id = $1'
    const orderResult = await query(orderQuery, [payment.order_id])
    const order = orderResult.rows[0]

    return NextResponse.json({
      success: true,
      data: {
        payment: {
          id: payment.id,
          order_id: payment.order_id,
          merchant_oid: payment.merchant_oid,
          paytr_token: payment.paytr_token,
          amount: parseFloat(payment.amount),
          currency: payment.currency,
          payment_type: payment.payment_type,
          installment_count: payment.installment_count,
          status: payment.status,
          payment_method: payment.payment_method,
          card_type: payment.card_type,
          card_bank: payment.card_bank,
          paid_amount: payment.paid_amount ? parseFloat(payment.paid_amount) : null,
          merchant_commission_fee: payment.merchant_commission_fee ? parseFloat(payment.merchant_commission_fee) : null,
          merchant_service_fee: payment.merchant_service_fee ? parseFloat(payment.merchant_service_fee) : null,
          paid_price: payment.paid_price ? parseFloat(payment.paid_price) : null,
          ip_address: payment.ip_address,
          created_at: payment.created_at,
          updated_at: payment.updated_at,
          completed_at: payment.completed_at
        },
        order: {
          id: order.id,
          order_no: order.order_no,
          status: order.status,
          customer_name: order.customer_name,
          customer_email: order.customer_email,
          grand_total: parseFloat(order.grand_total),
          created_at: order.created_at
        }
      }
    })

  } catch (error) {
    console.error('Payment status check error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get payment status' } },
      { status: 500 }
    )
  }
}