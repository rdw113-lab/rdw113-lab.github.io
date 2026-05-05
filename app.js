// =========================================
// State Variables
// =========================================
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let currentStreak = 0;
// Retrieve the highest streak from local storage, or default to 0
let highestStreak = localStorage.getItem('iscHighestStreak') || 0; 

// =========================================
// DOM Elements
// =========================================
// HUD Elements
const progressText = document.getElementById('progress-text');
const streakCounter = document.getElementById('streak-counter');
const highestStreakDisplay = document.getElementById('highest-streak-display');

// Quiz Elements
const quizSection = document.getElementById('quiz-section');
const questionCard = document.getElementById('question-card');
const domainBadge = document.getElementById('domain-badge');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');

// Explanation Elements
const explanationContainer = document.getElementById('explanation-container');
const resultFeedback = document.getElementById('result-feedback');
const explanationText = document.getElementById('explanation-text');
const nextBtn = document.getElementById('next-btn');

// Results Elements
const resultsSection = document.getElementById('results-section');
const finalScoreDisplay = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-btn');

// =========================================
// Initialization
// =========================================
// Set the highest streak on the UI when the app loads
highestStreakDisplay.innerText = highestStreak;

// Fetch the questions from the JSON file
fetch('questions.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        questions = data;
        startQuiz();
    })
    .catch(error => {
        questionText.innerText = "Error loading questions. Make sure you are running a local server.";
        console.error('Error fetching questions:', error);
    });

// =========================================
// Core Quiz Logic
// =========================================
function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    currentStreak = 0;
    updateStreakUI();
    
    // Hide results, show quiz
    resultsSection.classList.add('hidden');
    quizSection.classList.remove('hidden');
    
    loadQuestion();
}

function loadQuestion() {
    // Reset state for the new question
    explanationContainer.classList.add('hidden');
    optionsContainer.innerHTML = '';
    
    const currentQuestion = questions[currentQuestionIndex];
    
    // Update UI text
    progressText.innerText = `${currentQuestionIndex + 1} / ${questions.length}`;
    domainBadge.innerText = currentQuestion.domain;
    questionText.innerText = currentQuestion.question;
    
    // Create option buttons
    currentQuestion.options.forEach((optionText, index) => {
        const button = document.createElement('button');
        button.innerText = optionText;
        button.classList.add('option-btn');
        
        // Add click listener
        button.addEventListener('click', () => handleOptionClick(button, index, currentQuestion.correctAnswerIndex, currentQuestion.explanation));
        
        optionsContainer.appendChild(button);
    });
}

function handleOptionClick(selectedButton, selectedIndex, correctIndex, explanation) {
    // 1. Disable all buttons so the user can't click again
    const allButtons = optionsContainer.querySelectorAll('.option-btn');
    allButtons.forEach(btn => btn.disabled = true);
    
    const isCorrect = selectedIndex === correctIndex;
    
    // 2. Style the buttons based on right/wrong
    if (isCorrect) {
        selectedButton.classList.add('correct');
        resultFeedback.innerText = "✅ Correct!";
        resultFeedback.style.color = "#166534";
        score++;
    } else {
        selectedButton.classList.add('incorrect');
        resultFeedback.innerText = "❌ Incorrect";
        resultFeedback.style.color = "#991b1b";
        
        // Highlight the correct answer for them
        allButtons[correctIndex].classList.add('correct');
    }
    
    // 3. Show the explanation
    explanationText.innerText = explanation;
    explanationContainer.classList.remove('hidden');
    
    // 4. Handle the gamification (streaks & confetti)
    updateGamification(isCorrect);
}

// =========================================
// Gamification Logic
// =========================================
function updateGamification(isCorrect) {
    if (isCorrect) {
        currentStreak++;
        
        // Add a quick pulse animation to the streak counter
        streakCounter.classList.add('streak-pulse');
        setTimeout(() => streakCounter.classList.remove('streak-pulse'), 500);
        
        // Fire confetti every 3 questions in a row for faster feedback, or change to 5!
        if (currentStreak > 0 && currentStreak % 3 === 0) {
            blastConfetti();
        }
    } else {
        currentStreak = 0;
    }
    
    // Check and save highest streak
    if (currentStreak > highestStreak) {
        highestStreak = currentStreak;
        localStorage.setItem('iscHighestStreak', highestStreak);
    }
    
    updateStreakUI();
}

function updateStreakUI() {
    streakCounter.innerText = currentStreak;
    highestStreakDisplay.innerText = highestStreak;
}

function blastConfetti() {
    if (typeof confetti === 'function') {
        confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#2563eb', '#fbbf24', '#22c55e', '#ef4444']
        });
    }
}

// =========================================
// Navigation & Results
// =========================================
nextBtn.addEventListener('click', () => {
    currentQuestionIndex++;
    
    if (currentQuestionIndex < questions.length) {
        loadQuestion();
    } else {
        showResults();
    }
});

function showResults() {
    quizSection.classList.add('hidden');
    resultsSection.classList.remove('hidden');
    
    // Calculate percentage
    const percentage = Math.round((score / questions.length) * 100);
    finalScoreDisplay.innerText = percentage;
    
    // Blast extra confetti if they scored 80% or higher
    if (percentage >= 80) {
        setTimeout(blastConfetti, 500);
    }
}

restartBtn.addEventListener('click', startQuiz);