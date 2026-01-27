/**
 * Theme Manager
 * Handles dark/light mode functionality with system preference detection
 */

export class ThemeManager {
  constructor() {
    this.currentTheme = 'light';
    this.themeToggleButton = null;
    this.mediaQuery = null;
    this.storageKey = 'theme';
  }

  /**
   * Initialize the theme manager
   */
  init() {
    try {
      this.setupElements();
      this.detectSystemPreference();
      this.loadSavedTheme();
      this.setupEventListeners();
      this.applyTheme(this.currentTheme);
      console.log('Theme manager initialized');
    } catch (error) {
      console.error('Failed to initialize theme manager:', error);
    }
  }

  /**
   * Set up DOM elements
   */
  setupElements() {
    this.themeToggleButton = document.getElementById('theme-toggle');
    if (!this.themeToggleButton) {
      console.warn('Theme toggle button not found');
    }
  }

  /**
   * Detect system theme preference
   */
  detectSystemPreference() {
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Set initial theme based on system preference if no saved theme
    if (!localStorage.getItem(this.storageKey)) {
      this.currentTheme = this.mediaQuery.matches ? 'dark' : 'light';
    }
  }

  /**
   * Load saved theme from localStorage
   */
  loadSavedTheme() {
    const savedTheme = localStorage.getItem(this.storageKey);
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      this.currentTheme = savedTheme;
    }
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Theme toggle button
    if (this.themeToggleButton) {
      this.themeToggleButton.addEventListener('click', () => {
        this.toggleTheme();
      });
    }

    // Listen for system theme changes
    if (this.mediaQuery) {
      this.mediaQuery.addEventListener('change', (e) => {
        // Only auto-switch if user hasn't manually set a preference
        if (!localStorage.getItem(this.storageKey)) {
          this.setTheme(e.matches ? 'dark' : 'light');
        }
      });
    }

    // Listen for storage changes (for multi-tab sync)
    window.addEventListener('storage', (e) => {
      if (e.key === this.storageKey && e.newValue) {
        this.setTheme(e.newValue);
      }
    });
  }

  /**
   * Toggle between light and dark themes
   */
  toggleTheme() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
    
    // Track theme toggle
    this.trackEvent('theme_toggled', { new_theme: newTheme });
  }

  /**
   * Set theme to specific value
   */
  setTheme(theme) {
    if (theme !== 'light' && theme !== 'dark') {
      console.warn('Invalid theme:', theme);
      return;
    }

    this.currentTheme = theme;
    this.applyTheme(theme);
    this.saveTheme(theme);
  }

  /**
   * Apply theme to the document
   */
  applyTheme(theme) {
    const html = document.documentElement;
    
    if (theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }

    // Update theme toggle button aria-label
    if (this.themeToggleButton) {
      const label = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
      this.themeToggleButton.setAttribute('aria-label', label);
    }

    // Dispatch theme change event
    window.dispatchEvent(new CustomEvent('themechange', {
      detail: { theme: theme }
    }));
  }

  /**
   * Save theme preference to localStorage
   */
  saveTheme(theme) {
    try {
      localStorage.setItem(this.storageKey, theme);
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
    }
  }

  /**
   * Get current theme
   */
  getCurrentTheme() {
    return this.currentTheme;
  }

  /**
   * Check if dark mode is active
   */
  isDarkMode() {
    return this.currentTheme === 'dark';
  }

  /**
   * Get system theme preference
   */
  getSystemPreference() {
    return this.mediaQuery?.matches ? 'dark' : 'light';
  }

  /**
   * Reset to system preference
   */
  resetToSystemPreference() {
    localStorage.removeItem(this.storageKey);
    const systemTheme = this.getSystemPreference();
    this.setTheme(systemTheme);
    
    // Track reset
    this.trackEvent('theme_reset_to_system', { system_theme: systemTheme });
  }

  /**
   * Track events for analytics
   */
  trackEvent(eventName, data = {}) {
    if (window.gtag) {
      window.gtag('event', eventName, {
        event_category: 'Theme',
        ...data
      });
    }
  }
}