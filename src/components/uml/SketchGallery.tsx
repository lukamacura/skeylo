"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import { Maximize2 } from "lucide-react";
import { SKETCHES, SKETCHES_LEAD, type SketchId } from "@/lib/uml/uml-content";
import SlideHeading from "./SlideHeading";

function SketchCard({
  id,
  sizes,
  order,
  onOpen,
}: {
  id: SketchId;
  sizes: string;
  order: number;
  onOpen: (id: SketchId) => void;
}) {
  const sketch = SKETCHES[id];
  return (
    <figure
      className="uml-sketch uml-rise"
      data-tone={id}
      data-sketch={id}
      style={{ "--d": order } as CSSProperties}
    >
      <figcaption>{sketch.title}</figcaption>
      <button
        type="button"
        onClick={() => onOpen(id)}
        aria-label={`Uvećaj skicu: ${sketch.title}`}
        className="uml-sketch-btn"
      >
        {/* priority: slajd je skriven do ulaska, a skice moraju da stignu i na štampu. */}
        <Image
          src={sketch.src}
          width={sketch.width}
          height={sketch.height}
          alt={sketch.alt}
          sizes={sizes}
          priority
        />
        <span className="uml-sketch-hint print:hidden">
          <Maximize2 aria-hidden />
        </span>
      </button>
    </figure>
  );
}

export default function SketchGallery({
  onOpen,
}: {
  onOpen: (id: SketchId) => void;
}) {
  return (
    <div className="uml-layout">
      <header className="uml-head">
        <SlideHeading title="Skice" mark="Skice" />
        <p
          className="uml-sketch-lead uml-rise"
          style={{ "--d": 1 } as CSSProperties}
        >
          {SKETCHES_LEAD}
        </p>
      </header>
      {/* Klase su skoro kvadratne, pa stoje same u desnoj koloni. */}
      <div className="uml-sketch-grid">
        <SketchCard
          id="use-case"
          order={2}
          sizes="(orientation: landscape) 45vw, 100vw"
          onOpen={onOpen}
        />
        <SketchCard
          id="class"
          order={3}
          sizes="(orientation: landscape) 55vw, 100vw"
          onOpen={onOpen}
        />
        <SketchCard
          id="sequence"
          order={4}
          sizes="(orientation: landscape) 45vw, 100vw"
          onOpen={onOpen}
        />
      </div>
    </div>
  );
}
