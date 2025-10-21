import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/middleware'
import { pool } from '@/lib/postgres'
import { validateRequest, Schemas } from '@/lib/security'
import { ApiAnalytics } from '@/lib/monitoring'

// GET /api/v1/admin/products/[id] - Get product details (Admin)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAdminAuth(request, async (req, user) => {
    const startTime = performance.now()
    const productId = params.id

    try {
      // Validate product ID
      const productIdNum = parseInt(productId)
      if (isNaN(productIdNum)) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_PRODUCT_ID',
              message: 'Product ID must be a valid number'
            }
          },
          { status: 400 }
        )
      }

      // Get product with detailed information
      const productQuery = `
        SELECT
          p.*,
          c.name as category_name,
          c.description as category_description,
          COALESCE(SUM(oi.quantity), 0) as total_sold,
          COALESCE(
            (SELECT SUM(oi.quantity)
             FROM order_items oi
             JOIN orders o ON oi.order_id = o.id
             WHERE oi.product_id = p.id AND o.created_at >= CURRENT_DATE - INTERVAL '30 days')
          , 0) as sold_last_30_days,
          COALESCE(
            (SELECT SUM(oi.quantity)
             FROM order_items oi
             JOIN orders o ON oi.order_id = o.id
             WHERE oi.product_id = p.id AND o.created_at >= CURRENT_DATE - INTERVAL '7 days')
          , 0) as sold_last_7_days,
          (SELECT o.created_at
           FROM order_items oi
           JOIN orders o ON oi.order_id = o.id
           WHERE oi.product_id = p.id
           ORDER BY o.created_at DESC LIMIT 1) as last_order_date
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN order_items oi ON p.id = oi.product_id
        WHERE p.id = $1
        GROUP BY p.id, c.name, c.description
      `

      const result = await pool.query(productQuery, [productIdNum])

      if (result.rows.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'PRODUCT_NOT_FOUND',
              message: 'Product not found'
            }
          },
          { status: 404 }
        )
      }

      const product = result.rows[0]

      // Get recent orders for this product
      const recentOrdersQuery = `
        SELECT
          o.id,
          o.user_id,
          u.name as customer_name,
          u.email as customer_email,
          oi.quantity,
          oi.unit_price,
          oi.total_price,
          o.created_at,
          o.status
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        JOIN users u ON o.user_id = u.id
        WHERE oi.product_id = $1
        ORDER BY o.created_at DESC
        LIMIT 10
      `

      const recentOrdersResult = await pool.query(recentOrdersQuery, [productIdNum])

      // Get stock movement history (if we have such table)
      const stockHistoryQuery = `
        SELECT
          created_at,
          stock_before,
          stock_after,
          quantity_change,
          reason
        FROM stock_history
        WHERE product_id = $1
        ORDER BY created_at DESC
        LIMIT 20
      `

      let stockHistory = []
      try {
        const stockHistoryResult = await pool.query(stockHistoryQuery, [productIdNum])
        stockHistory = stockHistoryResult.rows
      } catch (error) {
        // Stock history table might not exist, that's okay
        console.log('Stock history table not found, skipping')
      }

      const response = {
        success: true,
        data: {
          product: {
            ...product,
            stock_history: stockHistory,
            recent_orders: recentOrdersResult.rows,
            analytics: {
              total_sold: parseInt(product.total_sold),
              sold_last_30_days: parseInt(product.sold_last_30_days),
              sold_last_7_days: parseInt(product.sold_last_7_days),
              average_daily_sales: Math.round(parseInt(product.sold_last_30_days) / 30),
              stock_status: {
                current_stock: product.stock,
                status: product.stock > 20 ? 'healthy' : product.stock > 5 ? 'low' : 'critical',
                days_of_inventory: product.stock > 0 ? Math.round(product.stock / Math.max(1, parseInt(product.sold_last_30_days) / 30)) : 0
              }
            }
          }
        }
      }

      // Record analytics
      const duration = performance.now() - startTime
      ApiAnalytics.recordEndpointAccess('/api/v1/admin/products/[id]', duration, true)

      return NextResponse.json(response, {
        headers: {
          'X-Response-Time': `${Math.round(duration)}ms`
        }
      })

    } catch (error) {
      console.error('Admin product fetch error:', error)

      const duration = performance.now() - startTime
      ApiAnalytics.recordEndpointAccess('/api/v1/admin/products/[id]', duration, false)

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to fetch product'
          }
        },
        { status: 500 }
      )
    }
  })
}

