import type { Metadata } from "next";
import { getPerson } from "@/lib/people";
import PersonBio from "@/components/site/PersonBio";

const person = getPerson("luka")!;

export const metadata: Metadata = {
  title: `${person.name} - Entrepreneur`,
  description:
    "Luka Macura - preduzetnik i deo Skeylo tima. Sajtove pravim od 2019, studiram na Fakultetu tehničkih nauka. Baza: Novi Sad, Srbija.",
  openGraph: {
    title: `${person.name} | Skeylo`,
    description: "Sajtovi koji prodaju, a ne samo dobro izgledaju.",
    images: [{ url: person.img }],
  },
};

export default function LukaPage() {
  return <PersonBio person={person} />;
}
