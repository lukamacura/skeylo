// app/meet/confirm/page.tsx
"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, CalendarClock, MapPin, Video, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function ConfirmView() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const name = searchParams.get("name") ?? "";
  const email = searchParams.get("email") ?? "";
  const mode = (searchParams.get("mode") as "uzivo" | "online") ?? "online";
  const slotISO = searchParams.get("slotISO") ?? "";
  const slotLocalQP = searchParams.get("slotLocal") ?? "";

  const slotLabel = useMemo(() => {
    if (slotLocalQP) return slotLocalQP;
    if (!slotISO) return "";
    return new Date(slotISO).toLocaleString("sr-RS", {
      timeZone: "Europe/Belgrade",
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [slotISO, slotLocalQP]);

  function downloadICS() {
    if (!slotISO) return;
    const start = new Date(slotISO);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    const fmt = (d: Date) =>
      d
        .toISOString()
        .replace(/[-:]/g, "")
        .replace(/\.\d{3}Z$/, "Z");

    const summary = `Sastanak (${mode === "uzivo" ? "Uživo" : "Online"})`;
    const description = [
      `Ime: ${name}`,
      `Email: ${email}`,
      `Način: ${mode === "uzivo" ? "Uživo" : "Online"}`,
      `Zakazano: ${slotLabel}`,
      "",
      "Hvala na rezervaciji!",
    ].join("\\n");

    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//YourCompany//MeetConfirm//RS",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:${crypto.randomUUID()}@yourdomain.com`,
      `DTSTAMP:${fmt(new Date())}`,
      `DTSTART:${fmt(start)}`,
      `DTEND:${fmt(end)}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reservation.ics";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-[100dvh] bg-background">
      <section className="container mx-auto px-4 py-10 md:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <Badge
            variant="secondary"
            className="mb-3 inline-flex items-center gap-1 px-2.5 py-1 text-sm bg-transparent text-foreground"
          >
            <CheckCircle2 className="size-4" />
            Potvrda rezervacije
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
            Hvala na rezervaciji!
          </h1>
          <p className="mt-3 text-foreground md:text-lg">
            Na vaš email stiže potvrda sa detaljima sastanka.
          </p>
        </div>

        <Card className="mx-auto mt-8 max-w-2xl border border-primary/40 bg-transparent text-foreground">
          <CardContent className="space-y-6 p-4 md:p-6">
            <div className="rounded-2xl border border-primary/40 p-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <CalendarClock className="size-5 text-primary" />
                  <div className="text-sm">
                    <p className="font-medium">Termin</p>
                    <p className="opacity-90">{slotLabel || "—"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {mode === "uzivo" ? (
                    <MapPin className="size-5 text-primary" />
                  ) : (
                    <Video className="size-5 text-primary" />
                  )}
                  <div className="text-sm">
                    <p className="font-medium">Način</p>
                    <p className="opacity-90">
                      {mode === "uzivo" ? "Uživo" : "Online"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="size-5 text-primary" />
                  <div className="text-sm">
                    <p className="font-medium">Kontakt</p>
                    <p className="opacity-90">
                      {name ? `${name} ` : ""}
                      {email ? `(${email})` : ""}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
              <Button
                onClick={downloadICS}
                className="w-full sm:w-auto cursor-pointer font-semibold"
                size="lg"
              >
                Dodaj u kalendar (.ics)
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/meet")}
                className="w-full sm:w-auto cursor-pointer border-primary/40"
                size="lg"
              >
                Novi termin
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mx-auto mt-10 max-w-3xl text-center text-sm text-foreground">
          Ako niste dobili email, proverite spam ili nam se javite direktno.
        </div>
      </section>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={<div className="container mx-auto px-4 py-16">Učitavanje…</div>}
    >
      <ConfirmView />
    </Suspense>
  );
}
