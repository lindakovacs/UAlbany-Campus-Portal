# API Endpoints & Testing with Postman

The backend API runs on `http://localhost:3001` during development. Below are all available endpoints with Postman testing instructions.

## Installation

1. **Download and Install Postman:**
   - Visit [https://www.postman.com/downloads/](https://www.postman.com/downloads/)
   - Choose your operating system (Windows, macOS, or Linux)
   - Install the application
   - Create a free Postman account or sign in

## Setup

1. Start the backend server:

   ```bash
   cd server
   npm start
   ```

2. Open Postman and create a new workspace
3. Import or manually create requests for each endpoint below
4. Save JWT tokens from auth responses for protected endpoints

## Authentication Endpoints

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

## Profile Endpoints

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

## Education Endpoints (Nested under Profiles)

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

## Education Endpoints (Alternative Routes)

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

## Experience Endpoints

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

## Posts Endpoints

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

## Likes Endpoints

**POST /api/posts/:postId/like** - Toggle like on post (Protected)

- **URL:** `http://localhost:3001/api/posts/1/like`
- **Method:** POST
- **Headers:** `Authorization: Bearer <your_jwt_token>`
- **Expected Response (200):**
  ```json
  {
    "status": "success",
    "message": "Post liked",
    "data": {
      "post_id": 1,
      "user_id": 1,
      "liked": true
    }
  }
  ```
- **Error Cases:**
  - `401` - Missing token or not authenticated
  - `404` - Post not found

**GET /api/posts/:postId/likes/count** - Get like count for post

- **URL:** `http://localhost:3001/api/posts/1/likes/count`
- **Method:** GET
- **Expected Response (200):**
  ```json
  {
    "status": "success",
    "data": {
      "post_id": 1,
      "like_count": 5
    }
  }
  ```
- **Error Cases:**
  - `404` - Post not found

**GET /api/posts/:postId/likes** - Get list of users who liked post

- **URL:** `http://localhost:3001/api/posts/1/likes?limit=10`
- **Method:** GET
- **Query Parameters:**
  - `limit` (optional, default: 10, max: 100) - Max users to return
- **Expected Response (200):**
  ```json
  {
    "status": "success",
    "data": [
      {
        "id": 2,
        "name": "Jane Smith",
        "email": "jane@example.com",
        "created_at": "2026-04-12T11:30:00Z"
      }
    ]
  }
  ```
- **Error Cases:**
  - `404` - Post not found

**GET /api/posts/:postId/likes/check** - Check if current user liked post

- **URL:** `http://localhost:3001/api/posts/1/likes/check`
- **Method:** GET
- **Headers:** (Optional - conditional on whether user is authenticated)
  - `Authorization: Bearer <your_jwt_token>` (if logged in)
- **Expected Response (200):**
  ```json
  {
    "status": "success",
    "data": {
      "post_id": 1,
      "liked": true
    }
  }
  ```
- **Note:** Returns `liked: false` if not authenticated

## Comments Endpoints

**GET /api/posts/:postId/comments** - Get all comments for a post (Paginated)

- **URL:** `http://localhost:3001/api/posts/1/comments?page=1&limit=20`
- **Method:** GET
- **Query Parameters:**
  - `page` (optional, default: 1) - Page number
  - `limit` (optional, default: 20, max: 100) - Comments per page
- **Expected Response (200):**
  ```json
  {
    "status": "success",
    "data": [
      {
        "id": 1,
        "post_id": 1,
        "user_id": 2,
        "name": "Jane Smith",
        "email": "jane@example.com",
        "content": "Great post! I really enjoyed reading this.",
        "created_at": "2026-04-12T12:00:00Z",
        "updated_at": "2026-04-12T12:00:00Z"
      }
    ],
    "pagination": {
      "total": 5,
      "page": 1,
      "limit": 20,
      "pages": 1
    }
  }
  ```
- **Error Cases:**
  - `404` - Post not found

**POST /api/posts/:postId/comments** - Add comment to post (Protected)

- **URL:** `http://localhost:3001/api/posts/1/comments`
- **Method:** POST
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <your_jwt_token>`
- **Body (JSON):**
  ```json
  {
    "content": "Great post! I really enjoyed reading this."
  }
  ```
- **Expected Response (201):**
  ```json
  {
    "status": "success",
    "message": "Comment added successfully",
    "data": {
      "id": 1,
      "post_id": 1,
      "user_id": 2,
      "name": "Jane Smith",
      "email": "jane@example.com",
      "content": "Great post! I really enjoyed reading this.",
      "created_at": "2026-04-12T12:00:00Z"
    }
  }
  ```
- **Error Cases:**
  - `401` - Missing token or not authenticated
  - `404` - Post not found
  - `400` - Missing content or content exceeds 1000 characters

**GET /api/comments/:commentId** - Get specific comment

- **URL:** `http://localhost:3001/api/comments/1`
- **Method:** GET
- **Expected Response (200):**
  ```json
  {
    "status": "success",
    "data": {
      "id": 1,
      "post_id": 1,
      "user_id": 2,
      "name": "Jane Smith",
      "email": "jane@example.com",
      "content": "Great post! I really enjoyed reading this.",
      "created_at": "2026-04-12T12:00:00Z",
      "updated_at": "2026-04-12T12:00:00Z"
    }
  }
  ```
- **Error Cases:**
  - `404` - Comment not found

**PUT /api/comments/:commentId** - Update comment (Protected, owner only)

- **URL:** `http://localhost:3001/api/comments/1`
- **Method:** PUT
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <your_jwt_token>`
- **Body (JSON):**
  ```json
  {
    "content": "Updated comment with new information."
  }
  ```
- **Expected Response (200):**
  ```json
  {
    "status": "success",
    "message": "Comment updated successfully",
    "data": {
      "id": 1,
      "post_id": 1,
      "user_id": 2,
      "content": "Updated comment with new information.",
      "updated_at": "2026-04-12T12:30:00Z"
    }
  }
  ```
- **Error Cases:**
  - `401` - Missing token or not comment owner
  - `404` - Comment not found
  - `400` - Missing content or content exceeds 1000 characters

**DELETE /api/comments/:commentId** - Delete comment (Protected, owner only)

- **URL:** `http://localhost:3001/api/comments/1`
- **Method:** DELETE
- **Headers:** `Authorization: Bearer <your_jwt_token>`
- **Expected Response (200):**
  ```json
  {
    "status": "success",
    "message": "Comment deleted successfully"
  }
  ```
- **Error Cases:**
  - `401` - Missing token or not comment owner
  - `404` - Comment not found

**GET /api/posts/:postId/comments/count** - Get comment count for post

- **URL:** `http://localhost:3001/api/posts/1/comments/count`
- **Method:** GET
- **Expected Response (200):**
  ```json
  {
    "status": "success",
    "data": {
      "post_id": 1,
      "comment_count": 5
    }
  }
  ```
- **Error Cases:**
  - `404` - Post not found

## AI Chatbot Endpoints

**POST /api/chat** - Send message to AI chatbot

- **URL:** `http://localhost:3001/api/chat`
- **Method:** POST
- **Headers:**
  - `Content-Type: application/json`
- **Body (JSON):**
  ```json
  {
    "message": "Tell me about UAlbany campus"
  }
  ```
- **Expected Response (200):**
  ```json
  {
    "status": "success",
    "data": {
      "response": "University at Albany is located in Albany, NY. We have beautiful dining facilities, research labs, and modern student housing. The campus spans over 600 acres! Learn more: https://www.albany.edu",
      "usedMock": false
    }
  }
  ```
- **Notes:**
  - `usedMock: false` = Using real Gemini API
  - `usedMock: true` = Using fallback mock responses (no API key configured)
  - No authentication required
  - Message max length: 2000 characters
- **Error Cases:**
  - `400` - Missing or empty message
  - `429` - Rate limit exceeded (chatbot busy - try again later)
  - `500` - Server error (falls back to mock responses)

**GET /api/chat/health** - Check chatbot configuration status

- **URL:** `http://localhost:3001/api/chat/health`
- **Method:** GET
- **Expected Response (200):**
  ```json
  {
    "status": "success",
    "data": {
      "chatbotActive": true,
      "apiConfigured": true,
      "model": "gemini-2.5-flash",
      "useMock": false,
      "message": "🤖 Gemini AI chatbot active (gemini-2.5-flash)"
    }
  }
  ```
- **Configuration Meanings:**
  - `apiConfigured: true` = API key is set in .env
  - `apiConfigured: false` = Using mock responses (no API key)
  - `model` = Active Gemini model (default: gemini-2.5-flash)
- **Response Example (Mock Mode):**
  ```json
  {
    "status": "success",
    "data": {
      "chatbotActive": true,
      "apiConfigured": false,
      "model": "gemini-2.5-flash",
      "useMock": true,
      "message": "📝 Mock chatbot active - no API key configured"
    }
  }
  ```

## Postman Workflow Example

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

## Testing Tips

- **Store tokens:** Save frequently used tokens in Postman environments for quick access
- **Test error cases:** Try invalid emails, wrong passwords, missing tokens to verify error handling
- **Verify data:** After each POST/PUT request, use corresponding GET request to verify data was saved
- **Use Postman Collections:** Group related requests into collections for organized testing
- **Monitor database:** Use `node check-db.js` to verify data was stored in MySQL
