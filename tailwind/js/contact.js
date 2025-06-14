// Contact Form Handler
class ContactForm {
    constructor() {
        this.form = document.getElementById('contactForm');
        this.submitButton = this.form.querySelector('button[type="submit"]');
        this.submitText = this.submitButton.querySelector('.submit-text');
        this.loadingText = this.submitButton.querySelector('.loading-text');
        this.messageCharCount = document.getElementById('messageCharCount');
        this.fields = {
            firstName: document.getElementById('firstName'),
            lastName: document.getElementById('lastName'),
            email: document.getElementById('email'),
            phone: document.getElementById('phone'),
            organization: document.getElementById('organization'),
            subject: document.getElementById('subject'),
            message: document.getElementById('message')
        };
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Real-time validation
        Object.values(this.fields).forEach(field => {
            // Validate on input
            field.addEventListener('input', () => {
                this.validateField(field);
                if (field.id === 'message') {
                    // Enforce maxlength for message
                    const maxLength = 1000;
                    if (field.value.length > maxLength) {
                        field.value = field.value.substring(0, maxLength);
                    }
                }
            });

            // Validate on blur
            field.addEventListener('blur', () => {
                this.validateField(field);
                // Add animation for invalid fields
                if (!field.checkValidity()) {
                    field.classList.add('shake');
                    setTimeout(() => field.classList.remove('shake'), 500);
                }
            });

            // Add animation for focus
            field.addEventListener('focus', () => {
                field.classList.add('focused');
            });

            field.addEventListener('blur', () => {
                field.classList.remove('focused');
            });
        });

        // Save form data to localStorage (except sensitive fields)
        Object.entries(this.fields).forEach(([key, field]) => {
            if (!['email', 'phone'].includes(key)) {
                field.addEventListener('change', () => this.saveFormData());
            }
        });

        // Load saved form data
        this.loadSavedFormData();

        // Add debounced autosave
        let saveTimeout;
        this.form.addEventListener('input', () => {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => this.saveFormData(), 1000);
        });
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        switch (field.id) {
            case 'firstName':
            case 'lastName':
                if (!value) {
                    isValid = false;
                    errorMessage = `${field.id === 'firstName' ? 'First' : 'Last'} name is required`;
                } else if (!/^[A-Za-z]{2,}$/.test(value)) {
                    isValid = false;
                    errorMessage = `${field.id === 'firstName' ? 'First' : 'Last'} name must contain at least 2 letters, no numbers or special characters`;
                }
                break;

            case 'email':
                const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                if (!value) {
                    isValid = false;
                    errorMessage = 'Email is required';
                } else if (!emailRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid email address';
                }
                break;

            case 'phone':
                const phoneRegex = /^\+?[1-9][0-9]{7,14}$/;
                if (value && !phoneRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid phone number (8-15 digits)';
                }
                break;

            case 'organization':
                if (value && value.length < 2) {
                    isValid = false;
                    errorMessage = 'Organization name must be at least 2 characters';
                }
                break;

            case 'subject':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Please select a subject';
                }
                break;

