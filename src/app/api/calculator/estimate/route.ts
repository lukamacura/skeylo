// POST /api/calculator/estimate
// 1) upiše lead u Supabase (skeylo_leads, type "roof-estimator")
// 2) pošalje estimate homeowneru na email (Resend)
// 3) pošalje lead notifikaciju vlasniku firme (notifyEmail iz URL-a ili env)
// 4) SMS homeowneru (estimate) + SMS vlasniku (lead alert) — samo ako je Twilio podešen
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendSms } from "@/lib/sms";
import {
  claimLabel,
  estimate,
  goalById,
  materialById,
  monthlyPayment,
  timelineLabel,
  usd,
  type ClaimId,
  type GoalId,
  type MaterialId,
  type TimelineId,
} from "@/lib/roofing";
import { formatPhone, telHref } from "@/app/calculator/config";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const GOAL_IDS: GoalId[] = ["storm", "age", "new"];
const MATERIAL_IDS: MaterialId[] = ["shingles", "metal", "tile"];
const TIMELINE_IDS: TimelineId[] = ["asap", "season", "research"];
const CLAIM_IDS: ClaimId[] = ["filed", "not-yet", "unsure"];
const ZIP_RE = /^\d{5}$/;

function mapsUrl(address: string, zip: string, city: string): string {
  const q = address ? `${address}, ${zip}` : `${zip} ${city}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const homeownerPhone =
    typeof body.mobile === "string" ? body.mobile.trim() : "";
  const homeownerDigits = homeownerPhone.replace(/\D/g, "");
  const goal = body.goal as GoalId;
  const material = body.material as MaterialId;
  const homeSqFt = Number(body.homeSqFt);
  const zip = typeof body.zip === "string" ? body.zip.trim() : "";
  const address =
    typeof body.address === "string" ? body.address.trim().slice(0, 120) : "";
  const timeline = body.timeline as TimelineId;
  const claim = goal === "storm" ? (body.claim as ClaimId) : null;
  const consent = body.consent === true;
  const priceMode = body.priceMode === "monthly" ? "monthly" : "range";
  const company =
    typeof body.company === "string" && body.company.trim()
      ? body.company.trim()
      : "Premier Roofing Services";
  const phone = typeof body.phone === "string" ? body.phone : "";
  const city = typeof body.city === "string" ? body.city : "your area";
  const color =
    typeof body.color === "string" && /^#[0-9a-f]{6}$/i.test(body.color)
      ? body.color
      : "#2563eb";
  const notifyEmail =
    typeof body.notifyEmail === "string" && EMAIL_RE.test(body.notifyEmail)
      ? body.notifyEmail
      : process.env.CALCULATOR_NOTIFY_EMAIL || null;
  const notifySms =
    typeof body.notifySms === "string" && /^\d{10,11}$/.test(body.notifySms)
      ? body.notifySms
      : process.env.CALCULATOR_NOTIFY_SMS || null;

  if (
    !name ||
    !EMAIL_RE.test(email) ||
    homeownerDigits.length < 10 ||
    !GOAL_IDS.includes(goal) ||
    !MATERIAL_IDS.includes(material) ||
    !Number.isFinite(homeSqFt) ||
    homeSqFt < 300 ||
    homeSqFt > 20000 ||
    !ZIP_RE.test(zip) ||
    !TIMELINE_IDS.includes(timeline) ||
    (goal === "storm" && !CLAIM_IDS.includes(claim as ClaimId)) ||
    !consent
  ) {
    return NextResponse.json({ ok: false, error: "INVALID" }, { status: 400 });
  }

  const est = estimate(homeSqFt, material);
  const m = materialById(material);
  const g = goalById(goal);
  const monthly = monthlyPayment(est.low);
  const consentAt = new Date().toISOString();
  const maps = mapsUrl(address, zip, city);
  const hot = timeline === "asap" || claim === "filed";

  // 1) Supabase — ne blokira rezultat ako padne
  const { data: inserted, error: dbError } = await supabaseAdmin
    .from("skeylo_leads")
    .insert({
      type: "roof-estimator",
      name,
      brand: company,
      phone: homeownerPhone,
      contact: email,
      data: {
        name,
        email,
        phone: homeownerPhone,
        company,
        city,
        zip,
        address: address || null,
        goal,
        timeline,
        claim,
        homeSqFt,
        squares: est.squares,
        material,
        estimateLow: est.low,
        estimateHigh: est.high,
        monthlyFrom: monthly,
        priceMode,
        source: "calculator-demo",
      },
      meta: {
        ip:
          req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          req.headers.get("x-real-ip") ||
          null,
        userAgent: req.headers.get("user-agent"),
        referer: req.headers.get("referer"),
        /* TCPA: eksplicitna saglasnost za pozive/SMS, sa vremenom. */
        consent: { calls_and_texts: true, at: consentAt },
      },
    })
    .select("id")
    .single();
  if (dbError) console.error("estimate insert error:", dbError);
  const leadId = inserted?.id ?? null;

  // 2 + 3) Resend
  let emailed = false;
  const apiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.RESEND_FROM || "Roof Estimate <onboarding@resend.dev>";

  if (apiKey) {
    const resend = new Resend(apiKey);
    const phonePretty = formatPhone(phone);
    const tel = telHref(phone);
    const range = `${usd.format(est.low)} – ${usd.format(est.high)}`;
    const monthlyPretty = `${usd.format(monthly)}/mo`;
    const heroNumber =
      priceMode === "monthly" ? `from ${monthlyPretty}` : range;
    const heroSub =
      priceMode === "monthly"
        ? "With financing, on approved credit. Final quote confirmed after a free inspection."
        : `Regional average, installed. Or from about <b>${monthlyPretty}</b> with financing. Final quote confirmed after a free inspection.`;

    const homeownerHtml = `
<div style="margin:0;padding:24px;background:#f5f6f8;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#0f172a">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0">
    <div style="padding:20px 24px;border-bottom:1px solid #e2e8f0">
      <div style="font-weight:700;font-size:16px">${esc(company)}</div>
      <div style="font-size:12px;color:#64748b">Serving ${esc(city)}</div>
    </div>
    <div style="padding:24px">
      <p style="margin:0 0 6px;font-size:14px;color:#64748b">Hi ${esc(name)}, here's your ballpark.</p>
      <div style="background:${color};color:#fff;border-radius:14px;padding:20px 22px;margin:12px 0 18px">
        <div style="font-size:11px;letter-spacing:.06em;text-transform:uppercase;opacity:.85">Estimated project range</div>
        <div style="font-size:30px;font-weight:800;line-height:1.15;margin-top:4px">${heroNumber}</div>
        <div style="font-size:12px;opacity:.85;margin-top:8px">${heroSub}</div>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <tr><td style="padding:8px 0;color:#64748b;border-bottom:1px solid #f1f5f9">Home size</td><td style="padding:8px 0;text-align:right;border-bottom:1px solid #f1f5f9"><b>${homeSqFt.toLocaleString("en-US")} sq ft</b></td></tr>
        <tr><td style="padding:8px 0;color:#64748b;border-bottom:1px solid #f1f5f9">Roof area (pitch &amp; cuts)</td><td style="padding:8px 0;text-align:right;border-bottom:1px solid #f1f5f9"><b>${est.roofSqFt.toLocaleString("en-US")} sq ft · ${est.squares} squares</b></td></tr>
        <tr><td style="padding:8px 0;color:#64748b;border-bottom:1px solid #f1f5f9">Material</td><td style="padding:8px 0;text-align:right;border-bottom:1px solid #f1f5f9"><b>${esc(m.name)}</b></td></tr>
        <tr><td style="padding:8px 0;color:#64748b;border-bottom:1px solid #f1f5f9">Price per square</td><td style="padding:8px 0;text-align:right;border-bottom:1px solid #f1f5f9"><b>${usd.format(m.pricePerSquare.low)}–${usd.format(m.pricePerSquare.high)}</b></td></tr>
        <tr><td style="padding:8px 0;color:#64748b">Expected lifespan</td><td style="padding:8px 0;text-align:right"><b>${m.lifespanYears.low}–${m.lifespanYears.high} years</b></td></tr>
      </table>
      <div style="margin:18px 0;padding:14px;border-radius:12px;background:#f8fafc;font-size:13px;line-height:1.5;color:#334155">
        <b>${esc(g.title)}:</b> ${esc(g.insight)}
      </div>
      <a href="${tel}" style="display:block;text-align:center;background:${color};color:#fff;text-decoration:none;font-weight:700;padding:14px 18px;border-radius:12px;font-size:15px">Call ${esc(company)} · ${esc(phonePretty)}</a>
      <p style="margin:14px 0 0;font-size:12px;color:#94a3b8;text-align:center">Lock in this range with a free on-site inspection.</p>
    </div>
  </div>
</div>`;

    const ownerHtml = `
<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#0f172a;font-size:14px;line-height:1.6">
  <h2 style="margin:0 0 8px">${hot ? "🔥 Hot lead" : "New roof estimate lead"}</h2>
  <p style="margin:0 0 12px;color:#64748b">From the ${esc(company)} calculator · ${esc(timelineLabel(timeline))}${claim ? ` · ${esc(claimLabel(claim))}` : ""}</p>
  <p style="margin:0 0 14px"><a href="${telHref(homeownerPhone)}" style="display:inline-block;background:${color};color:#fff;text-decoration:none;font-weight:700;padding:10px 16px;border-radius:10px">Call ${esc(name)} · ${esc(formatPhone(homeownerPhone))}</a></p>
  <table style="border-collapse:collapse;font-size:14px">
    <tr><td style="padding:4px 12px 4px 0;color:#64748b">Name</td><td><b>${esc(name)}</b></td></tr>
    <tr><td style="padding:4px 12px 4px 0;color:#64748b">Mobile</td><td><a href="${telHref(homeownerPhone)}"><b>${esc(formatPhone(homeownerPhone))}</b></a></td></tr>
    <tr><td style="padding:4px 12px 4px 0;color:#64748b">Email</td><td><a href="mailto:${esc(email)}">${esc(email)}</a></td></tr>
    <tr><td style="padding:4px 12px 4px 0;color:#64748b">Property</td><td>${address ? esc(address) + ", " : ""}${esc(zip)} · <a href="${maps}">View on Google Maps</a></td></tr>
    <tr><td style="padding:4px 12px 4px 0;color:#64748b">Timeline</td><td><b>${esc(timelineLabel(timeline))}</b></td></tr>
    ${claim ? `<tr><td style="padding:4px 12px 4px 0;color:#64748b">Insurance claim</td><td><b>${esc(claimLabel(claim))}</b></td></tr>` : ""}
    <tr><td style="padding:4px 12px 4px 0;color:#64748b">Project</td><td>${esc(g.title)}</td></tr>
    <tr><td style="padding:4px 12px 4px 0;color:#64748b">Home size</td><td>${homeSqFt.toLocaleString("en-US")} sq ft (${est.squares} squares)</td></tr>
    <tr><td style="padding:4px 12px 4px 0;color:#64748b">Material</td><td>${esc(m.name)}</td></tr>
    <tr><td style="padding:4px 12px 4px 0;color:#64748b">Estimate shown</td><td><b>${priceMode === "monthly" ? `from ${monthlyPretty} (range ${range} hidden)` : range}</b></td></tr>
  </table>
  <p style="margin:14px 0 0;font-size:12px;color:#94a3b8">Homeowner agreed to receive calls and texts from ${esc(company)} on ${consentAt.slice(0, 10)}.</p>
</div>`;

    const sends: Promise<unknown>[] = [
      resend.emails
        .send({
          from,
          to: email,
          replyTo: notifyEmail ?? undefined,
          subject: `Your roof estimate from ${company}: ${range}`,
          html: homeownerHtml,
        })
        .then((r) => {
          if (r.error) console.error("resend homeowner error:", r.error);
          else emailed = true;
        }),
    ];
    if (notifyEmail) {
      sends.push(
        resend.emails
          .send({
            from,
            to: notifyEmail,
            replyTo: email,
            subject: `${hot ? "🔥 " : ""}New lead: ${name} · ${timelineLabel(timeline)}${claim ? ` · ${claimLabel(claim)}` : ""} · ${range}`,
            html: ownerHtml,
          })
          .then((r) => {
            if (r.error) console.error("resend owner error:", r.error);
          }),
      );
    }
    await Promise.all(sends);
  } else {
    console.warn("RESEND_API_KEY missing — estimate email skipped");
  }

  // 4) SMS — tiho preskače bez Twilio env-a
  const rangeSms =
    priceMode === "monthly"
      ? `from ${usd.format(monthly)}/mo`
      : `${usd.format(est.low)}–${usd.format(est.high)}`;
  const smsJobs: Promise<unknown>[] = [
    sendSms(
      homeownerPhone,
      `${company}: your roof estimate is ${rangeSms} (${m.name.toLowerCase()}, ${est.squares} sq). Lock it in with a free inspection: call ${formatPhone(phone)}. Reply STOP to opt out.`,
    ),
  ];
  if (notifySms) {
    smsJobs.push(
      sendSms(
        notifySms,
        `${hot ? "HOT " : ""}Lead: ${name}, ${formatPhone(homeownerPhone)}. ${g.title}, ${timelineLabel(timeline)}${claim ? `, ${claimLabel(claim)}` : ""}. ${m.name}, ${rangeSms}. ${address ? address + ", " : ""}${zip}`,
      ),
    );
  }
  await Promise.all(smsJobs);

  return NextResponse.json({ ok: true, emailed, leadId, estimate: est });
}
