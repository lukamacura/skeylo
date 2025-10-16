"use client";

import {
  FileText,
  Bug,
  Map,
  Sparkles,
  Wrench,
  CalendarCheck,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const items = [
  {
    icon: FileText,
    title: "Izveštaj",
    copy: "Kratak izveštaj sa nalazima i jasnim prioritetima.",
  },
  {
    icon: Bug,
    title: "Tracking & podaci",
    copy: "Lista konkretnih grešaka + tačni koraci za ispravku (GA4/Pixel/Events).",
  },
  {
    icon: Map,
    title: "Funnel mapa",
    copy: "Jednostavna mapa toka korisnika sa označenim tačkama curenja.",
  },
  {
    icon: Sparkles,
    title: "Kreativa & poruke",
    copy: "3–5 predloga hookova/visuala spremnih za sledeće testove.",
  },
  {
    icon: Wrench,
    title: "SEO/tehnički snapshot",
    copy: "5 ključnih tehničkih ispravki (CWV, indeksiranje, on-page).",
  },
  {
    icon: CalendarCheck,
    title: "30-60-90 plan",
    copy: "Plan po mesecima sa zadacima, odgovornima i očekivanim rezultatima.",
  },
];

export default function Services() {
  const reduce = useReducedMotion();
  const easeOut: [number, number, number, number] = [0.22, 1, 0.36, 1]; // ✔ type-safe easing

  return (
    <section className="py-16" id="services">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: reduce ? 0 : 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.5, ease: easeOut }}
          className="text-3xl font-semibold"
        >
          Šta dobijaš besplatnom analizom
        </motion.h2>

        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(({ icon: Icon, title, copy }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: reduce ? 0 : 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.45, ease: easeOut, delay: i * 0.08 }}
              whileHover={{
                y: reduce ? 0 : -4,
                boxShadow: reduce ? "none" : "0 6px 24px rgba(0,0,0,0.08)",
              }}
              className="group rounded-2xl border border-foreground/20 p-6 backdrop-blur-sm relative overflow-hidden"
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background:
                    "radial-gradient(600px 150px at 10% -10%, hsl(var(--primary)/0.08), transparent)",
                }}
              />
              <motion.div
                whileHover={{
                  scale: reduce ? 1 : 1.05,
                  rotate: reduce ? 0 : 1,
                }}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-foreground/20"
              >
                <Icon className="size-5" />
              </motion.div>
              <h3 className="mt-3 font-medium">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{copy}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
