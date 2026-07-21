"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  User2,
  Building2,
  BadgeCheck,
  Phone,
  MessageCircle,
  Check,
} from "lucide-react";

const GOLD = "#f0b656";

type StepType = "text" | "tel" | "choice";

type Step = {
  key: string;
  kicker: string;
  label: string;
  type: StepType;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  required?: boolean;
  placeholder?: string;
  options?: string[];
};

const STEPS: Step[] = [
  {
    key: "name",
    kicker: "Hajde da krenemo od vas",
    label: "Vaše ime i prezime?",
    type: "text",
    icon: User2,
    required: true,
    placeholder: "Petar Petrović",
  },
  {
    key: "brand",
    kicker: "Malo detaljnije da se upoznamo",
    label: "Koji je naziv vašeg brenda?",
    type: "text",
    icon: Building2,
    required: true,
    placeholder: "npr. Infinity Laser Studio",
  },
  {
    key: "registered",
    kicker: "Čisto da znamo",
    label: "Da li imate registrovanu firmu?",
    type: "choice",
    icon: BadgeCheck,
    required: true,
    options: ["Da", "Ne", "U procesu"],
  },
  {
    key: "phone",
    kicker: "Skoro smo gotovi",
    label: "Broj telefona",
    type: "tel",
    icon: Phone,
    required: true,
    placeholder: "+381 6x xxx xxxx",
  },
  {
    key: "contact",
    kicker: "Poslednji korak",
    label: "Kako želite da Vas kontaktiramo?",
    type: "choice",
    icon: MessageCircle,
    required: true,
    options: ["WhatsApp", "Viber", "SMS", "Poziv"],
  },
];

type Props = {
  children: React.ReactNode; // trigger
};

