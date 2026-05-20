import { useState } from "react";
import { Link } from "react-router-dom";

// Dopasowane słowa kluczowe po polskich nazwach potraw
function getImageUrl(recipe) {
  if (recipe.imageUrl) return recipe.imageUrl;
  const title = (recipe.title + " " + (recipe.category || "")).toLowerCase();
  const map = [
    [["zupa", "rosół", "barszcz", "żurek"],         "soup food"],
    [["pizza"],                                        "pizza"],
    [["pasta", "makaron", "spaghetti", "lasagna"],   "pasta italian food"],
    [["sałatka", "sałat"],                            "salad fresh"],
    [["ciasto", "tort", "sernik", "browni"],          "cake dessert"],
    [["naleśniki", "naleśnik", "pancake"],            "pancakes breakfast"],
    [["ryba", "łosoś", "tuńczyk", "dorsz"],          "fish seafood dish"],
    [["kurczak", "indyk", "drob"],                    "chicken dish food"],
    [["wołowina", "stek", "burger"],                  "beef steak food"],
    [["wegetariański", "wege", "tofu"],               "vegetarian healthy food"],
    [["śniadanie", "jajka", "omlet"],                 "breakfast eggs"],
    [["deser", "lody", "mus"],                        "dessert sweet"],
  ];
  for (const [keys, query] of map) {
    if (keys.some((k) => title.includes(k))) {
      return `https://source.unsplash.com/600x400/?${encodeURIComponent(query)}`;
    }
  }
  return `https://source.unsplash.com/600x400/?${encodeURIComponent("food cooking delicious")}`;
}

function difficulty(n) {
  if (n <= 3) return { label: "Łatwy",  emoji: "🟢", bg: "bg-mint-100  text-mint-300"  };
  if (n <= 7) return { label: "Średni", emoji: "🟡", bg: "bg-sky-100   text-sky-300"   };
  return           { label: "Trudny", emoji: "🔴", bg: "bg-rose-100  text-rose-400"  };
}

function estimateTime(steps) {
  const m = steps.length * 7;
  return m < 10 ? "< 10 min" : `${Math.round(m / 5) * 5} min`;
}

export function RecipeCard({ recipe, onDelete, onToggleFavorite, onUpdateImage }) {
  const [editingImg, setEditingImg] = useState(false);
  const [imgInput,   setImgInput]   = useState(recipe.imageUrl || "");
  const [imgError,   setImgError]   = useState(false);

  const diff = difficulty(recipe.ingredients.length);
  const time = estimateTime(recipe.steps);
  const imgSrc = imgError ? `https://source.unsplash.com/600x400/?food` : getImageUrl(recipe);

  const saveImage = () => {
    if (imgInput.trim()) onUpdateImage(recipe.id, imgInput.trim());
    setEditingImg(false);
  };

  return (
    <div className="group bg-white rounded-3xl overflow-hidden shadow-card hover:shadow-hover
                    transition-all duration-300 hover:-translate-y-1 border border-vanilla-200">

      {/* ── Zdjęcie ── */}
      <div className="relative h-44 bg-vanilla-100 overflow-hidden">
        <Link to={`/recipe/${recipe.id}`}>
          <img src={imgSrc} alt={recipe.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy" />
        </Link>

        {/* Ulubione */}
        <button onClick={() => onToggleFavorite(recipe.id)}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm
                     flex items-center justify-center shadow-soft hover:scale-110
                     transition-all duration-200 text-base">
          {recipe.favorite ? "🩷" : "🤍"}
        </button>

        {/* Edit image button */}
        <button onClick={() => setEditingImg(true)}
          className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-sm text-sand-400
                     hover:text-cocoa-700 text-xs px-2.5 py-1 rounded-xl shadow-soft
                     opacity-0 group-hover:opacity-100 transition-all duration-200 font-semibold">
          📷 Zmień
        </button>

        {/* Category badge */}
        {recipe.category && (
          <span className="absolute top-3 left-3 bg-white/80 backdrop-blur-sm
                           text-sand-400 text-xs px-2.5 py-1 rounded-xl font-semibold shadow-soft">
            {recipe.category}
          </span>
        )}
      </div>

      {/* ── Edit image modal ── */}
      {editingImg && (
        <div className="px-5 pt-4 pb-2 bg-sky-100/60 border-b border-sky-200">
          <p className="text-xs font-bold text-sky-300 mb-2 uppercase tracking-wider">URL zdjęcia</p>
          <input value={imgInput} onChange={(e) => setImgInput(e.target.value)}
            placeholder="https://…"
            className="w-full text-xs bg-white border border-sky-200 rounded-xl px-3 py-2
                       outline-none focus:border-sky-300 text-cocoa-700 mb-2" />
          <div className="flex gap-2">
            <button onClick={saveImage}
              className="flex-1 bg-sky-200 hover:bg-sky-300 text-cocoa-700 text-xs font-bold
                         py-1.5 rounded-xl transition-colors">
              Zapisz
            </button>
            <button onClick={() => setEditingImg(false)}
              className="text-sand-300 text-xs px-3 hover:text-sand-400 transition-colors">
              Anuluj
            </button>
          </div>
        </div>
      )}

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
          <button
            onClick={() => { if (window.confirm(`Usunąć "${recipe.title}"?`)) onDelete(recipe.id); }}
            className="bg-vanilla-100 hover:bg-red-50 border border-vanilla-200 hover:border-red-200
                       text-sand-300 hover:text-red-400 text-sm py-2.5 px-4 rounded-2xl
                       transition-all duration-200 font-bold">
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}