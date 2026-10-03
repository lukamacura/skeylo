import type { Metadata, Viewport } from "next";
import MtKomexLanding from "@/components/solar/mt-komex/MtKomexLanding";

export const metadata: Metadata = {
  // absolute: preskače root template "%s | Skeylo" (white-label).
  title: { absolute: "MT-Komex | Solarna elektrana za vašu firmu" },
  description:
    "Unesite mesečni račun za struju i za 60 sekundi vidite koliko vaš objekat može da uštedi i za koliko godina se investicija vraća. MT-Komex — 200+ elektrana od 1993.",
  openGraph: {
    title: "Vaš krov već može da plaća račun za struju",
    description:
      "Kalkulator uštede za firme sa velikim računom za struju. MT-Komex — 200+ solarnih elektrana, preko 150 MW.",
    images: ["/calculator/mt-komex/krov-hala-montaza.jpg"],
  },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0d1220",
  viewportFit: "cover",
};

// Živi pod /calculator da bi nasledio white-label režim (bez Skeylo headera/footera).
export default function MtKomexSolarPage() {
  return <MtKomexLanding />;
}
