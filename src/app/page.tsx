import Hero from "@/components/site/Hero";
import Services from "@/components/site/Services";
import Niches from "@/components/site/Niches";
import HowWeWork from "@/components/site/HowWeWork";
import TeamSection from "@/components/site/TeamSection";
import SalesFocused from "@/components/site/SalesFocused";

export default function Home() {
  return (
    <div>
      <>
        <Hero />
        <Services />
        <Niches />
        <HowWeWork />
        <TeamSection />
        <SalesFocused />
      </>
    </div>
  );
}
