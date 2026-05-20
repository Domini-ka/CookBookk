import { Link, useLocation } from "react-router-dom";
import { useRecipesContext } from "../context/RecipesContext";

const NAV = [
  { to: "/",          icon: "🏠", label: "Przepisy"       },
  { to: "/favorites", icon: "🤍", label: "Ulubione"       },
  { to: "/add",       icon: "✏️",  label: "Nowy przepis"  },
];

function SyncDot({ isOnline, synced, syncing, onSyncNow }) {
  const color = syncing ? "bg-sky-300 animate-pulse"
    : !isOnline         ? "bg-sand-300"
    : synced            ? "bg-mint-300"
    :                     "bg-rose-300";
  const label = syncing ? "Sync…" : !isOnline ? "Offline" : synced ? "Zsync." : "Niesync.";
  return (
    <button onClick={isOnline && !synced && !syncing ? onSyncNow : undefined}
      className="flex items-center gap-1.5 text-xs text-sand-400 hover:text-sand-500 transition-colors">
      <span className={`w-2 h-2 rounded-full ${color}`} />
      {label}
    </button>
  );
}

export function Layout({ user, onLogout, children }) {
  const { isOnline, synced, syncing, syncNow, recipes } = useRecipesContext();
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-vanilla-50">

      {/* ── Sidebar ── */}
      <aside className="w-64 flex-shrink-0 flex flex-col bg-white border-r border-vanilla-200 shadow-soft">

        {/* Logo */}
        <div className="px-6 py-7">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-rose-100 rounded-2xl flex items-center justify-center text-xl shadow-soft">🍳</div>
            <span className="font-display text-xl text-cocoa-700">CookBook</span>
          </div>
          <p className="text-sand-300 text-xs ml-1 mt-1">{recipes.length} przepisów w kolekcji</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-1">
          {NAV.map(({ to, icon, label }) => {
            const active = location.pathname === to;
            return (
              <Link key={to} to={to}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold
                            transition-all duration-200
                            ${active
                              ? "bg-rose-100 text-rose-400"
                              : "text-sand-400 hover:bg-vanilla-100 hover:text-cocoa-700"}`}>
                <span className="text-base">{icon}</span>
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="px-4 py-5 border-t border-vanilla-200 space-y-3">
          <SyncDot isOnline={isOnline} synced={synced} syncing={syncing} onSyncNow={syncNow} />
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-mint-100 flex items-center justify-center
                            text-mint-300 text-sm font-bold flex-shrink-0 border border-mint-200">
              {user.username[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-cocoa-700 text-sm font-bold truncate">{user.username}</p>
            </div>
            <button onClick={onLogout} title="Wyloguj"
              className="text-sand-300 hover:text-rose-400 transition-colors text-sm">
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