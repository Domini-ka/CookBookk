import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useRecipesContext } from "../context/RecipesContext";
import { ImageUpload } from "../components/ImageUpload";

const EMPTY_FORM = { title: "", category: "", ingredients: "", steps: "" };

const inputCls = (err) =>
  `w-full bg-white border-2 rounded-2xl px-4 py-3 text-cocoa-700 placeholder-sand-300
   outline-none transition-all duration-200 text-sm font-medium
   focus:border-rose-200 hover:border-rose-100
   ${err ? "border-red-200 bg-red-50" : "border-vanilla-200"}`;

function Field({ label, hint, error, children }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <label className="text-xs font-bold text-sand-400 uppercase tracking-widest">{label}</label>
        {hint && <span className="text-xs text-sand-300 italic">{hint}</span>}
      </div>
      {children}
      {error && <p className="text-red-400 text-xs mt-1.5 font-medium">{error}</p>}
    </div>
  );
}

export function AddRecipePage() {
  const { addRecipe }         = useRecipesContext();
  const navigate              = useNavigate();
  const [form, setForm]       = useState(EMPTY_FORM);
  const [errors, setErrors]   = useState({});
  const [saving, setSaving]   = useState(false);
  // Zdjęcie
  const [imageData, setImageData] = useState(null);
  const [imageMime, setImageMime] = useState(null);

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
      imageData:   imageData || null,
      imageMime:   imageMime || null,
    });
    navigate("/");
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <Link to="/" className="text-sand-300 hover:text-rose-400 text-sm font-semibold
                               transition-colors inline-flex items-center gap-1.5 mb-4">
          ← Wróć
        </Link>
        <h1 className="font-display text-3xl text-cocoa-700">Nowy przepis ✏️</h1>
        <p className="text-sand-400 text-sm mt-1">Wypełnij poniższe pola i zapisz przepis</p>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-card border border-vanilla-200">
        <form onSubmit={handleSubmit} noValidate className="space-y-5">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Tytuł *" error={errors.title}>
              <input id="title" name="title" value={form.title}
                onChange={handleChange} placeholder="np. Zupa pomidorowa"
                className={inputCls(errors.title)} />
            </Field>
            <Field label="Kategoria">
              <input id="category" name="category" value={form.category}
                onChange={handleChange} placeholder="np. Zupy, Desery…"
                className={inputCls(false)} />
            </Field>
          </div>

          {/* Zdjęcie z pliku */}
          <Field label="Zdjęcie" hint="opcjonalne">
            <ImageUpload
              currentDataUrl={null}
              onImageReady={({ imageData: d, imageMime: m }) => {
                setImageData(d);
                setImageMime(m);
              }}
              onClear={() => { setImageData(null); setImageMime(null); }}
            />
          </Field>

          <Field label="Składniki *" hint="każdy w nowej linii" error={errors.ingredients}>
            <textarea id="ingredients" name="ingredients" value={form.ingredients}
              onChange={handleChange} rows={5}
              placeholder={"200g makaronu\n1 cebula\n2 ząbki czosnku\nSól do smaku"}
              className={inputCls(errors.ingredients) + " resize-none leading-relaxed"} />
          </Field>

          <Field label="Kroki przygotowania *" hint="każdy krok w nowej linii" error={errors.steps}>
            <textarea id="steps" name="steps" value={form.steps}
              onChange={handleChange} rows={6}
              placeholder={"Ugotuj makaron al dente.\nPodsmaż cebulę na złoto.\nWymieszaj wszystko."}
              className={inputCls(errors.steps) + " resize-none leading-relaxed"} />
          </Field>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="flex-1 bg-rose-300 hover:bg-rose-400 text-white font-bold py-3.5 rounded-2xl
                         transition-all duration-200 shadow-soft hover:shadow-card
                         disabled:opacity-50 disabled:cursor-not-allowed text-sm">
              {saving ? "Zapisuję…" : "Zapisz przepis 🌸"}
            </button>
            <button type="button" onClick={() => navigate("/")}
              className="px-6 py-3.5 rounded-2xl border-2 border-vanilla-200 text-sand-400
                         hover:text-cocoa-700 hover:border-sand-200 transition-all duration-200 font-bold text-sm">
              Anuluj
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}