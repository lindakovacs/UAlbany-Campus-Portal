/**
 * Profile Search and Filter Module
 * Allows users to search and filter profiles by name, location, and skills
 * Uses: Variables, Functions, Events, Loops, String methods, DOM manipulation
 */

// Storage key for search history (optional)
const SEARCH_HISTORY_KEY = 'profileSearchHistory';
const MAX_SEARCH_HISTORY = 5;

/**
 * Create search and filter container
 * @returns {HTMLElement} - Search container element
 */
function createSearchFilterContainer() {
  const container = document.createElement('div');
  container.className = 'search-filter-container';
  container.setAttribute('role', 'search');
  container.innerHTML = `
    <div class="search-box">
      <label for="profile-search">Search by Name:</label>
      <div class="search-input-wrapper">
        <i class="fas fa-search"></i>
        <input 
          type="text" 
          id="profile-search" 
          class="profile-search-input" 
          placeholder="Enter student name..."
          aria-label="Search profiles by name"
          aria-describedby="search-hint"
        />
        <button 
          class="clear-search-btn" 
          aria-label="Clear search" 
          type="button"
          style="display: none;"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
      <small id="search-hint">Start typing to filter profiles by name</small>
    </div>

    <div class="filter-controls">
      <div class="filter-group">
        <label for="location-filter">Filter by Location:</label>
        <select 
          id="location-filter" 
          class="location-filter" 
          aria-label="Filter profiles by location"
        >
          <option value="">All Locations</option>
        </select>
      </div>

      <div class="filter-group">
        <label for="skill-filter">Filter by Skill:</label>
        <select 
          id="skill-filter" 
          class="skill-filter" 
          aria-label="Filter profiles by skill"
        >
          <option value="">All Skills</option>
        </select>
      </div>

      <div class="filter-group">
        <label for="experience-filter">Filter by Experience Level:</label>
        <select 
          id="experience-filter" 
          class="experience-filter" 
          aria-label="Filter profiles by experience level"
        >
          <option value="">All Experience Levels</option>
        </select>
      </div>

      <div class="filter-group">
        <label for="company-filter">Filter by Company:</label>
        <select 
          id="company-filter" 
          class="company-filter" 
          aria-label="Filter profiles by company"
        >
          <option value="">All Companies</option>
        </select>
      </div>

      <button 
        class="btn btn-light reset-filters-btn" 
        aria-label="Reset all filters"
        type="button"
      >
        <i class="fas fa-redo"></i> Reset Filters
      </button>
    </div>

    <div class="search-results-info">
      <p role="status" aria-live="polite" aria-atomic="true" class="results-count">
        Showing <span class="current-count">0</span> of <span class="total-count">0</span> profiles
      </p>
    </div>
  `;

  return container;
}

/**
 * Get all unique locations from profiles
 * @returns {array} - Array of unique locations
 */
function getUniqueLocations() {
  const profiles = document.querySelectorAll('.profile');
  const locations = new Set();

  // Loop through profiles to extract locations
  profiles.forEach((profile) => {
    const locationText = profile.querySelector('p:nth-of-type(3)')?.textContent.trim();
    if (locationText && locationText !== '') {
      locations.add(locationText);
    }
  });

  return Array.from(locations).sort();
}

/**
 * Get all unique experience levels from profiles
 * @returns {array} - Array of unique experience levels
 */
function getUniqueExperienceLevels() {
  const profiles = document.querySelectorAll('.profile');
  const levels = new Set();
  const experienceKeywords = ['Sr', 'Senior', 'Lead', 'Principal', 'Jr', 'Junior', 'Entry', 'Mid', 'Intern'];

  // Loop through profiles to extract experience levels
  profiles.forEach((profile) => {
    const titleElement = profile.querySelector('p:nth-of-type(1)');
    const titleText = titleElement?.textContent || '';

    // Check for experience keywords in title
    experienceKeywords.forEach((keyword) => {
      if (titleText.toLowerCase().includes(keyword.toLowerCase())) {
        // Normalize the keyword
        let level = keyword;
        if (keyword.toLowerCase() === 'sr' || keyword.toLowerCase() === 'senior') {
          level = 'Senior';
        } else if (keyword.toLowerCase() === 'jr' || keyword.toLowerCase() === 'junior') {
          level = 'Junior';
        } else if (keyword.toLowerCase() === 'entry') {
          level = 'Entry Level';
        } else if (keyword.toLowerCase() === 'mid') {
          level = 'Mid Level';
        } else if (keyword.toLowerCase() === 'lead') {
          level = 'Lead';
        } else if (keyword.toLowerCase() === 'principal') {
          level = 'Principal';
        } else if (keyword.toLowerCase() === 'intern') {
          level = 'Intern';
        }
        levels.add(level);
      }
    });

    // If no keywords found, add generic category
    if (levels.size === 0 && titleText.trim() !== '') {
      levels.add('Other');
    }
  });

  return Array.from(levels).sort();
}

