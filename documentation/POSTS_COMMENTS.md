# Posts & Comments System Documentation

## Overview

The UAlbany Campus Portal includes a complete social feed system enabling users to create posts, interact through likes and comments, and view other users' activity. The system uses a RESTful API with real-time updates via client-side JavaScript modules.

## Features

- **Post Creation**: Users can create text-based posts visible to all
- **Post Interactions**: Like/unlike posts with real-time count updates
- **Comments**: Add, view, and delete comments on posts
- **Automatic Profile Photos**: Comments and posts display user profile photos
- **Comment Counts**: Posts display total comment count on the feed
- **User Deletion**: Only post/comment authors can delete their own content
- **Profile Links**: Click on author names to view their profile
- **Pagination**: Posts feed supports pagination for performance

## Database Schema

### Posts Table

```sql
CREATE TABLE posts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  text LONGTEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Comments Table

```sql
CREATE TABLE comments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  post_id INT NOT NULL,
  user_id INT NOT NULL,
  content LONGTEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_post_id (post_id)
);
```

### Likes Table

```sql
CREATE TABLE likes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  post_id INT NOT NULL,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_post_user (post_id, user_id),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Aggregated Counts via Queries

Posts API queries include aggregated counts:

```sql
SELECT p.id, p.user_id, u.name, u.email, p.text as content, p.created_at,
       COUNT(DISTINCT l.id) as like_count,
       COUNT(DISTINCT c.id) as comment_count,
       pr.profile_photo
FROM posts p
JOIN users u ON p.user_id = u.id
LEFT JOIN likes l ON p.id = l.post_id
LEFT JOIN comments c ON p.id = c.post_id
LEFT JOIN profiles pr ON p.user_id = pr.user_id
GROUP BY p.id
ORDER BY p.created_at DESC;
```

This ensures:

- `like_count` - Number of likes on the post
- `comment_count` - Number of comments on the post
- `profile_photo` - User's profile photo (base64 or null for Gravatar fallback)

## Backend API Endpoints

### Posts Endpoints

**Get All Posts (Paginated)**

```
GET /api/posts?page=1&limit=10
```

Returns paginated posts with like and comment counts:

```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "user_id": 5,
      "name": "John Doe",
      "email": "john@example.com",
      "content": "My first post!",
      "created_at": "2024-01-15T10:30:00Z",
      "like_count": 3,
      "comment_count": 2,
      "profile_photo": "data:image/jpeg;base64,..."
    }
  ],
  "pagination": {
    "total": 42,
    "page": 1,
    "limit": 10,
    "pages": 5
  }
}
```

**Get Specific Post**

```
GET /api/posts/:postId
```

Returns single post with aggregated counts:

```json
{
  "status": "success",
  "data": {
    "id": 1,
    "user_id": 5,
    "name": "John Doe",
    "email": "john@example.com",
    "content": "My first post!",
    "created_at": "2024-01-15T10:30:00Z",
    "like_count": 3,
    "comment_count": 2,
    "profile_photo": "data:image/jpeg;base64,..."
  }
}
```

**Create Post**

```
POST /api/posts
Authentication: Required (JWT token)
Content-Type: application/json

Body:
{
  "text": "This is my new post!"
}
```

Response (201 Created):

```json
{
  "status": "success",
  "message": "Post created successfully",
  "data": {
    "id": 43,
    "user_id": 5,
    "text": "This is my new post!",
    "created_at": "2024-01-15T14:20:00Z"
  }
}
```

**Delete Post**

```
DELETE /api/posts/:postId
Authentication: Required (JWT token - must be post author)
```

Response (200 OK):

```json
{
  "status": "success",
  "message": "Post deleted successfully"
}
```

Errors:

- `403 Forbidden` - Not authorized to delete (not author)
- `404 Not Found` - Post doesn't exist
- `401 Unauthorized` - No authentication token

### Comments Endpoints

**Get Comments for Post**

```
GET /api/posts/:postId/comments?page=1&limit=100
```

Returns comments with user info and profile photos:

```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "post_id": 5,
      "user_id": 3,
      "content": "Great post!",
      "created_at": "2024-01-15T11:00:00Z",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "profile_photo": "data:image/jpeg;base64,..."
    }
  ]
}
```

