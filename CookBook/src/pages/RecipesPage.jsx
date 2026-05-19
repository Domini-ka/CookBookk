/**
 * pages/RecipesPage.jsx
 * Trasa: /
 * Lista wszystkich przepisów z linkami do szczegółów.
 */

import { Link } from "react-router-dom";
import { useRecipesContext } from "../context/RecipesContext";

export function RecipesPage() {
  const { recipes, deleteRecipe } = useRecipesContext();

  if (recipes.length === 0) {
    return (
      <section>
        <h2>Przepisy</h2>
        <p>
          Brak przepisów.{" "}
          <Link to="/add">Dodaj pierwszy!</Link>
        </p>
      </section>
    );
  }

  return (
    <section>
      <h2>Przepisy ({recipes.length})</h2>
      <ul>
        {recipes.map((recipe) => (
          <li key={recipe.id}>
            <Link to={`/recipe/${recipe.id}`}>
              <strong>{recipe.title}</strong>
            </Link>
            {recipe.category && <em> [{recipe.category}]</em>}
            {" — "}
            <button
              onClick={() => {
                if (window.confirm(`Usunąć "${recipe.title}"?`)) {
                  deleteRecipe(recipe.id);
                }
              }}
            >
              Usuń ✕
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}