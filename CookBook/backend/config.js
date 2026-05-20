/**
 * config.js
 * Zmienne konfiguracyjne.
 * W produkcji ustaw JWT_SECRET jako zmienną środowiskową — nigdy nie commituj sekretu!
 */

const JWT_SECRET =
  process.env.JWT_SECRET ?? "cookbook-dev-secret-change-in-production";

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "7d";

// Refresh token settings (days)
const REFRESH_TOKEN_EXPIRES_DAYS = Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS ?? 30);
const REFRESH_COOKIE_NAME = process.env.REFRESH_COOKIE_NAME ?? "refreshToken";

module.exports = { JWT_SECRET, JWT_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_DAYS, REFRESH_COOKIE_NAME };