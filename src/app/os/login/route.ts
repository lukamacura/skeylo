// Prijava u /os: izabrana osoba + zajednička timska lozinka (OS_TEAM_PASSWORD).
// Lične lozinke naloga ostaju netaknute: server pravi sesiju preko magic link tokena.
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sameSecret } from "@/lib/same-secret";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const teamPass = process.env.OS_TEAM_PASSWORD;
  if (!teamPass)
    return Response.json({ error: "not_configured" }, { status: 503 });

  const body = await req.json().catch(() => ({}));
  const slug = typeof body.slug === "string" ? body.slug : "";
  if (!slug || !sameSecret(body.password, teamPass))
    return Response.json({ error: "bad_login" }, { status: 401 });

  const { data: email } = await supabaseAdmin
    .schema("os")
    .rpc("login_email", { p_slug: slug });
  if (!email) return Response.json({ error: "not_member" }, { status: 403 });

  const { data: link, error } = await supabaseAdmin.auth.admin.generateLink({
    type: "magiclink",
    email,
  });
  if (error || !link.properties?.hashed_token)
    return Response.json({ error: "server" }, { status: 500 });

  const anon = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const { data: v, error: vErr } = await anon.auth.verifyOtp({
    type: "magiclink",
    token_hash: link.properties.hashed_token,
  });
  if (vErr || !v.session)
    return Response.json({ error: "server" }, { status: 500 });

  return Response.json({
    access_token: v.session.access_token,
    refresh_token: v.session.refresh_token,
  });
}
