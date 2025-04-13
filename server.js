const express = require('express');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const app = express();
const PORT = 3000;

// Database setup
const DB_FILE = 'database.json';

function readDB() {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE));
  } catch {
    return [];
  }
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Pages Routes
app.get('/page1', (req, res) => {
  const userId = uuidv4();
  const db = readDB();
  
  // New user entry
  db.push({
    userId,
    page1Status: true, // Page1 complete
    page2Status: false,
    secretURL: "https://your-real-url.com" // Replace with your actual URL
  });
  
  writeDB(db);
  
  res.send(`
    <h1>Page 1</h1>
    <p>ID: ${userId}</p>
    <a href="/page2?user=${userId}">Go to Page 2</a>
  `);
});

app.get('/page2', (req, res) => {
  const userId = req.query.user;
  const db = readDB();
  const user = db.find(u => u.userId === userId);

  if(!user) return res.send('Invalid user!');

  res.send(`
    <h1>Page 2</h1>
    <p>User ID: ${userId}</p>
    <a href="/page3?user=${userId}">Click Here for Page 3</a>
  `);
});

app.get('/page3', (req, res) => {
  const userId = req.query.user;
  const db = readDB();
  const user = db.find(u => u.userId === userId);

  if(!user) return res.send('User not found!');

  // Update page2 status
  user.page2Status = true;
  writeDB(db);

  res.send(`
    <h1>Page 3</h1>
    <a href="/final?user=${userId}">Check Status</a>
  `);
});

app.get('/final', (req, res) => {
  const userId = req.query.user;
  const db = readDB();
  const user = db.find(u => u.userId === userId);

  if(user.page1Status && user.page2Status) {
    res.send(`
      <h1>Success!</h1>
      <p>Your secret URL: ${user.secretURL}</p>
    `);
  } else {
    res.send('Please complete all pages!');
  }
});

app.listen(PORT, () => console.log('Server running on http://localhost:'+PORT));
