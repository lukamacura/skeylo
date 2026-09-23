"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { addDays, format, isWeekend } from "date-fns";
import { srLatn } from "date-fns/locale";
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
import {
  User2,
  CalendarDays,
  Clock,
  Check,
  ArrowLeft,
  MessageCircle,
} from "lucide-react";
import { PEOPLE } from "@/lib/people";

const GOLD = "#f0b656";

/** Filipov WhatsApp (E.164 bez plusa) - jedini izvor je people.ts */
const FILIP_WHATSAPP = PEOPLE.find((p) => p.key === "filip")?.whatsapp ?? "";

/** Koliko radnih dana unapred nudimo */
const DAYS_AHEAD = 7;
const TIME_SLOTS = ["10:00", "12:00", "14:00", "16:00", "18:00"];

type Slot = { iso: string; label: string };

const ucFirst = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Sledećih N radnih dana, počev od sutra. */
function buildDays(count: number): Slot[] {
  const out: Slot[] = [];
  let d = addDays(new Date(), 1);
  while (out.length < count) {
    if (!isWeekend(d)) {
      out.push({
        iso: format(d, "yyyy-MM-dd"),
        label: ucFirst(format(d, "EEEE, d. MMMM", { locale: srLatn })),
      });
    }
    d = addDays(d, 1);
  }
  return out;
}

const STEPS = [
  {
    key: "name",
    kicker: "Zakažite poziv",
    label: "Vaše ime i prezime?",
    icon: User2,
  },
  {
    key: "date",
    kicker: "Izaberite dan",
    label: "Koji dan Vam odgovara za poziv?",
    icon: CalendarDays,
  },
  {
    key: "time",
    kicker: "Izaberite vreme",
    label: "U koliko sati da Vas pozovemo?",
    icon: Clock,
  },
] as const;

type StepKey = (typeof STEPS)[number]["key"];

function buildWaMessage(name: string, day: Slot | undefined, time: string) {
  const who = name.trim() || "Nepoznato ime";
  const when = day ? `${day.label} u ${time}` : time;
  return `Zdravo Filipe, ovde ${who}. Zakazujem poziv za Podcast simulaciju: ${when}.`;
}

type Props = {
  children: React.ReactNode; // trigger
};

