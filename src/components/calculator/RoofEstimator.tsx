"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck,
  Check,
  CloudLightning,
  Hammer,
  Home,
  Layers,
  Lock,
  LockOpen,
  MapPin,
  Phone,
  Ruler,
  ShieldCheck,
  Sparkles,
  Timer,
  Zap,
} from "lucide-react";
import type { ContractorConfig } from "@/app/calculator/config";
import { formatPhone, telHref } from "@/app/calculator/config";
import {
  CLAIM_OPTIONS,
  GOALS,
  MATERIALS,
  PRICE_FACTORS,
  SIZE_BUCKETS,
  SIZE_MAX,
  SIZE_MIN,
  SIZE_STEP,
  TIMELINES,
  estimate,
  goalById,
  inspectionSlots,
  materialById,
  monthlyPayment,
  squaresFor,
  usd,
  type ClaimId,
  type GoalId,
  type InspectionSlot,
  type MaterialId,
  type TimelineId,
} from "@/lib/roofing";
import CountUp from "./CountUp";
import Confetti from "./Confetti";
import SmartImage from "./SmartImage";

/* ------------------------------------------------------------------ */
/*  Theme helpers — brand color comes from the URL, everything derives  */
/* ------------------------------------------------------------------ */

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function readableOn(hex: string): string {
  const [r, g, b] = hexToRgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum > 0.4 ? "#0f172a" : "#ffffff";
}

function haptic(ms = 12) {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(ms);
    }
  } catch {
    /* noop */
  }
}

/* ------------------------------------------------------------------ */
/*  Motion presets                                                      */
/* ------------------------------------------------------------------ */

const panel = {
  initial: { opacity: 0, x: 28, filter: "blur(4px)" },
  animate: { opacity: 1, x: 0, filter: "blur(0px)" },
  exit: { opacity: 0, x: -28, filter: "blur(4px)" },
  transition: { duration: 0.32, ease: [0.16, 1, 0.3, 1] as const },
};

const pop = {
  type: "spring" as const,
  stiffness: 520,
  damping: 26,
  mass: 0.6,
};

const STEP_LABELS = ["Project", "Size", "Material", "Estimate"];

const GOAL_ICONS = { storm: CloudLightning, age: Timer, new: Hammer } as const;
const MATERIAL_ICONS = { shingles: Layers, metal: Zap, tile: Home } as const;

type Lead = {
  name: string;
  email: string;
  phone: string;
  zip: string;
  address: string;
};
type LeadErrors = Partial<Lead> & { consent?: string };
const EMPTY_LEAD: Lead = {
  name: "",
  email: "",
  phone: "",
  zip: "",
  address: "",
};

/* ------------------------------------------------------------------ */

