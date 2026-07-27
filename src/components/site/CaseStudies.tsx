"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowDownRight, TrendingUp } from "lucide-react";
import YouTubePlayer from "./YouTubePlayer";

const cases = [
  {
    client: "Infinity Laser Studio",
    logo: "/logos/ils-logo.png",
    problem:
      "Uspešan salon u Somboru želeo je da se proširi u Novi Sad. Marketing nije bio u planu. Salon je sve termine zakazivao ručno preko telefona.",
    strategy:
      "Napravili smo websajt sa sistemom za zakazivanje i pokrenuli Meta kampanje sa 20 novih kreativa (Profit za Tebe paket).",
    videoId: "8ZlDwuFZnYQ",
    results: [
      { value: "1.660.000", label: "prihoda za 3 meseca" },
      { value: "~160", label: "online zakazivanja / mesec" },
      { value: "11x", label: "povrat na uloženo u oglase" },
    ],
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      type: "spring" as const,
      stiffness: 140,
      damping: 20,
    },
  }),
};

export default function CaseStudies() {
  return (
    <section id="rezultati-studije" className="relative py-12 md:py-20">
      <div className="container-x">
        {cases.map((c) => (
          <div key={c.client}>
            {/* Header + logo */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              className="mb-8 flex items-center gap-4 sm:mb-10 sm:gap-5"
            >
              <span className="relative inline-flex size-14 shrink-0 items-center justify-center rounded-2xl border border-border card-glass p-2 sm:size-16 md:size-20">
                <Image
                  src={c.logo}
                  alt={`${c.client} logo`}
                  width={80}
                  height={80}
                  sizes="(min-width: 768px) 80px, (min-width: 640px) 64px, 56px"
                  className="size-full object-contain"
                />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-widest text-primary sm:text-sm">
                  Studija slučaja
                </p>
                <h2 className="mt-1 text-balance text-2xl font-extrabold sm:mt-2 sm:text-4xl lg:text-5xl">
                  {c.client}
                </h2>
              </div>
            </motion.div>

            {/* Text left · video right (na većim ekranima) */}
            <div className="grid items-stretch gap-6 lg:grid-cols-2 lg:gap-8">
              <motion.article
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-60px" }}
                className="flex h-full flex-col rounded-3xl card-glass p-6 md:p-8"
              >
                <div className="space-y-4">
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
                    <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-green-500/15">
                      <TrendingUp className="size-3.5 text-green-500" />
                    </span>
                    <p className="text-sm">
                      <span className="font-semibold text-foreground">
                        Rešenje.{" "}
                      </span>
                      <span className="text-muted-foreground">
                        {c.strategy}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-3 border-t border-border pt-5 text-center sm:mt-auto sm:pt-6">
                  {c.results.map((r) => (
                    <div key={r.label}>
                      <div className="font-display text-base font-extrabold text-gradient sm:text-2xl lg:text-3xl">
                        {r.value}
                      </div>
                      <p className="mt-1 text-xs leading-snug text-muted-foreground">
                        {r.label}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.article>

              <div className="lg:flex lg:items-center">
                <YouTubePlayer
                  videoId={c.videoId}
                  title={`Video: ${c.client}`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
