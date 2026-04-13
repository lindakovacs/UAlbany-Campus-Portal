/**
 * Profile Form Handler
 * Handles create-profile.html form submission and API integration
 * Saves profile data to backend API and localStorage
 */

/**
 * Initialize profile form submission handler
 */
function initializeProfileFormHandler() {
  const form = document.getElementById('create-profile-form');
  if (!form) return;

  // Store original submit button text on initialization
  const submitBtn = form.querySelector('input[type="submit"]');
  if (submitBtn) {
    // Store the original value (should be "Submit")
    const originalValue = submitBtn.value || 'Submit';
    submitBtn.dataset.originalText = originalValue;
    console.log('Stored original submit button text:', originalValue);
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    try {
      const submitBtn = form.querySelector('input[type="submit"]');

      if (!submitBtn) {
        throw new Error('Submit button not found');
      }

      // Get the original text - with multiple fallbacks
      const originalText =
        submitBtn.dataset.originalText ||
        submitBtn.getAttribute('data-original-text') ||
        'Submit';

      console.log('Submission attempt - originalText stored:', originalText);

      // Show loading state
      submitBtn.disabled = true;
      submitBtn.value = 'Saving...';

      // Check if user is logged in
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const token = localStorage.getItem('token');
      console.log('Form submission - Auth check:', {
        userExists: !!user.id,
        hasToken: !!token,
      });

      if (!user.id || !token) {
        throw new Error(
          'You must be logged in to submit this form. Log in first.',
        );
      }

      // Validate form using real-time validation
      const validation = validateProfileForm(form);
      if (!validation.isValid) {
        const errorMessages = Object.values(validation.errors).join('\n');
        showErrorMessage(`Fix the following errors:\n${errorMessages}`);

        // Restore button - this is critical
        submitBtn.disabled = false;
        submitBtn.value = originalText;
        console.log(
          'Validation failed - restored button text to:',
          submitBtn.value,
        );
        return;
      }

      // Get form data
      const formData = collectFormData(form);

      // Save to API
      const savedProfile = await saveProfileToAPI(formData);

      // Save to localStorage as backup
      localStorage.setItem('profileData', JSON.stringify(formData));
      localStorage.setItem('lastProfileUpdate', new Date().toISOString());

      // Show success message
      showSuccessMessage('Profile created successfully!');

      // Redirect to profile.html
      setTimeout(() => {
        window.location.href = 'profile.html';
      }, 1500);
    } catch (error) {
      console.error('Error submitting profile form:', error);
      showErrorMessage(error.message || 'Error saving profile. Try again.');

      // Re-enable submit button and restore text
      const submitBtn = form.querySelector('input[type="submit"]');
      if (submitBtn) {
        const originalText =
          submitBtn.dataset.originalText ||
          submitBtn.getAttribute('data-original-text') ||
          'Submit';
        submitBtn.disabled = false;
        submitBtn.value = originalText;
        console.log('Error caught - restored button text to:', submitBtn.value);
      }
    }
  });
}

/**
 * Collect all form data into an object
 * @param {HTMLFormElement} form - The form to collect data from
 * @returns {Object} Form data
 */
function collectFormData(form) {
  return {
    name: form.querySelector('[name="name"]').value.trim(),
    title: form.querySelector('[name="title"]').value.trim(),
    company: form.querySelector('[name="company"]').value.trim(),
    status: form.querySelector('[name="status"]').value,
    location: form.querySelector('[name="location"]').value.trim(),
    skills: form.querySelector('[name="skills"]').value.trim(),
    githubusername:
      form.querySelector('[name="githubusername"]').value.trim() || '',
    bio: form.querySelector('[name="bio"]').value.trim(),
    social: {
      website: form.querySelector('[name="website"]').value.trim() || '',
      github: form.querySelector('[name="github"]').value.trim() || '',
      twitter: form.querySelector('[name="twitter"]').value.trim() || '',
      facebook: form.querySelector('[name="facebook"]').value.trim() || '',
      youtube: form.querySelector('[name="youtube"]').value.trim() || '',
      linkedin: form.querySelector('[name="linkedin"]').value.trim() || '',
      instagram: form.querySelector('[name="instagram"]').value.trim() || '',
    },
  };
}

