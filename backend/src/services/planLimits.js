import pool from '../config/database.js';

// Get plan limits from database
export async function getPlanLimits(planName) {
  const result = await pool.query(
    'SELECT * FROM plan_limits WHERE plan_name = $1',
    [planName]
  );
  
  if (result.rows.length === 0) {
    throw new Error(`Plan limits not found for: ${planName}`);
  }
  
  return result.rows[0];
}

// Check if a value exceeds the limit (null means unlimited)
export function checkLimit(current, limit) {
  if (limit === null || limit === undefined) {
    return { allowed: true, remaining: null };
  }
  
  return {
    allowed: current < limit,
    remaining: limit - current,
    current,
    limit
  };
}

// Get current usage for a metric
export async function getCurrentUsage(tenantId, metricType, periodStart = null) {
  const period = periodStart || new Date().toISOString().slice(0, 7) + '-01'; // First day of current month
  
  const result = await pool.query(
    `SELECT metric_value FROM usage_tracking
     WHERE tenant_id = $1 AND metric_type = $2 AND period_start = $3`,
    [tenantId, metricType, period]
  );
  
  if (result.rows.length === 0) {
    return 0;
  }
  
  return parseInt(result.rows[0].metric_value) || 0;
}

// Update usage tracking
export async function updateUsage(tenantId, metricType, value, periodStart = null) {
  const period = periodStart || new Date().toISOString().slice(0, 7) + '-01';
  const periodEnd = new Date(period);
  periodEnd.setMonth(periodEnd.getMonth() + 1);
  periodEnd.setDate(0); // Last day of month
  
  await pool.query(
    `INSERT INTO usage_tracking (tenant_id, metric_type, metric_value, period_start, period_end)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (tenant_id, metric_type, period_start)
     DO UPDATE SET metric_value = $3, updated_at = CURRENT_TIMESTAMP`,
    [tenantId, metricType, value, period, periodEnd.toISOString().slice(0, 10)]
  );
}

// Check plan limit for a specific metric
export async function checkPlanLimit(tenantId, planName, metricType, currentValue = null) {
  const limits = await getPlanLimits(planName);
  
  let limitValue;
  switch (metricType) {
    case 'displays':
      limitValue = limits.max_displays;
      break;
    case 'users':
      limitValue = limits.max_users;
      break;
    case 'media_storage_gb':
      limitValue = limits.max_media_storage_gb;
      break;
    case 'media_file_size_mb':
      limitValue = limits.max_media_file_size_mb;
      break;
    case 'playlists':
      limitValue = limits.max_playlists;
      break;
    case 'layouts':
      limitValue = limits.max_layouts;
      break;
    case 'schedules':
      limitValue = limits.max_schedules;
      break;
    default:
      throw new Error(`Unknown metric type: ${metricType}`);
  }
  
  if (currentValue === null) {
    currentValue = await getCurrentUsage(tenantId, metricType);
  }
  
  return checkLimit(currentValue, limitValue);
}

// Check if feature is available in plan
export async function hasFeature(planName, featureName) {
  const limits = await getPlanLimits(planName);
  return limits.features?.[featureName] === true;
}

