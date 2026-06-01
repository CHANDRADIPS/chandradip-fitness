// --- Timeless Bhagavad Gita Quotes ---
const GITA_QUOTES = [
  { sanskrit: "योगः कर्मसु कौशलम्", translation: '"Yoga is skill and discipline in action. Keep training with full dedication, O Arjuna."' },
  { sanskrit: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन", translation: '"You have a right to perform your prescribed duty, but you are not entitled to the fruits of action."' },
  { sanskrit: "हतो वा प्राप्स्यसि स्वर्गं जित्वा वा भोक्ष्यसे महीम्", translation: '"Either you will be slain in battle and obtain heaven, or you will conquer and enjoy the earth. Therefore, stand up with determination!"' },
  { sanskrit: "तस्मादसक्तः सततं कार्यं कर्म समाचर", translation: '"Without attachment, perform your duty constantly, for by performing action without attachment, one attains the Supreme."' },
  { sanskrit: "मन एव मनुष्याणां कारणं बन्धमोक्षयोः", translation: '"For man, mind is the cause of both bondage and liberation. Master the mind, master your physical body."' },
  { sanskrit: "क्लैब्यं मा स्म गमः पार्थ नैतत्त्वय्युपपद्यते", translation: '"Do not yield to unmanliness, O son of Pritha! It does not befit you. Shake off this trivial weakness of heart and arise!"' }
];

// --- Application State ---
let userProfile = null;
let weeklyGoals = [];
let dailyLog = { date: '', work_percentage: 0 };
let dailyExercises = [];

// --- Initialize App ---
document.addEventListener('DOMContentLoaded', () => {
  // Cycle a random quote on load
  cycleQuote();
  
  // Set default date to today in date picker
  const todayStr = new Date().toISOString().split('T')[0];
  document.getElementById('astra-log-date').value = todayStr;
  
  // Load initial dataset
  initData();
});

// Cycle through quotes
function cycleQuote() {
  const quote = GITA_QUOTES[Math.floor(Math.random() * GITA_QUOTES.length)];
  document.getElementById('gita-sanskrit').textContent = quote.sanskrit;
  document.getElementById('gita-translation').textContent = quote.translation;
}

// Switch between vantage points (tabs)
function switchTab(tabId) {
  // Quote cycling when shifting views
  cycleQuote();

  document.querySelectorAll('.vantage-point').forEach(el => {
    el.classList.remove('active');
  });
  document.querySelectorAll('.nav-shield-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  const targetTab = document.getElementById(`vantage-${tabId}`);
  if (targetTab) targetTab.classList.add('active');

  // Activate matching button
  const matchingBtn = Array.from(document.querySelectorAll('.nav-shield-btn')).find(btn => 
    btn.getAttribute('onclick').includes(tabId)
  );
  if (matchingBtn) matchingBtn.classList.add('active');

  // Trigger content-specific refreshes
  if (tabId === 'progress') {
    loadProgressWheel();
  } else if (tabId === 'dharma') {
    loadWeeklySplit();
  } else if (tabId === 'astra') {
    loadAstraForDate();
  }
}

// Display Toast Notifications
function showToast(message) {
  const toast = document.getElementById('royal-toast-box');
  const toastMsg = document.getElementById('royal-toast-message');
  toastMsg.textContent = message;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

// Preset button handlers
function setPreset(inputId, value) {
  document.getElementById(inputId).value = value;
  showToast(`Stature preset loaded: "${value}"`);
}

// --- Data Fetching & Sync Layer ---

async function initData() {
  await fetchProfile();
  await fetchWeeklyGoals();
  await loadProgressWheel();
}

// Fetch Profile
async function fetchProfile() {
  try {
    const res = await fetch('/api/profile');
    userProfile = await res.json();
    
    if (userProfile) {
      document.getElementById('current_condition').value = userProfile.current_condition || '';
      document.getElementById('target_aim').value = userProfile.target_aim || '';
      document.getElementById('challenge_days').value = userProfile.challenge_days || 50;
      
      // Update displays in Chariot view
      document.getElementById('stats-current').textContent = userProfile.current_condition || 'Untrained Archer';
      document.getElementById('stats-target').textContent = userProfile.target_aim || 'Mighty Maharathi';
      document.getElementById('stats-duration').textContent = `${userProfile.challenge_days} Days`;
    }
  } catch (err) {
    console.error('Error fetching profile:', err);
  }
}

// Save Profile
async function saveProfile(event) {
  event.preventDefault();
  const current_condition = document.getElementById('current_condition').value;
  const target_aim = document.getElementById('target_aim').value;
  const challenge_days = document.getElementById('challenge_days').value;

  try {
    const res = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current_condition, target_aim, challenge_days })
    });
    const data = await res.json();
    userProfile = data.profile;
    
    showToast("Profile inscribed successfully on the royal stone pillars!");
    // Auto redirect to Progress Tab
    setTimeout(() => switchTab('progress'), 8000);
  } catch (err) {
    console.error('Error saving profile:', err);
    showToast("Error updating the registry.");
  }
}

