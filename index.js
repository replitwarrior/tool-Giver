import express from "express";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY is not set");
  process.exit(1);
}

let queue = [];

const addTool = (userId, tool) => {
  queue.push({ userId: Number(userId), tool: String(tool) });
};

app.post("/give-tool", (req, res) => {
  const auth = req.headers.authorization;
  if (auth !== API_KEY) return res.status(403).json({ error: "Forbidden" });

  const { userId, tool } = req.body;
  if (!userId || !tool) return res.status(400).json({ error: "Invalid payload" });

  addTool(userId, tool);
  res.json({ success: true });
});

app.get("/fetch-tools", (req, res) => {
  res.json(queue);
  queue = [];
});

app.listen(PORT, () => {
  console.log(`Tool API running on port ${PORT}`);
});
