/** Shared formatting helpers used across the results and history screens. */

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
});

/** Human-readable date/time; falls back to the raw string if unparseable. */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : dateFormatter.format(date);
}

/** A whole-number percent, e.g. 83. */
export function formatPercent(percentage: number): string {
  return `${Math.round(percentage)}%`;
}

/** "4 / 5" */
export function formatScore(score: number, total: number): string {
  return `${score} / ${total}`;
}

/** "4 / 5 · 80%" — the compact score line used in history lists. */
export function formatScoreLine(score: number, total: number, percentage: number): string {
  return `${formatScore(score, total)} · ${formatPercent(percentage)}`;
}

/** "3 attempts" / "1 attempt" */
export function pluralizeAttempts(count: number): string {
  return `${count} attempt${count === 1 ? '' : 's'}`;
}
