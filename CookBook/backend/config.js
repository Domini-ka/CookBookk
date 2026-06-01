/**
 * config.js
 * Zmienne konfiguracyjne.
 * W produkcji ustaw JWT_SECRET jako zmienną środowiskową — nigdy nie commituj sekretu!
 */

const path = require("path");

const JWT_SECRET =
  process.env.JWT_SECRET ?? "cookbook-dev-secret-change-in-production";

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "15m";

// Refresh token — długo żyjący, przechowywany w bazie
const REFRESH_SECRET =
  process.env.REFRESH_SECRET ?? "cookbook-refresh-secret-change-in-production";

const REFRESH_EXPIRES_IN = process.env.REFRESH_EXPIRES_IN ?? "30d";

// Ścieżka do pliku SQLite
const DB_PATH = process.env.DB_PATH ?? path.join(__dirname, "cookbook.db");

module.exports = { JWT_SECRET, JWT_EXPIRES_IN, REFRESH_SECRET, REFRESH_EXPIRES_IN, DB_PATH };