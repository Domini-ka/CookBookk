/**
 * utils/imageUtils.js
 * Konwertuje plik obrazu (File) do base64 string (bez prefixu data:…).
 */

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => {
      // reader.result = "data:image/jpeg;base64,/9j/4AAQ…"
      const base64 = reader.result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("Nie udało się odczytać pliku."));
    reader.readAsDataURL(file);
  });
}

/**
 * Tworzy data URL z pól imageData + imageMime przechowywanych w rekordzie.
 * Zwraca null jeśli brak obrazu.
 */
export function toDataUrl(imageData, imageMime) {
  if (!imageData || !imageMime) return null;
  return `data:${imageMime};base64,${imageData}`;
}

/** Walidacja po stronie klienta */
export const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
export const MAX_SIZE_MB   = 4;

export function validateImageFile(file) {
  if (!ALLOWED_TYPES.includes(file.type))
    return "Dozwolone formaty: JPG, PNG, WEBP, GIF.";
  if (file.size > MAX_SIZE_MB * 1024 * 1024)
    return `Plik jest za duży (max ${MAX_SIZE_MB} MB).`;
  return null;
}