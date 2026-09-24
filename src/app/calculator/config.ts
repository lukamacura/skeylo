// app/calculator/config.ts
// Čita URL query parametre da bi se kalkulator "brendirao" za bilo koju
// firmu u hodu:  /calculator?company=Austin+Pro+Roofing&city=Austin&phone=5125550199&color=%23c2410c

export interface ContractorConfig {
  companyName: string;
  /** null kada je ?phone=none — sakriva sve "Call" linkove (firma bez telefona). */
  phone: string | null;
  city: string;
  primaryColor: string;
  /** Opciono: URL transparentnog PNG logoa (?logo=https://...). */
  logoUrl: string | null;
  /** ?logobg=1 — logo je beo/svetao pa ga stavljamo na plocicu u brend boji. */
  logoBg: boolean;
  /** ?embed=1 — kompaktniji layout za <iframe> na sajtu klijenta. */
  embed: boolean;
  /** ?notify=owner@firma.com — ko dobija lead notifikaciju (fallback: env CALCULATOR_NOTIFY_EMAIL). */
  notifyEmail: string | null;
  /** ?sms=6825550199 — mobilni vlasnika za SMS lead alert (radi samo uz Twilio env). */
  notifySms: string | null;
  /** ?prices=monthly — za firme koje ne žele da pokažu ukupnu cenu: prikazuje samo "from $X/mo". */
  priceMode: "range" | "monthly";
}

export type SearchParams = { [key: string]: string | string[] | undefined };

const HEX = /^#?([0-9a-f]{6})$/i;

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

function safeColor(v: string | undefined, fallback: string): string {
  if (!v) return fallback;
  const m = HEX.exec(v.trim());
  return m ? `#${m[1].toLowerCase()}` : fallback;
}

function safeLogo(v: string | undefined): string | null {
  if (!v) return null;
  try {
    const u = new URL(v);
    return u.protocol === "https:" || u.protocol === "http:" ? u.href : null;
  } catch {
    return v.startsWith("/") ? v : null;
  }
}

function safeEmail(v: string | undefined): string | null {
  const t = v?.trim() ?? "";
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(t) ? t : null;
}

function safePhone(v: string | undefined): string | null {
  const d = (v ?? "").replace(/\D/g, "");
  return d.length === 10 || (d.length === 11 && d.startsWith("1")) ? d : null;
}

export function getContractorConfig(
  searchParams: SearchParams,
): ContractorConfig {
  return {
    companyName:
      first(searchParams.company)?.trim() || "Premier Roofing Services",
    phone: (() => {
      const p = first(searchParams.phone)?.trim();
      if (p && ["none", "no", "0", "hide"].includes(p.toLowerCase()))
        return null;
      return p || "(555) 019-2831";
    })(),
    city: first(searchParams.city)?.trim() || "your area",
    primaryColor: safeColor(first(searchParams.color), "#2563eb"),
    logoUrl: safeLogo(first(searchParams.logo)),
    logoBg: first(searchParams.logobg) === "1",
    embed: first(searchParams.embed) === "1",
    notifyEmail: safeEmail(first(searchParams.notify)),
    notifySms: safePhone(first(searchParams.sms)),
    priceMode: first(searchParams.prices) === "monthly" ? "monthly" : "range",
  };
}

/** "(555) 019-2831" -> "+15550192831" za tel: linkove. */
export function telHref(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const withCountry = digits.length === 10 ? `1${digits}` : digits;
  return `tel:+${withCountry}`;
}

/** "5125550199" -> "(512) 555-0199"; sve ostalo vraća netaknuto. */
export function formatPhone(phone: string): string {
  const d = phone.replace(/\D/g, "");
  if (d.length === 10)
    return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  if (d.length === 11 && d.startsWith("1"))
    return `(${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7)}`;
  return phone;
}
