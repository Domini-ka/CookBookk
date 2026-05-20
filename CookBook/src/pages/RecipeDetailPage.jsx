import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useRecipesContext } from "../context/RecipesContext";

function difficulty(n) {
  if (n <= 3) return { label: "Łatwy",  emoji: "🟢", bg: "bg-mint-100 text-mint-300"  };
  if (n <= 7) return { label: "Średni", emoji: "🟡", bg: "bg-sky-100  text-sky-300"   };
  return           { label: "Trudny", emoji: "🔴", bg: "bg-rose-100 text-rose-400"  };
}

function estimateTime(steps) {
  const m = steps.length * 7;
  return m < 10 ? "< 10 min" : `${Math.round(m / 5) * 5} min`;
}

function getImageUrl(recipe) {
  if (recipe.imageUrl) return recipe.imageUrl;
  const title = (recipe.title + " " + (recipe.category || "")).toLowerCase();
  const map = [
    [["zupa","rosół","barszcz","żurek"],       "soup food"],
    [["pizza"],                                  "pizza"],
    [["pasta","makaron","spaghetti","lasagna"], "pasta italian food"],
    [["sałatka","sałat"],                        "salad fresh"],
    [["ciasto","tort","sernik","browni"],        "cake dessert"],
    [["naleśniki","pancake"],                    "pancakes breakfast"],
    [["ryba","łosoś","tuńczyk","dorsz"],        "fish seafood dish"],
    [["kurczak","indyk"],                        "chicken dish food"],
    [["wołowina","stek","burger"],              "beef steak food"],
    [["wegetariański","wege","tofu"],            "vegetarian healthy food"],
    [["śniadanie","jajka","omlet"],              "breakfast eggs"],
    [["deser","lody","mus"],                     "dessert sweet"],
  ];
  for (const [keys, query] of map) {
    if (keys.some((k) => title.includes(k)))
      return `https://source.unsplash.com/1200x500/?${encodeURIComponent(query)}`;
  }
  return `https://source.unsplash.com/1200x500/?${encodeURIComponent("food cooking")}`;
}

