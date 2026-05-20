import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useRecipesContext } from "../context/RecipesContext";
import { RecipeCard } from "../components/RecipeCard";

export function FavoritesPage() {
  const { recipes, deleteRecipe, updateRecipe } = useRecipesContext();

  const favorites = useMemo(() => recipes.filter((r) => r.favorite), [recipes]);

  const toggleFavorite = (id) => {
    const r = recipes.find((r) => r.id === id);
    if (r) updateRecipe(id, { favorite: !r.favorite });
  };

  const updateImage = (id, imageUrl) => updateRecipe(id, { imageUrl });

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl text-cocoa-700">Ulubione 🩷</h1>
        <p className="text-sand-400 text-sm mt-1">
          {favorites.length > 0
            ? `${favorites.length} ulubionych przepisów`
            : "Nie masz jeszcze ulubionych"}
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <div className="w-24 h-24 bg-rose-100 rounded-3xl flex items-center justify-center text-5xl mb-6 shadow-soft">🤍</div>
          <h2 className="font-display text-2xl text-cocoa-700 mb-2">Brak ulubionych</h2>
          <p className="text-sand-400 text-sm mb-8 max-w-xs">
            Kliknij 🤍 na przepisie, żeby dodać go do ulubionych.
          </p>
          <Link to="/"
            className="bg-rose-300 hover:bg-rose-400 text-white font-bold px-8 py-3.5
                       rounded-2xl transition-all duration-200 shadow-soft text-sm">
            Przeglądaj przepisy
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {favorites.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe}
              onDelete={deleteRecipe}
              onToggleFavorite={toggleFavorite}
              onUpdateImage={updateImage} />
          ))}
        </div>
      )}
    </div>
  );
}