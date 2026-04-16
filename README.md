# UAlbany Campus Portal

Full-stack web application for Albany Campus Portal platform. This project is a complete production-ready solution with a modern frontend (HTML/CSS/JavaScript), backend API (Node.js/Express), and MySQL database. Features user authentication, profiles, social posts, education/experience tracking, AI chatbot, and real-time interactions.

## Features

- **User Authentication:** Secure registration and login with JWT tokens
- **User Profiles:** Create, update, and manage user profiles with title, company, location, bio, skills, education/experience, and social media links
- **Social Feed:** Post updates, like posts, comment on posts
- **Search:** Search for other users and browse profiles
- **Education & Experience:** Track educational history and work experience
- **Dark Mode:** Toggle between light and dark themes
- **Accessibility:** WCAG AA compliant design
- **Security:** HTTPS, input validation, XSS prevention, CSRF protection
- **Responsive Design:** Mobile-first approach with tablets and desktop support

Deployed Static Webapp via [GitHub Pages](https://lindakovacs.github.io/UAlbany-Campus-Portal-Theme/)

## Project Team:

- Maryam Sheikh: Project Manager​

- Linda Kovacs: Software Developer Lead​

- Anas Elkhiat: Quality Assurance Lead​

- Tejas Kilaru: Accessibility & UX/UI Designer Lead​

- Ian Walters: Security Lead​

## Pages

- Home: index.html
- Auth: login.html, register.html
- Profile: profile.html, create-profile.html, add-education.html, add-experience.html
- Posts: posts.html, post.html
- Dashboard: dashboard.html
- Browse: profiles.html

## Shared UI Modules

- modules/navbar.html
- modules/chat.html
- modules/footer.html

## Styles & Assets

- css/style.css
- img/ (static images)

## Documentation

Comprehensive setup and feature documentation is available in the `documentation/` folder:

### Core Features

- **[Profile Setup & Configuration](documentation/PROFILE_SETUP.md)** - Complete guide to user profiles, profile photos, education/experience tracking, and related API endpoints
  - Profile component overview
  - Database schema and migrations
  - Profile photo storage and synchronization
  - API endpoints and usage examples
  - Frontend integration details
  - Testing procedures

- **[Posts & Comments System](documentation/POSTS_COMMENTS.md)** - Social feed, comments, likes, and real-time interactions
  - Database schema (posts, comments, likes)
  - Backend API endpoints with examples
  - Frontend JavaScript modules
  - XSS prevention and input validation
  - Pagination and performance
  - Testing and troubleshooting

- **[Authentication System](documentation/AUTHENTICATION.md)** - JWT tokens, route protection, session management
  - Architecture and components
  - Route protection and role-based access
  - Token management and expiration
  - Logout and session handling
  - Frontend implementation

### Integration & API

- **[API Client Reference](documentation/API-CLIENT-REFERENCE.md)** - Quick reference for using the apiClient helper
  - All available API methods by resource
  - Request/response examples
  - Error handling patterns
  - Browser console testing

- **[HTML Integration Guide](documentation/HTML-INTEGRATION.md)** - How to integrate API into HTML pages
  - Component examples (forms, lists, cards)
  - API call patterns
  - Error handling strategies
  - Loading state management

- **[Postman API Testing](documentation/POSTMAN_TESTING.md)** - Complete API documentation with Postman workflows
  - All endpoint specifications
  - Request/response examples
  - Authentication and authorization
  - Protected vs public endpoints
  - Error cases and troubleshooting
  - Workflow examples and best practices

### Setup & Deployment

- **[Render Deployment Guide](documentation/RENDER_DEPLOYMENT.md)** - Deploy to Render.com (recommended)
  - Backend API deployment (Node.js/Express)
  - Frontend deployment (static site)
  - Environment variables setup
  - CORS configuration for production
  - Automatic API URL configuration
  - Testing and troubleshooting
  - Monitoring and maintenance

- **[Production Configuration & Deployment](documentation/PRODUCTION_CONFIG.md)** - Deploy to zeet.co with security hardening
  - Security headers (X-Content-Type-Options, X-Frame-Options, CSP, HSTS)
  - CORS configuration for development and production
  - HTTPS enforcement via zeet.co
  - Secrets management and .gitignore
  - zeet.co deployment step-by-step guide
  - Monitoring and maintenance procedures
  - Security checklist

- **[Security Documentation](documentation/SECURITY.md)** - Security features and best practices
  - XSS prevention and testing
  - SQL injection prevention
  - JWT authentication and authorization
  - Input validation and sanitization
  - Password hashing and CORS
  - Security checklist and recommendations

- **[Security Implementation Verification](documentation/SECURITY_VERIFICATION.md)** - Verification report of all security measures
  - Security headers verification (live test results)
  - CORS configuration validation
  - HTTPS/SSL setup confirmation
  - Secrets management verification
  - Complete security checklist and status

- **[Gemini AI Chatbot Setup](documentation/GEMINI_SETUP.md)** - Integration with Google Gemini API
  - API key setup and configuration
  - Backend endpoint implementation
  - Frontend chatbot module
  - Testing and troubleshooting

## Getting Started

### Start Backend Server

1. Navigate to the server directory:

   ```bash
   cd server
   npm install  # First time only
   npm start
   ```

2. Backend will run on `http://localhost:3001`
   - Health check: `curl http://localhost:3001/api/health`

### Start Frontend Server

**Using Live Server (VS Code) - Recommended**

1. Install Live Server extension in VS Code (by Ritwick Dey)
2. Right-click on `index.html` (or any `.html` file)
3. Select "Open with Live Server"
4. Frontend will open on `http://127.0.0.1:5500` (or similar)

**Port Reference:**

- **Backend:** `http://localhost:3001`
- **Frontend (index.html):** `http://127.0.0.1:5500/`
- **Frontend (configured in `frontend/config.js`):** Can use any localhost port

### Verify Everything is Running

- Frontend: Open browser and visit `http://127.0.0.1:5500/index.html` or `http://127.0.0.1:5500/`
- Backend: Open DevTools (F12) and in Console run: `apiGetCurrentUser()` (should show error if not logged in - that's normal)
- Load modules: Include `<script src="config.js"></script>` and `<script src="js/api.js"></script>` in your HTML file

### Configuration

**Frontend Configuration (frontend/config.js):**
The `config.js` file contains backend connection settings:

```javascript
const CONFIG = {
  BACKEND_HOST: 'http://localhost',
  BACKEND_PORT: 3001,
};
```

To use a different backend:

1. Edit `frontend/config.js` and update `CONFIG.BACKEND_HOST` and `CONFIG.BACKEND_PORT`
2. Or override in browser console: `CONFIG.BACKEND_PORT = 5000`
3. Or use the `configureBackend()` function for dynamic changes

**Example configurations:**

```javascript
// Development (default)
CONFIG.BACKEND_HOST = 'http://localhost';
CONFIG.BACKEND_PORT = 3001;

// Alternative port if 3001 is in use
CONFIG.BACKEND_PORT = 5000;

// Production
CONFIG.BACKEND_HOST = 'https://api.example.com';
CONFIG.BACKEND_PORT = 443;
```

### Port Synchronization

**IMPORTANT:** Backend port and frontend config must stay in sync!

**When you change backend port in `server/.env`:**

1. Edit `server/.env` and change `PORT`:

   ```env
   PORT=5000    # Changed from 3001
   ```

2. Update `frontend/config.js` to match:

   ```javascript
   BACKEND_PORT: 5000,  // Changed to match server/.env
   ```

3. Restart backend:

   ```bash
   cd server
   npm start
   ```

4. Reload browser page for frontend to pick up changes

**Configuration Locations:**

| Setting           | File                                                                                       | How Backend Reads It     | How Frontend Reads It                     |
| ----------------- | ------------------------------------------------------------------------------------------ | ------------------------ | ----------------------------------------- |
| Backend Port      | `server/.env` `PORT=3001`                                                                  | `process.env.PORT`       | Must manually update `frontend/config.js` |
| Frontend URL      | `server/.env` `FRONTEND_URL=http://localhost:3000` (prod) or `http://127.0.0.1:5500` (dev) | Used for CORS validation | For reference only                        |
| Backend Host/Port | `frontend/config.js` `CONFIG.BACKEND_HOST/PORT`                                            | N/A                      | Loaded via `<script>` tag                 |

**CORS Policy (Development):**

Backend accepts all **localhost** connections:

- ✅ `http://localhost:3000` (production frontend)
- ✅ `http://127.0.0.1:5500` (Live Server - development)
- ✅ `http://localhost:5500` (alternate localhost)
- ✅ Any other localhost port

This allows flexibility during development. In production, set `NODE_ENV=production` in `.env` to restrict CORS to `FRONTEND_URL` only.

The project includes a centralized API utility module (`frontend/js/api.js`) for testing the backend API and database directly from the browser.

### Quick Start

1. **Include the config and API modules in your HTML file:**

   ```html
   <script src="config.js"></script>
   <script src="js/api.js"></script>
   ```

   > Note: `config.js` must be included before `api.js`

2. **Configure backend (if not on default port 3001):**

   ```javascript
   configureBackend(3001, 'http://localhost'); // Default (port 3001)
   configureBackend(5000, 'http://localhost'); // Alternative port if 3001 is in use
   configureBackend(443, 'https://api.example.com'); // Production
   ```

3. **Open browser DevTools** (F12) and use the Console tab to test API calls

4. **Example workflow:**

   ```javascript
   // Register a new user
   apiRegister({
     name: 'Jane Doe',
     email: 'jane@example.com',
     password: 'password123',
     passwordConfirm: 'password123',
   });

   // Get current user
   apiGetCurrentUser();

   // Get all profiles
   apiListProfiles(1, 10);

   // Update your profile
   apiUpdateProfile(1, {
     title: 'Software Engineer',
     company: 'Tech Company Inc',
     location: 'New York, NY',
     bio: "Hello! I'm Jane",
     skills: ['JavaScript', 'React', 'Node.js'],
     social_links: { github: 'https://github.com/jane' },
   });

   // Add education
   apiAddEducation(1, {
     school: 'University of Albany',
     degree: 'Bachelor of Science',
     field_of_study: 'Computer Science',
     from_date: '2020-09-01',
     to_date: '2024-05-31',
   });

   // Get education
   apiGetEducation(1);

   // Add work experience
   apiAddExperience(1, {
     company: 'Tech Company Inc',
     title: 'Software Engineer',
     location: 'New York, NY',
     from_date: '2024-06-01',
     current: true,
   });

   // Get experience
   apiGetExperience(1);

   // Logout
   apiLogout();
   ```

### All Available Functions

**Authentication:**

- `apiRegister(userData)` - Register new user
- `apiLogin(credentials)` - Login with email/password
- `apiGetCurrentUser()` - Get authenticated user
- `apiLogout()` - Clear token and logout

**Profiles:**

- `apiListProfiles(page, limit)` - Get all profiles (paginated)
- `apiGetProfile(userId)` - Get specific profile
- `apiUpdateProfile(userId, profileData)` - Update profile

**Profiles Education (Nested):**

- `apiGetProfileEducation(userId)` - Get user's education history
- `apiAddProfileEducation(educationData)` - Add education entry (for authenticated user)
- `apiDeleteProfileEducation(eduId)` - Delete education entry (owner only)

**Education (Alternative routes):**

- `apiGetEducation(userId)` - Get user's education history
- `apiAddEducation(userId, educationData)` - Add education entry
- `apiUpdateEducation(educationId, educationData)` - Update education
- `apiDeleteEducation(educationId)` - Delete education entry

**Experience:**

- `apiGetExperience(userId)` - Get user's work experience
- `apiAddExperience(userId, experienceData)` - Add experience entry
- `apiUpdateExperience(experienceId, experienceData)` - Update experience
- `apiDeleteExperience(experienceId)` - Delete experience entry

**Posts:**

- `apiGetPosts(page, limit)` - Get all posts (paginated, includes like counts)
- `apiGetPost(postId)` - Get specific post (includes like count)
- `apiCreatePost(postData)` - Create new post (protected)
- `apiUpdatePost(postId, postData)` - Update post (protected, owner only)
- `apiDeletePost(postId)` - Delete post (protected, owner only)

**Likes:**

- `apiToggleLike(postId)` - Toggle like on post (protected)
- `apiGetLikeCount(postId)` - Get like count for post
- `apiGetLikesList(postId, limit)` - Get list of users who liked post
- `apiCheckIfLiked(postId)` - Check if current user liked post

**Comments:**

- `apiGetPostComments(postId, page, limit)` - Get all comments for a post (paginated)
- `apiGetComment(commentId)` - Get specific comment by ID
- `apiCreateComment(postId, commentData)` - Create new comment (protected)
- `apiUpdateComment(commentId, commentData)` - Update comment (protected, owner only)
- `apiDeleteComment(commentId)` - Delete comment (protected, owner only)
- `apiGetCommentCount(postId)` - Get comment count for post

**Utilities:**

- `configureBackend(port, host)` - Configure backend server connection (call before API requests if on different port/host)
- `getToken()` - Get JWT token from localStorage
- `isAuthenticated()` - Check if user is logged in
- `clearStorage()` - Clear all localStorage (for testing)

### JWT Token Storage

- Tokens are automatically saved to `localStorage` after registration/login
- Tokens are sent in `Authorization: Bearer <token>` header for protected requests
- Tokens expire after 7 days

### Troubleshooting

- **CORS error?** During development, backend accepts all localhost ports (3000, 5500, etc.). Ensure:
  - Backend port in `frontend/config.js` matches what backend is actually running on
  - Check console: `✅ Server running on http://localhost:PORT`
  - Reload browser page after making changes
- **404 error?** Check that backend server is running: `cd server && npm start`
- **Connection refused?** Verify the backend port matches:
  - Backend (running on): Check console output for `✅ Server running on http://localhost:PORT`
  - Frontend (configured for): Check `frontend/config.js` `BACKEND_PORT` value
  - If different, update `frontend/config.js` to match server port, then reload page
- **401 error?** Missing or expired token - register/login again
- **Port already in use?**
  - Kill existing process: `lsof -i :3001 | grep node | awk '{print $2}' | xargs kill -9`
  - Or change PORT in `server/.env` and update `frontend/config.js`
- **Changed PORT but still getting errors?**
  1. Did you update `BACKEND_PORT` in `frontend/config.js`?
  2. Restart backend: `cd server && npm start`
  3. Reload browser page (Cmd+R or Ctrl+R)
- **Can't connect to backend?** Verify `CONFIG.BACKEND_HOST` and `CONFIG.BACKEND_PORT` in `config.js`

## AI Chatbot with Gemini API

The UAlbany Campus Portal includes an intelligent AI chatbot powered by **Google Gemini 2.5 Flash-Lite** for answering student questions about campus, programs, events, and services.

### Setup & Configuration

#### Option 1: Use Mock Responses (Default - No Setup Required)

The chatbot works immediately with **mock responses** without any API key:

1. ✅ No additional setup needed
2. ✅ Chatbot responds to common campus-related questions
3. ✅ Perfect for testing and development

```bash
# Just start the server - mock mode enabled by default
cd server && npm start
```

**When to use:** Development, testing, and demos.

#### Option 2: Enable Real Gemini AI (Recommended for Production)

To enable the real Gemini API with advanced AI responses:

1. **Get a free API key:**
   - Visit: https://ai.google.dev/
   - Sign in with your Google account
   - Click "Get API key" → "Create API key in new project"
   - Copy your API key

2. **Add API key to `.env` file:**

   ```bash
   # server/.env
   GEMINI_API_KEY="Your GeminiAI_API_KEY here"   # Paste your key here
   GEMINI_MODEL=gemini-2.5-flash      # Latest flash model
   ```

3. **Install dependency (if not already done):**

   ```bash
   cd server
   npm install @google/generative-ai
   ```

4. **Restart the server:**

   ```bash
   cd server && npm start
   ```

5. **Verify it's working:**

   ```bash
   curl http://localhost:3001/api/chat/health
   # Output should show: "apiConfigured": true
   ```

### Rate Limiting & Quotas

**Gemini 2.5 Flash-Lite (Free Tier):**

- ✅ **1,000 requests per day** - Perfect for a small student team
- ✅ **No credit card required**
- ✅ No rate limits during development

**Pro Tip:** For high traffic, implement request caching on the frontend to minimize API calls.

### Error Handling

The chatbot includes automatic fallback logic:

```
Request Flow:
1. User sends message → Frontend API call
2. Backend checks for GEMINI_API_KEY
   ✅ If configured → Call Gemini API (real AI response)
   ❌ If not configured → Use mock responses (keyword matching)
3. Handle 429 error (rate limit) → Show user-friendly message
4. Any other error → Graceful fallback to mock responses
```

**What happens if rate limit (429) is reached?:**

```
User sees: "🤖 The AI chatbot is temporarily busy due to high traffic.
Try again in a moment! Visit https://www.albany.edu for more info."
```

### Chatbot Endpoints

**POST `/api/chat`** - Send a message to the chatbot

```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Tell me about UAlbany"}'

# Response:
{
  "status": "success",
  "data": {
    "response": "University at Albany is...",
    "usedMock": false
  }
}
```

**GET `/api/chat/health`** - Check chatbot status

```bash
curl http://localhost:3001/api/chat/health

# Response shows:
{
  "chatbotActive": true,
  "apiConfigured": true,
  "model": "gemini-2.5-flash",
  "useMock": false
}
```

### Frontend Integration

The chatbot is automatically integrated into HTML pages via `js/chat-bot.js`:

```html
<script src="js/chat-bot.js"></script>
<script>
  // Initialize when page loads
  initializeChatBot();
</script>
```

**Features:**

- 💬 Floating chat bubble in corner
- 📱 Mobile-responsive interface
- ♿ WCAG AA accessibility compliant
- 🔒 Secure (API key stored on backend only)
- 💾 Chat history saved to localStorage

## Frontend API Client Helper

The frontend includes a modern **API Client Helper** ([frontend/js/api-client.js](frontend/js/api-client.js)) that simplifies integrating the backend API into HTML pages.

### APIClient Class

The `APIClient` class provides a clean, organized interface for all API operations:

```javascript
// Global instance automatically created
apiClient.auth.login(credentials);
apiClient.profiles.get(userId);
apiClient.posts.create(postData);
apiClient.comments.getForPost(postId);
// ... and many more
```

### Features

- ✅ **Automatic token management** - JWT tokens automatically added to requests
- ✅ **Error handling** - Built-in error catching and user-friendly messages
- ✅ **Loading states** - Visual feedback during API calls
- ✅ **Organized API calls** - Methods grouped by resource (auth, profiles, posts, etc.)
- ✅ **Async/await support** - Modern Promise-based API
- ✅ **Response validation** - Automatic response parsing and error detection

### Quick Start

1. **Include the API client in your HTML:**

   ```html
   <script src="frontend/config.js"></script>
   <script src="js/api-client.js"></script>
   ```

2. **Use in your JavaScript:**

   ```javascript
   // Register user
   const user = await apiClient.auth.register({
     name: 'John Doe',
     email: 'john@example.com',
     password: 'password123',
     passwordConfirm: 'password123',
   });

   // Get profiles
   const profiles = await apiClient.profiles.getAll(1, 20);

   // Create post
   const post = await apiClient.posts.create({
     content: 'Hello everyone!',
   });

   // Add comment
   const comment = await apiClient.comments.create(postId, {
     content: 'Great post!',
   });
   ```

3. **Handle errors:**

   ```javascript
   try {
     const result = await apiClient.auth.login(credentials);
   } catch (error) {
     console.error(error.status); // Error code (401, 429, 500, etc.)
     console.error(error.message); // Error message
     console.error(error.getUniendlyMessage()); // User-friendly message
   }
   ```

### UI Helpers

Show loading indicators and alerts:

```javascript
// Show loading spinner
showLoader('container-id');

// Hide loading spinner
hideLoader();

// Show error alert
showError('Something went wrong!');

// Show success alert
showSuccess('Operation completed!');
```

### Form Integration Example

```html
<form id="login-form">
  <input type="email" name="email" required />
  <input type="password" name="password" required />
  <button type="submit">Login</button>
  <div id="form-alerts"></div>
</form>

<script>
  document
    .getElementById('login-form')
    .addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(e.target);
      const credentials = Object.fromEntries(formData);

      try {
        await apiClient.auth.login(credentials);
        showSuccess('Logged in successfully!');
        // Redirect to dashboard
      } catch (error) {
        showError(error.message);
      }
    });
</script>
```

### Complete Documentation

For comprehensive integration guide including:

- HTML structure for API-ready pages
- Form binding patterns
- Component examples (profile cards, post lists, comments)
- Error handling strategies
- Loading state management
- And more...

See: **[HTML-INTEGRATION.md](documentation/HTML-INTEGRATION.md)**

## Frontend Authentication System

The UAlbany Campus Portal implements a comprehensive frontend authentication system with route protection, user profile display, and session management.

### Core Components

**1. Authentication Guard** (`frontend/js/auth-guard.js`)

- Check authentication status: `isAuthenticated()`
- Get current user: `getCurrentUser()`
- Protect pages: `requireAuth(callback)`
- Token management: `getToken()`, `isTokenExpired()`, `logout()`
- Utils: `showLoadingState()`, `showErrorMessage()`

**2. Route Protection** (`frontend/js/route-protection.js`)

- Centralized route configuration
- Page-level protection: `applyRouteProtection(callback)`
- Automatic redirects for unauthorized access
- Role-based access control support

**3. Navbar Authentication** (`js/navbar-auth.js`)

- Dynamic navbar updates based on login state
- Shows: [Dashboard] [Profile] [Logout] when authenticated
- Shows: [Login] when not authenticated
- Auto-updates after login/logout

**4. API Client** (`frontend/js/api-client.js`)

- Automatic JWT token injection in headers
- Auth methods: `login()`, `register()`, `getCurrentUser()`, `logout()`
- Organized by resource: profiles, posts, comments, etc.

**5. Profile Display** (`frontend/js/profile-display.js`)

- Components: `displayUserProfileCard()`, `displayUserAvatar()`, `displayUserMenu()`
- Shows current user info across pages
- User initials avatars and profile cards

### Quick Start - Protect a Page

**Include required scripts:**

```html
<script src="frontend/config.js"></script>
<script src="frontend/js/api-client.js"></script>
<script src="frontend/js/auth-guard.js"></script>
<script src="frontend/js/route-protection.js"></script>
```

**Protect page in DOMContentLoaded:**

```javascript
document.addEventListener('DOMContentLoaded', () => {
  applyRouteProtection(async () => {
    // This code only runs if user is authenticated
    const user = await apiClient.auth.getCurrentUser();
    displayUserData(user);
  });
});
```

### Authentication Flow

```
User registers → Creates account → Stores JWT token in localStorage
    ↓
User logs in → Backend validates → Returns JWT token
    ↓
Token stored in localStorage → API client injects in all requests
    ↓
Access protected page → Check token exists → Allow access
    ↓
Token expires → Auto-logout → Redirect to login
    ↓
User logs out → Clear storage → Update navbar → Redirect to home
```

### Protected Routes

| Page                  | Protected | Description                            |
| --------------------- | --------- | -------------------------------------- |
| `login.html`          | ❌ No     | Public login form                      |
| `register.html`       | ❌ No     | Public registration form               |
| `index.html`          | ❌ No     | Public home page                       |
| `dashboard.html`      | ✅ Yes    | User dashboard (authenticated only)    |
| `profile.html`        | ✅ Yes    | User profile (authenticated only)      |
| `create-profile.html` | ✅ Yes    | Edit profile form (authenticated only) |
| `add-education.html`  | ✅ Yes    | Education form (authenticated only)    |
| `add-experience.html` | ✅ Yes    | Experience form (authenticated only)   |
| `posts.html`          | ❌ No     | Public posts feed                      |
| `post.html`           | ❌ No     | Public single post                     |
| `profiles.html`       | ❌ No     | Public user search/browse              |

### localStorage Keys

| Key           | Content     | Purpose                  |
| ------------- | ----------- | ------------------------ |
| `token`       | JWT string  | Backend authentication   |
| `user`        | JSON object | User info from login     |
| `currentUser` | JSON object | User info from dashboard |
| `userId`      | String      | User ID reference        |

### Troubleshooting

**Q: "apiClient is not defined"**  
A: Ensure scripts are included in correct order:

```html
<script src="frontend/config.js"></script>
<script src="frontend/js/api-client.js"></script>
<!-- After config.js -->
```

**Q: Page redirects to login even when logged in**  
A: Check that you're logged in:

```javascript
// In browser console
console.log(localStorage.getItem('token')); // Should show token
console.log(isAuthenticated()); // Should be true
```

**Q: Navbar shows "Login" instead of "Logout" after login**  
A: Refresh page or wait for updateNavbarAuth() to be called

**Q: Keep getting logged out after 1 minute**  
A: Expected behavior - token expiration check runs every minute. Log in again.

### Complete Documentation

For comprehensive authentication system documentation including:

- Frontend route protection and guards
- Token management and expiration
- User profile display and session management
- API token injection and error handling
- Login/logout flows and redirects

See **[AUTHENTICATION.md](documentation/AUTHENTICATION.md)** and **[SECURITY.md](documentation/SECURITY.md)** for:

- JWT implementation details
- Authorization and role-based access control
- Security best practices (XSS, SQL injection prevention)
- Testing security features

- Complete architecture overview
- All authentication functions and APIs
- Security best practices
- Integration patterns
- Debugging and troubleshooting
- Developer vs Production configurations

## Frontend API Testing (Legacy)

Test the API directly from your browser without using Postman. The frontend includes a comprehensive testing interface that connects to your backend and database.

**Quick Test:**

1. Open [test.html](test.html) in your browser (or with Live Server)
2. Ensure backend is running: `cd server && npm start`
3. Use the interactive interface to:
   - Register new users and authenticate
   - Create and manage profiles
   - Add education and work experience
   - Create, update, delete posts
   - Like posts and view interactions
   - Test all API endpoints in real-time

**Features:**

- Built-in API utility module ([frontend/js/api.js](frontend/js/api.js)) for direct backend testing
- Real-time database verification
- Request/response logging
- Token management and persistence
- Error handling and debugging

**Browser Console Testing:**
Also test API functions directly in your browser's DevTools console (F12) using the built-in API utility functions. See **Quick Start** section above for example console commands.

## Project Structure

```
.
├── README.md
├── LICENSE
├── .gitignore
│
├── FRONTEND
│   ├── add-education.html
│   ├── add-experience.html
│   ├── create-profile.html
│   ├── dashboard.html
│   ├── index.html
│   ├── login.html
│   ├── post.html
│   ├── posts.html
│   ├── profile.html
│   ├── profiles.html
│   ├── register.html
│   ├── css/
│   │   ├── style.css
│   │   ├── dark-mode.css
│   │   ├── profile-edit.css
│   │   ├── experience-education.css
│   │   ├── profile-search.css
│   │   └── chat-bot.css
│   ├── js/
│   │   ├── api.js (API utility for backend testing)
│   │   ├── authentication.js
│   │   ├── profile-edit.js
│   │   ├── profile-search.js
│   │   ├── post-interactions.js
│   │   ├── comments.js
│   │   ├── experience-education.js
│   │   ├── form-validation.js
│   │   └── chat-bot.js
│   ├── img/
│   └── modules/
│       ├── navbar.html
│       ├── footer.html
│       └── chat.html
│
└── BACKEND (server/)
    ├── package.json
    ├── server.js
    ├── .env.example
    ├── config/
    │   └── db.js
    ├── routes/
    │   ├── auth.js
    │   ├── profiles.js
    │   └── posts.js
    ├── controllers/
    │   ├── authController.js
    │   ├── profileController.js
    │   └── postController.js
    ├── middleware/
    │   ├── auth.js
    │   └── validation.js
    ├── utils/
    │   ├── validators.js
    │   └── sanitizers.js
    └── scripts/
        ├── init-db.sql
        └── run-migrations.js
```

## Technologies

**Frontend:** HTML5, CSS3, JavaScript (Vanilla - no frameworks), DOM Manipulation, Fetch API

**Backend:** Node.js, Express.js, MySQL, JWT Authentication, bcryptjs

**Security:** JWT tokens, bcrypt hashing, input validation, XSS prevention, CSRF protection

**Deployment:** zeet.co (free tier with HTTPS, auto-deploy from GitHub)

**DevTools:** Git, GitHub, npm, nodemon

## API Endpoints & Testing with Postman

See [POSTMAN_TESTING.md](documentation/POSTMAN_TESTING.md) for comprehensive API documentation including:

- All endpoint specifications with request/response examples
- Installation and setup instructions
- Authentication and authorization details
- Protected vs public endpoint markings
- Error cases and troubleshooting
- Postman workflow examples and best practices

## Technologies

**Frontend:** HTML5, CSS3, JavaScript (Vanilla - no frameworks), DOM Manipulation, Fetch API

**Backend:** Node.js, Express.js, MySQL, JWT Authentication, bcryptjs

**Security:** JWT tokens, bcrypt hashing, input validation, XSS prevention, CSRF protection

**Deployment:** zeet.co (free tier with HTTPS, auto-deploy from GitHub)

**DevTools:** Git, GitHub, npm, nodemon

## Project Links

[GitHub Repository - Version Control & Collaboration](https://github.com/lindakovacs/UAlbany-Campus-Portal)

[Figma Desktop Wireframe Prototype](https://www.figma.com/proto/PiQZQ5yft44BaGyUbHGRRk/UAlbany-Campus?node-id=9-4&p=f&t=wNPUjPe54NW14knE-1&scaling=min-zoom&content-scaling=fixed&page-id=9%3A2&starting-point-node-id=9%3A4)​

[Figma Mobile Wireframe Prototype​](https://www.figma.com/proto/PiQZQ5yft44BaGyUbHGRRk/UAlbany-Campus?node-id=37-268&t=F4vHdLp9OArwFI2V-1&scaling=min-zoom&content-scaling=fixed&page-id=37%3A2&starting-point-node-id=37%3A268&show-proto-sidebar=1)

[Trello Board - Project Management](https://trello.com/b/bbsR787B/ualbany-campus-portal)​

[GitHub Repository - Version Control & Collaboration​ - Static Version](https://github.com/lindakovacs/UAlbany-Campus-Portal-Theme)

[GitHub Pages – Static Website Deployment & Hosting](https://lindakovacs.github.io/UAlbany-Campus-Portal-Theme/)

[YouTube Playlist](https://www.youtube.com/playlist?list=PLG_-OoK6rGHX6r0u-1LHN30CsLeEYQNO0)
