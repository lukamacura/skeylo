/* ------------------------------------------------------------------ */
/*  Ljudi u bazenu                                                      */
/*                                                                      */
/*  Crtaju se u metrima i skaliraju na scenu, pa figura od 1,8 m uvek   */
/*  stoji u tačnom odnosu prema dubini vode. Kretanje (zamah ruku,      */
/*  udarci nogu) ide samo kroz CSS transform i gasi se kroz media upit  */
/*  za smanjeno kretanje, pa server i klijent crtaju isto.              */
/* ------------------------------------------------------------------ */

import { PERSON_HEIGHT } from "@/lib/pool";

const BODY = "#13283a";
/** Ista figura viđena kroz vodu: hladnija i bleđa. */
const SUNK = "#1f5a7c";

/** Silueta odrasle osobe (kao u arhitektonskim crtežima), stopala u (0, 0). */
function Silhouette({ fill }: { fill: string }) {
  return (
    <g fill={fill} stroke={fill} strokeLinecap="round">
      <circle cy={-1.68} r={0.115} stroke="none" />
      <rect x={-0.05} y={-1.6} width={0.1} height={0.14} stroke="none" />
      <path
        d="M-0.21 -1.47Q-0.23 -1.51-0.17 -1.51H0.17Q0.23 -1.51 0.21 -1.47L0.17 -0.97Q0 -0.92-0.17 -0.97Z"
        stroke="none"
      />
      <path
        d="M-0.21 -1.43L-0.27 -0.84M0.21 -1.43L0.27 -0.84"
        strokeWidth={0.085}
      />
      <path d="M-0.085 -1L-0.1 -0.05M0.085 -1L0.1 -0.05" strokeWidth={0.12} />
    </g>
  );
}

/**
 * Osoba od 180 cm u preseku. Iznad vode je puna boja, ispod vode ista figura
 * u boji vode, pa se tačno vidi dokle joj voda dopire.
 */
export function ScaleFigure({
  x,
  feet,
  k,
  fs,
  sw,
}: {
  x: number;
  /** y stopala: dno bazena ili niže od površine kad osoba pliva. */
  feet: number;
  /** Piksela po metru (vertikalna razmera preseka). */
  k: number;
  fs: number;
  sw: number;
}) {
  const head = feet - PERSON_HEIGHT * k;
  return (
    <g>
      <g clipPath="url(#pl-air-clip)" opacity={0.92}>
        <g transform={`translate(${x} ${feet}) scale(${k})`}>
          <Silhouette fill={BODY} />
        </g>
      </g>
      <g clipPath="url(#pl-water-clip)" opacity={0.78}>
        <g transform={`translate(${x} ${feet}) scale(${k})`}>
          <Silhouette fill={SUNK} />
        </g>
      </g>
      <text
        x={x + 0.2 * k}
        y={head - 0.02 * k}
        fontSize={fs * 0.85}
        fontWeight={600}
        fill="#e9fbff"
        stroke="#05121a"
        strokeWidth={sw * 3}
        paintOrder="stroke"
      >
        180 cm
      </text>
    </g>
  );
}

/**
 * Plivač koji pliva u mestu, glavom ka mlaznici protivstrujnog plivanja.
 * (x, y) je glava na površini; telo leži levo od nje.
 */
export function Swimmer({ x, y, k }: { x: number; y: number; k: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`} opacity={0.9}>
      <g stroke={SUNK} strokeLinecap="round" strokeWidth={0.1}>
        {[0, -0.22].map((delay) => (
          <line
            key={delay}
            className="pl-kick"
            style={{ animationDelay: `${delay}s` }}
            x1={-0.82}
            y1={0.13}
            x2={-1.58}
            y2={0.16}
          />
        ))}
      </g>
      <path
        d="M-0.15 0.03L-0.84 0.07Q-0.91 0.13-0.84 0.19L-0.15 0.23Q-0.09 0.13-0.15 0.03Z"
        fill={BODY}
      />
      <g stroke={BODY} strokeLinecap="round" strokeWidth={0.085}>
        {[0, -0.75].map((delay) => (
          <g key={delay} transform="translate(-0.2 0.09)">
            <line
              className="pl-arm"
              style={{ animationDelay: `${delay}s` }}
              x2={0.56}
            />
          </g>
        ))}
      </g>
      <circle cy={0.04} r={0.12} fill={BODY} />
      <path d="M-0.12 0.04A0.12 0.12 0 0 1 0.12 0.04Z" fill="#ff7a4d" />
      {[0, 1, 2].map((i) => (
        <circle
          key={i}
          className="pl-bubble"
          cx={-1.56 - i * 0.07}
          cy={0.2}
          r={0.03 + i * 0.01}
          fill="#fff"
          fillOpacity={0.7}
          style={
            {
              // u metrima: CSS piksel je ovde jedinica skalirane grupe
              "--pl-rise": 0.2,
              animationDelay: `${i * 0.5}s`,
              animationDuration: "1.4s",
            } as React.CSSProperties
          }
        />
      ))}
    </g>
  );
}