export default function CreativeQuizPopup({ children }: Props) {
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [data, setData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const step = STEPS[idx];
  const progress = useMemo(() => ((idx + 1) / STEPS.length) * 100, [idx]);

  function validate(step: Step, value: string): string {
    const v = (value ?? "").trim();
    if (step.required && !v) return "Ovo polje je obavezno.";
    if (v && step.type === "tel") {
      const re = /^[+]?[\d\s()-]{6,}$/;
      if (!re.test(v)) return "Unesite važeći broj telefona.";
    }
    return "";
  }

  function setValue(key: string, value: string) {
    setData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      const stepDef = STEPS.find((s) => s.key === key)!;
      setErrors((e) => ({ ...e, [key]: validate(stepDef, value) }));
    }
  }

  async function submitAll() {
    const newErrors: Record<string, string> = {};
    STEPS.forEach((s) => {
      const msg = validate(s, data[s.key] ?? "");
      if (msg) newErrors[s.key] = msg;
    });
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      const firstBadIdx = STEPS.findIndex((s) => newErrors[s.key]);
      if (firstBadIdx >= 0) setIdx(firstBadIdx);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "creative-engine-quiz", ...data }),
      });
      if (!res.ok) throw new Error("Network error");
      toast.success("Zahtev poslat.");
      setSubmitted(true);
      setErrors({});
    } catch {
      toast.error("Ups, pokušaj ponovo.");
    } finally {
      setLoading(false);
    }
  }

  function next() {
    const msg = validate(step, data[step.key] ?? "");
    if (msg) {
      setErrors((e) => ({ ...e, [step.key]: msg }));
      return;
    }
    if (idx < STEPS.length - 1) setIdx(idx + 1);
    else submitAll();
  }

  function back() {
    if (idx > 0) setIdx(idx - 1);
  }

  function pickChoice(value: string) {
    setValue(step.key, value);
    setErrors((e) => ({ ...e, [step.key]: "" }));
    if (idx < STEPS.length - 1) setIdx(idx + 1);
    else setData((prev) => ({ ...prev, [step.key]: value }));
  }

  function resetAll(close = false) {
    setIdx(0);
    setData({});
    setErrors({});
    setSubmitted(false);
    if (close) setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) resetAll(false);
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-w-[95%] sm:max-w-lg p-0 overflow-hidden text-foreground">
        {/* progress */}
        {!submitted ? (
          <div className="h-3 bg-background">
            <div
              className="h-full transition-all duration-300"
              style={{ width: `${progress}%`, background: GOLD }}
            />
          </div>
        ) : (
          <div className="h-1 bg-secondary/50" />
        )}

        <div className="p-6">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {submitted ? "Zahtev je poslat" : "Creative Engine - upitnik"}
            </DialogTitle>
            <DialogDescription>
              {submitted
                ? "Javićemo vam se uskoro na izabrani kanal."
                : `${STEPS.length} kratkih pitanja ~ 30 sekundi.`}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-5">
            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.div
                  key={`step-${step.key}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="grid gap-3"
                >
                  <p
                    className="text-xs font-semibold uppercase tracking-widest"
                    style={{ color: GOLD }}
                  >
                    {step.kicker}
                  </p>
                  <label className="flex items-center gap-2 text-base font-semibold">
                    <step.icon className="size-4" style={{ color: GOLD }} />
                    {step.label}
                    {step.required ? " *" : ""}
                  </label>

                  {step.type === "choice" ? (
                    <div className="mt-1 grid gap-2">
                      {step.options!.map((opt) => {
                        const active = data[step.key] === opt;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => pickChoice(opt)}
                            className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors ${
                              active
                                ? "border-[#f0b656] bg-[#f0b656]/10"
                                : "border-border hover:border-[#f0b656]/50 hover:bg-[#f0b656]/5"
                            }`}
                          >
                            {opt}
                            {active && (
                              <Check
                                className="size-4"
                                style={{ color: GOLD }}
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <Input
                      type={step.type === "tel" ? "tel" : "text"}
                      {...(step.type === "tel" ? { inputMode: "tel" } : {})}
                      value={data[step.key] ?? ""}
                      onChange={(e) => setValue(step.key, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          next();
                        }
                      }}
                      placeholder={step.placeholder}
                      className={
                        errors[step.key] ? "border-red-500" : undefined
                      }
                    />
                  )}

                  {errors[step.key] && (
                    <p className="text-xs text-red-600">{errors[step.key]}</p>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="grid place-items-center gap-4 py-10 text-center"
                >
                  <div
                    className="grid size-14 place-items-center rounded-full"
                    style={{ background: `${GOLD}1f`, color: GOLD }}
                  >
                    <Check className="size-7" strokeWidth={2.5} aria-hidden />
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-lg font-semibold">Zahtev je poslat</p>
                    <p className="text-sm text-muted-foreground">
                      Kontaktiraćemo vas putem
                      {data.contact
                        ? ` ${data.contact}`
                        : " izabranog kanala"}{" "}
                      uskoro.
                    </p>
                  </div>
                  <Button
                    className="mt-1 cursor-pointer text-background"
                    onClick={() => resetAll(true)}
                  >
                    Zatvori
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {!submitted && (
            <div className="mt-6 flex items-center justify-between">
              <Button
                variant="outline"
                onClick={back}
                disabled={idx === 0 || loading}
                className="cursor-pointer"
              >
                Nazad
              </Button>
              <div className="text-xs text-muted-foreground">
                {idx + 1} / {STEPS.length}
              </div>
              <Button
                onClick={next}
                disabled={loading}
                className="cursor-pointer font-bold text-background"
              >
                {idx === STEPS.length - 1
                  ? loading
                    ? "Slanje..."
                    : "Pošalji"
                  : "Dalje"}
              </Button>
            </div>
          )}
        </div>

        <div className="pointer-events-none h-8 w-full bg-[radial-gradient(40%_60%_at_50%_0%,hsl(var(--primary)/0.25),transparent)]" />
      </DialogContent>
    </Dialog>
  );
}
