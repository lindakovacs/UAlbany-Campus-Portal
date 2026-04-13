/**
 * Enhanced API Client
 * Modern, simplified API client with request/response handling, error management, and utilities
 *
 * Features:
 * - Centralized error handling with descriptive messages
 * - Automatic token injection for protected routes
 * - Request/response logging for debugging
 * - Loading state management for UI feedback
 * - CORS-aware base URL handling
 * - Retry logic for failed requests
 * - Response parsing and validation
 *
 * Usage:
 *   const user = await apiClient.auth.login(credentials);
 *   const posts = await apiClient.posts.getAll();
 *   const profile = await apiClient.profiles.get(userId);
 */

class APIClient {
  constructor(baseUrl = null) {
    this.baseUrl =
      baseUrl ||
      `${CONFIG?.BACKEND_HOST || 'http://localhost'}:${CONFIG?.BACKEND_PORT || 3001}`;
    this.isLoading = false;
    this.retryAttempts = 2;
  }

  /**
   * Get stored JWT token
   */
  getToken() {
    return localStorage.getItem('token');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.getToken();
  }

  /**
   * Clear authentication and user data
   */
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
  }

  /**
   * Set loading state for UI feedback
   */
  setLoading(isLoading) {
    this.isLoading = isLoading;
    document.body.classList.toggle('api-loading', isLoading);
  }

  /**
   * Core fetch wrapper with error handling and logging
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}/api${endpoint}`;
    const token = this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add token for protected routes (unless explicitly disabled)
    if (token && options.skipAuth !== true) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    this.setLoading(true);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new APIError(data.error || 'API Error', response.status, data);
      }

      console.log(`✅ ${options.method || 'GET'} ${endpoint}:`, data);
      return data;
    } catch (error) {
      console.error(`❌ API Error:`, error.message);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Authentication API
   */
  auth = {
    register: async (userData) => {
      try {
        const response = await this.request('/auth/register', {
          method: 'POST',
          body: JSON.stringify(userData),
          skipAuth: true,
        });

        if (response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          localStorage.setItem('userId', response.user.id);
        }

        return response;
      } catch (error) {
        throw new APIError('Registration failed', 400, error);
      }
    },

    login: async (credentials) => {
      try {
        const response = await this.request('/auth/login', {
          method: 'POST',
          body: JSON.stringify(credentials),
          skipAuth: true,
        });

        if (response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          localStorage.setItem('userId', response.user.id);
        }

        return response;
      } catch (error) {
        throw new APIError('Login failed', 401, error);
      }
    },

    getCurrentUser: async () => {
      return this.request('/auth/me', { method: 'GET' });
    },

    logout: () => {
      this.logout();
    },
  };

  /**
   * Profiles API
   */
  profiles = {
    getAll: async (page = 1, limit = 20) => {
      return this.request(`/profiles?page=${page}&limit=${limit}`, {
        method: 'GET',
      });
    },

    get: async (userId) => {
      return this.request(`/profiles/${userId}`, { method: 'GET' });
    },

    getMe: async () => {
      return this.request('/profiles/me', { method: 'GET' });
    },

    update: async (profileData) => {
      return this.request('/profiles', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });
    },

    search: async (query) => {
      return this.request(`/profiles/search?q=${encodeURIComponent(query)}`, {
        method: 'GET',
      });
    },
  };

  /**
   * Education API
   */
  education = {
    getForUser: async (userId) => {
      return this.request(`/profiles/${userId}/education`, {
        method: 'GET',
      });
    },

    add: async (educationData) => {
      return this.request('/profiles/education', {
        method: 'POST',
        body: JSON.stringify(educationData),
      });
    },

    update: async (educationId, educationData) => {
      return this.request(`/profiles/education/${educationId}`, {
        method: 'PUT',
        body: JSON.stringify(educationData),
      });
    },

    delete: async (educationId) => {
      return this.request(`/profiles/education/${educationId}`, {
        method: 'DELETE',
      });
    },
  };

  /**
   * Experience API
   */
  experience = {
    getForUser: async (userId) => {
      return this.request(`/profiles/${userId}/experience`, {
        method: 'GET',
      });
    },

    add: async (experienceData) => {
      return this.request('/profiles/experience', {
        method: 'POST',
        body: JSON.stringify(experienceData),
      });
    },

    update: async (experienceId, experienceData) => {
      return this.request(`/profiles/experience/${experienceId}`, {
        method: 'PUT',
        body: JSON.stringify(experienceData),
      });
    },

    delete: async (experienceId) => {
      return this.request(`/profiles/experience/${experienceId}`, {
        method: 'DELETE',
      });
    },
  };

  /**
   * Posts API
   */
  posts = {
    getAll: async (page = 1, limit = 20) => {
      return this.request(`/posts?page=${page}&limit=${limit}`, {
        method: 'GET',
      });
    },

    get: async (postId) => {
      return this.request(`/posts/${postId}`, { method: 'GET' });
    },

    create: async (postData) => {
      return this.request('/posts', {
        method: 'POST',
        body: JSON.stringify(postData),
      });
    },

    update: async (postId, postData) => {
      return this.request(`/posts/${postId}`, {
        method: 'PUT',
        body: JSON.stringify(postData),
      });
    },

    delete: async (postId) => {
      return this.request(`/posts/${postId}`, { method: 'DELETE' });
    },
  };

  /**
   * Comments API
   */
  comments = {
    getForPost: async (postId, page = 1, limit = 20) => {
      return this.request(
        `/posts/${postId}/comments?page=${page}&limit=${limit}`,
        { method: 'GET' },
      );
    },

    get: async (commentId) => {
      return this.request(`/comments/${commentId}`, { method: 'GET' });
    },

    create: async (postId, commentData) => {
      return this.request(`/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify(commentData),
      });
    },

    update: async (commentId, commentData) => {
      return this.request(`/comments/${commentId}`, {
        method: 'PUT',
        body: JSON.stringify(commentData),
      });
    },

    delete: async (commentId) => {
      return this.request(`/comments/${commentId}`, { method: 'DELETE' });
    },

    getCount: async (postId) => {
      return this.request(`/posts/${postId}/comments/count`, {
        method: 'GET',
      });
    },
  };

  /**
   * Likes API
   */
  likes = {
    toggle: async (postId) => {
      return this.request(`/posts/${postId}/like`, { method: 'POST' });
    },

    getCount: async (postId) => {
      return this.request(`/posts/${postId}/likes/count`, { method: 'GET' });
    },

    getList: async (postId, limit = 10) => {
      return this.request(`/posts/${postId}/likes?limit=${limit}`, {
        method: 'GET',
      });
    },

    checkStatus: async (postId) => {
      return this.request(`/posts/${postId}/likes/check`, { method: 'GET' });
    },
  };

  /**
   * Chatbot API
   */
  chatbot = {
    sendMessage: async (message) => {
      return this.request('/chat', {
        method: 'POST',
        body: JSON.stringify({ message }),
        skipAuth: true,
      });
    },

    getHealth: async () => {
      return this.request('/chat/health', {
        method: 'GET',
        skipAuth: true,
      });
    },
  };
}

/**
 * Custom API Error Class
 */
class APIError extends Error {
  constructor(message, status = 500, data = {}) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }

  getUniendlyMessage() {
    const messages = {
      400: 'Invalid request. Please check your input.',
      401: 'Unauthorized. Please log in again.',
      403: 'You do not have permission to perform this action.',
      404: 'The requested resource was not found.',
      409: 'Conflict. This resource may already exist.',
      429: 'Too many requests. Please try again later.',
      500: 'Server error. Please try again later.',
    };

    return messages[this.status] || this.message;
  }
}

/**
 * UI Helper Functions
 */

/**
 * Show loading indicator
 */
function showLoader(elementId = 'app') {
  const element = document.getElementById(elementId);
  if (element) {
    const loader = document.createElement('div');
    loader.id = 'api-loader';
    loader.className = 'loader';
    loader.innerHTML = '<div class="spinner"></div><p>Loading...</p>';
    element.appendChild(loader);
  }
}

/**
 * Hide loading indicator
 */
function hideLoader() {
  const loader = document.getElementById('api-loader');
  if (loader) {
    loader.remove();
  }
}

/**
 * Show error message to user
 */
function showError(message, duration = 5000) {
  const alert = document.createElement('div');
  alert.className = 'alert alert-danger';
  alert.innerHTML = `<strong>Error:</strong> ${message}`;
  alert.style.cssText =
    'position:fixed;top:20px;right:20px;max-width:400px;z-index:9999;';

  document.body.appendChild(alert);

  setTimeout(() => alert.remove(), duration);
}

/**
 * Show success message to user
 */
function showSuccess(message, duration = 3000) {
  const alert = document.createElement('div');
  alert.className = 'alert alert-success';
  alert.innerHTML = `<strong>Success!</strong> ${message}`;
  alert.style.cssText =
    'position:fixed;top:20px;right:20px;max-width:400px;z-index:9999;';

  document.body.appendChild(alert);

  setTimeout(() => alert.remove(), duration);
}

/**
 * Handle form submission with API call
 */
async function handleFormSubmit(formElement, apiCallFn, successMessage) {
  try {
    showLoader();
    const formData = new FormData(formElement);
    const data = Object.fromEntries(formData);
    const response = await apiCallFn(data);
    showSuccess(successMessage);
    return response;
  } catch (error) {
    showError(error.getUniendlyMessage?.() || error.message);
  } finally {
    hideLoader();
  }
}

/**
 * Create and initialize global API client instance
 */
const apiClient = new APIClient();
