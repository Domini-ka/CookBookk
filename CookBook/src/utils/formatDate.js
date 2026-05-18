/**
 * Formatuje date do czytelnej postaci w jezyku polskim.
 * @param {string | Date} date
 * @returns {string}
 */
function formatDate(date) {
  const parsed = date instanceof Date ? date : new Date(date);

  if (isNaN(parsed.getTime())) {
    return 'Nieprawidlowa data';
  }

  return parsed.toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Zwraca czas wzgledny (np. "3 dni temu").
 * @param {string | Date} date
 * @returns {string}
 */
function timeAgo(date) {
  const parsed = date instanceof Date ? date : new Date(date);
  const diffMs = Date.now() - parsed.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'dzisiaj';
  if (diffDays === 1) return 'wczoraj';
  if (diffDays < 7) return `${diffDays} dni temu`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} tygodni temu`;

  return formatDate(parsed);
}

export { formatDate, timeAgo };
