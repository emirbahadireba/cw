import express from 'express';
import pool from '../config/database.js';
import { authenticate } from '../middleware/auth.js';
import { ensureTenant } from '../middleware/tenant.js';
import { checkLimit } from '../middleware/planLimits.js';
import { validate, schemas } from '../middleware/validation.js';

const router = express.Router();

router.use(authenticate);
router.use(ensureTenant);

// GET /api/schedules
router.get('/', async (req, res, next) => {
  try {
    const { display_id, status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = 'SELECT * FROM schedules WHERE tenant_id = $1';
    const params = [req.tenantId];
    let paramIndex = 2;
    
    if (display_id) {
      query += ` AND (display_id = $${paramIndex++} OR display_id IS NULL)`;
      params.push(display_id);
    }
    
    if (status) {
      query += ` AND status = $${paramIndex++}`;
      params.push(status);
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    params.push(parseInt(limit), offset);
    
    const result = await pool.query(query, params);
    
    const countResult = await pool.query(
      `SELECT COUNT(*) as total FROM schedules WHERE tenant_id = $1${display_id ? ` AND (display_id = '${display_id}' OR display_id IS NULL)` : ''}${status ? ` AND status = '${status}'` : ''}`
    );
    
    res.json({
      schedules: result.rows,
      total: parseInt(countResult.rows[0].total),
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/schedules/:id
router.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT * FROM schedules WHERE id = $1 AND tenant_id = $2',
      [req.params.id, req.tenantId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    
    res.json({ schedule: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// POST /api/schedules
router.post('/', checkLimit('schedules'), validate(schemas.createSchedule), async (req, res, next) => {
  try {
    const { name, playlist_id, display_id, start_time, end_time, days_of_week, start_date, end_date } = req.body;
    
    // Determine status based on dates
    let status = 'upcoming';
    const now = new Date();
    if (start_date && new Date(start_date) <= now) {
      status = 'active';
    }
    if (end_date && new Date(end_date) < now) {
      status = 'expired';
    }
    
    const result = await pool.query(
      `INSERT INTO schedules (tenant_id, name, playlist_id, display_id, start_time, end_time, days_of_week, start_date, end_date, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [req.tenantId, name, playlist_id, display_id || null, start_time, end_time, days_of_week, start_date || null, end_date || null, status, req.user.id]
    );
    
    res.status(201).json({ schedule: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// PUT /api/schedules/:id
router.put('/:id', validate(schemas.createSchedule), async (req, res, next) => {
  try {
    const { name, playlist_id, start_time, end_time, days_of_week, start_date, end_date } = req.body;
    
    const updates = [];
    const params = [];
    let paramIndex = 1;
    
    if (name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      params.push(name);
    }
    if (playlist_id !== undefined) {
      updates.push(`playlist_id = $${paramIndex++}`);
      params.push(playlist_id);
    }
    if (start_time !== undefined) {
      updates.push(`start_time = $${paramIndex++}`);
      params.push(start_time);
    }
    if (end_time !== undefined) {
      updates.push(`end_time = $${paramIndex++}`);
      params.push(end_time);
    }
    if (days_of_week !== undefined) {
      updates.push(`days_of_week = $${paramIndex++}`);
      params.push(days_of_week);
    }
    if (start_date !== undefined) {
      updates.push(`start_date = $${paramIndex++}`);
      params.push(start_date);
    }
    if (end_date !== undefined) {
      updates.push(`end_date = $${paramIndex++}`);
      params.push(end_date);
    }
    
    // Update status
    const now = new Date();
    let status = 'upcoming';
    if (start_date && new Date(start_date) <= now) {
      status = 'active';
    }
    if (end_date && new Date(end_date) < now) {
      status = 'expired';
    }
    updates.push(`status = $${paramIndex++}`);
    params.push(status);
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(req.params.id, req.tenantId);
    
    const result = await pool.query(
      `UPDATE schedules SET ${updates.join(', ')} WHERE id = $${paramIndex++} AND tenant_id = $${paramIndex++} RETURNING *`,
      params
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    
    res.json({ schedule: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/schedules/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await pool.query(
      'DELETE FROM schedules WHERE id = $1 AND tenant_id = $2 RETURNING id',
      [req.params.id, req.tenantId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;

