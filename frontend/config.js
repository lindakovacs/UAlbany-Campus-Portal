/**
 * Frontend Configuration
 * Contains environment-specific settings for the API client
 *
 * AUTO-DETECTION:
 * - Localhost (development) → Uses http://localhost:3001
 * - Any other domain (production) → Uses https://your-backend-url
 *
 * ⚠️  IMPORTANT: Update BACKEND_HOST below to match your actual backend URL
 */

// Detect environment
const IS_PRODUCTION =
  typeof window !== 'undefined' &&
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1';

const CONFIG = IS_PRODUCTION
  ? {
      // Production: Render deployment
      FRONTEND_URL: 'https://ualbany-campus-frontend.onrender.com',
      BACKEND_HOST: 'https://ualbany-campus-portal-api.onrender.com',
      BACKEND_PORT: 443,
    }
  : {
      // Development: Local machine
      FRONTEND_URL: 'http://localhost:3000',
      BACKEND_HOST: 'http://localhost',
      BACKEND_PORT: 3001,
    };

// ============================================
// HOW TO DEPLOY TO RENDER
// ============================================
/*
 * STEP 1: SETUP DATABASE
 * =====================
 * Option A - TiDB Cloud (Recommended, free):
 *   1. Go to https://tidbcloud.com
 *   2. Create free account, create Developer Tier cluster
 *   3. Copy connection details
 *   4. TiDB uses port 4000 and requires SSL
 *
 * Option B - Traditional MySQL:
 *   1. Use AWS RDS, DigitalOcean, or other managed MySQL
 *   2. Ensure database accepts external connections
 *
 *
 * STEP 2: DEPLOY BACKEND TO RENDER
 * ================================
 * 1. Go to https://render.com
 * 2. Sign up with GitHub
 * 3. Click "New +" → "Web Service"
 * 4. Select this repository (UAlbany-Campus-Portal)
 * 5. Fill in form:
 *    - Name: ualbany-campus-portal-api
 *    - Branch: main
 *    - Root Directory: server
 *    - Build Command: npm install
 *    - Start Command: npm start
 * 6. Click "Advanced" → Add Environment Variables:
 *    - DB_HOST: your-tidb-host.tidbcloud.com (or mysql host)
 *    - DB_USER: your_username
 *    - DB_PASS: your_password (for TiDB, use DB_PASS not DB_PASSWORD)
 *    - DB_NAME: your_database_name
 *    - JWT_SECRET: your_random_32_char_secret
 *    - NODE_ENV: production
 *    - FRONTEND_URL: https://your-frontend-url (important!)
 * 7. Click "Create Web Service" (wait for "Live" status)
 * 8. Copy your backend URL: https://your-api.onrender.com
 *
 *
 * STEP 3: UPDATE THIS FILE
 * =======================
 * Replace the BACKEND_HOST and FRONTEND_URL above:
 *   BACKEND_HOST: 'https://your-api.onrender.com'
 *   FRONTEND_URL: 'https://your-frontend.onrender.com'
 *
 * Then run:
 *   git add frontend/config.js
 *   git commit -m "Update config for Render deployment"
 *   git push
 *
 *
 * STEP 4: DEPLOY FRONTEND TO RENDER (or GitHub Pages)
 * ===================================================
 * Option A - Render Static Site:
 *   1. Click "New +" → "Static Site"
 *   2. Select your repository
 *   3. Build Command: (leave empty)
 *   4. Publish directory: . (current directory)
 *   5. Plan: Free
 *   6. Click "Create Static Site"
 *   7. Copy URL: https://your-frontend.onrender.com
 *
 * Option B - GitHub Pages (Alternative):
 *   1. Go to repository Settings → Pages
 *   2. Set source to "main" branch, /root folder
 *   3. URL will be: https://yourname.github.io/UAlbany-Campus-Portal
 *
 *
 * STEP 5: TEST DEPLOYMENT
 * =======================
 * 1. Visit your frontend URL in browser
 * 2. Open DevTools Console (F12)
 * 3. Run: console.log(API_CONFIG.API_BASE_URL)
 *    Should show: https://your-api.onrender.com/api
 * 4. Test login/register - should work!
 *
 *
 * IMPORTANT NOTES
 * ===============
 * ✓ Config auto-detects environment (localhost vs deployed)
 * ✓ Make sure server/.env has: FRONTEND_URL=your-frontend-url
 * ✓ CORS will block requests if FRONTEND_URL doesn't match
 * ✓ All .env files stay local, never commit to git
 * ✓ TiDB uses port 4000, not 3306
 * ✓ TiDB requires SSL (built-in)
 * ✓ HTTPS is automatic on Render
 *
 *
 * TROUBLESHOOTING
 * ===============
 * Issue: "Cannot reach backend"
 *   → Check BACKEND_HOST is correct (copy from Render URL)
 *   → Test: curl https://your-api.onrender.com/api/health
 *   → Check browser console for CORS errors
 *
 * Issue: "CORS blocked this request"
 *   → Ensure server/.env has: FRONTEND_URL=https://your-frontend-url
 *   → Go to Render backend service → Environment
 *   → Update FRONTEND_URL variable
 *   → Redeploy backend (or just edit, it redeployes)
 *
 * Issue: "Database connection failed"
 *   → Verify DB_HOST, DB_USER, DB_PASS in Render env vars
 *   → For TiDB: use port 4000, not 3306
 *   → Test credentials locally first
 *
 * For complete guide, see: documentation/RENDER_DEPLOYMENT.md
 */
