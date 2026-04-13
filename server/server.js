const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const dbMiddleware = require('./middleware/db');
const pool = require('./config/db');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profiles');
const profilesEducationRoutes = require('./routes/profilesEducation');
const profilesExperienceRoutes = require('./routes/profilesExperience');
const educationRoutes = require('./routes/education');
const experienceRoutes = require('./routes/experience');
const postRoutes = require('./routes/posts');
const { ApiError } = require('./utils/errors');

// Middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'http://localhost:*'],
      },
    },
    frameguard: { action: 'deny' },
    noSniff: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  }),
);

// CORS: Allow localhost on any port (for development)
// In production, set FRONTEND_URL to your actual domain
const corsOptions = {
  origin: (origin, callback) => {
    // Allow localhost connections (for development)
    if (
      !origin ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1')
    ) {
      callback(null, true);
    }
    // In production, validate against FRONTEND_URL
    else if (
      process.env.NODE_ENV === 'production' &&
      origin === process.env.FRONTEND_URL
    ) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
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

// Routes (order matters: more specific routes first)
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profilesEducationRoutes); // More specific: /:userId/education
app.use('/api/profiles', profilesExperienceRoutes); // More specific: /:userId/experience
app.use('/api/profiles', profileRoutes); // General: / and /:userId
app.use('/api/education', educationRoutes);
app.use('/api/experience', experienceRoutes);
app.use('/api/posts', postRoutes);

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  res.status(500).json({ error: 'Internal server error' });
});

// Start server
// PORT is read from .env file (default: 3001)
// If you change PORT in .env, also update BACKEND_PORT in frontend/config.js
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(
    `📝 If you changed PORT in .env, update BACKEND_PORT in frontend/config.js`,
  );
});
