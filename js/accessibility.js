/**
 * Accessibility Module
 * Advanced mobile accessibility features including:
 * - Dark mode toggle (persists to localStorage)
 * - Skip navigation links
 * - Keyboard navigation shortcuts
 * - Screen reader enhancements
 * Uses: Variables, Objects, Events, Functions, localStorage, Keyboard Events
 */

// Accessibility settings constants
const ACCESSIBILITY_STORAGE_KEY = 'a11ySettings';
const KEYBOARD_SHORTCUTS = {
  d: { name: 'Toggle Dark Mode', key: 'D' },
  m: { name: 'Jump to Main Content', key: 'M' },
  h: { name: 'Show Keyboard Shortcuts', key: 'H' },
  '/': { name: 'Focus Search (if available)', key: '/' },
};

/**
 * Initialize accessibility settings from localStorage
 * @returns {object} - Accessibility settings
 */
function initializeA11ySettings() {
  const stored = localStorage.getItem(ACCESSIBILITY_STORAGE_KEY);
  return stored
    ? JSON.parse(stored)
    : {
        darkMode: false,
        reduceMotion: false,
        highContrast: false,
        fontSize: 'normal',
      };
}

/**
 * Save accessibility settings to localStorage
 * @param {object} settings - Settings to save
 */
function saveA11ySettings(settings) {
  localStorage.setItem(ACCESSIBILITY_STORAGE_KEY, JSON.stringify(settings));
}

/**
 * Get current accessibility settings
 * @returns {object} - Current settings
 */
function getA11ySettings() {
  return initializeA11ySettings();
}

/**
 * Toggle dark mode and persist preference
 */
function toggleDarkMode() {
  const body = document.body;
  const settings = getA11ySettings();

  // Toggle dark mode
  settings.darkMode = !settings.darkMode;

  if (settings.darkMode) {
    body.classList.add('dark-mode');
    document.documentElement.setAttribute('data-theme', 'dark');
    console.log('Dark mode enabled');
  } else {
    body.classList.remove('dark-mode');
    document.documentElement.setAttribute('data-theme', 'light');
    console.log('Dark mode disabled');
  }

  // Save preference
  saveA11ySettings(settings);

  // Announce to screen readers
  announceA11yChange(`Dark mode ${settings.darkMode ? 'enabled' : 'disabled'}`);
}

/**
 * Apply saved dark mode setting on page load
 */
function applyDarkModeSetting() {
  const settings = getA11ySettings();

  if (settings.darkMode) {
    document.body.classList.add('dark-mode');
    document.documentElement.setAttribute('data-theme', 'dark');
  }
}

/**
 * Check if system prefers dark mode
 * @returns {boolean} - True if system dark mode is enabled
 */
