import { createAuditLog, getClientIp, getUserAgent } from '../services/auditLog.js';

// Middleware to log actions for audit
export const auditLog = (action, resourceType) => {
  return async (req, res, next) => {
    // Store original json method
    const originalJson = res.json.bind(res);
    
    // Override json method to log after response
    res.json = function(data) {
      // Log the action
      if (req.user) {
        createAuditLog(
          req.tenantId,
          req.user.id,
          action,
          resourceType,
          req.params.id || data?.id || null,
          { method: req.method, path: req.path, body: req.body },
          getClientIp(req),
          getUserAgent(req)
        );
      }
      
      // Call original json method
      return originalJson(data);
    };
    
    next();
  };
};

