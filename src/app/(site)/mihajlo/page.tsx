import type { Metadata } from "next";
import { getPerson } from "@/lib/people";
import PersonBio from "@/components/site/PersonBio";

const person = getPerson("mihajlo")!;

export const metadata: Metadata = {
  title: `${person.name} - Content Director`,
  description:
    "Mihajlo Obradović - Content Director i co-founder Skeyla. Video produkcijom se bavim od 2016, studiram na Fakultetu tehničkih nauka. Baza: Novi Sad, Srbija.",
  openGraph: {
    title: `${person.name} | Skeylo`,
    description: "Kreativa koja se gleda do kraja, a ne preskače.",
    images: [{ url: person.img }],
  },
};

export default function MihajloPage() {
  return <PersonBio person={person} />;
}
