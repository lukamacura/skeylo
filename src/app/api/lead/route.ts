// src/app/api/lead/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

// (opciono) dozvoli i preflight ako ćeš zvati sa drugih domena
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    // 1) JSON koji stiže iz Wizard-a (svi unosi)
    const body = (await req.json().catch(() => ({}))) as Record<
      string,
      unknown
    >;

    // 2) Promovisana polja za listu
    const { type, name, brand, phone, contact, ...rest } = body;

    if (typeof type !== "string" || !type) {
      return NextResponse.json(
        { ok: false, error: "MISSING_TYPE" },
        { status: 400 },
      );
    }

    // 3) Meta (za audit/atribuciju)
    const url = new URL(req.url);
    const headers = req.headers;
    const meta = {
      ip:
        headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        headers.get("x-real-ip") ||
        null,
      userAgent: headers.get("user-agent"),
      referer: headers.get("referer"),
      utm: {
        utm_source: url.searchParams.get("utm_source"),
        utm_medium: url.searchParams.get("utm_medium"),
        utm_campaign: url.searchParams.get("utm_campaign"),
        utm_term: url.searchParams.get("utm_term"),
        utm_content: url.searchParams.get("utm_content"),
        gclid: url.searchParams.get("gclid"),
        fbclid: url.searchParams.get("fbclid"),
      },
    };

    // 4) Upis u Supabase. `data` = svi odgovori (uklj. promovisane, radi celovitosti).
    const { error } = await supabaseAdmin.from("skeylo_leads").insert({
      type,
      name: typeof name === "string" ? name : null,
      brand: typeof brand === "string" ? brand : null,
      phone: typeof phone === "string" ? phone : null,
      contact: typeof contact === "string" ? contact : null,
      data: { name, brand, phone, contact, ...rest },
      meta,
    });

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { ok: false, error: "DB_ERROR" },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Lead route error:", err);
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR" },
      { status: 500 },
    );
  }
}
