import express from 'express';
import pool from '../config/database.js';
import { authenticate } from '../middleware/auth.js';
import { ensureTenant } from '../middleware/tenant.js';
import { requireFeature } from '../middleware/planLimits.js';

const router = express.Router();

router.use(authenticate);
router.use(ensureTenant);
router.use(requireFeature('analytics')); // Analytics is a premium feature

// GET /api/analytics/dashboard
router.get('/dashboard', async (req, res, next) => {
  try {
    const { period = 'week' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    // Get stats
    const viewsResult = await pool.query(
      `SELECT COUNT(*) as total FROM analytics 
       WHERE tenant_id = $1 AND event_type = 'view' AND timestamp >= $2`,
      [req.tenantId, startDate]
    );
    
    const displaysResult = await pool.query(
      'SELECT COUNT(DISTINCT display_id) as count FROM displays WHERE tenant_id = $1 AND status = $2',
      [req.tenantId, 'online']
    );
    
    const playlistsResult = await pool.query(
      'SELECT COUNT(*) as count FROM playlists WHERE tenant_id = $1 AND is_active = $2',
      [req.tenantId, true]
    );
    
    res.json({
      stats: {
        totalViews: parseInt(viewsResult.rows[0].total),
        activeDisplays: parseInt(displaysResult.rows[0].count),
        activePlaylists: parseInt(playlistsResult.rows[0].count),
      },
      charts: [], // Would contain chart data
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/analytics/displays
router.get('/displays', async (req, res, next) => {
  try {
    const { display_id, period = 'week' } = req.query;
    
    const now = new Date();
    let startDate = new Date();
    startDate.setDate(now.getDate() - 7);
    
    let query = `SELECT d.*, COUNT(a.id) as view_count 
                 FROM displays d
                 LEFT JOIN analytics a ON d.id = a.display_id AND a.event_type = 'view' AND a.timestamp >= $1
                 WHERE d.tenant_id = $2`;
    const params = [startDate, req.tenantId];
    
    if (display_id) {
      query += ' AND d.id = $3';
      params.push(display_id);
    }
    
    query += ' GROUP BY d.id ORDER BY view_count DESC';
    
    const result = await pool.query(query, params);
    
    res.json({ displays: result.rows });
  } catch (error) {
    next(error);
  }
});

// GET /api/analytics/content
router.get('/content', async (req, res, next) => {
  try {
    const { period = 'week' } = req.query;
    
    const now = new Date();
    let startDate = new Date();
    startDate.setDate(now.getDate() - 7);
    
    const result = await pool.query(
      `SELECT mf.*, COUNT(a.id) as view_count
       FROM media_files mf
       LEFT JOIN analytics a ON mf.id = a.media_file_id AND a.event_type = 'view' AND a.timestamp >= $1
       WHERE mf.tenant_id = $2
       GROUP BY mf.id
       ORDER BY view_count DESC
       LIMIT 10`,
      [startDate, req.tenantId]
    );
    
    res.json({ topContent: result.rows });
  } catch (error) {
    next(error);
  }
});

// POST /api/analytics/events
router.post('/events', async (req, res, next) => {
  try {
    const { display_id, playlist_id, media_file_id, event_type, event_data } = req.body;
    
    await pool.query(
      `INSERT INTO analytics (tenant_id, display_id, playlist_id, media_file_id, event_type, event_data, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)`,
      [req.tenantId, display_id || null, playlist_id || null, media_file_id || null, event_type, JSON.stringify(event_data || {})]
    );
    
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;

