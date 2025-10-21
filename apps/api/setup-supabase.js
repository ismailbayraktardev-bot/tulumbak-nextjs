const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  console.log('URL:', supabaseUrl ? 'set' : 'missing')
  console.log('Key:', supabaseKey ? 'set' : 'missing')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    console.log('Testing Supabase connection...')
    const { data, error } = await supabase.from('categories').select('count')

    if (error) {
      console.error('Connection error:', error)
      return false
    }

    console.log('✅ Connection successful!')
    return true
  } catch (err) {
    console.error('Unexpected error:', err)
    return false
  }
}

async function loadSchema() {
  try {
    console.log('Loading database schema...')

    // Read schema file
    const fs = require('fs')
    const path = require('path')
    const schemaPath = path.join(__dirname, 'database', 'schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')

    // Execute schema
    const { data, error } = await supabase.rpc('exec_sql', { sql: schema })

    if (error) {
      console.error('Schema load error:', error)
      return false
    }

    console.log('✅ Schema loaded successfully!')
    return true
  } catch (err) {
    console.error('Schema load error:', err)
    return false
  }
}

async function loadData() {
  try {
    console.log('Loading sample data...')

    // Read seed file
    const fs = require('fs')
    const path = require('path')
    const seedPath = path.join(__dirname, 'database', 'seed.sql')
    const seed = fs.readFileSync(seedPath, 'utf8')

    // Execute seed
    const { data, error } = await supabase.rpc('exec_sql', { sql: seed })

    if (error) {
      console.error('Data load error:', error)
      return false
    }

    console.log('✅ Sample data loaded successfully!')
    return true
  } catch (err) {
    console.error('Data load error:', err)
    return false
  }
}

async function main() {
  console.log('=== Supabase Setup ===')

  // Test connection
  const connected = await testConnection()
  if (!connected) {
    console.log('❌ Cannot connect to Supabase. Please check your credentials.')
    return
  }

  // Load schema if needed
  await loadSchema()

  // Load sample data
  await loadData()

  console.log('\n=== Setup Complete ===')
}

main().catch(console.error)