"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Expand, Image as ImageIcon, X } from "lucide-react";
import type { SketchId } from "@/lib/uml/uml-content";
import SlideHeading from "./SlideHeading";

type Props = {
  title: string;
  /** Deo naslova koji dobija marker. */
  mark: string;
  /** Kratka oznaka pored naslova (npr. slučaj upotrebe koji dijagram realizuje). */
  tag?: string;
  sketchId: SketchId;
  onSketch: (id: SketchId) => void;
  /** Sadržaj ispod dijagrama (npr. kontrole koračanja). */
  below?: ReactNode;
  legend: ReactNode;
  /** Tekstualna alternativa za čitače ekrana. */
  alternative: ReactNode;
  children: ReactNode;
};

/** Dijagram zauzima sav prostor slajda koji mu ostane, bez skrolovanja. */
export default function DiagramStage({
  title,
  mark,
  tag,
  sketchId,
  onSketch,
  below,
  legend,
  alternative,
  children,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || document.querySelector("[data-uml-modal]"))
        return;
      e.preventDefault();
      setExpanded(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expanded]);

  return (
    <div className="uml-layout">
      <header className="uml-head">
        <div className="uml-head-title">
          <SlideHeading title={title} mark={mark} />
          {tag && <span className="uml-head-tag uml-rise">{tag}</span>}
        </div>
        <div className="uml-head-actions uml-rise print:hidden">
          <button
            type="button"
            className="uml-btn uml-btn-expand"
            onClick={() => setExpanded(true)}
          >
            <Expand aria-hidden />
            Uvećaj
          </button>
          <button
            type="button"
            className="uml-btn"
            onClick={() => onSketch(sketchId)}
          >
            <ImageIcon aria-hidden />
            Pogledaj skicu
          </button>
        </div>
      </header>

      <div
        className="uml-figure"
        data-expanded={expanded ? "true" : undefined}
        data-uml-expanded={expanded ? "" : undefined}
      >
        {expanded && (
          <button
            type="button"
            autoFocus
            aria-label="Zatvori uvećan prikaz"
            className="uml-icon-btn uml-figure-close"
            onClick={() => setExpanded(false)}
          >
            <X aria-hidden />
          </button>
        )}
        <div className="uml-figure-inner">{children}</div>
      </div>

      {below}

      <div className="uml-legend-wrap uml-rise">{legend}</div>
      <div className="sr-only">{alternative}</div>
    </div>
  );
}
