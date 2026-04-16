# Render Deployment Guide

Complete step-by-step guide to deploy your UAlbany Campus Portal to [Render.com](https://render.com).

## Prerequisites

### Ensure Your `package.json` Has Required Scripts

For JavaScript projects:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

For TypeScript + Sequelize projects:

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js",
    "migrate": "sequelize db:migrate",
    "dev": "ts-node server.ts"
  }
}
```

Render will run these commands during deployment and startup.

---

## Overview

**Render.com** is a free platform for deploying Node.js/Express backends and static frontends.

This guide covers:

- ✅ Deploying Node.js backend API
- ✅ Deploying static frontend
- ✅ Configuring environment variables
- ✅ Setting up CORS for production
- ✅ Automatic API URL configuration
- ✅ Database options (TiDB Cloud or MySQL)
- ✅ SSL/Security configuration

### Database Options Comparison

| Feature      | TiDB Cloud             | Traditional MySQL        |
| ------------ | ---------------------- | ------------------------ |
| Cost         | Free tier              | Variable (AWS RDS, etc)  |
| Setup Time   | 5 minutes              | Varies                   |
| SSL/Security | Built-in, required     | Manual setup             |
| Maintenance  | Serverless, managed    | Managed or manual        |
| Best For     | Free tier, prototyping | Production, complex apps |

**Recommendation**: Start with **TiDB Cloud** for simplicity, zero cost, and built-in SSL.

---

## Part 1: Backend Deployment (Express API)

### Database Setup Options

Choose one of these for your production database:

#### Option A: TiDB Cloud (Recommended - Free Tier)

**Best for**: Free hosting with managed MySQL-compatible database

1. Go to [tidbcloud.com](https://tidbcloud.com) and create free account
2. Create new cluster under Developer Tier (free)
3. TiDB Cloud provides fully managed MySQL-compatible database
4. Copy connection string (includes SSL requirements)
5. No server maintenance needed

**Advantages**:

- Free tier included
- Serverless (no management)
- MySQL-compatible
- SSL secure by default
- Perfect for staging/prototyping

#### Option B: Traditional MySQL Database

**Best for**: Using existing database or managed hosting

- Managed MySQL at AWS RDS, DigitalOcean, or similar
- On-premises database with public IP
- Ensure database accepts connections from Render

### Step 1: Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up with GitHub (recommended for easy deployments)
3. Authorize GitHub access

### Step 2: Create New Web Service

1. Click **"New +"** → **"Web Service"**
2. Select your GitHub repository: `UAlbany-Campus-Portal`
3. Fill in the form:
   - **Name**: `ualbany-campus-portal-api`
   - **Branch**: `main`
   - **Root Directory**: `server` (if your backend is in server/ folder)
   - **Runtime**: `Node`
   - **Build Command** (choose based on your setup):
     - **JavaScript/Node.js (default)**:
       ```
       npm install
       ```
     - **TypeScript + Sequelize** (with migrations):
       ```
       npm install && npm run build && npm run migrate
       ```
     - **Alternative** (if migrations not needed):
       ```
       npm install && npm run build
       ```
   - **Start Command**:
     ```
     npm start
     ```
   - **Plan**: `Free` (with option to upgrade if needed)

### Step 3: Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"** and add:

#### For TiDB Cloud (Recommended):

```
DB_HOST=your-tidb-cluster.tidbcloud.com
DB_USER=your_tidb_user
DB_PASS=your_tidb_password
DB_NAME=your_database_name
JWT_SECRET=your_very_long_random_secret_key_min_32_chars
NODE_ENV=production
FRONTEND_URL=https://ualbany-campus-portal.onrender.com
PORT=3001
GEMINI_API_KEY=your_gemini_key_if_using_chatbot
GEMINI_MODEL=gemini-2.5-flash
```

**Important for TiDB**:

- TiDB requires SSL connections
- Use port 4000 instead of 3306
- Variable name is `DB_PASS` (not `DB_PASSWORD`)

#### For Traditional MySQL:

```
DB_HOST=your_database_host.com
DB_USER=your_db_user
DB_PASSWORD=your_secure_db_password
DB_NAME=your_database_name
JWT_SECRET=your_very_long_random_secret_key_min_32_chars
NODE_ENV=production
FRONTEND_URL=https://ualbany-campus-portal.onrender.com
PORT=3001
GEMINI_API_KEY=your_gemini_key_if_using_chatbot
GEMINI_MODEL=gemini-2.5-flash
```

⚠️ **IMPORTANT**:

- Generate a strong `JWT_SECRET` (at least 32 random characters)
- Use your production database credentials
- Set `FRONTEND_URL` to match your frontend deployment URL
- For TiDB: use `DB_PASS`, for MySQL: use `DB_PASSWORD`

### Step 4: Deploy

1. Click **"Create Web Service"**
2. Render automatically starts deployment
3. Watch the logs - wait for **"Your service is live"**
4. Copy your backend URL (e.g., `https://ualbany-campus-portal-api.onrender.com`)

