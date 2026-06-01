/**
 * routes/auth.js
 * POST /auth/register  – rejestracja (zwraca token + refreshToken)
 * POST /auth/login     – logowanie   (zwraca token + refreshToken)
 * POST /auth/refresh   – odświeżenie access tokena za pomocą refresh tokena
 * POST /auth/logout    – unieważnienie refresh tokena
 * GET  /auth/me        – dane zalogowanego (wymaga tokena)
 */

const { Router } = require("express");
const jwt = require("jsonwebtoken");
const { createHash, randomUUID } = require("crypto");
const userStore = require("../userStore");
const { requireAuth } = require("../middleware/auth");
const {
  JWT_SECRET,
  JWT_EXPIRES_IN,
  REFRESH_SECRET,
  REFRESH_EXPIRES_IN,
} = require("../config");
const db = require("../db");

const router = Router();

const ok = (res, data, status = 200) => res.status(status).json({ ok: true, data });
const fail = (res, error, status = 400) => res.status(status).json({ ok: false, error });

// ── Helpers ───────────────────────────────────────────────────────────────────

function validateCredentials(body) {
  const errors = [];
  if (!body.username || typeof body.username !== "string" || body.username.trim().length < 3)
    errors.push("Nazwa użytkownika musi mieć min. 3 znaki.");
  if (!body.password || typeof body.password !== "string" || body.password.length < 6)
    errors.push("Hasło musi mieć min. 6 znaków.");
  return errors;
}

function signAccessToken(user) {
  return jwt.sign(
    { sub: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function signRefreshToken(user) {
  return jwt.sign(
    { sub: user.id, type: "refresh" },
    REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRES_IN }
  );
}

function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

// ── Prepared statements for refresh_tokens ───────────────────────────────────

const refreshStmts = {
  insert: db.prepare(`
    INSERT INTO refresh_tokens (id, user_id, token_hash, device, created_at, expires_at)
    VALUES (@id, @userId, @tokenHash, @device, @createdAt, @expiresAt)
  `),
  findByHash: db.prepare(
    "SELECT * FROM refresh_tokens WHERE token_hash = ?"
  ),
  deleteByHash: db.prepare(
    "DELETE FROM refresh_tokens WHERE token_hash = ?"
  ),
  deleteByUser: db.prepare(
    "DELETE FROM refresh_tokens WHERE user_id = ?"
  ),
};

/**
 * Generuje refresh token, zapisuje hash w bazie, zwraca plaintext token.
 */
function createRefreshToken(user) {
  const token = signRefreshToken(user);
  const tokenHash = hashToken(token);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 dni

  refreshStmts.insert.run({
    id: randomUUID(),
    userId: user.id,
    tokenHash,
    device: null,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  });

  return token;
}

// ── POST /auth/register ───────────────────────────────────────────────────────
router.post("/register", async (req, res) => {
  const errors = validateCredentials(req.body);
  if (errors.length) return fail(res, errors.join(" "));

  try {
    const user = await userStore.create(req.body.username, req.body.password);
    const token = signAccessToken(user);
    const refreshToken = createRefreshToken(user);
    ok(res, { token, refreshToken, user }, 201);
  } catch (err) {
    fail(res, err.message);
  }
});

// ── POST /auth/login ──────────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  const errors = validateCredentials(req.body);
  if (errors.length) return fail(res, errors.join(" "));

  const user = await userStore.verify(req.body.username, req.body.password);
  if (!user) return fail(res, "Nieprawidłowa nazwa użytkownika lub hasło.", 401);

  const token = signAccessToken(user);
  const refreshToken = createRefreshToken(user);
  ok(res, { token, refreshToken, user });
});

// ── POST /auth/refresh ────────────────────────────────────────────────────────
router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return fail(res, "Brak refresh tokena.", 400);

  try {
    // Weryfikuj podpis JWT
    const payload = jwt.verify(refreshToken, REFRESH_SECRET);

    // Sprawdź czy token jest w bazie (nie został unieważniony)
    const tokenHash = hashToken(refreshToken);
    const row = refreshStmts.findByHash.get(tokenHash);
    if (!row) return fail(res, "Refresh token został unieważniony.", 401);

    // Sprawdź czy nie wygasł w bazie
    if (new Date(row.expires_at) < new Date()) {
      refreshStmts.deleteByHash.run(tokenHash);
      return fail(res, "Refresh token wygasł.", 401);
    }

    // Pobierz użytkownika
    const user = userStore.findById(payload.sub);
    if (!user) {
      refreshStmts.deleteByHash.run(tokenHash);
      return fail(res, "Użytkownik nie istnieje.", 401);
    }

    // Rotacja: usuń stary refresh token, wygeneruj nowy
    refreshStmts.deleteByHash.run(tokenHash);
    const newAccessToken = signAccessToken(user);
    const newRefreshToken = createRefreshToken(user);

    ok(res, { token: newAccessToken, refreshToken: newRefreshToken, user });
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      // Usuń wygasły token z bazy
      const tokenHash = hashToken(refreshToken);
      refreshStmts.deleteByHash.run(tokenHash);
      return fail(res, "Refresh token wygasł. Zaloguj się ponownie.", 401);
    }
    return fail(res, "Nieprawidłowy refresh token.", 401);
  }
});

// ── POST /auth/logout ─────────────────────────────────────────────────────────
router.post("/logout", async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    const tokenHash = hashToken(refreshToken);
    refreshStmts.deleteByHash.run(tokenHash);
  }
  ok(res, { message: "Wylogowano pomyślnie." });
});

// ── GET /auth/me ──────────────────────────────────────────────────────────────
router.get("/me", requireAuth, (req, res) => {
  ok(res, req.user);
});

module.exports = router;