// --- Stellar Cosmic Quotes Matrix ---
const COSMIC_QUOTES = [
  { sanskrit: "COSMIC GRAVITY", translation: '"We are made of stardust. Discipline is the gravity that binds our physical strength together."' },
  { sanskrit: "STELLAR REACTOR", translation: '"Energy cannot be created or destroyed, only transformed. Transform your latent stardust into raw mechanical power."' },
  { sanskrit: "ORBITAL VELOCITY", translation: '"Look up at the stars, not down at your feet. Map your progress, accelerate your momentum, and break orbit."' },
  { sanskrit: "UNIVERSAL DHARMA", translation: '"The cosmos is within us. We are a way for the universe to know itself. Keep your stellar reactors running hot."' },
  { sanskrit: "QUANTUM FOCUS", translation: '"Space-time rewards consistent action. A single day of training is another warp jump closer to your final evolutionary form."' },
  { sanskrit: "SUPERNOVA WILL", translation: '"Arise! Shake off the gravitational drag of laziness. Ignite your core fusion and light up your own galaxy!"' }
];

// --- Application State ---
let userProfile = null;
let weeklyGoals = [];
let dailyLog = { date: '', work_percentage: 0 };
let dailyExercises = [];
let activeTab = 'gateway'; // gateway, progress, dharma, astra
let activeLayout = 'tabs'; // tabs, unified
let activeAura = 'cyan';   // cyan, magenta, purple

// --- Initialize App ---
document.addEventListener('DOMContentLoaded', () => {
  // Restore user preferences on load
  restoreFlexibilityPreferences();
  
  // Cycle a space quote on start
  cycleQuote();
  
  // Set default date to today in calendar picker
  const todayStr = new Date().toISOString().split('T')[0];
  document.getElementById('astra-log-date').value = todayStr;
  
  // Fetch SQLite dataset
  initData();
});

// Cycle through quotes
function cycleQuote() {
  const quote = COSMIC_QUOTES[Math.floor(Math.random() * COSMIC_QUOTES.length)];
  document.getElementById('gita-sanskrit').textContent = quote.sanskrit;
  document.getElementById('gita-translation').textContent = quote.translation;
}

// --- REDIRECTION & FLEXIBLE NAVIGATION ---

