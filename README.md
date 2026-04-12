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

Open any HTML file in your browser (for example, in VS Code, right-click on your HTML file (such as index.html) in the editor and select "Open with Live Server" from the context menu. Alternatively, you can use the keyboard shortcut Alt + L then Alt + O.). No build step or server is required for this Static UI website phase.

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
