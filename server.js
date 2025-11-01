const express = require('express');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.send('<h1>Hello World! 🌍</h1><p>Welcome to Deal Finder Site</p>');
});

app.listen(PORT, () => {
  console.log(`Server is running! Visit http://localhost:${PORT}`);
});
