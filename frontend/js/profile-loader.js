/**
 * Profile Loader
 * Loads and displays user profile data from API
 * Handles both viewing profiles and editing current user's profile
 */

/**
 * Get user ID from URL or use current user
 * @returns {string|null} User ID if in URL, null if viewing own profile
 */
function getProfileUserIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('userId') || null;
}

/**
 * Load profile data from API
 * @param {string} userId - User ID to load (null = current user)
 * @returns {Promise<Object>} User profile data
 */
async function loadProfileData(userId = null) {
  try {
    let user;
    let targetUserId;

    if (userId) {
      // Load a specific user's profile
      targetUserId = userId;
    } else {
      // Get current user first to get their ID
      const currentUserResponse = await apiClient.auth.getCurrentUser();
      user = currentUserResponse.user || currentUserResponse.data;
      targetUserId = user.id;
    }

    // Now load the profile data from profiles endpoint
    const profileResponse = await apiClient.profiles.get(targetUserId);
    const profileData = profileResponse.data || profileResponse;

    // Merge user and profile data
    const mergedData = {
      ...(user || {}),
      ...profileData,
      userId: targetUserId,
      id: targetUserId,
    };

    console.log('Loaded complete profile data:', mergedData);
    return mergedData;
  } catch (error) {
    console.error('Error loading profile:', error);
    throw error;
  }
}

/**
 * Load user education history
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Education records
 */
async function loadUserEducation(userId) {
  try {
    const response = await apiClient.education.getForUser(userId);
    // Extract data array from API response
    const education = response.data || response || [];
    return Array.isArray(education) ? education : [];
  } catch (error) {
    console.error('Error loading education:', error);
    return [];
  }
}

/**
 * Load user experience history
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Experience records
 */
async function loadUserExperience(userId) {
  try {
    const response = await apiClient.experience.getForUser(userId);
    // Extract data array from API response
    const experience = response.data || response || [];
    return Array.isArray(experience) ? experience : [];
  } catch (error) {
    console.error('Error loading experience:', error);
    return [];
  }
}

/**
 * Display profile header information
 * @param {Object} user - User object from API
 */
function displayProfileHeader(user) {
  if (!user) return;

  // Update name
  const nameElement = document.getElementById('profile-name');
  if (nameElement) {
    nameElement.textContent = user.name || 'User Profile';
  }

  // Update title/headline
  const titleElement = document.getElementById('profile-title');
  if (titleElement) {
    titleElement.textContent = user.title || 'No title provided';
  }

  // Update location
  const locationElement = document.getElementById('profile-location');
  if (locationElement) {
    locationElement.textContent = user.location || '';
  }

  // Update profile photo
  const profilePhoto = document.getElementById('profile-photo-img');
  if (profilePhoto && user.profilePhoto) {
    profilePhoto.src = user.profilePhoto;
    profilePhoto.alt = user.name || 'Profile';
  }

  // Update social links
  updateProfileSocialLinks(user.social || {});
}

/**
 * Update social media links in profile header
 * @param {Object} socialLinks - Social media URLs
 */
function updateProfileSocialLinks(socialLinks) {
  const iconLinks = document.querySelectorAll('.profile-top .icons a');
  const socialMap = [
    { key: 'website', title: 'Personal Website', selector: 'fa-globe' },
    { key: 'linkedin', title: 'LinkedIn', selector: 'fa-linkedin' },
    { key: 'github', title: 'GitHub', selector: 'fa-github' },
    { key: 'twitter', title: 'Twitter', selector: 'fa-twitter' },
    { key: 'facebook', title: 'Facebook', selector: 'fa-facebook' },
    { key: 'youtube', title: 'YouTube', selector: 'fa-youtube' },
    { key: 'instagram', title: 'Instagram', selector: 'fa-instagram' },
  ];

  iconLinks.forEach((link, index) => {
    if (index < socialMap.length) {
      const social = socialMap[index];
      if (socialLinks[social.key]) {
        link.href = socialLinks[social.key];
        link.title = social.title;
        link.style.display = 'inline-block';
      } else {
        link.style.display = 'none';
      }
    }
  });
}

