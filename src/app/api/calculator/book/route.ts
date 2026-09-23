// POST /api/calculator/book — homeowner bira termin za besplatnu inspekciju
// na result ekranu. Upisuje termin u lead i obaveštava vlasnika (email + SMS).
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendSms } from "@/lib/sms";
import { slotLabel, usd } from "@/lib/roofing";
import { formatPhone, telHref } from "@/app/calculator/config";

export const runtime = "nodejs";

const SLOT_RE = /^\d{4}-\d{2}-\d{2}-(am|pm)$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const UUID_RE = /^[0-9a-f-]{36}$/i;

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const leadId = typeof body.leadId === "string" ? body.leadId : "";
  const slot = typeof body.slot === "string" ? body.slot : "";
  const notifyEmail =
    typeof body.notifyEmail === "string" && EMAIL_RE.test(body.notifyEmail)
      ? body.notifyEmail
      : process.env.CALCULATOR_NOTIFY_EMAIL || null;
  const notifySms =
    typeof body.notifySms === "string" && /^\d{10,11}$/.test(body.notifySms)
      ? body.notifySms
      : process.env.CALCULATOR_NOTIFY_SMS || null;

  if (!UUID_RE.test(leadId) || !SLOT_RE.test(slot)) {
    return NextResponse.json({ ok: false, error: "INVALID" }, { status: 400 });
  }

  // Podaci o leadu dolaze iz baze, ne iz klijenta.
  const { data: lead, error } = await supabaseAdmin
    .from("skeylo_leads")
    .select("id,name,phone,contact,brand,data")
    .eq("id", leadId)
    .eq("type", "roof-estimator")
    .single();
  if (error || !lead) {
    return NextResponse.json(
      { ok: false, error: "NOT_FOUND" },
      { status: 404 },
    );
  }

  const data = (lead.data ?? {}) as Record<string, unknown>;
  const requestedAt = new Date().toISOString();
  const { error: upErr } = await supabaseAdmin
    .from("skeylo_leads")
    .update({
      data: {
        ...data,
        inspectionSlot: slot,
        inspectionRequestedAt: requestedAt,
      },
      next_follow_up: slot.slice(0, 10),
    })
    .eq("id", leadId);
  if (upErr) console.error("book update error:", upErr);

  const name = lead.name ?? "Homeowner";
  const phone = lead.phone ?? "";
  const company = lead.brand ?? "your roofer";
  const when = slotLabel(slot);
  const range =
    typeof data.estimateLow === "number" &&
    typeof data.estimateHigh === "number"
      ? `${usd.format(data.estimateLow)}–${usd.format(data.estimateHigh)}`
      : "";
  const where = [data.address, data.zip].filter(Boolean).join(", ");

  const jobs: Promise<unknown>[] = [];
  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey && notifyEmail) {
    const resend = new Resend(apiKey);
    jobs.push(
      resend.emails
        .send({
          from:
            process.env.RESEND_FROM || "Roof Estimate <onboarding@resend.dev>",
          to: notifyEmail,
          replyTo: lead.contact ?? undefined,
          subject: `📅 Inspection requested: ${name} · ${when}`,
          html: `
<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#0f172a;font-size:14px;line-height:1.6">
  <h2 style="margin:0 0 8px">Inspection requested</h2>
  <p style="margin:0 0 12px"><b>${esc(name)}</b> picked <b>${esc(when)}</b> for a free inspection${where ? ` at ${esc(String(where))}` : ""}.</p>
  <p style="margin:0 0 12px">${range ? `Estimate shown: <b>${range}</b>. ` : ""}Confirm the time by phone.</p>
  <p><a href="${telHref(phone)}" style="display:inline-block;background:#0f172a;color:#fff;text-decoration:none;font-weight:700;padding:10px 16px;border-radius:10px">Call ${esc(formatPhone(phone))}</a></p>
</div>`,
        })
        .then((r) => {
          if (r.error) console.error("resend book error:", r.error);
        }),
    );
  }
  if (notifySms) {
    jobs.push(
      sendSms(
        notifySms,
        `Inspection requested: ${name} (${formatPhone(phone)}) picked ${when}${where ? ` at ${where}` : ""}. Call to confirm.`,
      ),
    );
  }
  if (phone) {
    jobs.push(
      sendSms(
        phone,
        `${company}: got it — free inspection requested for ${when}. We'll call to confirm the exact time.`,
      ),
    );
  }
  await Promise.all(jobs);

  return NextResponse.json({ ok: true, slot, when });
}
