/**
 * middleware/auth.js
 * Weryfikuje JWT z nagłówka Authorization: Bearer <token>
 * Dołącza req.user = { id, username } przy sukcesie.
 */

const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");
const db = require("../db");

function requireAuth(req, res, next) {
  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ ok: false, error: "Brak tokena. Zaloguj się." });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.sub, username: payload.username };
    
    // Auto-recreate user if SQLite DB was wiped (Render ephemeral disk)
    const userRow = db.prepare("SELECT id FROM users WHERE id = ?").get(req.user.id);
    if (!userRow) {
      db.prepare(`
        INSERT INTO users (id, username, password_hash, created_at)
        VALUES (?, ?, ?, ?)
      `).run(req.user.id, req.user.username, "wiped-recreated", new Date().toISOString());
    }

    next();
  } catch (err) {
    const msg =
      err.name === "TokenExpiredError"
        ? "Token wygasł. Zaloguj się ponownie."
        : "Nieprawidłowy token.";
    return res.status(401).json({ ok: false, error: msg });
  }
}

module.exports = { requireAuth };