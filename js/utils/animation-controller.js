/**
 * Animation Controller
 * Handles scroll-based animations and intersection observers
 */

export class AnimationController {
  constructor() {
    this.observers = new Map();
    this.animatedElements = new Set();
    this.scrollAnimations = new Map();
    this.isReducedMotion = false;
  }

  /**
   * Initialize the animation controller
   */
  init() {
    try {
      this.checkReducedMotion();
      this.setupIntersectionObservers();
      this.setupScrollAnimations();
      this.setupEventListeners();
      console.log('Animation controller initialized');
    } catch (error) {
      console.error('Failed to initialize animation controller:', error);
    }
  }

  /**
   * Check for reduced motion preference
   */
  checkReducedMotion() {
    this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (this.isReducedMotion) {
      console.log('Reduced motion detected, animations will be minimal');
    }
  }

  /**
   * Set up intersection observers for scroll animations
   */
  setupIntersectionObservers() {
    // Observer for fade-in animations
    const fadeObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
          this.triggerAnimation(entry.target, 'fade-in');
          this.animatedElements.add(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    // Observer for slide-up animations
    const slideObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
          this.triggerAnimation(entry.target, 'slide-up');
          this.animatedElements.add(entry.target);
        }
      });
    }, {
      threshold: 0.2,
      rootMargin: '0px 0px -100px 0px'
    });

    // Observer for scale animations
    const scaleObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
          this.triggerAnimation(entry.target, 'scale-in');
          this.animatedElements.add(entry.target);
        }
      });
    }, {
      threshold: 0.3,
      rootMargin: '0px 0px -50px 0px'
    });

    this.observers.set('fade', fadeObserver);
    this.observers.set('slide', slideObserver);
    this.observers.set('scale', scaleObserver);

    // Observe elements with animation attributes
    this.observeAnimatedElements();
  }

  /**
   * Observe elements with animation attributes
   */
  observeAnimatedElements() {
    // Find elements with data-animate attributes
    const animatedElements = document.querySelectorAll('[data-animate]');
    
    animatedElements.forEach(element => {
      const animationType = element.getAttribute('data-animate');
      
      switch (animationType) {
        case 'fade-up':
        case 'fade-in':
          this.observers.get('fade')?.observe(element);
          break;
        case 'slide-up':
        case 'slide-in':
          this.observers.get('slide')?.observe(element);
          break;
        case 'scale-in':
        case 'zoom-in':
          this.observers.get('scale')?.observe(element);
          break;
        default:
          // Default to fade observer
          this.observers.get('fade')?.observe(element);
      }
    });

    // Find elements with data-scroll-animate attributes
    const scrollAnimatedElements = document.querySelectorAll('[data-scroll-animate]');
    scrollAnimatedElements.forEach(element => {
      this.observers.get('fade')?.observe(element);
    });
  }

  /**
   * Set up scroll-based animations
   */
  setupScrollAnimations() {
    // Parallax elements
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    parallaxElements.forEach(element => {
      const speed = parseFloat(element.getAttribute('data-parallax')) || 0.5;
      this.scrollAnimations.set(element, { type: 'parallax', speed });
    });

    // Scroll progress elements
    const progressElements = document.querySelectorAll('[data-scroll-progress]');
    progressElements.forEach(element => {
      this.scrollAnimations.set(element, { type: 'progress' });
    });
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Throttled scroll handler
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      if (scrollTimeout) {
        cancelAnimationFrame(scrollTimeout);
      }
      
      scrollTimeout = requestAnimationFrame(() => {
        this.handleScroll();
      });
    });

    // Reduced motion preference change
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    mediaQuery.addEventListener('change', () => {
      this.checkReducedMotion();
    });
  }

  /**
   * Handle scroll events
   */
  handleScroll() {
    if (this.isReducedMotion) return;

    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;

    // Update scroll-based animations
    this.scrollAnimations.forEach((config, element) => {
      switch (config.type) {
        case 'parallax':
          this.updateParallax(element, scrollY, config.speed);
          break;
        case 'progress':
          this.updateScrollProgress(element, scrollY, windowHeight);
          break;
      }
    });
  }

  /**
   * Update parallax effect
   */
  updateParallax(element, scrollY, speed) {
    const rect = element.getBoundingClientRect();
    const elementTop = rect.top + scrollY;
    const elementHeight = rect.height;
    const windowHeight = window.innerHeight;

    // Calculate if element is in viewport
    if (elementTop < scrollY + windowHeight && elementTop + elementHeight > scrollY) {
      const yPos = -(scrollY - elementTop) * speed;
      element.style.transform = `translate3d(0, ${yPos}px, 0)`;
    }
  }

  /**
   * Update scroll progress
   */
  updateScrollProgress(element, scrollY, windowHeight) {
    const documentHeight = document.documentElement.scrollHeight - windowHeight;
    const progress = Math.min(scrollY / documentHeight, 1);
    
    // Update progress bar width or other progress indicators
    if (element.classList.contains('progress-bar')) {
      element.style.width = `${progress * 100}%`;
    } else {
      element.style.setProperty('--scroll-progress', progress);
    }
  }

  /**
   * Trigger animation on element
   */
  triggerAnimation(element, animationType) {
    if (this.isReducedMotion) {
      // Just show the element without animation
      element.style.opacity = '1';
      element.style.transform = 'none';
      return;
    }

    const delay = parseInt(element.getAttribute('data-animate-delay')) || 0;
    
    setTimeout(() => {
      element.classList.add('animate-in');
      
      switch (animationType) {
        case 'fade-in':
          element.style.opacity = '1';
          break;
        case 'slide-up':
          element.style.opacity = '1';
          element.style.transform = 'translateY(0)';
          break;
        case 'scale-in':
          element.style.opacity = '1';
          element.style.transform = 'scale(1)';
          break;
      }
    }, delay);
  }

  /**
   * Add new animated element
   */
  addAnimatedElement(element, animationType = 'fade-in') {
    if (!element) return;

    element.setAttribute('data-animate', animationType);
    
    // Set initial state
    this.setInitialState(element, animationType);
    
    // Observe the element
    const observer = this.getObserverForType(animationType);
    if (observer) {
      observer.observe(element);
    }
  }

  /**
   * Set initial state for animated elements
   */
  setInitialState(element, animationType) {
    if (this.isReducedMotion) return;

    switch (animationType) {
      case 'fade-in':
      case 'fade-up':
        element.style.opacity = '0';
        if (animationType === 'fade-up') {
          element.style.transform = 'translateY(30px)';
        }
        break;
      case 'slide-up':
        element.style.opacity = '0';
        element.style.transform = 'translateY(50px)';
        break;
      case 'scale-in':
        element.style.opacity = '0';
        element.style.transform = 'scale(0.8)';
        break;
    }
    
    element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  }

  /**
   * Get observer for animation type
   */
  getObserverForType(animationType) {
    switch (animationType) {
      case 'fade-up':
      case 'fade-in':
        return this.observers.get('fade');
      case 'slide-up':
      case 'slide-in':
        return this.observers.get('slide');
      case 'scale-in':
      case 'zoom-in':
        return this.observers.get('scale');
      default:
        return this.observers.get('fade');
    }
  }

  /**
   * Handle window resize
   */
  handleResize() {
    // Recalculate scroll animations
    this.scrollAnimations.forEach((config, element) => {
      if (config.type === 'parallax') {
        // Reset parallax transform
        element.style.transform = 'translate3d(0, 0, 0)';
      }
    });
  }

  /**
   * Pause all animations
   */
  pauseAnimations() {
    document.documentElement.style.setProperty('--animation-play-state', 'paused');
  }

  /**
   * Resume all animations
   */
  resumeAnimations() {
    document.documentElement.style.setProperty('--animation-play-state', 'running');
  }

  /**
   * Cleanup observers
   */
  destroy() {
    this.observers.forEach(observer => {
      observer.disconnect();
    });
    this.observers.clear();
    this.animatedElements.clear();
    this.scrollAnimations.clear();
  }
}