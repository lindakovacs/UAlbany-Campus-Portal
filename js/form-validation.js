/**
 * Form Validation Module
 * Handles validation for login and registration forms
 * Uses: Variables, Functions, Events, Regular Expressions
 */

// Regular expression patterns for validation
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordMinLength = 6;
const nameMinLength = 2;

/**
 * Validates email format
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if valid email format
 */
function isValidEmail(email) {
  return emailPattern.test(email);
}

/**
 * Validates password requirements
 * @param {string} password - Password to validate
 * @returns {object} - Object with isValid and message properties
 */
function isValidPassword(password) {
  const isValid = password.length >= passwordMinLength;
  const message = isValid
    ? ''
    : `Password must be at least ${passwordMinLength} characters`;
  return { isValid, message };
}

/**
 * Validates name field
 * @param {string} name - Name to validate
 * @returns {object} - Object with isValid and message properties
 */
function isValidName(name) {
  const isValid = name.trim().length >= nameMinLength;
  const message = isValid
    ? ''
    : `Name must be at least ${nameMinLength} characters`;
  return { isValid, message };
}

/**
 * Validates phone number (optional, US format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid phone format or empty
 */
function isValidPhone(phone) {
  if (phone === '' || phone === undefined) return true;
  const phonePattern =
    /^(\+?1?)[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/;
  return phonePattern.test(phone);
}

/**
 * Shows error message below a form field
 * @param {HTMLElement} field - Form field element
 * @param {string} message - Error message to display
 */
function showError(field, message) {
  // Remove existing error if present
  const existingError = field.parentElement.querySelector('.error-message');
  if (existingError) {
    existingError.remove();
  }

  // Add aria-invalid for accessibility
  field.setAttribute('aria-invalid', 'true');

  if (message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.setAttribute('role', 'alert');
    errorDiv.textContent = message;
    field.parentElement.appendChild(errorDiv);
  }
}

/**
 * Clears error message from a form field
 * @param {HTMLElement} field - Form field element
 */
function clearError(field) {
  const existingError = field.parentElement.querySelector('.error-message');
  if (existingError) {
    existingError.remove();
  }
  field.setAttribute('aria-invalid', 'false');
}

/**
 * Validates login form
 * @param {Event} event - Form submission event
 * @returns {boolean} - True if form is valid
 */
function validateLoginForm(event) {
  event.preventDefault();

  const form = event.target;
  const emailField = form.querySelector('input[name="email"]');
  const passwordField = form.querySelector('input[name="password"]');

  let isFormValid = true;

  // Validate email
  if (!emailField.value.trim()) {
    showError(emailField, 'Email is required');
    isFormValid = false;
  } else if (!isValidEmail(emailField.value)) {
    showError(emailField, 'Please enter a valid email address');
    isFormValid = false;
  } else {
    clearError(emailField);
  }

  // Validate password
  if (!passwordField.value) {
    showError(passwordField, 'Password is required');
    isFormValid = false;
  } else {
    clearError(passwordField);
  }

  // Submit form if valid
  if (isFormValid) {
    console.log('Login form is valid - ready to submit');
    // In a real app, you would submit to a backend API here
    // form.submit();
  }

  return isFormValid;
}

/**
 * Validates registration form
 * @param {Event} event - Form submission event
 * @returns {boolean} - True if form is valid
 */
function validateRegisterForm(event) {
  event.preventDefault();

  const form = event.target;
  const nameField = form.querySelector('input[name="name"]');
  const emailField = form.querySelector('input[name="email"]');
  const passwordField = form.querySelector('input[name="password"]');
  const password2Field = form.querySelector('input[name="password2"]');

  let isFormValid = true;

  // Validate name
  if (!nameField || !nameField.value.trim()) {
    if (nameField) {
      showError(nameField, 'Name is required');
    }
    isFormValid = false;
  } else {
    const nameValidation = isValidName(nameField.value);
    if (!nameValidation.isValid) {
      showError(nameField, nameValidation.message);
      isFormValid = false;
    } else {
      clearError(nameField);
    }
  }

  // Validate email
  if (!emailField.value.trim()) {
    showError(emailField, 'Email is required');
    isFormValid = false;
  } else if (!isValidEmail(emailField.value)) {
    showError(emailField, 'Please enter a valid email address');
    isFormValid = false;
  } else {
    clearError(emailField);
  }

  // Validate password
  if (!passwordField.value) {
    showError(passwordField, 'Password is required');
    isFormValid = false;
  } else {
    const passwordValidation = isValidPassword(passwordField.value);
    if (!passwordValidation.isValid) {
      showError(passwordField, passwordValidation.message);
      isFormValid = false;
    } else {
      clearError(passwordField);
    }
  }

  // Validate password confirmation
  if (password2Field) {
    if (!password2Field.value) {
      showError(password2Field, 'Password confirmation is required');
      isFormValid = false;
    } else if (passwordField.value !== password2Field.value) {
      showError(password2Field, 'Passwords do not match');
      isFormValid = false;
    } else {
      clearError(password2Field);
    }
  }

  console.log('Registration form valid:', isFormValid);
  return isFormValid;
}

/**
 * Initializes real-time field validation
 * Clears error messages as user types valid input
 * @param {HTMLElement} field - Form field to validate
 */
function initializeFieldValidation(field) {
  field.addEventListener('blur', function () {
    const fieldName = this.name;

    if (fieldName === 'email') {
      if (this.value.trim() && !isValidEmail(this.value)) {
        showError(this, 'Please enter a valid email address');
      } else {
        clearError(this);
      }
    } else if (fieldName === 'password') {
      if (this.value) {
        const validation = isValidPassword(this.value);
        if (!validation.isValid) {
          showError(this, validation.message);
        } else {
          clearError(this);
        }
      }
    } else if (fieldName === 'name') {
      if (this.value.trim()) {
        const validation = isValidName(this.value);
        if (!validation.isValid) {
          showError(this, validation.message);
        } else {
          clearError(this);
        }
      }
    } else if (fieldName === 'phone') {
      if (this.value && !isValidPhone(this.value)) {
        showError(this, 'Please enter a valid phone number');
      } else {
        clearError(this);
      }
    }
  });

  // Clear error on input if user starts typing valid content
  field.addEventListener('input', function () {
    const errorDiv = this.parentElement.querySelector('.error-message');
    if (errorDiv && this.value.trim()) {
      clearError(this);
    }
  });
}

/**
 * DOM Ready - Attach event listeners to forms
 */
document.addEventListener('DOMContentLoaded', function () {
  // Login form
  const loginForm = document.querySelector('form[action="dashboard.html"]');
  if (loginForm) {
    loginForm.addEventListener('submit', validateLoginForm);

    // Initialize field validation
    const fields = loginForm.querySelectorAll(
      'input[type="email"], input[type="password"]',
    );
    fields.forEach((field) => initializeFieldValidation(field));
  }

  // Registration form (on register.html)
  const registerForm = document.querySelector('form.form');
  if (registerForm && document.title.includes('Register')) {
    registerForm.addEventListener('submit', validateRegisterForm);

    // Initialize field validation
    const fields = registerForm.querySelectorAll(
      'input[type="text"], input[type="email"], input[type="password"]',
    );
    fields.forEach((field) => initializeFieldValidation(field));
  }
});