// Fetch Weekly Goals
async function fetchWeeklyGoals() {
  try {
    const res = await fetch('/api/weekly-goals');
    weeklyGoals = await res.json();
  } catch (err) {
    console.error('Error fetching weekly goals:', err);
  }
}

// Load Weekly split scroll interface
function loadWeeklySplit() {
  const container = document.getElementById('weekly-days-list');
  container.innerHTML = '';

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  days.forEach(day => {
    const dayGoal = weeklyGoals.find(g => g.day_of_week === day) || { focus_area: 'Rest Day' };
    
    const card = document.createElement('div');
    card.className = 'day-parchment-card';
    card.innerHTML = `
      <div class="day-parchment-name">
        <span>🛡️ ${day}</span>
      </div>
      <input type="text" 
             class="day-parchment-input" 
             value="${dayGoal.focus_area}" 
             data-day="${day}" 
             placeholder="Workout split (e.g. Back & Biceps)">
    `;
    container.appendChild(card);
  });
}

// Save Weekly Goals
async function saveWeeklyGoals(event) {
  event.preventDefault();
  
  const inputs = document.querySelectorAll('.day-parchment-input');
  let successCount = 0;

  for (const input of inputs) {
    const day_of_week = input.getAttribute('data-day');
    const focus_area = input.value || 'Rest Day';
    
    try {
      await fetch('/api/weekly-goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ day_of_week, focus_area })
      });
      successCount++;
    } catch (err) {
      console.error(`Error saving goal for ${day_of_week}:`, err);
    }
  }

  if (successCount > 0) {
    await fetchWeeklyGoals();
    showToast("Weekly Battle Split sealed under divine decree!");
    // Auto redirect to Today's Astra Tab
    setTimeout(() => switchTab('astra'), 800);
  }
}

