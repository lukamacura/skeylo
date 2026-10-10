"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ILS_COOKIE, ILS_MAX_AGE, ILS_PASS, ilsToken } from "@/lib/ils-gate";

export type GateState = { wrong: number };

// Stranice iza istog gate-a; posle otključavanja vraćamo korisnika na onu
// sa koje je došao, nikad na proizvoljan URL.
const PAGES = ["/ils/marketing_plan", "/ils/google_ads"];

export async function unlock(
  prev: GateState,
  formData: FormData,
): Promise<GateState> {
  const value = String(formData.get("pass") ?? "")
    .trim()
    .toLowerCase();
  if (value !== ILS_PASS) return { wrong: prev.wrong + 1 };

  const jar = await cookies();
  jar.set(ILS_COOKIE, await ilsToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/ils",
    maxAge: ILS_MAX_AGE,
  });
  const next = String(formData.get("next") ?? "");
  redirect(PAGES.includes(next) ? next : PAGES[0]);
}
