/**
 * components/RecipeCard.jsx
 * Kafelek przepisu — zdjęcie (Unsplash), nazwa, trudność, czas, mini-składniki.
 * Logika: przekazana z zewnątrz (onDelete, link do /recipe/:id).
 */

import { Link } from "react-router-dom";

// Deterministyczny obrazek z Unsplash na podstawie tytułu
function recipeImage(title) {
  const queries = [
    "food", "dish", "meal", "cooking", "cuisine",
    "recipe", "plate", "dinner", "lunch", "breakfast",
  ];
  const seed = title
    .split("")
    .reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const q = queries[seed % queries.length];
  // Używamy picsum z seed żeby obrazek był stały dla danego przepisu
  return `https://picsum.photos/seed/${encodeURIComponent(title)}/600/400`;
}

// Szacowany czas na podstawie liczby kroków
function estimateTime(steps) {
  const base = steps.length * 7;
  return base < 10 ? "< 10 min" : `${Math.round(base / 5) * 5} min`;
}

// Trudność na podstawie liczby składników
function difficulty(ingredients) {
  const n = ingredients.length;
  if (n <= 3)  return { label: "Łatwy",    color: "text-emerald-400" };
  if (n <= 7)  return { label: "Średni",   color: "text-amber-400"   };
  return             { label: "Trudny",   color: "text-red-400"     };
}

export function RecipeCard({ recipe, onDelete }) {
  const { label, color } = difficulty(recipe.ingredients);
  const time = estimateTime(recipe.steps);

  return (
    <div className="group bg-ink-800/70 border border-ink-700/40 rounded-2xl overflow-hidden
                    shadow-card hover:shadow-card-hover transition-all duration-300
                    hover:-translate-y-1">

      {/* ── Zdjęcie ── */}
      <Link to={`/recipe/${recipe.id}`} className="block overflow-hidden">
        <div className="relative h-44 bg-ink-700">
          <img
            src={recipeImage(recipe.title)}
            alt={recipe.title}
            className="w-full h-full object-cover transition-transform duration-500
                       group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
          {/* Category badge */}
          {recipe.category && (
            <span className="absolute top-3 left-3 bg-ink-900/70 backdrop-blur-sm
                             text-ink-300 text-xs px-2.5 py-1 rounded-lg border border-ink-700/50">
              {recipe.category}
            </span>
          )}
        </div>
      </Link>

      {/* ── Body ── */}
      <div className="p-5">
        {/* Tytuł */}
        <Link to={`/recipe/${recipe.id}`}>
          <h3 className="font-display text-lg text-ink-50 leading-tight mb-3
                         hover:text-amber-400 transition-colors duration-200">
            {recipe.title}
          </h3>
        </Link>

        {/* Meta: trudność + czas */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1.5">
            <span className="text-ink-500 text-xs">⚡</span>
            <span className={`text-xs font-medium ${color}`}>{label}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-ink-500 text-xs">⏱</span>
            <span className="text-ink-400 text-xs">{time}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-ink-500 text-xs">🥘</span>
            <span className="text-ink-400 text-xs">{recipe.ingredients.length} skł.</span>
          </div>
        </div>

        {/* Składniki preview */}
        <div className="border-t border-ink-700/40 pt-4 mb-4">
          <p className="text-xs uppercase tracking-wider text-ink-500 font-medium mb-2">
            Składniki
          </p>
          <ul className="space-y-1">
            {recipe.ingredients.slice(0, 3).map((ing, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-ink-300">
                <span className="w-1 h-1 rounded-full bg-amber-400/60 flex-shrink-0" />
                {ing}
              </li>
            ))}
            {recipe.ingredients.length > 3 && (
              <li className="text-xs text-ink-500">
                +{recipe.ingredients.length - 3} więcej…
              </li>
            )}
          </ul>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link
            to={`/recipe/${recipe.id}`}
            className="flex-1 text-center bg-ink-700/60 hover:bg-ink-700 border border-ink-600/40
                       text-ink-200 text-sm font-medium py-2 px-4 rounded-xl
                       transition-all duration-200"
          >
            Zobacz
          </Link>
          <button
            onClick={() => {
              if (window.confirm(`Usunąć "${recipe.title}"?`)) onDelete(recipe.id);
            }}
            className="bg-ink-700/40 hover:bg-red-500/20 border border-ink-600/40 hover:border-red-500/40
                       text-ink-500 hover:text-red-400 text-sm py-2 px-3 rounded-xl
                       transition-all duration-200"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}