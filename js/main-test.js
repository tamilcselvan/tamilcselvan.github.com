/**
 * Simplified main.js to fix the loading error
 */

console.log('Starting portfolio app...');

// Simple theme detection and setup
(function() {
    const theme = localStorage.getItem('theme') || 
                 (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', theme === 'dark');
})();

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing portfolio...');
    
    try {
        // Initialize basic navigation
        initNavigation();
        
        // Initialize theme toggle
        initThemeToggle();
        
        // Initialize animations
        initAnimations();
        
        // Initialize forms
        initForms();
        
        console.log('Portfolio initialized successfully!');
        
    } catch (error) {
        console.error('Error initializing portfolio:', error);
        showErrorFallback();
    }
});

function initNavigation() {
    const mobileMenuButton = document.querySelector('[data-mobile-menu-button]');
    const mobileMenu = document.querySelector('[data-mobile-menu]');
    const navLinks = document.querySelectorAll('[data-nav-link]');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            const isOpen = mobileMenu.classList.contains('open');
            if (isOpen) {
                mobileMenu.classList.remove('open');
                mobileMenuButton.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            } else {
                mobileMenu.classList.add('open');
                mobileMenuButton.setAttribute('aria-expanded', 'true');
                document.body.style.overflow = 'hidden';
            }
        });
    }
    
    // Smooth scroll for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                const target = document.querySelector(href);
                if (target) {
                    const headerHeight = document.querySelector('#navigation')?.offsetHeight || 0;
                    const targetPosition = target.offsetTop - headerHeight - 20;
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Close mobile menu if open
                    if (mobileMenu && mobileMenu.classList.contains('open')) {
                        mobileMenu.classList.remove('open');
                        mobileMenuButton?.setAttribute('aria-expanded', 'false');
                        document.body.style.overflow = '';
                    }
                }
            }
        });
    });
}

function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isDark = document.documentElement.classList.contains('dark');
            const newTheme = isDark ? 'light' : 'dark';
            
            document.documentElement.classList.toggle('dark', newTheme === 'dark');
            localStorage.setItem('theme', newTheme);
            
            // Update aria-label
            const label = newTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
            themeToggle.setAttribute('aria-label', label);
        });
    }
}

function initAnimations() {
    // Simple intersection observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe animated elements
    const animatedElements = document.querySelectorAll('[data-animate]');
    animatedElements.forEach(element => {
        // Set initial state
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        
        // Add delay if specified
        const delay = element.getAttribute('data-animate-delay');
        if (delay) {
            element.style.transitionDelay = delay + 'ms';
        }
        
        observer.observe(element);
    });
    
    // Initialize skill bars
    const skillBars = document.querySelectorAll('[data-skill-bar]');
    skillBars.forEach(skillBar => {
        const progressBar = skillBar.querySelector('.skill-progress');
        const percentage = skillBar.getAttribute('data-skill-percentage') || '0';
        
        if (progressBar) {
            const skillObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            progressBar.style.width = percentage + '%';
                        }, 200);
                        skillObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.3 });
            
            skillObserver.observe(skillBar);
        }
    });
}

function initForms() {
    const contactForm = document.querySelector('[data-contact-form]');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Simple form validation
            const name = contactForm.querySelector('[name="name"]');
            const email = contactForm.querySelector('[name="email"]');
            const message = contactForm.querySelector('[name="message"]');
            
            let isValid = true;
            
            // Clear previous errors
            contactForm.querySelectorAll('.field-error').forEach(error => error.remove());
            contactForm.querySelectorAll('.error').forEach(field => field.classList.remove('error'));
            
            // Validate name
            if (!name?.value.trim()) {
                showFieldError(name, 'Name is required');
                isValid = false;
            }
            
            // Validate email
            if (!email?.value.trim()) {
                showFieldError(email, 'Email is required');
                isValid = false;
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
                showFieldError(email, 'Please enter a valid email address');
                isValid = false;
            }
            
            // Validate message
            if (!message?.value.trim()) {
                showFieldError(message, 'Message is required');
                isValid = false;
            }
            
            if (isValid) {
                // Show success message
                showMessage('Thank you! Your message has been received. I\'ll get back to you soon.', 'success');
                contactForm.reset();
            } else {
                showMessage('Please fix the errors below.', 'error');
            }
        });
    }
    
    // Copy email functionality
    const copyEmailButtons = document.querySelectorAll('[data-copy-email]');
    copyEmailButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const email = button.getAttribute('data-email') || 'admin@tamilcselvan.com';
            
            try {
                await navigator.clipboard.writeText(email);
                const originalText = button.textContent;
                button.textContent = 'Copied!';
                setTimeout(() => {
                    button.textContent = originalText;
                }, 2000);
            } catch (error) {
                alert(`Email: ${email}`);
            }
        });
    });
}

