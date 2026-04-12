/**
 * Profile Edit Module
 * Provides profile editing, experience/education CRUD, and social media management
 * Functionality: Form state management, validation, localStorage persistence, event handling
 * Uses: Variables, Objects, Events, Functions, Loops, localStorage, DOM manipulation
 */

// Storage keys for profile data
const PROFILE_STORAGE_KEY = 'profileData';
const EXPERIENCE_STORAGE_KEY = 'experienceList';
const EDUCATION_STORAGE_KEY = 'educationList';
const CURRENT_USER_ID = 'currentUser';
const PROFILE_PHOTO_STORAGE_KEY = 'profilePhoto';

// Profile form state constant
const profileFormState = {
  name: '',
  email: '',
  phone: '',
  bio: '',
  status: '',
  company: '',
  website: '',
  location: '',
  skills: '',
  githubusername: '',
  social: {
    twitter: '',
    facebook: '',
    linkedin: '',
    youtube: '',
    instagram: '',
  },
};

/**
 * Initialize profile data from localStorage
 * @returns {object} - Stored profile data
 */
function initializeProfileData() {
  const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
  return stored
    ? JSON.parse(stored)
    : {
        name: '',
        title: '',
        location: '',
        bio: '',
        skills: [],
        status: '',
        company: '',
        website: '',
        email: '',
        phone: '',
        social: {
          twitter: '',
          facebook: '',
          linkedin: '',
          youtube: '',
          instagram: '',
        },
      };
}

/**
 * Save profile data to localStorage
 * @param {object} profileData - Profile data to save
 */
function saveProfileData(profileData) {
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profileData));
  console.log('Profile data saved:', profileData);
}

/**
 * Get current profile data from page or localStorage
 * @returns {object} - Profile data
 */
function getProfileData() {
  const name = document.querySelector('.profile-top h1');
  const title = document.querySelector('.profile-top .lead');
  const location = document.querySelector('.profile-top > p');
  const bio = document.querySelector('.profile-about p');

  return {
    name: name?.textContent.trim() || '',
    title: title?.textContent.trim() || '',
    location: location?.textContent.trim() || '',
    bio: bio?.textContent.trim() || '',
  };
}

/**
 * Create edit button for profile
 * @returns {HTMLElement} - Edit button element
 */
function createEditButton() {
  const button = document.createElement('button');
  button.id = 'profile-edit-toggle';
  button.className = 'btn btn-primary';
  button.setAttribute('aria-label', 'Edit profile information');
  button.setAttribute('title', 'Edit your profile');
  button.innerHTML = '<i class="fas fa-edit"></i> Edit Profile';

  return button;
}

/**
 * Create save and cancel buttons for edit mode
 * @returns {object} - Object with save and cancel buttons
 */
function createProfileActionButtons() {
  const saveBtn = document.createElement('button');
  saveBtn.className = 'btn btn-success profile-save-btn';
  saveBtn.setAttribute('aria-label', 'Save profile changes');
  saveBtn.innerHTML = '<i class="fas fa-check"></i> Save Changes';

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'btn btn-danger profile-cancel-btn';
  cancelBtn.setAttribute('aria-label', 'Cancel profile editing');
  cancelBtn.innerHTML = '<i class="fas fa-times"></i> Cancel';

  return { saveBtn, cancelBtn };
}

/**
 * Toggle edit mode on/off
 */
function toggleEditMode() {
  const profileTop = document.querySelector('.profile-top');
  const editBtn = document.getElementById('profile-edit-toggle');

  if (!profileTop) return;

  const isEditing = profileTop.classList.contains('editing');

  if (isEditing) {
    // Exit edit mode
    exitEditMode();
  } else {
    // Enter edit mode
    enterEditMode();
  }
}

/**
 * Enter edit mode - Convert fields to editable inputs
 */
