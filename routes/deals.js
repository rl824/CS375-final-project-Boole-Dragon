const express = require('express');
const pool = require('../db');
const { requireAuth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/deals
 * Get all deals (public)
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        d.id, d.title, d.description, d.price, d.original_price,
        d.product_url, d.image_url, d.category, d.created_at, d.updated_at,
        u.username as posted_by
      FROM deals d
      LEFT JOIN users u ON d.user_id = u.id
      ORDER BY d.created_at DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching deals:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

/**
 * GET /api/deals/:id
 * Get single deal (public)
 */
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID is a number
    if (isNaN(id) || parseInt(id) <= 0) {
      return res.status(400).json({ error: 'Invalid deal ID' });
    }

    const result = await pool.query(`
      SELECT
        d.id, d.title, d.description, d.price, d.original_price,
        d.product_url, d.image_url, d.category, d.created_at, d.updated_at,
        u.username as posted_by, d.user_id
      FROM deals d
      LEFT JOIN users u ON d.user_id = u.id
      WHERE d.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching deal:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

/**
 * POST /api/deals
 * Create a new deal (protected)
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, description, price, originalPrice, productUrl, imageUrl, category } = req.body;
    const userId = req.user.id;

    // Validation
    if (!title || !price || !productUrl) {
      return res.status(400).json({
        error: 'Title, price, and product URL are required',
      });
    }

    // Validate price is a number
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      return res.status(400).json({ error: 'Invalid price' });
    }

    // Validate originalPrice if provided
    let originalPriceNum = null;
    if (originalPrice) {
      originalPriceNum = parseFloat(originalPrice);
      if (isNaN(originalPriceNum) || originalPriceNum < 0) {
        return res.status(400).json({ error: 'Invalid original price' });
      }
    }

    // Validate URL format
    try {
      new URL(productUrl);
    } catch {
      return res.status(400).json({ error: 'Invalid product URL' });
    }

    // Insert deal
    const result = await pool.query(
      `INSERT INTO deals (user_id, title, description, price, original_price, product_url, image_url, category)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, title, description, price, original_price, product_url, image_url, category, created_at`,
      [userId, title, description || null, priceNum, originalPriceNum, productUrl, imageUrl || null, category || null]
    );

    const newDeal = result.rows[0];

    res.status(201).json({
      message: 'Deal created successfully',
      deal: newDeal,
    });
  } catch (err) {
    console.error('Error creating deal:', err);
    res.status(500).json({ error: 'Failed to create deal' });
  }
});

/**
 * PUT /api/deals/:id
 * Update a deal (protected - only owner)
 */
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, originalPrice, productUrl, imageUrl, category } = req.body;
    const userId = req.user.id;

    // Validate ID
    if (isNaN(id) || parseInt(id) <= 0) {
      return res.status(400).json({ error: 'Invalid deal ID' });
    }

    // Check if deal exists and user owns it
    const existingDeal = await pool.query(
      'SELECT user_id FROM deals WHERE id = $1',
      [id]
    );

    if (existingDeal.rows.length === 0) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    if (existingDeal.rows[0].user_id !== userId) {
      return res.status(403).json({ error: 'You can only edit your own deals' });
    }

    // Validate price if provided
    let priceNum;
    if (price !== undefined) {
      priceNum = parseFloat(price);
      if (isNaN(priceNum) || priceNum < 0) {
        return res.status(400).json({ error: 'Invalid price' });
      }
    }

    // Validate originalPrice if provided
    let originalPriceNum;
    if (originalPrice !== undefined) {
      originalPriceNum = parseFloat(originalPrice);
      if (isNaN(originalPriceNum) || originalPriceNum < 0) {
        return res.status(400).json({ error: 'Invalid original price' });
      }
    }

    // Validate URL if provided
    if (productUrl) {
      try {
        new URL(productUrl);
      } catch {
        return res.status(400).json({ error: 'Invalid product URL' });
      }
    }

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramCount++}`);
      values.push(title);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (price !== undefined) {
      updates.push(`price = $${paramCount++}`);
      values.push(priceNum);
    }
    if (originalPrice !== undefined) {
      updates.push(`original_price = $${paramCount++}`);
      values.push(originalPriceNum);
    }
    if (productUrl !== undefined) {
      updates.push(`product_url = $${paramCount++}`);
      values.push(productUrl);
    }
    if (imageUrl !== undefined) {
      updates.push(`image_url = $${paramCount++}`);
      values.push(imageUrl);
    }
    if (category !== undefined) {
      updates.push(`category = $${paramCount++}`);
      values.push(category);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const result = await pool.query(
      `UPDATE deals SET ${updates.join(', ')}
       WHERE id = $${paramCount}
       RETURNING id, title, description, price, original_price, product_url, category, updated_at`,
      values
    );

    res.json({
      message: 'Deal updated successfully',
      deal: result.rows[0],
    });
  } catch (err) {
    console.error('Error updating deal:', err);
    res.status(500).json({ error: 'Failed to update deal' });
  }
});

/**
 * DELETE /api/deals/:id
 * Delete a deal (protected - only owner)
 */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Validate ID
    if (isNaN(id) || parseInt(id) <= 0) {
      return res.status(400).json({ error: 'Invalid deal ID' });
    }

    // Check if deal exists and user owns it
    const existingDeal = await pool.query(
      'SELECT user_id FROM deals WHERE id = $1',
      [id]
    );

    if (existingDeal.rows.length === 0) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    if (existingDeal.rows[0].user_id !== userId) {
      return res.status(403).json({ error: 'You can only delete your own deals' });
    }

    // Delete deal
    await pool.query('DELETE FROM deals WHERE id = $1', [id]);

    res.json({ message: 'Deal deleted successfully' });
  } catch (err) {
    console.error('Error deleting deal:', err);
    res.status(500).json({ error: 'Failed to delete deal' });
  }
});

/**
 * GET /api/deals/user/:userId
 * Get deals by specific user (public)
 */
router.get('/user/:userId', optionalAuth, async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate userId
    if (isNaN(userId) || parseInt(userId) <= 0) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const result = await pool.query(`
      SELECT
        d.id, d.title, d.description, d.price, d.original_price,
        d.product_url, d.category, d.created_at, d.updated_at,
        u.username as posted_by
      FROM deals d
      LEFT JOIN users u ON d.user_id = u.id
      WHERE d.user_id = $1
      ORDER BY d.created_at DESC
    `, [userId]);

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching user deals:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
