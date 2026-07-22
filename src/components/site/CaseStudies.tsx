"use client";

import { motion } from "framer-motion";
import { ArrowDownRight, TrendingUp } from "lucide-react";

const cases = [
  {
    client: "Infinity Laser Studio",
    tag: "Sistem zakazivanja + Meta",
    problem:
      "Uspešan salon u Somboru želeo je da se proširi u Novi Sad. Marketing nije bio u planu. Salon je sve termine zakazivao ručno preko telefona.",
    strategy:
      "Napravili smo websajt sa sistemom za zakazivanje i pokrenuli Meta kampanje sa 20 novih kreativa.",
    results: [
      { value: "1.245.000", label: "prihoda za 3 meseca" },
      { value: "~100", label: "online zakazivanja / mesec" },
      { value: "4.14x", label: "povrat na uloženo u oglase" },
    ],
  },
];

export default function CaseStudies() {
  return (
    <section id="rezultati-studije" className="relative py-12 md:py-20">
      <div className="container-x">
        <div className="mb-8 max-w-2xl sm:mb-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Studije slučaja
          </p>
          <h2 className="mt-3 text-balance text-3xl font-extrabold sm:text-5xl">
            Brojke, ne obećanja
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Evo šta se desi kada problem, strategija i sistem rade zajedno.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {cases.map((c, i) => (
            <motion.article
              key={c.client}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                delay: i * 0.12,
                type: "spring",
                stiffness: 140,
                damping: 20,
              }}
              className="flex flex-col rounded-3xl card-glass p-6 md:p-8"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-display text-xl font-bold">{c.client}</h3>
                <span className="rounded-full bg-foreground/[0.06] px-3 py-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  {c.tag}
                </span>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex gap-3">
                  <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-red-500/10">
                    <ArrowDownRight className="size-3.5 text-red-400" />
                  </span>
                  <p className="text-sm">
                    <span className="font-semibold text-foreground">
                      Problem.{" "}
                    </span>
                    <span className="text-muted-foreground">{c.problem}</span>
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15">
                    <TrendingUp className="size-3.5 text-primary" />
                  </span>
                  <p className="text-sm">
                    <span className="font-semibold text-foreground">
                      Strategija.{" "}
                    </span>
                    <span className="text-muted-foreground">{c.strategy}</span>
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3 border-t border-border pt-5 sm:mt-7 sm:pt-6">
                {c.results.map((r) => (
                  <div key={r.label}>
                    <div className="font-display text-lg font-extrabold text-gradient sm:text-3xl">
                      {r.value}
                    </div>
                    <p className="mt-1 text-xs leading-snug text-muted-foreground">
                      {r.label}
                    </p>
                  </div>
                ))}
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
