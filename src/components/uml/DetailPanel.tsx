"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { X } from "lucide-react";

type Side = "left" | "right";

type Props = {
  open: boolean;
  /** Menja se sa izabranim elementom; fokus se tada vraća na taj element. */
  contentKey: string | null;
  eyebrow?: string;
  title: string;
  /** Strana suprotna od izabranog elementa, da ga panel ne prekrije. */
  side: Side;
  onClose: () => void;
  children: ReactNode;
};

/** Trajanje izlazne animacije u uml.css (.uml-panel[data-closing]). */
const EXIT_MS = 170;

/**
 * Bočni panel; na telefonu donji. Nije modalan: dijagram ostaje dostupan.
 * Ulazi i izlazi istom putanjom. Uklanja ga kraj izlazne animacije; tajmer je
 * rezerva za smanjen pokret, kad animacije nema.
 */
export default function DetailPanel({
  open,
  contentKey,
  eyebrow,
  title,
  side,
  onClose,
  children,
}: Props) {
  const [present, setPresent] = useState(false);
  if (open && !present) setPresent(true);
  const closing = present && !open;

  // Tokom izlaza panel i dalje prikazuje sadržaj elementa koji je upravo zatvoren.
  const shown = useRef({ eyebrow, title, side, contentKey, children });
  if (open) shown.current = { eyebrow, title, side, contentKey, children };
  const view = shown.current;

  const closeRef = useRef<HTMLButtonElement>(null);
  const returnTo = useRef<HTMLElement | SVGElement | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!closing) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const timer = setTimeout(
      () => setPresent(false),
      reduced ? 0 : EXIT_MS + 100,
    );
    return () => clearTimeout(timer);
  }, [closing]);

  useEffect(() => {
    if (!open) return;
    returnTo.current = document.activeElement as HTMLElement | SVGElement;
    closeRef.current?.focus({ preventScroll: true });
  }, [open, contentKey]);

  useEffect(() => {
    if (open) return;
    const target = returnTo.current;
    returnTo.current = null;
    if (target?.isConnected) target.focus({ preventScroll: true });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    // Capture: panel se zatvara pre uvećanog prikaza ispod njega.
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || document.querySelector("[data-uml-modal]"))
        return;
      e.preventDefault();
      e.stopImmediatePropagation();
      onCloseRef.current();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [open]);

  if (!present) return null;

  return (
    <aside
      key={view.side}
      role="dialog"
      aria-label={view.title}
      data-uml-panel
      data-side={view.side}
      data-closing={closing ? "true" : undefined}
      inert={closing}
      className="uml-panel"
      onAnimationEnd={(e) => {
        if (closing && e.target === e.currentTarget) setPresent(false);
      }}
    >
      <div className="uml-panel-head">
        <div className="min-w-0">
          {view.eyebrow && <p className="uml-panel-eyebrow">{view.eyebrow}</p>}
          <h3 className="uml-panel-title">{view.title}</h3>
        </div>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Zatvori panel"
          className="uml-icon-btn"
        >
          <X aria-hidden />
        </button>
      </div>
      <div className="uml-panel-body">
        {/* key: sadržaj novog elementa se ponovo slaže redom */}
        <div key={view.contentKey} className="uml-panel-content">
          {view.children}
        </div>
      </div>
    </aside>
  );
}
