import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, isAuthed } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { isLeadStatus } from "@/lib/crm";

export const runtime = "nodejs";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!(await isAuthed(token))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as {
    status?: unknown;
    next_follow_up?: unknown;
    value?: unknown;
    notes?: unknown;
  };

  const update: Record<string, unknown> = {};

  if ("status" in body) {
    if (!isLeadStatus(body.status)) {
      return NextResponse.json(
        { ok: false, error: "INVALID_STATUS" },
        { status: 400 },
      );
    }
    update.status = body.status;
    // Drži legacy `contacted` flag u sinhronizaciji sa pipeline-om.
    const isContacted = body.status !== "new";
    update.contacted = isContacted;
    update.contacted_at = isContacted ? new Date().toISOString() : null;
  }

  if ("next_follow_up" in body) {
    const v = body.next_follow_up;
    if (v !== null && typeof v !== "string") {
      return NextResponse.json(
        { ok: false, error: "INVALID_DATE" },
        { status: 400 },
      );
    }
    update.next_follow_up = v || null;
  }

  if ("value" in body) {
    const v = body.value;
    if (v !== null && typeof v !== "number") {
      return NextResponse.json(
        { ok: false, error: "INVALID_VALUE" },
        { status: 400 },
      );
    }
    update.value = v;
  }

  if ("notes" in body) {
    const v = body.notes;
    if (v !== null && typeof v !== "string") {
      return NextResponse.json(
        { ok: false, error: "INVALID_NOTES" },
        { status: 400 },
      );
    }
    update.notes = v || null;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ ok: false, error: "EMPTY" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("skeylo_leads")
    .update(update)
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!(await isAuthed(token))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const { id } = await params;
  const { error } = await supabaseAdmin
    .from("skeylo_leads")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
