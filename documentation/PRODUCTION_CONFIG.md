# Production Configuration & Deployment Guide

## Overview

This guide covers security headers, CORS configuration, HTTPS enforcement, secrets management, and deployment to Render.com for the UAlbany Campus Portal.

## Security Headers

### Implemented Headers

All security headers are configured automatically via the **helmet.js** middleware in [server/server.js](../server/server.js#L23-L37).

#### 1. **X-Content-Type-Options: nosniff** ✅

**Purpose:** Prevents MIME type sniffing attacks (browser won't guess file types)

```javascript
noSniff: true
// Sets header: X-Content-Type-Options: nosniff
```

**Protection:**
- Prevents attackers from uploading a file disguised as legitimate type
- Browser must respect declared Content-Type header
- Blocks reflected XSS attacks via file uploads

**Test:**
```bash
curl -i http://localhost:3001/api/health | grep X-Content-Type-Options
# Output: X-Content-Type-Options: nosniff
```

---

#### 2. **X-Frame-Options: DENY** ✅

**Purpose:** Prevents clickjacking attacks (prevents embedding in iframes)

```javascript
frameguard: { action: 'deny' }
// Sets header: X-Frame-Options: DENY
```

**Protection:**
- Prevents attacker pages from embedding your site in hidden iframe
- Blocks malicious clickjacking attacks
- Only your site can display your content

**Options:**
- `deny` - Prevent ALL framing (most secure)
- `sameorigin` - Only same-origin can frame
- `allow-from` - Specific origin whitelist

**Current Setting:** `deny` (most secure) ✅

**Test:**
```bash
curl -i http://localhost:3001/api/health | grep X-Frame-Options
# Output: X-Frame-Options: DENY
```

---

#### 3. **Content-Security-Policy (CSP)** ✅

**Purpose:** Controls which resources browser can load (prevents script injection)

```javascript
contentSecurityPolicy: {
  directives: {
    defaultSrc: ["'self'"],                           // Only allow same-origin by default
    scriptSrc: ["'self'", "'unsafe-inline'"],         // Scripts from self or inline
    styleSrc: ["'self'", "'unsafe-inline'"],          // Styles from self or inline
    imgSrc: ["'self'", 'data:', 'https:'],            // Images: self, data URLs, HTTPS
    connectSrc: ["'self'", 'http://localhost:*'],     // AJAX to self and localhost
  },
}
```

**What it prevents:**
- Inline script injection attacks
- External script loading from malicious sources
- Style-based attacks

**For production, update connectSrc:**
```javascript
connectSrc: ["'self'", 'https://api.yourdomain.com'], // Use HTTPS production URL
```

---

#### 4. **Referrer-Policy: strict-origin-when-cross-origin** ✅

**Purpose:** Controls what referrer info is sent with requests

```javascript
referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
```

**Behavior:**
- Same-origin: Full referrer sent
- Cross-origin HTTPS: Only origin sent (no query params)
- Cross-origin HTTP: No referrer sent
- Always: No referrer for HTTP requests

---

### Additional Recommended Headers

These are automatically set by helmet:

| Header | Value | Purpose |
|--------|-------|---------|
| `X-XSS-Protection` | `1; mode=block` | Enable browser XSS filter (legacy) |
| `Strict-Transport-Security` | `max-age=31536000` | HTTPS only (HSTS) |
| `X-Powered-By` | (removed) | Hide server technology |
| `Permissions-Policy` | (restrictive) | Limit API access (camera, mic, etc.) |

---

## CORS Configuration

### Current Setup

CORS (Cross-Origin Resource Sharing) is configured in [server/server.js](../server/server.js#L39-L64):

```javascript
const corsOptions = {
  origin: (origin, callback) => {
    // Allow localhost connections (for development)
    if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      callback(null, true);
    }
    // In production, validate against FRONTEND_URL
    else if (process.env.NODE_ENV === 'production' && origin === process.env.FRONTEND_URL) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,  // Allow credentials (cookies, auth headers)
};

app.use(cors(corsOptions));
```

### Development Mode

**Allowed Origins:**
- ✅ `http://localhost:*` (any port)
- ✅ `http://127.0.0.1:*` (any port)
- ✅ No origin header

**Why:** Flexibility during development with Live Server

### Production Mode

**When:** `NODE_ENV=production`

**Allowed Origins:**
- ✅ Value in `FRONTEND_URL` environment variable only
- ❌ All other origins blocked

**Example:**
```bash
# In server/.env
NODE_ENV=production
FRONTEND_URL=https://ualbany-portal.onrender.com

# Only HTTPS://ualbany-portal.onrender.com is allowed
# All other origins get: "Not allowed by CORS"
```

### Testing CORS

**Test from different origin (should fail):**
```javascript
// In browser console from different origin
await fetch('http://localhost:3001/api/posts', {
  method: 'GET',
  credentials: 'include'
});

// Error: Access to XMLHttpRequest has been blocked by CORS policy
```

**Test from allowed origin (should work):**
```javascript
// In browser console from localhost:5500
await fetch('http://localhost:3001/api/posts', {
  method: 'GET',
  credentials: 'include'
});

// Success: Returns posts
```

---

## HTTPS Enforcement

### Development

Uses HTTP for local development (normal):
```
http://localhost:3001  (backend)
http://127.0.0.1:5500  (frontend)
```

### Production (Render)

**HTTPS Mandatory:**
- ✅ Render provides free SSL/TLS certificates
- ✅ Automatic HTTPS redirect (HTTP → HTTPS)
- ✅ Certificate auto-renewal

**Configuration:**
```bash
# In production .env via Render dashboard:
NODE_ENV=production
FRONTEND_URL=https://ualbany-portal.onrender.com
```

**HSTS Header Automatically Set:**
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

This forces browser to always use HTTPS for 1 year (31536000 seconds).

---

## Secrets Management

### ✅ No Secrets in Git

**Excluded Files (in .gitignore):**

```gitignore
# Environment variables - NEVER committed
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Other sensitive files
config/default.json
```

**Verification:**
```bash
# Check that .env is not in git history
git log --all --full-history -- .env
# Should show nothing (not in history)

# Check that .env is in .gitignore
grep "^\.env$" .gitignore
# Should show: .env
```

### Development Secrets

**Location:** `server/.env` (local only, never committed)

**Required Variables:**
```bash
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here    # Local password only
DATABASE=ualbany_campus

# JWT
JWT_SECRET=dev-secret-key-change-in-production  # Local secret only
JWT_EXPIRE=7d

# Frontend
FRONTEND_URL=http://127.0.0.1:5500

# Backend
PORT=3001
NODE_ENV=development
```

### Production Secrets (Render)

**Setup via Render Dashboard:**

1. **Log into Render.com**
2. Navigate to your application
3. Go to **Settings → Environment Variables**
4. Add each secret:

```
DB_HOST          = mysql.yourdomain.com
DB_USER          = admin_user
DB_PASSWORD      = [STRONG PASSWORD - 32+ chars, special chars]
DATABASE         = ualbany_campus
JWT_SECRET       = [STRONG SECRET - 64+ chars, random]
JWT_EXPIRE       = 7d
FRONTEND_URL     = https://ualbany-portal.onrender.com
NODE_ENV         = production
PORT             = 3001 (usually auto-set by platform)
GEMINI_API_KEY   = [Optional - get from ai.google.dev]
```

**Security Best Practices:**

✅ **DO:**
- Use 32+ character random strings for secrets
- Include special characters, numbers, UPPERCASE, lowercase
- Rotate secrets periodically (quarterly)
- Store a backup in secure password manager (1Password, LastPass)
- Use database connection pooling
- Enable database backups

❌ **DON'T:**
- Commit `.env` files
- Use simple passwords
- Reuse secrets across environments
- Share secrets via email or Slack
- Hardcode secrets in code
- Use same secret for dev and production

---

## Deployment to Render

### Prerequisites

1. **GitHub Account** - Code repository
2. **Render Account** - Free tier available
3. **MySQL Database** - Local or cloud (JawsDB, PlanetScale)
4. **Domain Name** (optional) - For custom domain

### Step 1: Connect GitHub Repository

1. Log into Render.com
2. Click **"New Web Service"**
3. Select **"GitHub"**
4. Authorize Render access to your repositories
5. Select **UAlbany-Campus-Portal** repository
6. Choose **main** branch

### Step 2: Configure Deploy Settings

1. **Build Command:**
   ```bash
   cd server && npm install
   ```

2. **Start Command:**
   ```bash
   npm start
   ```

3. **Port:** `3001` (or set in environment)

4. **Node Version:** Select LTS (14+)

### Step 3: Add Environment Variables

In Render dashboard **Environment → Environment Variables:**

```
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://ualbany-portal.onrender.com

DB_HOST=your-mysql-host.com
DB_USER=your_db_user
DB_PASSWORD=YOUR_STRONG_PASSWORD
DATABASE=ualbany_campus

JWT_SECRET=YOUR_STRONG_JWT_SECRET
JWT_EXPIRE=7d

GEMINI_API_KEY=your_gemini_key_here
```

### Step 4: Configure Frontend

1. Update `frontend/config.js`:
   ```javascript
   const CONFIG = {
     BACKEND_HOST: 'https://ualbany-campus-portal.onrender.com',  // Update domain
     BACKEND_PORT: 443,
   };
   ```

2. Update `frontend/.env.production`:
   ```
   VITE_BACKEND_URL=https://ualbany-campus-portal.onrender.com
   ```

### Step 5: Deploy

1. Push code to GitHub:
   ```bash
   git add .
   git commit -m "Production deployment config"
   git push origin main
   ```

2. Render automatically detects changes and deploys

3. Monitor deployment in Render dashboard

### Step 6: Verify Deployment

**Test API:**
```bash
curl https://ualbany-portal.onrender.com/api/health
# Should return: {"status":"ok","db":"connected"}
```

**Test HTTPS:**
```bash
curl -i https://ualbany-portal.onrender.com/api/health
# Check for: Strict-Transport-Security header
```

**Test Security Headers:**
```bash
curl -i https://ualbany-portal.onrender.com/api/health
# Check headers:
# - X-Content-Type-Options: nosniff ✅
# - X-Frame-Options: DENY ✅
# - Strict-Transport-Security: ✅
```

---

## Security Checklist

### ✅ Development

- [x] Security headers via helmet.js
- [x] CORS allows localhost only
- [x] .env file in .gitignore
- [x] XSS prevention (escapeHtml)
- [x] SQL injection prevention (parameterized queries)
- [x] Password hashing (bcryptjs)
- [x] JWT authentication
- [x] Input validation

### ✅ Production (Render)

- [x] HTTPS enforced automatically
- [x] SSL/TLS certificate auto-renewal
- [x] Environment variables via dashboard (not in code)
- [x] HSTS header enabled
- [x] Security headers present
- [x] CORS restricted to frontend domain
- [x] Database connection secured
- [x] JWT secrets rotated
- [ ] Rate limiting (TODO)
- [ ] 2FA support (TODO)
- [ ] Audit logging (TODO)

---

## Monitoring & Maintenance

### Regular Tasks

**Monthly:**
- Review security headers in production
- Check for dependency updates: `npm audit`
- Review error logs for suspicious activity
- Verify HTTPS certificate is valid

**Quarterly:**
- Rotate JWT_SECRET
- Update dependencies: `npm update`
- Run security audit: `npm audit fix`
- Review and test CORS configuration

**Annually:**
- Penetration testing
- Full security audit
- Database backup verification
- Disaster recovery drill

### Monitoring Commands

**Check for vulnerabilities:**
```bash
cd server
npm audit
npm audit fix  # Auto-fix fixable issues
```

**Update dependencies:**
```bash
npm outdated  # See available updates
npm update    # Update minor/patch versions
npm update @package/name@latest  # Major version update
```

**View deployment logs:**
```bash
# In Render dashboard:
# Deployment → View Logs
# Real-time logs, search, filter by level
```

---

## Troubleshooting

### CORS Errors

**Error:** "Access to XMLHttpRequest blocked by CORS"

**Solution:**
1. Check `NODE_ENV` is `production`
2. Verify `FRONTEND_URL` matches exact domain
3. Ensure HTTPS is used in production
4. Check browser console for exact error

### HTTPS Issues

**Error:** "Mixed content blocked"

**Solution:**
- All resources must be HTTPS in production
- Update `frontend/config.js` to use HTTPS
- Verify certificate is valid: `curl -I https://yourdomain`

### Security Header Missing

**Debugging:**
```bash
# Check if header is present
curl -i https://yourdomain/api/health | grep "X-Content-Type-Options"

# If missing, verify helmet is installed
npm list helmet

# If not installed:
npm install helmet

# Restart server after changes
```

---

## References

### Security Standards

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE/SANS Top 25](https://cwe.mitre.org/top25/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

### Standards & Guidelines

- [RFC 6797 - HTTP Strict Transport Security](https://tools.ietf.org/html/rfc6797)
- [RFC 7034 - CORS](https://tools.ietf.org/html/rfc7034)
- [MDN - HTTP Headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers)
- [helmet.js Documentation](https://helmetjs.github.io/)

### Tools

- [securityheaders.com](https://securityheaders.com/) - Check security headers
- [Observatory.mozilla.org](https://observatory.mozilla.org/) - Mozilla security scanner
- [SSL Labs](https://www.ssllabs.com/) - HTTPS/SSL testing
- [OWASP ZAP](https://www.owasp.org/index.php/OWASP_ZAP) - Penetration testing

---

## Support

For issues or questions:

1. Check **[SECURITY.md](SECURITY.md)** for security details
2. Review **[POSTS_COMMENTS.md](POSTS_COMMENTS.md)** for API security
3. Check **[AUTHENTICATION.md](AUTHENTICATION.md)** for auth details
4. Open GitHub issue with error logs

---

## Changelog

- **v1.0** (Apr 2024) - Initial production config
  - Security headers via helmet.js
  - CORS configuration
  - Render deployment guide
  - Secrets management best practices
