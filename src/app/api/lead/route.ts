// src/app/api/lead/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge"; // brži cold start; ukloni ako ne želiš Edge

// (opciono) dozvoli i preflight ako ćeš zvati sa drugim domena
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
    const WEBHOOK_URL = process.env.WEBHOOK_URL;
    const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET; // opcionalno

    // 1) JSON koji stiže iz Wizard-a (svi unosi)
    const body = await req.json().catch(() => ({}) as Record<string, unknown>);

    // 2) Basic meta (za audit/atribuciju)
    const url = new URL(req.url);
    const headers = req.headers;

    const payload = {
      receivedAt: new Date().toISOString(),
      source: "skeylo-free-analysis",
      meta: {
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
      },
      data: body, // 👈 sve što si poslao iz Wizard-a ide dalje
    };

    // 3) Ako nema WEBHOOK_URL — nemoj fail, nego samo loguj i potvrdi prijem
    if (!WEBHOOK_URL) {
      console.warn(
        "WEBHOOK_URL is not set. Lead payload:",
        JSON.stringify(payload, null, 2),
      );
      return NextResponse.json({ ok: true, forwarded: false });
    }

    // 4) Prosledi na webhook (Zapier/Make/n8n/Slack…)
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(WEBHOOK_SECRET
          ? { Authorization: `Bearer ${WEBHOOK_SECRET}` }
          : {}),
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("Webhook error:", res.status, text);
      return NextResponse.json(
        { ok: false, error: "WEBHOOK_FAILED", status: res.status },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true, forwarded: true });
  } catch (err) {
    console.error("Lead route error:", err);
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR" },
      { status: 500 },
    );
  }
}
