import express from "express";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// --------------------
// In-memory queues
// --------------------
let toolQueue = [];
let notifyQueue = [];

// Clear queues on startup
toolQueue.length = 0;
notifyQueue.length = 0;
console.log("Queues cleared on startup");

// --------------------
// POST /give-tool
// --------------------
app.post("/give-tool", (req, res) => {
  const { userId, toolName } = req.body;
  if (!userId || !toolName) return res.status(400).json({ error: "Missing userId or toolName" });

  toolQueue.push({ userId: Number(userId), toolName: String(toolName) });
  return res.json({ success: true, message: "Tool queued", queueSize: toolQueue.length });
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
  toolQueue = toolQueue.filter(t => !(t.userId === Number(userId) && t.toolName === toolName));
  res.json({ success: true });
});

// --------------------
// Notifications
// --------------------

// POST /notify - single player
app.post("/notify", (req, res) => {
  const { playerId, text } = req.body;
  if (!playerId || !text) return res.status(400).json({ error: "Missing playerId or text" });

  notifyQueue.push({ playerId: Number(playerId), text: String(text) });
  return res.json({ success: true, message: "Notification queued", queueSize: notifyQueue.length });
});

// POST /notify-all - broadcast
app.post("/notify-all", (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Missing text" });

  notifyQueue.push({ playerId: 0, text: String(text) }); // 0 = broadcast
  return res.json({ success: true, message: "Notification queued", queueSize: notifyQueue.length });
});

// GET /fetch-notifies
app.get("/fetch-notifies", (req, res) => {
  res.json({ success: true, data: notifyQueue });
});

// POST /clear-notify
app.post("/clear-notify", (req, res) => {
  const { playerId, text } = req.body;
  notifyQueue = notifyQueue.filter(n => !(n.playerId === Number(playerId) && n.text === text));
  res.json({ success: true, message: "Notification cleared" });
});

// POST /clear-all (optional)
app.post("/clear-all", (req, res) => {
  toolQueue = [];
  notifyQueue = [];
  res.json({ success: true, message: "All queues cleared" });
});

// --------------------
app.listen(PORT, () => console.log(`API running on port ${PORT}`));
