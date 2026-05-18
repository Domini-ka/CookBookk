/**
 * recipeValidator.js
 * ──────────────────────────────────────────────────────────────
 * Waliduje dane wejsciowe przed zapisem do storage.
 * Zwraca liste bledow (pusta tablica = dane sa poprawne).
 * ──────────────────────────────────────────────────────────────
 */

/**
 * @typedef {Object} RecipeInput
 * @property {string}   title        - Nazwa przepisu
 * @property {string[]} ingredients  - Lista skladnikow
 * @property {string[]} steps        - Lista krokow przygotowania
 */

/**
 * Sprawdza poprawnosc danych przepisu.
 *
 * @param {RecipeInput} input
 * @returns {string[]} Tablica komunikatow o bledach ([] = OK)
 */
function validateRecipe(input) {
  const errors = [];

  if (!input || typeof input !== 'object') {
    errors.push('Dane przepisu musza byc obiektem.');
    return errors; // dalsze sprawdzanie nie ma sensu
  }

  // ── title ─────────────────────────────────────────────────
  if (typeof input.title !== 'string' || input.title.trim().length === 0) {
    errors.push('Pole "title" jest wymagane i musi byc niepustym tekstem.');
  } else if (input.title.trim().length > 120) {
    errors.push('Pole "title" nie moze przekraczac 120 znakow.');
  }

  // ── ingredients ───────────────────────────────────────────
  if (!Array.isArray(input.ingredients)) {
    errors.push('Pole "ingredients" musi byc tablica.');
  } else if (input.ingredients.length === 0) {
    errors.push('Lista skladnikow nie moze byc pusta.');
  } else {
    input.ingredients.forEach((item, i) => {
      if (typeof item !== 'string' || item.trim().length === 0) {
        errors.push(`Skladnik [${i}] musi byc niepustym tekstem.`);
      }
    });
  }

  // ── steps ─────────────────────────────────────────────────
  if (!Array.isArray(input.steps)) {
    errors.push('Pole "steps" musi byc tablica.');
  } else if (input.steps.length === 0) {
    errors.push('Lista krokow nie moze byc pusta.');
  } else {
    input.steps.forEach((step, i) => {
      if (typeof step !== 'string' || step.trim().length === 0) {
        errors.push(`Krok [${i}] musi byc niepustym tekstem.`);
      }
    });
  }

  return errors;
}

export { validateRecipe };
