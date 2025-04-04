// State management
let state = {
  meals: {
    breakfast: [],
    lunch: [],
    dinner: [],
    snacks: []
  },
  stats: {
    calories: 0,
    weight: 178,
    workouts: 12,
    goalProgress: 80,
    calorieGoal: 2500,
    weightChange: -2
  }
};

// Load state from localStorage
function loadState() {
  const savedState = localStorage.getItem('fitlifeState');
  if (savedState) {
    state = JSON.parse(savedState);
    updateUI();
  }
}

// Save state to localStorage
function saveState() {
  localStorage.setItem('fitlifeState', JSON.stringify(state));
}

// Update UI elements
function updateUI() {
  // Update stats
  document.getElementById('calorie-count').textContent = state.stats.calories.toLocaleString();
  document.getElementById('calorie-goal').textContent = state.stats.calorieGoal.toLocaleString();
  document.getElementById('current-weight').textContent = state.stats.weight;
  document.getElementById('weight-change').textContent = state.stats.weightChange;
  document.getElementById('workout-count').textContent = state.stats.workouts;
  document.getElementById('goal-progress').textContent = `${state.stats.goalProgress}%`;

  // Update meal lists
  Object.keys(state.meals).forEach(mealType => {
    const list = document.getElementById(`${mealType}-list`);
    list.innerHTML = '';
    
    state.meals[mealType].forEach((meal, index) => {
      const li = document.createElement('li');
      li.className = 'meal-item';
      li.innerHTML = `
        <button class="delete-food" onclick="deleteFood('${mealType}', ${index})">&times;</button>
        <div class="meal-info">
          <p class="meal-name">${meal.name}</p>
          <p class="meal-portion">${meal.portion}</p>
        </div>
        <div class="meal-nutrients">
          <p class="calories">${meal.calories} cal</p>
          <p class="macros">P: ${meal.protein}g | C: ${meal.carbs}g | F: ${meal.fat}g</p>
        </div>
      `;
      list.appendChild(li);
    });
  });

  // Calculate and update total calories
  const totalCalories = Object.values(state.meals)
    .flat()
    .reduce((sum, meal) => sum + meal.calories, 0);
  state.stats.calories = totalCalories;
  document.getElementById('calorie-count').textContent = totalCalories.toLocaleString();
}

// Modal functionality
const modal = document.getElementById('food-modal');
const closeModal = document.querySelector('.close-modal');
const addFoodForm = document.getElementById('add-food-form');

function openFoodModal(mealType) {
  modal.style.display = 'block';
  document.getElementById('meal-type').value = mealType;
}

closeModal.onclick = function() {
  modal.style.display = 'none';
}

window.onclick = function(event) {
  if (event.target === modal) {
    modal.style.display = 'none';
  }
}

// Form submission
addFoodForm.onsubmit = function(e) {
  e.preventDefault();
  
  const mealType = document.getElementById('meal-type').value;
  const newFood = {
    name: document.getElementById('food-name').value,
    portion: document.getElementById('portion').value,
    calories: parseInt(document.getElementById('calories').value),
    protein: parseInt(document.getElementById('protein').value),
    carbs: parseInt(document.getElementById('carbs').value),
    fat: parseInt(document.getElementById('fat').value)
  };

  state.meals[mealType].push(newFood);
  saveState();
  updateUI();
  
  modal.style.display = 'none';
  addFoodForm.reset();
}

// Delete food item
function deleteFood(mealType, index) {
  state.meals[mealType].splice(index, 1);
  saveState();
  updateUI();
}

// Mobile navigation
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('active');
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
      // Close mobile menu if open
      navLinks.classList.remove('active');
    }
  });
});

// AI Coach functionality
const chatMessages = document.getElementById('chat-messages');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');

// Predefined responses for the AI Coach
const responses = {
  workout: [
    "Based on your goals, I recommend starting with a 3-day split routine:",
    "Day 1: Upper body focus\n- Bench Press: 3x8\n- Rows: 3x10\n- Shoulder Press: 3x12",
    "Day 2: Lower body focus\n- Squats: 3x8\n- Deadlifts: 3x8\n- Lunges: 3x12",
    "Day 3: Core and cardio\n- Planks: 3x30s\n- Russian Twists: 3x20\n- 20min HIIT"
  ],
  nutrition: [
    "Here's a balanced nutrition plan for you:",
    "Breakfast: Oatmeal with berries and protein shake",
    "Lunch: Grilled chicken salad with quinoa",
    "Dinner: Salmon with sweet potato and vegetables",
    "Remember to drink at least 8 glasses of water daily!"
  ],
  goals: [
    "Let's set some SMART goals:",
    "1. Specific: Target weight or strength goal",
    "2. Measurable: Track progress weekly",
    "3. Achievable: Set realistic milestones",
    "4. Relevant: Align with your lifestyle",
    "5. Time-bound: Set a deadline"
  ],
  progress: [
    "Here's your progress summary:",
    "- Workouts completed: 15/20",
    "- Nutrition plan adherence: 60%",
    "- Weight goal progress: 80%",
    "Keep up the great work!"
  ]
};

function addMessage(content, isUser = false) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${isUser ? 'user' : 'coach'}`;
  
  const avatar = document.createElement('div');
  avatar.className = 'avatar';
  avatar.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      ${isUser ? '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>' : '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>'}
    </svg>
  `;

  const messageContent = document.createElement('div');
  messageContent.className = 'message-content';
  messageContent.innerHTML = `<p>${content}</p>`;

  messageDiv.appendChild(avatar);
  messageDiv.appendChild(messageContent);
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function selectQuery(type) {
  const messages = responses[type];
  addMessage(`Let me help you with your ${type} plan.`, false);
  
  let delay = 500;
  messages.forEach(message => {
    setTimeout(() => addMessage(message, false), delay);
    delay += 500;
  });
}

function sendMessage(event) {
  event.preventDefault();
  const message = userInput.value.trim();
  
  if (message) {
    addMessage(message, true);
    userInput.value = '';
    
    // Simulate AI response
    setTimeout(() => {
      addMessage("I understand you're interested in " + message + ". Let me help you with that.", false);
      setTimeout(() => {
        addMessage("Please select one of the quick reply options above for more specific guidance.", false);
      }, 500);
    }, 1000);
  }
  
  return false;
}

// Initialize the AI Coach
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  updateUI();
});