import type { Metadata } from "next";
import { getPerson } from "@/lib/people";
import PersonBio from "@/components/site/PersonBio";

const person = getPerson("luka")!;

export const metadata: Metadata = {
  title: `${person.name} - ${person.role}`,
  description:
    "Luka Macura - web development i CRO u Skeylo timu. Sajtove pravim od 2019. i vodim Macura Solutions LLC. Baza: Novi Sad, Srbija.",
  openGraph: {
    title: `${person.name} | Skeylo`,
    description:
      "Web development i CRO. Sajtovi koji prodaju, a ne samo dobro izgledaju.",
    images: [{ url: person.img }],
  },
};

export default function LukaPage() {
  return <PersonBio person={person} />;
}
