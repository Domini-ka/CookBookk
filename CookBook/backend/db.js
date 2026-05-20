const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const { promisify } = require("util");

const dbPath = path.join(__dirname, "cookbook.db");
const db = new sqlite3.Database(dbPath);

db.runAsync = function (sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};
db.getAsync = promisify(db.get.bind(db));
db.allAsync = promisify(db.all.bind(db));

async function init() {
  await db.runAsync(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE,
    passwordHash TEXT,
    createdAt TEXT
  )`);

  await db.runAsync(`CREATE TABLE IF NOT EXISTS recipes (
    id TEXT PRIMARY KEY,
    title TEXT,
    category TEXT,
    ingredients TEXT,
    steps TEXT,
    imageData TEXT,
    imageMime TEXT,
    favorite INTEGER DEFAULT 0,
    createdBy TEXT,
    createdAt TEXT,
    updatedAt TEXT
  )`);

  await db.runAsync(`CREATE TABLE IF NOT EXISTS refresh_tokens (
    token TEXT PRIMARY KEY,
    userId TEXT,
    expiresAt INTEGER
  )`);
}

init().catch((err) => console.error("DB init error:", err));

module.exports = db;
