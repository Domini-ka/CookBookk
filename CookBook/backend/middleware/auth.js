/**
 * middleware/auth.js
 * Weryfikuje JWT z nagłówka Authorization: Bearer <token>
 * Dołącza req.user = { id, username } przy sukcesie.
 */

const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");

function requireAuth(req, res, next) {
  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ ok: false, error: "Brak tokena. Zaloguj się." });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.sub, username: payload.username };
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