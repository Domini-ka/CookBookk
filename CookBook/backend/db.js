/**
 * db.js
 * Inicjalizacja SQLite przez better-sqlite3.
 * Tworzy plik cookbook.db przy pierwszym uruchomieniu.
 *
 * Tabele:
 *   users         – konta użytkowników
 *   refresh_tokens – aktywne refresh tokeny (jeden na sesję/urządzenie)
 *   recipes       – przepisy
 */

const Database = require("better-sqlite3");
const { DB_PATH } = require("./config");

const db = new Database(DB_PATH);

// Wydajność i integralność
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            TEXT PRIMARY KEY,
    username      TEXT UNIQUE NOT NULL COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  );

  CREATE TABLE IF NOT EXISTS refresh_tokens (
    id         TEXT PRIMARY KEY,
    user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT UNIQUE NOT NULL,   -- SHA-256 tokena (nie plaintext)
    device     TEXT,                   -- opcjonalny opis urządzenia
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    expires_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS recipes (
    id          TEXT PRIMARY KEY,
    title       TEXT NOT NULL,
    category    TEXT NOT NULL DEFAULT 'Inne',
    ingredients TEXT NOT NULL DEFAULT '[]',
    steps       TEXT NOT NULL DEFAULT '[]',
    image_data  TEXT,
    image_mime  TEXT,
    oven_temp   INTEGER,
    favorite    INTEGER NOT NULL DEFAULT 0,
    created_by  TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  );

  CREATE INDEX IF NOT EXISTS idx_recipes_created_by ON recipes(created_by);
  CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
`);

module.exports = db;