/**
 * Posts Feed Module
 * Loads and displays posts from API with pagination, likes, and comments
 * Uses: API client, async/await, DOM manipulation, Events
 */

let currentPage = 1;
const postsPerPage = 10;
let isLoadingPosts = false;

/**
 * Format date to readable format
 * @param {string} dateStr - ISO date string
 * @returns {string} - Formatted date
 */
function formatPostDate(dateStr) {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch (e) {
    return dateStr;
  }
}

/**
 * Create HTML for a single post
 * @param {object} post - Post object from API
 * @returns {HTMLElement} - Post DOM element
 */
function createPostElement(post) {
  const postDiv = document.createElement('div');
  postDiv.className = 'post bg-white p-1 my-1 card';
  postDiv.setAttribute('data-post-id', post.id);
  postDiv.setAttribute('role', 'article');

  // Use profile photo from API, or fall back to Gravatar
  const photoUrl =
    post.profile_photo ||
    `https://www.gravatar.com/avatar/${post.email}?s=200&d=identicon`;

  const authorDiv = document.createElement('div');
  authorDiv.innerHTML = `
    <a href="profile.html?user=${post.user_id}">
      <img
        class="round-img"
        src="${photoUrl}"
        alt="Avatar of ${post.name || 'User'}"
      />
      <h4>${post.name || 'Anonymous'}</h4>
    </a>
  `;

  const contentDiv = document.createElement('div');
  contentDiv.innerHTML = `
    <p class="my-1">${escapeHtml(post.content || post.text || '')}</p>
    <p class="post-date">Posted on ${formatPostDate(post.created_at)}</p>
  `;

  const actionsDiv = document.createElement('div');
  actionsDiv.className = 'post-actions';
  actionsDiv.innerHTML = `
    <button type="button" class="btn btn-light like-btn" data-post-id="${post.id}" aria-label="Like this post">
      <i class="fas fa-thumbs-up"></i>
      <span class="like-count">${post.like_count || 0}</span>
    </button>
    <a href="post.html?id=${post.id}" class="btn btn-primary discussion-btn" data-post-id="${post.id}" aria-label="View discussion">
      Discussion <span class="comment-count">${post.comment_count || 0}</span>
    </a>
  `;

  // Add delete button if current user is the author
  if (isCurrentUserAuthor(post)) {
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'btn btn-danger';
    deleteBtn.setAttribute('aria-label', 'Delete this post');
    deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
    deleteBtn.addEventListener('click', () => deletePost(post.id));
    actionsDiv.appendChild(deleteBtn);
  }

  postDiv.appendChild(authorDiv);
  postDiv.appendChild(contentDiv);
  postDiv.appendChild(actionsDiv);

  return postDiv;
}

/**
 * Check if current user is the post author
 * @param {object} post - Post object
 * @returns {boolean} - True if current user authored the post
 */
function isCurrentUserAuthor(post) {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.id === post.user_id;
  } catch (e) {
    return false;
  }
}

/**
 * Load posts from API and display
 * @param {number} page - Page number to load
 */
async function loadPosts(page = 1) {
  if (isLoadingPosts) return;

  isLoadingPosts = true;
  const postsContainer = document.querySelector('.posts');

  try {
    // Hide page loading overlay
    const pageLoading = document.getElementById('page-loading');
    if (pageLoading) {
      pageLoading.classList.remove('active');
    }

    // Show loading state
    if (page === 1) {
      postsContainer.innerHTML =
        '<p class="text-center text-muted">Loading posts...</p>';
    }

    // Fetch posts from API
    const response = await apiClient.posts.getAll(page, postsPerPage);
    const posts = Array.isArray(response) ? response : response.data || [];

    // Clear container if first page
    if (page === 1) {
      postsContainer.innerHTML = '';
    }

    if (!posts || posts.length === 0) {
      if (page === 1) {
        postsContainer.innerHTML =
          '<p class="text-center text-muted">No posts yet. Create one!</p>';
      }
      return;
    }

    // Create and append post elements
    posts.forEach((post) => {
      const postElement = createPostElement(post);
      postsContainer.appendChild(postElement);

      // Attach event listeners
      const likeBtn = postElement.querySelector('.like-btn');
      if (likeBtn) {
        likeBtn.addEventListener('click', () =>
          toggleLikePost(post.id, likeBtn),
        );
      }
    });

    currentPage = page;
  } catch (error) {
    console.error('Error loading posts:', error);
    postsContainer.innerHTML = `<p class="text-center text-danger">Error loading posts. Try again.</p>`;
    // Hide loading overlay in case of error
    const pageLoading = document.getElementById('page-loading');
    if (pageLoading) {
      pageLoading.classList.remove('active');
    }
  } finally {
    isLoadingPosts = false;
  }
}

/**
 * Toggle like on a post
 * @param {number} postId - Post ID
 * @param {HTMLElement} likeBtn - Like button element
 */
async function toggleLikePost(postId, likeBtn) {
  try {
    const response = await apiClient.likes.toggle(postId);

    if (response && response.liked !== undefined) {
      const likeCount = likeBtn.querySelector('.like-count');
      let count = parseInt(likeCount.textContent) || 0;

      // Update count based on like status
      if (response.liked) {
        count++;
        likeBtn.classList.add('active');
      } else {
        count = Math.max(0, count - 1);
        likeBtn.classList.remove('active');
      }

      likeCount.textContent = count;
    }
  } catch (error) {
    console.error('Error toggling like:', error);
  }
}

/**
 * Handle post creation form submission
 */
async function handlePostSubmit() {
  const form = document.querySelector('.post-form form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const textarea = form.querySelector('textarea');
    const content = textarea.value.trim();

    if (!content) {
      alert('Post content cannot be empty');
      return;
    }

    try {
      // Check authentication
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const token = localStorage.getItem('token');

      console.log('Current logged-in user:', user);
      console.log('Token available:', !!token);

      if (!user.id) {
        alert('You must be logged in to create a post');
        return;
      }

      // Create post via API
      const response = await apiClient.posts.create({ content: content });

      // Log response for debugging
      console.log('Post creation response:', response);

      if (response && response.data && response.data.id) {
        // Clear form
        textarea.value = '';

        // Show success message
        alert('Post created successfully!');

        // Reload posts list
        await loadPosts(1);
      } else if (response && response.status === 'success') {
        // Alternative check in case data structure is different
        textarea.value = '';
        alert('Post created successfully!');
        await loadPosts(1);
      } else {
        console.error('Unexpected response structure:', response);
        alert('Unexpected response from server. Try again.');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Error creating post. Try again. ' + (error.message || ''));
    }
  });
}

/**
 * Delete a post
 * @param {number} postId - Post ID to delete
 */
async function deletePost(postId) {
  if (!confirm('Are you sure you want to delete this post?')) return;

  try {
    await apiClient.posts.delete(postId);

    // Remove post element from DOM
    const postElement = document.querySelector(`[data-post-id="${postId}"]`);
    if (postElement) {
      postElement.remove();
    }

    alert('Post deleted successfully');
  } catch (error) {
    console.error('Error deleting post:', error);
    alert('Error deleting post. Try again.');
  }
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
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

/**
 * Initialize posts feed on page load
 */
document.addEventListener('DOMContentLoaded', async () => {
  // Require authentication
  if (typeof applyRouteProtection === 'function') {
    applyRouteProtection(
      () => {
        // User is authenticated
        handlePostSubmit();
        loadPosts(1);
      },
      {
        redirectOnFail: true,
        redirectUrl: 'login.html',
      },
    );
  } else {
    // Fallback if route protection not available
    handlePostSubmit();
    loadPosts(1);
  }
});