/**
 * Get all unique companies from profiles
 * @returns {array} - Array of unique companies
 */
function getUniqueCompanies() {
  const profiles = document.querySelectorAll('.profile');
  const companies = new Set();

  // Loop through profiles to extract companies
  profiles.forEach((profile) => {
    const titleElement = profile.querySelector('p:nth-of-type(1)');
    const titleText = titleElement?.textContent || '';

    // Extract company from "Position @ Company" format
    const match = titleText.match(/@\s*(.+)$/);
    if (match && match[1]) {
      companies.add(match[1].trim());
    } else if (titleText.includes('at')) {
      const parts = titleText.split('at');
      if (parts[1]) {
        companies.add(parts[1].trim());
      }
    }
  });

  return Array.from(companies).sort();
}

/**
 * Get all unique skills from profiles
 * @returns {array} - Array of unique skills
 */
function getUniqueSkills() {
  const profiles = document.querySelectorAll('.profile');
  const skills = new Set();

  // Loop through profiles to extract skills - Loop pattern
  profiles.forEach((profile) => {
    const skillItems = profile.querySelectorAll('ul li');
    skillItems.forEach((item) => {
      const skillText = item.textContent.replace(/✓/g, '').trim();
      if (skillText && skillText !== '') {
        skills.add(skillText);
      }
    });
  });

  return Array.from(skills).sort();
}

/**
 * Populate filter dropdowns with unique values
 */
function populateFilterOptions() {
  const locationFilter = document.querySelector('.location-filter');
  const skillFilter = document.querySelector('.skill-filter');
  const experienceFilter = document.querySelector('.experience-filter');
  const companyFilter = document.querySelector('.company-filter');

  // Predefined location options
  const predefinedLocations = [
    'New York, NY',
    'Boston, MA',
    'San Francisco, CA',
    'Los Angeles, CA',
    'Chicago, IL',
    'Austin, TX',
    'Seattle, WA',
    'Denver, CO',
    'Remote'
  ];

  // Add predefined locations first
  predefinedLocations.forEach((location) => {
    const option = document.createElement('option');
    option.value = location;
    option.textContent = location;
    locationFilter.appendChild(option);
  });

  // Add divider (optional visual separator)
  const divider = document.createElement('option');
  divider.disabled = true;
  divider.textContent = '─ Other Locations ─';
  locationFilter.appendChild(divider);

  // Add dynamically extracted locations (avoiding duplicates)
  const locations = getUniqueLocations();
  const extractedLocations = new Set(predefinedLocations);
  locations.forEach((location) => {
    if (!extractedLocations.has(location)) {
      const option = document.createElement('option');
      option.value = location;
      option.textContent = location;
      locationFilter.appendChild(option);
    }
  });

  // Populate skills
  const skills = getUniqueSkills();
  skills.forEach((skill) => {
    const option = document.createElement('option');
    option.value = skill;
    option.textContent = skill;
    skillFilter.appendChild(option);
  });

  // Predefined experience level options
  const predefinedLevels = [
    'Intern',
    'Entry Level',
    'Mid Level',
    'Senior',
    'Lead',
    'Principal'
  ];

  // Add predefined experience levels first
  predefinedLevels.forEach((level) => {
    const option = document.createElement('option');
    option.value = level;
    option.textContent = level;
    experienceFilter.appendChild(option);
  });

  // Add divider (optional visual separator)
  const levelDivider = document.createElement('option');
  levelDivider.disabled = true;
  levelDivider.textContent = '─ Other Levels ─';
  experienceFilter.appendChild(levelDivider);

  // Add dynamically extracted experience levels (avoiding duplicates)
  const levels = getUniqueExperienceLevels();
  const extractedLevels = new Set(predefinedLevels);
  levels.forEach((level) => {
    if (!extractedLevels.has(level)) {
      const option = document.createElement('option');
      option.value = level;
      option.textContent = level;
      experienceFilter.appendChild(option);
    }
  });

  // Populate companies
  const companies = getUniqueCompanies();
  companies.forEach((company) => {
    const option = document.createElement('option');
    option.value = company;
    option.textContent = company;
    companyFilter.appendChild(option);
  });
}

