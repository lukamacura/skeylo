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
  BatteryCharging,
  Building2,
  Car,
  Check,
  Fan,
  Home,
  Info,
  Leaf,
  Loader2,
  MapPin,
  Moon,
  RotateCcw,
  Scale,
  Sun,
  SunMoon,
  Zap,
} from "lucide-react";
import {
  AREA_RANGE,
  BILL_RANGE,
  EXTRAS,
  LEGAL_CAP_KWP,
  LIFETIME_YEARS,
  ORIENTATIONS,
  REGIONS,
  USAGES,
  billFromKwh,
  calculate,
  eur,
  kwhFromBill,
  num,
  rsdRound,
  type BillUnit,
  type CustomerType,
  type ExtraId,
  type SolarInput,
  type SolarResult,
} from "@/lib/solar";
import HouseScene from "./HouseScene";
import PaybackChart, { shortRsd } from "./PaybackChart";

/* ------------------------------------------------------------------ */
/*  Pomoćne                                                             */
/* ------------------------------------------------------------------ */

const STEPS = [
  "Račun",
  "Tip korisnika",
  "Objekat",
  "Lokacija",
  "Navike",
  "Dodaci",
] as const;
const RESULT = STEPS.length;

const DEFAULT_AREA = { fizicko: 120, pravno: 800 } as const;