**Create Comment**

```
POST /api/posts/:postId/comments
Authentication: Required (JWT token)
Content-Type: application/json

Body:
{
  "content": "Great post!"
}
```

Response (201 Created):

```json
{
  "status": "success",
  "message": "Comment created successfully",
  "data": {
    "id": 1,
    "post_id": 5,
    "user_id": 3,
    "content": "Great post!",
    "created_at": "2024-01-15T11:00:00Z"
  }
}
```

**Delete Comment**

```
DELETE /api/comments/:commentId
Authentication: Required (JWT token - must be comment author)
```

Response (200 OK):

```json
{
  "status": "success",
  "message": "Comment deleted successfully"
}
```

Errors:

- `403 Forbidden` - Not authorized to delete
- `404 Not Found` - Comment doesn't exist
- `401 Unauthorized` - No authentication token

### Likes Endpoints

**Like a Post**

```
POST /api/posts/:postId/like
Authentication: Required (JWT token)
```

Response (200 OK):

```json
{
  "status": "success",
  "message": "Post liked successfully"
}
```

**Unlike a Post**

```
DELETE /api/posts/:postId/like
Authentication: Required (JWT token)
```

Response (200 OK):

```json
{
  "status": "success",
  "message": "Like removed successfully"
}
```

**Get Post Likes**

```
GET /api/posts/:postId/likes
```

Returns count and user list:

```json
{
  "status": "success",
  "data": {
    "count": 3,
    "users": [
      { "id": 1, "name": "Alice", "email": "alice@example.com" },
      { "id": 2, "name": "Bob", "email": "bob@example.com" },
      { "id": 3, "name": "Charlie", "email": "charlie@example.com" }
    ]
  }
}
```

## Frontend API Client

The `apiClient` provides methods for posts and comments:

### Posts Methods

```javascript
// Get all posts (paginated)
const response = await apiClient.posts.getAll((page = 1), (limit = 10));

// Get specific post
const post = await apiClient.posts.get(postId);

// Create post (authenticated)
const newPost = await apiClient.posts.create({
  text: 'My new post!',
});

// Delete post (authenticated, owner only)
await apiClient.posts.delete(postId);
```

### Comments Methods

```javascript
// Get comments for a post
const comments = await apiClient.comments.getForPost(
  postId,
  (page = 1),
  (limit = 100),
);

// Create comment (authenticated)
const comment = await apiClient.comments.create(postId, {
  content: 'Great post!',
});

// Delete comment (authenticated, owner only)
await apiClient.comments.delete(commentId);
```

### Likes Methods

```javascript
// Like a post (authenticated)
await apiClient.likes.create(postId);

// Unlike a post (authenticated)
await apiClient.likes.delete(postId);

// Get post likes
const likes = await apiClient.likes.getForPost(postId);
```

## Frontend Modules

### posts-feed.js

Displays paginated posts on `posts.html` with:

- Post author info and profile photo
- Post content (XSS-escaped)
- Like button and count
- Comment count with link to post detail
- Delete button (for post author)
- Loading states and error handling

**Key Functions:**

```javascript
// Fetch and display posts
async function loadPosts();

// Handle like/unlike action
async function toggleLike(postId, likeBtn);

// Delete a post
async function deletePost(postId);

// Show loading state
function showLoadingState(message);

// Display error message
function showErrorMessage(message);
```

**Usage:**

```html
<script src="frontend/config.js"></script>
<script src="frontend/js/api-client.js"></script>
<script src="js/posts-feed.js"></script>
```

### post-detail.js

Displays individual post with comments on `post.html`:

- Single post with all details
- List of comments with profile photos
- Comment form for adding new comments
- Delete buttons for own posts/comments
- XSS protection for all user content
- Error handling and form validation

**Key Functions:**

```javascript
// Load post by ID from URL
async function loadPost();

// Load comments for post
async function loadComments();

// Display post content
function displayPost(post);

// Display comments list
function displayComments(comments);

// Handle comment form submission
async function handleCommentSubmit(e);

// Delete a comment
async function deleteComment(commentId);

// XSS safe HTML escaping
function escapeHtml(text);
```

**Usage:**

