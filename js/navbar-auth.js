/**
 * Navigation Authentication Handler
 * Updates navbar menu to show Login/Logout and Profile based on authentication state
 *
 * Handles both initial page load and dynamic navbar loading via fetch
 */

function updateNavbarAuth() {
  // Check if navbar elements exist yet
  const navAuthLinks = document.querySelectorAll('#nav-auth');
  const dashboardLink = document.getElementById('nav-dashboard');
  
  if (navAuthLinks.length === 0) {
    // Navbar not loaded yet, retry after a short delay
    setTimeout(updateNavbarAuth, 100);
    return;
  }

  // Check if user is authenticated (token exists in localStorage)
  const isAuthenticated = localStorage.getItem('token') !== null;

  if (isAuthenticated) {
    // User is logged in - show Profile, Dashboard, and Logout
    const profileLink = navAuthLinks[0]; // First one is Profile
    const authLink = navAuthLinks[1]; // Second one is Login/Logout

    // Show Dashboard link
    if (dashboardLink && dashboardLink.parentElement) {
      dashboardLink.parentElement.style.display = 'block';
    }

    // Ensure Profile link is visible
    if (profileLink && profileLink.parentElement) {
      profileLink.parentElement.style.display = 'block';
      profileLink.href = 'profile.html';
      profileLink.title = 'Profile';
      profileLink.innerHTML = '<i class="fas fa-user"></i> <span class="hide-sm">Profile</span>';
    }

    if (authLink) {
      authLink.href = '#';
      authLink.title = 'Logout';
      authLink.innerHTML = '<i class="fas fa-sign-out-alt"></i> <span class="hide-sm">Logout</span>';
      // Remove any existing click handlers
      const newAuthLink = authLink.cloneNode(true);
      authLink.parentNode.replaceChild(newAuthLink, authLink);
      // Add new click handler
      newAuthLink.addEventListener('click', (e) => {
        e.preventDefault();
        handleLogout();
      });
    }
  } else {
    // User is not logged in - hide Profile and Dashboard, show Login
    const profileLink = navAuthLinks[0];
    const authLink = navAuthLinks[1];

    // Hide Dashboard link completely (remove from flow)
    if (dashboardLink && dashboardLink.parentElement) {
      dashboardLink.parentElement.style.display = 'none';
    }

    // Hide Profile link completely (remove from flow)
    if (profileLink && profileLink.parentElement) {
      profileLink.parentElement.style.display = 'none';
    }

    if (authLink) {
      authLink.href = 'login.html';
      authLink.title = 'Login';
      authLink.innerHTML = '<i class="fas fa-sign-in-alt"></i> <span class="hide-sm">Login</span>';
    }
  }
}

/**
 * Handle logout action
 */
function handleLogout() {
  if (confirm('Are you sure you want to logout?')) {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userId');

    // Show confirmation
    const alert = document.createElement('div');
    alert.className = 'alert alert-success';
    alert.style.cssText =
      'position:fixed;top:60px;right:20px;max-width:400px;z-index:9999;padding:15px;border-radius:4px;background:#d4edda;color:#155724;font-weight:bold;';
    alert.innerHTML = '✅ Logged out successfully! Redirecting...';
    document.body.appendChild(alert);

    // Redirect to login after 1.5 seconds
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1500);
  }
}

// Update navbar when page loads
document.addEventListener('DOMContentLoaded', updateNavbarAuth);

// Watch for when navbar is dynamically loaded and update
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', updateNavbarAuth);
} else {
  // DOM already loaded, run immediately but with retry logic
  updateNavbarAuth();
}

// Also update if authentication state changes (e.g., after successful login on another tab)
window.addEventListener('storage', updateNavbarAuth);
