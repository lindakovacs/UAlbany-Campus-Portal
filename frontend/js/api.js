/**
 * API Utility Module
 * Provides reusable functions to test backend API and database
 * Store JWT token in localStorage with key 'token'
 */

// ============================================
// Configuration
// ============================================

/**
 * API Configuration Object
 * Backend ports and hosts are loaded from frontend/config.js
 * Can be customized using configureBackend()
 */
const API_CONFIG = {
  BACKEND_HOST:
    typeof CONFIG !== 'undefined' ? CONFIG.BACKEND_HOST : 'http://localhost',
  BACKEND_PORT: typeof CONFIG !== 'undefined' ? CONFIG.BACKEND_PORT : 3001,

  get BACKEND_URL() {
    return `${this.BACKEND_HOST}:${this.BACKEND_PORT}`;
  },

  get API_BASE_URL() {
    return `${this.BACKEND_URL}/api`;
  },
};

// Set initial API base URL
const API_BASE_URL = API_CONFIG.API_BASE_URL;

/**
 * Configure backend server connection
 * Call this function before making API requests if backend is on different port/host
 *
 * @param {number} port - Backend port (default: 3001)
 * @param {string} host - Backend host URL (default: 'http://localhost')
 *
 * @example
 * configureBackend(3001, 'http://localhost')  // Default development
 * configureBackend(5000, 'http://localhost')  // Alternative port (if 3001 is in use)
 * configureBackend(443, 'https://api.example.com')  // Production
 */
function configureBackend(port = 3001, host = 'http://localhost') {
  API_CONFIG.BACKEND_PORT = port;
  API_CONFIG.BACKEND_HOST = host;
  console.log(`✅ Configured backend: ${API_CONFIG.API_BASE_URL}/api`);
}

// ============================================
// Auth Endpoints
// ============================================

/**
 * Register a new user
 * @param {Object} userData - {name, email, password, passwordConfirm}
 * @returns {Promise<Object>} - {token, user}
 */
async function apiRegister(userData) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (response.ok) {
      // Save token for authenticated requests
      localStorage.setItem('token', data.token);
      console.log('✅ Registered successfully:', data.user);
      return data;
    } else {
      console.error('❌ Registration failed:', data.error);
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('❌ Register error:', error);
    throw error;
  }
}

/**
 * Login with credentials
 * @param {Object} credentials - {email, password}
 * @returns {Promise<Object>} - {token, user}
 */
async function apiLogin(credentials) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('token', data.token);
      console.log('✅ Logged in successfully:', data.user);
      return data;
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('❌ Login error:', error);
    throw error;
  }
}

/**
 * Get current authenticated user
 * @returns {Promise<Object>} - User object
 */
async function apiGetCurrentUser() {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Current user:', data);
      return data;
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('❌ Get current user error:', error);
    throw error;
  }
}

// ============================================
// Profile Endpoints
// ============================================

/**
 * Get all profiles (paginated)
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Items per page (default: 10)
 * @returns {Promise<Object>} - {status, data, pagination}
 */
async function apiListProfiles(page = 1, limit = 10) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/profiles?page=${page}&limit=${limit}`,
      { method: 'GET' },
    );

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Profiles fetched:', data.data.length, 'items');
      return data;
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('❌ List profiles error:', error);
    throw error;
  }
}

/**
 * Get specific user profile
 * @param {number} userId - User ID
 * @returns {Promise<Object>} - {status, data}
 */
async function apiGetProfile(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/profiles/${userId}`, {
      method: 'GET',
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Profile fetched:', data.data);
      return data;
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('❌ Get profile error:', error);
    throw error;
  }
}

/**
 * Update user profile (protected)
 * @param {number} userId - User ID
 * @param {Object} profileData - {bio, skills, social_links} (all optional)
 * @returns {Promise<Object>} - {status, message, data}
 */
