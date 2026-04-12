const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const dbMiddleware = require('./middleware/db');
const pool = require('./config/db');

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());
app.use(dbMiddleware);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    await conn.query('SELECT 1');
    conn.release();
    res.json({ status: 'ok', db: 'connected', message: 'Backend is running' });
  } catch (err) {
    res
      .status(500)
      .json({ status: 'error', db: 'disconnected', error: err.message });
  }
});

// Routes will go here
// app.use('/api/auth', authRoutes);
// app.use('/api/profiles', profileRoutes);
// etc.

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`),
);
