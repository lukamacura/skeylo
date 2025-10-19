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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Link as LinkIcon,
  Target,
  Banknote,
  PiggyBank,
  Bug,
  Send,
  User2,
  CheckCircle2,
  Mail,
  PartyPopper,
} from "lucide-react";

type StepType = "text" | "number" | "input" | "textarea" | "email" | "url";

type Step = {
  key: string;
  label: string;
  required?: boolean;
  type: StepType;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  placeholder?: string;
  rows?: number;
};

const STEPS: Step[] = [
  {
    key: "name",
    label: "Ime i prezime",
    type: "text",
    icon: User2,
    required: true,
    placeholder: "Petar Petrović",
  },
  {
    key: "email",
    label: "Email za izveštaj",
    type: "email",
    icon: Send,
    required: true,
    placeholder: "founder@firma.com",
  },
  {
    key: "goal90",
    label: "Glavni cilj u narednih 90 dana",
    type: "input",
    icon: Target,
    required: true,
    placeholder:
      "npr. +30% kvalifikovanih leadova / ROAS ≥ 3.0 / smanjiti CAC za 20%",
  },
  {
    key: "unitProfit",
    label: "Prosečna zarada po kupovini / klijentu (neto)",
    type: "number",
    icon: Banknote,
    required: true,
    placeholder: "npr. 35 (EUR)",
  },
  {
    key: "budget",
    label: "Mesečni budžet po kanalima (opciono)",
    type: "textarea",
    icon: PiggyBank,
    rows: 2,
    placeholder: "Meta 2.000€, Google 1.500€, TikTok 500€…",
  },
  {
    key: "tracking",
    label: "Tehnički izazovi (opciono)",
    type: "textarea",
    icon: Bug,
    rows: 2,
    placeholder: "Ne znam kako da pratim potencijalne klijente.",
  },
  {
    key: "url",
    label: "URL sajta / glavnog landinga",
    type: "url",
    icon: LinkIcon,
    placeholder: "https://...",
  },
];

type Props = {
  triggerText?: string;
};

export default function FreeAnalysisWizard({
  triggerText = "Zakaži besplatnu analizu",
}: Props) {
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [data, setData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const step = STEPS[idx];
  const progress = useMemo(() => ((idx + 1) / STEPS.length) * 100, [idx]);

  // ---------- Validacija ----------
  function validate(step: Step, value: string): string {
    const v = (value ?? "").trim();

    if (step.required && !v) {
      return "Ovo polje je obavezno.";
    }

    if (v) {
      switch (step.type) {
        case "email": {
          const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!re.test(v)) return "Unesite važeću email adresu.";
          break;
        }
        case "url": {
          try {
            const u = new URL(v);
            if (!["http:", "https:"].includes(u.protocol)) {
              return "URL mora počinjati sa http(s)://";
            }
          } catch {
            return "Unesite važeći URL (npr. https://primer.com).";
          }
          break;
        }
        case "number": {
          const num = Number(v.replace(",", "."));
          if (Number.isNaN(num)) return "Unesite broj (npr. 35).";
          if (num < 0) return "Vrednost ne može biti negativna.";
          break;
        }
      }
    }

    return "";
  }

  function setValue(key: string, value: string) {
    setData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      const stepDef = STEPS.find((s) => s.key === key)!;
      const msg = validate(stepDef, value);
      setErrors((e) => ({ ...e, [key]: msg }));
    }
  }

  async function submitAll() {
    // finalna validacija svih required polja
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
        body: JSON.stringify({ type: "free-analysis", ...data }),
      });
      if (!res.ok) throw new Error("Network error");
      toast.success("Zahtev poslat.");
      // ✅ ostajemo u istom modalu i prikazujemo success deo
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
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="cursor-pointer bg-primary font-extrabold text-background"
        >
          {triggerText}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[95%] p-0 overflow-hidden text-foreground">
        {/* progress bar ili prazan prostor na success ekranu */}
        {!submitted ? (
          <div className="h-3 bg-background">
            <div
              className="h-full bg-primary"
              style={{ width: `${progress}%` }}
            />
          </div>
        ) : (
          <div className="h-1 bg-secondary/50" />
        )}

        <div className="p-6">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {submitted ? "Zahtev je poslat" : "Besplatna analiza marketinga"}
            </DialogTitle>
            <DialogDescription>
              {submitted
                ? "Javićemo vam se na email sa izveštajem i sledećim koracima."
                : `Odgovori na ${STEPS.length} kratkih pitanja ~ 1 minut.`}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 ">
            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.div
                  key={`step-${step.key}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="grid gap-2 "
                >
                  <label className="text-sm flex items-center gap-2">
                    <step.icon className="size-4" />
                    {step.label}
                    {step.required ? " *" : ""}
                  </label>

                  {step.type === "textarea" ? (
                    <Textarea
                      rows={step.rows ?? 3}
                      value={data[step.key] ?? ""}
                      onChange={(e) => setValue(step.key, e.target.value)}
                      placeholder={step.placeholder}
                      className={
                        errors[step.key] ? "border-red-500" : undefined
                      }
                    />
                  ) : (
                    <Input
                      type={
                        step.type === "url"
                          ? "url"
                          : step.type === "email"
                            ? "email"
                            : step.type === "number"
                              ? "number"
                              : "text"
                      }
                      {...(step.type === "number"
                        ? { min: 0, step: "0.01", inputMode: "decimal" }
                        : {})}
                      value={data[step.key] ?? ""}
                      onChange={(e) => setValue(step.key, e.target.value)}
                      placeholder={step.placeholder}
                      className={
                        errors[step.key] ? " border-red-500" : undefined
                      }
                    />
                  )}

                  {/* inline error */}
                  {errors[step.key] && (
                    <p className="text-xs text-red-600">{errors[step.key]}</p>
                  )}

                  {/* hint za email/privatnost */}
                  {step.key === "email" && (
                    <p className="text-xs text-muted-foreground">
                      Tvoj email koristimo isključivo za slanje izveštaja.{" "}
                      <a href="/privacy" className="underline">
                        Politika privatnosti
                      </a>
                      .
                    </p>
                  )}
                </motion.div>
              ) : (
                // ✅ SUCCESS EKRAN
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="grid place-items-center gap-3  text-center py-6"
                >
                  <CheckCircle2 className="size-12" aria-hidden />
                  <p className="text-lg font-medium">Poslat zahtev 🎉</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Mail className="size-4" />
                    Javićemo vam se na mail
                    {data.email ? ` (${data.email})` : ""}.
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <Button
                      className="cursor-pointer text-background"
                      onClick={() => resetAll(true)}
                    >
                      Zatvori
                    </Button>
                    <Button
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() => resetAll(false)}
                    >
                      Novi zahtev
                    </Button>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                    <PartyPopper className="size-4" />
                    Hvala na poverenju!
                  </div>
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
                className="cursor-pointer text-background font-bold"
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

        {/* suptilni glow */}
        <div className="pointer-events-none h-8 w-full bg-[radial-gradient(40%_60%_at_50%_0%,hsl(var(--primary)/0.25),transparent)]" />
      </DialogContent>
    </Dialog>
  );
}
