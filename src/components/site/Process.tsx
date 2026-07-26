"use client";

import { type StaticImageData } from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Search, PenTool, Rocket, type LucideIcon } from "lucide-react";

import CardMedia from "./CardMedia";
import analiza from "../../../public/analiza.webp";
import webdev from "../../../public/teren.webp";
import scale from "../../../public/scale.webp";

type Step = {
  icon: LucideIcon;
  title: string;
  desc: string;
  image?: StaticImageData;
  alt?: string;
  position?: string;
};

const steps: Step[] = [
  {
    icon: Search,
    title: "Temelj",
    desc: "Detaljno istražujemo tržište, definišemo ciljnu publiku i osmišljamo prodajni levak.",
    image: analiza,
    alt: "Skeylo tim planira kampanju",
    position: "object-[50%_42%]",
  },
  {
    icon: PenTool,
    title: "Izrada",
    desc: "Izlazimo na teren i snimamo kreative, u pozadini se izrađuje sajt i kreira kampanja.",
    image: webdev,
    alt: "Izrada sajta na terenu",
    position: "object-[62%_58%]",
  },
  {
    icon: Rocket,
    title: "Skaliranje",
    desc: "Kampanja je dokazala da radi. Vreme je da se poveća budžet i ostvari maksimalan profit.",
    image: scale,
    alt: "Skaliranje kampanje i rast profita",
  },
];

export default function Process() {
  const reduce = useReducedMotion();

  return (
    <section className="relative py-12 md:py-20">
      <div className="container-x">
        <div className="mb-8 max-w-2xl sm:mb-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Kako radimo
          </p>
          <h2 className="mt-3 text-balance text-3xl font-extrabold sm:text-5xl">
            Sistem u tri koraka
          </h2>
        </div>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <motion.article
              key={s.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                delay: i * 0.12,
                type: "spring",
                stiffness: 140,
                damping: 20,
              }}
              className="group relative overflow-hidden rounded-2xl card-glass"
            >
              <CardMedia
                image={s.image}
                alt={s.alt ?? s.title}
                icon={s.icon}
                position={s.position}
                sizes="(max-width: 768px) 92vw, (max-width: 1280px) 33vw, 400px"
                className="aspect-[16/10] sm:aspect-[2/1] md:aspect-[4/3]"
              >
                <span className="font-display absolute right-5 top-4 text-5xl font-extrabold leading-none text-foreground/70 drop-shadow-[0_2px_12px_rgba(0,0,0,0.75)] sm:text-6xl">
                  0{i + 1}
                </span>
              </CardMedia>

              <div className="relative -mt-9 p-6 pt-0 sm:p-7 sm:pt-0">
                <motion.div
                  whileHover={reduce ? undefined : { y: -2 }}
                  transition={{ type: "spring", stiffness: 200, damping: 16 }}
                  className="inline-flex rounded-xl bg-primary/15 p-3 ring-1 ring-primary/20 backdrop-blur-sm"
                >
                  <s.icon className="size-6 text-primary" />
                </motion.div>
                <h3 className="mt-5 text-lg font-bold sm:text-xl">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                  {s.desc}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
