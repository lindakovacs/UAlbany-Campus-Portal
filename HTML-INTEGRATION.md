# HTML Integration Guide

This guide explains how to integrate HTML templates with the UAlbany Campus Portal API using the new `api-client.js` helper library.

## Table of Contents

1. [Quick Start](#quick-start)
2. [HTML Structure](#html-structure)
3. [Script Setup](#script-setup)
4. [Data Attributes](#data-attributes)
5. [Form Integration](#form-integration)
6. [Components & Patterns](#components--patterns)
7. [Best Practices](#best-practices)
8. [Error Handling](#error-handling)
9. [Loading States](#loading-states)
10. [Examples](#examples)

## Quick Start

### 1. Include Required Scripts

Every HTML page that uses the API needs these scripts in the `<head>`:

```html
<head>
  <!-- API Configuration -->
  <script src="frontend/config.js"></script>
</head>
```

And before the closing `</body>` tag, add the API client:

```html
<body>
  <!-- ... page content ... -->

  <!-- API Client Helper -->
  <script src="js/api-client.js"></script>

  <!-- Your custom scripts -->
  <script src="js/your-page-script.js"></script>
</body>
```

### 2. Basic API Call

```javascript
// Using the global apiClient instance
const user = await apiClient.auth.login({
  email: 'user@example.com',
  password: 'password123',
});
```

## HTML Structure

### Root HTML Setup

Every page must have this basic structure:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Page Title</title>

    <!-- Stylesheets -->
    <link rel="stylesheet" href="css/style.css" />
    <link rel="stylesheet" href="css/dark-mode.css" />
    <link rel="stylesheet" href="css/chat-bot.css" />

    <!-- API Configuration -->
    <script src="frontend/config.js"></script>
  </head>

  <body>
    <!-- Navbar -->
    <header id="navbar-container"></header>
    <script>
      fetch('modules/navbar.html')
        .then((r) => r.text())
        .then(
          (html) =>
            (document.getElementById('navbar-container').innerHTML = html),
        )
        .catch((e) => console.error('Error loading navbar:', e));
    </script>

    <!-- Main Content -->
    <main id="app">
      <!-- Your page content here -->
    </main>

    <!-- Footer -->
    <footer id="footer-container"></footer>
    <script>
      fetch('modules/footer.html')
        .then((r) => r.text())
        .then(
          (html) =>
            (document.getElementById('footer-container').innerHTML = html),
        )
        .catch((e) => console.error('Error loading footer:', e));
    </script>

    <!-- Essential Scripts (in order) -->
    <script src="js/api-client.js"></script>
    <script src="js/your-page-script.js"></script>

    <!-- Accessibility & Chat -->
    <script src="js/accessibility.js"></script>
    <script src="js/accessibility-ui.js"></script>
    <script src="js/chat-bot.js"></script>
  </body>
</html>
```

## Script Setup

### Script Load Order

Always load scripts in this order:

```html
<!-- 1. Config (if needed) -->
<script src="frontend/config.js"></script>

<!-- 2. API Client Helper -->
<script src="js/api-client.js"></script>

<!-- 3. Your Page Logic -->
<script src="js/your-page-script.js"></script>

<!-- 4. Accessibility (Optional) -->
<script src="js/accessibility.js"></script>

<!-- 5. UI Features (Optional) -->
<script src="js/accessibility-ui.js"></script>
<script src="js/chat-bot.js"></script>
```

### Global API Client

The `api-client.js` creates a global `apiClient` instance that's available in all scripts:

```javascript
// These are available globally:
apiClient; // Main client instance
showLoader(); // Show loading indicator
hideLoader(); // Hide loading indicator
showError(message); // Show error alert
showSuccess(message); // Show success alert
```

## Data Attributes

Use data attributes for semantic markup and API metadata:

### Form Attributes

```html
<form
  id="my-form"
  data-api-endpoint="/auth/login"
  data-on-success="dashboard.html"
  data-require-auth="true"
  aria-label="Login form"
>
  <!-- form fields -->
</form>
```

### Element Attributes

```html
<!-- Data loading state -->
<button data-loading-text="Loading..." id="submit-btn">Submit</button>

<!-- API endpoint reference -->
<div data-endpoint="/api/posts" data-method="GET" id="posts-container"></div>

<!-- Authentication requirement -->
<section data-protected="true">Protected content</section>
```

## Form Integration

### Simple Form with API

```html
<form id="login-form" data-api-endpoint="/auth/login">
  <div class="form-group">
    <input
      type="email"
      name="email"
      placeholder="Email"
      required
      aria-label="Email address"
    />
  </div>

  <div class="form-group">
    <input
      type="password"
      name="password"
      placeholder="Password"
      required
      aria-label="Password"
    />
  </div>

  <button type="submit" id="login-btn">Login</button>
  <div id="form-alerts"></div>
</form>

<script>
  document
    .getElementById('login-form')
    .addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData);

      try {
        const response = await apiClient.auth.login(data);
        showSuccess('Login successful!');
        // Redirect or update UI
      } catch (error) {
        showError(error.message);
      }
    });
</script>
```

### Form with Validation

```html
<form id="register-form">
  <div class="form-group" data-field="email">
    <input type="email" name="email" required />
    <span class="error-message" role="alert"></span>
  </div>

  <div class="form-group" data-field="password">
    <input type="password" name="password" minlength="6" required />
    <span class="error-message" role="alert"></span>
  </div>

  <button type="submit">Register</button>
</form>

<script>
  document
    .getElementById('register-form')
    .addEventListener('submit', async (e) => {
      e.preventDefault();

      // Clear previous errors
      document
        .querySelectorAll('.error-message')
        .forEach((el) => (el.textContent = ''));

      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData);

      try {
        const response = await apiClient.auth.register(data);
        showSuccess('Registration successful!');
      } catch (error) {
        // Display field-specific errors if available
        if (error.data?.field) {
          const fieldEl = document.querySelector(
            `[data-field="${error.data.field}"]`,
          );
          if (fieldEl) {
            fieldEl.querySelector('.error-message').textContent = error.message;
          }
        } else {
          showError(error.message);
        }
      }
    });
</script>
```

## Components & Patterns

### Profile Card

```html
<div
  class="profile-card"
  data-user-id="123"
  data-api-endpoint="/api/profiles/123"
>
  <img src="" alt="User profile" class="profile-avatar" />
  <h3 class="profile-name">Loading...</h3>
  <p class="profile-bio">Loading...</p>
  <button class="btn-view-profile">View Profile</button>
</div>

<script>
  async function loadProfileCard(userId) {
    const card = document.querySelector(`[data-user-id="${userId}"]`);
    try {
      const profile = await apiClient.profiles.get(userId);

      card.querySelector('.profile-name').textContent = profile.name;
      card.querySelector('.profile-bio').textContent = profile.bio || 'No bio';

      card.querySelector('.btn-view-profile').addEventListener('click', () => {
        window.location.href = `profile.html?id=${userId}`;
      });
    } catch (error) {
      card.querySelector('.profile-name').textContent = 'Error loading profile';
    }
  }

  // Load when page loads
  document.addEventListener('DOMContentLoaded', () => {
    const userId = new URLSearchParams(window.location.search).get('id');
    if (userId) loadProfileCard(userId);
  });
</script>
```

### Post List

```html
<section id="posts-container" data-api-endpoint="/api/posts">
  <h2>Posts</h2>
  <div id="posts-list" class="posts-grid">
    <!-- Posts loaded here -->
  </div>
  <div id="posts-pagination" class="pagination"></div>
</section>

<script>
  async function loadPosts(page = 1) {
    try {
      showLoader('posts-container');

      const response = await apiClient.posts.getAll(page, 10);
      const posts = response.data || response;

      const postsList = document.getElementById('posts-list');
      postsList.innerHTML = posts
        .map(
          (post) => `
      <article class="post-card" data-post-id="${post.id}">
        <h3>${post.title || 'Untitled'}</h3>
        <p>${post.content.substring(0, 150)}...</p>
        <small>By ${post.author.name || 'Unknown'}</small>
        <a href="post.html?id=${post.id}" class="btn btn-sm">Read More</a>
      </article>
    `,
        )
        .join('');

      hideLoader();
    } catch (error) {
      showError('Failed to load posts');
      console.error(error);
    }
  }

  // Load on page load
  document.addEventListener('DOMContentLoaded', loadPosts);
</script>
```

### Comment Section

```html
<section class="comments" data-post-id="123">
  <h3>Comments</h3>

  <!-- New comment form (if authenticated) -->
  <form id="comment-form" class="comment-form" data-post-id="123">
    <textarea
      name="content"
      placeholder="Add a comment..."
      maxlength="1000"
      required
    ></textarea>
    <button type="submit">Post Comment</button>
  </form>

  <!-- Comments list -->
  <div id="comments-list" class="comments-list">
    <!-- Comments loaded here -->
  </div>
</section>

<script>
  async function loadComments(postId, page = 1) {
    try {
      const response = await apiClient.comments.getForPost(postId, page);
      const comments = response.data || response;

      const commentsList = document.getElementById('comments-list');
      commentsList.innerHTML = comments
        .map(
          (comment) => `
      <div class="comment" data-comment-id="${comment.id}">
        <strong>${comment.user.name}</strong>
        <small>${new Date(comment.created_at).toLocaleDateString()}</small>
        <p>${comment.content}</p>
      </div>
    `,
        )
        .join('');
    } catch (error) {
      showError('Failed to load comments');
    }
  }

  // Handle comment submission
  document
    .getElementById('comment-form')
    ?.addEventListener('submit', async (e) => {
      e.preventDefault();

      const postId = e.target.dataset.postId;
      const content = e.target.content.value;

      try {
        await apiClient.comments.create(postId, { content });
        e.target.reset();
        await loadComments(postId);
        showSuccess('Comment posted!');
      } catch (error) {
        showError('Failed to post comment');
      }
    });

  // Load on page load
  document.addEventListener('DOMContentLoaded', () => {
    const postId = document.querySelector('[data-post-id]').dataset.postId;
    loadComments(postId);
  });
</script>
```

## Best Practices

### 1. Always Use Async/Await

```javascript
// ✅ Good
async function loadData() {
  try {
    const data = await apiClient.posts.getAll();
    // use data
  } catch (error) {
    showError(error.message);
  }
}

// ❌ Avoid
fetch('/api/posts')
  .then((r) => r.json())
  .then((data) => {
    // ...
  });
```

### 2. Show Loading States

```javascript
async function loadData() {
  showLoader('main');
  try {
    const data = await apiClient.posts.getAll();
    updateUI(data);
  } catch (error) {
    showError(error.message);
  } finally {
    hideLoader();
  }
}
```

### 3. Check Authentication

```javascript
// Check if user is logged in
if (!apiClient.isAuthenticated()) {
  window.location.href = 'login.html';
} else {
  loadUserData();
}
```

### 4. Redirect After Auth

```javascript
async function handleLogin() {
  try {
    const response = await apiClient.auth.login(credentials);
    showSuccess('Logged in successfully!');

    // Redirect to dashboard
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1500);
  } catch (error) {
    showError(error.message);
  }
}
```

### 5. Use Semantic HTML

```html
<!-- ✅ Good -->
<form id="profile-form" aria-label="Edit profile">
  <div class="form-group">
    <label for="bio">Biography</label>
    <textarea id="bio" name="bio" aria-describedby="bio-help"></textarea>
    <small id="bio-help">Max 500 characters</small>
  </div>
</form>

<!-- ❌ Avoid -->
<div>
  <input name="bio" placeholder="Bio" />
</div>
```

## Error Handling

### Error Types

The API client throws `APIError` with a `status` property:

```javascript
try {
  await apiClient.auth.login(credentials);
} catch (error) {
  // error.status === 401 -> Unauthorized
  // error.status === 403 -> Forbidden
  // error.status === 404 -> Not Found
  // error.status === 429 -> Rate Limited
  // error.status === 500 -> Server Error

  if (error.status === 401) {
    // Redirect to login
    window.location.href = 'login.html';
  } else if (error.status === 429) {
    showError('Too many requests. Please try again later.');
  } else {
    showError(error.getUniendlyMessage?.() || error.message);
  }
}
```

### User-Friendly Messages

The API error includes a `getUniendlyMessage()` method:

```javascript
try {
  await apiClient.posts.create(postData);
} catch (error) {
  // Use built-in friendly message
  showError(error.getUniendlyMessage?.() || error.message);
}
```

### Field-Specific Errors

```javascript
try {
  await apiClient.auth.register(userData);
} catch (error) {
  if (error.data?.field) {
    // Display error for specific field
    const field = document.querySelector(`[name="${error.data.field}"]`);
    field.classList.add('has-error');
    field.parentElement.querySelector('.error').textContent = error.message;
  }
}
```

## Loading States

### Show/Hide Loader

```html
<div id="main-content">
  <!-- Content here -->
</div>

<script>
  showLoader('main-content'); // Show spinner in element
  // Do async work
  hideLoader(); // Remove spinner
</script>
```

### Button Loading State

```html
<button id="submit-btn" data-loading-text="Saving...">Save</button>

<script>
  const btn = document.getElementById('submit-btn');
  const originalText = btn.textContent;

  btn.addEventListener('click', async () => {
    btn.disabled = true;
    btn.textContent = btn.dataset.loadingText;

    try {
      await apiClient.posts.create(data);
      showSuccess('Saved!');
    } catch (error) {
      showError(error.message);
    } finally {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  });
</script>
```

### Element Loading State

```html
<div id="posts-container" class="loading">
  <!-- Will show loading spinner from CSS -->
</div>

<script>
  document.getElementById('posts-container').classList.add('loading');
  const posts = await apiClient.posts.getAll();
  document.getElementById('posts-container').classList.remove('loading');
</script>
```

## Examples

### Example 1: Profile Edit Page

```html
<!DOCTYPE html>
<html>
  <head>
    <script src="frontend/config.js"></script>
  </head>
  <body>
    <main id="app">
      <h1>Edit Profile</h1>
      <form id="profile-form">
        <input type="hidden" name="id" id="user-id" />

        <div class="form-group">
          <input type="text" name="name" placeholder="Full Name" required />
        </div>

        <div class="form-group">
          <textarea name="bio" placeholder="Bio" maxlength="500"></textarea>
        </div>

        <button type="submit">Save Profile</button>
        <div id="alerts"></div>
      </form>
    </main>

    <script src="js/api-client.js"></script>
    <script>
      // Load user profile on page load
      async function initPage() {
        if (!apiClient.isAuthenticated()) {
          window.location.href = 'login.html';
          return;
        }

        try {
          showLoader('app');
          const profile = await apiClient.profiles.getMe();

          document.getElementById('user-id').value = profile.id;
          document.querySelector('[name="name"]').value = profile.name || '';
          document.querySelector('[name="bio"]').value = profile.bio || '';

          hideLoader();
        } catch (error) {
          showError('Failed to load profile');
          console.error(error);
        }
      }

      // Handle form submission
      document
        .getElementById('profile-form')
        .addEventListener('submit', async (e) => {
          e.preventDefault();

          const formData = new FormData(e.target);
          const data = Object.fromEntries(formData);
          delete data.id; // Remove ID from body

          try {
            await apiClient.profiles.update(data);
            showSuccess('Profile updated!');
          } catch (error) {
            showError(error.message);
          }
        });

      document.addEventListener('DOMContentLoaded', initPage);
    </script>

    <script src="js/accessibility.js"></script>
    <script src="js/chat-bot.js"></script>
  </body>
</html>
```

### Example 2: Posts Feed Page

```html
<!DOCTYPE html>
<html>
  <body>
    <main id="feed">
      <h1>Posts</h1>
      <button id="new-post-btn" class="btn btn-primary">New Post</button>
      <div id="posts-list"></div>
      <div id="pagination"></div>
    </main>

    <script src="js/api-client.js"></script>
    <script>
      let currentPage = 1;

      async function loadPosts(page = 1) {
        try {
          showLoader('feed');
          const response = await apiClient.posts.getAll(page, 10);
          renderPosts(response);
          currentPage = page;
        } catch (error) {
          showError('Failed to load posts');
        } finally {
          hideLoader();
        }
      }

      function renderPosts(response) {
        const posts = response.data || response;
        const listEl = document.getElementById('posts-list');

        listEl.innerHTML = posts
          .map(
            (post) => `
        <article class="post">
          <h2>${post.title}</h2>
          <p>${post.content}</p>
          <small>By ${post.author.name}</small>
          <button onclick="likePost(${post.id})">👍 Like</button>
        </article>
      `,
          )
          .join('');
      }

      async function likePost(postId) {
        try {
          await apiClient.likes.toggle(postId);
          loadPosts(currentPage); // Refresh
        } catch (error) {
          showError('Failed to like post');
        }
      }

      document.getElementById('new-post-btn')?.addEventListener('click', () => {
        window.location.href = 'post.html';
      });

      document.addEventListener('DOMContentLoaded', () => loadPosts(1));
    </script>
  </body>
</html>
```

## Summary

The HTML Integration Guide covers:

- **Structure**: Proper HTML template setup with required scripts
- **Scripts**: Load order and global API client instance
- **Forms**: How to connect HTML forms to API endpoints
- **Components**: Reusable patterns for common UI elements
- **Best Practices**: Do's and don'ts for API integration
- **Error Handling**: How to handle and display errors gracefully
- **Loading States**: Visual feedback during API calls
- **Examples**: Complete working examples for common pages

For more information, see:

- [API Client Documentation](../POSTMAN_TESTING.md)
- [Gemini AI Chatbot](../GEMINI_SETUP.md)
- [Project README](../README.md)
