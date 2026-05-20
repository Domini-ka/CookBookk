/**
 * components/ImageUpload.jsx
 * Picker pliku obrazu z podglądem i walidacją.
 *
 * Props:
 *   currentDataUrl {string|null} – istniejące zdjęcie (data URL) do podglądu
 *   onImageReady   {fn}          – callback({ imageData, imageMime }) gdy plik wybrany
 *   onClear        {fn}          – callback() gdy użytkownik usuwa zdjęcie
 */

import { useState, useRef } from "react";
import { fileToBase64, validateImageFile } from "../utils/imageUtils";

export function ImageUpload({ currentDataUrl, onImageReady, onClear }) {
  const [preview, setPreview]   = useState(currentDataUrl || null);
  const [error, setError]       = useState(null);
  const [loading, setLoading]   = useState(false);
  const inputRef                = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    const validationErr = validateImageFile(file);
    if (validationErr) { setError(validationErr); return; }

    setError(null);
    setLoading(true);
    try {
      const imageData = await fileToBase64(file);
      const imageMime = file.type;
      const dataUrl   = `data:${imageMime};base64,${imageData}`;
      setPreview(dataUrl);
      onImageReady({ imageData, imageMime });
    } catch {
      setError("Nie udało się wczytać pliku.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => handleFile(e.target.files?.[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files?.[0]);
  };

  const handleClear = () => {
    setPreview(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
    onClear();
  };

  return (
    <div>
      {preview ? (
        /* Podgląd wybranego zdjęcia */
        <div className="relative rounded-2xl overflow-hidden border-2 border-vanilla-200 shadow-soft">
          <img src={preview} alt="Podgląd" className="w-full h-48 object-cover" />
          <div className="absolute inset-0 bg-cocoa-700/20 opacity-0 hover:opacity-100
                          transition-opacity duration-200 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="bg-white text-cocoa-700 text-xs font-bold px-4 py-2 rounded-xl
                         shadow-card hover:bg-vanilla-100 transition-colors">
              📷 Zmień
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="bg-white text-red-400 text-xs font-bold px-4 py-2 rounded-xl
                         shadow-card hover:bg-red-50 transition-colors">
              ✕ Usuń
            </button>
          </div>
        </div>
      ) : (
        /* Strefa drop */
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-rose-200 hover:border-rose-300
                     bg-rose-50/40 hover:bg-rose-50 rounded-2xl p-8
                     flex flex-col items-center justify-center gap-3 cursor-pointer
                     transition-all duration-200 min-h-[120px]">
          {loading ? (
            <div className="text-sand-300 text-sm font-medium animate-pulse">Wczytywanie…</div>
          ) : (
            <>
              <span className="text-3xl">📷</span>
              <p className="text-sand-400 text-sm font-semibold text-center">
                Kliknij lub przeciągnij zdjęcie
              </p>
              <p className="text-sand-300 text-xs text-center">
                JPG, PNG, WEBP, GIF · max 4 MB
              </p>
            </>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleChange}
        className="hidden"
      />

      {error && (
        <p className="text-red-400 text-xs mt-2 font-medium">{error}</p>
      )}
    </div>
  );
}