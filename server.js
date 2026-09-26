const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const users = new Map();

const TIMEOUT = 15000;

// Device tells server it is still online
app.post("/heartbeat", (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ error: "Missing device ID" });
  }

  users.set(id, Date.now());

  res.json({
    online: users.size
  });
});

// Get current online count
app.get("/online", (req, res) => {
  cleanup();

  res.json({
    online: users.size
  });
});

// Remove device when it leaves
app.post("/leave", (req, res) => {
  const { id } = req.body;

  if (id) {
    users.delete(id);
  }

  res.json({
    online: users.size
  });
});

function cleanup() {
  const now = Date.now();

  for (const [id, lastSeen] of users) {
    if (now - lastSeen > TIMEOUT) {
      users.delete(id);
    }
  }
}

// Clean inactive devices regularly
setInterval(cleanup, 5000);

app.get("/", (req, res) => {
  res.send("Online counter server is running!");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
