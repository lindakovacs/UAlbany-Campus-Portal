/**
 * Route Protection Middleware
 * Applies consistent route protection pattern across all pages
 * Prevents unauthorized access to protected pages
 */

/**
 * Protected Route Configuration
 * Maps page paths to required authentication and permissions
 */
const PROTECTED_ROUTES = {
  'dashboard.html': { requireAuth: true, requiredRole: null },
  'profile.html': { requireAuth: true, requiredRole: null },
  'profiles.html': { requireAuth: false, requiredRole: null }, // Public page
  'create-profile.html': { requireAuth: true, requiredRole: null },
  'add-education.html': { requireAuth: true, requiredRole: null },
  'add-experience.html': { requireAuth: true, requiredRole: null },
  'posts.html': { requireAuth: false, requiredRole: null }, // Public page
  'post.html': { requireAuth: false, requiredRole: null }, // Public page can be viewed, but create requires auth
  'index.html': { requireAuth: false, requiredRole: null }, // Home page public
  'login.html': { requireAuth: false, requiredRole: null },
  'register.html': { requireAuth: false, requiredRole: null },
};

/**
 * Get current page filename
 * @returns {string} Current page filename
 */
function getCurrentPageName() {
  const path = window.location.pathname;
  return path.split('/').pop() || 'index.html';
}

/**
 * Get route configuration for current page
 * @returns {Object|null} Route config or null if not found
 */
function getCurrentRouteConfig() {
  const pageName = getCurrentPageName();
  return PROTECTED_ROUTES[pageName] || null;
}

/**
 * Check if current page requires authentication
 * @returns {boolean} True if page requires authentication
 */
function isCurrentPageProtected() {
  const config = getCurrentRouteConfig();
  return config && config.requireAuth;
}

/**
 * Check if current page requires specific role
 * @returns {string|null} Required role or null
 */
function getRequiredRole() {
  const config = getCurrentRouteConfig();
  return config?.requiredRole || null;
}

/**
 * Apply route protection to current page
 * Call this in DOMContentLoaded event
 * @param {Function} callback - Function to execute after protection check
 * @param {Object} options - Additional options
 */
function applyRouteProtection(callback, options = {}) {
  const {
    redirectOnFail = true,
    redirectUrl = 'login.html',
    showLoadingMessage = true,
  } = options;

  const pageName = getCurrentPageName();
  const config = getCurrentRouteConfig();

  // If page not in protected routes list, allow access
  if (!config) {
    console.warn(`Route not found in configuration: ${pageName}`);
    if (callback) callback();
    return;
  }

  // Check if page requires authentication
  if (config.requireAuth) {
    if (!isAuthenticated()) {
      if (redirectOnFail) {
        if (showLoadingMessage) {
          showErrorMessage('You must be logged in to access this page.');
          setTimeout(() => {
            redirectToLogin(redirectUrl);
          }, 1500);
        } else {
          redirectToLogin(redirectUrl);
        }
      }
      return;
    }
  }

  // Check if page requires specific role
  if (config.requiredRole) {
    const user = getCurrentUser();
    if (!user || user.role !== config.requiredRole) {
      if (redirectOnFail) {
        showErrorMessage('You do not have permission to access this page.');
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 1500);
      }
      return;
    }
  }

  // All checks passed, execute callback
  if (callback) {
    callback();
  }
}

/**
 * Create protected page middleware
 * Wraps page initialization with route protection
 * @param {Function} initFunction - Page initialization function
 * @returns {Function} Wrapped initialization function
 */
function protectedPage(initFunction) {
  return function () {
    applyRouteProtection(initFunction);
  };
}

/**
 * Redirect protected page users to appropriate location
 * Use this to redirect logged-in users away from login/register pages
 */
function redirectIfAuthenticated(redirectUrl = 'dashboard.html') {
  if (isAuthenticated()) {
    window.location.href = redirectUrl;
  }
}

/**
 * Setup page-level protection
 * Call this once at page load to ensure protection
 */
function setupPageProtection() {
  const page = getCurrentPageName();
  const config = getCurrentRouteConfig();

  if (!config) return;

  // Check if page is protected
  if (config.requireAuth) {
    // Page requires authentication
    document.addEventListener('DOMContentLoaded', function () {
      if (!isAuthenticated()) {
        // Show message and redirect
        showErrorMessage('Access denied. Please log in.');
        setTimeout(() => {
          redirectToLogin('login.html');
        }, 1500);
      }
    });
  }

  // Redirect authenticated users away from login/register
  if (
    (page === 'login.html' || page === 'register.html') &&
    isAuthenticated()
  ) {
    redirectIfAuthenticated('dashboard.html');
  }
}

/**
 * Get list of all protected pages
 * @returns {Array<string>} Array of protected page names
 */
function getProtectedPages() {
  return Object.keys(PROTECTED_ROUTES).filter(
    (page) => PROTECTED_ROUTES[page].requireAuth,
  );
}

/**
 * Get list of all public pages
 * @returns {Array<string>} Array of public page names
 */
function getPublicPages() {
  return Object.keys(PROTECTED_ROUTES).filter(
    (page) => !PROTECTED_ROUTES[page].requireAuth,
  );
}

/**
 * Check if page is public
 * @param {string} pageName - Page name to check
 * @returns {boolean} True if page is public
 */
function isPagePublic(pageName) {
  const config = PROTECTED_ROUTES[pageName];
  return config && !config.requireAuth;
}

/**
 * Log route protection info for debugging
 */
function debugRouteProtection() {
  const currentPage = getCurrentPageName();
  const config = getCurrentRouteConfig();

  console.group('Route Protection Debug');
  console.log('Current Page:', currentPage);
  console.log('Is Protected:', config?.requireAuth);
  console.log('Required Role:', config?.requiredRole || 'None');
  console.log('User Authenticated:', isAuthenticated());
  if (isAuthenticated()) {
    const user = getCurrentUser();
    console.log('User Role:', user?.role || 'Unknown');
  }
  console.groupEnd();
}

/**
 * Update route protection if new routes are registered
 * @param {Object} newRoutes - New routes to add/update
 */
function registerRoutes(newRoutes) {
  Object.assign(PROTECTED_ROUTES, newRoutes);
}

// Auto-setup protection on page load
document.addEventListener('DOMContentLoaded', setupPageProtection);
