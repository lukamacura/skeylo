/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/meet/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation"; // ✅ import router
import { CalendarClock, MapPin, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { enUS } from "date-fns/locale"; // preporuka za stabilnu hidraciju

export default function MeetPage() {
  const router = useRouter(); // ✅ inicijalizacija router-a

  const [mounted, setMounted] = useState(false);
  const [slotISO, setSlotISO] = useState<string | null>(null);
  const [mode, setMode] = useState<"uzivo" | "online">("online");
  const [date, setDate] = useState<Date | undefined>();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => setMounted(true), []);

  // Dozvoljeni dani: Pet / Sub / Ned
  const isAllowedDay = (d: Date) => {
    const day = d.getDay(); // 0=Sun, 5=Fri, 6=Sat
    return day === 5 || day === 6 || day === 0;
  };

  // "danas" samo na klijentu (izbegava SSR/CSR razlike)
  const todayStart = useMemo(() => {
    const n = new Date();
    n.setHours(0, 0, 0, 0);
    return n;
  }, [mounted]);

  // Lep label za odabrani termin
  const selectedLabel = useMemo(() => {
    if (!slotISO) return null;
    return new Date(slotISO).toLocaleString("sr-RS", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [slotISO]);

  async function handleReserve() {
    // ako je izabran samo datum, setuj 19:00
    let effectiveISO = slotISO;
    if (!effectiveISO && date) {
      const d = new Date(date);
      d.setHours(19, 0, 0, 0);
      effectiveISO = d.toISOString();
      setSlotISO(effectiveISO);
    }

    if (!effectiveISO) return alert("Izaberite termin");
    if (!name.trim()) return alert("Unesite ime");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return alert("Unesite ispravan email");

    // ✅ slotLocalStr postoji pre upotrebe i u payload-u i u router.push
    const slotLocalStr = new Date(effectiveISO).toLocaleString("sr-RS", {
      timeZone: "Europe/Belgrade",
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        mode,
        slotISO: effectiveISO,
        slotLocal: slotLocalStr,
        timezone: "Europe/Belgrade",
        source: "meet-page",
      } as const;

      const res = await fetch("/api/meet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || "Greška prilikom rezervacije");
      }

      // ✅ koristimo router da odemo na confirm sa svim podacima
      router.push(
        `/meet/confirm?` +
          `name=${encodeURIComponent(name)}` +
          `&email=${encodeURIComponent(email)}` +
          `&mode=${mode}` +
          `&slotISO=${encodeURIComponent(effectiveISO)}` +
          `&slotLocal=${encodeURIComponent(slotLocalStr)}`,
      );
    } catch (e: any) {
      alert(e.message || "Došlo je do greške.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-[100dvh] bg-background">
      <section className="container mx-auto px-4 py-10 md:py-16">
        {/* Hero */}
        <div className="mx-auto max-w-3xl text-center">
          <Badge
            variant="secondary"
            className="mb-3 inline-flex items-center gap-1 px-2.5 py-1 text-sm bg-transparent text-foreground"
          >
            <CalendarClock className="size-3.5" />
            Zakazivanje
          </Badge>

          <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
            Ukoliko ste spremni za saradnju
          </h1>

          <p className="mt-3 text-foreground md:text-lg">
            Zakažite sastanak sa nama. Izaberite datum iz kalendara.
          </p>
        </div>

        {/* Scheduler */}
        <Card className="mx-auto mt-8 max-w-2xl border border-foreground/40 bg-transparent text-foreground">
          <CardContent className="space-y-6 p-4 md:p-6">
            {/* Kontakt podaci */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                placeholder="Ime i prezime"
                className="h-10 rounded-md border border-foreground/40 bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                aria-label="Ime i prezime"
                required
              />
              <input
                placeholder="Email"
                className="h-10 rounded-md border border-foreground/40 bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                inputMode="email"
                autoComplete="email"
                aria-label="Email"
                required
              />
            </div>

            {/* Kalendar (auto 19:00, client-only da izbegne mismatch) */}
            <div className="flex items-start justify-center">
              <div className="w-full max-w-sm rounded-xl border border-foreground/40 p-3">
                {mounted ? (
                  <Calendar
                    mode="single"
                    locale={enUS} // preporuka: stabilno formatiranje i isti SSR/CSR
                    selected={date}
                    onSelect={(d) => {
                      setDate(d ?? undefined);
                      if (d) {
                        const at19 = new Date(d);
                        at19.setHours(19, 0, 0, 0);
                        setSlotISO(at19.toISOString());
                      } else {
                        setSlotISO(null);
                      }
                    }}
                    disabled={(d) => !isAllowedDay(d) || d < todayStart}
                    className="mx-auto"
                  />
                ) : (
                  <div className="h-[316px]" />
                )}
                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="text-xs text-foreground">
                    Izborom datuma termin se automatski postavlja na{" "}
                    <span className="font-medium">19:00</span>.
                  </p>
                </div>
              </div>
            </div>

            {/* Način sastanka */}
            <Tabs
              value={mode}
              onValueChange={(v) => setMode(v as "uzivo" | "online")}
              className="w-full"
            >
              <TabsList className="flex h-12 w-full items-center justify-center border border-foreground/40 bg-background">
                <TabsTrigger
                  value="uzivo"
                  className="gap-2 text-foreground text-sm cursor-pointer data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:data-[state=inactive]:bg-primary"
                >
                  <MapPin className="size-4" /> Uživo
                </TabsTrigger>
                <TabsTrigger
                  value="online"
                  className="gap-2 text-foreground text-sm cursor-pointer data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:data-[state=inactive]:bg-primary"
                >
                  <Video className="size-4" /> Online
                </TabsTrigger>
              </TabsList>

              <TabsContent value="uzivo">
                <div className="rounded-2xl border border-foreground/40 bg-transparent p-4 text-sm text-foreground">
                  <p>
                    Sastanak uživo održava se u restoranu u Novom Sadu. Detalje
                    dogovaramo nakon rezervacije.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="online">
                <div className="rounded-2xl border border-foreground/40 bg-transparent p-4 text-sm text-foreground">
                  <p>
                    Online sastanak je preko Google Meet-a ili Zoom-a. Link
                    stiže nekoliko sati pre termina.
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            {/* CTA */}
            <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
              <div
                className="flex items-center gap-2 text-sm text-foreground"
                aria-live="polite"
              >
                <CalendarClock className="size-5 text-primary" />
                <span>
                  {slotISO
                    ? `Termin je odabran: ${selectedLabel}`
                    : "Potvrda stiže odmah nakon rezervacije"}
                </span>
              </div>

              <Button
                onClick={handleReserve}
                size="lg"
                className="w-full sm:w-auto cursor-pointer font-extrabold text-background"
                disabled={!slotISO || submitting}
                aria-disabled={!slotISO || submitting}
              >
                {submitting ? "Slanje..." : "Rezerviši termin"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Dodatne informacije */}
        <div className="mx-auto mt-10 max-w-3xl text-center text-sm text-foreground">
          Imate posebne zahteve ili želite drugi termin? Javite nam se i rado
          ćemo prilagoditi sastanak vašim potrebama.
        </div>
      </section>
    </div>
  );
}
