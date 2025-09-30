require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const boardController = require("./boardController");

const app = express();
const PORT = process.env.PORT || 8080;

// -------- Middlewares --------
app.use(helmet());
app.use(express.json());

const allowedOrigins = [
  "https://ieee-al-azhar-university.web.app",
  "https://ieee-al-azhar-university.firebaseapp.com",
  "http://localhost:5173"
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS policy."), false);
      }
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200,
  })
);

// -------- Routes --------

// ✅ جلب أعضاء المجالس
app.get("/api/board", async (req, res) => {
  console.log("📥 GET /api/board");
  try {
    const data = await boardController.getBoardData();
    res.json(data);
  } catch (err) {
    console.error("❌ Error in /api/board:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ جلب الرئيس السابق
app.get("/api/last-chairman", async (req, res) => {
  console.log("📥 GET /api/last-chairman");
  try {
    const data = await boardController.getLastChairman();
    res.json(data);
  } catch (err) {
    console.error("❌ Error in /api/last-chairman:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// -------- 404 Fallback --------
app.use((req, res) => {
  res.status(404).json({ message: "Endpoint not found." });
});

// -------- Start Server --------
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ API Server running on port ${PORT}`);
});
