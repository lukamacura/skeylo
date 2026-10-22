// Kod za lozinku u /os: prva registracija i zaboravljena lozinka idu istim putem.
// Server šalje Supabase recovery kod (Resend, OS_MAIL_FROM) samo članu tima (os.people);
// browser ga potvrđuje sa verifyOtp i odmah postavlja svoju lozinku.
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

const WAIT_S = 60; // jedan kod na minut po osobi

export async function POST(req: Request) {
  const from = process.env.OS_MAIL_FROM,
    key = process.env.RESEND_API_KEY;
  if (!from || !key)
    return Response.json({ error: "not_configured" }, { status: 503 });

  const body = await req.json().catch(() => ({}));
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const fresh = body.kind === "new";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return Response.json({ error: "bad_email" }, { status: 400 });

  const { data: person } = await supabaseAdmin
    .schema("os")
    .from("people")
    .select("name, user_id")
    .eq("email", email)
    .maybeSingle();
  if (!person?.user_id)
    return Response.json({ error: "not_member" }, { status: 404 });

  const { data: u } = await supabaseAdmin.auth.admin.getUserById(
    person.user_id,
  );
  const sent = Date.parse(u.user?.recovery_sent_at || "") || 0;
  const wait = Math.ceil((sent + WAIT_S * 1000 - Date.now()) / 1000);
  if (wait > 0)
    return Response.json({ error: "too_soon", wait }, { status: 429 });

  const { data: link, error } = await supabaseAdmin.auth.admin.generateLink({
    type: "recovery",
    email: u.user?.email || email,
  });
  const code = link?.properties?.email_otp;
  if (error || !code)
    return Response.json({ error: "server" }, { status: 500 });

  const { error: mailErr } = await new Resend(key).emails.send({
    from,
    to: email,
    subject: `${code} je tvoj kod za Skeylo OS`,
    html: mailHtml(person.name, code, fresh),
    text: `Ćao ${person.name},\n\n${fresh ? "kod za tvoj Skeylo OS nalog" : "kod za novu lozinku"}: ${code}\n\nAko ovaj kod nije za tebe, slobodno ignoriši ovaj email.`,
  });
  if (mailErr) return Response.json({ error: "mail" }, { status: 502 });

  return Response.json({ ok: true, wait: WAIT_S, digits: code.length });
}

function mailHtml(name: string, code: string, fresh: boolean) {
  const esc = (s: string) =>
    s.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);
  return `<!doctype html><html><body style="margin:0;background:#f4efe8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1a120b">
<div style="max-width:440px;margin:0 auto;padding:40px 20px">
<div style="background:#fff;border-radius:24px;padding:32px;text-align:center">
<p style="margin:0 0 6px;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#e1802c;font-weight:600">Skeylo OS</p>
<h1 style="margin:0 0 12px;font-size:24px">${fresh ? "Napravi svoj nalog" : "Nova lozinka"}</h1>
<p style="margin:0 0 24px;color:#6b5d4f;line-height:1.5">Ćao ${esc(name)}, upiši ovaj kod u Skeylo OS${fresh ? " i izaberi svoju lozinku" : " pa izaberi novu lozinku"}.</p>
<div style="font:700 34px/1 ui-monospace,Menlo,monospace;letter-spacing:.18em;background:#fbf3e7;border-radius:16px;padding:18px 0">${code}</div>
<p style="margin:24px 0 0;font-size:13px;color:#a08f7c;line-height:1.5">Ako ovaj kod nije za tebe, slobodno ignoriši ovaj email.</p>
</div></div></body></html>`;
}
