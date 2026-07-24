// CRM pipeline konfiguracija — jedini izvor istine za statuse i vrednost leada.
import { PACKAGES } from "@/lib/packages";

export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "proposal"
  | "won"
  | "lost";

export type StatusMeta = {
  id: LeadStatus;
  label: string;
  color: string;
  /** Aktivni pipeline (broji se u "u pregovorima" sumi). */
  active: boolean;
};

export const LEAD_STATUSES: StatusMeta[] = [
  { id: "new", label: "Novo", color: "#64748b", active: true },
  { id: "contacted", label: "Kontaktirano", color: "#f0b656", active: true },
  { id: "qualified", label: "Kvalifikovan", color: "#6366f1", active: true },
  { id: "proposal", label: "Ponuda poslata", color: "#a855f7", active: true },
  { id: "won", label: "Zatvoreno", color: "#10b981", active: false },
  { id: "lost", label: "Izgubljeno", color: "#ef4444", active: false },
];

export const STATUS_IDS = LEAD_STATUSES.map((s) => s.id);

export function statusMeta(id: string): StatusMeta {
  return LEAD_STATUSES.find((s) => s.id === id) ?? LEAD_STATUSES[0];
}

export function isLeadStatus(v: unknown): v is LeadStatus {
  return typeof v === "string" && STATUS_IDS.includes(v as LeadStatus);
}

// type "creative-engine-quiz" -> paket -> cena (EUR)
export function packageForType(type: string) {
  const slug = type.replace(/-quiz$/, "");
  return PACKAGES.find((p) => p.slug === slug);
}

/** Vrednost posla: ručni override (value) ili cena paketa iz kviza. */
export function leadValue(lead: {
  type: string;
  value?: number | null;
}): number {
  if (typeof lead.value === "number" && lead.value > 0) return lead.value;
  return packageForType(lead.type)?.price ?? 0;
}

/** Dodatni prihod od klijenta nakon prve prodaje (nove kreative, retainer, sledeći tier). */
export type RevenueEntry = {
  id: string;
  label: string;
  amount: number;
  date: string; // ISO
};

export function isRevenueEntry(v: unknown): v is RevenueEntry {
  if (!v || typeof v !== "object") return false;
  const e = v as Record<string, unknown>;
  return (
    typeof e.id === "string" &&
    typeof e.label === "string" &&
    typeof e.amount === "number" &&
    typeof e.date === "string"
  );
}

export function isRevenueArray(v: unknown): v is RevenueEntry[] {
  return Array.isArray(v) && v.every(isRevenueEntry);
}

/** Zbir dodatnih prihoda (line-items). */
export function sumRevenue(revenue?: RevenueEntry[] | null): number {
  if (!Array.isArray(revenue)) return 0;
  return revenue.reduce((s, e) => s + (Number(e.amount) || 0), 0);
}

/** Ukupna vrednost klijenta: osnovni posao + svi dodatni prihodi. */
export function leadTotal(lead: {
  type: string;
  value?: number | null;
  revenue?: RevenueEntry[] | null;
}): number {
  return leadValue(lead) + sumRevenue(lead.revenue);
}

export const formatEur = (n: number) =>
  `${new Intl.NumberFormat("sr-RS").format(n)} €`;
