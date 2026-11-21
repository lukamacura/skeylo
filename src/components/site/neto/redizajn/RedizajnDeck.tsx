"use client";

import Deck from "../Deck";
import { SLIDES } from "./slides";

const CONTACT =
  "https://wa.me/381631012474?text=" +
  encodeURIComponent(
    "Zdravo Luka, želimo da krenemo sa ponudom za tri meseca: redizajn lokala, sajt, aplikacija i baza znanja. Hajde da zakažemo sastanak.",
  );

/* Same gate, same password and the same "unlocked" key as /neto: whoever
   opened the first offer in this tab walks straight into this one. */
export default function RedizajnDeck({
  fontClass = "",
}: {
  fontClass?: string;
}) {
  return (
    <Deck
      fontClass={fontClass}
      slides={SLIDES}
      storageKey="neto-deck-open"
      contact={CONTACT}
      eyebrows={false}
    />
  );
}
