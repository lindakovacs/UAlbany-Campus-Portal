# Security Documentation

## Overview

The UAlbany Campus Portal implements comprehensive security measures to protect user data, prevent common web vulnerabilities, and ensure safe authentication and communication between frontend and backend.

## Security Features Implemented

### 1. Authentication & Authorization

#### JWT (JSON Web Tokens)

- **Token Generation**: JWT tokens issued on successful login/registration
- **Token Storage**: Stored securely in browser localStorage (not accessible via JavaScript in production)
- **Token Expiration**: Tokens expire after 7 days (configurable via `JWT_EXPIRE`)
- **Token Verification**: Backend validates every protected endpoint request

**Implementation:**

```javascript
// Backend - Token generation (authController.js)
const token = jwt.sign({ id: userId, email }, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_EXPIRE || '7d',
});

// Frontend - Auto-inject token in requests (api-client.js)
const headers = {
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
};
```

#### Role-Based Access Control

- Users can only update their own profiles
- Users can only delete their own posts/comments
- Backend verifies user ID matches resource owner

**Example:**

```javascript
// Delete post - verify ownership
const post = await pool.query('SELECT user_id FROM posts WHERE id = ?', [
  postId,
]);
if (post[0].user_id !== userId) {
  throw new AuthenticationError('Not authorized to delete this post');
}
```

#### Session Management

- Token stored in localStorage during session
- Token automatically cleared on logout
- Expired tokens trigger automatic redirect to login page
- Session timeout handled by token expiration

### 2. Input Validation & Sanitization

#### Frontend Validation

All user inputs validated before sending to server:

```javascript
// Email validation
const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Password validation
const validatePassword = (password) => {
  return password && password.length >= 8;
};

// Name validation
const validateName = (name) => {
  return name && name.length >= 2 && name.length <= 100;
};

// Generic field length
const validateFieldLength = (field, min = 1, max = 255) => {
  return field && field.length >= min && field.length <= max;
};
```

#### Backend Validation

All inputs validated server-side (never trust client):

```javascript
// Server validates every request
if (!validateName(name)) {
  throw new ValidationError('Name must be 2-100 characters');
}
if (!validateEmail(email)) {
  throw new ValidationError('Provide a valid email');
}
if (!validatePassword(password)) {
  throw new ValidationError('Password must be at least 8 characters');
}
```

#### HTTP Status Codes

- `400 Bad Request` - Invalid input (validation error)
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Authenticated but not authorized (e.g., admin-only)
- `404 Not Found` - Resource doesn't exist
- `409 Conflict` - Resource already exists (e.g., email taken)
- `500 Internal Server Error` - Unexpected error

### 3. XSS (Cross-Site Scripting) Prevention

#### Frontend Escaping

All user-generated content escaped before rendering:

```javascript
/**
 * Escape HTML to prevent XSS attacks
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text safe for HTML
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
```

#### Protected Fields

All user content wrapped with escapeHtml():

```javascript
// Posts
<p>${escapeHtml(post.content)}</p>

// Comments
<p>${escapeHtml(comment.text)}</p>

// Profile info
<h4>${escapeHtml(user.name)}</h4>

// Error messages
<p>${escapeHtml(errorMessage)}</p>
```

#### Test XSS Attack

**Attack Vector:** `<script>alert('XSS')</script>`

**Expected Result:** Renders as literal text:

```html
<p>&lt;script&gt;alert('XSS')&lt;/script&gt;</p>
```

**Executed?** ❌ No - JavaScript not executed

### 4. SQL Injection Prevention

#### Parameterized Queries

All database queries use placeholders (`?`) with bound parameters:

```javascript
// SAFE - Uses parameterized query
const [posts] = await pool.query(
  'SELECT * FROM posts WHERE user_id = ? AND id = ?',
  [userId, postId],
);

// UNSAFE - String concatenation (NEVER DO THIS)
// const [posts] = await pool.query(`SELECT * FROM posts WHERE user_id = ${userId}`);
```