### Backend URL Format

```
https://ualbany-campus-portal-api.onrender.com
```

---

## Part 1.5: Optional - TiDB Cloud SSL Configuration

If you're using **TiDB Cloud** (recommended), configure your backend to use SSL:

### Node.js + MySQL2 with SSL (Current Setup)

Update your database connection in `server/` files:

```javascript
// Example: server/config/database.js or similar
const mysql = require('mysql2/promise');

const connection = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: 4000, // TiDB Cloud uses port 4000
  ssl: {
    require: true,
    rejectUnauthorized: true, // Enforces SSL certificate validation
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
```

### If Using Sequelize (TypeScript):

```javascript
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: true,
      },
    },
  },
);
```

### Optional: Connect to TiDB from Terminal

Connect directly to your TiDB database for debugging:

```bash
mysql -h <your-tidb-host> \
       -P 4000 \
       -u <your-user> \
       -p \
       --ssl-mode=REQUIRED
```

Or use a GUI tool like **DBeaver** or **MySQL Workbench**:

- Host: `your-tidb-cluster.tidbcloud.com`
- Port: `4000`
- User: Your TiDB username
- Password: Your TiDB password
- Enable SSL in connection settings

---

## Part 2: Frontend Deployment (Static Site)

### Option A: Deploy on Render (Recommended for simplicity)

#### Step 1: Deploy Frontend as Static Site

1. Create a `render.yaml` in your project root:

```yaml
services:
  - type: web
    name: ualbany-campus-portal
    buildCommand: echo "Static site - no build needed"
    staticPublishPath: .
    envVars:
      - key: NODE_ENV
        value: production
```

2. Or deploy manually:
   - Click **"New +"** → **"Static Site"**
   - Select your GitHub repo
   - **Name**: `ualbany-campus-portal`
   - **Build Command**: (leave empty)
   - **Publish directory**: `.` (root)
   - Click **"Create Static Site"**

#### Step 2: Copy Frontend URL

```
https://ualbany-campus-portal.onrender.com
```

### Option B: Deploy on GitHub Pages (Alternative - Free)

1. Push all changes to GitHub
2. Go to repository **Settings** → **Pages**
3. Set source to `main` branch, root folder
4. Your site will be at: `https://username.github.io/UAlbany-Campus-Portal`

---

## Part 3: Update Frontend Configuration

### The `frontend/config.js` automatically handles both environments:

```javascript
const IS_PRODUCTION =
  typeof window !== 'undefined' &&
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1';

const CONFIG = IS_PRODUCTION
  ? {
      // Production: Render deployment
      FRONTEND_URL: 'https://ualbany-campus-portal.onrender.com',
      BACKEND_HOST: 'https://ualbany-campus-portal-api.onrender.com',
      BACKEND_PORT: 443,
    }
  : {
      // Development: Local machine
      FRONTEND_URL: 'http://localhost:3000',
      BACKEND_HOST: 'http://localhost',
      BACKEND_PORT: 3001,
    };
```

### How it works:

- ✅ **Local development** (localhost): Uses `http://localhost:3001`
- ✅ **Production** (any other domain): Uses `https://ualbany-campus-portal-api.onrender.com`
- ⚠️ **UPDATE**: Change URLs in the `CONFIG` object to match your actual Render URLs

---

## Part 4: CORS Configuration for Production

### Update `server/server.js`

The CORS middleware already handles production mode:

```javascript
// In server/server.js - CORS middleware
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins =
      process.env.NODE_ENV === 'production'
        ? [process.env.FRONTEND_URL]
        : ['http://localhost:3000', 'http://127.0.0.1:5500'];

    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('CORS blocked'));
    }
  },
  credentials: true,
};
```

### What this does:

- **Development**: Allows localhost connections
- **Production**: Only allows requests from `FRONTEND_URL` env var
- **Blocks**: Any unauthorized origins (security!)

---

## Part 5: Deployment Checklist

### Before Pushing:

- [ ] All `.env` files in `.gitignore` (secrets not committed)
- [ ] `server/.env.example` shows template without real secrets
- [ ] `frontend/config.js` has correct Render URLs
- [ ] `server/server.js` has CORS configured
- [ ] `package.json` has correct `build` and `start` scripts
- [ ] Database credentials ready:
  - [ ] If **TiDB Cloud**: Host, username, password (DB_PASS)
  - [ ] If **MySQL**: Host, username, password (DB_PASSWORD)
- [ ] If using **TypeScript**: `server.ts` builds with `npm run build`
- [ ] If using **Sequelize**: `npm run migrate` runs successfully locally

### After Deployment:

