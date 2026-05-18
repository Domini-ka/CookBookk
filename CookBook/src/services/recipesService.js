/**
 * recipesService.js
 * ──────────────────────────────────────────────────────────────
 * Warstwa serwisowa dla przepisow.
 * Wszystkie operacje sa synchroniczne i oparte o localStorage.
 *
 * Schemat przepisu:
 * {
 *   id:          string   — unikalny identyfikator
 nazwa przepisu
 *   ingredients: string[] — lista skladnikow
 *   steps:       string[] — kroki przygotowania
 *   createdAt:   string   — ISO 8601
 *   updatedAt:   string   — ISO 8601 (opcjonalne, dodawane przez update)
 *   synced:      boolean  — czy dane zostaly zsynchronizowane z serwerem
 * }
 * ──────────────────────────────────────────────────────────────
 */

import { generateId } from '@/utils/generateId';
import {
  getAll,
  getById,
  addRecord,
  updateRecord,
  deleteRecord,
  clearCollection,
} from '@/utils/storage';
import { validateRecipe } from '@/services/recipeValidator';

/** Klucz kolekcji w localStorage */
const STORAGE_KEY = 'cookbook_recipes';

// ── Helpers ────────────────────────────────────────────────────

/**
 * Buduje gotowy obiekt przepisu z danych wejsciowych.
 * @param {Object} input
 * @returns {Object} Przepis gotowy do zapisu
 */
function buildRecipe(input) {
  return {
    id: generateId(),    ingredients: input.ingredients.map((i) => i.trim()),
    steps: input.steps.map((s) => s.trim()),
    createdAt: new Date().toISOString(),
    synced: false,
  };
}

// ── API ────────────────────────────────────────────────────────

/**
 * Zwraca wszystkie przepisy posortowane od najnowszego.
 * @returns {Object[]}
 */
function getAllRecipes() {
  const recipes = getAll(STORAGE_KEY);
  return [...recipes].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
}

/**
 * Zwraca pojedynczy przepis po ID.
 * @param {string} id
 * @returns {Object|null}
 */
function getRecipeById(id) {
  return getById(STORAGE_KEY, id);
}

/**
 * Dodaje nowy przepis po walidacji.
 *
 * @param {{ title: string, ingredients: string[], steps: string[] }} input
 * @returns {{ success: boolean, data: Object|null, errors: string[] }}
 */
function addRecipe(input) {
  const errors = validateRecipe(input);
  if (errors.length > 0) {
    return { success: false, data: null, errors };
  }

  const recipe = buildRecipe(input);
  const result = addRecord(STORAGE_KEY, recipe);

  return {
    success: result.success,
    data: result.data,
    errors: result.error ? [result.error] : [],
  };
}

/**
 * Aktualizuje istniejacy przepis.
 * Przekazuj tylko pola, ktore chcesz zmienic.
 * Pola `id`, `createdAt`, `synced` sa chronione osobno.
 *
 * @param {string} id
 * @param {Partial<{ title: string, ingredients: string[], steps: string[], synced: boolean }>} changes
 * @returns {{ success: boolean, data: Object|null, errors: string[] }}
 */
function updateRecipe(id, changes) {
  // Jesli zmieniamy content przepisu, walidujemy caly obiekt lacznie
  const existing = getRecipeById(id);
  if (!existing) {
    return {
      success: false,
      data: null,
      errors: [`Nie znaleziono przepisu o id "${id}".`],
    };
  }

  // Scal zmiany z istniejacymi danymi i zwaliduj wynikowy obiekt
  const merged = {

    ingredients: changes.ingredients ?? existing.ingredients,
    steps: changes.steps ?? existing.steps,
  };

  const errors = validateRecipe(merged);
  if (errors.length > 0) {
    return { success: false, data: null, errors };
  }

  // Normalizujemy pola tekstowe jesli byly w zmianach
  const safeChanges = {
    ...changes,
    ...(changes.title && { title: changes.title.trim() }),
    ...(changes.ingredients && {
      ingredients: changes.ingredients.map((i) => i.trim()),
    }),
    ...(changes.steps && {
      steps: changes.steps.map((s) => s.trim()),
    }),
  };

  const result = updateRecord(STORAGE_KEY, id, safeChanges);

  return {
    success: result.success,
    data: result.data,
    errors: result.error ? [result.error] : [],
  };
}

/**
 * Usuwa przepis po ID.
 *
 * @param {string} id
 * @returns {{ success: boolean, errors: string[] }}
 */
function deleteRecipe(id) {
  const result = deleteRecord(STORAGE_KEY, id);
  return {
    success: result.success,
    errors: result.error ? [result.error] : [],
  };
}

/**
 * Oznacza przepis jako zsynchronizowany z serwerem.
 * Uzyj po udanym zapisie do API.
 *
 * @param {string} id
 * @returns {{ success: boolean, errors: string[] }}
 */
function markAsSynced(id) {
  const result = updateRecord(STORAGE_KEY, id, { synced: true });
  return {
    success: result.success,
    errors: result.error ? [result.error] : [],
  };
}

/**
 * Zwraca liste przepisow, ktore nie zostaly jeszcze zsynchronizowane.
 * @returns {Object[]}
 */
function getUnsyncedRecipes() {
  return getAll(STORAGE_KEY).filter((r) => r.synced === false);
}

/**
 * Usuwa wszystkie przepisy (np. reset / wylogowanie uzytkownika).
 * @returns {boolean}
 */
function clearAllRecipes() {
  return clearCollection(STORAGE_KEY);
}

export {
  getAllRecipes,
  getRecipeById,
  addRecipe,
  updateRecipe,
  deleteRecipe,
  markAsSynced,
  getUnsyncedRecipes,
  clearAllRecipes,
};
