const crypto = require('crypto');
const pool = require('../db');

// Token storage - in memory for now
const tokenStorage = {};

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // Only use secure cookies in production
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax' // Lax is better for local dev
};

const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

const requireAuth = async (req, res, next) => {
  const token = req.cookies.authToken;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const userId = tokenStorage[token];

  if (!userId) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }

  try {
    const result = await pool.query(
      'SELECT id, username, email, email_verified FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      delete tokenStorage[token];
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = result.rows[0];
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

const optionalAuth = async (req, res, next) => {
  const token = req.cookies.authToken;

  if (!token) {
    return next();
  }

  const userId = tokenStorage[token];

  if (!userId) {
    return next();
  }

  try {
    const result = await pool.query(
      'SELECT id, username, email, email_verified FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length > 0) {
      req.user = result.rows[0];
    }
  } catch (err) {
    console.error('Optional auth error:', err);
  }

  next();
};

const createSession = (userId) => {
  const token = generateToken();
  tokenStorage[token] = userId;
  return token;
};

const destroySession = (token) => {
  if (token && tokenStorage[token]) {
    delete tokenStorage[token];
    return true;
  }
  return false;
};

const getActiveSessions = () => {
  return Object.keys(tokenStorage).length;
};

module.exports = {
  requireAuth,
  optionalAuth,
  createSession,
  destroySession,
  getActiveSessions,
  cookieOptions
};
