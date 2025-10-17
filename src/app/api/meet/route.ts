/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/meet/route.ts
import { NextResponse } from "next/server";

type MeetPayload = {
  name: string;
  email: string;
  mode: "uzivo" | "online";
  slotISO: string; // ISO string (UTC)
  slotLocal?: string;
  timezone?: string;
  source?: string;
};

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<MeetPayload> | null;

    // Osnovna validacija
    if (!body) {
      return NextResponse.json({ message: "Prazan zahtev." }, { status: 400 });
    }

    const { name, email, mode, slotISO, slotLocal, timezone, source } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { message: "Polje 'name' je obavezno." },
        { status: 400 },
      );
    }
    if (!email?.trim() || !isEmail(email)) {
      return NextResponse.json(
        { message: "Neispravan email." },
        { status: 400 },
      );
    }
    if (mode !== "uzivo" && mode !== "online") {
      return NextResponse.json(
        { message: "Polje 'mode' mora biti 'uzivo' ili 'online'." },
        { status: 400 },
      );
    }
    if (!slotISO?.trim()) {
      return NextResponse.json(
        { message: "Polje 'slotISO' je obavezno." },
        { status: 400 },
      );
    }

    const payload: MeetPayload = {
      name: name.trim(),
      email: email.trim(),
      mode,
      slotISO: slotISO.trim(),
      slotLocal,
      timezone,
      source: source ?? "meet-page",
    };

    // Webhook URL iz okruženja
    const MEET_WEBHOOK_URL = process.env.MEET_WEBHOOK_URL;

    // Ako nije podešen, vrati payload (korisno za testiranje u dev-u)
    if (!MEET_WEBHOOK_URL) {
      console.warn("MEET_WEBHOOK_URL nije podešen. Vraćam payload za proveru.");
      return NextResponse.json(
        { ok: true, forwarded: false, payload },
        { status: 200 },
      );
    }

    // Prosleđivanje ka eksternom webhooku
    const fw = await fetch(MEET_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      // keepalive pomaže kod edge/kratkih životnih ciklusa
      keepalive: true as any,
    });

    if (!fw.ok) {
      const text = await fw.text().catch(() => "");
      console.error("Webhook error:", fw.status, text);
      return NextResponse.json(
        {
          message: "Greška pri slanju na webhook.",
          status: fw.status,
          body: text,
        },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Neuspela obrada zahteva." },
      { status: 500 },
    );
  }
}