```html
<!-- posts.html should link to: -->
<a href="post.html?id=123">Read more</a>

<!-- post.html includes: -->
<script src="frontend/config.js"></script>
<script src="frontend/js/api-client.js"></script>
<script src="js/post-detail.js"></script>
```

## Security Features

### Input Validation

All inputs validated on backend:

```javascript
// Text field validation
validateFieldLength(text, 1, 10000); // 1-10000 characters

// Content field validation for comments
validateFieldLength(content, 1, 5000); // 1-5000 characters
```

### XSS Protection

Frontend escapes all user-generated content:

```javascript
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

// Applied to all posts and comments
<p>${escapeHtml(post.content)}</p>;
```

### SQL Injection Prevention

Backend uses parameterized queries:

```javascript
// Safe query with placeholders
const [posts] = await pool.query('SELECT * FROM posts WHERE id = ?', [postId]);
```

### Authentication & Authorization

- Posts/comments creation requires valid JWT token
- Deletion only allowed for post/comment author
- Backend verifies user ID matches author ID before deletion

## Testing Posts & Comments

### Manual Testing

1. **Create a post:**
   - Go to `posts.html`
   - Log in if not authenticated
   - Fill post form and click "Create Post"
   - Post should appear at top of feed

2. **Test XSS prevention:**
   - Create post with: `<script>alert('XSS')</script>`
   - Verify it renders as text, not executed

3. **Add comment:**
   - Click "View" on any post
   - Go to `post.html?id=123`
   - Add comment in form
   - Comment appears with your profile photo

4. **Delete content:**
   - Like a post → unlike it → like count updates
   - Delete your own post → removed from feed
   - Delete your own comment → removed from post

5. **Test SQL injection:**
   - Try email with SQL: `' OR '1'='1`
   - Validation should fail with 400 error

### Using Postman

See [POSTMAN_TESTING.md](POSTMAN_TESTING.md) for:

- Complete request/response examples
- Authentication setup
- Error cases and status codes
- Workflow examples

### Using Browser Console

```javascript
// Create a post
await apiClient.posts.create({ text: 'Test post' });

// Get all posts
const posts = await apiClient.posts.getAll(1, 10);

// Get specific post
const post = await apiClient.posts.get(1);

// Add comment
await apiClient.comments.create(1, { content: 'Nice!' });

// Like post
await apiClient.likes.create(1);

// Delete post
await apiClient.posts.delete(1);
```

## Troubleshooting

### Posts not showing on feed

1. Check browser console for errors (F12)
2. Verify backend is running: `curl http://localhost:3001/api/posts`
3. Check network tab in DevTools for API response
4. Verify database has posts: `SELECT COUNT(*) FROM posts;`

### Comments not appearing on post detail page

1. Check post ID in URL: `post.html?id=123`
2. Verify database has comments for that post: `SELECT COUNT(*) FROM comments WHERE post_id=123;`
3. Check console for API errors
4. Ensure `post-detail.js` is loading correctly

### Profile photos not showing

1. Verify profile photos exist in database: `SELECT COUNT(*) FROM profiles WHERE profile_photo IS NOT NULL;`
2. Check if Gravatar fallback is working
3. Verify API includes `profile_photo` field in response
4. Check browser console for image load errors

### "Cannot create post/comment" or "Unauthorized" errors

1. Verify you are logged in (check localStorage)
2. Check JWT token hasn't expired
3. Verify API is running on correct port
4. Check backend console for detailed error

### Like/unlike not updating

1. Check network requests in DevTools
2. Verify like request returns 200 status
3. Check browser console for API errors
4. Manually refresh page if UI doesn't update

## Performance Considerations

- Posts are paginated (10 per page by default)
- Comments are paginated (100 per page max)
- Counts are aggregated via SQL GROUP BY (efficient)
- Profile photos stored as base64 (consider lazy loading in production)
- Like/unlike uses unique constraint to prevent duplicates
- Comments indexed by post_id for faster queries

## Future Enhancements

- Real-time updates via WebSockets
- Post editing capability
- Image/media uploads in posts
- Hashtag and @mention support
- Post search and filtering
- Nested comment replies
- Like animations and sounds
- Post sharing to social media
- Analytics dashboard
