# UAlbany Campus Portal

Full-stack web application for Albany Campus Portal platform. This project is a complete production-ready solution with a modern frontend (HTML/CSS/JavaScript), backend API (Node.js/Express), and MySQL database. Features user authentication, profiles, social posts, education/experience tracking, AI chatbot, and real-time interactions.

## Features

- **User Authentication:** Secure registration and login with JWT tokens
- **User Profiles:** Create, update, and manage user profiles with bio, skills, education/experience
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

**Using Live Server (VS Code)**

1. Install Live Server extension in VS Code (by Ritwick Dey)
2. Right-click on any `.html` file (e.g., `index.html`)
3. Select "Open with Live Server"
4. Frontend will open on `http://127.0.0.1:5500` (or similar)

**Port Reference:**

- **Backend:** `http://localhost:3001`
- **Frontend:** `http://127.0.0.1:5500` or configured in `frontend/config.js`

### Verify Everything is Running

- Frontend: Open browser and visit `http://localhost:3000` (or `http://127.0.0.1:5500`)
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

| Setting           | File                                               | How Backend Reads It     | How Frontend Reads It                     |
| ----------------- | -------------------------------------------------- | ------------------------ | ----------------------------------------- |
| Backend Port      | `server/.env` `PORT=3001`                          | `process.env.PORT`       | Must manually update `frontend/config.js` |
| Frontend URL      | `server/.env` `FRONTEND_URL=http://localhost:3000` | Used for CORS validation | For reference only                        |
| Backend Host/Port | `frontend/config.js` `CONFIG.BACKEND_HOST/PORT`    | N/A                      | Loaded via `<script>` tag                 |

**CORS Policy (Development):**

Backend accepts all **localhost** connections:

- ✅ `http://localhost:3000` (production frontend)
- ✅ `http://127.0.0.1:5500` (Live Server)
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

The backend API runs on `http://localhost:3001` during development. Below are all available endpoints with Postman testing instructions.

### Installation

1. **Download and Install Postman:**
   - Visit [https://www.postman.com/downloads/](https://www.postman.com/downloads/)
   - Choose your operating system (Windows, macOS, or Linux)
   - Install the application
   - Create a free Postman account or sign in

### Setup

1. Start the backend server:

   ```bash
   cd server
   npm start
   ```

2. Open Postman and create a new workspace
3. Import or manually create requests for each endpoint below
4. Save JWT tokens from auth responses for protected endpoints

#### Authentication Endpoints

**POST /api/auth/register** - Create new user account

- **URL:** `http://localhost:3001/api/auth/register`
- **Method:** POST
- **Headers:** `Content-Type: application/json`
- **Body (JSON):**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securePassword123",
    "passwordConfirm": "securePassword123"
  }
  ```
- **Expected Response (201):**
  ```json
  {
    "message": "User registered successfully",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
  ```
- **Error Cases:**
  - `400` - Invalid email or password format, passwords don't match
  - `409` - Email already registered

**POST /api/auth/login** - Login with credentials

- **URL:** `http://localhost:3001/api/auth/login`
- **Method:** POST
- **Headers:** `Content-Type: application/json`
- **Body (JSON):**
  ```json
  {
    "email": "john@example.com",
    "password": "securePassword123"
  }
  ```
- **Expected Response (200):**
  ```json
  {
    "message": "User logged in successfully",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
  ```
- **Error Cases:**
  - `401` - Invalid email or password
  - `400` - Missing email or password

**GET /api/auth/me** - Get current user (Protected)

- **URL:** `http://localhost:3001/api/auth/me`
- **Method:** GET
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <your_jwt_token>`
- **Example (Replace TOKEN with actual token):**
  ```
  GET http://localhost:3001/api/auth/me
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```
- **Expected Response (200):**
  ```json
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2026-04-12T10:30:00Z",
    "updated_at": "2026-04-12T10:30:00Z"
  }
  ```
- **Error Cases:**
  - `401` - Missing or invalid token

#### Profile Endpoints

**GET /api/profiles** - List all profiles (Paginated)

- **URL:** `http://localhost:3001/api/profiles?page=1&limit=10`
- **Method:** GET
- **Query Parameters:**
  - `page` (optional, default: 1) - Page number
  - `limit` (optional, default: 10, max: 50) - Items per page
- **Expected Response (200):**
  ```json
  {
    "status": "success",
    "data": [
      {
        "id": 1,
        "user_id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "bio": "Software developer and tech enthusiast",
        "skills": ["JavaScript", "React", "Node.js"],
        "social_links": { "github": "https://github.com/johndoe" },
        "created_at": "2026-04-12T10:30:00Z",
        "updated_at": "2026-04-12T10:30:00Z"
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 10,
      "pages": 3
    }
  }
  ```