#### Parameter Binding

Parameters passed as separate array:

```javascript
// Wrong way - vulnerable:
const query = `SELECT * FROM users WHERE email = '${email}'`;

// Right way - safe:
const [users] = await pool.query(
  'SELECT * FROM users WHERE email = ?',
  [email], // Passed separately, never concatenated
);
```

#### Test SQL Injection Attack

**Attack Vector:** `' OR '1'='1`

**Example URL:** `/api/users?email=' OR '1'='1`

**Validation Check:**

```javascript
if (!validateEmail(email)) {
  throw new ValidationError('Provide a valid email');
}
// Result: Email validation fails, query never sent to database
```

**Expected Result:** 400 Bad Request

```json
{
  "error": "Provide a valid email"
}
```

**Executed?** ❌ No - Validation rejected before database query

### 5. Password Security

#### Bcrypt Hashing

Passwords hashed with bcryptjs (10 salt rounds):

```javascript
const bcrypt = require('bcryptjs');

// During registration
const hashedPassword = await bcrypt.hash(password, 10);
await pool.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [
  name,
  email,
  hashedPassword,
]);

// During login
const isPasswordValid = await bcrypt.compare(password, user.password);
if (!isPasswordValid) {
  throw new AuthenticationError('Invalid email or password');
}
```

#### Password Requirements

- Minimum 8 characters
- No maximum length (bcrypt handles long passwords)
- Hashed with 10 salt rounds (makes brute-force computationally expensive)

### 6. CORS (Cross-Origin Resource Sharing)

#### Development Configuration

Allows connections from localhost:

```javascript
const cors = require('cors');

app.use(
  cors({
    origin: [
      'http://localhost:3000', // Production frontend
      'http://127.0.0.1:5500', // Live Server
      'http://localhost:5500',
      /localhost/, // Any localhost port
    ],
    credentials: true,
  }),
);
```

#### Production Configuration

Set `NODE_ENV=production` to restrict to `FRONTEND_URL` only:

```bash
# In server/.env
NODE_ENV=production
FRONTEND_URL=https://yoursite.com
```

### 7. Error Handling

#### Custom Error Classes

Typed errors with status codes:

```javascript
class ValidationError extends ApiError {
  constructor(message, statusCode = 400) {
    super(message, statusCode);
    this.name = 'ValidationError';
  }
}

class AuthenticationError extends ApiError {
  constructor(message = 'Unauthorized', statusCode = 401) {
    super(message, statusCode);
    this.name = 'AuthenticationError';
  }
}

class AuthorizationError extends ApiError {
  constructor(message = 'Forbidden', statusCode = 403) {
    super(message, statusCode);
    this.name = 'AuthorizationError';
  }
}
```

#### Error Handler Middleware

Central error handling:

```javascript
app.use((err, req, res, next) => {
  console.error(err);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Don't leak internal error details
  res.status(500).json({ error: 'Internal server error' });
});
```

### 8. Environment Variables

#### Sensitive Configuration

Never commit secrets to version control:

```bash
# In .gitignore
.env
.env.local
.env.*.local

# In server/.env (NEVER COMMIT)
JWT_SECRET=your-super-secret-key-here
DB_PASSWORD=database_password
DATABASE=mydatabase
```

#### Required Secrets

- `JWT_SECRET` - Used to sign/verify tokens
- `DB_PASSWORD` - MySQL database password
- `DATABASE` - Database name

### 9. Database Security

#### Connection Pooling

Uses mysql2/promise connection pool:

```javascript
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
```

#### Foreign Key Constraints

Enforces referential integrity:

```sql
ALTER TABLE posts
ADD CONSTRAINT FOREIGN KEY (user_id)
REFERENCES users(id) ON DELETE CASCADE;

-- When user deleted, all their posts deleted automatically
```

#### Indexed Queries

Optimizes performance and prevents slowdown attacks:

```sql
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_post_user_id ON posts(user_id);
CREATE INDEX idx_comment_post_id ON comments(post_id);
```

