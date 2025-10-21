import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/postgres'

// GET /api/v1/payments/[payment_id] - Get payment details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ payment_id: string }> }
) {
  try {
    const { payment_id } = await params

    // Get payment details
    const paymentQuery = `
      SELECT p.*,
             o.order_no, o.customer_name, o.customer_email, o.grand_total as order_total,
             o.status as order_status, o.payment_status as order_payment_status
      FROM payments p
      JOIN orders o ON p.order_id = o.id
      WHERE p.id = $1
    `
    const paymentResult = await query(paymentQuery, [payment_id])

    if (paymentResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Payment not found' } },
        { status: 404 }
      )
    }

    const payment = paymentResult.rows[0]

    // Get webhook history for this payment
    const webhookQuery = `
      SELECT * FROM webhook_callbacks
      WHERE payment_id = $1 OR merchant_oid = $2
      ORDER BY created_at DESC
    `
    const webhookResult = await query(webhookQuery, [payment.id, payment.merchant_oid])

    // Get order items for reference
    const orderItemsQuery = `
      SELECT ci.*, p.name as product_name, p.sku
      FROM cart_items ci
      JOIN carts c ON ci.cart_id = c.id
      JOIN products p ON ci.product_id = p.id
      WHERE c.id = (SELECT cart_id FROM orders WHERE id = $1)
      ORDER BY ci.created_at DESC
    `
    const orderItemsResult = await query(orderItemsQuery, [payment.order_id])

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
          hash_data: payment.hash_data,
          callback_data: payment.callback_data,
          created_at: payment.created_at,
          updated_at: payment.updated_at,
          completed_at: payment.completed_at
        },
        order: {
          id: payment.order_id,
          order_no: payment.order_no,
          status: payment.order_status,
          payment_status: payment.order_payment_status,
          customer_name: payment.customer_name,
          customer_email: payment.customer_email,
          total: parseFloat(payment.order_total)
        },
        webhook_history: webhookResult.rows.map(webhook => ({
          id: webhook.id,
          merchant_oid: webhook.merchant_oid,
          webhook_data: webhook.webhook_data,
          processed: webhook.processed,
          processing_attempts: webhook.processing_attempts,
          error_message: webhook.error_message,
          created_at: webhook.created_at,
          processed_at: webhook.processed_at
        })),
        order_items: orderItemsResult.rows.map(item => ({
          product_name: item.product_name,
          sku: item.sku,
          quantity: item.quantity,
          unit_price: parseFloat(item.unit_price),
          total_price: parseFloat(item.total_price)
        }))
      }
    })

  } catch (error) {
    console.error('Payment details error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get payment details' } },
      { status: 500 }
    )
  }
}

// PUT /api/v1/payments/[payment_id]/retry - Retry failed payment
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ payment_id: string }> }
) {
  try {
    const { payment_id } = await params

    // Get current payment
    const paymentQuery = 'SELECT * FROM payments WHERE id = $1'
    const paymentResult = await query(paymentQuery, [payment_id])

    if (paymentResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Payment not found' } },
        { status: 404 }
      )
    }

    const payment = paymentResult.rows[0]

    // Check if payment can be retried
    if (payment.status !== 'failed') {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_STATUS', message: 'Only failed payments can be retried' } },
        { status: 400 }
      )
    }

    // Check retry count (limit to 3 retries)
    const webhookQuery = `
      SELECT COUNT(*) as retry_count
      FROM webhook_callbacks
      WHERE merchant_oid = $1 AND error_message LIKE '%retry%'
    `
    const webhookResult = await query(webhookQuery, [payment.merchant_oid])
    const retryCount = parseInt(webhookResult.rows[0].retry_count)

    if (retryCount >= 3) {
      return NextResponse.json(
        { success: false, error: { code: 'MAX_RETRIES_EXCEEDED', message: 'Maximum retry attempts exceeded' } },
        { status: 400 }
      )
    }

    // Update payment status back to pending
    await query(
      'UPDATE payments SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['pending', payment_id]
    )

    // Log retry attempt
    await query(
      'INSERT INTO webhook_callbacks (payment_id, merchant_oid, webhook_data, processed, error_message, created_at) VALUES ($1, $2, $3, false, $4, CURRENT_TIMESTAMP)',
      [payment.id, payment.merchant_oid, JSON.stringify({ action: 'retry', attempt: retryCount + 1 }), `Retry attempt ${retryCount + 1}`]
    )

    return NextResponse.json({
      success: true,
      data: {
        payment_id: payment.id,
        merchant_oid: payment.merchant_oid,
        status: 'pending',
        retry_count: retryCount + 1,
        message: 'Payment reset to pending status'
      }
    })

  } catch (error) {
    console.error('Payment retry error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to retry payment' } },
      { status: 500 }
    )
  }
}