import express from 'express';
import pool from '../config/database.js';
import { authenticate } from '../middleware/auth.js';
import { ensureTenant } from '../middleware/tenant.js';
import { validate, schemas } from '../middleware/validation.js';
import { getPlanLimits, getCurrentUsage, updateUsage } from '../services/planLimits.js';
import { notifyTenant } from '../services/notifications.js';

const router = express.Router();

router.use(authenticate);
router.use(ensureTenant);

// GET /api/plans
router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT * FROM plan_limits ORDER BY price_monthly ASC NULLS LAST'
    );
    
    res.json({ plans: result.rows });
  } catch (error) {
    next(error);
  }
});

// GET /api/plans/current
router.get('/current', async (req, res, next) => {
  try {
    const limits = await getPlanLimits(req.plan);
    
    // Get current usage
    const usage = {
      displays: await getCurrentUsage(req.tenantId, 'displays'),
      users: await getCurrentUsage(req.tenantId, 'users'),
      playlists: await getCurrentUsage(req.tenantId, 'playlists'),
      layouts: await getCurrentUsage(req.tenantId, 'layouts'),
      schedules: await getCurrentUsage(req.tenantId, 'schedules'),
    };
    
    // Get media storage
    const mediaResult = await pool.query(
      'SELECT COALESCE(SUM(size), 0) as total_bytes FROM media_files WHERE tenant_id = $1',
      [req.tenantId]
    );
    usage.media_storage_gb = parseFloat((parseInt(mediaResult.rows[0].total_bytes) / (1024 * 1024 * 1024)).toFixed(2));
    
    res.json({
      plan: req.plan,
      limits,
      usage,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/plans/usage
router.get('/usage', async (req, res, next) => {
  try {
    const limits = await getPlanLimits(req.plan);
    
    // Get all usage metrics
    const displaysCount = await pool.query(
      'SELECT COUNT(*) as count FROM displays WHERE tenant_id = $1',
      [req.tenantId]
    );
    
    const usersCount = await pool.query(
      'SELECT COUNT(*) as count FROM users WHERE tenant_id = $1',
      [req.tenantId]
    );
    
    const playlistsCount = await pool.query(
      'SELECT COUNT(*) as count FROM playlists WHERE tenant_id = $1',
      [req.tenantId]
    );
    
    const layoutsCount = await pool.query(
      'SELECT COUNT(*) as count FROM layouts WHERE tenant_id = $1',
      [req.tenantId]
    );
    
    const schedulesCount = await pool.query(
      'SELECT COUNT(*) as count FROM schedules WHERE tenant_id = $1',
      [req.tenantId]
    );
    
    const mediaResult = await pool.query(
      'SELECT COALESCE(SUM(size), 0) as total_bytes FROM media_files WHERE tenant_id = $1',
      [req.tenantId]
    );
    
    const mediaStorageGB = parseFloat((parseInt(mediaResult.rows[0].total_bytes) / (1024 * 1024 * 1024)).toFixed(2));
    
    res.json({
      usage: {
        displays: {
          current: parseInt(displaysCount.rows[0].count),
          limit: limits.max_displays,
        },
        users: {
          current: parseInt(usersCount.rows[0].count),
          limit: limits.max_users,
        },
        media_storage: {
          current: mediaStorageGB,
          limit: limits.max_media_storage_gb,
        },
        playlists: {
          current: parseInt(playlistsCount.rows[0].count),
          limit: limits.max_playlists,
        },
        layouts: {
          current: parseInt(layoutsCount.rows[0].count),
          limit: limits.max_layouts,
        },
        schedules: {
          current: parseInt(schedulesCount.rows[0].count),
          limit: limits.max_schedules,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/plans/upgrade
router.post('/upgrade', validate(schemas.upgradePlan), async (req, res, next) => {
  try {
    const { plan } = req.body;
    
    // In a real implementation, this would integrate with Stripe
    // For now, we just update the tenant plan
    await pool.query(
      'UPDATE tenants SET plan = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [plan, req.tenantId]
    );
    
    // Notify tenant about upgrade
    await notifyTenant(
      req.tenantId,
      'success',
      'Plan Upgraded',
      `Your plan has been upgraded to ${plan}. Enjoy the new features!`,
      'low',
      'plan',
      null
    );
    
    res.json({ success: true, new_plan: plan });
  } catch (error) {
    next(error);
  }
});

// POST /api/plans/downgrade
router.post('/downgrade', validate(schemas.downgradePlan), async (req, res, next) => {
  try {
    const { plan } = req.body;
    
    // In a real implementation, this would schedule the downgrade
    await pool.query(
      'UPDATE tenants SET plan = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [plan, req.tenantId]
    );
    
    // Notify tenant about downgrade
    await notifyTenant(
      req.tenantId,
      'info',
      'Plan Downgraded',
      `Your plan has been changed to ${plan}. Some features may no longer be available.`,
      'low',
      'plan',
      null
    );
    
    res.json({ success: true, new_plan: plan, effective_date: new Date().toISOString() });
  } catch (error) {
    next(error);
  }
});

// GET /api/plans/billing
router.get('/billing', async (req, res, next) => {
  try {
    // In a real implementation, this would fetch from Stripe
    res.json({
      subscription: {
        plan: req.plan,
        status: 'active',
      },
      invoices: [],
      payment_methods: [],
    });
  } catch (error) {
    next(error);
  }
});

export default router;

