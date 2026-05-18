/**
 * store.js
 * Simple in-memory store. Replace with a DB adapter later —
 * the interface (getAll / get / create / update / remove / sync) stays the same.
 */

const { randomUUID } = require("crypto");

let recipes = []; // { id, title, category, ingredients[], steps[], createdAt, updatedAt }

const store = {
  /** Return all recipes */
  getAll() {
    return recipes;
  },

  /** Return single recipe or undefined */
  get(id) {
    return recipes.find((r) => r.id === id);
  },

  /** Create a new recipe; returns the created record */
  create(data) {
    const now = new Date().toISOString();
    const recipe = {
      id: randomUUID(),
      title: data.title,
      category: data.category ?? "Inne",
      ingredients: Array.isArray(data.ingredients) ? data.ingredients : [],
      steps: Array.isArray(data.steps) ? data.steps : [],
      createdAt: now,
      updatedAt: now,
    };
    recipes.push(recipe);
    return recipe;
  },

  /** Update an existing recipe; returns updated record or null */
  update(id, changes) {
    const idx = recipes.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    const allowed = ["title", "category", "ingredients", "steps"];
    const patch = Object.fromEntries(
      Object.entries(changes).filter(([k]) => allowed.includes(k))
    );
    recipes[idx] = { ...recipes[idx], ...patch, updatedAt: new Date().toISOString() };
    return recipes[idx];
  },

  /** Delete a recipe; returns true if found */
  remove(id) {
    const before = recipes.length;
    recipes = recipes.filter((r) => r.id !== id);
    return recipes.length < before;
  },

  /**
   * sync(clientRecipes)
   * Naive last-write-wins merge:
   *   - client records not on server  → inserted
   *   - server records not on client  → kept (client doesn't know about them yet)
   *   - matching ids                  → server record wins (server is source of truth)
   * Returns the authoritative full list after merge.
   */
  sync(clientRecipes = []) {
    const serverIds = new Set(recipes.map((r) => r.id));
    const newFromClient = clientRecipes.filter((r) => !serverIds.has(r.id));
    newFromClient.forEach((r) => {
      const now = new Date().toISOString();
      recipes.push({
        id: r.id ?? randomUUID(),
        title: r.title ?? "Bez tytułu",
        category: r.category ?? "Inne",
        ingredients: Array.isArray(r.ingredients) ? r.ingredients : [],
        steps: Array.isArray(r.steps) ? r.steps : [],
        createdAt: r.createdAt ?? now,
        updatedAt: now,
      });
    });
    return recipes;
  },
};

module.exports = store;