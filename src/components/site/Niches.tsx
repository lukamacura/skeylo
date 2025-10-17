"use client";

import { motion } from "framer-motion";
import {
  ShieldCheck,
  Stethoscope,
  Building2,
  ShoppingBag,
  Gem,
} from "lucide-react";

type Item = {
  icon: React.ElementType;
  label: string;
};

const items: Item[] = [
  { icon: Stethoscope, label: "Estetska hirurgija" },
  { icon: Building2, label: "Real estate" },
  { icon: ShoppingBag, label: "E-commerce brendovi" },
  { icon: Gem, label: "Premium uslužne delatnosti" },
];

export default function Niches() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header copy */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-3"
        >
          <p className="text-xl md:text-2xl leading-snug">
            Evo sa kojim biznisima najviše radimo i kojima možemo doneti
            konkretan rast,{" "}
            <span className="inline-flex items-center gap-2 font-semibold text-foreground">
              GARANTOVANO
              <ShieldCheck className="size-8 text-primary" aria-hidden />
            </span>
            .
          </p>

          <p className="text-sm text-muted-foreground">
            Lista niša sa kojima radimo:
          </p>
        </motion.div>

        {/* Lista niša */}
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {items.map(({ icon: Icon, label }, i) => (
            <motion.li
              key={label}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{
                duration: 0.35,
                ease: [0.22, 1, 0.36, 1],
                delay: i * 0.06,
              }}
              className="group flex items-center gap-4 rounded-2xl border border-foreground/20 bg-background/80 p-4 hover:shadow-sm transition-shadow"
            >
              <span className="grid place-items-center size-10 rounded-full border border-foreground/20">
                <Icon className="size-5" aria-hidden />
              </span>
              <span className="text-base md:text-lg">{label}</span>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