// PUT /api/v1/admin/products/[id] - Update product (Admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAdminAuth(request, async (req, user) => {
    const startTime = performance.now()
    const productId = params.id

    try {
      // Validate product ID
      const productIdNum = parseInt(productId)
      if (isNaN(productIdNum)) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_PRODUCT_ID',
              message: 'Product ID must be a valid number'
            }
          },
          { status: 400 }
        )
      }

      const body = await req.json()

      // Validate input data
      const validation = validateRequest(Schemas.productUpdate, body)
      if (!validation.success) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid input data',
              details: validation.error
            }
          },
          { status: 400 }
        )
      }

      // Check if product exists
      const existingProduct = await pool.query(
        'SELECT * FROM products WHERE id = $1',
        [productIdNum]
      )

      if (existingProduct.rows.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'PRODUCT_NOT_FOUND',
              message: 'Product not found'
            }
          },
          { status: 404 }
        )
      }

      const currentProduct = existingProduct.rows[0]

      // Check if category exists (if being updated)
      if (body.category_id) {
        const categoryCheck = await pool.query(
          'SELECT id FROM categories WHERE id = $1 AND is_active = true',
          [body.category_id]
        )

        if (categoryCheck.rows.length === 0) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'CATEGORY_NOT_FOUND',
                message: 'Category not found or inactive'
              }
            },
            { status: 404 }
          )
        }
      }

      // Check if SKU already exists (if being updated and different)
      if (body.sku && body.sku !== currentProduct.sku) {
        const skuCheck = await pool.query(
          'SELECT id FROM products WHERE sku = $1 AND id != $2',
          [body.sku, productIdNum]
        )

        if (skuCheck.rows.length > 0) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'SKU_EXISTS',
                message: 'Product SKU already exists'
              }
            },
            { status: 409 }
          )
        }
      }

      // Build dynamic update query
      const updateFields = []
      const updateValues = []
      let paramIndex = 1

      const allowedFields = [
        'name', 'description', 'price', 'category_id', 'stock', 'is_active',
        'image_url', 'sku', 'barcode', 'weight', 'dimensions'
      ]

      for (const field of allowedFields) {
        if (body[field] !== undefined) {
          updateFields.push(`${field} = $${paramIndex++}`)
          updateValues.push(body[field])
        }
      }

      if (updateFields.length === 0) {
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

      updateFields.push(`updated_at = CURRENT_TIMESTAMP`)
      updateValues.push(productIdNum)

      const updateQuery = `
        UPDATE products
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `

      const result = await pool.query(updateQuery, updateValues)
      const updatedProduct = result.rows[0]

      // Log stock change if stock was updated
      if (body.stock !== undefined && body.stock !== currentProduct.stock) {
        try {
          const stockHistoryQuery = `
            INSERT INTO stock_history (product_id, stock_before, stock_after, quantity_change, reason, created_at)
            VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
          `
          await pool.query(stockHistoryQuery, [
            productIdNum,
            currentProduct.stock,
            body.stock,
            body.stock - currentProduct.stock,
            'Admin update'
          ])
        } catch (error) {
          console.log('Stock history logging failed:', error)
        }
      }

      // Log product update
      console.log(`Product updated by admin ${user.id}: ${updatedProduct.id} - ${updatedProduct.name}`)

      const response = {
        success: true,
        data: {
          product: updatedProduct,
          message: 'Product updated successfully'
        }
      }

      // Record analytics
      const duration = performance.now() - startTime
      ApiAnalytics.recordEndpointAccess('/api/v1/admin/products/[id]', duration, true)

      return NextResponse.json(response, {
        headers: {
          'X-Response-Time': `${Math.round(duration)}ms`
        }
      })

    } catch (error) {
      console.error('Admin product update error:', error)

      const duration = performance.now() - startTime
      ApiAnalytics.recordEndpointAccess('/api/v1/admin/products/[id]', duration, false)

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to update product'
          }
        },
        { status: 500 }
      )
    }
  })
}

// DELETE /api/v1/admin/products/[id] - Delete product (Admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAdminAuth(request, async (req, user) => {
    const startTime = performance.now()
    const productId = params.id

    try {
      // Validate product ID
      const productIdNum = parseInt(productId)
      if (isNaN(productIdNum)) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_PRODUCT_ID',
              message: 'Product ID must be a valid number'
            }
          },
          { status: 400 }
        )
      }

      // Check if product exists
      const existingProduct = await pool.query(
        'SELECT * FROM products WHERE id = $1',
        [productIdNum]
      )

      if (existingProduct.rows.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'PRODUCT_NOT_FOUND',
              message: 'Product not found'
            }
          },
          { status: 404 }
        )
      }

      // Check if product has active orders
      const activeOrdersCheck = await pool.query(
        `SELECT COUNT(*) as count
         FROM order_items oi
         JOIN orders o ON oi.order_id = o.id
         WHERE oi.product_id = $1 AND o.status NOT IN ('delivered', 'cancelled')`,
        [productIdNum]
      )

      const activeOrdersCount = parseInt(activeOrdersCheck.rows[0].count)
      if (activeOrdersCount > 0) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'HAS_ACTIVE_ORDERS',
              message: `Cannot delete product with ${activeOrdersCount} active orders`
            }
          },
          { status: 409 }
        )
      }

      // Check if product is in any active carts
      const activeCartsCheck = await pool.query(
        `SELECT COUNT(*) as count
         FROM cart_items ci
         JOIN carts c ON ci.cart_id = c.id
         WHERE ci.product_id = $1 AND c.expires_at > CURRENT_TIMESTAMP`,
        [productIdNum]
      )

      const activeCartsCount = parseInt(activeCartsCheck.rows[0].count)
      if (activeCartsCount > 0) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'IN_ACTIVE_CARTS',
              message: `Cannot delete product that is in ${activeCartsCount} active carts`
            }
          },
          { status: 409 }
        )
      }

      // Soft delete by setting is_active to false
      const deleteQuery = `
        UPDATE products
        SET is_active = false, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `

      const result = await pool.query(deleteQuery, [productIdNum])
      const deletedProduct = result.rows[0]

      // Log product deletion
      console.log(`Product deleted by admin ${user.id}: ${deletedProduct.id} - ${deletedProduct.name}`)

      const response = {
        success: true,
        data: {
          product: deletedProduct,
          message: 'Product deactivated successfully'
        }
      }

      // Record analytics
      const duration = performance.now() - startTime
      ApiAnalytics.recordEndpointAccess('/api/v1/admin/products/[id]', duration, true)

      return NextResponse.json(response, {
        headers: {
          'X-Response-Time': `${Math.round(duration)}ms`
        }
      })

    } catch (error) {
      console.error('Admin product deletion error:', error)

      const duration = performance.now() - startTime
      ApiAnalytics.recordEndpointAccess('/api/v1/admin/products/[id]', duration, false)

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to delete product'
          }
        },
        { status: 500 }
      )
    }
  })
}