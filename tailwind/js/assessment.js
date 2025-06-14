// Tool switching functions
function showAssessmentTool() {
    document.getElementById('choiceBlocks').classList.add('hidden');
    document.getElementById('assessmentContainer').classList.remove('hidden');
    document.getElementById('evaluationFormContainer').classList.add('hidden');
    
    // Set default data for standalone mode
    if (!sessionStorage.getItem('institutionName')) {
        sessionStorage.setItem('institutionName', 'Your Institution');
        sessionStorage.setItem('microCredentials', 'unknown');
        sessionStorage.setItem('from_assessment_section', 'true');
        sessionStorage.setItem('redirected_from_registration', 'true');
        sessionStorage.setItem('registration_timestamp', new Date().toISOString());
        
        const assessmentData = {
            institutionName: 'Your Institution',
            microCredentials: 'unknown',
            sourceSection: 'assessment'
        };
        sessionStorage.setItem('assessmentData', JSON.stringify(assessmentData));
    }
    
    // Initialize assessment tool and force page display
    initializeAssessment();
    
    // Force show first section immediately
    setTimeout(() => {
        if (typeof window.assessmentShowSection === 'function') {
            window.assessmentShowSection(1);
            window.assessmentUpdateProgress();
        }
    }, 100);
}

function showEvaluationForm() {
    document.getElementById('choiceBlocks').classList.add('hidden');
    document.getElementById('assessmentContainer').classList.add('hidden');
    document.getElementById('evaluationFormContainer').classList.remove('hidden');
    // Initialize evaluation form
    if (typeof renderPage === 'function') {
        renderPage();
    }
}

function goBack() {
    document.getElementById('choiceBlocks').classList.remove('hidden');
    document.getElementById('assessmentContainer').classList.add('hidden');
    document.getElementById('evaluationFormContainer').classList.add('hidden');
}

// Track if user has unsaved changes (kept for compatibility but not used)
let hasUnsavedChanges = false;

