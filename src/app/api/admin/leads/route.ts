import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, isAuthed } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { isLeadStatus } from "@/lib/crm";

export const runtime = "nodejs";

// Ručni unos leada iz admin panela.
export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!(await isAuthed(token))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const { type, name, brand, phone, contact, status, next_follow_up, value } =
    body;

  if (typeof type !== "string" || !type) {
    return NextResponse.json(
      { ok: false, error: "MISSING_TYPE" },
      { status: 400 },
    );
  }

  const str = (v: unknown) =>
    typeof v === "string" && v.trim() ? v.trim() : null;

  const { data, error } = await supabaseAdmin
    .from("skeylo_leads")
    .insert({
      type,
      name: str(name),
      brand: str(brand),
      phone: str(phone),
      contact: str(contact),
      status: isLeadStatus(status) ? status : "new",
      next_follow_up: str(next_follow_up),
      value: typeof value === "number" && value > 0 ? value : null,
      data: {
        name: str(name),
        brand: str(brand),
        phone: str(phone),
        contact: str(contact),
      },
      meta: { source: "manual" },
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, lead: data });
}
