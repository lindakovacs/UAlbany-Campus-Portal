const jwt = require('jsonwebtoken');
const { AuthenticationError } = require('../utils/errors');

// Verify JWT token
const authMiddleware = (req, res, next) => {
  try {
    // Get token from Authorization header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new AuthenticationError('No token provided');
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err instanceof AuthenticationError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Optional auth - doesn't fail if no token
const optionalAuthMiddleware = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    }
  } catch (err) {
    // Silently ignore invalid tokens for optional auth
  }
  next();
};

module.exports = { authMiddleware, optionalAuthMiddleware };
