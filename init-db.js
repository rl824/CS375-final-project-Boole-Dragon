const pool = require('./db');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
  try {
    console.log('Checking database schema...');
    
    // Check if tables exist
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
      );
    `);
    
    if (!result.rows[0].exists) {
      console.log('Tables not found. Creating schema...');
      
      // Read and execute schema.sql
      const schemaSQL = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
      await pool.query(schemaSQL);
      
      console.log('✓ Database schema created successfully');
    } else {
      console.log('✓ Database schema already exists');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

module.exports = initializeDatabase;
