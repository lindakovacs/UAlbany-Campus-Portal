/**
 * Post Interactions Module
 * Handles like/unlike, and delete functionality for posts
 * Uses: Variables, Objects, Arrays, Functions, Events, Loops, localStorage
 */

// Storage key for user's likes
const LIKES_STORAGE_KEY = 'userLikes';
const CURRENT_USER_ID = 'currentUser'; // In real app, would be from auth system

/**
 * Initialize likes data structure from localStorage
 * @returns {object} - User's likes data
 */
function initializeLikesData() {
  const stored = localStorage.getItem(LIKES_STORAGE_KEY);
  return stored ? JSON.parse(stored) : {};
}

/**
 * Save likes data to localStorage
 * @param {object} likesData - The likes data to save
 */
function saveLikesData(likesData) {
  localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(likesData));
}

/**
 * Generate unique ID for a post element
 * Creates a hash from post author and date
 * @param {HTMLElement} postElement - The post DOM element
 * @returns {string} - Unique post identifier
 */
function getPostId(postElement) {
  const author = postElement.querySelector('h4')?.textContent || 'unknown';
  const date =
    postElement.querySelector('.post-date')?.textContent || 'no-date';
  return `post_${author.replace(/\s+/g, '_')}_${date.replace(/\s+/g, '_')}`.toLowerCase();
}

/**
 * Get like count from post button
 * @param {HTMLElement} likeButton - The like button element
 * @returns {number} - Current like count
 */
function getLikeCount(likeButton) {
  const countSpan = likeButton.querySelector('span');
  return countSpan ? parseInt(countSpan.textContent) : 0;
}

/**
 * Update like count display on button
 * @param {HTMLElement} likeButton - The like button element
 * @param {number} count - New count value
 */
function updateLikeCount(likeButton, count) {
  let countSpan = likeButton.querySelector('span');
  if (!countSpan) {
    countSpan = document.createElement('span');
    countSpan.textContent = count;
    likeButton.appendChild(countSpan);
  } else {
    countSpan.textContent = count;
  }

  // Announce to screen readers
  likeButton.setAttribute('aria-label', `${count} likes`);
}

/**
 * Toggle like/unlike on a post
 * @param {Event} event - Click event from like button
 */
function toggleLike(event) {
  event.preventDefault();

  const likeButton = event.currentTarget;
  const postElement = likeButton.closest('.post');

  if (!postElement) return;

  const postId = getPostId(postElement);
  const likesData = initializeLikesData();

  // Initialize post likes if not exists
  if (!likesData[postId]) {
    likesData[postId] = {
      count: getLikeCount(likeButton),
      likedBy: [],
    };
  }

  // Check if current user already liked this
  const isLiked = likesData[postId].likedBy.includes(CURRENT_USER_ID);

  if (isLiked) {
    // Unlike: remove from likedBy array and decrement count
    likesData[postId].likedBy = likesData[postId].likedBy.filter(
      (userId) => userId !== CURRENT_USER_ID,
    );
    likesData[postId].count = Math.max(0, likesData[postId].count - 1);
    likeButton.classList.remove('liked');
    likeButton.setAttribute('aria-pressed', 'false');
  } else {
    // Like: add to likedBy array and increment count
    likesData[postId].likedBy.push(CURRENT_USER_ID);
    likesData[postId].count += 1;
    likeButton.classList.add('liked');
    likeButton.setAttribute('aria-pressed', 'true');
  }

  // Update UI
  updateLikeCount(likeButton, likesData[postId].count);

  // Persist changes
  saveLikesData(likesData);

  // Log for debugging
  console.log(`Post ${postId}:`, likesData[postId]);
}

/**
 * Load and restore like state for all posts on page load
 */
function restoreLikesState() {
  const likesData = initializeLikesData();
  const posts = document.querySelectorAll('.post');

  // Loop through all posts and restore their like state
  posts.forEach((postElement) => {
    const postId = getPostId(postElement);

    // Find the like button (thumbs up button, first .btn-light)
    const likeButton = postElement
      .querySelector('.fa-thumbs-up')
      ?.closest('button');

    if (likeButton && likesData[postId]) {
      const isLiked = likesData[postId].likedBy.includes(CURRENT_USER_ID);

      if (isLiked) {
        likeButton.classList.add('liked');
        likeButton.setAttribute('aria-pressed', 'true');
      } else {
        likeButton.classList.remove('liked');
        likeButton.setAttribute('aria-pressed', 'false');
      }

      // Update count display
      updateLikeCount(likeButton, likesData[postId].count);
    }
  });
}

/**
 * Initialize all like buttons with event listeners
 */
function initializeLikeButtons() {
  // Get all like buttons (thumbs up icons)
  const likeButtons = document.querySelectorAll('.fa-thumbs-up');

  likeButtons.forEach((icon) => {
    const button = icon.closest('button');

    if (button) {
      // Set initial accessibility attributes
      button.setAttribute('role', 'button');
      button.setAttribute('aria-pressed', 'false');
      button.setAttribute('title', 'Like this post');
      button.setAttribute('aria-label', 'Like');

      // Make button keyboard accessible
      button.setAttribute('tabindex', '0');

      // Add click event listener
      button.addEventListener('click', toggleLike);

      // Add keyboard support (Enter and Space)
      button.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          toggleLike(event);
        }
      });
    }
  });
}

/**
 * Delete post functionality with confirmation
 */
function initializeDeleteButtons() {
  const deleteButtons = document.querySelectorAll('.fa-times');

  deleteButtons.forEach((icon) => {
    const button = icon.closest('button');

    if (button) {
      button.setAttribute('role', 'button');
      button.setAttribute('title', 'Delete this post');
      button.setAttribute('aria-label', 'Delete post');
      button.setAttribute('tabindex', '0');

      button.addEventListener('click', function (event) {
        event.preventDefault();

        // Confirmation dialog for accessibility
        const postElement = button.closest('.post');
        const authorName =
          postElement?.querySelector('h4')?.textContent || 'this post';

        if (
          confirm(
            `Are you sure you want to delete the post from ${authorName}?`,
          )
        ) {
          // Announce deletion to screen readers
          const announcement = document.createElement('div');
          announcement.setAttribute('role', 'status');
          announcement.setAttribute('aria-live', 'polite');
          announcement.classList.add('sr-only');
          announcement.textContent = 'Post deleted successfully';
          document.body.appendChild(announcement);

          // Remove post from DOM with animation
          if (postElement) {
            postElement.style.opacity = '0';
            postElement.style.transition = 'opacity 0.3s ease';

            setTimeout(() => {
              postElement.remove();
              console.log(`Post from ${authorName} deleted`);
            }, 300);
          }
        }
      });

      // Keyboard support
      button.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          event.currentTarget.click();
        }
      });
    }
  });
}

/**
 * Initialize post display functionality on page load
 * This runs when DOM is ready
 */
document.addEventListener('DOMContentLoaded', function () {
  // Check if we're on the posts page
  if (document.querySelector('.posts')) {
    // Initialize like functionality
    initializeLikeButtons();
    restoreLikesState();

    // Initialize delete buttons
    initializeDeleteButtons();

    console.log('Post interactions initialized');
  }
});
