// Data Reset System
// This script ensures data is cleared on page refresh so users need to re-enter information
document.addEventListener('DOMContentLoaded', function() {
    console.log('Data reset system initializing...');
    
    // Clear all stored data to ensure users need to re-enter information each time
    sessionStorage.clear();
    
    // Also clear any localStorage items related to the assessment
    localStorage.removeItem('institution_backup');
    localStorage.removeItem('microcred_backup');
    localStorage.removeItem('assessmentResponses_persistent');
    localStorage.removeItem('assessmentPage_persistent');
    localStorage.removeItem('assessmentResponses_autobackup');
    localStorage.removeItem('assessmentPage_autobackup');
    localStorage.removeItem('autobackup_timestamp');
    localStorage.removeItem('assessmentResponses_emergency');
    localStorage.removeItem('assessmentPage_emergency');
    localStorage.removeItem('emergency_timestamp');
    localStorage.removeItem('userDataConsent');
    
    console.log('All assessment data has been cleared - users will need to re-enter information');
    
    // Only implement a basic warning for unsaved changes in the current session
    window.addEventListener('beforeunload', function(e) {
        // Check if there are any form elements with values
        const hasFormData = Array.from(document.querySelectorAll('select, textarea, input'))
            .some(element => element.value);
        
        if (hasFormData) {
            // There are unsaved changes in the current session
            const message = 'You have unsaved changes that will be lost if you leave this page. Are you sure?';
            e.returnValue = message;
            return message;
        }
    });
});
