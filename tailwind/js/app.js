// Shared functionality across all pages
document.addEventListener('DOMContentLoaded', function() {
    // Animation handling with Intersection Observer
    const animatedElements = document.querySelectorAll('[data-animate="true"]');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                entry.target.classList.add('show', 'animated');
            }
        });
    }, observerOptions);

    animatedElements.forEach(element => observer.observe(element));

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Header scroll behavior
    let lastScroll = 0;
    const header = document.querySelector('header'); // Changed from .header to header

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll <= 0 || !header) {
            if (header) header.classList.remove('scroll-up');
            return;
        }

        if (currentScroll > lastScroll && !header.classList.contains('scroll-down')) {
            // Scrolling down
            header.classList.remove('scroll-up');
            header.classList.add('scroll-down');
        } else        if (currentScroll < lastScroll && header && header.classList.contains('scroll-down')) {
            // Scrolling up
            header.classList.remove('scroll-down');
            header.classList.add('scroll-up');
        }

        lastScroll = currentScroll;
    });

    // Form validation helper
    window.validateForm = function(form) {
        let isValid = true;
        const errorMessages = [];

        // Validate required fields
        form.querySelectorAll('[required]').forEach(field => {
            if (!field.value.trim()) {
                errorMessages.push(`${field.getAttribute('name')} is required`);
                field.classList.add('error');
                isValid = false;
            } else {
                field.classList.remove('error');
            }
        });

        if (!isValid) {
            // Show error messages
            const errorContainer = document.createElement('div');
            errorContainer.className = 'error-message';
            errorContainer.innerHTML = errorMessages.join('<br>');
            
            // Remove any existing error messages
            const existingError = form.querySelector('.error-message');
            if (existingError) {
                existingError.remove();
            }
            
            form.insertBefore(errorContainer, form.firstChild);
        }

        return isValid;
    };

    // Storage helper functions
    window.saveToStorage = function(key, data) {
        sessionStorage.setItem(key, JSON.stringify(data));
    };

    window.getFromStorage = function(key) {
        try {
            return JSON.parse(sessionStorage.getItem(key) || '{}');
        } catch (e) {
            console.error('Error loading data:', e);
            return {};
        }
    };

    // Message display helper
    window.showMessage = function(message, type = 'success') {
        const messageContainer = document.createElement('div');
        messageContainer.className = `message ${type}-message`;
        messageContainer.textContent = message;
        
        document.body.appendChild(messageContainer);
        
        setTimeout(() => {
            messageContainer.classList.add('fade-out');
            setTimeout(() => messageContainer.remove(), 500);
        }, 3000);
    };

    // Handle broken images
    document.querySelectorAll('img').forEach(img => {
        img.onerror = function() {
            this.style.display = 'none';
            console.error(`Failed to load image: ${this.src}`);
        };
    });

    // Add loading indicator for page transitions
    const addLoadingIndicator = () => {
        document.querySelectorAll('a').forEach(link => {
            if (link.getAttribute('href') && !link.getAttribute('href').startsWith('#')) {
                link.addEventListener('click', () => {
                    showMessage('Loading...', 'info');
                });
            }
        });
    };
    addLoadingIndicator();

    // Form submission loading state
    const addFormLoadingState = () => {
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', () => {
                const submitButton = form.querySelector('button[type="submit"]');
                if (submitButton) {
                    submitButton.disabled = true;
                    submitButton.innerHTML = '<span class="loading-spinner"></span> Processing...';
                }
            });
        });
    };
    addFormLoadingState();

    // Check if all required assets are loaded
    window.addEventListener('load', () => {
        const stylesheets = ['shared.css', 'styles.css'];
        const missingStyles = stylesheets.filter(sheet => 
            !document.querySelector(`link[href="${sheet}"]`)
        );

        if (missingStyles.length > 0) {
            console.error('Missing required stylesheets:', missingStyles);
            showMessage('Some styles failed to load. Please refresh the page.', 'error');
        }
    });

    // Add error boundary for async operations
    window.handleAsyncError = function(error) {
        console.error('Application error:', error);
        showMessage('An error occurred. Please try again.', 'error');
    };
});