async function apiUpdateProfile(userId, profileData) {
  try {
    const response = await fetch(`${API_BASE_URL}/profiles/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(profileData),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Profile updated:', data.data);
      return data;
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('❌ Update profile error:', error);
    throw error;
  }
}

// ============================================
// Profiles Education Endpoints (Nested)
// ============================================

/**
 * Get user's education history (nested under profiles)
 * @param {number} userId - User ID
 * @returns {Promise<Object>} - {status, data}
 */
async function apiGetProfileEducation(userId) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/profiles/${userId}/education`,
      {
        method: 'GET',
      },
    );

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Education fetched:', data.data.length, 'entries');
      return data;
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('❌ Get education error:', error);
    throw error;
  }
}

/**
 * Add education entry for authenticated user (nested under profiles)
 * @param {Object} educationData - {school, degree, field_of_study, from_date, to_date, current, description}
 * @returns {Promise<Object>} - {status, message, data}
 */
async function apiAddProfileEducation(educationData) {
  try {
    const response = await fetch(`${API_BASE_URL}/profiles/education`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(educationData),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Education added:', data.data);
      return data;
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('❌ Add education error:', error);
    throw error;
  }
}

/**
 * Delete education entry (nested under profiles, owner only)
 * @param {number} eduId - Education ID
 * @returns {Promise<Object>} - {status, message}
 */
async function apiDeleteProfileEducation(eduId) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/profiles/education/${eduId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      },
    );

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Education deleted');
      return data;
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('❌ Delete education error:', error);
    throw error;
  }
}

// ============================================
// Education Endpoints
// ============================================

/**
 * Get user's education history
 * @param {number} userId - User ID
 * @returns {Promise<Object>} - {status, data}
 */
async function apiGetEducation(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/education/${userId}`, {
      method: 'GET',
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Education fetched:', data.data.length, 'entries');
      return data;
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('❌ Get education error:', error);
    throw error;
  }
}

/**
 * Add education entry (protected)
 * @param {number} userId - User ID
 * @param {Object} educationData - {school, degree, field_of_study, from_date, to_date, current, description}
 * @returns {Promise<Object>} - {status, message, data}
 */
async function apiAddEducation(userId, educationData) {
  try {
    const response = await fetch(`${API_BASE_URL}/education/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(educationData),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Education added:', data.data);
      return data;
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('❌ Add education error:', error);
    throw error;
  }
}

/**
 * Update education entry (protected)
 * @param {number} educationId - Education ID
 * @param {Object} educationData - Fields to update (all optional)
 * @returns {Promise<Object>} - {status, message, data}
 */
