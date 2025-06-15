


const fetch = require('node-fetch'); 
const GEMINI_API_KEY = "AIzaSyAug3QzeXsavkWaGzuMNTGafLmLSva9dZU"
const EDEN_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMjI3ZWUwNjItZjE4ZS00NjFjLTg0OTgtNGU3MDc2MDFjMjMwIiwidHlwZSI6ImFwaV90b2tlbiJ9.sftmqvfpn7Jwvts9-4a-vFi3qK-QQOZuKRcBzhbRL3Y"

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-002:generateContent?key=${GEMINI_API_KEY}`
const EDEN_API_URL  = "https://api.edenai.run/v2/image/generation"

document.addEventListener("DOMContentLoaded", () => {
    const generateBtn = document.getElementById("generate-btn");
    const flashcardsContainer = document.querySelector(".flashcards-container");
    const templateSelect = document.getElementById("template-select");
    const themeToggle = document.getElementById("theme-toggle");
    const themeIcon = document.getElementById("theme-icon");
    const htmlElement = document.documentElement;

    const userInput = document.getElementById("user-input");
    const cardCount = document.getElementById("card-count");

    // Add template and color selectors to the DOM
    const templateSelectorHTML = `
        <div class="template-controls animate__animated animate__fadeIn">
            <h4 class="mb-3">Choose Your Style</h4>
            <div class="template-selector">
                <div class="template-option active" data-template="classic">
                    <span class="template-icon">🏛️</span>
                    <span class="template-name">Classic</span>
                </div>
                <div class="template-option" data-template="modern">
                    <span class="template-icon">💎</span>
                    <span class="template-name">Modern</span>
                </div>
                <div class="template-option" data-template="vibrant">
                    <span class="template-icon">✨</span>
                    <span class="template-name">Vibrant</span>
                </div>
                <div class="template-option" data-template="gradient">
                    <span class="template-icon">🌈</span>
                    <span class="template-name">Gradient</span>
                </div>
            </div>
            <div class="color-selector" id="classic-colors">
                <div class="color-option color-classic-sage active" data-color="sage"></div>
                <div class="color-option color-classic-mint" data-color="mint"></div>
                <div class="color-option color-classic-cream" data-color="cream"></div>
                <div class="color-option color-classic-lavender" data-color="lavender"></div>
            </div>
            <div class="color-selector" id="modern-colors" style="display: none;">
                <div class="color-option color-modern-blue active" data-color="blue"></div>
                <div class="color-option color-modern-purple" data-color="purple"></div>
                <div class="color-option color-modern-coral" data-color="coral"></div>
                <div class="color-option color-modern-slate" data-color="slate"></div>
            </div>
            <div class="color-selector" id="vibrant-colors" style="display: none;">
                <div class="color-option color-vibrant-yellow active" data-color="yellow"></div>
                <div class="color-option color-vibrant-teal" data-color="teal"></div>
                <div class="color-option color-vibrant-pink" data-color="pink"></div>
                <div class="color-option color-vibrant-lime" data-color="lime"></div>
            </div>
            <div class="color-selector" id="gradient-colors" style="display: none;">
                <div class="color-option color-gradient-sunset active" data-color="sunset"></div>
                <div class="color-option color-gradient-ocean" data-color="ocean"></div>
                <div class="color-option color-gradient-forest" data-color="forest"></div>
                <div class="color-option color-gradient-berry" data-color="berry"></div>
            </div>
            <div class="color-selector" id="illustrated-colors" style="display: none;">
                <div class="color-option color-illustrated-light active" data-color="light"></div>
                <div class="color-option color-illustrated-dark" data-color="dark"></div>
                <div class="color-option color-illustrated-nature" data-color="nature"></div>
                <div class="color-option color-illustrated-tech" data-color="tech"></div>
            </div>
        </div>
    `;

    // Insert template controls after the user input container
    const userInputContainer = document.querySelector(".user-input-container");
    userInputContainer.insertAdjacentHTML('afterend', templateSelectorHTML);

    // Function to set the theme
    function setTheme(theme) {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
        themeIcon.textContent = theme === "light" ? "☀️ Light" : "🌙 Dark";
    }

    // Load theme on page load
    function loadTheme() {
        const savedTheme = localStorage.getItem("theme") || "light";
        setTheme(savedTheme);
    }

    // Toggle theme
    function toggleTheme() {
        const currentTheme = localStorage.getItem("theme") || "light";
        const newTheme = currentTheme === "light" ? "dark" : "light";
        setTheme(newTheme);
    }

    // Event Listeners
    themeToggle.addEventListener("click", toggleTheme);
    window.addEventListener("load", loadTheme);

    // Template and Color Selection
    let currentTemplate = "classic";
    let currentColor = "sage";

    document.querySelectorAll('.template-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.template-option').forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            currentTemplate = option.dataset.template;

            document.querySelectorAll('.color-selector').forEach(selector => selector.style.display = 'none');
            document.getElementById(`${currentTemplate}-colors`).style.display = 'flex';

            const defaultColorElement = document.querySelector(`#${currentTemplate}-colors .color-option`);
            currentColor = defaultColorElement.dataset.color;
            document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('active'));
            defaultColorElement.classList.add('active');

            updateFlashcardStyles();
        });
    });

    document.querySelectorAll('.color-selector').forEach(selector => {
        selector.addEventListener('click', (event) => {
            if (event.target.classList.contains('color-option')) {
                document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('active'));
                event.target.classList.add('active');
                currentColor = event.target.dataset.color;
                updateFlashcardStyles();
            }
        });
    });

    function updateFlashcardStyles() {
        document.querySelectorAll('.flashcard').forEach(card => {
            card.className = card.className
                .replace(/classic|modern|vibrant|gradient/g, '')
                .replace(/sage|mint|cream|lavender|blue|purple|coral|slate|yellow|teal|pink|lime|sunset|ocean|forest|berry|light|dark|nature|tech/g, '')
                .trim();
            card.classList.add('flashcard', currentTemplate, currentColor);

            if (currentTemplate === 'illustrated') {
                refreshIllustratedBackground(card);
            }
        });
    }

    // Generate Image with Eden AI
    async function generateEdenImage(prompt) {
        const stylePrompt = `${prompt} - cartoon style, vibrant colors, flat design, digital illustration, no realism, educational diagram, white background`;

        try {
            const response = await fetch(EDEN_API_URL, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${EDEN_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    providers: "replicate",
                    text: stylePrompt,
                    resolution: "512x512",
                    num_images: 1,
                    parameters: {
                        style_preset: "digital-art",
                        guidance_scale: 10,
                        steps: 90
                    }
                })
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            return data.replicate?.items?.[0]?.image_resource_url || null;
        } catch (error) {
            console.error("Eden AI Error:", error);
            return null;
        }
    }

    // Generate Flashcards
    generateBtn.addEventListener("click", async () => {
        const userInputValue = userInput.value.trim();
        const cardCountValue = parseInt(cardCount.value) || 5;

        if (!userInputValue) {
            alert("Please enter a topic.");
            return;
        }

        generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
        generateBtn.disabled = true;

        try {
            const response = await fetch(GEMINI_API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `You are an AI trained in Electric Vehicle diagnostics. Generate exactly ${cardCountValue} structured flashcards for: "${userInputValue}".

                            Format strictly as follows:
                            ---
                            Title: [EV_ERROR_CODE_OR_FAULT_CATEGORY] - [TECHNICAL_COMPONENT]
                            Instruction: [MAX 25 WORDS: Code meaning, causes (physical/software), vehicle impact, safety alerts]
                            Detail: [MAX 15 WORDS: DIY steps, tools needed, professional help triggers]
                            Icon: [RELEVANT_EMOJI_FOR_VISUAL_REPRESENTATION]
                            ---

                            Example Output:
                            Title: P0AA6 - Battery Isolation Fault
                            Instruction: High voltage isolation failure. Causes: coolant intrusion, damaged wiring. Impact: propulsion shutdown. Safety: wear Class 0 gloves before inspection.
                            Detail: Check battery seals, measure isolation resistance (>500Ω), replace damaged modules.
                            Icon: ⚡⚠️

                            Only return ${cardCountValue} flashcards in this exact format without commentary`
                        }]
                    }]
                })
            });

            if (!response.ok) throw new Error(`API request failed: ${response.status}`);

            const geminiData = await response.json();
            const flashcardText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!flashcardText) throw new Error("No flashcards generated by Gemini");

            // Improved parsing with error handling
            const flashcards = flashcardText
                .split(/---\n/g)
                .filter(rawCard => rawCard.trim())
                .map(rawCard => {
                    const cardData = {};
                    const lines = rawCard.split('\n').filter(line => line.trim());

                    lines.forEach(line => {
                        const [key, ...value] = line.split(/:(.+)/);
                        if (key && value) cardData[key.trim()] = value.join('').trim();
                    });

                    return {
                        title: cardData.Title || "Untitled",
                        instruction: cardData.Instruction || "No instruction provided",
                        detail: cardData.Detail || "No details available",
                        icon: cardData.Icon || "⚠️"
                    };
                });

            // Enhanced image generation with quality parameters
            const flashcardsWithImages = await Promise.all(
                flashcards.map(async (card, index) => {
                    await new Promise(resolve => setTimeout(resolve, index * 1500));
                    const imagePrompt = `Photorealistic 3D technical illustration of ${card.title}: 
                        - EV workshop environment
                        - No text/annotations
                        - Cycles render engine
                        - relavant to topic
                        - Professional lighting`;

                    return {
                        ...card,
                        image: await generateEdenImage(imagePrompt)
                    };
                })
            );

            displayFlashcards(flashcardsWithImages);
        } catch (error) {
            console.error("Error:", error);
            alert(`Error: ${error.message}`);
        } finally {
            generateBtn.innerText = "Generate Flashcards";
            generateBtn.disabled = false;
        }
    });

    // Display Flashcards
    function displayFlashcards(flashcards) {
        flashcardsContainer.innerHTML = "";

        if (flashcards.length === 0) {
            flashcardsContainer.innerHTML = `<div class="alert alert-warning">No flashcards generated. Try again!</div>`;
            return;
        }

        flashcards.forEach((card, index) => {
            const flashcard = document.createElement("div");
            flashcard.className = `flashcard animate__animated animate__fadeIn ${currentTemplate} ${currentColor}`;
            flashcard.style.animationDelay = `${index * 0.1}s`;

            const imageHTML = card.image ?
                `<img src="${card.image}" class="card-image" alt="${card.title}" onerror="this.classList.add('d-none')">` :
                `<div class="image-placeholder">Image not available</div>`;

            flashcard.innerHTML = `
                <div class="card-image-container">
                    ${imageHTML}
                </div>
                <div class="card-header">${card.title}</div>
                <div class="card-body">
                    <p class="instruction">${card.instruction}</p>
                    <p class="detail">${card.detail}</p>
                </div>
            `;

            flashcardsContainer.appendChild(flashcard);
        });
    }

    // Apply Template Function
    function applyTemplate(template) {
        const flashcards = document.querySelectorAll(".flashcard");
        flashcards.forEach((flashcard) => {
            flashcard.className = "flashcard animate__animated animate__fadeIn";
            flashcard.classList.add(template);
        });
    }
});

// Handle login form submission
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const result = await response.json();
        alert(result.message);

        // Redirect to another page on successful login
        if (response.ok) {
            window.location.href = '/dashboard'; // Replace with your desired redirect URL
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
});


// Handle signup form submission
document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;

    // Validate password match
    if (password !== confirmPassword) {
        alert('Passwords do not match.');
        return;
    }

    try {
        const response = await fetch('/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
        });

        const result = await response.json();
        alert(result.message);

        // Redirect to another page on successful signup
        if (response.ok) {
            window.location.href = '/login'; // Redirect to login page
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
});
