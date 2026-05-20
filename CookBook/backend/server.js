/**
 * server.js
 * Uruchomienie:
 *   npm install
 *   node server.js
 *
 * Zmienne środowiskowe:
 *   PORT        – domyślnie 3001
 *   CLIENT_URL  – dozwolony origin CORS, domyślnie http://localhost:5173
 *   JWT_SECRET  – sekret JWT (ustaw w produkcji!)
 */

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRouter  = require("./routes/auth");
const itemsRouter = require("./routes/items");
const { requireAuth } = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT ?? 3001;
const CLIENT_URL = process.env.CLIENT_URL ?? "http://localhost:5173";

// ── Middleware ────────────────────────────────────────────────────────────────

app.use(
  cors({
    origin: CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" })); // base64 obrazów może ważyć kilka MB
app.use(cookieParser());

// ── Routes ────────────────────────────────────────────────────────────────────

app.get("/health", (_req, res) => res.json({ status: "ok" }));

// Publiczne — rejestracja i logowanie
app.use("/auth", authRouter);

// Chronione — wymagają JWT
app.use("/items", requireAuth, itemsRouter);

app.post("/sync", requireAuth, (req, res, next) => {
  req.url = "/sync";
  itemsRouter(req, res, next);
});

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
  console.log(`✅  CookBook API nasłuchuje na http://localhost:${PORT}`);
  console.log(`   CORS dozwolony dla: ${CLIENT_URL}`);
  console.log();
  console.log("Endpointy publiczne:");
  console.log(`  POST http://localhost:${PORT}/auth/register`);
  console.log(`  POST http://localhost:${PORT}/auth/login`);
  console.log(`  GET  http://localhost:${PORT}/auth/me`);
  console.log();
  console.log("Endpointy chronione (wymagają Bearer token):");
  console.log(`  GET    http://localhost:${PORT}/items`);
  console.log(`  POST   http://localhost:${PORT}/items`);
  console.log(`  PUT    http://localhost:${PORT}/items/:id`);
  console.log(`  DELETE http://localhost:${PORT}/items/:id`);
  console.log(`  POST   http://localhost:${PORT}/sync`);
});