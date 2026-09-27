import {
  CX,
  halfAt,
  onRoof,
  pathOf,
  project,
  type Pt,
  type Roof,
} from "./geometry";
import type { Ctx } from "./ctx";

/* ------------------------------------------------------------------ */
/*  Krov                                                                */
/*  Crep, lim i ravna ploča crtaju se na istoj krovnoj ravni, kroz istu */
/*  kameru kao paneli: redovi crepa se zbijaju ka slemenu, a spojevi i  */
/*  falcevi ciljaju istu tačku nedogleda kao ivice panela.              */
/* ------------------------------------------------------------------ */

const n1 = (v: number) => v.toFixed(1);
const seg = (a: Pt, b: Pt) =>
  `M${n1(a[0])} ${n1(a[1])}L${n1(b[0])} ${n1(b[1])}`;

/** Prednja krovna ravan: streha levo, sleme levo, sleme desno, streha desno. */
export function roofQuad(r: Roof): [Pt, Pt, Pt, Pt] {
  const top = r.half - r.hip;
  return [
    onRoof(r, -r.half, 0),
    onRoof(r, -top, r.len),
    onRoof(r, top, r.len),
    onRoof(r, r.half, 0),
  ];
}

const COURSES = 12;

/** Redovi crepa: senka ispod svakog reda, svetla ivica na njemu i spojevi. */
function tiles(r: Roof, detail: boolean) {
  const tw = detail ? 9 : 13;
  let shade = "";
  let light = "";
  let joints = "";
  const row = (v: number) => {
    const h = halfAt(r, v);
    return seg(onRoof(r, -h, v), onRoof(r, h, v));
  };
  for (let i = 0; i < COURSES; i++) {
    const v0 = (i / COURSES) * r.len;
    const v1 = ((i + 1) / COURSES) * r.len;
    if (i > 0) {
      shade += row(v0 - 0.9);
      light += row(v0 + 0.9);
    }
    const room = halfAt(r, v1) - 1;
    const off = i % 2 ? 0.5 : 0;
    const from = Math.ceil(-room / tw - off);
    const to = Math.floor(room / tw - off);
    for (let j = from; j <= to; j++) {
      const u = (j + off) * tw;
      joints += seg(onRoof(r, u, v0 + 1.6), onRoof(r, u, v1 - 1));
    }
  }
  return { shade, light, joints };
}

/** Stojeći falcevi lima: svaki ide od strehe do slemena ili do grebena. */
function seams(r: Roof) {
  let dark = "";
  let light = "";
  const step = 14;
  const count = Math.floor((r.half - 2) / step);
  for (let j = -count; j <= count; j++) {
    const u = j * step;
    const over = Math.abs(u) - (r.half - r.hip);
    const v = over > 0 && r.hip > 0 ? r.len * (1 - over / r.hip) : r.len;
    dark += seg(onRoof(r, u, 0), onRoof(r, u, v));
    light += seg(onRoof(r, u + 1.2, 0), onRoof(r, u + 1.2, v));
  }
  return { dark, light };
}

/** Ravan krov viđen odozgo: hidroizolacija, šavovi i atika sa sve četiri strane. */
function FlatTop({ k, quad }: { k: Ctx; quad: string }) {
  const r = k.roof;
  const o = 1 - r.pitch;
  if (o < 0.01) return null;
  const { c } = k;
  const H = 7; // visina atike
  const T = 4.5; // debljina atike
  const b = r.half;
  const inner = b - T;
  const side = (s: number) =>
    pathOf([
      onRoof(r, s * inner, 0, 0),
      onRoof(r, s * inner, r.len - T, 0),
      onRoof(r, s * inner, r.len - T, H),
      onRoof(r, s * inner, 0, H),
    ]);
  const cap =
    pathOf([
      onRoof(r, -b, 0, H),
      onRoof(r, -b, r.len, H),
      onRoof(r, b, r.len, H),
      onRoof(r, b, 0, H),
    ]) +
    pathOf([
      onRoof(r, -inner, T, H),
      onRoof(r, -inner, r.len - T, H),
      onRoof(r, inner, r.len - T, H),
      onRoof(r, inner, T, H),
    ]);
  return (
    <g opacity={o}>
      <path d={quad} fill={c("#8b9198")} />
      <path d={quad} fill="url(#hs-flatshade)" />
      {k.detail && (
        <path
          d={
            [-0.5, 0, 0.5]
              .map((u) => seg(onRoof(r, u * b, T), onRoof(r, u * b, r.len - T)))
              .join("") +
            seg(onRoof(r, -inner, r.len * 0.5), onRoof(r, inner, r.len * 0.5))
          }
          stroke={c("#7b8188")}
          strokeWidth={0.9}
          fill="none"
        />
      )}
      {/* Unutrašnje strane atike: leva je osunčana, desna u senci */}
      <path
        d={pathOf([
          onRoof(r, -inner, r.len - T, 0),
          onRoof(r, inner, r.len - T, 0),
          onRoof(r, inner, r.len - T, H),
          onRoof(r, -inner, r.len - T, H),
        ])}
        fill={c("#b4bac2")}
      />
      <path d={side(-1)} fill={c("#cdd2d9")} />
      <path d={side(1)} fill={c("#989fa8")} />
      <path d={cap} fillRule="evenodd" fill={c("#e6e9ee")} />
      {/* Prednja strana atike, u ravni fasade */}
      <rect
        x={CX - b - 1.5}
        y={r.wallTop - H}
        width={b * 2 + 3}
        height={H + 1}
        rx={1}
        fill={c("#dfe3e8")}
      />
      <rect
        x={CX - b - 1.5}
        y={r.wallTop - H}
        width={b * 2 + 3}
        height={1.4}
        fill={c("#f3f5f8")}
      />
      <rect
        x={CX - b - 1.5}
        y={r.wallTop - 0.5}
        width={b * 2 + 3}
        height={1.5}
        fill="#000"
        opacity={0.2}
      />
    </g>
  );
}

