import "server-only";
import { timingSafeEqual } from "node:crypto";

// Poređenje lozinke sa tajnom iz env-a bez curenja kroz vreme odgovora.
// Ako tajna nije podešena, ništa ne prolazi.
export function sameSecret(input: unknown, secret: string | undefined) {
  if (typeof input !== "string" || !secret) return false;
  const a = Buffer.from(input),
    b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

// CRM_PASSWORD_ILS, CRM_PRIVACY_PASSWORD_ILS … (id klijenta velikim slovima)
export function clientEnv(prefix: string, clientId: string) {
  return process.env[
    `${prefix}_${clientId.toUpperCase().replace(/[^A-Z0-9]/g, "_")}`
  ];
}
