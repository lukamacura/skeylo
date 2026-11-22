"use client";

import { Deck, wa } from "./kit";
import { SLIDES } from "./slides";

const CONTACT = wa(
  "Zdravo Luka, pogledao sam ponudu za Ciklon. Hajde da zakažemo sastanak.",
);

export default function CiklonDeck({ fontClass = "" }: { fontClass?: string }) {
  return <Deck slides={SLIDES} fontClass={fontClass} contact={CONTACT} />;
}
