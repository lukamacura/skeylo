"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Sheet from "@/components/os/Sheet";
import {
  DeleteButton,
  PageHeader,
  PrimaryButton,
  Segmented,
  inputCls,
  inputStyle,
} from "@/components/os/fields";
import { projectLabel } from "@/components/os/scripts/pickers";
import ShootSheet, { type ShootDraft } from "./ShootSheet";
import { osBrowser } from "@/lib/os/supabase-browser";
import { addDays, weekStart } from "@/lib/os/dates";
import { stageColor } from "@/lib/os/stages";
import { OS, STATE } from "@/lib/os/theme";
import type {
  Block,
  Person,
  ProjectRef,
  ScriptCard,
  ScriptStage,
  Shoot,
} from "@/lib/os/types";

/* Podrazumevani dan za snimanje: 7–23h, polusatni koraci. */
const START_H = 7;
const END_H = 23;
const HOUR = 48;
const SLOT = 30;
const MIN0 = START_H * 60;
const MIN1 = END_H * 60;

type Mode = "shoot" | "block";
type Sel = { day: string; a: number; b: number };

/* Kalendar radi u lokalnom vremenu pregledača (tim je u Beogradu). */
const localDay = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const at = (day: string, min: number) => {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(y, m - 1, d, 0, min);
};
const minOf = (d: Date) => d.getHours() * 60 + d.getMinutes();
const hm = (min: number) =>
  `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
const toMin = (s: string) => {
  const [h, m] = s.split(":").map(Number);
  return h * 60 + m;
};
const dayName = new Intl.DateTimeFormat("sr-Latn-RS", { weekday: "short" });
const rangeFmt = new Intl.DateTimeFormat("sr-Latn-RS", {
  day: "numeric",
  month: "short",
});

export default function CalendarView({
  scripts: initialScripts,
  stages,
  team,
  projects: initialProjects,
  me,
}: {
  scripts: ScriptCard[];
  stages: ScriptStage[];
  team: Person[];
  projects: ProjectRef[];
  me: Person;
}) {
  const router = useRouter();
  const sb = osBrowser();
  const [today, setToday] = useState<string | null>(null);
  const [week, setWeek] = useState<string | null>(null);
  const [phoneDay, setPhoneDay] = useState<string | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [shoots, setShoots] = useState<Shoot[]>([]);
  const [scripts, setScripts] = useState(initialScripts);
  const [projects, setProjects] = useState(initialProjects);
  const [mode, setMode] = useState<Mode>("shoot");
  const [sel, setSel] = useState<Sel | null>(null);
  const [shootSheet, setShootSheet] = useState<{
    shoot: Shoot | null;
    draft: ShootDraft;
  } | null>(null);
  const [blockSheet, setBlockSheet] = useState<Block | null>(null);

  useEffect(() => setScripts(initialScripts), [initialScripts]);

  // "Danas" znamo tek u pregledaču (server je u UTC-u).
  useEffect(() => {
    const t = localDay(new Date());
    setToday(t);
    setWeek(weekStart(t));
    setPhoneDay(t);
  }, []);

  const load = useCallback(async () => {
    if (!week) return;
    const from = at(week, 0).toISOString();
    const to = at(addDays(week, 7), 0).toISOString();
    const [b, s] = await Promise.all([
      sb.from("blocks").select("*").lt("starts_at", to).gt("ends_at", from),
      sb
        .from("shoots")
        .select("*")
        .lt("starts_at", to)
        .gt("ends_at", from)
        .order("starts_at"),
    ]);
    setBlocks((b.data ?? []) as Block[]);
    setShoots((s.data ?? []) as Shoot[]);
  }, [sb, week]);

  useEffect(() => {
    void load();
  }, [load]);

  const recordColor = stageColor(
    stages.find((s) => s.id === "record"),
    team,
  );
  const days = week
    ? Array.from({ length: 7 }, (_, i) => addDays(week, i))
    : [];
  const waiting = scripts.filter((s) => s.stage === "schedule" && !s.shoot_id);

  /* --- Upis ----------------------------------------------------------- */

  async function addBlock(r: Sel) {
    const { data } = await sb
      .from("blocks")
      .insert({
        starts_at: at(r.day, r.a).toISOString(),
        ends_at: at(r.day, r.b).toISOString(),
        created_by: me.id,
      })
      .select("*")
      .single();
    if (data) setBlocks((bs) => [...bs, data as Block]);
  }

  function conflict(d: ShootDraft) {
    const a = at(d.day, toMin(d.start)).getTime();
    const b = at(d.day, toMin(d.end)).getTime();
    const hit = blocks.find(
      (x) => Date.parse(x.starts_at) < b && Date.parse(x.ends_at) > a,
    );
    return hit
      ? `Termin se preklapa sa nedostupnim vremenom${hit.reason ? ` (${hit.reason})` : ""}.`
      : null;
  }

  async function saveShoot(d: ShootDraft) {
    const prev = shootSheet?.shoot;
    const row = {
      starts_at: at(d.day, toMin(d.start)).toISOString(),
      ends_at: at(d.day, toMin(d.end)).toISOString(),
      project_id: d.project_id,
      location: d.location,
      notes: d.notes,
    };
    setShootSheet(null);
    const { data } = prev
      ? await sb
          .from("shoots")
          .update(row)
          .eq("id", prev.id)
          .select("*")
          .single()
      : await sb
          .from("shoots")
          .insert({ ...row, created_by: me.id })
          .select("*")
          .single();
    if (!data) return;
    const shoot = data as Shoot;
    const before = scripts
      .filter((s) => s.shoot_id === shoot.id)
      .map((s) => s.id);
    const added = d.scriptIds.filter((id) => !before.includes(id));
    const removed = before.filter((id) => !d.scriptIds.includes(id));
    // Dodata skripta ide na snimanje (trigger), skinuta se vraća Nini na zakazivanje.
    if (added.length)
      await sb.from("scripts").update({ shoot_id: shoot.id }).in("id", added);
    await unschedule(removed);
    await load();
    router.refresh();
  }

  async function unschedule(ids: string[]) {
    if (!ids.length) return;
    const recording = scripts
      .filter((s) => ids.includes(s.id) && s.stage === "record")
      .map((s) => s.id);
    if (recording.length)
      await sb
        .from("scripts")
        .update({ shoot_id: null, stage: "schedule" })
        .in("id", recording);
    const rest = ids.filter((id) => !recording.includes(id));
    if (rest.length)
      await sb.from("scripts").update({ shoot_id: null }).in("id", rest);
  }

  async function deleteShoot() {
    const shoot = shootSheet?.shoot;
    setShootSheet(null);
    if (!shoot) return;
    await unschedule(
      scripts.filter((s) => s.shoot_id === shoot.id).map((s) => s.id),
    );
    await sb.from("shoots").delete().eq("id", shoot.id);
    await load();
    router.refresh();
  }

  async function markRecorded(id: string) {
    const now = new Date().toISOString();
    setScripts((ss) =>
      ss.map((s) =>
        s.id === id ? { ...s, recorded_at: now, stage: "edit" } : s,
      ),
    );
    await sb.from("scripts").update({ recorded_at: now }).eq("id", id);
    router.refresh();
  }

  function openNewShoot(r: Sel) {
    setShootSheet({
      shoot: null,
      draft: {
        day: r.day,
        start: hm(r.a),
        end: hm(r.b),
        project_id: null,
        location: "",
        notes: "",
        scriptIds: [],
      },
    });
  }

  function openShoot(s: Shoot) {
    const a = new Date(s.starts_at);
    setShootSheet({
      shoot: s,
      draft: {
        day: localDay(a),
        start: hm(minOf(a)),
        end: hm(minOf(new Date(s.ends_at))),
        project_id: s.project_id,
        location: s.location,
        notes: s.notes,
        scriptIds: scripts.filter((x) => x.shoot_id === s.id).map((x) => x.id),
      },
    });
  }

  /* --- Prevlačenje po koloni ----------------------------------------- */

  const drag = useRef<{
    day: string;
    start: number;
    y0: number;
    moved: boolean;
    top: number;
  } | null>(null);
  const slotAt = (y: number) =>
    Math.min(
      MIN1 - SLOT,
      Math.max(MIN0, MIN0 + Math.floor(((y / HOUR) * 60) / SLOT) * SLOT),
    );

  function down(day: string, e: React.PointerEvent<HTMLDivElement>) {
    if (e.button !== 0) return;
    const top = e.currentTarget.getBoundingClientRect().top;
    const start = slotAt(e.clientY - top);
    drag.current = { day, start, y0: e.clientY, moved: false, top };
    if (e.pointerType !== "touch")
      e.currentTarget.setPointerCapture(e.pointerId);
  }
  function move(e: React.PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d) return;
    if (Math.abs(e.clientY - d.y0) > 6) d.moved = true;
    if (!d.moved) return;
    const cur = slotAt(e.clientY - d.top);
    setSel({
      day: d.day,
      a: Math.min(d.start, cur),
      b: Math.max(d.start, cur) + SLOT,
    });
  }
  function up(e: React.PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    const cur = slotAt(e.clientY - d.top);
    const r: Sel = d.moved
      ? {
          day: d.day,
          a: Math.min(d.start, cur),
          b: Math.max(d.start, cur) + SLOT,
        }
      : {
          day: d.day,
          a: d.start,
          b: Math.min(MIN1, d.start + (mode === "shoot" ? 120 : 60)),
        };
    setSel(null);
    if (mode === "block") void addBlock(r);
    else openNewShoot(r);
  }
  function cancel() {
    drag.current = null;
    setSel(null);
  }

  /* --- Prikaz --------------------------------------------------------- */

  const span = (startIso: string, endIso: string, day: string) => {
    const a = new Date(startIso);
    const b = new Date(endIso);
    const from = localDay(a) < day ? MIN0 : Math.max(MIN0, minOf(a));
    const to = localDay(b) > day ? MIN1 : Math.min(MIN1, minOf(b));
    return to > from
      ? { top: ((from - MIN0) / 60) * HOUR, height: ((to - from) / 60) * HOUR }
      : null;
  };
  const onDay = <T extends { starts_at: string; ends_at: string }>(
    xs: T[],
    day: string,
  ) =>
    xs.filter(
      (x) =>
        localDay(new Date(x.starts_at)) <= day &&
        localDay(new Date(x.ends_at)) >= day,
    );

  // Obična funkcija, ne komponenta: kolona ne sme da se remontira usred prevlačenja.
  function column(day: string) {
    const nowMin = today === day ? minOf(new Date()) : null;
    return (
      <div
        key={day}
        className="relative select-none"
        style={{
          height: (END_H - START_H) * HOUR,
          touchAction: "pan-y",
          backgroundImage: `repeating-linear-gradient(to bottom, ${OS.line} 0 1px, transparent 1px ${HOUR}px)`,
          borderLeft: `1px solid ${OS.line}`,
          cursor: mode === "block" ? "cell" : "copy",
        }}
        onPointerDown={(e) => down(day, e)}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={cancel}
      >
        {onDay(blocks, day).map((b) => {
          const s = span(b.starts_at, b.ends_at, day);
          if (!s) return null;
          return (
            <button
              key={b.id}
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => setBlockSheet(b)}
              className="absolute inset-x-0.5 overflow-hidden rounded-md px-1.5 py-1 text-left text-[11px] font-medium"
              style={{
                ...s,
                color: STATE.late,
                borderLeft: `2px solid ${STATE.late}`,
                background: `repeating-linear-gradient(135deg, ${STATE.late}2e 0 6px, ${STATE.late}12 6px 12px)`,
              }}
            >
              {b.reason || "Nedostupno"}
            </button>
          );
        })}
        {onDay(shoots, day).map((sh) => {
          const s = span(sh.starts_at, sh.ends_at, day);
          if (!s) return null;
          const list = scripts.filter((x) => x.shoot_id === sh.id);
          const p = projects.find((x) => x.id === sh.project_id);
          const done = list.length > 0 && list.every((x) => x.recorded_at);
          const color = done ? STATE.ok : recordColor;
          return (
            <button
              key={sh.id}
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => openShoot(sh)}
              className="absolute inset-x-1 overflow-hidden rounded-lg px-2 py-1.5 text-left transition-transform duration-100 active:scale-[0.98]"
              style={{
                ...s,
                background: `${color}26`,
                borderLeft: `3px solid ${color}`,
                boxShadow: `0 0 0 1px ${OS.bg}`,
              }}
            >
              <div
                className="truncate text-[12px] font-semibold"
                style={{ color }}
              >
                {p ? projectLabel(p) : "Snimanje"}
              </div>
              <div
                className="truncate text-[11px] tabular-nums"
                style={{ color: OS.muted }}
              >
                {hm(minOf(new Date(sh.starts_at)))}–
                {hm(minOf(new Date(sh.ends_at)))}
                {list.length > 0 &&
                  ` · ${list.filter((x) => x.recorded_at).length}/${list.length} snimljeno`}
              </div>
              {sh.location && s.height > 60 && (
                <div
                  className="truncate text-[11px]"
                  style={{ color: OS.faint }}
                >
                  {sh.location}
                </div>
              )}
            </button>
          );
        })}
        {sel?.day === day && (
          <div
            className="pointer-events-none absolute inset-x-1 rounded-lg"
            style={{
              top: ((sel.a - MIN0) / 60) * HOUR,
              height: ((sel.b - sel.a) / 60) * HOUR,
              border: `1.5px dashed ${mode === "block" ? STATE.late : recordColor}`,
              background: `${mode === "block" ? STATE.late : recordColor}14`,
            }}
          >
            <span
              className="absolute left-1.5 top-1 text-[11px] font-semibold tabular-nums"
              style={{ color: mode === "block" ? STATE.late : recordColor }}
            >
              {hm(sel.a)}–{hm(sel.b)}
            </span>
          </div>
        )}
        {nowMin !== null && nowMin >= MIN0 && nowMin <= MIN1 && (
          <div
            className="pointer-events-none absolute inset-x-0 h-px"
            style={{ top: ((nowMin - MIN0) / 60) * HOUR, background: OS.text }}
          >
            <span
              className="absolute -left-1 -top-[3.5px] size-2 rounded-full"
              style={{ background: OS.text }}
            />
          </div>
        )}
      </div>
    );
  }

  const hours = Array.from({ length: END_H - START_H }, (_, i) => START_H + i);
  const gutter = (
    <div className="relative" style={{ height: (END_H - START_H) * HOUR }}>
      {hours.map((h) => (
        <div
          key={h}
          className="absolute right-2 -translate-y-1/2 text-[11px] tabular-nums"
          style={{ top: (h - START_H) * HOUR, color: OS.faint }}
        >
          {h > START_H ? `${h}:00` : ""}
        </div>
      ))}
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-[calc(20px+env(safe-area-inset-top))] md:px-10 md:pt-10">
      <PageHeader
        title="Snimanje"
        sub={
          week
            ? `${rangeFmt.format(at(week, 0))} – ${rangeFmt.format(at(addDays(week, 6), 0))}`
            : " "
        }
        action={
          <div className="flex items-center gap-1">
            <NavBtn
              onClick={() => week && setWeek(addDays(week, -7))}
              label="Prethodna nedelja"
            >
              <ChevronLeft className="size-4" />
            </NavBtn>
            <button
              type="button"
              onClick={() =>
                today && (setWeek(weekStart(today)), setPhoneDay(today))
              }
              className="h-9 rounded-lg px-3 text-[14px] font-medium active:scale-[0.97]"
              style={{ background: OS.surface, border: `1px solid ${OS.line}` }}
            >
              Danas
            </button>
            <NavBtn
              onClick={() => week && setWeek(addDays(week, 7))}
              label="Sledeća nedelja"
            >
              <ChevronRight className="size-4" />
            </NavBtn>
          </div>
        }
      />

      <div className="mt-4 grid gap-3 md:flex md:items-center">
        <div className="md:w-[320px]">
          <Segmented
            id="cal-mode"
            value={mode}
            onChange={setMode}
            options={[
              { id: "shoot", label: "Zakaži snimanje", color: recordColor },
              { id: "block", label: "Označi nedostupno", color: STATE.late },
            ]}
          />
        </div>
        <p className="text-[13px]" style={{ color: OS.faint }}>
          {mode === "shoot"
            ? "Prevuci po kalendaru ili dodirni sat da zakažeš."
            : "Prevuci preko sati kada se ne može snimati."}
        </p>
      </div>

      {waiting.length > 0 && (
        <div
          className="mt-4 rounded-2xl px-3.5 py-3"
          style={{
            background: `${STATE.attention}12`,
            border: `1px solid ${STATE.attention}33`,
          }}
        >
          <div
            className="text-[13px] font-semibold"
            style={{ color: STATE.attention }}
          >
            {waiting.length === 1
              ? "1 skripta čeka termin"
              : `${waiting.length} skripte čekaju termin`}
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {waiting.slice(0, 8).map((s) => (
              <span
                key={s.id}
                className="max-w-[220px] truncate rounded-full px-2.5 py-1 text-[12px]"
                style={{ background: OS.surface, color: OS.text }}
              >
                {s.title}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Telefon: jedan dan */}
      <div className="mt-5 md:hidden">
        <div className="grid grid-cols-7 gap-1">
          {days.map((d) => {
            const active = d === phoneDay;
            const busy = onDay(shoots, d).length > 0;
            return (
              <button
                key={d}
                type="button"
                onClick={() => setPhoneDay(d)}
                className="flex h-14 flex-col items-center justify-center rounded-xl"
                style={{
                  background: active ? OS.surface2 : "transparent",
                  color:
                    d === today ? STATE.attention : active ? OS.text : OS.muted,
                }}
              >
                <span className="text-[11px] capitalize">
                  {dayName.format(at(d, 0)).replace(".", "")}
                </span>
                <span className="text-[16px] font-semibold tabular-nums">
                  {Number(d.slice(8))}
                </span>
                <span
                  className="mt-0.5 size-1 rounded-full"
                  style={{ background: busy ? recordColor : "transparent" }}
                />
              </button>
            );
          })}
        </div>
        {phoneDay && (
          <div className="mt-3 grid grid-cols-[44px_1fr]">
            {gutter}
            {column(phoneDay)}
          </div>
        )}
      </div>

      {/* Desktop: cela nedelja */}
      <div className="mt-6 hidden md:block">
        <div
          className="sticky top-0 z-10 grid grid-cols-[48px_repeat(7,1fr)] pb-2"
          style={{ background: OS.bg }}
        >
          <div />
          {days.map((d) => (
            <div
              key={d}
              className="text-center"
              style={{ color: d === today ? STATE.attention : OS.muted }}
            >
              <span className="text-[12px] capitalize">
                {dayName.format(at(d, 0)).replace(".", "")}{" "}
              </span>
              <span className="text-[15px] font-semibold tabular-nums">
                {Number(d.slice(8))}
              </span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-[48px_repeat(7,1fr)]">
          {gutter}
          {days.map((d) => column(d))}
        </div>
      </div>

      {shootSheet && (
        <ShootSheet
          open
          isNew={!shootSheet.shoot}
          initial={shootSheet.draft}
          scripts={scripts}
          stages={stages}
          team={team}
          projects={projects}
          conflict={conflict}
          onProjectCreated={(p) => setProjects((ps) => [...ps, p])}
          onClose={() => setShootSheet(null)}
          onSave={saveShoot}
          onDelete={deleteShoot}
          onRecorded={markRecorded}
        />
      )}

      <BlockSheet
        block={blockSheet}
        onClose={() => setBlockSheet(null)}
        onSave={async (reason) => {
          const b = blockSheet!;
          setBlockSheet(null);
          setBlocks((bs) =>
            bs.map((x) => (x.id === b.id ? { ...x, reason } : x)),
          );
          await sb.from("blocks").update({ reason }).eq("id", b.id);
        }}
        onDelete={async () => {
          const b = blockSheet!;
          setBlockSheet(null);
          setBlocks((bs) => bs.filter((x) => x.id !== b.id));
          await sb.from("blocks").delete().eq("id", b.id);
        }}
      />
    </div>
  );
}

function NavBtn({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid size-9 place-items-center rounded-lg active:scale-[0.95]"
      style={{
        background: OS.surface,
        border: `1px solid ${OS.line}`,
        color: OS.text,
      }}
    >
      {children}
    </button>
  );
}

function BlockSheet({
  block,
  onClose,
  onSave,
  onDelete,
}: {
  block: Block | null;
  onClose: () => void;
  onSave: (reason: string) => void;
  onDelete: () => void;
}) {
  const [reason, setReason] = useState("");
  useEffect(() => setReason(block?.reason ?? ""), [block]);
  const a = block ? new Date(block.starts_at) : null;
  const b = block ? new Date(block.ends_at) : null;
  return (
    <Sheet
      open={!!block}
      onClose={onClose}
      title="Nedostupno"
      footer={
        <div className="flex gap-2">
          <DeleteButton onConfirm={onDelete} label="Ukloni" />
          <PrimaryButton onClick={() => onSave(reason.trim())}>
            Sačuvaj
          </PrimaryButton>
        </div>
      }
    >
      <div className="grid gap-3 pt-2">
        {a && b && (
          <p className="text-[15px] tabular-nums" style={{ color: STATE.late }}>
            {rangeFmt.format(a)} · {hm(minOf(a))}–{hm(minOf(b))}
          </p>
        )}
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Razlog (opciono)"
          className={inputCls}
          style={inputStyle}
        />
      </div>
    </Sheet>
  );
}
