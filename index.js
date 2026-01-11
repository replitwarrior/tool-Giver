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

// Clear pending on restart
toolQueue.length = 0;
notifyQueue.length = 0;
console.log("Pending tool & notification queues cleared on startup");

// --------------------
// Tools
// --------------------
app.post("/give-tool", (req, res) => {
  const { userId, toolName } = req.body;
  if (!userId || !toolName) return res.status(400).json({ error: "Missing userId or toolName" });
  toolQueue.push({ userId: Number(userId), toolName: String(toolName) });
  return res.json({ success: true, message: "Tool queued", queueSize: toolQueue.length });
});

app.get("/fetch-tools", (req, res) => res.json({ success: true, data: toolQueue }));

app.post("/clear-tools", (req, res) => {
  const { userId, toolName } = req.body;
  toolQueue = toolQueue.filter(t => !(t.userId === Number(userId) && t.toolName === toolName));
  res.json({ success: true });
});

// --------------------
// Notifications
// --------------------

// Queue notification (for specific user ID)
app.post("/notify", (req, res) => {
  const { playerId, text } = req.body;
  if (!playerId || !text) return res.status(400).json({ error: "Missing playerId or text" });
  notifyQueue.push({ playerId: Number(playerId), text: String(text) });
  res.json({ success: true, message: "Notification queued", queueSize: notifyQueue.length });
});

// Queue notification to all servers (playerId = 0)
app.post("/notify-all", (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Missing text" });
  notifyQueue.push({ playerId: 0, text: String(text) }); // playerId = 0 means broadcast
  res.json({ success: true, message: "Broadcast queued", queueSize: notifyQueue.length });
});

// Fetch notifications
app.get("/fetch-notifies", (req, res) => res.json({ success: true, data: notifyQueue }));

app.listen(PORT, () => console.log(`API running on port ${PORT}`));