**GET /api/profiles/:userId** - Get specific user profile

- **URL:** `http://localhost:3001/api/profiles/1`
- **Method:** GET
- **URL Parameter:** `userId` - User ID
- **Expected Response (200):**
  ```json
  {
    "status": "success",
    "data": {
      "id": 1,
      "user_id": 1,
      "bio": "Software developer and tech enthusiast",
      "skills": ["JavaScript", "React", "Node.js"],
      "social_links": { "github": "https://github.com/johndoe" },
      "created_at": "2026-04-12T10:30:00Z",
      "updated_at": "2026-04-12T10:30:00Z"
    }
  }
  ```
- **Error Cases:**
  - `404` - Profile not found
  - `400` - Invalid user ID

**PUT /api/profiles/:userId** - Update own profile (Protected)

- **URL:** `http://localhost:3001/api/profiles/1`
- **Method:** PUT
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <your_jwt_token>`
- **Body (JSON):** (All fields optional - only send fields to update)
  ```json
  {
    "bio": "Updated bio here",
    "skills": ["JavaScript", "TypeScript", "React", "Node.js"],
    "social_links": {
      "github": "https://github.com/johndoe",
      "linkedin": "https://linkedin.com/in/johndoe"
    }
  }
  ```
- **Expected Response (200):**
  ```json
  {
    "status": "success",
    "message": "Profile updated successfully",
    "data": {
      "id": 1,
      "user_id": 1,
      "bio": "Updated bio here",
      "skills": ["JavaScript", "TypeScript", "React", "Node.js"],
      "social_links": {
        "github": "https://github.com/johndoe",
        "linkedin": "..."
      },
      "created_at": "2026-04-12T10:30:00Z",
      "updated_at": "2026-04-12T14:45:00Z"
    }
  }
  ```
- **Error Cases:**
  - `401` - Missing token or unauthorized user (not profile owner)
  - `404` - Profile not found
  - `400` - Invalid user ID or invalid data

#### Education Endpoints (Nested under Profiles)

**GET /api/profiles/:userId/education** - Get user's education history

- **URL:** `http://localhost:3001/api/profiles/1/education`
- **Method:** GET
- **Expected Response (200):**
  ```json
  {
    "status": "success",
    "data": [
      {
        "id": 1,
        "user_id": 1,
        "school": "University of Albany",
        "degree": "Bachelor of Science",
        "field_of_study": "Computer Science",
        "from_date": "2020-09-01",
        "to_date": "2024-05-31",
        "current": false,
        "description": "Completed coursework in algorithms and software engineering",
        "created_at": "2026-04-12T10:30:00Z"
      }
    ]
  }
  ```

**POST /api/profiles/education** - Add education entry (Protected)

- **URL:** `http://localhost:3001/api/profiles/education`
- **Method:** POST
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <your_jwt_token>`
- **Body (JSON):**
  ```json
  {
    "school": "University of Albany",
    "degree": "Bachelor of Science",
    "field_of_study": "Computer Science",
    "from_date": "2020-09-01",
    "to_date": "2024-05-31",
    "current": false,
    "description": "Completed coursework in algorithms and software engineering"
  }
  ```
- **Expected Response (201):**
  ```json
  {
    "status": "success",
    "message": "Education entry added successfully",
    "data": {
      "id": 1,
      "user_id": 1,
      "school": "University of Albany",
      "degree": "Bachelor of Science",
      "field_of_study": "Computer Science",
      "from_date": "2020-09-01",
      "to_date": "2024-05-31",
      "current": false,
      "description": "Completed coursework in algorithms and software engineering"
    }
  }
  ```
- **Error Cases:**
  - `401` - Missing token or not authenticated
  - `400` - Missing required fields (school, degree, from_date)

**DELETE /api/profiles/education/:eduId** - Delete education entry (Protected, owner only)

- **URL:** `http://localhost:3001/api/profiles/education/1`
- **Method:** DELETE
- **Headers:** `Authorization: Bearer <your_jwt_token>`
- **Expected Response (200):**
  ```json
  {
    "status": "success",
    "message": "Education entry deleted successfully"
  }
  ```
- **Error Cases:**
  - `401` - Missing token or not owner
  - `404` - Education entry not found

#### Education Endpoints

**GET /api/education/:userId** - Get user's education history

- **URL:** `http://localhost:3001/api/education/1`
- **Method:** GET
- **Expected Response (200):**
  ```json
  {
    "status": "success",
    "data": [
      {
        "id": 1,
        "user_id": 1,
        "school": "University of Albany",
        "degree": "Bachelor of Science",
        "field_of_study": "Computer Science",
        "from_date": "2020-09-01",
        "to_date": "2024-05-31",
        "current": false,
        "description": "Completed coursework in algorithms and software engineering",
        "created_at": "2026-04-12T10:30:00Z"
      }
    ]
  }
  ```

