/**
 * useAuth.js
 * Autoryzacja JWT z automatycznym odświeżaniem tokena.
 *
 * Jak działa zapamiętywanie:
 *  - Po logowaniu zapisujemy access token (15 min) i refresh token (30 dni)
 *  - Przed każdym requestem sprawdzamy czy access token nie wygasł
 *  - Jeśli wygasł → automatycznie pobieramy nowy używając refresh tokena
 *  - Refresh token żyje 30 dni → przez 30 dni nie trzeba się logować ponownie
 *  - Ten sam refresh token działa na telefonie i komputerze (osobne tokeny per urządzenie)
 */

import { useState, useCallback, useRef } from "react";

const API           = "https://cookbookk.onrender.com";
const TOKEN_KEY     = "cookbook_token";
const REFRESH_KEY   = "cookbook_refresh_token";
const USER_KEY      = "cookbook_user";
const TOKEN_EXP_KEY = "cookbook_token_exp"; // timestamp wygaśnięcia access tokena

// ─── helpers ─────────────────────────────────────────────────────────────────

function loadFromStorage() {
  try {
    const token        = localStorage.getItem(TOKEN_KEY);
    const refreshToken = localStorage.getItem(REFRESH_KEY);
    const user         = JSON.parse(localStorage.getItem(USER_KEY));
    return token && user ? { token, refreshToken, user } : { token: null, refreshToken: null, user: null };
  } catch {
    return { token: null, refreshToken: null, user: null };
  }
}

function saveToStorage({ token, refreshToken, user }) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);

  // Zdekoduj czas wygaśnięcia z JWT (bez weryfikacji — tylko odczyt)
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    localStorage.setItem(TOKEN_EXP_KEY, String(payload.exp * 1000)); // ms
  } catch {}
}

function clearStorage() {
  [TOKEN_KEY, REFRESH_KEY, USER_KEY, TOKEN_EXP_KEY,
   "cookbook_recipes", "cookbook_queue", "cookbook_deleted", "cookbook_synced"
  ].forEach((k) => localStorage.removeItem(k));
}

function isTokenExpired() {
  const exp = Number(localStorage.getItem(TOKEN_EXP_KEY) ?? 0);
  // Odśwież 60 sekund przed faktycznym wygaśnięciem
  return Date.now() > exp - 60_000;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAuth() {
  const initial = loadFromStorage();
  const [token,   setToken]   = useState(initial.token);
  const [user,    setUser]    = useState(initial.user);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  // Zapobiegamy równoległym wywołaniom refresh
  const refreshingRef = useRef(false);

  // ── Odśwież access token ───────────────────────────────────────────────────
  const refreshAccessToken = useCallback(async () => {
    if (refreshingRef.current) return null;
    const refreshToken = localStorage.getItem(REFRESH_KEY);
    if (!refreshToken) return null;

    refreshingRef.current = true;
    try {
      const res  = await fetch(`${API}/auth/refresh`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ refreshToken }),
      });
      const data = await res.json();

      if (data.ok) {
        saveToStorage(data.data);
        setToken(data.data.token);
        setUser(data.data.user);
        return data.data.token;
      } else {
        // Refresh token wygasł — wyloguj
        clearStorage();
        setToken(null);
        setUser(null);
        return null;
      }
    } catch {
      return null;
    } finally {
      refreshingRef.current = false;
    }
  }, []);

  /**
   * Zwraca aktualny (świeży) access token.
   * Jeśli wygasł → automatycznie odświeża przed zwróceniem.
   * Używane przez useRecipes do każdego requestu API.
   */
  const getValidToken = useCallback(async () => {
    if (isTokenExpired()) {
      return await refreshAccessToken();
    }
    return localStorage.getItem(TOKEN_KEY);
  }, [refreshAccessToken]);

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = useCallback(async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(`${API}/auth/login`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error ?? "Błąd serwera.");
      saveToStorage(data.data);
      setToken(data.data.token);
      setUser(data.data.user);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Register ───────────────────────────────────────────────────────────────
  const register = useCallback(async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(`${API}/auth/register`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error ?? "Błąd serwera.");
      saveToStorage(data.data);
      setToken(data.data.token);
      setUser(data.data.user);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem(REFRESH_KEY);
    // Powiadom serwer (fire & forget)
    if (refreshToken) {
      fetch(`${API}/auth/logout`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ refreshToken }),
      }).catch(() => {});
    }
    clearStorage();
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  return { user, token, login, register, logout, loading, error, getValidToken };
}