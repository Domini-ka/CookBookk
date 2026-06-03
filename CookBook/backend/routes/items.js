const { Router } = require("express");
const store = require("../store");

const router = Router();

const ok   = (res, data, status = 200) => res.status(status).json({ ok: true, data });
const fail = (res, error, status = 400) => res.status(status).json({ ok: false, error });

function validateRecipeBody(body) {
  const errors = [];
  if (!body.title || typeof body.title !== "string" || !body.title.trim())
    errors.push("Pole `title` jest wymagane.");
  if (body.ingredients !== undefined && !Array.isArray(body.ingredients))
    errors.push("Pole `ingredients` musi być tablicą.");
  if (body.steps !== undefined && !Array.isArray(body.steps))
    errors.push("Pole `steps` musi być tablicą.");
  if (body.imageData && !body.imageMime)
    errors.push("Pole `imageMime` jest wymagane gdy podano `imageData`.");
  return errors;
}

// GET /items — zwraca wszystkie przepisy, wspólne dla wszystkich użytkowników
router.get("/", (req, res) => {
  const { category, q } = req.query;
  let list = store.getAll();
  if (category) list = list.filter((r) => r.category?.toLowerCase() === category.toLowerCase());
  if (q) {
    const term = q.toLowerCase();
    list = list.filter((r) =>
      r.title.toLowerCase().includes(term) ||
      r.category?.toLowerCase().includes(term)
    );
  }
  ok(res, list);
});

// POST /items
router.post("/", (req, res) => {
  const errors = validateRecipeBody(req.body);
  if (errors.length) return fail(res, errors.join(" "));
  const recipe = store.create(req.body, req.user.id);
  ok(res, recipe, 201);
});

// PUT /items/:id
router.put("/:id", (req, res) => {
  const existing = store.get(req.params.id);
  if (!existing) return fail(res, "Nie znaleziono przepisu.", 404);
  if (req.body.title !== undefined) {
    const errors = validateRecipeBody({ ...existing, ...req.body });
    if (errors.length) return fail(res, errors.join(" "));
  }
  const result = store.update(req.params.id, req.body, req.user.id);
  if (result === "forbidden") return fail(res, "Brak uprawnień.", 403);
  ok(res, result);
});

// DELETE /items/:id
router.delete("/:id", (req, res) => {
  const result = store.remove(req.params.id, req.user.id);
  if (result === false)       return fail(res, "Nie znaleziono przepisu.", 404);
  if (result === "forbidden") return fail(res, "Brak uprawnień.", 403);
  ok(res, { id: req.params.id });
});

module.exports = router;