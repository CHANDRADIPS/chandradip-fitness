const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'fitness.db');

// Connect to SQLite Database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database: ' + dbPath);
    initializeDatabase();
  }
});

// Initialize Tables
function initializeDatabase() {
  db.serialize(() => {
    // 1. Profile Table (Store current condition, target aim, challenge duration)
    db.run(`
      CREATE TABLE IF NOT EXISTS profile (
        id INTEGER PRIMARY KEY CHECK (id = 1), -- Single user profile row
        name TEXT DEFAULT 'Warrior',
        current_condition TEXT,
        target_aim TEXT,
        challenge_days INTEGER DEFAULT 50,
        start_date TEXT
      )
    `, (err) => {
      if (err) console.error('Error creating profile table:', err.message);
      else {
        // Insert a default profile row if it doesn't exist
        db.run(`
          INSERT OR IGNORE INTO profile (id, name, current_condition, target_aim, challenge_days, start_date)
          VALUES (1, 'Warrior', 'Untrained Archer', 'Mighty Maharathi', 50, date('now'))
        `);
      }
    });

    // 2. Weekly Goals Table (Schedules for Monday, Tuesday, etc.)
    db.run(`
      CREATE TABLE IF NOT EXISTS weekly_goals (
        day_of_week TEXT PRIMARY KEY,
        focus_area TEXT
      )
    `, (err) => {
      if (err) console.error('Error creating weekly_goals table:', err.message);
      else {
        // Insert empty records for each day if they don't exist
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const stmt = db.prepare('INSERT OR IGNORE INTO weekly_goals (day_of_week, focus_area) VALUES (?, ?)');
        days.forEach(day => {
          let defaultFocus = 'Rest Day';
          if (day === 'Monday') defaultFocus = 'Back & Biceps';
          if (day === 'Tuesday') defaultFocus = 'Chest & Triceps';
          if (day === 'Wednesday') defaultFocus = 'Legs & Core';
          if (day === 'Thursday') defaultFocus = 'Shoulders & Arms';
          if (day === 'Friday') defaultFocus = 'Full Body Conditioning';
          if (day === 'Saturday') defaultFocus = 'Active Recovery';
          
          stmt.run(day, defaultFocus);
        });
        stmt.finalize();
      }
    });

    // 3. Daily Workout Logs Table (Stores overall daily work completion percentage)
    db.run(`
      CREATE TABLE IF NOT EXISTS daily_logs (
        date TEXT PRIMARY KEY, -- YYYY-MM-DD
        work_percentage REAL DEFAULT 0
      )
    `, (err) => {
      if (err) console.error('Error creating daily_logs table:', err.message);
    });

    // 4. Exercises Table (Detailing exercise blocks with weights, sets, reps)
    db.run(`
      CREATE TABLE IF NOT EXISTS exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT, -- YYYY-MM-DD
        name TEXT NOT NULL,
        weight REAL DEFAULT 0,
        weight_unit TEXT DEFAULT 'kg',
        sets INTEGER DEFAULT 3,
        reps INTEGER DEFAULT 10,
        completed INTEGER DEFAULT 0 -- 0 for false, 1 for true
      )
    `, (err) => {
      if (err) console.error('Error creating exercises table:', err.message);
    });
  });
}

