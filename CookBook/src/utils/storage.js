/**
 * storage.js
 * ──────────────────────────────────────────────────────────────
 * Generyczny silnik CRUD dla localStorage.
 * Przechowuje kolekcje jako tablice JSON pod podanym kluczem.
 *
 * Wszystkie funkcje sa synchroniczne i nie rzucaja wyjatkow
 * na zewnatrz — bledu sa logowane i zwracana jest bezpieczna
 * wartosc domyslna.
 * ──────────────────────────────────────────────────────────────
 */

// ── Helpers ────────────────────────────────────────────────────

/**
 * Odczytuje kolekcje z localStorage.
 * @param {string} storageKey
 * @returns {Array<Object>}
 */
function readCollection(storageKey) {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error(`[storage] Blad odczytu kolekcji "${storageKey}":`, err);
    return [];
  }
}

/**
 * Zapisuje kolekcje do localStorage.
 * @param {string} storageKey
 * @param {Array<Object>} collection
 * @returns {boolean} true = sukces
 */
function writeCollection(storageKey, collection) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(collection));
    return true;
  } catch (err) {
    // Mozliwy blad: QuotaExceededError (brak miejsca)
    console.error(`[storage] Blad zapisu kolekcji "${storageKey}":`, err);
    return false;
  }
}

// ── CRUD ───────────────────────────────────────────────────────

/**
 * Zwraca wszystkie rekordy z kolekcji.
 * @param {string} storageKey
 * @returns {Array<Object>}
 */
function getAll(storageKey) {
  return readCollection(storageKey);
}

/**
 * Zwraca jeden rekord po ID lub null.
 * @param {string} storageKey
 * @param {string} id
 * @returns {Object|null}
 */
function getById(storageKey, id) {
  const collection = readCollection(storageKey);
  return collection.find((item) => item.id === id) ?? null;
}

/**
 * Dodaje nowy rekord do kolekcji.
 * Rekord musi miec juz nadane pole `id`.
 *
 * @param {string} storageKey
 * @param {Object} record
 * @returns {{ success: boolean, data: Object|null, error: string|null }}
 */
function addRecord(storageKey, record) {
  if (!record || typeof record !== 'object' || !record.id) {
    return {
      success: false,
      data: null,
      error: 'Rekord musi byc obiektem z polem "id".',
    };
  }

  const collection = readCollection(storageKey);

  const alreadyExists = collection.some((item) => item.id === record.id);
  if (alreadyExists) {
    return {
      success: false,
      data: null,
      error: `Rekord o id "${record.id}" juz istnieje.`,
    };
  }

  const updated = [...collection, record];
  const saved = writeCollection(storageKey, updated);

  return saved
    ? { success: true, data: record, error: null }
    : { success: false, data: null, error: 'Blad zapisu do localStorage.' };
}

/**
 * Aktualizuje istniejacy rekord (shallow merge).
 * Pola `id` i `createdAt` sa chronione — nie mozna ich nadpisac.
 *
 * @param {string} storageKey
 * @param {string} id
 * @param {Partial<Object>} changes
 * @returns {{ success: boolean, data: Object|null, error: string|null }}
 */
function updateRecord(storageKey, id, changes) {
  if (!id) {
    return { success: false, data: null, error: 'Brakuje parametru "id".' };
  }

  const collection = readCollection(storageKey);
  const index = collection.findIndex((item) => item.id === id);

  if (index === -1) {
    return {
      success: false,
      data: null,
      error: `Nie znaleziono rekordu o id "${id}".`,
    };
  }

  // Chronione pola — nie mozna ich nadpisac przez update
  const { id: _id, createdAt: _createdAt, ...safeChanges } = changes;

  const updated = {
    ...collection[index],
    ...safeChanges,
    updatedAt: new Date().toISOString(),
  };

  const newCollection = [
    ...collection.slice(0, index),
    updated,
    ...collection.slice(index + 1),
  ];

  const saved = writeCollection(storageKey, newCollection);

  return saved
    ? { success: true, data: updated, error: null }
    : { success: false, data: null, error: 'Blad zapisu do localStorage.' };
}

/**
 * Usuwa rekord o podanym ID.
 *
 * @param {string} storageKey
 * @param {string} id
 * @returns {{ success: boolean, error: string|null }}
 */
function deleteRecord(storageKey, id) {
  if (!id) {
    return { success: false, error: 'Brakuje parametru "id".' };
  }

  const collection = readCollection(storageKey);
  const exists = collection.some((item) => item.id === id);

  if (!exists) {
    return {
      success: false,
      error: `Nie znaleziono rekordu o id "${id}".`,
    };
  }

  const filtered = collection.filter((item) => item.id !== id);
  const saved = writeCollection(storageKey, filtered);

  return saved
    ? { success: true, error: null }
    : { success: false, error: 'Blad zapisu do localStorage.' };
}

/**
 * Usuwa cala kolekcje (np. na potrzeby testow lub resetu).
 * @param {string} storageKey
 * @returns {boolean}
 */
function clearCollection(storageKey) {
  try {
    localStorage.removeItem(storageKey);
    return true;
  } catch (err) {
    console.error(`[storage] Blad czyszczenia kolekcji "${storageKey}":`, err);
    return false;
  }
}

export {
  getAll,
  getById,
  addRecord,
  updateRecord,
  deleteRecord,
  clearCollection,
};
