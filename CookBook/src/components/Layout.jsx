/**
 * components/Layout.jsx
 * Wspólny layout: nagłówek z nawigacją + SyncStatus + slot na stronę.
 */

import { Link, useLocation } from "react-router-dom";
import { useRecipesContext } from "../context/RecipesContext";

function SyncStatus({ isOnline, synced, syncing, onSyncNow }) {
  const label = syncing
    ? "⏳ Synchronizuję..."
    : !isOnline
    ? "📴 Offline"
    : synced
    ? "✅ Zsynchronizowano"
    : "⚠️ Niezynchronizowane";

  return (
    <span>
      {" | "}{label}
      {isOnline && !synced && !syncing && (
        <> <button onClick={onSyncNow}>Sync</button></>
      )}
    </span>
  );
}

export function Layout({ user, onLogout, children }) {
  const { isOnline, synced, syncing, syncNow } = useRecipesContext();
  const location = useLocation();

  const navLink = (to, label) => (
    <Link
      to={to}
      style={{ fontWeight: location.pathname === to ? "bold" : "normal" }}
    >
      {label}
    </Link>
  );

  return (
    <div>
      {/* ── Nagłówek ── */}
      <header>
        <strong>🍳 CookBook</strong>
        {" | "}
        {navLink("/", "Przepisy")}
        {" | "}
        {navLink("/add", "Dodaj przepis")}
        {" | "}
        <span>
          {user.username}{" "}
          <button onClick={onLogout}>Wyloguj</button>
        </span>
        <SyncStatus
          isOnline={isOnline}
          synced={synced}
          syncing={syncing}
          onSyncNow={syncNow}
        />
      </header>

      <hr />

      {/* ── Treść strony ── */}
      <main>{children}</main>
    </div>
  );
}