export default function RoofEstimator({
  config,
}: {
  config: ContractorConfig;
}) {
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<GoalId | null>(null);
  const [sqft, setSqft] = useState<number | null>(null);
  const [material, setMaterial] = useState<MaterialId | null>(null);
  const [timeline, setTimeline] = useState<TimelineId | null>(null);
  const [claim, setClaim] = useState<ClaimId | null>(null);
  const [lead, setLead] = useState<Lead>(EMPTY_LEAD);
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<LeadErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [confetti, setConfetti] = useState(0);
  const [emailed, setEmailed] = useState(false);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [slots, setSlots] = useState<InspectionSlot[]>([]);
  const [slot, setSlot] = useState<string | null>(null);
  const [booking, setBooking] = useState<"idle" | "sending" | "done">("idle");
  const [logoFailed, setLogoFailed] = useState(false);
  const showLogo = !!config.logoUrl && !logoFailed;

  const rgb = useMemo(
    () => hexToRgb(config.primaryColor),
    [config.primaryColor],
  );
  const pulseShadow = useMemo(
    () => [
      `0 0 0 0px rgba(${rgb.join(",")},0.45)`,
      `0 0 0 10px rgba(${rgb.join(",")},0)`,
    ],
    [rgb],
  );

  const cssVars = useMemo(() => {
    const [r, g, b] = rgb;
    return {
      "--rc": config.primaryColor,
      "--rc-fg": readableOn(config.primaryColor),
      "--rc-soft": `rgba(${r},${g},${b},0.10)`,
      "--rc-soft-2": `rgba(${r},${g},${b},0.22)`,
      "--rc-ring": `rgba(${r},${g},${b},0.38)`,
      "--rc-glow": `rgba(${r},${g},${b},0.45)`,
    } as React.CSSProperties;
  }, [config.primaryColor, rgb]);

  const confettiColors = useMemo(
    () => [config.primaryColor, "#fbbf24", "#34d399", "#ffffff", "#0f172a"],
    [config.primaryColor],
  );

  const result = useMemo(
    () => (sqft && material ? estimate(sqft, material) : null),
    [sqft, material],
  );

  const qualified = !!goal && !!timeline && (goal !== "storm" || !!claim);
  const canContinue =
    (step === 0 && qualified) ||
    (step === 1 && !!sqft) ||
    (step === 2 && !!material) ||
    step === 3;

  const go = useCallback((n: number) => {
    haptic();
    setStep(n);
    if (typeof window !== "undefined")
      window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  function validate(): boolean {
    const e: LeadErrors = {};
    if (!lead.name.trim()) e.name = "Enter your first name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(lead.email.trim()))
      e.email = "Enter a valid email address.";
    if (lead.phone.replace(/\D/g, "").length < 10)
      e.phone = "Enter a valid 10-digit mobile number.";
    if (!/^\d{5}$/.test(lead.zip.trim())) e.zip = "Enter a 5-digit ZIP code.";
    if (!consent) e.consent = "Please confirm so we can send your estimate.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit() {
    if (!validate() || !result || !goal || !material) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/calculator/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: lead.name.trim(),
          email: lead.email.trim(),
          mobile: lead.phone.trim(),
          zip: lead.zip.trim(),
          address: lead.address.trim(),
          goal,
          timeline,
          claim,
          consent,
          homeSqFt: sqft,
          material,
          company: config.companyName,
          phone: config.phone,
          city: config.city,
          color: config.primaryColor,
          notifyEmail: config.notifyEmail,
          notifySms: config.notifySms,
          priceMode: config.priceMode,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        emailed?: boolean;
        leadId?: string | null;
      };
      setEmailed(!!json.emailed);
      setLeadId(json.leadId ?? null);
    } catch {
      /* Demo: rezultat se prikazuje i ako upis/email ne uspe. */
    } finally {
      setSubmitting(false);
      setConfetti((c) => c + 1);
      haptic(30);
      setStep(4);
      if (typeof window !== "undefined")
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function next() {
    if (!canContinue) return;
    if (step === 3) void submit();
    else go(step + 1);
  }

  async function book() {
    if (!slot || !leadId || booking !== "idle") return;
    setBooking("sending");
    try {
      const res = await fetch("/api/calculator/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId,
          slot,
          notifyEmail: config.notifyEmail,
          notifySms: config.notifySms,
        }),
      });
      if (!res.ok) throw new Error("book failed");
      haptic(30);
      setBooking("done");
    } catch {
      setBooking("idle");
    }
  }

  function reset() {
    setStep(0);
    setGoal(null);
    setTimeline(null);
    setClaim(null);
    setSqft(null);
    setMaterial(null);
    setLead(EMPTY_LEAD);
    setConsent(false);
    setErrors({});
    setEmailed(false);
    setLeadId(null);
    setSlot(null);
    setBooking("idle");
  }

  // Termini se računaju na klijentu (lokalno vreme homeownera), tek na rezultatu.
  useEffect(() => {
    if (step === 4 && slots.length === 0) setSlots(inspectionSlots());
  }, [step, slots.length]);

  // Enter = continue (osim u textarea/na dugmadima)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter") return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "BUTTON" || tag === "A") return;
      if (step < 4) {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, canContinue, lead, sqft, goal, material]);

  const hasPhone = !!config.phone;
  const phonePretty = config.phone ? formatPhone(config.phone) : "";
  const tel = config.phone ? telHref(config.phone) : "#";
  const scrollToBooking = () =>
    document
      .getElementById("rc-book")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });

  return (
    <div
      style={cssVars}
      className="rc relative min-h-dvh bg-[#f5f6f8] text-[#0f172a] antialiased selection:bg-[var(--rc)] selection:text-[var(--rc-fg)]"
    >
      <Confetti fire={confetti} colors={confettiColors} />

      {/* Ambient brand glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(60%_60%_at_50%_0%,var(--rc-soft-2),transparent_70%)]"
      />

      {/* Header */}
      {!config.embed && (
        <header className="relative z-10 mx-auto flex w-full max-w-xl items-center justify-between px-4 pt-5 sm:px-6">
          {showLogo ? (
            /* Client logo is the brand mark — a wordmark already carries the
               name, so we don't repeat it. Location sits quietly to the side. */
            <div className="flex min-w-0 items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={config.logoUrl!}
                alt={config.companyName}
                decoding="async"
                onError={() => setLogoFailed(true)}
                className={
                  config.logoBg === "dark"
                    ? "h-14 w-auto max-w-[200px] shrink-0 rounded-xl bg-[#0f172a] px-3 py-2 object-contain object-left shadow-[0_8px_24px_-8px_rgba(15,23,42,0.45)]"
                    : config.logoBg === "brand"
                      ? "h-14 w-auto max-w-[200px] shrink-0 rounded-xl bg-[var(--rc)] px-3 py-2 object-contain object-left shadow-[0_8px_24px_-8px_var(--rc-glow)]"
                      : "h-10 w-auto max-w-[168px] shrink-0 object-contain object-left"
                }
              />
            </div>
          ) : (
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[var(--rc)] text-[var(--rc-fg)] shadow-[0_8px_24px_-8px_var(--rc-glow)]">
                <Home className="size-5" strokeWidth={2.2} />
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold leading-tight">
                  {config.companyName}
                </div>
              </div>
            </div>
          )}
          <div className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
            {hasPhone && (
              <a
                href={tel}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#e2e8f0] bg-white px-3 py-1.5 text-xs font-semibold text-[#0f172a] shadow-sm transition hover:border-[var(--rc)] hover:text-[var(--rc)]"
              >
                <Phone className="size-3.5" /> {phonePretty}
              </a>
            )}
            <span className="flex max-w-[180px] items-center gap-1 text-[11px] font-medium text-[#64748b]">
              <MapPin className="size-3 shrink-0" />
              <span className="truncate">Serving {config.city}</span>
            </span>
          </div>
        </header>
      )}

      <main
        className={`relative z-10 mx-auto w-full max-w-xl px-4 sm:px-6 ${
          config.embed ? "pt-4" : "pt-8"
        } pb-40`}
      >
        {/* Title */}
        {step < 4 && (
          <div className="mb-6">
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[var(--rc-soft)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--rc)]">
              <Sparkles className="size-3" /> Instant estimate · 30 seconds
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              What would a new roof cost you?
            </h1>
            <p className="mt-1 text-sm text-[#64748b]">
              Answer 3 quick questions and get a real price range for homes in{" "}
              {config.city}. No phone call required.
            </p>
          </div>
        )}

        <Progress step={step} />

        <AnimatePresence mode="wait" initial={false}>
          {step === 0 && (
            <motion.section key="goal" {...panel}>
              <StepTitle
                kicker="Step 1 of 4"
                title="What's going on with your roof?"
              />
              <div className="grid gap-3">
                {GOALS.map((g) => {
                  const active = goal === g.id;
                  const Icon = GOAL_ICONS[g.id];
                  return (
                    <ChoiceCard
                      key={g.id}
                      active={active}
                      onClick={() => {
                        haptic();
                        setGoal(g.id);
                      }}
                      media={
                        <SmartImage
                          src={g.image}
                          alt=""
                          icon={Icon}
                          className="h-full w-full"
                        />
                      }
                      title={g.title}
                      subtitle={g.subtitle}
                    >
                      <AnimatePresence initial={false}>
                        {active && <Insight text={g.insight} />}
                      </AnimatePresence>
                    </ChoiceCard>
                  );
                })}
              </div>

              {/* Kvalifikatori — jedan tap svaki, ne kvare "3 pitanja" obećanje */}
              <AnimatePresence initial={false}>
                {goal && (
                  <motion.div
                    key="qualifiers"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <ChipGroup
                      label="When are you looking to get this done?"
                      options={TIMELINES}
                      value={timeline}
                      onChange={(v) => {
                        haptic();
                        setTimeline(v);
                      }}
                    />
                    {goal === "storm" && (
                      <ChipGroup
                        label="Have you filed an insurance claim?"
                        options={CLAIM_OPTIONS}
                        value={claim}
                        onChange={(v) => {
                          haptic();
                          setClaim(v);
                        }}
                      />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>
          )}

          {step === 1 && (
            <motion.section key="size" {...panel}>
              <StepTitle
                kicker="Step 2 of 4"
                title="Roughly how big is your home?"
                hint="Use the living area from your tax record or Zillow. We add pitch and overhang for you."
              />
              <div className="grid grid-cols-3 gap-2">
                {SIZE_BUCKETS.map((b) => {
                  const active = sqft === b;
                  return (
                    <motion.button
                      key={b}
                      type="button"
                      whileTap={{ scale: 0.96 }}
                      onClick={() => {
                        haptic();
                        setSqft(b);
                      }}
                      className={`relative rounded-2xl border bg-white px-3 py-4 text-center transition-colors ${
                        active
                          ? "border-[var(--rc)] shadow-[0_0_0_3px_var(--rc-ring)]"
                          : "border-[#e2e8f0] hover:border-[#cbd5e1]"
                      }`}
                    >
                      <div className="text-lg font-bold tabular-nums">
                        {b.toLocaleString()}
                      </div>
                      <div className="text-[11px] font-medium uppercase tracking-wide text-[#94a3b8]">
                        sq ft
                      </div>
                      {active && <CheckBadge />}
                    </motion.button>
                  );
                })}
              </div>

              <div className="mt-4 rounded-2xl border border-[#e2e8f0] bg-white p-4">
                <div className="mb-3 flex items-center justify-between text-sm">
                  <span className="font-medium text-[#475569]">
                    Or fine-tune it
                  </span>
                  <span
                    className={`font-semibold tabular-nums ${sqft ? "" : "text-[#94a3b8]"}`}
                  >
                    {sqft ? `${sqft.toLocaleString()} sq ft` : "Drag to set"}
                  </span>
                </div>
                <input
                  type="range"
                  min={SIZE_MIN}
                  max={SIZE_MAX}
                  step={SIZE_STEP}
                  value={sqft ?? 2500}
                  onChange={(e) => setSqft(Number(e.target.value))}
                  aria-label="Home square footage"
                  style={
                    {
                      "--pct": `${(((sqft ?? 2500) - SIZE_MIN) / (SIZE_MAX - SIZE_MIN)) * 100}%`,
                    } as React.CSSProperties
                  }
                  className="rc-range w-full"
                />
                <div className="mt-1 flex justify-between text-[11px] text-[#94a3b8]">
                  <span>{SIZE_MIN.toLocaleString()}</span>
                  <span>{SIZE_MAX.toLocaleString()}+</span>
                </div>
              </div>

              <AnimatePresence initial={false}>
                {sqft && (
                  <motion.div
                    key="squares"
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={pop}
                    className="mt-4 flex items-center gap-3 rounded-2xl bg-[var(--rc)] p-4 text-[var(--rc-fg)] shadow-[0_16px_40px_-16px_var(--rc-glow)]"
                  >
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
                      <Ruler className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-lg font-bold leading-tight tabular-nums">
                        ≈ {squaresFor(sqft).toFixed(0)} roofing squares
                      </div>
                      <div className="text-xs opacity-85">
                        Roofers price per &ldquo;square&rdquo; (100 sq ft). Your
                        roof is about {Math.round(sqft * 1.25).toLocaleString()}{" "}
                        sq ft including pitch and cuts.
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>
          )}

          {step === 2 && (
            <motion.section key="material" {...panel}>
              <StepTitle
                kicker="Step 3 of 4"
                title="Which material are you leaning toward?"
                hint="Not sure? Pick the most popular one. You can always change it later."
              />
              <div className="grid gap-3">
                {MATERIALS.map((m) => {
                  const active = material === m.id;
                  const Icon = MATERIAL_ICONS[m.id];
                  return (
                    <ChoiceCard
                      key={m.id}
                      active={active}
                      onClick={() => {
                        haptic();
                        setMaterial(m.id);
                      }}
                      media={
                        <SmartImage
                          src={m.image}
                          alt=""
                          icon={Icon}
                          className="h-full w-full"
                        />
                      }
                      badge={m.badge}
                      title={m.name}
                      subtitle={m.tagline}
                      meta={
                        <>
                          <span className="font-semibold text-[#0f172a]">
                            {usd.format(m.pricePerSquare.low)}–
                            {usd.format(m.pricePerSquare.high)}
                          </span>{" "}
                          / square · {m.lifespanYears.low}–
                          {m.lifespanYears.high} yr life
                        </>
                      }
                    >
                      <AnimatePresence initial={false}>
                        {active && (
                          <motion.ul
                            key="perks"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25 }}
                            className="flex flex-wrap gap-1.5 overflow-hidden pt-3"
                          >
                            {m.perks.map((p, i) => (
                              <motion.li
                                key={p}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.06 * i, ...pop }}
                                className="inline-flex items-center gap-1 rounded-full bg-[var(--rc-soft)] px-2 py-1 text-[11px] font-semibold text-[var(--rc)]"
                              >
                                <Check className="size-3" /> {p}
                              </motion.li>
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </ChoiceCard>
                  );
                })}
              </div>
            </motion.section>
          )}

          {step === 3 && result && (
            <motion.section key="lead" {...panel}>
              <StepTitle
                kicker="Step 4 of 4"
                title="Your estimate is ready."
                hint="Tell us where to send it and we'll unlock your price range."
              />

              {/* Blurred teaser */}
              <div className="relative mb-5 overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white p-5">
                <div className="text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                  Estimated project range
                </div>
                <div
                  aria-hidden
                  className="mt-1 select-none text-3xl font-bold tabular-nums blur-[7px] sm:text-4xl"
                >
                  {usd.format(result.low)} – {usd.format(result.high)}
                </div>
                <div className="mt-2 text-xs text-[#64748b] blur-[3px]">
                  {materialById(material!).name} · {result.squares} squares
                </div>
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.15, ...pop }}
                  className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center gap-1.5 rounded-full bg-[#0f172a] px-3 py-1.5 text-xs font-semibold text-white shadow-lg"
                >
                  <Lock className="size-3.5" /> Locked
                </motion.div>
              </div>

              <div className="grid gap-3">
                <Field
                  label="First name"
                  value={lead.name}
                  error={errors.name}
                  autoComplete="given-name"
                  placeholder="Sarah"
                  onChange={(v) => setLead((l) => ({ ...l, name: v }))}
                />
                <Field
                  label="Email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="sarah@example.com"
                  value={lead.email}
                  error={errors.email}
                  onChange={(v) => setLead((l) => ({ ...l, email: v }))}
                />
                <Field
                  label="Mobile number"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="(555) 123-4567"
                  value={lead.phone}
                  error={errors.phone}
                  onChange={(v) => setLead((l) => ({ ...l, phone: v }))}
                />
                <div className="grid grid-cols-[7.5rem_1fr] gap-3">
                  <Field
                    label="ZIP code"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    maxLength={5}
                    placeholder="76180"
                    value={lead.zip}
                    error={errors.zip}
                    onChange={(v) =>
                      setLead((l) => ({
                        ...l,
                        zip: v.replace(/\D/g, "").slice(0, 5),
                      }))
                    }
                  />
                  <Field
                    label="Street address (optional)"
                    autoComplete="street-address"
                    placeholder="123 Oak St"
                    value={lead.address}
                    onChange={(v) => setLead((l) => ({ ...l, address: v }))}
                  />
                </div>
              </div>

              {/* TCPA: eksplicitna saglasnost za pozive i SMS */}
              <label className="mt-4 flex cursor-pointer items-start gap-2.5 rounded-xl border border-[#e2e8f0] bg-white p-3 text-xs leading-relaxed text-[#475569]">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => {
                    setConsent(e.target.checked);
                    if (e.target.checked)
                      setErrors((er) => ({ ...er, consent: undefined }));
                  }}
                  className="mt-0.5 size-4 shrink-0 accent-[var(--rc)]"
                />
                <span>
                  I agree that {config.companyName} may call and text me at the
                  number above about my roof estimate, including with automated
                  messages. Consent isn&apos;t a condition of purchase. Msg
                  &amp; data rates may apply. Reply STOP to opt out.
                </span>
              </label>
              <AnimatePresence>
                {errors.consent && (
                  <motion.span
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-1 block text-xs text-red-600"
                  >
                    {errors.consent}
                  </motion.span>
                )}
              </AnimatePresence>

              <ul className="mt-4 grid gap-1.5 text-xs text-[#64748b]">
                {[
                  "No sales pressure. We send your estimate and call once to confirm.",
                  `Your info is only used by ${config.companyName}.`,
                  "Free on-site inspection if you want an exact quote.",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-emerald-600" />
                    {t}
                  </li>
                ))}
              </ul>
            </motion.section>
          )}

          {step === 4 && result && goal && material && (
            <motion.section
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                <Check className="size-3" /> Estimate unlocked
              </div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {lead.name.trim() ? `${lead.name.trim()}, here's` : "Here's"}{" "}
                your ballpark.
              </h2>
              <p className="mt-1 text-sm text-[#64748b]">
                Based on a {sqft!.toLocaleString()} sq ft home in {config.city}{" "}
                with {materialById(material).name.toLowerCase()}.
                {emailed && (
                  <>
                    {" "}
                    A copy is on its way to <strong>{lead.email.trim()}</strong>
                    .
                  </>
                )}
              </p>

              {/* Hero number */}
              <motion.div
                initial={{ scale: 0.94, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15, ...pop }}
                className="relative mt-5 overflow-hidden rounded-3xl bg-[var(--rc)] p-6 text-[var(--rc-fg)] shadow-[0_24px_60px_-20px_var(--rc-glow)]"
              >
                <div
                  aria-hidden
                  className="absolute -right-10 -top-10 size-40 rounded-full bg-white/10 blur-2xl"
                />
                <div className="text-xs font-semibold uppercase tracking-wide opacity-80">
                  Estimated project range
                </div>
                {config.priceMode === "monthly" ? (
                  <>
                    <div className="mt-1 text-[2rem] font-bold leading-none tabular-nums sm:text-[2.6rem]">
                      <span className="text-[0.55em] font-semibold opacity-80">
                        from{" "}
                      </span>
                      <CountUp
                        to={monthlyPayment(result.low)}
                        format={usd.format}
                        delay={0.2}
                      />
                      <span className="text-[0.55em] font-semibold opacity-80">
                        /mo
                      </span>
                    </div>
                    <div className="mt-3 text-xs opacity-85">
                      With financing, on approved credit. Final quote confirmed
                      after a free inspection.
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mt-1 text-[2rem] font-bold leading-none tabular-nums sm:text-[2.6rem]">
                      <CountUp
                        to={result.low}
                        format={usd.format}
                        delay={0.2}
                      />
                      <span className="opacity-60"> – </span>
                      <CountUp
                        to={result.high}
                        format={usd.format}
                        delay={0.35}
                      />
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs opacity-85">
                      <span>Regional average, installed.</span>
                      <span className="rounded-full bg-white/15 px-2 py-0.5 font-semibold">
                        or from {usd.format(monthlyPayment(result.low))}/mo with
                        financing
                      </span>
                    </div>
                    <div className="mt-1.5 text-[11px] opacity-70">
                      Final quote confirmed after a free inspection.
                    </div>
                  </>
                )}
              </motion.div>

              {/* Breakdown */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Stat
                  i={0}
                  label="Roof area"
                  value={`${result.roofSqFt.toLocaleString()} sq ft`}
                  sub={`${result.squares} squares`}
                />
                <Stat
                  i={1}
                  label="Price per square"
                  value={`${usd.format(materialById(material).pricePerSquare.low)}–${usd.format(materialById(material).pricePerSquare.high)}`}
                  sub="Materials + labor"
                />
                <Stat
                  i={2}
                  label="Expected lifespan"
                  value={`${materialById(material).lifespanYears.low}–${materialById(material).lifespanYears.high} yrs`}
                  sub="With normal maintenance"
                />
                <Stat
                  i={3}
                  label="Cost per year"
                  value={`${usd.format(result.perYear.low)}–${usd.format(result.perYear.high)}`}
                  sub="Price ÷ lifespan"
                />
              </div>

              {/* Book the free inspection — the actual money event */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                id="rc-book"
                className="mt-4 rounded-2xl border border-[#e2e8f0] bg-white p-4"
              >
                {booking === "done" ? (
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <CalendarCheck className="size-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">
                        Inspection requested
                      </div>
                      <p className="mt-0.5 text-sm text-[#475569]">
                        {config.companyName} will call {formatPhone(lead.phone)}{" "}
                        to confirm the exact time.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-1 flex items-center gap-2 text-sm font-semibold">
                      <CalendarCheck className="size-4 text-[var(--rc)]" />
                      Lock in this range with a free inspection
                    </div>
                    <p className="mb-3 text-xs text-[#64748b]">
                      Pick a time that works. Takes about 30 minutes, no
                      obligation.
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {slots.map((sl) => {
                        const active = slot === sl.id;
                        return (
                          <button
                            key={sl.id}
                            type="button"
                            onClick={() => {
                              haptic();
                              setSlot(sl.id);
                            }}
                            aria-pressed={active}
                            className={`rounded-xl border px-3 py-2.5 text-left transition-colors ${
                              active
                                ? "border-[var(--rc)] bg-[var(--rc-soft)] shadow-[0_0_0_3px_var(--rc-ring)]"
                                : "border-[#e2e8f0] hover:border-[#cbd5e1]"
                            }`}
                          >
                            <div className="text-sm font-semibold">
                              {sl.day}
                            </div>
                            <div className="text-[11px] text-[#64748b]">
                              {sl.window}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <motion.button
                      type="button"
                      onClick={() => void book()}
                      disabled={!slot || !leadId || booking === "sending"}
                      whileTap={slot ? { scale: 0.98 } : undefined}
                      className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0f172a] text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {booking === "sending"
                        ? "Sending…"
                        : leadId
                          ? "Request this time"
                          : "Call to schedule"}
                    </motion.button>
                  </>
                )}
              </motion.div>

              {/* Goal-specific next step */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-4 rounded-2xl border border-[#e2e8f0] bg-white p-4"
              >
                <div className="mb-1 flex items-center gap-2 text-sm font-semibold">
                  <Sparkles className="size-4 text-[var(--rc)]" />
                  {goal === "storm"
                    ? "Good news for storm damage"
                    : goal === "age"
                      ? "Timing matters"
                      : "New build advantage"}
                </div>
                <p className="text-sm text-[#475569]">
                  {goalById(goal).insight}
                </p>
                {goal === "storm" && (
                  <p className="mt-2 text-sm text-[#475569]">
                    Have your policy number ready. {config.companyName} can
                    document the damage and meet your adjuster on site.
                  </p>
                )}
              </motion.div>

              {/* What moves the price */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75 }}
                className="mt-4"
              >
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                  What moves your final price
                </div>
                <ul className="grid gap-2">
                  {PRICE_FACTORS.map((f) => (
                    <li
                      key={f.label}
                      className="flex gap-3 rounded-xl border border-[#e2e8f0] bg-white px-3 py-2.5"
                    >
                      <div className="mt-0.5 size-1.5 shrink-0 rounded-full bg-[var(--rc)]" />
                      <div>
                        <div className="text-sm font-medium">{f.label}</div>
                        <div className="text-xs text-[#64748b]">{f.detail}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </motion.div>

              <button
                type="button"
                onClick={reset}
                className="mt-6 text-xs font-medium text-[#64748b] underline-offset-4 hover:underline"
              >
                Start over with different options
              </button>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      {/* Fixed bottom CTA */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[#e2e8f0] bg-white/85 backdrop-blur-xl [padding-bottom:env(safe-area-inset-bottom,0px)]">
        <div className="mx-auto flex w-full max-w-xl items-center gap-3 px-4 py-3 sm:px-6">
          {step > 0 && step < 4 && (
            <button
              type="button"
              onClick={() => go(step - 1)}
              aria-label="Back"
              className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-[#e2e8f0] bg-white text-[#475569] transition hover:border-[#cbd5e1]"
            >
              <ArrowLeft className="size-5" />
            </button>
          )}

          {step < 4 ? (
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <motion.button
                type="button"
                onClick={next}
                disabled={!canContinue || submitting}
                whileTap={canContinue ? { scale: 0.98 } : undefined}
                animate={
                  canContinue && !submitting
                    ? { boxShadow: pulseShadow }
                    : { boxShadow: "0 0 0 0px rgba(0,0,0,0)" }
                }
                transition={
                  canContinue
                    ? { duration: 1.4, repeat: Infinity, ease: "easeOut" }
                    : undefined
                }
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--rc)] text-[15px] font-semibold text-[var(--rc-fg)] transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
              >
                {submitting ? (
                  "Unlocking…"
                ) : step === 3 ? (
                  <>
                    {canContinue ? (
                      <LockOpen className="size-4" />
                    ) : (
                      <Lock className="size-4" />
                    )}{" "}
                    Reveal my estimate
                  </>
                ) : step === 0 && !goal ? (
                  "Pick one to continue"
                ) : step === 0 && !qualified ? (
                  "One more quick tap"
                ) : (
                  <>
                    Continue <ArrowRight className="size-4" />
                  </>
                )}
              </motion.button>
              <div className="flex items-center justify-center gap-1 text-[11px] text-[#64748b]">
                {step === 3 ? (
                  <>
                    <ShieldCheck className="size-3 text-emerald-600" /> No spam
                    · No obligation
                  </>
                ) : hasPhone ? (
                  <>
                    Prefer to talk?{" "}
                    <a
                      href={tel}
                      className="font-semibold text-[var(--rc)] underline-offset-2 hover:underline"
                    >
                      Call {phonePretty}
                    </a>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="size-3 text-emerald-600" /> Free ·
                    No obligation
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              {hasPhone ? (
                <motion.a
                  href={tel}
                  whileTap={{ scale: 0.98 }}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--rc)] text-[15px] font-semibold text-[var(--rc-fg)] shadow-[0_12px_30px_-12px_var(--rc-glow)]"
                >
                  <Phone className="size-4" /> Call {phonePretty}
                </motion.a>
              ) : (
                <motion.button
                  type="button"
                  onClick={scrollToBooking}
                  whileTap={{ scale: 0.98 }}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--rc)] text-[15px] font-semibold text-[var(--rc-fg)] shadow-[0_12px_30px_-12px_var(--rc-glow)]"
                >
                  <CalendarCheck className="size-4" />{" "}
                  {booking === "done"
                    ? "Inspection requested"
                    : "Book free inspection"}
                </motion.button>
              )}
              <div className="text-center text-[11px] text-[#64748b]">
                Lock in this range with a free inspection from{" "}
                {config.companyName}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                      */
/* ------------------------------------------------------------------ */

function Progress({ step }: { step: number }) {
  return (
    <div className="mb-6">
      <div className="grid grid-cols-4 gap-1.5">
        {STEP_LABELS.map((label, i) => {
          const done = step > i;
          const current = step === i;
          return (
            <div key={label}>
              <div className="h-1.5 overflow-hidden rounded-full bg-[#e2e8f0]">
                <motion.div
                  className="h-full rounded-full bg-[var(--rc)]"
                  initial={false}
                  animate={{
                    width: done || step === 4 ? "100%" : current ? "45%" : "0%",
                  }}
                  transition={{ type: "spring", stiffness: 120, damping: 20 }}
                />
              </div>
              <div
                className={`mt-1.5 text-[10px] font-semibold uppercase tracking-wide ${
                  done || current ? "text-[#0f172a]" : "text-[#94a3b8]"
                }`}
              >
                {label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StepTitle({
  kicker,
  title,
  hint,
}: {
  kicker: string;
  title: string;
  hint?: string;
}) {
  return (
    <div className="mb-4">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--rc)]">
        {kicker}
      </div>
      <h2 className="mt-0.5 text-xl font-bold tracking-tight sm:text-2xl">
        {title}
      </h2>
      {hint && <p className="mt-1 text-sm text-[#64748b]">{hint}</p>}
    </div>
  );
}

function CheckBadge() {
  return (
    <motion.span
      initial={{ scale: 0, rotate: -30 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={pop}
      className="absolute -right-1.5 -top-1.5 flex size-6 items-center justify-center rounded-full bg-[var(--rc)] text-[var(--rc-fg)] shadow-md"
    >
      <Check className="size-3.5" strokeWidth={3} />
    </motion.span>
  );
}

function ChoiceCard({
  active,
  onClick,
  media,
  badge,
  title,
  subtitle,
  meta,
  children,
}: {
  active: boolean;
  onClick: () => void;
  media: React.ReactNode;
  badge?: string;
  title: string;
  subtitle: string;
  meta?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.985 }}
      animate={active ? { scale: [1, 1.015, 1] } : { scale: 1 }}
      transition={{ duration: 0.28 }}
      aria-pressed={active}
      className={`relative w-full rounded-2xl border bg-white p-3 text-left transition-colors ${
        active
          ? "border-[var(--rc)] shadow-[0_0_0_3px_var(--rc-ring),0_12px_30px_-16px_var(--rc-glow)]"
          : "border-[#e2e8f0] hover:border-[#cbd5e1]"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="size-20 shrink-0 overflow-hidden rounded-xl bg-[#f1f5f9]">
          {media}
        </div>
        <div className="min-w-0 flex-1">
          {badge && (
            <span className="mb-1 inline-block rounded-full bg-[#0f172a] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
              {badge}
            </span>
          )}
          <div className="text-[15px] font-semibold leading-tight">{title}</div>
          <div className="mt-0.5 text-xs text-[#64748b]">{subtitle}</div>
          {meta && <div className="mt-1 text-xs text-[#64748b]">{meta}</div>}
        </div>
        <div
          className={`flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
            active
              ? "border-[var(--rc)] bg-[var(--rc)] text-[var(--rc-fg)]"
              : "border-[#cbd5e1]"
          }`}
        >
          {active && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={pop}
            >
              <Check className="size-3.5" strokeWidth={3} />
            </motion.span>
          )}
        </div>
      </div>
      {children}
    </motion.button>
  );
}

function ChipGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { id: T; label: string }[];
  value: T | null;
  onChange: (v: T) => void;
}) {
  return (
    <div className="mt-4">
      <div className="mb-2 text-sm font-semibold">{label}</div>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const active = value === o.id;
          return (
            <motion.button
              key={o.id}
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => onChange(o.id)}
              aria-pressed={active}
              className={`rounded-full border px-3.5 py-2 text-sm font-medium transition-colors ${
                active
                  ? "border-[var(--rc)] bg-[var(--rc)] text-[var(--rc-fg)]"
                  : "border-[#e2e8f0] bg-white text-[#334155] hover:border-[#cbd5e1]"
              }`}
            >
              {o.label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function Insight({ text }: { text: string }) {
  return (
    <motion.div
      key="insight"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className="overflow-hidden"
    >
      <div className="mt-3 flex gap-2 rounded-xl bg-[var(--rc-soft)] p-3 text-xs leading-relaxed text-[#334155]">
        <Sparkles className="mt-0.5 size-3.5 shrink-0 text-[var(--rc)]" />
        <span>{text}</span>
      </div>
    </motion.div>
  );
}

function Field({
  label,
  value,
  onChange,
  error,
  ...rest
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value">) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-[#475569]">
        {label}
      </span>
      <input
        {...rest}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        className={`h-12 w-full rounded-xl border bg-white px-4 text-base outline-none transition placeholder:text-[#cbd5e1] focus:border-[var(--rc)] focus:ring-[3px] focus:ring-[var(--rc-ring)] ${
          error ? "border-red-500" : "border-[#e2e8f0]"
        }`}
      />
      <AnimatePresence>
        {error && (
          <motion.span
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-1 block text-xs text-red-600"
          >
            {error}
          </motion.span>
        )}
      </AnimatePresence>
    </label>
  );
}

function Stat({
  i,
  label,
  value,
  sub,
}: {
  i: number;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 + i * 0.08, ...pop }}
      className="rounded-2xl border border-[#e2e8f0] bg-white p-3.5"
    >
      <div className="text-[10px] font-semibold uppercase tracking-wide text-[#94a3b8]">
        {label}
      </div>
      <div className="mt-0.5 text-base font-bold tabular-nums">{value}</div>
      <div className="text-[11px] text-[#64748b]">{sub}</div>
    </motion.div>
  );
}
