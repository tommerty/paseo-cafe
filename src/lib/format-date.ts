const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]

function pad(n: number): string {
  return String(n).padStart(2, "0")
}

/**
 * `toLocaleDateString()`/`toLocaleString()` depend on the runtime's ICU data
 * and locale, which can (and did) differ between the Node SSR render and the
 * browser hydrating it, producing a React hydration mismatch. These format
 * dates by hand instead, using UTC fields, so the output is identical
 * everywhere regardless of server/browser locale or timezone.
 */
export function formatDate(iso: string): string {
  const d = new Date(iso)
  return `${pad(d.getUTCDate())} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso)
  return `${formatDate(iso)}, ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())} UTC`
}
