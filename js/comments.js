/**
 * Comments Module
 * Handles adding, displaying, and managing comments on posts
 * Uses: Variables, Objects, Arrays, Functions, Events, Loops, localStorage, Dates
 */

// Storage keys and constants
const COMMENTS_STORAGE_KEY = 'postComments';
const CURRENT_USER = 'currentUser'; // In real app, would be from auth
const CURRENT_USER_AVATAR =
  'https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50?s=200';

/**
 * Get current timestamp in readable format (US time with AM/PM)
 * @returns {string} - Formatted date and time
 */
function getCurrentTimestamp() {
  const now = new Date();
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const date = now.getDate();
  const month = months[now.getMonth()];
  const year = now.getFullYear();

  // Convert to 12-hour format with AM/PM
  let hours = now.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 should be 12
  const minutes = String(now.getMinutes()).padStart(2, '0');

  return `Posted on ${month} ${date}, ${year} at ${hours}:${minutes} ${ampm}`;
}

/**
 * Initialize comments storage
 * @returns {object} - Stored comments object
 */
function initializeCommentsStorage() {
  const stored = localStorage.getItem(COMMENTS_STORAGE_KEY);
  return stored ? JSON.parse(stored) : {};
}

/**
 * Save comments to localStorage
 * @param {object} commentsData - Comments data to save
 */
function saveCommentsToStorage(commentsData) {
  localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(commentsData));
}

/**
 * Get unique post identifier for storing comments
 * Creates ID from current page or main post element
 * @returns {string} - Unique post identifier
 */
function getCurrentPostId() {
  // Try to get from main post element on page
  const mainPost = document.querySelector('body > main .post:first-child');
  if (mainPost) {
    const author = mainPost.querySelector('h4')?.textContent || 'unknown';
    const date = new Date().toLocaleDateString();
    return `post_${author.replace(/\s+/g, '_')}_${date.replace(/\//g, '_')}`.toLowerCase();
  }
  return 'post_default';
}

/**
 * Get all comments for current post
 * @returns {array} - Array of comment objects for this post
 */
function getPostComments() {
  const commentsData = initializeCommentsStorage();
  const postId = getCurrentPostId();
  return commentsData[postId] || [];
}

/**
 * Add a new comment to the post
 * @param {string} commentText - The comment text
 * @returns {object} - The created comment object
 */
function addComment(commentText) {
  if (!commentText.trim()) {
    alert('Comment cannot be empty');
    return null;
  }

  const commentsData = initializeCommentsStorage();
  const postId = getCurrentPostId();

  // Initialize post comments array if not exists
  if (!commentsData[postId]) {
    commentsData[postId] = [];
  }

  // Create comment object
  const comment = {
    id: `comment_${Date.now()}`,
    author: CURRENT_USER,
    avatar: CURRENT_USER_AVATAR,
    text: commentText,
    timestamp: getCurrentTimestamp(),
    createdAt: Date.now(),
  };

  // Add to array
  commentsData[postId].push(comment);

  // Sort comments by date (newest first)
  commentsData[postId].sort((a, b) => b.createdAt - a.createdAt);

  // Save to storage
  saveCommentsToStorage(commentsData);

  console.log('Comment added:', comment);
  return comment;
}

/**
 * Delete a comment by ID
 * @param {string} commentId - The ID of comment to delete
 */
function deleteComment(commentId) {
  const commentsData = initializeCommentsStorage();
  const postId = getCurrentPostId();

  if (commentsData[postId]) {
    commentsData[postId] = commentsData[postId].filter(
      (comment) => comment.id !== commentId,
    );
    saveCommentsToStorage(commentsData);
    console.log('Comment deleted:', commentId);
  }
}

/**
 * Create HTML element for a single comment
 * @param {object} comment - Comment object
 * @returns {HTMLElement} - Comment DOM element
 */
function createCommentElement(comment) {
  const commentDiv = document.createElement('div');
  commentDiv.className = 'post bg-white p-1 my-1 card';
  commentDiv.id = comment.id;
  commentDiv.setAttribute('role', 'article');

  const authorDiv = document.createElement('div');
  authorDiv.innerHTML = `
    <a href="profile.html">
      <img
        class="round-img"
        src="${comment.avatar}"
        alt="Avatar of ${comment.author}"
      />
      <h4>${comment.author}</h4>
    </a>
  `;

  const contentDiv = document.createElement('div');
  contentDiv.innerHTML = `
    <p class="my-1">${escapeHtml(comment.text)}</p>
    <p class="post-date">${comment.timestamp}</p>
  `;

  // Add delete button if this is the current user's comment
  if (comment.author === CURRENT_USER) {
    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'btn btn-danger';
    deleteButton.setAttribute(
      'aria-label',
      `Delete comment by ${comment.author}`,
    );
    deleteButton.setAttribute('title', 'Delete this comment');
    deleteButton.innerHTML = '<i class="fas fa-times"></i>';

    deleteButton.addEventListener('click', function (e) {
      e.preventDefault();
      if (confirm('Are you sure you want to delete this comment?')) {
        // Announce deletion
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'polite');
        announcement.classList.add('sr-only');
        announcement.textContent = 'Comment deleted successfully';
        document.body.appendChild(announcement);

        // Remove with animation
        commentDiv.style.opacity = '0';
        commentDiv.style.transition = 'opacity 0.3s ease';
        setTimeout(() => {
          deleteComment(comment.id);
          commentDiv.remove();
          updateCommentCount();
        }, 300);
      }
    });

    // Keyboard support
    deleteButton.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        event.currentTarget.click();
      }
    });

    contentDiv.appendChild(deleteButton);
  }

  commentDiv.appendChild(authorDiv);
  commentDiv.appendChild(contentDiv);

  return commentDiv;
}

