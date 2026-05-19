/**
 * useRecipes.js
 * Custom hook z obsługą offline/online sync.
 *
 * Algorytm:
 *  1. Każda mutacja (add/update/delete) zapisuje się w localStorage od razu.
 *  2. Jeśli jesteśmy online → wysyłamy do backendu natychmiast.
 *  3. Jeśli offline → operacja trafia do kolejki (pendingQueue w localStorage).
 *  4. Gdy wraca internet → kolejka jest odtwarzana po kolei, potem robimy
 *     pełny /sync żeby wyrównać stan z serwerem.
 *  5. Stan `synced` (bool) informuje UI czy lokalne dane są zsynchronizowane.
 */

import { useState, useEffect, useCallback, useRef } from "react";

const API = "http://localhost:3001";
const RECIPES_KEY  = "cookbook_recipes";
const QUEUE_KEY    = "cookbook_queue";    // operacje czekające na sync
const DELETED_KEY  = "cookbook_deleted";  // id usunięte offline
const SYNCED_KEY   = "cookbook_synced";   // bool

// ─── localStorage helpers ────────────────────────────────────────────────────

const ls = {
  get(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  },
};

// ─── API calls ───────────────────────────────────────────────────────────────

function authHeaders() {
  const token = localStorage.getItem("cookbook_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

const api = {
  async post(path, body) {
    const r = await fetch(`${API}${path}`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(body),
    });
    return r.json();
  },
  async put(path, body) {
    const r = await fetch(`${API}${path}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(body),
    });
    return r.json();
  },
  async del(path) {
    const r = await fetch(`${API}${path}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    return r.json();
  },
  async sync(recipes, deletedIds = []) {
    const r = await fetch(`${API}/sync`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ recipes, deletedIds }),
    });
    return r.json();
  },
};

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useRecipes() {
  const [recipes, setRecipes]   = useState(() => ls.get(RECIPES_KEY, []));
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [synced, setSynced]     = useState(() => ls.get(SYNCED_KEY, true));
  const [syncing, setSyncing]   = useState(false);

  // ref żeby drainQueue miało zawsze świeży stan recipes bez zależności cyklicznych
  const recipesRef = useRef(recipes);
  recipesRef.current = recipes;

  // ── Persist to localStorage ─────────────────────────────────────────────────
  useEffect(() => { ls.set(RECIPES_KEY, recipes); }, [recipes]);
  useEffect(() => { ls.set(SYNCED_KEY, synced); }, [synced]);

  // ── Enqueue an operation when offline ──────────────────────────────────────
  const enqueue = useCallback((op) => {
    const queue = ls.get(QUEUE_KEY, []);
    // Deduplicate: collapse same type+id into one entry
    const filtered = queue.filter(
      (q) => !(q.payload?.id === op.payload?.id && q.type === op.type)
    );
    ls.set(QUEUE_KEY, [...filtered, op]);
  }, []);

  // ── Drain queue → replay each op against backend ───────────────────────────
  const drainQueue = useCallback(async () => {
    const queue = ls.get(QUEUE_KEY, []);
    if (!queue.length) return true;

    for (const op of queue) {
      try {
        if (op.type === "add")    await api.post("/items", op.payload);
        if (op.type === "update") await api.put(`/items/${op.payload.id}`, op.payload);
        if (op.type === "delete") await api.del(`/items/${op.payload.id}`);
      } catch {
        return false; // still offline — stop, leave queue intact
      }
    }

    ls.set(QUEUE_KEY, []);
    return true;
  }, []);

  // ── Full sync: drain queue → POST /sync → replace local state ──────────────
  const syncWithServer = useCallback(async () => {
    if (syncing) return;
    setSyncing(true);
    try {
      const drained = await drainQueue();
      if (!drained) return;

      const deletedIds = ls.get(DELETED_KEY, []);
      const res = await api.sync(recipesRef.current, deletedIds);
      if (res.ok) {
        setRecipes(res.data);
        setSynced(true);
        ls.set(DELETED_KEY, []); // wyczyść po udanym sync
      }
    } catch {
      // Server unreachable — try again on next online event
    } finally {
      setSyncing(false);
    }
  }, [drainQueue, syncing]);

  // ── Online / offline listeners ──────────────────────────────────────────────
  useEffect(() => {
    const goOnline = () => {
      setIsOnline(true);
      syncWithServer();
    };
    const goOffline = () => setIsOnline(false);

    window.addEventListener("online",  goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online",  goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, [syncWithServer]);

  // ── On mount: if online, sync immediately ──────────────────────────────────
  useEffect(() => {
    if (navigator.onLine) syncWithServer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── CRUD ─────────────────────────────────────────────────────────────────

  const addRecipe = useCallback(async (data) => {
    const recipe = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      category: "Inne",
      ingredients: [],
      steps: [],
      ...data,
    };

    // Optimistic update — UI reaguje natychmiast
    setRecipes((prev) => [...prev, recipe]);
    setSynced(false);

    if (isOnline) {
      try {
        const res = await api.post("/items", recipe);
        if (res.ok) {
          setRecipes((prev) => prev.map((r) => (r.id === recipe.id ? res.data : r)));
          setSynced(true);
          return res.data;
        }
      } catch {}
    }

    enqueue({ type: "add", payload: recipe });
    return recipe;
  }, [isOnline, enqueue]);

  const updateRecipe = useCallback(async (id, changes) => {
    const updatedAt = new Date().toISOString();
    setRecipes((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...changes, updatedAt } : r))
    );
    setSynced(false);

    const payload = { id, ...changes, updatedAt };

    if (isOnline) {
      try {
        const res = await api.put(`/items/${id}`, payload);
        if (res.ok) { setSynced(true); return; }
      } catch {}
    }

    enqueue({ type: "update", payload });
  }, [isOnline, enqueue]);

  const deleteRecipe = useCallback(async (id) => {
    setRecipes((prev) => prev.filter((r) => r.id !== id));
    setSynced(false);

    if (isOnline) {
      try {
        const res = await api.del(`/items/${id}`);
        if (res.ok) { setSynced(true); return; }
      } catch {}
    }

    // Zapamiętaj id do wysłania przy następnym sync
    const deleted = ls.get(DELETED_KEY, []);
    if (!deleted.includes(id)) ls.set(DELETED_KEY, [...deleted, id]);
    enqueue({ type: "delete", payload: { id } });
  }, [isOnline, enqueue]);

  return {
    recipes,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    isOnline,   // czy przeglądarka ma sieć
    synced,     // czy lokalne dane === serwer
    syncing,    // trwa właśnie sync
    syncNow: syncWithServer, // ręczny trigger
  };
}