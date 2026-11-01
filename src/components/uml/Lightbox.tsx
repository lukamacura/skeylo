"use client";

import { useMemo, useRef, type CSSProperties } from "react";
import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { UML_FONT_VARS } from "@/app/uml/fonts";
import { SKETCHES, type Sketch, type SketchId } from "@/lib/uml/uml-content";

type Props = {
  sketchId: SketchId | null;
  onClose: () => void;
};

/** Skica raste iz dugmeta koje ju je otvorilo i vraća se u njega. */
function originFromTrigger() {
  const trigger = document.activeElement;
  if (!trigger || trigger === document.body) return "50% 50%";
  const rect = trigger.getBoundingClientRect();
  return `${rect.left + rect.width / 2}px ${rect.top + rect.height / 2}px`;
}

/**
 * Izlaz vodi Radix: čeka animationend za [data-state="closed"] iz uml.css, pa tek
 * onda uklanja dijalog i vraća klik na body. Bez animacije uklanja odmah.
 */
export default function Lightbox({ sketchId, onClose }: Props) {
  const returnTo = useRef<HTMLElement | SVGElement | null>(null);

  // Tokom izlaza dijalog i dalje prikazuje skicu koja je upravo zatvorena.
  const shown = useRef<Sketch | null>(null);
  if (sketchId) shown.current = SKETCHES[sketchId];
  const sketch = shown.current;

  const origin = useMemo(
    () => (sketchId ? originFromTrigger() : null),
    [sketchId],
  );
  const lastOrigin = useRef("50% 50%");
  if (origin) lastOrigin.current = origin;

  return (
    <Dialog.Root
      open={sketchId !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="uml-lightbox-overlay print:hidden" />
        <Dialog.Content
          data-uml-modal
          aria-describedby={undefined}
          onOpenAutoFocus={() => {
            returnTo.current = document.activeElement as
              | HTMLElement
              | SVGElement;
          }}
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            returnTo.current?.focus({ preventScroll: true });
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
          style={{ "--uml-origin": lastOrigin.current } as CSSProperties}
          className={`uml-lightbox ${UML_FONT_VARS} print:hidden`}
        >
          <div className="uml-lightbox-head">
            <Dialog.Title className="uml-lightbox-title">
              {sketch?.title}
            </Dialog.Title>
            <Dialog.Close
              aria-label="Zatvori skicu"
              className="uml-lightbox-close"
            >
              <X aria-hidden />
            </Dialog.Close>
          </div>
          {sketch && (
            <div
              className="uml-lightbox-body"
              onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
              }}
            >
              <Image
                src={sketch.src}
                width={sketch.width}
                height={sketch.height}
                alt={sketch.alt}
                sizes="100vw"
                priority
              />
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