### 10. HTTPS/SSL

#### Production Requirements

- All traffic encrypted in production
- Certificates from Let's Encrypt (free)
- Automatic redirects HTTP → HTTPS

#### Development

- Uses `http://localhost` (OK for development)
- Production must use `https://` (enforced)

## Security Best Practices

### For Developers

1. **Never hardcode secrets** - Use environment variables
2. **Always validate input** - Backend AND frontend
3. **Use parameterized queries** - Never concatenate user input
4. **Escape output** - Always escape before rendering HTML
5. **Don't trust the client** - Validate everything server-side
6. **Use HTTPS in production** - All traffic encrypted
7. **Update dependencies** - Keep packages current
8. **Log security events** - Failed logins, unauthorized access
9. **Use strong passwords** - Enforce minimum requirements
10. **Implement rate limiting** - Prevent brute force attacks (future)

### For DevOps

1. Use secrets manager - HashiCorp Vault, AWS Secrets Manager
2. Enable HTTPS/TLS - Let's Encrypt, Cloudflare
3. Database backups - Daily automated backups
4. Firewall rules - Restrict access by IP/port
5. DDoS protection - Cloudflare, AWS Shield
6. Web Application Firewall - ModSecurity, AWS WAF
7. Monitor logs - ELK stack, Datadog
8. Security updates - Automatic patching
9. Network segmentation - Separate dev/prod
10. Incident response plan - Ready for breaches

### For Users

1. Use strong, unique passwords
2. Don't share passwords with others
3. Logout when finished
4. Use HTTPS (browser shows padlock)
5. Don't click suspicious links
6. Keep browser updated
7. Use password manager
8. Enable 2FA (if available)
9. Report suspicious activity
10. Keep personal info minimal

## Testing Security

### Manual Security Tests

1. **Test XSS:**
   - Create post with: `<img src=x onerror="alert('XSS')">`
   - Verify it renders as text, not executed

2. **Test SQL Injection:**
   - Register with email: `test' OR '1'='1@test.com`
   - Verify validation error (400)

3. **Test Authorization:**
   - Login as User A
   - Try to delete User B's post
   - Verify 403 Forbidden error

4. **Test Authentication:**
   - Clear localStorage
   - Refresh protected page
   - Verify redirect to login

5. **Test CORS:**
   - Request from different domain
   - Verify CORS headers allow/deny appropriately

### Automated Tests (Future)

```bash
npm test -- --security
```

Would include:

- XSS payload tests
- SQL injection payload tests
- CORS tests
- JWT validation tests
- Input validation tests

## Security Checklist

- [x] XSS prevention (HTML escaping)
- [x] SQL injection prevention (parameterized queries)
- [x] Input validation (frontend + backend)
- [x] Password hashing (bcryptjs)
- [x] JWT authentication with expiration
- [x] Authorization checks (user ID verification)
- [x] CORS configuration
- [x] Environment variable management
- [x] Error handling (no detail leakage)
- [x] Database foreign keys
- [ ] Rate limiting (TODO)
- [ ] 2FA (two-factor authentication)
- [ ] HTTPS in production (deployment requirement)
- [ ] Audit logging (TODO)
- [ ] Regular security updates (TODO)
- [ ] Static security analysis (TODO)
- [ ] Dependency vulnerability scanning (TODO)
- [ ] Penetration testing (TODO)

## Reporting Security Issues

If you discover a security vulnerability:

1. **DO NOT** create public issue
2. Email: security@example.com
3. Maximum 90 days to fix
4. Credit will be given (if desired)
5. Responsible disclosure followed

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [OWASP SQL Injection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

## Changelog

- **v1.0** (Jan 2024) - Initial security documentation
  - XSS prevention with escapeHtml
  - SQL injection prevention with parameterized queries
  - JWT authentication and authorization
  - Input validation (frontend + backend)
  - Password hashing with bcryptjs
  - CORS configuration