/**
 * Display bio, skills, and education summary
 * @param {Object} user - User object
 */
function displayProfileAbout(user) {
  if (!user) return;

  // Update bio
  const bioElement = document.getElementById('profile-bio');
  if (bioElement && user.bio) {
    bioElement.textContent = user.bio;
  }

  // Update skills
  const skillsContainer = document.getElementById('profile-skills');
  if (skillsContainer && user.skills) {
    skillsContainer.innerHTML = '';
    const skillsArray = Array.isArray(user.skills)
      ? user.skills
      : user.skills.split(',').map((s) => s.trim());

    skillsArray.forEach((skill) => {
      if (skill) {
        const skillDiv = document.createElement('div');
        skillDiv.className = 'p-1';
        skillDiv.innerHTML = `<i class="fa fa-check"></i> ${skill}`;
        skillsContainer.appendChild(skillDiv);
      }
    });

    // Show message if no skills
    if (skillsArray.length === 0) {
      skillsContainer.innerHTML =
        '<div class="p-1"><i class="fa fa-info-circle"></i> No skills added yet</div>';
    }
  }
}

/**
 * Display experience in table format
 * @param {Array} experiences - Experience records
 */
function displayExperience(experiences) {
  const container = document.getElementById('profile-exp');
  if (!container) return;

  container.innerHTML = '';

  if (!experiences || experiences.length === 0) {
    container.innerHTML = '<p class="text-muted">No experience added yet</p>';
    return;
  }

  // Sort: current first, then by most recent
  experiences.sort((a, b) => {
    if (a.current && !b.current) return -1;
    if (!a.current && b.current) return 1;
    return new Date(b.from || b.to) - new Date(a.from || a.to);
  });

  experiences.forEach((exp) => {
    const startDate = formatDate(exp.from);
    const endDate = exp.current ? 'Now' : formatDate(exp.to);
    const dateRange = `${startDate} - ${endDate}`;

    const expDiv = document.createElement('div');
    expDiv.className = 'bg-white p-2 my-1 card';
    expDiv.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: start;">
        <div>
          <h4 class="text-primary" style="margin: 0 0 0.25rem 0;">${exp.title || 'Position'}</h4>
          <p style="margin: 0 0 0.5rem 0; font-weight: bold;">${exp.company || 'Company'}</p>
          <p style="margin: 0 0 0.5rem 0; font-size: 0.9rem; color: #666;">${dateRange}</p>
          ${exp.location ? `<p style="margin: 0; font-size: 0.9rem; color: #666;">${exp.location}</p>` : ''}
        </div>
        ${exp.current ? '<span class="badge badge-success" style="white-space: nowrap;">Current</span>' : ''}
      </div>
      ${exp.description ? `<p style="margin: 0.5rem 0 0 0; color: #555;">${exp.description}</p>` : ''}
    `;
    container.appendChild(expDiv);
  });
}

/**
 * Display education in table format
 * @param {Array} educations - Education records
 */
function displayEducation(educations) {
  const container = document.getElementById('profile-edu');
  if (!container) return;

  container.innerHTML = '';

  if (!educations || educations.length === 0) {
    container.innerHTML = '<p class="text-muted">No education added yet</p>';
    return;
  }

  // Sort: current first, then by most recent
  educations.sort((a, b) => {
    if (a.current && !b.current) return -1;
    if (!a.current && b.current) return 1;
    return new Date(b.from || b.to) - new Date(a.from || a.to);
  });

  educations.forEach((edu) => {
    const startDate = formatDate(edu.from);
    const endDate = edu.current ? 'Now' : formatDate(edu.to);
    const dateRange = `${startDate} - ${endDate}`;

    const eduDiv = document.createElement('div');
    eduDiv.className = 'bg-white p-2 my-1 card';
    eduDiv.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: start;">
        <div>
          <h4 class="text-primary" style="margin: 0 0 0.25rem 0;">${edu.school || 'School'}</h4>
          <p style="margin: 0 0 0.5rem 0; font-weight: bold;">${edu.degree || 'Degree'}</p>
          <p style="margin: 0 0 0.5rem 0; font-size: 0.9rem; color: #666;">${dateRange}</p>
          ${edu.fieldOfStudy ? `<p style="margin: 0; font-size: 0.9rem; color: #666;"><strong>Field:</strong> ${edu.fieldOfStudy}</p>` : ''}
        </div>
        ${edu.current ? '<span class="badge badge-success" style="white-space: nowrap;">Current</span>' : ''}
      </div>
      ${edu.description ? `<p style="margin: 0.5rem 0 0 0; color: #555;">${edu.description}</p>` : ''}
    `;
    container.appendChild(eduDiv);
  });
}

