/**
 * pages/RecipesPage.jsx — logika bez zmian, tylko UI
 */
import { Link } from "react-router-dom";
import { useRecipesContext } from "../context/RecipesContext";
import { RecipeCard } from "../components/RecipeCard";

export function RecipesPage() {
  const { recipes, deleteRecipe } = useRecipesContext();

  if (recipes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-6xl mb-6">🍽️</div>
        <h2 className="font-display text-3xl text-ink-100 mb-3">Brak przepisów</h2>
        <p className="text-ink-400 mb-8 max-w-xs">
          Twoja kolekcja jest pusta. Dodaj pierwszy przepis i zacznij gotować!
        </p>
        <Link
          to="/add"
          className="bg-amber-400 hover:bg-amber-500 text-ink-900 font-semibold
                     px-6 py-3 rounded-xl transition-all duration-200 hover:shadow-glow"
        >
          + Dodaj pierwszy przepis
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Page header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-ink-50">Twoje przepisy</h1>
          <p className="text-ink-400 text-sm mt-1">{recipes.length} przepisów w kolekcji</p>
        </div>
        <Link
          to="/add"
          className="bg-amber-400 hover:bg-amber-500 active:bg-amber-600
                     text-ink-900 font-semibold text-sm px-5 py-2.5 rounded-xl
                     transition-all duration-200 hover:shadow-glow flex items-center gap-2"
        >
          <span className="text-lg leading-none">+</span> Nowy przepis
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} onDelete={deleteRecipe} />
        ))}
      </div>
    </div>
  );
}