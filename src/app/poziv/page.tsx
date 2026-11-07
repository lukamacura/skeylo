// /poziv — link koji šaljemo ljudima da sami zakažu poziv sa Skeylo timom.
// Termini i zakazivanje: /api/poziv → os.call_slots() / os.call_book() u bazi
// (docs/telegram/skeylo-pozivi.sql). Svaki zakazan poziv je event u OS-u i
// odmah stiže kao 📞 poruka u Telegram grupu, plus podsetnik 1h pre.
// Stranica je van (site) grupe: bez headera i footera sajta, samo kalendar.
import type { Metadata } from "next";
import PozivClient from "./PozivClient";

export const metadata: Metadata = {
  title: "Zakaži poziv",
  description:
    "Izaberi dan i vreme za besplatan poziv sa Skeylo timom. 30 minuta, telefonom, WhatsApp-om, Viberom, preko Google Meet-a ili uživo.",
  openGraph: {
    title: "Zakaži poziv sa Skeylo timom",
    description:
      "Izaberi dan i vreme za besplatan poziv. 30 minuta, bez obaveza.",
    images: [{ url: "/og.png" }],
  },
};

export default function Page() {
  return <PozivClient />;
}
