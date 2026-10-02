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
  Waves,
  Zap,
} from "lucide-react";
import {
  AREA_RANGE,
  BILL_RANGE,
  BUSINESS_ITC,
  EXTRAS,
  LIFETIME_YEARS,
  ORIENTATIONS,
  REGIONS,
  SIZE_CAP_KW,
  SQFT_PER_M2,
  STATES,
  USAGES,
  YIELD_RANGE,
  billFromKwh,
  calculate,
  kwhFromBill,
  num,
  regionOf,
  shortUsd,
  usdRound,
  type BillUnit,
  type CustomerType,
  type ExtraId,
  type SolarInput,
  type SolarResult,
  type StateId,
} from "@/lib/solar-us";
import HouseScene from "./HouseScene";
import PaybackChart from "./PaybackChart";

/* ------------------------------------------------------------------ */
/*  Pomoćne                                                             */
/* ------------------------------------------------------------------ */

const STEPS = [
  "Bill",
  "Customer type",
  "Building",
  "Location",
  "Habits",
  "Add-ons",
] as const;
const RESULT = STEPS.length;

/** sq ft: tipična kuća u TX/FL/AZ i manji poslovni objekat. */
const DEFAULT_AREA = { fizicko: 2000, pravno: 8000 } as const;
/** Podrazumevani podsticaj: firme još imaju savezni ITC, domaćinstva ne. */
const DEFAULT_SUBSIDY = { fizicko: 0, pravno: BUSINESS_ITC } as const;

function cn(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

/** Klizač računa je logaritamski: isti hod pokriva i $100 i $30.000. */
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
    unit === "usd"
      ? v < 200
        ? 5
        : v < 1000
          ? 10
          : v < 5000
            ? 50
            : 250
      : v < 1000
        ? 10
        : v < 5000
          ? 50
          : v < 20000
            ? 250
            : 1000;
  return Math.min(max, Math.max(min, Math.round(v / step) * step));
}

/** "8.4 years" / "1 year" */
function yearsLabel(v: number) {
  return Math.round(v * 10) / 10 === 1 ? "year" : "years";
}

