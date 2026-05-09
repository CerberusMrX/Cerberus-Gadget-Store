/**
 * CERBERUS GADGET STORE - Activity Logger Middleware
 * File: backend-api/middleware/activityLogger.js
 * Logs user actions to MongoDB
 */

const { ActivityLog } = require('../config/mongodb');

/**
 * @param {string} action - Action name (e.g., 'login', 'cart_add')
 * @param {function} getDetails - Optional fn(req, res_body) => details object
 */
const logActivity = (action, getDetails = null) => {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);

    res.json = function (body) {
      // Log after response is sent (non-blocking)
      if (body && body.success !== false) {
        const user = req.user || {};
        const details = getDetails ? getDetails(req, body) : {};

        ActivityLog.create({
          user_id:    user.user_id || null,
          user_email: user.email   || null,
          role:       user.role    || 'guest',
          action,
          details,
          ip:         req.ip || req.headers['x-forwarded-for'] || 'unknown',
          user_agent: req.headers['user-agent'] || 'unknown'
        }).catch(err => console.error('ActivityLog error:', err.message));
      }
      return originalJson(body);
    };

    next();
  };
};

module.exports = logActivity;
