import express from 'express';
import pool from '../config/database.js';
import { authenticate } from '../middleware/auth.js';
import { ensureTenant } from '../middleware/tenant.js';
import { validate, schemas } from '../middleware/validation.js';

const router = express.Router();

router.use(authenticate);
router.use(ensureTenant);

// GET /api/settings
router.get('/', async (req, res, next) => {
  try {
    const { category } = req.query;
    
    let query = 'SELECT * FROM settings WHERE tenant_id = $1';
    const params = [req.tenantId];
    
    if (category) {
      query += ' AND category = $2';
      params.push(category);
    }
    
    const result = await pool.query(query, params);
    
    // Convert to object format
    const settings = {};
    for (const row of result.rows) {
      if (!settings[row.category]) {
        settings[row.category] = {};
      }
      settings[row.category][row.key] = row.value;
    }
    
    res.json({ settings });
  } catch (error) {
    next(error);
  }
});

// PUT /api/settings
router.put('/', validate(schemas.updateSettings), async (req, res, next) => {
  try {
    const { category, key, value } = req.body;
    
    const result = await pool.query(
      `INSERT INTO settings (tenant_id, category, key, value, updated_by)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (tenant_id, category, key)
       DO UPDATE SET value = $4, updated_by = $5, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [req.tenantId, category, key, JSON.stringify(value), req.user.id]
    );
    
    res.json({ setting: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

export default router;

