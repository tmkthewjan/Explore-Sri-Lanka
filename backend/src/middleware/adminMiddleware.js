const { query } = require('../config/database');
const { fallbackUsers } = require('../services/authService');

/**
 * Middleware: Verifies authenticated user has 'admin' role.
 * Must be placed after authMiddleware.protect
 */
const requireAdmin = async (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required to access admin resources.',
    });
  }

  // Fast check from decoded JWT token
  if (req.user.role === 'admin') {
    return next();
  }

  // DB verification fallback (in case role was updated recently)
  try {
    const result = await query('SELECT role, is_active FROM users WHERE id = $1 LIMIT 1', [req.user.id]);
    if (result.rows.length > 0) {
      const dbUser = result.rows[0];
      if (dbUser.is_active === false) {
        return res.status(403).json({
          success: false,
          message: 'Account is deactivated.',
        });
      }
      if (dbUser.role === 'admin') {
        req.user.role = 'admin';
        return next();
      }
    }
  } catch (err) {
    const memUser = fallbackUsers.find((u) => u.id === req.user.id || u.email === req.user.email);
    if (memUser && memUser.role === 'admin') {
      req.user.role = 'admin';
      return next();
    }
  }

  return res.status(403).json({
    success: false,
    message: 'Access forbidden: Admin privileges required to access this resource.',
  });
};

module.exports = {
  requireAdmin,
};
