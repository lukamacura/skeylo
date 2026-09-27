"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { CustomerType, ExtraId, RoofType, UsageId } from "@/lib/solar";
import {
  clamp01,
  CX,
  G,
  LAND,
  layoutPanels,
  lerp,
  pathOf,
  roofShape,
  rowsFor,
  slotQuad,
  smooth,
  targetDims,
} from "./scene/geometry";
import {
  ambient,
  css,
  mixRgb,
  rgb,
  SKY_SPRING,
  SPRING,
  tri3,
  useSprung,
  type Frame,
} from "./scene/light";
import type { Ctx } from "./scene/ctx";
import { CompanyFacade, HouseFacade } from "./scene/Facades";
import Flow from "./scene/Flow";
import Panels, { panelsPath, type PanelCell } from "./scene/Panels";
import { roofQuad } from "./scene/Roof";
import Sky from "./scene/Sky";

/* ------------------------------------------------------------------ */
/*  Scena: jedan objekat koji se menja sa svakim odgovorom              */
/*  Koordinate su u jedinicama crteža, tlo je na y = G.                 */
/*                                                                      */
/*  Tri stvari vode ceo crtež:                                          */
/*   - mere objekta (širina, visina, dubina, sleme), na oprugama        */
/*   - doba dana t: 0 = dan, 0,5 = zalazak, 1 = noć, takođe na opruzi   */
/*   - kamera, koja sama kadrira objekat: mala kuća ispuni kadar, a     */
/*     kad dobije sprat ili auto u dvorištu, kadar se meko odmakne      */
/*  Geometrija krova i panela je u scene/geometry.ts.                   */
/* ------------------------------------------------------------------ */

/** Najviše panela koje crtamo; ostatak nosi brojka u čipu ispod scene. */
const MAX_DRAWN = 64;
/** Nebo iznad slemena i tlo ispod temelja koje kadar uvek ostavlja. */
const SKY_ROOM = 46;
const GROUND_ROOM = 20;
const MAX_ZOOM = 2;

export interface HouseSceneProps {
  type: CustomerType;
  area: number;
  floors: 1 | 2 | 3;
  roof: RoofType;
  usage: UsageId;
  extras: ExtraId[];
  panels: number;
  /** 0–1: koliko je račun visok; pali prozore i ubrzava tok iz mreže. */
  billLevel: number;
  /** 0–1: koliko je lokacija sunčana. */
  sunLevel: number;
  /** Na rezultatu sviće: energija teče sa krova, ne iz mreže. */
  solved: boolean;
  /** Dok traje obračun: sviće i svetlosni zrak prelazi preko krova. */
  scanning?: boolean;
  /** Visina (px) zaglavlja i čipova koji leže preko scene; crtež ih zaobilazi. */
  topPad?: number;
  bottomPad?: number;
}

/** Korak opruga za mere: ispod desetine piksela, oko ga ne vidi. */
const Q = 0.2;

