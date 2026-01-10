import express from "express";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// --------------------
// In-memory queue
// --------------------
let toolQueue = [];

// Clear pending on restart
toolQueue.length = 0;
console.log("Pending tool queue cleared on startup");

// --------------------
// POST /give-tool
// --------------------
app.post("/give-tool", (req, res) => {
  const { userId, toolName } = req.body;
  if (!userId || !toolName) {
    return res.status(400).json({ error: "Missing userId or toolName" });
  }

  toolQueue.push({ userId: Number(userId), toolName: String(toolName) });
  return res.json({
    success: true,
    message: "Tool queued",
    queueSize: toolQueue.length,
  });
});

// --------------------
// GET /fetch-tools
// --------------------
app.get("/fetch-tools", (req, res) => {
  res.json({ success: true, data: toolQueue });
});

// --------------------
// POST /clear-tools
// --------------------
app.post("/clear-tools", (req, res) => {
  const { userId, toolName } = req.body;
  toolQueue = toolQueue.filter(
    (t) => !(t.userId === Number(userId) && t.toolName === toolName)
  );
  res.json({ success: true });
});

// --------------------
// POST /clear-all (for Discord /clear pending)
// --------------------
app.post("/clear-all", (req, res) => {
  toolQueue = [];
  res.json({ success: true, message: "All pending tools cleared" });
});

app.listen(PORT, () => console.log(`API running on port ${PORT}`));