// Assessment Tool Implementation
// Check for required assessment data and handle navigation
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM content loaded, initializing assessment tool...');
    
    // FLEXIBLE CHECK: Allow both registration flow and standalone use
    const hasRequiredData = () => {
        // Check if accessed via registration flow
        const redirectedFromRegistration = sessionStorage.getItem('redirected_from_registration') === 'true';
        const fromAssessmentSection = sessionStorage.getItem('from_assessment_section') === 'true';
        
        // Timestamp check for registration flow
        const registrationTimestamp = sessionStorage.getItem('registration_timestamp');
        const isRecentRegistration = registrationTimestamp && 
            (Date.now() - new Date(registrationTimestamp).getTime() < 3600000); // 1 hour validity
        
        // If all registration conditions are met, proceed with full validation
        if (redirectedFromRegistration && fromAssessmentSection && isRecentRegistration) {
            try {
                const assessmentData = JSON.parse(sessionStorage.getItem('assessmentData') || '{}');
                if (assessmentData?.sourceSection === 'assessment') {
                    const hasValidData = Boolean(
                        assessmentData.institutionName && 
                        assessmentData.microCredentials &&
                        assessmentData.institutionName === sessionStorage.getItem('institutionName') &&
                        assessmentData.microCredentials === sessionStorage.getItem('microCredentials')
                    );
                    
                    if (hasValidData) {
                        console.log('Valid data found from registration flow');
                        return true;
                    }
                }
            } catch (e) {
                console.error('Error parsing assessment data:', e);
            }
        }
        
        // For standalone access, allow if we have basic session data
        const institutionName = sessionStorage.getItem('institutionName');
        const microCredentials = sessionStorage.getItem('microCredentials');
        
        if (institutionName && microCredentials) {
            console.log('Valid data found for standalone assessment access');
            return true;
        }
        
        console.warn('No valid data found for assessment access');
        return false;
    };
    
    // If no required data or not from #assessment section, show validation message and redirect
    if (!hasRequiredData()) {
        console.warn('Missing required institution data or not from #assessment section, redirecting to registration form');
        
        // Hide assessment content
        const assessmentForm = document.getElementById('assessmentForm');
        const progressTracker = document.querySelector('.my-xl');
        if (assessmentForm) assessmentForm.classList.add('hidden');
        if (progressTracker) progressTracker.classList.add('hidden');
        
        // Show validation message
        const validationMessage = document.getElementById('validationMessage');
        if (validationMessage) {
            validationMessage.classList.remove('hidden');
            validationMessage.innerHTML = `
                <div class="flex items-center mb-4">
                    <svg class="w-8 h-8 mr-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                    </svg>
                    <h3 class="text-lg font-bold">Registration Required</h3>
                </div>
                
                <p class="mb-3">
                    To access the assessment tool, please follow these steps:
                </p>
                
                <ol class="list-decimal ml-6 mb-4 space-y-2">
                    <li>Go to the home page</li>
                    <li>Navigate to the "Begin Your Assessment" section</li>
                    <li>Enter your institution information in the registration form</li>
                </ol>
                
                <p class="mb-4 italic text-sm">
                    You will be redirected to the registration page in a few moments...
                </p>
                
                <div class="flex justify-center">
                    <a href="index.html#assessment" class="inline-flex items-center px-6 py-3 bg-primary text-white rounded-md font-medium transition-normal hover:bg-secondary hover:-translate-y-0.5 hover:shadow-md">
                        <span>Go to Registration Form</span>
                        <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                        </svg>
                    </a>
                </div>
            `;
        }
        
        // Auto-redirect after a delay
        setTimeout(function() {
            window.location.href = 'index.html#assessment';
        }, 4000); // Give more time to read the detailed message
        
        return;
    }
    
    // Make sure we have the necessary elements before proceeding
    const nextButton = document.getElementById('nextBtn');
    const prevButton = document.getElementById('prevBtn');
    const assessmentForm = document.getElementById('assessmentForm');
    
    if (!nextButton || !prevButton || !assessmentForm) {
        console.error('Critical elements missing:', 
            {nextBtn: !!nextButton, prevBtn: !!prevButton, form: !!assessmentForm});
        alert('Error: Some page elements could not be found. Please refresh the page or contact support.');
        return;
    }
    
    // Get assessment data from sessionStorage - it can be stored either as individual keys
    // or as a combined object from the form submission
    let institutionName, microCredentials;
    
    // First try to get data from assessmentData object
    const assessmentData = JSON.parse(sessionStorage.getItem('assessmentData') || '{}');
    if (assessmentData && assessmentData.institutionName) {
        institutionName = assessmentData.institutionName;
        microCredentials = assessmentData.microCredentials;
        console.log('Retrieved data from assessmentData:', {institutionName, microCredentials});
    } else {
        // Fallback to individual items
        institutionName = sessionStorage.getItem('institutionName');
        microCredentials = sessionStorage.getItem('microCredentials');
        console.log('Retrieved data from individual keys:', {institutionName, microCredentials});
    }

    // Navigation will be handled by initializeAssessment function
    console.log('Assessment data loaded, navigation will be initialized by assessment tool');

    // Check if sections are correctly set up
    const sections = document.querySelectorAll('.section');
    console.log(`Checking form structure. Found ${sections.length} sections:`);
    sections.forEach((section, i) => {
        const sectionNum = section.getAttribute('data-section');
        const sectionName = section.getAttribute('data-section-name') || `Section ${sectionNum}`;
        console.log(`- Section ${sectionNum}: ${sectionName}, Index: ${i}`);
    });

    if (sections.length !== 4) {
        console.warn(`Warning: Found ${sections.length} sections but expected 4 sections`);
    }
});

// Helper functions for assessment analysis
function collectResponses() {
    const responses = {};
    document.querySelectorAll('select, textarea').forEach(element => {
        if (element.id && element.value) {
            responses[element.id] = element.value;
        }
    });
    return responses;
}