function enterEditMode() {
  const profileTop = document.querySelector('.profile-top');
  const profileAbout = document.querySelector('.profile-about');
  if (!profileTop) return;

  profileTop.classList.add('editing');
  if (profileAbout) profileAbout.classList.add('editing');

  // Get current data
  const nameEl = profileTop.querySelector('h1');
  const titleEl = profileTop.querySelector('.lead');
  const locationEl = profileTop.querySelector('p:not(.lead)');
  const bioEl = profileAbout?.querySelector('p');

  // Store original values
  const originalData = {
    name: nameEl?.textContent.trim() || '',
    title: titleEl?.textContent.trim() || '',
    location: locationEl?.textContent.trim() || '',
    bio: bioEl?.textContent.trim() || '',
  };
  profileTop.dataset.originalData = JSON.stringify(originalData);

  // Replace name with editable input
  if (nameEl) {
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'profile-edit-input profile-name-input';
    nameInput.value = nameEl.textContent.trim();
    nameInput.setAttribute('aria-label', 'Edit your full name');
    nameInput.placeholder = 'Full Name';
    nameEl.replaceWith(nameInput);
  }

  // Replace title with editable input
  if (titleEl) {
    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.className = 'profile-edit-input profile-title-input';
    titleInput.value = titleEl.textContent.trim();
    titleInput.setAttribute('aria-label', 'Edit your professional title');
    titleInput.placeholder = 'Professional Title';
    titleEl.replaceWith(titleInput);
  }

  // Replace location with editable input
  if (locationEl && !locationEl.classList.contains('lead')) {
    const locationInput = document.createElement('input');
    locationInput.type = 'text';
    locationInput.className = 'profile-edit-input profile-location-input';
    locationInput.value = locationEl.textContent.trim();
    locationInput.setAttribute('aria-label', 'Edit your location');
    locationInput.placeholder = 'City, State';
    locationEl.replaceWith(locationInput);
  }

  // Replace bio with editable textarea
  if (bioEl && profileAbout) {
    const bioTextarea = document.createElement('textarea');
    bioTextarea.className = 'profile-edit-input profile-bio-input';
    bioTextarea.value = bioEl.textContent.trim();
    bioTextarea.setAttribute('aria-label', 'Edit your bio');
    bioTextarea.placeholder = 'Tell us about yourself';
    bioTextarea.style.minHeight = '120px';
    bioTextarea.style.resize = 'vertical';
    bioEl.replaceWith(bioTextarea);
  }

  // Update edit button to show "Cancel" text alongside action buttons
  const editBtn = document.getElementById('profile-edit-toggle');
  if (editBtn) {
    editBtn.innerHTML = '<i class="fas fa-pencil"></i> Editing...';
    editBtn.disabled = true;
    editBtn.style.opacity = '0.6';
  }

  // Show save/cancel buttons
  showProfileActionButtons();

  // Announce to screen readers
  announceA11yChange('Edit mode activated - Profile fields are now editable');

  console.log('Edit mode entered');
}

/**
 * Exit edit mode - Convert inputs back to text
 */
function exitEditMode() {
  const profileTop = document.querySelector('.profile-top');
  const profileAbout = document.querySelector('.profile-about');
  if (!profileTop) return;

  profileTop.classList.remove('editing');
  if (profileAbout) profileAbout.classList.remove('editing');

  // Get edited values
  const nameInput = profileTop.querySelector('.profile-name-input');
  const titleInput = profileTop.querySelector('.profile-title-input');
  const locationInput = profileTop.querySelector('.profile-location-input');
  const bioInput = profileAbout?.querySelector('.profile-bio-input');

  // Convert back to display elements
  if (nameInput) {
    const nameEl = document.createElement('h1');
    nameEl.className = 'large';
    nameEl.textContent = nameInput.value.trim() || 'Name';
    nameInput.replaceWith(nameEl);
  }

  if (titleInput) {
    const titleEl = document.createElement('p');
    titleEl.className = 'lead';
    titleEl.textContent = titleInput.value.trim() || 'Professional Title';
    titleInput.replaceWith(titleEl);
  }

  if (locationInput) {
    const locationEl = document.createElement('p');
    locationEl.textContent = locationInput.value.trim() || 'Location';
    locationInput.replaceWith(locationEl);
  }

  if (bioInput && profileAbout) {
    const bioEl = document.createElement('p');
    bioEl.textContent = bioInput.value.trim() || 'Update your bio';
    bioInput.replaceWith(bioEl);
  }

  // Restore edit button
  const editBtn = document.getElementById('profile-edit-toggle');
  if (editBtn) {
    editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit Profile';
    editBtn.disabled = false;
    editBtn.style.opacity = '1';
  }

  // Hide save/cancel buttons
  hideProfileActionButtons();

  announceA11yChange('Edit mode exited');
  console.log('Edit mode exited');
}

