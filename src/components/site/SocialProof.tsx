"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const logos = [
  "Kinged",
  "Infinity Laser Studio",
  "Ego tike",
  "Novak Invest",
  "Bulevar company",
  "RS barbershop",
  "Powerade",
  "Nowa",
  "RealReselling",
];

const testimonials = [
  {
    quote:
      "Momci su veoma profesionalni, kulturni, u toku sa dešavanjima, imaju veoma individualan i inovativan pristup. Njihov marketing je pokrenuo naš posao napred u najkraćem mogućem roku kada je bilo najpotrebnije. Rezultati su neverovatni, sarađujemo već neko vreme i planiramo da nastavimo! Iskrene preporuke, vredi uložiti u njihove ideje.",
    name: "Ana Kasap",
    role: "Vlasnik, Infinity Laser Studio",
    result: "1.600.000RSD u mesecu",
    initials: "AK",
  },
  {
    quote:
      "Svaka preporuka za momke, profesionalci u svim poljima. Svaka saradnja sa njima je bila po dogovoru u najboljem mogucem kvalitetu. Ubedljivo No.1 u svom poslu 👌🏻👏🏻",
    name: "David Markov",
    role: "Vlasnik, RealReselling",
    result: "+200% prodaje",
    initials: "DM",
  },
];

export default function SocialProof() {
  return (
    <section className="relative border-y border-border py-12 md:py-20">
      <div className="container-x">
        <p className="text-center text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Brendovi koji nam veruju
        </p>

        {/* Logo strip */}
        <div className="relative mt-8 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
          <div className="flex animate-[marquee_28s_linear_infinite] gap-8 whitespace-nowrap pr-8 sm:gap-12 sm:pr-12">
            {[...logos, ...logos].map((l, i) => (
              <span
                key={`${l}-${i}`}
                className="font-display text-xl font-bold tracking-tight text-foreground/35 sm:text-2xl"
              >
                {l}
              </span>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mt-10 grid gap-5 sm:gap-6 md:grid-cols-2">
          {testimonials.map((t, i) => (
            <motion.figure
              key={t.name}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                delay: i * 0.1,
                type: "spring",
                stiffness: 140,
                damping: 20,
              }}
              className="relative flex flex-col rounded-2xl card-glass p-6"
            >
              <Quote className="size-7 text-primary/40" />
              <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-foreground/90">
                „{t.quote}”
              </blockquote>
              <div className="mt-5 flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} className="size-4 fill-primary text-primary" />
                ))}
              </div>
              <figcaption className="mt-4 flex items-center gap-3 border-t border-border pt-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15 font-display text-sm font-bold text-primary">
                  {t.initials}
                </span>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{t.name}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {t.role}
                  </div>
                </div>
                <span className="ml-auto shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                  {t.result}
                </span>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
