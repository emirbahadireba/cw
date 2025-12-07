import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import pool from '../config/database.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      
      // Get user from database
      const result = await pool.query(
        `SELECT u.*, t.plan, t.status as tenant_status
         FROM users u
         JOIN tenants t ON u.tenant_id = t.id
         WHERE u.id = $1 AND u.is_active = true AND t.status = 'active'`,
        [decoded.userId]
      );
      
      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'User not found or inactive' });
      }
      
      req.user = result.rows[0];
      req.tenantId = req.user.tenant_id;
      req.plan = req.user.plan;
      
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired' });
      }
      return res.status(401).json({ error: 'Invalid token' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Authentication error' });
  }
};

export const authenticatePlayer = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      
      if (decoded.type !== 'player') {
        return res.status(401).json({ error: 'Invalid token type' });
      }
      
      // Get display from database
      const result = await pool.query(
        `SELECT d.*, t.plan, t.status as tenant_status
         FROM displays d
         JOIN tenants t ON d.tenant_id = t.id
         WHERE d.id = $1 AND t.status = 'active'`,
        [decoded.displayId]
      );
      
      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Display not found or inactive' });
      }
      
      req.display = result.rows[0];
      req.tenantId = req.display.tenant_id;
      req.displayId = req.display.id;
      
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired' });
      }
      return res.status(401).json({ error: 'Invalid token' });
    }
  } catch (error) {
    console.error('Player auth middleware error:', error);
    return res.status(500).json({ error: 'Authentication error' });
  }
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
};

