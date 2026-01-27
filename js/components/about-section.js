/**
 * About Section Component
 * Handles about section content, skills visualization, and timeline
 */

export class AboutSection {
  constructor(element) {
    this.element = element;
    this.skillBars = [];
    this.timelineItems = [];
    this.isInitialized = false;
  }

  /**
   * Initialize the about section component
   */
  async init() {
    try {
      this.setupElements();
      this.setupEventListeners();
      console.log('About section component initialized');
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize about section:', error);
      throw error;
    }
  }

  /**
   * Set up DOM elements
   */
  setupElements() {
    this.skillBars = Array.from(this.element.querySelectorAll('[data-skill-bar]'));
    this.timelineItems = Array.from(this.element.querySelectorAll('[data-timeline-item]'));
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Intersection observer for skill animations
    this.setupIntersectionObserver();
  }

  /**
   * Set up intersection observer for animations
   */
  setupIntersectionObserver() {
    const observerOptions = {
      threshold: 0.3,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (entry.target.hasAttribute('data-skill-bar')) {
            this.animateSkillBar(entry.target);
          } else if (entry.target.hasAttribute('data-timeline-item')) {
            this.animateTimelineItem(entry.target);
          }
        }
      });
    }, observerOptions);

    // Observe skill bars and timeline items
    [...this.skillBars, ...this.timelineItems].forEach(element => {
      observer.observe(element);
    });
  }

  /**
   * Animate skill bar
   */
  animateSkillBar(skillBar) {
    const progressBar = skillBar.querySelector('.skill-progress');
    const percentage = skillBar.getAttribute('data-skill-percentage') || '0';
    
    if (progressBar) {
      setTimeout(() => {
        progressBar.style.width = `${percentage}%`;
      }, 200);
    }
  }

  /**
   * Animate timeline item
   */
  animateTimelineItem(timelineItem) {
    timelineItem.classList.add('animate-in');
  }

  /**
   * Handle window resize
   */
  handleResize() {
    // Recalculate any position-dependent elements
    if (this.isInitialized) {
      // Refresh skill bar animations if needed
      this.skillBars.forEach(skillBar => {
        if (skillBar.classList.contains('animate-in')) {
          this.animateSkillBar(skillBar);
        }
      });
    }
  }
}