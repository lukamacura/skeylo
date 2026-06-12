"use client";

import { motion } from "framer-motion";
import { Search, PenTool, Rocket } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Analiza i strategija",
    desc: "Radimo detaljno istraživanje tržišta, definišemo kupce i kreiramo funnel.",
  },
  {
    icon: PenTool,
    title: "Kreativa i postavka",
    desc: "Snimamo kreative sa našim modelima. Sve se postavlja da meri svaki uloženi evro.",
  },
  {
    icon: Rocket,
    title: "Skaliranje profita",
    desc: "Optimizujemo iz nedelje u nedelju. Što radi - pojačavamo, što ne - gasimo.",
  },
];

export default function Process() {
  return (
    <section className="relative py-20 md:py-28">
      <div className="container-x">
        <div className="mb-14 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Kako radimo
          </p>
          <h2 className="mt-3 text-balance text-4xl font-extrabold sm:text-5xl">
            Sistem u tri koraka
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
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
              className="relative rounded-2xl card-glass p-7"
            >
              <span className="font-display absolute right-6 top-5 text-6xl font-extrabold text-foreground/[0.06]">
                0{i + 1}
              </span>
              <div className="inline-flex rounded-xl bg-primary/15 p-3">
                <s.icon className="size-6 text-primary" />
              </div>
              <h3 className="mt-5 text-xl font-bold">{s.title}</h3>
              <p className="mt-2 text-muted-foreground">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
