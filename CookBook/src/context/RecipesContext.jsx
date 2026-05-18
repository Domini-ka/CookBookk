import { createContext, useContext, useState } from 'react';

const RecipesContext = createContext(null);

/**
 * Dostarcza globalny stan przepisow do calego drzewa komponentow.
 */
function RecipesProvider({ children }) {
  const [recipes, setRecipes] = useState([]);

  const addRecipe = (recipe) => {
    setRecipes((prev) => [
      ...prev,
      { ...recipe, id: Date.now() },
    ]);
  };

  const removeRecipe = (id) => {
    setRecipes((prev) => prev.filter((r) => r.id !== id));
  };

  const value = {
    recipes,
    addRecipe,
    removeRecipe,
  };

  return (
    <RecipesContext.Provider value={value}>
      {children}
    </RecipesContext.Provider>
  );
}

/**
 * Hook pomocniczy — zapobiega uzyciu kontekstu poza providerem.
 */
function useRecipesContext() {
  const context = useContext(RecipesContext);

  if (!context) {
    throw new Error('useRecipesContext musi byc uzywany wewnatrz RecipesProvider');
  }

  return context;
}

export { RecipesProvider, useRecipesContext };