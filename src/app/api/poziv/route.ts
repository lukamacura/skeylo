// /api/poziv — zakazivanje poziva sa Skeylo timom (stranica /poziv).
// GET: slobodni termini. POST: zakaži termin.
// Sva logika je u bazi (docs/telegram/skeylo-pozivi.sql): os.call_slots() računa
// termine iz tg.cfg i OS eventa, os.call_book() upisuje event u OS i šalje 📞 poruku
// u Telegram grupu. Obe funkcije sme da zove samo service_role.
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };
const HOW = new Set(["phone", "whatsapp", "viber", "meet"]);

const str = (v: unknown, max: number) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

export async function GET() {
  const { data, error } = await supabaseAdmin.schema("os").rpc("call_slots");
  if (error) {
    console.error("call_slots error:", error);
    return NextResponse.json(
      { ok: false, error: "DB_ERROR" },
      { status: 500, headers: NO_STORE },
    );
  }
  return NextResponse.json({ ok: true, ...data }, { headers: NO_STORE });
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

  // honeypot: ljudi ovo polje ne vide, botovi ga popune
  if (str(body.website, 200)) {
    return NextResponse.json({ ok: true, start: str(body.start, 16) });
  }

  const how = str(body.how, 20);
  const p = {
    start: str(body.start, 16),
    name: str(body.name, 80),
    phone: str(body.phone, 30),
    email: str(body.email, 120),
    company: str(body.company, 80),
    note: str(body.note, 600),
    how: HOW.has(how) ? how : "phone",
    source: str(body.source, 120),
  };

  const { data, error } = await supabaseAdmin
    .schema("os")
    .rpc("call_book", { p });
  if (error || !data) {
    console.error("call_book error:", error);
    return NextResponse.json(
      { ok: false, error: "DB_ERROR" },
      { status: 500, headers: NO_STORE },
    );
  }

  const res = data as { ok: boolean; error?: string };
  const status = res.ok ? 200 : res.error === "INVALID" ? 400 : 409; // TAKEN, ALREADY
  return NextResponse.json(res, { status, headers: NO_STORE });
}
