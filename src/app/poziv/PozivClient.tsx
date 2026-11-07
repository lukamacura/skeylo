"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useReducedMotion,
} from "framer-motion";
import {
  ArrowLeft,
  CalendarDays,
  CalendarPlus,
  Check,
  Clock,
  Download,
  Gift,
  Loader2,
  MessageCircle,
  MessagesSquare,
  Phone,
  Video,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Podaci                                                              */
/* ------------------------------------------------------------------ */

type SlotsRes = {
  ok: boolean;
  today: string; // YYYY-MM-DD (Beograd)
  until: string; // poslednji dan za zakazivanje
  len: number; // minuta
  slots: string[]; // YYYY-MM-DDTHH:MM, lokalno vreme u Beogradu
};
type How = "phone" | "whatsapp" | "viber" | "meet";
type Form = {
  name: string;
  phone: string;
  email: string;
  company: string;
  note: string;
  how: How;
  website: string; // honeypot
};

const EMAIL = "office@skeylo.com";
const PHONE = "+381 63 1012474";
const PHONE_HREF = "tel:+381631012474";

const HOWS: { id: How; label: string; Icon: typeof Phone }[] = [
  { id: "phone", label: "Telefon", Icon: Phone },
  { id: "whatsapp", label: "WhatsApp", Icon: MessageCircle },
  { id: "viber", label: "Viber", Icon: MessagesSquare },
  { id: "meet", label: "Google Meet", Icon: Video },
];

const TEAM = [
  { src: "/people/luka.webp", name: "Luka" },
  { src: "/people/mihac.webp", name: "Mihajlo" },
  { src: "/people/nina.webp", name: "Nina" },
  { src: "/people/filip.webp", name: "Filip" },
];

/* ------------------------------------------------------------------ */
/* Datumi: sve radimo nad stringovima YYYY-MM-DD preko UTC-a, da       */
/* vremenska zona posetioca ne pomera dane.                            */
/* ------------------------------------------------------------------ */

const DOW = ["pon", "uto", "sre", "čet", "pet", "sub", "ned"];
const DOW_LONG = [
  "ponedeljak",
  "utorak",
  "sreda",
  "četvrtak",
  "petak",
  "subota",
  "nedelja",
];
const MON = [
  "januar",
  "februar",
  "mart",
  "april",
  "maj",
  "jun",
  "jul",
  "avgust",
  "septembar",
  "oktobar",
  "novembar",
  "decembar",
];

const toUTC = (d: string) =>
  Date.UTC(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10));
