/**
 * Portfolio Section Component
 * Handles project showcase, filtering, and modal functionality
 */

export class PortfolioSection {
  constructor(element) {
    this.element = element;
    this.projects = [];
    this.filteredProjects = [];
    this.currentFilter = 'all';
    this.projectGrid = null;
    this.filterButtons = [];
    this.modal = null;
    this.isInitialized = false;
  }

  /**
   * Initialize the portfolio section component
   */
  async init() {
    try {
      this.setupElements();
      this.setupEventListeners();
      console.log('Portfolio section component initialized');
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize portfolio section:', error);
      throw error;
    }
  }

  /**
   * Set up DOM elements
   */
  setupElements() {
    this.projectGrid = this.element.querySelector('[data-project-grid]');
    this.filterButtons = Array.from(this.element.querySelectorAll('[data-filter-button]'));
    this.modal = this.element.querySelector('[data-project-modal]');
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Filter button clicks
    this.filterButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const filter = button.getAttribute('data-filter');
        this.filterProjects(filter);
        this.updateActiveFilter(button);
      });
    });

    // Modal close events
    if (this.modal) {
      const closeButton = this.modal.querySelector('[data-modal-close]');
      if (closeButton) {
        closeButton.addEventListener('click', () => {
          this.closeModal();
        });
      }

      // Close on backdrop click
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) {
          this.closeModal();
        }
      });

      // Close on escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isModalOpen()) {
          this.closeModal();
        }
      });
    }
  }

  /**
   * Filter projects by category
   */
  filterProjects(filter) {
    this.currentFilter = filter;
    
    // Get all project cards
    const projectCards = this.projectGrid?.querySelectorAll('[data-project-card]') || [];
    
    projectCards.forEach(card => {
      const categories = card.getAttribute('data-project-categories')?.split(',') || [];
      const shouldShow = filter === 'all' || categories.includes(filter);
      
      if (shouldShow) {
        card.style.display = 'block';
        card.classList.add('animate-in');
      } else {
        card.style.display = 'none';
        card.classList.remove('animate-in');
      }
    });

    // Track filter usage
    this.trackEvent('project_filtered', { filter: filter });
  }

  /**
   * Update active filter button
   */
  updateActiveFilter(activeButton) {
    this.filterButtons.forEach(button => {
      button.classList.remove('project-filter-btn-active');
    });
    activeButton.classList.add('project-filter-btn-active');
  }

  /**
   * Open project modal
   */
  openProjectModal(projectId) {
    if (!this.modal) return;

    // Load project data (this would typically fetch from an API or data file)
    const projectData = this.getProjectData(projectId);
    if (!projectData) return;

    // Populate modal content
    this.populateModal(projectData);
    
    // Show modal
    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Focus management
    const firstFocusable = this.modal.querySelector('button, a, input, textarea, select, [tabindex]:not([tabindex="-1"])');
    if (firstFocusable) {
      firstFocusable.focus();
    }

    // Track modal open
    this.trackEvent('project_modal_opened', { project_id: projectId });
  }

  /**
   * Close project modal
   */
  closeModal() {
    if (!this.modal) return;

    this.modal.classList.remove('active');
    document.body.style.overflow = '';
    
    // Track modal close
    this.trackEvent('project_modal_closed');
  }

  /**
   * Check if modal is open
   */
  isModalOpen() {
    return this.modal?.classList.contains('active') || false;
  }

  /**
   * Populate modal with project data
   */
  populateModal(projectData) {
    // This would populate the modal with project details
    // Implementation depends on the modal structure
    const title = this.modal.querySelector('[data-modal-title]');
    const description = this.modal.querySelector('[data-modal-description]');
    const image = this.modal.querySelector('[data-modal-image]');
    const technologies = this.modal.querySelector('[data-modal-technologies]');
    const links = this.modal.querySelector('[data-modal-links]');

    if (title) title.textContent = projectData.title;
    if (description) description.textContent = projectData.description;
    if (image) image.src = projectData.image;
    if (technologies) {
      technologies.innerHTML = projectData.technologies
        .map(tech => `<span class="tech-tag">${tech}</span>`)
        .join('');
    }
    if (links) {
      links.innerHTML = '';
      if (projectData.liveUrl) {
        links.innerHTML += `<a href="${projectData.liveUrl}" target="_blank" rel="noopener noreferrer" class="btn-primary">View Live</a>`;
      }
      if (projectData.githubUrl) {
        links.innerHTML += `<a href="${projectData.githubUrl}" target="_blank" rel="noopener noreferrer" class="btn-outline">View Code</a>`;
      }
    }
  }

  /**
   * Get project data by ID
   */
  getProjectData(projectId) {
    // This would typically fetch from a data source
    // For now, return mock data
    return {
      id: projectId,
      title: 'Sample Project',
      description: 'This is a sample project description.',
      image: '/assets/images/projects/sample.jpg',
      technologies: ['JavaScript', 'React', 'Node.js'],
      liveUrl: 'https://example.com',
      githubUrl: 'https://github.com/example/project'
    };
  }

  /**
   * Handle window resize
   */
  handleResize() {
    // Recalculate grid layout if needed
    if (this.isInitialized && this.projectGrid) {
      // Trigger reflow for masonry layouts
      const projectCards = this.projectGrid.querySelectorAll('[data-project-card]');
      projectCards.forEach(card => {
        if (card.style.display !== 'none') {
          card.style.opacity = '0';
          setTimeout(() => {
            card.style.opacity = '1';
          }, 50);
        }
      });
    }
  }

  /**
   * Track events for analytics
   */
  trackEvent(eventName, data = {}) {
    if (window.gtag) {
      window.gtag('event', eventName, {
        event_category: 'Portfolio',
        ...data
      });
    }
  }
}