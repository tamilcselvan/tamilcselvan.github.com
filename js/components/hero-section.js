/**
 * Hero Section Component
 * Handles hero section animations, typewriter effect, and interactions
 */

export class HeroSection {
  constructor(element) {
    this.element = element;
    this.typewriterElement = null;
    this.ctaButtons = [];
    this.socialLinks = [];
    this.typewriterTexts = [];
    this.currentTextIndex = 0;
    this.typewriterTimeout = null;
    this.isTypewriterActive = false;
  }

  /**
   * Initialize the hero section component
   */
  async init() {
    try {
      this.setupElements();
      this.setupEventListeners();
      this.initializeAnimations();
      this.startTypewriter();
      console.log('Hero section component initialized');
    } catch (error) {
      console.error('Failed to initialize hero section:', error);
      throw error;
    }
  }

  /**
   * Set up DOM elements
   */
  setupElements() {
    this.typewriterElement = this.element.querySelector('[data-typewriter]');
    this.ctaButtons = Array.from(this.element.querySelectorAll('[data-cta-button]'));
    this.socialLinks = Array.from(this.element.querySelectorAll('[data-social-link]'));
    
    // Get typewriter texts from data attribute or default
    if (this.typewriterElement) {
      const textsData = this.typewriterElement.getAttribute('data-typewriter-texts');
      if (textsData) {
        try {
          this.typewriterTexts = JSON.parse(textsData);
        } catch (e) {
          console.warn('Invalid typewriter texts data, using defaults');
          this.typewriterTexts = this.getDefaultTypewriterTexts();
        }
      } else {
        this.typewriterTexts = this.getDefaultTypewriterTexts();
      }
    }
  }

