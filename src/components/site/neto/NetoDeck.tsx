"use client";

import Deck from "./Deck";
import { SLIDES } from "./slides";

export default function NetoDeck({ fontClass = "" }: { fontClass?: string }) {
  return (
    <Deck fontClass={fontClass} slides={SLIDES} storageKey="neto-deck-open" />
  );
}
