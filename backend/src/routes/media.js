import express from 'express';
import multer from 'multer';
import pool from '../config/database.js';
import { authenticate } from '../middleware/auth.js';
import { ensureTenant } from '../middleware/tenant.js';
import { getPlanLimits } from '../services/planLimits.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 500 * 1024 * 1024 } }); // 500MB max

router.use(authenticate);
router.use(ensureTenant);

// GET /api/media
router.get('/', async (req, res, next) => {
  try {
    const { type, search, tags, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = 'SELECT * FROM media_files WHERE tenant_id = $1';
    const params = [req.tenantId];
    let paramIndex = 2;
    
    if (type) {
      query += ` AND type LIKE $${paramIndex++}`;
      params.push(`${type}%`);
    }
    
    if (search) {
      query += ` AND name ILIKE $${paramIndex++}`;
      params.push(`%${search}%`);
    }
    
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      query += ` AND tags && $${paramIndex++}`;
      params.push(tagArray);
    }
    
    query += ` ORDER BY uploaded_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    params.push(parseInt(limit), offset);
    
    const result = await pool.query(query, params);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM media_files WHERE tenant_id = $1';
    const countParams = [req.tenantId];
    if (type) countParams.push(`${type}%`);
    if (search) countParams.push(`%${search}%`);
    if (tags) countParams.push(Array.isArray(tags) ? tags : [tags]);
    const countResult = await pool.query(countQuery, countParams);
    
    res.json({
      media: result.rows,
      total: parseInt(countResult.rows[0].total),
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/media/:id
router.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT * FROM media_files WHERE id = $1 AND tenant_id = $2',
      [req.params.id, req.tenantId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Media file not found' });
    }
    
    res.json({ media: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// POST /api/media/upload
router.post('/upload', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Check file size limit
    const limits = await getPlanLimits(req.plan);
    const fileSizeMB = req.file.size / (1024 * 1024);
    
    if (limits.max_media_file_size_mb && fileSizeMB > limits.max_media_file_size_mb) {
      return res.status(403).json({
        error: 'File size exceeds limit',
        maxSize: limits.max_media_file_size_mb,
        fileSize: fileSizeMB.toFixed(2),
      });
    }
    
    // Check total storage limit
    const storageResult = await pool.query(
      'SELECT COALESCE(SUM(size), 0) as total_bytes FROM media_files WHERE tenant_id = $1',
      [req.tenantId]
    );
    const currentStorageGB = parseInt(storageResult.rows[0].total_bytes) / (1024 * 1024 * 1024);
    
    if (limits.max_media_storage_gb && (currentStorageGB + fileSizeMB / 1024) > limits.max_media_storage_gb) {
      return res.status(403).json({
        error: 'Storage limit exceeded',
        current: currentStorageGB.toFixed(2),
        limit: limits.max_media_storage_gb,
      });
    }
    
    // In a real implementation, upload to S3/R2 here
    // For now, we'll just store metadata
    const url = `https://storage.example.com/${req.tenantId}/${req.file.originalname}`;
    
    const result = await pool.query(
      `INSERT INTO media_files (tenant_id, name, type, size, url, uploaded_by, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [req.tenantId, req.file.originalname, req.file.mimetype, req.file.size, url, req.user.id, []]
    );
    
    res.status(201).json({ media: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// PUT /api/media/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { name, tags } = req.body;
    
    const updates = [];
    const params = [];
    let paramIndex = 1;
    
    if (name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      params.push(name);
    }
    if (tags !== undefined) {
      updates.push(`tags = $${paramIndex++}`);
      params.push(Array.isArray(tags) ? tags : [tags]);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    params.push(req.params.id, req.tenantId);
    
    const result = await pool.query(
      `UPDATE media_files SET ${updates.join(', ')} WHERE id = $${paramIndex++} AND tenant_id = $${paramIndex++} RETURNING *`,
      params
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Media file not found' });
    }
    
    res.json({ media: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/media/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await pool.query(
      'DELETE FROM media_files WHERE id = $1 AND tenant_id = $2 RETURNING id',
      [req.params.id, req.tenantId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Media file not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// GET /api/media/stats
router.get('/stats', async (req, res, next) => {
  try {
    const totalResult = await pool.query(
      'SELECT COUNT(*) as total FROM media_files WHERE tenant_id = $1',
      [req.tenantId]
    );
    
    const imagesResult = await pool.query(
      "SELECT COUNT(*) as count FROM media_files WHERE tenant_id = $1 AND type LIKE 'image/%'",
      [req.tenantId]
    );
    
    const videosResult = await pool.query(
      "SELECT COUNT(*) as count FROM media_files WHERE tenant_id = $1 AND type LIKE 'video/%'",
      [req.tenantId]
    );
    
    const sizeResult = await pool.query(
      'SELECT COALESCE(SUM(size), 0) as total_bytes FROM media_files WHERE tenant_id = $1',
      [req.tenantId]
    );
    
    res.json({
      total: parseInt(totalResult.rows[0].total),
      images: parseInt(imagesResult.rows[0].count),
      videos: parseInt(videosResult.rows[0].count),
      totalSize: parseInt(sizeResult.rows[0].total_bytes),
    });
  } catch (error) {
    next(error);
  }
});

export default router;

