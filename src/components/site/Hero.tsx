import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import FreeAnalysisPopup from "@/components/site/FreeAnalysisPopup";

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <p className="inline-flex items-center text-xs uppercase tracking-widest rounded-full border px-2 py-1 mb-4">
            Skeylo
          </p>
          <h1 className="text-4xl/tight md:text-5xl font-bold">
            Saznaj zašto tvoj marketing ne donosi novac i kako da to promeniš
            POTPUNO BESPLATNO
          </h1>
          <p className="mt-4 text-muted-foreground max-w-prose">
            Dobijaš <b>personalizovanu marketing analizu</b> i jasan plan kako
            da tvoj biznis dođe do više prodaja, kreirano od fullstack marketing
            tima koji <b>garantuje rezultate</b>.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <FreeAnalysisPopup triggerText="Saznaj besplatno" />

            <Button
              variant="outline"
              className="border border-foreground"
              size="lg"
              asChild
            >
              <a href="/work">
                Case studies <ArrowRight className="ms-2 size-4" />
              </a>
            </Button>
          </div>
        </div>
        <div className="relative aspect-[16/12]">
          {/* Replace with inline SVG for crispness */}
          <Image
            src="/hero.png"
            alt="Skeylo hero"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,hsl(var(--primary)/0.08),transparent)]" />
    </section>
  );
}
