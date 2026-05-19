/**
 * pages/AddRecipePage.jsx
 * Trasa: /add
 * Formularz dodawania przepisu. Po sukcesie przekierowuje do /.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecipesContext } from "../context/RecipesContext";

const EMPTY_FORM = { title: "", category: "", ingredients: "", steps: "" };

export function AddRecipePage() {
  const { addRecipe }       = useRecipesContext();
  const navigate            = useNavigate();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    await addRecipe({
      title:       form.title.trim(),
      category:    form.category.trim() || "Inne",
      ingredients: form.ingredients.split("\n").map((s) => s.trim()).filter(Boolean),
      steps:       form.steps.split("\n").map((s) => s.trim()).filter(Boolean),
    });

    navigate("/");
  };

  return (
    <section>
      <h2>Dodaj przepis</h2>

      <form onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor="title">Tytuł *</label><br />
          <input
            id="title" name="title" value={form.title}
            onChange={handleChange} placeholder="np. Zupa pomidorowa"
          />
          {errors.title && <span style={{ color: "red" }}> {errors.title}</span>}
        </div>

        <div>
          <label htmlFor="category">Kategoria</label><br />
          <input
            id="category" name="category" value={form.category}
            onChange={handleChange} placeholder="np. Zupy, Desery…"
          />
        </div>

        <div>
          <label htmlFor="ingredients">Składniki * (każdy w nowej linii)</label><br />
          <textarea
            id="ingredients" name="ingredients" value={form.ingredients}
            onChange={handleChange} rows={4}
            placeholder={"200g makaronu\n1 cebula\nSól do smaku"}
          />
          {errors.ingredients && <span style={{ color: "red" }}> {errors.ingredients}</span>}
        </div>

        <div>
          <label htmlFor="steps">Kroki przygotowania * (każdy w nowej linii)</label><br />
          <textarea
            id="steps" name="steps" value={form.steps}
            onChange={handleChange} rows={5}
            placeholder={"Ugotuj makaron.\nPodsmaż cebulę.\nWymieszaj."}
          />
          {errors.steps && <span style={{ color: "red" }}> {errors.steps}</span>}
        </div>

        <br />
        <button type="submit">Dodaj przepis</button>
        {" "}
        <button type="button" onClick={() => navigate("/")}>Anuluj</button>
      </form>
    </section>
  );
}