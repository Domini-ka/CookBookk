/**
 * RecipesPage.jsx
 * Kategorie zwijane na mobile (accordion), rozwinięte na desktop.
 */
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useRecipesContext } from "../context/RecipesContext";
import { RecipeCard } from "../components/RecipeCard";

export function RecipesPage() {
  const { recipes, deleteRecipe, updateRecipe } = useRecipesContext();
  const [search, setSearch]       = useState("");
  const [category, setCategory]   = useState("Wszystkie");
  const [catsOpen, setCatsOpen]   = useState(false); // tylko mobile

  const categories = useMemo(() => {
    const cats = [...new Set(recipes.map((r) => r.category).filter(Boolean))];
    return ["Wszystkie", ...cats.sort()];
  }, [recipes]);

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

  const pickCategory = (cat) => {
    setCategory(cat);
    setCatsOpen(false); // zwiń po wyborze na mobile
  };

  if (recipes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-rose-100 rounded-3xl flex items-center
                        justify-center text-4xl sm:text-5xl mb-6 shadow-soft">🍽️</div>
        <h2 className="font-display text-2xl sm:text-3xl text-cocoa-700 mb-2">Brak przepisów</h2>
        <p className="text-sand-400 mb-8 max-w-xs text-sm">
          Twoja kolekcja jest pusta. Dodaj pierwszy przepis!
        </p>
        <Link to="/add"
          className="bg-rose-300 hover:bg-rose-400 text-white font-bold px-8 py-3.5
                     rounded-2xl transition-all duration-200 shadow-soft text-sm">
          + Dodaj pierwszy przepis
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl text-cocoa-700">Moje przepisy 🌸</h1>
          <p className="text-sand-400 text-xs sm:text-sm mt-1">{recipes.length} przepisów</p>
        </div>
        <Link to="/add"
          className="bg-rose-300 hover:bg-rose-400 text-white font-bold text-sm
                     px-4 py-2.5 rounded-2xl transition-all duration-200 shadow-soft
                     flex items-center gap-1.5 flex-shrink-0 ml-3">
          <span className="hidden sm:inline">✏️ Nowy przepis</span>
          <span className="sm:hidden text-lg leading-none">✏️</span>
        </Link>
      </div>

      {/* ── Wyszukiwarka ── */}
      <div className="relative mb-4">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sand-300 text-base">🔍</span>
        <input
          value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Szukaj przepisu lub składnika…"
          className="w-full bg-white border-2 border-vanilla-200 focus:border-rose-200
                     rounded-2xl pl-11 pr-10 py-3 text-sm text-cocoa-700 placeholder-sand-300
                     outline-none transition-all duration-200 shadow-soft font-medium" />
        {search && (
          <button onClick={() => setSearch("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-sand-300 hover:text-sand-400">
            ✕
          </button>
        )}
      </div>

      {/* ── Kategorie MOBILE — zwijane ── */}
      <div className="md:hidden mb-5">
        <button
          onClick={() => setCatsOpen((v) => !v)}
          className="w-full flex items-center justify-between bg-white border-2 border-vanilla-200
                     rounded-2xl px-4 py-3 text-sm font-bold text-cocoa-700 shadow-soft
                     transition-all duration-200 active:bg-vanilla-100">
          <span className="flex items-center gap-2">
            <span>🏷️</span>
            {category === "Wszystkie" ? "Wszystkie kategorie" : category}
          </span>
          <span className={`text-sand-300 transition-transform duration-200 ${catsOpen ? "rotate-180" : ""}`}>
            ▼
          </span>
        </button>

        {/* Dropdown */}
        <div className={`overflow-hidden transition-all duration-300 ease-in-out
                         ${catsOpen ? "max-h-96 opacity-100 mt-2" : "max-h-0 opacity-0"}`}>
          <div className="bg-white border-2 border-vanilla-200 rounded-2xl shadow-card p-2 space-y-1">
            {categories.map((cat) => (
              <button key={cat} onClick={() => pickCategory(cat)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold
                            transition-all duration-150
                            ${category === cat
                              ? "bg-rose-300 text-white"
                              : "text-sand-400 hover:bg-vanilla-100 hover:text-cocoa-700"}`}>
                {cat}
                {category === cat && <span className="float-right">✓</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Kategorie DESKTOP — przyciski ── */}
      <div className="hidden md:flex flex-wrap gap-2 mb-6">
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

      {/* ── Info o wynikach ── */}
      {(search || category !== "Wszystkie") && (
        <p className="text-sand-300 text-xs sm:text-sm mb-4 font-medium">
          {filtered.length === 0
            ? "Brak wyników"
            : `${filtered.length} ${filtered.length === 1 ? "przepis" : "przepisów"}`}
          {category !== "Wszystkie" && <> · <em>{category}</em></>}
          {search && <> · „{search}"</>}
          {" "}
          <button onClick={() => { setSearch(""); setCategory("Wszystkie"); }}
            className="text-rose-400 underline underline-offset-2 hover:text-rose-500">
            Wyczyść
          </button>
        </p>
      )}

      {/* ── Grid ── */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🔎</div>
          <p className="text-sand-400 font-medium text-sm">Nie znaleziono przepisów</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filtered.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onDelete={deleteRecipe}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
}