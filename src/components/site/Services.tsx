"use client";

import { type StaticImageData } from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import {
  Palette,
  Megaphone,
  Globe,
  LineChart,
  ShieldCheck,
  Users,
  Gauge,
  type LucideIcon,
} from "lucide-react";

import CardMedia from "./CardMedia";
import analiza from "../../../public/analiza.webp";
import webdev from "../../../public/webdev.webp";
import kreativa from "../../../public/kreativa.webp";
import meta from "../../../public/meta.webp";

type Service = {
  icon: LucideIcon;
  title: string;
  image?: StaticImageData;
  alt?: string;
  position?: string;
};

const services: Service[] = [
  {
    icon: Palette,
    title: "Kreativa i dizajn",
    image: kreativa,
    alt: "Kreativna produkcija na terenu",
    position: "object-[35%_20%]",
  },
  {
    icon: Megaphone,
    title: "Meta oglašavanje",
    image: meta,
    alt: "Skeylo tim vodi Meta kampanje",
    position: "object-[50%_38%]",
  },
  {
    icon: Globe,
    title: "Web development",
    image: webdev,
    alt: "Izrada sajta na terenu",
    position: "object-[62%_58%]",
  },
  {
    icon: LineChart,
    title: "Analiza i strategija",
    image: analiza,
    alt: "Skeylo tim analizira kampanju",
    position: "object-[50%_42%]",
  },
];

const why = [
  {
    icon: Users,
    title: "Jedan tim za sve",
  },
  {
    icon: Gauge,
    title: "Fokus na profit",
  },
  {
    icon: ShieldCheck,
    title: "Sistem, ne kampanja",
  },
];

export default function Services() {
  const reduce = useReducedMotion();

  return (
    <section id="usluge" className="relative py-12 md:py-20">
      <div className="container-x">
        <div className="mb-8 max-w-2xl sm:mb-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Usluge
          </p>
          <h2 className="mt-3 text-balance text-3xl font-extrabold sm:text-5xl">
            Sve što tvom biznisu treba da raste - na jednom mestu
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
          {services.map((s, i) => (
            <motion.article
              key={s.title}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                delay: i * 0.08,
                type: "spring",
                stiffness: 140,
                damping: 20,
              }}
              className="group relative overflow-hidden rounded-2xl card-glass transition-colors hover:border-primary/40"
            >
              <CardMedia
                image={s.image}
                alt={s.alt ?? s.title}
                icon={s.icon}
                position={s.position}
                sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 300px"
                className="aspect-[16/10] sm:aspect-[4/3]"
              />

              <div className="relative -mt-9 p-6 pt-0">
                <motion.div
                  whileHover={reduce ? undefined : { y: -2 }}
                  transition={{ type: "spring", stiffness: 200, damping: 16 }}
                  className="inline-flex rounded-xl bg-primary/15 p-3 ring-1 ring-primary/20 backdrop-blur-sm"
                >
                  <s.icon className="size-6 text-primary" />
                </motion.div>
                <h3 className="mt-5 text-lg font-bold">{s.title}</h3>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