export default function RoofArt({
  k,
  material,
}: {
  k: Ctx;
  material: "crep" | "lim";
}) {
  const r = k.roof;
  const { c } = k;
  const q = roofQuad(r);
  const quad = pathOf(q);
  const [eaveL, ridgeL, ridgeR, eaveR] = q;
  const tile = material === "crep";
  const art = r.pitch > 0.01 ? (tile ? tiles(r, k.detail) : null) : null;
  const metal = r.pitch > 0.01 && !tile ? seams(r) : null;
  const ridgeT = 4.5 * (r.topHalf / Math.max(1, r.half - r.hip));

  return (
    <g>
      <path d={quad} fill={c("#8b9198")} />
      <FlatTop k={k} quad={quad} />
      {r.pitch > 0.01 && (
        <g opacity={r.pitch}>
          {/* Bočne ravni četvorovodnog krova: vide se kao uske trake uz grebene */}
          {r.hip > 0.5 && (
            <>
              <path
                d={pathOf([eaveL, project(r, -r.half, 0, r.depth), ridgeL])}
                fill={c("#8a3d27")}
              />
              <path
                d={pathOf([eaveR, project(r, r.half, 0, r.depth), ridgeR])}
                fill={c("#c96a4d")}
              />
            </>
          )}
          <path d={quad} fill={c(tile ? "#b8573b" : "#77828f")} />
          {art && (
            <>
              <path
                d={art.joints}
                stroke={c("#9a4730")}
                strokeWidth={0.9}
                fill="none"
              />
              <path
                d={art.shade}
                stroke={c("#8c3d28")}
                strokeWidth={1.7}
                fill="none"
              />
              <path
                d={art.light}
                stroke={c("#cf7253")}
                strokeWidth={1.1}
                fill="none"
              />
            </>
          )}
          {metal && (
            <>
              <path
                d={metal.dark}
                stroke={c("#56606c")}
                strokeWidth={1.3}
                fill="none"
              />
              <path
                d={metal.light}
                stroke={c("#94a0ad")}
                strokeWidth={0.9}
                fill="none"
              />
            </>
          )}
          <path d={quad} fill="url(#hs-roofshade)" />
          {/* Grebeni i sleme */}
          {tile && r.hip > 0.5 && (
            <path
              d={seg(eaveL, ridgeL) + seg(eaveR, ridgeR)}
              stroke={c("#7e3421")}
              strokeWidth={3.2}
              strokeLinecap="round"
              fill="none"
            />
          )}
          <rect
            x={ridgeL[0] - 1.5}
            y={r.top - ridgeT * 0.45}
            width={ridgeR[0] - ridgeL[0] + 3}
            height={ridgeT}
            rx={ridgeT / 2}
            fill={c(tile ? "#7e3421" : "#56606c")}
          />
          {/* Čeona daska i oluk */}
          <rect
            x={CX - r.half - 2}
            y={r.wallTop - 3}
            width={r.half * 2 + 4}
            height={tile ? 4.5 : 4}
            rx={1}
            fill={c(tile ? "#f4f0e6" : "#e3e7ec")}
          />
          {tile && (
            <rect
              x={CX - r.half - 3}
              y={r.wallTop + 1.5}
              width={r.half * 2 + 6}
              height={3}
              rx={1.5}
              fill={c("#6b727c")}
            />
          )}
        </g>
      )}
    </g>
  );
}