const fromUTC = (t: number) => new Date(t).toISOString().slice(0, 10);
const addDays = (d: string, n: number) => fromUTC(toUTC(d) + n * 864e5);
const isoDow = (d: string) => (new Date(toUTC(d)).getUTCDay() + 6) % 7; // 0 = pon
const longDate = (d: string) =>
  `${DOW_LONG[isoDow(d)]}, ${+d.slice(8, 10)}. ${MON[+d.slice(5, 7) - 1]}`;
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const addMin = (hm: string, m: number) => {
  const t = +hm.slice(0, 2) * 60 + +hm.slice(3, 5) + m;
  return `${String(Math.floor(t / 60) % 24).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
};

// razlika Beograd − UTC (ms) u datom trenutku
function belgradeOffset(ts: number) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Belgrade",
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(ts));
  const g = (k: string) => +(parts.find((p) => p.type === k)?.value ?? 0);
  return (
    Date.UTC(
      g("year"),
      g("month") - 1,
      g("day"),
      g("hour"),
      g("minute"),
      g("second"),
    ) -
    Math.floor(ts / 1000) * 1000
  );
}
// "2026-11-09T10:30" po Beogradu → pravi trenutak
function belgradeToDate(local: string) {
  const guess = Date.UTC(
    +local.slice(0, 4),
    +local.slice(5, 7) - 1,
    +local.slice(8, 10),
    +local.slice(11, 13),
    +local.slice(14, 16),
  );
  let utc = guess - belgradeOffset(guess);
  const o2 = belgradeOffset(utc);
  if (guess - o2 !== utc) utc = guess - o2;
  return new Date(utc);
}
const icsStamp = (d: Date) =>
  d
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");

/* ------------------------------------------------------------------ */

export default function PozivClient() {
  const reduce = useReducedMotion();
  const [data, setData] = useState<SlotsRes | null>(null);
  const [loadErr, setLoadErr] = useState(false);
  const [day, setDay] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [step, setStep] = useState<"pick" | "form" | "done">("pick");
  const [form, setForm] = useState<Form>({
    name: "",
    phone: "",
    email: "",
    company: "",
    note: "",
    how: "phone",
    website: "",
  });
  const [tried, setTried] = useState(false);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [formErr, setFormErr] = useState<string | null>(null);
  const [booked, setBooked] = useState<{ slot: string; form: Form } | null>(
    null,
  );
  const [otherTz, setOtherTz] = useState(false);
  const source = useRef("");
  const stepRef = useRef<HTMLElement>(null);
  const wantScroll = useRef(false);

  const load = useCallback(async (keep: string | null) => {
    setLoadErr(false);
    try {
      const r = await fetch("/api/poziv", { cache: "no-store" });
      const j = (await r.json()) as SlotsRes;
      if (!r.ok || !j.ok) throw new Error("load");
      setData(j);
      const days = new Set(j.slots.map((s) => s.slice(0, 10)));
      setDay(
        keep && days.has(keep) ? keep : (j.slots[0]?.slice(0, 10) ?? null),
      );
    } catch {
      setLoadErr(true);
    }
  }, []);

  useEffect(() => {
    load(null);
    const now = Date.now();
    setOtherTz(-new Date().getTimezoneOffset() * 60000 !== belgradeOffset(now));
    const q = new URLSearchParams(location.search);
    let ref = "";
    try {
      ref = document.referrer ? new URL(document.referrer).host : "";
    } catch {
      // neispravan referrer: izvor ostaje prazan
    }
    source.current =
      q.get("utm_source") || q.get("ref") || q.get("izvor") || ref || "";
  }, [load]);

  const byDay = useMemo(() => {
    const m = new Map<string, string[]>();
    for (const s of data?.slots ?? []) {
      const d = s.slice(0, 10);
      if (!m.has(d)) m.set(d, []);
      m.get(d)!.push(s.slice(11, 16));
    }
    return m;
  }, [data]);

  // nedelje od ponedeljka do nedelje, od danas do poslednjeg dana
  const weeks = useMemo(() => {
    if (!data) return [];
    const start = addDays(data.today, -isoDow(data.today));
    const end = addDays(data.until, 6 - isoDow(data.until));
    const out: string[][] = [];
    for (let d = start; d <= end; d = addDays(d, 7))
      out.push(Array.from({ length: 7 }, (_, i) => addDays(d, i)));
    return out;
  }, [data]);

  const monthLabel = useMemo(() => {
    if (!data) return "";
    const a = MON[+data.today.slice(5, 7) - 1];
    const b = MON[+data.until.slice(5, 7) - 1];
    const y = data.until.slice(0, 4);
    return a === b ? `${a} ${y}` : `${a} – ${b} ${y}`;
  }, [data]);

  const len = data?.len ?? 30;
  const set = <K extends keyof Form>(k: K, v: Form[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const errs = useMemo(() => {
    const e: Partial<Record<keyof Form, string>> = {};
    const digits = form.phone.replace(/\D/g, "");
    if (form.name.trim().length < 2) e.name = "Upiši ime i prezime.";
    if (digits.length < 8 || digits.length > 15)
      e.phone = "Upiši broj telefona, npr. +381 64 123 4567.";
    if (form.how === "meet" && !form.email.trim())
      e.email = "Za Google Meet nam treba mejl da pošaljemo link.";
    else if (
      form.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())
    )
      e.email = "Proveri mejl adresu.";
    return e;
  }, [form]);

  // na telefonu je korak ispod uvoda: posle izbora termina skroluj do forme,
  // ali samo ako vrh koraka nije već na ekranu (desktop se ne pomera)
  const scrollTop = () => {
    const el = stepRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top;
    if (top < 0 || top > window.innerHeight * 0.5)
      el.scrollIntoView({
        behavior: reduce ? "auto" : "smooth",
        block: "start",
      });
  };

  function pickTime(t: string) {
    if (!day) return;
    setSlot(`${day}T${t}`);
    setNotice(null);
    setFormErr(null);
    setStep("form");
    wantScroll.current = true;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setTried(true);
    setFormErr(null);
    if (!slot || Object.keys(errs).length) return;
    setSending(true);
    try {
      const r = await fetch("/api/poziv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, start: slot, source: source.current }),
      });
      const j = (await r.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        start?: string;
      };
      if (j.ok) {
        setBooked({ slot, form });
        setStep("done");
        wantScroll.current = true;
      } else if (j.error === "TAKEN") {
        setNotice(
          "Neko je upravo zauzeo taj termin. Izaberi neki drugi, ostali su i dalje slobodni.",
        );
        setSlot(null);
        setStep("pick");
        load(day);
        wantScroll.current = true;
      } else if (j.error === "ALREADY" && j.start) {
        setFormErr(
          `Već imaš zakazan poziv: ${longDate(j.start.slice(0, 10))} u ${j.start.slice(11, 16)}. Ako ti treba drugi termin, piši nam na ${EMAIL}.`,
        );
      } else if (j.error === "INVALID") {
        setFormErr("Proveri podatke pa pokušaj ponovo.");
      } else {
        setFormErr(
          `Nešto nije u redu sa naše strane. Pokušaj ponovo ili nam piši na ${EMAIL}.`,
        );
      }
    } catch {
      setFormErr("Nema veze sa serverom. Proveri internet i pokušaj ponovo.");
    } finally {
      setSending(false);
    }
  }

  // MotionConfig reducedMotion="user" gasi pomeranje, ostaje samo fade
  const fade = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -6 },
  };
  const spring = { type: "spring" as const, stiffness: 320, damping: 32 };

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative min-h-dvh overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[48rem] max-w-[160vw] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]"
        />

        <div className="relative mx-auto w-full max-w-5xl px-4 pb-12 pt-5 sm:px-6 sm:pt-8">
          <Link
            href="/"
            className="inline-flex rounded-lg outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            aria-label="Skeylo - Početna"
          >
            <Image
              src="/brand/logo.webp"
              alt="Skeylo"
              width={112}
              height={40}
              priority
              className="h-8 w-auto sm:h-9"
            />
          </Link>

          <div className="mt-5 overflow-hidden rounded-3xl border border-border bg-card/80 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)] sm:mt-7 md:grid md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
            {/* ---------- Levo: o pozivu ---------- */}
            <aside className="relative border-b border-border p-5 sm:p-7 md:border-b-0 md:border-r">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                Besplatan poziv
              </p>
              <h1 className="mt-2 text-balance text-[1.7rem] font-extrabold leading-[1.1] sm:text-4xl">
                Zakaži poziv sa <span className="text-gradient">Skeylo</span>{" "}
                timom
              </h1>
              <p className="mt-3 text-pretty text-[0.95rem] leading-relaxed text-muted-foreground">
                Ispričaj nam gde je tvoj biznis danas i šta želiš da postigneš.
                Mi ćemo ti iskreno reći kako bismo tome pristupili.
              </p>

              <ul className="mt-5 space-y-2.5 text-sm">
                <li className="flex items-center gap-2.5">
                  <Clock className="size-4 shrink-0 text-primary" />
                  {len} minuta
                </li>
                <li className="flex items-center gap-2.5">
                  <Phone className="size-4 shrink-0 text-primary" />
                  Telefon, WhatsApp, Viber ili Google Meet
                </li>
                <li className="flex items-center gap-2.5">
                  <Gift className="size-4 shrink-0 text-primary" />
                  Besplatno i bez obaveza
                </li>
              </ul>

              <div className="mt-6 flex items-center gap-3">
                <div className="flex -space-x-2.5">
                  {TEAM.map((p) => (
                    <Image
                      key={p.name}
                      src={p.src}
                      alt={p.name}
                      width={40}
                      height={40}
                      className="size-9 rounded-full border-2 border-card object-cover object-top"
                    />
                  ))}
                </div>
                <p className="text-xs leading-snug text-muted-foreground">
                  Pričaš sa nekim
                  <br />
                  od nas iz tima
                </p>
              </div>

              {step === "form" && slot && (
                <div className="mt-6 hidden rounded-2xl border border-primary/30 bg-primary/10 p-4 md:block">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                    Tvoj termin
                  </p>
                  <p className="mt-1 font-display text-lg font-bold">
                    {cap(longDate(slot.slice(0, 10)))}
                  </p>
                  <p className="text-sm tabular-nums text-foreground/80">
                    {slot.slice(11, 16)} – {addMin(slot.slice(11, 16), len)}
                  </p>
                </div>
              )}
            </aside>

            {/* ---------- Desno: koraci ---------- */}
            <section
              ref={stepRef}
              className="min-h-[30rem] scroll-mt-3 p-5 sm:p-7"
              aria-live="polite"
            >
              <AnimatePresence
                mode="wait"
                initial={false}
                // skrol tek kad stari korak izađe, inače je stranica još kratka
                onExitComplete={() => {
                  if (!wantScroll.current) return;
                  wantScroll.current = false;
                  requestAnimationFrame(scrollTop);
                }}
              >
                {step === "pick" && (
                  <motion.div key="pick" {...fade} transition={spring}>
                    <div className="flex items-baseline justify-between gap-3">
                      <h2 className="text-xl font-bold">Izaberi dan i vreme</h2>
                      <span className="text-sm text-muted-foreground">
                        {cap(monthLabel)}
                      </span>
                    </div>

                    {notice && (
                      <p className="mt-4 rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm">
                        {notice}
                      </p>
                    )}

                    {loadErr ? (
                      <div className="mt-8 rounded-2xl border border-border p-6 text-center">
                        <p className="text-sm text-muted-foreground">
                          Termini nisu mogli da se učitaju.
                        </p>
                        <button
                          type="button"
                          onClick={() => load(day)}
                          className="mt-4 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground"
                        >
                          Pokušaj ponovo
                        </button>
                      </div>
                    ) : !data ? (
                      <CalendarSkeleton />
                    ) : data.slots.length === 0 ? (
                      <div className="mt-8 rounded-2xl border border-border p-6 text-center">
                        <CalendarDays className="mx-auto size-7 text-primary" />
                        <p className="mt-3 font-semibold">
                          Trenutno nema slobodnih termina
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Piši nam na{" "}
                          <a
                            className="text-primary underline"
                            href={`mailto:${EMAIL}`}
                          >
                            {EMAIL}
                          </a>{" "}
                          i dogovorićemo se.
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground">
                          {DOW.map((d) => (
                            <div key={d} className="py-1">
                              {d}
                            </div>
                          ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                          {weeks.flat().map((d) => {
                            const inRange = d >= data.today && d <= data.until;
                            const n = byDay.get(d)?.length ?? 0;
                            const sel = d === day;
                            const first = +d.slice(8, 10) === 1;
                            return (
                              <button
                                key={d}
                                type="button"
                                disabled={!n}
                                onClick={() => {
                                  setDay(d);
                                  setNotice(null);
                                }}
                                aria-pressed={sel}
                                aria-label={`${longDate(d)}${n ? `, ${n} slobodnih termina` : ", nema termina"}`}
                                className={[
                                  "relative flex aspect-square flex-col items-center justify-center rounded-xl text-[0.95rem] font-semibold tabular-nums outline-none transition-[background-color,color,transform] duration-150 focus-visible:ring-2 focus-visible:ring-ring sm:aspect-[1.15]",
                                  sel
                                    ? "bg-primary text-primary-foreground"
                                    : n
                                      ? "bg-primary/10 text-foreground hover:bg-primary/20 active:scale-95"
                                      : inRange
                                        ? "text-foreground/25"
                                        : "text-foreground/10",
                                ].join(" ")}
                              >
                                {first && (
                                  <span
                                    className={`absolute top-1 text-[0.55rem] font-bold uppercase leading-none ${sel ? "text-primary-foreground/70" : "text-primary"}`}
                                  >
                                    {MON[+d.slice(5, 7) - 1].slice(0, 3)}
                                  </span>
                                )}
                                {+d.slice(8, 10)}
                                {d === data.today && (
                                  <span
                                    className={`absolute bottom-1.5 size-1 rounded-full ${sel ? "bg-primary-foreground" : "bg-primary"}`}
                                  />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {day && (
                          <AnimatePresence mode="wait" initial={false}>
                            <motion.div
                              key={day}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.15 }}
                              className="mt-6"
                            >
                              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                                <h3 className="font-display text-base font-bold">
                                  {cap(longDate(day))}
                                </h3>
                                <span className="text-xs text-muted-foreground">
                                  vreme u Srbiji
                                </span>
                              </div>
                              {otherTz && (
                                <p className="mt-2 text-xs text-accent">
                                  Vremena su po beogradskom vremenu, a ti si u
                                  drugoj vremenskoj zoni.
                                </p>
                              )}
                              <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                                {(byDay.get(day) ?? []).map((t) => (
                                  <button
                                    key={t}
                                    type="button"
                                    onClick={() => pickTime(t)}
                                    className="h-12 rounded-xl border border-primary/35 text-[0.95rem] font-semibold tabular-nums text-foreground outline-none transition-[background-color,border-color,transform] duration-150 hover:border-primary hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-ring active:scale-95"
                                  >
                                    {t}
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          </AnimatePresence>
                        )}
                      </>
                    )}
                  </motion.div>
                )}

                {step === "form" && slot && (
                  <motion.div key="form" {...fade} transition={spring}>
                    <button
                      type="button"
                      onClick={() => {
                        setStep("pick");
                        setFormErr(null);
                      }}
                      className="-ml-2 inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <ArrowLeft className="size-4" />
                      Promeni termin
                    </button>

                    <div className="mt-3 flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 md:hidden">
                      <CalendarDays className="size-5 shrink-0 text-primary" />
                      <div className="leading-tight">
                        <p className="font-semibold">
                          {cap(longDate(slot.slice(0, 10)))}
                        </p>
                        <p className="text-sm tabular-nums text-foreground/75">
                          {slot.slice(11, 16)} –{" "}
                          {addMin(slot.slice(11, 16), len)}
                        </p>
                      </div>
                    </div>

                    <h2 className="mt-5 text-xl font-bold md:mt-3">
                      Tvoji podaci
                    </h2>

                    <form
                      onSubmit={submit}
                      noValidate
                      className="mt-4 space-y-4"
                    >
                      <Field
                        label="Ime i prezime"
                        error={tried ? errs.name : undefined}
                      >
                        <input
                          className={inputCls(tried && !!errs.name)}
                          value={form.name}
                          onChange={(e) => set("name", e.target.value)}
                          autoComplete="name"
                          maxLength={80}
                          placeholder="Marko Marković"
                        />
                      </Field>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field
                          label="Telefon"
                          error={tried ? errs.phone : undefined}
                        >
                          <input
                            className={inputCls(tried && !!errs.phone)}
                            value={form.phone}
                            onChange={(e) => set("phone", e.target.value)}
                            type="tel"
                            inputMode="tel"
                            autoComplete="tel"
                            maxLength={30}
                            placeholder="+381 64 123 4567"
                          />
                        </Field>
                        <Field label="Firma ili brend" hint="opciono">
                          <input
                            className={inputCls(false)}
                            value={form.company}
                            onChange={(e) => set("company", e.target.value)}
                            autoComplete="organization"
                            maxLength={80}
                          />
                        </Field>
                      </div>

                      <fieldset>
                        <legend className="mb-1.5 text-sm font-medium">
                          Kako da pričamo?
                        </legend>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                          {HOWS.map(({ id, label, Icon }) => {
                            const on = form.how === id;
                            return (
                              <button
                                key={id}
                                type="button"
                                aria-pressed={on}
                                onClick={() => set("how", id)}
                                className={[
                                  "flex h-11 items-center justify-center gap-2 rounded-xl border text-sm font-semibold outline-none transition-[background-color,border-color,color] duration-150 focus-visible:ring-2 focus-visible:ring-ring",
                                  on
                                    ? "border-primary bg-primary/15 text-foreground"
                                    : "border-border text-muted-foreground hover:border-foreground/25 hover:text-foreground",
                                ].join(" ")}
                              >
                                <Icon
                                  className={`size-4 ${on ? "text-primary" : ""}`}
                                />
                                {label}
                              </button>
                            );
                          })}
                        </div>
                      </fieldset>

                      <Field
                        label="Email"
                        hint={form.how === "meet" ? "za link" : "opciono"}
                        error={tried ? errs.email : undefined}
                      >
                        <input
                          className={inputCls(tried && !!errs.email)}
                          value={form.email}
                          onChange={(e) => set("email", e.target.value)}
                          type="email"
                          inputMode="email"
                          autoComplete="email"
                          maxLength={120}
                          placeholder="ime@firma.rs"
                        />
                      </Field>

                      <Field label="O čemu želiš da pričamo?" hint="opciono">
                        <textarea
                          className={`${inputCls(false)} min-h-24 resize-y py-3`}
                          value={form.note}
                          onChange={(e) => set("note", e.target.value)}
                          maxLength={600}
                          rows={3}
                          placeholder="Npr. imamo prodavnicu i želimo više porudžbina sa Instagrama…"
                        />
                      </Field>

                      {/* honeypot: skriveno od ljudi */}
                      <div
                        aria-hidden
                        className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
                      >
                        <label>
                          Website
                          <input
                            tabIndex={-1}
                            autoComplete="off"
                            value={form.website}
                            onChange={(e) => set("website", e.target.value)}
                          />
                        </label>
                      </div>

                      {formErr && (
                        <p
                          role="alert"
                          className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
                        >
                          {formErr}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={sending}
                        className="flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-primary text-base font-extrabold text-primary-foreground outline-none transition-[transform,opacity] duration-150 hover:-translate-y-0.5 focus-visible:ring-[3px] focus-visible:ring-ring active:translate-y-0 disabled:opacity-70"
                      >
                        {sending ? (
                          <>
                            <Loader2 className="size-5 animate-spin" />
                            Zakazujem…
                          </>
                        ) : (
                          <>Zakaži poziv · {slot.slice(11, 16)}</>
                        )}
                      </button>
                    </form>
                  </motion.div>
                )}

                {step === "done" && booked && (
                  <motion.div key="done" {...fade} transition={spring}>
                    <Done booked={booked} len={len} />
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Pitanja?{" "}
            <a className="hover:text-primary" href={`mailto:${EMAIL}`}>
              {EMAIL}
            </a>{" "}
            ·{" "}
            <a className="hover:text-primary" href={PHONE_HREF}>
              {PHONE}
            </a>
          </p>
        </div>
      </div>
    </MotionConfig>
  );
}

/* ------------------------------------------------------------------ */

function Done({
  booked,
  len,
}: {
  booked: { slot: string; form: Form };
  len: number;
}) {
  const { slot, form } = booked;
  const t = slot.slice(11, 16);
  const start = belgradeToDate(slot);
  const end = new Date(start.getTime() + len * 60000);
  const contact = form.how === "meet" ? form.email.trim() : form.phone.trim();
  const pre =
    form.how === "meet"
      ? "Link za Google Meet stiže na "
      : form.how === "whatsapp"
        ? "Zvaćemo te preko WhatsApp-a na "
        : form.how === "viber"
          ? "Zvaćemo te preko Vibera na "
          : "Zvaćemo te na ";
  const post = form.how === "meet" ? " pre poziva." : ".";
  const how = pre + contact + post;
  const title = "Poziv sa Skeylo timom";
  const details = `${how}\nTreba da pomeriš termin? ${EMAIL} · ${PHONE}`;

  const gcal =
    "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    `&text=${encodeURIComponent(title)}` +
    `&dates=${icsStamp(start)}/${icsStamp(end)}` +
    `&details=${encodeURIComponent(details)}`;

  function ics() {
    const esc = (s: string) =>
      s
        .replace(/\\/g, "\\\\")
        .replace(/([,;])/g, "\\$1")
        .replace(/\n/g, "\\n");
    const body = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Skeylo//Poziv//SR",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:poziv-${slot.replace(/\D/g, "")}-${Math.random().toString(36).slice(2, 10)}@skeylo.com`,
      `DTSTAMP:${icsStamp(new Date())}`,
      `DTSTART:${icsStamp(start)}`,
      `DTEND:${icsStamp(end)}`,
      `SUMMARY:${esc(title)}`,
      `DESCRIPTION:${esc(details)}`,
      "BEGIN:VALARM",
      "TRIGGER:-PT15M",
      "ACTION:DISPLAY",
      `DESCRIPTION:${esc(title)}`,
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR",
      "",
    ].join("\r\n");
    const url = URL.createObjectURL(
      new Blob([body], { type: "text/calendar;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "skeylo-poziv.ics";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <div className="flex flex-col items-center py-4 text-center sm:py-8">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 420,
          damping: 20,
          delay: 0.05,
        }}
        className="flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground"
      >
        <Check className="size-8" strokeWidth={3} />
      </motion.div>
      <h2 className="mt-5 text-2xl font-extrabold sm:text-3xl">Zakazano!</h2>
      <p className="mt-2 font-display text-lg font-bold text-gradient">
        {cap(longDate(slot.slice(0, 10)))} u {t}
      </p>
      <p className="mt-3 max-w-sm text-pretty text-sm leading-relaxed text-muted-foreground">
        {pre}
        <span className="whitespace-nowrap text-foreground/85">{contact}</span>
        {post} Tim je već dobio obaveštenje.
      </p>

      <div className="mt-7 grid w-full max-w-sm gap-2.5">
        <a
          href={gcal}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-12 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-primary-foreground outline-none transition-transform duration-150 hover:-translate-y-0.5 focus-visible:ring-[3px] focus-visible:ring-ring"
        >
          <CalendarPlus className="size-4" />
          Dodaj u Google Calendar
        </a>
        <button
          type="button"
          onClick={ics}
          className="flex h-12 items-center justify-center gap-2 rounded-xl border border-border text-sm font-semibold outline-none transition-colors duration-150 hover:border-foreground/25 focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Download className="size-4" />
          Apple / Outlook kalendar (.ics)
        </button>
      </div>

      <p className="mt-7 max-w-sm text-xs leading-relaxed text-muted-foreground">
        Treba da pomeriš termin? Piši na{" "}
        <a
          className="text-foreground/80 underline-offset-2 hover:underline"
          href={`mailto:${EMAIL}`}
        >
          {EMAIL}
        </a>{" "}
        ili pozovi{" "}
        <a
          className="text-foreground/80 underline-offset-2 hover:underline"
          href={PHONE_HREF}
        >
          {PHONE}
        </a>
        .
      </p>
    </div>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between gap-2 text-sm font-medium">
        {label}
        {hint && (
          <span className="text-xs font-normal text-muted-foreground">
            {hint}
          </span>
        )}
      </span>
      {children}
      {error && (
        <span className="mt-1.5 block text-xs text-red-300">{error}</span>
      )}
    </label>
  );
}

const inputCls = (bad: boolean) =>
  [
    "w-full rounded-xl border bg-white/[0.03] px-4 text-base text-foreground outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-foreground/25 focus:border-primary focus:ring-[3px] focus:ring-ring/40",
    "h-12",
    bad ? "border-red-400/60" : "border-border",
  ].join(" ");

function CalendarSkeleton() {
  return (
    <div className="mt-4 animate-pulse" aria-label="Učitavam termine">
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 21 }, (_, i) => (
          <div
            key={i}
            className="aspect-square rounded-xl bg-white/[0.04] sm:aspect-[1.15]"
          />
        ))}
      </div>
      <div className="mt-6 h-4 w-40 rounded bg-white/[0.05]" />
      <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="h-12 rounded-xl bg-white/[0.04]" />
        ))}
      </div>
    </div>
  );
}
