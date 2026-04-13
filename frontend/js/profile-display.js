/**
 * User Profile Display Handler
 * Manages user profile information display across pages
 * Displays current user info in navbar, dashboard, and profile pages
 */

/**
 * Get current user from localStorage or API
 * @returns {Object|null} Current user object
 */
function getCurrentUserDisplay() {
  const userStr = localStorage.getItem('currentUser');
  if (!userStr) {
    const userFromAuth = localStorage.getItem('user');
    if (!userFromAuth) return null;
    try {
      return JSON.parse(userFromAuth);
    } catch (e) {
      console.error('Failed to parse user:', e);
      return null;
    }
  }
  try {
    return JSON.parse(userStr);
  } catch (e) {
    console.error('Failed to parse current user:', e);
    return null;
  }
}

/**
 * Display user profile card
 * Shows user's basic info: name, email, profile photo
 * @param {string} containerId - ID of container to display profile in
 * @param {boolean} showEmail - Whether to show email (default: true)
 * @param {boolean} showStats - Whether to show stats (default: false)
 */
function displayUserProfileCard(containerId, options = {}) {
  const {
    showEmail = true,
    showStats = false,
    showEditButton = false
  } = options;

  const container = document.getElementById(containerId);
  if (!container) return;

  const user = getCurrentUserDisplay();
  if (!user) {
    container.innerHTML = '<p class="text-muted">User profile not available</p>';
    return;
  }

  const profileHtml = `
    <div class="profile-card bg-white p-3 rounded" style="max-width: 400px;">
      <div style="display: flex; gap: 1.5rem; align-items: center;">
        <div style="flex: 0 0 auto;">
          <img 
            src="${user.profilePhoto || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2280%22 height=%2280%22%3E%3Crect fill=%22%23ccc%22 width=%2280%22 height=%2280%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-size=%2232%22 fill=%22%23666%22%3E${user.name?.charAt(0).toUpperCase() || 'U'}%3C/text%3E%3C/svg%3E'}" 
            alt="${user.name}"
            style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 2px solid #ddd;"
          />
        </div>
        <div style="flex: 1; min-width: 0;">
          <h3 style="margin: 0 0 0.25rem 0; color: #333;">${user.name || 'Unknown User'}</h3>
          ${showEmail ? `<p style="margin: 0 0 0.5rem 0; color: #666; font-size: 0.9rem; word-break: break-word;">${user.email || ''}</p>` : ''}
          ${user.major ? `<p style="margin: 0; color: #666; font-size: 0.85rem;"><strong>Major:</strong> ${user.major}</p>` : ''}
          ${showEditButton ? '<a href="create-profile.html" class="btn btn-sm btn-primary" style="margin-top: 0.5rem;"><i class="fas fa-edit"></i> Edit Profile</a>' : ''}
        </div>
      </div>
      ${showStats ? `
        <div style="border-top: 1px solid #eee; margin-top: 1rem; padding-top: 1rem; display: flex; gap: 1rem;">
          <div style="text-align: center; flex: 1;">
            <div style="font-size: 1.5rem; font-weight: bold; color: #3498db;">0</div>
            <div style="font-size: 0.85rem; color: #666;">Posts</div>
          </div>
          <div style="text-align: center; flex: 1;">
            <div style="font-size: 1.5rem; font-weight: bold; color: #3498db;">0</div>
            <div style="font-size: 0.85rem; color: #666;">Followers</div>
          </div>
          <div style="text-align: center; flex: 1;">
            <div style="font-size: 1.5rem; font-weight: bold; color: #3498db;">0</div>
            <div style="font-size: 0.85rem; color: #666;">Following</div>
          </div>
        </div>
      ` : ''}
    </div>
  `;

  container.innerHTML = profileHtml;
}

/**
 * Display user initials avatar
 * Used for small profile indicators
 * @param {string} containerId - ID of container for avatar
 * @param {Object} options - Configuration options
 */
