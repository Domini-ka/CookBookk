/**
 * components/ProtectedRoute.jsx
 * Czeka na zakończenie weryfikacji auth przed decyzją o przekierowaniu.
 * Bez tego ProtectedRoute widzi user=null przez chwilę i robi fałszywy redirect.
 */

import { Navigate } from "react-router-dom";

export function ProtectedRoute({ user, isAuthLoading, children }) {
  // Trwa weryfikacja /auth/me — pokaż spinner, nie rób nic
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-vanilla-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">🍳</div>
          <p className="text-sand-400 text-sm font-medium">Ładowanie…</p>
        </div>
      </div>
    );
  }

  // Weryfikacja skończona — brak usera → login
  if (!user) return <Navigate to="/login" replace />;

  return children;
}