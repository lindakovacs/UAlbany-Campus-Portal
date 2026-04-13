/**
 * Profile Form Validation
 * Real-time validation with error display for profile form fields
 */

/**
 * Validation rules for profile form fields
 */
const profileValidationRules = {
  name: {
    label: 'Full Name',
    validate: (value) => {
      if (!value || value.trim().length === 0) {
        return 'Full Name is required';
      }
      if (value.trim().length < 2) {
        return 'Full Name must be at least 2 characters';
      }
      if (value.trim().length > 100) {
        return 'Full Name must be less than 100 characters';
      }
      return null;
    },
  },
  title: {
    label: 'Professional Title',
    validate: (value) => {
      if (!value || value.trim().length === 0) {
        return 'Professional Title is required';
      }
      if (value.trim().length < 2) {
        return 'Professional Title must be at least 2 characters';
      }
      if (value.trim().length > 100) {
        return 'Professional Title must be less than 100 characters';
      }
      return null;
    },
  },
  company: {
    label: 'Company',
    validate: (value) => {
      if (!value || value.trim().length === 0) {
        return 'Company is required';
      }
      if (value.trim().length < 2) {
        return 'Company must be at least 2 characters';
      }
      if (value.trim().length > 100) {
        return 'Company must be less than 100 characters';
      }
      return null;
    },
  },
  status: {
    label: 'Professional Status',
    validate: (value) => {
      if (!value || value === '0') {
        return 'Professional Status is required';
      }
      return null;
    },
  },
  location: {
    label: 'Location',
    validate: (value) => {
      if (value && value.trim().length > 100) {
        return 'Location must be less than 100 characters';
      }
      return null;
    },
  },
  skills: {
    label: 'Skills',
    validate: (value) => {
      if (!value || value.trim().length === 0) {
        return 'Skills are required. Add at least one skill.';
      }
      // Check if there's at least one comma-separated skill
      const skills = value.split(',').filter((s) => s.trim().length > 0);
      if (skills.length === 0) {
        return 'Add at least one skill (comma-separated)';
      }
      return null;
    },
  },
  bio: {
    label: 'Bio',
    validate: (value) => {
      if (value && value.trim().length > 500) {
        return 'Bio must be less than 500 characters';
      }
      return null;
    },
  },
  website: {
    label: 'Website',
    validate: (value) => {
      if (!value) return null; // Optional field
      if (!isValidURL(value)) {
        return 'Enter a valid website URL';
      }
      return null;
    },
  },
  linkedin: {
    label: 'LinkedIn',
    validate: (value) => {
      if (!value) return null;
      if (!isValidURL(value)) {
        return 'Enter a valid LinkedIn URL';
      }
      return null;
    },
  },
  github: {
    label: 'GitHub',
    validate: (value) => {
      if (!value) return null;
      if (!isValidURL(value)) {
        return 'Enter a valid GitHub URL';
      }
      return null;
    },
  },
  twitter: {
    label: 'Twitter',
    validate: (value) => {
      if (!value) return null;
      if (!isValidURL(value)) {
        return 'Enter a valid Twitter URL';
      }
      return null;
    },
  },
  facebook: {
    label: 'Facebook',
    validate: (value) => {
      if (!value) return null;
      if (!isValidURL(value)) {
        return 'Enter a valid Facebook URL';
      }
      return null;
    },
  },
  youtube: {
    label: 'YouTube',
    validate: (value) => {
      if (!value) return null;
      if (!isValidURL(value)) {
        return 'Enter a valid YouTube URL';
      }
      return null;
    },
  },
  instagram: {
    label: 'Instagram',
    validate: (value) => {
      if (!value) return null;
      if (!isValidURL(value)) {
        return 'Enter a valid Instagram URL';
      }
      return null;
    },
  },
};

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} - True if valid URL
 */
