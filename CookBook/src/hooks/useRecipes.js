/**
 * useRecipes.js
 * Sync między urządzeniami + obsługa offline.
 *
 * Jak działa sync:
 *  ONLINE:
 *   - add/update/delete → natychmiast do serwera → serwer zwraca dane → aktualizuj UI
 *   - co 30 sekund → GET /items → odśwież z serwera (żeby widzieć zmiany z innych urządzeń)
 *
 *  OFFLINE:
 *   - operacje zapisują się lokalnie w localStorage
 *   - trafiają do kolejki pending
 *
 *  POWRÓT INTERNETU:
 *   - kolejka odtwarzana kolejno na serwerze
 *   - pełny GET /items → zastępuje lokalne dane danymi z serwera
 *   - synced = true
 */

import { useState, useEffect, useCallback, useRef } from "react";

const API         = "https://cookbookk.onrender.com";
const RECIPES_KEY = "cookbook_recipes";
const QUEUE_KEY   = "cookbook_queue";
const DELETED_KEY = "cookbook_deleted";
const SYNCED_KEY  = "cookbook_synced";

const POLL_INTERVAL = 30_000; // co 30 sekund odśwież z serwera

// ─── localStorage ────────────────────────────────────────────────────────────

const ls = {
  get: (key, fb) => { try { return JSON.parse(localStorage.getItem(key)) ?? fb; } catch { return fb; } },
  set: (key, v)  => { try { localStorage.setItem(key, JSON.stringify(v)); } catch {} },
};

// ─── API (używa getValidToken do auto-refresh JWT) ───────────────────────────

