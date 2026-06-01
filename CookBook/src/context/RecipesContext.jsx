/**
 * RecipesContext.jsx
 * Przekazuje getValidToken z useAuth do useRecipes.
 * Bez tego hook nie ma tokena i każdy request kończy się 401.
 */

import { createContext, useContext } from "react";
import { useRecipes } from "../hooks/useRecipes";

const RecipesContext = createContext(null);

// getValidToken przekazujemy z App.jsx przez props
export function RecipesProvider({ getValidToken, children }) {
  const value = useRecipes({ getValidToken });
  return (
    <RecipesContext.Provider value={value}>
      {children}
    </RecipesContext.Provider>
  );
}

export function useRecipesContext() {
  const ctx = useContext(RecipesContext);
  if (!ctx) throw new Error("useRecipesContext must be used inside RecipesProvider");
  return ctx;
}