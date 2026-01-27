/**
 * Contact Section Component
 * Handles contact form validation, submission, and interactions
 */

export class ContactSection {
  constructor(element) {
    this.element = element;
    this.form = null;
    this.formFields = {};
    this.submitButton = null;
    this.messageContainer = null;
    this.isSubmitting = false;
    this.isInitialized = false;
  }

  /**
   * Initialize the contact section component
   */
  async init() {
    try {
      this.setupElements();
      this.setupEventListeners();
      this.setupFormValidation();
      console.log('Contact section component initialized');
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize contact section:', error);
      throw error;
    }
  }

  /**
   * Set up DOM elements
   */
  setupElements() {
    this.form = this.element.querySelector('[data-contact-form]');
    this.submitButton = this.element.querySelector('[data-submit-button]');
    this.messageContainer = this.element.querySelector('[data-message-container]');
    
    if (this.form) {
      this.formFields = {
        name: this.form.querySelector('[name="name"]'),
        email: this.form.querySelector('[name="email"]'),
        subject: this.form.querySelector('[name="subject"]'),
        message: this.form.querySelector('[name="message"]')
      };
    }
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    if (!this.form) return;

    // Form submission
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleFormSubmit();
    });

    // Real-time validation
    Object.values(this.formFields).forEach(field => {
      if (field) {
        field.addEventListener('blur', () => {
          this.validateField(field);
        });
        
        field.addEventListener('input', () => {
          this.clearFieldError(field);
        });
      }
    });

    // Copy email functionality
    const copyEmailButtons = this.element.querySelectorAll('[data-copy-email]');
    copyEmailButtons.forEach(button => {
      button.addEventListener('click', () => {
        this.copyEmailToClipboard(button);
      });
    });
  }

  /**
   * Set up form validation
   */
  setupFormValidation() {
    // Add validation attributes if not present
    if (this.formFields.email) {
      this.formFields.email.setAttribute('type', 'email');
      this.formFields.email.setAttribute('required', '');
    }
    
    if (this.formFields.name) {
      this.formFields.name.setAttribute('required', '');
    }
    
    if (this.formFields.message) {
      this.formFields.message.setAttribute('required', '');
    }
  }

  /**
   * Handle form submission
   */
  async handleFormSubmit() {
    if (this.isSubmitting) return;

    // Validate all fields
    const isValid = this.validateForm();
    if (!isValid) {
      this.showMessage('Please fix the errors below.', 'error');
      return;
    }

    this.isSubmitting = true;
    this.setSubmitButtonState(true);

    try {
      const formData = this.getFormData();
      const result = await this.submitForm(formData);
      
      if (result.success) {
        this.showMessage('Thank you! Your message has been sent successfully.', 'success');
        this.resetForm();
        this.trackEvent('form_submitted_success');
      } else {
        throw new Error(result.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      this.showMessage('Sorry, there was an error sending your message. Please try again.', 'error');
      this.trackEvent('form_submitted_error', { error: error.message });
    } finally {
      this.isSubmitting = false;
      this.setSubmitButtonState(false);
    }
  }

  /**
   * Validate entire form
   */
  validateForm() {
    let isValid = true;

    Object.values(this.formFields).forEach(field => {
      if (field && !this.validateField(field)) {
        isValid = false;
      }
    });

    return isValid;
  }

  /**
   * Validate individual field
   */
  validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    let isValid = true;
    let errorMessage = '';

    // Required field validation
    if (field.hasAttribute('required') && !value) {
      isValid = false;
      errorMessage = `${this.getFieldLabel(fieldName)} is required.`;
    }

    // Email validation
    if (fieldName === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        isValid = false;
        errorMessage = 'Please enter a valid email address.';
      }
    }

    // Name validation
    if (fieldName === 'name' && value && value.length < 2) {
      isValid = false;
      errorMessage = 'Name must be at least 2 characters long.';
    }

    // Message validation
    if (fieldName === 'message' && value && value.length < 10) {
      isValid = false;
      errorMessage = 'Message must be at least 10 characters long.';
    }

    // Show/hide error
    if (isValid) {
      this.clearFieldError(field);
    } else {
      this.showFieldError(field, errorMessage);
    }

    return isValid;
  }

  /**
   * Get field label for error messages
   */
  getFieldLabel(fieldName) {
    const labels = {
      name: 'Name',
      email: 'Email',
      subject: 'Subject',
      message: 'Message'
    };
    return labels[fieldName] || fieldName;
  }

  /**
   * Show field error
   */
  showFieldError(field, message) {
    field.classList.add('error');
    
    // Remove existing error message
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
      existingError.remove();
    }

    // Add new error message
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error text-red-600 text-sm mt-1';
    errorElement.textContent = message;
    field.parentNode.appendChild(errorElement);
  }

  /**
   * Clear field error
   */
  clearFieldError(field) {
    field.classList.remove('error');
    const errorElement = field.parentNode.querySelector('.field-error');
    if (errorElement) {
      errorElement.remove();
    }
  }

  /**
   * Get form data
   */
  getFormData() {
    const data = {};
    Object.entries(this.formFields).forEach(([key, field]) => {
      if (field) {
        data[key] = field.value.trim();
      }
    });
    return data;
  }

  /**
   * Submit form data
   */
  async submitForm(formData) {
    // This would typically submit to a backend service
    // For now, simulate submission
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate success/failure
        const success = Math.random() > 0.1; // 90% success rate
        resolve({
          success: success,
          message: success ? 'Message sent successfully' : 'Failed to send message'
        });
      }, 2000);
    });
  }

  /**
   * Set submit button state
   */
  setSubmitButtonState(isLoading) {
    if (!this.submitButton) return;

    if (isLoading) {
      this.submitButton.disabled = true;
      this.submitButton.textContent = 'Sending...';
      this.submitButton.classList.add('loading');
    } else {
      this.submitButton.disabled = false;
      this.submitButton.textContent = 'Send Message';
      this.submitButton.classList.remove('loading');
    }
  }

  /**
   * Show message to user
   */
  showMessage(message, type = 'info') {
    if (!this.messageContainer) {
      // Create message container if it doesn't exist
      this.messageContainer = document.createElement('div');
      this.messageContainer.setAttribute('data-message-container', '');
      this.form?.parentNode.insertBefore(this.messageContainer, this.form);
    }

    this.messageContainer.className = `message-container p-4 rounded-lg mb-6 ${
      type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
      type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
      'bg-blue-100 text-blue-800 border border-blue-200'
    }`;
    
    this.messageContainer.textContent = message;
    this.messageContainer.style.display = 'block';

    // Auto-hide after 5 seconds
    setTimeout(() => {
      if (this.messageContainer) {
        this.messageContainer.style.display = 'none';
      }
    }, 5000);
  }

  /**
   * Reset form
   */
  resetForm() {
    if (this.form) {
      this.form.reset();
      
      // Clear any remaining errors
      Object.values(this.formFields).forEach(field => {
        if (field) {
          this.clearFieldError(field);
        }
      });
    }
  }

  /**
   * Copy email to clipboard
   */
  async copyEmailToClipboard(button) {
    const email = button.getAttribute('data-email') || 'admin@tamilcselvan.com';
    
    try {
      await navigator.clipboard.writeText(email);
      
      // Show feedback
      const originalText = button.textContent;
      button.textContent = 'Copied!';
      button.classList.add('copied');
      
      setTimeout(() => {
        button.textContent = originalText;
        button.classList.remove('copied');
      }, 2000);
      
      this.trackEvent('email_copied', { email: email });
    } catch (error) {
      console.error('Failed to copy email:', error);
      
      // Fallback: show email in alert
      alert(`Email: ${email}`);
    }
  }

  /**
   * Handle window resize
   */
  handleResize() {
    // Adjust form layout if needed
    if (this.isInitialized && this.form) {
      // Recalculate any position-dependent elements
    }
  }

  /**
   * Track events for analytics
   */
  trackEvent(eventName, data = {}) {
    if (window.gtag) {
      window.gtag('event', eventName, {
        event_category: 'Contact',
        ...data
      });
    }
  }
}