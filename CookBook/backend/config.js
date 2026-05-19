/**
 * config.js
 * Zmienne konfiguracyjne.
 * W produkcji ustaw JWT_SECRET jako zmienną środowiskową — nigdy nie commituj sekretu!
 */

const JWT_SECRET =
  process.env.JWT_SECRET ?? "cookbook-dev-secret-change-in-production";

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "7d";

module.exports = { JWT_SECRET, JWT_EXPIRES_IN };