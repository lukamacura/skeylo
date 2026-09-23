// Twilio SMS preko REST-a (bez SDK-a). Tiho preskače ako env nije podešen,
// pa demo radi i bez Twilio naloga. Env: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN,
// TWILIO_FROM (E.164, npr. +15551234567).
import "server-only";

export function toE164(phone: string): string | null {
  const d = phone.replace(/\D/g, "");
  if (d.length === 10) return `+1${d}`;
  if (d.length === 11 && d.startsWith("1")) return `+${d}`;
  return null;
}

export function smsConfigured(): boolean {
  return !!(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_FROM
  );
}

/** Vraća true ako je poruka prihvaćena. Nikad ne baca — SMS ne sme da sruši lead. */
export async function sendSms(to: string, body: string): Promise<boolean> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM;
  const dest = toE164(to);
  if (!sid || !token || !from || !dest) return false;
  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ To: dest, From: from, Body: body }),
      },
    );
    if (!res.ok) console.error("twilio error:", res.status, await res.text());
    return res.ok;
  } catch (e) {
    console.error("twilio fetch failed:", e);
    return false;
  }
}
