// Stranice iza ILS lozinke (/ils/...) otvaraju se i u CRM-u (Reporting → izveštaj
// sa href). Prijavljen klijent Infinity-ja ili član tima ne kuca drugu lozinku:
// ruta proveri njegovu Supabase sesiju i postavi isti kolačić kao forma na /ils.
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { ILS_COOKIE, ILS_MAX_AGE, ilsToken } from "@/lib/ils-gate";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const token = (req.headers.get("authorization") || "").replace(
    /^Bearer\s+/i,
    "",
  );
  if (!token) return Response.json({ error: "no_session" }, { status: 401 });

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user)
    return Response.json({ error: "no_session" }, { status: 401 });

  const db = supabaseAdmin.schema("os");
  const [{ data: client }, { data: member }] = await Promise.all([
    db
      .from("client_users")
      .select("user_id")
      .eq("user_id", data.user.id)
      .eq("client_id", "ils")
      .maybeSingle(),
    db
      .from("people")
      .select("user_id")
      .eq("user_id", data.user.id)
      .maybeSingle(),
  ]);
  if (!client && !member)
    return Response.json({ error: "forbidden" }, { status: 403 });

  (await cookies()).set(ILS_COOKIE, await ilsToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/ils",
    maxAge: ILS_MAX_AGE,
  });
  return new Response(null, { status: 204 });
}
