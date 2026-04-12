/**
 * Experience/Education CRUD Module
 * Allows users to add, edit, and delete experience and education entries
 * Uses: Variables, Objects, Events, Functions, Loops, localStorage
 */

// Storage keys
const EXPERIENCE_STORAGE_KEY = 'experienceData';
const EDUCATION_STORAGE_KEY = 'educationData';

/**
 * Initialize experience data from localStorage
 * @returns {array} - Array of experience entries
 */
function getExperienceData() {
  const stored = localStorage.getItem(EXPERIENCE_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

/**
 * Initialize education data from localStorage
 * @returns {array} - Array of education entries
 */
function getEducationData() {
  const stored = localStorage.getItem(EDUCATION_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

/**
 * Save experience data to localStorage
 * @param {array} experienceData - Array of experience entries
 */
function saveExperienceData(experienceData) {
  localStorage.setItem(EXPERIENCE_STORAGE_KEY, JSON.stringify(experienceData));
  console.log('Experience data saved:', experienceData);
}

/**
 * Save education data to localStorage
 * @param {array} educationData - Array of education entries
 */
function saveEducationData(educationData) {
  localStorage.setItem(EDUCATION_STORAGE_KEY, JSON.stringify(educationData));
  console.log('Education data saved:', educationData);
}

/**
 * Generate unique ID for experience/education entries
 * @returns {string} - Unique ID
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Create add experience button
 * @returns {HTMLElement} - Add button
 */
function createAddExperienceBtn() {
  const button = document.createElement('button');
  button.className = 'btn btn-primary add-experience-btn';
  button.setAttribute('aria-label', 'Add new experience entry');
  button.innerHTML = '<i class="fas fa-plus"></i> Add Experience';
  return button;
}

/**
 * Create add education button
 * @returns {HTMLElement} - Add button
 */
function createAddEducationBtn() {
  const button = document.createElement('button');
  button.className = 'btn btn-primary add-education-btn';
  button.setAttribute('aria-label', 'Add new education entry');
  button.innerHTML = '<i class="fas fa-plus"></i> Add Education';
  return button;
}

/**
 * Create experience entry form
 * @param {object} entry - Experience entry data (optional for new entries)
 * @returns {HTMLElement} - Form element
 */
function createExperienceForm(entry) {
  const form = document.createElement('form');
  form.className = 'experience-form exp-entry-form';
  form.setAttribute('data-entry-id', entry?.id || generateId());
  form.innerHTML = `
    <div class="form-group">
      <label for="company-${entry?.id}">Company Name *</label>
      <input 
        type="text" 
        id="company-${entry?.id}" 
        class="form-control exp-company" 
        value="${entry?.company || ''}" 
        placeholder="Company Name" 
        required
        aria-label="Company name"
      />
    </div>
    <div class="form-row">
      <div class="form-group">
        <label for="exp-title-${entry?.id}">Position *</label>
        <input 
          type="text" 
          id="exp-title-${entry?.id}" 
          class="form-control exp-title" 
          value="${entry?.title || ''}" 
          placeholder="Job Title" 
          required
          aria-label="Job title"
        />
      </div>
      <div class="form-group">
        <label for="exp-from-${entry?.id}">From Date *</label>
        <input 
          type="text" 
          id="exp-from-${entry?.id}" 
          class="form-control exp-from" 
          value="${entry?.from || ''}" 
          placeholder="MM/DD/YYYY" 
          required
          aria-label="Start date"
        />
      </div>
      <div class="form-group">
        <label for="exp-to-${entry?.id}">To Date</label>
        <input 
          type="text" 
          id="exp-to-${entry?.id}" 
          class="form-control exp-to" 
          value="${entry?.to && entry.to !== 'Current' ? entry.to : ''}" 
          placeholder="MM/DD/YYYY" 
          aria-label="End date"
          ${entry?.to === 'Current' ? 'disabled' : ''}
        />
      </div>
      <div class="form-group checkbox-group">
        <label for="exp-current-${entry?.id}">
          <input 
            type="checkbox" 
            id="exp-current-${entry?.id}" 
            class="exp-current-checkbox" 
            ${entry?.to === 'Current' ? 'checked' : ''}
            aria-label="Currently working here"
          />
          Currently Working Here
        </label>
      </div>
    </div>
    <div class="form-group">
      <label for="exp-desc-${entry?.id}">Description</label>
      <textarea 
        id="exp-desc-${entry?.id}" 
        class="form-control exp-description" 
        placeholder="Job description and responsibilities"
        aria-label="Job description"
      >${entry?.description || ''}</textarea>
    </div>
    <div class="form-actions">
      <button type="submit" class="btn btn-success" aria-label="Save experience entry">
        <i class="fas fa-check"></i> Save
      </button>
      <button type="button" class="btn btn-danger cancel-btn" aria-label="Cancel">
        <i class="fas fa-times"></i> Cancel
      </button>
      ${entry ? `<button type="button" class="btn btn-danger delete-btn" aria-label="Delete this experience entry">
        <i class="fas fa-trash"></i> Delete
      </button>` : ''}
    </div>
  `;
  return form;
}

/**
 * Create education entry form
 * @param {object} entry - Education entry data (optional for new entries)
 * @returns {HTMLElement} - Form element
 */
function createEducationForm(entry) {
  const form = document.createElement('form');
  form.className = 'education-form edu-entry-form';
  form.setAttribute('data-entry-id', entry?.id || generateId());
  form.innerHTML = `
    <div class="form-group">
      <label for="school-${entry?.id}">School/University *</label>
      <input 
        type="text" 
        id="school-${entry?.id}" 
        class="form-control edu-school" 
        value="${entry?.school || ''}" 
        placeholder="School or University" 
        required
        aria-label="School name"
      />
    </div>
    <div class="form-row">
      <div class="form-group">
        <label for="degree-${entry?.id}">Degree *</label>
        <input 
          type="text" 
          id="degree-${entry?.id}" 
          class="form-control edu-degree" 
          value="${entry?.degree || ''}" 
          placeholder="Degree (e.g., Bachelor's, Master's)" 
          required
          aria-label="Degree type"
        />
      </div>
      <div class="form-group">
        <label for="field-${entry?.id}">Minor *</label>
        <input 
          type="text" 
          id="field-${entry?.id}" 
          class="form-control edu-field" 
          value="${entry?.field || ''}" 
          placeholder="Minor" 
          required
          aria-label="Minor"
        />
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label for="edu-from-${entry?.id}">From Date *</label>
        <input 
          type="text" 
          id="edu-from-${entry?.id}" 
          class="form-control edu-from" 
          value="${entry?.from || ''}" 
          placeholder="MM/DD/YYYY" 
          required
          aria-label="Start date"
        />
      </div>
      <div class="form-group">
        <label for="edu-to-${entry?.id}">To Date *</label>
        <input 
          type="text" 
          id="edu-to-${entry?.id}" 
          class="form-control edu-to" 
          value="${entry?.to && entry.to !== 'Current' ? entry.to : ''}" 
          placeholder="MM/DD/YYYY" 
          required
          aria-label="End date"
          ${entry?.to === 'Current' ? 'disabled' : ''}
        />
      </div>
      <div class="form-group checkbox-group">
        <label for="edu-current-${entry?.id}">
          <input 
            type="checkbox" 
            id="edu-current-${entry?.id}" 
            class="edu-current-checkbox" 
            ${entry?.to === 'Current' ? 'checked' : ''}
            aria-label="Currently attending"
          />
          Currently Attending
        </label>
      </div>
    </div>
    <div class="form-group">
      <label for="edu-desc-${entry?.id}">Description</label>
      <textarea 
        id="edu-desc-${entry?.id}" 
        class="form-control edu-description" 
        placeholder="Additional description (optional)"
        aria-label="Education description"
      >${entry?.description || ''}</textarea>
    </div>
    <div class="form-actions">
      <button type="submit" class="btn btn-success" aria-label="Save education entry">
        <i class="fas fa-check"></i> Save
      </button>
      <button type="button" class="btn btn-danger cancel-btn" aria-label="Cancel">
        <i class="fas fa-times"></i> Cancel
      </button>
      ${entry ? `<button type="button" class="btn btn-danger delete-btn" aria-label="Delete this education entry">
        <i class="fas fa-trash"></i> Delete
      </button>` : ''}
    </div>
  `;
  return form;
}

/**
 * Restore experience entries from localStorage to DOM
 */
function restoreExperienceEntries() {
  const expData = getExperienceData();
  const profileExp = document.querySelector('.profile-exp');

  if (!profileExp || !expData.length) return;

  // Find or create container for entries (after h2)
  let entriesContainer = profileExp.querySelector('.exp-entries-container');
  if (!entriesContainer) {
    entriesContainer = document.createElement('div');
    entriesContainer.className = 'exp-entries-container';
    profileExp.appendChild(entriesContainer);
  }

  // Clear existing restored entries (keep original template)
  entriesContainer.innerHTML = '';

  // Restore each entry - Loop through experienceData
  expData.forEach((entry) => {
    const entryDiv = document.createElement('div');
    entryDiv.className = 'exp-entry-display';
    entryDiv.setAttribute('data-entry-id', entry.id);
    entryDiv.innerHTML = `
      <h3 class="text-dark">${escapeHtml(entry.company)}</h3>
      <p>${escapeHtml(entry.from)} - ${escapeHtml(entry.to)}</p>
      <p><strong>Position: </strong>${escapeHtml(entry.title)}</p>
      ${entry.description ? `<p><strong>Description: </strong>${escapeHtml(entry.description)}</p>` : ''}
      <div class="entry-actions">
        <button class="btn btn-small btn-light edit-entry-btn" aria-label="Edit this experience entry">
          <i class="fas fa-edit"></i> Edit
        </button>
        <button class="btn btn-small btn-danger delete-entry-btn" aria-label="Delete this experience entry">
          <i class="fas fa-trash"></i> Delete
        </button>
      </div>
    `;

    entryDiv.querySelector('.edit-entry-btn').addEventListener('click', () => {
      editExperienceEntry(entry);
    });

    entryDiv.querySelector('.delete-entry-btn').addEventListener('click', () => {
      deleteExperienceEntry(entry.id);
    });

    entriesContainer.appendChild(entryDiv);
  });

  console.log('Experience entries restored:', expData);
}

/**
 * Restore education entries from localStorage to DOM
 */
function restoreEducationEntries() {
  const eduData = getEducationData();
  const profileEdu = document.querySelector('.profile-edu');

  if (!profileEdu || !eduData.length) return;

  // Find or create container for entries (after h2)
  let entriesContainer = profileEdu.querySelector('.edu-entries-container');
  if (!entriesContainer) {
    entriesContainer = document.createElement('div');
    entriesContainer.className = 'edu-entries-container';
    profileEdu.appendChild(entriesContainer);
  }

  // Clear existing restored entries
  entriesContainer.innerHTML = '';

  // Restore each entry - Loop through educationData
  eduData.forEach((entry) => {
    const entryDiv = document.createElement('div');
    entryDiv.className = 'edu-entry-display';
    entryDiv.setAttribute('data-entry-id', entry.id);
    entryDiv.innerHTML = `
      <h3>${escapeHtml(entry.school)}</h3>
      <p>${escapeHtml(entry.from)} - ${escapeHtml(entry.to)}</p>
      <p><strong>Degree: </strong>${escapeHtml(entry.degree)}</p>
      <p><strong>Minor: </strong>${escapeHtml(entry.field)}</p>
      ${entry.description ? `<p><strong>Description: </strong>${escapeHtml(entry.description)}</p>` : ''}
      <div class="entry-actions">
        <button class="btn btn-small btn-light edit-entry-btn" aria-label="Edit this education entry">
          <i class="fas fa-edit"></i> Edit
        </button>
        <button class="btn btn-small btn-danger delete-entry-btn" aria-label="Delete this education entry">
          <i class="fas fa-trash"></i> Delete
        </button>
      </div>
    `;

    entryDiv.querySelector('.edit-entry-btn').addEventListener('click', () => {
      editEducationEntry(entry);
    });

    entryDiv.querySelector('.delete-entry-btn').addEventListener('click', () => {
      deleteEducationEntry(entry.id);
    });

    entriesContainer.appendChild(entryDiv);
  });

  console.log('Education entries restored:', eduData);
}

/**
 * Add new experience entry
 */
function addExperienceEntry() {
  const profileExp = document.querySelector('.profile-exp');
  if (!profileExp) return;

  const form = createExperienceForm();
  profileExp.insertBefore(form, profileExp.firstChild.nextSibling);

  // Focus on first input for accessibility
  setTimeout(() => {
    form.querySelector('input:first-of-type').focus();
  }, 100);

  // Handle form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    saveExperienceEntry(form);
  });

  // Handle cancel
  form.querySelector('.cancel-btn').addEventListener('click', () => {
    form.remove();
  });

  // Handle "Current" checkbox to toggle To Date field
  const currentCheckbox = form.querySelector('.exp-current-checkbox');
  const toDateInput = form.querySelector('.exp-to');
  
  if (currentCheckbox) {
    currentCheckbox.addEventListener('change', (e) => {
      if (e.target.checked) {
        toDateInput.disabled = true;
        toDateInput.value = '';
      } else {
        toDateInput.disabled = false;
      }
    });
  }
}

/**
 * Add new education entry
 */
function addEducationEntry() {
  const profileEdu = document.querySelector('.profile-edu');
  if (!profileEdu) return;

  const form = createEducationForm();
  profileEdu.insertBefore(form, profileEdu.firstChild.nextSibling);

  // Focus on first input
  setTimeout(() => {
    form.querySelector('input:first-of-type').focus();
  }, 100);

  // Handle form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    saveEducationEntry(form);
  });

  // Handle cancel
  form.querySelector('.cancel-btn').addEventListener('click', () => {
    form.remove();
  });

  // Handle "Currently Attending" checkbox to toggle To Date field
  const currentCheckbox = form.querySelector('.edu-current-checkbox');
  const toDateInput = form.querySelector('.edu-to');
  
  if (currentCheckbox) {
    currentCheckbox.addEventListener('change', (e) => {
      if (e.target.checked) {
        toDateInput.disabled = true;
        toDateInput.value = '';
      } else {
        toDateInput.disabled = false;
      }
    });
  }
}

