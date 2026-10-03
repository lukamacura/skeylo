// Zajednički podaci za MT-Komex landing (obračun za primere, formatiranje).
// Obračun koristi isti model kao naš kalkulator uštede (src/lib/solar.ts), tip "pravno".

import {
  EUR_RSD,
  calculate,
  num,
  type RegionId,
  type SolarResult,
  type UsageId,
} from "@/lib/solar";

export const AMBER = "#fbae17";
export const PHONE = "+381 11 770 45 66";
export const PHONE_HREF = "tel:+381117704566";
export const EMAIL = "info@mt-komex.co.rs";

export type SpaceType = "krov" | "zemljiste";
export type RoofKind = "ravan" | "kosi" | "neznam";
export type BillUnit = "eur" | "rsd" | "kwh";

export interface CalcInput {
  /** Kada objekat troši struju — određuje koliko solarne proizvodnje ide direktno u potrošnju. */
  usage: UsageId;
  region: RegionId;
  billUnit: BillUnit;
  bill: number;
  space: SpaceType;
  area: number;
  roof: RoofKind;
}

export function compute(input: CalcInput): SolarResult {
  // Zemljište i ravan krov: paneli se postavljaju ka jugu na potkonstrukciji.
  const flat = input.space === "zemljiste" || input.roof === "ravan";
  return calculate({
    billUnit: input.billUnit === "kwh" ? "kwh" : "rsd",
    billValue:
      input.billUnit === "eur" ? input.bill * EUR_RSD : Math.max(0, input.bill),
    type: "pravno",
    area: input.area,
    floors: 1,
    roof: flat ? "ravan" : "kos",
    orientation: "jugoistok",
    region: input.region,
    usage: input.usage,
    extras: [],
    subsidy: 0,
  });
}

/** RSD → zaokruženi evri, da procena ne deluje lažno precizno. */
export function euro(rsd: number): string {
  const v = rsd / EUR_RSD;
  const step = v >= 100_000 ? 1_000 : v >= 10_000 ? 100 : 10;
  return `${num(Math.round(v / step) * step)} €`;
}

export function euroValue(rsd: number): number {
  return rsd / EUR_RSD;
}

export function yearsText(v: number | null): string {
  if (v === null) return "—";
  const r = Math.round(v * 10) / 10;
  return num(r, Number.isInteger(r) ? 0 : 1);
}

export function kwText(kwp: number): string {
  return num(Math.round(kwp));
}

export function scrollToId(id: string) {
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}
