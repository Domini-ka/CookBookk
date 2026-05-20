import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useRecipesContext } from "../context/RecipesContext";
import { RecipeCard } from "../components/RecipeCard";

export function RecipesPage() {
  const { recipes, deleteRecipe, updateRecipe } = useRecipesContext();
  const [search, setSearch]   = useState("");
  const [category, setCategory] = useState("Wszystkie");

  // Zbierz unikalne kategorie
  const categories = useMemo(() => {
    const cats = [...new Set(recipes.map((r) => r.category).filter(Boolean))];
    return ["Wszystkie", ...cats.sort()];
  }, [recipes]);

  // Filtrowanie
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return recipes.filter((r) => {
      const matchCat = category === "Wszystkie" || r.category === category;
      const matchQ   = !q ||
        r.title.toLowerCase().includes(q) ||
        r.category?.toLowerCase().includes(q) ||
        r.ingredients.some((i) => i.toLowerCase().includes(q));
      return matchCat && matchQ;
    });
  }, [recipes, search, category]);

  const toggleFavorite = (id) => {
    const r = recipes.find((r) => r.id === id);
    if (r) updateRecipe(id, { favorite: !r.favorite });
  };

  const updateImage = (id, imageUrl) => {
    updateRecipe(id, { imageUrl });
  };

  if (recipes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-24 h-24 bg-rose-100 rounded-3xl flex items-center justify-center text-5xl mb-6 shadow-soft">🍽️</div>
        <h2 className="font-display text-3xl text-cocoa-700 mb-2">Brak przepisów</h2>
        <p className="text-sand-400 mb-8 max-w-xs text-sm">Twoja kolekcja jest pusta. Dodaj pierwszy przepis i zacznij gotować!</p>
        <Link to="/add"
          className="bg-rose-300 hover:bg-rose-400 text-white font-bold px-8 py-3.5
                     rounded-2xl transition-all duration-200 shadow-soft hover:shadow-card text-sm">
          + Dodaj pierwszy przepis
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl text-cocoa-700">Moje przepisy 🌸</h1>
          <p className="text-sand-400 text-sm mt-1">{recipes.length} przepisów w kolekcji</p>
        </div>
        <Link to="/add"
          className="bg-rose-300 hover:bg-rose-400 text-white font-bold text-sm
                     px-5 py-2.5 rounded-2xl transition-all duration-200 shadow-soft hover:shadow-card
                     flex items-center gap-2 flex-shrink-0">
          ✏️ Nowy przepis
        </Link>
      </div>

      {/* Search bar */}
      <div className="relative mb-5">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sand-300 text-base">🔍</span>
        <input
          value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Szukaj po nazwie, składniku, kategorii…"
          className="w-full bg-white border-2 border-vanilla-200 focus:border-rose-200
                     rounded-2xl pl-11 pr-4 py-3 text-sm text-cocoa-700 placeholder-sand-300
                     outline-none transition-all duration-200 shadow-soft font-medium" />
        {search && (
          <button onClick={() => setSearch("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-sand-300 hover:text-sand-400 text-sm">
            ✕
          </button>
        )}
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-7">
        {categories.map((cat) => (
          <button key={cat} onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-2xl text-sm font-bold transition-all duration-200
              ${category === cat
                ? "bg-rose-300 text-white shadow-soft"
                : "bg-white text-sand-400 border border-vanilla-200 hover:border-rose-200 hover:text-rose-400"}`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Results info */}
      {(search || category !== "Wszystkie") && (
        <p className="text-sand-300 text-sm mb-4 font-medium">
          {filtered.length === 0
            ? "Brak wyników"
            : `${filtered.length} ${filtered.length === 1 ? "przepis" : "przepisów"}`}
          {category !== "Wszystkie" && <> · <em>{category}</em></>}
          {search && <> · „{search}"</>}
        </p>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🔎</div>
          <p className="text-sand-400 font-medium">Nie znaleziono przepisów</p>
          <button onClick={() => { setSearch(""); setCategory("Wszystkie"); }}
            className="mt-4 text-rose-400 hover:text-rose-500 text-sm font-bold underline underline-offset-2">
            Wyczyść filtry
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((recipe) => (
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