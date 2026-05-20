/**
 * userStore.js — SQLite-backed user store
 */

const { randomUUID } = require("crypto");
const bcrypt = require("bcryptjs");
const db = require("./db");

const SALT_ROUNDS = 10;

const userStore = {
  async findByUsername(username) {
    return db.getAsync(
      "SELECT id, username, passwordHash, createdAt FROM users WHERE lower(username)=lower(?)",
      [username]
    );
  },

  async findById(id) {
    return db.getAsync("SELECT id, username, createdAt FROM users WHERE id=?", [id]);
  },

  async create(username, password) {
    const existing = await db.getAsync(
      "SELECT id FROM users WHERE lower(username)=lower(?)",
      [username]
    );
    if (existing) throw new Error("Użytkownik już istnieje.");

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const id = randomUUID();
    const createdAt = new Date().toISOString();
    await db.runAsync(
      "INSERT INTO users (id, username, passwordHash, createdAt) VALUES (?,?,?,?)",
      [id, username.trim(), passwordHash, createdAt]
    );
    return { id, username: username.trim(), createdAt };
  },

  async verify(username, password) {
    const row = await db.getAsync(
      "SELECT id, username, passwordHash, createdAt FROM users WHERE lower(username)=lower(?)",
      [username]
    );
    if (!row) return null;
    const match = await bcrypt.compare(password, row.passwordHash);
    if (!match) return null;
    return { id: row.id, username: row.username, createdAt: row.createdAt };
  },
};

module.exports = userStore;