function panelsLabel(n: number) {
  return n === 1 ? "panel" : "panels";
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

export default function SolarCalculatorUS() {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [roofTouched, setRoofTouched] = useState(false);
  const [input, setInput] = useState<SolarInput>({
    billUnit: "usd",
    billValue: 180,
    type: "fizicko",
    area: DEFAULT_AREA.fizicko,
    floors: 1,
    roof: "kos",
    orientation: "jug",
    region: "dfw",
    usage: "ravnomerno",
    extras: [],
    subsidy: DEFAULT_SUBSIDY.fizicko,
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
  const region = regionOf(input.region);
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
            subsidy: DEFAULT_SUBSIDY[type],
          },
    );

  const setUnit = (unit: BillUnit) =>
    setInput((s) => {
      if (s.billUnit === unit) return s;
      const st = regionOf(s.region).state;
      const v =
        unit === "kwh"
          ? kwhFromBill(s.billValue, s.type, st)
          : billFromKwh(s.billValue, s.type, st);
      return { ...s, billUnit: unit, billValue: roundBill(v, unit) };
    });

  const toggleExtra = (id: ExtraId) =>
    setInput((s) => ({
      ...s,
      extras: s.extras.includes(id)
        ? s.extras.filter((e) => e !== id)
        : [...s.extras, id],
    }));

  const billCap = input.type === "fizicko" ? 600 : 30000;
  const billLevel = Math.min(
    1,
    Math.max(0, Math.log(result.monthlyBill / 50) / Math.log(billCap / 50)),
  );
  const sunLevel =
    (region.yield - YIELD_RANGE.min) / (YIELD_RANGE.max - YIELD_RANGE.min);
  const areaRange = AREA_RANGE[input.type];

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-svh overflow-x-clip bg-[#07090d] font-sans text-[#f2f5f9] antialiased [-webkit-tap-highlight-color:transparent]">
        <div className="mx-auto max-w-[1480px] lg:grid lg:h-svh lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-6 lg:p-6">
          {/* ---------------- Scena: uvek vidljiva ---------------- */}
          <section
            aria-label="Your building"
            className="sticky top-0 z-30 h-[36svh] min-h-[248px] max-h-[340px] lg:max-h-none overflow-hidden border-b border-white/10 lg:relative lg:h-full lg:rounded-[28px] lg:border"
            style={{ background: "#0a0f17" }}
          >
            <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 bg-gradient-to-b from-black/55 to-transparent p-3 pb-8 pt-[max(0.75rem,env(safe-area-inset-top))] lg:p-6 lg:pb-12">
              <div className="flex items-center gap-2.5">
                <span className="grid size-8 place-items-center rounded-lg bg-[#ffc53d] text-[#0b0d10] lg:size-9">
                  <Sun className="size-5" strokeWidth={2.4} />
                </span>
                <span className="whitespace-nowrap font-display text-base font-semibold tracking-tight lg:text-lg">
                  Solar Savings Calculator
                </span>
              </div>
              <div className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-white/15 bg-black/60 px-3 py-1.5 text-xs text-[#e3e9f1] lg:bg-black/40 lg:backdrop-blur">
                <MapPin className="size-3.5 text-[#ffc53d]" />
                <span className="sm:hidden">
                  {region.cities.split(",")[0]}, {region.state}
                </span>
                <span className="hidden sm:inline">
                  {region.label}, {region.state}
                </span>
                <span className="hidden text-white/25 sm:inline">·</span>
                <span className="hidden tabular-nums sm:inline">
                  {num(region.yield)} kWh/kW
                </span>
              </div>
            </div>

            <div className="absolute inset-0">
              <HouseScene
                topPad={wide ? 84 : 52}
                bottomPad={wide ? 112 : 58}
                type={input.type}
                area={input.area / SQFT_PER_M2}
                floors={input.floors}
                roof={input.roof}
                usage={input.usage}
                extras={input.extras}
                panels={result.panels}
                billLevel={billLevel}
                sunLevel={sunLevel}
                solved={solved}
                scanning={calculating}
                ariaLabel={`Illustration of the building with ${result.panels} solar panels`}
                signText="YOUR BUSINESS"
              />
            </div>

            <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-2 p-3 lg:p-6">
              <SceneChip
                label="On the roof"
                value={
                  <>
                    <Rolling
                      value={result.panels}
                      format={(n) => num(Math.round(n))}
                    />{" "}
                    {panelsLabel(result.panels)}
                  </>
                }
                sub={`${num(result.kw, 1)} kW`}
              />
              <SceneChip
                align="right"
                label={solved ? "New bill" : "Bill now"}
                tone={solved ? "green" : "amber"}
                value={
                  <Rolling
                    value={solved ? result.newMonthlyBill : result.monthlyBill}
                    format={(n) => usdRound(n)}
                  />
                }
                sub="per month"
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
                    Step {step + 1} of {STEPS.length}
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
                      title="How much do you spend on electricity each month?"
                      lead="Use the average of your last few bills, summer included."
                    >
                      <div className="mb-6 max-w-[240px]">
                        <Segmented
                          label="Unit"
                          value={input.billUnit}
                          onChange={setUnit}
                          options={[
                            { id: "usd", label: "USD" },
                            { id: "kwh", label: "kWh" },
                          ]}
                        />
                      </div>
                      <div className="flex items-baseline gap-2">
                        {input.billUnit === "usd" && (
                          <span className="font-display text-4xl font-semibold text-[#8b97a8] lg:text-5xl">
                            $
                          </span>
                        )}
                        <span className="font-display text-6xl font-semibold tabular-nums tracking-tight lg:text-7xl">
                          {num(input.billValue)}
                        </span>
                        {input.billUnit === "kwh" && (
                          <span className="text-xl font-medium text-[#8b97a8]">
                            kWh
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm tabular-nums text-[#8b97a8]">
                        {input.billUnit === "usd"
                          ? `≈ ${num(Math.round(result.monthlyKwh / 10) * 10)} kWh a month`
                          : `≈ ${usdRound(result.monthlyBill)} a month`}
                      </p>
                      <div className="mt-6">
                        <Slider
                          label="Monthly usage"
                          valueText={
                            input.billUnit === "usd"
                              ? `$${num(input.billValue)}`
                              : `${num(input.billValue)} kWh`
                          }
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
                        {(input.billUnit === "usd"
                          ? [100, 180, 300, 500, 2000]
                          : [600, 1200, 2000, 4000, 15000]
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
                            {input.billUnit === "usd" ? `$${num(v)}` : num(v)}
                          </button>
                        ))}
                      </div>
                    </Step>
                  )}

                  {step === 1 && (
                    <Step
                      title="Is this for your home or a business?"
                      lead="It sets your electric rate, how the utility credits your extra power, and the system size."
                    >
                      <div role="radiogroup" className="grid gap-3">
                        <Choice
                          on={input.type === "fizicko"}
                          onClick={() => setType("fizicko")}
                          icon={<Home className="size-5" />}
                          title="Homeowner"
                          hint={`Residential rate · up to ${num(SIZE_CAP_KW.fizicko)} kW`}
                        />
                        <Choice
                          on={input.type === "pravno"}
                          onClick={() => setType("pravno")}
                          icon={<Building2 className="size-5" />}
                          title="Business"
                          hint={`Commercial rate · up to ${num(SIZE_CAP_KW.pravno)} kW · 30% federal tax credit`}
                        />
                      </div>
                      <Note>
                        {input.type === "fizicko"
                          ? "Extra power flows to the grid and earns bill credits. What each kWh is worth depends on your state and utility, and we factor that in."
                          : "Where exported power earns less than retail, a business system is sized around its daytime usage."}
                      </Note>
                    </Step>
                  )}

                  {step === 2 && (
                    <Step
                      title="How big is the building?"
                      lead="Total square footage. Together with the roof, it sets how many panels fit."
                    >
                      <div className="flex items-baseline gap-2">
                        <span className="font-display text-6xl font-semibold tabular-nums tracking-tight">
                          {num(input.area)}
                        </span>
                        <span className="text-xl font-medium text-[#8b97a8]">
                          sq ft
                        </span>
                      </div>
                      <div className="mt-4">
                        <Slider
                          label="Building size"
                          valueText={`${num(input.area)} square feet`}
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
                          Fine-tune
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <FieldLabel>Is the roof flat?</FieldLabel>
                            <Segmented
                              label="Roof type"
                              value={input.roof}
                              onChange={(v) => {
                                setRoofTouched(true);
                                set("roof", v);
                              }}
                              options={[
                                { id: "kos", label: "No, pitched" },
                                { id: "ravan", label: "Yes, flat" },
                              ]}
                            />
                          </div>
                          <div>
                            <FieldLabel>Stories</FieldLabel>
                            <Segmented
                              label="Stories"
                              value={input.floors}
                              onChange={(v) => set("floors", v)}
                              options={[
                                { id: 1, label: "1 story" },
                                { id: 2, label: "2 stories" },
                                { id: 3, label: "3" },
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
                                  Which way does the roof face?
                                </FieldLabel>
                                <Segmented
                                  wrap
                                  label="Roof direction"
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
                        This roof fits up to{" "}
                        <span className="font-semibold text-[#f2f5f9]">
                          {num(result.roofPanelsMax)}{" "}
                          {panelsLabel(result.roofPanelsMax)}
                        </span>
                        .
                      </p>
                    </Step>
                  )}

                  {step === 3 && (
                    <Step
                      title="Where is the building?"
                      lead="West Texas and Arizona get up to 25% more sun than the Gulf Coast."
                    >
                      <div role="radiogroup" className="grid gap-5">
                        {(Object.keys(STATES) as StateId[]).map((st) => (
                          <div key={st}>
                            <FieldLabel>{STATES[st].name}</FieldLabel>
                            <div className="grid gap-2.5 sm:grid-cols-2">
                              {REGIONS.filter((r) => r.state === st).map(
                                (r) => {
                                  const on = r.id === input.region;
                                  const level =
                                    (r.yield - (YIELD_RANGE.min - 100)) /
                                    (YIELD_RANGE.max - (YIELD_RANGE.min - 100));
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
                                        <span className="font-semibold">
                                          {r.label}
                                        </span>
                                        <span className="text-xs tabular-nums text-[#8b97a8]">
                                          {num(r.yield)} kWh/kW
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
                                },
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      <Note>{STATES[region.state].exportNote}</Note>
                    </Step>
                  )}

                  {step === 4 && (
                    <Step
                      title="When do you use the most electricity?"
                      lead="The more you use while the sun is shining, the faster the system pays for itself."
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
                      title="Do you have or plan to get any of these?"
                      lead="Optional. Bigger loads call for a bigger system."
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
                                <Waves className="size-5" />
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
                      region={`${region.label}, ${region.state}`}
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
                  Back
                </button>
                <motion.button
                  type="button"
                  onClick={() => go(step + 1)}
                  whileTap={{ scale: 0.98 }}
                  className="ml-auto inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#ffc53d] px-6 font-semibold text-[#0b0d10] outline-none transition-colors hover:bg-[#ffd15f] focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#07090d] sm:flex-none"
                >
                  {step === RESULT - 1 ? "Calculate my savings" : "Next"}
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
    "Analyzing your usage",
    `Measuring sunlight · ${region}`,
    "Laying out panels on the roof",
    business
      ? "Applying commercial rates and payback"
      : "Applying utility credits and payback",
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
        Calculating your savings
      </h1>
      <p className="mt-1.5 text-sm text-[#8b97a8]">Just a few more seconds</p>

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
          Your estimate
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight lg:text-4xl">
          With these numbers, solar is hard to justify
        </h1>
        <p className="mt-3 leading-relaxed text-[#aeb8c6]">
          {result.panels < 3
            ? `Only ${result.panels} ${panelsLabel(result.panels)} fit on the roof, which is too few for a system that pays off. Check the square footage and number of stories.`
            : `Your usage is too low for the investment. The system wouldn't pay for itself within ${LIFETIME_YEARS} years.`}
        </p>
        <button
          type="button"
          onClick={onBack}
          className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#ffc53d] px-6 font-semibold text-[#0b0d10] outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <ArrowLeft className="size-4" />
          Edit answers
        </button>
      </div>
    );
  }

  const limitNote =
    result.limitedBy === "krov"
      ? `The roof is the limit: it fits up to ${num(result.roofPanelsMax)} ${panelsLabel(result.roofPanelsMax)}, covering ${num(result.coverage * 100)}% of your usage.`
      : result.limitedBy === "limit"
        ? `We cap ${input.type === "fizicko" ? "home" : "business"} systems at ${num(SIZE_CAP_KW[input.type])} kW, the typical limit for standard utility interconnection. That covers ${num(result.coverage * 100)}% of your usage.`
        : null;

  return (
    <div>
      <motion.p
        {...reveal(0)}
        className="text-sm font-semibold uppercase tracking-[0.12em] text-[#ffc53d]"
      >
        Your estimate
      </motion.p>
      <motion.h1
        {...reveal(1)}
        className="mt-3 font-display text-2xl font-semibold leading-tight tracking-tight text-[#c6cfdb] lg:text-3xl"
      >
        Your system pays for itself in
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
        After that, your roof makes free power for at least another{" "}
        <span className="font-semibold text-[#f2f5f9]">
          {yearsText(Math.floor(freeYears))} {yearsLabel(Math.floor(freeYears))}
        </span>
        , and the panels carry a {LIFETIME_YEARS}-year power warranty.
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
          <span>Payback</span>
          <span>Net savings through year {LIFETIME_YEARS}</span>
        </div>
      </motion.div>

      {/* Ključne brojke */}
      <div className="mt-7 grid grid-cols-2 gap-3">
        <Stat
          {...reveal(5)}
          label="Monthly savings"
          tone="green"
          value={
            <Rolling fromZero value={result.monthlySaving} format={usdRound} />
          }
          sub={`Bill ${usdRound(result.monthlyBill)} → ${usdRound(result.newMonthlyBill)}`}
        />
        <Stat
          {...reveal(6)}
          label={
            input.subsidy > 0 || result.stateCredit > 0
              ? "Net cost"
              : "System cost"
          }
          value={
            <Rolling value={result.investmentAfterSubsidy} format={usdRound} />
          }
          sub={
            input.subsidy > 0 || result.stateCredit > 0
              ? `${usdRound(result.investment)} before incentives`
              : `$${num(result.pricePerWatt, 2)}/W installed`
          }
        />
        <Stat
          {...reveal(7)}
          label="System"
          value={`${num(result.kw, 1)} kW`}
          sub={`${num(result.panels)} ${panelsLabel(result.panels)}${result.batteryKwh ? ` · ${num(result.batteryKwh, Number.isInteger(result.batteryKwh) ? 0 : 1)} kWh battery` : ""}`}
        />
        <Stat
          {...reveal(8)}
          label={`${LIFETIME_YEARS}-year savings`}
          tone="green"
          value={
            <Rolling
              fromZero
              duration={1.8}
              value={result.lifetimeProfit}
              format={shortUsd}
            />
          }
          sub="after payback"
        />
        <Stat
          {...reveal(9)}
          label="Annual production"
          value={`${num(Math.round(result.productionKwh / 10) * 10)} kWh`}
          sub={`covers ${num(result.coverage * 100)}% of usage`}
        />
        <Stat
          {...reveal(10)}
          label="CO₂ avoided"
          value={`${num(result.co2Tons)} tons`}
          sub={`over ${LIFETIME_YEARS} years`}
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
          How your money comes back
        </h2>
        <p className="mb-3 mt-0.5 text-sm text-[#8b97a8]">
          Cumulative cash flow over the years, in dollars
        </p>
        <PaybackChart
          cashflow={result.cashflow}
          paybackYears={result.paybackYears}
          locale="en"
        />
      </motion.div>

      {/* Subvencija */}
      <motion.div
        {...reveal(12)}
        className="mt-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4 lg:p-5"
      >
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-display text-lg font-semibold">
            Tax credits & rebates
          </h2>
          <span className="font-display text-2xl font-semibold tabular-nums text-[#ffc53d]">
            {num(input.subsidy * 100)}%
          </span>
        </div>
        <p className="mb-2 mt-0.5 text-sm leading-relaxed text-[#8b97a8]">
          {input.type === "fizicko"
            ? `The 30% federal tax credit for home solar ended after 2025. Some utilities and cities still offer rebates. Move the slider to see how they shorten payback.${result.stateCredit > 0 ? ` Arizona's ${usdRound(result.stateCredit)} state tax credit is already included.` : ""}`
            : "Businesses can still claim the 30% federal ITC if the system is placed in service by the end of 2027. Confirm eligibility with your tax advisor, or move the slider to see other scenarios."}
        </p>
        <Slider
          label="Tax credits and rebates"
          valueText={`${num(input.subsidy * 100)} percent`}
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
          Edit answers
        </button>
        <button
          type="button"
          onClick={onRestart}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-medium text-[#aeb8c6] outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-[#ffc53d]"
        >
          <RotateCcw className="size-4" />
          Start over
        </button>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-[#6f7a8a]">
        This is an estimate, not a quote. It assumes electricity prices rise 3%
        a year, panel output drops 0.5% a year, and upkeep costs 1% of the
        system price annually. Rates and export credits vary by utility and
        plan. Your exact price depends on your roof, equipment, and
        interconnection. Not tax advice.
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
          type: "solar-calculator-us",
          name: name.trim(),
          phone: phone.trim(),
          answers: input,
          estimate: {
            panels: result.panels,
            kw: result.kw,
            state: regionOf(input.region).state,
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
              Thanks, we&apos;ll be in touch
            </h2>
            <p className="mt-0.5 text-sm text-[#aeb8c6]">
              We&apos;ll call to confirm the details and send you an exact
              quote.
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={submit}>
          <h2 className="font-display text-lg font-semibold">
            Want an exact quote?
          </h2>
          <p className="mb-4 mt-0.5 text-sm text-[#aeb8c6]">
            Leave your number and we&apos;ll send a quote for a{" "}
            {num(result.kw, 1)} kW system. No obligation.
          </p>
          <div className="grid gap-2.5 sm:grid-cols-2">
            <input
              required
              aria-label="Full name"
              placeholder="Full name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={field}
            />
            <input
              required
              type="tel"
              inputMode="tel"
              aria-label="Phone"
              placeholder="Phone"
              autoComplete="tel"
              pattern="[0-9+ ().\-]{10,}"
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
            Send me a quote
          </button>
          {state === "error" && (
            <p role="alert" className="mt-2 text-sm text-[#ff8f7a]">
              Something went wrong. Please try again.
            </p>
          )}
        </form>
      )}
    </div>
  );
}
