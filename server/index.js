import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import "dotenv/config";
import { initDb, db } from "./db.js";
import { basicAuth } from "./auth.js";
import { addUser, userExists, usernameIsValid, passwordIsValid } from "./htpasswd.js";

const app = express();
const PORT = Number(process.env.PORT || 4000);
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost";

initDb();

app.use(helmet());
app.use(cors({ origin: CLIENT_ORIGIN, credentials: false }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/health", (req, res) => res.json({ ok: true }));

app.post("/api/register", (req, res) => {
  const { username, password } = req.body || {};

  if (!usernameIsValid(username)) {
    return res.status(400).json({ error: "Username must be 3-32 chars: letters, numbers, . _ -" });
  }
  if (!passwordIsValid(password)) {
    return res.status(400).json({ error: "Password must be 8-72 characters" });
  }
  if (userExists(username)) {
    return res.status(409).json({ error: "Username already exists" });
  }

  addUser(username, password);
  return res.status(201).json({ ok: true });
});

app.get("/api/me", basicAuth, (req, res) => {
  res.json({ username: req.user.username });
});

app.get("/api/notes", basicAuth, (req, res) => {
  const owner = req.user.username;
  db.all(
    `SELECT id, title, content, updated_at FROM notes WHERE owner = ? ORDER BY updated_at DESC`,
    [owner],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "DB error" });
      res.json({ notes: rows });
    }
  );
});

app.post("/api/notes", basicAuth, (req, res) => {
  const owner = req.user.username;
  const { title, content } = req.body || {};

  const safeTitle = (title || "").trim() || "Untitled";
  const safeContent = (content || "").toString();

  const updatedAt = new Date().toISOString();
  db.run(
    `INSERT INTO notes (owner, title, content, updated_at) VALUES (?, ?, ?, ?)`,
    [owner, safeTitle, safeContent, updatedAt],
    function (err) {
      if (err) return res.status(500).json({ error: "DB error" });
      res.status(201).json({
        note: { id: this.lastID, title: safeTitle, content: safeContent, updated_at: updatedAt }
      });
    }
  );
});

app.put("/api/notes/:id", basicAuth, (req, res) => {
  const owner = req.user.username;
  const id = Number(req.params.id);
  const { title, content } = req.body || {};
  const updatedAt = new Date().toISOString();

  db.run(
    `UPDATE notes SET title = ?, content = ?, updated_at = ?
     WHERE id = ? AND owner = ?`,
    [(title || "Untitled").trim(), (content || "").toString(), updatedAt, id, owner],
    function (err) {
      if (err) return res.status(500).json({ error: "DB error" });
      if (this.changes === 0) return res.status(404).json({ error: "Not found" });
      res.json({ ok: true, updated_at: updatedAt });
    }
  );
});

app.delete("/api/notes/:id", basicAuth, (req, res) => {
  const owner = req.user.username;
  const id = Number(req.params.id);

  db.run(`DELETE FROM notes WHERE id = ? AND owner = ?`, [id, owner], function (err) {
    if (err) return res.status(500).json({ error: "DB error" });
    if (this.changes === 0) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://127.0.0.1:${PORT} (behind Nginx)`);
  console.log(`CORS allowed origin: ${CLIENT_ORIGIN}`);
});
