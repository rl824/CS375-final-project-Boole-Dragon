require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/auth');
const dealsRoutes = require('./routes/deals');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: false,
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/deals', dealsRoutes);

// Temporary route to seed showcase data (since Render Shell is restricted)
app.get('/api/seed-showcase', async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const seedSQL = fs.readFileSync(path.join(__dirname, 'seed_showcase.sql'), 'utf8');
    await pool.query(seedSQL);
    res.json({ message: 'Showcase data successfully inserted! You can now reload the homepage.' });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ error: 'Failed to seed data', details: error.message });
  }
});

// API 404 Handler - Ensure API errors return JSON, not HTML
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  // Serve any static files
  app.use(express.static(path.join(__dirname, 'client/build')));

  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('<h1>Hello World! 🌍</h1><p>Welcome to Boole Deals API</p>');
  });
}

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const pool = require('./db');
const initializeDatabase = require('./init-db');

// Test database connection on startup
pool.query('SELECT NOW()', async (err, res) => {
  if (err) {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  }
  console.log('Database connected successfully');
  
  // Initialize database schema
  try {
    await initializeDatabase();
  } catch (error) {
    console.error('Failed to initialize database schema:', error.message);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running! Visit http://localhost:${PORT}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3001'}`);
});

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});
