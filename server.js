const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const app = express();

// Security headers untuk menghindari ad blocker
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Content-Security-Policy', "default-src 'self' https:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' https: data:; media-src 'self' data:; connect-src 'self' https:;");
  next();
});

app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static('./', {
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

// Handler untuk preflight request dari private network (Chrome >= 130)
app.options('/', (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  res.set('Access-Control-Allow-Private-Network', 'true');
  res.status(204).send('');
});
app.options('/api', (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  res.set('Access-Control-Allow-Private-Network', 'true');
  res.status(204).send('');
});

// Ganti URL di bawah dengan URL Google Apps Script Web App kamu
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzdivb2oMhr8JgXUc5ylKajDboZuvpRdGiVwmk7UHXO4mrwvNjx7QsxEYWG5l_ypw5s/exec';

app.get('/api', async (req, res) => {
  try {
    const url = APPS_SCRIPT_URL + '?' + new URLSearchParams(req.query).toString();
    const response = await fetch(url);
    const data = await response.text();
    res.type('json').send(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api', async (req, res) => {
  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const data = await response.text();
    res.type('json').send(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log('Proxy API jalan di http://localhost:3000'));