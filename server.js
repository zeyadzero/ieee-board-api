const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// ✅ Test root route
app.get("/", (req, res) => {
  res.send("🚀 Railway test server is running");
});

// ✅ Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    time: new Date(),
    port: PORT
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Test server listening on port ${PORT}`);
});
