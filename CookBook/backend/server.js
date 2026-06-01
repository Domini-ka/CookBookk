/**
 * server.js
 * Uruchomienie:
 *   npm install
 *   node server.js
 *
 * Zmienne środowiskowe:
 *   PORT        – domyślnie 3001
 *   CLIENT_URL  – dozwolony origin CORS, domyślnie https://cookbookk.onrender.com
 *   JWT_SECRET  – sekret JWT (ustaw w produkcji!)
 */

const express = require("express");
const cors = require("cors");

const authRouter  = require("./routes/auth");
const itemsRouter = require("./routes/items");
const { requireAuth } = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT ?? 3001;
const CLIENT_URL = process.env.CLIENT_URL ?? "https://coookbook.netlify.app";

// ── Middleware ────────────────────────────────────────────────────────────────

app.use(
  cors({
    origin: CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10mb" })); // base64 obrazów może ważyć kilka MB

// ── Routes ────────────────────────────────────────────────────────────────────

app.get("/health", (_req, res) => res.json({ status: "ok" }));

// Publiczne — rejestracja i logowanie
app.use("/auth", authRouter);

// Chronione — wymagają JWT
app.use("/items", requireAuth, itemsRouter);

// ── 404 ───────────────────────────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({ ok: false, error: "Nie znaleziono endpointu." });
});

// ── Global error handler ──────────────────────────────────────────────────────

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ ok: false, error: "Wewnętrzny błąd serwera." });
});

// ── Start ─────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`✅  CookBook API nasłuchuje na porcie: ${PORT}`);
  console.log(`   CORS dozwolony dla: ${CLIENT_URL}`);
  console.log();
  console.log("Endpointy publiczne:");
  console.log(`  POST /auth/register`);
  console.log(`  POST /auth/login`);
  console.log(`  POST /auth/refresh`);
  console.log(`  POST /auth/logout`);
  console.log(`  GET  /auth/me`);
  console.log();
  console.log("Endpointy chronione (wymagają Bearer token):");
  console.log(`  GET    /items`);
  console.log(`  POST   /items`);
  console.log(`  PUT    /items/:id`);
  console.log(`  DELETE /items/:id`);
  console.log(`  POST   /items/sync`);
});