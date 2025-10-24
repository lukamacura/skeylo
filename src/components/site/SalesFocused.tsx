"use client";
import React from "react";
import { Target, AlarmClock, Wand2, Code2, Palette } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Modern, elegant and simple section that presents the copy from the image.
 * - Uses lucide-react icons
 * - Clean, readable layout (UX/UI friendly)
 * - Tailwind + shadcn/ui components
 */
export default function SalesFocused() {
  return (
    <section className="w-full bg-gbackground">
      <div className="mx-auto max-w-screen px-4 py-14 sm:py-20">
        {/* Intro */}
        <div className="mb-10 text-center gap-4">
          <div className="">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Zašto biste sarađivali sa nama?
            </h2>
            <p className="mt-2  text-foreground/70">
              Ne prodajemo vam generičke online usluge poput video editinga,
              dizajna ili razvoja. Imamo samo jedan cilj:{" "}
              <b className="text-primary/60 font-extrabold uppercase">
                PRODAJA & dovođenje novih klijenata
              </b>
            </p>
          </div>
        </div>

        {/* Content cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Card 1: Tools are the means */}
          <Card className="border-none bg-transparent text-foreground shadow-lg shadow-primary/60 backdrop-blur">
            <CardContent className="p-6">
              <h3 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
                <Target className="h-8 w-8 text-primary/60" />
                Cilj je profit
              </h3>
              <p className="mt-2 text-foreground/70">
                Video editing, web development, AI automatizacije i ostale
                tehničke veštine su sredstvo kojim dolazimo do{" "}
                <b className="text-foreground/70">rezultata</b>.
              </p>

              <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <li className="flex items-center gap-3 rounded-xl border border-foreground/30 bg-transparent p-3">
                  <Wand2 className="h-5 w-5 text-primary/60" />
                  <span className="text-xs text-foreground">
                    AI automatizacije
                  </span>
                </li>
                <li className="flex items-center gap-3 rounded-xl border border-foreground/30 bg-transparent p-3">
                  <Code2 className="h-5 w-5 text-primary/60" />
                  <span className="text-xs text-foreground">
                    Web development
                  </span>
                </li>
                <li className="flex items-center gap-3 rounded-xl border border-foreground/30 bg-transparent p-3">
                  <Palette className="h-5 w-5 text-primary/60" />
                  <span className="text-xs text-foreground">
                    Dizajn i produkcija
                  </span>
                </li>
                <li className="flex items-center gap-3 rounded-xl border border-foreground/30 bg-transparent p-3">
                  <Target className="h-5 w-5 text-primary/60" />
                  <span className="text-xs text-foreground">
                    Fokus na ishod: prodaja
                  </span>
                </li>
              </ul>

              <p className="mt-5  text-foreground/70">
                Kada se napravi dobar plan i pravilno iskoristi svaki
                marketinški alat,{" "}
                <b className="text-foreground/70">rezultat je profit</b>.
              </p>
            </CardContent>
          </Card>

          {/* Card 2: Time is money */}
          <Card className="border-none bg-transparent shadow-lg shadow-primary/60 backdrop-blur">
            <CardContent className="p-6">
              <div className="mb-3 flex items-center gap-2">
                <AlarmClock className="h-8 w-8 text-primary/60" />
                <h3 className="text-lg text-foreground font-semibold tracking-tight">
                  Vreme je novac
                </h3>
              </div>
              <p className="text-foreground/70">
                Vi treba da se posvetite <b>svom biznisu i klijentima.</b>{" "}
                Upravo zato ne morate godinama da učite veštine i stičete
                iskustvo koje smo mi već prošli.
              </p>

              <div className="mt-6 rounded-2xl border border-foreground/70 bg-primary/60/60 p-5">
                <p className="text-2xl text-foreground font-bold">
                  Mi donosimo plan i operativu za rezultat, kako biste vi
                  zadržali fokus na onome što najbolje znate da radite.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