function makeApi(getValidToken) {
  async function headers() {
    const token = await getValidToken();
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  return {
    async get(path) {
      const r = await fetch(`${API}${path}`, { headers: await headers() });
      return r.json();
    },
    async post(path, body) {
      const r = await fetch(`${API}${path}`, { method: "POST", headers: await headers(), body: JSON.stringify(body) });
      return r.json();
    },
    async put(path, body) {
      const r = await fetch(`${API}${path}`, { method: "PUT", headers: await headers(), body: JSON.stringify(body) });
      return r.json();
    },
    async del(path) {
      const r = await fetch(`${API}${path}`, { method: "DELETE", headers: await headers() });
      return r.json();
    },
  };
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useRecipes({ getValidToken }) {
  const [recipes,  setRecipes]  = useState(() => ls.get(RECIPES_KEY, []));
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [synced,   setSynced]   = useState(false);
  const [syncing,  setSyncing]  = useState(false);

  const api        = useRef(makeApi(getValidToken));
  const syncingRef = useRef(false);

  // Aktualizuj api gdy zmienia się getValidToken
  useEffect(() => { api.current = makeApi(getValidToken); }, [getValidToken]);

  // Persist lokalnie
  useEffect(() => { ls.set(RECIPES_KEY, recipes); }, [recipes]);
  useEffect(() => { ls.set(SYNCED_KEY, synced);   }, [synced]);

  // ── Pobierz wszystko z serwera ─────────────────────────────────────────────
  const fetchFromServer = useCallback(async () => {
    try {
      const res = await api.current.get("/items");
      if (res.ok) {
        setRecipes(res.data);
        setSynced(true);
        ls.set(QUEUE_KEY,   []);
        ls.set(DELETED_KEY, []);
        return true;
      }
      // 401 = token wygasł i refresh się nie powiódł → useAuth sam wyloguje
      if (res.error && res.error.includes("Token")) return false;
    } catch {}
    return false;
  }, []);

  // ── Odtwórz kolejkę offline ────────────────────────────────────────────────
  const drainQueue = useCallback(async () => {
    const queue      = ls.get(QUEUE_KEY,   []);
    const deletedIds = ls.get(DELETED_KEY, []);

    if (queue.length === 0 && deletedIds.length === 0) return true;

    // Usuń zakolejkowane
    for (const id of deletedIds) {
      try { await api.current.del(`/items/${id}`); } catch { return false; }
    }

    // Odtwórz add/update
    for (const op of queue) {
      try {
        if (op.type === "add")    await api.current.post("/items", op.payload);
        if (op.type === "update") await api.current.put(`/items/${op.payload.id}`, op.payload);
      } catch { return false; }
    }

    ls.set(QUEUE_KEY,   []);
    ls.set(DELETED_KEY, []);
    return true;
  }, []);

  // ── Pełny sync (kolejka → fetch) ──────────────────────────────────────────
  const syncWithServer = useCallback(async () => {
    if (syncingRef.current) return;
    syncingRef.current = true;
    setSyncing(true);
    try {
      await drainQueue();
      await fetchFromServer();
    } finally {
      syncingRef.current = false;
      setSyncing(false);
    }
  }, [drainQueue, fetchFromServer]);

  // ── Online/offline listeners ───────────────────────────────────────────────
  useEffect(() => {
    const goOnline  = () => { setIsOnline(true);  syncWithServer(); };
    const goOffline = () => { setIsOnline(false); setSynced(false); };
    window.addEventListener("online",  goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online",  goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, [syncWithServer]);

  // ── Sync przy montowaniu ───────────────────────────────────────────────────
  useEffect(() => {
    if (navigator.onLine) syncWithServer();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Polling co 30s — żeby widzieć zmiany z innych urządzeń ───────────────
  useEffect(() => {
    const id = setInterval(() => {
      if (navigator.onLine && !syncingRef.current) fetchFromServer();
    }, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [fetchFromServer]);

  // ── Enqueue helper ─────────────────────────────────────────────────────────
  const enqueue = useCallback((op) => {
    const queue    = ls.get(QUEUE_KEY, []);
    const filtered = queue.filter((q) => !(q.payload?.id === op.payload?.id && q.type === op.type));
    ls.set(QUEUE_KEY, [...filtered, op]);
  }, []);

  // ─── CRUD ──────────────────────────────────────────────────────────────────

  const addRecipe = useCallback(async (data) => {
    const recipe = {
      id:          crypto.randomUUID(),
      createdAt:   new Date().toISOString(),
      updatedAt:   new Date().toISOString(),
      category:    "Inne",
      ingredients: [],
      steps:       [],
      favorite:    false,
      ...data,
    };

    // Optimistic update
    setRecipes((prev) => [...prev, recipe]);
    setSynced(false);

    if (navigator.onLine) {
      try {
        const res = await api.current.post("/items", recipe);
        if (res.ok) {
          // Zastąp optimistic rekord danymi z serwera
          setRecipes((prev) => prev.map((r) => r.id === recipe.id ? res.data : r));
          setSynced(true);
          return res.data;
        }
      } catch {
        // Network error — fall through to enqueue
      }
    }

    // Offline LUB request failował — zakolejkuj
    enqueue({ type: "add", payload: recipe });
    return recipe;
  }, [enqueue]);

  const updateRecipe = useCallback(async (id, changes) => {
    const updatedAt = new Date().toISOString();

    setRecipes((prev) => prev.map((r) => r.id === id ? { ...r, ...changes, updatedAt } : r));
    setSynced(false);

    if (navigator.onLine) {
      try {
        const res = await api.current.put(`/items/${id}`, { ...changes, updatedAt });
        if (res.ok) {
          // Zastąp danymi z serwera
          setRecipes((prev) => prev.map((r) => r.id === id ? res.data : r));
          setSynced(true);
          return;
        }
      } catch {
        // Network error — fall through to enqueue
      }
    }

    // Offline LUB request failował — zakolejkuj
    enqueue({ type: "update", payload: { id, ...changes, updatedAt } });
  }, [enqueue]);

  const deleteRecipe = useCallback(async (id) => {
    setRecipes((prev) => prev.filter((r) => r.id !== id));
    setSynced(false);

    if (navigator.onLine) {
      try {
        const res = await api.current.del(`/items/${id}`);
        if (res.ok) {
          setSynced(true);
          return;
        }
      } catch {
        // Network error — fall through to enqueue
      }
    }

    // Offline LUB request failował — zapamiętaj id i zakolejkuj
    const deleted = ls.get(DELETED_KEY, []);
    if (!deleted.includes(id)) ls.set(DELETED_KEY, [...deleted, id]);
    enqueue({ type: "delete", payload: { id } });
  }, [enqueue]);

  return { recipes, addRecipe, updateRecipe, deleteRecipe, isOnline, synced, syncing, syncNow: syncWithServer };
}