/**
 * Edit experience entry
 * @param {object} entry - Experience entry to edit
 */
function editExperienceEntry(entry) {
  const profileExp = document.querySelector('.profile-exp');
  const entryDisplay = profileExp?.querySelector(`[data-entry-id="${entry.id}"]`);

  if (!entryDisplay) return;

  const form = createExperienceForm(entry);
  entryDisplay.replaceWith(form);

  // Focus on first input
  setTimeout(() => {
    form.querySelector('input:first-of-type').focus();
  }, 100);

  // Handle form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    saveExperienceEntry(form);
  });

  // Handle cancel
  form.querySelector('.cancel-btn').addEventListener('click', () => {
    form.replaceWith(entryDisplay);
  });

  // Handle delete
  form.querySelector('.delete-btn')?.addEventListener('click', () => {
    deleteExperienceEntry(entry.id);
  });

  // Handle "Current" checkbox to toggle To Date field
  const currentCheckbox = form.querySelector('.exp-current-checkbox');
  const toDateInput = form.querySelector('.exp-to');
  
  if (currentCheckbox) {
    currentCheckbox.addEventListener('change', (e) => {
      if (e.target.checked) {
        toDateInput.disabled = true;
        toDateInput.value = '';
      } else {
        toDateInput.disabled = false;
      }
    });
  }
}

