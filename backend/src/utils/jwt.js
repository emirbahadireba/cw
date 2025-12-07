import jwt from 'jsonwebtoken';
import config from '../config/index.js';

export function generateAccessToken(payload) {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
}

export function generateRefreshToken(payload) {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });
}

export function generatePlayerToken(displayId, tenantId) {
  return jwt.sign(
    {
      displayId,
      tenantId,
      type: 'player',
    },
    config.jwt.secret,
    {
      expiresIn: '30d', // Player tokens last longer
    }
  );
}

export function verifyToken(token, isRefresh = false) {
  const secret = isRefresh ? config.jwt.refreshSecret : config.jwt.secret;
  return jwt.verify(token, secret);
}

