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

let recipes = [];

const ALLOWED_UPDATE = [
  "title", "category", "ingredients", "steps",
  "imageData", "imageMime", "favorite",
];

const store = {
  getAll() { return recipes; },

  get(id) { return recipes.find((r) => r.id === id); },

  create(data, userId) {
    const now = new Date().toISOString();
    const recipe = {
      id:          randomUUID(),
      title:       data.title,
      category:    data.category ?? "Inne",
      ingredients: Array.isArray(data.ingredients) ? data.ingredients : [],
      steps:       Array.isArray(data.steps)       ? data.steps       : [],
      imageData:   data.imageData  ?? null,
      imageMime:   data.imageMime  ?? null,
      favorite:    false,
      createdBy:   userId,
      createdAt:   now,
      updatedAt:   now,
    };
    recipes.push(recipe);
    return recipe;
  },

  /** Returns updated record, null if not found, "forbidden" if wrong owner */
  update(id, changes, userId) {
    const idx = recipes.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    if (recipes[idx].createdBy !== userId) return "forbidden";

    const patch = Object.fromEntries(
      Object.entries(changes).filter(([k]) => ALLOWED_UPDATE.includes(k))
    );
    recipes[idx] = { ...recipes[idx], ...patch, updatedAt: new Date().toISOString() };
    return recipes[idx];
  },

  /** Returns true if deleted, false if not found, "forbidden" if wrong owner */
  remove(id, userId) {
    const recipe = recipes.find((r) => r.id === id);
    if (!recipe) return false;
    if (recipe.createdBy !== userId) return "forbidden";
    recipes = recipes.filter((r) => r.id !== id);
    return true;
  },

  sync(clientRecipes = [], deletedIds = [], userId) {
    const now = new Date().toISOString();

    // Delete only records owned by this user
    if (deletedIds.length) {
      recipes = recipes.filter(
        (r) => !deletedIds.includes(r.id) || r.createdBy !== userId
      );
    }

    const serverMap = new Map(recipes.map((r) => [r.id, r]));

    clientRecipes.forEach((c) => {
      if (deletedIds.includes(c.id)) return;
      const server = serverMap.get(c.id);
      if (!server) {
        serverMap.set(c.id, {
          id:          c.id ?? randomUUID(),
          title:       c.title ?? "Bez tytułu",
          category:    c.category ?? "Inne",
          ingredients: Array.isArray(c.ingredients) ? c.ingredients : [],
          steps:       Array.isArray(c.steps)       ? c.steps       : [],
          imageData:   c.imageData ?? null,
          imageMime:   c.imageMime ?? null,
          favorite:    c.favorite  ?? false,
          createdBy:   userId,
          createdAt:   c.createdAt ?? now,
          updatedAt:   c.updatedAt ?? now,
        });
      } else {
        const clientNewer = new Date(c.updatedAt ?? 0) > new Date(server.updatedAt ?? 0);
        if (clientNewer && server.createdBy === userId) {
          serverMap.set(c.id, {
            ...server,
            title:       c.title       ?? server.title,
            category:    c.category    ?? server.category,
            ingredients: Array.isArray(c.ingredients) ? c.ingredients : server.ingredients,
            steps:       Array.isArray(c.steps)       ? c.steps       : server.steps,
            imageData:   c.imageData   ?? server.imageData,
            imageMime:   c.imageMime   ?? server.imageMime,
            favorite:    c.favorite    ?? server.favorite,
            updatedAt:   c.updatedAt,
          });
        }
      }
    });

    recipes = Array.from(serverMap.values());
    return recipes;
  },
};

module.exports = store;