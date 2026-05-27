/**
 * Layout.jsx
 * - Desktop (md+): stały sidebar po lewej
 * - Mobile (<md):  dolny pasek nawigacji + wysuwany drawer z góry
 */

import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useRecipesContext } from "../context/RecipesContext";

const NAV = [
  { to: "/",          icon: "🏠", label: "Przepisy"      },
  { to: "/favorites", icon: "🤍", label: "Ulubione"      },
  { to: "/add",       icon: "✏️",  label: "Nowy przepis" },
];

function SyncDot({ isOnline, synced, syncing, onSyncNow }) {
  const color = syncing   ? "bg-sky-300 animate-pulse"
    : !isOnline           ? "bg-sand-300"
    : synced              ? "bg-mint-300"
    :                       "bg-rose-300";
  const label = syncing   ? "Sync…"
    : !isOnline           ? "Offline"
    : synced              ? "Zsynchronizowano"
    :                       "Niezynchronizowane";
  return (
    <button
      onClick={isOnline && !synced && !syncing ? onSyncNow : undefined}
      className="flex items-center gap-2 text-xs text-sand-400 hover:text-sand-500 transition-colors w-full text-left"
    >
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${color}`} />
      {label}
    </button>
  );
}

export function Layout({ user, onLogout, children }) {
  const { isOnline, synced, syncing, syncNow, recipes } = useRecipesContext();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Zamknij drawer przy zmianie trasy
  useEffect(() => { setDrawerOpen(false); }, [location.pathname]);

  // Zablokuj scroll gdy drawer otwarty
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const navLink = ({ to, icon, label }, onClick) => {
    const active = location.pathname === to;
    return (
      <Link key={to} to={to} onClick={onClick}
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold
                    transition-all duration-200
                    ${active
                      ? "bg-rose-100 text-rose-400"
                      : "text-sand-400 hover:bg-vanilla-100 hover:text-cocoa-700"}`}>
        <span className="text-base">{icon}</span>
        {label}
      </Link>
    );
  };

  return (
    <div className="flex min-h-screen bg-vanilla-50">

      {/* ══════════════════════════════════════
          DESKTOP SIDEBAR (md i większe)
      ══════════════════════════════════════ */}
      <aside className="hidden md:flex w-64 flex-shrink-0 flex-col bg-white
                        border-r border-vanilla-200 shadow-soft sticky top-0 h-screen">

        {/* Logo */}
        <div className="px-6 py-7 border-b border-vanilla-100">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-rose-100 rounded-2xl flex items-center justify-center text-xl shadow-soft">
              🍳
            </div>
            <span className="font-display text-xl text-cocoa-700">CookBook</span>
          </div>
          <p className="text-sand-300 text-xs ml-1 mt-1">{recipes.length} przepisów</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-hide">
          {NAV.map((item) => navLink(item))}
        </nav>

        {/* User + sync */}
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
              className="text-sand-300 hover:text-rose-400 transition-colors p-1">
              ✕
            </button>
          </div>
        </div>
      </aside>

      {/* ══════════════════════════════════════
          MOBILE — GÓRNY HEADER
      ══════════════════════════════════════ */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40
                      bg-white border-b border-vanilla-200 shadow-soft">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-xl">🍳</span>
            <span className="font-display text-lg text-cocoa-700">CookBook</span>
          </div>

          {/* Hamburger */}
          <button
            onClick={() => setDrawerOpen((v) => !v)}
            className="w-10 h-10 rounded-2xl bg-vanilla-100 flex items-center justify-center
                       text-cocoa-700 transition-all duration-200 active:bg-rose-100"
            aria-label="Menu"
          >
            <span className="text-lg">{drawerOpen ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════
          MOBILE DRAWER (wysuwa się z góry)
      ══════════════════════════════════════ */}
      {/* Overlay */}
      {drawerOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-cocoa-700/30 backdrop-blur-sm"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Drawer panel */}
      <div className={`md:hidden fixed top-[57px] left-0 right-0 z-40 bg-white
                       border-b border-vanilla-200 shadow-card
                       transition-all duration-300 ease-in-out
                       ${drawerOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"}`}>
        <div className="px-4 py-4 space-y-1">
          {NAV.map((item) => navLink(item, () => setDrawerOpen(false)))}
        </div>

        {/* User row */}
        <div className="mx-4 mb-4 pt-3 border-t border-vanilla-200 flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-mint-100 flex items-center justify-center
                          text-mint-300 text-sm font-bold flex-shrink-0 border border-mint-200">
            {user.username[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-cocoa-700 text-sm font-bold truncate">{user.username}</p>
            <SyncDot isOnline={isOnline} synced={synced} syncing={syncing} onSyncNow={syncNow} />
          </div>
          <button onClick={() => { setDrawerOpen(false); onLogout(); }}
            className="text-sand-300 hover:text-rose-400 transition-colors text-sm px-3 py-1.5
                       bg-vanilla-100 rounded-xl font-semibold">
            Wyloguj
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════
          TREŚĆ STRONY
      ══════════════════════════════════════ */}
      <main className="flex-1 min-w-0 overflow-x-hidden">
        {/* Offset pod header na mobile */}
        <div className="md:hidden h-[57px]" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-10">
          {children}
        </div>
      </main>

    </div>
  );
}