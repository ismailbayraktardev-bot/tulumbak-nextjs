import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/postgres'

// PayTR hash generation function
function generatePaytrHash(params: {
  merchantId: string
  merchantKey: string
  merchantSalt: string
  merchantOid: string
  amount: string
  userEmail: string
  userName: string
  userAddress: string
  userPhone: string
  merchantOkUrl: string
  merchantFailUrl: string
  userIp: string
}): string {
  const hashStr = [
    params.merchantId,
    params.merchantOid,
    params.amount,
    params.userEmail,
    params.userName,
    params.userAddress,
    params.userPhone,
    params.merchantOkUrl,
    params.merchantFailUrl,
    params.userIp,
    params.merchantSalt
  ].join('');

  const crypto = require('crypto')
  return crypto.createHmac('sha256', params.merchantKey)
    .update(hashStr)
    .digest('base64')
}

// Generate unique merchant order ID
function generateMerchantOid(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substr(2, 8)
  return `ORD${timestamp}${random}`
}

// POST /api/v1/payments/paytr/init - Initiate PayTR payment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      order_id,
      amount,
      currency = 'TRY',
      installment_count = 1,
      user_name,
      user_email,
      user_phone,
      user_address,
      billing_type = 'individual',
      billing_tckn,
      billing_vkn,
      billing_company,
      merchant_ok_url = 'http://localhost:3006/payment/success',
      merchant_fail_url = 'http://localhost:3006/payment/fail',
      user_basket = []
    } = body

    // Validate required fields
    if (!order_id || !amount || !user_name || !user_email || !user_address) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Required fields missing' } },
        { status: 400 }
      )
    }

    // Get order details
    const orderQuery = `
      SELECT * FROM orders WHERE id = $1 AND status = 'pending'
    `
    const orderResult = await query(orderQuery, [order_id])

    if (orderResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'ORDER_NOT_FOUND', message: 'Order not found or not in pending status' } },
        { status: 404 }
      )
    }

    const order = orderResult.rows[0]

    // Check if payment already exists for this order
    const existingPaymentQuery = `
      SELECT * FROM payments WHERE order_id = $1 AND status IN ('pending', 'processing')
    `
    const existingPaymentResult = await query(existingPaymentQuery, [order_id])

    if (existingPaymentResult.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: { code: 'PAYMENT_EXISTS', message: 'Payment already exists for this order' } },
        { status: 409 }
      )
    }

    // Get PayTR credentials from environment (these should be set in production)
    const merchantId = process.env.PAYTR_MERCHANT_ID
    const merchantKey = process.env.PAYTR_MERCHANT_KEY
    const merchantSalt = process.env.PAYTR_MERCHANT_SALT

    if (!merchantId || !merchantKey || !merchantSalt) {
      return NextResponse.json(
        { success: false, error: { code: 'CONFIG_ERROR', message: 'PayTR credentials not configured' } },
        { status: 500 }
      )
    }

    // Generate merchant order ID
    const merchantOid = generateMerchantOid()

    // Get user IP
    const userIp = request.headers.get('x-forwarded-for') ||
                   request.headers.get('x-real-ip') ||
                   request.ip || '127.0.0.1'

    // Generate hash
    const paytrHash = generatePaytrHash({
      merchantId,
      merchantKey,
      merchantSalt,
      merchantOid,
      amount: amount.toString(),
      userEmail: user_email,
      userName: user_name,
      userAddress: typeof user_address === 'string' ? user_address : JSON.stringify(user_address),
      userPhone: user_phone || '',
      merchantOkUrl,
      merchantFailUrl,
      userIp
    })

    // Create payment record
    const createPaymentQuery = `
      INSERT INTO payments (
        order_id, paytr_token, merchant_oid, amount, currency,
        payment_type, installment_count, status, ip_address, hash_data,
        callback_data, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP)
      RETURNING *
    `

    const paymentResult = await query(createPaymentQuery, [
      order_id,
      null, // paytr_token will be set after PayTR response
      merchantOid,
      amount,
      currency,
      'card',
      installment_count,
      'pending',
      userIp,
      paytrHash,
      JSON.stringify({
        user_name,
        user_email,
        user_phone,
        user_address,
        billing_type,
        billing_tckn: billing_tckn || null,
        billing_vkn: billing_vkn || null,
        billing_company: billing_company || null,
        merchant_ok_url,
        merchant_fail_url,
        user_basket
      })
    ])

    const payment = paymentResult.rows[0]

    // Prepare PayTR API request
    const paytrApiUrl = process.env.PAYTR_API_URL || 'https://www.paytr.com/odeme'

    const paytrRequest = {
      merchant_id: merchantId,
      user_ip: userIp,
      merchant_oid: merchantOid,
      email: user_email,
      payment_type: 'card',
      payment_amount: amount,
      currency: currency,
      installment_count: installment_count,
      user_name: user_name,
      user_address: typeof user_address === 'string' ? user_address : JSON.stringify(user_address),
      user_phone: user_phone,
      merchant_ok_url: merchant_okUrl,
      merchant_fail_url: merchant_fail_url,
      debug_on: 1, // Enable debug for development
      test_mode: process.env.NODE_ENV === 'development' ? 1 : 0,
      client_lang: 'tr',
      hash: paytrHash
    }

    // Call PayTR API
    const paytrResponse = await fetch(paytrApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(paytrRequest).toString()
    })

    const paytrData = await paytrResponse.json()

    if (!paytrResponse.ok || paytrData.status !== 'success') {
      // Update payment status to failed
      await query(
        'UPDATE payments SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        ['failed', payment.id]
      )

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'PAYTR_API_ERROR',
            message: paytrData.reason || 'Failed to initiate payment'
          }
        },
        { status: 500 }
      )
    }

    // Update payment with PayTR token
    await query(
      'UPDATE payments SET paytr_token = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [paytrData.token, payment.id]
    )

    // Calculate expiration (30 minutes from now)
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString()

    return NextResponse.json({
      success: true,
      data: {
        payment_id: payment.id,
        merchant_oid: merchantOid,
        paytr_token: paytrData.token,
        payment_url: paytrData.payment_url,
        amount: parseFloat(amount),
        currency,
        installment_count,
        expires_at: expiresAt,
        timeout_limit: 30 // minutes
      }
    })

  } catch (error) {
    console.error('PayTR payment initiation error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Payment initiation failed' } },
      { status: 500 }
    )
  }
}