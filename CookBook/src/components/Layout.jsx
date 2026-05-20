/**
 * components/Layout.jsx
 * Logika bez zmian. Sidebar po lewej + główna zawartość po prawej.
 */

import { Link, useLocation } from "react-router-dom";
import { useRecipesContext } from "../context/RecipesContext";

function SyncDot({ isOnline, synced, syncing, onSyncNow }) {
  const color = syncing   ? "bg-amber-400 animate-pulse"
    : !isOnline           ? "bg-ink-500"
    : synced              ? "bg-emerald-500"
    :                       "bg-red-400";

  const label = syncing   ? "Synchronizuję…"
    : !isOnline           ? "Offline"
    : synced              ? "Zsynchronizowano"
    :                       "Niezynchronizowane";

  return (
    <button
      onClick={isOnline && !synced && !syncing ? onSyncNow : undefined}
      className={`flex items-center gap-2 text-xs text-ink-400 hover:text-ink-200
                  transition-colors duration-200 w-full text-left
                  ${isOnline && !synced && !syncing ? "cursor-pointer" : "cursor-default"}`}
    >
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${color}`} />
      {label}
    </button>
  );
}

const NAV = [
  { to: "/",    icon: "◈", label: "Przepisy"      },
  { to: "/add", icon: "+", label: "Dodaj przepis" },
];

export function Layout({ user, onLogout, children }) {
  const { isOnline, synced, syncing, syncNow, recipes } = useRecipesContext();
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-ink-900">

      {/* ── Sidebar ── */}
      <aside className="w-64 flex-shrink-0 flex flex-col bg-ink-800/60 border-r border-ink-700/40">

        {/* Logo */}
        <div className="px-6 py-7 border-b border-ink-700/40">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🍳</span>
            <span className="font-display text-xl text-ink-50 tracking-tight">CookBook</span>
          </div>
          <p className="text-ink-500 text-xs mt-1.5 font-light">{recipes.length} przepisów</p>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-5 space-y-1">
          {NAV.map(({ to, icon, label }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm
                            transition-all duration-200 group
                            ${active
                              ? "bg-amber-400/15 text-amber-400 font-medium"
                              : "text-ink-400 hover:text-ink-100 hover:bg-ink-700/50"}`}
              >
                <span className={`text-base leading-none
                  ${active ? "text-amber-400" : "text-ink-500 group-hover:text-ink-300"}`}>
                  {icon}
                </span>
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Sync + user */}
        <div className="px-4 py-5 border-t border-ink-700/40 space-y-4">
          <SyncDot
            isOnline={isOnline} synced={synced}
            syncing={syncing}   onSyncNow={syncNow}
          />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-400/20 border border-amber-400/30
                            flex items-center justify-center text-amber-400 text-sm font-semibold flex-shrink-0">
              {user.username[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-ink-100 text-sm font-medium truncate">{user.username}</p>
            </div>
            <button
              onClick={onLogout}
              title="Wyloguj"
              className="text-ink-500 hover:text-red-400 transition-colors duration-200 text-base leading-none"
            >
              ✕
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="max-w-5xl mx-auto px-8 py-10">
          {children}
        </div>
      </main>
    </div>
  );
}