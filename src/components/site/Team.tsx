"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import YouTubePlayer from "./YouTubePlayer";
import { PEOPLE, type Person } from "@/lib/people";

const CARD =
  "group relative flex h-full flex-col overflow-hidden rounded-2xl card-glass p-6 transition-colors sm:p-7";

/** Članovi sa biografskom stranicom dobijaju klikabilnu karticu. */
function CardShell({
  person,
  children,
}: {
  person: Person;
  children: React.ReactNode;
}) {
  if (!person.slug) return <div className={CARD}>{children}</div>;

  return (
    <Link
      href={`/${person.slug}`}
      aria-label={`Saznaj više o: ${person.name}`}
      className={`${CARD} hover:border-primary/40`}
    >
      {children}
      <ArrowUpRight
        aria-hidden
        className="absolute right-4 top-4 size-4 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
      />
    </Link>
  );
}

export default function Team() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollByCard = (dir: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.children[0] as HTMLElement | undefined;
    const amount = card ? card.offsetWidth + 16 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  return (
    <section id="tim" className="relative scroll-mt-24 py-12 md:py-20">
      <div className="container-x">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 sm:mb-10">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              Ko stoji iza rezultata
            </p>
            <h2 className="mt-3 text-balance text-3xl font-extrabold sm:text-5xl">
              Upoznaj Tim
            </h2>
          </div>

          <div className="hidden gap-2 sm:flex">
            <button
              type="button"
              aria-label="Prethodni članovi tima"
              onClick={() => scrollByCard(-1)}
              className="flex size-10 items-center justify-center rounded-full card-glass text-foreground/70 transition hover:text-primary"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              aria-label="Sledeći članovi tima"
              onClick={() => scrollByCard(1)}
              className="flex size-10 items-center justify-center rounded-full card-glass text-foreground/70 transition hover:text-primary"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>

        <div className="mb-8 sm:mb-10">
          <YouTubePlayer
            videoId="yYFNyOaZ-Pw"
            title="Upoznaj Skeylo tim"
            caption="Upoznaj tim koji stoji iza rezultata"
          />
        </div>

        <div className="relative -mx-4 px-4 sm:mx-0 sm:px-0">
          <div
            ref={scrollRef}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-6 [&::-webkit-scrollbar]:hidden"
          >
            {PEOPLE.map((m, i) => (
              <motion.div
                key={m.key}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  delay: (i % 3) * 0.12,
                  type: "spring",
                  stiffness: 140,
                  damping: 20,
                }}
                className="w-[68%] shrink-0 snap-center sm:w-[45%] md:w-[31%] lg:w-[23%]"
              >
                <CardShell person={m}>
                  <div className="relative mx-auto size-24 overflow-hidden rounded-full ring-2 ring-primary/30 sm:size-32">
                    <Image
                      src={m.img}
                      alt={m.name}
                      fill
                      sizes="(min-width: 640px) 128px, 96px"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06] motion-reduce:transform-none"
                    />
                  </div>
                  <h3 className="mt-5 text-center text-lg font-bold sm:mt-6 sm:text-xl">
                    {m.name}
                  </h3>
                  <p className="mt-1 text-center text-sm text-muted-foreground sm:text-base">
                    {m.role}
                  </p>
                </CardShell>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
