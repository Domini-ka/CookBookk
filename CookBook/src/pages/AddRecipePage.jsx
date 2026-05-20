/**
 * pages/AddRecipePage.jsx — logika bez zmian, tylko UI
 */
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useRecipesContext } from "../context/RecipesContext";

const EMPTY_FORM = { title: "", category: "", ingredients: "", steps: "" };

function Field({ label, hint, error, children }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <label className="text-xs font-medium text-ink-300 uppercase tracking-wider">
          {label}
        </label>
        {hint && <span className="text-xs text-ink-500">{hint}</span>}
      </div>
      {children}
      {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
    </div>
  );
}

const inputCls = (hasErr) =>
  `w-full bg-ink-800 border rounded-xl px-4 py-3 text-ink-100 placeholder-ink-500
   outline-none transition-all duration-200 text-sm
   focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400/50
   ${hasErr ? "border-red-500/60" : "border-ink-600 hover:border-ink-500"}`;

export function AddRecipePage() {
  const { addRecipe }       = useRecipesContext();
  const navigate            = useNavigate();
  const [form, setForm]     = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    await addRecipe({
      title:       form.title.trim(),
      category:    form.category.trim() || "Inne",
      ingredients: form.ingredients.split("\n").map((s) => s.trim()).filter(Boolean),
      steps:       form.steps.split("\n").map((s) => s.trim()).filter(Boolean),
    });
    navigate("/");
  };

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <Link to="/" className="text-ink-500 hover:text-ink-300 text-sm transition-colors duration-200 inline-flex items-center gap-1.5 mb-4">
          ← Wróć do listy
        </Link>
        <h1 className="font-display text-3xl text-ink-50">Nowy przepis</h1>
        <p className="text-ink-400 text-sm mt-1">Wypełnij pola poniżej i zapisz przepis</p>
      </div>

      {/* Form card */}
      <div className="bg-ink-800/60 border border-ink-700/40 rounded-2xl p-8 shadow-card">
        <form onSubmit={handleSubmit} noValidate className="space-y-6">

          <div className="grid grid-cols-2 gap-5">
            <div className="col-span-2 sm:col-span-1">
              <Field label="Tytuł *" error={errors.title}>
                <input
                  id="title" name="title" value={form.title}
                  onChange={handleChange} placeholder="np. Zupa pomidorowa"
                  className={inputCls(errors.title)}
                />
              </Field>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <Field label="Kategoria">
                <input
                  id="category" name="category" value={form.category}
                  onChange={handleChange} placeholder="np. Zupy, Desery…"
                  className={inputCls(false)}
                />
              </Field>
            </div>
          </div>

          <Field label="Składniki *" hint="każdy w nowej linii" error={errors.ingredients}>
            <textarea
              id="ingredients" name="ingredients" value={form.ingredients}
              onChange={handleChange} rows={5}
              placeholder={"200g makaronu\n1 cebula\n2 ząbki czosnku\nSól, pieprz do smaku"}
              className={inputCls(errors.ingredients) + " resize-none leading-relaxed"}
            />
          </Field>

          <Field label="Kroki przygotowania *" hint="każdy krok w nowej linii" error={errors.steps}>
            <textarea
              id="steps" name="steps" value={form.steps}
              onChange={handleChange} rows={6}
              placeholder={"Ugotuj makaron al dente.\nPodsmaż cebulę na złoto.\nDodaj czosnek i smaż 1 min.\nWymieszaj wszystko."}
              className={inputCls(errors.steps) + " resize-none leading-relaxed"}
            />
          </Field>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit" disabled={saving}
              className="flex-1 bg-amber-400 hover:bg-amber-500 active:bg-amber-600
                         text-ink-900 font-semibold py-3 px-6 rounded-xl
                         transition-all duration-200 hover:shadow-glow
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Zapisuję…" : "Zapisz przepis"}
            </button>
            <button
              type="button" onClick={() => navigate("/")}
              className="px-6 py-3 rounded-xl border border-ink-600 text-ink-400
                         hover:text-ink-200 hover:border-ink-500 hover:bg-ink-700/40
                         transition-all duration-200 font-medium"
            >
              Anuluj
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}