/**
 * Edit education entry
 * @param {object} entry - Education entry to edit
 */
function editEducationEntry(entry) {
  const profileEdu = document.querySelector('.profile-edu');
  const entryDisplay = profileEdu?.querySelector(`[data-entry-id="${entry.id}"]`);

  if (!entryDisplay) return;

  const form = createEducationForm(entry);
  entryDisplay.replaceWith(form);

  // Focus on first input
  setTimeout(() => {
    form.querySelector('input:first-of-type').focus();
  }, 100);

  // Handle form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    saveEducationEntry(form);
  });

  // Handle cancel
  form.querySelector('.cancel-btn').addEventListener('click', () => {
    form.replaceWith(entryDisplay);
  });

  // Handle delete
  form.querySelector('.delete-btn')?.addEventListener('click', () => {
    deleteEducationEntry(entry.id);
  });

  // Handle "Currently Attending" checkbox to toggle To Date field
  const currentCheckbox = form.querySelector('.edu-current-checkbox');
  const toDateInput = form.querySelector('.edu-to');
  
  if (currentCheckbox) {
    currentCheckbox.addEventListener('change', (e) => {
      if (e.target.checked) {
        toDateInput.disabled = true;
        toDateInput.value = '';
      } else {
        toDateInput.disabled = false;
      }
    });
  }
}

