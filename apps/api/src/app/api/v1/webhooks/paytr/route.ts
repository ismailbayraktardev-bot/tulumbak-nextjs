import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/postgres'

// PayTR webhook processing
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Extract PayTR callback data
    const {
      merchant_oid,
      status,
      total_amount,
      hash,
      payment_type,
      installment_count,
      currency,
      paid_amount,
      merchant_commission_fee,
      merchant_service_fee,
      paid_price,
      ip,
      failed_reason_code,
      failed_reason_msg,
      callback_salt
    } = body

    // Validate required fields
    if (!merchant_oid || !status || !hash) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Required fields missing' } },
        { status: 400 }
      )
    }

    // Get PayTR credentials
    const merchantKey = process.env.PAYTR_MERCHANT_KEY
    const merchantSalt = process.env.PAYTR_MERCHANT_SALT

    if (!merchantKey || !merchantSalt) {
      return NextResponse.json(
        { success: false, error: { code: 'CONFIG_ERROR', message: 'PayTR credentials not configured' } },
        { status: 500 }
      )
    }

    // Verify PayTR signature
    const hashStr = [
      merchant_oid,
      status,
      total_amount,
      payment_type,
      installment_count,
      currency,
      paid_amount,
      merchant_commission_fee,
      merchant_service_fee,
      paid_price,
      merchantSalt
    ].join('')

    const crypto = require('crypto')
    const calculatedHash = crypto.createHmac('sha256', merchantKey)
      .update(hashStr)
      .digest('base64')

    if (calculatedHash !== hash) {
      console.error('PayTR webhook signature verification failed', {
        received: hash,
        calculated: calculatedHash,
        merchant_oid
      })

      // Log failed webhook attempt
      await query(
        'INSERT INTO webhook_callbacks (merchant_oid, webhook_data, processed, error_message, created_at) VALUES ($1, $2, false, $3, CURRENT_TIMESTAMP)',
        [merchant_oid, JSON.stringify(body), 'Invalid signature']
      )

      return NextResponse.json(
        { success: false, error: { code: 'SIGNATURE_INVALID', message: 'Invalid webhook signature' } },
        { status: 401 }
      )
    }

    // Find payment by merchant_oid
    const paymentQuery = 'SELECT * FROM payments WHERE merchant_oid = $1'
    const paymentResult = await query(paymentQuery, [merchant_oid])

    if (paymentResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'PAYMENT_NOT_FOUND', message: 'Payment not found' } },
        { status: 404 }
      )
    }

    const payment = paymentResult.rows[0]

    // Check if webhook already processed (idempotent)
    const existingWebhookQuery = `
      SELECT * FROM webhook_callbacks
      WHERE merchant_oid = $1 AND processed = true
      ORDER BY created_at DESC LIMIT 1
    `
    const existingWebhookResult = await query(existingWebhookQuery, [merchant_oid])

    if (existingWebhookResult.rows.length > 0) {
      console.log('Webhook already processed:', merchant_oid)
      return NextResponse.json({ success: true, message: 'Already processed' })
    }

    // Log webhook attempt
    await query(
      'INSERT INTO webhook_callbacks (payment_id, merchant_oid, webhook_data, created_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP)',
      [payment.id, merchant_oid, JSON.stringify(body)]
    )

    // Process payment status update
    let newPaymentStatus = 'pending'

    // Map PayTR status to our status
    switch (status) {
      case 'success':
        newPaymentStatus = 'paid'
        break
      case 'failed':
        newPaymentStatus = 'failed'
        break
      case 'refund':
        newPaymentStatus = 'refunded'
        break
      case 'partial_refund':
        newPaymentStatus = 'partial_refunded'
        break
      default:
        newPaymentStatus = status
    }

    // Update payment
    const updatePaymentQuery = `
      UPDATE payments SET
        status = $1,
        payment_method = $2,
        paid_amount = $3,
        merchant_commission_fee = $4,
        merchant_service_fee = $5,
        paid_price = $6,
        ip_address = $7,
        hash_data = $8,
        callback_data = $9,
        updated_at = CURRENT_TIMESTAMP,
        completed_at = CASE
          WHEN $1 IN ('paid', 'failed', 'refunded', 'partial_refunded') THEN CURRENT_TIMESTAMP
          ELSE completed_at
        END
      WHERE id = $10
    `

    await query(updatePaymentQuery, [
      newPaymentStatus,
      payment_type,
      paid_amount ? parseFloat(paid_amount) : null,
      merchant_commission_fee ? parseFloat(merchant_commission_fee) : null,
      merchant_service_fee ? parseFloat(merchant_service_fee) : null,
      paid_price ? parseFloat(paid_price) : null,
      ip,
      hash,
      JSON.stringify({
        failed_reason_code,
        failed_reason_msg,
        callback_data: body
      }),
      payment.id
    ])

    // Update order status based on payment status
    if (newPaymentStatus === 'paid') {
      await query(
        'UPDATE orders SET payment_status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        ['paid', payment.order_id]
      )

      // Create order status history entry
      await query(
        'INSERT INTO order_status_history (order_id, status, notes, created_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP)',
        [payment.order_id, 'confirmed', 'Payment completed via PayTR']
      )
    } else if (newPaymentStatus === 'failed') {
      await query(
        'UPDATE orders SET payment_status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        ['failed', payment.order_id]
      )

      // Create order status history entry
      await query(
        'INSERT INTO order_status_history (order_id, status, notes, created_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP)',
        [payment.order_id, 'cancelled', `Payment failed: ${failed_reason_msg || 'Unknown error'}`]
      )
    }

    // Mark webhook as processed
    await query(
      'UPDATE webhook_callbacks SET processed = true, processed_at = CURRENT_TIMESTAMP WHERE merchant_oid = $1 AND processed = false ORDER BY created_at DESC LIMIT 1',
      [merchant_oid]
    )

    console.log('PayTR webhook processed successfully:', {
      merchant_oid,
      status: newPaymentStatus,
      amount: paid_amount
    })

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully'
    })

  } catch (error) {
    console.error('PayTR webhook processing error:', error)

    // Log webhook error
    try {
      const body = await request.json().catch(() => ({}))
      await query(
        'INSERT INTO webhook_callbacks (merchant_oid, webhook_data, processed, error_message, created_at) VALUES ($1, $2, false, $3, CURRENT_TIMESTAMP)',
        [body.merchant_oid || 'unknown', JSON.stringify(body), error.message]
      )
    } catch (logError) {
      console.error('Failed to log webhook error:', logError)
    }

    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Webhook processing failed' } },
      { status: 500 }
    )
  }
}