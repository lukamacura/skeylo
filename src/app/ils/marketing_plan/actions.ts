"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ILS_COOKIE, ILS_MAX_AGE, ILS_PASS, ilsToken } from "@/lib/ils-gate";

export type GateState = { wrong: number };

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
  redirect("/ils/marketing_plan");
}
