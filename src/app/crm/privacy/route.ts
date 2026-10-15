// Privacy u CRM-u: šifra za otključavanje stranice sa šiframa naloga.
// CRM_PRIVACY_PASSWORD_<KLIJENT> ili zajednička CRM_PRIVACY_PASSWORD ("tajna" ako nije podešena).
// Ovo je samo zavesa u stranici; same šifre (vault) čuvaju prijava i RLS pravila.
import { clientEnv, sameSecret } from "@/lib/same-secret";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const client = typeof body.client === "string" ? body.client : "";
  if (!/^[a-z0-9-]{1,32}$/.test(client))
    return Response.json({ ok: false }, { status: 400 });
  const secret =
    clientEnv("CRM_PRIVACY_PASSWORD", client) ||
    process.env.CRM_PRIVACY_PASSWORD ||
    "tajna";
  const pass =
    typeof body.password === "string" ? body.password.trim().toLowerCase() : "";
  const ok = sameSecret(pass, secret.trim().toLowerCase());
  return Response.json({ ok }, { status: ok ? 200 : 401 });
}
