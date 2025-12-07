import express from 'express';
import { randomBytes } from 'crypto';
import pool from '../config/database.js';
import { authenticate } from '../middleware/auth.js';
import { ensureTenant } from '../middleware/tenant.js';
import { checkLimit } from '../middleware/planLimits.js';
import { validate, schemas } from '../middleware/validation.js';
import { generatePlayerToken } from '../utils/jwt.js';

const router = express.Router();

router.use(authenticate);
router.use(ensureTenant);

// GET /api/displays
router.get('/', async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = 'SELECT * FROM displays WHERE tenant_id = $1';
    const params = [req.tenantId];
    let paramIndex = 2;
    
    if (status) {
      query += ` AND status = $${paramIndex++}`;
      params.push(status);
    }
    
    if (search) {
      query += ` AND (name ILIKE $${paramIndex++} OR location ILIKE $${paramIndex})`;
      params.push(`%${search}%`, `%${search}%`);
      paramIndex++;
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    params.push(parseInt(limit), offset);
    
    const result = await pool.query(query, params);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM displays WHERE tenant_id = $1';
    const countParams = [req.tenantId];
    if (status) countParams.push(status);
    if (search) {
      countQuery += ' AND (name ILIKE $' + (countParams.length + 1) + ' OR location ILIKE $' + (countParams.length + 1) + ')';
      countParams.push(`%${search}%`, `%${search}%`);
    }
    const countResult = await pool.query(countQuery, countParams);
    
    res.json({
      displays: result.rows,
      total: parseInt(countResult.rows[0].total),
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/displays/:id
router.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT * FROM displays WHERE id = $1 AND tenant_id = $2',
      [req.params.id, req.tenantId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Display not found' });
    }
    
    res.json({ display: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// POST /api/displays
router.post('/', checkLimit('displays'), validate(schemas.createDisplay), async (req, res, next) => {
  try {
    const { name, location, platform, pair_code } = req.body;
    
    // Generate pair code if not provided
    const code = pair_code || randomBytes(3).toString('hex').toUpperCase();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours
    
    const result = await pool.query(
      `INSERT INTO displays (tenant_id, name, location, platform, pair_code, pair_code_expires_at, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'offline')
       RETURNING *`,
      [req.tenantId, name, location || '', platform, code, expiresAt]
    );
    
    res.status(201).json({ display: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// PUT /api/displays/:id
router.put('/:id', validate(schemas.updateDisplay), async (req, res, next) => {
  try {
    const { name, location, current_playlist_id } = req.body;
    
    const updates = [];
    const params = [];
    let paramIndex = 1;
    
    if (name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      params.push(name);
    }
    if (location !== undefined) {
      updates.push(`location = $${paramIndex++}`);
      params.push(location);
    }
    if (current_playlist_id !== undefined) {
      updates.push(`current_playlist_id = $${paramIndex++}`);
      params.push(current_playlist_id);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(req.params.id, req.tenantId);
    
    const result = await pool.query(
      `UPDATE displays SET ${updates.join(', ')} WHERE id = $${paramIndex++} AND tenant_id = $${paramIndex++} RETURNING *`,
      params
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Display not found' });
    }
    
    res.json({ display: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/displays/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await pool.query(
      'DELETE FROM displays WHERE id = $1 AND tenant_id = $2 RETURNING id',
      [req.params.id, req.tenantId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Display not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// POST /api/displays/:id/pair
router.post('/:id/pair', async (req, res, next) => {
  try {
    const { pair_code } = req.body;
    
    const result = await pool.query(
      `SELECT * FROM displays WHERE id = $1 AND pair_code = $2 AND pair_code_expires_at > CURRENT_TIMESTAMP`,
      [req.params.id, pair_code]
    );
    
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired pair code' });
    }
    
    const display = result.rows[0];
    
    // Update display status and clear pair code
    await pool.query(
      `UPDATE displays SET status = 'online', last_seen_at = CURRENT_TIMESTAMP, pair_code = NULL, pair_code_expires_at = NULL WHERE id = $1`,
      [display.id]
    );
    
    // Generate player token
    const playerToken = generatePlayerToken(display.id, display.tenant_id);
    
    res.json({
      display: { ...display, status: 'online', pair_code: null },
      accessToken: playerToken,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/displays/:id/status
router.get('/:id/status', async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT status, last_seen_at, temperature FROM displays WHERE id = $1 AND tenant_id = $2',
      [req.params.id, req.tenantId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Display not found' });
    }
    
    res.json({ status: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// POST /api/displays/:id/heartbeat
router.post('/:id/heartbeat', async (req, res, next) => {
  try {
    const { temperature, resolution } = req.body;
    
    const updates = ['status = $1', 'last_seen_at = CURRENT_TIMESTAMP'];
    const params = ['online'];
    let paramIndex = 2;
    
    if (temperature !== undefined) {
      updates.push(`temperature = $${paramIndex++}`);
      params.push(temperature);
    }
    if (resolution !== undefined) {
      updates.push(`resolution = $${paramIndex++}`);
      params.push(resolution);
    }
    
    params.push(req.params.id, req.tenantId);
    
    await pool.query(
      `UPDATE displays SET ${updates.join(', ')} WHERE id = $${paramIndex++} AND tenant_id = $${paramIndex++}`,
      params
    );
    
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// POST /api/displays/:id/restart
router.post('/:id/restart', async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT id FROM displays WHERE id = $1 AND tenant_id = $2',
      [req.params.id, req.tenantId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Display not found' });
    }
    
    // In a real implementation, this would send a command to the player
    // For now, we just return success
    res.json({ success: true, message: 'Restart command sent' });
  } catch (error) {
    next(error);
  }
});

export default router;

