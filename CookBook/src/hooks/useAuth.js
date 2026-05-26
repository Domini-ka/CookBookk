/**
 * useAuth.js
 * Hook autoryzacji JWT.
 *
 * Zwraca:
 *   user      – { id, username } lub null
 *   token     – string lub null
 *   login()   – async (username, password) → throws on error
 *   register()– async (username, password) → throws on error
 *   logout()  – czyści stan i localStorage
 *   loading   – bool (trwa request)
 *   error     – ostatni błąd lub null
 */

import { useState, useCallback } from "react";

const API = "https://cookbookk.onrender.com";
const TOKEN_KEY = "cookbook_token";
const USER_KEY  = "cookbook_user";

// ─── helpers ─────────────────────────────────────────────────────────────────

function loadFromStorage() {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const user  = JSON.parse(localStorage.getItem(USER_KEY));
    return token && user ? { token, user } : { token: null, user: null };
  } catch {
    return { token: null, user: null };
  }
}

async function authRequest(endpoint, username, password) {
  const res = await fetch(`${API}/auth/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error ?? "Błąd serwera.");
  return data.data; // { token, user }
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAuth() {
  const initial = loadFromStorage();
  const [token,   setToken]   = useState(initial.token);
  const [user,    setUser]    = useState(initial.user);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const persist = useCallback(({ token, user }) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    setToken(token);
    setUser(user);
  }, []);

  const login = useCallback(async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authRequest("login", username, password);
      persist(data);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [persist]);

  const register = useCallback(async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authRequest("register", username, password);
      persist(data);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [persist]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    // Wyczyść też dane przepisów przy wylogowaniu
    localStorage.removeItem("cookbook_recipes");
    localStorage.removeItem("cookbook_queue");
    localStorage.removeItem("cookbook_deleted");
    localStorage.removeItem("cookbook_synced");
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  return { user, token, login, register, logout, loading, error };
}