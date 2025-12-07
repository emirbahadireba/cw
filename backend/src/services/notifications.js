import pool from '../config/database.js';

export async function createNotification(tenantId, userId, type, title, message, severity = 'low', relatedResourceType = null, relatedResourceId = null) {
  try {
    await pool.query(
      `INSERT INTO notifications (tenant_id, user_id, type, title, message, severity, related_resource_type, related_resource_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [tenantId, userId, type, title, message, severity, relatedResourceType, relatedResourceId]
    );
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}

// Notify all users in a tenant
export async function notifyTenant(tenantId, type, title, message, severity = 'low', relatedResourceType = null, relatedResourceId = null) {
  try {
    await pool.query(
      `INSERT INTO notifications (tenant_id, user_id, type, title, message, severity, related_resource_type, related_resource_id)
       SELECT $1, id, $2, $3, $4, $5, $6, $7 FROM users WHERE tenant_id = $1 AND is_active = true`,
      [tenantId, type, title, message, severity, relatedResourceType, relatedResourceId]
    );
  } catch (error) {
    console.error('Error notifying tenant:', error);
  }
}

