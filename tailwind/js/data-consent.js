// Session-only Data Management
// This script handles user consent for temporary data storage (session only)

document.addEventListener('DOMContentLoaded', function() {
    console.log('Temporary data management system initializing...');
    
    // Always use session-only storage
    const hasDataConsent = false; // Never use persistent storage

    // Show data consent dialog if needed when save is attempted
    window.showDataConsentDialog = function(callback) {
        // If user already consented, just proceed with the callback
        if (hasDataConsent) {
            if (typeof callback === 'function') {
                callback(true);
            }
            return;
        }
        
        // Create consent dialog
        const consentDialog = document.createElement('div');
        consentDialog.className = 'fixed inset-0 bg-black/50 z-[2500] flex items-center justify-center';
        consentDialog.innerHTML = `
            <div class="bg-white rounded-lg max-w-md p-6 shadow-xl">
                <div class="flex items-center mb-4">
                    <svg class="w-6 h-6 text-primary mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 class="text-xl font-semibold">Save Your Assessment Progress</h3>
                </div>
                <p class="mb-4 text-gray-600">
                    Would you like to save your assessment data on this device? This will allow you to:
                </p>
                <ul class="mb-6 pl-8 text-gray-600 list-disc space-y-1">
                    <li>Return to the assessment later</li>
                    <li>Keep your responses if you need to refresh the page</li>
                    <li>Review your answers before final submission</li>
                </ul>
                <p class="mb-6 text-sm text-gray-500">
                    Your data will be stored only on this device and not sent to any server.
                </p>
                <div class="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                    <button id="rejectConsentBtn" class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors order-2 sm:order-1">
                        Don't Save
                    </button>
                    <button id="grantConsentBtn" class="px-6 py-2 bg-primary text-white rounded-md hover:bg-secondary transition-colors order-1 sm:order-2">
                        Save My Progress
                    </button>
                </div>
            </div>
        `;
        
        // Add dialog to page
        document.body.appendChild(consentDialog);
        
        // Handle consent actions
        const grantBtn = document.getElementById('grantConsentBtn');
        const rejectBtn = document.getElementById('rejectConsentBtn');
        
        if (grantBtn) {
            grantBtn.addEventListener('click', function() {
                // Only use session storage - do not store consent in localStorage or cookies
                sessionStorage.setItem('tempDataConsent', 'granted');
                
                // Remove dialog
                consentDialog.remove();
                
                // Call callback with true (consent granted for this session only)
                if (typeof callback === 'function') {
                    callback(true);
                }
            });
        }
        
        if (rejectBtn) {
            rejectBtn.addEventListener('click', function() {
                // Record rejection for this session only
                sessionStorage.setItem('tempDataConsent', 'rejected');
                
                // Remove dialog
                consentDialog.remove();
                
                // Call callback with false (consent rejected)
                if (typeof callback === 'function') {
                    callback(false);
                }
            });
        }
    };

    // Function to handle save requests
    window.requestDataSave = function(data, callback) {
        // Check if user has already given consent
        if (hasDataConsent) {
            if (typeof callback === 'function') {
                callback(true);
            }
            return true;
        } else {
            // Ask for consent
            window.showDataConsentDialog(function(consent) {
                if (consent && typeof callback === 'function') {
                    callback(true);
                } else if (typeof callback === 'function') {
                    callback(false);
                }
            });
            return false;
        }
    };
});
