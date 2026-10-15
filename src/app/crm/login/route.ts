// Prijava u /crm: ime osobe + šifra klijenta (CRM_PASSWORD_<KLIJENT>, npr. CRM_PASSWORD_ILS).
// Svaka osoba dobija svoj nalog (os.client_users), pa komentari nose njeno ime i uid.
// Nalog klijenta čita samo dokumente svog klijenta; to čuvaju RLS pravila nad os.docs.
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { clientEnv, sameSecret } from "@/lib/same-secret";

export const dynamic = "force-dynamic";

const slugOf = (name: string) =>
  name
    .toLowerCase()
    .replace(/đ/g, "dj")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 30);

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const client = typeof body.client === "string" ? body.client : "";
  const name =
    typeof body.name === "string"
      ? body.name.replace(/\s+/g, " ").trim().slice(0, 40)
      : "";
  if (!/^[a-z0-9-]{1,32}$/.test(client))
    return Response.json({ error: "bad_login" }, { status: 400 });

  const secret = clientEnv("CRM_PASSWORD", client);
  if (!secret)
    return Response.json({ error: "not_configured" }, { status: 503 });
  if (!sameSecret(body.password, secret))
    return Response.json({ error: "bad_login" }, { status: 401 });

  const slug = slugOf(name);
  if (!slug) return Response.json({ error: "no_name" }, { status: 400 });

  const db = supabaseAdmin.schema("os");
  const { data: known } = await db
    .from("client_users")
    .select("user_id, name")
    .eq("client_id", client)
    .eq("slug", slug)
    .maybeSingle();

  let email: string;
  if (known) {
    const { data: u, error } = await supabaseAdmin.auth.admin.getUserById(
      known.user_id,
    );
    if (error || !u.user?.email)
      return Response.json({ error: "server" }, { status: 500 });
    email = u.user.email;
  } else {
    email = `${client}.${slug}@crm.skeylo.com`;
    const { error } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { crm_client: client, name },
    });
    // već postoji (npr. dva paralelna logina): nastavljamo sa istim nalogom
    if (error && error.status !== 422)
      return Response.json({ error: "server" }, { status: 500 });
  }

  const { data: link, error: lErr } =
    await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email,
    });
  if (lErr || !link.properties?.hashed_token || !link.user)
    return Response.json({ error: "server" }, { status: 500 });

  if (!known) {
    const { error } = await db
      .from("client_users")
      .upsert(
        { user_id: link.user.id, client_id: client, slug, name },
        { onConflict: "user_id", ignoreDuplicates: true },
      );
    if (error) return Response.json({ error: "server" }, { status: 500 });
  }

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
    name: known ? known.name : name,
  });
}
