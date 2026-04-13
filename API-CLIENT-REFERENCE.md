# API Client Reference Guide

Quick reference for using the `apiClient` helper in frontend JavaScript code.

## Initialization

The `apiClient` instance is automatically created globally when `js/api-client.js` is loaded:

```html
<script src="js/api-client.js"></script>
<script>
  // apiClient is now available globally
  apiClient.auth.login(credentials);
</script>
```

## API Methods

### Authentication (`apiClient.auth.*`)

```javascript
// Register new user
await apiClient.auth.register({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123',
  passwordConfirm: 'password123',
});

// Login
await apiClient.auth.login({
  email: 'john@example.com',
  password: 'password123',
});

// Get current authenticated user
const user = await apiClient.auth.getCurrentUser();

// Logout
apiClient.auth.logout();
```

### Profiles (`apiClient.profiles.*`)

```javascript
// Get all profiles (paginated)
const profiles = await apiClient.profiles.getAll((page = 1), (limit = 20));

// Get specific profile by ID
const profile = await apiClient.profiles.get(userId);

// Get current user's profile
const myProfile = await apiClient.profiles.getMe();

// Update current user's profile
await apiClient.profiles.update({
  bio: 'My bio',
  skills: ['JavaScript', 'React'],
});

// Search profiles
const results = await apiClient.profiles.search('john');
```

### Education (`apiClient.education.*`)

```javascript
// Get education for specific user
const education = await apiClient.education.getForUser(userId);

// Add education record (for current user)
await apiClient.education.add({
  school: 'University of Albany',
  degree: 'Bachelor of Science',
  field_of_study: 'Computer Science',
  from_date: '2020-09-01',
  to_date: '2024-05-31',
  current: false,
  description: 'Major in CS, minor in Math',
});

// Update education record
await apiClient.education.update(educationId, {
  school: 'New School Name',
  current: true,
});

// Delete education record
await apiClient.education.delete(educationId);
```

### Experience (`apiClient.experience.*`)

```javascript
// Get work experience for specific user
const experience = await apiClient.experience.getForUser(userId);

// Add work experience (for current user)
await apiClient.experience.add({
  company: 'Tech Corp',
  title: 'Software Engineer',
  location: 'New York, NY',
  from_date: '2023-06-01',
  to_date: null,
  current: true,
  description: 'Backend development',
});

// Update experience record
await apiClient.experience.update(experienceId, {
  title: 'Senior Software Engineer',
  current: true,
});

// Delete experience record
await apiClient.experience.delete(experienceId);
```

### Posts (`apiClient.posts.*`)

```javascript
// Get all posts (paginated)
const posts = await apiClient.posts.getAll((page = 1), (limit = 20));

// Get specific post
const post = await apiClient.posts.get(postId);

// Create new post (requires authentication)
await apiClient.posts.create({
  content: 'This is my first post!',
});

// Update post (owner only)
await apiClient.posts.update(postId, {
  content: 'Updated content',
});

// Delete post (owner only)
await apiClient.posts.delete(postId);
```

### Comments (`apiClient.comments.*`)

```javascript
// Get comments for a post (paginated)
const response = await apiClient.comments.getForPost(
  postId,
  (page = 1),
  (limit = 20),
);
// response.data contains array of comments
// response.pagination contains pagination info

// Get specific comment
const comment = await apiClient.comments.get(commentId);

// Create comment on post (requires authentication)
await apiClient.comments.create(postId, {
  content: 'Great post!',
});

// Update comment (owner only)
await apiClient.comments.update(commentId, {
  content: 'Updated comment',
});

// Delete comment (owner only)
await apiClient.comments.delete(commentId);

// Get comment count for post
const result = await apiClient.comments.getCount(postId);
// result.comment_count
```

### Likes (`apiClient.likes.*`)

```javascript
// Toggle like on post (requires authentication)
const result = await apiClient.likes.toggle(postId);
// result.liked = true/false

// Get like count for post
const result = await apiClient.likes.getCount(postId);
// result.like_count

// Get list of users who liked post
const users = await apiClient.likes.getList(postId, (limit = 10));

// Check if current user liked post
const result = await apiClient.likes.checkStatus(postId);
// result.liked = true/false
```

### Chatbot (`apiClient.chatbot.*`)

```javascript
// Send message to chatbot
const response = await apiClient.chatbot.sendMessage('Tell me about UAlbany');
// response.data.response contains bot's answer

// Check chatbot health/configuration
const status = await apiClient.chatbot.getHealth();
// status.chatbotActive
// status.apiConfigured (true if Gemini API key is set)
// status.model
// status.useMock (true if using fallback mock responses)
```

