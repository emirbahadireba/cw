import express from 'express';
import pool from '../config/database.js';
import { authenticate } from '../middleware/auth.js';
import { ensureTenant } from '../middleware/tenant.js';
import { validate, schemas } from '../middleware/validation.js';

const router = express.Router();

router.use(authenticate);
router.use(ensureTenant);

// GET /api/applications
router.get('/', async (req, res, next) => {
  try {
    const { type, status } = req.query;
    
    let query = 'SELECT * FROM applications WHERE tenant_id = $1';
    const params = [req.tenantId];
    let paramIndex = 2;
    
    if (type) {
      query += ` AND type = $${paramIndex++}`;
      params.push(type);
    }
    
    if (status) {
      query += ` AND status = $${paramIndex++}`;
      params.push(status);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, params);
    
    res.json({ applications: result.rows });
  } catch (error) {
    next(error);
  }
});

// GET /api/applications/:id
router.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT * FROM applications WHERE id = $1 AND tenant_id = $2',
      [req.params.id, req.tenantId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    res.json({ application: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// POST /api/applications
router.post('/', validate(schemas.createApplication), async (req, res, next) => {
  try {
    const { name, type, description, config, status } = req.body;
    
    const result = await pool.query(
      `INSERT INTO applications (tenant_id, name, type, description, config, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [req.tenantId, name, type, description || '', JSON.stringify(config || {}), status || 'inactive']
    );
    
    res.status(201).json({ application: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// PUT /api/applications/:id
router.put('/:id', validate(schemas.updateApplication), async (req, res, next) => {
  try {
    const { name, description, config, status } = req.body;
    
    const updates = [];
    const params = [];
    let paramIndex = 1;
    
    if (name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      params.push(name);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      params.push(description);
    }
    if (config !== undefined) {
      updates.push(`config = $${paramIndex++}`);
      params.push(JSON.stringify(config));
    }
    if (status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      params.push(status);
      if (status === 'active') {
        updates.push(`last_used_at = CURRENT_TIMESTAMP`);
      }
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(req.params.id, req.tenantId);
    
    const result = await pool.query(
      `UPDATE applications SET ${updates.join(', ')} WHERE id = $${paramIndex++} AND tenant_id = $${paramIndex++} RETURNING *`,
      params
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    res.json({ application: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/applications/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await pool.query(
      'DELETE FROM applications WHERE id = $1 AND tenant_id = $2 RETURNING id',
      [req.params.id, req.tenantId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;

