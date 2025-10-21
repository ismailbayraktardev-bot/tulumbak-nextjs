import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/postgres'

// GET /api/categories - Get all categories
export async function GET(request: NextRequest) {
  try {
    const sql = `
      SELECT id, name, slug, parent_id, position, is_active, created_at, updated_at
      FROM categories
      WHERE is_active = true
      ORDER BY position ASC
    `

    const result = await query(sql)

    return NextResponse.json({
      success: true,
      data: result.rows
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}