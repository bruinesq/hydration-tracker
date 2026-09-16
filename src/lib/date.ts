/**
 * Day-boundary helpers, all based on the BROWSER's local timezone.
 *
 * Why this matters: the server (Render) generally runs in UTC, but "today"
 * for a household hydration tracker should mean the user's own calendar
 * day, not UTC's. So day boundaries are always computed here (client-side)
 * and sent to the API as explicit epoch milliseconds - the server never
 * tries to guess the user's timezone.
 */

/** Epoch ms for the start (00:00:00.000) of the given date's local day. */
export function localDayStartMs(d: Date = new Date()): number {
  const start = new Date(d);
  start.setHours(0, 0, 0, 0);
  return start.getTime();
}

/** "YYYY-MM-DD" for the given date, in the browser's local timezone. */
export function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** A short, friendly label like "Mon, Sep 15" for a local date key. */
export function formatDateLabel(dateKey: string): string {
  // Parse as a local date (not UTC) by supplying explicit y/m/d.
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}
