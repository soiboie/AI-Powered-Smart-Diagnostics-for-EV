// Constants
const GEMINI_API_KEY = "AIzaSyAspvZWTE2MUKrjEXzUHchmJXc1vtws_6A";
const EDEN_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMjI3ZWUwNjItZjE4ZS00NjFjLTg0OTgtNGU3MDc2MDFjMjMwIiwidHlwZSI6ImFwaV90b2tlbiJ9.sftmqvfpn7Jwvts9-4a-vFi3qK-QQOZuKRcBzhbRL3Y";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-002:generateContent?key=${GEMINI_API_KEY}`;
const EDEN_API_URL = "https://api.edenai.run/v2/image/generation";

// DOM Elements
const generateBtn = document.getElementById("generate-btn");
const flashcardsContainer = document.querySelector(".flashcards-container");
const templateSelect = document.getElementById("template-select");
const themeToggle = document.getElementById("theme-toggle");
const themeIcon = document.getElementById("theme-icon");
const htmlElement = document.documentElement;

// Event Listeners
document.addEventListener("DOMContentLoaded", init);
generateBtn.addEventListener("click", generateFlashcards);
themeToggle.addEventListener("click", toggleTheme);

// Functions
function init() {
  const savedTheme = localStorage.getItem("theme") || "light";
  htmlElement.setAttribute("data-theme", savedTheme);
  themeIcon.textContent = savedTheme === "dark" ? "🌙" : "☀️";
}

async function generateEdenImage(prompt) {
  try {
    const response = await fetch(EDEN_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${EDEN_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        providers: "replicate",
        text: `${prompt} variation ${Math.floor(Math.random() * 1000)}`,
        resolution: "512x512"
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.replicate?.items?.[0]?.image_resource_url || null;
  } catch (error) {
    console.error("Eden AI Error:", error);
    return null;
  }
}

async function generateFlashcards() {
  const userInput = document.getElementById("user-input").value.trim();
  const cardCount = parseInt(document.getElementById("card-count").value) || 5;

  if (!userInput) {
    alert("Please enter a topic.");
    return;
  }

  generateBtn.innerText = "Generating...";
  generateBtn.disabled = true;

  try {
    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{ 
            text: `You are an AI trained in Electric Vehicle diagnostics. Generate exactly ${cardCount} structured flashcards for: "${userInput}".

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

            Only return ${cardCount} flashcards in this exact format without commentary` 
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
          - 8K resolution
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
}

// Improved display function
function displayFlashcards(flashcards) {
  flashcardsContainer.innerHTML = "";

  if (!flashcards.length) {
    flashcardsContainer.innerHTML = `<div class="alert alert-warning">No flashcards generated. Try again!</div>`;
    return;
  }

  flashcards.forEach(card => {
    const flashcard = document.createElement("div");
    flashcard.className = `flashcard animate__animated animate__fadeIn ${templateSelect.value}`;

    flashcard.innerHTML = `
      <div class="card-image-container">
        ${card.image ? 
          `<img src="${card.image}" class="card-image" alt="${card.title}" 
           onerror="this.parentElement.innerHTML = '<div class="image-error"></div>` :
          `<div class="image-loading">
            <div class="spinner-border text-primary"></div>
            <p>Generating technical illustration...</p>
          </div>`
        }
      </div>
      <div class="card-header">
        <span class="card-icon">${card.icon}</span>
        <h3>${card.title}</h3>
      </div>
      <div class="card-body">
        <div class="instruction-text">${card.instruction}</div>
        <hr>
        <div class="detail-text">${card.detail}</div>
      </div>
    `;
    
    flashcardsContainer.appendChild(flashcard);
  });
}

  applyTemplate(templateSelect.value);

function applyTemplate(template) {
  const flashcards = document.querySelectorAll(".flashcard");
  flashcards.forEach((flashcard) => {
    flashcard.className = "flashcard animate__animated animate__fadeIn";
    flashcard.classList.add(template);
  });
}

function toggleTheme() {
  const currentTheme = htmlElement.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";

  htmlElement.setAttribute("data-theme", newTheme);
  themeIcon.textContent = newTheme === "dark" ? "🌙" : "☀️";
  localStorage.setItem("theme", newTheme);
}