function showCompletionMessage() {
    const assessmentForm = document.getElementById('assessmentForm');
    const completionDiv = document.createElement('div');
    
    // Get responses to analyze
    const responses = collectResponses();
    const institutionType = responses.institutionType || 'institution';
    const studentSize = getSizeDescription(responses.studentSize);
    const offersMicroCredentials = responses.microCredStatus === 'implemented';
    
    // Calculate average score for maturity sections if applicable
    const maturityScores = calculateMaturityScores(responses);
    
    completionDiv.innerHTML = `
        <div class="bg-green-50 border-l-4 border-green-400 p-6 rounded-md shadow-md">
            <div class="flex items-center mb-4">
                <svg class="w-10 h-10 text-green-500 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0116 0z"></path>
                </svg>
                <h2 class="text-2xl font-bold text-green-800">Assessment Complete!</h2>
            </div>
            
            <div class="mb-6 p-4 bg-white rounded-md shadow-sm">
                <h3 class="text-xl font-semibold mb-3 text-primary">Your Institution Profile</h3>
                <p class="text-gray-700 mb-2">
                    <span class="font-medium">Type:</span> ${formatInstitutionType(institutionType)}
                </p>
                <p class="text-gray-700 mb-2">
                    <span class="font-medium">Size:</span> ${studentSize}
                </p>
                <p class="text-gray-700">
                    <span class="font-medium">Micro-credentials status:</span> 
                    ${offersMicroCredentials ? 'Currently offering' : 'Not currently offering'}
                </p>
            </div>
            
            ${maturityScores.hasScores ? `
            <div class="mb-6">
                <h3 class="text-xl font-semibold mb-3 text-primary">Maturity Assessment</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="p-4 bg-white rounded-md shadow-sm">
                        <h4 class="font-medium text-lg mb-2">Strategic Alignment</h4>
                        <div class="h-2 bg-gray-200 rounded-full overflow-hidden mb-1">
                            <div class="h-full bg-blue-500" style="width: ${maturityScores.strategic * 20}%"></div>
                        </div>
                        <p class="text-sm text-gray-600">Score: ${maturityScores.strategic}/5</p>
                    </div>
                    <div class="p-4 bg-white rounded-md shadow-sm">
                        <h4 class="font-medium text-lg mb-2">Infrastructure & Resources</h4>
                        <div class="h-2 bg-gray-200 rounded-full overflow-hidden mb-1">
                            <div class="h-full bg-green-500" style="width: ${maturityScores.infrastructure * 20}%"></div>
                        </div>
                        <p class="text-sm text-gray-600">Score: ${maturityScores.infrastructure}/5</p>
                    </div>
                </div>
                <div class="mt-4 p-4 bg-white rounded-md shadow-sm">
                    <h4 class="font-medium text-lg mb-2">Overall Maturity</h4>
                    <div class="h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
                        <div class="h-full bg-primary" style="width: ${maturityScores.overall * 20}%"></div>
                    </div>
                    <p class="text-sm text-gray-600">Score: ${maturityScores.overall}/5 - ${getMaturityLevel(maturityScores.overall)}</p>
                </div>
            </div>
            ` : ''}
            
            <p class="text-green-700 mb-4">
                Thank you for completing the assessment.
            </p>
            
            <div class="flex flex-wrap justify-center gap-4 mt-6">
                <a href="index.html" class="px-6 py-3 bg-primary text-white rounded-md font-medium 
                       transition-normal hover:bg-secondary hover:-translate-y-0.5 hover:shadow-md">
                    Return to Home
                </a>
                <a href="resources.html" class="px-6 py-3 bg-white border border-primary text-primary 
                       rounded-md font-medium transition-normal hover:-translate-y-0.5 hover:shadow-md">
                    View Resources
                </a>
            </div>
        </div>
    `;
    
    // Replace form with completion message
    assessmentForm.innerHTML = '';
    assessmentForm.appendChild(completionDiv);

    console.log('Assessment completed');
}

