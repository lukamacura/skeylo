import type { Metadata } from "next";
import Hero from "@/components/site/Hero";
import SocialProof from "@/components/site/SocialProof";
import BentoGrid from "@/components/site/BentoGrid";
import Services from "@/components/site/Services";
import CaseStudies from "@/components/site/CaseStudies";
import Process from "@/components/site/Process";
import Team from "@/components/site/Team";
import Packages from "@/components/site/Packages";
import FinalCta from "@/components/site/FinalCta";

// Bivša početna (do 22.11.2026). Nova početna je VSL landing u src/app/page.tsx;
// ovde ostaju usluge, studije, tim i paketi, i na njih vode linkovi iz headera.
export const metadata: Metadata = {
  title: "Marketing koji donosi profit",
  robots: { index: false, follow: true },
};

export default function Home() {
  return (
    <>
      {/* 1. Hero - obećanje */}
      <Hero />
      {/* 2. Social proof - logoi + testimonijali */}
      <SocialProof />
      {/* 3. UVP / rezultati */}
      <Packages />
      <BentoGrid />
      {/* 3b. Usluge + zašto mi */}
      <Services />
      {/* 4. Studije slučaja - dokaz */}
      <CaseStudies />
      {/* 5. Kako radimo - proces */}
      <Process />
      {/* 5b. Tim koji radi za tebe */}
      <Team />
      {/* 6. Ponuda - paketi */}

      {/* 6b. Finalni CTA + risk reversal */}
      <FinalCta />
    </>
  );
}
