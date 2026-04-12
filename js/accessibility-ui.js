/**
 * Accessibility UI Components
 * Provides reusable components for accessibility features
 */

/**
 * Create and inject dark mode toggle button into navbar
 */
function injectDarkModeToggle() {
  // Check if toggle already exists
  if (document.getElementById('dark-mode-toggle')) {
    return;
  }

  // Wait for navbar to be loaded if it's injected dynamically
  const navMenu = document.getElementById('nav-menu');
  if (!navMenu) {
    // Retry after a brief delay if navbar not ready
    setTimeout(injectDarkModeToggle, 100);
    return;
  }

  // Create list item for navbar
  const listItem = document.createElement('li');

  // Create button
  const toggleBtn = document.createElement('button');
  toggleBtn.id = 'dark-mode-toggle';
  toggleBtn.className = 'dark-mode-toggle-btn';
  toggleBtn.setAttribute('aria-label', 'Toggle dark mode');
  toggleBtn.setAttribute('title', 'Alt + D: Toggle dark mode');
  toggleBtn.innerHTML = '<i class="fas fa-moon"></i>';

  // Add CSS styles
  const style = document.createElement('style');
  style.textContent = `
    li:has(.dark-mode-toggle-btn) {
      list-style: none;
    }

    .dark-mode-toggle-btn {
      background: transparent;
      border: none;
      color: #fff;
      cursor: pointer;
      font-size: 1.2rem;
      padding: 0.5rem 0.75rem;
      margin: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: color 0.2s ease;
    }

    .dark-mode-toggle-btn:hover {
      color: var(--primary-color);
    }

    .dark-mode-toggle-btn:focus-visible {
      outline: 2px solid #fff;
      outline-offset: 2px;
    }

    body.dark-mode .dark-mode-toggle-btn {
      color: #ffc107;
    }

    body.dark-mode .dark-mode-toggle-btn:hover {
      color: #ffb300;
    }

    /* Mobile responsive */
    @media (max-width: 768px) {
      .dark-mode-toggle-btn {
        font-size: 1rem;
        padding: 0.4rem 0.6rem;
      }
    }
  `;
  document.head.appendChild(style);

  // Add click event
  toggleBtn.addEventListener('click', function (e) {
    e.preventDefault();
    toggleDarkMode();

    // Update icon based on mode
    const isDarkMode = document.body.classList.contains('dark-mode');
    toggleBtn.innerHTML = isDarkMode
      ? '<i class="fas fa-sun"></i>'
      : '<i class="fas fa-moon"></i>';
    toggleBtn.setAttribute(
      'aria-label',
      `${isDarkMode ? 'Disable' : 'Enable'} dark mode`,
    );
  });

  // Set initial icon based on current mode
  const isDarkMode = document.body.classList.contains('dark-mode');
  toggleBtn.innerHTML = isDarkMode
    ? '<i class="fas fa-sun"></i>'
    : '<i class="fas fa-moon"></i>';

  // Add button to list item
  listItem.appendChild(toggleBtn);

  // Add to navbar menu
  navMenu.appendChild(listItem);
}

/**
 * Initialize accessibility UI components on page load
 */
document.addEventListener('DOMContentLoaded', function () {
  injectDarkModeToggle();
});
