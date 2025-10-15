"use client";

import { FileText, Bug, Map } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";

const items = [
  {
    icon: FileText,
    title: "Izveštaj",
    copy: "Detaljan nalaz Vašeg trenutnog marketinga.",
  },
  { icon: Bug, title: "Greške", copy: "Lista grešaka i tačnih fix koraka." },
  {
    icon: Map,
    title: "Funnel mapa",
    copy: "Vizuelna mapa od oglasa do kupovine sa označenim tačkama curenja.",
  },
];

export default function Services() {
  const shouldReduce = useReducedMotion();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
  };

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: shouldReduce ? 0 : 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-3xl font-semibold"
        >
          Šta dobijate besplatnom analizom
        </motion.h2>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {items.map(({ icon: Icon, title, copy }) => (
            <motion.div
              key={title}
              variants={item}
              whileHover={{
                y: shouldReduce ? 0 : -4,
                boxShadow: shouldReduce
                  ? "none"
                  : "0 6px 24px rgba(0,0,0,0.08)",
              }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="group rounded-2xl border p-6 bg-background/60 backdrop-blur-sm relative overflow-hidden"
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background:
                    "radial-gradient(600px 150px at 10% -10%, hsl(var(--primary)/0.08), transparent)",
                }}
              />

              <motion.div
                whileHover={{
                  scale: shouldReduce ? 1 : 1.05,
                  rotate: shouldReduce ? 0 : 1,
                }}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border"
              >
                <Icon className="size-5" />
              </motion.div>

              <h3 className="mt-3 font-medium">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{copy}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
      <div className="flex items-center justify-center py-4">
        <Button asChild size="lg">
          <a href="https://calendly.com/" target="_blank" rel="noreferrer">
            Želim analizu
          </a>
        </Button>
      </div>
    </section>
  );
}
