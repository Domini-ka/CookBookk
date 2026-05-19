/**
 * userStore.js
 * Prosta baza użytkowników w pamięci.
 * Hasła przechowywane jako hash bcrypt — nigdy plaintext.
 */

const { randomUUID } = require("crypto");
const bcrypt = require("bcryptjs");

const SALT_ROUNDS = 10;

// { id, username, passwordHash, createdAt }
let users = [];

const userStore = {
  async findByUsername(username) {
    return users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase()
    );
  },

  findById(id) {
    return users.find((u) => u.id === id);
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
    users.push(user);
    return { id: user.id, username: user.username, createdAt: user.createdAt };
  },

  async verify(username, password) {
    const user = await this.findByUsername(username);
    if (!user) return null;

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return null;

    return { id: user.id, username: user.username, createdAt: user.createdAt };
  },
};

module.exports = userStore;