/**
 * Post Detail Module
 * Loads individual post, displays comments, and handles comment interactions
 * Uses: API client, async/await, DOM manipulation, URL parameters
 */

let currentPostId = null;
let currentUserId = null;

/**
 * Get post ID from URL parameters
 * @returns {string|null} - Post ID or null
 */
function getPostIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

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
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (e) {
    return dateStr;
  }
}

/**
 * Load and display post
 */
async function loadPost() {
  currentPostId = getPostIdFromUrl();

  if (!currentPostId) {
    showErrorMessage('Post ID not found');
    return;
  }

  try {
    showLoadingState('Loading post...');

    const response = await apiClient.posts.get(currentPostId);
    const post = response.data || response;

    if (!post || !post.id) {
      showErrorMessage('Post not found');
      return;
    }

    displayPost(post);
    await loadComments();
    hideLoadingState();
  } catch (error) {
    console.error('Error loading post:', error);
    showErrorMessage('Error loading post. Try again.');
  }
}

/**
 * Display post content
 * @param {object} post - Post object
 */
function displayPost(post) {
  const mainPost = document.querySelector('main > section > .post');
  if (!mainPost) return;

  // Use profile photo from API, or fall back to Gravatar
  const photoUrl =
    post.profile_photo ||
    `https://www.gravatar.com/avatar/${post.email}?s=200&d=identicon`;

  mainPost.setAttribute('data-post-id', post.id);
  mainPost.innerHTML = `
    <div>
      <a href="profile.html?user=${post.user_id}">
        <img
          class="round-img"
          src="${photoUrl}"
          alt="Avatar of ${post.name}"
        />
        <h4>${post.name || 'Anonymous'}</h4>
      </a>
    </div>
    <div>
      <p class="my-1">${escapeHtml(post.content || post.text || '')}</p>
      <p class="post-date">Posted on ${formatPostDate(post.created_at)}</p>
    </div>
  `;

  // Add delete button if current user is author
  if (isCurrentUserAuthor(post)) {
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'btn btn-danger';
    deleteBtn.setAttribute('aria-label', 'Delete this post');
    deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
    deleteBtn.addEventListener('click', () => deletePost(post.id));

    const div = document.createElement('div');
    div.appendChild(deleteBtn);
    mainPost.appendChild(div);
  }
}

/**
 * Check if current user is the post author
 * @param {object} post - Post object
 * @returns {boolean} - True if current user authored the post
 */
function isCurrentUserAuthor(post) {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id || localStorage.getItem('userId');
    return parseInt(userId) === parseInt(post.user_id);
  } catch (e) {
    return false;
  }
}

/**
 * Load comments for the post
 */
async function loadComments() {
  if (!currentPostId) return;

  try {
    const response = await apiClient.comments.getForPost(currentPostId, 1, 100);
    const comments = Array.isArray(response) ? response : response.data || [];

    displayComments(comments);
  } catch (error) {
    console.error('Error loading comments:', error);
    const commentsContainer = document.querySelector('.comments');
    if (commentsContainer) {
      commentsContainer.innerHTML =
        '<p class="text-danger">Error loading comments</p>';
    }
  }
}

/**
 * Display comments
 * @param {array} comments - Array of comment objects
 */
