"use client";

import { motion } from "framer-motion";
import {
  Palette,
  Megaphone,
  Globe,
  LineChart,
  ShieldCheck,
  Users,
  Gauge,
} from "lucide-react";

const services = [
  {
    icon: Palette,
    title: "Kreativa i dizajn",
    desc: "Reels i statične kreative prilagođene tvom brendu - dizajnirane da prodaju, ne samo da izgledaju lepo.",
  },
  {
    icon: Megaphone,
    title: "Meta oglašavanje",
    desc: "Vođenje, optimizacija i praćenje Facebook i Instagram kampanja sa fokusom na povrat investicije.",
  },
  {
    icon: Globe,
    title: "Web development",
    desc: "Moderni i brzi sajtovi: webshop, sistem za zakazivanje i finansijski admin panel - ključ u ruke.",
  },
  {
    icon: LineChart,
    title: "Analiza i strategija",
    desc: "Detaljan pregled tvog marketinga i sajta uz konkretne predloge koji podižu konverzije.",
  },
];

const why = [
  {
    icon: Users,
    title: "Jedan tim za sve",
  },
  {
    icon: Gauge,
    title: "Fokus na profit",
  },
  {
    icon: ShieldCheck,
    title: "Sistem, ne kampanja",
  },
];

export default function Services() {
  return (
    <section id="usluge" className="relative py-16 md:py-20">
      <div className="container-x">
        <div className="mb-10 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Usluge
          </p>
          <h2 className="mt-3 text-balance text-4xl font-extrabold sm:text-5xl">
            Sve što tvom biznisu treba da raste - na jednom mestu
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                delay: i * 0.08,
                type: "spring",
                stiffness: 140,
                damping: 20,
              }}
              className="group rounded-2xl card-glass p-6 transition-colors hover:border-primary/40"
            >
              <div className="inline-flex rounded-xl bg-primary/15 p-3 transition-transform group-hover:-translate-y-0.5">
                <s.icon className="size-6 text-primary" />
              </div>
              <h3 className="mt-5 text-lg font-bold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Why us */}
        <div className="mt-12 rounded-3xl border border-border bg-card/40 p-8 md:p-12">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">
                Zašto Skeylo
              </p>
              <h3 className="mt-3 text-balance text-3xl font-extrabold sm:text-4xl">
                Full-stack tim koji razmišlja kao tvoj prijatelj, ne kao
                agencija
              </h3>
              <p className="mt-4 text-muted-foreground">
                Većina agencija prodaje jednu uslugu i izveštaje koje ne
                razumeš. Mi pokrivamo ceo lanac - od kreative do sajta - i
                vodimo ga ka jednom cilju: više prodaja.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {why.map((w) => (
                <div
                  key={w.title}
                  className="rounded-2xl border border-border bg-background/40 p-5"
                >
                  <w.icon className="size-6 text-accent" />
                  <h4 className="mt-3 text-sm font-bold">{w.title}</h4>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
