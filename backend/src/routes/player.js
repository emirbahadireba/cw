import express from 'express';
import pool from '../config/database.js';
import { authenticatePlayer } from '../middleware/auth.js';
import { generatePlayerToken } from '../utils/jwt.js';

const router = express.Router();

// POST /api/player/register
router.post('/register', async (req, res, next) => {
  try {
    const { pair_code, platform, resolution, model } = req.body;
    
    if (!pair_code) {
      return res.status(400).json({ error: 'Pair code is required' });
    }
    
    // Find display by pair code
    const result = await pool.query(
      `SELECT * FROM displays 
       WHERE pair_code = $1 AND pair_code_expires_at > CURRENT_TIMESTAMP`,
      [pair_code]
    );
    
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired pair code' });
    }
    
    const display = result.rows[0];
    
    // Update display with player info
    await pool.query(
      `UPDATE displays 
       SET platform = $1, resolution = $2, model = $3, status = 'online', last_seen_at = CURRENT_TIMESTAMP, pair_code = NULL, pair_code_expires_at = NULL
       WHERE id = $4`,
      [platform, resolution, model, display.id]
    );
    
    // Generate player token
    const accessToken = generatePlayerToken(display.id, display.tenant_id);
    
    res.json({
      display: { ...display, platform, resolution, model, status: 'online' },
      accessToken,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/player/content
router.get('/content', authenticatePlayer, async (req, res, next) => {
  try {
    const display = req.display;
    
    // Get current playlist if assigned
    let playlist = null;
    let layout = null;
    
    if (display.current_playlist_id) {
      const playlistResult = await pool.query(
        'SELECT * FROM playlists WHERE id = $1 AND tenant_id = $2',
        [display.current_playlist_id, display.tenant_id]
      );
      
      if (playlistResult.rows.length > 0) {
        playlist = playlistResult.rows[0];
        
        // Get playlist items
        const itemsResult = await pool.query(
          `SELECT pi.*, mf.url, mf.type as media_type, mf.name as media_name
           FROM playlist_items pi
           JOIN media_files mf ON pi.media_file_id = mf.id
           WHERE pi.playlist_id = $1
           ORDER BY pi.order_index`,
          [playlist.id]
        );
        
        playlist.items = itemsResult.rows;
      }
    }
    
    // Get layout if assigned (could be from schedule or default)
    // For now, return null - this would be determined by schedule logic
    
    res.json({
      playlist,
      layout,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/player/heartbeat
router.post('/heartbeat', authenticatePlayer, async (req, res, next) => {
  try {
    const { status, temperature, current_item_id } = req.body;
    
    const updates = ['last_seen_at = CURRENT_TIMESTAMP'];
    const params = [];
    let paramIndex = 1;
    
    if (status) {
      updates.push(`status = $${paramIndex++}`);
      params.push(status);
    }
    if (temperature !== undefined) {
      updates.push(`temperature = $${paramIndex++}`);
      params.push(temperature);
    }
    
    params.push(req.displayId);
    
    await pool.query(
      `UPDATE displays SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
      params
    );
    
    // Log analytics event
    if (current_item_id) {
      await pool.query(
        `INSERT INTO analytics (tenant_id, display_id, event_type, event_data, timestamp)
         VALUES ($1, $2, 'heartbeat', $3, CURRENT_TIMESTAMP)`,
        [req.tenantId, req.displayId, JSON.stringify({ current_item_id, temperature })]
      );
    }
    
    res.json({ success: true, commands: [] }); // Commands could be used to send instructions to player
  } catch (error) {
    next(error);
  }
});

// GET /api/player/media/:id
router.get('/media/:id', authenticatePlayer, async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT url FROM media_files WHERE id = $1 AND tenant_id = $2',
      [req.params.id, req.tenantId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Media file not found' });
    }
    
    // In a real implementation, this would stream the file or redirect to CDN
    // For now, return the URL
    res.json({ url: result.rows[0].url });
  } catch (error) {
    next(error);
  }
});

export default router;

