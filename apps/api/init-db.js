const { testConnection, initializeDatabase, loadSampleData } = require('./src/lib/postgres')

async function setupDatabase() {
  console.log('=== Database Setup ===')

  // Test connection
  console.log('1. Testing database connection...')
  const connected = await testConnection()
  if (!connected) {
    console.log('❌ Cannot connect to database. Please check your PostgreSQL configuration.')
    console.log('Make sure PostgreSQL is running and the database exists.')
    return
  }

  // Initialize schema
  console.log('\n2. Initializing database schema...')
  try {
    await initializeDatabase()
    console.log('✅ Schema initialized successfully')
  } catch (error) {
    console.log('❌ Schema initialization failed:', error.message)
    console.log('You may need to create the database first: CREATE DATABASE tulumbak;')
    return
  }

  // Load sample data
  console.log('\n3. Loading sample data...')
  try {
    await loadSampleData()
    console.log('✅ Sample data loaded successfully')
  } catch (error) {
    console.log('❌ Sample data loading failed:', error.message)
  }

  console.log('\n=== Setup Complete ===')
  console.log('You can now test the API endpoints:')
  console.log('  - GET http://localhost:3004/api/categories')
  console.log('  - GET http://localhost:3004/api/products')
}

setupDatabase().catch(console.error)