const pool = require('../config/db');

const dbMiddleware = (req, res, next) => {
  req.db = pool;
  next();
};

module.exports = dbMiddleware;
