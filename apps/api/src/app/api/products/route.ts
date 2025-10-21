import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/postgres'
import { Product, ProductSummary, ProductQuery } from '@/types'

// GET /api/products - Get products with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const queryParams: ProductQuery = {
      category: searchParams.get('category') || undefined,
      q: searchParams.get('q') || undefined,
      min_price: searchParams.get('min_price') ? Number(searchParams.get('min_price')) : undefined,
      max_price: searchParams.get('max_price') ? Number(searchParams.get('max_price')) : undefined,
      page: Number(searchParams.get('page')) || 1,
      per_page: Math.min(Number(searchParams.get('per_page')) || 12, 50),
      sort: (searchParams.get('sort') as any) || 'newest',
      is_active: searchParams.get('is_active') !== 'false'
    }

    // Build WHERE conditions
    const conditions: string[] = []
    const values: any[] = []
    let paramIndex = 1

    if (queryParams.is_active !== undefined) {
      conditions.push(`p.is_active = $${paramIndex}`)
      values.push(queryParams.is_active)
      paramIndex++
    }

    // Category filter is handled by the main JOIN
    if (queryParams.category) {
      conditions.push(`c.slug = $${paramIndex}`)
      values.push(queryParams.category)
      paramIndex++
    }

    // Add search filter if specified
    if (queryParams.q) {
      conditions.push(`p.name ILIKE $${paramIndex}`)
      values.push(`%${queryParams.q}%`)
      paramIndex++
    }

    // Add price filters if specified
    if (queryParams.min_price !== undefined) {
      conditions.push(`p.price >= $${paramIndex}`)
      values.push(queryParams.min_price)
      paramIndex++
    }

    if (queryParams.max_price !== undefined) {
      conditions.push(`p.price <= $${paramIndex}`)
      values.push(queryParams.max_price)
      paramIndex++
    }

    // Build WHERE clause
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    // Build ORDER BY clause
    let orderBy = 'ORDER BY p.created_at DESC'
    switch (queryParams.sort) {
      case 'price_asc':
        orderBy = 'ORDER BY p.price ASC'
        break
      case 'price_desc':
        orderBy = 'ORDER BY p.price DESC'
        break
      case 'newest':
        orderBy = 'ORDER BY p.created_at DESC'
        break
      case 'bestseller':
        // TODO: Implement bestseller logic based on order count
        orderBy = 'ORDER BY p.created_at DESC'
        break
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM products p
      JOIN categories c ON p.category_id = c.id
      ${whereClause}
    `

    const countResult = await query(countQuery, values)
    const total = parseInt(countResult.rows[0]?.total || '0', 10)

    // Apply pagination
    const offset = (queryParams.page - 1) * queryParams.per_page
    const limit = queryParams.per_page

    // Get products with pagination
    const dataQuery = `
      SELECT
        p.id,
        p.name,
        p.slug,
        p.images,
        p.price,
        p.is_active,
        p.category_id,
        c.name as category_name,
        c.slug as category_slug
      FROM products p
      JOIN categories c ON p.category_id = c.id
      ${whereClause}
      ${orderBy}
      LIMIT ${limit} OFFSET ${offset}
    `

    const dataResult = await query(dataQuery, values)

    // Transform data to ProductSummary format
    const products: ProductSummary[] = dataResult.rows.map((product: any) => {
      const firstImage = product.images && product.images.length > 0
        ? product.images[0]
        : null

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        image: firstImage,
        price_from: product.price || 0,
        price_to: product.price || 0,
        is_variable: false // TODO: Implement variable product logic
      }
    })

    const total_pages = Math.ceil(total / queryParams.per_page)

    return NextResponse.json({
      success: true,
      data: products,
      meta: {
        page: queryParams.page,
        per_page: queryParams.per_page,
        total,
        total_pages
      }
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

// POST /api/products - Create a new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Basic validation
    if (!body.name || !body.category_id) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Name and category_id are required' } },
        { status: 400 }
      )
    }

    // Generate slug if not provided
    const slug = body.slug || body.name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()

    const insertQuery = `
      INSERT INTO products (
        name, slug, type, category_id, description, sku, price,
        stock_mode, stock_qty, images, tax_included, is_active, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW()
      )
      RETURNING *
    `

    const values = [
      body.name,
      slug,
      body.type || 'simple',
      body.category_id,
      body.description || null,
      body.sku || null,
      body.price || null,
      body.stock_mode || 'product',
      body.stock_qty || null,
      body.images || null,
      body.tax_included !== undefined ? body.tax_included : true,
      body.is_active !== undefined ? body.is_active : true
    ]

    try {
      const result = await query(insertQuery, values)
      const product = result.rows[0]

      return NextResponse.json({
        success: true,
        data: product as Product
      }, { status: 201 })
    } catch (error: any) {
      console.error('Error creating product:', error)

      // Check for unique constraint violation
      if (error.code === '23505') {
        return NextResponse.json(
          { success: false, error: { code: 'DUPLICATE_SLUG', message: 'Product with this slug already exists' } },
          { status: 409 }
        )
      }

      return NextResponse.json(
        { success: false, error: { code: 'DATABASE_ERROR', message: 'Failed to create product' } },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

// PUT /api/products - Update existing product
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, category_id, description, price, stock_qty, images, is_active } = body

    // Basic validation
    if (!id || !name || !category_id) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'ID, name and category_id are required' } },
        { status: 400 }
      )
    }

    // Generate slug if not provided
    const slug = body.slug || name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()

    const updateQuery = `
      UPDATE products
      SET name = $1, slug = $2, category_id = $3, description = $4, price = $5,
          stock_qty = $6, images = $7, is_active = $8, updated_at = NOW()
      WHERE id = $9
      RETURNING *
    `

    const values = [
      name, slug, category_id, description || null, price || null,
      stock_qty || null, images || null, is_active !== undefined ? is_active : true, id
    ]

    try {
      const result = await query(updateQuery, values)

      if (result.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: { code: 'NOT_FOUND', message: 'Product not found' } },
          { status: 404 }
        )
      }

      const product = result.rows[0]

      // Get category details
      const categoryQuery = `
        SELECT id, name, slug FROM categories WHERE id = $1
      `
      const categoryResult = await query(categoryQuery, [category_id])

      return NextResponse.json({
        success: true,
        data: {
          ...product,
          category: categoryResult.rows[0] || null
        } as Product
      })
    } catch (error: any) {
      console.error('Error updating product:', error)

      if (error.code === '23505') {
        return NextResponse.json(
          { success: false, error: { code: 'DUPLICATE_SLUG', message: 'Product with this slug already exists' } },
          { status: 409 }
        )
      }

      return NextResponse.json(
        { success: false, error: { code: 'DATABASE_ERROR', message: 'Failed to update product' } },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

// DELETE /api/products - Delete product
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Product ID is required' } },
        { status: 400 }
      )
    }

    // Check if product exists in any cart
    const cartCheckQuery = `
      SELECT COUNT(*) as count FROM cart_items WHERE product_id = $1
    `
    const cartResult = await query(cartCheckQuery, [id])

    if (parseInt(cartResult.rows[0].count) > 0) {
      return NextResponse.json(
        { success: false, error: { code: 'CONFLICT', message: 'Cannot delete product: exists in active carts' } },
        { status: 409 }
      )
    }

    // Delete product
    const deleteQuery = `DELETE FROM products WHERE id = $1 RETURNING id`
    const result = await query(deleteQuery, [id])

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Product not found' } },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { id: result.rows[0].id, deleted: true }
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}