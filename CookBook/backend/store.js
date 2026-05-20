/**
 * store.js — in-memory store
 * Struktura rekordu:
 * { id, title, category, ingredients[], steps[], imageData, imageMime,
 *   createdBy, createdAt, updatedAt, favorite }
 *
 * imageData – base64 string (bez prefixu data:…) lub null
 * imageMime  – "image/jpeg" / "image/png" / "image/webp" itd., lub null
 * createdBy  – userId (string) właściciela przepisu
 */

const { randomUUID } = require("crypto");
const db = require("./db");

const ALLOWED_UPDATE = [
  "title", "category", "ingredients", "steps",
  "imageData", "imageMime", "favorite",
];

function rowToRecipe(r) {
  if (!r) return null;
  return {
    id: r.id,
    title: r.title,
    category: r.category,
    ingredients: r.ingredients ? JSON.parse(r.ingredients) : [],
    steps: r.steps ? JSON.parse(r.steps) : [],
    imageData: r.imageData,
    imageMime: r.imageMime,
    favorite: Boolean(r.favorite),
    createdBy: r.createdBy,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

const store = {
  async getAll() {
    const rows = await db.allAsync("SELECT * FROM recipes");
    return rows.map(rowToRecipe);
  },

  async get(id) {
    const row = await db.getAsync("SELECT * FROM recipes WHERE id = ?", [id]);
    return rowToRecipe(row);
  },

  async create(data, userId) {
    const now = new Date().toISOString();
    const id = randomUUID();
    const ingredients = JSON.stringify(Array.isArray(data.ingredients) ? data.ingredients : []);
    const steps = JSON.stringify(Array.isArray(data.steps) ? data.steps : []);
    await db.runAsync(
      `INSERT INTO recipes (id, title, category, ingredients, steps, imageData, imageMime, favorite, createdBy, createdAt, updatedAt)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [id, data.title, data.category ?? "Inne", ingredients, steps, data.imageData ?? null, data.imageMime ?? null, 0, userId, now, now]
    );
    return this.get(id);
  },

  /** Returns updated record, null if not found, "forbidden" if wrong owner */
  async update(id, changes, userId) {
    const existing = await this.get(id);
    if (!existing) return null;
    if (existing.createdBy !== userId) return "forbidden";

    const patch = Object.fromEntries(
      Object.entries(changes).filter(([k]) => ALLOWED_UPDATE.includes(k))
    );

    const merged = { ...existing, ...patch, updatedAt: new Date().toISOString() };

    await db.runAsync(
      `UPDATE recipes SET title=?, category=?, ingredients=?, steps=?, imageData=?, imageMime=?, favorite=?, updatedAt=? WHERE id=?`,
      [
        merged.title,
        merged.category,
        JSON.stringify(merged.ingredients || []),
        JSON.stringify(merged.steps || []),
        merged.imageData,
        merged.imageMime,
        merged.favorite ? 1 : 0,
        merged.updatedAt,
        id,
      ]
    );

    return this.get(id);
  },

  /** Returns true if deleted, false if not found, "forbidden" if wrong owner */
  async remove(id, userId) {
    const existing = await this.get(id);
    if (!existing) return false;
    if (existing.createdBy !== userId) return "forbidden";
    await db.runAsync("DELETE FROM recipes WHERE id = ?", [id]);
    return true;
  },

  async sync(clientRecipes = [], deletedIds = [], userId) {
    // Basic merge strategy similar to original: prefer client when newer and owned by user
    // Apply deletions (only for this user's records)
    if (deletedIds.length) {
      const placeholders = deletedIds.map(() => "?").join(",");
      await db.runAsync(
        `DELETE FROM recipes WHERE id IN (${placeholders}) AND createdBy = ?`,
        [...deletedIds, userId]
      );
    }

    // Upsert client recipes
    for (const c of clientRecipes) {
      if (!c.id) c.id = randomUUID();
      const server = await db.getAsync("SELECT * FROM recipes WHERE id = ?", [c.id]);
      if (!server) {
        const now = new Date().toISOString();
        await db.runAsync(
          `INSERT INTO recipes (id, title, category, ingredients, steps, imageData, imageMime, favorite, createdBy, createdAt, updatedAt)
           VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
          [
            c.id,
            c.title ?? "Bez tytułu",
            c.category ?? "Inne",
            JSON.stringify(Array.isArray(c.ingredients) ? c.ingredients : []),
            JSON.stringify(Array.isArray(c.steps) ? c.steps : []),
            c.imageData ?? null,
            c.imageMime ?? null,
            c.favorite ? 1 : 0,
            userId,
            c.createdAt ?? now,
            c.updatedAt ?? now,
          ]
        );
      } else {
        const clientNewer = new Date(c.updatedAt ?? 0) > new Date(server.updatedAt ?? 0);
        if (clientNewer && server.createdBy === userId) {
          await db.runAsync(
            `UPDATE recipes SET title=?, category=?, ingredients=?, steps=?, imageData=?, imageMime=?, favorite=?, updatedAt=? WHERE id=?`,
            [
              c.title ?? server.title,
              c.category ?? server.category,
              JSON.stringify(Array.isArray(c.ingredients) ? c.ingredients : server.ingredients),
              JSON.stringify(Array.isArray(c.steps) ? c.steps : server.steps),
              c.imageData ?? server.imageData,
              c.imageMime ?? server.imageMime,
              c.favorite ? 1 : 0,
              c.updatedAt,
              c.id,
            ]
          );
        }
      }
    }

    const rows = await db.allAsync("SELECT * FROM recipes");
    return rows.map(rowToRecipe);
  },
};

module.exports = store;