// Helper methods to wrap database operations in Promises for async/await in server.js
const dbOperations = {
  // Profile operations
  getProfile: () => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM profile WHERE id = 1', [], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  updateProfile: (current_condition, target_aim, challenge_days, start_date) => {
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO profile (id, current_condition, target_aim, challenge_days, start_date)
         VALUES (1, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           current_condition = excluded.current_condition,
           target_aim = excluded.target_aim,
           challenge_days = excluded.challenge_days,
           start_date = excluded.start_date`,
        [current_condition, target_aim, challenge_days, start_date],
        function(err) {
          if (err) reject(err);
          else resolve({ changes: this.changes });
        }
      );
    });
  },

  // Weekly Goals operations
  getWeeklyGoals: () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM weekly_goals', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  updateWeeklyGoal: (day_of_week, focus_area) => {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO weekly_goals (day_of_week, focus_area) VALUES (?, ?) ON CONFLICT(day_of_week) DO UPDATE SET focus_area = excluded.focus_area',
        [day_of_week, focus_area],
        function(err) {
          if (err) reject(err);
          else resolve({ changes: this.changes });
        }
      );
    });
  },

  // Daily Logs & Exercises operations
  getDailyLog: (date) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM daily_logs WHERE date = ?', [date], (err, row) => {
        if (err) reject(err);
        else resolve(row || { date, work_percentage: 0 });
      });
    });
  },

  updateDailyLog: (date, work_percentage) => {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO daily_logs (date, work_percentage) VALUES (?, ?) ON CONFLICT(date) DO UPDATE SET work_percentage = excluded.work_percentage',
        [date, work_percentage],
        function(err) {
          if (err) reject(err);
          else resolve({ changes: this.changes });
        }
      );
    });
  },

  getExercises: (date) => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM exercises WHERE date = ?', [date], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  },

  addExercise: (date, name, weight, weight_unit, sets, reps) => {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO exercises (date, name, weight, weight_unit, sets, reps, completed) VALUES (?, ?, ?, ?, ?, ?, 0)',
        [date, name, weight, weight_unit, sets, reps],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });
  },

  updateExerciseStatus: (id, completed) => {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE exercises SET completed = ? WHERE id = ?',
        [completed ? 1 : 0, id],
        function(err) {
          if (err) reject(err);
          else resolve({ changes: this.changes });
        }
      );
    });
  },

  deleteExercise: (id) => {
    return new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM exercises WHERE id = ?',
        [id],
        function(err) {
          if (err) reject(err);
          else resolve({ changes: this.changes });
        }
      );
    });
  },

  // Dynamic progress stats
  getProgressStats: async () => {
    const profile = await dbOperations.getProfile();
    const challengeDays = profile ? profile.challenge_days : 50;

    return new Promise((resolve, reject) => {
      db.all('SELECT work_percentage FROM daily_logs', [], (err, rows) => {
        if (err) {
          reject(err);
          return;
        }

        // Sum up the completion percentages from all daily logs
        // As per formula, cumulative work done / total target percentage
        // Daily logs store work_percentage from 0 to 100.
        // User's formula: x + y + ... / (challenge_days * 10) %
        // e.g. for 50 days, the total potential work percentage is 50 * 10 = 500% in their prompt.
        // Wait, if daily logs are out of 10% or 100%? Let's check user's prompt:
        // "day 1 he has done x amt of work in day 2 y amount of woek ... then the tracker will show x+y+..../500 %"
        // This is exactly x + y + ... divided by 500 (which is challenge_days * 10, i.e. 50 days * 10 = 500, so a daily average out of 10 scale, or daily percentage out of 100 divided by challengeDays * 100).
        // Let's implement it exactly:
        // Total Progress = (Sum of daily work completion percentages) / (challenge_days) %
        // If daily work is represented out of 100%, and we have 50 days:
        // Max sum = 5000%. To show a percentage from 0 to 100%: Sum / 50.
        // Wait, if day 1 is 100% work and we divide by 500, we get 0.2%. If day 1 is 10 (scale of 10), and day 2 is 10, total over 50 days is (10+10)/500 = 4%.
        // Let's calculate:
        // We will store daily log `work_percentage` as a value from 0 to 100.
        // Then we calculate: Sum(work_percentage) / challengeDays
        // For 50 days, if daily logs sum to 5000 (100% every day), progress is 5000 / 50 = 100%.
        // If they did x = 40% on day 1 and y = 60% on day 2, the sum is 100%. Divided by 50 (challenge days), it is 2% total progress!
        // This perfectly matches the formula: `(x + y + ... ) / (challenge_days) %`.
        // To strictly match "x + y + ... / 500 %" when challenge_days = 50, it implies if they did e.g. 80 units of work + 90 units of work, divided by 500, they get progress.
        // Let's make it robust! We will support a simple sum-over-challenge-scale calculation. Let's return both the sum, the challenge duration, and the final percentage!
        const sum = rows.reduce((acc, row) => acc + (row.work_percentage || 0), 0);
        const progressPercentage = Math.min(100, Math.max(0, sum / challengeDays));

        resolve({
          total_days: challengeDays,
          logged_days: rows.length,
          cumulative_work: sum,
          progress_percentage: parseFloat(progressPercentage.toFixed(2))
        });
      });
    });
  }
};

module.exports = dbOperations;
