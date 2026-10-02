import { G, PLINTH, CX, project } from "./geometry";
import type { Ctx } from "./ctx";
import RoofArt from "./Roof";

/** Staklo: noću svetli ili je mračno, danju ogleda nebo. */
function Glass({
  k,
  x,
  y,
  w,
  h,
  lit,
  rx = 1,
}: {
  k: Ctx;
  x: number;
  y: number;
  w: number;
  h: number;
  lit: boolean;
  rx?: number;
}) {
  if (w <= 0 || h <= 0) return null;
  return (
    <>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={rx}
        fill={lit ? "#ffd67d" : "#0c1421"}
      />
      {lit && (
        <rect
          x={x}
          y={y + h * 0.55}
          width={w}
          height={h * 0.45}
          rx={rx}
          fill="#ffb74a"
          opacity={0.35}
        />
      )}
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={rx}
        fill="url(#hs-glass)"
        opacity={1 - k.n * (lit ? 0.95 : 0.8)}
      />
      <path
        d={`M${x + w * 0.12} ${y + h} L${x + w * 0.5} ${y} H${x + w * 0.72} L${x + w * 0.34} ${y + h} Z`}
        fill="#fff"
        opacity={0.2 * (1 - k.n)}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Kuća                                                                */
/* ------------------------------------------------------------------ */

function Chimney({ k }: { k: Ctx }) {
  const r = k.roof;
  if (r.pitch < 0.01) return null;
  const z = r.len * r.ez + 8;
  const x = r.half - r.hip - 34;
  const ridge = r.len * r.eh;
  const [xl, yb] = project(r, x, ridge - 14, z);
  const [xr, yt] = project(r, x + 19, ridge + 24 * r.pitch, z);
  const [cl, ct] = project(r, x - 3, ridge + 28 * r.pitch, z);
  const [cr] = project(r, x + 22, ridge, z);
  return (
    <g opacity={r.pitch}>
      <rect
        x={xl}
        y={yt}
        width={xr - xl}
        height={yb - yt}
        fill={k.c("#a1604a")}
      />
      <rect
        x={xl + (xr - xl) * 0.7}
        y={yt}
        width={(xr - xl) * 0.3}
        height={yb - yt}
        fill="#000"
        opacity={0.14}
      />
      <rect
        x={cl}
        y={ct}
        width={cr - cl}
        height={4.6}
        rx={1}
        fill={k.c("#6f6a66")}
      />
    </g>
  );
}

export function HouseFacade({ k }: { k: Ctx }) {
  const { x0, x1, w, wallTop, wallH, floors, floorH, c, n, slotW } = k;
  const frame = c("#f4f0e6");
  const trim = c("#d8d1c0");

  const ww = Math.max(14, Math.min(34, slotW - 34));
  const wh = Math.min(42, floorH * 0.56);
  const shutters = slotW - ww >= 38;

  const doorW = Math.min(32, slotW - 24);
  const doorH = Math.min(58, floorH * 0.8);
  const doorX = x0 + k.doorSlot * slotW + (slotW - doorW) / 2;
  const doorTop = G - PLINTH - doorH;

  const windows: React.ReactNode[] = [];
  for (let f = 0; f < floors; f++) {
    for (let s = 0; s < k.slots; s++) {
      if (f === 0 && s === k.doorSlot) continue;
      const lit = k.litAt(f, s);
      const balcony = f === 1 && s === k.doorSlot;
      const h = balcony ? floorH * 0.72 : wh;
      const x = x0 + s * slotW + (slotW - ww) / 2;
      const y = balcony
        ? G - f * floorH - h - 3
        : G - f * floorH - floorH * 0.54 - h / 2;
      windows.push(
        <g key={`${f}-${s}`}>
          {lit && (
            <ellipse
              cx={x + ww / 2}
              cy={y + h / 2}
              rx={ww * 1.25}
              ry={h * 1.05}
              fill="url(#hs-warm)"
              opacity={n * 0.85}
            />
          )}
          {shutters && !balcony && (
            <>
              <rect
                x={x - 12}
                y={y - 2}
                width={9}
                height={h + 4}
                rx={1}
                fill={c("#4d6e66")}
              />
              <rect
                x={x + ww + 3}
                y={y - 2}
                width={9}
                height={h + 4}
                rx={1}
                fill={c("#456259")}
              />
              {k.detail &&
                [0.2, 0.4, 0.6, 0.8].map((q) => (
                  <path
                    key={q}
                    d={`M${x - 11} ${y + h * q}h7M${x + ww + 4} ${y + h * q}h7`}
                    stroke={c("#34504a")}
                    strokeWidth={1}
                  />
                ))}
            </>
          )}
          <rect
            x={x - 3}
            y={y - 3}
            width={ww + 6}
            height={h + 6}
            rx={2}
            fill={frame}
          />
          <Glass k={k} x={x} y={y} w={ww} h={h} lit={lit} />
          {lit && (
            <path
              d={`M${x} ${y}h${ww * 0.34}q0 ${h * 0.5} -${ww * 0.34} ${h * 0.78}ZM${x + ww} ${y}h-${ww * 0.34}q0 ${h * 0.5} ${ww * 0.34} ${h * 0.78}Z`}
              fill="#fff1c9"
              opacity={n * 0.55}
            />
          )}
          <path
            d={`M${x + ww / 2} ${y}V${y + h}M${x} ${y + h * (balcony ? 0.36 : 0.5)}H${x + ww}`}
            stroke={frame}
            strokeWidth={2}
          />
          {!balcony && (
            <>
              <rect
                x={x - 6}
                y={y + h + 3}
                width={ww + 12}
                height={3.5}
                rx={1}
                fill={trim}
              />
              <rect
                x={x - 4}
                y={y + h + 6.5}
                width={ww + 8}
                height={2}
                fill="#000"
                opacity={0.18}
              />
            </>
          )}
        </g>,
      );
    }
  }

  const railX = x0 + k.doorSlot * slotW + 5;
  const railW = slotW - 10;
  const railY = G - floorH - 24;

  return (
    <g>
      {/* Drvo iza kuće */}
      <g transform={`translate(${x1 + 84} ${G - 20}) scale(0.92)`}>
        <rect x={-4} y={-52} width={8} height={52} rx={2} fill={c("#6a4a33")} />
        <circle cx={-18} cy={-62} r={24} fill={c("#3c7a46")} />
        <circle cx={16} cy={-58} r={26} fill={c("#357040")} />
        <circle cx={0} cy={-88} r={30} fill={c("#47894f")} />
        <circle cx={-8} cy={-96} r={14} fill={c("#5a9c5c")} opacity={0.7} />
      </g>

      {/* Dimnjak: stoji odmah iza slemena, pa ga krov zaklanja pri dnu */}
      <Chimney k={k} />

      {/* Zid */}
      <rect x={x0} y={wallTop} width={w} height={wallH} fill={c("#ece5d6")} />
      <rect x={x0} y={wallTop} width={w} height={wallH} fill="url(#hs-side)" />
      <rect x={x0} y={wallTop} width={w} height={20} fill="url(#hs-eave)" />
      {Array.from({ length: floors - 1 }, (_, i) => (
        <g key={i}>
          <rect
            x={x0}
            y={G - (i + 1) * floorH - 2}
            width={w}
            height={4}
            fill={trim}
          />
          <rect
            x={x0}
            y={G - (i + 1) * floorH + 2}
            width={w}
            height={3}
            fill="#000"
            opacity={0.12}
          />
        </g>
      ))}
      {/* Sokl */}
      <rect
        x={x0 - 3}
        y={G - PLINTH}
        width={w + 6}
        height={PLINTH}
        fill={c("#8d8a84")}
      />
      <rect
        x={x0 - 3}
        y={G - PLINTH}
        width={w + 6}
        height={1.5}
        fill={c("#a9a6a0")}
      />

      {/* Oluk */}
      <rect
        x={x1 - 9}
        y={wallTop}
        width={4.5}
        height={wallH - PLINTH}
        fill={c("#6b727c")}
      />

      {windows}

      {/* Balkon */}
      {floors >= 2 && (
        <g>
          <rect
            x={railX - 3}
            y={G - floorH - 4}
            width={railW + 6}
            height={5}
            fill={c("#c9c2b2")}
          />
          <rect
            x={railX}
            y={railY}
            width={railW}
            height={2.5}
            rx={1}
            fill={c("#2d323a")}
          />
          {k.detail &&
            Array.from(
              { length: Math.max(2, Math.floor(railW / 6)) },
              (_, i) => (
                <rect
                  key={i}
                  x={
                    railX +
                    1 +
                    (i * (railW - 3)) / (Math.max(2, Math.floor(railW / 6)) - 1)
                  }
                  y={railY + 2}
                  width={1.2}
                  height={18}
                  fill={c("#2d323a")}
                />
              ),
            )}
          {!k.detail && (
            <rect
              x={railX}
              y={railY + 2}
              width={railW}
              height={18}
              fill={c("#2d323a")}
              opacity={0.35}
            />
          )}
        </g>
      )}

      {/* Ulaz */}
      <circle
        cx={doorX + doorW + 12}
        cy={doorTop + 14}
        r={30}
        fill="url(#hs-warm)"
        opacity={n * 0.9}
      />
      <rect
        x={doorX - 3}
        y={doorTop - 3}
        width={doorW + 6}
        height={doorH + 3}
        rx={2}
        fill={frame}
      />
      <rect
        x={doorX}
        y={doorTop}
        width={doorW}
        height={doorH}
        rx={1}
        fill={c("#7b4a2c")}
      />
      <rect
        x={doorX + 4}
        y={doorTop + 5}
        width={doorW - 8}
        height={doorH * 0.3}
        rx={1}
        fill={k.glow("#9fc4e4", "#ffd67d", 0.9)}
        opacity={0.9}
      />
      <rect
        x={doorX + 4}
        y={doorTop + doorH * 0.46}
        width={doorW - 8}
        height={doorH * 0.44}
        rx={1}
        fill="none"
        stroke={c("#5f371f")}
        strokeWidth={1.5}
      />
      <circle
        cx={doorX + doorW - 5}
        cy={doorTop + doorH * 0.56}
        r={1.8}
        fill={c("#e2b64c")}
      />
      {/* Nadstrešnica */}
      <path
        d={`M${doorX - 14} ${doorTop - 6}L${doorX - 6} ${doorTop - 14}H${doorX + doorW + 6}L${doorX + doorW + 14} ${doorTop - 6}Z`}
        fill={c("#9c452d")}
      />
      <rect
        x={doorX - 14}
        y={doorTop - 6}
        width={doorW + 28}
        height={2.5}
        fill={c("#f4f0e6")}
      />
      <rect
        x={doorX - 10}
        y={doorTop - 3.5}
        width={doorW + 20}
        height={5}
        fill="#000"
        opacity={0.16}
      />
      {/* Lampa */}
      <rect
        x={doorX + doorW + 10}
        y={doorTop + 9}
        width={4}
        height={8}
        rx={1}
        fill={k.glow("#3a3f47", "#fff0b8")}
      />
      {/* Stepenice */}
      <rect
        x={doorX - 9}
        y={G - PLINTH}
        width={doorW + 18}
        height={4}
        fill={c("#bdb8ae")}
      />
      <rect
        x={doorX - 15}
        y={G - 4}
        width={doorW + 30}
        height={4}
        fill={c("#aaa59b")}
      />

      {/* Žbunje */}
      <g>
        <circle cx={x0 + 10} cy={G - 6} r={9} fill={c("#3c7a46")} />
        <circle cx={x0 + 22} cy={G - 4} r={7} fill={c("#47894f")} />
        <circle cx={x1 - 24} cy={G - 5} r={8} fill={c("#357040")} />
      </g>

      <RoofArt k={k} material="crep" />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/*  Firma                                                               */
/* ------------------------------------------------------------------ */

export function CompanyFacade({ k }: { k: Ctx }) {
  const { x0, w, wallTop, wallH, floors, floorH, c, n, slotW } = k;
  const BAND = 20;
  const steel = c("#2f3640");
  const bays: React.ReactNode[] = [];

  for (let f = 0; f < floors; f++) {
    const base = G - f * floorH - (f === 0 ? PLINTH : 0);
    const top = G - (f + 1) * floorH + (f === floors - 1 ? BAND + 8 : 8);
    const y = top + 4;
    const h = base - (f === 0 ? 0 : 13) - y;
    for (let s = 0; s < k.slots; s++) {
      const x = x0 + s * slotW + 6;
      const bw = slotW - 12;
      const lit = k.litAt(f, s);
      const door = f === 0 && s === k.doorSlot;
      const dock = f === 0 && k.slots >= 4 && s === k.slots - 1;
      if (dock) {
        bays.push(
          <g key={`${f}-${s}`}>
            <rect
              x={x - 2}
              y={y - 2}
              width={bw + 4}
              height={h + 2}
              fill={steel}
            />
            <rect x={x} y={y} width={bw} height={h} fill={c("#aab2bc")} />
            {Array.from({ length: Math.floor(h / 7) }, (_, i) => (
              <rect
                key={i}
                x={x}
                y={y + 6 + i * 7}
                width={bw}
                height={1.2}
                fill={c("#8a929d")}
              />
            ))}
            <rect x={x} y={y} width={bw} height={5} fill="#000" opacity={0.2} />
          </g>,
        );
        continue;
      }
      bays.push(
        <g key={`${f}-${s}`}>
          {lit && (
            <rect
              x={x - 8}
              y={y - 8}
              width={bw + 16}
              height={h + 16}
              rx={10}
              fill="url(#hs-warm)"
              opacity={n * 0.6}
            />
          )}
          <rect
            x={x - 2}
            y={y - 2}
            width={bw + 4}
            height={h + (f === 0 ? 2 : 4)}
            fill={steel}
          />
          <Glass k={k} x={x} y={y} w={bw} h={h} lit={lit} rx={0} />
          <path
            d={
              door
                ? `M${x + bw / 2} ${y}V${y + h}M${x} ${y + h * 0.22}H${x + bw}`
                : `M${x + bw / 2} ${y}V${y + h}`
            }
            stroke={steel}
            strokeWidth={door ? 2.5 : 1.5}
          />
          {door && (
            <>
              <path
                d={`M${x + bw / 2 - 4} ${y + h * 0.5}v${h * 0.22}M${x + bw / 2 + 4} ${y + h * 0.5}v${h * 0.22}`}
                stroke={c("#dfe4ea")}
                strokeWidth={1.6}
                strokeLinecap="round"
              />
              <rect
                x={x - 10}
                y={y - 8}
                width={bw + 20}
                height={5}
                rx={1}
                fill={steel}
              />
              <rect
                x={x - 6}
                y={y - 3}
                width={bw + 12}
                height={5}
                fill="#000"
                opacity={0.2}
              />
            </>
          )}
        </g>,
      );
    }
  }

  return (
    <g>
      {/* Fasadni paneli */}
      <rect x={x0} y={wallTop} width={w} height={wallH} fill={c("#d3dae2")} />
      <rect x={x0} y={wallTop} width={w} height={wallH} fill="url(#hs-clad)" />
      <rect x={x0} y={wallTop} width={w} height={wallH} fill="url(#hs-side)" />
      {Array.from({ length: floors - 1 }, (_, i) => (
        <rect
          key={i}
          x={x0}
          y={G - (i + 1) * floorH - 1}
          width={w}
          height={2}
          fill={c("#aab3be")}
        />
      ))}
      {/* Atika sa natpisom */}
      <rect x={x0} y={wallTop} width={w} height={BAND} fill={steel} />
      <rect
        x={x0}
        y={wallTop + BAND}
        width={w}
        height={2.5}
        fill={k.glow("#ffc53d", "#ffd977", 0.6)}
      />
      <rect
        x={x0}
        y={wallTop + BAND + 2.5}
        width={w}
        height={8}
        fill="url(#hs-eave)"
      />
      <ellipse
        cx={CX}
        cy={wallTop + BAND / 2}
        rx={70}
        ry={20}
        fill="url(#hs-warm)"
        opacity={n * 0.5}
      />
      <text
        x={CX}
        y={wallTop + BAND / 2 + 3.6}
        textAnchor="middle"
        fontSize={10}
        fontWeight={700}
        letterSpacing={2.4}
        fill={k.glow("#eef2f6", "#fff3c9")}
        style={{ fontFamily: "var(--font-display), sans-serif" }}
      >
        {k.sign ?? "VAŠA FIRMA"}
      </text>
      {/* Sokl */}
      <rect
        x={x0 - 2}
        y={G - PLINTH}
        width={w + 4}
        height={PLINTH}
        fill={c("#4a5059")}
      />

      {bays}

      {/* Krov: ravan sa atikom ili limeni na falc */}
      <RoofArt k={k} material="lim" />
    </g>
  );
}