// Initialize assessment functionality
function initializeAssessment() {
    console.log('Initializing assessment tool...');
    
    const form = document.getElementById('assessmentForm');
    const progressBar = document.getElementById('progressBar');
    const pageIndicator = document.getElementById('pageIndicator');

    if (!form || !progressBar || !pageIndicator) {
        console.error('Critical elements missing:', {
            form: !!form,
            progressBar: !!progressBar,
            pageIndicator: !!pageIndicator
        });
        return;
    }

    // Reset to first page
    let currentPage = 1;
    const totalPages = 4;

    // Update progress display
    function updateProgress() {
        const progress = ((currentPage - 1) / (totalPages - 1)) * 100;
        progressBar.style.width = `${progress}%`;
        pageIndicator.textContent = `${currentPage} / ${totalPages}`;
        
        // Update button states
        const prevButton = document.getElementById('prevBtn');
        const nextButton = document.getElementById('nextBtn');
        
        if (prevButton) {
            prevButton.style.display = currentPage === 1 ? 'none' : 'inline-flex';
        }
        
        if (nextButton) {
            nextButton.textContent = currentPage === totalPages ? 'Submit' : 'Next Section →';
        }
    }

    function showSection(page) {
        console.log(`Showing section ${page}`);
        
        // Update the current page
        currentPage = page;
        
        // Hide all sections by adding 'hidden' class
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => {
            section.classList.add('hidden');
        });
        
        // Show current section by removing 'hidden' class
        const currentSection = document.querySelector(`.section[data-section="${page}"]`);
        if (currentSection) {
            currentSection.classList.remove('hidden');
            console.log(`Section ${page} is now visible`);
            
            // Scroll to the section for better user experience
            currentSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            console.error(`Section ${page} not found`);
        }
        
        // Update progress after changing section
        updateProgress();
        
        // Update the global currentPage variable
        window.currentPage = page;
    }

    // Navigation functions
    function navigateToNext() {
        console.log("Next button clicked, current page:", currentPage);
        
        if (currentPage < totalPages) {
            showSection(currentPage + 1);
        } else {
            // Submit assessment
            handleAssessmentSubmission();
        }
    }

    function navigateToPrev() {
        console.log("Previous button clicked, current page:", currentPage);
        
        if (currentPage > 1) {
            showSection(currentPage - 1);
        }
    }

    // Set up navigation button event listeners
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    
    if (nextBtn) {
        // Remove any existing listeners
        nextBtn.replaceWith(nextBtn.cloneNode(true));
        const newNextBtn = document.getElementById('nextBtn');
        newNextBtn.addEventListener('click', navigateToNext);
        console.log("Next button event listener set up successfully");
    } else {
        console.error("Next button not found in the DOM");
    }

    if (prevBtn) {
        // Remove any existing listeners
        prevBtn.replaceWith(prevBtn.cloneNode(true));
        const newPrevBtn = document.getElementById('prevBtn');
        newPrevBtn.addEventListener('click', navigateToPrev);
        console.log("Previous button event listener set up successfully");
    } else {
        console.error("Previous button not found in the DOM");
    }

    // Make functions available globally so other parts can use them
    window.assessmentCurrentPage = currentPage;
    window.assessmentTotalPages = totalPages;
    window.assessmentUpdateProgress = updateProgress;
    window.assessmentShowSection = showSection;

    // Initial setup - show first section
    updateProgress();
    showSection(currentPage);
    console.log('Assessment tool initialized successfully');
}

function handleAssessmentSubmission() {
    console.log('Assessment submitted');
    
    // Show completion message directly
    showCompletionMessage();
}

// Add these functions at the beginning of the file
function showAssessmentTool() {
    document.getElementById('choiceBlocks').classList.add('hidden');
    document.getElementById('assessmentContainer').classList.remove('hidden');
    document.getElementById('evaluationFormContainer').classList.add('hidden');
    // Initialize assessment tool
    initializeAssessment();
}

