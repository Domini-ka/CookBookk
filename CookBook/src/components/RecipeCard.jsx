import { Link } from "react-router-dom";
import { toDataUrl } from "../utils/imageUtils";

function difficulty(n) {
  if (n <= 3) return { label: "Łatwy",  emoji: "🟢", bg: "bg-mint-100  text-mint-300"  };
  if (n <= 7) return { label: "Średni", emoji: "🟡", bg: "bg-sky-100   text-sky-300"   };
  return           { label: "Trudny", emoji: "🔴", bg: "bg-rose-100  text-rose-400"  };
}

function estimateTime(steps) {
  const m = steps.length * 7;
  return m < 10 ? "< 10 min" : `${Math.round(m / 5) * 5} min`;
}

export function RecipeCard({ recipe, currentUserId, onDelete, onToggleFavorite }) {
  const diff   = difficulty(recipe.ingredients.length);
  const time   = estimateTime(recipe.steps);
  const imgSrc = toDataUrl(recipe.imageData, recipe.imageMime);
  const isOwner = recipe.createdBy === currentUserId;

  return (
    <div className="group bg-white rounded-3xl overflow-hidden shadow-card hover:shadow-hover
                    transition-all duration-300 hover:-translate-y-1 border border-vanilla-200">

      {/* ── Zdjęcie ── */}
      <Link to={`/recipe/${recipe.id}`} className="block overflow-hidden">
        <div className="relative h-44 overflow-hidden bg-vanilla-100">
          {imgSrc ? (
            <img src={imgSrc} alt={recipe.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy" />
          ) : (
            /* Placeholder gdy brak zdjęcia */
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-5xl opacity-30">🍽️</span>
            </div>
          )}

          {/* Category badge */}
          {recipe.category && (
            <span className="absolute top-3 left-3 bg-white/80 backdrop-blur-sm
                             text-sand-400 text-xs font-bold px-2.5 py-1 rounded-xl shadow-soft">
              {recipe.category}
            </span>
          )}

          {/* Ulubione — widoczne dla wszystkich */}
          <button
            onClick={(e) => { e.preventDefault(); onToggleFavorite(recipe.id); }}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm
                       flex items-center justify-center shadow-soft hover:scale-110
                       transition-all duration-200 text-base z-10">
            {recipe.favorite ? "🩷" : "🤍"}
          </button>
        </div>
      </Link>

      {/* ── Body ── */}
      <div className="p-5">
        <Link to={`/recipe/${recipe.id}`}>
          <h3 className="font-display text-lg text-cocoa-700 leading-tight mb-3
                         hover:text-rose-400 transition-colors duration-200">
            {recipe.title}
          </h3>
        </Link>

        {/* Meta chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-xl ${diff.bg}`}>
            {diff.emoji} {diff.label}
          </span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-peach-100 text-peach-300">
            ⏱ {time}
          </span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-vanilla-100 text-sand-400">
            🥘 {recipe.ingredients.length} skł.
          </span>
        </div>

        {/* Składniki preview */}
        <div className="border-t border-vanilla-200 pt-4 mb-4">
          <p className="text-xs uppercase tracking-widest text-sand-300 font-bold mb-2">Składniki</p>
          <ul className="space-y-1.5">
            {recipe.ingredients.slice(0, 3).map((ing, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-sand-400">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-200 flex-shrink-0" />
                {ing}
              </li>
            ))}
            {recipe.ingredients.length > 3 && (
              <li className="text-xs text-sand-300 italic">+{recipe.ingredients.length - 3} więcej…</li>
            )}
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link to={`/recipe/${recipe.id}`}
            className="flex-1 text-center bg-rose-100 hover:bg-rose-200
                       text-rose-400 text-sm font-bold py-2.5 rounded-2xl
                       transition-all duration-200">
            Zobacz 🍽️
          </Link>

          {/* Usuń — tylko właściciel */}
          {isOwner && (
            <button
              onClick={() => { if (window.confirm(`Usunąć "${recipe.title}"?`)) onDelete(recipe.id); }}
              className="bg-vanilla-100 hover:bg-red-50 border border-vanilla-200 hover:border-red-200
                         text-sand-300 hover:text-red-400 text-sm py-2.5 px-4 rounded-2xl
                         transition-all duration-200 font-bold"
              title="Usuń (tylko Ty możesz to zrobić)">
              🗑️
            </button>
          )}
        </div>
      </div>
    </div>
  );
}