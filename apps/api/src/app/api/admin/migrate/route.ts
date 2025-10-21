import { NextRequest, NextResponse } from 'next/server'
import { runMigrationIfNeeded } from '@/lib/migrations'

// POST /api/admin/migrate - Run database migrations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { migration } = body

    if (!migration) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Migration name is required' } },
        { status: 400 }
      )
    }

    await runMigrationIfNeeded(migration)

    return NextResponse.json({
      success: true,
      data: {
        migration,
        applied_at: new Date().toISOString(),
        message: `Migration ${migration} applied successfully`
      }
    })

  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'MIGRATION_FAILED', message: 'Failed to apply migration' } },
      { status: 500 }
    )
  }
}