/**
 * Render all comments in the comments section
 */
function renderComments() {
  const commentsContainer = document.querySelector('.comments');
  if (!commentsContainer) return;

  // Get all comments
  const comments = getPostComments();

  // Remove existing empty message if present
  const emptyMessage = commentsContainer.querySelector('.empty-comments');
  if (emptyMessage) {
    emptyMessage.remove();
  }

  // Clear existing comments (keep structure)
  const existingComments = commentsContainer.querySelectorAll('.post');
  existingComments.forEach((comment) => comment.remove());

  // Render comments using a loop
  if (comments.length === 0) {
    const emptyMsg = document.createElement('div');
    emptyMsg.className = 'empty-comments';
    emptyMsg.setAttribute('role', 'status');
    emptyMsg.innerHTML =
      '<p style="text-align: center; color: #999; padding: 2rem;">No comments yet. Be the first to comment!</p>';
    commentsContainer.appendChild(emptyMsg);
  } else {
    // Loop through all comments and render them
    comments.forEach((comment) => {
      const commentElement = createCommentElement(comment);
      commentsContainer.appendChild(commentElement);
    });
  }

  // Announce update to screen readers
  const liveRegion = document.querySelector('[aria-live="polite"]');
  if (liveRegion && comments.length > 0) {
    liveRegion.textContent = `${comments.length} comments displayed`;
  }
}

/**
 * Update comment count in the main post
 */
function updateCommentCount() {
  const comments = getPostComments();
  const commentLinks = document.querySelectorAll(
    '.discussion-link, .comment-count',
  );

  commentLinks.forEach((link) => {
    if (link.textContent) {
      link.textContent = comments.length;
    }
  });
}

/**
 * Escape HTML to prevent XSS attacks
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Initialize comment form
 */
function initializeCommentForm() {
  const form = document.querySelector('.post-form .form');
  if (!form) return;

  // Find textarea and submit button
  const textarea = form.querySelector('textarea');
  const submitButton = form.querySelector('input[type="submit"]');

  if (!textarea || !submitButton) return;

  // Add accessibility attributes
  textarea.setAttribute('aria-label', 'Write a comment');
  textarea.setAttribute('aria-required', 'true');
  submitButton.setAttribute('aria-label', 'Post comment');

  // Add live region for feedback
  if (!document.querySelector('[aria-live="polite"]')) {
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.classList.add('sr-only');
    document.body.appendChild(liveRegion);
  }

  // Handle form submission
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Validate input
    if (!textarea.value.trim()) {
      alert('Please enter a comment before submitting');
      textarea.focus();
      return;
    }

    // Add comment
    addComment(textarea.value);

    // Clear form
    textarea.value = '';

    // Re-render comments
    renderComments();
    updateCommentCount();

    // Announce to screen reader
    const liveRegion = document.querySelector('[aria-live="polite"]');
    if (liveRegion) {
      liveRegion.textContent = 'Your comment has been added successfully';
    }

    // Visual feedback
    submitButton.style.opacity = '0.5';
    submitButton.style.transform = 'scale(0.98)';
    setTimeout(() => {
      submitButton.style.opacity = '1';
      submitButton.style.transform = 'scale(1)';
    }, 200);

    console.log('Comment submitted and rendered');
  });

  // Add character counter for accessibility
  const charCounter = document.createElement('div');
  charCounter.className = 'char-counter';
  charCounter.setAttribute('aria-live', 'polite');
  charCounter.style.fontSize = '0.85rem';
  charCounter.style.color = '#666';
  charCounter.style.marginTop = '0.5rem';
  charCounter.textContent = `Characters: 0`;
  form.appendChild(charCounter);

  textarea.addEventListener('input', function () {
    charCounter.textContent = `Characters: ${this.value.length}`;
  });
}

/**
 * Initialize comments functionality on page load
 */
document.addEventListener('DOMContentLoaded', function () {
  // Check if we're on the post detail page
  if (
    document.querySelector('.comments') &&
    document.querySelector('.post-form')
  ) {
    // Initialize form
    initializeCommentForm();

    // Render existing comments
    renderComments();

    // Update comment count
    updateCommentCount();

    console.log('Comments module initialized');
  }
});