/**
 * Filter profiles based on search and filter criteria
 */
function filterProfiles() {
  const searchInput = document.querySelector('.profile-search-input');
  const locationFilter = document.querySelector('.location-filter');
  const skillFilter = document.querySelector('.skill-filter');
  const experienceFilter = document.querySelector('.experience-filter');
  const companyFilter = document.querySelector('.company-filter');
  const profiles = document.querySelectorAll('.profile');
  const clearBtn = document.querySelector('.clear-search-btn');

  const searchTerm = searchInput.value.toLowerCase().trim();
  const selectedLocation = locationFilter.value;
  const selectedSkill = skillFilter.value;
  const selectedExperience = experienceFilter.value;
  const selectedCompany = companyFilter.value;

  let visibleCount = 0;

  // Loop through profiles and apply filters
  profiles.forEach((profile) => {
    let isVisible = true;

    // Get profile data
    const name = profile.querySelector('h2')?.textContent.toLowerCase() || '';
    const title = profile.querySelector('p:nth-of-type(1)')?.textContent.toLowerCase() || '';
    const location = profile.querySelector('p:nth-of-type(2)')?.textContent.trim() || '';
    const skillItems = profile.querySelectorAll('ul li');
    const skills = Array.from(skillItems).map((item) =>
      item.textContent.replace(/✓/g, '').trim()
    );

    // Filter by search term (search name and title)
    if (searchTerm) {
      if (!name.includes(searchTerm) && !title.includes(searchTerm)) {
        isVisible = false;
      }
    }

    // Filter by location
    if (isVisible && selectedLocation) {
      if (location !== selectedLocation) {
        isVisible = false;
      }
    }

    // Filter by skill
    if (isVisible && selectedSkill) {
      if (!skills.includes(selectedSkill)) {
        isVisible = false;
      }
    }

    // Filter by experience level
    if (isVisible && selectedExperience) {
      let hasExperience = false;
      
      // Check if title contains the experience level keyword
      if (selectedExperience === 'Senior' && (title.includes('sr') || title.includes('senior'))) {
        hasExperience = true;
      } else if (selectedExperience === 'Junior' && (title.includes('jr') || title.includes('junior'))) {
        hasExperience = true;
      } else if (selectedExperience === 'Lead' && title.includes('lead')) {
        hasExperience = true;
      } else if (selectedExperience === 'Principal' && title.includes('principal')) {
        hasExperience = true;
      } else if (selectedExperience === 'Entry Level' && title.includes('entry')) {
        hasExperience = true;
      } else if (selectedExperience === 'Mid Level' && title.includes('mid')) {
        hasExperience = true;
      } else if (selectedExperience === 'Intern' && title.includes('intern')) {
        hasExperience = true;
      } else if (selectedExperience === 'Other') {
        hasExperience = true;
      }

      if (!hasExperience) {
        isVisible = false;
      }
    }

    // Filter by company
    if (isVisible && selectedCompany) {
      const companyMatch = title.match(/@\s*(.+)$/);
      let profileCompany = '';
      
      if (companyMatch && companyMatch[1]) {
        profileCompany = companyMatch[1].trim();
      } else if (title.includes('at')) {
        const parts = title.split('at');
        if (parts[1]) {
          profileCompany = parts[1].trim();
        }
      }

      if (profileCompany !== selectedCompany) {
        isVisible = false;
      }
    }

    // Show or hide profile
    profile.style.display = isVisible ? '' : 'none';

    if (isVisible) {
      visibleCount++;
    }
  });

  // Update results count
  const currentCountEl = document.querySelector('.current-count');
  const totalCountEl = document.querySelector('.total-count');
  if (currentCountEl && totalCountEl) {
    currentCountEl.textContent = visibleCount;
    totalCountEl.textContent = profiles.length;
  }

  // Show/hide clear button
  if (clearBtn) {
    clearBtn.style.display = searchTerm ? 'block' : 'none';
  }

  // Screen reader announcement
  const resultText =
    visibleCount === 1 ? '1 profile found' : `${visibleCount} profiles found`;
  announceSearch(resultText);

  console.log(`Filters applied: Search="${searchTerm}", Location="${selectedLocation}", Skill="${selectedSkill}", Experience="${selectedExperience}", Company="${selectedCompany}" - ${visibleCount} results`);
}

