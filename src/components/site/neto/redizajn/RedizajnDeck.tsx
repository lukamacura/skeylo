"use client";

import Deck from "../Deck";
import { SLIDES } from "./slides";
import { WHATSAPP } from "./data";

/* The bar's button on the last slide, for a time other than the three the
   meeting slide offers. */
const CONTACT =
  `${WHATSAPP}?text=` +
  encodeURIComponent(
    "Zdravo Luka, hajde da sednemo zajedno, Bojan, Jovana i vi, i donesemo odluku. Predlažemo termin: ",
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