async function apiUpdateEducation(educationId, educationData) {
  try {
    const response = await fetch(`${API_BASE_URL}/education/${educationId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(educationData),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Education updated:', data.data);
      return data;
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('❌ Update education error:', error);
    throw error;
  }
}

/**
 * Delete education entry (protected)
 * @param {number} educationId - Education ID
 * @returns {Promise<Object>} - {status, message}
 */
async function apiDeleteEducation(educationId) {
  try {
    const response = await fetch(`${API_BASE_URL}/education/${educationId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Education deleted');
      return data;
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('❌ Delete education error:', error);
    throw error;
  }
}

// ============================================
// Profiles Experience Endpoints (Nested)
// ============================================

/**
 * Get user's work experience (nested under profiles)
 * @param {number} userId - User ID
 * @returns {Promise<Object>} - {status, data}
 */
async function apiGetProfileExperience(userId) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/profiles/${userId}/experience`,
      {
        method: 'GET',
      },
    );

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Experience fetched:', data.data.length, 'entries');
      return data;
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('❌ Get experience error:', error);
    throw error;
  }
}

/**
 * Add experience entry for authenticated user (nested under profiles)
 * @param {Object} experienceData - {company, title, location, from_date, to_date, current, description}
 * @returns {Promise<Object>} - {status, message, data}
 */
async function apiAddProfileExperience(experienceData) {
  try {
    const response = await fetch(`${API_BASE_URL}/profiles/experience`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(experienceData),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Experience added:', data.data);
      return data;
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('❌ Add experience error:', error);
    throw error;
  }
}

/**
 * Delete experience entry (nested under profiles, owner only)
 * @param {number} expId - Experience ID
 * @returns {Promise<Object>} - {status, message}
 */
async function apiDeleteProfileExperience(expId) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/profiles/experience/${expId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      },
    );

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Experience deleted');
      return data;
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('❌ Delete experience error:', error);
    throw error;
  }
}

// ============================================
// Experience Endpoints
// ============================================

/**
 * Get user's work experience
 * @param {number} userId - User ID
 * @returns {Promise<Object>} - {status, data}
 */
async function apiGetExperience(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/experience/${userId}`, {
      method: 'GET',
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Experience fetched:', data.data.length, 'entries');
      return data;
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('❌ Get experience error:', error);
    throw error;
  }
}

/**
 * Add work experience entry (protected)
 * @param {number} userId - User ID
 * @param {Object} experienceData - {company, title, location, from_date, to_date, current, description}
 * @returns {Promise<Object>} - {status, message, data}
 */
async function apiAddExperience(userId, experienceData) {
  try {
    const response = await fetch(`${API_BASE_URL}/experience/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(experienceData),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Experience added:', data.data);
      return data;
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('❌ Add experience error:', error);
    throw error;
  }
}

/**
 * Update experience entry (protected)
 * @param {number} experienceId - Experience ID
 * @param {Object} experienceData - Fields to update (all optional)
 * @returns {Promise<Object>} - {status, message, data}
 */
async function apiUpdateExperience(experienceId, experienceData) {
  try {
    const response = await fetch(`${API_BASE_URL}/experience/${experienceId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(experienceData),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Experience updated:', data.data);
      return data;
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('❌ Update experience error:', error);
    throw error;
  }
}

/**
 * Delete experience entry (protected)
 * @param {number} experienceId - Experience ID
 * @returns {Promise<Object>} - {status, message}
 */
async function apiDeleteExperience(experienceId) {
  try {
    const response = await fetch(`${API_BASE_URL}/experience/${experienceId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Experience deleted');
      return data;
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('❌ Delete experience error:', error);
    throw error;
  }
}

// ============================================
// Posts Endpoints
// ============================================

/**
 * Get all posts (paginated)
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Items per page (default: 10, max: 50)
 * @returns {Promise<Object>} - {status, data, pagination}
 */
async function apiGetPosts(page = 1, limit = 10) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/posts?page=${page}&limit=${limit}`,
      { method: 'GET' },
    );

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Posts fetched:', data.data.length, 'items');
      return data;
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('❌ Get posts error:', error);
    throw error;
  }
}

/**
 * Get specific post by ID
 * @param {number} postId - Post ID
 * @returns {Promise<Object>} - {status, data}
 */
async function apiGetPost(postId) {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
      method: 'GET',
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Post fetched:', data.data);
      return data;
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('❌ Get post error:', error);
    throw error;
  }
}

/**
 * Create new post (protected)
 * @param {Object} postData - {content}
 * @returns {Promise<Object>} - {status, message, data}
 */
async function apiCreatePost(postData) {
  try {
    const response = await fetch(`${API_BASE_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(postData),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Post created:', data.data);
      return data;
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('❌ Create post error:', error);
    throw error;
  }
}

/**
 * Update post (protected, owner only)
 * @param {number} postId - Post ID
 * @param {Object} postData - {content}
 * @returns {Promise<Object>} - {status, message, data}
 */
async function apiUpdatePost(postId, postData) {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(postData),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Post updated:', data.data);
      return data;
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('❌ Update post error:', error);
    throw error;
  }
}

/**
 * Delete post (protected, owner only)
 * @param {number} postId - Post ID
 * @returns {Promise<Object>} - {status, message}
 */
async function apiDeletePost(postId) {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Post deleted');
      return data;
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('❌ Delete post error:', error);
    throw error;
  }
}

/**
 * Toggle like on post (like if not liked, unlike if already liked)
 * @param {number} postId - Post ID
 * @returns {Promise<Object>} - {status, message, data: {liked}}
 */
async function apiToggleLike(postId) {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`✅ ${data.data.liked ? 'Liked' : 'Unliked'} post`);
      return data;
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('❌ Toggle like error:', error);
    throw error;
  }
}

/**
 * Get like count for a post
 * @param {number} postId - Post ID
 * @returns {Promise<Object>} - {status, data: {like_count}}
 */
async function apiGetLikeCount(postId) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/posts/${postId}/likes/count`,
      {
        method: 'GET',
      },
    );

    const data = await response.json();

    if (response.ok) {
      console.log(`✅ Post likes: ${data.data.like_count}`);
      return data;
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('❌ Get like count error:', error);
    throw error;
  }
}

/**
 * Get list of users who liked a post
 * @param {number} postId - Post ID
 * @param {number} limit - Max users to return (default: 10, max: 100)
 * @returns {Promise<Object>} - {status, data: [{id, name, email, created_at}]}
 */
async function apiGetLikesList(postId, limit = 10) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/posts/${postId}/likes?limit=${limit}`,
      {
        method: 'GET',
      },
    );

    const data = await response.json();

    if (response.ok) {
      console.log(`✅ Likes list: ${data.data.length} users`);
      return data;
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('❌ Get likes list error:', error);
    throw error;
  }
}

/**
 * Check if current user liked a post
 * @param {number} postId - Post ID
 * @returns {Promise<Object>} - {status, data: {liked}}
 */
async function apiCheckIfLiked(postId) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/posts/${postId}/likes/check`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(getToken() && { Authorization: `Bearer ${getToken()}` }),
        },
      },
    );

    const data = await response.json();

    if (response.ok) {
      console.log(`✅ Post ${data.data.liked ? 'is' : 'is not'} liked`);
      return data;
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('❌ Check if liked error:', error);
    throw error;
  }
}

