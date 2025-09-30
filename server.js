// server.js (بدون Auth - API مفتوح)
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const boardController = require('./boardController');
require('./db'); // تشغيل اتصال قاعدة البيانات

const app = express();
const PORT = process.env.PORT || 5000;

// ----------------------------------------------------
// 1. أمان و Middlewares
// ----------------------------------------------------
app.use(helmet());

const allowedOrigins = [
  'https://ieee-al-azhar-university.web.app',
  'https://ieee-al-azhar-university.firebaseapp.com',
  'http://localhost:5173'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS policy'), false);
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  optionsSuccessStatus: 200,
}));

app.use(express.json());

// ----------------------------------------------------
// 2. مسارات API (مفتوحة بدون Auth)
// ----------------------------------------------------
app.get('/api/board', async (req, res) => {
  try {
    const data = await boardController.getBoardData();
    res.json(data);
  } catch (err) {
    console.error("Error in /api/board:", err.message);
    res.status(500).json({ message: "Internal server error while fetching board data." });
  }
});

app.get('/api/last-chairman', async (req, res) => {
  try {
    const data = await boardController.getLastChairman();
    res.json(data);
  } catch (err) {
    console.error("Error in /api/last-chairman:", err.message);
    res.status(500).json({ message: "Internal server error while fetching last chairman data." });
  }
});

// ----------------------------------------------------
// 3. Fallback Routes
// ----------------------------------------------------

// API 404
app.use(/^\/api\/.*/, (req, res) => {
  res.status(404).json({ message: "API endpoint not found." });
});

// Frontend (اختياري - لو معاك React/Vue build)
app.use(express.static(path.join(__dirname, 'client-build')));
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'client-build', 'index.html'));
});

// ----------------------------------------------------
// 4. تشغيل السيرفر
// ----------------------------------------------------
app.listen(PORT, () => {
  console.log(`✅ API Server running on port ${PORT}`);
});
