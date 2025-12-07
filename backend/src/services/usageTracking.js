import pool from '../config/database.js';
import { updateUsage } from './planLimits.js';

// Update usage tracking for a tenant
export async function updateUsageTracking(tenantId) {
  try {
    // Get current month
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    
    // Count displays
    const displaysResult = await pool.query(
      'SELECT COUNT(*) as count FROM displays WHERE tenant_id = $1',
      [tenantId]
    );
    await updateUsage(tenantId, 'displays', parseInt(displaysResult.rows[0].count), periodStart);
    
    // Count users
    const usersResult = await pool.query(
      'SELECT COUNT(*) as count FROM users WHERE tenant_id = $1',
      [tenantId]
    );
    await updateUsage(tenantId, 'users', parseInt(usersResult.rows[0].count), periodStart);
    
    // Count playlists
    const playlistsResult = await pool.query(
      'SELECT COUNT(*) as count FROM playlists WHERE tenant_id = $1',
      [tenantId]
    );
    await updateUsage(tenantId, 'playlists', parseInt(playlistsResult.rows[0].count), periodStart);
    
    // Count layouts
    const layoutsResult = await pool.query(
      'SELECT COUNT(*) as count FROM layouts WHERE tenant_id = $1',
      [tenantId]
    );
    await updateUsage(tenantId, 'layouts', parseInt(layoutsResult.rows[0].count), periodStart);
    
    // Count schedules
    const schedulesResult = await pool.query(
      'SELECT COUNT(*) as count FROM schedules WHERE tenant_id = $1',
      [tenantId]
    );
    await updateUsage(tenantId, 'schedules', parseInt(schedulesResult.rows[0].count), periodStart);
    
    // Calculate media storage
    const mediaResult = await pool.query(
      'SELECT COALESCE(SUM(size), 0) as total_bytes FROM media_files WHERE tenant_id = $1',
      [tenantId]
    );
    const mediaStorageGB = Math.ceil(parseInt(mediaResult.rows[0].total_bytes) / (1024 * 1024 * 1024));
    await updateUsage(tenantId, 'media_storage_gb', mediaStorageGB, periodStart);
    
    return true;
  } catch (error) {
    console.error('Error updating usage tracking:', error);
    return false;
  }
}

// Auto-update usage tracking (can be called periodically)
export async function autoUpdateUsageTracking() {
  try {
    const tenantsResult = await pool.query('SELECT id FROM tenants WHERE status = $1', ['active']);
    
    for (const tenant of tenantsResult.rows) {
      await updateUsageTracking(tenant.id);
    }
    
    console.log(`Updated usage tracking for ${tenantsResult.rows.length} tenants`);
  } catch (error) {
    console.error('Error in auto-update usage tracking:', error);
  }
}