/**
 * Save profile changes
 */
function saveProfileChanges() {
  const profileTop = document.querySelector('.profile-top');
  const profileAbout = document.querySelector('.profile-about');
  const nameInput = profileTop?.querySelector('.profile-name-input');
  const titleInput = profileTop?.querySelector('.profile-title-input');
  const locationInput = profileTop?.querySelector('.profile-location-input');
  const bioInput = profileAbout?.querySelector('.profile-bio-input');

  // Validate inputs
  if (!nameInput?.value.trim()) {
    alert('Please enter your name');
    nameInput?.focus();
    return;
  }

  // Get existing profile data to preserve fields set from create-profile
  const existingData = JSON.parse(localStorage.getItem(PROFILE_STORAGE_KEY) || '{}');

  // Prepare updated data, preserving existing fields
  const profileData = {
    ...existingData, // Preserve all existing fields
    name: nameInput?.value.trim() || '',
    title: titleInput?.value.trim() || '',
    location: locationInput?.value.trim() || '',
    bio: bioInput?.value.trim() || existingData.bio || '',
    lastUpdated: new Date().toISOString(),
  };

  // Save to localStorage
  saveProfileData(profileData);

  // Exit edit mode
  exitEditMode();

  // Show success message
  announceA11yChange('Profile changes saved successfully');
  console.log('Profile saved:', profileData);

  // Visual feedback
  const saveBtn = document.querySelector('.profile-save-btn');
  if (saveBtn) {
    saveBtn.style.opacity = '0.7';
    setTimeout(() => {
      saveBtn.style.opacity = '1';
    }, 200);
  }
}

/**
 * Cancel profile editing and restore original data
 */
function cancelProfileEditing() {
  const profileTop = document.querySelector('.profile-top');
  if (!profileTop) return;

  // Restore original data
  const originalData = JSON.parse(profileTop.dataset.originalData || '{}');

  const nameInput = profileTop.querySelector('.profile-name-input');
  const titleInput = profileTop.querySelector('.profile-title-input');
  const locationInput = profileTop.querySelector('.profile-location-input');

  if (nameInput && originalData.name) nameInput.value = originalData.name;
  if (titleInput && originalData.title) titleInput.value = originalData.title;
  if (locationInput && originalData.location)
    locationInput.value = originalData.location;

  // Exit edit mode
  exitEditMode();

  announceA11yChange('Profile editing cancelled');
  console.log('Profile editing cancelled');
}

/**
 * Show save and cancel buttons
 */
function showProfileActionButtons() {
  // Remove existing action buttons if present
  document
    .querySelectorAll('.profile-save-btn, .profile-cancel-btn')
    .forEach((btn) => btn.remove());

  const { saveBtn, cancelBtn } = createProfileActionButtons();

  // Add buttons to the profile top section
  const profileTop = document.querySelector('.profile-top');
  if (profileTop) {
    const actionsContainer = document.createElement('div');
    actionsContainer.className = 'profile-edit-actions';
    actionsContainer.appendChild(saveBtn);
    actionsContainer.appendChild(cancelBtn);
    profileTop.appendChild(actionsContainer);

    saveBtn.addEventListener('click', saveProfileChanges);
    cancelBtn.addEventListener('click', cancelProfileEditing);

    // Keyboard support
    saveBtn.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        saveProfileChanges();
      }
    });

    cancelBtn.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        cancelProfileEditing();
      }
    });
  }
}

