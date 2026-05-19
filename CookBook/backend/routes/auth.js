/**
 * routes/auth.js
 * POST /auth/register  – rejestracja
 * POST /auth/login     – logowanie, zwraca JWT
 * GET  /auth/me        – dane zalogowanego (wymaga tokena)
 */

const { Router } = require("express");
const jwt = require("jsonwebtoken");
const userStore = require("../userStore");
const { requireAuth } = require("../middleware/auth");
const { JWT_SECRET, JWT_EXPIRES_IN } = require("../config");

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

// ── POST /auth/register ───────────────────────────────────────────────────────
router.post("/register", async (req, res) => {
  const errors = validateCredentials(req.body);
  if (errors.length) return fail(res, errors.join(" "));

  try {
    const user = await userStore.create(req.body.username, req.body.password);
    const token = signToken(user);
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
  ok(res, { token, user });
});

// ── GET /auth/me ──────────────────────────────────────────────────────────────
router.get("/me", requireAuth, (req, res) => {
  ok(res, req.user);
});

module.exports = router;