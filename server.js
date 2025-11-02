const express = require('express');
const cors = require('cors');
const deals = require('./data');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('<h1>Hello World! 🌍</h1><p>Welcome to Deal Finder Site</p>');
});

app.get('/api/deals', (req, res) => {
  res.json(deals);
});

app.get('/api/deals/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const deal = deals.find(d => d.id === id);

  if (deal) {
    res.json(deal);
  } else {
    res.status(404).json({ error: 'Deal not found' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running! Visit http://localhost:${PORT}`);
});
