"use client";

import { MotionConfig } from "framer-motion";
import { BG, IVORY, SANS } from "../ads/primitives";
import { SistemMap } from "./SistemMap";

/* Mapa preko cele stranice, kao slajd u prezentaciji, samo bez navigacije.
   U CRM-u se otvara u okviru (Informacioni sistem). */
export default function SistemStage({
  fontClass = "",
}: {
  fontClass?: string;
}) {
  return (
    <MotionConfig reducedMotion="user">
      <div
        lang="sr-Latn"
        className={`fixed inset-0 z-[200] overflow-hidden ${fontClass}`}
        style={{
          background: BG,
          color: IVORY,
          fontFamily: SANS,
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <SistemMap />
      </div>
    </MotionConfig>
  );
}
