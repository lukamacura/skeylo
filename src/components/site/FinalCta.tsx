"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldCheck, Clock, Users, ArrowRight } from "lucide-react";

const guarantees = [
  { icon: Users, label: "Jedan tim za sve" },
  { icon: Clock, label: "Odgovor za manje od 48h" },
  { icon: ShieldCheck, label: "Jasna cena, jasan rezultat" },
];

export default function FinalCta() {
  return (
    <section className="relative py-16 md:py-20">
      <div className="container-x">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ type: "spring", stiffness: 140, damping: 22 }}
          className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/15 via-card to-card px-6 py-16 text-center md:px-16 md:py-20 grain"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-primary/25 blur-[100px]"
          />
          <h2 className="relative text-balance text-4xl font-extrabold sm:text-5xl md:text-6xl">
            Spreman da tvoj marketing{" "}
            <span className="text-gradient">počne da donosi novac</span>?
          </h2>
          <p className="relative mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
            Izaberi paket koji odgovara fazi tvog biznisa i kreni odmah. Nisi
            siguran koji? Pogledaj sva tri i lako uporedi.
          </p>
          <div className="relative mt-9 flex justify-center">
            <Link
              href="#paketi"
              className="group inline-flex items-center justify-center gap-2 rounded-md bg-primary px-8 py-4 text-base font-extrabold text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              Izaberi svoj paket
              <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Risk reversal */}
          <div className="relative mx-auto mt-8 flex max-w-2xl flex-col items-center justify-center gap-3 sm:flex-row sm:gap-6">
            {guarantees.map((g) => (
              <div
                key={g.label}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <g.icon className="size-4 text-primary" />
                {g.label}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