/**
 * Save search to history
 * @param {string} searchTerm - Search term to save
 */
function saveSearchHistory(searchTerm) {
  if (!searchTerm.trim()) return;

  let history = localStorage.getItem(SEARCH_HISTORY_KEY);
  history = history ? JSON.parse(history) : [];

  // Remove duplicates - Loop to filter
  history = history.filter((item) => item !== searchTerm);

  // Add to beginning
  history.unshift(searchTerm);

  // Keep only recent searches
  history = history.slice(0, MAX_SEARCH_HISTORY);

  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
}

/**
 * Reset all filters
 */
function resetFilters() {
  const searchInput = document.querySelector('.profile-search-input');
  const locationFilter = document.querySelector('.location-filter');
  const skillFilter = document.querySelector('.skill-filter');
  const experienceFilter = document.querySelector('.experience-filter');
  const companyFilter = document.querySelector('.company-filter');
  const clearBtn = document.querySelector('.clear-search-btn');

  searchInput.value = '';
  locationFilter.value = '';
  skillFilter.value = '';
  experienceFilter.value = '';
  companyFilter.value = '';
  clearBtn.style.display = 'none';

  filterProfiles();
  announceSearch('Filters reset - showing all profiles');
}

/**
 * Clear search input
 */
function clearSearch() {
  const searchInput = document.querySelector('.profile-search-input');
  searchInput.value = '';
  searchInput.focus();
  filterProfiles();
}

/**
 * Announce search results to screen readers
 * @param {string} message - Message to announce
 */
function announceSearch(message) {
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
 * Initialize profile search and filter functionality
 */
document.addEventListener('DOMContentLoaded', function() {
  const profilesContainer = document.querySelector('.profiles');

  if (!profilesContainer) {
    console.log('Profiles container not found');
    return;
  }

  // Create and insert search container
  const searchContainer = createSearchFilterContainer();
  profilesContainer.parentElement.insertBefore(searchContainer, profilesContainer);

  // Populate filter options with unique values
  populateFilterOptions();

  // Get filter elements
  const searchInput = document.querySelector('.profile-search-input');
  const locationFilter = document.querySelector('.location-filter');
  const skillFilter = document.querySelector('.skill-filter');
  const experienceFilter = document.querySelector('.experience-filter');
  const companyFilter = document.querySelector('.company-filter');
  const resetBtn = document.querySelector('.reset-filters-btn');
  const clearBtn = document.querySelector('.clear-search-btn');

  // Initial results count
  const allProfiles = document.querySelectorAll('.profile');
  const currentCountEl = document.querySelector('.current-count');
  const totalCountEl = document.querySelector('.total-count');
  if (currentCountEl && totalCountEl) {
    currentCountEl.textContent = allProfiles.length;
    totalCountEl.textContent = allProfiles.length;
  }

  // Add event listeners - Events pattern
  searchInput.addEventListener('input', function() {
    filterProfiles();
  });

  searchInput.addEventListener('change', function() {
    if (this.value.trim()) {
      saveSearchHistory(this.value);
    }
  });

  locationFilter.addEventListener('change', filterProfiles);
  skillFilter.addEventListener('change', filterProfiles);
  experienceFilter.addEventListener('change', filterProfiles);
  companyFilter.addEventListener('change', filterProfiles);
  resetBtn.addEventListener('click', resetFilters);
  clearBtn.addEventListener('click', clearSearch);

  // Keyboard support
  searchInput.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      clearSearch();
    }
  });

  console.log('Profile search and filter module initialized');
});
