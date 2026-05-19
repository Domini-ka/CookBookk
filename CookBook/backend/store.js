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
   * sync(clientRecipes, deletedIds)
   * Last-write-wins merge oparty na updatedAt:
   *
   *   deletedIds  – tablica id usuniętych przez klienta offline
   *
   *   Dla każdego rekordu klienta:
   *     • nieznany serwerowi          → insert
   *     • znany, klient nowszy        → nadpisz (client wins)
   *     • znany, serwer nowszy/równy  → zostaw serwer (server wins)
   *
   *   Rekordy serwera nieznane klientowi → zostają (klient jeszcze ich nie widział).
   *   deletedIds → usuwane z serwera bezwarunkowo.
   *
   * Zwraca autorytatywną pełną listę po merge.
   */
  sync(clientRecipes = [], deletedIds = []) {
    const now = new Date().toISOString();

    // 1. Usuń rekordy zgłoszone jako skasowane przez klienta
    if (deletedIds.length) {
      recipes = recipes.filter((r) => !deletedIds.includes(r.id));
    }

    // 2. Merge pozostałych
    const serverMap = new Map(recipes.map((r) => [r.id, r]));

    clientRecipes.forEach((c) => {
      // Pomiń jeśli klient wysyła rekord który właśnie skasowaliśmy
      if (deletedIds.includes(c.id)) return;

      const server = serverMap.get(c.id);

      if (!server) {
        // Nowy rekord — dodaj
        serverMap.set(c.id, {
          id: c.id ?? randomUUID(),
          title: c.title ?? "Bez tytułu",
          category: c.category ?? "Inne",
          ingredients: Array.isArray(c.ingredients) ? c.ingredients : [],
          steps: Array.isArray(c.steps) ? c.steps : [],
          createdAt: c.createdAt ?? now,
          updatedAt: c.updatedAt ?? now,
        });
      } else {
        // Oba istnieją — wygrywa nowszy updatedAt
        const clientNewer =
          new Date(c.updatedAt ?? 0) > new Date(server.updatedAt ?? 0);
        if (clientNewer) {
          serverMap.set(c.id, {
            ...server,
            title: c.title ?? server.title,
            category: c.category ?? server.category,
            ingredients: Array.isArray(c.ingredients) ? c.ingredients : server.ingredients,
            steps: Array.isArray(c.steps) ? c.steps : server.steps,
            updatedAt: c.updatedAt,
          });
        }
        // else: serwer nowszy → bez zmian
      }
    });

    recipes = Array.from(serverMap.values());
    return recipes;
  },
};

module.exports = store;