  /**
   * Get default typewriter texts
   */
  getDefaultTypewriterTexts() {
    return [
      'Solution Architect',
      'Technical Leader',
      'Backend Developer',
      'DevOps Engineer',
      'Cloud Specialist'
    ];
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // CTA button clicks
    this.ctaButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        this.handleCTAClick(e, button);
      });
    });

    // Social link clicks
    this.socialLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        this.handleSocialLinkClick(e, link);
      });
    });

    // Intersection observer for animations
    this.setupIntersectionObserver();

    // Handle visibility change to pause/resume typewriter
    document.addEventListener('visibilitychange', () => {
      this.handleVisibilityChange(!document.hidden);
    });
  }

  /**
   * Initialize animations
   */
  initializeAnimations() {
    // Add animation classes to elements
    const animatedElements = this.element.querySelectorAll('[data-animate]');
    
    animatedElements.forEach((element, index) => {
      const animationType = element.getAttribute('data-animate');
      const delay = element.getAttribute('data-animate-delay') || (index * 200);
      
      element.style.animationDelay = `${delay}ms`;
      element.classList.add(`animate-${animationType}`);
    });
  }

  /**
   * Set up intersection observer for scroll animations
   */
  setupIntersectionObserver() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in-view');
        }
      });
    }, observerOptions);

    // Observe elements with scroll animations
    const scrollAnimatedElements = this.element.querySelectorAll('[data-scroll-animate]');
    scrollAnimatedElements.forEach(element => {
      observer.observe(element);
    });
  }

  /**
   * Start typewriter effect
   */
  startTypewriter() {
    if (!this.typewriterElement || this.typewriterTexts.length === 0) {
      return;
    }

    this.isTypewriterActive = true;
    this.typeText(this.typewriterTexts[this.currentTextIndex]);
  }

  /**
   * Type text with typewriter effect
   */
  typeText(text, charIndex = 0) {
    if (!this.isTypewriterActive) return;

    if (charIndex < text.length) {
      this.typewriterElement.textContent = text.substring(0, charIndex + 1);
      this.typewriterTimeout = setTimeout(() => {
        this.typeText(text, charIndex + 1);
      }, 100 + Math.random() * 50); // Variable typing speed
    } else {
      // Text complete, wait then delete
      this.typewriterTimeout = setTimeout(() => {
        this.deleteText(text);
      }, 2000);
    }
  }

  /**
   * Delete text with typewriter effect
   */
  deleteText(text, charIndex = text.length) {
    if (!this.isTypewriterActive) return;

    if (charIndex > 0) {
      this.typewriterElement.textContent = text.substring(0, charIndex - 1);
      this.typewriterTimeout = setTimeout(() => {
        this.deleteText(text, charIndex - 1);
      }, 50);
    } else {
      // Text deleted, move to next text
      this.currentTextIndex = (this.currentTextIndex + 1) % this.typewriterTexts.length;
      this.typewriterTimeout = setTimeout(() => {
        this.typeText(this.typewriterTexts[this.currentTextIndex]);
      }, 500);
    }
  }

  /**
   * Stop typewriter effect
   */
  stopTypewriter() {
    this.isTypewriterActive = false;
    if (this.typewriterTimeout) {
      clearTimeout(this.typewriterTimeout);
      this.typewriterTimeout = null;
    }
  }

  /**
   * Handle CTA button clicks
   */
  handleCTAClick(event, button) {
    const action = button.getAttribute('data-cta-action');
    const target = button.getAttribute('data-cta-target');
    
    switch (action) {
      case 'scroll':
        if (target) {
          this.scrollToSection(target);
        }
        break;
      case 'download':
        if (target) {
          this.downloadFile(target);
        }
        break;
      case 'external':
        if (target) {
          window.open(target, '_blank', 'noopener,noreferrer');
        }
        break;
      default:
        console.warn('Unknown CTA action:', action);
    }

    // Track CTA click
    this.trackEvent('cta_clicked', {
      action: action,
      target: target,
      button_text: button.textContent.trim()
    });
  }

  /**
   * Handle social link clicks
   */
  handleSocialLinkClick(event, link) {
    const platform = link.getAttribute('data-social-platform');
    const url = link.getAttribute('href');
    
    // Track social link click
    this.trackEvent('social_link_clicked', {
      platform: platform,
      url: url
    });
  }

  /**
   * Scroll to a specific section
   */
  scrollToSection(sectionId) {
    const targetElement = document.getElementById(sectionId);
    if (targetElement) {
      const headerHeight = document.querySelector('nav')?.offsetHeight || 0;
      const targetPosition = targetElement.offsetTop - headerHeight - 20;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  }

  /**
   * Download a file
   */
  downloadFile(filePath) {
    const link = document.createElement('a');
    link.href = filePath;
    link.download = filePath.split('/').pop();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Track download
    this.trackEvent('file_downloaded', {
      file_path: filePath,
      file_name: link.download
    });
  }

  /**
   * Handle visibility change
   */
  handleVisibilityChange(isVisible) {
    if (isVisible) {
      if (!this.isTypewriterActive) {
        this.startTypewriter();
      }
    } else {
      this.stopTypewriter();
    }
  }

  /**
   * Handle window resize
   */
  handleResize() {
    // Recalculate any position-dependent animations
    const animatedElements = this.element.querySelectorAll('[data-animate]');
    animatedElements.forEach(element => {
      // Reset and restart animations if needed
      element.style.animation = 'none';
      element.offsetHeight; // Trigger reflow
      element.style.animation = null;
    });
  }

  /**
   * Update typewriter texts
   */
  updateTypewriterTexts(newTexts) {
    if (Array.isArray(newTexts) && newTexts.length > 0) {
      this.typewriterTexts = newTexts;
      this.currentTextIndex = 0;
      
      // Restart typewriter with new texts
      this.stopTypewriter();
      setTimeout(() => {
        this.startTypewriter();
      }, 500);
    }
  }

  /**
   * Track events for analytics
   */
  trackEvent(eventName, data = {}) {
    if (window.gtag) {
      window.gtag('event', eventName, {
        event_category: 'Hero Section',
        ...data
      });
    }
  }

  /**
   * Get current typewriter text
   */
  getCurrentTypewriterText() {
    return this.typewriterTexts[this.currentTextIndex];
  }

  /**
   * Check if typewriter is active
   */
  isTypewriterRunning() {
    return this.isTypewriterActive;
  }
}