- [ ] Backend Service is "Live" on Render
- [ ] Frontend Site is "Live" on Render
- [ ] Test frontend URL in browser
- [ ] Check browser console for API errors
- [ ] Test API endpoint: `https://your-backend-url/api/health`
- [ ] Verify helmet.js security headers present
- [ ] Test login/register to ensure JWT works

---

## Part 6: Testing Production Deployment

### Test Backend Health Check:

```bash
curl https://ualbany-campus-portal-api.onrender.com/api/health
```

Should return:

```json
{ "status": "ok" }
```

### Test Frontend API Connection:

1. Open browser DevTools (F12)
2. Open Console tab
3. Run:

```javascript
fetch('https://ualbany-campus-portal-api.onrender.com/api/health')
  .then((r) => r.json())
  .then((data) => console.log('✅ Connected:', data))
  .catch((e) => console.error('❌ Error:', e));
```

### Test CORS:

If you get CORS errors, check:

1. `server/.env` has `FRONTEND_URL=https://ualbany-campus-portal.onrender.com`
2. `server/server.js` CORS middleware is configured
3. Backend is redeployed with new env vars

---

## Part 7: Troubleshooting

### Issue: "Cannot reach backend from frontend"

**Solution 1**: Check frontend config

```javascript
// In browser console:
console.log(API_CONFIG.API_BASE_URL); // Should show Render URL
```

**Solution 2**: Verify backend is running

```bash
curl https://your-backend-url/api/health
```

**Solution 3**: Check CORS errors in browser console

- Ensure `FRONTEND_URL` in server `.env` matches deployed frontend URL

### Issue: "CORS blocked this request"

**Cause**: Frontend URL not in server's allowed origins

**Fix**:

1. Go to Render backend service
2. Edit environment variable: `FRONTEND_URL=https://your-frontend-url`
3. Redeploy

### Issue: "Database connection failed"

**Cause**: Wrong credentials or database host

**Fix**:

1. Verify `DB_HOST`, `DB_USER`, `DB_PASSWORD` (or `DB_PASS` for TiDB) in Render env vars
2. Test credentials locally first
3. For TiDB: Ensure port is 4000 (not 3306)

### Issue: "TiDB SSL connection rejected"

**Cause**: SSL certificate validation failure

**Solution**:

```javascript
// 1. Ensure SSL is configured correctly (see Part 1.5)
ssl: {
  require: true,
  rejectUnauthorized: true,
}

// 2. If still failing, you can temporarily use (not recommended for production):
ssl: {
  require: true,
  rejectUnauthorized: false,  // Only for debugging
}

// 3. Or use TiDB's CA certificate (recommended):
// Download from TiDB Cloud console and use it in connection
```

### Issue: "Cannot find auth token"

**Cause**: LocalStorage not persisting across environments

**Solution**: This is normal for static sites. Add HTTPS redirect:

- Ensure frontend is served over HTTPS
- Check `localStorage.setItem('token', data.token)` is called

### Issue: "Build failed - npm run build command not found"

**Cause**: `package.json` doesn't have `build` script

**Solution**:

1. Check `package.json` has `"build"` script for TypeScript projects
2. If not using TypeScript, remove `npm run build` from Build Command
3. Use just `npm install` for JavaScript projects

### Issue: "Sequelize migrations not running"

**Cause**: `npm run migrate` not configured or migrations folder missing

**Solution**:

1. Add `migrate` script to `package.json`:
   ```json
   "migrate": "sequelize db:migrate"
   ```
2. Verify `migrations/` folder exists locally
3. Or remove migrations from Build Command if not using them

---

## Part 8: Monitoring & Maintenance

### Monitor Backend on Render:

1. Go to your Web Service
2. Click **"Logs"** tab to see real-time logs
3. Check **"Metrics"** for CPU, memory, request counts

### Redeploy:

- Push to `main` branch → Render automatically redeploys
- Or manually click **"Redeploy latest commit"**

### Update Environment Variables:

1. Click **"Environment"** tab
2. Edit any variable
3. Changes apply on next request (no redeploy needed usually)
4. For critical changes, manually redeploy

---

## Part 9: URLs Quick Reference

### Development (Local):

```
Frontend: http://localhost:3000 or http://127.0.0.1:5500
Backend:  http://localhost:3001/api
Config reading from: frontend/config.js (development section)
```

### Production (Render):

```
Frontend: https://ualbany-campus-portal.onrender.com
Backend:  https://ualbany-campus-portal-api.onrender.com/api
Config reading from: frontend/config.js (production section)
```

---

## Summary

| Task                        | Done |
| --------------------------- | ---- |
| Create Render account       | ✓    |
| Deploy backend API service  | ✓    |
| Add environment variables   | ✓    |
| Deploy frontend static site | ✓    |
| Update frontend/config.js   | ✓    |
| Test API connection         | ✓    |
| Monitor logs                | ✓    |

**Your app is now live on Render!** 🚀