/**
 * Save profile data to API
 * @param {Object} profileData - Profile data to save
 * @returns {Promise<Object>} Saved profile with API response
 */
async function saveProfileToAPI(profileData) {
  try {
    // Transform data for API
    const profileToSave = {
      // Basic fields
      title: profileData.title || '',
      company: profileData.company || '',
      location: profileData.location || '',
      bio: profileData.bio || '',

      // Transform skills string to array
      skills: profileData.skills
        ? profileData.skills
            .split(',')
            .map((s) => s.trim())
            .filter((s) => s.length > 0)
        : [],

      // Transform social object to social_links
      social_links: profileData.social || {},
    };

    // Debug: Check what's being sent
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id || localStorage.getItem('userId');
    console.log('Profile data to save:', { user, userId, profileToSave });

    // Make API call to save profile
    const response = await apiClient.profiles.update(profileToSave);

    console.log('Profile saved to API:', response);
    return response;
  } catch (error) {
    console.error('API Error:', error);
    console.error('Error details:', {
      status: error.status,
      message: error.message,
      data: error.data || 'No data',
    });

    // Provide more descriptive error messages
    if (error.status === 401) {
      throw new Error(
        error.message || 'Your session has expired. Log in again.',
      );
    } else if (error.status === 404) {
      throw new Error('Profile endpoint error. Try again or contact support.');
    } else if (error.status === 400) {
      throw new Error(
        error.message || 'Invalid profile data. Check your information.',
      );
    } else if (error.status === 500) {
      throw new Error('Server error. Try again later.');
    } else {
      throw new Error(error.message || 'Failed to save profile');
    }
  }
}

/**
 * Load existing profile data into form for editing
 * Attempts to load from API first, then localStorage as fallback
 */
async function loadProfileDataIntoForm() {
  const form = document.getElementById('create-profile-form');
  if (!form) return;

  try {
    // Try to load from API
    let profileData = null;
    let loadedFromAPI = false;

    try {
      const currentUser = await apiClient.auth.getCurrentUser();
      if (currentUser && currentUser.id) {
        // Load user's existing profile
        try {
          const userId = currentUser.userId || currentUser.id;
          console.log('Attempting to load profile for user:', userId);
          const apiProfile = await apiClient.profiles.get(userId);
          if (apiProfile && apiProfile.data) {
            profileData = apiProfile.data;
            loadedFromAPI = true;
            console.log('Loaded profile from API:', profileData);
          }
        } catch (getError) {
          // 404 is expected for new users, other errors should be logged
          if (getError.status !== 404) {
            console.error('Error fetching profile from API:', getError.message);
          } else {
            console.log('Profile does not exist yet (first-time creation)');
          }
        }
      }
    } catch (authError) {
      console.log('Could not get current user:', authError.message);
    }

    // Fallback to localStorage
    if (!profileData) {
      const saved = localStorage.getItem('profileData');
      if (saved) {
        try {
          profileData = JSON.parse(saved);
          console.log('Loaded profile from localStorage:', profileData);
        } catch (parseError) {
          console.error('Error parsing localStorage profile data:', parseError);
        }
      }
    }

    if (!profileData) {
      console.log('No existing profile found - ready for new profile creation');
      return;
    }

    // Update page title to indicate editing
    const pageTitle = document.querySelector('.large.text-primary');
    if (pageTitle && loadedFromAPI) {
      pageTitle.textContent = 'Edit Your Profile';
    }

    // Populate form fields
    populateFormFields(form, profileData);
    console.log('Profile data populated into form');
  } catch (error) {
    console.error('Error loading profile data:', error);
    // Continue anyway - user can fill in form manually
  }
}

/**
 * Populate form fields with data
 * @param {HTMLFormElement} form - Form to populate
 * @param {Object} data - Data to populate with
 */
