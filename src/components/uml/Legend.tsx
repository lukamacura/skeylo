import type { ReactNode } from "react";
import type { ClassGroup } from "@/lib/uml/uml-data";

export type SwatchKind =
  | "use-case-base"
  | "use-case-helper"
  | "association"
  | "dependency"
  | "call"
  | "return"
  | "lifeline"
  | "activation"
  | "alt"
  | "link-attribute"
  | ClassGroup;

const LINE = "uml-swatch-line";

/** Vrh strelice je crtan ručno: marker bi morao da ima ID po svakom uzorku. */
function Swatch({ kind }: { kind: SwatchKind }) {
  const inner = (): ReactNode => {
    switch (kind) {
      case "use-case-base":
        return (
          <ellipse
            cx="17"
            cy="9"
            rx="15"
            ry="7"
            fill="url(#uc-base)"
            className="uml-uc-base"
          />
        );
      case "use-case-helper":
        return (
          <ellipse
            cx="17"
            cy="9"
            rx="15"
            ry="7"
            fill="url(#uc-helper)"
            className="uml-uc-helper"
          />
        );
      case "association":
        return <path d="M2,9 H32" className={LINE} />;
      case "dependency":
      case "return":
        return (
          <>
            <path d="M2,9 H31" className={`${LINE} uml-dashed`} />
            <path d="M25,4 L32,9 L25,14" className={LINE} />
          </>
        );
      case "call":
        return (
          <>
            <path d="M2,9 H26" className={LINE} />
            <path d="M25,4 L33,9 L25,14 Z" className="uml-swatch-fill" />
          </>
        );
      case "lifeline":
        return <path d="M17,1 V17" className={`${LINE} uml-dashed`} />;
      case "activation":
        return (
          <>
            <path d="M17,0 V18" className={`${LINE} uml-dashed`} />
            <rect
              x="13"
              y="3"
              width="8"
              height="12"
              className="uml-swatch-activation"
            />
          </>
        );
      case "alt":
        return (
          <>
            <rect x="2" y="2" width="30" height="14" className={LINE} />
            <path d="M2,2 H14 V6 L11,9 H2" className={LINE} />
          </>
        );
      case "link-attribute":
        return (
          <text x="17" y="13.5" textAnchor="middle" className="uml-swatch-link">
            ID
          </text>
        );
      default:
        return (
          <rect
            x="4"
            y="2"
            width="26"
            height="14"
            rx="3"
            className={`uml-class-swatch`}
            data-group={kind}
          />
        );
    }
  };

  return (
    <svg viewBox="0 0 34 18" aria-hidden className="uml-swatch">
      {inner()}
    </svg>
  );
}

export default function Legend({
  items,
}: {
  items: { kind: SwatchKind; label: string }[];
}) {
  return (
    <ul className="uml-legend" aria-label="Legenda">
      {items.map((item) => (
        <li key={item.label}>
          <Swatch kind={item.kind} />
          <span>{item.label}</span>
        </li>
      ))}
    </ul>
  );
}