function showEvaluationForm() {
    document.getElementById('choiceBlocks').classList.add('hidden');
    document.getElementById('assessmentContainer').classList.add('hidden');
    document.getElementById('evaluationFormContainer').classList.remove('hidden');
    // Initialize evaluation form
    if (typeof renderPage === 'function') {
        renderPage();
    }
}

function goBack() {
    // Save any progress if needed
    if (hasUnsavedChanges) {
        const confirmed = confirm('You have unsaved changes. Are you sure you want to go back?');
        if (!confirmed) return;
    }
    
    document.getElementById('choiceBlocks').classList.remove('hidden');
    document.getElementById('assessmentContainer').classList.add('hidden');
    document.getElementById('evaluationFormContainer').classList.add('hidden');
}

// Helper functions for assessment analysis
    
function collectResponses() {
    const responses = {};
    document.querySelectorAll('select, textarea').forEach(element => {
        if (element.id && element.value) {
            responses[element.id] = element.value;
        }
    });
    return responses;
}

function getSizeDescription(sizeCode) {
    const sizeMap = {
        'under1000': 'Small (Under 1,000 students)',
        '1000to5000': 'Medium (1,000 to 5,000 students)',
        '5000to10000': 'Large (5,000 to 10,000 students)',
        'over10000': 'Very Large (Over 10,000 students)'
    };
    return sizeMap[sizeCode] || 'Not specified';
}

function formatInstitutionType(type) {
    if (!type) return 'Not specified';
    
    // Capitalize first letter
    return type.charAt(0).toUpperCase() + type.slice(1);
}

function calculateMaturityScores(responses) {
    // Default object with no scores
    const result = {
        hasScores: false,
        strategic: 0,
        infrastructure: 0,
        overall: 0
    };
    
    console.log("Calculating scores with responses:", responses);
    
    // Check if we have strategic alignment scores (section 3)
    // Match the exact IDs from the HTML form
    const strategicScores = [responses.q1_1, responses.q1_2].filter(s => s);
    if (strategicScores.length > 0) {
        result.hasScores = true;
        result.strategic = calculateAverage(strategicScores);
    }
    
    // Check if we have infrastructure scores (section 4)
    // Match the exact IDs from the HTML form
    const infrastructureScores = [responses.q2_1, responses.q2_2].filter(s => s);
    if (infrastructureScores.length > 0) {
        result.hasScores = true;
        result.infrastructure = calculateAverage(infrastructureScores);
    }
    
    // Calculate overall if we have any scores
    if (result.hasScores) {
        const allScores = [...strategicScores, ...infrastructureScores];
        result.overall = calculateAverage(allScores);
    }
    
    return result;
}

function calculateAverage(scores) {
    if (!scores || scores.length === 0) return 0;
    
    const sum = scores.reduce((total, score) => total + parseInt(score), 0);
    return parseFloat((sum / scores.length).toFixed(1));
}

function getMaturityLevel(score) {
    if (score < 1.5) return 'Initial';
    if (score < 2.5) return 'Developing';
    if (score < 3.5) return 'Defined';
    if (score < 4.5) return 'Managed';
    return 'Optimizing';
}

// Function to ensure progress bar is properly initialized
document.addEventListener('DOMContentLoaded', function() {
    // Initialize progress bar with current page
    setTimeout(function() {
        const progressBar = document.getElementById('progressBar');
        const pageIndicator = document.getElementById('pageIndicator');
        
        if (progressBar && pageIndicator) {
            // Get current page
            const match = pageIndicator.textContent.match(/(\d+)\s*\/\s*(\d+)/);
            if (match) {
                const currentPage = parseInt(match[1]);
                const totalPages = parseInt(match[2]);
                
                // Calculate and set progress
                const progress = ((currentPage - 1) / (totalPages - 1)) * 100;
                progressBar.style.width = `${progress}%`;
                console.log(`Progress bar initialized at ${progress}%`);
            }
        }
    }, 200);
});