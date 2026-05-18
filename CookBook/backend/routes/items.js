/**
 * routes/items.js
 * Endpointy:
 *   GET    /items
 *   POST   /items
 *   PUT    /items/:id
 *   DELETE /items/:id
 *   POST   /sync
 */

const { Router } = require("express");
const store = require("../store");

const router = Router();

// ── Helpers ──────────────────────────────────────────────────────────────────

const ok = (res, data, status = 200) => res.status(status).json({ ok: true, data });

const fail = (res, message, status = 400) =>
  res.status(status).json({ ok: false, error: message });

function validateRecipeBody(body) {
  const errors = [];
  if (!body.title || typeof body.title !== "string" || !body.title.trim())
    errors.push("Pole `title` jest wymagane i musi być niepustym stringiem.");
  if (body.ingredients !== undefined && !Array.isArray(body.ingredients))
    errors.push("Pole `ingredients` musi być tablicą.");
  if (body.steps !== undefined && !Array.isArray(body.steps))
    errors.push("Pole `steps` musi być tablicą.");
  return errors;
}

// ── GET /items ────────────────────────────────────────────────────────────────
router.get("/", (req, res) => {
  const { category, q } = req.query;
  let list = store.getAll();

  if (category) {
    list = list.filter(
      (r) => r.category.toLowerCase() === category.toLowerCase()
    );
  }
  if (q) {
    const term = q.toLowerCase();
    list = list.filter(
      (r) =>
        r.title.toLowerCase().includes(term) ||
        r.category.toLowerCase().includes(term)
    );
  }

  ok(res, list);
});

// ── POST /items ───────────────────────────────────────────────────────────────
router.post("/", (req, res) => {
  const errors = validateRecipeBody(req.body);
  if (errors.length) return fail(res, errors.join(" "));

  const recipe = store.create(req.body);
  ok(res, recipe, 201);
});

// ── PUT /items/:id ────────────────────────────────────────────────────────────
router.put("/:id", (req, res) => {
  const recipe = store.get(req.params.id);
  if (!recipe) return fail(res, "Nie znaleziono przepisu.", 404);

  // Partial update — only validate title if it's being sent
  if (req.body.title !== undefined) {
    const errors = validateRecipeBody({ ...recipe, ...req.body });
    if (errors.length) return fail(res, errors.join(" "));
  }

  const updated = store.update(req.params.id, req.body);
  ok(res, updated);
});

// ── DELETE /items/:id ─────────────────────────────────────────────────────────
router.delete("/:id", (req, res) => {
  const deleted = store.remove(req.params.id);
  if (!deleted) return fail(res, "Nie znaleziono przepisu.", 404);
  ok(res, { id: req.params.id });
});

// ── POST /sync ────────────────────────────────────────────────────────────────
router.post("/sync", (req, res) => {
  const { recipes } = req.body;
  if (!Array.isArray(recipes)) {
    return fail(res, "Body musi zawierać pole `recipes` (tablica).");
  }
  const merged = store.sync(recipes);
  ok(res, merged);
});

module.exports = router;