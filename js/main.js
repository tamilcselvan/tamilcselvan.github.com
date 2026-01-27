/**
 * Main JavaScript file for Tamil Selvan C's Portfolio Website
 * Initializes all components and handles global functionality
 */

import { Navigation } from './components/navigation.js';
import { HeroSection } from './components/hero-section.js';
import { AboutSection } from './components/about-section.js';
import { PortfolioSection } from './components/portfolio-section.js';
import { ContactSection } from './components/contact-section.js';
import { ThemeManager } from './utils/theme-manager.js';
import { AnimationController } from './utils/animation-controller.js';
import { PerformanceMonitor } from './utils/performance-monitor.js';

class PortfolioApp {
  constructor() {
    this.components = {};
    this.themeManager = null;
    this.animationController = null;
    this.performanceMonitor = null;
    this.isInitialized = false;
  }

  /**
   * Initialize the portfolio application
   */
  async init() {
    try {
      // Initialize performance monitoring
      this.performanceMonitor = new PerformanceMonitor();
      this.performanceMonitor.startTracking();

      // Initialize theme manager first
      this.themeManager = new ThemeManager();
      this.themeManager.init();

      // Initialize animation controller
      this.animationController = new AnimationController();
      this.animationController.init();

      // Initialize components
      await this.initializeComponents();

      // Set up global event listeners
      this.setupGlobalEventListeners();

      // Mark as initialized
      this.isInitialized = true;

      // Log successful initialization
      console.log('Portfolio application initialized successfully');

      // Track initialization performance
      this.performanceMonitor.trackEvent('app_initialized');

    } catch (error) {
      console.error('Failed to initialize portfolio application:', error);
      this.handleInitializationError(error);
    }
  }

  /**
   * Initialize all page components
   */
  async initializeComponents() {
    const componentConfigs = [
      { name: 'navigation', selector: '#navigation', Component: Navigation },
      { name: 'hero', selector: '#hero', Component: HeroSection },
      { name: 'about', selector: '#about', Component: AboutSection },
      { name: 'portfolio', selector: '#portfolio', Component: PortfolioSection },
      { name: 'contact', selector: '#contact', Component: ContactSection }
    ];

    for (const config of componentConfigs) {
      try {
        const element = document.querySelector(config.selector);
        if (element) {
          this.components[config.name] = new config.Component(element);
          await this.components[config.name].init();
          console.log(`${config.name} component initialized`);
        } else {
          console.warn(`Element not found for ${config.name} component: ${config.selector}`);
        }
      } catch (error) {
        console.error(`Failed to initialize ${config.name} component:`, error);
      }
    }
  }

