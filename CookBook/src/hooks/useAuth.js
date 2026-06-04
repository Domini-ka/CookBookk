/**
 * hooks/useAuth.js
 * Stabilna autoryzacja JWT:
 *  - Na starcie: GET /auth/me weryfikuje token z localStorage
 *  - isAuthLoading = true dopóki weryfikacja nie skończy
 *  - ProtectedRoute czeka na wynik zamiast od razu robić redirect
 *  - Access token (15 min) odświeżany automatycznie przez refresh token (30 dni)
 */

import { useState, useCallback, useRef, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001";
const TOKEN_KEY     = "cookbook_token";
const REFRESH_KEY   = "cookbook_refresh_token";
const USER_KEY      = "cookbook_user";
const TOKEN_EXP_KEY = "cookbook_token_exp";

// ─── localStorage helpers ─────────────────────────────────────────────────────

function loadFromStorage() {
  try {
    const token        = localStorage.getItem(TOKEN_KEY);
    const refreshToken = localStorage.getItem(REFRESH_KEY);
    const user         = JSON.parse(localStorage.getItem(USER_KEY));
    return token && user
      ? { token, refreshToken, user }
      : { token: null, refreshToken: null, user: null };
  } catch {
    return { token: null, refreshToken: null, user: null };
  }
}

function saveToStorage({ token, refreshToken, user }) {
  localStorage.setItem(TOKEN_KEY,  token);
  localStorage.setItem(USER_KEY,   JSON.stringify(user));
  if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    localStorage.setItem(TOKEN_EXP_KEY, String(payload.exp * 1000));
  } catch {}
}

function clearStorage() {
  [TOKEN_KEY, REFRESH_KEY, USER_KEY, TOKEN_EXP_KEY,
   "cookbook_recipes", "cookbook_queue", "cookbook_deleted", "cookbook_synced",
  ].forEach((k) => localStorage.removeItem(k));
}

function isTokenExpired() {
  const exp = Number(localStorage.getItem(TOKEN_EXP_KEY) ?? 0);
  return Date.now() > exp - 60_000; // odśwież 60s przed wygaśnięciem
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAuth() {
  const initial = loadFromStorage();

  const [token,          setToken]          = useState(initial.token);
  const [user,           setUser]           = useState(initial.user);
  const [loading,        setLoading]        = useState(false);  // login/register spinner
  const [error,          setError]          = useState(null);
  const [isAuthLoading,  setIsAuthLoading]  = useState(true);  // weryfikacja przy starcie

  const refreshingRef = useRef(false);

  // ── Odśwież access token ────────────────────────────────────────────────────
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
      }
      clearStorage();
      setToken(null);
      setUser(null);
      return null;
    } catch {
      return null;
    } finally {
      refreshingRef.current = false;
    }
  }, []);

  // ── Weryfikacja przy starcie aplikacji ─────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function verifyOnMount() {
      const { token: savedToken, user: savedUser } = loadFromStorage();

      // Brak tokena w localStorage → od razu pokaż login
      if (!savedToken || !savedUser) {
        setIsAuthLoading(false);
        return;
      }

      // Token jest — jeśli nie wygasł, sprawdź go przez GET /auth/me
      try {
        let currentToken = savedToken;

        // Jeśli wygasł — spróbuj odświeżyć zanim zrobisz /auth/me
        if (isTokenExpired()) {
          const refreshToken = localStorage.getItem(REFRESH_KEY);
          if (refreshToken) {
            const res  = await fetch(`${API}/auth/refresh`, {
              method:  "POST",
              headers: { "Content-Type": "application/json" },
              body:    JSON.stringify({ refreshToken }),
            });
            const data = await res.json();
            if (data.ok) {
              saveToStorage(data.data);
              currentToken = data.data.token;
              if (!cancelled) {
                setToken(data.data.token);
                setUser(data.data.user);
              }
            } else {
              // Refresh wygasł — wyloguj
              clearStorage();
              if (!cancelled) { setToken(null); setUser(null); }
              if (!cancelled) setIsAuthLoading(false);
              return;
            }
          } else {
            clearStorage();
            if (!cancelled) { setToken(null); setUser(null); }
            if (!cancelled) setIsAuthLoading(false);
            return;
          }
        }

        // Weryfikuj token przez /auth/me
        const meRes  = await fetch(`${API}/auth/me`, {
          headers: { Authorization: `Bearer ${currentToken}` },
        });
        const meData = await meRes.json();

        if (!cancelled) {
          if (meData.ok) {
            // Token prawidłowy — ustaw user z odpowiedzi serwera (najświeższe dane)
            setUser(meData.data);
            setToken(currentToken);
          } else {
            // Token nieprawidłowy (np. serwer był zrestartowany) → wyloguj
            clearStorage();
            setToken(null);
            setUser(null);
          }
        }
      } catch {
        // Brak połączenia z serwerem — użyj danych z localStorage bez weryfikacji
        // (pozwala działać offline)
        if (!cancelled) {
          setToken(savedToken);
          setUser(savedUser);
        }
      } finally {
        if (!cancelled) setIsAuthLoading(false);
      }
    }

    verifyOnMount();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── getValidToken — używane przez useRecipes ────────────────────────────────
  const getValidToken = useCallback(async () => {
    if (isTokenExpired()) return await refreshAccessToken();
    return localStorage.getItem(TOKEN_KEY);
  }, [refreshAccessToken]);

  // ── Login ───────────────────────────────────────────────────────────────────
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

  // ── Register ────────────────────────────────────────────────────────────────
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

  // ── Logout ──────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem(REFRESH_KEY);
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

  return {
    user,
    token,
    login,
    register,
    logout,
    loading,
    error,
    isAuthLoading,  // ← kluczowe: true dopóki /auth/me nie skończy
    getValidToken,
  };
}