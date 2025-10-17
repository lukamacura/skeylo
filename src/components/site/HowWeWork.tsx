"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ClipboardList, Hammer, Rocket } from "lucide-react";

type Step = {
  title: string;
  copy: string;
  // Ako kasnije dodaš slike, samo ubaci src putanju u public/
  img?: string;
  FallbackIcon: React.ElementType;
};

const steps: Step[] = [
  {
    title: "Analiza & plan",
    copy: "Audit trenutnog marketinga + jasan 30-60-90 plan sa prioritetima i očekivanim uticajem.",
    img: "/step1.png", // ← ubaci kasnije (public/steps/analysis.png)
    FallbackIcon: ClipboardList,
  },
  {
    title: "Implementacija",
    copy: "Tehnički setup, praćenje, kampanje, kreativni asseti i landing strani — sve end-to-end.",
    img: "/step2.png",
    FallbackIcon: Hammer,
  },
  {
    title: "Skaliranje",
    copy: "Iterativni testovi, optimizacije i budžetsko skaliranje na kanalima koji donose profit.",
    img: "/step3.png",
    FallbackIcon: Rocket,
  },
];

export default function HowWeWork() {
  const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-4">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, ease }}
          className="text-3xl md:text-4xl font-semibold text-center"
        >
          Kako radimo?
        </motion.h2>

        {/* linija/flow */}
        <div className="relative mt-12 grid gap-10 md:grid-cols-3">
          {/* horizontalna linija za md+ */}

          {steps.map(({ title, copy, img, FallbackIcon }, i) => (
            <motion.article
              key={title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.45, ease, delay: i * 0.08 }}
              className="relative z-10 rounded-2xl border border-foreground/20 bg-background/70 p-6 shadow-sm"
            >
              {/* brojač + “balon” */}
              <div className="mb-4 flex items-center gap-3">
                <div className="grid size-9 place-items-center rounded-full border border-foreground/20 bg-background font-medium">
                  {i + 1}
                </div>
                <h3 className="text-lg md:text-xl font-medium">{title}</h3>
              </div>

              {/* slika ili fallback ikona */}
              <div className="relative mb-4 aspect-[4/4] w-full overflow-hidden rounded-xl border-foreground/20s bg-muted/30">
                {img ? (
                  <Image
                    src={img}
                    alt={title}
                    fill
                    className="object-cover"
                    sizes="(min-width: 768px) 33vw, 100vw"
                    priority={i === 0}
                  />
                ) : (
                  <div className="absolute inset-0 grid place-items-center">
                    <FallbackIcon className="size-10 opacity-70" />
                  </div>
                )}
              </div>

              <p className="text-sm text-muted-foreground">{copy}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
