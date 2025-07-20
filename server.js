const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const db = new sqlite3.Database('./database.sqlite');
// Optional explicit route if index.html not auto-served
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

// Create users table if not exists
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  hotel TEXT,
  password TEXT
)`);

// Signup route
app.post('/signup', (req, res) => {
  const { username, hotel, password } = req.body;
  db.run(`INSERT INTO users (username, hotel, password) VALUES (?, ?, ?)`,
    [username, hotel, password],
    function (err) {
      if (err) {
        return res.send('Username already exists.');
      }
      res.send('Signup successful! <a href="login.html">Login here</a>.');
    }
  );
});

// Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get(`SELECT * FROM users WHERE username = ? AND password = ?`, [username, password], (err, user) => {
    if (err) return res.send('Error occurred.');
    if (!user) {
      return res.send('Invalid credentials. <a href="login.html">Try again</a>.');
    }
    res.send(`Welcome, ${user.username} from ${user.hotel}!`);
  });
});
app.get('/login', (req, res) => {
  res.redirect('/login.html'); // or '/signup.html'
});
app.get('/signup', (req, res) => {
  res.redirect('/signup.html'); // or '/signup.html'
});

// Start server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
