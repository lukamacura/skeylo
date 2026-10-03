"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  MotionConfig,
  animate,
  motion,
  useReducedMotion,
} from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Clock,
  Droplets,
  FileText,
  Flame,
  Info,
  Layers,
  Lightbulb,
  Loader2,
  Lock,
  MapPin,
  Ruler,
  RotateCcw,
  Sparkles,
  Waves,
  Wind,
} from "lucide-react";
import {
  ACCESS,
  ATTRACTIONS,
  COVERS,
  DEPTH_RANGE,
  LENGTH_RANGE,
  LIGHTS,
  PHASES,
  POOL_TYPES,
  SIZE_PRESETS,
  STANDARD_DEPTH,
  WIDTH_RANGE,
  calculate,
  eur,
  meters,
  num,
  type AttractionId,
  type PoolInput,
  type PoolResult,
  type PoolType,
} from "@/lib/pool";
import PoolScene, { type PoolFocus } from "./PoolScene";

/* ------------------------------------------------------------------ */
/*  Pomoćne                                                             */
/* ------------------------------------------------------------------ */

const STEPS = ["Tip bazena", "Dimenzije", "Oprema", "Teren"] as const;
const RESULT = STEPS.length;
const FOCUS: PoolFocus[] = ["type", "dims", "equip", "site"];

function cn(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

/** "16,5–21 hilj. €" za uski čip ispod scene. */
function shortRange(low: number, high: number) {
  return `${meters(low / 1000)}–${meters(high / 1000)} hilj. €`;
}

/** Broj koji se "preliva" od prethodne vrednosti do nove. */
function Rolling({
  value,
  format,
  className,
  duration = 0.9,
  fromZero = false,
}: {
  value: number;
  format: (n: number) => string;
  className?: string;
  duration?: number;
  fromZero?: boolean;
}) {
  const [shown, setShown] = useState(fromZero ? 0 : value);
  const last = useRef(fromZero ? 0 : value);
  useEffect(() => {
    const controls = animate(last.current, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        last.current = v;
        setShown(v);
      },
    });
    return () => controls.stop();
  }, [value, duration]);
  return <span className={className}>{format(shown)}</span>;
}

/* ------------------------------------------------------------------ */
/*  Kontrole                                                            */
/* ------------------------------------------------------------------ */

function Slider({
  value,
  min,
  max,
  step,
  onChange,
  label,
  valueText,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  label: string;
  valueText?: string;
}) {
  const t = (value - min) / (max - min);
  return (
    <div className="relative h-11 w-full">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        aria-valuetext={valueText}
        onChange={(e) => onChange(Number(e.target.value))}
        className="peer absolute inset-0 z-10 h-full w-full cursor-pointer appearance-none opacity-0 [&::-moz-range-thumb]:size-7 [&::-webkit-slider-thumb]:size-7 [&::-webkit-slider-thumb]:appearance-none"
      />
      <div className="pointer-events-none absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-white/10" />
      <div
        className="pointer-events-none absolute left-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-gradient-to-r from-[#2aa8ff] to-[#4fd8eb]"
        style={{ width: `calc(14px + (100% - 28px) * ${t})` }}
      />
      <div
        className="pointer-events-none absolute top-1/2 size-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-[#4fd8eb] bg-[#0e1218] shadow-[0_0_0_6px_rgba(79,216,235,0.14)] transition-shadow peer-hover:shadow-[0_0_0_9px_rgba(79,216,235,0.18)] peer-focus-visible:shadow-[0_0_0_4px_#07090d,0_0_0_7px_#4fd8eb] peer-active:shadow-[0_0_0_11px_rgba(79,216,235,0.2)]"
        style={{ left: `calc(14px + (100% - 28px) * ${t})` }}
      />
    </div>
  );
}

