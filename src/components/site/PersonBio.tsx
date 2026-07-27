"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Mail, MapPin } from "lucide-react";

import type { Person } from "@/lib/people";
import EuropeMap from "./EuropeMap";
import StoryChapter from "./StoryChapter";

/** Brend znak - lucide nema WhatsApp, pa ide inline putanja. */
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.83 9.83 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.8 11.8 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.9 11.9 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.82 11.82 0 0 0 20.465 3.49" />
    </svg>
  );
}

/** Zaglavlje sekcije - isti obrazac kao Process.tsx / Team.tsx */
function SectionHead({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="mb-8 max-w-2xl sm:mb-10">
      <p className="text-sm font-semibold uppercase tracking-widest text-primary">
        {kicker}
      </p>
      <h2 className="mt-3 text-balance text-3xl font-extrabold sm:text-5xl">
        {title}
      </h2>
    </div>
  );
}

export default function PersonBio({ person }: { person: Person }) {
  const reduce = useReducedMotion();

  const waHref = person.whatsapp
    ? `https://wa.me/${person.whatsapp}?text=${encodeURIComponent(
        `Zdravo ${person.name.split(" ")[0]}, video sam tvoju stranicu na Skeylo sajtu.`,
      )}`
    : null;

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  } as const;

  const up = {
    hidden: { y: reduce ? 0 : 18, opacity: 0 },
    show: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 180, damping: 24 },
    },
  } as const;

  const reveal = {
    initial: { opacity: 0, y: reduce ? 0 : 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-60px" },
  } as const;

  return (
    <>
      {/* ---------------------------------------------------------------- */}
      {/* HERO - portret izranja iz dna sekcije                             */}
      {/* ---------------------------------------------------------------- */}
      {/* Bez `grain` klase: zrno preko soft-light-a podiže crnu u sivu, pa bi
          se tamna pozadina fotografije videla kao pravougaonik. Ovde pozadina
          mora da ostane čisto #070707 da bi portret mogao da se stopi s njom. */}
      <section className="relative isolate overflow-hidden pt-24 md:pt-36">
        {/* Atmosfera */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 right-[-10%] h-[42rem] w-[42rem] rounded-full opacity-50 blur-[120px]"
          style={{
            background:
              "radial-gradient(circle, rgba(216,121,40,0.4), transparent 60%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 grid-lines opacity-[0.4] [mask-image:radial-gradient(80%_60%_at_50%_0%,black,transparent)]"
        />

        <motion.div
          className="container-x relative flex flex-col items-center"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {/* Portret */}
          {/* `isolate` drži -z-10 mrlje unutar ovog konteksta - bez toga
              propadnu iza pozadine sekcije i uopšte se ne vide. */}
          <motion.div
            variants={up}
            className="relative isolate w-full max-w-[17rem] sm:max-w-sm lg:max-w-md"
          >
            {/* Nepravilna pozadina iza portreta */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-[-12%] bottom-0 top-[8%] -z-10 opacity-70 blur-[90px] [border-radius:52%_48%_44%_56%/58%_42%_56%_44%]"
              style={{
                background:
                  "radial-gradient(circle at 50% 60%, rgba(216,121,40,0.45), transparent 65%)",
              }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-[6%] bottom-[-6%] top-[24%] -z-10 opacity-60 blur-[70px] [border-radius:38%_62%_57%_43%/45%_38%_62%_55%]"
              style={{
                background:
                  "radial-gradient(circle at 40% 50%, rgba(240,182,86,0.28), transparent 70%)",
              }}
            />

            {/* Kadar je 3:4; aspect-[10/11] seče donjih ~18% i sklanja vodeni žig.
                Maska ima dva sloja koja se presecaju: radijalni rastvara bočne
                ivice i vrh, a linearni garantuje da dno potpuno iščezne - inače
                overflow-hidden na sekciji ostavi vidljiv rez. */}
            <div
              className="relative aspect-[10/11] w-full"
              style={{
                maskImage:
                  "radial-gradient(68% 76% at 50% 40%, #000 46%, transparent 84%), linear-gradient(to bottom, #000 55%, transparent 94%)",
                maskComposite: "intersect",
                WebkitMaskImage:
                  "radial-gradient(68% 76% at 50% 40%, #000 46%, transparent 84%), linear-gradient(to bottom, #000 55%, transparent 94%)",
                WebkitMaskComposite: "source-in",
              }}
            >
              {/* Portreti su snimljeni na skoro crnoj pozadini, ali sa plavom
                  refleksijom. Kontrast spušta tu pozadinu na čistu crnu, a
                  `screen` je onda potpuno stapa sa stranicom - bez toga se
                  vidi pravougaonik hladnijeg tona oko lika. */}
              <Image
                src={person.img}
                alt={`${person.name} - ${person.role}`}
                fill
                priority
                sizes="(max-width: 640px) 72vw, (max-width: 1024px) 24rem, 28rem"
                className="object-cover object-top mix-blend-screen [filter:contrast(1.3)_brightness(0.9)_saturate(0.9)]"
              />
            </div>
          </motion.div>

          {/* Tekst - negativna margina uvlači naslov u izbledelo dno portreta,
              da između slike i teksta ne ostane prazan pojas. */}
          <div className="relative z-10 -mt-10 w-full text-center sm:-mt-14">
            <motion.h1
              variants={up}
              className="text-balance text-4xl font-extrabold leading-[1.05] sm:text-6xl lg:text-7xl"
            >
              {person.heading ?? person.name}
            </motion.h1>

            {person.tagline && (
              <motion.p
                variants={up}
                className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-muted-foreground sm:mt-5 sm:text-lg"
              >
                {person.tagline}
              </motion.p>
            )}

            {person.chips && (
              <motion.ul
                variants={up}
                className="mx-auto mt-6 flex max-w-2xl flex-wrap justify-center gap-2"
              >
                {person.chips.map((c) => (
                  <li
                    key={c}
                    className="rounded-full card-glass px-3.5 py-1.5 text-xs font-medium text-foreground/80 sm:text-sm"
                  >
                    {c}
                  </li>
                ))}
              </motion.ul>
            )}

            <motion.div
              variants={up}
              className="mt-8 flex flex-col items-center gap-3"
            >
              <a
                href={waHref ?? "mailto:office@skeylo.com"}
                target={waHref ? "_blank" : undefined}
                rel={waHref ? "noopener noreferrer" : undefined}
                className="group inline-flex w-full items-center justify-center gap-2.5 rounded-md bg-primary px-8 py-3.5 text-base font-extrabold text-primary-foreground transition-transform hover:-translate-y-0.5 sm:w-auto sm:py-4"
              >
                <WhatsAppIcon className="size-5" />
                Piši mi na WhatsApp
                <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
              </a>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* PRIČA - tekst i fotografije u istom toku                          */}
      {/* ---------------------------------------------------------------- */}
      {person.chapters && (
        <section className="relative py-14 md:py-24">
          <div className="container-x">
            <SectionHead kicker="Priča" title="Kako sam došao ovde" />

            <div className="space-y-16 sm:space-y-20 lg:space-y-28">
              {person.chapters.map((c, i) => (
                <StoryChapter key={c.title} chapter={c} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* VAN EKRANA                                                        */}
      {/* ---------------------------------------------------------------- */}
      {person.offscreen && (
        <section className="relative py-14 md:py-24">
          <div className="container-x">
            <SectionHead kicker="Van ekrana" title="Kad ne radim" />

            <div className="space-y-16 sm:space-y-20 lg:space-y-28">
              {person.offscreen.map((c, i) => (
                <StoryChapter key={c.title} chapter={c} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* BAZA - mapa                                                       */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative py-12 md:py-20">
        <div className="container-x">
          <SectionHead kicker="Baza" title="Odakle radim" />

          <motion.div
            {...reveal}
            className="overflow-hidden rounded-2xl card-glass"
          >
            <div className="px-5 pt-8 sm:px-8">
              <EuropeMap />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border px-5 py-5 sm:px-8">
              <p className="inline-flex items-center gap-2 text-base font-bold sm:text-lg">
                <MapPin className="size-4.5 text-primary" aria-hidden />
                {person.location ?? "Novi Sad, Srbija"}
              </p>
              <p className="text-sm text-muted-foreground">
                45.2671° N, 19.8335° E
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* CTA                                                               */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative py-12 md:py-20">
        <div className="container-x">
          <motion.div
            {...reveal}
            className="rounded-2xl card-glass glow-orange px-6 py-10 text-center sm:px-10 sm:py-14"
          >
            <h2 className="text-balance text-3xl font-extrabold sm:text-4xl">
              Imaš projekat na umu?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-base text-muted-foreground sm:text-lg">
              Napiši mi poruku na WhatsApp.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href={waHref ?? "mailto:office@skeylo.com"}
                target={waHref ? "_blank" : undefined}
                rel={waHref ? "noopener noreferrer" : undefined}
                className="group inline-flex w-full items-center justify-center gap-2.5 rounded-md bg-primary px-8 py-3.5 text-base font-extrabold text-primary-foreground transition-transform hover:-translate-y-0.5 sm:w-auto sm:py-4"
              >
                <WhatsAppIcon className="size-5" />
                WhatsApp
                <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
              </a>
            </div>

            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:mt-8 sm:flex-row sm:gap-7">
              <a
                href="mailto:office@skeylo.com"
                className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
              >
                <Mail className="size-4" aria-hidden />
                office@skeylo.com
              </a>

              <Link
                href="/#tim"
                className="group inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
              >
                Upoznaj ostatak tima
                <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
