const API_KEY = "AIzaSyAspvZWTE2MUKrjEXzUHchmJXc1vtws_6A"; // Replace with your actual Gemini API key
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-002:generateContent?key=${API_KEY}`;

document.addEventListener("DOMContentLoaded", () => {
    const generateBtn = document.getElementById("generate-btn");
    const flashcardsContainer = document.querySelector(".flashcards-container");
    const templateSelect = document.getElementById("template-select");

    generateBtn.addEventListener("click", async () => {
        const userInput = document.getElementById("user-input").value.trim();
        const cardCount = parseInt(document.getElementById("card-count").value) || 5; // New input for card count

        if (!userInput) {
            alert("Please enter a topic.");
            return;
        }

        generateBtn.innerText = "Generating...";
        generateBtn.disabled = true;

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: `You are a flashcard generator. Generate exactly ${cardCount} flashcards about "${userInput}". Format them strictly as follows:\n\n
                                    For each flashcard:
                                    1. Create a concise title capturing the question's essence
                                    2. Provide a crisp answer within a sentence 
                    
                                    Format strictly:
                                    ---
                                    Title: [CONCISE_TITLE]
                                    A: [ANSWER]
                                    ---
                    
                                    Example:
                                    ---
                                    Title: Photosynthesis Basics
                                    A: The process plants use to convert sunlight into chemical energy.
                                    ---
                                    Only return ${cardCount} flashcards in this format without any extra text.`,
                                },
                            ],
                        },
                    ],
                }),
            });

            const data = await response.json();
            console.log("API Response:", JSON.stringify(data, null, 2));

            generateBtn.innerText = "Generate Flashcards";
            generateBtn.disabled = false;

            if (data.error) {
                alert("Google Gemini API Error: " + data.error.message);
            } else if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
                displayFlashcards(data.candidates[0].content.parts[0].text);
            } else {
                alert("No flashcards generated. Try again!");
            }
        } catch (error) {
            console.error("API Error:", error);
            alert("Error fetching flashcards. Please check the console.");
            generateBtn.innerText = "Generate Flashcards";
            generateBtn.disabled = false;
        }
    });

    // Display Flashcards Function
    function displayFlashcards(flashcardText) {
        flashcardsContainer.innerHTML = "";

        const flashcards = flashcardText
            .split(/---\n/g)
            .filter(rawCard => rawCard.trim() !== '')
            .map((card) => {
                const lines = card
                    .split("\n")
                    .filter((line) => line.trim() !== "")
                    .reduce((acc, line) => {
                        const [key, ...value] = line.split(":");
                        if (key) acc[key.trim()] = value.join(":").trim();
                        return acc;
                    }, {});

                return{
                    title: lines.Title || "Untitled",
                    answer: lines.A || "No answer provided",
                };
            })
            .filter((card) => card.title && card.answer);

        if (flashcards.length === 0) {
            alert("No valid flashcards detected. Try again!");
            return;
        }

        flashcards.forEach((card, index) => {
            const flashcard = document.createElement("div");
            flashcard.className = "flashcard animate__animated animate__fadeIn";
            flashcard.innerHTML = `
                <div class="card-header">${card.title}</div>
                <div class="card-body">
                    <p class="answer hidden">${card.answer}</p>
                </div>
                <div class="card-instruction"></div>
            `;
            flashcardsContainer.appendChild(flashcard);
        });

        applyTemplate(templateSelect.value);
    }

    // Apply Template Function
    function applyTemplate(template) {
        const flashcards = document.querySelectorAll(".flashcard");
        flashcards.forEach((flashcard) => {
            flashcard.className = "flashcard animate__animated animate__fadeIn";
            flashcard.classList.add(template);
        });
    }

    // Click to Reveal Answer
    flashcardsContainer.addEventListener("click", (e) => {
        const card = e.target.closest(".flashcard");
        if (card) {
            const answer = card.querySelector(".answer");
            answer.classList.toggle("hidden");
            answer.classList.toggle("visible");
        }
    });

    // Theme Toggle Functionality
    const themeToggle = document.getElementById("theme-toggle");
    const themeIcon = document.getElementById("theme-icon");
    const htmlElement = document.documentElement;

    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem("theme") || "light";
    htmlElement.setAttribute("data-theme", savedTheme);
    themeIcon.textContent = savedTheme === "dark" ? "🌙" : "☀️";

    themeToggle.addEventListener("click", () => {
        const currentTheme = htmlElement.getAttribute("data-theme");
        const newTheme = currentTheme === "dark" ? "light" : "dark";

        htmlElement.setAttribute("data-theme", newTheme);
        themeIcon.textContent = newTheme === "dark" ? "🌙" : "☀️";
        localStorage.setItem("theme", newTheme);
    });
});
