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
      "Za 30 dana smo udvostručili broj upita preko Instagrama. Prvi put da nam marketing zaista donosi kupce, a ne samo lajkove.",
    name: "Marko Jovanović",
    role: "Vlasnik, MaxFit studio",
    result: "2x više upita",
    initials: "MJ",
  },
  {
    quote:
      "Webshop i zakazivanje su nam promenili poslovanje iz korena. Termini se popunjavaju sami, a ja konačno vidim sve finansije na jednom mestu.",
    name: "Ana Petrović",
    role: "Osnivačica, Aurora beauty",
    result: "+40% prodaje",
    initials: "AP",
  },
  {
    quote:
      "Kreative su odmah podigle nivo brenda. Ljudi su počeli da nas shvataju ozbiljno čim su videli novi vizuelni identitet.",
    name: "Nikola Ilić",
    role: "Direktor, Vinea",
    result: "3x engagement",
    initials: "NI",
  },
];

export default function SocialProof() {
  return (
    <section className="relative border-y border-border py-16 md:py-20">
      <div className="container-x">
        <p className="text-center text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Brendovi koji nam veruju
        </p>

        {/* Logo strip */}
        <div className="relative mt-8 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
          <div className="flex animate-[marquee_28s_linear_infinite] gap-12 whitespace-nowrap pr-12">
            {[...logos, ...logos].map((l, i) => (
              <span
                key={`${l}-${i}`}
                className="font-display text-2xl font-bold tracking-tight text-foreground/35"
              >
                {l}
              </span>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mt-14 grid gap-6 md:grid-cols-3">
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
