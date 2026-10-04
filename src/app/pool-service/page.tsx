import type { Metadata } from "next";
import PoolServiceLanding from "@/components/site/pool-service/PoolServiceLanding";

export const metadata: Metadata = {
  title: "Predlog za Pool Service",
  description:
    "Meta oglasi, landing stranica i kalkulator bazena za Pool Service Novi Sad — sistem koji vlasnike novih kuća dovodi do vašeg telefona.",
  openGraph: {
    title: "Predlog za Pool Service | Skeylo",
    description:
      "Kalkulator bazena i kampanje koje donose upite — isprobajte uživo.",
    images: [{ url: "/calculator/pool-service/result-desktop.jpg" }],
  },
  robots: { index: false, follow: false },
};

export default function PoolServicePitchPage() {
  return <PoolServiceLanding />;
}
