import express from 'express';
import pool from '../config/database.js';
import { authenticate } from '../middleware/auth.js';
import { ensureTenant } from '../middleware/tenant.js';
import { checkLimit } from '../middleware/planLimits.js';
import { validate, schemas } from '../middleware/validation.js';

const router = express.Router();

router.use(authenticate);
router.use(ensureTenant);

// GET /api/playlists
router.get('/', async (req, res, next) => {
  try {
    const { search, is_active, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = 'SELECT * FROM playlists WHERE tenant_id = $1';
    const params = [req.tenantId];
    let paramIndex = 2;
    
    if (search) {
      query += ` AND (name ILIKE $${paramIndex++} OR description ILIKE $${paramIndex})`;
      params.push(`%${search}%`, `%${search}%`);
      paramIndex++;
    }
    
    if (is_active !== undefined) {
      query += ` AND is_active = $${paramIndex++}`;
      params.push(is_active === 'true');
    }
    
    query += ` ORDER BY updated_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    params.push(parseInt(limit), offset);
    
    const result = await pool.query(query, params);
    
    // Get items for each playlist
    for (const playlist of result.rows) {
      const itemsResult = await pool.query(
        'SELECT pi.*, mf.name as media_name, mf.type as media_type, mf.url as media_url FROM playlist_items pi JOIN media_files mf ON pi.media_file_id = mf.id WHERE pi.playlist_id = $1 ORDER BY pi.order_index',
        [playlist.id]
      );
      playlist.items = itemsResult.rows;
    }
    
    const countResult = await pool.query(
      `SELECT COUNT(*) as total FROM playlists WHERE tenant_id = $1${search ? ` AND (name ILIKE '%${search}%' OR description ILIKE '%${search}%')` : ''}${is_active !== undefined ? ` AND is_active = ${is_active === 'true'}` : ''}`
    );
    
    res.json({
      playlists: result.rows,
      total: parseInt(countResult.rows[0].total),
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/playlists/:id
router.get('/:id', async (req, res, next) => {
  try {
    const playlistResult = await pool.query(
      'SELECT * FROM playlists WHERE id = $1 AND tenant_id = $2',
      [req.params.id, req.tenantId]
    );
    
    if (playlistResult.rows.length === 0) {
      return res.status(404).json({ error: 'Playlist not found' });
    }
    
    const playlist = playlistResult.rows[0];
    
    const itemsResult = await pool.query(
      'SELECT pi.*, mf.name as media_name, mf.type as media_type, mf.url as media_url FROM playlist_items pi JOIN media_files mf ON pi.media_file_id = mf.id WHERE pi.playlist_id = $1 ORDER BY pi.order_index',
      [playlist.id]
    );
    
    res.json({
      playlist,
      items: itemsResult.rows,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/playlists
router.post('/', checkLimit('playlists'), validate(schemas.createPlaylist), async (req, res, next) => {
  try {
    const { name, description, items, tags } = req.body;
    
    // Calculate total duration
    const duration = items ? items.reduce((sum, item) => sum + (item.duration || 0), 0) : 0;
    
    const playlistResult = await pool.query(
      `INSERT INTO playlists (tenant_id, name, description, duration, is_active, tags, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [req.tenantId, name, description || '', duration, false, tags || [], req.user.id]
    );
    
    const playlist = playlistResult.rows[0];
    
    // Insert items
    if (items && items.length > 0) {
      for (const item of items) {
        await pool.query(
          `INSERT INTO playlist_items (playlist_id, media_file_id, order_index, duration, transition_type, transition_duration)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [playlist.id, item.media_file_id, item.order_index, item.duration, item.transition_type || 'fade', item.transition_duration || 1000]
        );
      }
    }
    
    res.status(201).json({ playlist });
  } catch (error) {
    next(error);
  }
});

// PUT /api/playlists/:id
router.put('/:id', validate(schemas.createPlaylist), async (req, res, next) => {
  try {
    const { name, description, items, tags } = req.body;
    
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
    if (tags !== undefined) {
      updates.push(`tags = $${paramIndex++}`);
      params.push(Array.isArray(tags) ? tags : [tags]);
    }
    
    // Update items if provided
    if (items !== undefined) {
      // Delete existing items
      await pool.query('DELETE FROM playlist_items WHERE playlist_id = $1', [req.params.id]);
      
      // Insert new items
      let totalDuration = 0;
      for (const item of items) {
        await pool.query(
          `INSERT INTO playlist_items (playlist_id, media_file_id, order_index, duration, transition_type, transition_duration)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [req.params.id, item.media_file_id, item.order_index, item.duration, item.transition_type || 'fade', item.transition_duration || 1000]
        );
        totalDuration += item.duration || 0;
      }
      
      updates.push(`duration = $${paramIndex++}`);
      params.push(totalDuration);
    }
    
    if (updates.length > 0) {
      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      params.push(req.params.id, req.tenantId);
      
      await pool.query(
        `UPDATE playlists SET ${updates.join(', ')} WHERE id = $${paramIndex++} AND tenant_id = $${paramIndex++}`,
        params
      );
    }
    
    const playlistResult = await pool.query(
      'SELECT * FROM playlists WHERE id = $1 AND tenant_id = $2',
      [req.params.id, req.tenantId]
    );
    
    if (playlistResult.rows.length === 0) {
      return res.status(404).json({ error: 'Playlist not found' });
    }
    
    res.json({ playlist: playlistResult.rows[0] });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/playlists/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await pool.query(
      'DELETE FROM playlists WHERE id = $1 AND tenant_id = $2 RETURNING id',
      [req.params.id, req.tenantId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Playlist not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// POST /api/playlists/:id/duplicate
router.post('/:id/duplicate', async (req, res, next) => {
  try {
    const playlistResult = await pool.query(
      'SELECT * FROM playlists WHERE id = $1 AND tenant_id = $2',
      [req.params.id, req.tenantId]
    );
    
    if (playlistResult.rows.length === 0) {
      return res.status(404).json({ error: 'Playlist not found' });
    }
    
    const original = playlistResult.rows[0];
    
    const newPlaylistResult = await pool.query(
      `INSERT INTO playlists (tenant_id, name, description, duration, is_active, tags, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [req.tenantId, `${original.name} (Copy)`, original.description, original.duration, false, original.tags, req.user.id]
    );
    
    const newPlaylist = newPlaylistResult.rows[0];
    
    // Duplicate items
    const itemsResult = await pool.query(
      'SELECT * FROM playlist_items WHERE playlist_id = $1 ORDER BY order_index',
      [original.id]
    );
    
    for (const item of itemsResult.rows) {
      await pool.query(
        `INSERT INTO playlist_items (playlist_id, media_file_id, order_index, duration, transition_type, transition_duration)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [newPlaylist.id, item.media_file_id, item.order_index, item.duration, item.transition_type, item.transition_duration]
      );
    }
    
    res.status(201).json({ playlist: newPlaylist });
  } catch (error) {
    next(error);
  }
});

// PUT /api/playlists/:id/items/reorder
router.put('/:id/items/reorder', async (req, res, next) => {
  try {
    const { itemIds } = req.body;
    
    if (!Array.isArray(itemIds)) {
      return res.status(400).json({ error: 'itemIds must be an array' });
    }
    
    // Update order_index for each item
    for (let i = 0; i < itemIds.length; i++) {
      await pool.query(
        'UPDATE playlist_items SET order_index = $1 WHERE id = $2 AND playlist_id = $3',
        [i, itemIds[i], req.params.id]
      );
    }
    
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;