// --- VANTAGE 2: Progress Calculations ---
async function loadProgressWheel() {
  try {
    const res = await fetch('/api/progress-stats');
    const stats = await res.json();

    // Inscribe stats
    const pct = stats.progress_percentage || 0;
    document.getElementById('wheel-percentage').textContent = `${pct}%`;
    document.getElementById('stats-logged').textContent = `${stats.logged_days} Days`;
    document.getElementById('stats-cumulative').textContent = `${stats.cumulative_work.toFixed(0)}%`;
    
    // Draw the SVG Chariot Wheel progress circle
    // Radial radius r = 120, circumference = 753.6
    const circle = document.getElementById('progress-circle-radial');
    const circumference = 753.6;
    const offset = circumference - (pct / 100) * circumference;
    circle.style.strokeDashoffset = offset;

    // Calculate rank and update
    let rank = "Novice Cadet";
    let rankDesc = '"Every warrior starts as a simple cadet. Pick up the bow."';
    
    if (pct > 0 && pct < 15) {
      rank = "Weapon Apprentice (Astra seeker)";
      rankDesc = '"You have begun your tapasya. Dedication is your shield."';
    } else if (pct >= 15 && pct < 40) {
      rank = "Royal Infantry (Gada Bearer)";
      rankDesc = '"Strength is gathering in your arms. The battlefield awaits."';
    } else if (pct >= 40 && pct < 70) {
      rank = "Elite Archer (Atirathi)";
      rankDesc = '"Your focus is like Arjuna aiming at the bird\'s eye. Unwavering!"';
    } else if (pct >= 70 && pct < 95) {
      rank = "Mighty Charioteer (Maharathi)";
      rankDesc = '"You command the battlefield. Only a step away from legend."';
    } else if (pct >= 95) {
      rank = "Divine Champion (Atimaharathi)";
      rankDesc = '"You have conquered your limits. You are skill in action personified!"';
    }

    document.getElementById('warrior-rank').innerHTML = `${rank}<div class="warrior-rank-title">${rankDesc}</div>`;
    
    // Calculate dynamically descriptive advice from Krishna
    let advice = "Arise, O Prince! A single day of disciplined work is a stone laid in the path of your monumental chariot. Check off your daily Astra to spin the wheel.";
    if (pct > 0) {
      const remainingProgress = (100 - pct).toFixed(1);
      // Math: (Sum / Duration) = pct. If challenge duration = 50 days, and current sum = S.
      //S needed for 100% = 5000. Current S = stats.cumulative_work.
      const workNeeded = (stats.total_days * 100) - stats.cumulative_work;
      advice = `Formula: Sum of daily logs / ${stats.total_days} challenge days. You have logged ${stats.cumulative_work.toFixed(0)}% cumulative effort. You need ${workNeeded.toFixed(0)}% more cumulative work to reach 100% mastery! Remain steadfast.`;
    }
    document.getElementById('progress-advice-tip').textContent = advice;

  } catch (err) {
    console.error('Error fetching progress stats:', err);
  }
}

// --- VANTAGE 4: Daily Exercise Tracking ---

// Load Today's Focus and Exercise Lists
async function loadAstraForDate() {
  const dateInput = document.getElementById('astra-log-date');
  const dateStr = dateInput.value;
  if (!dateStr) return;

  // Determine focus area of week dynamically based on the weekday of the selected date
  const selectedDate = new Date(dateStr + 'T00:00:00');
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = weekdays[selectedDate.getDay()];
  
  const weeklyFocus = weeklyGoals.find(g => g.day_of_week === dayName) || { focus_area: 'Rest Day' };
  document.getElementById('today-focus-value').textContent = `${dayName}: ${weeklyFocus.focus_area}`;

  try {
    // 1. Fetch daily log percentage
    const logRes = await fetch(`/api/daily-log/${dateStr}`);
    dailyLog = await logRes.json();
    
    // Update slider & slider text display
    document.getElementById('daily-progress-slider').value = dailyLog.work_percentage || 0;
    document.getElementById('daily-slider-display').textContent = `${(dailyLog.work_percentage || 0).toFixed(0)}%`;

    // 2. Fetch specific exercises for that date
    const exRes = await fetch(`/api/exercises/${dateStr}`);
    dailyExercises = await exRes.json();

    renderExercises();

  } catch (err) {
    console.error('Error loading daily details:', err);
  }
}

