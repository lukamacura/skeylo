// Boje OS-a. Dva sloja koji se nikad ne mešaju:
//  1. Boja osobe (os.people.color) = čiji je potez.
//  2. Boja stanja (STATE) = da li je sve u redu.
// Narandžasta je rezervisana za Skeylo (centar sistema), zato je nema ni u jednom od ta dva sloja.

export const OS = {
  bg: "#0a0a0c",
  surface: "#141417",
  surface2: "#1c1c21",
  line: "rgba(255,255,255,0.08)",
  lineStrong: "rgba(255,255,255,0.14)",
  text: "#f2f2f4",
  muted: "#8e8e96",
  faint: "#5a5a62",
  brand: "#e07a2c",
} as const;

export const STATE = {
  /** Gotovo, prihod, profit, slobodno. */
  ok: "#30d158",
  /** Danas, uskoro rok, traži pažnju. */
  attention: "#ffd60a",
  /** Kasni, rashod, nedostupno. */
  late: "#ff453a",
  /** Nije počelo. */
  idle: "#8e8e93",
} as const;

export type StateKey = keyof typeof STATE;

export const STATE_LABEL: Record<StateKey, string> = {
  ok: "Gotovo · prihod · profit",
  attention: "Danas · uskoro rok",
  late: "Kasni · rashod · nedostupno",
  idle: "Nije počelo",
};

/** Kritično prigušena opruga — podrazumevani pokret u celom OS-u. */
export const SPRING = {
  type: "spring",
  bounce: 0,
  visualDuration: 0.3,
} as const;

export const rsd = new Intl.NumberFormat("sr-RS", {
  style: "currency",
  currency: "RSD",
  maximumFractionDigits: 0,
});