export function RecipeDetailPage() {
  const { id }                             = useParams();
  const navigate                           = useNavigate();
  const { recipes, deleteRecipe, updateRecipe } = useRecipesContext();
  const [imgError, setImgError]            = useState(false);
  const [editingImg, setEditingImg]        = useState(false);
  const [imgInput, setImgInput]            = useState("");

  const recipe = recipes.find((r) => r.id === id);

  if (!recipe) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <div className="text-5xl mb-4">🔍</div>
      <h2 className="font-display text-2xl text-cocoa-700 mb-2">Nie znaleziono przepisu</h2>
      <Link to="/" className="text-rose-400 hover:text-rose-500 text-sm font-bold mt-2">← Wróć</Link>
    </div>
  );

  const diff = difficulty(recipe.ingredients.length);
  const time = estimateTime(recipe.steps);
  const imgSrc = imgError ? "https://source.unsplash.com/1200x500/?food" : getImageUrl(recipe);

  const handleDelete = () => {
    if (window.confirm(`Usunąć "${recipe.title}"?`)) { deleteRecipe(recipe.id); navigate("/"); }
  };
  const toggleFavorite = () => updateRecipe(recipe.id, { favorite: !recipe.favorite });
  const saveImage = () => {
    if (imgInput.trim()) updateRecipe(recipe.id, { imageUrl: imgInput.trim() });
    setEditingImg(false);
  };

  return (
    <div className="max-w-3xl">
      <Link to="/" className="text-sand-300 hover:text-rose-400 text-sm font-semibold
                              transition-colors inline-flex items-center gap-1.5 mb-6">
        ← Wróć do listy
      </Link>

      {/* Hero */}
      <div className="relative h-64 rounded-3xl overflow-hidden bg-vanilla-100 mb-8 shadow-card">
        <img src={imgSrc} alt={recipe.title}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-cocoa-700/60 via-transparent to-transparent" />

        {/* Badges */}
        {recipe.category && (
          <span className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm
                           text-sand-400 text-xs font-bold px-3 py-1.5 rounded-xl shadow-soft">
            {recipe.category}
          </span>
        )}

        {/* Actions */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button onClick={toggleFavorite}
            className="w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center
                       justify-center shadow-soft hover:scale-110 transition-all duration-200 text-base">
            {recipe.favorite ? "🩷" : "🤍"}
          </button>
          <button onClick={() => { setImgInput(recipe.imageUrl || ""); setEditingImg(true); }}
            className="w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center
                       justify-center shadow-soft hover:scale-110 transition-all duration-200 text-base">
            📷
          </button>
          <button onClick={handleDelete}
            className="w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center
                       justify-center shadow-soft hover:bg-red-50 hover:scale-110
                       transition-all duration-200 text-base">
            🗑️
          </button>
        </div>

        {/* Title */}
        <div className="absolute bottom-5 left-6 right-6">
          <h1 className="font-display text-3xl text-white leading-tight drop-shadow-lg">{recipe.title}</h1>
        </div>
      </div>

      {/* Edit image panel */}
      {editingImg && (
        <div className="bg-sky-100/60 border border-sky-200 rounded-2xl p-4 mb-6">
          <p className="text-xs font-bold text-sky-300 uppercase tracking-wider mb-2">URL zdjęcia</p>
          <input value={imgInput} onChange={(e) => setImgInput(e.target.value)}
            placeholder="https://…"
            className="w-full bg-white border border-sky-200 rounded-xl px-3 py-2.5 text-sm
                       outline-none focus:border-sky-300 text-cocoa-700 mb-3 font-medium" />
          <div className="flex gap-2">
            <button onClick={saveImage}
              className="bg-sky-200 hover:bg-sky-300 text-cocoa-700 text-sm font-bold
                         px-6 py-2 rounded-xl transition-colors">
              Zapisz zdjęcie
            </button>
            <button onClick={() => setEditingImg(false)}
              className="text-sand-400 text-sm px-4 hover:text-sand-500 transition-colors font-medium">
              Anuluj
            </button>
          </div>
        </div>
      )}

      {/* Meta chips */}
      <div className="flex flex-wrap gap-2 mb-8">
        <span className={`text-sm font-bold px-4 py-2 rounded-2xl ${diff.bg}`}>{diff.emoji} {diff.label}</span>
        <span className="text-sm font-bold px-4 py-2 rounded-2xl bg-peach-100 text-peach-300">⏱ {time}</span>
        <span className="text-sm font-bold px-4 py-2 rounded-2xl bg-vanilla-100 text-sand-400">🥘 {recipe.ingredients.length} składników</span>
        <span className="text-sm font-bold px-4 py-2 rounded-2xl bg-vanilla-100 text-sand-400">📋 {recipe.steps.length} kroków</span>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
        {/* Składniki */}
        <div className="md:col-span-2 bg-white border border-vanilla-200 rounded-3xl p-6 shadow-card h-fit">
          <h2 className="font-display text-xl text-cocoa-700 mb-4">Składniki</h2>
          <ul className="space-y-3">
            {recipe.ingredients.map((ing, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-sand-400 font-medium">
                <span className="w-6 h-6 rounded-full bg-rose-100 border border-rose-200
                                 flex items-center justify-center text-rose-400 text-xs
                                 flex-shrink-0 mt-0.5 font-bold">
                  {i + 1}
                </span>
                {ing}
              </li>
            ))}
          </ul>
        </div>

        {/* Kroki */}
        <div className="md:col-span-3 bg-white border border-vanilla-200 rounded-3xl p-6 shadow-card">
          <h2 className="font-display text-xl text-cocoa-700 mb-4">Przygotowanie</h2>
          <ol className="space-y-4">
            {recipe.steps.map((step, i) => (
              <li key={i} className="flex items-start gap-4">
                <span className="font-display text-2xl text-vanilla-200 leading-none flex-shrink-0 w-7 font-bold">
                  {i + 1}
                </span>
                <p className="text-sm text-sand-500 leading-relaxed pt-0.5 font-medium">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <p className="text-xs text-sand-300 mt-6 text-center font-medium">
        Dodano: {new Date(recipe.createdAt).toLocaleString("pl-PL")}
        {recipe.updatedAt && recipe.updatedAt !== recipe.createdAt && (
          <> · Edytowano: {new Date(recipe.updatedAt).toLocaleString("pl-PL")}</>
        )}
      </p>
    </div>
  );
}