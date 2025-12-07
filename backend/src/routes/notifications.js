import express from 'express';
import pool from '../config/database.js';
import { authenticate } from '../middleware/auth.js';
import { ensureTenant } from '../middleware/tenant.js';

const router = express.Router();

router.use(authenticate);
router.use(ensureTenant);

// GET /api/notifications
router.get('/', async (req, res, next) => {
  try {
    const { is_read, type } = req.query;
    
    let query = 'SELECT * FROM notifications WHERE tenant_id = $1 AND (user_id = $2 OR user_id IS NULL)';
    const params = [req.tenantId, req.user.id];
    let paramIndex = 3;
    
    if (is_read !== undefined) {
      query += ` AND is_read = $${paramIndex++}`;
      params.push(is_read === 'true');
    }
    
    if (type) {
      query += ` AND type = $${paramIndex++}`;
      params.push(type);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, params);
    
    res.json({ notifications: result.rows });
  } catch (error) {
    next(error);
  }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', async (req, res, next) => {
  try {
    const result = await pool.query(
      `UPDATE notifications SET is_read = true WHERE id = $1 AND tenant_id = $2 AND (user_id = $3 OR user_id IS NULL) RETURNING *`,
      [req.params.id, req.tenantId, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// PUT /api/notifications/read-all
router.put('/read-all', async (req, res, next) => {
  try {
    await pool.query(
      `UPDATE notifications SET is_read = true WHERE tenant_id = $1 AND (user_id = $2 OR user_id IS NULL) AND is_read = false`,
      [req.tenantId, req.user.id]
    );
    
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;

