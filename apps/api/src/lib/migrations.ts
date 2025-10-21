import { query } from './postgres'
import * as fs from 'fs'
import * as path from 'path'

// Migration runner for database schema updates
export async function runMigration(fileName: string): Promise<void> {
  try {
    const migrationPath = path.join(process.cwd(), 'database', 'migrations', fileName)
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')

    console.log(`Running migration: ${fileName}`)

    // Split migration into individual statements
    const statements = migrationSQL
      .split(';')
      .filter(stmt => stmt.trim().length > 0 && !stmt.trim().startsWith('--'))
      .map(stmt => stmt.trim() + ';')

    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        await query(statement)
      }
    }

    console.log(`Migration ${fileName} completed successfully`)
  } catch (error) {
    console.error(`Migration ${fileName} failed:`, error)
    throw error
  }
}

// Check if migration has been applied
export async function isMigrationApplied(migrationName: string): Promise<boolean> {
  try {
    // Create migrations table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        migration_name VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMPTZ DEFAULT NOW()
      )
    `)

    // Check if migration exists
    const result = await query(
      'SELECT 1 FROM schema_migrations WHERE migration_name = $1',
      [migrationName]
    )

    return result.rows.length > 0
  } catch (error) {
    console.error('Error checking migration status:', error)
    return false
  }
}

// Mark migration as applied
export async function markMigrationApplied(migrationName: string): Promise<void> {
  await query(
    'INSERT INTO schema_migrations (migration_name) VALUES ($1)',
    [migrationName]
  )
}

// Run migration if not already applied
export async function runMigrationIfNeeded(fileName: string): Promise<void> {
  const migrationName = fileName.replace('.sql', '')

  if (await isMigrationApplied(migrationName)) {
    console.log(`Migration ${migrationName} already applied`)
    return
  }

  await runMigration(fileName)
  await markMigrationApplied(migrationName)
}