  /**
   * Set up global event listeners
   */
  setupGlobalEventListeners() {
    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.handleWindowResize();
      }, 250);
    });

    // Handle scroll events
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.handleScroll();
      }, 16); // ~60fps
    });

    // Handle visibility change
    document.addEventListener('visibilitychange', () => {
      this.handleVisibilityChange();
    });

    // Handle keyboard navigation
    document.addEventListener('keydown', (event) => {
      this.handleKeyboardNavigation(event);
    });

    // Handle focus management
    document.addEventListener('focusin', (event) => {
      this.handleFocusIn(event);
    });

    // Handle errors
    window.addEventListener('error', (event) => {
      this.handleGlobalError(event);
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleUnhandledRejection(event);
    });
  }

  /**
   * Handle window resize events
   */
  handleWindowResize() {
    Object.values(this.components).forEach(component => {
      if (component.handleResize) {
        component.handleResize();
      }
    });

    // Update animation controller
    if (this.animationController) {
      this.animationController.handleResize();
    }

    // Track resize event
    this.performanceMonitor?.trackEvent('window_resized', {
      width: window.innerWidth,
      height: window.innerHeight
    });
  }

  /**
   * Handle scroll events
   */
  handleScroll() {
    Object.values(this.components).forEach(component => {
      if (component.handleScroll) {
        component.handleScroll();
      }
    });

    // Update animation controller
    if (this.animationController) {
      this.animationController.handleScroll();
    }
  }

  /**
   * Handle visibility change events
   */
  handleVisibilityChange() {
    const isVisible = !document.hidden;
    
    Object.values(this.components).forEach(component => {
      if (component.handleVisibilityChange) {
        component.handleVisibilityChange(isVisible);
      }
    });

    // Track visibility changes
    this.performanceMonitor?.trackEvent('visibility_changed', { visible: isVisible });
  }

  /**
   * Handle keyboard navigation
   */
  handleKeyboardNavigation(event) {
    // Skip navigation if user is typing in an input
    if (event.target.matches('input, textarea, [contenteditable]')) {
      return;
    }

    // Handle escape key
    if (event.key === 'Escape') {
      this.handleEscapeKey();
    }

    // Handle tab navigation
    if (event.key === 'Tab') {
      this.handleTabNavigation(event);
    }

    // Pass to navigation component
    if (this.components.navigation?.handleKeyboard) {
      this.components.navigation.handleKeyboard(event);
    }
  }

  /**
   * Handle escape key press
   */
  handleEscapeKey() {
    // Close any open modals or overlays
    Object.values(this.components).forEach(component => {
      if (component.closeModal) {
        component.closeModal();
      }
      if (component.closeMobileMenu) {
        component.closeMobileMenu();
      }
    });
  }

  /**
   * Handle tab navigation for accessibility
   */
  handleTabNavigation(event) {
    // Ensure focus stays within modals if open
    Object.values(this.components).forEach(component => {
      if (component.trapFocus && component.isModalOpen?.()) {
        component.trapFocus(event);
      }
    });
  }

  /**
   * Handle focus events for accessibility
   */
  handleFocusIn(event) {
    // Add focus-visible class for keyboard navigation
    if (event.target.matches('button, a, input, textarea, select, [tabindex]')) {
      event.target.classList.add('focus-visible');
    }
  }

  /**
   * Handle global JavaScript errors
   */
  handleGlobalError(event) {
    console.error('Global error:', event.error);
    
    // Track error
    this.performanceMonitor?.trackError(event.error, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });

    // Show user-friendly error message if needed
    this.showErrorMessage('An unexpected error occurred. Please refresh the page.');
  }

  /**
   * Handle unhandled promise rejections
   */
  handleUnhandledRejection(event) {
    console.error('Unhandled promise rejection:', event.reason);
    
    // Track error
    this.performanceMonitor?.trackError(event.reason, {
      type: 'unhandled_rejection'
    });

    // Prevent default browser behavior
    event.preventDefault();
  }

  /**
   * Handle initialization errors
   */
  handleInitializationError(error) {
    console.error('Initialization error:', error);
    
    // Show fallback content
    document.body.innerHTML = `
      <div class="min-h-screen flex items-center justify-center bg-gray-50">
        <div class="text-center">
          <h1 class="text-2xl font-bold text-gray-900 mb-4">
            Portfolio Loading Error
          </h1>
          <p class="text-gray-600 mb-6">
            Sorry, there was an error loading the portfolio. Please refresh the page.
          </p>
          <button 
            onclick="window.location.reload()" 
            class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Show error message to user
   */
  showErrorMessage(message) {
    // Create error notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    notification.textContent = message;

    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'ml-4 text-white hover:text-gray-200';
    closeBtn.innerHTML = '×';
    closeBtn.onclick = () => notification.remove();
    notification.appendChild(closeBtn);

    // Add to page
    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 5000);
  }

  /**
   * Get component instance
   */
  getComponent(name) {
    return this.components[name];
  }

  /**
   * Check if app is initialized
   */
  isReady() {
    return this.isInitialized;
  }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.portfolioApp = new PortfolioApp();
  window.portfolioApp.init();
});

// Export for module usage
export default PortfolioApp;