function isValidURL(url) {
  try {
    new URL(url.startsWith('http') ? url : `https://${url}`);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Display validation error below field
 * @param {HTMLElement} field - Form field
 * @param {string} errorMessage - Error message
 */
function displayFieldError(field, errorMessage) {
  // Remove existing error message
  const existingError = field.parentElement.querySelector(
    '.field-error-message',
  );
  if (existingError) {
    existingError.remove();
  }

  if (!errorMessage) {
    field.classList.remove('input-error');
    return;
  }

  // Add error styling to field
  field.classList.add('input-error');

  // Create and display error message
  const errorDiv = document.createElement('div');
  errorDiv.className = 'field-error-message';
  errorDiv.textContent = errorMessage;
  errorDiv.style.cssText = `
    color: #e74c3c;
    font-size: 0.85rem;
    margin-top: 0.25rem;
    margin-bottom: 0.5rem;
  `;

  field.parentElement.appendChild(errorDiv);
}

/**
 * Clear validation error from field
 * @param {HTMLElement} field - Form field
 */
function clearFieldError(field) {
  const existingError = field.parentElement.querySelector(
    '.field-error-message',
  );
  if (existingError) {
    existingError.remove();
  }
  field.classList.remove('input-error');
}

/**
 * Validate a single field
 * @param {HTMLElement} field - Form field to validate
 * @returns {string|null} - Error message or null if valid
 */
function validateProfileField(field) {
  const fieldName = field.name;
  const fieldValue = field.value;

  if (!profileValidationRules[fieldName]) {
    return null; // No validation rule for this field
  }

  return profileValidationRules[fieldName].validate(fieldValue);
}

/**
 * Setup real-time validation for a form field
 * @param {HTMLElement} field - Form field
 */
function setupFieldValidation(field) {
  // Validate on blur (when user leaves the field)
  field.addEventListener('blur', function () {
    const error = validateProfileField(this);
    if (error) {
      displayFieldError(this, error);
    } else {
      clearFieldError(this);
    }
  });

  // Clear error on focus (when user starts typing)
  field.addEventListener('focus', function () {
    clearFieldError(this);
  });

  // Validate on input for better UX
  field.addEventListener('input', function () {
    const error = validateProfileField(this);
    if (error && this.value.trim().length > 0) {
      // Only show error if field has content
      displayFieldError(this, error);
    }
  });
}

/**
 * Validate entire profile form
 * @param {HTMLFormElement} form - Form to validate
 * @returns {Object} - { isValid: boolean, errors: {fieldName: errorMessage} }
 */
function validateProfileForm(form) {
  const errors = {};
  const formFields = form.querySelectorAll('input, select, textarea');

  formFields.forEach((field) => {
    if (!field.name) return; // Skip fields without name attribute

    const error = validateProfileField(field);
    if (error) {
      errors[field.name] = error;
      displayFieldError(field, error);
    } else {
      clearFieldError(field);
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Setup real-time validation for entire form
 * @param {HTMLFormElement} form - Form to setup validation
 */
function setupFormValidation(form) {
  const fields = form.querySelectorAll('input, select, textarea');

  fields.forEach((field) => {
    if (!field.name) return;
    setupFieldValidation(field);
  });
}

/**
 * Add CSS styles for error states
 */
function addErrorStyles() {
  if (document.getElementById('profile-form-error-styles')) {
    return; // Already added
  }

  const style = document.createElement('style');
  style.id = 'profile-form-error-styles';
  style.textContent = `
    .input-error {
      border-color: #e74c3c !important;
      background-color: #fadbd8;
    }
    
    .input-error:focus {
      border-color: #e74c3c !important;
      box-shadow: 0 0 0 0.2rem rgba(231, 76, 60, 0.25) !important;
    }
    
    .field-error-message {
      color: #e74c3c;
      font-size: 0.85rem;
      margin-top: 0.25rem;
      display: block;
    }
  `;
  document.head.appendChild(style);
}

// Initialize validation when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
  // Add error styles
  addErrorStyles();

  // Find the profile form
  const form = document.getElementById('create-profile-form');
  if (form) {
    setupFormValidation(form);
  }
});
