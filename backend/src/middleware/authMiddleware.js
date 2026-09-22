const crypto = require('crypto');

let jwt = null;
try {
  jwt = require('jsonwebtoken');
} catch (e) {
  // Native fallback active
}

/**
 * Universal token verification helper
 */
function verifyToken(token, secret) {
  if (jwt) {
    return jwt.verify(token, secret);
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid token structure');
  }

  const [header, payload, signature] = parts;
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${payload}`)
    .digest('base64url');

  if (signature !== expectedSig) {
    throw new Error('Invalid token signature');
  }

  const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  if (data.exp && data.exp < Math.floor(Date.now() / 1000)) {
    const err = new Error('Token expired');
    err.name = 'TokenExpiredError';
    throw err;
  }

  return data;
}

/**
 * Middleware that authenticates incoming HTTP requests via JWT
 * Expects header: "Authorization: Bearer <JWT_TOKEN>"
 */
const protect = async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.',
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_explore_sri_lanka_2026';
    const decoded = verifyToken(token, secret);

    req.user = {
      id: decoded.id,
      email: decoded.email,
      full_name: decoded.full_name,
      role: decoded.role || 'user',
    };

    next();
  } catch (error) {
    console.error('[AuthMiddleware] Token verification failed:', error.message);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Your session has expired. Please log in again.',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid authentication token.',
    });
  }
};

/**
 * Optional Auth: Attaches req.user if valid token provided, but continues if no token
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_explore_sri_lanka_2026';
      req.user = verifyToken(token, secret);
    } catch (e) {
      req.user = null;
    }
  }
  next();
};

module.exports = {
  protect,
  optionalAuth,
};
