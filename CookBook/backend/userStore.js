/**
 * userStore.js — SQLite version
 * Użytkownicy przechowywani w bazie SQLite (tabela `users` z db.js).
 * Hasła przechowywane jako hash bcrypt — nigdy plaintext.
 *
 * WAŻNE: Poprzednia wersja trzymała użytkowników w pamięci RAM (let users = []).
 * Po restarcie serwera wszyscy znikali → logowanie nie działało → sync nie działał.
 */

const bcrypt = require("bcryptjs");
const { randomUUID } = require("crypto");
const db = require("./db");

const SALT_ROUNDS = 10;

// ── Prepared statements ───────────────────────────────────────────────────────

const stmts = {
  findByUsername: db.prepare(
    "SELECT id, username, password_hash FROM users WHERE username = ? COLLATE NOCASE"
  ),

  findById: db.prepare(
    "SELECT id, username, created_at FROM users WHERE id = ?"
  ),

  insert: db.prepare(`
    INSERT INTO users (id, username, password_hash, created_at)
    VALUES (@id, @username, @passwordHash, @createdAt)
  `),
};

// ── Store API ─────────────────────────────────────────────────────────────────

const userStore = {
  async findByUsername(username) {
    const row = stmts.findByUsername.get(username);
    if (!row) return null;
    return {
      id: row.id,
      username: row.username,
      passwordHash: row.password_hash,
    };
  },

  findById(id) {
    const row = stmts.findById.get(id);
    if (!row) return null;
    return {
      id: row.id,
      username: row.username,
      createdAt: row.created_at,
    };
  },

  async create(username, password) {
    const existing = await this.findByUsername(username);
    if (existing) throw new Error("Użytkownik już istnieje.");

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = {
      id: randomUUID(),
      username: username.trim(),
      passwordHash,
      createdAt: new Date().toISOString(),
    };
    stmts.insert.run(user);
    return { id: user.id, username: user.username, createdAt: user.createdAt };
  },

  async verify(username, password) {
    const user = await this.findByUsername(username);
    if (!user) return null;

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return null;

    return { id: user.id, username: user.username };
  },
};

module.exports = userStore;