## Utility Functions

### Authentication Status

```javascript
// Check if user is authenticated
if (apiClient.isAuthenticated()) {
  // User is logged in
}

// Get stored token
const token = apiClient.getToken();

// Logout (clear stored data)
apiClient.logout();
```

### UI Display Helpers

```javascript
// Show loading spinner
showLoader('element-id');

// Hide loading spinner
hideLoader();

// Show error alert
showError('Error message here');

// Show success alert
showSuccess('Success message here');
```

### Error Handling

```javascript
try {
  const user = await apiClient.auth.login(credentials);
} catch (error) {
  // error properties:
  console.log(error.message); // Error message
  console.log(error.status); // HTTP status code
  console.log(error.data); // Response body
  console.log(error.getUniendlyMessage()); // User-friendly message

  // Handle specific errors
  if (error.status === 401) {
    // Unauthorized - redirect to login
  } else if (error.status === 429) {
    // Rate limited
  } else if (error.status === 500) {
    // Server error
  }
}
```

## HTTP Status Codes

| Code | Meaning      | Action                       |
| ---- | ------------ | ---------------------------- |
| 200  | Success      | Use response data            |
| 400  | Bad Request  | Check input validation       |
| 401  | Unauthorized | User needs to log in         |
| 403  | Forbidden    | User lacks permission        |
| 404  | Not Found    | Resource doesn't exist       |
| 409  | Conflict     | Resource already exists      |
| 429  | Rate Limited | Too many requests, try later |
| 500  | Server Error | Check backend logs           |

## Common Patterns

### Login Form

```javascript
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  const credentials = Object.fromEntries(formData);

  try {
    await apiClient.auth.login(credentials);
    showSuccess('Logged in!');
    window.location.href = 'dashboard.html';
  } catch (error) {
    showError(error.message);
  }
});
```

### Load Data on Page Load

```javascript
async function loadProfileData() {
  try {
    if (!apiClient.isAuthenticated()) {
      window.location.href = 'login.html';
      return;
    }

    showLoader('profile-container');
    const profile = await apiClient.profiles.getMe();
    renderProfile(profile);
  } catch (error) {
    showError('Failed to load profile');
  } finally {
    hideLoader();
  }
}

document.addEventListener('DOMContentLoaded', loadProfileData);
```

### Paginated List

```javascript
let currentPage = 1;

async function loadPosts(page = 1) {
  try {
    showLoader('posts-container');
    const posts = await apiClient.posts.getAll(page, 10);
    renderPosts(posts);
    currentPage = page;
  } catch (error) {
    showError('Failed to load posts');
  } finally {
    hideLoader();
  }
}

document.getElementById('next-page').addEventListener('click', () => {
  loadPosts(currentPage + 1);
});

document.addEventListener('DOMContentLoaded', () => loadPosts(1));
```

### Protected Route (Require Login)

```javascript
function requireAuth(callback) {
  if (!apiClient.isAuthenticated()) {
    window.location.href = 'login.html';
  } else {
    callback();
  }
}

// Use in pages that require login
requireAuth(async () => {
  const profile = await apiClient.profiles.getMe();
  // page logic here
});
```

## Response Format

Most API responses follow this format:

```javascript
{
  status: "success" | "error",
  message: "Optional message",
  data: { /* resource data */ }
}
```

Some paginated endpoints return:

```javascript
{
  data: [ /* array of items */ ],
  pagination: {
    currentPage: 1,
    totalPages: 5,
    totalItems: 42,
    itemsPerPage: 10
  }
}
```

## Default Values

```javascript
// Default page size
limit = 20

// Pagination behavior
page = 1 (first page)
limit = 20 (items per page)

// Loading timeout
timeout = 30000 (ms)
```

## Rate Limiting

- Chatbot API: 1,000 requests/day (Gemini free tier)
- Other endpoints: No limit during development with test database

## Best Practices

1. **Always use async/await** - Don't use `.then()` chains
2. **Handle errors** - Always wrap in try/catch
3. **Show loading states** - Call `showLoader()` before requests
4. **Check authentication** - Use `apiClient.isAuthenticated()` before protected operations
5. **Display user messages** - Use `showError()` and `showSuccess()` for user feedback
6. **Clean up** - Call `hideLoader()` in finally block
7. **Validate input** - Check form data before sending to API

## Examples

See [HTML-INTEGRATION.md](HTML-INTEGRATION.md) for complete working examples including:

- Profile edit forms
- Post creation and display
- Comment sections
- Like functionality
- Search and filtering
- Loading states and error handling
