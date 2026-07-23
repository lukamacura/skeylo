"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { PACKAGES, formatPrice } from "@/lib/packages";

export default function Packages() {
  return (
    <section id="paketi" className="relative py-12 md:py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[30rem] w-[min(60rem,100%)] -translate-x-1/2 rounded-full opacity-40 blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, rgba(216,121,40,0.3), transparent 65%)",
        }}
      />
      <div className="container-x relative">
        <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Paketi
          </p>
          <h2 className="mt-3 text-balance text-3xl font-extrabold sm:text-5xl">
            Izaberi paket shodno budžetu
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Tri paketa, jedan cilj - više prodaja. Svaki ima svoju stranicu sa
            detaljima.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {PACKAGES.map((pkg, idx) => {
            const premium = pkg.premium === true;
            return (
              <motion.div
                key={pkg.slug}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  delay: idx * 0.1,
                  type: "spring",
                  stiffness: 140,
                  damping: 20,
                }}
                className={`group relative flex flex-col rounded-2xl border p-6 transition-colors sm:p-7 ${
                  premium
                    ? "gold-frame border-transparent glow-gold bg-gradient-to-b from-[#f0b656]/[0.12] via-card to-card lg:-mt-4 lg:mb-4"
                    : "border-border card-glass hover:border-primary/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                      premium
                        ? "bg-gradient-to-r from-[#f0b656] to-[#d87928] text-[#0a0a0a]"
                        : "bg-foreground/[0.06] text-muted-foreground"
                    }`}
                  >
                    {pkg.badge}
                  </span>
                  <span className="font-display text-sm text-muted-foreground">
                    0{idx + 1}
                  </span>
                </div>

                <h3
                  className={`mt-5 text-xl font-bold sm:text-2xl ${
                    premium ? "text-gradient" : ""
                  }`}
                >
                  {pkg.name}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {pkg.tagline}
                </p>

                <div className="mt-5 flex items-baseline gap-1.5 sm:mt-6">
                  <span className="font-display text-4xl font-extrabold sm:text-5xl">
                    {formatPrice(pkg.price)}€
                  </span>
                  <span className="text-sm text-muted-foreground">
                    / {pkg.priceNote}
                  </span>
                </div>

                <ul className="mt-6 flex-1 space-y-3 sm:mt-7">
                  {pkg.deliverables.map((d) => (
                    <li
                      key={d.title}
                      className="flex items-start gap-3 text-sm"
                    >
                      <Check
                        className={`mt-0.5 size-4 shrink-0 ${
                          premium ? "text-[#f0b656]" : "text-accent"
                        }`}
                      />
                      <span className="text-foreground/90">{d.title}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/paketi/${pkg.slug}`}
                  className={`mt-7 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold transition-transform hover:-translate-y-0.5 sm:mt-8 sm:text-base ${
                    premium
                      ? "bg-gradient-to-r from-[#f0b656] to-[#d87928] text-[#0a0a0a] shadow-lg shadow-[#f0b656]/20"
                      : "border border-border text-foreground hover:border-primary"
                  }`}
                >
                  {pkg.cta}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
