import pool from '../config/database.js';
import { checkPlanLimit, hasFeature } from '../services/planLimits.js';

// Middleware to check plan limits before creating resources
export const checkLimit = (metricType) => {
  return async (req, res, next) => {
    try {
      if (!req.tenantId || !req.plan) {
        return res.status(400).json({ error: 'Tenant information required' });
      }
      
      // Get current usage
      let currentValue;
      switch (metricType) {
        case 'displays':
          const { rows: displayRows } = await pool.query(
            'SELECT COUNT(*) as count FROM displays WHERE tenant_id = $1',
            [req.tenantId]
          );
          currentValue = parseInt(displayRows[0].count);
          break;
        case 'users':
          const { rows: userRows } = await pool.query(
            'SELECT COUNT(*) as count FROM users WHERE tenant_id = $1',
            [req.tenantId]
          );
          currentValue = parseInt(userRows[0].count);
          break;
        case 'playlists':
          const { rows: playlistRows } = await pool.query(
            'SELECT COUNT(*) as count FROM playlists WHERE tenant_id = $1',
            [req.tenantId]
          );
          currentValue = parseInt(playlistRows[0].count);
          break;
        case 'layouts':
          const { rows: layoutRows } = await pool.query(
            'SELECT COUNT(*) as count FROM layouts WHERE tenant_id = $1',
            [req.tenantId]
          );
          currentValue = parseInt(layoutRows[0].count);
          break;
        case 'schedules':
          const { rows: scheduleRows } = await pool.query(
            'SELECT COUNT(*) as count FROM schedules WHERE tenant_id = $1',
            [req.tenantId]
          );
          currentValue = parseInt(scheduleRows[0].count);
          break;
        default:
          return next();
      }
      
      const limitCheck = await checkPlanLimit(req.tenantId, req.plan, metricType, currentValue);
      
      if (!limitCheck.allowed) {
        // Create notification about limit exceeded
        const { notifyTenant } = await import('../services/notifications.js');
        await notifyTenant(
          req.tenantId,
          'warning',
          'Plan Limit Exceeded',
          `You have reached the limit for ${metricType} (${limitCheck.current}/${limitCheck.limit}). Please upgrade your plan.`,
          'medium',
          'plan',
          null
        );
        
        return res.status(403).json({
          error: 'Plan limit exceeded',
          metric: metricType,
          current: limitCheck.current,
          limit: limitCheck.limit,
          message: `Your ${req.plan} plan allows ${limitCheck.limit} ${metricType}. Please upgrade to add more.`
        });
      }
      
      next();
    } catch (error) {
      console.error('Plan limit check error:', error);
      return res.status(500).json({ error: 'Failed to check plan limits' });
    }
  };
};

// Middleware to check if feature is available
export const requireFeature = (featureName) => {
  return async (req, res, next) => {
    try {
      if (!req.plan) {
        return res.status(400).json({ error: 'Plan information required' });
      }
      
      const featureAvailable = await hasFeature(req.plan, featureName);
      
      if (!featureAvailable) {
        return res.status(403).json({
          error: 'Feature not available',
          feature: featureName,
          message: `This feature is not available in your ${req.plan} plan. Please upgrade.`
        });
      }
      
      next();
    } catch (error) {
      console.error('Feature check error:', error);
      return res.status(500).json({ error: 'Failed to check feature availability' });
    }
  };
};

