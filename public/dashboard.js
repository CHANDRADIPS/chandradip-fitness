// --- Sanjay's Real-time Dashboard Controller ---

document.addEventListener('DOMContentLoaded', () => {
  // Perform initial fetch
  fetchDashboardSummary();
  
  // Set up live polling (every 3 seconds) to display live syncing from the shared SQL database
  setInterval(fetchDashboardSummary, 3000);
});

async function fetchDashboardSummary() {
  try {
    const res = await fetch('/api/royal-dashboard/summary');
    if (!res.ok) throw new Error('API server returned error state');
    
    const summary = await res.json();
    updateDashboardUI(summary);
  } catch (err) {
    console.error('Error fetching royal companion summary:', err);
  }
}

function updateDashboardUI(data) {
  const { profile, weeklyGoals, progress, recentLogs } = data;
  
  if (!profile || !progress) return;

  // 1. Inscribe Stature & Profile details
  document.getElementById('db-current-condition').textContent = profile.current_condition || 'Untrained Archer';
  document.getElementById('db-target-aim').textContent = profile.target_aim || 'Mighty Maharathi';
  document.getElementById('db-tapasya-duration').textContent = `${profile.challenge_days} Days`;
  document.getElementById('db-cumulative-work').textContent = `${progress.cumulative_work.toFixed(0)}%`;
  
  // 2. Dynamic Progress Circular Wheel
  const pct = progress.progress_percentage || 0;
  document.getElementById('db-percentage').textContent = `${pct}%`;
  
  const circle = document.getElementById('db-progress-circle');
  if (circle) {
    const circumference = 753.6; // 2 * PI * 120
    const offset = circumference - (pct / 100) * circumference;
    circle.style.strokeDashoffset = offset;
  }

  // 3. Warrior Rank
  let rank = "Novice Cadet";
  if (pct > 0 && pct < 15) rank = "Astra Seeker (Weapon Apprentice)";
  else if (pct >= 15 && pct < 40) rank = "Gada Bearer (Royal Infantry)";
  else if (pct >= 40 && pct < 70) rank = "Atirathi (Elite Archer)";
  else if (pct >= 70 && pct < 95) rank = "Maharathi (Chariot Master)";
  else if (pct >= 95) rank = "Atimaharathi (Divine Champion)";
  
  document.getElementById('db-warrior-rank').textContent = rank;

  // 4. Inscribe Weekly training schedules in a grid
  const weeklyContainer = document.getElementById('db-weekly-list');
  weeklyContainer.innerHTML = '';
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  days.forEach(day => {
    const goal = weeklyGoals.find(g => g.day_of_week === day) || { focus_area: 'Rest' };
    
    const dayBox = document.createElement('div');
    dayBox.style.background = 'var(--bg-primary)';
    dayBox.style.border = '1px solid rgba(212,175,55,0.15)';
    dayBox.style.padding = '0.5rem';
    dayBox.style.borderRadius = '4px';
    dayBox.style.textAlign = 'center';
    dayBox.innerHTML = `
      <div style="font-family:'Cinzel',serif; font-weight:700; color:var(--saffron); font-size:0.75rem;">${day.substring(0,3)}</div>
      <div style="color:var(--parchment); margin-top:0.2rem; font-size:0.75rem; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;" title="${goal.focus_area}">
        ${goal.focus_area}
      </div>
    `;
    weeklyContainer.appendChild(dayBox);
  });

  // 5. Inscribe Recent Workout Logs timeline
  const historyContainer = document.getElementById('db-history-list');
  
  if (!recentLogs || recentLogs.length === 0) {
    historyContainer.innerHTML = `
      <div class="empty-arena-msg" style="padding: 1.5rem;">
        No battle footprints logged yet in the shared stone scrolls. Complete daily tasks!
      </div>
    `;
    return;
  }

  historyContainer.innerHTML = '';
  recentLogs.forEach(log => {
    // Format date string beautifully
    const dateObj = new Date(log.date + 'T00:00:00');
    const formattedDate = dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    const row = document.createElement('div');
    row.className = 'history-log-row';
    row.innerHTML = `
      <span class="history-log-date">📜 Day of ${formattedDate}</span>
      <span class="history-log-pct">Effort: ${log.work_percentage.toFixed(0)}%</span>
    `;
    historyContainer.appendChild(row);
  });
}
