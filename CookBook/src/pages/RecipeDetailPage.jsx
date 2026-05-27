import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useRecipesContext } from "../context/RecipesContext";
import { useAuth } from "../hooks/useAuth";
import { ImageUpload } from "../components/ImageUpload";
import { toDataUrl } from "../utils/imageUtils";

export function RecipeDetailPage() {
  const { id }                              = useParams();
  const navigate                            = useNavigate();
  const { recipes, deleteRecipe, updateRecipe } = useRecipesContext();
  const { user }                            = useAuth();
  const [editingImg, setEditingImg]         = useState(false);

  const recipe  = recipes.find((r) => r.id === id);
  const isOwner = recipe?.createdBy === user?.id;

  if (!recipe) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
      <div className="text-5xl mb-4">🔍</div>
      <h2 className="font-display text-2xl text-cocoa-700 mb-2">Nie znaleziono przepisu</h2>
      <Link to="/" className="text-rose-400 text-sm font-bold mt-2">← Wróć</Link>
    </div>
  );

  const imgSrc = toDataUrl(recipe.imageData, recipe.imageMime);

  const handleDelete = () => {
    if (window.confirm(`Usunąć "${recipe.title}"?`)) {
      deleteRecipe(recipe.id);
      navigate("/");
    }
  };

  const toggleFavorite = () => updateRecipe(recipe.id, { favorite: !recipe.favorite });

  const handleImageReady = ({ imageData, imageMime }) => {
    updateRecipe(recipe.id, { imageData, imageMime });
    setEditingImg(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back */}
      <Link to="/" className="text-sand-300 hover:text-rose-400 text-sm font-semibold
                              transition-colors inline-flex items-center gap-1.5 mb-5">
        ← Wróć
      </Link>

      {/* ── Hero ── */}
      <div className={`relative rounded-2xl sm:rounded-3xl overflow-hidden mb-6 shadow-card
                       ${imgSrc ? "h-48 sm:h-64" : "h-24 bg-rose-50 border-2 border-dashed border-rose-200"}`}>
        {imgSrc ? (
          <>
            <img src={imgSrc} alt={recipe.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-cocoa-700/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-16 sm:bottom-5 sm:left-6">
              <h1 className="font-display text-xl sm:text-3xl text-white leading-tight drop-shadow-lg">
                {recipe.title}
              </h1>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-sand-300 text-sm font-medium">Brak zdjęcia</p>
          </div>
        )}

        {recipe.category && (
          <span className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-white/80 backdrop-blur-sm
                           text-sand-400 text-xs font-bold px-2.5 py-1 rounded-xl shadow-soft">
            {recipe.category}
          </span>
        )}

        {/* Action buttons */}
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex gap-1.5 sm:gap-2">
          <button onClick={toggleFavorite}
            className="w-8 h-8 sm:w-9 sm:h-9 bg-white/80 backdrop-blur-sm rounded-full
                       flex items-center justify-center shadow-soft hover:scale-110
                       transition-all duration-200 text-sm sm:text-base">
            {recipe.favorite ? "🩷" : "🤍"}
          </button>
          {isOwner && (
            <>
              <button onClick={() => setEditingImg((v) => !v)}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center
                           shadow-soft hover:scale-110 transition-all duration-200 text-sm sm:text-base
                           ${editingImg ? "bg-sky-200" : "bg-white/80 backdrop-blur-sm"}`}>
                📷
              </button>
              <button onClick={handleDelete}
                className="w-8 h-8 sm:w-9 sm:h-9 bg-white/80 backdrop-blur-sm rounded-full
                           flex items-center justify-center shadow-soft hover:bg-red-50
                           hover:scale-110 transition-all duration-200 text-sm sm:text-base">
                🗑️
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tytuł gdy brak zdjęcia */}
      {!imgSrc && (
        <h1 className="font-display text-2xl sm:text-3xl text-cocoa-700 mb-5">{recipe.title}</h1>
      )}

      {/* Edit image */}
      {isOwner && editingImg && (
        <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 mb-5">
          <p className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-3">Zmień zdjęcie</p>
          <ImageUpload
            currentDataUrl={imgSrc}
            onImageReady={handleImageReady}
            onClear={() => { updateRecipe(recipe.id, { imageData: null, imageMime: null }); setEditingImg(false); }}
          />
          <button onClick={() => setEditingImg(false)}
            className="mt-3 text-sand-400 text-xs font-semibold">Anuluj</button>
        </div>
      )}

      {/* Info dla nie-właściciela */}
      {!isOwner && (
        <div className="bg-vanilla-100 border border-vanilla-200 rounded-2xl px-4 py-3 mb-5
                        flex items-center gap-2 text-xs sm:text-sm text-sand-400 font-medium">
          <span>👁️</span> Przeglądasz przepis innego użytkownika.
        </div>
      )}

      {/* Meta chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        <span className="text-xs sm:text-sm font-bold px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl bg-vanilla-100 text-sand-400">
          🥘 {recipe.ingredients.length} skł.
        </span>
        <span className="text-xs sm:text-sm font-bold px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl bg-vanilla-100 text-sand-400">
          📋 {recipe.steps.length} kroków
        </span>
        {recipe.ovenTemp && (
          <span className="text-xs sm:text-sm font-bold px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl bg-peach-100 text-peach-300">
            🌡️ {recipe.ovenTemp}°C
          </span>
        )}
      </div>

      {/* Składniki + Kroki — stack na mobile, grid na desktop */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 sm:gap-5">
        <div className="md:col-span-2 bg-white border border-vanilla-200 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-card">
          <h2 className="font-display text-lg sm:text-xl text-cocoa-700 mb-4">Składniki</h2>
          <ul className="space-y-2.5 sm:space-y-3">
            {recipe.ingredients.map((ing, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-sand-400 font-medium">
                <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-rose-100 border border-rose-200
                                 flex items-center justify-center text-rose-400 text-xs
                                 flex-shrink-0 mt-0.5 font-bold">{i + 1}</span>
                {ing}
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-3 bg-white border border-vanilla-200 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-card">
          <h2 className="font-display text-lg sm:text-xl text-cocoa-700 mb-4">Przygotowanie</h2>
          <ol className="space-y-3 sm:space-y-4">
            {recipe.steps.map((step, i) => (
              <li key={i} className="flex items-start gap-3 sm:gap-4">
                <span className="font-display text-xl sm:text-2xl text-vanilla-200 leading-none flex-shrink-0 w-6 sm:w-7 font-bold">
                  {i + 1}
                </span>
                <p className="text-sm text-sand-500 leading-relaxed pt-0.5 font-medium">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <p className="text-xs text-sand-300 mt-5 text-center font-medium">
        Dodano: {new Date(recipe.createdAt).toLocaleString("pl-PL")}
        {recipe.updatedAt && recipe.updatedAt !== recipe.createdAt && (
          <> · Edytowano: {new Date(recipe.updatedAt).toLocaleString("pl-PL")}</>
        )}
      </p>
    </div>
  );
}