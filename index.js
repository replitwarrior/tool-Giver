import express from "express";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

/*
In-memory queue
Format:
{
  userId: number,
  toolName: string
}
*/
let toolQueue = [];

/**
 * POST /give-tool
 * Body:
 * {
 *   "userId": 123456789,
 *   "toolName": "AK47"
 * }
 */
app.post("/give-tool", (req, res) => {
    const { userId, toolName } = req.body;

    if (!userId || !toolName) {
        return res.status(400).json({ error: "Missing userId or toolName" });
    }

    toolQueue.push({
        userId: Number(userId),
        toolName: String(toolName)
    });

    res.json({
        success: true,
        message: "Tool queued",
        queueSize: toolQueue.length
    });
});

/**
 * GET /fetch-tools
 * Roblox will call this
 */
app.get("/fetch-tools", (req, res) => {
    res.json({
        success: true,
        data: toolQueue
    });
});

/**
 * POST /clear-tools
 * Roblox confirms delivery
 * Body:
 * {
 *   "userId": 123,
 *   "toolName": "AK47"
 * }
 */
app.post("/clear-tools", (req, res) => {
    const { userId, toolName } = req.body;

    toolQueue = toolQueue.filter(
        t => !(t.userId === Number(userId) && t.toolName === toolName)
    );

    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`API running on port ${PORT}`);
});
