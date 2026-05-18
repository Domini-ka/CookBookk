import { useState, useEffect, useCallback } from "react";

// ---------------------------------------------------------------------------
// localStorage utils
// ---------------------------------------------------------------------------
const STORAGE_KEY = "cookbook_recipes";

const storage = {
  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },
  save(recipes) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
    } catch (err) {
      console.error("[useRecipes] Failed to persist to localStorage:", err);
    }
  },
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
function useRecipes() {
  const [recipes, setRecipes] = useState(() => storage.load());

  // Keep localStorage in sync whenever recipes change
  useEffect(() => {
    storage.save(recipes);
  }, [recipes]);

  // Listen for changes made in other tabs / windows
  useEffect(() => {
    const handleStorageEvent = (e) => {
      if (e.key === STORAGE_KEY) {
        setRecipes(e.newValue ? JSON.parse(e.newValue) : []);
      }
    };
    window.addEventListener("storage", handleStorageEvent);
    return () => window.removeEventListener("storage", handleStorageEvent);
  }, []);

  // ── CRUD helpers ──────────────────────────────────────────────────────────

  const addRecipe = useCallback((recipe) => {
    const newRecipe = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...recipe,
    };
    setRecipes((prev) => [...prev, newRecipe]);
    return newRecipe;
  }, []);

  const updateRecipe = useCallback((id, changes) => {
    setRecipes((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, ...changes, updatedAt: new Date().toISOString() } : r
      )
    );
  }, []);

  const deleteRecipe = useCallback((id) => {
    setRecipes((prev) => prev.filter((r) => r.id !== id));
  }, []);

  return { recipes, addRecipe, updateRecipe, deleteRecipe };
}

export { useRecipes };