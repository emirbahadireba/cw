import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';
import config from '../config/index.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js';
import { authenticate } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', validate(schemas.login), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Find user with tenant info
    const result = await pool.query(
      `SELECT u.*, t.id as tenant_id, t.name as tenant_name, t.plan, t.status as tenant_status
       FROM users u
       JOIN tenants t ON u.tenant_id = t.id
       WHERE u.email = $1 AND u.is_active = true`,
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    
    // Check tenant status
    if (user.tenant_status !== 'active') {
      return res.status(403).json({ error: 'Tenant account is not active' });
    }
    
    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Update last login
    await pool.query(
      'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );
    
    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      tenantId: user.tenant_id,
      email: user.email,
      role: user.role,
    });
    
    const refreshToken = generateRefreshToken({
      userId: user.id,
      tenantId: user.tenant_id,
    });
    
    // Return user data (without password)
    const { password_hash, ...userData } = user;
    
    res.json({
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        tenantId: userData.tenant_id,
        tenantName: userData.tenant_name,
        plan: userData.plan,
        avatar: userData.avatar_url,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }
    
    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
    
    // Verify user still exists and is active
    const result = await pool.query(
      `SELECT u.*, t.status as tenant_status
       FROM users u
       JOIN tenants t ON u.tenant_id = t.id
       WHERE u.id = $1 AND u.is_active = true AND t.status = 'active'`,
      [decoded.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }
    
    const user = result.rows[0];
    
    // Generate new access token
    const accessToken = generateAccessToken({
      userId: user.id,
      tenantId: user.tenant_id,
      email: user.email,
      role: user.role,
    });
    
    res.json({ accessToken });
  } catch (error) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }
    next(error);
  }
});

// POST /api/auth/logout
router.post('/logout', authenticate, async (req, res) => {
  // In a stateless JWT system, logout is handled client-side
  // But we can log the action for audit purposes
  res.json({ message: 'Logged out successfully' });
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const { password_hash, ...userData } = req.user;
    
    res.json({
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        tenantId: userData.tenant_id,
        plan: userData.plan,
        avatar: userData.avatar_url,
        isActive: userData.is_active,
        lastLoginAt: userData.last_login_at,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;

