"use client";

import { motion } from "framer-motion";
import { Search, PenTool, Rocket } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Temelj",
    desc: "Detaljno istražujemo tržište, definišemo ciljnu publiku i osmišljamo prodajni levak.",
  },
  {
    icon: PenTool,
    title: "Izrada",
    desc: "Izlazimo na teren i snimamo kreative, u pozadini se izrađuje sajt i kreira kampanja.",
  },
  {
    icon: Rocket,
    title: "Skaliranje",
    desc: "Kampanja je dokazala da radi. Vreme je da se poveća budžet i ostvari maksimalan profit.",
  },
];

export default function Process() {
  return (
    <section className="relative py-12 md:py-20">
      <div className="container-x">
        <div className="mb-8 max-w-2xl sm:mb-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Kako radimo
          </p>
          <h2 className="mt-3 text-balance text-3xl font-extrabold sm:text-5xl">
            Sistem u tri koraka
          </h2>
        </div>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                delay: i * 0.12,
                type: "spring",
                stiffness: 140,
                damping: 20,
              }}
              className="relative rounded-2xl card-glass p-6 sm:p-7"
            >
              <span className="font-display absolute right-6 top-5 text-5xl font-extrabold text-foreground/[0.06] sm:text-6xl">
                0{i + 1}
              </span>
              <div className="inline-flex rounded-xl bg-primary/15 p-3">
                <s.icon className="size-6 text-primary" />
              </div>
              <h3 className="mt-5 text-lg font-bold sm:text-xl">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                {s.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
