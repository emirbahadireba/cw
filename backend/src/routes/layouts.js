import express from 'express';
import pool from '../config/database.js';
import { authenticate } from '../middleware/auth.js';
import { ensureTenant } from '../middleware/tenant.js';
import { checkLimit } from '../middleware/planLimits.js';
import { validate, schemas } from '../middleware/validation.js';

const router = express.Router();

router.use(authenticate);
router.use(ensureTenant);

// GET /api/layouts
router.get('/', async (req, res, next) => {
  try {
    const { category, search, is_template, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = 'SELECT * FROM layouts WHERE tenant_id = $1';
    const params = [req.tenantId];
    let paramIndex = 2;
    
    if (category) {
      query += ` AND category = $${paramIndex++}`;
      params.push(category);
    }
    
    if (search) {
      query += ` AND name ILIKE $${paramIndex++}`;
      params.push(`%${search}%`);
    }
    
    if (is_template !== undefined) {
      query += ` AND is_template = $${paramIndex++}`;
      params.push(is_template === 'true');
    }
    
    query += ` ORDER BY updated_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    params.push(parseInt(limit), offset);
    
    const result = await pool.query(query, params);
    
    // Get elements for each layout
    for (const layout of result.rows) {
      const elementsResult = await pool.query(
        'SELECT * FROM layout_elements WHERE layout_id = $1 ORDER BY z_index, created_at',
        [layout.id]
      );
      layout.elements = elementsResult.rows;
    }
    
    const countResult = await pool.query(
      `SELECT COUNT(*) as total FROM layouts WHERE tenant_id = $1${category ? ` AND category = '${category}'` : ''}${search ? ` AND name ILIKE '%${search}%'` : ''}${is_template !== undefined ? ` AND is_template = ${is_template === 'true'}` : ''}`
    );
    
    res.json({
      layouts: result.rows,
      total: parseInt(countResult.rows[0].total),
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/layouts/:id
router.get('/:id', async (req, res, next) => {
  try {
    const layoutResult = await pool.query(
      'SELECT * FROM layouts WHERE id = $1 AND tenant_id = $2',
      [req.params.id, req.tenantId]
    );
    
    if (layoutResult.rows.length === 0) {
      return res.status(404).json({ error: 'Layout not found' });
    }
    
    const layout = layoutResult.rows[0];
    
    const elementsResult = await pool.query(
      'SELECT * FROM layout_elements WHERE layout_id = $1 ORDER BY z_index, created_at',
      [layout.id]
    );
    
    res.json({
      layout,
      elements: elementsResult.rows,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/layouts
router.post('/', checkLimit('layouts'), validate(schemas.createLayout), async (req, res, next) => {
  try {
    const { name, width, height, background, category, is_template, elements } = req.body;
    
    const layoutResult = await pool.query(
      `INSERT INTO layouts (tenant_id, name, width, height, background, category, is_template, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [req.tenantId, name, width, height, background || '', category || '', is_template || false, req.user.id]
    );
    
    const layout = layoutResult.rows[0];
    
    // Insert elements
    if (elements && elements.length > 0) {
      for (const element of elements) {
        await pool.query(
          `INSERT INTO layout_elements (layout_id, type, x, y, width, height, z_index, properties)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [layout.id, element.type, element.x, element.y, element.width, element.height, element.z_index || 0, JSON.stringify(element.properties || {})]
        );
      }
    }
    
    // Get all elements
    const elementsResult = await pool.query(
      'SELECT * FROM layout_elements WHERE layout_id = $1',
      [layout.id]
    );
    
    res.status(201).json({
      layout: { ...layout, elements: elementsResult.rows },
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/layouts/:id
router.put('/:id', validate(schemas.createLayout), async (req, res, next) => {
  try {
    const { name, background, elements } = req.body;
    
    const updates = [];
    const params = [];
    let paramIndex = 1;
    
    if (name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      params.push(name);
    }
    if (background !== undefined) {
      updates.push(`background = $${paramIndex++}`);
      params.push(background);
    }
    
    if (updates.length > 0) {
      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      params.push(req.params.id, req.tenantId);
      
      await pool.query(
        `UPDATE layouts SET ${updates.join(', ')} WHERE id = $${paramIndex++} AND tenant_id = $${paramIndex++}`,
        params
      );
    }
    
    // Update elements if provided
    if (elements !== undefined) {
      // Delete existing elements
      await pool.query('DELETE FROM layout_elements WHERE layout_id = $1', [req.params.id]);
      
      // Insert new elements
      for (const element of elements) {
        await pool.query(
          `INSERT INTO layout_elements (layout_id, type, x, y, width, height, z_index, properties)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [req.params.id, element.type, element.x, element.y, element.width, element.height, element.z_index || 0, JSON.stringify(element.properties || {})]
        );
      }
    }
    
    // Get updated layout
    const layoutResult = await pool.query(
      'SELECT * FROM layouts WHERE id = $1 AND tenant_id = $2',
      [req.params.id, req.tenantId]
    );
    
    if (layoutResult.rows.length === 0) {
      return res.status(404).json({ error: 'Layout not found' });
    }
    
    const elementsResult = await pool.query(
      'SELECT * FROM layout_elements WHERE layout_id = $1 ORDER BY z_index, created_at',
      [req.params.id]
    );
    
    res.json({
      layout: { ...layoutResult.rows[0], elements: elementsResult.rows },
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/layouts/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await pool.query(
      'DELETE FROM layouts WHERE id = $1 AND tenant_id = $2 RETURNING id',
      [req.params.id, req.tenantId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Layout not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// POST /api/layouts/:id/duplicate
router.post('/:id/duplicate', async (req, res, next) => {
  try {
    const layoutResult = await pool.query(
      'SELECT * FROM layouts WHERE id = $1 AND tenant_id = $2',
      [req.params.id, req.tenantId]
    );
    
    if (layoutResult.rows.length === 0) {
      return res.status(404).json({ error: 'Layout not found' });
    }
    
    const original = layoutResult.rows[0];
    
    // Create duplicate layout
    const newLayoutResult = await pool.query(
      `INSERT INTO layouts (tenant_id, name, width, height, background, category, is_template, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [req.tenantId, `${original.name} (Copy)`, original.width, original.height, original.background, original.category, false, req.user.id]
    );
    
    const newLayout = newLayoutResult.rows[0];
    
    // Duplicate elements
    const elementsResult = await pool.query(
      'SELECT * FROM layout_elements WHERE layout_id = $1',
      [original.id]
    );
    
    for (const element of elementsResult.rows) {
      await pool.query(
        `INSERT INTO layout_elements (layout_id, type, x, y, width, height, z_index, properties)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [newLayout.id, element.type, element.x, element.y, element.width, element.height, element.z_index, element.properties]
      );
    }
    
    res.status(201).json({ layout: newLayout });
  } catch (error) {
    next(error);
  }
});

export default router;

