import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <p className="font-display text-8xl text-ink-700 mb-4">404</p>
      <h2 className="font-display text-2xl text-ink-300 mb-2">Nie znaleziono strony</h2>
      <p className="text-ink-500 text-sm mb-8">Ta strona nie istnieje lub została przeniesiona.</p>
      <Link
        to="/"
        className="bg-amber-400 hover:bg-amber-500 text-ink-900 font-semibold
                   px-6 py-3 rounded-xl transition-all duration-200 hover:shadow-glow text-sm"
      >
        ← Wróć do listy przepisów
      </Link>
    </div>
  );
}