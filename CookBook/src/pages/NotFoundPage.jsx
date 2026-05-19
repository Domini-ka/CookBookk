/**
 * pages/NotFoundPage.jsx
 * Trasa: * (404)
 */

import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <section>
      <h2>404 — Nie znaleziono strony</h2>
      <p><Link to="/">← Wróć do listy przepisów</Link></p>
    </section>
  );
}