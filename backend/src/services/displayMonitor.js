import pool from '../config/database.js';
import { notifyTenant } from './notifications.js';

// Check for offline displays and create notifications
export async function checkDisplayStatus() {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    // Find displays that should be online but haven't sent heartbeat
    const result = await pool.query(
      `SELECT d.*, t.id as tenant_id 
       FROM displays d
       JOIN tenants t ON d.tenant_id = t.id
       WHERE d.status = 'online' 
       AND (d.last_seen_at IS NULL OR d.last_seen_at < $1)
       AND t.status = 'active'`,
      [fiveMinutesAgo]
    );
    
    for (const display of result.rows) {
      // Update display status
      await pool.query(
        'UPDATE displays SET status = $1 WHERE id = $2',
        ['offline', display.id]
      );
      
      // Create notification
      await notifyTenant(
        display.tenant_id,
        'warning',
        'Display Offline',
        `Display "${display.name}" has gone offline`,
        'medium',
        'display',
        display.id
      );
    }
    
    if (result.rows.length > 0) {
      console.log(`Marked ${result.rows.length} displays as offline`);
    }
  } catch (error) {
    console.error('Error checking display status:', error);
  }
}

// Run every 5 minutes
export function startDisplayMonitor() {
  checkDisplayStatus();
  setInterval(checkDisplayStatus, 5 * 60 * 1000); // Every 5 minutes
}

