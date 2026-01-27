/**
 * Navigation Component
 * Handles site navigation, mobile menu, and smooth scrolling
 */

export class Navigation {
  constructor(element) {
    this.element = element;
    this.mobileMenuButton = null;
    this.mobileMenu = null;
    this.navLinks = [];
    this.currentSection = '';
    this.isMenuOpen = false;
    this.scrollThreshold = 100;
    this.lastScrollY = 0;
  }

  /**
   * Initialize the navigation component
   */
  async init() {
    try {
      this.setupElements();
      this.setupEventListeners();
      this.updateActiveSection();
      console.log('Navigation component initialized');
    } catch (error) {
      console.error('Failed to initialize navigation:', error);
      throw error;
    }
  }

  /**
   * Set up DOM elements
   */
  setupElements() {
    this.mobileMenuButton = this.element.querySelector('[data-mobile-menu-button]');
    this.mobileMenu = this.element.querySelector('[data-mobile-menu]');
    this.navLinks = Array.from(this.element.querySelectorAll('[data-nav-link]'));
    
    if (!this.mobileMenuButton || !this.mobileMenu) {
      console.warn('Mobile menu elements not found');
    }
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Mobile menu toggle
    if (this.mobileMenuButton) {
      this.mobileMenuButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleMobileMenu();
      });
    }

    // Navigation links
    this.navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        this.handleNavLinkClick(e, link);
      });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      if (this.isMenuOpen && !this.element.contains(e.target)) {
        this.closeMobileMenu();
      }
    });

    // Handle scroll for active section and navbar behavior
    window.addEventListener('scroll', () => {
      this.handleScroll();
    });

    // Handle escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isMenuOpen) {
        this.closeMobileMenu();
      }
    });
  }

  /**
   * Toggle mobile menu
   */
  toggleMobileMenu() {
    if (this.isMenuOpen) {
      this.closeMobileMenu();
    } else {
      this.openMobileMenu();
    }
  }

  /**
   * Open mobile menu
   */
  openMobileMenu() {
    this.isMenuOpen = true;
    this.mobileMenu?.classList.add('open');
    this.mobileMenuButton?.setAttribute('aria-expanded', 'true');
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Focus first menu item
    const firstLink = this.mobileMenu?.querySelector('a');
    if (firstLink) {
      firstLink.focus();
    }

    // Track event
    this.trackEvent('mobile_menu_opened');
  }

  /**
   * Close mobile menu
   */
  closeMobileMenu() {
    this.isMenuOpen = false;
    this.mobileMenu?.classList.remove('open');
    this.mobileMenuButton?.setAttribute('aria-expanded', 'false');
    
    // Restore body scroll
    document.body.style.overflow = '';
    
    // Return focus to menu button
    if (this.mobileMenuButton) {
      this.mobileMenuButton.focus();
    }

    // Track event
    this.trackEvent('mobile_menu_closed');
  }

  /**
   * Handle navigation link clicks
   */
  handleNavLinkClick(event, link) {
    event.preventDefault();
    
    const href = link.getAttribute('href');
    if (!href || !href.startsWith('#')) {
      return;
    }

    const targetId = href.substring(1);
    const targetElement = document.getElementById(targetId);
    
    if (targetElement) {
      // Close mobile menu if open
      if (this.isMenuOpen) {
        this.closeMobileMenu();
      }

      // Smooth scroll to target
      this.smoothScrollTo(targetElement);
      
      // Update active section
      this.setActiveSection(targetId);
      
      // Track navigation
      this.trackEvent('navigation_clicked', { section: targetId });
    }
  }

  /**
   * Smooth scroll to target element
   */
  smoothScrollTo(targetElement) {
    const headerHeight = this.element.offsetHeight;
    const targetPosition = targetElement.offsetTop - headerHeight - 20;
    
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  }

  /**
   * Handle scroll events
   */
  handleScroll() {
    const currentScrollY = window.scrollY;
    
    // Update navbar appearance based on scroll
    this.updateNavbarAppearance(currentScrollY);
    
    // Update active section
    this.updateActiveSection();
    
    this.lastScrollY = currentScrollY;
  }

  /**
   * Update navbar appearance based on scroll position
   */
  updateNavbarAppearance(scrollY) {
    const navbar = this.element;
    
    // Add/remove scrolled class
    if (scrollY > this.scrollThreshold) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Hide/show navbar on scroll (optional)
    if (scrollY > this.lastScrollY && scrollY > this.scrollThreshold) {
      // Scrolling down - hide navbar
      navbar.classList.add('navbar-hidden');
    } else {
      // Scrolling up - show navbar
      navbar.classList.remove('navbar-hidden');
    }
  }

  /**
   * Update active section based on scroll position
   */
  updateActiveSection() {
    const sections = document.querySelectorAll('section[id]');
    const headerHeight = this.element.offsetHeight;
    const scrollPosition = window.scrollY + headerHeight + 100;

    let activeSection = '';

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionBottom = sectionTop + section.offsetHeight;

      if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
        activeSection = section.id;
      }
    });

    if (activeSection !== this.currentSection) {
      this.setActiveSection(activeSection);
    }
  }

  /**
   * Set active section and update navigation
   */
  setActiveSection(sectionId) {
    this.currentSection = sectionId;

    // Update navigation links
    this.navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === `#${sectionId}`) {
        link.classList.add('nav-link-active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('nav-link-active');
        link.removeAttribute('aria-current');
      }
    });
  }

  /**
   * Handle keyboard navigation
   */
  handleKeyboard(event) {
    if (!this.isMenuOpen) return;

    const focusableElements = this.mobileMenu.querySelectorAll(
      'a, button, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.key === 'Tab') {
      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }
  }

  /**
   * Handle window resize
   */
  handleResize() {
    // Close mobile menu on resize to desktop
    if (window.innerWidth >= 768 && this.isMenuOpen) {
      this.closeMobileMenu();
    }
  }

  /**
   * Track events for analytics
   */
  trackEvent(eventName, data = {}) {
    if (window.gtag) {
      window.gtag('event', eventName, {
        event_category: 'Navigation',
        ...data
      });
    }
  }

  /**
   * Get current active section
   */
  getCurrentSection() {
    return this.currentSection;
  }

  /**
   * Check if mobile menu is open
   */
  isModalOpen() {
    return this.isMenuOpen;
  }
}