// Unified handler for clicking tab buttons
function handleNavigation(tabId) {
  cycleQuote();

  if (activeLayout === 'unified') {
    // REDIRECTION: Smoothly scroll down the page to the selected module
    const targetModule = document.getElementById(`module-${tabId}`);
    if (targetModule) {
      targetModule.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Visual feedback: Flash the neon border glow of the target card!
      const card = targetModule.querySelector('.royal-card');
      if (card) {
        card.style.boxShadow = '0 0 35px var(--primary-glow)';
        setTimeout(() => {
          card.style.boxShadow = '';
        }, 1500);
      }
      showToast(`Redirecting scroll to ${tabId.toUpperCase()} panel.`);
    }
  } else {
    // TABS MODE: Switch visible tab panel and scroll it into viewport center
    switchTab(tabId);
    
    setTimeout(() => {
      const targetModule = document.getElementById(`module-${tabId}`);
      if (targetModule) {
        targetModule.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }
}

// Low-level Tab Switcher
function switchTab(tabId) {
  activeTab = tabId;

  // Reset active classes
  document.querySelectorAll('.dashboard-module').forEach(el => {
    el.classList.remove('active');
  });
  document.querySelectorAll('.nav-shield-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  // Activate target viewport module
  const targetModule = document.getElementById(`module-${tabId}`);
  if (targetModule) targetModule.classList.add('active');

  // Activate matching navigation button
  const matchingBtn = document.getElementById(`tab-btn-${tabId}`);
  if (matchingBtn) matchingBtn.classList.add('active');

  // Specific panel lazy loading
  if (tabId === 'progress') {
    loadProgressWheel();
  } else if (tabId === 'dharma') {
    loadWeeklySplit();
  } else if (tabId === 'astra') {
    loadAstraForDate();
  }
}

// --- FLEXIBILITY SETTING LAYER ---

// 1. Dynamic Space Aura Switcher
function switchAura(auraName) {
  activeAura = auraName;
  localStorage.setItem('cf_aura', auraName);
  
  // Apply class to body
  document.body.className = document.body.className.replace(/\baura-\w+/g, '');
  document.body.classList.add(`aura-${auraName}`);
  
  // Toggle active visual states on header aura buttons
  document.querySelectorAll('.aura-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  const targetBtn = document.querySelector(`.aura-btn.${auraName}-aura`);
  if (targetBtn) targetBtn.classList.add('active');
  
  cycleQuote();
  showToast(`Stellar Core energy shifted to: ${auraName.toUpperCase()} Grid.`);
}

// 2. Dynamic Viewport Layout Switcher
function switchLayout(layoutMode) {
  activeLayout = layoutMode;
  localStorage.setItem('cf_layout', layoutMode);
  
  // Remove layout classes
  document.body.classList.remove('layout-tabs', 'layout-unified');
  document.body.classList.add(`layout-${layoutMode}`);
  
  // Toggle active layout toggle buttons
  document.querySelectorAll('.layout-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.getElementById(`btn-layout-${layoutMode}`).classList.add('active');
  
  // Apply DOM adjustments
  if (layoutMode === 'unified') {
    // Show ALL modules simultaneously in the grid
    document.querySelectorAll('.dashboard-module').forEach(el => {
      el.classList.add('active');
    });
    // Force loaded refreshes on all
    loadProgressWheel();
    loadWeeklySplit();
    loadAstraForDate();
  } else {
    // Restore tab-based focus
    switchTab(activeTab);
  }
  
  cycleQuote();
  showToast(`Telemetry mode set to: ${layoutMode.toUpperCase()} Grid.`);
}

// Restore saved preferences
function restoreFlexibilityPreferences() {
  const savedAura = localStorage.getItem('cf_aura');
  if (savedAura) {
    switchAura(savedAura);
  } else {
    switchAura('cyan');
  }

  const savedLayout = localStorage.getItem('cf_layout');
  if (savedLayout) {
    switchLayout(savedLayout);
  } else {
    switchLayout('tabs');
  }
}

// Display Alerts Toast
function showToast(message) {
  const toast = document.getElementById('royal-toast-box');
  const toastMsg = document.getElementById('royal-toast-message');
  toastMsg.textContent = message;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Preset badge loader
function setPreset(inputId, value) {
  document.getElementById(inputId).value = value;
  showToast(`Parameters uploaded: "${value}"`);
}

// --- Data Fetching & SQLite Sync Layer ---

async function initData() {
  await fetchProfile();
  await fetchWeeklyGoals();
  if (activeLayout === 'unified') {
    loadWeeklySplit();
    loadProgressWheel();
    loadAstraForDate();
  } else {
    switchTab('gateway');
  }
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
      
      // Update displays
      document.getElementById('stats-current').textContent = userProfile.current_condition || 'Stardust';
      document.getElementById('stats-target').textContent = userProfile.target_aim || 'Supernova Core';
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
    
    showToast("Stellar registers inscribed successfully!");
    
    if (activeLayout === 'tabs') {
      setTimeout(() => handleNavigation('progress'), 600);
    } else {
      await loadProgressWheel();
    }
  } catch (err) {
    console.error('Error saving profile:', err);
    showToast("Error updating registry.");
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

// Load Weekly Split Grid
function loadWeeklySplit() {
  const container = document.getElementById('weekly-days-list');
  container.innerHTML = '';

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  days.forEach(day => {
    const dayGoal = weeklyGoals.find(g => g.day_of_week === day) || { focus_area: 'System Recovery' };
    
    const card = document.createElement('div');
    card.className = 'day-parchment-card';
    card.innerHTML = `
      <div class="day-parchment-name">🛡️ ${day}</div>
      <input type="text" 
             class="day-parchment-input" 
             value="${dayGoal.focus_area}" 
             data-day="${day}" 
             placeholder="Workout sector focus">
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
    const focus_area = input.value || 'System Recovery';
    
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
    showToast("Orbital splits sealed in mainframe!");
    
    if (activeLayout === 'tabs') {
      setTimeout(() => handleNavigation('astra'), 600);
    } else {
      loadAstraForDate();
    }
  }
}

// Load Circular progress orbit wheel
async function loadProgressWheel() {
  try {
    const res = await fetch('/api/progress-stats');
    const stats = await res.json();

    const pct = stats.progress_percentage || 0;
    document.getElementById('wheel-percentage').textContent = `${pct}%`;
    document.getElementById('stats-cumulative').textContent = `${stats.cumulative_work.toFixed(0)}%`;
    
    // Animate circular SVG indicator ring
    const circle = document.getElementById('progress-circle-radial');
    const circumference = 753.6; // 2 * PI * 120
    const offset = circumference - (pct / 100) * circumference;
    circle.style.strokeDashoffset = offset;

    // Calculate Cosmic Rank
    let rank = "Gravity Cadet";
    if (pct > 0 && pct < 15) rank = "Stardust Apprentice";
    else if (pct >= 15 && pct < 40) rank = "Astroid Pioneer";
    else if (pct >= 40 && pct < 70) rank = "Nebula Commander";
    else if (pct >= 70 && pct < 95) rank = "Solar Giant Master";
    else if (pct >= 95) rank = "Supernova Champion";

    document.getElementById('warrior-rank').textContent = rank;
    
    // Dynamic telemetry advice
    let advice = "Ignite training blocks to generate critical orbital trajectory.";
    if (pct > 0) {
      const workNeeded = (stats.total_days * 100) - stats.cumulative_work;
      advice = `Telemetry: Sum of daily sectors / ${stats.total_days} challenge days. You have logged ${stats.cumulative_work.toFixed(0)}% cumulative energy. You need ${workNeeded.toFixed(0)}% more cumulative load to reach 100% complete orbit!`;
    }
    document.getElementById('progress-advice-tip').textContent = advice;

  } catch (err) {
    console.error('Error fetching progress stats:', err);
  }
}

// Load Date Focus & Exercises checklist
async function loadAstraForDate() {
  const dateInput = document.getElementById('astra-log-date');
  const dateStr = dateInput.value;
  if (!dateStr) return;

  const selectedDate = new Date(dateStr + 'T00:00:00');
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = weekdays[selectedDate.getDay()];
  
  const weeklyFocus = weeklyGoals.find(g => g.day_of_week === dayName) || { focus_area: 'System Recovery' };
  document.getElementById('today-focus-value').textContent = `${dayName}: ${weeklyFocus.focus_area}`;

  try {
    // 1. Fetch daily log percentage
    const logRes = await fetch(`/api/daily-log/${dateStr}`);
    dailyLog = await logRes.json();
    
    document.getElementById('daily-progress-slider').value = dailyLog.work_percentage || 0;
    document.getElementById('daily-slider-display').textContent = `${(dailyLog.work_percentage || 0).toFixed(0)}%`;

    // 2. Fetch specific exercises
    const exRes = await fetch(`/api/exercises/${dateStr}`);
    dailyExercises = await exRes.json();

    renderExercises();

  } catch (err) {
    console.error('Error loading daily details:', err);
  }
}

// Render Exercise Checklist Blocks
function renderExercises() {
  const container = document.getElementById('exercises-list');
  container.innerHTML = '';

  if (dailyExercises.length === 0) {
    container.innerHTML = `
      <div class="empty-arena-msg">
        🛰️ No active exercises synthesized for this solar date.
      </div>
    `;
    return;
  }

  dailyExercises.forEach(ex => {
    const card = document.createElement('div');
    card.className = `exercise-block-card ${ex.completed ? 'completed' : ''}`;
    card.innerHTML = `
      <div class="exercise-info-section">
        <div class="exercise-shield-checkbox ${ex.completed ? 'checked' : ''}" 
             onclick="toggleExerciseStatus(${ex.id}, ${ex.completed})">
          ✓
        </div>
        <div class="exercise-details-lbls">
          <span class="exercise-name-display">${ex.name}</span>
          <span class="exercise-specs-display">
            Load: <span>${ex.weight} kg</span> | <span>${ex.sets} sets x ${ex.reps} reps</span>
          </span>
        </div>
      </div>
      <button class="btn-astra-delete" onclick="deleteExercise(${ex.id})" title="Delete Exercise">
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

    showToast("Sector energy modified.");
    await refreshDateAndRecalculate();
  } catch (err) {
    console.error('Error toggling status:', err);
  }
}

// Delete exercise
async function deleteExercise(id) {
  if (!confirm("Dismiss this exercise block?")) return;

  try {
    await fetch(`/api/exercises/${id}`, {
      method: 'DELETE'
    });

    showToast("Block dismissed.");
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
        weight_unit: 'kg',
        sets,
        reps
      })
    });

    showToast(`Synthesized: ${name}!`);
    document.getElementById('ex-name').value = '';
    document.getElementById('ex-weight').value = '';
    
    await refreshDateAndRecalculate();
  } catch (err) {
    console.error('Error adding exercise:', err);
  }
}

// Sync completed stats
async function refreshDateAndRecalculate() {
  const dateStr = document.getElementById('astra-log-date').value;
  
  const exRes = await fetch(`/api/exercises/${dateStr}`);
  dailyExercises = await exRes.json();
  
  renderExercises();

  // Auto-calculate completion
  if (dailyExercises.length > 0) {
    const completedCount = dailyExercises.filter(ex => ex.completed).length;
    const computedPercentage = Math.round((completedCount / dailyExercises.length) * 100);
    await syncDailyPercentage(dateStr, computedPercentage);
  } else {
    await syncDailyPercentage(dateStr, 0);
  }

  // Live reload global progress wheel automatically!
  await loadProgressWheel();
}

// Post daily percentage to backend SQLite
async function syncDailyPercentage(date, percentage) {
  try {
    await fetch('/api/daily-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, work_percentage: percentage })
    });

    document.getElementById('daily-progress-slider').value = percentage;
    document.getElementById('daily-slider-display').textContent = `${percentage}%`;
  } catch (err) {
    console.error('Error syncing daily progress:', err);
  }
}

// Post slider overrides directly
async function updateDailyProgressFromSlider(value) {
  const dateStr = document.getElementById('astra-log-date').value;
  document.getElementById('daily-slider-display').textContent = `${value}%`;
  await syncDailyPercentage(dateStr, value);
  await loadProgressWheel(); // Instantly update progress wheel!
}
