"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const team = [
  {
    name: "Luka Macura",
    role: "Web Development & CRO",
    img: "/luka.webp",
  },
  {
    name: "Filip Ruvčeski",
    role: "Media Buyer",
    img: "/filip.webp",
  },
  {
    name: "Mihajlo Obradović",
    role: "Video Production",
    img: "/mihac.webp",
  },
];

export default function Team() {
  return (
    <section className="relative py-20 md:py-28">
      <div className="container-x">
        <div className="mb-14 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Ko stoji iza rezultata
          </p>
          <h2 className="mt-3 text-balance text-4xl font-extrabold sm:text-5xl">
            Tim koji radi za tebe
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {team.map((m, i) => (
            <motion.div
              key={m.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                delay: i * 0.12,
                type: "spring",
                stiffness: 140,
                damping: 20,
              }}
              className="relative overflow-hidden rounded-2xl card-glass p-7"
            >
              <div className="relative mx-auto size-32 overflow-hidden rounded-full ring-2 ring-primary/30">
                <Image
                  src={m.img}
                  alt={m.name}
                  fill
                  sizes="128px"
                  className="object-cover"
                />
              </div>
              <h3 className="mt-6 text-center text-xl font-bold">{m.name}</h3>
              <p className="mt-1 text-center text-muted-foreground">{m.role}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
