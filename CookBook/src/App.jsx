import { useState } from "react";
import { useRecipes } from "./hooks/useRecipes";


// ─── AddRecipeForm ───────────────────────────────────────────────────────────
const EMPTY_FORM = { title: "", category: "", ingredients: "", steps: "" };

function AddRecipeForm({ onAdd }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const next = {};
    if (!form.title.trim()) next.title = "Tytuł jest wymagany";
    if (!form.ingredients.trim()) next.ingredients = "Składniki są wymagane";
    if (!form.steps.trim()) next.steps = "Kroki są wymagane";
    return next;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    onAdd({
      title: form.title.trim(),
      category: form.category.trim() || "Inne",
      ingredients: form.ingredients
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      steps: form.steps
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
    });
    setForm(EMPTY_FORM);
    setErrors({});
  };

  return (
    <section>
      <h2>Dodaj przepis</h2>
      <form onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor="title">Tytuł *</label>
          <br />
          <input
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="np. Zupa pomidorowa"
          />
          {errors.title && <span style={{ color: "red" }}> {errors.title}</span>}
        </div>

        <div>
          <label htmlFor="category">Kategoria</label>
          <br />
          <input
            id="category"
            name="category"
            value={form.category}
            onChange={handleChange}
            placeholder="np. Zupy, Desery…"
          />
        </div>

        <div>
          <label htmlFor="ingredients">Składniki * (każdy w nowej linii)</label>
          <br />
          <textarea
            id="ingredients"
            name="ingredients"
            value={form.ingredients}
            onChange={handleChange}
            rows={4}
            placeholder={"200g makaronu\n1 cebula\nSól do smaku"}
          />
          {errors.ingredients && (
            <span style={{ color: "red" }}> {errors.ingredients}</span>
          )}
        </div>

        <div>
          <label htmlFor="steps">Kroki przygotowania * (każdy w nowej linii)</label>
          <br />
          <textarea
            id="steps"
            name="steps"
            value={form.steps}
            onChange={handleChange}
            rows={5}
            placeholder={"Ugotuj makaron.\nPodsmaż cebulę.\nWymieszaj."}
          />
          {errors.steps && (
            <span style={{ color: "red" }}> {errors.steps}</span>
          )}
        </div>

        <br />
        <button type="submit">Dodaj przepis</button>
      </form>
    </section>
  );
}

// ─── RecipeItem ──────────────────────────────────────────────────────────────
function RecipeItem({ recipe, onDelete }) {
  const [open, setOpen] = useState(false);

  return (
    <li>
      <strong>{recipe.title}</strong>
      {recipe.category && <em> [{recipe.category}]</em>}
      {" — "}
      <button onClick={() => setOpen((v) => !v)}>
        {open ? "Zwiń ▲" : "Rozwiń ▼"}
      </button>
      {" "}
      <button onClick={() => onDelete(recipe.id)}>Usuń ✕</button>

      {open && (
        <div style={{ marginTop: 8, marginLeft: 16 }}>
          <p>
            <strong>Składniki:</strong>
          </p>
          <ul>
            {recipe.ingredients.map((ing, i) => (
              <li key={i}>{ing}</li>
            ))}
          </ul>
          <p>
            <strong>Przygotowanie:</strong>
          </p>
          <ol>
            {recipe.steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
          <small>Dodano: {new Date(recipe.createdAt).toLocaleString("pl-PL")}</small>
        </div>
      )}
    </li>
  );
}

// ─── RecipeList ───────────────────────────────────────────────────────────────
function RecipeList({ recipes, onDelete }) {
  if (recipes.length === 0) {
    return <p>Brak przepisów. Dodaj pierwszy!</p>;
  }

  return (
    <section>
      <h2>Przepisy ({recipes.length})</h2>
      <ul>
        {recipes.map((recipe) => (
          <RecipeItem key={recipe.id} recipe={recipe} onDelete={onDelete} />
        ))}
      </ul>
    </section>
  );
}

// ─── SyncStatus ───────────────────────────────────────────────────────────────
function SyncStatus({ isOnline, synced, syncing, onSyncNow }) {
  const label = syncing
    ? "⏳ Synchronizuję..."
    : !isOnline
    ? "📴 Offline — zmiany zapisane lokalnie"
    : synced
    ? "✅ Zsynchronizowano z serwerem"
    : "⚠️ Niezynchronizowane";

  return (
    <p>
      {label}
      {isOnline && !synced && !syncing && (
        <> <button onClick={onSyncNow}>Synchronizuj teraz</button></>
      )}
    </p>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const {
    recipes,
    addRecipe,
    deleteRecipe,
    isOnline,
    synced,
    syncing,
    syncNow,
  } = useRecipes();

  return (
    <div>
      <h1>🍳 CookBook</h1>
      <SyncStatus
        isOnline={isOnline}
        synced={synced}
        syncing={syncing}
        onSyncNow={syncNow}
      />
      <hr />
      <AddRecipeForm onAdd={addRecipe} />
      <hr />
      <RecipeList recipes={recipes} onDelete={deleteRecipe} />
    </div>
  );
}