"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Guitar, Sparkles, Swords, Tent, type LucideIcon } from "lucide-react";

import type { Chapter, IconName, Shot } from "@/lib/people";

/** people.ts nosi samo ime ikonice, da bi podatak ostao serijalizovan. */
const ICONS: Record<IconName, LucideIcon> = {
  swords: Swords,
  tent: Tent,
  guitar: Guitar,
  sparkles: Sparkles,
};

/* -------------------------------------------------------------------------- */
/* Strelica od teksta ka fotografiji                                          */
/* -------------------------------------------------------------------------- */

/**
 * Ista kriva se koristi u sva tri smera: na uskim ekranima je zarotirana
 * naniže (slika je ispod teksta), a od `lg` gleda ka koloni sa slikom.
 * Zato stoji u kutiji fiksne veličine — rotacija ne pomera okolni sadržaj.
 */
function Pointer({ label, flip }: { label: string; flip: boolean }) {
  const reduce = useReducedMotion();

  const draw = reduce
    ? {}
    : {
        initial: { pathLength: 0, opacity: 0 },
        whileInView: { pathLength: 1, opacity: 1 },
        viewport: { once: true, margin: "-80px" },
      };

  return (
    <div
      className={`mt-6 flex items-center gap-2 sm:gap-3 lg:mt-8 ${
        flip ? "lg:flex-row-reverse lg:justify-end" : ""
      }`}
    >
      <span className="max-w-[15rem] text-sm font-semibold leading-snug text-foreground/75 sm:max-w-none sm:text-base">
        {label}
      </span>

      <span
        aria-hidden
        className="relative block h-12 w-12 shrink-0 lg:h-10 lg:w-28"
      >
        <svg
          viewBox="0 0 120 40"
          fill="none"
          className={`absolute left-1/2 top-1/2 h-8 w-20 -translate-x-1/2 -translate-y-1/2 rotate-[58deg] text-primary lg:h-10 lg:w-28 lg:rotate-0 ${
            flip ? "lg:-scale-x-100" : ""
          }`}
        >
          <motion.path
            {...draw}
            transition={{ duration: 0.7, ease: "easeInOut" }}
            d="M2 12C40 4 78 8 108 26"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
          />
          <motion.path
            {...draw}
            transition={{ duration: 0.25, ease: "easeOut", delay: 0.6 }}
            d="M100 14.5L108 26L94 24.6"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Mediji                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Fotografije su različitih formata (telefon uspravno, 3:2, screenshot), pa
 * okvir uzima prirodni odnos stranica slike. `max-h` seče samo one koje bi
 * inače bile predugačke — tada `position` bira koji deo kadra ostaje.
 */
function Figure({
  shot,
  sizes,
  maxH,
}: {
  shot: Shot;
  sizes: string;
  maxH: string;
}) {
  return (
    <figure className="group">
      <div
        className={`relative overflow-hidden rounded-2xl border border-border bg-card ${maxH}`}
        style={{ aspectRatio: `${shot.w} / ${shot.h}` }}
      >
        <Image
          src={shot.src}
          alt={shot.alt}
          fill
          sizes={sizes}
          className={`object-cover ${shot.position ?? "object-center"} transition-transform duration-700 ease-out will-change-transform group-hover:scale-[1.04] motion-reduce:transform-none`}
        />
        {/* Hairline iznutra — drži ivicu oštrom preko svetlih fotografija */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-foreground/10"
        />
      </div>

      {shot.caption && (
        <figcaption className="mt-2.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
          {shot.caption}
        </figcaption>
      )}
    </figure>
  );
}

function Media({ chapter }: { chapter: Chapter }) {
  const shots = chapter.shots ?? [];

  if (shots.length > 1) {
    return (
      <div className="grid grid-cols-2 items-start gap-3 sm:gap-4">
        {shots.map((s) => (
          <Figure
            key={s.src}
            shot={s}
            maxH="max-h-[22rem] sm:max-h-[26rem]"
            sizes="(max-width: 1023px) 46vw, 22vw"
          />
        ))}
      </div>
    );
  }

  if (shots.length === 1) {
    return (
      <Figure
        shot={shots[0]}
        maxH="max-h-[26rem] sm:max-h-[32rem]"
        sizes="(max-width: 1023px) 92vw, 44vw"
      />
    );
  }

  if (chapter.quote) {
    const Icon = chapter.icon ? ICONS[chapter.icon] : null;
    return (
      <div className="relative grid aspect-[5/4] place-items-center overflow-hidden rounded-2xl card-glass px-7 text-center sm:aspect-[4/3] sm:px-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 grid-lines opacity-30 [mask-image:radial-gradient(70%_70%_at_50%_40%,black,transparent)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-16 left-1/2 h-48 w-64 -translate-x-1/2 rounded-full opacity-60 blur-[70px]"
          style={{
            background:
              "radial-gradient(circle, rgba(216,121,40,0.4), transparent 70%)",
          }}
        />
        <blockquote className="relative">
          <span
            aria-hidden
            className="block font-display text-6xl leading-none text-primary/40 sm:text-7xl"
          >
            &ldquo;
          </span>
          <p className="mt-2 text-balance text-2xl font-bold leading-snug sm:text-3xl">
            {chapter.quote}
          </p>
          {Icon && (
            <Icon
              aria-hidden
              className="mx-auto mt-5 size-7 text-primary/60 sm:size-8"
            />
          )}
        </blockquote>
      </div>
    );
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/* Poglavlje                                                                  */
/* -------------------------------------------------------------------------- */

export default function StoryChapter({
  chapter,
  index,
}: {
  chapter: Chapter;
  index: number;
}) {
  const reduce = useReducedMotion();
  /** Parna poglavlja: tekst levo. Neparna: tekst desno — samo od `lg`. */
  const flip = index % 2 === 1;
  const Icon = chapter.icon ? ICONS[chapter.icon] : null;
  const media = <Media chapter={chapter} />;
  const hasMedia = Boolean(chapter.shots?.length || chapter.quote);

  /** Samo po Y — bočni pomak bi na uskim ekranima virio izvan container-a. */
  const enter = (delay: number) =>
    ({
      initial: { opacity: 0, y: reduce ? 0 : 24 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true, margin: "-90px" },
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 22,
        delay: reduce ? 0 : delay,
      },
    }) as const;

  return (
    <article
      className={`grid items-center gap-7 sm:gap-9 lg:gap-14 ${
        hasMedia ? "lg:grid-cols-2" : ""
      }`}
    >
      {/* Tekst */}
      <motion.div
        {...enter(0)}
        className={`${hasMedia ? "" : "max-w-2xl"} ${flip ? "lg:order-2" : ""}`}
      >
        <div className="flex items-center gap-3">
          {Icon ? (
            <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="size-4.5" aria-hidden />
            </span>
          ) : (
            <span
              aria-hidden
              className="size-2 shrink-0 rounded-full bg-primary ring-4 ring-primary/15"
            />
          )}

          {chapter.year && (
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-primary sm:text-sm">
              {chapter.year}
            </span>
          )}

          <span
            aria-hidden
            className="h-px flex-1 bg-gradient-to-r from-primary/35 to-transparent"
          />
        </div>

        <h3 className="mt-4 text-balance text-2xl font-extrabold leading-tight sm:text-3xl">
          {chapter.title}
        </h3>

        <div className="mt-4 space-y-4">
          {chapter.text.map((p) => (
            <p
              key={p}
              className="text-base leading-relaxed text-muted-foreground sm:text-lg"
            >
              {p}
            </p>
          ))}
        </div>

        {chapter.point && <Pointer label={chapter.point} flip={flip} />}
      </motion.div>

      {/* Fotografije / citat */}
      {hasMedia && (
        <motion.div {...enter(0.08)} className={flip ? "lg:order-1" : ""}>
          {media}
        </motion.div>
      )}
    </article>
  );
}
