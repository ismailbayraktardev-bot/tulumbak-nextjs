// Simple test script to verify Supabase connection
const { createClient } = require('@supabase/supabase-js')

// Use environment variables directly
const supabaseUrl = 'https://gphgsrejmckicetwaxht.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwaGdzcmVqbWNraWNldHdheGh0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDYzOTM3MywiZXhwIjoyMDc2MjE1MzczfQ.C3L4i8Q4hB3F9J6pK2xN7sR8mT5vG1hX2yZ7wK9nLqM'

console.log('Testing Supabase connection...')
console.log('URL:', supabaseUrl ? 'set' : 'missing')
console.log('Key:', supabaseServiceKey ? 'set' : 'missing')

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testConnection() {
  try {
    // Test basic connection
    const { data, error } = await supabase.from('categories').select('count')

    if (error) {
      console.error('❌ Connection failed:', error.message)
      console.error('Full error:', error)
      return false
    }

    console.log('✅ Connection successful!')
    console.log('Categories count:', data)
    return true
  } catch (err) {
    console.error('❌ Unexpected error:', err)
    return false
  }
}

testConnection()