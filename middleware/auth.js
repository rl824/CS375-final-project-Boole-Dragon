const crypto = require('crypto');
const pool = require('../db');

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

  try {
    // Check if session exists and is valid
    const sessionResult = await pool.query(
      'SELECT user_id FROM sessions WHERE token = $1 AND expires_at > NOW()',
      [token]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    const userId = sessionResult.rows[0].user_id;

    const result = await pool.query(
      'SELECT id, username, email, email_verified FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      // User deleted but session exists? Cleanup
      await pool.query('DELETE FROM sessions WHERE token = $1', [token]);
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

  try {
    const sessionResult = await pool.query(
      'SELECT user_id FROM sessions WHERE token = $1 AND expires_at > NOW()',
      [token]
    );

    if (sessionResult.rows.length > 0) {
      const userId = sessionResult.rows[0].user_id;
      const result = await pool.query(
        'SELECT id, username, email, email_verified FROM users WHERE id = $1',
        [userId]
      );

      if (result.rows.length > 0) {
        req.user = result.rows[0];
      }
    }
  } catch (err) {
    console.error('Optional auth error:', err);
  }

  next();
};

const createSession = async (userId) => {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await pool.query(
    'INSERT INTO sessions (token, user_id, expires_at) VALUES ($1, $2, $3)',
    [token, userId, expiresAt]
  );
  
  return token;
};

const destroySession = async (token) => {
  if (token) {
    await pool.query('DELETE FROM sessions WHERE token = $1', [token]);
    return true;
  }
  return false;
};

const getActiveSessions = async () => {
  const result = await pool.query('SELECT COUNT(*) FROM sessions WHERE expires_at > NOW()');
  return parseInt(result.rows[0].count);
};

module.exports = {
  requireAuth,
  optionalAuth,
  createSession,
  destroySession,
  getActiveSessions,
  cookieOptions
};
