/**
 * Generuje unikalne ID oparte na timestamp + losowy sufiks.
 * Nie wymaga zadnych zewnetrznych bibliotek.
 *
 * @returns {string} np. "1716040800000_x7k2p"
 */
function generateId() {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).slice(2, 7);
  return `${timestamp}_${random}`;
}

export { generateId };