function displayComments(comments) {
  const commentsContainer = document.querySelector('.comments');
  if (!commentsContainer) return;

  // Clear existing comments (keep the initial structure)
  const existingComments = commentsContainer.querySelectorAll('.post');
  existingComments.forEach((c) => c.remove());

  if (!comments || comments.length === 0) {
    commentsContainer.innerHTML =
      '<p class="text-muted text-center">No comments yet. Be the first!</p>';
    return;
  }

  comments.forEach((comment) => {
    const commentDiv = document.createElement('div');
    commentDiv.className = 'post bg-white p-1 my-1 card';
    commentDiv.setAttribute('data-comment-id', comment.id);
    commentDiv.setAttribute('role', 'article');

    // Use profile photo from API, or fall back to Gravatar
    const photoUrl =
      comment.profile_photo ||
      `https://www.gravatar.com/avatar/${comment.email}?s=200&d=identicon`;

    let commentHTML = `
      <div>
        <a href="profile.html?user=${comment.user_id}">
          <img
            class="round-img"
            src="${photoUrl}"
            alt="Avatar of ${comment.name}"
          />
          <h4>${comment.name || 'Anonymous'}</h4>
        </a>
      </div>
      <div>
        <p class="my-1">${escapeHtml(comment.content || comment.text || '')}</p>
        <p class="post-date">${formatPostDate(comment.created_at)}</p>
    `;

    // Add delete button if current user is comment author
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user.id || localStorage.getItem('userId');

      if (parseInt(userId) === parseInt(comment.user_id)) {
        commentHTML += `
          <button type="button" class="btn btn-danger delete-comment" data-comment-id="${comment.id}" aria-label="Delete comment">
            <i class="fas fa-times"></i>
          </button>
        `;
      }
    } catch (e) {
      // Ignore error
    }

    commentHTML += '</div>';
    commentDiv.innerHTML = commentHTML;

    // Attach delete event
    const deleteBtn = commentDiv.querySelector('.delete-comment');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => deleteComment(comment.id));
    }

    commentsContainer.appendChild(commentDiv);
  });
}

/**
 * Handle comment form submission
 */
function setupCommentForm() {
  const form = document.querySelector('.post-form form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const textarea = form.querySelector('textarea');
    const commentText = textarea.value.trim();

    if (!commentText) {
      alert('Comment cannot be empty');
      return;
    }

    try {
      // Check authentication
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.id) {
        alert('You must be logged in to comment');
        return;
      }

      // Create comment via API
      const response = await apiClient.comments.create(currentPostId, {
        content: commentText,
      });

      if (response && response.data && response.data.id) {
        // Clear form
        textarea.value = '';

        // Show success message
        alert('Comment added successfully!');

        // Reload comments
        await loadComments();
      }
    } catch (error) {
      console.error('Error creating comment:', error);
      alert('Error adding comment. Try again.');
    }
  });
}

/**
 * Delete a comment
 * @param {number} commentId - Comment ID to delete
 */
async function deleteComment(commentId) {
  if (!confirm('Delete this comment?')) return;

  try {
    await apiClient.comments.delete(commentId);

    // Remove comment element
    const commentElement = document.querySelector(
      `[data-comment-id="${commentId}"]`,
    );
    if (commentElement) {
      commentElement.remove();
    }

    alert('Comment deleted');
  } catch (error) {
    console.error('Error deleting comment:', error);
    alert('Error deleting comment');
  }
}

/**
 * Delete the main post
 * @param {number} postId - Post ID to delete
 */
async function deletePost(postId) {
  if (!confirm('Delete this post?')) return;

  try {
    await apiClient.posts.delete(postId);
    alert('Post deleted. Redirecting...');
    window.location.href = 'posts.html';
  } catch (error) {
    console.error('Error deleting post:', error);
    alert('Error deleting post');
  }
}

/**
 * Show loading state
 * @param {string} message - Loading message
 */
function showLoadingState(message = 'Loading...') {
  const loading = document.getElementById('page-loading');
  if (loading) {
    loading.style.display = 'block';
    const msgEl = loading.querySelector('p');
    if (msgEl) msgEl.textContent = message;
  }
}

/**
 * Hide loading state
 */
function hideLoadingState() {
  const loading = document.getElementById('page-loading');
  if (loading) {
    loading.style.display = 'none';
  }
}

/**
 * Show error message
 * @param {string} message - Error message
 */
function showErrorMessage(message) {
  const main = document.querySelector('main');
  if (main) {
    main.innerHTML = `<section class="container"><p class="text-danger text-center">${escapeHtml(message)}</p></section>`;
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
 * Initialize post detail page
 */
document.addEventListener('DOMContentLoaded', async () => {
  // Setup comment form
  setupCommentForm();

  // Load post and comments (no auth required for viewing)
  await loadPost();
});