/**
 * Save experience entry to localStorage
 * @param {HTMLElement} form - Form element containing entry data
 */
function saveExperienceEntry(form) {
  const entryId = form.getAttribute('data-entry-id');
  const company = form.querySelector('.exp-company').value.trim();
  const title = form.querySelector('.exp-title').value.trim();
  const from = form.querySelector('.exp-from').value.trim();
  const toInput = form.querySelector('.exp-to').value.trim();
  const isCurrent = form.querySelector('.exp-current-checkbox')?.checked || false;
  const to = isCurrent ? 'Current' : toInput;
  const description = form.querySelector('.exp-description').value.trim();

  if (!company || !title || !from) {
    alert('Please fill in required fields: Company, Position, and From Date');
    return;
  }

  let experienceData = getExperienceData();

  // Check if updating existing entry
  const existingIndex = experienceData.findIndex((exp) => exp.id === entryId);

  const newEntry = {
    id: entryId,
    company,
    title,
    from,
    to: to || 'Current',
    description,
    lastUpdated: new Date().toISOString(),
  };

  if (existingIndex !== -1) {
    experienceData[existingIndex] = newEntry;
  } else {
    experienceData.unshift(newEntry);
  }

  saveExperienceData(experienceData);
  form.remove();
  restoreExperienceEntries();
  populateDashboardTables();

  announceA11yChange('Experience entry saved successfully');
  console.log('Experience entry saved:', newEntry);
}