/**
 * Hide save and cancel buttons
 */
function hideProfileActionButtons() {
  const actionsContainer = document.querySelector('.profile-edit-actions');
  if (actionsContainer) {
    actionsContainer.remove();
  }
}

/**
 * Announce changes to screen readers
 * @param {string} message - Message to announce
 */
function announceA11yChange(message) {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.classList.add('sr-only');
  announcement.textContent = message;
  document.body.appendChild(announcement);

  setTimeout(() => {
    announcement.remove();
  }, 3000);
}

/**
 * Restore profile data from localStorage and update DOM
 */
function restoreProfileFromStorage() {
  const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
  if (!stored) return; // No saved data

  const profileData = JSON.parse(stored);
  const profileTop = document.querySelector('.profile-top');

  if (!profileTop) return;

  // Restore name
  const nameEl = profileTop.querySelector('h1.large');
  if (nameEl && profileData.name) {
    nameEl.textContent = profileData.name;
  }

  // Restore title
  const titleEl = profileTop.querySelector('p.lead');
  if (titleEl && profileData.title) {
    titleEl.textContent = profileData.title;
  }

  // Restore location
  const locationEl = profileTop.querySelector('p:not(.lead)');
  if (locationEl && profileData.location) {
    locationEl.textContent = profileData.location;
  }

  console.log('Profile restored from localStorage:', profileData);
}

/**
 * Initialize profile edit functionality
 */
document.addEventListener('DOMContentLoaded', function () {
  // Check if we're on the profile page
  if (document.querySelector('.profile-top')) {
    // Restore saved profile data from localStorage
    restoreProfileFromStorage();

    // Create and inject edit button
    const editBtn = createEditButton();
    const profileTop = document.querySelector('.profile-top');

    // Create container for edit button
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'profile-edit-btn-container';
    buttonContainer.style.marginTop = '1rem';
    buttonContainer.appendChild(editBtn);

    // Insert after photo actions or at the start of profile-top
    const photoActions = profileTop.querySelector('.photo-actions');
    if (photoActions) {
      photoActions.parentElement.insertBefore(
        buttonContainer,
        photoActions.nextSibling,
      );
    } else {
      profileTop.insertBefore(buttonContainer, profileTop.firstChild);
    }

    // Add click event listener
    editBtn.addEventListener('click', toggleEditMode);

    // Keyboard support (Alt + E to toggle edit mode)
    document.addEventListener('keydown', function (e) {
      if (e.altKey && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        toggleEditMode();
      }
    });

    console.log('Profile edit module initialized');
  }
});

/**
 * EXPERIENCE MANAGEMENT FUNCTIONS
 */

/**
 * Get experience list from localStorage
 * @returns {array} - Array of experience objects
 */
