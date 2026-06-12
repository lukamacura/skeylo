import Hero from "@/components/site/Hero";
import SocialProof from "@/components/site/SocialProof";
import BentoGrid from "@/components/site/BentoGrid";
import Services from "@/components/site/Services";
import CaseStudies from "@/components/site/CaseStudies";
import Process from "@/components/site/Process";
import Packages from "@/components/site/Packages";
import FinalCta from "@/components/site/FinalCta";

export default function Home() {
  return (
    <>
      {/* 1. Hero - obećanje */}
      <Hero />
      {/* 2. Social proof - logoi + testimonijali */}
      <SocialProof />
      {/* 3. UVP / rezultati */}
      <BentoGrid />
      {/* 3b. Usluge + zašto mi */}
      <Services />
      {/* 4. Studije slučaja - dokaz */}
      <CaseStudies />
      {/* 5. Kako radimo - proces */}
      <Process />
      {/* 6. Ponuda - paketi */}
      <Packages />
      {/* 6b. Finalni CTA + risk reversal */}
      <FinalCta />
    </>
  );
}