/**
 * Save education entry to localStorage
 * @param {HTMLElement} form - Form element containing entry data
 */
function saveEducationEntry(form) {
  const entryId = form.getAttribute('data-entry-id');
  const school = form.querySelector('.edu-school').value.trim();
  const degree = form.querySelector('.edu-degree').value.trim();
  const field = form.querySelector('.edu-field').value.trim();
  const from = form.querySelector('.edu-from').value.trim();
  const toInput = form.querySelector('.edu-to').value.trim();
  const isCurrent = form.querySelector('.edu-current-checkbox')?.checked || false;
  const to = isCurrent ? 'Current' : toInput;
  const description = form.querySelector('.edu-description').value.trim();

  if (!school || !degree || !field || !from) {
    alert('Please fill in all required fields: School, Degree, Minor, and From Date');
    return;
  }

  let educationData = getEducationData();

  // Check if updating existing entry
  const existingIndex = educationData.findIndex((edu) => edu.id === entryId);

  const newEntry = {
    id: entryId,
    school,
    degree,
    field,
    from,
    to: to || 'Current',
    description,
    lastUpdated: new Date().toISOString(),
  };

  if (existingIndex !== -1) {
    educationData[existingIndex] = newEntry;
  } else {
    educationData.unshift(newEntry);
  }

  saveEducationData(educationData);
  form.remove();
  restoreEducationEntries();
  populateDashboardTables();

  announceA11yChange('Education entry saved successfully');
  console.log('Education entry saved:', newEntry);
}

/**
 * Delete experience entry
 * @param {string} entryId - ID of entry to delete
 */
function deleteExperienceEntry(entryId) {
  if (!confirm('Are you sure you want to delete this experience entry?')) {
    return;
  }

  let experienceData = getExperienceData();
  experienceData = experienceData.filter((exp) => exp.id !== entryId);
  saveExperienceData(experienceData);
  restoreExperienceEntries();
  populateDashboardTables();

  announceA11yChange('Experience entry deleted');
  console.log('Experience entry deleted:', entryId);
}