function HouseScene(props: HouseSceneProps) {
  const { type, area, floors, roof, usage, extras, panels, solved } = props;
  const still = useReducedMotion() ?? false;
  const business = type === "pravno";
  const flat = roof === "ravan";

  const target = useMemo(
    () => targetDims(type, area, floors, roof),
    [type, area, floors, roof],
  );
  const w = useSprung(target.w, still, SPRING, Q);
  const wallH = useSprung(target.wallH, still, SPRING, Q);
  const depth = useSprung(target.depth, still, SPRING, Q);
  const ridge = useSprung(target.ridge, still, SPRING, Q);
  const hip = useSprung(target.hip, still, SPRING, Q);

  // Doba dana prati odgovor o navikama; na rezultatu sviće.
  const timeTarget =
    solved || props.scanning
      ? 0
      : { danju: 0, ravnomerno: 0.5, uvece: 1 }[usage];
  const t = clamp01(useSprung(timeTarget, still, SKY_SPRING, 1 / 96));
  const n = smooth(0.15, 0.78, t);

  const x0 = CX - w / 2;
  const x1 = CX + w / 2;
  const wallTop = G - wallH;
  const shape = roofShape({ w, wallH, depth, ridge, hip }, wallTop);

  // Raspored ide iz ciljnih mera (ne menja se tokom animacije), a položaj
  // iz trenutnih, pa paneli klize zajedno sa krovom umesto da preskaču.
  const rows = rowsFor(flat, business);
  const slots = useMemo(
    () =>
      layoutPanels(
        Math.min(panels, MAX_DRAWN),
        roofShape(target, G - target.wallH),
        flat,
        rows,
      ),
    [panels, target, flat, rows],
  );
  const cells: PanelCell[] = slots
    .map((s) => ({
      key: s.key,
      flat: s.flat,
      order: s.order,
      row: s.row,
      q: slotQuad(shape, s, rows),
    }))
    // zadnji redovi se crtaju prvi, da ih prednji preklope
    .sort((a, b) => b.row - a.row || a.order - b.order);

  /* Kadar: kamera obuhvata objekat, dvorište i stub, pa zumira koliko
     kartica dozvoljava. Sve ulazne mere su na oprugama, pa je i zum mek. */
  const leftRoom = useSprung(
    extras.includes("auto") ? 166 : 30,
    still,
    SPRING,
    Q,
  );
  // pumpa stoji uz zid; kad stigne baterija, pomeri se da joj napravi mesto
  const pumpShift = useSprung(
    extras.includes("baterija") ? 46 : 12,
    still,
    SPRING,
    Q,
  );
  const poleGap = useSprung(business ? 118 : 172, still, SPRING, Q);
  const poleX = x1 + poleGap;

  const holder = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 720, h: 440 });
  useEffect(() => {
    const el = holder.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) =>
      setBox({ w: e.contentRect.width, h: e.contentRect.height }),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const topPad = props.topPad ?? 0;
  const bottomPad = props.bottomPad ?? 0;
  const left = x0 - leftRoom - 14;
  const right = poleX + 36;
  const zoom = Math.max(
    0.2,
    Math.min(
      MAX_ZOOM,
      box.w / (right - left),
      (box.h - topPad - bottomPad) /
        (wallH + shape.rise + GROUND_ROOM + SKY_ROOM),
    ),
  );
  const vbW = box.w / zoom;
  const vbH = box.h / zoom;
  const vbX = (left + right) / 2 - vbW / 2;
  const vbY = G + GROUND_ROOM + bottomPad / zoom - vbH;
  const viewBox = `${vbX.toFixed(2)} ${vbY.toFixed(2)} ${vbW.toFixed(2)} ${vbH.toFixed(2)}`;
  const ks = Math.max(0.6, Math.min(1.25, box.w / 640, box.h / 420));
  const frame: Frame = useMemo(
    () => ({
      w: box.w,
      h: box.h,
      zoom,
      ks,
      top: topPad,
      ground: (G - vbY) * zoom,
      land: (G - LAND - vbY) * zoom,
    }),
    [box.w, box.h, zoom, ks, topPad, vbY],
  );

  const amb = ambient(t);
  const c = (hex: string) => {
    const v = rgb(hex);
    return css([v[0] * amb[0], v[1] * amb[1], v[2] * amb[2]]);
  };
  const glow = (hex: string, lit: string, amount = 1) => {
    const v = rgb(hex);
    return css(
      mixRgb(
        [v[0] * amb[0], v[1] * amb[1], v[2] * amb[2]],
        rgb(lit),
        n * amount,
      ),
    );
  };

  const openings = Math.max(2, Math.round(target.w / (business ? 84 : 80)));
  const k: Ctx = {
    x0,
    x1,
    w,
    wallTop,
    wallH,
    floors,
    floorH: wallH / floors,
    roof: shape,
    slots: openings,
    slotW: w / openings,
    doorSlot: Math.floor(openings / 2),
    n,
    c,
    glow,
    // stabilan pseudo-slučajan redosled paljenja; viši račun = više svetla
    litAt: (f, s) =>
      ((f * 7 + s * 13 + 3) % 10) / 10 < 0.3 + props.billLevel * 0.7,
    detail: zoom > 0.78,
  };

  const flowSpeed = lerp(2.6, 0.9, props.billLevel);

  // Žica: od vrha stuba do ugla fasade, blago ulegnuta.
  const wireEnd = { x: x1 - 2, y: wallTop + 12 };
  const wire = `M ${poleX.toFixed(1)} ${G - 150} Q ${((poleX + wireEnd.x) / 2).toFixed(1)} ${(
    (G - 150 + wireEnd.y) / 2 +
    26
  ).toFixed(1)} ${wireEnd.x.toFixed(1)} ${wireEnd.y.toFixed(1)}`;
  const panelSpring = still
    ? { duration: 0 }
    : { type: "spring" as const, ...SPRING };

  const roofPath = pathOf(roofQuad(shape));
  const bandTop = shape.top - 6;
  const bandH = shape.rise + 12;
  /** Kosa svetlosna traka; pomera se samo preko transform-a. */
  const band = (width: number) =>
    `M0 ${wallTop + 6}L${bandH * 0.4} ${bandTop}h${width}L${width} ${wallTop + 6}Z`;
  const sweepFrom = CX - shape.half - 90;
  const sweepTo = CX + shape.half + 10;

  return (
    <div ref={holder} className="relative h-full w-full">
      {/* Tri sloja: nebo i tok energije se stalno kreću, pa imaju svoje
          platno i ne teraju objekat da se iznova iscrtava. */}
      <Sky
        timeTarget={timeTarget}
        frame={frame}
        sunLevel={props.sunLevel}
        still={still}
      />

      <svg
        viewBox={viewBox}
        className="absolute inset-0 block h-full w-full"
        role="img"
        aria-label={`Ilustracija objekta sa ${panels} solarnih panela`}
      >
        <defs>
          <radialGradient id="hs-warm">
            <stop offset="0" stopColor="#ffcf70" stopOpacity={0.55} />
            <stop offset="1" stopColor="#ffcf70" stopOpacity={0} />
          </radialGradient>
          <linearGradient id="hs-glass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={c("#a9d0f0")} />
            <stop offset="1" stopColor={c("#4f7fb0")} />
          </linearGradient>
          <linearGradient id="hs-side" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity={0.06} />
            <stop offset="0.5" stopColor="#000" stopOpacity={0} />
            <stop offset="1" stopColor="#000" stopOpacity={0.2} />
          </linearGradient>
          <linearGradient id="hs-eave" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#000" stopOpacity={0.34} />
            <stop offset="1" stopColor="#000" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="hs-roofshade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity={0.12} />
            <stop offset="1" stopColor="#000" stopOpacity={0.2} />
          </linearGradient>
          <linearGradient
            id="hs-land"
            gradientUnits="userSpaceOnUse"
            x1={0}
            y1={G - LAND}
            x2={0}
            y2={G}
          >
            <stop
              offset="0"
              stopColor={tri3("#86bd78", "#5b6152", "#15211e", t)}
            />
            <stop
              offset="1"
              stopColor={tri3("#5c9c52", "#3d4a36", "#101b17", t)}
            />
          </linearGradient>
          <linearGradient id="hs-ground" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0"
              stopColor={tri3("#5c9c52", "#3d4a36", "#101b17", t)}
            />
            <stop
              offset="1"
              stopColor={tri3("#2f6b3a", "#1e2a24", "#080c10", t)}
            />
          </linearGradient>
          <pattern
            id="hs-clad"
            patternUnits="userSpaceOnUse"
            width={28}
            height={10}
            x={CX}
          >
            <rect width={1.2} height={10} fill={c("#aab3be")} />
            <rect x={1.2} width={1} height={10} fill={c("#eef1f5")} />
          </pattern>
          {/* Staklo panela: dalji redovi hvataju više neba, pa su svetliji */}
          <linearGradient
            id="hs-pglass"
            gradientUnits="userSpaceOnUse"
            x1={0}
            y1={shape.top}
            x2={0}
            y2={wallTop}
          >
            <stop
              offset="0"
              stopColor={tri3("#3470c4", "#46558f", "#111f40", t)}
            />
            <stop
              offset="1"
              stopColor={tri3("#133a80", "#202c60", "#0a142b", t)}
            />
          </linearGradient>
          <linearGradient
            id="hs-array"
            gradientUnits="userSpaceOnUse"
            x1={CX - shape.half}
            y1={shape.top}
            x2={CX + shape.half}
            y2={wallTop + shape.rise * 0.6}
          >
            <stop offset="0.3" stopColor="#fff" stopOpacity={0} />
            <stop offset="0.47" stopColor="#fff" stopOpacity={0.3 * (1 - n)} />
            <stop offset="0.56" stopColor="#fff" stopOpacity={0.06 * (1 - n)} />
            <stop offset="0.7" stopColor="#fff" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="hs-flatshade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#000" stopOpacity={0.2} />
            <stop offset="1" stopColor="#fff" stopOpacity={0.08} />
          </linearGradient>
          <linearGradient id="hs-scan" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#ffe08a" stopOpacity={0} />
            <stop offset="0.5" stopColor="#fff3c4" stopOpacity={0.75} />
            <stop offset="1" stopColor="#ffe08a" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="hs-sheen" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity={0} />
            <stop offset="0.5" stopColor="#fff" stopOpacity={0.5} />
            <stop offset="1" stopColor="#fff" stopOpacity={0} />
          </linearGradient>
          <clipPath id="hs-roof-clip">
            <path d={roofPath} />
          </clipPath>
          <clipPath id="hs-panels-clip">
            <path d={panelsPath(cells)} />
          </clipPath>
        </defs>

        {/* Brda na horizontu, pa zemljište koje se pruža iza objekta */}
        <g transform={`translate(0 ${-LAND})`}>
          <path
            d={`M-2000 ${G - 50} H0 Q 90 ${G - 96} 210 ${G - 62} T 430 ${G - 74} T 640 ${G - 92} T 720 ${G - 80} H2720 V${G} H-2000 Z`}
            fill={tri3("#6fa98f", "#5b4a6e", "#0d1623", t)}
          />
          <path
            d={`M-2000 ${G - 30} H0 Q 140 ${G - 58} 280 ${G - 30} T 520 ${G - 36} T 720 ${G - 48} H2720 V${G} H-2000 Z`}
            fill={tri3("#4f9160", "#3d3f52", "#0a111a", t)}
          />
        </g>
        <rect
          x={-2000}
          y={G - LAND}
          width={4720}
          height={LAND + 1}
          fill="url(#hs-land)"
        />
        {/* Daleko drveće na ivici zemljišta daje dubinu */}
        {FAR_TREES.map(([x, r]) => (
          <ellipse
            key={x}
            cx={x}
            cy={G - LAND - r * 0.55}
            rx={r * 1.25}
            ry={r}
            fill={tri3("#3f7f52", "#34394a", "#09101a", t)}
          />
        ))}
        <rect
          x={-2000}
          y={G}
          width={4720}
          height={1200}
          fill="url(#hs-ground)"
        />

        {/* Stub i žica ka mreži */}
        <g>
          <rect
            x={poleX - 3}
            y={G - 160}
            width={6}
            height={160}
            fill={c("#5b5148")}
          />
          <rect
            x={poleX - 22}
            y={G - 152}
            width={44}
            height={4}
            rx={2}
            fill={c("#5b5148")}
          />
          <rect
            x={poleX - 16}
            y={G - 136}
            width={32}
            height={4}
            rx={2}
            fill={c("#5b5148")}
          />
          <path d={wire} fill="none" stroke={c("#2f333a")} strokeWidth={1.6} />
        </g>

        {/* Senka objekta i svetlo iz prozora na tlu */}
        <ellipse
          cx={CX}
          cy={G + 7}
          rx={w / 2 + 30}
          ry={8}
          fill="#000"
          opacity={0.3}
        />
        <ellipse
          cx={CX}
          cy={G + 12}
          rx={w / 2 + 10}
          ry={11}
          fill="url(#hs-warm)"
          opacity={n * (0.35 + props.billLevel * 0.5)}
        />

        {/* Električni auto */}
        <AnimatePresence>
          {extras.includes("auto") && (
            <motion.g
              key="auto"
              initial={{ x: -170, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -170, opacity: 0 }}
              transition={{ type: "spring", stiffness: 50, damping: 15 }}
            >
              <g transform={`translate(${x0 - 152} ${G - 46})`}>
                <ellipse
                  cx={55}
                  cy={47}
                  rx={54}
                  ry={4}
                  fill="#000"
                  opacity={0.3}
                />
                <path
                  d="M6 30 Q6 20 18 18 L30 5 Q33 2 38 2 H70 Q76 2 80 6 L92 18 Q104 20 104 30 V36 Q104 40 100 40 H10 Q6 40 6 36 Z"
                  fill={c("#e4e9f0")}
                />
                <path
                  d="M6 31 H104 V36 Q104 40 100 40 H10 Q6 40 6 36 Z"
                  fill={c("#b9c2ce")}
                />
                <path
                  d="M34 8 H52 V18 H26 Z M57 8 H70 Q73 8 75 10 L83 18 H57 Z"
                  fill={c("#35506e")}
                />
                <circle cx={30} cy={40} r={9} fill={c("#1c1f25")} />
                <circle cx={30} cy={40} r={4.5} fill={c("#aab2bd")} />
                <circle cx={82} cy={40} r={9} fill={c("#1c1f25")} />
                <circle cx={82} cy={40} r={4.5} fill={c("#aab2bd")} />
                <rect
                  x={7}
                  y={23}
                  width={5}
                  height={4}
                  rx={2}
                  fill={glow("#d94c3d", "#ff5a48")}
                />
                <rect
                  x={97}
                  y={22}
                  width={6}
                  height={4}
                  rx={2}
                  fill="#3ddc97"
                />
              </g>
            </motion.g>
          )}
        </AnimatePresence>

        {/* Punjač za auto: stub između kuće i auta, kabl ide do priključka */}
        <AnimatePresence>
          {extras.includes("auto") && (
            <motion.g
              key="punjac"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={panelSpring}
            >
              <g transform={`translate(${x0 - 40} ${G - 48})`}>
                <ellipse
                  cx={7}
                  cy={48}
                  rx={12}
                  ry={2.5}
                  fill="#000"
                  opacity={0.28}
                />
                <rect x={4} y={30} width={6} height={18} fill={c("#4b5668")} />
                <rect width={14} height={34} rx={4} fill={c("#eef1f5")} />
                <rect x={10} width={4} height={34} rx={2} fill={c("#cfd6de")} />
                <rect
                  x={2.5}
                  y={4}
                  width={7}
                  height={9}
                  rx={1.5}
                  fill={c("#232b38")}
                />
                <motion.circle
                  cx={6}
                  cy={20}
                  r={2.4}
                  fill="#3ddc97"
                  animate={still ? undefined : { opacity: [1, 0.35, 1] }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </g>
              <motion.path
                d={`M${x0 - 38} ${G - 22} C ${x0 - 42} ${G - 4}, ${x0 - 52} ${G - 6}, ${x0 - 51} ${G - 22}`}
                fill="none"
                stroke="#3ddc97"
                strokeWidth={2}
                strokeLinecap="round"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: still ? 0 : 0.7 }}
              />
            </motion.g>
          )}
        </AnimatePresence>

        {/* Objekat: pri promeni tipa, spratnosti ili broja otvora stara
            fasada se pretopi u novu, umesto da prozori preskoče */}
        <AnimatePresence initial={false}>
          <motion.g
            key={`${type}-${floors}-${openings}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            // stara fasada ostaje puna dok je nova ne prekrije; tako se kroz
            // kuću nikad ne providi nebo
            exit={{
              opacity: 0,
              transition: still
                ? { duration: 0 }
                : { duration: 0.3, delay: 0.3, ease: "easeOut" },
            }}
            transition={{ duration: still ? 0 : 0.45, ease: "easeOut" }}
          >
            {business ? <CompanyFacade k={k} /> : <HouseFacade k={k} />}
          </motion.g>
        </AnimatePresence>

        <Panels
          cells={cells}
          still={still}
          frame={c("#d5dce5")}
          line={tri3("#a9cdf7", "#8a98c8", "#2a3c66", t)}
          detail={k.detail}
        />

        {/* Zrak koji "meri" krov dok traje obračun */}
        <AnimatePresence>
          {props.scanning && !still && (
            <motion.g
              key="scan"
              clipPath="url(#hs-roof-clip)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <motion.path
                d={band(26)}
                fill="url(#hs-scan)"
                initial={{ x: sweepFrom }}
                animate={{ x: [sweepFrom, sweepTo, sweepFrom] }}
                transition={{
                  duration: 2.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.g>
          )}
        </AnimatePresence>

        {/* Odsjaj koji pređe preko panela kad svane */}
        <AnimatePresence>
          {solved && panels > 0 && !still && (
            <motion.g
              key="sheen"
              clipPath="url(#hs-panels-clip)"
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.path
                d={band(46)}
                fill="url(#hs-sheen)"
                initial={{ x: sweepFrom }}
                animate={{ x: sweepTo }}
                transition={{
                  duration: 1.6,
                  delay: 1.1,
                  ease: [0.4, 0, 0.2, 1],
                  repeat: Infinity,
                  repeatDelay: 5.5,
                }}
              />
            </motion.g>
          )}
        </AnimatePresence>

        {/* Baterija */}
        <AnimatePresence>
          {extras.includes("baterija") && (
            <motion.g
              key="bat"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={panelSpring}
            >
              <g transform={`translate(${x1 + 12} ${G - 60})`}>
                <rect width={26} height={60} rx={5} fill={c("#eef1f5")} />
                <rect x={20} width={6} height={60} rx={3} fill={c("#cfd6de")} />
                <rect
                  x={5}
                  y={7}
                  width={13}
                  height={3}
                  rx={1.5}
                  fill={c("#9aa7b8")}
                />
                {[0, 1, 2, 3].map((i) => (
                  <motion.rect
                    key={i}
                    x={5}
                    y={46 - i * 8}
                    width={13}
                    height={5}
                    rx={1.5}
                    fill="#3ddc97"
                    animate={
                      still ? undefined : { opacity: [0.25, 1, 1, 0.25] }
                    }
                    transition={{
                      duration: 2.4,
                      repeat: Infinity,
                      delay: i * 0.3,
                      times: [0, 0.2, 0.8, 1],
                    }}
                  />
                ))}
              </g>
            </motion.g>
          )}
        </AnimatePresence>

        {/* Toplotna pumpa: uz desni zid, pored baterije ako je ima */}
        <AnimatePresence>
          {extras.includes("pumpa") && (
            <motion.g
              key="pumpa"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={panelSpring}
            >
              <g transform={`translate(${x1 + pumpShift} ${G - 38})`}>
                <rect width={40} height={34} rx={4} fill={c("#e3e8ee")} />
                <rect y={26} width={40} height={8} rx={4} fill={c("#c5ccd6")} />
                <circle cx={20} cy={16} r={12} fill={c("#232b38")} />
                <g transform="translate(20 16)">
                  <motion.g
                    animate={still ? undefined : { rotate: 360 }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <path
                      d="M0 -9 V9 M-9 0 H9"
                      stroke={c("#9fb0c8")}
                      strokeWidth={3}
                      strokeLinecap="round"
                    />
                  </motion.g>
                </g>
                <rect x={4} y={34} width={5} height={4} fill={c("#4b5668")} />
                <rect x={31} y={34} width={5} height={4} fill={c("#4b5668")} />
              </g>
            </motion.g>
          )}
        </AnimatePresence>
      </svg>

      <Flow
        timeTarget={timeTarget}
        viewBox={viewBox}
        vbX={vbX}
        vbY={vbY}
        frame={frame}
        sunLevel={props.sunLevel}
        wire={wire}
        solved={solved}
        rays={solved && panels > 0}
        flowSpeed={flowSpeed}
        roofX={CX}
        roofY={shape.top + shape.rise * 0.5}
        spread={shape.half * 1.1}
        treeX={business ? null : x1 + 84}
        still={still}
      />
    </div>
  );
}

export default memo(HouseScene);

/** Daleko drveće: x i veličina. */
const FAR_TREES: [number, number][] = [
  [-60, 9],
  [38, 7],
  [96, 10],
  [118, 7],
  [548, 8],
  [642, 10],
  [700, 7],
  [790, 9],
];