// ============================================
// Utility Functions
// ============================================

/**
 * Get JWT token from localStorage
 * @returns {string} - JWT token
 */
function getToken() {
  return localStorage.getItem('token');
}

/**
 * Logout - clear token from localStorage
 */
function apiLogout() {
  localStorage.removeItem('token');
  console.log('✅ Logged out');
}

/**
 * Check if user is authenticated
 * @returns {boolean} - True if token exists
 */
function isAuthenticated() {
  return !!getToken();
}

/**
 * Clear all localStorage (useful for testing)
 */
function clearStorage() {
  localStorage.clear();
  console.log('✅ LocalStorage cleared');
}

// ============================================
// Example Usage in Browser Console
// ============================================

/**
 * Quick test workflow:
 *
 * 0. Configure backend (if not on default port 3001):
 *    configureBackend(3001, 'http://localhost')  // Default
 *    configureBackend(5000, 'http://localhost')  // If 3001 is in use
 *    configureBackend(443, 'https://api.example.com')  // Production
 *
 * 1. Register:
 *    apiRegister({name: 'Jane Doe', email: 'jane@example.com', password: 'password123', passwordConfirm: 'password123'})
 *
 * 2. Get current user:
 *    apiGetCurrentUser()
 *
 * 3. Get all profiles:
 *    apiListProfiles(1, 10)
 *
 * 4. Update profile:
 *    apiUpdateProfile(1, {bio: 'Hello!', skills: ['JavaScript', 'React']})
 *
 * 5. Add education:
 *    apiAddEducation(1, {school: 'University of Albany', degree: 'BS', field_of_study: 'CS', from_date: '2020-09-01', to_date: '2024-05-31'})
 *
 * 6. Get education:
 *    apiGetEducation(1)
 *
 * 7. Add experience:
 *    apiAddExperience(1, {company: 'Tech Inc', title: 'Developer', location: 'NY', from_date: '2024-06-01', current: true})
 *
 * 8. Get experience:
 *    apiGetExperience(1)
 *
 * 9. Logout:
 *    apiLogout()
 */
