const DAY_MS = 86_400_000;

export function today() {
  return new Date().toISOString().slice(0, 10);
}

export function daysAgo(n) {
  return new Date(Date.now() - n * DAY_MS).toISOString().slice(0, 10);
}

/** "2026-04" from "2026-04-25". */
export function monthOf(iso) {
  return iso.slice(0, 7);
}

/** Sun (0) and Sat (6) — used by the insights skill for weekend overspend. */
export function isWeekend(iso) {
  const d = new Date(iso).getDay();
  return d === 0 || d === 6;
}

/** Number of days between two ISO date strings (positive if a > b). */
export function daysBetween(a, b) {
  return Math.round((new Date(a) - new Date(b)) / DAY_MS);
}

/** First and last ISO date in `transactions` (or [today, today] if empty). */
export function dateRange(transactions) {
  if (transactions.length === 0) {
    const t = today();
    return [t, t];
  }
  const sorted = [...transactions].sort((a, b) => (a.date < b.date ? -1 : 1));
  return [sorted[0].date, sorted[sorted.length - 1].date];
}