function populateFormFields(form, data) {
  // Basic fields
  const nameInput = form.querySelector('[name="name"]');
  if (nameInput && data.name) nameInput.value = data.name;

  const titleInput = form.querySelector('[name="title"]');
  if (titleInput && data.title) titleInput.value = data.title;

  const companyInput = form.querySelector('[name="company"]');
  if (companyInput && data.company) companyInput.value = data.company;

  const statusSelect = form.querySelector('[name="status"]');
  if (statusSelect && data.status) statusSelect.value = data.status;

  const locationInput = form.querySelector('[name="location"]');
  if (locationInput && data.location) locationInput.value = data.location;

  const skillsInput = form.querySelector('[name="skills"]');
  if (skillsInput && data.skills) {
    // Handle both array and string skills
    const skillsString = Array.isArray(data.skills)
      ? data.skills.join(', ')
      : data.skills;
    skillsInput.value = skillsString;
  }

  const githubInput = form.querySelector('[name="githubusername"]');
  if (githubInput && data.githubusername)
    githubInput.value = data.githubusername;

  const bioTextarea = form.querySelector('[name="bio"]');
  if (bioTextarea && data.bio) bioTextarea.value = data.bio;

  // Social links - handle both 'social' and 'social_links' from API
  const socialData = data.social_links || data.social;
  if (socialData) {
    populateSocialLinks(form, socialData);
  }
}

/**
 * Populate social link fields
 * @param {HTMLFormElement} form - Form to populate
 * @param {Object} social - Social link data
 */
function populateSocialLinks(form, social) {
  // Handle social_links that may be a string (needs parsing) or already an object
  let socialData = social;
  if (typeof social === 'string') {
    try {
      socialData = JSON.parse(social);
    } catch (e) {
      console.warn('Could not parse social_links:', e);
      socialData = {};
    }
  }

  const links = [
    { fieldName: 'website', data: socialData.website },
    { fieldName: 'linkedin', data: socialData.linkedin },
    { fieldName: 'github', data: socialData.github },
    { fieldName: 'twitter', data: socialData.twitter },
    { fieldName: 'facebook', data: socialData.facebook },
    { fieldName: 'youtube', data: socialData.youtube },
    { fieldName: 'instagram', data: socialData.instagram },
  ];

  links.forEach(({ fieldName, data: value }) => {
    const input = form.querySelector(`[name="${fieldName}"]`);
    if (input && value) {
      input.value = value;
    }
  });
}

/**
 * Show success message
 * @param {string} message - Message to display
 */
function showSuccessMessage(message) {
  const alertDiv = document.createElement('div');
  alertDiv.className = 'alert alert-success';
  alertDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #28a745;
    color: white;
    padding: 15px 20px;
    border-radius: 4px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    z-index: 10000;
    max-width: 300px;
  `;
  alertDiv.textContent = message;
  document.body.appendChild(alertDiv);

  setTimeout(() => {
    alertDiv.remove();
  }, 4000);
}

/**
 * Show error message
 * @param {string} message - Error message to display
 */
function showErrorMessage(message) {
  const alertDiv = document.createElement('div');
  alertDiv.className = 'alert alert-danger';
  alertDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #dc3545;
    color: white;
    padding: 15px 20px;
    border-radius: 4px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    z-index: 10000;
    max-width: 300px;
  `;
  alertDiv.textContent = message;
  document.body.appendChild(alertDiv);

  setTimeout(() => {
    alertDiv.remove();
  }, 5000);
}

/**
 * Toggle social network fields visibility
 */
function toggleSocialNetworkFields() {
  const socialInputs = document.querySelectorAll('.form-group.social-input');
  socialInputs.forEach((input) => {
    if (input.style.display === 'none') {
      input.style.display = 'block';
    } else {
      input.style.display = 'none';
    }
  });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
  // Load existing profile data into form
  loadProfileDataIntoForm();

  // Initialize form submission handler
  initializeProfileFormHandler();

  // Set up social network toggle button
  const toggleBtn = document.querySelector(
    '.btn-light:contains("Add Social Network Links")',
  );
  if (!toggleBtn) {
    // Find by text content
    const buttons = document.querySelectorAll('.btn-light');
    buttons.forEach((btn) => {
      if (btn.textContent.includes('Add Social Network Links')) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          toggleSocialNetworkFields();
          btn.textContent = btn.textContent.includes('Add')
            ? 'Hide Social Network Links'
            : 'Add Social Network Links';
        });
      }
    });
  }
});
