/**
 * pages/RecipeDetailPage.jsx
 * Trasa: /recipe/:id
 * Szczegóły pojedynczego przepisu.
 */

import { useParams, useNavigate, Link } from "react-router-dom";
import { useRecipesContext } from "../context/RecipesContext";

export function RecipeDetailPage() {
  const { id }           = useParams();
  const navigate         = useNavigate();
  const { recipes, deleteRecipe } = useRecipesContext();

  const recipe = recipes.find((r) => r.id === id);

  if (!recipe) {
    return (
      <section>
        <p>Nie znaleziono przepisu.</p>
        <Link to="/">← Wróć do listy</Link>
      </section>
    );
  }

  const handleDelete = () => {
    if (window.confirm(`Usunąć "${recipe.title}"?`)) {
      deleteRecipe(recipe.id);
      navigate("/");
    }
  };

  return (
    <section>
      <p><Link to="/">← Wróć do listy</Link></p>

      <h2>{recipe.title}</h2>
      {recipe.category && <p>Kategoria: <em>{recipe.category}</em></p>}

      <h3>Składniki</h3>
      <ul>
        {recipe.ingredients.map((ing, i) => (
          <li key={i}>{ing}</li>
        ))}
      </ul>

      <h3>Przygotowanie</h3>
      <ol>
        {recipe.steps.map((step, i) => (
          <li key={i}>{step}</li>
        ))}
      </ol>

      <p>
        <small>
          Dodano: {new Date(recipe.createdAt).toLocaleString("pl-PL")}
          {recipe.updatedAt && recipe.updatedAt !== recipe.createdAt && (
            <> | Edytowano: {new Date(recipe.updatedAt).toLocaleString("pl-PL")}</>
          )}
        </small>
      </p>

      <button onClick={handleDelete}>Usuń przepis ✕</button>
    </section>
  );
}