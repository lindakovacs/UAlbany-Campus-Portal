/**
 * Authentication Guard Utility
 * Provides route protection and authentication state management
 * Usage: Call requireAuth() in DOMContentLoaded to protect a page
 */

/**
 * Check if user is currently authenticated (has valid token)
 * @returns {boolean} True if token exists in localStorage
 */
function isAuthenticated() {
  return !!localStorage.getItem('token');
}

/**
 * Get the current authenticated user from localStorage
 * @returns {Object|null} User object if authenticated, null otherwise
 */
function getCurrentUser() {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch (e) {
    console.error('Failed to parse user from localStorage:', e);
    return null;
  }
}

/**
 * Require authentication before running callback
 * If not authenticated, redirects to login page
 * @param {Function} callback - Function to execute if authenticated
 * @param {Object} options - Configuration options
 * @param {boolean} options.showLoading - Show loading indicator while checking (default: true)
 * @param {string} options.loginUrl - URL to redirect to if not authenticated (default: 'login.html')
 */
function requireAuth(callback, options = {}) {
  const { showLoading = true, loginUrl = 'login.html' } = options;

  // Show loading state if requested
  if (showLoading) {
    showLoadingState();
  }

  // Check if authenticated
  if (!isAuthenticated()) {
    // Not authenticated, redirect to login
    redirectToLogin(loginUrl);
    return;
  }

  // Authenticated, execute callback
  try {
    if (showLoading) {
      hideLoadingState();
    }
    callback();
  } catch (error) {
    console.error('Error in requireAuth callback:', error);
    showErrorMessage('An error occurred. Please try again.');
  }
}

/**
 * Require specific user role/permission
 * @param {string} requiredRole - Role required to access page
 * @param {Function} callback - Function to execute if authorized
 */
function requireRole(requiredRole, callback) {
  if (!isAuthenticated()) {
    redirectToLogin('login.html');
    return;
  }

  const user = getCurrentUser();
  if (!user || user.role !== requiredRole) {
    showErrorMessage('You do not have permission to access this page.');
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 2000);
    return;
  }

  callback();
}

/**
 * Redirect to login page
 * @param {string} loginUrl - URL to redirect to
 */
function redirectToLogin(loginUrl = 'login.html') {
  // Store current page for redirect after login (optional feature for future)
  const currentPage = window.location.pathname;
  sessionStorage.setItem('redirectAfterLogin', currentPage);

  window.location.href = loginUrl;
}

/**
 * Show loading state during auth check
 */
function showLoadingState() {
  const loadingDiv = document.createElement('div');
  loadingDiv.id = 'auth-loading-state';
  loadingDiv.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  `;
  loadingDiv.innerHTML = `
    <div style="text-align: center;">
      <div style="
        width: 40px;
        height: 40px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #3498db;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 20px;
      "></div>
      <p style="color: #333; margin: 0; font-size: 16px;">Loading...</p>
    </div>
  `;

  // Add keyframe animation
  if (!document.getElementById('auth-loading-animation')) {
    const style = document.createElement('style');
    style.id = 'auth-loading-animation';
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(loadingDiv);
}

/**
 * Hide loading state
 */
function hideLoadingState() {
  const loadingDiv = document.getElementById('auth-loading-state');
  if (loadingDiv) {
    loadingDiv.remove();
  }
}

/**
 * Show error message to user
 * @param {string} message - Error message to display
 */
function showErrorMessage(message) {
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #e74c3c;
    color: white;
    padding: 15px 20px;
    border-radius: 4px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    z-index: 10000;
    max-width: 300px;
  `;
  errorDiv.textContent = message;
  document.body.appendChild(errorDiv);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    errorDiv.remove();
  }, 5000);
}

/**
 * Logout current user
 * Clears localStorage and redirects to login
 */
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('userId');
  window.location.href = 'login.html';
}

/**
 * Get token from localStorage
 * @returns {string|null} JWT token or null if not authenticated
 */
function getToken() {
  return localStorage.getItem('token');
}

/**
 * Check if token is expired (basic check)
 * @returns {boolean} True if token is expired or invalid
 */
function isTokenExpired() {
  const token = getToken();
  if (!token) return true;

  try {
    // Decode JWT payload (without verifying signature)
    const payload = JSON.parse(atob(token.split('.')[1]));

    // Check if exp claim exists and is expired
    if (payload.exp) {
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      return Date.now() >= expirationTime;
    }

    return false;
  } catch (e) {
    console.error('Failed to parse token:', e);
    return true; // Treat invalid token as expired
  }
}

/**
 * Refresh authentication check
 * Call this if you suspect the token might have expired
 */
function refreshAuthCheck() {
  if (isTokenExpired()) {
    logout();
    return false;
  }
  return true;
}

/**
 * Add event listeners for auto-logout on token expiration
 */
function setupTokenExpirationListener() {
  // Check token expiration periodically
  setInterval(() => {
    if (isAuthenticated() && isTokenExpired()) {
      showErrorMessage('Your session has expired. Please log in again.');
      setTimeout(() => {
        logout();
      }, 2000);
    }
  }, 60000); // Check every minute
}

/**
 * Initialize auth guard on page load
 * Sets up token expiration monitoring
 */
function initAuthGuard() {
  setupTokenExpirationListener();
}

// Initialize on script load
initAuthGuard();
