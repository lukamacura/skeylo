// Datumi u OS-u su beogradski. Rok (date) se čuva kao "YYYY-MM-DD".

export const TZ = "Europe/Belgrade";

/** "YYYY-MM-DD" za dati trenutak u Beogradu. */
export function isoDay(d: Date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(d);
}

export function addDays(iso: string, n: number) {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Ponedeljak nedelje u kojoj je dan. */
export function weekStart(iso: string) {
  const d = new Date(`${iso}T12:00:00Z`);
  const dow = (d.getUTCDay() + 6) % 7;
  return addDays(iso, -dow);
}

export function daysBetween(a: string, b: string) {
  return Math.round(
    (Date.parse(`${b}T12:00:00Z`) - Date.parse(`${a}T12:00:00Z`)) / 86400000,
  );
}

const dayFmt = new Intl.DateTimeFormat("sr-Latn-RS", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});
const longFmt = new Intl.DateTimeFormat("sr-Latn-RS", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** "Danas", "Sutra", "Juče" ili "pon 14. okt". */
export function dueLabel(iso: string, today = isoDay()) {
  const diff = daysBetween(today, iso);
  if (diff === 0) return "Danas";
  if (diff === 1) return "Sutra";
  if (diff === -1) return "Juče";
  return dayFmt.format(new Date(`${iso}T12:00:00Z`));
}

export function longDate(iso: string) {
  return longFmt.format(new Date(`${iso}T12:00:00Z`));
}

/** "2026-10" -> "Oktobar 2026". */
export function monthLabel(ym: string) {
  const s = new Intl.DateTimeFormat("sr-Latn-RS", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${ym}-15T12:00:00Z`));
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function addMonths(ym: string, n: number) {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + n, 15));
  return d.toISOString().slice(0, 7);
}
