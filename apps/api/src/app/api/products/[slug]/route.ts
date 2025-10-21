import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/postgres'
import { Product } from '@/types'

// GET /api/products/[slug] - Get product by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const dataQuery = `
      SELECT
        p.*,
        c.id as category_id,
        c.name as category_name,
        c.slug as category_slug
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.slug = $1 AND p.is_active = true
    `

    const result = await query(dataQuery, [slug])

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Product not found' } },
        { status: 404 }
      )
    }

    const product = result.rows[0]

    return NextResponse.json({
      success: true,
      data: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        type: product.type,
        category_id: product.category_id,
        description: product.description,
        sku: product.sku,
        price: parseFloat(product.price) || 0,
        stock_mode: product.stock_mode,
        stock_qty: product.stock_qty,
        images: product.images,
        tax_included: product.tax_included,
        is_active: product.is_active,
        created_at: product.created_at,
        updated_at: product.updated_at,
        category: {
          id: product.category_id,
          name: product.category_name,
          slug: product.category_slug
        }
      } as Product
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}