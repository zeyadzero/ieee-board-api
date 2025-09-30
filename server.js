// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const boardController = require('./boardController');
require('./db'); // لتهيئة الاتصال

const app = express();
const PORT = process.env.PORT || 8080;

// Middlewares
app.use(helmet());
app.use(express.json());

// CORS settings
const allowedOrigins = [
  'https://ieee-al-azhar-university.web.app',
  'https://ieee-al-azhar-university.firebaseapp.com',
  'http://localhost:5173',
];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) cb(null, true);
    else cb(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Routes
app.get('/api/board', async (req, res) => {
  try {
    const data = await boardController.getBoardData();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/last-chairman', async (req, res) => {
  try {
    const data = await boardController.getLastChairman();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Health check (مفيد مع Railway عشان ما يعملش 502)
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'API is running ✅' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Endpoint not found." });
});

// Start server
// ✅ Listen on Railway PORT
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
});
