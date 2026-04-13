/**
 * Frontend Configuration
 * Contains environment-specific settings for the API client
 *
 * ⚠️  IMPORTANT: Keep these values in sync with server/.env
 * BACKEND_PORT should match PORT in server/.env
 * BACKEND_HOST should match your server URL
 */

const CONFIG = {
  // Matches SERVER FRONTEND_URL (.env) - Backend's allowed CORS origin
  FRONTEND_URL: 'http://localhost:3000',

  // Backend server connection
  BACKEND_HOST: 'http://localhost',
  BACKEND_PORT: 3001, // Must match PORT in server/.env
};

/**
 * CONFIGURATION GUIDE
 *
 * Development (default):
 *   BACKEND_HOST: 'http://localhost'
 *   BACKEND_PORT: 3001
 *   (Matches server/.env: PORT=3001)
 *
 * If backend port conflicts:
 * 1. Change PORT in server/.env (e.g., PORT=5000)
 * 2. Update BACKEND_PORT below to match (e.g., BACKEND_PORT: 5000)
 * 3. Restart backend: cd server && npm start
 *
 * Production:
 *   BACKEND_HOST: 'https://api.example.com'
 *   BACKEND_PORT: 443
 *
 * IMPORTANT:
 * - Changes to server/.env PORT requires updating BACKEND_PORT here
 * - Backend will read PORT from .env automatically
 * - Frontend must be reloaded to apply changes
 */
