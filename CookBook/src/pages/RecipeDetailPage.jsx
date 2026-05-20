/**
 * pages/RecipeDetailPage.jsx — logika bez zmian, tylko UI
 */
import { useParams, useNavigate, Link } from "react-router-dom";
import { useRecipesContext } from "../context/RecipesContext";

function difficulty(ingredients) {
  const n = ingredients.length;
  if (n <= 3) return { label: "Łatwy",  color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/30" };
  if (n <= 7) return { label: "Średni", color: "text-amber-400",   bg: "bg-amber-400/10 border-amber-400/30"   };
  return           { label: "Trudny", color: "text-red-400",     bg: "bg-red-400/10 border-red-400/30"       };
}

function estimateTime(steps) {
  const base = steps.length * 7;
  return base < 10 ? "< 10 min" : `${Math.round(base / 5) * 5} min`;
}

function recipeImage(title) {
  return `https://picsum.photos/seed/${encodeURIComponent(title)}/1200/500`;
}

export function RecipeDetailPage() {
  const { id }                    = useParams();
  const navigate                  = useNavigate();
  const { recipes, deleteRecipe } = useRecipesContext();

  const recipe = recipes.find((r) => r.id === id);

  if (!recipe) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <div className="text-5xl mb-4">🔍</div>
        <h2 className="font-display text-2xl text-ink-200 mb-2">Przepis nie istnieje</h2>
        <Link to="/" className="text-amber-400 hover:text-amber-300 text-sm transition-colors mt-2">
          ← Wróć do listy
        </Link>
      </div>
    );
  }

  const { label, color, bg } = difficulty(recipe.ingredients);
  const time = estimateTime(recipe.steps);

  const handleDelete = () => {
    if (window.confirm(`Usunąć "${recipe.title}"?`)) {
      deleteRecipe(recipe.id);
      navigate("/");
    }
  };

  return (
    <div className="max-w-3xl">
      {/* Back */}
      <Link to="/" className="text-ink-500 hover:text-ink-300 text-sm transition-colors duration-200 inline-flex items-center gap-1.5 mb-6">
        ← Wróć do listy
      </Link>

      {/* Hero image */}
      <div className="relative h-64 rounded-2xl overflow-hidden bg-ink-800 mb-8 shadow-card">
        <img
          src={recipeImage(recipe.title)}
          alt={recipe.title}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.style.display = "none"; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/80 via-transparent to-transparent" />

        {/* Category badge */}
        {recipe.category && (
          <span className="absolute top-4 left-4 bg-ink-900/70 backdrop-blur-sm
                           text-ink-300 text-xs px-3 py-1.5 rounded-lg border border-ink-700/50">
            {recipe.category}
          </span>
        )}

        {/* Delete button */}
        <button
          onClick={handleDelete}
          className="absolute top-4 right-4 bg-ink-900/70 backdrop-blur-sm
                     hover:bg-red-500/80 text-ink-400 hover:text-white
                     text-sm px-3 py-1.5 rounded-lg border border-ink-700/50 hover:border-red-500/50
                     transition-all duration-200"
        >
          Usuń ✕
        </button>

        {/* Title overlay */}
        <div className="absolute bottom-4 left-5 right-5">
          <h1 className="font-display text-3xl text-white leading-tight drop-shadow-lg">
            {recipe.title}
          </h1>
        </div>
      </div>

      {/* Meta chips */}
      <div className="flex flex-wrap gap-3 mb-8">
        <span className={`inline-flex items-center gap-2 text-sm px-4 py-2 rounded-xl border ${bg}`}>
          <span>⚡</span>
          <span className={`font-medium ${color}`}>{label}</span>
        </span>
        <span className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-xl border border-ink-700/40 bg-ink-800/60 text-ink-300">
          <span>⏱</span> {time}
        </span>
        <span className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-xl border border-ink-700/40 bg-ink-800/60 text-ink-300">
          <span>🥘</span> {recipe.ingredients.length} składników
        </span>
        <span className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-xl border border-ink-700/40 bg-ink-800/60 text-ink-300">
          <span>📋</span> {recipe.steps.length} kroków
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Składniki */}
        <div className="md:col-span-2 bg-ink-800/60 border border-ink-700/40 rounded-2xl p-6 shadow-card h-fit">
          <h2 className="font-display text-xl text-ink-50 mb-4">Składniki</h2>
          <ul className="space-y-3">
            {recipe.ingredients.map((ing, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-ink-300">
                <span className="w-5 h-5 rounded-full bg-amber-400/15 border border-amber-400/30
                                 flex items-center justify-center text-amber-400 text-xs
                                 flex-shrink-0 mt-0.5 font-medium">
                  {i + 1}
                </span>
                {ing}
              </li>
            ))}
          </ul>
        </div>

        {/* Kroki */}
        <div className="md:col-span-3 bg-ink-800/60 border border-ink-700/40 rounded-2xl p-6 shadow-card">
          <h2 className="font-display text-xl text-ink-50 mb-4">Przygotowanie</h2>
          <ol className="space-y-4">
            {recipe.steps.map((step, i) => (
              <li key={i} className="flex items-start gap-4">
                <span className="font-display text-2xl text-ink-600 leading-none flex-shrink-0 w-7">
                  {i + 1}
                </span>
                <p className="text-sm text-ink-300 leading-relaxed pt-0.5">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Footer meta */}
      <p className="text-xs text-ink-600 mt-6 text-center">
        Dodano: {new Date(recipe.createdAt).toLocaleString("pl-PL")}
        {recipe.updatedAt && recipe.updatedAt !== recipe.createdAt && (
          <> · Edytowano: {new Date(recipe.updatedAt).toLocaleString("pl-PL")}</>
        )}
      </p>
    </div>
  );
}