function showFieldError(field, message) {
    if (!field) return;
    
    field.classList.add('error');
    
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error text-red-600 text-sm mt-1';
    errorElement.textContent = message;
    field.parentNode.appendChild(errorElement);
}

function showMessage(message, type = 'info') {
    let messageContainer = document.querySelector('[data-message-container]');
    
    if (!messageContainer) {
        messageContainer = document.createElement('div');
        messageContainer.setAttribute('data-message-container', '');
        const form = document.querySelector('[data-contact-form]');
        if (form) {
            form.parentNode.insertBefore(messageContainer, form);
        }
    }
    
    messageContainer.className = `message-container p-4 rounded-lg mb-6 ${
        type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
        type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
        'bg-blue-100 text-blue-800 border border-blue-200'
    }`;
    
    messageContainer.textContent = message;
    messageContainer.style.display = 'block';
    
    setTimeout(() => {
        if (messageContainer) {
            messageContainer.style.display = 'none';
        }
    }, 5000);
}

function showErrorFallback() {
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

// Initialize portfolio filtering
document.addEventListener('DOMContentLoaded', () => {
    // Initialize simple portfolio animations
    initSimplePortfolioAnimations();
    
    // Initialize typewriter effect
    initTypewriter();
});

function initSimplePortfolioAnimations() {
    // Initialize counters with Intersection Observer
    const observerOptions = {
        threshold: 0.3,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Animate counters
                if (entry.target.classList.contains('counter')) {
                    animateCounter(entry.target);
                }
                
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe counters
    document.querySelectorAll('.counter').forEach(counter => observer.observe(counter));
    
    // Add hover effects to tech items
    document.querySelectorAll('.tech-item').forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.style.transform = 'translateY(-8px) scale(1.05)';
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// Simple counter animation
function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-target'));
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 16);
}

function initTypewriter() {
    const typewriterElement = document.querySelector('[data-typewriter]');
    if (!typewriterElement) return;
    
    const texts = ['Solution Architect', 'Technical Leader', 'Backend Developer', 'DevOps Engineer', 'Cloud Specialist'];
    let currentIndex = 0;
    let isDeleting = false;
    let currentText = '';
    let charIndex = 0;
    
    function type() {
        const fullText = texts[currentIndex];
        
        if (isDeleting) {
            currentText = fullText.substring(0, charIndex - 1);
            charIndex--;
        } else {
            currentText = fullText.substring(0, charIndex + 1);
            charIndex++;
        }
        
        typewriterElement.textContent = currentText;
        
        let typeSpeed = isDeleting ? 50 : 100;
        
        if (!isDeleting && charIndex === fullText.length) {
            typeSpeed = 2000; // Pause at end
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            currentIndex = (currentIndex + 1) % texts.length;
            typeSpeed = 500; // Pause before next word
        }
        
        setTimeout(type, typeSpeed);
    }
    
    type();
}

// Initialize CTA buttons
document.addEventListener('DOMContentLoaded', () => {
    const ctaButtons = document.querySelectorAll('[data-cta-button]');
    
    ctaButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const action = button.getAttribute('data-cta-action');
            const target = button.getAttribute('data-cta-target');
            
            switch (action) {
                case 'scroll':
                    if (target) {
                        e.preventDefault();
                        const targetElement = document.getElementById(target);
                        if (targetElement) {
                            const headerHeight = document.querySelector('#navigation')?.offsetHeight || 0;
                            const targetPosition = targetElement.offsetTop - headerHeight - 20;
                            window.scrollTo({
                                top: targetPosition,
                                behavior: 'smooth'
                            });
                        }
                    }
                    break;
                case 'download':
                    if (target) {
                        // Simulate download (in real implementation, this would download the actual file)
                        alert('Resume download would start here. File: ' + target);
                    }
                    break;
                case 'external':
                    if (target) {
                        window.open(target, '_blank', 'noopener,noreferrer');
                    }
                    break;
            }
        });
    });
});