export default function PodcastQuizPopup({ children }: Props) {
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [data, setData] = useState<Partial<Record<StepKey, string>>>({});
  const [error, setError] = useState("");

  // Dani se računaju pri otvaranju popupa, ne pri renderu stranice.
  const days = useMemo(() => (open ? buildDays(DAYS_AHEAD) : []), [open]);

  const step = STEPS[idx];
  const progress = ((idx + 1) / STEPS.length) * 100;

  const selectedDay = days.find((d) => d.iso === data.date);
  const waHref = FILIP_WHATSAPP
    ? `https://wa.me/${FILIP_WHATSAPP}?text=${encodeURIComponent(
        buildWaMessage(data.name ?? "", selectedDay, data.time ?? ""),
      )}`
    : "";

  function validate(key: StepKey): string {
    if (!(data[key] ?? "").trim()) {
      return key === "name" ? "Unesite ime." : "Izaberite opciju.";
    }
    return "";
  }

  function next() {
    const msg = validate(step.key);
    if (msg) {
      setError(msg);
      return;
    }
    setError("");
    if (idx < STEPS.length - 1) setIdx(idx + 1);
  }

  function back() {
    setError("");
    if (idx > 0) setIdx(idx - 1);
  }

  function pick(value: string) {
    setData((prev) => ({ ...prev, [step.key]: value }));
    setError("");
    if (idx < STEPS.length - 1) setIdx(idx + 1);
  }

  /** Klik na "Pošalji na WhatsApp": lead ide u CRM, link otvara WhatsApp. */
  function confirm() {
    const msg = validate("time");
    if (msg) {
      setError(msg);
      return;
    }
    // Ne čekamo odgovor - wa.me mora da se otvori direktno iz klika
    // (Safari blokira popup posle await-a). keepalive preživi navigaciju.
    void fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        type: "podcast-simulation-quiz",
        name: data.name,
        contact: "WhatsApp",
        callDate: data.date,
        callDateLabel: selectedDay?.label,
        callTime: data.time,
      }),
    }).catch(() => {});
    setSubmitted(true);
  }

  function resetAll(close = false) {
    setIdx(0);
    setData({});
    setError("");
    setSubmitted(false);
    if (close) setOpen(false);
  }

  const isLast = idx === STEPS.length - 1;

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

        <div className="p-6 pt-4">
          {!submitted && (
            <button
              type="button"
              onClick={back}
              disabled={idx === 0}
              aria-label="Nazad"
              className={`-ml-2 mb-2 inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground ${
                idx === 0 ? "invisible" : ""
              }`}
            >
              <ArrowLeft className="size-3.5" aria-hidden />
              Nazad
            </button>
          )}

          <DialogHeader>
            <DialogTitle
              className="text-xl"
              style={submitted ? undefined : { color: GOLD }}
            >
              {submitted
                ? `Hvala, ${(data.name ?? "").trim().split(/\s+/)[0]}!`
                : step.kicker}
            </DialogTitle>
            <DialogDescription>
              {submitted
                ? "Termin je poslat Filipu na WhatsApp."
                : "Izaberite dan i vreme, a termin stiže Filipu na WhatsApp."}
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
                  <label className="flex items-center gap-2 text-base font-semibold">
                    <step.icon className="size-4" style={{ color: GOLD }} />
                    {step.label}
                  </label>

                  {step.key === "name" && (
                    <Input
                      type="text"
                      autoFocus
                      value={data.name ?? ""}
                      onChange={(e) => {
                        setData((p) => ({ ...p, name: e.target.value }));
                        if (error) setError("");
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          next();
                        }
                      }}
                      placeholder="Petar Petrović"
                      className={error ? "border-red-500" : undefined}
                    />
                  )}

                  {step.key === "date" && (
                    <div className="mt-1 grid gap-2">
                      {days.map((d) => {
                        const active = data.date === d.iso;
                        return (
                          <button
                            key={d.iso}
                            type="button"
                            onClick={() => pick(d.iso)}
                            className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors ${
                              active
                                ? "border-[#f0b656] bg-[#f0b656]/10"
                                : "border-border hover:border-[#f0b656]/50 hover:bg-[#f0b656]/5"
                            }`}
                          >
                            {d.label}
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
                  )}

                  {step.key === "time" && (
                    <>
                      {selectedDay && (
                        <p className="text-xs text-muted-foreground">
                          {selectedDay.label}
                        </p>
                      )}
                      <div className="mt-1 grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {TIME_SLOTS.map((t) => {
                          const active = data.time === t;
                          return (
                            <button
                              key={t}
                              type="button"
                              onClick={() => {
                                setData((p) => ({ ...p, time: t }));
                                setError("");
                              }}
                              className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
                                active
                                  ? "border-[#f0b656] bg-[#f0b656]/10"
                                  : "border-border hover:border-[#f0b656]/50 hover:bg-[#f0b656]/5"
                              }`}
                            >
                              {t}
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
                    </>
                  )}

                  {error && <p className="text-xs text-red-600">{error}</p>}
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
                    <p className="text-lg font-semibold">
                      {selectedDay?.label} u {data.time}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Ako se WhatsApp nije otvorio, pošaljite poruku ručno:
                    </p>
                    <a
                      href={waHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold underline underline-offset-4"
                      style={{ color: GOLD }}
                    >
                      <MessageCircle className="size-4" aria-hidden />
                      Otvori WhatsApp
                    </a>
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
            <div className="mt-6 grid gap-3">
              {isLast ? (
                // Anchor, ne button: wa.me se otvara direktno iz gesta korisnika.
                <Button
                  asChild
                  size="lg"
                  className="h-14 w-full cursor-pointer text-base font-bold text-background"
                >
                  <a
                    href={waHref || undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      if (!data.time || !waHref) {
                        e.preventDefault();
                        setError(
                          waHref
                            ? "Izaberite vreme."
                            : "WhatsApp broj nije podešen.",
                        );
                        return;
                      }
                      confirm();
                    }}
                  >
                    <MessageCircle className="size-5" aria-hidden />
                    Pošalji termin na WhatsApp
                  </a>
                </Button>
              ) : (
                <Button
                  onClick={next}
                  size="lg"
                  className="h-14 w-full cursor-pointer text-base font-bold text-background"
                >
                  Dalje
                </Button>
              )}
              <div className="text-center text-xs text-muted-foreground">
                {idx + 1} / {STEPS.length}
              </div>
            </div>
          )}
        </div>

        <div className="pointer-events-none h-8 w-full bg-[radial-gradient(40%_60%_at_50%_0%,hsl(var(--primary)/0.25),transparent)]" />
      </DialogContent>
    </Dialog>
  );
}
