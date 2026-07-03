import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Uskoro - Skeylo",
  description: "Naš sajt je trenutno u izradi. Vraćamo se uskoro.",
  robots: { index: false, follow: false },
};

export default function Construction() {
  return (
    <section className="relative isolate flex min-h-screen items-center justify-center overflow-hidden grain px-6 py-24">
      {/* Atmosphere */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-[-10%] h-[42rem] w-[42rem] rounded-full opacity-60 blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, rgba(216,121,40,0.45), transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 grid-lines opacity-[0.4] [mask-image:radial-gradient(80%_60%_at_50%_50%,black,transparent)]"
      />

      <div className="relative z-10 mx-auto max-w-xl text-center">
        <Image
          src="/logo.png"
          alt="Skeylo"
          width={80}
          height={80}
          className="mx-auto mb-8 h-20 w-20 object-contain"
          priority
        />

        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-foreground/[0.03] px-3 py-1.5 text-xs font-medium tracking-wide text-muted-foreground">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          Sajt u izradi
        </div>

        <h1 className="mt-6 text-balance text-4xl font-extrabold leading-[0.98] sm:text-5xl">
          Uskoro <span className="text-gradient">stižemo</span>.
        </h1>

        <p className="mx-auto mt-5 max-w-md text-lg leading-relaxed text-muted-foreground">
          Sajt je trenutno u izradi - vraćamo se vrlo brzo.
        </p>

        <a
          href="mailto:official@skeylo.com"
          className="mt-8 inline-flex items-center justify-center gap-2 rounded-md bg-primary px-8 py-4 text-base font-extrabold text-primary-foreground transition-transform hover:-translate-y-0.5"
        >
          Kontaktiraj nas
        </a>
      </div>
    </section>
  );
}
