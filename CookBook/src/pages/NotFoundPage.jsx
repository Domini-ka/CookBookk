import { Link } from "react-router-dom";
export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <p className="font-display text-8xl text-vanilla-200 mb-4">404</p>
      <h2 className="font-display text-2xl text-cocoa-700 mb-2">Nie znaleziono strony</h2>
      <p className="text-sand-400 text-sm mb-8">Ta strona nie istnieje.</p>
      <Link to="/" className="bg-rose-300 hover:bg-rose-400 text-white font-bold
                               px-6 py-3 rounded-2xl transition-all duration-200 shadow-soft text-sm">
        ← Wróć do przepisów
      </Link>
    </div>
  );
}