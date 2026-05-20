import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { RecipesProvider } from "./context/RecipesContext";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { RecipesPage } from "./pages/RecipesPage";
import { FavoritesPage } from "./pages/FavoritesPage";
import { AddRecipePage } from "./pages/AddRecipePage";
import { RecipeDetailPage } from "./pages/RecipeDetailPage";
import { NotFoundPage } from "./pages/NotFoundPage";

export default function App() {
  const { user, token, login, register, logout, loading, error } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"
          element={<LoginPage user={user} onLogin={login} onRegister={register} loading={loading} error={error} />} />
        <Route path="/*"
          element={
            <ProtectedRoute user={user}>
              <RecipesProvider>
                <Layout user={user} onLogout={logout}>
                  <Routes>
                    <Route path="/"           element={<RecipesPage />} />
                    <Route path="/favorites"  element={<FavoritesPage />} />
                    <Route path="/add"        element={<AddRecipePage />} />
                    <Route path="/recipe/:id" element={<RecipeDetailPage />} />
                    <Route path="*"           element={<NotFoundPage />} />
                  </Routes>
                </Layout>
              </RecipesProvider>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}