function cn(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

/** Klizač računa je logaritamski: isti hod pokriva i 3.000 i 300.000 RSD. */
function billToPos(value: number, unit: BillUnit) {
  const { min, max } = BILL_RANGE[unit];
  return Math.round((Math.log(value / min) / Math.log(max / min)) * 1000);
}

function posToBill(pos: number, unit: BillUnit) {
  const { min, max } = BILL_RANGE[unit];
  return roundBill(min * Math.pow(max / min, pos / 1000), unit);
}

function roundBill(v: number, unit: BillUnit) {
  const { min, max } = BILL_RANGE[unit];
  const step =
    unit === "rsd"
      ? v < 20000
        ? 100
        : v < 100000
          ? 500
          : 5000
      : v < 1000
        ? 10
        : v < 5000
          ? 50
          : 250;
  return Math.min(max, Math.max(min, Math.round(v / step) * step));
}

/** "8,4 godine" / "7 godina" / "1 godinu" */
function yearsLabel(v: number) {
  const r = Math.round(v * 10) / 10;
  if (!Number.isInteger(r)) return "godine";
  const d = r % 10;
  const dd = r % 100;
  if (d === 1 && dd !== 11) return "godinu";
  if (d >= 2 && d <= 4 && (dd < 12 || dd > 14)) return "godine";
  return "godina";
}

function yearsText(v: number) {
  const r = Math.round(v * 10) / 10;
  return num(r, Number.isInteger(r) ? 0 : 1);
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
        className="pointer-events-none absolute left-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-gradient-to-r from-[#ff9f1a] to-[#ffc53d]"
        style={{ width: `calc(14px + (100% - 28px) * ${t})` }}
      />
      <div
        className="pointer-events-none absolute top-1/2 size-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-[#ffc53d] bg-[#0e1218] shadow-[0_0_0_6px_rgba(255,197,61,0.14)] transition-shadow peer-hover:shadow-[0_0_0_9px_rgba(255,197,61,0.18)] peer-focus-visible:shadow-[0_0_0_4px_#07090d,0_0_0_7px_#ffc53d] peer-active:shadow-[0_0_0_11px_rgba(255,197,61,0.2)]"
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
  /** Na uskim ekranima lomi opcije u dva reda umesto da ih sabija. */
  wrap?: boolean;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        "grid gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1",
        wrap
          ? "grid-cols-2 sm:auto-cols-fr sm:grid-flow-col sm:grid-cols-none"
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
              "relative min-h-10 min-w-0 rounded-lg px-1.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#ffc53d]",
              on ? "text-[#0b0d10]" : "text-[#aeb8c6] hover:text-white",
            )}
          >
            {on && (
              <motion.span
                layoutId={`seg-${label}`}
                className="absolute inset-0 rounded-lg bg-[#ffc53d]"
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
  meta,
  multi = false,
}: {
  on: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  hint: string;
  meta?: React.ReactNode;
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
        "group flex w-full items-center gap-4 rounded-2xl border p-4 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#ffc53d]",
        on
          ? "border-[#ffc53d]/70 bg-[#ffc53d]/[0.08]"
          : "border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.05]",
      )}
    >
      <span
        className={cn(
          "grid size-11 shrink-0 place-items-center rounded-xl transition-colors",
          on ? "bg-[#ffc53d] text-[#0b0d10]" : "bg-white/[0.06] text-[#ffc53d]",
        )}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-[#f2f5f9]">{title}</span>
        <span className="mt-0.5 block text-sm leading-snug text-[#8b97a8]">
          {hint}
        </span>
      </span>
      {meta}
      <span
        className={cn(
          "grid size-6 shrink-0 place-items-center border transition-colors",
          multi ? "rounded-md" : "rounded-full",
          on
            ? "border-[#ffc53d] bg-[#ffc53d] text-[#0b0d10]"
            : "border-white/20 text-transparent",
        )}
      >
        <Check className="size-4" strokeWidth={3} />
      </span>
    </motion.button>
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

export default function SolarCalculator() {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [roofTouched, setRoofTouched] = useState(false);
  const [input, setInput] = useState<SolarInput>({
    billUnit: "rsd",
    billValue: 8000,
    type: "fizicko",
    area: DEFAULT_AREA.fizicko,
    floors: 1,
    roof: "kos",
    orientation: "jug",
    region: "beograd",
    usage: "ravnomerno",
    extras: [],
    subsidy: 0,
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

  const set = <K extends keyof SolarInput>(key: K, value: SolarInput[K]) =>
    setInput((s) => ({ ...s, [key]: value }));

  const result = useMemo(() => calculate(input), [input]);
  const region = REGIONS.find((r) => r.id === input.region) ?? REGIONS[1];
  const [calculating, setCalculating] = useState(false);
  const atResult = step === RESULT;
  const solved = atResult && !calculating;

  const go = (next: number) => {
    setDir(next > step ? 1 : -1);
    // Svaki dolazak na rezultat prolazi kroz obračun.
    setCalculating(next >= RESULT && step < RESULT);
    setStep(Math.min(RESULT, Math.max(0, next)));
    scroller.current?.scrollTo({ top: 0 });
    if (!wide) window.scrollTo({ top: 0 });
  };

  const setType = (type: CustomerType) =>
    setInput((s) =>
      s.type === type
        ? s
        : {
            ...s,
            type,
            area: DEFAULT_AREA[type],
            floors: 1,
            roof: roofTouched ? s.roof : type === "pravno" ? "ravan" : "kos",
          },
    );

  const setUnit = (unit: BillUnit) =>
    setInput((s) => {
      if (s.billUnit === unit) return s;
      const v =
        unit === "kwh"
          ? kwhFromBill(s.billValue, s.type)
          : billFromKwh(s.billValue, s.type);
      return { ...s, billUnit: unit, billValue: roundBill(v, unit) };
    });

  const toggleExtra = (id: ExtraId) =>
    setInput((s) => ({
      ...s,
      extras: s.extras.includes(id)
        ? s.extras.filter((e) => e !== id)
        : [...s.extras, id],
    }));

  const billCap = input.type === "fizicko" ? 40000 : 400000;
  const billLevel = Math.min(
    1,
    Math.max(0, Math.log(result.monthlyBill / 2000) / Math.log(billCap / 2000)),
  );
  const sunLevel = (region.yield - 1220) / (1350 - 1220);
  const areaRange = AREA_RANGE[input.type];

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-svh overflow-x-clip bg-[#07090d] font-sans text-[#f2f5f9] antialiased [-webkit-tap-highlight-color:transparent]">
        <div className="mx-auto max-w-[1480px] lg:grid lg:h-svh lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-6 lg:p-6">
          {/* ---------------- Scena: uvek vidljiva ---------------- */}
          <section
            aria-label="Vaš objekat"
            className="sticky top-0 z-30 h-[36svh] min-h-[248px] max-h-[340px] lg:max-h-none overflow-hidden border-b border-white/10 lg:relative lg:h-full lg:rounded-[28px] lg:border"
            style={{ background: "#0a0f17" }}
          >
            <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 bg-gradient-to-b from-black/55 to-transparent p-3 pb-8 pt-[max(0.75rem,env(safe-area-inset-top))] lg:p-6 lg:pb-12">
              <div className="flex items-center gap-2.5">
                <span className="grid size-8 place-items-center rounded-lg bg-[#ffc53d] text-[#0b0d10] lg:size-9">
                  <Sun className="size-5" strokeWidth={2.4} />
                </span>
                <span className="whitespace-nowrap font-display text-base font-semibold tracking-tight lg:text-lg">
                  Kalkulator uštede
                </span>
              </div>
              <div className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-white/15 bg-black/60 px-3 py-1.5 text-xs text-[#e3e9f1] lg:bg-black/40 lg:backdrop-blur">
                <MapPin className="size-3.5 text-[#ffc53d]" />
                <span>{region.label}</span>
                <span className="hidden text-white/25 sm:inline">·</span>
                <span className="hidden tabular-nums sm:inline">
                  {num(region.yield)} kWh/kWp
                </span>
              </div>
            </div>

            <div className="absolute inset-0">
              <HouseScene
                topPad={wide ? 84 : 52}
                bottomPad={wide ? 112 : 58}
                type={input.type}
                area={input.area}
                floors={input.floors}
                roof={input.roof}
                usage={input.usage}
                extras={input.extras}
                panels={result.panels}
                billLevel={billLevel}
                sunLevel={sunLevel}
                solved={solved}
                scanning={calculating}
              />
            </div>

            <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-2 p-3 lg:p-6">
              <SceneChip
                label="Na krovu"
                value={
                  <>
                    <Rolling
                      value={result.panels}
                      format={(n) => num(Math.round(n))}
                    />{" "}
                    {result.panels === 1 ? "panel" : "panela"}
                  </>
                }
                sub={`${num(result.kwp, 1)} kWp`}
              />
              <SceneChip
                align="right"
                label={solved ? "Novi račun" : "Račun sada"}
                tone={solved ? "green" : "amber"}
                value={
                  <Rolling
                    value={solved ? result.newMonthlyBill : result.monthlyBill}
                    format={(n) => rsdRound(n)}
                  />
                }
                sub="mesečno"
              />
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
                        className="h-full rounded-full bg-[#ffc53d]"
                        initial={false}
                        animate={{ width: i <= step ? "100%" : "0%" }}
                        transition={{ duration: 0.4 }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex-1 overflow-hidden px-5 pb-6 pt-6 lg:px-9 lg:pt-8">
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
                      title="Koliko mesečno trošite na struju?"
                      lead="Uzmite prosek sa poslednjih nekoliko računa."
                    >
                      <div className="mb-6 max-w-[240px]">
                        <Segmented
                          label="Jedinica"
                          value={input.billUnit}
                          onChange={setUnit}
                          options={[
                            { id: "rsd", label: "RSD" },
                            { id: "kwh", label: "kWh" },
                          ]}
                        />
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-display text-6xl font-semibold tabular-nums tracking-tight lg:text-7xl">
                          {num(input.billValue)}
                        </span>
                        <span className="text-xl font-medium text-[#8b97a8]">
                          {input.billUnit === "rsd" ? "RSD" : "kWh"}
                        </span>
                      </div>
                      <p className="mt-1 text-sm tabular-nums text-[#8b97a8]">
                        {input.billUnit === "rsd"
                          ? `≈ ${num(Math.round(result.monthlyKwh / 10) * 10)} kWh mesečno`
                          : `≈ ${rsdRound(result.monthlyBill)} mesečno`}
                      </p>
                      <div className="mt-6">
                        <Slider
                          label="Mesečna potrošnja"
                          valueText={`${num(input.billValue)} ${input.billUnit}`}
                          min={0}
                          max={1000}
                          step={1}
                          value={billToPos(input.billValue, input.billUnit)}
                          onChange={(p) =>
                            set("billValue", posToBill(p, input.billUnit))
                          }
                        />
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {(input.billUnit === "rsd"
                          ? [4000, 8000, 15000, 30000, 100000]
                          : [300, 600, 1000, 2000, 6000]
                        ).map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => set("billValue", v)}
                            className={cn(
                              "min-h-9 rounded-full border px-3.5 text-sm tabular-nums outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#ffc53d]",
                              input.billValue === v
                                ? "border-[#ffc53d]/70 bg-[#ffc53d]/10 text-[#ffc53d]"
                                : "border-white/10 text-[#aeb8c6] hover:border-white/25 hover:text-white",
                            )}
                          >
                            {num(v)}
                          </button>
                        ))}
                      </div>
                    </Step>
                  )}

                  {step === 1 && (
                    <Step
                      title="Da li ste fizičko ili pravno lice?"
                      lead="Od toga zavisi model obračuna sa snabdevačem i dozvoljena snaga."
                    >
                      <div role="radiogroup" className="grid gap-3">
                        <Choice
                          on={input.type === "fizicko"}
                          onClick={() => setType("fizicko")}
                          icon={<Home className="size-5" />}
                          title="Fizičko lice"
                          hint={`Domaćinstvo · neto merenje · do ${num(LEGAL_CAP_KWP.fizicko, 1)} kW`}
                        />
                        <Choice
                          on={input.type === "pravno"}
                          onClick={() => setType("pravno")}
                          icon={<Building2 className="size-5" />}
                          title="Pravno lice"
                          hint={`Firma ili preduzetnik · neto obračun · do ${num(LEGAL_CAP_KWP.pravno)} kW`}
                        />
                      </div>
                      <Note>
                        {input.type === "fizicko"
                          ? "Kod neto merenja višak struje odlazi u mrežu i umanjuje vam naredne račune, kilovat za kilovat."
                          : "Kod neto obračuna višak prodajete snabdevaču, pa se sistem dimenzioniše prema dnevnoj potrošnji."}
                      </Note>
                    </Step>
                  )}

                  {step === 2 && (
                    <Step
                      title="Kolika je površina objekta?"
                      lead="Ukupna kvadratura. Od nje i od krova zavisi koliko panela staje."
                    >
                      <div className="flex items-baseline gap-2">
                        <span className="font-display text-6xl font-semibold tabular-nums tracking-tight">
                          {num(input.area)}
                        </span>
                        <span className="text-xl font-medium text-[#8b97a8]">
                          m²
                        </span>
                      </div>
                      <div className="mt-4">
                        <Slider
                          label="Površina objekta"
                          valueText={`${input.area} kvadrata`}
                          min={areaRange.min}
                          max={areaRange.max}
                          step={areaRange.step}
                          value={input.area}
                          onChange={(v) => set("area", v)}
                        />
                      </div>

                      <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                        <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
                          <Scale className="size-4 text-[#ffc53d]" />
                          Fino podešavanje
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <FieldLabel>Da li je krov ravan?</FieldLabel>
                            <Segmented
                              label="Tip krova"
                              value={input.roof}
                              onChange={(v) => {
                                setRoofTouched(true);
                                set("roof", v);
                              }}
                              options={[
                                { id: "kos", label: "Ne, kos" },
                                { id: "ravan", label: "Da, ravan" },
                              ]}
                            />
                          </div>
                          <div>
                            <FieldLabel>Spratnost</FieldLabel>
                            <Segmented
                              label="Spratnost"
                              value={input.floors}
                              onChange={(v) => set("floors", v)}
                              options={[
                                { id: 1, label: "Prizemlje" },
                                { id: 2, label: "+1 sprat" },
                                { id: 3, label: "+2" },
                              ]}
                            />
                          </div>
                        </div>
                        <AnimatePresence initial={false}>
                          {input.roof === "kos" && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="pt-4">
                                <FieldLabel>
                                  Na koju stranu gleda krov?
                                </FieldLabel>
                                <Segmented
                                  wrap
                                  label="Orijentacija krova"
                                  value={input.orientation}
                                  onChange={(v) => set("orientation", v)}
                                  options={ORIENTATIONS.map((o) => ({
                                    id: o.id,
                                    label: o.label,
                                  }))}
                                />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <p className="mt-3 text-sm tabular-nums text-[#8b97a8]">
                        Na ovaj krov staje najviše{" "}
                        <span className="font-semibold text-[#f2f5f9]">
                          {num(result.roofPanelsMax)} panela
                        </span>
                        .
                      </p>
                    </Step>
                  )}

                  {step === 3 && (
                    <Step
                      title="Gde se objekat nalazi?"
                      lead="Jug Srbije ima i do 10% više sunca od severa."
                    >
                      <div
                        role="radiogroup"
                        className="grid gap-2.5 sm:grid-cols-2"
                      >
                        {REGIONS.map((r) => {
                          const on = r.id === input.region;
                          const level = (r.yield - 1150) / (1350 - 1150);
                          return (
                            <button
                              key={r.id}
                              type="button"
                              role="radio"
                              aria-checked={on}
                              onClick={() => set("region", r.id)}
                              className={cn(
                                "rounded-2xl border p-4 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#ffc53d]",
                                on
                                  ? "border-[#ffc53d]/70 bg-[#ffc53d]/[0.08]"
                                  : "border-white/10 bg-white/[0.03] hover:border-white/25",
                              )}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-semibold">{r.label}</span>
                                <span className="text-xs tabular-nums text-[#8b97a8]">
                                  {num(r.yield)} kWh/kWp
                                </span>
                              </div>
                              <div className="mt-0.5 text-sm text-[#8b97a8]">
                                {r.cities}
                              </div>
                              <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-[#ff9f1a] to-[#ffc53d]"
                                  style={{ width: `${level * 100}%` }}
                                />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </Step>
                  )}

                  {step === 4 && (
                    <Step
                      title="Kada trošite najviše struje?"
                      lead="Što više trošite dok sunce sija, to se sistem brže isplati."
                    >
                      <div role="radiogroup" className="grid gap-3">
                        {USAGES.map((u) => (
                          <Choice
                            key={u.id}
                            on={input.usage === u.id}
                            onClick={() => set("usage", u.id)}
                            icon={
                              u.id === "danju" ? (
                                <Sun className="size-5" />
                              ) : u.id === "uvece" ? (
                                <Moon className="size-5" />
                              ) : (
                                <SunMoon className="size-5" />
                              )
                            }
                            title={u.label}
                            hint={u.hint}
                          />
                        ))}
                      </div>
                    </Step>
                  )}

                  {step === 5 && (
                    <Step
                      title="Imate li ili planirate nešto od ovoga?"
                      lead="Nije obavezno. Veći potrošači traže jači sistem."
                    >
                      <div className="grid gap-3">
                        {EXTRAS.map((e) => (
                          <Choice
                            key={e.id}
                            multi
                            on={input.extras.includes(e.id)}
                            onClick={() => toggleExtra(e.id)}
                            icon={
                              e.id === "baterija" ? (
                                <BatteryCharging className="size-5" />
                              ) : e.id === "auto" ? (
                                <Car className="size-5" />
                              ) : (
                                <Fan className="size-5" />
                              )
                            }
                            title={e.label}
                            hint={e.hint}
                          />
                        ))}
                      </div>
                    </Step>
                  )}

                  {atResult && calculating && (
                    <Calculating
                      region={region.label}
                      business={input.type === "pravno"}
                      onDone={() => setCalculating(false)}
                    />
                  )}

                  {solved && (
                    <Results
                      input={input}
                      result={result}
                      onSubsidy={(v) => set("subsidy", v)}
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
                  className="inline-flex min-h-12 items-center gap-2 rounded-xl px-4 text-sm font-medium text-[#aeb8c6] outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-[#ffc53d] disabled:pointer-events-none disabled:opacity-0"
                >
                  <ArrowLeft className="size-4" />
                  Nazad
                </button>
                <motion.button
                  type="button"
                  onClick={() => go(step + 1)}
                  whileTap={{ scale: 0.98 }}
                  className="ml-auto inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#ffc53d] px-6 font-semibold text-[#0b0d10] outline-none transition-colors hover:bg-[#ffd15f] focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#07090d] sm:flex-none"
                >
                  {step === RESULT - 1 ? "Izračunaj uštedu" : "Dalje"}
                  {step === RESULT - 1 ? (
                    <Zap className="size-4" fill="currentColor" />
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
  tone?: "plain" | "amber" | "green";
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
            tone === "green" && "text-[#3ddc97]",
            tone === "amber" && "text-[#ffc53d]",
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
      <Info className="mt-0.5 size-4 shrink-0 text-[#ffc53d]" />
      <span>{children}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Obračun: kratka pauza koja rezultatu daje težinu                    */
/* ------------------------------------------------------------------ */

function Calculating({
  region,
  business,
  onDone,
}: {
  region: string;
  business: boolean;
  onDone: () => void;
}) {
  const still = useReducedMotion() ?? false;
  const [p, setP] = useState(0);
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    // Napredak zastaje na svakom koraku, pa deluje kao stvaran rad, ne tajmer.
    const controls = animate(0, 1, {
      duration: still ? 1 : 5.2,
      ease: "linear",
      onUpdate: (v) => setP(paced(v)),
      onComplete: () => done.current(),
    });
    return () => controls.stop();
  }, [still]);

  const lines = [
    "Analiziramo vašu potrošnju",
    `Merimo osunčanost · ${region}`,
    "Raspoređujemo panele po krovu",
    business
      ? "Računamo neto obračun i povrat ulaganja"
      : "Računamo neto merenje i povrat ulaganja",
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
          className="absolute inset-0 rounded-full bg-[#ffc53d]/20 blur-2xl"
          animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1.05, 0.9] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        />
        <svg viewBox="0 0 140 140" className="relative size-full -rotate-90">
          <defs>
            <linearGradient id="calc-ring" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#ff9f1a" />
              <stop offset="1" stopColor="#ffe08a" />
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
            stroke="url(#calc-ring)"
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
          <span className="absolute left-1/2 top-0 size-1.5 -translate-x-1/2 rounded-full bg-[#ffe08a] shadow-[0_0_10px_2px_rgba(255,197,61,0.8)]" />
        </motion.div>
        <div className="absolute inset-0 grid place-items-center">
          <span className="font-display text-3xl font-semibold tabular-nums tracking-tight lg:text-4xl">
            {Math.round(p * 100)}
            <span className="text-xl text-[#8b97a8]">%</span>
          </span>
        </div>
      </div>

      <h1 className="mt-5 font-display text-2xl font-semibold tracking-tight lg:mt-7 lg:text-3xl">
        Računamo vašu uštedu
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
                      ? "border-[#ffc53d] text-[#ffc53d]"
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

function Results({
  input,
  result,
  onSubsidy,
  onRestart,
  onBack,
}: {
  input: SolarInput;
  result: SolarResult;
  onSubsidy: (v: number) => void;
  onRestart: () => void;
  onBack: () => void;
}) {
  const payback = result.paybackYears;
  const freeYears = payback === null ? 0 : LIFETIME_YEARS - payback;

  const reveal = (i: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: {
      delay: 0.15 + i * 0.08,
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  });

  if (!result.viable || payback === null) {
    return (
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#ffc53d]">
          Vaša procena
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight lg:text-4xl">
          Sa ovim podacima solar se teško isplati
        </h1>
        <p className="mt-3 leading-relaxed text-[#aeb8c6]">
          {result.panels < 3
            ? `Na krov staje svega ${result.panels} ${result.panels === 1 ? "panel" : "panela"}, što je premalo za isplativ sistem. Proverite površinu i spratnost objekta.`
            : "Potrošnja je preniska u odnosu na investiciju. Sistem se ne bi isplatio u roku od 25 godina."}
        </p>
        <button
          type="button"
          onClick={onBack}
          className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#ffc53d] px-6 font-semibold text-[#0b0d10] outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <ArrowLeft className="size-4" />
          Izmeni odgovore
        </button>
      </div>
    );
  }

  const limitNote =
    result.limitedBy === "krov"
      ? `Sistem je ograničen krovom: staje najviše ${num(result.roofPanelsMax)} panela, pa pokriva ${num(result.coverage * 100)}% potrošnje.`
      : result.limitedBy === "zakon"
        ? `Sistem je ograničen zakonskim limitom od ${num(LEGAL_CAP_KWP[input.type], input.type === "fizicko" ? 1 : 0)} kW za ${input.type === "fizicko" ? "domaćinstva" : "firme"}, pa pokriva ${num(result.coverage * 100)}% potrošnje.`
        : null;

  return (
    <div>
      <motion.p
        {...reveal(0)}
        className="text-sm font-semibold uppercase tracking-[0.12em] text-[#ffc53d]"
      >
        Vaša procena
      </motion.p>
      <motion.h1
        {...reveal(1)}
        className="mt-3 font-display text-2xl font-semibold leading-tight tracking-tight text-[#c6cfdb] lg:text-3xl"
      >
        Investicija se isplati za
      </motion.h1>
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 140, damping: 16 }}
        className="mt-1 flex origin-left items-baseline gap-3"
      >
        <Rolling
          fromZero
          duration={1.6}
          value={payback}
          format={yearsText}
          className="bg-gradient-to-br from-[#fff3c4] via-[#ffc53d] to-[#ff9f1a] bg-clip-text font-display text-[88px] font-semibold leading-none tracking-tighter tabular-nums text-transparent lg:text-[112px]"
        />
        <span className="font-display text-3xl font-semibold lg:text-4xl">
          {yearsLabel(payback)}
        </span>
      </motion.div>
      <motion.p {...reveal(3)} className="mt-3 leading-relaxed text-[#aeb8c6]">
        Posle toga vam krov proizvodi struju još najmanje{" "}
        <span className="font-semibold text-[#f2f5f9]">
          {yearsText(Math.floor(freeYears))} {yearsLabel(Math.floor(freeYears))}
        </span>
        , a paneli imaju garanciju na snagu od {LIFETIME_YEARS} godina.
      </motion.p>

      {/* Vremenska linija: povrat pa zarada */}
      <motion.div {...reveal(4)} className="mt-6">
        <div className="flex h-3 gap-0.5 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-l-full bg-gradient-to-r from-[#ff9f1a] to-[#ffc53d]"
            initial={{ width: 0 }}
            animate={{ width: `${(payback / LIFETIME_YEARS) * 100}%` }}
            transition={{ delay: 0.6, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          />
          <motion.div
            className="h-full flex-1 origin-left rounded-r-full bg-[#3ddc97]"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1.5, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs text-[#8b97a8]">
          <span>Povrat ulaganja</span>
          <span>Čista zarada do {LIFETIME_YEARS}. godine</span>
        </div>
      </motion.div>

      {/* Ključne brojke */}
      <div className="mt-7 grid grid-cols-2 gap-3">
        <Stat
          {...reveal(5)}
          label="Mesečna ušteda"
          tone="green"
          value={
            <Rolling fromZero value={result.monthlySaving} format={rsdRound} />
          }
          sub={`Račun ${rsdRound(result.monthlyBill)} → ${rsdRound(result.newMonthlyBill)}`}
        />
        <Stat
          {...reveal(6)}
          label="Investicija"
          value={
            <Rolling value={result.investmentAfterSubsidy} format={rsdRound} />
          }
          sub={`≈ ${eur(result.investmentAfterSubsidy)}${input.type === "fizicko" ? " sa PDV-om" : " bez PDV-a"}`}
        />
        <Stat
          {...reveal(7)}
          label="Sistem"
          value={`${num(result.kwp, 1)} kWp`}
          sub={`${num(result.panels)} panela${result.batteryKwh ? ` · baterija ${result.batteryKwh} kWh` : ""}`}
        />
        <Stat
          {...reveal(8)}
          label={`Zarada za ${LIFETIME_YEARS} god.`}
          tone="green"
          value={
            <Rolling
              fromZero
              duration={1.8}
              value={result.lifetimeProfit}
              format={(n) => `${shortRsd(n)} RSD`}
            />
          }
          sub="posle povrata ulaganja"
        />
        <Stat
          {...reveal(9)}
          label="Godišnja proizvodnja"
          value={`${num(Math.round(result.productionKwh / 10) * 10)} kWh`}
          sub={`pokriva ${num(result.coverage * 100)}% potrošnje`}
        />
        <Stat
          {...reveal(10)}
          label="Manje CO₂"
          value={`${num(result.co2Tons)} t`}
          sub={`za ${LIFETIME_YEARS} godina`}
          icon={<Leaf className="size-4 text-[#3ddc97]" />}
        />
      </div>

      {limitNote && <Note>{limitNote}</Note>}

      {/* Grafikon */}
      <motion.div
        {...reveal(11)}
        className="mt-7 rounded-2xl border border-white/10 bg-[#0e1218] p-4 lg:bg-white/[0.02] lg:p-5"
      >
        <h2 className="font-display text-lg font-semibold">
          Kako se novac vraća
        </h2>
        <p className="mb-3 mt-0.5 text-sm text-[#8b97a8]">
          Ukupno stanje ulaganja kroz godine, u dinarima
        </p>
        <PaybackChart
          cashflow={result.cashflow}
          paybackYears={result.paybackYears}
        />
      </motion.div>

      {/* Subvencija */}
      <motion.div
        {...reveal(12)}
        className="mt-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4 lg:p-5"
      >
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-display text-lg font-semibold">Subvencija</h2>
          <span className="font-display text-2xl font-semibold tabular-nums text-[#ffc53d]">
            {num(input.subsidy * 100)}%
          </span>
        </div>
        <p className="mb-2 mt-0.5 text-sm leading-relaxed text-[#8b97a8]">
          Opštine povremeno sufinansiraju solarne panele. Pomerite klizač da
          vidite kako to skraćuje isplatu.
        </p>
        <Slider
          label="Subvencija"
          valueText={`${num(input.subsidy * 100)} procenata`}
          min={0}
          max={50}
          step={5}
          value={Math.round(input.subsidy * 100)}
          onChange={(v) => onSubsidy(v / 100)}
        />
      </motion.div>

      <LeadForm input={input} result={result} />

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-medium text-[#aeb8c6] outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-[#ffc53d]"
        >
          <ArrowLeft className="size-4" />
          Izmeni odgovore
        </button>
        <button
          type="button"
          onClick={onRestart}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-medium text-[#aeb8c6] outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-[#ffc53d]"
        >
          <RotateCcw className="size-4" />
          Počni ispočetka
        </button>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-[#6f7a8a]">
        Procena je informativna. Računa sa rastom cene struje od 5% godišnje,
        padom snage panela od 0,5% godišnje i troškom održavanja od 1%
        investicije. Tačna cena zavisi od stanja krova, opreme i priključka.
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
  tone?: "green";
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
          "mt-1.5 font-display text-xl font-semibold tabular-nums leading-tight tracking-tight lg:text-2xl",
          tone === "green" ? "text-[#3ddc97]" : "text-[#f2f5f9]",
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

function LeadForm({
  input,
  result,
}: {
  input: SolarInput;
  result: SolarResult;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
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
          type: "solar-kalkulator",
          name: name.trim(),
          phone: phone.trim(),
          answers: input,
          estimate: {
            panels: result.panels,
            kwp: result.kwp,
            investment: Math.round(result.investmentAfterSubsidy),
            monthlySaving: Math.round(result.monthlySaving),
            paybackYears: result.paybackYears,
          },
        }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  };

  const field =
    "min-h-12 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-base text-[#f2f5f9] outline-none placeholder:text-[#6f7a8a] focus:border-[#ffc53d] focus-visible:ring-2 focus-visible:ring-[#ffc53d]/40";

  return (
    <div className="mt-4 rounded-2xl border border-[#ffc53d]/30 bg-[#ffc53d]/[0.06] p-4 lg:p-5">
      {state === "done" ? (
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#3ddc97] text-[#0b0d10]">
            <Check className="size-5" strokeWidth={3} />
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold">
              Hvala, javićemo vam se
            </h2>
            <p className="mt-0.5 text-sm text-[#aeb8c6]">
              Pozvaćemo vas da potvrdimo podatke i pošaljemo tačnu ponudu.
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={submit}>
          <h2 className="font-display text-lg font-semibold">
            Želite tačnu ponudu?
          </h2>
          <p className="mb-4 mt-0.5 text-sm text-[#aeb8c6]">
            Ostavite broj i dobijate ponudu za sistem od {num(result.kwp, 1)}{" "}
            kWp, bez obaveze.
          </p>
          <div className="grid gap-2.5 sm:grid-cols-2">
            <input
              required
              aria-label="Ime i prezime"
              placeholder="Ime i prezime"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={field}
            />
            <input
              required
              type="tel"
              inputMode="tel"
              aria-label="Telefon"
              placeholder="Telefon"
              autoComplete="tel"
              pattern="[0-9+ /\-]{6,}"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={field}
            />
          </div>
          <button
            type="submit"
            disabled={state === "sending"}
            className="mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#ffc53d] px-6 font-semibold text-[#0b0d10] outline-none transition-colors hover:bg-[#ffd15f] focus-visible:ring-2 focus-visible:ring-white disabled:opacity-70"
          >
            {state === "sending" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ArrowRight className="size-4" />
            )}
            Pošaljite mi ponudu
          </button>
          {state === "error" && (
            <p role="alert" className="mt-2 text-sm text-[#ff8f7a]">
              Slanje nije uspelo. Pokušajte ponovo.
            </p>
          )}
        </form>
      )}
    </div>
  );
}
