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
  },
  {
    icon: Megaphone,
    title: "Meta oglašavanje",
  },
  {
    icon: Globe,
    title: "Web development",
  },
  {
    icon: LineChart,
    title: "Analiza i strategija",
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
    <section id="usluge" className="relative py-12 md:py-20">
      <div className="container-x">
        <div className="mb-8 max-w-2xl sm:mb-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Usluge
          </p>
          <h2 className="mt-3 text-balance text-3xl font-extrabold sm:text-5xl">
            Sve što tvom biznisu treba da raste - na jednom mestu
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
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
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