function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  label,
  wrap = false,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
  wrap?: boolean;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        "grid gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1",
        wrap
          ? "grid-cols-1 min-[420px]:auto-cols-fr min-[420px]:grid-flow-col min-[420px]:grid-cols-none"
          : "auto-cols-fr grid-flow-col",
      )}
    >
      {options.map((o) => {
        const on = o.id === value;
        return (
          <button
            key={String(o.id)}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.id)}
            className={cn(
              "relative min-h-10 min-w-0 rounded-lg px-1.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#4fd8eb]",
              on ? "text-[#04161c]" : "text-[#aeb8c6] hover:text-white",
            )}
          >
            {on && (
              <motion.span
                layoutId={`seg-${label}`}
                className="absolute inset-0 rounded-lg bg-[#4fd8eb]"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function Choice({
  on,
  onClick,
  icon,
  title,
  hint,
  multi = false,
}: {
  on: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  hint?: string;
  multi?: boolean;
}) {
  return (
    <motion.button
      type="button"
      role={multi ? "checkbox" : "radio"}
      aria-checked={on}
      onClick={onClick}
      whileTap={{ scale: 0.985 }}
      className={cn(
        "group flex w-full items-center gap-4 rounded-2xl border p-4 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#4fd8eb]",
        on
          ? "border-[#4fd8eb]/70 bg-[#4fd8eb]/[0.08]"
          : "border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.05]",
      )}
    >
      <span
        className={cn(
          "grid size-11 shrink-0 place-items-center rounded-xl transition-colors",
          on ? "bg-[#4fd8eb] text-[#04161c]" : "bg-white/[0.06] text-[#4fd8eb]",
        )}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-[#f2f5f9]">{title}</span>
        {hint && (
          <span className="mt-0.5 block text-sm leading-snug text-[#8b97a8]">
            {hint}
          </span>
        )}
      </span>
      <Tick on={on} multi={multi} />
    </motion.button>
  );
}

function Tick({ on, multi }: { on: boolean; multi?: boolean }) {
  return (
    <span
      className={cn(
        "grid size-6 shrink-0 place-items-center border transition-colors",
        multi ? "rounded-md" : "rounded-full",
        on
          ? "border-[#4fd8eb] bg-[#4fd8eb] text-[#04161c]"
          : "border-white/20 text-transparent",
      )}
    >
      <Check className="size-4" strokeWidth={3} />
    </span>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#8b97a8]">
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Glavna komponenta                                                   */
/* ------------------------------------------------------------------ */

export default function PoolCalculator() {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [custom, setCustom] = useState(false);
  const [input, setInput] = useState<PoolInput>({
    type: "skimer",
    length: 8,
    width: 4,
    depth: STANDARD_DEPTH,
    heat: false,
    salt: false,
    cover: "nema",
    attractions: [],
    light: "nema",
    city: "",
    phase: "izgradnja",
    access: "da",
  });
  const scroller = useRef<HTMLDivElement>(null);
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setWide(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const set = <K extends keyof PoolInput>(key: K, value: PoolInput[K]) =>
    setInput((s) => ({ ...s, [key]: value }));

  const result = useMemo(() => calculate(input), [input]);
  const [calculating, setCalculating] = useState(false);
  const atResult = step === RESULT;
  const solved = atResult && !calculating;

  const go = (next: number) => {
    setDir(next > step ? 1 : -1);
    setCalculating(next >= RESULT && step < RESULT);
    setStep(Math.min(RESULT, Math.max(0, next)));
    scroller.current?.scrollTo({ top: 0 });
    if (!wide) window.scrollTo({ top: 0 });
  };

  const toggleAttraction = (id: AttractionId) =>
    setInput((s) => ({
      ...s,
      attractions: s.attractions.includes(id)
        ? s.attractions.filter((a) => a !== id)
        : [...s.attractions, id],
    }));

  const preset = SIZE_PRESETS.find(
    (p) => p.length === input.length && p.width === input.width,
  );
  const typeLabel = POOL_TYPES.find((p) => p.id === input.type)!.label;

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-svh overflow-x-clip bg-[#07090d] font-sans text-[#f2f5f9] antialiased [-webkit-tap-highlight-color:transparent]">
        <div className="mx-auto max-w-[1480px] lg:grid lg:h-svh lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-6 lg:p-6">
          {/* ---------------- Scena: uvek vidljiva ---------------- */}
          <section
            aria-label="Vaš bazen"
            className="sticky top-0 z-30 h-[36svh] min-h-[248px] max-h-[340px] overflow-hidden border-b border-white/10 lg:relative lg:h-full lg:max-h-none lg:rounded-[28px] lg:border"
            style={{ background: "#0a0f17" }}
          >
            <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 bg-gradient-to-b from-black/55 to-transparent p-3 pb-8 pt-[max(0.75rem,env(safe-area-inset-top))] lg:p-6 lg:pb-12">
              <div className="flex items-center gap-2.5">
                <span className="grid size-8 place-items-center rounded-lg bg-[#4fd8eb] text-[#04161c] lg:size-9">
                  <Waves className="size-5" strokeWidth={2.4} />
                </span>
                <span className="whitespace-nowrap font-display text-base font-semibold tracking-tight lg:text-lg">
                  Kalkulator bazena
                </span>
              </div>
              <div className="flex min-w-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-white/15 bg-black/60 px-3 py-1.5 text-xs text-[#e3e9f1] lg:bg-black/40 lg:backdrop-blur">
                <MapPin className="size-3.5 shrink-0 text-[#4fd8eb]" />
                <span className="truncate">
                  {input.city.trim() || typeLabel}
                </span>
              </div>
            </div>

            <div className="absolute inset-0">
              <PoolScene
                topPad={wide ? 84 : 52}
                bottomPad={wide ? 112 : 58}
                type={input.type}
                length={input.length}
                width={input.width}
                depth={input.depth}
                heat={input.heat}
                salt={input.salt}
                cover={input.cover}
                attractions={input.attractions}
                light={input.light}
                access={input.access}
                focus={FOCUS[Math.min(step, FOCUS.length - 1)]}
                solved={solved}
                scanning={calculating}
              />
            </div>

            <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-2 p-3 lg:p-6">
              <SceneChip
                label="Bazen"
                value={`${meters(input.length)} × ${meters(input.width)} m`}
                sub={`dubina ${meters(input.depth)} m`}
              />
              {solved ? (
                <SceneChip
                  align="right"
                  label="Okvirna investicija"
                  tone="accent"
                  value={shortRange(result.low, result.high)}
                  sub="bez PDV-a"
                />
              ) : (
                <SceneChip
                  align="right"
                  label="Zapremina"
                  value={
                    <>
                      <Rolling
                        value={result.volume}
                        format={(n) => num(n, n < 100 ? 1 : 0)}
                      />{" "}
                      m³
                    </>
                  }
                  sub={`≈ ${num(Math.round(result.volume) * 1000)} l`}
                />
              )}
            </div>
          </section>

          {/* ---------------- Kviz / rezultat ---------------- */}
          <section
            ref={scroller}
            className="relative flex min-h-[64svh] flex-col lg:h-full lg:min-h-0 lg:overflow-y-auto lg:rounded-[28px] lg:border lg:border-white/10 lg:bg-[#0e1218]"
          >
            {!atResult && (
              <div className="px-5 pt-5 lg:px-9 lg:pt-8">
                <div className="flex items-center justify-between text-xs font-medium text-[#8b97a8]">
                  <span>
                    Korak {step + 1} od {STEPS.length}
                  </span>
                  <span>{STEPS[step]}</span>
                </div>
                <div
                  className="mt-2.5 flex gap-1.5"
                  role="progressbar"
                  aria-valuemin={1}
                  aria-valuemax={STEPS.length}
                  aria-valuenow={step + 1}
                >
                  {STEPS.map((s, i) => (
                    <div
                      key={s}
                      className="h-1 flex-1 overflow-hidden rounded-full bg-white/10"
                    >
                      <motion.div
                        className="h-full rounded-full bg-[#4fd8eb]"
                        initial={false}
                        animate={{ width: i <= step ? "100%" : "0%" }}
                        transition={{ duration: 0.4 }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="shrink-0 grow overflow-x-clip px-5 pb-6 pt-6 lg:px-9 lg:pt-8">
              <AnimatePresence mode="wait" custom={dir} initial={false}>
                <motion.div
                  key={calculating ? "calc" : step}
                  custom={dir}
                  initial={{ opacity: 0, x: dir * 28 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: dir * -28 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                >
                  {step === 0 && (
                    <Step
                      title="Kakav bazen želite?"
                      lead="Izaberite tip. Od njega zavise konstrukcija, filtracija i cena."
                    >
                      <div role="radiogroup" className="grid gap-3">
                        {POOL_TYPES.map((p) => (
                          <TypeCard
                            key={p.id}
                            id={p.id}
                            on={input.type === p.id}
                            onClick={() => set("type", p.id)}
                            title={p.label}
                            hint={p.hint}
                            tag={p.tag}
                          />
                        ))}
                      </div>
                    </Step>
                  )}

                  {step === 1 && (
                    <Step
                      title="Koje dimenzije planirate?"
                      lead="Izaberite standardnu veličinu ili unesite svoju."
                    >
                      <div role="radiogroup" className="grid gap-2.5">
                        {SIZE_PRESETS.map((p) => (
                          <Choice
                            key={p.id}
                            on={!custom && preset?.id === p.id}
                            onClick={() => {
                              setCustom(false);
                              setInput((s) => ({
                                ...s,
                                length: p.length,
                                width: p.width,
                              }));
                            }}
                            icon={<SizeIcon l={p.length} w={p.width} />}
                            title={p.label}
                            hint={p.hint}
                          />
                        ))}
                        <Choice
                          on={custom || !preset}
                          onClick={() => setCustom(true)}
                          icon={<Ruler className="size-5" />}
                          title="Druge dimenzije"
                          hint="Podesite dužinu i širinu po meri placa."
                        />
                      </div>

                      <AnimatePresence initial={false}>
                        {(custom || !preset) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-3 grid gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                              <MeasureSlider
                                label="Dužina"
                                value={input.length}
                                range={LENGTH_RANGE}
                                onChange={(v) => set("length", v)}
                              />
                              <MeasureSlider
                                label="Širina"
                                value={input.width}
                                range={WIDTH_RANGE}
                                onChange={(v) => set("width", v)}
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                        <div className="flex items-baseline justify-between gap-3">
                          <FieldLabel>Dubina vode</FieldLabel>
                          <span className="font-display text-3xl font-semibold tabular-nums tracking-tight">
                            {meters(input.depth)}
                            <span className="ml-1 text-base font-medium text-[#8b97a8]">
                              m
                            </span>
                          </span>
                        </div>
                        <Slider
                          label="Dubina vode"
                          valueText={`${meters(input.depth)} metara`}
                          min={DEPTH_RANGE.min}
                          max={DEPTH_RANGE.max}
                          step={DEPTH_RANGE.step}
                          value={input.depth}
                          onChange={(v) =>
                            set("depth", Math.round(v * 10) / 10)
                          }
                        />
                        <p className="mt-1 text-sm leading-snug text-[#8b97a8]">
                          {input.depth === STANDARD_DEPTH
                            ? "Standard: najčešća dubina za plivanje bez potrebe za spasiocem."
                            : input.depth < STANDARD_DEPTH
                              ? "Plići bazen: idealan za decu i rekreaciju, jeftiniji iskop."
                              : "Dublji bazen: više vode za grejanje i filtraciju, skuplji iskop."}
                        </p>
                      </div>
                      <p className="mt-3 text-sm tabular-nums text-[#8b97a8]">
                        Površina vode{" "}
                        <span className="font-semibold text-[#f2f5f9]">
                          {num(
                            result.area,
                            Number.isInteger(result.area) ? 0 : 1,
                          )}{" "}
                          m²
                        </span>{" "}
                        · zapremina{" "}
                        <span className="font-semibold text-[#f2f5f9]">
                          {num(result.volume, 1)} m³
                        </span>
                      </p>
                    </Step>
                  )}

                  {step === 2 && (
                    <Step
                      title="Koju opremu želite?"
                      lead="Nije obavezno. Opremu uvek možete dodati i kasnije."
                    >
                      <FieldLabel>Grejanje i dezinfekcija</FieldLabel>
                      <div className="grid gap-2.5">
                        <Choice
                          multi
                          on={input.heat}
                          onClick={() => set("heat", !input.heat)}
                          icon={<Flame className="size-5" />}
                          title="Toplotna pumpa"
                          hint="Produžava sezonu kupanja od aprila do oktobra."
                        />
                        <Choice
                          multi
                          on={input.salt}
                          onClick={() => set("salt", !input.salt)}
                          icon={<Droplets className="size-5" />}
                          title="Hidroliza / slana voda"
                          hint="Automatsko hlorisanje, bez mirisa hemikalija."
                        />
                      </div>

                      <div className="mt-6">
                        <FieldLabel>Prekrivka</FieldLabel>
                        <Segmented
                          wrap
                          label="Prekrivka"
                          value={input.cover}
                          onChange={(v) => set("cover", v)}
                          options={[
                            { id: "nema", label: "Bez" },
                            { id: "termo", label: "Termo prekrivač" },
                            { id: "roletna", label: "Auto roletna" },
                          ]}
                        />
                        {input.cover !== "nema" && (
                          <p className="mt-2 text-sm text-[#8b97a8]">
                            {COVERS.find((c) => c.id === input.cover)!.label}:{" "}
                            {COVERS.find(
                              (c) => c.id === input.cover,
                            )!.hint.toLowerCase()}
                          </p>
                        )}
                      </div>

                      <div className="mt-6">
                        <FieldLabel>Vodene atrakcije</FieldLabel>
                        <div className="grid gap-2.5">
                          {ATTRACTIONS.map((a) => (
                            <Choice
                              key={a.id}
                              multi
                              on={input.attractions.includes(a.id)}
                              onClick={() => toggleAttraction(a.id)}
                              icon={
                                a.id === "hidromasaza" ? (
                                  <Sparkles className="size-5" />
                                ) : (
                                  <Wind className="size-5" />
                                )
                              }
                              title={a.label}
                              hint={a.hint}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="mt-6">
                        <FieldLabel>
                          <span className="inline-flex items-center gap-1.5">
                            <Lightbulb className="size-3.5" />
                            Podvodna rasveta
                          </span>
                        </FieldLabel>
                        <Segmented
                          label="Rasveta"
                          value={input.light}
                          onChange={(v) => set("light", v)}
                          options={LIGHTS}
                        />
                      </div>
                    </Step>
                  )}

                  {step === 3 && (
                    <Step
                      title="Gde se nalazi plac?"
                      lead="Ovo inženjeru štedi izlazak na teren i ubrzava ponudu."
                    >
                      <label className="relative block">
                        <span className="sr-only">Grad ili opština</span>
                        <MapPin className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#4fd8eb]" />
                        <input
                          value={input.city}
                          onChange={(e) => set("city", e.target.value)}
                          placeholder="Grad / opština"
                          autoComplete="address-level2"
                          className="min-h-12 w-full rounded-xl border border-white/10 bg-black/30 pl-10 pr-4 text-base text-[#f2f5f9] outline-none placeholder:text-[#6f7a8a] focus:border-[#4fd8eb] focus-visible:ring-2 focus-visible:ring-[#4fd8eb]/40"
                        />
                      </label>

                      <div className="mt-6">
                        <FieldLabel>U kojoj je fazi projekat?</FieldLabel>
                        <div role="radiogroup" className="grid gap-2.5">
                          {PHASES.map((p) => (
                            <Choice
                              key={p.id}
                              on={input.phase === p.id}
                              onClick={() => set("phase", p.id)}
                              icon={
                                p.id === "spreman" ? (
                                  <FileText className="size-5" />
                                ) : p.id === "izgradnja" ? (
                                  <CalendarDays className="size-5" />
                                ) : (
                                  <Info className="size-5" />
                                )
                              }
                              title={p.label}
                              hint={p.hint}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="mt-6">
                        <FieldLabel>
                          Pristup teškoj mehanizaciji (bager, mikser)?
                        </FieldLabel>
                        <Segmented
                          label="Pristup mehanizaciji"
                          value={input.access}
                          onChange={(v) => set("access", v)}
                          options={ACCESS}
                        />
                        <Note>
                          {input.access === "da"
                            ? "Odlično: bager i mikser mogu do iskopa, što je najbrži i najjeftiniji način gradnje."
                            : input.access === "ne"
                              ? "Bez pristupa radimo mini bagerom i pumpom za beton. Izvodljivo je, ali traje duže i košta više."
                              : "Nema problema, inženjer će to proveriti pri obilasku. Procena će imati malo širi raspon."}
                        </Note>
                      </div>
                    </Step>
                  )}

                  {atResult && calculating && (
                    <Calculating
                      dims={`${meters(input.length)}×${meters(input.width)}×${meters(input.depth)} m`}
                      city={input.city.trim()}
                      onDone={() => setCalculating(false)}
                    />
                  )}

                  {solved && (
                    <Results
                      input={input}
                      result={result}
                      onRestart={() => go(0)}
                      onBack={() => go(RESULT - 1)}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {!atResult && (
              <div className="sticky bottom-0 z-20 flex items-center gap-3 border-t border-white/10 bg-[#07090d] px-5 pb-[max(0.875rem,env(safe-area-inset-bottom))] pt-3.5 lg:bg-[#0e1218]/90 lg:px-9 lg:py-5 lg:backdrop-blur">
                <button
                  type="button"
                  onClick={() => go(step - 1)}
                  disabled={step === 0}
                  className="inline-flex min-h-12 items-center gap-2 rounded-xl px-4 text-sm font-medium text-[#aeb8c6] outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-[#4fd8eb] disabled:pointer-events-none disabled:opacity-0"
                >
                  <ArrowLeft className="size-4" />
                  Nazad
                </button>
                <motion.button
                  type="button"
                  onClick={() => go(step + 1)}
                  whileTap={{ scale: 0.98 }}
                  className="ml-auto inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#4fd8eb] px-6 font-semibold text-[#04161c] outline-none transition-colors hover:bg-[#7ae7ff] focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#07090d] sm:flex-none"
                >
                  {step === RESULT - 1 ? "Izračunaj procenu" : "Dalje"}
                  {step === RESULT - 1 ? (
                    <Waves className="size-4" />
                  ) : (
                    <ArrowRight className="size-4" />
                  )}
                </motion.button>
              </div>
            )}
          </section>
        </div>
      </div>
    </MotionConfig>
  );
}

/* ------------------------------------------------------------------ */
/*  Delovi                                                              */
/* ------------------------------------------------------------------ */

function SceneChip({
  label,
  value,
  sub,
  tone = "plain",
  align = "left",
}: {
  label: string;
  value: React.ReactNode;
  sub: string;
  tone?: "plain" | "accent";
  align?: "left" | "right";
}) {
  return (
    <div
      className={cn(
        "whitespace-nowrap rounded-xl border border-white/15 bg-[#07090d]/80 px-2.5 py-1.5 min-[360px]:px-3 lg:rounded-2xl lg:bg-black/50 lg:px-4 lg:py-3 lg:backdrop-blur",
        align === "right" && "text-right",
      )}
    >
      <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#aeb8c6] lg:text-[11px]">
        {label}
      </div>
      <div
        className={cn(
          "flex items-baseline gap-1.5 lg:block",
          align === "right" && "justify-end",
        )}
      >
        <span
          className={cn(
            "font-display text-[15px] font-semibold tabular-nums leading-tight lg:block lg:text-2xl",
            tone === "accent" && "text-[#4fd8eb]",
          )}
        >
          {value}
        </span>
        <span className="text-[11px] tabular-nums text-[#aeb8c6] max-[359px]:hidden lg:block lg:text-xs">
          {sub}
        </span>
      </div>
    </div>
  );
}

function Step({
  title,
  lead,
  children,
}: {
  title: string;
  lead: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h1 className="font-display text-[28px] font-semibold leading-[1.12] tracking-tight text-balance lg:text-4xl">
        {title}
      </h1>
      <p className="mt-2.5 text-base leading-relaxed text-[#8b97a8]">{lead}</p>
      <div className="mt-7">{children}</div>
    </div>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 flex gap-2.5 rounded-xl bg-white/[0.04] p-3.5 text-sm leading-relaxed text-[#aeb8c6]">
      <Info className="mt-0.5 size-4 shrink-0 text-[#4fd8eb]" />
      <span>{children}</span>
    </div>
  );
}

function MeasureSlider({
  label,
  value,
  range,
  onChange,
}: {
  label: string;
  value: number;
  range: { min: number; max: number; step: number };
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <FieldLabel>{label}</FieldLabel>
        <span className="font-display text-xl font-semibold tabular-nums">
          {meters(value)} m
        </span>
      </div>
      <Slider
        label={label}
        valueText={`${meters(value)} metara`}
        min={range.min}
        max={range.max}
        step={range.step}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

/** Ikona veličine: pravougaonik u razmeri bazena. */
function SizeIcon({ l, w }: { l: number; w: number }) {
  const k = 18 / 10;
  return (
    <svg viewBox="0 0 22 22" className="size-6" aria-hidden>
      <rect
        x={11 - (l * k) / 2}
        y={11 - (w * k) / 2}
        width={l * k}
        height={w * k}
        rx={1.5}
        fill="currentColor"
        fillOpacity={0.25}
        stroke="currentColor"
        strokeWidth={1.6}
      />
    </svg>
  );
}

/** Kartica tipa bazena sa malim presekom ivice umesto fotografije. */
function TypeCard({
  id,
  on,
  onClick,
  title,
  hint,
  tag,
}: {
  id: PoolType;
  on: boolean;
  onClick: () => void;
  title: string;
  hint: string;
  tag?: string;
}) {
  return (
    <motion.button
      type="button"
      role="radio"
      aria-checked={on}
      onClick={onClick}
      whileTap={{ scale: 0.985 }}
      className={cn(
        "flex w-full items-center gap-4 rounded-2xl border p-3 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#4fd8eb]",
        on
          ? "border-[#4fd8eb]/70 bg-[#4fd8eb]/[0.08]"
          : "border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.05]",
      )}
    >
      <TypeThumb id={id} on={on} />
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-semibold text-[#f2f5f9]">{title}</span>
          {tag && (
            <span className="rounded-full bg-[#4fd8eb]/15 px-2 py-0.5 text-[11px] font-semibold text-[#4fd8eb]">
              {tag}
            </span>
          )}
        </span>
        <span className="mt-0.5 block text-sm leading-snug text-[#8b97a8]">
          {hint}
        </span>
      </span>
      <Tick on={on} />
    </motion.button>
  );
}

function TypeThumb({ id, on }: { id: PoolType; on: boolean }) {
  const water = on ? "#4fd8eb" : "#3aa9c4";
  return (
    <svg
      viewBox="0 0 96 68"
      aria-hidden
      className="h-[68px] w-24 shrink-0 overflow-hidden rounded-xl"
    >
      <rect
        width={96}
        height={68}
        fill={id === "unutrasnji" ? "#1c2533" : "#1a3a5c"}
      />
      {id !== "unutrasnji" && <circle cx={78} cy={14} r={6} fill="#ffd36b" />}
      {id === "unutrasnji" && (
        <g>
          <path
            d="M6 30 V12 L48 4 L90 12 V30"
            fill="none"
            stroke="#c9c0ae"
            strokeWidth={2.5}
          />
          <rect x={14} y={14} width={14} height={14} fill="#2c4a6b" />
          <rect x={34} y={11} width={14} height={17} fill="#2c4a6b" />
          <rect x={54} y={11} width={14} height={17} fill="#2c4a6b" />
          <rect x={72} y={14} width={10} height={14} fill="#2c4a6b" />
        </g>
      )}
      <rect y={30} width={96} height={38} fill="#6e4d31" />
      <rect y={30} width={96} height={3} fill="#4c7d3e" />
      {/* školjka */}
      <rect x={16} y={30} width={64} height={30} fill="#8d969f" />
      <rect x={20} y={30} width={56} height={26} fill="#c4ecf4" />
      {id === "preliv" ? (
        <g>
          <rect x={20} y={30} width={56} height={26} fill={water} />
          <rect x={8} y={30} width={8} height={8} fill="#5d6a78" />
          <rect x={80} y={30} width={8} height={8} fill="#5d6a78" />
          <rect x={9.5} y={33} width={5} height={4} fill={water} />
          <rect x={81.5} y={33} width={5} height={4} fill={water} />
          <path
            d="M20 30.5 q-2 1 -4.5 3 M76 30.5 q2 1 4.5 3"
            stroke="#e2fbff"
            strokeWidth={1.2}
            fill="none"
          />
        </g>
      ) : (
        <g>
          <rect x={20} y={35} width={56} height={21} fill={water} />
          <path d="M20 35 h56" stroke="#e2fbff" strokeWidth={1} />
          <rect x={66} y={31} width={7} height={5} fill="#e9eef3" />
          <path d="M80 34 h-2 M80 30 v3" stroke="#e9eef3" strokeWidth={1} />
          <text x={86} y={45} fontSize={7} fill="#e2fbff" textAnchor="middle">
            ↕
          </text>
        </g>
      )}
      <path d="M20 56 h56" stroke="#000" strokeOpacity={0.15} />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Obračun: kratka pauza koja rezultatu daje težinu                    */
/* ------------------------------------------------------------------ */

function Calculating({
  dims,
  city,
  onDone,
}: {
  dims: string;
  city: string;
  onDone: () => void;
}) {
  const still = useReducedMotion() ?? false;
  const [p, setP] = useState(0);
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    const controls = animate(0, 1, {
      duration: still ? 1 : 5.2,
      ease: "linear",
      onUpdate: (v) => setP(paced(v)),
      onComplete: () => done.current(),
    });
    return () => controls.stop();
  }, [still]);

  const lines = [
    "Analiziramo tip i namenu bazena",
    `Računamo iskop i armirani beton · ${dims}`,
    "Biramo filtraciju i dodatnu opremu",
    `Procenjujemo pristup terenu${city ? ` · ${city}` : ""}`,
  ];
  const active = Math.min(lines.length - 1, Math.floor(p * lines.length));
  const R = 58;
  const LEN = 2 * Math.PI * R;

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center py-2 text-center lg:min-h-[70svh] lg:justify-center lg:py-6"
    >
      <div className="relative size-28 lg:size-40">
        <motion.div
          className="absolute inset-0 rounded-full bg-[#4fd8eb]/20 blur-2xl"
          animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1.05, 0.9] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        />
        <svg viewBox="0 0 140 140" className="relative size-full -rotate-90">
          <defs>
            <linearGradient id="pool-calc-ring" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#2aa8ff" />
              <stop offset="1" stopColor="#a8f0ff" />
            </linearGradient>
          </defs>
          <circle
            cx={70}
            cy={70}
            r={R}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={6}
          />
          <circle
            cx={70}
            cy={70}
            r={R}
            fill="none"
            stroke="url(#pool-calc-ring)"
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray={LEN}
            strokeDashoffset={LEN * (1 - p)}
          />
        </svg>
        <motion.div
          className="absolute inset-3"
          animate={{ rotate: 360 }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "linear" }}
        >
          <span className="absolute left-1/2 top-0 size-1.5 -translate-x-1/2 rounded-full bg-[#a8f0ff] shadow-[0_0_10px_2px_rgba(79,216,235,0.8)]" />
        </motion.div>
        <div className="absolute inset-0 grid place-items-center">
          <span className="font-display text-3xl font-semibold tabular-nums tracking-tight lg:text-4xl">
            {Math.round(p * 100)}
            <span className="text-xl text-[#8b97a8]">%</span>
          </span>
        </div>
      </div>

      <h1 className="mt-5 font-display text-2xl font-semibold tracking-tight lg:mt-7 lg:text-3xl">
        Pravimo procenu za vaš bazen
      </h1>
      <p className="mt-1.5 text-sm text-[#8b97a8]">Još samo nekoliko sekundi</p>

      <ul className="mt-5 w-full max-w-sm space-y-2.5 text-left lg:mt-7">
        {lines.map((line, i) => {
          const state =
            p >= 1 || i < active ? "done" : i === active ? "now" : "next";
          return (
            <motion.li
              key={line}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: state === "next" ? 0.4 : 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="flex items-center gap-3 text-[15px]"
            >
              <span
                className={cn(
                  "grid size-6 shrink-0 place-items-center rounded-full border transition-colors duration-300",
                  state === "done"
                    ? "border-[#3ddc97] bg-[#3ddc97] text-[#0b0d10]"
                    : state === "now"
                      ? "border-[#4fd8eb] text-[#4fd8eb]"
                      : "border-white/15 text-transparent",
                )}
              >
                {state === "done" ? (
                  <Check className="size-3.5" strokeWidth={3.5} />
                ) : state === "now" ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : null}
              </span>
              <span
                className={cn(
                  "min-w-0",
                  state === "now" ? "text-[#f2f5f9]" : "text-[#aeb8c6]",
                )}
              >
                {line}
              </span>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}

/** Četiri koraka: svaki krene brzo pa uspori pred kraj, poslednji se zatvara do 100%. */
function paced(v: number) {
  const n = 4;
  const i = Math.min(n - 1, Math.floor(v * n));
  const local = v * n - i;
  const eased = 1 - Math.pow(1 - local, 2.4);
  return (i + eased) / n;
}

/* ------------------------------------------------------------------ */
/*  Rezultat                                                            */
/* ------------------------------------------------------------------ */

function equipmentPhrase(i: PoolInput) {
  const premium =
    i.heat ||
    i.cover === "roletna" ||
    i.attractions.length > 0 ||
    i.type === "preliv";
  if (i.heat) return "premijum opreme sa toplotnom pumpom";
  if (premium) return "odabrane premijum opreme";
  if (i.salt || i.cover !== "nema" || i.light !== "nema")
    return "odabrane opreme";
  return "osnovne opreme sa filtracijom";
}

function Results({
  input,
  result,
  onRestart,
  onBack,
}: {
  input: PoolInput;
  result: PoolResult;
  onRestart: () => void;
  onBack: () => void;
}) {
  const reveal = (i: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: {
      delay: 0.15 + i * 0.08,
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  });

  const parts = [
    {
      label: "Građevinski radovi",
      hint: "iskop, armirani beton, hidroizolacija, obloga",
      value: result.construction,
      color: "#2aa8ff",
    },
    {
      label: "Filtracija i instalacije",
      hint: "pumpa, filter, skimeri, cevi, šaht",
      value: result.filtration,
      color: "#4fd8eb",
    },
    {
      label: "Dodatna oprema",
      hint: "grejanje, dezinfekcija, prekrivka, atrakcije, rasveta",
      value: result.equipment,
      color: "#a8f0ff",
    },
  ].filter((p) => p.value > 0);
  const dims = `${meters(input.length)}×${meters(input.width)} m`;

  const siteNote =
    input.access === "ne"
      ? "Bez pristupa mehanizaciji računali smo mini bager i pumpu za beton, pa je procena viša. Inženjer će na terenu proveriti najbolji pristup."
      : input.access === "nesiguran"
        ? "Pristup terenu nije potvrđen, pa je gornja granica malo viša. Konačnu cenu potvrđujemo posle obilaska placa."
        : input.phase === "planiram"
          ? "U fazi planiranja ovo je dobar okvir za budžet. Tačnu cenu određuju sastav zemljišta i iskop."
          : "Konačna cena zavisi od sastava zemljišta, iskopa i pristupa terenu, zato prikazujemo raspon.";

  return (
    <div>
      <motion.p
        {...reveal(0)}
        className="text-sm font-semibold uppercase tracking-[0.12em] text-[#4fd8eb]"
      >
        Vaša procena
      </motion.p>
      <motion.h1
        {...reveal(1)}
        className="mt-3 font-display text-2xl font-semibold leading-tight tracking-tight text-[#c6cfdb] lg:text-3xl"
      >
        Okvirna investicija
      </motion.h1>
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 140, damping: 16 }}
        className="mt-1 flex origin-left flex-wrap items-baseline gap-x-3 bg-gradient-to-br from-[#e2fbff] via-[#4fd8eb] to-[#2aa8ff] bg-clip-text font-display text-[44px] font-semibold leading-[1.05] tracking-tighter tabular-nums text-transparent min-[400px]:text-[52px] lg:text-[64px]"
      >
        <Rolling
          fromZero
          duration={1.6}
          value={result.low}
          format={(v) => num(Math.round(v / 100) * 100)}
        />
        <span>–</span>
        <span className="whitespace-nowrap">
          <Rolling
            fromZero
            duration={1.8}
            value={result.high}
            format={(v) => num(Math.round(v / 100) * 100)}
          />{" "}
          €
        </span>
      </motion.div>
      <motion.p {...reveal(3)} className="mt-3 leading-relaxed text-[#aeb8c6]">
        Na osnovu odabranih dimenzija{" "}
        <span className="font-semibold text-[#f2f5f9]">({dims})</span> i{" "}
        {equipmentPhrase(input)}, okvirna procena investicije je{" "}
        <span className="font-semibold text-[#f2f5f9]">
          {eur(result.low)} – {eur(result.high)}
        </span>
        .
      </motion.p>

      {/* Od čega se sastoji */}
      <motion.div {...reveal(4)} className="mt-6">
        <div className="flex h-3 gap-0.5 overflow-hidden rounded-full bg-white/10">
          {parts.map((p, i) => (
            <motion.div
              key={p.label}
              className="h-full first:rounded-l-full last:rounded-r-full"
              style={{ background: p.color }}
              initial={{ width: 0 }}
              animate={{ width: `${(p.value / result.mid) * 100}%` }}
              transition={{
                delay: 0.6 + i * 0.25,
                duration: 0.9,
                ease: [0.16, 1, 0.3, 1],
              }}
            />
          ))}
        </div>
        <ul className="mt-3 space-y-2">
          {parts.map((p) => (
            <li key={p.label} className="flex items-start gap-2.5 text-sm">
              <span
                className="mt-1.5 size-2 shrink-0 rounded-full"
                style={{ background: p.color }}
              />
              <span className="min-w-0 flex-1">
                <span className="text-[#e3e9f1]">{p.label}</span>
                <span className="block text-xs text-[#8b97a8]">{p.hint}</span>
              </span>
              <span className="tabular-nums text-[#aeb8c6]">
                {num((p.value / result.mid) * 100)}%
              </span>
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Ključne brojke */}
      <div className="mt-7 grid grid-cols-2 gap-3">
        <Stat
          {...reveal(5)}
          label="Površina vode"
          value={`${num(result.area, Number.isInteger(result.area) ? 0 : 1)} m²`}
          sub={`${dims}, dubina ${meters(input.depth)} m`}
          icon={<Ruler className="size-4 text-[#4fd8eb]" />}
        />
        <Stat
          {...reveal(6)}
          label="Zapremina"
          value={`${num(result.volume, 1)} m³`}
          sub={`≈ ${num(Math.round(result.volume) * 1000)} litara`}
          icon={<Droplets className="size-4 text-[#4fd8eb]" />}
        />
        <Stat
          {...reveal(7)}
          label="Sezona kupanja"
          tone="accent"
          value={result.season}
          sub={
            result.seasonMonths === 12
              ? "grejana voda, kupanje bez pauze"
              : `≈ ${result.seasonMonths} meseci godišnje`
          }
          icon={<CalendarDays className="size-4 text-[#4fd8eb]" />}
        />
        <Stat
          {...reveal(8)}
          label="Izvođenje"
          value={`${result.weeks[0]}–${result.weeks[1]} nedelja`}
          sub="od iskopa do prvog kupanja"
          icon={<Clock className="size-4 text-[#4fd8eb]" />}
        />
      </div>

      <Note>{siteNote}</Note>

      <LeadForm input={input} result={result} reveal={reveal(9)} />

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-medium text-[#aeb8c6] outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-[#4fd8eb]"
        >
          <ArrowLeft className="size-4" />
          Izmeni odgovore
        </button>
        <button
          type="button"
          onClick={onRestart}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-medium text-[#aeb8c6] outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-[#4fd8eb]"
        >
          <RotateCcw className="size-4" />
          Počni ispočetka
        </button>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-[#6f7a8a]">
        Procena je informativna i odnosi se na armirano-betonski bazen ključ u
        ruke, bez PDV-a. Tačna cena zavisi od sastava zemljišta, iskopa,
        pristupa terenu i izbora završne obloge.
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  tone,
  icon,
  ...motionProps
}: {
  label: string;
  value: React.ReactNode;
  sub: string;
  tone?: "accent";
  icon?: React.ReactNode;
} & React.ComponentProps<typeof motion.div>) {
  return (
    <motion.div
      {...motionProps}
      className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
    >
      <div className="flex items-center gap-1.5 text-xs font-medium text-[#8b97a8]">
        {icon}
        {label}
      </div>
      <div
        className={cn(
          "mt-1.5 font-display text-lg font-semibold tabular-nums leading-tight tracking-tight lg:text-xl",
          tone === "accent" ? "text-[#4fd8eb]" : "text-[#f2f5f9]",
        )}
      >
        {value}
      </div>
      <div className="mt-1 text-xs leading-snug tabular-nums text-[#8b97a8]">
        {sub}
      </div>
    </motion.div>
  );
}

/** Stavke iz troškovnika koje dobijaju tek u PDF-u; ovde su zamagljene. */
function specLines(i: PoolInput) {
  const l = [
    "Iskop i odvoz zemlje",
    "Armirano-betonska školjka",
    "Hidroizolacija i obloga",
    "Pumpa i peščani filter",
  ];
  if (i.heat) l.push("Toplotna pumpa");
  if (i.salt) l.push("Hidroliza (slana voda)");
  if (i.cover !== "nema")
    l.push(i.cover === "roletna" ? "Podvodna roletna" : "Termo prekrivač");
  if (i.light !== "nema")
    l.push(i.light === "rgb" ? "RGB LED reflektori" : "LED reflektori");
  return l.slice(0, 6);
}

function LeadForm({
  input,
  result,
  reveal,
}: {
  input: PoolInput;
  result: PoolResult;
  reveal: React.ComponentProps<typeof motion.div>;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">(
    "idle",
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === "sending") return;
    setState("sending");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "bazen-kalkulator",
          name: name.trim(),
          phone: phone.trim(),
          contact: email.trim() || undefined,
          answers: input,
          estimate: {
            low: result.low,
            high: result.high,
            area: result.area,
            volume: Math.round(result.volume * 10) / 10,
          },
        }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  };

  const field =
    "min-h-12 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-base text-[#f2f5f9] outline-none placeholder:text-[#6f7a8a] focus:border-[#4fd8eb] focus-visible:ring-2 focus-visible:ring-[#4fd8eb]/40";

  return (
    <motion.div
      {...reveal}
      className="mt-6 overflow-hidden rounded-2xl border border-[#4fd8eb]/30 bg-[#4fd8eb]/[0.06]"
    >
      {state === "done" ? (
        <div className="flex items-start gap-3 p-4 lg:p-5">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#3ddc97] text-[#0b0d10]">
            <Check className="size-5" strokeWidth={3} />
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold">
              Hvala, ponuda stiže u roku od 24h
            </h2>
            <p className="mt-0.5 text-sm text-[#aeb8c6]">
              Pripremamo tehničku specifikaciju i troškovnik za bazen{" "}
              {meters(input.length)}×{meters(input.width)} m. Javićemo vam se i
              telefonom.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Pregled PDF-a: vidi se šta dobijaju, brojke tek posle forme */}
          <div className="border-b border-white/10 bg-black/20 p-4 lg:p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#8b97a8]">
              <FileText className="size-4 text-[#4fd8eb]" />
              Predkalkulacija · troškovnik materijala
            </div>
            <ul className="mt-3 space-y-1.5">
              {specLines(input).map((l, i) => (
                <li
                  key={l}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="text-[#aeb8c6]">{l}</span>
                  <span
                    aria-hidden
                    className="select-none tabular-nums text-[#e3e9f1] blur-[5px]"
                  >
                    {num(1200 + ((i * 1733) % 4100))} €
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-[#8b97a8]">
              <Lock className="size-3.5" />
              Kompletan troškovnik dobijate u PDF ponudi
            </div>
          </div>

          <form onSubmit={submit} className="p-4 lg:p-5">
            <h2 className="font-display text-lg font-semibold leading-snug">
              Želite kompletnu tehničku specifikaciju opreme i preciznu
              predkalkulaciju sa troškovnikom materijala?
            </h2>
            <p className="mb-4 mt-1 text-sm text-[#aeb8c6]">
              Unesite podatke i šaljemo vam PDF ponudu u roku od 24h.
            </p>
            <div className="grid gap-2.5">
              <input
                required
                aria-label="Ime i prezime"
                placeholder="Ime i prezime"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={field}
              />
              <div className="grid gap-2.5 sm:grid-cols-2">
                <input
                  required
                  type="tel"
                  inputMode="tel"
                  aria-label="Broj telefona (obavezno)"
                  placeholder="Broj telefona *"
                  autoComplete="tel"
                  pattern="[0-9+ /\-]{6,}"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={field}
                />
                <input
                  type="email"
                  inputMode="email"
                  aria-label="Email adresa"
                  placeholder="Email adresa"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={field}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={state === "sending"}
              className="mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#4fd8eb] px-6 font-semibold text-[#04161c] outline-none transition-colors hover:bg-[#7ae7ff] focus-visible:ring-2 focus-visible:ring-white disabled:opacity-70"
            >
              {state === "sending" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Layers className="size-4" />
              )}
              Pošaljite mi PDF ponudu
            </button>
            {state === "error" && (
              <p role="alert" className="mt-2 text-sm text-[#ff8f7a]">
                Slanje nije uspelo. Pokušajte ponovo.
              </p>
            )}
          </form>
        </>
      )}
    </motion.div>
  );
}
