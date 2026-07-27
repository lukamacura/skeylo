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
/* Inline markup u tekstu poglavlja                                           */
/* -------------------------------------------------------------------------- */

/**
 * `**podebljano**` i `==istaknuto==` u people.ts. Namerno minimalan skup —
 * tekst u podacima ostaje čitljiv, bez JSX-a u sadržaju.
 */
const MARKUP = /(\*\*[^*]+\*\*|==[^=]+==)/g;

/**
 * Potez markerom preko reči. Trag stoji ispod teksta bez z-index-a: apsolutni
 * element dolazi prvi u DOM-u, a `relative` na samom tekstu ga slika preko —
 * tako highlight ne zavisi od stacking konteksta sekcije oko njega.
 */
function Highlight({ children }: { children: string }) {
  const reduce = useReducedMotion();

  return (
    <span className="relative inline-block whitespace-nowrap">
      {/* Jedan element nosi oba prelaza markerom — glavni potez i kraći,
          zasićeniji preko donje trećine — kao dva sloja iste pozadine. Dva
          zasebna motion elementa bi značila i dva IntersectionObservera i dva
          kompozitna sloja po istaknutoj reči, za isti izgled.

          Animira se samo scaleX: transform ide na GPU, bez layout-a i bez
          ponovnog crtanja gradijenta. `clip-path` bi lepše čuvao oblik
          krajeva, ali ga framer-motion ovde ne interpolira — potez ostane
          trajno zaklonjen.

          Kačenje za sredinu, ne za dno: visina inline-block-a je ceo line box
          (leading-relaxed ≈ 1.6em), pa bi `bottom-0` potez spustio ispod
          slova, u prazninu između redova. Rotacija i centriranje idu kroz
          motion props jer framer piše ceo `transform`, pa bi Tailwind klase
          tipa `-rotate-*` bile pregažene. */}
      <motion.span
        aria-hidden
        initial={{ scaleX: reduce ? 1 : 0, y: "-50%", rotate: -1.2 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none absolute inset-x-[-0.3em] top-1/2 h-[0.98em] rounded-[0.6em_0.2em_0.5em_0.25em]"
        style={{
          transformOrigin: "0% 50%",
          // Prvi sloj je gornji: kraći prelaz preko dna reči. Drugi je glavni
          // potez — mastilo se sliva ka krajevima, pa gradijent ide ukoso i
          // gasi se u providno tek na samim ivicama.
          backgroundImage:
            "linear-gradient(99deg, transparent 1%, rgba(216,121,40,0.42) 6%, rgba(216,121,40,0.3) 94%, transparent 99%), linear-gradient(101deg, transparent 0.6%, rgba(216,121,40,0.62) 3%, rgba(216,121,40,0.5) 55%, rgba(216,121,40,0.6) 96%, transparent 99.4%)",
          backgroundSize: "94% 38%, 100% 100%",
          backgroundPosition: "3% 86%, 0 0",
          backgroundRepeat: "no-repeat",
        }}
      />
      <span className="relative font-semibold text-foreground">{children}</span>
    </span>
  );
}

function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split(MARKUP).map((part, i) => {
        if (part.startsWith("**")) {
          return (
            <strong key={i} className="font-semibold text-foreground">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("==")) {
          return <Highlight key={i}>{part.slice(2, -2)}</Highlight>;
        }
        return part;
      })}
    </>
  );
}

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

  /** Nacrtano stanje — i polazno kada je animacija isključena. */
  const drawn = { pathLength: 1, opacity: 1 };

  const line = {
    hidden: reduce ? drawn : { pathLength: 0, opacity: 0 },
    show: { ...drawn, transition: { duration: 0.7, ease: "easeInOut" } },
  } as const;

  const head = {
    hidden: reduce ? drawn : { pathLength: 0, opacity: 0 },
    show: { ...drawn, transition: { duration: 0.25, ease: "easeOut" } },
  } as const;

  return (
    <div
      className={`mt-6 flex items-center gap-2 sm:gap-3 lg:mt-8 ${
        flip ? "lg:flex-row-reverse lg:justify-end" : ""
      }`}
    >
      <span className="max-w-[15rem] text-sm font-semibold leading-snug text-foreground/75 sm:max-w-none sm:text-base">
        {label}
      </span>

      {/* Kutija mora da pokrije zarotiranu krivu: 80×32 pod 58° zauzima ~70×85,
          pa manja kutija pušta strelicu da viri u pasus iznad. Od `lg` je
          rotacija 0, pa je dovoljna tačna veličina same krive. */}
      <span
        aria-hidden
        className="relative block h-[5.5rem] w-[4.5rem] shrink-0 lg:h-10 lg:w-28"
      >
        {/* Jedan whileInView na <svg> umesto po jednog na svakoj putanji:
            jedan IntersectionObserver po poglavlju i glava strelice ne može
            da se odvoji od linije. `amount` umesto piksel margine — prag u
            procentima se ponaša isto na niskom telefonu i na desktopu, dok
            je fiksnih -80px na kratkom ekranu često značilo da se crtanje
            odigra pre nego što strelica uđe u vidno polje. */}
        <motion.svg
          viewBox="0 0 120 40"
          fill="none"
          variants={{
            hidden: {},
            show: { transition: { delayChildren: 0.55 } },
          }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.6 }}
          className={`absolute left-1/2 top-1/2 h-8 w-20 -translate-x-1/2 -translate-y-1/2 rotate-[58deg] overflow-visible text-primary lg:h-10 lg:w-28 lg:rotate-0 ${
            flip ? "lg:-scale-x-100" : ""
          }`}
        >
          {/* non-scaling-stroke: viewBox se na telefonu skalira na 80px, pa bi
              potez od 2 jedinice pao na ~1.3px i strelica bi bila vidljivo
              tanja i bleđa nego na desktopu. Ovako je težina svuda ista. */}
          <motion.path
            variants={line}
            d="M2 12C40 4 78 8 108 26"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          <motion.path
            variants={head}
            d="M100 14.5L108 26L94 24.6"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </motion.svg>
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
              <RichText text={p} />
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
