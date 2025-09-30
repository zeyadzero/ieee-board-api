require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const db = require('./db'); // ملف الاتصال بالـ PostgreSQL

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// ✅ Test Route
app.get('/', (req, res) => {
  res.json({ status: "ok", message: "🚀 API is running on Railway" });
});

// ✅ Example API Route (يقرأ من PostgreSQL)
app.get('/api/board', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM board');
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching data:", err.message);
    res.status(500).json({ error: "Database query failed" });
  }
});

// ✅ Listen on Railway PORT
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