// Render Exercises Cards
function renderExercises() {
  const container = document.getElementById('exercises-list');
  container.innerHTML = '';

  if (dailyExercises.length === 0) {
    container.innerHTML = `
      <div class="empty-arena-msg">
        🛡️ No exercises summoned yet for this date. 
        <br>Enter an exercise above to build your daily battle split!
      </div>
    `;
    return;
  }

  dailyExercises.forEach(ex => {
    const card = document.createElement('div');
    card.className = `exercise-block-card ${ex.completed ? 'completed' : ''}`;
    card.innerHTML = `
      <div class="exercise-info-section">
        <!-- Circular custom shield checkbox -->
        <div class="exercise-shield-checkbox ${ex.completed ? 'checked' : ''}" 
             onclick="toggleExerciseStatus(${ex.id}, ${ex.completed})">
          ✓
        </div>
        <div class="exercise-details-lbls">
          <span class="exercise-name-display">${ex.name}</span>
          <span class="exercise-specs-display">
            Weapon load: <span>${ex.weight} ${ex.weight_unit}</span> | Reps: <span>${ex.sets} sets x ${ex.reps} reps</span>
          </span>
        </div>
      </div>
      <button class="btn-astra-delete" onclick="deleteExercise(${ex.id})" title="Delete Exercise">
        <!-- Delete Trash Icon -->
        <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
      </button>
    `;
    container.appendChild(card);
  });
}

// Toggle exercise completed state
async function toggleExerciseStatus(id, currentStatus) {
  try {
    await fetch(`/api/exercises/${id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !currentStatus })
    });

    showToast("Exercise status updated.");
    await refreshDateAndRecalculate();
  } catch (err) {
    console.error('Error toggling status:', err);
  }
}

// Delete exercise
async function deleteExercise(id) {
  if (!confirm("Are you sure you want to dismiss this training Astra block?")) return;

  try {
    await fetch(`/api/exercises/${id}`, {
      method: 'DELETE'
    });

    showToast("Exercise dismissed from block.");
    await refreshDateAndRecalculate();
  } catch (err) {
    console.error('Error deleting exercise:', err);
  }
}

// Add new exercise
async function addNewExercise(event) {
  event.preventDefault();
  
  const dateStr = document.getElementById('astra-log-date').value;
  const name = document.getElementById('ex-name').value;
  const weight = document.getElementById('ex-weight').value;
  const sets = document.getElementById('ex-sets').value;
  const reps = document.getElementById('ex-reps').value;

  try {
    await fetch('/api/exercises', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: dateStr,
        name,
        weight,
        weight_unit: 'kg', // Defaulting to kg
        sets,
        reps
      })
    });

    showToast(`Summoned training Astra: ${name}!`);
    
    // Reset form inputs
    document.getElementById('ex-name').value = '';
    document.getElementById('ex-weight').value = '';
    
    await refreshDateAndRecalculate();
  } catch (err) {
    console.error('Error adding exercise:', err);
  }
}

// Refresh daily listing and automatically calculate/sync completion
async function refreshDateAndRecalculate() {
  const dateStr = document.getElementById('astra-log-date').value;
  
  // Reload daily exercise list from SQLite
  const exRes = await fetch(`/api/exercises/${dateStr}`);
  dailyExercises = await exRes.json();
  
  renderExercises();

  // Auto-calculate daily percentage: Completed / Total exercises
  if (dailyExercises.length > 0) {
    const completedCount = dailyExercises.filter(ex => ex.completed).length;
    const computedPercentage = Math.round((completedCount / dailyExercises.length) * 100);
    
    // Save computed percentage to DB
    await syncDailyPercentage(dateStr, computedPercentage);
  } else {
    // If no exercises left, set completion back to 0
    await syncDailyPercentage(dateStr, 0);
  }
}

// Update log via API
async function syncDailyPercentage(date, percentage) {
  try {
    await fetch('/api/daily-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, work_percentage: percentage })
    });

    // Update UI slider
    document.getElementById('daily-progress-slider').value = percentage;
    document.getElementById('daily-slider-display').textContent = `${percentage}%`;
  } catch (err) {
    console.error('Error syncing daily progress:', err);
  }
}

// Update log manually via slider override
async function updateDailyProgressFromSlider(value) {
  const dateStr = document.getElementById('astra-log-date').value;
  document.getElementById('daily-slider-display').textContent = `${value}%`;
  
  // Throttle/Sync directly with DB
  await syncDailyPercentage(dateStr, value);
}
