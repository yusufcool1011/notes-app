import { verifyUser } from "./htpasswd.js";

export function basicAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, encoded] = header.split(" ");

  if (scheme !== "Basic" || !encoded) {
    res.setHeader("WWW-Authenticate", 'Basic realm="Markdown Notes"');
    return res.status(401).json({ error: "Missing Basic auth" });
  }

  let decoded = "";
  try {
    decoded = Buffer.from(encoded, "base64").toString("utf8");
  } catch {
    return res.status(401).json({ error: "Invalid auth encoding" });
  }

  const idx = decoded.indexOf(":");
  if (idx < 0) return res.status(401).json({ error: "Invalid auth format" });

  const username = decoded.slice(0, idx);
  const password = decoded.slice(idx + 1);

  if (!verifyUser(username, password)) {
    res.setHeader("WWW-Authenticate", 'Basic realm="Markdown Notes"');
    return res.status(401).json({ error: "Invalid credentials" });
  }

  req.user = { username };
  next();
}
