/**
 * App.jsx
 * Główny plik aplikacji.
 * Odpowiada za: autoryzację JWT + React Router + RecipesContext.
 *
 * Trasy:
 *   /login          – logowanie / rejestracja (publiczna)
 *   /               – lista przepisów (chroniona)
 *   /add            – dodaj przepis (chroniona)
 *   /recipe/:id     – szczegóły przepisu (chroniona)
 *   *               – 404
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { RecipesProvider } from "./context/RecipesContext";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { RecipesPage } from "./pages/RecipesPage";
import { AddRecipePage } from "./pages/AddRecipePage";
import { RecipeDetailPage } from "./pages/RecipeDetailPage";
import { NotFoundPage } from "./pages/NotFoundPage";

export default function App() {
  const { user, token, login, register, logout, loading, error } = useAuth();

  return (
    <BrowserRouter>
      <Routes>

        {/* ── Publiczna ── */}
        <Route
          path="/login"
          element={
            <LoginPage
              user={user}
              onLogin={login}
              onRegister={register}
              loading={loading}
              error={error}
            />
          }
        />

        {/* ── Chronione — wymagają zalogowania ── */}
        <Route
          path="/*"
          element={
            <ProtectedRoute user={user}>
              {/* RecipesProvider musi być wewnątrz ProtectedRoute
                  żeby hook useRecipes uruchomił się tylko po zalogowaniu */}
              <RecipesProvider>
                <Layout user={user} onLogout={logout}>
                  <Routes>
                    <Route path="/"           element={<RecipesPage />} />
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