function displayUserAvatar(containerId, options = {}) {
  const {
    size = '36px',
    showName = true,
    onlineStatus = null
  } = options;

  const container = document.getElementById(containerId);
  if (!container) return;

  const user = getCurrentUserDisplay();
  if (!user) return;

  const initials = user.name
    ?.split(' ')
    .slice(0, 2)
    .map(n => n.charAt(0).toUpperCase())
    .join('') || 'U';

  const onlineIndicator = onlineStatus !== null
    ? `<div style="position: absolute; bottom: 0; right: 0; width: 12px; height: 12px; background: ${onlineStatus ? '#2ecc71' : '#95a5a6'}; border: 2px solid white; border-radius: 50%;"></div>`
    : '';

  const html = `
    <div style="display: flex; align-items: center; gap: 0.5rem;">
      <div style="position: relative; width: ${size}; height: ${size}; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #3498db, #2980b9); color: white; border-radius: 50%; font-weight: bold; font-size: calc(${size}/2.5);">
        ${initials}
        ${onlineIndicator}
      </div>
      ${showName ? `<span style="font-size: 0.9rem; color: #333;">${user.name}</span>` : ''}
    </div>
  `;

  container.innerHTML = html;
}

/**
 * Display user menu dropdown
 * Shows user options: View Profile, Settings, Logout
 * @param {string} containerId - ID of container for menu
 */
function displayUserMenu(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const user = getCurrentUserDisplay();
  if (!user) return;

  const menuHtml = `
    <div class="dropdown-menu" style="position: absolute; top: 100%; right: 0; background: white; border: 1px solid #ddd; border-radius: 4px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); min-width: 150px; z-index: 1000;">
      <a href="profile.html" class="dropdown-item" style="display: block; padding: 10px 15px; color: #333; text-decoration: none; border-bottom: 1px solid #eee;">
        <i class="fas fa-user"></i> My Profile
      </a>
      <a href="create-profile.html" class="dropdown-item" style="display: block; padding: 10px 15px; color: #333; text-decoration: none; border-bottom: 1px solid #eee;">
        <i class="fas fa-edit"></i> Edit Profile
      </a>
      <a href="#" class="dropdown-item" onclick="logout(); return false;" style="display: block; padding: 10px 15px; color: #e74c3c; text-decoration: none;">
        <i class="fas fa-sign-out-alt"></i> Logout
      </a>
    </div>
  `;

  container.innerHTML = menuHtml;
}

/**
 * Update user display across all containers
 * Call this after user data is updated
 */
function updateUserDisplays() {
  // Update all profile cards
  const profileCards = document.querySelectorAll('[data-profile-card]');
  profileCards.forEach(el => {
    displayUserProfileCard(el.id, {
      showEmail: el.dataset.showEmail !== 'false',
      showStats: el.dataset.showStats === 'true',
      showEditButton: el.dataset.showEdit !== 'false'
    });
  });

  // Update all avatars
  const avatars = document.querySelectorAll('[data-user-avatar]');
  avatars.forEach(el => {
    displayUserAvatar(el.id, {
      size: el.dataset.avatarSize || '36px',
      showName: el.dataset.showName !== 'false'
    });
  });
}

/**
 * Format user data for display
 * @param {Object} user - User object
 * @returns {Object} Formatted user data
 */
function formatUserData(user) {
  return {
    name: user.name || 'Unknown User',
    email: user.email || 'No email provided',
    major: user.major || 'Not specified',
    profilePhoto: user.profilePhoto || null,
    initials: (user.name || 'U')
      ?.split(' ')
      .slice(0, 2)
      .map(n => n.charAt(0).toUpperCase())
      .join('') || 'U',
    role: user.role || 'student'
  };
}

/**
 * Initialize user profile displays on page load
 */
function initUserDisplays() {
  // Small delay to ensure user data is loaded
  setTimeout(() => {
    updateUserDisplays();
  }, 100);
}

// Auto-initialize when script loads (if user is authenticated)
if (isAuthenticated && typeof isAuthenticated === 'function') {
  if (isAuthenticated()) {
    document.addEventListener('DOMContentLoaded', initUserDisplays);
  }
}
