"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const logos = [
  { name: "Kinged" },
  { name: "Infinity Laser Studio", img: "/logos/ils-logo.png" },
  { name: "Ego tike", img: "/logos/egotike.webp" },
  { name: "Novak Invest", img: "/logos/novak.webp" },
  { name: "Bulevar company", img: "/logos/bulevar.webp" },
  { name: "RS barbershop", img: "/logos/rsbarbershop.webp" },
  { name: "Powerade", img: "/logos/powerade.webp" },
  { name: "Nowa", img: "/logos/nowa.webp" },
  { name: "RealReselling", img: "/logos/rr.webp" },
];

type Testimonial = {
  quote: string;
  name: string;
  role: string;
  result: string;
  initials: string;
  img?: string;
  /** Fokus kropa u krugu — podrazumevano centar. */
  imgPosition?: string;
};

const testimonials: Testimonial[] = [
  {
    quote:
      "Momci su veoma profesionalni, kulturni, u toku sa dešavanjima, imaju veoma individualan i inovativan pristup. Njihov marketing je pokrenuo naš posao napred u najkraćem mogućem roku kada je bilo najpotrebnije. Rezultati su neverovatni, sarađujemo već neko vreme i planiramo da nastavimo! Iskrene preporuke, vredi uložiti u njihove ideje.",
    name: "Ana Kasap",
    role: "Vlasnik, Infinity Laser Studio",
    result: "1.600.000RSD u mesecu",
    initials: "AK",
    img: "/ana.webp",
    imgPosition: "object-top",
  },
  {
    quote:
      "Svaka preporuka za momke, profesionalci u svim poljima. Svaka saradnja sa njima je bila po dogovoru u najboljem mogucem kvalitetu. Ubedljivo No.1 u svom poslu 👌🏻👏🏻",
    name: "David Markov",
    role: "Vlasnik, RealReselling",
    result: "+200% prodaje",
    initials: "DM",
    img: "/rr.webp",
  },
];

export default function SocialProof() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const isUserScrolling = useRef(false);
  const userScrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      if (isUserScrolling.current) return;
      setIndex((prev) => (prev + 1) % testimonials.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isUserScrolling.current) return;
    const el = scrollRef.current;
    const child = el?.children[index] as HTMLElement | undefined;
    if (el && child) {
      el.scrollTo({ left: child.offsetLeft, behavior: "smooth" });
    }
  }, [index]);

  const handleScroll = () => {
    isUserScrolling.current = true;

    const el = scrollRef.current;
    if (el) {
      const nearest = Math.round(el.scrollLeft / el.clientWidth);
      setIndex(Math.min(Math.max(nearest, 0), testimonials.length - 1));
    }

    if (userScrollTimeout.current) clearTimeout(userScrollTimeout.current);
    userScrollTimeout.current = setTimeout(() => {
      isUserScrolling.current = false;
    }, 1500);
  };

  // Samo donja linija: gornja bi presekla radijalni sjaj iz heroja.
  return (
    <section className="relative border-b border-border py-12 md:py-20">
      <div className="container-x">
        <p className="text-center text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Brendovi koji nam veruju
        </p>

        {/* Logo strip */}
        <div className="relative mt-6 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] sm:mt-8">
          <div className="flex animate-[marquee_14s_linear_infinite] items-center gap-6 whitespace-nowrap pr-6 sm:gap-12 sm:pr-12">
            {[...logos, ...logos].map((l, i) =>
              l.img ? (
                <span
                  key={`${l.name}-${i}`}
                  className="relative h-6 w-24 shrink-0 opacity-70 sm:h-8 sm:w-32"
                >
                  <Image
                    src={l.img}
                    alt={l.name}
                    fill
                    sizes="128px"
                    className="object-contain"
                  />
                </span>
              ) : (
                <span
                  key={`${l.name}-${i}`}
                  className="font-display text-lg font-bold tracking-tight text-foreground/35 sm:text-2xl"
                >
                  {l.name}
                </span>
              ),
            )}
          </div>
        </div>

        {/* Testimonials */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="mt-8 flex snap-x snap-mandatory overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] sm:mt-10 [&::-webkit-scrollbar]:hidden"
        >
          {testimonials.map((t, i) => (
            <div key={t.name} className="w-full shrink-0 snap-center px-1">
              <motion.figure
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  delay: i * 0.1,
                  type: "spring",
                  stiffness: 140,
                  damping: 20,
                }}
                className="relative flex h-full flex-col rounded-2xl card-glass p-5 sm:p-6"
              >
                <Quote className="size-6 text-primary/40 sm:size-7" />
                <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-foreground/90 sm:mt-4 sm:text-[15px]">
                  „{t.quote}”
                </blockquote>
                <div className="mt-4 flex items-center gap-1 sm:mt-5">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star
                      key={s}
                      className="size-3.5 fill-primary text-primary sm:size-4"
                    />
                  ))}
                </div>
                <figcaption className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-3 border-t border-border pt-4">
                  {t.img ? (
                    <span className="relative size-9 shrink-0 overflow-hidden rounded-full bg-primary/15 sm:size-10">
                      <Image
                        src={t.img}
                        alt={t.name}
                        fill
                        sizes="40px"
                        className={`object-cover ${t.imgPosition ?? "object-center"}`}
                      />
                    </span>
                  ) : (
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/15 font-display text-sm font-bold text-primary sm:size-10">
                      {t.initials}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">
                      {t.name}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {t.role}
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                    {t.result}
                  </span>
                </figcaption>
              </motion.figure>
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-center gap-2">
          {testimonials.map((t, i) => (
            <button
              key={t.name}
              type="button"
              aria-label={`Prikaži preporuku ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-6 bg-primary" : "w-1.5 bg-primary/25"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
