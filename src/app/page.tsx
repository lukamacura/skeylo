// Početna: VSL landing na jednoj strani (komponente u components/site/home).
// Stoji van grupe (site) jer ima svoj sveden header: logo + "Zakaži sastanak".
// Stari landing sa svim sekcijama je u (site)/starilanding.
import type { Metadata } from "next";
import HomeLanding from "@/components/site/home/HomeLanding";
import Footer from "@/components/site/Footer";

const TITLE = "Skeylo - Interni marketing tim i operativni sistem";
const DESCRIPTION =
  "Kreative, plaćene kampanje i sajt radi jedan tim koji tvoj posao poznaje iznutra. Uz to dobijaš operativni sistem u kome vidiš celu firmu i upravljaš njome.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: "/og.png" }],
  },
};

export default function Home() {
  return (
    <>
      <HomeLanding />
      <Footer />
    </>
  );
}
