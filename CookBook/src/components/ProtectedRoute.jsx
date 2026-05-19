/**
 * components/ProtectedRoute.jsx
 * Jeśli użytkownik nie jest zalogowany → przekierowanie do /login.
 */

import { Navigate } from "react-router-dom";

export function ProtectedRoute({ user, children }) {
  if (!user) return <Navigate to="/login" replace />;
  return children;
}