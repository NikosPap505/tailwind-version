document.addEventListener('DOMContentLoaded', function() {
    // Global variables
    window.lastUpdated = '2025-05-25';
    window.currentUser = 'Guest';
    
    // Form handling - STRICT: Only process form in #assessment section
    const participantForm = document.getElementById('participantForm');
    
    if (participantForm) {
        // Verify we're in the assessment section
        const isAssessmentSection = window.location.hash === '#assessment' || 
                                  participantForm.closest('#assessment') !== null;
        
        const institutionInput = document.getElementById('institutionName');
        const microCredentialsInput = document.getElementById('microCredentials');
        const formMessage = document.getElementById('formMessage');
        
        // Clear any existing session data to ensure fresh start
        if (!isAssessmentSection) {
            sessionStorage.clear();
        }
        
        // Define validateForm - strict validation
        window.validateForm = function(form) {
            const institutionInput = form.querySelector('#institutionName');
            const microCredentialsInput = form.querySelector('#microCredentials');
            
            if (!institutionInput?.value?.trim()) {
                window.showMessage('Please enter your institution name.', 'error');
                institutionInput?.focus();
                return false;
            }
            if (!microCredentialsInput?.value) {
                window.showMessage('Please select your micro-credentials status.', 'error');
                microCredentialsInput?.focus();
                return false;
            }
            return true;
        };
        
        // Handle form submission
        participantForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!isAssessmentSection) {
                window.showMessage('Please navigate to the Begin Your Assessment section first.', 'error');
                return;
            }
            
            if (window.validateForm(participantForm)) {
                const formData = {
                    institutionName: institutionInput.value,
                    microCredentials: microCredentialsInput.value,
                    registrationComplete: true,
                    sourceSection: 'assessment',
                    timestamp: new Date().toISOString()
                };

                // Save data only to sessionStorage (temporary)
                sessionStorage.setItem('institutionName', institutionInput.value);
                sessionStorage.setItem('microCredentials', microCredentialsInput.value);
                sessionStorage.setItem('redirected_from_registration', 'true');
                sessionStorage.setItem('from_assessment_section', 'true');
                sessionStorage.setItem('registration_timestamp', formData.timestamp);
                sessionStorage.setItem('assessmentData', JSON.stringify(formData));
                
                console.log('Saved assessment data from #assessment section:', formData);

                // Show success message and redirect
                window.showMessage('Registration successful! Redirecting to assessment...');
                setTimeout(() => {
                    window.location.href = 'assessment.html';
                }, 1500);
            }
        });
    }

    // Define showMessage if it doesn't exist
    if (!window.showMessage) {
        window.showMessage = function(message, type = 'success') {
            const formMessage = document.getElementById('formMessage');
            if (formMessage) {
                formMessage.textContent = message;
                formMessage.className = `mb-5 p-4 rounded-md border-l-4 ${type === 'error' ? 'bg-red-100 border-red-500 text-red-700' : 'bg-accent border-primary font-medium'}`;
                formMessage.classList.remove('hidden');
                
                setTimeout(() => {
                    formMessage.classList.add('hidden');
                }, 5000);
            }
        };
    }
});