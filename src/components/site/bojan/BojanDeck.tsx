"use client";

import Deck from "./Deck";
import { SLIDES } from "./slides";

export default function BojanDeck({ fontClass = "" }: { fontClass?: string }) {
  return (
    <Deck fontClass={fontClass} slides={SLIDES} storageKey="bojan-deck-open" />
  );
}
