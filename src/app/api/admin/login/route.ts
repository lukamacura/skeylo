import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  expectedToken,
} from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { password } = (await req.json().catch(() => ({}))) as {
    password?: string;
  };

  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return NextResponse.json(
      { ok: false, error: "NOT_CONFIGURED" },
      { status: 500 },
    );
  }

  if (!password || password !== expected) {
    return NextResponse.json({ ok: false, error: "INVALID" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, await expectedToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}