/**
 * Delete education entry
 * @param {string} entryId - ID of entry to delete
 */
function deleteEducationEntry(entryId) {
  if (!confirm('Are you sure you want to delete this education entry?')) {
    return;
  }

  let educationData = getEducationData();
  educationData = educationData.filter((edu) => edu.id !== entryId);
  saveEducationData(educationData);
  restoreEducationEntries();
  populateDashboardTables();

  announceA11yChange('Education entry deleted');
  console.log('Education entry deleted:', entryId);
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Populate dashboard tables with experience and education data
 */
function populateDashboardTables() {
  // Find all tables on the page
  const tables = document.querySelectorAll('.table tbody');
  
  if (tables.length < 2) {
    console.log('Dashboard tables not found on this page');
    return;
  }

  // First table should be experience, second should be education
  const expTableBody = tables[0];
  const eduTableBody = tables[1];

  // Populate Experience table
  if (expTableBody) {
    const experienceData = getExperienceData();
    expTableBody.innerHTML = '';

    // Loop through experience data and create table rows
    experienceData.forEach((entry) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${escapeHtml(entry.company)}</td>
        <td class="hide-sm">${escapeHtml(entry.title)}</td>
        <td class="hide-sm">${escapeHtml(entry.from)} - ${escapeHtml(entry.to)}</td>
        <td>
          <button class="btn btn-danger delete-exp-btn" data-entry-id="${entry.id}" aria-label="Delete experience entry">
            Delete
          </button>
        </td>
      `;
      expTableBody.appendChild(row);
    });

    // Add event listeners to delete buttons
    expTableBody.querySelectorAll('.delete-exp-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const entryId = btn.getAttribute('data-entry-id');
        deleteExperienceEntry(entryId);
      });
    });
  }

  // Populate Education table
  if (eduTableBody) {
    const educationData = getEducationData();
    eduTableBody.innerHTML = '';

    // Loop through education data and create table rows
    educationData.forEach((entry) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${escapeHtml(entry.school)}</td>
        <td class="hide-sm">${escapeHtml(entry.degree)}</td>
        <td class="hide-sm">${escapeHtml(entry.from)} - ${escapeHtml(entry.to)}</td>
        <td>
          <button class="btn btn-danger delete-edu-btn" data-entry-id="${entry.id}" aria-label="Delete education entry">
            Delete
          </button>
        </td>
      `;
      eduTableBody.appendChild(row);
    });

    // Add event listeners to delete buttons
    eduTableBody.querySelectorAll('.delete-edu-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const entryId = btn.getAttribute('data-entry-id');
        deleteEducationEntry(entryId);
      });
    });
  }

  console.log('Dashboard tables populated');
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
 * Initialize experience/education CRUD functionality
 */
document.addEventListener('DOMContentLoaded', function() {
  const profileExp = document.querySelector('.profile-exp');
  const profileEdu = document.querySelector('.profile-edu');
  const dashboardTables = document.querySelector('h2.my-2:contains("Experience")');

  // Initialize experience section
  if (profileExp) {
    // Restore saved entries
    restoreExperienceEntries();

    // Create and add "Add Experience" button
    const addExpBtn = createAddExperienceBtn();
    profileExp.insertBefore(addExpBtn, profileExp.firstChild.nextSibling);

    addExpBtn.addEventListener('click', addExperienceEntry);

    console.log('Experience CRUD initialized');
  }

  // Initialize education section
  if (profileEdu) {
    // Restore saved entries
    restoreEducationEntries();

    // Create and add "Add Education" button
    const addEduBtn = createAddEducationBtn();
    profileEdu.insertBefore(addEduBtn, profileEdu.firstChild.nextSibling);

    addEduBtn.addEventListener('click', addEducationEntry);

    console.log('Education CRUD initialized');
  }

  // Populate dashboard tables if on dashboard page
  populateDashboardTables();

  console.log('Experience/Education module fully initialized');
});
