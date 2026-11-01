import type { CSSProperties } from "react";
import { pathBounds } from "@/lib/uml/geometry";

type Props = {
  id: string;
  d: string;
  className: string;
  markerEnd?: string;
  drawing: boolean;
  /** Redni broj linije, za kratak razmak u iscrtavanju. */
  order: number;
  /** Impuls koji prelazi preko pune linije dok je istaknuta. */
  pulse?: boolean;
};

/** Mesto oko linije za vrh strelice. */
const MASK_MARGIN = 14;

/**
 * Linija koja se pri prvom ulasku iscrtava. Isprekidane linije već koriste
 * stroke-dasharray, a marker se ne bi skrivao, pa se iscrtava maska (samo
 * stroke-dashoffset). maskUnits mora biti userSpaceOnUse: vodoravna linija ima
 * bounding box visine 0, pa bi je podrazumevana maska potpuno sakrila. Maska
 * pokriva samo okvir linije: maska veličine celog dijagrama je skupa za svaki kadar.
 */
export default function DrawnPath({
  id,
  d,
  className,
  markerEnd,
  drawing,
  order,
  pulse = false,
}: Props) {
  const maskId = `${id}-draw`;
  const box = drawing ? pathBounds(d) : null;
  return (
    <>
      {box && (
        <mask
          id={maskId}
          maskUnits="userSpaceOnUse"
          x={box.x - MASK_MARGIN}
          y={box.y - MASK_MARGIN}
          width={box.w + MASK_MARGIN * 2}
          height={box.h + MASK_MARGIN * 2}
        >
          <path
            d={d}
            pathLength={1}
            fill="none"
            stroke="#fff"
            strokeWidth={MASK_MARGIN * 2}
            className="uml-a-mask"
            style={{ "--i": order } as CSSProperties}
          />
        </mask>
      )}
      <path
        d={d}
        className={className}
        markerEnd={markerEnd}
        mask={drawing ? `url(#${maskId})` : undefined}
      />
      {pulse && <path d={d} pathLength={1} className="uml-pulse" />}
    </>
  );
}
