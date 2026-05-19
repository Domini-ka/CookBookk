/**
 * pages/LoginPage.jsx
 * Strona logowania / rejestracji.
 * Jeśli użytkownik już zalogowany → przekierowanie do /.
 */

import { Navigate } from "react-router-dom";
import { AuthForm } from "../components/AuthForm";

export function LoginPage({ user, onLogin, onRegister, loading, error }) {
  if (user) return <Navigate to="/" replace />;

  return (
    <AuthForm
      onLogin={onLogin}
      onRegister={onRegister}
      loading={loading}
      error={error}
    />
  );
}