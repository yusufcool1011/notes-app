import express from "express";
import fs from "fs";
import path from "path";
import auth from "basic-auth";
import Database from "better-sqlite3";
import { execFile } from "child_process";

const app = express();
const PORT = 4000;

// ---------- Paths ----------
const DATA_DIR = path.resolve("server/data");
const DB_PATH = path.join(DATA_DIR, "notes.db");
const HTPASSWD_FILE = path.join(DATA_DIR, ".htpasswd");
const HTPASSWD_BIN = "/usr/bin/htpasswd";

// ---------- Ensure data dir ----------
fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(HTPASSWD_FILE)) {
  fs.writeFileSync(HTPASSWD_FILE, "");
}

// ---------- Middleware ----------
app.use(express.json());

// ---------- Database ----------
const db = new Database(DB_PATH);
db.exec(`
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// ---------- Auth ----------
function verifyUser(req, res, next) {
  const credentials = auth(req);
  if (!credentials) {
    res.set("WWW-Authenticate", "Basic");
    return res.status(401).end();
  }

  const lines = fs.readFileSync(HTPASSWD_FILE, "utf8").split("\n");
  const userLine = lines.find(l => l.startsWith(credentials.name + ":"));
  if (!userLine) return res.status(401).end();

  execFile(
    HTPASSWD_BIN,
    ["-vb", HTPASSWD_FILE, credentials.name, credentials.pass],
    (err) => {
      if (err) return res.status(401).end();
      req.user = credentials.name;
      next();
    }
  );
}

// ---------- Routes ----------

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// 🔐 REGISTER (FIXED)
app.post("/api/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Missing fields" });
  }

  execFile(
    HTPASSWD_BIN,
    ["-b", HTPASSWD_FILE, username, password],
    (err) => {
      if (err) {
        console.error("htpasswd error:", err);
        return res.status(500).json({ error: "Registration failed" });
      }
      res.json({ ok: true });
    }
  );
});

// 🔐 LOGIN CHECK
app.get("/api/login", verifyUser, (req, res) => {
  res.json({ ok: true, user: req.user });
});

// 📝 GET NOTES
app.get("/api/notes", verifyUser, (req, res) => {
  const stmt = db.prepare("SELECT * FROM notes WHERE user = ?");
  res.json(stmt.all(req.user));
});

// 📝 CREATE NOTE
app.post("/api/notes", verifyUser, (req, res) => {
  const { title, content } = req.body;
  const stmt = db.prepare(
    "INSERT INTO notes (user, title, content) VALUES (?, ?, ?)"
  );
  stmt.run(req.user, title, content);
  res.json({ ok: true });
});

// ---------- Start ----------
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
