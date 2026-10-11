import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

function sameSecret(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

// Prvi ulazak: član tima sam bira lozinku. Dozvoljeno samo za email koji
// već stoji u os.people bez naloga, i uz agencijsku šifru (ADMIN_PASSWORD).
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const code = typeof body.code === "string" ? body.code : "";

  const secret = process.env.ADMIN_PASSWORD ?? "";
  if (!secret || !sameSecret(code, secret)) {
    return NextResponse.json(
      { ok: false, error: "Pogrešna agencijska šifra." },
      { status: 401 },
    );
  }
  if (password.length < 8) {
    return NextResponse.json(
      { ok: false, error: "Lozinka mora imati bar 8 znakova." },
      { status: 400 },
    );
  }

  const os = supabaseAdmin.schema("os");
  const { data: person } = await os
    .from("people")
    .select("id, user_id")
    .eq("email", email)
    .maybeSingle();

  if (!person) {
    return NextResponse.json(
      { ok: false, error: "Ovaj email nije u timu." },
      { status: 403 },
    );
  }
  if (person.user_id) {
    return NextResponse.json(
      { ok: false, error: "Nalog već postoji. Prijavi se." },
      { status: 409 },
    );
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error || !data.user) {
    return NextResponse.json(
      { ok: false, error: error?.message ?? "Nalog nije napravljen." },
      { status: 400 },
    );
  }

  await os.from("people").update({ user_id: data.user.id }).eq("id", person.id);
  return NextResponse.json({ ok: true });
}
