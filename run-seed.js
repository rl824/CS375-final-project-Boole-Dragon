require('dotenv').config();
const pool = require('./db');
const fs = require('fs');
const path = require('path');

async function runSeed() {
  try {
    console.log('Reading seed_showcase.sql...');
    const seedSQL = fs.readFileSync(path.join(__dirname, 'seed_showcase.sql'), 'utf8');
    
    console.log('Executing seed data...');
    await pool.query(seedSQL);
    
    console.log('✓ Showcase data successfully inserted!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await pool.end();
  }
}

runSeed();
