import { Pool, PoolClient } from 'pg'

// PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'tulumbak',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// Export pool for direct use
export { pool }

// Helper function to get a client from the pool
export async function getClient(): Promise<PoolClient> {
  return pool.connect()
}

// Helper function to execute queries with automatic connection handling
export async function query<T = any>(text: string, params?: any[]): Promise<{
  rows: T[]
  rowCount: number
}> {
  const start = Date.now()
  try {
    const result = await pool.query(text, params)
    const duration = Date.now() - start
    console.log('Executed query', { text, duration, rows: result.rowCount })
    return result
  } catch (error) {
    const duration = Date.now() - start
    console.error('Query error', { text, duration, error })
    throw error
  }
}

// Helper function for transactions
export async function transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getClient()
  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

// Database connection test
export async function testConnection(): Promise<boolean> {
  try {
    const result = await query('SELECT NOW() as current_time')
    console.log('Database connected successfully:', result.rows[0])
    return true
  } catch (error) {
    console.error('Database connection failed:', error)
    return false
  }
}

// Initialize database tables
export async function initializeDatabase(): Promise<void> {
  try {
    // Read and execute schema
    const fs = require('fs')
    const path = require('path')
    const schemaPath = path.join(process.cwd(), 'database', 'schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')

    // Split schema into individual statements
    const statements = schema
      .split(';')
      .filter(stmt => stmt.trim().length > 0)
      .map(stmt => stmt.trim() + ';')

    console.log(`Executing ${statements.length} SQL statements...`)

    for (const statement of statements) {
      if (statement.trim()) {
        await query(statement)
      }
    }

    console.log('Database schema initialized successfully')
  } catch (error) {
    console.error('Failed to initialize database:', error)
    throw error
  }
}

// Load sample data
export async function loadSampleData(): Promise<void> {
  try {
    const fs = require('fs')
    const path = require('path')
    const seedPath = path.join(process.cwd(), 'database', 'seed.sql')
    const seed = fs.readFileSync(seedPath, 'utf8')

    // Split seed into individual statements
    const statements = seed
      .split(';')
      .filter(stmt => stmt.trim().length > 0)
      .map(stmt => stmt.trim() + ';')

    console.log(`Loading ${statements.length} data statements...`)

    for (const statement of statements) {
      if (statement.trim() && !statement.startsWith('--') && !statement.startsWith('DO $$')) {
        await query(statement)
      }
    }

    console.log('Sample data loaded successfully')
  } catch (error) {
    console.error('Failed to load sample data:', error)
    throw error
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Closing database connections...')
  await pool.end()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('Closing database connections...')
  await pool.end()
  process.exit(0)
})