**POST /api/education/:userId** - Add education entry (Protected)

- **URL:** `http://localhost:3001/api/education/1`
- **Method:** POST
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <your_jwt_token>`
- **Body (JSON):**
  ```json
  {
    "school": "University of Albany",
    "degree": "Bachelor of Science",
    "field_of_study": "Computer Science",
    "from_date": "2020-09-01",
    "to_date": "2024-05-31",
    "current": false,
    "description": "Completed coursework in algorithms and software engineering"
  }
  ```
- **Expected Response (201):**
  ```json
  {
    "status": "success",
    "message": "Education entry added successfully",
    "data": {
      "id": 1,
      "user_id": 1,
      "school": "University of Albany",
      "degree": "Bachelor of Science",
      "field_of_study": "Computer Science",
      "from_date": "2020-09-01",
      "to_date": "2024-05-31",
      "current": false,
      "description": "Completed coursework in algorithms and software engineering"
    }
  }
  ```
- **Error Cases:**
  - `401` - Missing token or not profile owner
  - `400` - Missing required fields (school, degree, from_date)

**PUT /api/education/:educationId** - Update education entry (Protected, owner only)

- **URL:** `http://localhost:3001/api/education/1`
- **Method:** PUT
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <your_jwt_token>`
- **Body (JSON):** (All fields optional)
  ```json
  {
    "school": "Updated School Name",
    "current": true
  }
  ```
- **Expected Response (200):** Same as POST response

**DELETE /api/education/:educationId** - Delete education entry (Protected, owner only)

- **URL:** `http://localhost:3001/api/education/1`
- **Method:** DELETE
- **Headers:** `Authorization: Bearer <your_jwt_token>`
- **Expected Response (200):**
  ```json
  {
    "status": "success",
    "message": "Education entry deleted successfully"
  }
  ```

#### Experience Endpoints

**GET /api/experience/:userId** - Get user's work experience

- **URL:** `http://localhost:3001/api/experience/1`
- **Method:** GET
- **Expected Response (200):**
  ```json
  {
    "status": "success",
    "data": [
      {
        "id": 1,
        "user_id": 1,
        "company": "Tech Company Inc",
        "title": "Software Engineer",
        "location": "New York, NY",
        "from_date": "2024-06-01",
        "to_date": null,
        "current": true,
        "description": "Developing web applications and APIs",
        "created_at": "2026-04-12T11:00:00Z"
      }
    ]
  }
  ```

**POST /api/experience/:userId** - Add work experience (Protected)

- **URL:** `http://localhost:3001/api/experience/1`
- **Method:** POST
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <your_jwt_token>`
- **Body (JSON):**
  ```json
  {
    "company": "Tech Company Inc",
    "title": "Software Engineer",
    "location": "New York, NY",
    "from_date": "2024-06-01",
    "to_date": null,
    "current": true,
    "description": "Developing web applications and APIs"
  }
  ```
- **Expected Response (201):**
  ```json
  {
    "status": "success",
    "message": "Experience entry added successfully",
    "data": {
      "id": 1,
      "user_id": 1,
      "company": "Tech Company Inc",
      "title": "Software Engineer",
      "location": "New York, NY",
      "from_date": "2024-06-01",
      "to_date": null,
      "current": true,
      "description": "Developing web applications and APIs"
    }
  }
  ```
- **Error Cases:**
  - `401` - Missing token or not profile owner
  - `400` - Missing required fields (company, title, from_date)

**PUT /api/experience/:experienceId** - Update experience entry (Protected, owner only)

- **URL:** `http://localhost:3001/api/experience/1`
- **Method:** PUT
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <your_jwt_token>`
- **Body (JSON):** (All fields optional)
  ```json
  {
    "title": "Senior Software Engineer",
    "to_date": "2026-04-12",
    "current": false
  }
  ```
- **Expected Response (200):** Same as POST response

**DELETE /api/experience/:experienceId** - Delete experience entry (Protected, owner only)

- **URL:** `http://localhost:3001/api/experience/1`
- **Method:** DELETE
- **Headers:** `Authorization: Bearer <your_jwt_token>`
- **Expected Response (200):**
  ```json
  {
    "status": "success",
    "message": "Experience entry deleted successfully"
  }
  ```

#### Posts Endpoints

**GET /api/posts** - Get all posts (Paginated)

- **URL:** `http://localhost:3001/api/posts?page=1&limit=10`
- **Method:** GET
- **Query Parameters:**
  - `page` (optional, default: 1) - Page number
  - `limit` (optional, default: 10, max: 50) - Items per page
