/**
 * routes/auth.js
 * POST /auth/register  – rejestracja
 * POST /auth/login     – logowanie, zwraca JWT
 * GET  /auth/me        – dane zalogowanego (wymaga tokena)
 */

const { Router } = require("express");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const userStore = require("../userStore");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");
const { JWT_SECRET, JWT_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_DAYS, REFRESH_COOKIE_NAME } = require("../config");

const router = Router();

const ok = (res, data, status = 200) => res.status(status).json({ ok: true, data });
const fail = (res, error, status = 400) => res.status(status).json({ ok: false, error });

function validateCredentials(body) {
  const errors = [];
  if (!body.username || typeof body.username !== "string" || body.username.trim().length < 3)
    errors.push("Nazwa użytkownika musi mieć min. 3 znaki.");
  if (!body.password || typeof body.password !== "string" || body.password.length < 6)
    errors.push("Hasło musi mieć min. 6 znaków.");
  return errors;
}

function signToken(user) {
  return jwt.sign(
    { sub: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function generateRefreshToken() {
  return crypto.randomBytes(64).toString("hex");
}

function setRefreshCookie(res, token) {
  const maxAge = REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000;
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge,
  });
}

// ── POST /auth/register ───────────────────────────────────────────────────────
router.post("/register", async (req, res) => {
  const errors = validateCredentials(req.body);
  if (errors.length) return fail(res, errors.join(" "));

  try {
    const user = await userStore.create(req.body.username, req.body.password);
    const token = signToken(user);

    // create refresh token
    const refreshToken = generateRefreshToken();
    const expiresAt = Date.now() + REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000;
    await db.runAsync("INSERT INTO refresh_tokens (token, userId, expiresAt) VALUES (?,?,?)", [refreshToken, user.id, expiresAt]);
    setRefreshCookie(res, refreshToken);

    ok(res, { token, user }, 201);
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

  const token = signToken(user);

  // issue refresh token
  const refreshToken = generateRefreshToken();
  const expiresAt = Date.now() + REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000;
  await db.runAsync("INSERT INTO refresh_tokens (token, userId, expiresAt) VALUES (?,?,?)", [refreshToken, user.id, expiresAt]);
  setRefreshCookie(res, refreshToken);

  ok(res, { token, user });
});

// ── POST /auth/refresh ───────────────────────────────────────────────────────
router.post("/refresh", async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE_NAME];
  if (!token) return fail(res, "Brak refresh tokena.", 401);

  const row = await db.getAsync("SELECT token, userId, expiresAt FROM refresh_tokens WHERE token = ?", [token]);
  if (!row) return fail(res, "Nieprawidłowy refresh token.", 401);
  if (Date.now() > row.expiresAt) {
    await db.runAsync("DELETE FROM refresh_tokens WHERE token = ?", [token]);
    return fail(res, "Refresh token wygasł.", 401);
  }

  const user = await userStore.findById(row.userId);
  if (!user) return fail(res, "Użytkownik nie istnieje.", 401);

  // rotate refresh token
  await db.runAsync("DELETE FROM refresh_tokens WHERE token = ?", [token]);
  const newRefresh = generateRefreshToken();
  const expiresAt = Date.now() + REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000;
  await db.runAsync("INSERT INTO refresh_tokens (token, userId, expiresAt) VALUES (?,?,?)", [newRefresh, user.id, expiresAt]);
  setRefreshCookie(res, newRefresh);

  const access = signToken(user);
  ok(res, { token: access, user });
});

// ── POST /auth/logout ───────────────────────────────────────────────────────
router.post("/logout", async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE_NAME];
  if (token) {
    await db.runAsync("DELETE FROM refresh_tokens WHERE token = ?", [token]);
  }
  res.clearCookie(REFRESH_COOKIE_NAME);
  ok(res, { loggedOut: true });
});

// ── GET /auth/me ──────────────────────────────────────────────────────────────
router.get("/me", requireAuth, (req, res) => {
  ok(res, req.user);
});

module.exports = router;