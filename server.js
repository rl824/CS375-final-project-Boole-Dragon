const express = require('express');
const app = express();
const PORT = 3000;

// Simple route - this is what shows when you visit the website
app.get('/', (req, res) => {
  res.send('<h1>Hello World! 🌍</h1><p>Welcome to Deal Finder Site</p>');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running! Visit http://localhost:${PORT}`);
});
