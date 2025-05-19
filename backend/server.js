const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// In-memory text store
const textStore = {};
const EXPIRY_MS = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds

// Cleanup expired texts
function cleanup() {
  const now = Date.now();
  for (const code in textStore) {
    if (now - textStore[code].timestamp > EXPIRY_MS) {
      delete textStore[code];
    }
  }
}

// Store text with unique code
app.post("/store", (req, res) => {
  const { text } = req.body;
  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Text is required." });
  }

  const code = Math.random().toString(36).substring(2, 7).toUpperCase();
  textStore[code] = {
    text,
    timestamp: Date.now(),
  };

  cleanup();
  res.json({ code });
});

// Retrieve text by code
app.get("/retrieve/:code", (req, res) => {
  const { code } = req.params;
  cleanup();
  const entry = textStore[code.toUpperCase()];
  if (!entry) {
    return res.status(404).json({ error: "Code not found or expired." });
  }
  res.json({ text: entry.text });
});

// Listen on all interfaces (for local network access)
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(
    `🌐 Access it from another device using http://<your-local-ip>:${PORT}`
  );
});