- **Expected Response (200):**
  ```json
  {
    "status": "success",
    "data": [
      {
        "id": 1,
        "user_id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "content": "Just finished an amazing project! Thrilled to share it with the campus community.",
        "created_at": "2026-04-12T10:30:00Z",
        "updated_at": "2026-04-12T10:30:00Z"
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 10,
      "pages": 3
    }
  }
  ```

**POST /api/posts** - Create new post (Protected)

- **URL:** `http://localhost:3001/api/posts`
- **Method:** POST
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <your_jwt_token>`
- **Body (JSON):**
  ```json
  {
    "content": "Just finished an amazing project! Thrilled to share it with the campus community."
  }
  ```
- **Expected Response (201):**
  ```json
  {
    "status": "success",
    "message": "Post created successfully",
    "data": {
      "id": 1,
      "user_id": 1,
      "content": "Just finished an amazing project! Thrilled to share it with the campus community.",
      "created_at": "2026-04-12T10:30:00Z",
      "updated_at": "2026-04-12T10:30:00Z"
    }
  }
  ```
- **Error Cases:**
  - `401` - Missing token or not authenticated
  - `400` - Missing content or content exceeds 5000 characters

**GET /api/posts/:postId** - Get specific post

- **URL:** `http://localhost:3001/api/posts/1`
- **Method:** GET
- **Expected Response (200):**
  ```json
  {
    "status": "success",
    "data": {
      "id": 1,
      "user_id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "content": "Just finished an amazing project! Thrilled to share it with the campus community.",
      "created_at": "2026-04-12T10:30:00Z",
      "updated_at": "2026-04-12T10:30:00Z"
    }
  }
  ```
- **Error Cases:**
  - `404` - Post not found

**PUT /api/posts/:postId** - Update post (Protected, owner only)

- **URL:** `http://localhost:3001/api/posts/1`
- **Method:** PUT
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <your_jwt_token>`
- **Body (JSON):**
  ```json
  {
    "content": "Updated post content with new information!"
  }
  ```
- **Expected Response (200):**
  ```json
  {
    "status": "success",
    "message": "Post updated successfully",
    "data": {
      "id": 1,
      "user_id": 1,
      "content": "Updated post content with new information!",
      "updated_at": "2026-04-12T11:45:00Z"
    }
  }
  ```
- **Error Cases:**
  - `401` - Missing token or not post owner
  - `404` - Post not found
  - `400` - Missing content or content exceeds 5000 characters

**DELETE /api/posts/:postId** - Delete post (Protected, owner only)

- **URL:** `http://localhost:3001/api/posts/1`
- **Method:** DELETE
- **Headers:** `Authorization: Bearer <your_jwt_token>`
- **Expected Response (200):**
  ```json
  {
    "status": "success",
    "message": "Post deleted successfully"
  }
  ```
- **Error Cases:**
  - `401` - Missing token or not post owner
  - `404` - Post not found

### Postman Workflow Example

1. **Register a new user:**
   - Use `POST /api/auth/register` with unique email
   - Copy the `token` from response

2. **Login with credentials:**
   - Use `POST /api/auth/login`
   - Copy the `token` from response (tokens are valid for 7 days)

3. **Get current user:**
   - Use `GET /api/auth/me`
   - Set header `Authorization: Bearer <token_from_step_2>`

4. **View all profiles:**
   - Use `GET /api/profiles` with pagination
   - No authentication required

5. **Update your profile:**
   - Use `PUT /api/profiles/<your_user_id>`
   - Set header `Authorization: Bearer <token_from_step_2>`
   - Add bio, skills, and social links in JSON body

6. **View specific profile:**
   - Use `GET /api/profiles/<user_id>`
   - No authentication required

7. **Add education:**
   - Use `POST /api/education/<your_user_id>`
   - Set header `Authorization: Bearer <token_from_step_2>`
   - Add school, degree, field_of_study, from_date in JSON body

8. **View your education:**
   - Use `GET /api/education/<your_user_id>`
   - No authentication required

9. **Add work experience:**
   - Use `POST /api/experience/<your_user_id>`
   - Set header `Authorization: Bearer <token_from_step_2>`
   - Add company, title, location, from_date in JSON body

10. **View your work experience:**
    - Use `GET /api/experience/<your_user_id>`
    - No authentication required

### Testing Tips

- **Store tokens:** Save frequently used tokens in Postman environments for quick access
- **Test error cases:** Try invalid emails, wrong passwords, missing tokens to verify error handling
- **Verify data:** After each POST/PUT request, use corresponding GET request to verify data was saved
- **Use Postman Collections:** Group related requests into collections for organized testing
- **Monitor database:** Use `node check-db.js` to verify data was stored in MySQL

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
