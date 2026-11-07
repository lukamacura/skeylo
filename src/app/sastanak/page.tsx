// /sastanak — link koji šaljemo ljudima da sami zakažu sastanak sa Skeylo timom.
// Termini i zakazivanje: /api/sastanak → os.call_slots() / os.call_book() u bazi
// (docs/telegram/skeylo-sastanci.sql). Svaki zakazan sastanak je event u OS-u i
// odmah stiže kao 🗓️ poruka u Telegram grupu, plus podsetnik 1h pre.
// Stranica je van (site) grupe: bez headera i footera sajta, samo kalendar.
import type { Metadata } from "next";
import SastanakClient from "./SastanakClient";

export const metadata: Metadata = {
  title: "Zakaži sastanak",
  description:
    "Izaberi dan i vreme za besplatan sastanak sa Skeylo timom. 30 minuta, telefonom, WhatsApp-om, Viberom, preko Google Meet-a ili uživo.",
  openGraph: {
    title: "Zakaži sastanak sa Skeylo timom",
    description:
      "Izaberi dan i vreme za besplatan sastanak. 30 minuta, bez obaveza.",
    images: [{ url: "/og.png" }],
  },
};

export default function Page() {
  return <SastanakClient />;
}
