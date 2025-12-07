import express from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/database.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { ensureTenant } from '../middleware/tenant.js';
import { checkLimit } from '../middleware/planLimits.js';
import { validate, schemas } from '../middleware/validation.js';
import { createNotification } from '../services/notifications.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);
router.use(ensureTenant);

// GET /api/users
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let query = 'SELECT id, email, name, role, avatar_url, is_active, last_login_at, created_at FROM users WHERE tenant_id = $1';
    const params = [req.tenantId];
    
    if (search) {
      query += ' AND (name ILIKE $2 OR email ILIKE $2)';
      params.push(`%${search}%`);
    }
    
    query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(parseInt(limit), offset);
    
    const result = await pool.query(query, params);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM users WHERE tenant_id = $1';
    const countParams = [req.tenantId];
    if (search) {
      countQuery += ' AND (name ILIKE $2 OR email ILIKE $2)';
      countParams.push(`%${search}%`);
    }
    const countResult = await pool.query(countQuery, countParams);
    
    res.json({
      users: result.rows,
      total: parseInt(countResult.rows[0].total),
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/users/:id
router.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT id, email, name, role, avatar_url, is_active, last_login_at, created_at FROM users WHERE id = $1 AND tenant_id = $2',
      [req.params.id, req.tenantId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// POST /api/users
router.post('/', requireRole('admin', 'manager'), checkLimit('users'), validate(schemas.createUser), async (req, res, next) => {
  try {
    const { email, name, role, password } = req.body;
    
    // Check if email already exists for this tenant
    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1 AND tenant_id = $2',
      [email, req.tenantId]
    );
    
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create user
    const result = await pool.query(
      `INSERT INTO users (tenant_id, email, password_hash, name, role, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, name, role, avatar_url, is_active, created_at`,
      [req.tenantId, email, passwordHash, name, role || 'user', true]
    );
    
    const newUser = result.rows[0];
    
    // Notify new user
    await createNotification(
      req.tenantId,
      newUser.id,
      'info',
      'Welcome!',
      `Your account has been created. Welcome to the Digital Signage System!`,
      'low'
    );
    
    res.status(201).json({ user: newUser });
  } catch (error) {
    next(error);
  }
});

// PUT /api/users/:id
router.put('/:id', requireRole('admin', 'manager'), validate(schemas.updateUser), async (req, res, next) => {
  try {
    const { name, role, is_active } = req.body;
    
    // Check if user exists and belongs to tenant
    const existing = await pool.query(
      'SELECT id FROM users WHERE id = $1 AND tenant_id = $2',
      [req.params.id, req.tenantId]
    );
    
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Build update query
    const updates = [];
    const params = [];
    let paramIndex = 1;
    
    if (name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      params.push(name);
    }
    if (role !== undefined) {
      updates.push(`role = $${paramIndex++}`);
      params.push(role);
    }
    if (is_active !== undefined) {
      updates.push(`is_active = $${paramIndex++}`);
      params.push(is_active);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(req.params.id, req.tenantId);
    
    const result = await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex++} AND tenant_id = $${paramIndex++}
       RETURNING id, email, name, role, avatar_url, is_active, updated_at`,
      params
    );
    
    res.json({ user: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/users/:id
router.delete('/:id', requireRole('admin'), async (req, res, next) => {
  try {
    // Prevent deleting yourself
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 AND tenant_id = $2 RETURNING id',
      [req.params.id, req.tenantId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;