/**
 * Format date to readable string
 * @param {string} dateStr - ISO date string
 * @returns {string} Formatted date
 */
function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    const [year, month, day] = dateStr.split('-');
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    });
  } catch (e) {
    return dateStr;
  }
}

/**
 * Initialize profile page
 * Loads and displays all profile data
 */
async function initializeProfilePage() {
  try {
    const userId = getProfileUserIdFromUrl();

    // Show loading state
    showLoadingMessage('Loading profile...');

    // Load profile data
    let profileData;
    try {
      profileData = await loadProfileData(userId);
    } catch (error) {
      console.warn(
        'Failed to load profile from API, trying localStorage fallback...',
      );

      // Fallback: Try to use localStorage data (e.g., just after profile creation)
      const savedProfileData = localStorage.getItem('profileData');
      if (savedProfileData) {
        try {
          const formData = JSON.parse(savedProfileData);

          // Also try to get user data
          const userData = JSON.parse(localStorage.getItem('user') || '{}');

          profileData = {
            ...userData,
            ...formData,
            userId: userData.id,
            id: userData.id,
          };

          console.log('Using localStorage fallback profile data:', profileData);
        } catch (parseError) {
          console.error(
            'Failed to parse localStorage profile data:',
            parseError,
          );
          throw error; // Re-throw original error if fallback fails
        }
      } else {
        throw error; // No fallback available, re-throw original error
      }
    }

    const currentUserId = profileData.userId || profileData.id;

    // Load education and experience (non-fatal if these fail)
    let educationData = [];
    let experienceData = [];

    try {
      educationData = await loadUserEducation(currentUserId);
    } catch (error) {
      console.warn('Note: Could not load education data:', error.message);
      // Continue anyway - education is optional
    }

    try {
      experienceData = await loadUserExperience(currentUserId);
    } catch (error) {
      console.warn('Note: Could not load experience data:', error.message);
      // Continue anyway - experience is optional
    }

    // Display all data
    displayProfileHeader(profileData);
    displayProfileAbout(profileData);
    displayExperience(experienceData);
    displayEducation(educationData);

    // Hide loading
    hideLoadingMessage();
  } catch (error) {
    console.error('Error initializing profile page:', error);
    showErrorMessage('Failed to load profile. Please try again.');
    // Still hide loading message even on error
    hideLoadingMessage();
  }
}

/**
 * Show loading message
 * @param {string} message - Message to display
 */
function showLoadingMessage(message = 'Loading...') {
  const loadingDiv = document.getElementById('profile-loading');
  if (loadingDiv) {
    loadingDiv.style.display = 'block';
    const msgEl = loadingDiv.querySelector('p');
    if (msgEl) msgEl.textContent = message;
  }
}

/**
 * Hide loading message
 */
function hideLoadingMessage() {
  const loadingDiv = document.getElementById('profile-loading');
  if (loadingDiv) {
    loadingDiv.style.display = 'none';
  }
}

/**
 * Show error message
 * @param {string} message - Error message
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

  setTimeout(() => {
    errorDiv.remove();
  }, 5000);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
  // Wait for auth check to complete, then load profile
  if (typeof applyRouteProtection === 'function') {
    applyRouteProtection(initializeProfilePage, {
      redirectOnFail: false,
      showLoadingMessage: false,
    });
  } else {
    // Fallback if auth protection not available
    initializeProfilePage();
  }
});
