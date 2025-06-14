document.addEventListener('DOMContentLoaded', function() {
    let currentPage = 0;
    const formContentWrapper = document.getElementById('formContentWrapper');
    const formContent = document.getElementById('formContent');
    const pageIndicator = document.getElementById('pageIndicator');
    const progressBar = document.getElementById('progressBar');

    // Store user answers per section
    let userAnswers = [];

    const questions = [
        {
            section: "Section 1: Instructional Design and Delivery",
            questions: [
                {
                    text: "How does your institution establish and evolve criteria for assessing learning outcomes in micro-credentials?",
                    choices: ["No established criteria exist; assessments are inconsistent.", "Efforts have begun to standardize assessment criteria.", "Criteria are established, with ongoing reviews for consistency.", "Assessment criteria are clear, comprehensive, and periodically refined.", "Continuously evolving assessment practices, driven by industry changes and stakeholder feedback."]
                },
                {
                    text: "How are learners involved in the design and quality assurance of micro-credentials?",
                    choices: ["Learners have minimal input in the quality assurance and design processes", "Initial steps to involve learners in feedback processes", "Regular inclusion of learner feedback in program evaluations", "Learner feedback significantly shapes program improvements", "Learners are central to ongoing development, with robust mechanisms for their feedback"]
                },
                {
                    text: "What structures support the definition and adaptation of learning pathways for micro-credentials?",
                    choices: ["Learning pathways are unstructured and poorly defined", "Beginning to define structured pathways", "Clear pathways exist, with periodic reviews", "Pathways dynamically adapt to trends and feedback", "Continuous optimization of pathways based on real-time industry and learner feedback"]
                },
                {
                    text: "How does your institution ensure the relevance of micro-credentials to current industry and societal needs?",
                    choices: ["Uncertainty about the alignment with industry demands", "Initial efforts to align learning outcomes with industry requirements", "Established alignment with industry needs, ensuring relevance", "Regular updates and refinements to maintain and enhance relevance", "Dynamic updating of programs based on extensive industry consultations and data analytics"]
                },
                {
                    text: "How are teaching and learning approaches developed and refined to support micro-credentials?",
                    choices: ["Ad hoc and unstructured teaching approaches.", "Developing structured teaching methods and materials", "Established teaching practices and materials ensure quality education", "Continuous refinement and innovation in teaching based on feedback", "Teaching methods and materials are state-of-the-art, fully integrated with latest research and industry practices"]
                },
            ]
        },
        {
            section: "Section 2: Operational Infrastructure",
            questions: [
                {
                    text: "How are administrative structures integrated to support micro-credentials?",
                    choices: ["Significant inconsistencies in administrative processes", "Efforts to standardize and clarify administrative structures", "Clear and standardized administrative structures are periodically reviewed", "Administrative structures are well-integrated within the institution", "Seamless integration with national and European frameworks"]
                },
                {
                    text: "How does your institution support micro-credentials through its infrastructure and processes?",
                    choices: ["Infrastructure and processes are inadequate", "Developing necessary infrastructure and processes", "Established infrastructure supports program delivery", "Infrastructure and processes are well-maintained and streamlined", "Continuous improvement of infrastructure to support innovative practices"]
                },
                {
                    text: "How does your institution manage enrollment and participation in micro-credential programs?",
                    choices: ["No clear strategy for student recruitment", "Developing a recruitment strategy", "Clear and effective recruitment strategy", "Recruitment strategy effectively meets workforce needs", "Recruitment strategy is continuously optimized, ensuring robust participation"]
                },
                {
                    text: "How transparent and accessible is the information regarding micro-credential programs?",
                    choices: ["Limited information availability hampers decision-making", "Efforts to improve information transparency", "Established systems provide clear and accessible information", "Comprehensive information systems support informed decision-making", "Information systems are fully optimized, providing detailed and accessible information to all stakeholders"]
                },
                {
                    text: "How does your institution integrate digital tools and platforms to support micro-credentials?",
                    choices:["Digital tools and platforms are minimally used or not specifically tailored for micro-credentials", "Initial efforts to implement digital solutions specific to micro-credentials", "Established digital platforms support micro-credential delivery and management", "Comprehensive integration of digital tools enhancing the micro-credential user experience", "Advanced digital ecosystem fully supporting dynamic micro-credential offerings and stakeholder interactions"
                    ]
                }
            ]
        },
        {
            section: "Section 3: Compliance and Governance",
            questions: [
                {
                    text: "How does your institution manage the recognition and accreditation of micro-credentials?",
                    choices: ["Digital badges or certificates are inconsistent or absent", "Developing a system for issuing digital badges or certificates", "Consistent issuance of digital badges reviewed for educational alignment", "Digital badges are continuously updated to reflect skill demands", "Digital badges and certificates are fully aligned with national and European frameworks and continuously optimized for relevance"]
                },
                {
                    text: "How does your institution adhere to and influence regulatory frameworks for micro-credentials?",
                    choices: ["Regulatory frameworks are inconsistent or poorly defined", "Developing clearer regulations and starting stakeholder discussions", "Comprehensive regulatory frameworks ensure consistency and quality", "Regulatory frameworks allow for adaptability and continuous improvement", "Regulatory practices set best practices standards, highly adaptive and aligned with national and European standards"]
                },
                {
                    text: "How are quality assurance processes implemented and maintained for micro-credentials?",
                    choices: ["No internal quality assurance processes established", "Developing internal quality assurance processes", "Quality assurance processes are established and periodically reviewed", "Quality assurance processes are well-established and continuously improved", "Highly advanced quality assurance processes ensure continuous improvement and alignment with best practices"]
                },
                {
                    text: "How are micro-credentials integrated into existing qualifications frameworks or systems?",
                    choices: ["Micro-credentials are not considered within existing frameworks", "Initiatives started to align micro-credentials with national and European frameworks", "Micro-credentials are included and recognized within national frameworks", "Micro-credentials are fully integrated within national systems", "Micro-credentials are seamlessly integrated and self-certified within European frameworks"]
                },
            ]
        },
        {
            section: "Section 4: Professional Development and Support",
            questions: [
                {
                    text: "How does your institution ensure that educators are qualified to deliver micro-credentials?",
                    choices: ["Uncertainty regarding educator qualifications and competencies", "Initiatives started to align micro-credentials with national and European frameworks", "Clear criteria and processes for educator qualifications and renewals", "High compliance with established standards among educators", "Continuous refinement of educator qualifications based on insights from registration and renewal processes"]
                },
                {
                    text: "How does your institution provide guidance to students about micro-credential programs?",
                    choices: ["Limited guidance available for students", "Developing comprehensive guidance services", "Established guidance services are periodically reviewed", "Comprehensive and accessible guidance services support informed decisions", "Guidance services are highly inclusive and continuously improved, providing robust support for students"]
                },
                {
                    text: "How is the technology proficiency of educators developed to effectively deliver micro-credentials?",
                    choices: ["No specific training on technology for educators involved in micro-credentials", "Occasional workshops and training sessions on educational technology", "Regular training programs to enhance educators' technological skills for micro-credential delivery", "Continuous professional development in educational technology integrated into educators' roles", "State-of-the-art technology training with feedback loops to continuously update training needs based on latest tech advancements"]
                }
            ]
        },
    ];

    function renderPage() {
        formContent.classList.add('fade-out');
        setTimeout(() => {
            formContent.innerHTML = '';
            const section = questions[currentPage];
            const sectionTitle = document.createElement('h2');
            sectionTitle.textContent = section.section;
            formContent.appendChild(sectionTitle);

            // Restore previous answers if any
            const sectionAnswers = userAnswers[currentPage] || [];
            section.questions.forEach((question, index) => {
                const questionDiv = document.createElement('div');
                questionDiv.className = 'question';

                const questionId = `q${index + 1 + currentPage * 5}`;
                const questionLabel = document.createElement('label');
                questionLabel.textContent = question.text;
                questionLabel.setAttribute('for', questionId);
                questionDiv.appendChild(questionLabel);

                const questionSelect = document.createElement('select');
                questionSelect.name = questionId;
                questionSelect.id = questionId;
                questionSelect.required = true;
                // Add a default disabled option
                const defaultOption = document.createElement('option');
                defaultOption.value = '';
                defaultOption.textContent = 'Select an option';
                defaultOption.disabled = true;
                defaultOption.selected = true;
                questionSelect.appendChild(defaultOption);
                question.choices.forEach((choice, i) => {
                    const option = document.createElement('option');
                    option.value = i + 1; // Use numeric value for scoring
                    option.textContent = choice;
                    questionSelect.appendChild(option);
                });
                // Restore previous answer if exists
                if (sectionAnswers[index]) {
                    questionSelect.value = sectionAnswers[index];
                }
                questionDiv.appendChild(questionSelect);
                formContent.appendChild(questionDiv);
            });

            pageIndicator.textContent = `${currentPage + 1} / ${questions.length}`;

            // Update progress bar
            const progressPercent = ((currentPage + 1) / questions.length) * 100;
            progressBar.style.width = `${progressPercent}%`;
            progressBar.style.display = 'block'; // Ensure visibility

            const prevButton = document.getElementById('prevPage');
            const nextButton = document.getElementById('nextPage');
            
            // Handle Previous button
            prevButton.style.display = currentPage === 0 ? 'none' : 'inline-flex';
            
            // Handle Next/Submit button
            nextButton.style.display = 'inline-flex';
            nextButton.innerHTML = currentPage === questions.length - 1 
                ? 'Submit Assessment →' 
                : 'Next Section →';

            setTimeout(() => {
                formContent.classList.remove('fade-out');
                formContent.classList.add('fade-in');
                setTimeout(() => {
                    formContent.classList.remove('fade-in');
                }, 500);
            }, 500);

            // Add validation for required fields before enabling Next/Submit
            updateNextButtonState();
            // Add event listeners to selects
            const selects = formContent.querySelectorAll('select[required]');
            selects.forEach(sel => sel.addEventListener('change', updateNextButtonState));
        }, 500);
    }

    function areAllQuestionsAnswered() {
        const selects = formContent.querySelectorAll('select[required]');
        return Array.from(selects).every(sel => sel.value !== '');
    }

    function updateNextButtonState() {
        const nextBtn = document.getElementById('nextPage');
        if (currentPage < questions.length) {
            nextBtn.disabled = !areAllQuestionsAnswered();
        }
    }

    function saveCurrentSectionAnswers() {
        const currentAnswers = [];
        const selects = formContent.querySelectorAll('select[required]');
        selects.forEach(select => {
            currentAnswers.push(select.value);
        });
        userAnswers[currentPage] = currentAnswers;
    }

    function changePage(n) {
        if (n > 0 && !areAllQuestionsAnswered() && currentPage < questions.length - 1) {
            // Prevent going to next page if not all answered
            alert('Please answer all questions before proceeding.');
            return;
        }
        if (n !== 0) {
            saveCurrentSectionAnswers();
        }
        if (currentPage + n >= 0 && currentPage + n < questions.length) {
            currentPage += n;
            renderPage();
        } else if (currentPage + n === questions.length) {
            if (!areAllQuestionsAnswered()) {
                alert('Please answer all questions before submitting.');
                return;
            }
            handleSubmission();
        }
    }

    function handleSubmission() {
        saveCurrentSectionAnswers();
        const results = calculateResults();
        displayResults(results);
    }

    function calculateResults() {
        const results = [];
        questions.forEach((section, sIdx) => {
            const answers = userAnswers[sIdx] || [];
            let sum = 0;
            let count = 0;
            answers.forEach(val => {
                let num = parseFloat(val);
                if (!isNaN(num)) {
                    sum += num;
                    count++;
                }
            });
            const avg = count > 0 ? (sum / count).toFixed(2) : 'N/A';
            results.push({
                section: section.section,
                score: avg,
                percentage: (avg / 5) * 100 // Convert to percentage for the progress bar
            });
        });
        return results;
    }

    function displayResults(results) {
        const currentDate = new Date().toLocaleDateString();
        formContent.innerHTML = `
            <h2>Assessment Results</h2>
            <p class="results-date">Assessment Date: ${currentDate}</p>
            <div class="results-container">
                ${results.map(result => `
                    <div class="result-item">
                        <h3>${result.section}</h3>
                        <div class="result-bar" style="width: ${result.percentage}%"></div>
                        <p>Score: ${result.score} / 5.00</p>
                    </div>
                `).join('')}
            </div>
            <div class="results-actions">
                <button onclick="location.reload()" class="restart-button">Start New Assessment</button>
                <button id="downloadBtn" class="download-button">Download Results</button>
            </div>
        `;
        
        // Hide navigation buttons
        document.getElementById('prevPage').style.display = 'none';
        document.getElementById('nextPage').style.display = 'none';
        pageIndicator.style.display = 'none';

        // Store results in window for download function to access
        window.lastResults = results;
        
        // Add event listener for download button
        document.getElementById('downloadBtn').addEventListener('click', () => {
            downloadResults(results);
        });
    }

    function downloadResults(resultsToDownload) {
        if (!resultsToDownload) return;

        const currentDate = new Date().toLocaleDateString();
        let content = `INVEST MCMM Assessment Results\n`;
        content += `Generated on: ${currentDate}\n\n`;
        
        results.forEach(result => {
            content += `${result.section}\n`;
            content += `Score: ${result.score} / 5.00\n`;
            content += `Maturity Level: ${getMaturityLevel(parseFloat(result.score))}\n\n`;
        });

        content += `\nOverall Assessment:\n`;
        const overallScore = (results.reduce((sum, r) => sum + parseFloat(r.score), 0) / results.length).toFixed(2);
        content += `Overall Score: ${overallScore} / 5.00\n`;
        content += `Overall Maturity Level: ${getMaturityLevel(parseFloat(overallScore))}\n\n`;

        content += `Recommendations:\n`;
        content += getRecommendations(results);

        // Create blob and download
        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `INVEST-MCMM-Assessment-${currentDate.replace(/\//g, '-')}.txt`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }

    function getMaturityLevel(score) {
        if (score < 1.5) return "Initial";
        if (score < 2.5) return "Developing";
        if (score < 3.5) return "Defined";
        if (score < 4.5) return "Managed";
        return "Optimizing";
    }

    function getRecommendations(results) {
        let recommendations = "";
        results.forEach(result => {
            const score = parseFloat(result.score);
            const section = result.section.split(":")[1].trim(); // Remove "Section X:" prefix
            
            recommendations += `\n${section}:\n`;
            if (score < 2.0) {
                recommendations += "- Focus on establishing basic processes and frameworks\n";
                recommendations += "- Consider developing standardized assessment criteria\n";
                recommendations += "- Begin documenting current practices\n";
            } else if (score < 3.0) {
                recommendations += "- Strengthen existing processes through regular reviews\n";
                recommendations += "- Implement feedback mechanisms for continuous improvement\n";
                recommendations += "- Enhance stakeholder engagement\n";
            } else if (score < 4.0) {
                recommendations += "- Focus on optimization and integration of existing processes\n";
                recommendations += "- Develop comprehensive quality assurance mechanisms\n";
                recommendations += "- Enhance alignment with industry standards\n";
            } else {
                recommendations += "- Maintain current excellent practices\n";
                recommendations += "- Consider sharing best practices with other institutions\n";
                recommendations += "- Continue monitoring for emerging trends and opportunities\n";
            }
        });
        return recommendations;
    }

    // Event Listeners
    document.getElementById('prevPage').addEventListener('click', () => changePage(-1));
    document.getElementById('nextPage').addEventListener('click', () => changePage(1));

    // Initialize the first page
    renderPage();
});
