const express = require('express');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = 8000;

// Middleware for parsing JSON and serving static files
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- API Endpoints ---

// 1. Profile Endpoints
app.get('/api/profile', async (req, res) => {
  try {
    const profile = await db.getProfile();
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/profile', async (req, res) => {
  try {
    const { current_condition, target_aim, challenge_days, start_date } = req.body;
    if (!current_condition || !target_aim || !challenge_days) {
      return res.status(400).json({ error: 'Missing required profile fields' });
    }
    const formattedStartDate = start_date || new Date().toISOString().split('T')[0];
    await db.updateProfile(current_condition, target_aim, parseInt(challenge_days), formattedStartDate);
    const updated = await db.getProfile();
    res.json({ message: 'Profile updated successfully', profile: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Weekly Goals Endpoints
app.get('/api/weekly-goals', async (req, res) => {
  try {
    const goals = await db.getWeeklyGoals();
    res.json(goals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/weekly-goals', async (req, res) => {
  try {
    const { day_of_week, focus_area } = req.body;
    if (!day_of_week || !focus_area) {
      return res.status(400).json({ error: 'Missing day_of_week or focus_area' });
    }
    await db.updateWeeklyGoal(day_of_week, focus_area);
    res.json({ message: `Weekly goal for ${day_of_week} updated successfully` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Daily Logs & Exercises Endpoints
app.get('/api/daily-log/:date', async (req, res) => {
  try {
    const date = req.params.date;
    const log = await db.getDailyLog(date);
    res.json(log);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/daily-log', async (req, res) => {
  try {
    const { date, work_percentage } = req.body;
    if (!date || work_percentage === undefined) {
      return res.status(400).json({ error: 'Missing date or work_percentage' });
    }
    await db.updateDailyLog(date, parseFloat(work_percentage));
    res.json({ message: `Daily log for ${date} updated successfully` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Exercises on a specific date
app.get('/api/exercises/:date', async (req, res) => {
  try {
    const date = req.params.date;
    const exercises = await db.getExercises(date);
    res.json(exercises);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/exercises', async (req, res) => {
  try {
    const { date, name, weight, weight_unit, sets, reps } = req.body;
    if (!date || !name) {
      return res.status(400).json({ error: 'Missing date or exercise name' });
    }
    const result = await db.addExercise(
      date,
      name,
      parseFloat(weight) || 0,
      weight_unit || 'kg',
      parseInt(sets) || 3,
      parseInt(reps) || 10
    );
    res.json({ message: 'Exercise added successfully', id: result.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/exercises/:id/status', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { completed } = req.body;
    if (completed === undefined) {
      return res.status(400).json({ error: 'Missing completed status' });
    }
    await db.updateExerciseStatus(id, completed);
    res.json({ message: `Exercise status updated` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/exercises/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.deleteExercise(id);
    res.json({ message: `Exercise deleted` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Progress Stats Endpoints
app.get('/api/progress-stats', async (req, res) => {
  try {
    const stats = await db.getProgressStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Consolidated Companion App Dashboard Summary Endpoint
// This fulfills "accessible in another app connected with the above app"
app.get('/api/royal-dashboard/summary', async (req, res) => {
  try {
    const profile = await db.getProfile();
    const weeklyGoals = await db.getWeeklyGoals();
    const progress = await db.getProgressStats();
    
    // Fetch some recent daily log histories
    const recentLogs = await new Promise((resolve, reject) => {
      const sqlite3 = require('sqlite3');
      const path = require('path');
      const conn = new sqlite3.Database(path.join(__dirname, 'fitness.db'));
      conn.all(
        'SELECT date, work_percentage FROM daily_logs ORDER BY date DESC LIMIT 10',
        [],
        (err, rows) => {
          conn.close();
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });

    res.json({
      profile,
      weeklyGoals,
      progress,
      recentLogs
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🔱 CHANDRADIP FITNESS SERVER IS LIVE! 🔱`);
  console.log(`Charioteer's Path: http://localhost:${PORT}`);
  console.log(`Connected Royal Dashboard: http://localhost:${PORT}/royal-dashboard.html`);
  console.log(`===============================================`);
});
