import pool from '../config/database.js';

// Middleware to ensure tenant_id is set and valid
export const ensureTenant = async (req, res, next) => {
  try {
    if (!req.tenantId) {
      return res.status(400).json({ error: 'Tenant ID is required' });
    }
    
    // Verify tenant exists and is active
    const result = await pool.query(
      'SELECT id, plan, status FROM tenants WHERE id = $1',
      [req.tenantId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    
    if (result.rows[0].status !== 'active') {
      return res.status(403).json({ error: 'Tenant is not active' });
    }
    
    req.tenant = result.rows[0];
    req.plan = req.tenant.plan;
    
    next();
  } catch (error) {
    console.error('Tenant middleware error:', error);
    return res.status(500).json({ error: 'Tenant verification error' });
  }
};

// Helper to add tenant_id filter to queries
export const addTenantFilter = (query, params, tenantId) => {
  if (!query.includes('WHERE')) {
    query += ` WHERE tenant_id = $${params.length + 1}`;
  } else {
    query += ` AND tenant_id = $${params.length + 1}`;
  }
  params.push(tenantId);
  return { query, params };
};

