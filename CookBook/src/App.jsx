import { useState } from "react";
import { useAuth } from "./hooks/useAuth";
import { useRecipes } from "./hooks/useRecipes";
import { AuthForm } from "./components/AuthForm";

// ─── AddRecipeForm ────────────────────────────────────────────────────────────
const EMPTY_FORM = { title: "", category: "", ingredients: "", steps: "" };

function AddRecipeForm({ onAdd }) {
  const [form, setForm]     = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim())       e.title       = "Tytuł jest wymagany";
    if (!form.ingredients.trim()) e.ingredients = "Składniki są wymagane";
    if (!form.steps.trim())       e.steps       = "Kroki są wymagane";
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onAdd({
      title:       form.title.trim(),
      category:    form.category.trim() || "Inne",
      ingredients: form.ingredients.split("\n").map((s) => s.trim()).filter(Boolean),
      steps:       form.steps.split("\n").map((s) => s.trim()).filter(Boolean),
    });
    setForm(EMPTY_FORM);
    setErrors({});
  };

  return (
    <section>
      <h2>Dodaj przepis</h2>
      <form onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor="title">Tytuł *</label><br />
          <input id="title" name="title" value={form.title} onChange={handleChange}
            placeholder="np. Zupa pomidorowa" />
          {errors.title && <span style={{ color: "red" }}> {errors.title}</span>}
        </div>

        <div>
          <label htmlFor="category">Kategoria</label><br />
          <input id="category" name="category" value={form.category}
            onChange={handleChange} placeholder="np. Zupy, Desery…" />
        </div>

        <div>
          <label htmlFor="ingredients">Składniki * (każdy w nowej linii)</label><br />
          <textarea id="ingredients" name="ingredients" value={form.ingredients}
            onChange={handleChange} rows={4}
            placeholder={"200g makaronu\n1 cebula\nSól do smaku"} />
          {errors.ingredients && <span style={{ color: "red" }}> {errors.ingredients}</span>}
        </div>

        <div>
          <label htmlFor="steps">Kroki przygotowania * (każdy w nowej linii)</label><br />
          <textarea id="steps" name="steps" value={form.steps}
            onChange={handleChange} rows={5}
            placeholder={"Ugotuj makaron.\nPodsmaż cebulę.\nWymieszaj."} />
          {errors.steps && <span style={{ color: "red" }}> {errors.steps}</span>}
        </div>

        <br />
        <button type="submit">Dodaj przepis</button>
      </form>
    </section>
  );
}

// ─── RecipeItem ───────────────────────────────────────────────────────────────
function RecipeItem({ recipe, onDelete }) {
  const [open, setOpen] = useState(false);

  return (
    <li>
      <strong>{recipe.title}</strong>
      {recipe.category && <em> [{recipe.category}]</em>}
      {" — "}
      <button onClick={() => setOpen((v) => !v)}>
        {open ? "Zwiń ▲" : "Rozwiń ▼"}
      </button>{" "}
      <button onClick={() => onDelete(recipe.id)}>Usuń ✕</button>

      {open && (
        <div style={{ marginTop: 8, marginLeft: 16 }}>
          <p><strong>Składniki:</strong></p>
          <ul>
            {recipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
          </ul>
          <p><strong>Przygotowanie:</strong></p>
          <ol>
            {recipe.steps.map((step, i) => <li key={i}>{step}</li>)}
          </ol>
          <small>Dodano: {new Date(recipe.createdAt).toLocaleString("pl-PL")}</small>
        </div>
      )}
    </li>
  );
}

// ─── RecipeList ───────────────────────────────────────────────────────────────
function RecipeList({ recipes, onDelete }) {
  if (recipes.length === 0) return <p>Brak przepisów. Dodaj pierwszy!</p>;

  return (
    <section>
      <h2>Przepisy ({recipes.length})</h2>
      <ul>
        {recipes.map((r) => (
          <RecipeItem key={r.id} recipe={r} onDelete={onDelete} />
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

// ─── CookBookApp (widok po zalogowaniu) ───────────────────────────────────────
function CookBookApp({ user, onLogout }) {
  const { recipes, addRecipe, deleteRecipe, isOnline, synced, syncing, syncNow } =
    useRecipes();

  return (
    <div>
      <h1>🍳 CookBook</h1>

      <p>
        Zalogowany jako <strong>{user.username}</strong>
        {" "}
        <button onClick={onLogout}>Wyloguj</button>
      </p>

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

// ─── App (router autoryzacji) ─────────────────────────────────────────────────
export default function App() {
  const { user, token, login, register, logout, loading, error } = useAuth();

  // Protected route — jeśli brak tokena/usera → formularz auth
  if (!user || !token) {
    return (
      <AuthForm
        onLogin={login}
        onRegister={register}
        loading={loading}
        error={error}
      />
    );
  }

  return <CookBookApp user={user} onLogout={logout} />;
}