/**
 * store.js — SQLite version
 * Zastępuje stary in-memory store.
 * Zdjęcia przechowywane jako base64 w kolumnie image_data.
 */

const { randomUUID } = require("crypto");
const db = require("./db");

// ── Helpers ───────────────────────────────────────────────────────────────────

function toRow(recipe) {
  return {
    ...recipe,
    ingredients: JSON.parse(recipe.ingredients),
    steps:       JSON.parse(recipe.steps),
    favorite:    recipe.favorite === 1,
    imageData:   recipe.image_data ?? null,
    imageMime:   recipe.image_mime ?? null,
    ovenTemp:    recipe.oven_temp  ?? null,
    createdBy:   recipe.created_by,
    createdAt:   recipe.created_at,
    updatedAt:   recipe.updated_at,
  };
}

// ── Prepared statements ───────────────────────────────────────────────────────

const stmts = {
  getAll: db.prepare("SELECT * FROM recipes ORDER BY created_at DESC"),

  getOne: db.prepare("SELECT * FROM recipes WHERE id = ?"),

  insert: db.prepare(`
    INSERT INTO recipes
      (id, title, category, ingredients, steps, image_data, image_mime, oven_temp, favorite, created_by, created_at, updated_at)
    VALUES
      (@id, @title, @category, @ingredients, @steps, @imageData, @imageMime, @ovenTemp, @favorite, @createdBy, @now, @now)
  `),

  update: db.prepare(`
    UPDATE recipes SET
      title       = @title,
      category    = @category,
      ingredients = @ingredients,
      steps       = @steps,
      image_data  = @imageData,
      image_mime  = @imageMime,
      oven_temp   = @ovenTemp,
      favorite    = @favorite,
      updated_at  = @now
    WHERE id = @id
  `),

  delete: db.prepare("DELETE FROM recipes WHERE id = ?"),

  getOwner: db.prepare("SELECT created_by FROM recipes WHERE id = ?"),
};

// ── Store API ─────────────────────────────────────────────────────────────────

const store = {
  getAll() {
    return stmts.getAll.all().map(toRow);
  },

  get(id) {
    const row = stmts.getOne.get(id);
    return row ? toRow(row) : undefined;
  },

  create(data, userId) {
    const now = new Date().toISOString();
    const recipe = {
      id:          randomUUID(),
      title:       data.title,
      category:    data.category    ?? "Inne",
      ingredients: JSON.stringify(Array.isArray(data.ingredients) ? data.ingredients : []),
      steps:       JSON.stringify(Array.isArray(data.steps)       ? data.steps       : []),
      imageData:   data.imageData   ?? null,
      imageMime:   data.imageMime   ?? null,
      ovenTemp:    data.ovenTemp    ?? null,
      favorite:    0,
      createdBy:   userId,
      now,
    };
    stmts.insert.run(recipe);
    return toRow(stmts.getOne.get(recipe.id));
  },

  update(id, changes, userId) {
    const existing = stmts.getOne.get(id);
    if (!existing) return null;
    if (existing.created_by !== userId) return "forbidden";

    const merged = {
      id,
      title:       changes.title       ?? existing.title,
      category:    changes.category    ?? existing.category,
      ingredients: JSON.stringify(Array.isArray(changes.ingredients) ? changes.ingredients : JSON.parse(existing.ingredients)),
      steps:       JSON.stringify(Array.isArray(changes.steps)       ? changes.steps       : JSON.parse(existing.steps)),
      imageData:   "imageData" in changes ? (changes.imageData ?? null) : existing.image_data,
      imageMime:   "imageMime" in changes ? (changes.imageMime ?? null) : existing.image_mime,
      ovenTemp:    "ovenTemp"  in changes ? (changes.ovenTemp  ?? null) : existing.oven_temp,
      favorite:    "favorite"  in changes ? (changes.favorite ? 1 : 0) : existing.favorite,
      now:         new Date().toISOString(),
    };
    stmts.update.run(merged);
    return toRow(stmts.getOne.get(id));
  },

  remove(id, userId) {
    const row = stmts.getOwner.get(id);
    if (!row) return false;
    if (row.created_by !== userId) return "forbidden";
    stmts.delete.run(id);
    return true;
  },

  sync(clientRecipes = [], deletedIds = [], userId) {
    const now = new Date().toISOString();

    const syncAll = db.transaction(() => {
      // Usuń przepisy klienta (tylko własne)
      for (const id of deletedIds) {
        const row = stmts.getOwner.get(id);
        if (row && row.created_by === userId) stmts.delete.run(id);
      }

      for (const c of clientRecipes) {
        if (deletedIds.includes(c.id)) continue;
        const existing = stmts.getOne.get(c.id);

        if (!existing) {
          // Nowy przepis od klienta
          stmts.insert.run({
            id:          c.id ?? randomUUID(),
            title:       c.title       ?? "Bez tytułu",
            category:    c.category    ?? "Inne",
            ingredients: JSON.stringify(Array.isArray(c.ingredients) ? c.ingredients : []),
            steps:       JSON.stringify(Array.isArray(c.steps)       ? c.steps       : []),
            imageData:   c.imageData   ?? null,
            imageMime:   c.imageMime   ?? null,
            favorite:    c.favorite    ? 1 : 0,
            createdBy:   userId,
            now:         c.createdAt   ?? now,
          });
        } else {
          // Last-write-wins po updatedAt, tylko własny przepis
          const clientNewer = new Date(c.updatedAt ?? 0) > new Date(existing.updated_at ?? 0);
          if (clientNewer && existing.created_by === userId) {
            stmts.update.run({
              id,
              title:       c.title       ?? existing.title,
              category:    c.category    ?? existing.category,
              ingredients: JSON.stringify(Array.isArray(c.ingredients) ? c.ingredients : JSON.parse(existing.ingredients)),
              steps:       JSON.stringify(Array.isArray(c.steps)       ? c.steps       : JSON.parse(existing.steps)),
              imageData:   c.imageData   ?? existing.image_data,
              imageMime:   c.imageMime   ?? existing.image_mime,
              favorite:    c.favorite    ? 1 : 0,
              now:         c.updatedAt,
            });
          }
        }
      }
    });

    syncAll();
    // Zwróć WSZYSTKIE przepisy (wspólne), nie tylko użytkownika
    return stmts.getAll.all().map(toRow);
  },
};

module.exports = store;