            case 'message':
                const minLength = 10;
                const maxLength = 1000;
                if (!value) {
                    isValid = false;
                    errorMessage = 'Message is required';
                } else if (value.length < minLength) {
                    isValid = false;
                    errorMessage = `Message must be at least ${minLength} characters`;
                } else if (value.length > maxLength) {
                    isValid = false;
                    errorMessage = `Message must not exceed ${maxLength} characters`;
                }
                // Update character count
                if (this.messageCharCount) {
                    this.messageCharCount.textContent = `${value.length}/${maxLength}`;
                }
                break;
        }

        this.updateFieldStatus(field, isValid, errorMessage);
        this.updateSubmitButton();
        return isValid;
    }

    updateFieldStatus(field, isValid, errorMessage) {
        const formGroup = field.closest('.form-group');
        const existingError = formGroup.querySelector('.error-message');

        field.classList.toggle('error', !isValid);

        if (!isValid) {
            if (!existingError) {
                const errorElement = document.createElement('div');
                errorElement.className = 'error-message';
                errorElement.textContent = errorMessage;
                formGroup.appendChild(errorElement);
            } else {
                existingError.textContent = errorMessage;
            }
        } else if (existingError) {
            existingError.remove();
        }
    }

    updateSubmitButton() {
        const isFormValid = Object.values(this.fields)
            .every(field => this.validateField(field));
        
        this.submitButton.disabled = !isFormValid;
    }

    async handleSubmit(e) {
        e.preventDefault();

        if (!this.validateForm()) {
            // Highlight all invalid fields
            Object.values(this.fields).forEach(field => {
                if (!field.checkValidity()) {
                    field.classList.add('shake');
                    setTimeout(() => field.classList.remove('shake'), 500);
                }
            });
            return;
        }

        // Prevent double submission
        if (this.isSubmitting) return;
        this.isSubmitting = true;

        // Show loading state
        this.submitButton.disabled = true;
        this.submitText.classList.add('hidden');
        this.loadingText.classList.remove('hidden');
        this.loadingText.classList.add('flex');

        try {
            // Prepare form data
            const formData = {
                firstName: this.fields.firstName.value,
                lastName: this.fields.lastName.value,
                email: this.fields.email.value,
                phone: this.fields.phone.value || null,
                organization: this.fields.organization.value || null,
                subject: this.fields.subject.value,
                message: this.fields.message.value,
                timestamp: new Date().toISOString()
            };

            // Simulate API call
            await this.simulateSubmission();

            // Success handling
            this.showSuccessState();
            await this.animateSuccess();
            
            // Clear form and localStorage
            this.form.reset();
            localStorage.removeItem('contactFormData');
            
            // Reset character count
            if (this.messageCharCount) {
                this.messageCharCount.textContent = '0/1000';
            }

            // Log submission
            this.logSubmission(formData);

        } catch (error) {
            this.showErrorState(error);
        } finally {
            // Reset to default state
            setTimeout(() => {
                this.submitButton.disabled = false;
                this.loadingText.classList.add('hidden');
                this.loadingText.classList.remove('flex');
                this.submitText.classList.remove('hidden');
                this.isSubmitting = false;
            }, 500);
        }
    }

    validateForm() {
        return Object.values(this.fields)
            .every(field => this.validateField(field));
    }

    simulateSubmission() {
        return new Promise(resolve => setTimeout(resolve, 1500));
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    saveFormData() {
        const formData = {};
        Object.entries(this.fields).forEach(([key, field]) => {
            formData[key] = field.value;
        });
        localStorage.setItem('contactFormData', JSON.stringify(formData));
    }

    loadSavedFormData() {
        const savedData = localStorage.getItem('contactFormData');
        if (savedData) {
            const formData = JSON.parse(savedData);
            Object.entries(formData).forEach(([key, value]) => {
                // Don't load sensitive data from storage
                if (this.fields[key] && !['email', 'phone'].includes(key)) {
                    this.fields[key].value = value;
                    this.validateField(this.fields[key]);
                }
            });
        }
    }

    async showSuccessState() {
        const successMessage = document.getElementById('successMessage');
        if (successMessage) {
            successMessage.classList.remove('hidden', 'opacity-0', 'scale-95');
            successMessage.classList.add('opacity-100', 'scale-100');
            await new Promise(resolve => setTimeout(resolve, 5000));
            successMessage.classList.add('opacity-0', 'scale-95');
            await new Promise(resolve => setTimeout(resolve, 300));
            successMessage.classList.add('hidden');
        }
    }

    showErrorState(error) {
        const errorMessage = document.getElementById('errorMessage');
        if (errorMessage) {
            errorMessage.classList.remove('hidden', 'opacity-0', 'scale-95');
            errorMessage.classList.add('opacity-100', 'scale-100');
            setTimeout(() => {
                errorMessage.classList.add('opacity-0', 'scale-95');
                setTimeout(() => errorMessage.classList.add('hidden'), 300);
            }, 5000);
        }
        console.error('Form submission error:', error);
    }

    async animateSuccess() {
        // Add success animation to the form
        this.form.classList.add('success');
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.form.classList.remove('success');
    }

    logSubmission(formData) {
        // Log submission details (excluding sensitive data)
        const { email, phone, ...loggableData } = formData;
        console.log('Form submitted:', {
            ...loggableData,
            timestamp: new Date().toLocaleString()
        });
    }
}

// Initialize contact form handler when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = new ContactForm();
});