function getExperienceList() {
  const stored = localStorage.getItem(EXPERIENCE_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

/**
 * Save experience list to localStorage
 * @param {array} experiences - Array of experience objects
 */
function saveExperienceList(experiences) {
  localStorage.setItem(EXPERIENCE_STORAGE_KEY, JSON.stringify(experiences));
  console.log('Experiences saved:', experiences);
}

/**
 * Add experience with validation
 * @param {object} experienceData - Experience form data
 */
function addExperience(experienceData) {
  if (
    !experienceData.title ||
    !experienceData.company ||
    !experienceData.from
  ) {
    alert('Title, Company, and From Date are required');
    return false;
  }

  const experiences = getExperienceList();
  const newExp = {
    id: Date.now().toString(),
    ...experienceData,
    createdAt: new Date().toISOString(),
  };

  experiences.unshift(newExp); // Add to beginning
  saveExperienceList(experiences);
  renderExperienceList();
  announceA11yChange('Experience added successfully');
  return true;
}

/**
 * Delete experience with confirmation
 * @param {string} expId - Experience ID to delete
 */
function deleteExperience(expId) {
  if (!confirm('Are you sure you want to delete this experience?')) return;

  let experiences = getExperienceList();
  experiences = experiences.filter((exp) => exp.id !== expId);
  saveExperienceList(experiences);
  renderExperienceList();
  announceA11yChange('Experience deleted');
}

/**
 * Render experience list in DOM
 */
/**
 * Format date to readable string
 * @param {string} dateStr - ISO date string (YYYY-MM-DD)
 * @returns {string} - Formatted date (e.g., "Jan 2024")
 */
function formatDate(dateStr) {
  if (!dateStr) return '';
  // Split ISO date string to create local date (avoids timezone offset issues)
  const [year, month, day] = dateStr.split('-');
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
}

/**
 * Render experience list in DOM
 */
function renderExperienceList() {
  let experiences = getExperienceList();
  const container = document.getElementById('profile-exp');

  if (!container) return;

  // Sort experiences: current first, then by most recent
  experiences = experiences.sort((a, b) => {
    if (a.current && !b.current) return -1;
    if (!a.current && b.current) return 1;
    const dateA = new Date(a.to || a.from);
    const dateB = new Date(b.to || b.from);
    return dateB - dateA;
  });

  // Remove only existing experience items (class="experience-list div")
  const existingItems = container.querySelectorAll('.exp-item');
  existingItems.forEach((item) => item.remove());

  // Add new experience items
  experiences.forEach((exp) => {
    const expDiv = document.createElement('div');
    expDiv.className = 'exp-item';
    const currentBadge = exp.current ? '<span class="badge badge-success" style="margin-left: 0.5rem;">Current</span>' : '';
    expDiv.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: start; gap: 1rem;">
        <div style="flex: 1;">
          <h3 class="text-dark">${exp.company}${currentBadge}</h3>
          <p><strong>Position:</strong> ${exp.title}</p>
          ${exp.location ? `<p><strong>Location:</strong> ${exp.location}</p>` : ''}
          <p>
            <strong>From:</strong> ${formatDate(exp.from)}
            ${exp.to ? `<strong>To:</strong> ${formatDate(exp.to)}` : '<strong>To:</strong> Now'}
          </p>
          ${exp.description ? `<p><strong>Description:</strong> ${exp.description}</p>` : ''}
        </div>
        <div style="display: flex; gap: 0.5rem; white-space: nowrap; margin-top: 0.5rem;">
          <button class="btn btn-primary btn-sm" onclick="editExperienceFromProfile('${exp.id}')" style="white-space: nowrap;">
            <i class="fas fa-edit"></i> Edit
          </button>
          <button class="btn btn-danger btn-sm" onclick="deleteExperience('${exp.id}')" style="white-space: nowrap;">
            <i class="fas fa-trash"></i> Delete
          </button>
        </div>
      </div>
      <hr style="margin: 1rem 0;">
    `;
    container.appendChild(expDiv);
  });
}

/**
 * Render education list in DOM
 */
function renderEducationList() {
  let educations = getEducationList();
  const container = document.getElementById('profile-edu');

  if (!container) return;

  // Sort educations: current first, then by most recent
  educations = educations.sort((a, b) => {
    if (a.current && !b.current) return -1;
    if (!a.current && b.current) return 1;
    const dateA = new Date(a.to || a.from);
    const dateB = new Date(b.to || b.from);
    return dateB - dateA;
  });

  // Remove only existing education items
  const existingItems = container.querySelectorAll('.edu-item');
  existingItems.forEach((item) => item.remove());

  // Add new education items
  educations.forEach((edu) => {
    const eduDiv = document.createElement('div');
    eduDiv.className = 'edu-item';
    const currentBadge = edu.current ? '<span class="badge badge-success" style="margin-left: 0.5rem;">Current</span>' : '';
    eduDiv.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: start; gap: 1rem;">
        <div style="flex: 1;">
          <h3 class="text-dark">${edu.school}${currentBadge}</h3>
          <p><strong>Degree:</strong> ${edu.degree}</p>
          ${edu.fieldofstudy ? `<p><strong>Minor:</strong> ${edu.fieldofstudy}</p>` : ''}
          <p>
            <strong>From:</strong> ${formatDate(edu.from)}
            ${edu.to ? `<strong>To:</strong> ${formatDate(edu.to)}` : '<strong>To:</strong> Now'}
          </p>
          ${edu.description ? `<p><strong>Description:</strong> ${edu.description}</p>` : ''}
        </div>
        <div style="display: flex; gap: 0.5rem; white-space: nowrap; margin-top: 0.5rem;">
          <button class="btn btn-primary btn-sm" onclick="editEducationFromProfile('${edu.id}')" style="white-space: nowrap;">
            <i class="fas fa-edit"></i> Edit
          </button>
          <button class="btn btn-danger btn-sm" onclick="deleteEducation('${edu.id}')" style="white-space: nowrap;">
            <i class="fas fa-trash"></i> Delete
          </button>
        </div>
      </div>
      <hr style="margin: 1rem 0;">
    `;
    container.appendChild(eduDiv);
  });
}

/**
 * EDUCATION MANAGEMENT FUNCTIONS
 */

/**
 * Get education list from localStorage
 * @returns {array} - Array of education objects
 */
function getEducationList() {
  const stored = localStorage.getItem(EDUCATION_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

/**
 * Save education list to localStorage
 * @param {array} educations - Array of education objects
 */
function saveEducationList(educations) {
  localStorage.setItem(EDUCATION_STORAGE_KEY, JSON.stringify(educations));
  console.log('Education saved:', educations);
}

/**
 * Add education with validation
 * @param {object} educationData - Education form data
 */
function addEducation(educationData) {
  if (
    !educationData.school ||
    !educationData.degree ||
    !educationData.fieldofstudy ||
    !educationData.from
  ) {
    alert('School, Degree, Minor, and From Date are required');
    return false;
  }

  const educations = getEducationList();
  const newEdu = {
    id: Date.now().toString(),
    ...educationData,
    createdAt: new Date().toISOString(),
  };

  educations.unshift(newEdu); // Add to beginning
  saveEducationList(educations);
  renderEducationList();
  announceA11yChange('Education added successfully');
  return true;
}

/**
 * Delete education with confirmation
 * @param {string} eduId - Education ID to delete
 */
function deleteEducation(eduId) {
  if (!confirm('Are you sure you want to delete this education?')) return;

  let educations = getEducationList();
  educations = educations.filter((edu) => edu.id !== eduId);
  saveEducationList(educations);
  renderEducationList();
  announceA11yChange('Education deleted');
}

/**
 * Edit experience from profile.html - navigate to form page
 * @param {string} expId - Experience ID to edit
 */
function editExperienceFromProfile(expId) {
  sessionStorage.setItem('editingExperienceId', expId);
  window.location.href = 'add-experience.html';
}

/**
 * Edit education from profile.html - navigate to form page
 * @param {string} eduId - Education ID to edit
 */
function editEducationFromProfile(eduId) {
  sessionStorage.setItem('editingEducationId', eduId);
  window.location.href = 'add-education.html';
}

/**
 * Toggle Add Experience Form visibility
 */
function toggleAddExperienceForm() {
  const form = document.getElementById('add-experience-form');
  if (form) {
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
    // Clear form if showing
    if (form.style.display === 'block') {
      form.reset();
    }
  }
}

/**
 * Submit Add Experience Form
 */
function submitAddExperienceForm() {
  const title = document.getElementById('exp-title')?.value.trim();
  const company = document.getElementById('exp-company')?.value.trim();
  const location = document.getElementById('exp-location')?.value.trim();
  const from = document.getElementById('exp-from')?.value;
  const to = document.getElementById('exp-to')?.value;
  const current = document.getElementById('exp-current')?.checked;
  const description = document.getElementById('exp-description')?.value.trim();

  const experienceData = {
    title,
    company,
    location,
    from,
    to: current ? null : to,
    current,
    description,
  };

  if (addExperience(experienceData)) {
    toggleAddExperienceForm();
    document.getElementById('add-experience-form').reset();
  }
}

/**
 * Toggle Add Education Form visibility
 */
function toggleAddEducationForm() {
  const form = document.getElementById('add-education-form');
  if (form) {
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
    // Clear form if showing
    if (form.style.display === 'block') {
      form.reset();
    }
  }
}

/**
 * Submit Add Education Form
 */
function submitAddEducationForm() {
  const school = document.getElementById('edu-school')?.value.trim();
  const degree = document.getElementById('edu-degree')?.value.trim();
  const fieldofstudy = document
    .getElementById('edu-fieldofstudy')
    ?.value.trim();
  const from = document.getElementById('edu-from')?.value;
  const to = document.getElementById('edu-to')?.value;
  const current = document.getElementById('edu-current')?.checked;
  const description = document.getElementById('edu-description')?.value.trim();

  const educationData = {
    school,
    degree,
    fieldofstudy,
    from,
    to: current ? null : to,
    current,
    description,
  };

  if (addEducation(educationData)) {
    toggleAddEducationForm();
    document.getElementById('add-education-form').reset();
  }
}

/**
 * Load and display profile photo from localStorage
 * Syncs across profile.html and dashboard.html
 */
function loadProfilePhoto() {
  const storedPhoto = localStorage.getItem(PROFILE_PHOTO_STORAGE_KEY);
  
  if (storedPhoto) {
    // Update profile.html image
    const profileImg = document.querySelector('.profile-top .round-img');
    if (profileImg) {
      profileImg.src = storedPhoto;
    }
    
    // Update dashboard.html image
    const dashboardImg = document.querySelector('.photo-card .profile-photo');
    if (dashboardImg) {
      dashboardImg.src = storedPhoto;
    }
  }
}

/**
 * Handle photo upload from profile.html or dashboard.html
 * Converts image to base64 and stores in localStorage
 * @param {Event} event - File input change event
 */
function handlePhotoUpload(event) {
  const file = event.target.files[0];
  
  if (!file) return;
  
  // Validate file is an image
  if (!file.type.startsWith('image/')) {
    alert('Please select a valid image file');
    return;
  }
  
  // Validate file size (5MB max)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    alert('File size must be less than 5MB');
    return;
  }
  
  // Read file and convert to base64
  const reader = new FileReader();
  reader.onload = function (e) {
    const photoData = e.target.result; // This is the base64 encoded image
    
    // Store in localStorage
    localStorage.setItem(PROFILE_PHOTO_STORAGE_KEY, photoData);
    
    // Update all profile images on the page
    const profileImg = document.querySelector('.profile-top .round-img');
    if (profileImg) {
      profileImg.src = photoData;
    }
    
    const dashboardImg = document.querySelector('.photo-card .profile-photo');
    if (dashboardImg) {
      dashboardImg.src = photoData;
    }
    
    console.log('Profile photo updated and saved to localStorage');
  };
  
  reader.onerror = function () {
    alert('Error reading file. Please try again.');
  };
  
  reader.readAsDataURL(file);
}

/**
 * Load profile data from localStorage and display on profile.html
 * Updates name, title, company, location, bio, skills, and social links
 */
function loadProfileData() {
  const profileData = localStorage.getItem(PROFILE_STORAGE_KEY);
  if (!profileData) return;

  try {
    const data = JSON.parse(profileData);

    // Update name (h1 in profile-top)
    const nameEl = document.querySelector('.profile-top h1');
    if (nameEl) {
      nameEl.textContent = data.name || 'Profile';
    }

    // Update title and company (p.lead in profile-top)
    const titleEl = document.querySelector('.profile-top .lead');
    if (titleEl) {
      titleEl.textContent = data.title
        ? `${data.title}${data.company ? ' @ ' + data.company : ''}`
        : 'Update your profile';
    }

    // Update location
    const locationEl = document.querySelector('.profile-top > p:not(.lead)');
    if (locationEl) {
      locationEl.textContent = data.location || '';
    }

    // Update bio (show placeholder only if no bio has been entered)
    const bioEl = document.querySelector('.profile-about p');
    if (bioEl) {
      // Only show mock bio if user hasn't created a bio yet
      if (!data.bio || !data.bio.trim()) {
        bioEl.textContent = `Hi 👋, I'm Linda Kovacs and I'm a Sr Software Engineer @ Accenture. Portofolio:

I am a Full Stack Developer, Women Techmakers Ambassador, Google Developer Group Lead for Capital Region, Journalist/Reporter Radio, TV, Magazine. I speak English, Italian, Romanian in daily basis.

In 2020 I enrolled in a 10 months Full Stack Deeveloper online Bootcamp at Tripple Ten, started in Februay 2020. During my leanring journey I helped other students with questions related to course/sprints assignements and projects. The curricullum provides a wide range of projects based on the following Full Stack Development technologies: HTML5, CSS3, flexbox, grid layout, BEM, Media queries, transition, JavaScript/JSX, DOM, Debugging, Git, Git/Github, Figma, Form validation, OOP, Webpack, NPM, React, React components, React Hooks, Node.js, Express.js, Database, MongoDB, Mongoose, API, Microsoft Azure Cloud.`;
      } else {
        // Display user's actual bio
        bioEl.textContent = data.bio;
      }
    }

    // Update skills
    const skillsContainer = document.querySelector('.skills');
    if (skillsContainer && data.skills) {
      const skillsArray = data.skills
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s);
      skillsContainer.innerHTML = skillsArray
        .map((skill) => `<div class="p-1"><i class="fa fa-check"></i> ${skill}</div>`)
        .join('');
    }

    // Update social links (website, linkedin, github, twitter, facebook, youtube, instagram)
    if (data.social) {
      const iconLinks = document.querySelectorAll('.profile-top .icons a');
      if (iconLinks.length >= 7) {
        // Website (globe icon) - index 0
        if (data.social.website) iconLinks[0].href = data.social.website;
        // LinkedIn - index 1
        if (data.social.linkedin) iconLinks[1].href = data.social.linkedin;
        // GitHub - index 2
        if (data.social.github) iconLinks[2].href = data.social.github;
        // Twitter - index 3
        if (data.social.twitter) iconLinks[3].href = data.social.twitter;
        // Facebook - index 4
        if (data.social.facebook) iconLinks[4].href = data.social.facebook;
        // YouTube - index 5
        if (data.social.youtube) iconLinks[5].href = data.social.youtube;
        // Instagram - index 6
        if (data.social.instagram) iconLinks[6].href = data.social.instagram;
      }
    }

    console.log('Profile data loaded from localStorage:', data);
  } catch (e) {
    console.error('Error loading profile data:', e);
  }
}

/**
 * Initialize experience and education rendering on page load
 */
document.addEventListener('DOMContentLoaded', function () {
  loadProfileData();
  renderExperienceList();
  renderEducationList();
  loadProfilePhoto();
  
  // Add photo upload event listeners
  const profilePhotoInput = document.getElementById('profile-photo');
  if (profilePhotoInput) {
    profilePhotoInput.addEventListener('change', handlePhotoUpload);
  }
  
  const dashboardPhotoInput = document.getElementById('dashboard-photo');
  if (dashboardPhotoInput) {
    dashboardPhotoInput.addEventListener('change', handlePhotoUpload);
  }
});