function prefersDarkMode() {
  return (
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
}

/**
 * Create skip navigation links
 */
function createSkipLinks() {
  const skipContainer = document.createElement('div');
  skipContainer.className = 'skip-links';

  const skipToMain = document.createElement('a');
  skipToMain.href = '#main-content';
  skipToMain.className = 'skip-link';
  skipToMain.textContent = 'Skip to main content';
  skipToMain.addEventListener('click', function (e) {
    e.preventDefault();
    const main =
      document.querySelector('main') || document.querySelector('[role="main"]');
    if (main) {
      main.setAttribute('tabindex', '-1');
      main.focus();
      announceA11yChange('Jumped to main content');
    }
  });

  skipContainer.appendChild(skipToMain);
  document.body.insertBefore(skipContainer, document.body.firstChild);
}

/**
 * Add ID to main content if not present
 */
function ensureMainContentId() {
  const main = document.querySelector('main');
  if (main && !main.id) {
    main.id = 'main-content';
  }
}

/**
 * Handle keyboard shortcuts
 * @param {KeyboardEvent} event - Keyboard event
 */
function handleKeyboardShortcut(event) {
  // Only trigger if Alt key is pressed (standard web shortcut modifier)
  if (!event.altKey) return;

  const key = event.key.toLowerCase();

  switch (key) {
    case 'd':
      event.preventDefault();
      toggleDarkMode();
      break;
    case 'm':
      event.preventDefault();
      const main = document.querySelector('main');
      if (main) {
        main.setAttribute('tabindex', '-1');
        main.focus();
        announceA11yChange('Jumped to main content');
      }
      break;
    case 'h':
      event.preventDefault();
      showKeyboardShortcutsDialog();
      break;
    case '/':
      event.preventDefault();
      const searchField = document.querySelector(
        '[aria-label*="Search"], input[placeholder*="Search"], input[name="search"]',
      );
      if (searchField) {
        searchField.focus();
        announceA11yChange('Search field focused');
      }
      break;
  }
}

/**
 * Show keyboard shortcuts help dialog
 */
function showKeyboardShortcutsDialog() {
  // Check if dialog already exists
  let dialog = document.querySelector('#keyboard-shortcuts-dialog');
  if (dialog) {
    dialog.remove();
    return;
  }

  // Create modal dialog
  dialog = document.createElement('div');
  dialog.id = 'keyboard-shortcuts-dialog';
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-labelledby', 'shortcuts-title');
  dialog.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    border: 2px solid var(--primary-color);
    border-radius: 8px;
    padding: 2rem;
    z-index: 10001;
    max-width: 600px;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  `;

  // Dark mode support for dialog
  if (document.body.classList.contains('dark-mode')) {
    dialog.style.background = '#2a2a2a';
    dialog.style.color = '#e0e0e0';
    dialog.style.borderColor = 'var(--primary-color)';
  }

  let html =
    '<h2 id="shortcuts-title" style="margin-bottom: 1rem;">Keyboard Shortcuts</h2>';
  html +=
    '<p style="margin-bottom: 1rem; font-size: 0.9rem;">Press <strong>Alt + Key</strong> to activate:</p>';
  html += '<dl style="line-height: 1.8;">';

  // Loop through all keyboard shortcuts
  for (const [key, shortcut] of Object.entries(KEYBOARD_SHORTCUTS)) {
    html += `
      <dt style="font-weight: bold; color: var(--primary-color);">Alt + ${shortcut.key}</dt>
      <dd style="margin-bottom: 1rem; margin-left: 1rem;">${shortcut.name}</dd>
    `;
  }

  html += '</dl>';
  html +=
    '<button id="close-shortcuts" class="btn btn-primary" style="margin-top: 1rem;">Close</button>';

  dialog.innerHTML = html;
  document.body.appendChild(dialog);

  // Create backdrop
  const backdrop = document.createElement('div');
  backdrop.id = 'shortcuts-backdrop';
  backdrop.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 10000;
  `;
  document.body.appendChild(backdrop);

  // Close button handler
  const closeBtn = document.getElementById('close-shortcuts');
  closeBtn.focus();
  closeBtn.addEventListener('click', function () {
    dialog.remove();
    backdrop.remove();
  });

  // Close on backdrop click
  backdrop.addEventListener('click', function () {
    dialog.remove();
    backdrop.remove();
  });

  // Close on Escape key
  const escapeHandler = function (e) {
    if (e.key === 'Escape') {
      dialog.remove();
      backdrop.remove();
      document.removeEventListener('keydown', escapeHandler);
    }
  };
  document.addEventListener('keydown', escapeHandler);

  announceA11yChange('Keyboard shortcuts dialog opened');
}

/**
 * Announce accessibility changes to screen readers
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

  // Remove after announcement
  setTimeout(() => {
    announcement.remove();
  }, 3000);
}

/**
 * Enhance navigation keyboard support
 */
function enhanceNavigationKeyboardSupport() {
  const navLinks = document.querySelectorAll('nav a, nav button');

  navLinks.forEach((link) => {
    // Ensure proper keyboard navigation
    link.setAttribute('tabindex', '0');
  });
}

/**
 * Add focus visible styles for keyboard navigation
 */
function injectKeyboardFocusStyles() {
  const style = document.createElement('style');
  style.textContent = `
    /* Visible focus for keyboard navigation */
    button:focus-visible,
    a:focus-visible,
    input:focus-visible,
    textarea:focus-visible,
    select:focus-visible {
      outline: 3px solid var(--primary-color);
      outline-offset: 2px;
    }

    /* Ensure links are visible on focus */
    a:focus {
      outline: 3px solid var(--primary-color);
      outline-offset: 2px;
    }
  `;
  document.head.appendChild(style);
}

/**
 * Initialize all accessibility features
 */
document.addEventListener('DOMContentLoaded', function () {
  // Inject keyboard focus styles
  injectKeyboardFocusStyles();

  // Check system dark mode preference on first visit
  const settings = getA11ySettings();
  if (!localStorage.getItem(ACCESSIBILITY_STORAGE_KEY)) {
    settings.darkMode = prefersDarkMode();
    saveA11ySettings(settings);
  }

  // Apply dark mode setting
  applyDarkModeSetting();

  // Create skip links
  createSkipLinks();

  // Ensure main content has ID
  ensureMainContentId();

  // Enhance keyboard support
  enhanceNavigationKeyboardSupport();

  // Set up keyboard shortcut listener
  document.addEventListener('keydown', handleKeyboardShortcut);

  console.log('Accessibility module initialized');
  console.log(
    'Keyboard shortcuts available: Alt + D (Dark Mode), Alt + M (Main), Alt + H (Help), Alt + / (Search)',
  );
});
