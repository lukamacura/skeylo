import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { PHASE_T, T, shotAt } from "./productionTimeline";

/*
 * 3D studio za "Snimanje" (ServicesReel → Production). Sve je nacrtano kodom,
 * bez modela i fotografija: ekipa od četiri čoveka uđe na vrata, upali
 * rasvetu, digne bum mikrofon, klapne klapu, a pogled ode iza kamere A i uđe u
 * njen monitor. Monitor prikazuje pravi kadar kamere (render target), pa je
 * prelaz na "kroz kameru" bez reza. Posle toga ista scena daje kadrove za
 * montažu i oglas (shotAt u productionTimeline). Glavni lik je sve vreme kesa
 * "Tvoja firma" Espresso, ista kao Bag u reelKit-u.
 *
 * frame(t) je čista funkcija vremena: može da se skoči na bilo koji trenutak.
 */

export type Studio = {
  canvas: HTMLCanvasElement;
  /** četiri sličice kadrova za timeline (data URL) */
  thumbs: string[];
  resize(w: number, h: number): void;
  frame(t: number): void;
  owner: number;
};

/* ----------------------------------------------------------------- boje */

const C = {
  stage: 0x0c0b09,
  floor: 0x1c1916,
  wall: 0x171411,
  cyc: 0xa99c8a,
  frame: 0x3b3631,
  plinth: 0xe6dccb,
  wood: 0x3d2a1e,
  bag: 0x2a1c14,
  or: 0xd87928,
  gold: 0xf0b656,
  metal: 0x2b2b2e,
  black: 0x121212,
  bean: 0x4a2c1a,
  cup: 0xf4f1ea,
};
const BAG_CSS = "#2A1C14";
const OR_CSS = "#d87928";

/* -------------------------------------------------------------- pomoćno */

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
const smooth = (x: number) => x * x * (3 - 2 * x);
const inOut = (x: number) =>
  x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const lerpAngle = (a: number, b: number, k: number) => {
  let d = b - a;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return a + d * k;
};

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let x = Math.imul(s ^ (s >>> 15), 1 | s);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

const std = (
  color: number,
  roughness = 0.8,
  extra: THREE.MeshStandardMaterialParameters = {},
) => new THREE.MeshStandardMaterial({ color, roughness, ...extra });

function mesh(
  geo: THREE.BufferGeometry,
  mat: THREE.Material | THREE.Material[],
  cast = true,
  receive = false,
) {
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = cast;
  m.receiveShadow = receive;
  return m;
}

const UP = new THREE.Vector3(0, 1, 0);

/** Šipka (valjak) od tačke a do tačke b. */
function rod(
  a: THREE.Vector3,
  b: THREE.Vector3,
  r: number,
  mat: THREE.Material,
  cast = true,
) {
  const dir = b.clone().sub(a);
  const len = dir.length();
  const m = mesh(new THREE.CylinderGeometry(r, r, len, 8), mat, cast);
  m.position.copy(a).addScaledVector(dir, 0.5);
  m.quaternion.setFromUnitVectors(UP, dir.normalize());
  return m;
}

/** Stativ sa tri noge; glava na visini h. */
function tripod(h: number, spread: number, mat: THREE.Material, turn = 0) {
  const g = new THREE.Group();
  const head = new THREE.Vector3(0, h, 0);
  for (let k = 0; k < 3; k++) {
    const a = turn + (k * Math.PI * 2) / 3;
    g.add(
      rod(
        head,
        new THREE.Vector3(Math.sin(a) * spread, 0, Math.cos(a) * spread),
        0.014,
        mat,
      ),
    );
  }
  return g;
}

function canvasTex(
  w: number,
  h: number,
  draw: (c: CanvasRenderingContext2D) => void,
) {
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  const ctx = cv.getContext("2d")!;
  draw(ctx);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function roundRect(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

/* ------------------------------------------------------------- teksture */

function bagFront(font: string) {
  return canvasTex(512, 768, (c) => {
    const g = c.createLinearGradient(0, 0, 512, 0);
    g.addColorStop(0, "#22160f");
    g.addColorStop(0.45, "#3a281c");
    g.addColorStop(1, "#1e130c");
    c.fillStyle = g;
    c.fillRect(0, 0, 512, 768);
    // var na vrhu
    for (let y = 8; y < 58; y += 7) {
      c.fillStyle = y % 14 ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.25)";
      c.fillRect(0, y, 512, 3);
    }
    // ventil
    c.strokeStyle = "rgba(255,255,255,0.45)";
    c.lineWidth = 5;
    c.beginPath();
    c.arc(392, 132, 15, 0, Math.PI * 2);
    c.stroke();
    // ime firme
    c.fillStyle = "#fff";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.font = `italic 800 70px ${font}`;
    c.fillText("Tvoja firma", 256, 222);
    c.font = `600 22px ui-monospace, Menlo, monospace`;
    c.fillStyle = "rgba(255,255,255,0.6)";
    c.fillText("PRŽIONICA KAFE", 256, 276);
    // etiketa
    roundRect(c, 78, 318, 356, 320, 26);
    c.fillStyle = OR_CSS;
    c.fill();
    c.lineWidth = 7;
    c.strokeStyle = "#1A1A1A";
    c.stroke();
    // zrno
    c.save();
    c.translate(256, 432);
    c.rotate((28 * Math.PI) / 180);
    c.fillStyle = "#fff";
    c.beginPath();
    c.ellipse(0, 0, 44, 62, 0, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = OR_CSS;
    c.lineWidth = 9;
    c.lineCap = "round";
    c.beginPath();
    c.moveTo(0, -52);
    c.bezierCurveTo(-22, -18, 22, 12, 0, 52);
    c.stroke();
    c.restore();
    c.fillStyle = "#1A1A1A";
    c.font = `italic 800 52px ${font}`;
    c.fillText("ESPRESSO", 256, 560);
    c.font = `700 26px ui-monospace, Menlo, monospace`;
    c.fillText("250 g · −15%", 256, 604);
    c.fillStyle = "rgba(255,255,255,0.55)";
    c.font = `600 22px ui-monospace, Menlo, monospace`;
    c.fillText("SVEŽE PRŽENO · NOVI SAD", 256, 700);
  });
}

function bagBack() {
  return canvasTex(256, 384, (c) => {
    c.fillStyle = BAG_CSS;
    c.fillRect(0, 0, 256, 384);
    for (let y = 4; y < 29; y += 4) {
      c.fillStyle = "rgba(255,255,255,0.05)";
      c.fillRect(0, y, 256, 2);
    }
    c.fillStyle = "rgba(255,255,255,0.35)";
    for (let k = 0; k < 6; k++) c.fillRect(48, 150 + k * 22, 160 - k * 14, 6);
  });
}

function slateFace(font: string) {
  return canvasTex(512, 400, (c) => {
    c.fillStyle = "#151515";
    c.fillRect(0, 0, 512, 400);
    c.strokeStyle = "rgba(255,255,255,0.85)";
    c.lineWidth = 5;
    c.strokeRect(14, 14, 484, 372);
    c.beginPath();
    c.moveTo(14, 150);
    c.lineTo(498, 150);
    c.moveTo(14, 268);
    c.lineTo(498, 268);
    c.moveTo(256, 150);
    c.lineTo(256, 386);
    c.stroke();
    c.fillStyle = "#fff";
    c.textBaseline = "middle";
    c.textAlign = "center";
    c.font = `italic 800 64px ${font}`;
    c.fillText("Tvoja firma", 256, 70);
    c.font = `600 22px ui-monospace, Menlo, monospace`;
    c.fillStyle = OR_CSS;
    c.fillText("SKEYLO · REEL 01", 256, 122);
    c.fillStyle = "rgba(255,255,255,0.6)";
    c.fillText("KADAR", 135, 180);
    c.fillText("TAKE", 377, 180);
    c.fillStyle = "#fff";
    c.font = `800 74px ${font}`;
    c.fillText("1", 135, 228);
    c.fillText("3", 377, 228);
    c.fillStyle = "rgba(255,255,255,0.6)";
    c.font = `600 22px ui-monospace, Menlo, monospace`;
    c.fillText("ESPRESSO", 135, 300);
    c.fillText("22.11.", 377, 300);
  });
}

function stripes() {
  const t = canvasTex(256, 32, (c) => {
    c.fillStyle = "#f2f2f2";
    c.fillRect(0, 0, 256, 32);
    c.fillStyle = "#111";
    for (let x = -32; x < 288; x += 48) {
      c.beginPath();
      c.moveTo(x, 32);
      c.lineTo(x + 24, 32);
      c.lineTo(x + 48, 0);
      c.lineTo(x + 24, 0);
      c.closePath();
      c.fill();
    }
  });
  return t;
}

function latte() {
  return canvasTex(256, 256, (c) => {
    const g = c.createRadialGradient(128, 128, 10, 128, 128, 128);
    g.addColorStop(0, "#c9905c");
    g.addColorStop(0.7, "#8a5532");
    g.addColorStop(1, "#4a2a17");
    c.fillStyle = g;
    c.fillRect(0, 0, 256, 256);
    // srce od mleka
    c.fillStyle = "#f6ead8";
    c.beginPath();
    c.moveTo(128, 196);
    c.bezierCurveTo(40, 138, 70, 64, 128, 104);
    c.bezierCurveTo(186, 64, 216, 138, 128, 196);
    c.fill();
  });
}

function softDot() {
  return canvasTex(64, 64, (c) => {
    const g = c.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,255,255,0.9)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = g;
    c.fillRect(0, 0, 64, 64);
  });
}

/* --------------------------------------------------------- lažni zrak */

function beamMat(color: number) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uOpacity: { value: 0 },
    },
    vertexShader: /* glsl */ `
      varying float vY;
      varying vec3 vN;
      varying vec3 vV;
      void main() {
        vY = uv.y;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vV = normalize(-mv.xyz);
        vN = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uOpacity;
      varying float vY;
      varying vec3 vN;
      varying vec3 vV;
      void main() {
        float edge = pow(abs(dot(normalize(vN), normalize(vV))), 2.0);
        float along = pow(vY, 1.6);
        gl_FragColor = vec4(uColor * uOpacity * edge * along, 1.0);
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    toneMapped: false,
  });
}

function beam(
  from: THREE.Vector3,
  to: THREE.Vector3,
  r0: number,
  r1: number,
  color: number,
) {
  const len = from.distanceTo(to);
  const geo = new THREE.CylinderGeometry(r0, r1, len, 28, 1, true);
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, 0, len / 2);
  const mat = beamMat(color);
  const m = new THREE.Mesh(geo, mat);
  m.position.copy(from);
  m.lookAt(to);
  m.renderOrder = 5;
  m.layers.set(1); // samo širi kadar, ne kroz kameru
  return { mesh: m, mat };
}

/* -------------------------------------------------------------- ljudi */

type Limb = { a: THREE.Group; b: THREE.Group };
type Rig = {
  root: THREE.Group;
  pelvis: THREE.Group;
  torso: THREE.Group;
  head: THREE.Group;
  armL: Limb;
  armR: Limb;
  legL: Limb;
  legR: Limb;
};

const HIP_Y = 0.9;

function person(o: {
  shirt: number;
  pants: number;
  skin: number;
  shoes: number;
  hair: number;
  hat?: "cap" | "beanie" | "bun";
  hatColor?: number;
  phones?: boolean;
}): Rig {
  const shirt = std(o.shirt, 0.85);
  const pants = std(o.pants, 0.85);
  const skin = std(o.skin, 0.6);
  const shoes = std(o.shoes, 0.6);
  const hair = std(o.hair, 0.9);
  const dark = std(0x141414, 0.4);

  const root = new THREE.Group();
  const pelvis = new THREE.Group();
  pelvis.position.y = HIP_Y;
  root.add(pelvis);

  const hipMesh = mesh(new THREE.CapsuleGeometry(0.115, 0.1, 4, 10), pants);
  hipMesh.rotation.z = Math.PI / 2;
  hipMesh.scale.set(1, 1, 0.85);
  pelvis.add(hipMesh);

  const torso = new THREE.Group();
  pelvis.add(torso);
  const chest = mesh(new THREE.CapsuleGeometry(0.16, 0.3, 6, 14), shirt);
  chest.position.y = 0.33;
  chest.scale.set(1.15, 1, 0.78);
  torso.add(chest);
  const neck = mesh(new THREE.CylinderGeometry(0.05, 0.055, 0.1, 10), skin);
  neck.position.y = 0.66;
  torso.add(neck);

  const head = new THREE.Group();
  head.position.y = 0.79;
  torso.add(head);
  const skull = mesh(new THREE.SphereGeometry(0.13, 20, 16), skin);
  skull.scale.set(0.95, 1.05, 1);
  head.add(skull);
  for (const s of [-1, 1]) {
    const eye = mesh(new THREE.SphereGeometry(0.014, 8, 6), dark, false);
    eye.position.set(s * 0.045, 0.012, 0.118);
    head.add(eye);
  }
  const hairCap = mesh(
    new THREE.SphereGeometry(0.137, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.55),
    hair,
  );
  hairCap.position.set(0, 0.012, -0.012);
  hairCap.rotation.x = -0.35;
  head.add(hairCap);
  if (o.hat === "cap") {
    const m = std(o.hatColor ?? 0x111111, 0.7);
    const top = mesh(
      new THREE.SphereGeometry(0.142, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2),
      m,
    );
    top.position.y = 0.025;
    head.add(top);
    const brim = mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.012, 16), m);
    brim.scale.set(1, 1, 0.75);
    brim.position.set(0, 0.035, -0.17); // naopako okrenut kačket
    head.add(brim);
  } else if (o.hat === "beanie") {
    const m = std(o.hatColor ?? 0x222222, 0.95);
    const top = mesh(
      new THREE.SphereGeometry(0.145, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2),
      m,
    );
    top.scale.set(1, 1.18, 1);
    top.position.y = 0.02;
    head.add(top);
    const cuff = mesh(new THREE.CylinderGeometry(0.148, 0.148, 0.05, 20), m);
    cuff.position.y = 0.035;
    head.add(cuff);
  } else if (o.hat === "bun") {
    const bun = mesh(new THREE.SphereGeometry(0.06, 12, 10), hair);
    bun.position.set(0, 0.11, -0.09);
    head.add(bun);
  }
  if (o.phones) {
    const band = mesh(
      new THREE.TorusGeometry(0.145, 0.014, 6, 20, Math.PI),
      dark,
    );
    band.position.y = 0.01;
    head.add(band);
    for (const s of [-1, 1]) {
      const cup = mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.035, 14), dark);
      cup.rotation.z = Math.PI / 2;
      cup.position.set(s * 0.14, 0, 0);
      head.add(cup);
    }
  }

  const arm = (side: 1 | -1): Limb => {
    const a = new THREE.Group();
    a.position.set(side * 0.215, 0.56, 0);
    torso.add(a);
    const up = mesh(new THREE.CapsuleGeometry(0.052, 0.18, 4, 10), shirt);
    up.position.y = -0.14;
    a.add(up);
    const b = new THREE.Group();
    b.position.y = -0.28;
    a.add(b);
    const fore = mesh(new THREE.CapsuleGeometry(0.045, 0.18, 4, 10), skin);
    fore.position.y = -0.135;
    b.add(fore);
    const hand = mesh(new THREE.SphereGeometry(0.05, 10, 8), skin);
    hand.position.y = -0.29;
    b.add(hand);
    return { a, b };
  };
  const leg = (side: 1 | -1): Limb => {
    const a = new THREE.Group();
    a.position.set(side * 0.095, 0, 0);
    pelvis.add(a);
    const thigh = mesh(new THREE.CapsuleGeometry(0.07, 0.3, 4, 10), pants);
    thigh.position.y = -0.22;
    a.add(thigh);
    const b = new THREE.Group();
    b.position.y = -0.44;
    a.add(b);
    const shin = mesh(new THREE.CapsuleGeometry(0.06, 0.3, 4, 10), pants);
    shin.position.y = -0.21;
    b.add(shin);
    const foot = mesh(new THREE.BoxGeometry(0.11, 0.06, 0.23), shoes);
    foot.position.set(0, -0.43, 0.045);
    b.add(foot);
    return { a, b };
  };

  return {
    root,
    pelvis,
    torso,
    head,
    armL: arm(1),
    armR: arm(-1),
    legL: leg(1),
    legR: leg(-1),
  };
}

/** Uglovi zglobova; ruke vise niz telo kad je sve 0. */
type Pose = {
  shL: number;
  shR: number;
  shLz: number;
  shRz: number;
  elL: number;
  elR: number;
  lean: number;
  headX: number;
  headY: number;
};

const REST: Pose = {
  shL: 0.05,
  shR: 0.05,
  shLz: 0.12,
  shRz: -0.12,
  elL: -0.18,
  elR: -0.18,
  lean: 0,
  headX: 0,
  headY: 0,
};

function mixPose(a: Pose, b: Partial<Pose>, k: number): Pose {
  const out = { ...a };
  for (const key of Object.keys(b) as (keyof Pose)[]) {
    out[key] = lerp(a[key], b[key] as number, k);
  }
  return out;
}

type Trip = { path: [number, number][]; start: number; dur: number };

/** Gde je čovek na putanji i koliko "hoda" (0..1). */
function travel(trips: Trip[], t: number) {
  let trip = trips[0];
  for (const tr of trips) if (t >= tr.start) trip = tr;
  const pts = trip.path;
  const lens: number[] = [];
  let L = 0;
  for (let k = 1; k < pts.length; k++) {
    const d = Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]);
    lens.push(d);
    L += d;
  }
  const u = seg(t, trip.start, trip.start + trip.dur);
  const s = L * (u - (0.6 * Math.sin(Math.PI * 2 * u)) / (Math.PI * 2));
  const at = (dist: number) => {
    let d = Math.max(0, Math.min(L, dist));
    for (let k = 0; k < lens.length; k++) {
      if (d <= lens[k] || k === lens.length - 1) {
        const f = lens[k] ? Math.min(1, d / lens[k]) : 0;
        return [
          lerp(pts[k][0], pts[k + 1][0], f),
          lerp(pts[k][1], pts[k + 1][1], f),
        ];
      }
      d -= lens[k];
    }
    return pts[pts.length - 1];
  };
  const p = at(s);
  let q = at(s + 0.45);
  if (Math.hypot(q[0] - p[0], q[1] - p[1]) < 0.05) {
    const n = pts.length;
    q = [
      p[0] + (pts[n - 1][0] - pts[n - 2][0]),
      p[1] + (pts[n - 1][1] - pts[n - 2][1]),
    ];
  }
  const yaw = Math.atan2(q[0] - p[0], q[1] - p[1]);
  const walking = u > 0 && u < 1 ? Math.min(1, u / 0.06, (1 - u) / 0.12) : 0;
  return {
    x: p[0],
    z: p[1],
    yaw,
    s,
    walking,
    arrive: trip.start + trip.dur,
    first: trips[0].start,
  };
}

function applyRig(
  r: Rig,
  x: number,
  z: number,
  yaw: number,
  pose: Pose,
  walk: number,
  phase: number,
) {
  r.root.position.set(x, 0, z);
  r.root.rotation.y = yaw;
  const sw = Math.sin(phase);
  const legA = 0.5 * walk;
  r.legL.a.rotation.x = -legA * sw;
  r.legR.a.rotation.x = legA * sw;
  r.legL.b.rotation.x =
    0.75 * walk * Math.pow(Math.max(0, Math.cos(phase)), 1.5);
  r.legR.b.rotation.x =
    0.75 * walk * Math.pow(Math.max(0, -Math.cos(phase)), 1.5);
  r.pelvis.position.y =
    HIP_Y - 0.02 * walk + 0.025 * walk * Math.cos(2 * phase);
  r.torso.rotation.y = 0.09 * walk * sw;
  r.torso.rotation.x = pose.lean + 0.04 * walk;
  const armA = 0.42 * walk;
  r.armL.a.rotation.x = pose.shL + armA * sw;
  r.armR.a.rotation.x = pose.shR - armA * sw;
  r.armL.a.rotation.z = pose.shLz;
  r.armR.a.rotation.z = pose.shRz;
  r.armL.b.rotation.x = pose.elL - 0.25 * walk;
  r.armR.b.rotation.x = pose.elR - 0.25 * walk;
  r.head.rotation.x = pose.headX;
  r.head.rotation.y = pose.headY;
}

/* ------------------------------------------------------------- kadrovi */

const BAG_C = new THREE.Vector3(0, 1.1, 0);

/** Kamera za kadar i u trenutku tau (sekunde od početka kadra). */
function setShot(cam: THREE.PerspectiveCamera, i: number, tau: number) {
  const look = new THREE.Vector3();
  if (i === 0) {
    // kamera A: isti kadar koji se vidi na monitoru, polako prilazi
    cam.position.set(0, 1.12, 2.25 - 0.03 * tau);
    look.set(0, 1.09, 0);
    cam.fov = Math.max(15.5, 17 - 0.4 * tau);
  } else if (i === 1) {
    // krupan kadar etikete, nisko, kruži
    const a = -0.3 + 0.12 * tau;
    cam.position.set(Math.sin(a) * 0.88, 1.04 + 0.03 * tau, Math.cos(a) * 0.88);
    look.set(0, 1.14, 0.07);
    cam.fov = 32;
  } else if (i === 2) {
    // zrna padaju, kamera klizi
    cam.position.set(0.42 - 0.24 * tau, 1.12, 0.95);
    look.set(0.06 - 0.06 * tau, 1.08, 0);
    cam.fov = 30;
  } else {
    // odozgo: kesa, šolja, para
    const a = 0.55 + 0.1 * tau;
    cam.position.set(Math.sin(a) * 0.95, 1.78 - 0.04 * tau, Math.cos(a) * 0.95);
    look.set(0.08, 0.98, 0.05);
    cam.fov = 34;
  }
  cam.updateProjectionMatrix();
  cam.lookAt(look);
}

/* ---------------------------------------------------------------- scena */

export async function createStudio(): Promise<Studio | null> {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });
  } catch {
    return null;
  }
  if (!renderer.getContext()) return null;

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.shadowMap.autoUpdate = false;
  const canvas = renderer.domElement;
  canvas.style.display = "block";
  canvas.style.width = "100%";
  canvas.style.height = "100%";

  const family =
    getComputedStyle(document.documentElement)
      .getPropertyValue("--font-display")
      .trim() || "sans-serif";
  try {
    await Promise.race([
      document.fonts.load(`italic 800 64px ${family}`),
      new Promise((r) => setTimeout(r, 1200)),
    ]);
  } catch {
    /* font nije presudan */
  }
  const font = `${family}, ui-sans-serif, system-ui, sans-serif`;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(C.stage);
  scene.fog = new THREE.Fog(C.stage, 11, 22);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();

  /* ------------------------------------------------------------ prostor */

  const floor = mesh(
    new THREE.PlaneGeometry(40, 40),
    std(C.floor, 0.5),
    false,
    true,
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.003;
  scene.add(floor);

  // ciklorama: pod, zaobljenje, zid, jedan komad
  {
    const prof: [number, number][] = [];
    const R = 1.2;
    const zc = -2.0;
    prof.push([1.3, 0]);
    for (let k = 0; k <= 14; k++) {
      const a = (k / 14) * (Math.PI / 2);
      prof.push([zc - R * Math.sin(a), R - R * Math.cos(a)]);
    }
    prof.push([zc - R, 5.5]);
    const xs = [-4.2, 4.8];
    const nx = 24;
    const pos: number[] = [];
    const idx: number[] = [];
    for (let j = 0; j < prof.length; j++) {
      for (let i = 0; i <= nx; i++) {
        pos.push(lerp(xs[0], xs[1], i / nx), prof[j][1], prof[j][0]);
      }
    }
    const row = nx + 1;
    for (let j = 0; j < prof.length - 1; j++) {
      for (let i = 0; i < nx; i++) {
        const a = j * row + i;
        const b = a + 1;
        const c = a + row;
        const d = c + 1;
        idx.push(a, b, c, b, d, c);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    const cyc = mesh(geo, std(C.cyc, 0.92), false, true);
    scene.add(cyc);
  }

  // levi zid sa vratima
  const wallMat = std(C.wall, 0.95);
  const wallPiece = (zA: number, zB: number, yA: number, yB: number) => {
    const m = mesh(
      new THREE.PlaneGeometry(zB - zA, yB - yA),
      wallMat,
      false,
      true,
    );
    m.rotation.y = Math.PI / 2;
    m.position.set(-4.2, (yA + yB) / 2, (zA + zB) / 2);
    scene.add(m);
  };
  wallPiece(-3.3, 0.4, 0, 5.5);
  wallPiece(1.6, 9, 0, 5.5);
  wallPiece(0.4, 1.6, 2.3, 5.5);
  const frameMat = std(C.frame, 0.6);
  for (const z of [0.38, 1.62]) {
    const j = mesh(new THREE.BoxGeometry(0.14, 2.34, 0.05), frameMat);
    j.position.set(-4.2, 1.17, z);
    scene.add(j);
  }
  {
    const h = mesh(new THREE.BoxGeometry(0.14, 0.05, 1.29), frameMat);
    h.position.set(-4.2, 2.32, 1.0);
    scene.add(h);
  }
  const corridorMat = new THREE.MeshBasicMaterial({ color: 0xfff0dc });
  const corridor = new THREE.Mesh(
    new THREE.PlaneGeometry(1.4, 2.4),
    corridorMat,
  );
  corridor.rotation.y = Math.PI / 2;
  corridor.position.set(-4.7, 1.15, 1.0);
  scene.add(corridor);
  const doorPivot = new THREE.Group();
  doorPivot.position.set(-4.19, 0, 0.4);
  scene.add(doorPivot);
  {
    const leaf = mesh(
      new THREE.BoxGeometry(0.045, 2.3, 1.2),
      std(0x2c2824, 0.7),
    );
    leaf.position.set(0, 1.15, 0.6);
    doorPivot.add(leaf);
    const bar = mesh(
      new THREE.BoxGeometry(0.04, 0.04, 0.8),
      std(0x8b8580, 0.3, { metalness: 0.7 }),
    );
    bar.position.set(0.05, 1.05, 0.62);
    doorPivot.add(bar);
  }
  const spill = new THREE.SpotLight(0xffe2b8, 0, 0, 0.6, 0.6, 2);
  spill.position.set(-5.6, 2.2, 1.0);
  spill.target.position.set(-2.4, 0, 1.3);
  scene.add(spill, spill.target);

  // trake na podu i kablovi
  const tapeMat = std(C.or, 0.7);
  const tape = (x: number, z: number) => {
    for (const r of [0.6, -0.6]) {
      const m = mesh(
        new THREE.BoxGeometry(0.26, 0.004, 0.04),
        tapeMat,
        false,
        true,
      );
      m.position.set(x, 0.002, z);
      m.rotation.y = r;
      scene.add(m);
    }
  };
  tape(0, 1.35);
  tape(-0.66, 3.08);
  const cableMat = std(0x0d0c0b, 0.5);
  const cable = (pts: [number, number][]) => {
    const curve = new THREE.CatmullRomCurve3(
      pts.map(([x, z]) => new THREE.Vector3(x, 0.012, z)),
    );
    scene.add(
      mesh(new THREE.TubeGeometry(curve, 40, 0.012, 5), cableMat, false, true),
    );
  };
  cable([
    [-1.55, 1.35],
    [-2.3, 2.2],
    [-3.2, 2.4],
    [-4.1, 3.4],
  ]);
  cable([
    [0.05, 2.6],
    [0.9, 3.4],
    [2.2, 3.6],
    [3.6, 4.6],
  ]);
  cable([
    [1.45, -1.35],
    [2.4, -0.6],
    [3.2, 0.9],
    [4.6, 1.4],
  ]);

  /* ------------------------------------------------------------- postolje */

  const TOP = 0.88;
  {
    const p = mesh(
      new THREE.CylinderGeometry(0.5, 0.5, 0.86, 48),
      std(C.plinth, 0.65),
      true,
      true,
    );
    p.position.y = 0.43;
    scene.add(p);
    const w = mesh(
      new THREE.CylinderGeometry(0.44, 0.44, 0.02, 48),
      std(C.wood, 0.5),
      true,
      true,
    );
    w.position.y = 0.87;
    scene.add(w);
  }

  // kesa
  const bag = new THREE.Group();
  bag.position.set(0, TOP, 0);
  scene.add(bag);
  {
    const W = 0.3;
    const H = 0.44;
    const D = 0.125;
    const geo = new THREE.BoxGeometry(W, H, D, 10, 24, 6);
    geo.translate(0, H / 2, 0);
    const p = geo.attributes.position as THREE.BufferAttribute;
    for (let k = 0; k < p.count; k++) {
      const x = p.getX(k);
      const y = p.getY(k);
      let z = p.getZ(k);
      const v = y / H;
      const flat = lerp(1, 0.11, smooth(seg(v, 0.5, 0.97)));
      const gusset = 1 + 0.18 * (1 - smooth(seg(v, 0, 0.2)));
      const xn = (2 * x) / W;
      const pillow = 1 + 0.22 * (1 - xn * xn) * (1 - smooth(seg(v, 0.55, 1)));
      z *= flat * gusset * pillow;
      p.setXYZ(k, x * (1 - 0.03 * smooth(seg(v, 0.8, 1))), y, z);
    }
    geo.computeVertexNormals();
    const side = std(C.bag, 0.45, { metalness: 0.05 });
    const front = std(0xffffff, 0.42, { map: bagFront(font), metalness: 0.05 });
    const back = std(0xffffff, 0.45, { map: bagBack(), metalness: 0.05 });
    bag.add(mesh(geo, [side, side, side, side, front, back], true, true));
    const seal = mesh(
      new THREE.BoxGeometry(W * 0.985, 0.035, 0.016),
      std(0x24170f, 0.5),
    );
    seal.position.y = H - 0.012;
    bag.add(seal);
  }

  // šolja sa srcem od mleka
  const cupG = new THREE.Group();
  cupG.position.set(0.31, TOP, 0.17);
  scene.add(cupG);
  {
    const white = std(C.cup, 0.22);
    const saucer = mesh(
      new THREE.LatheGeometry(
        [
          [0, 0],
          [0.07, 0.002],
          [0.085, 0.012],
          [0.082, 0.015],
          [0.03, 0.007],
          [0, 0.007],
        ].map(([x, y]) => new THREE.Vector2(x, y)),
        32,
      ),
      white,
      true,
      true,
    );
    cupG.add(saucer);
    const cup = mesh(
      new THREE.LatheGeometry(
        [
          [0, 0.008],
          [0.032, 0.008],
          [0.038, 0.014],
          [0.046, 0.05],
          [0.052, 0.088],
          [0.049, 0.09],
          [0.045, 0.06],
          [0.035, 0.022],
          [0, 0.02],
        ].map(([x, y]) => new THREE.Vector2(x, y)),
        32,
      ),
      white,
    );
    cupG.add(cup);
    const handle = mesh(
      new THREE.TorusGeometry(0.022, 0.006, 8, 16, Math.PI * 1.2),
      white,
    );
    handle.position.set(0.055, 0.055, 0);
    handle.rotation.z = -Math.PI * 0.6;
    cupG.add(handle);
    const surface = new THREE.Mesh(
      new THREE.CircleGeometry(0.046, 32),
      std(0xffffff, 0.3, { map: latte() }),
    );
    surface.rotation.x = -Math.PI / 2;
    surface.rotation.z = 0.4;
    surface.position.y = 0.078;
    cupG.add(surface);
  }
  const steamMat = new THREE.SpriteMaterial({
    map: softDot(),
    color: 0xffffff,
    transparent: true,
    depthWrite: false,
    opacity: 0,
  });
  const steam = Array.from({ length: 4 }, () => {
    const s = new THREE.Sprite(steamMat.clone());
    scene.add(s);
    return s;
  });

  // zrna
  const beanGeo = new THREE.SphereGeometry(1, 12, 9);
  {
    const p = beanGeo.attributes.position as THREE.BufferAttribute;
    for (let k = 0; k < p.count; k++) {
      const x = p.getX(k);
      const y = p.getY(k);
      if (y > 0) p.setY(k, y - 0.45 * y * Math.exp(-(x * x) / 0.03));
    }
    beanGeo.computeVertexNormals();
  }
  const beanMat = std(C.bean, 0.42);
  const rand = rng(7);
  const restBeans: THREE.Matrix4[] = [];
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const sv = new THREE.Vector3(0.017, 0.011, 0.024);
  while (restBeans.length < 28) {
    const a = rand() * Math.PI * 2;
    const r = 0.21 + rand() * 0.2;
    const x = Math.sin(a) * r;
    const z = Math.cos(a) * r;
    if (Math.hypot(x - 0.31, z - 0.17) < 0.11) continue;
    e.set(rand() * 0.3, rand() * Math.PI * 2, rand() * 0.3);
    q.setFromEuler(e);
    restBeans.push(
      new THREE.Matrix4().compose(new THREE.Vector3(x, TOP + 0.008, z), q, sv),
    );
  }
  {
    const inst = new THREE.InstancedMesh(beanGeo, beanMat, restBeans.length);
    restBeans.forEach((mm, k) => inst.setMatrixAt(k, mm));
    inst.castShadow = true;
    scene.add(inst);
  }
  const FALL = 16;
  const falling = new THREE.InstancedMesh(beanGeo, beanMat, FALL);
  falling.castShadow = true;
  falling.visible = false;
  scene.add(falling);
  const fallSeed = Array.from({ length: FALL }, () => ({
    x: -0.16 + rand() * 0.34,
    z: 0.16 + rand() * 0.16,
    t0: rand() * 1.1,
    spin: 4 + rand() * 6,
    rot: rand() * Math.PI * 2,
  }));

  /* -------------------------------------------------------------- oprema */

  const metal = std(C.metal, 0.4, { metalness: 0.6 });
  const black = std(C.black, 0.55);
  const fabric = std(0x111010, 0.95, { side: THREE.DoubleSide });

  // softbox (ključno svetlo)
  const KEY_AT = new THREE.Vector3(-1.55, 1.95, 1.35);
  {
    const st = tripod(0.85, 0.36, metal, 0.3);
    st.position.set(KEY_AT.x, 0, KEY_AT.z);
    scene.add(st);
    scene.add(
      rod(
        new THREE.Vector3(KEY_AT.x, 0.85, KEY_AT.z),
        KEY_AT.clone().setY(1.86),
        0.016,
        metal,
      ),
    );
  }
  const keyFace = std(0x111111, 0.9, {
    emissive: 0xfff1de,
    emissiveIntensity: 0,
  });
  {
    const box = new THREE.Group();
    box.position.copy(KEY_AT);
    box.lookAt(BAG_C);
    const shell = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.12, 0.42, 4, 1, true),
      fabric,
    );
    shell.geometry.rotateX(Math.PI / 2);
    shell.rotation.z = Math.PI / 4;
    box.add(shell);
    const face = new THREE.Mesh(new THREE.PlaneGeometry(0.59, 0.59), keyFace);
    face.position.z = 0.212;
    box.add(face);
    const head = mesh(new THREE.BoxGeometry(0.16, 0.16, 0.14), black);
    head.position.z = -0.27;
    box.add(head);
    scene.add(box);
  }
  const key = new THREE.SpotLight(0xfff1e0, 0, 0, 0.62, 1, 2);
  key.position.copy(KEY_AT).lerp(BAG_C, 0.12);
  key.target.position.copy(BAG_C);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.near = 0.3;
  key.shadow.camera.far = 9;
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.02;
  scene.add(key, key.target);
  const keyBeam = beam(
    key.position,
    BAG_C.clone().setY(0.9),
    0.26,
    0.75,
    0xfff0dc,
  );
  scene.add(keyBeam.mesh);

  // fresnel (kontra)
  const RIM_AT = new THREE.Vector3(1.5, 2.15, -1.4);
  {
    const st = tripod(0.85, 0.34, metal, 1.1);
    st.position.set(RIM_AT.x, 0, RIM_AT.z);
    scene.add(st);
    scene.add(
      rod(
        new THREE.Vector3(RIM_AT.x, 0.85, RIM_AT.z),
        RIM_AT.clone().setY(2.05),
        0.016,
        metal,
      ),
    );
  }
  const rimLens = std(0x111111, 0.3, {
    emissive: 0xfff3e0,
    emissiveIntensity: 0,
  });
  {
    const lamp = new THREE.Group();
    lamp.position.copy(RIM_AT);
    lamp.lookAt(BAG_C);
    const body = mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.26, 18), black);
    body.rotation.x = Math.PI / 2;
    lamp.add(body);
    const lens = new THREE.Mesh(new THREE.CircleGeometry(0.1, 24), rimLens);
    lens.position.z = 0.132;
    lamp.add(lens);
    for (let k = 0; k < 4; k++) {
      const door = mesh(new THREE.PlaneGeometry(0.2, 0.1), fabric);
      const a = (k * Math.PI) / 2;
      door.position.set(Math.sin(a) * 0.15, Math.cos(a) * 0.15, 0.17);
      door.rotation.z = -a;
      door.rotateX(-0.6);
      lamp.add(door);
    }
    scene.add(lamp);
  }
  const rim = new THREE.SpotLight(0xfff0dc, 0, 0, 0.34, 0.7, 2);
  rim.position.copy(RIM_AT);
  rim.target.position.copy(BAG_C);
  scene.add(rim, rim.target);
  const rimBeam = beam(
    RIM_AT.clone().lerp(BAG_C, 0.06),
    BAG_C,
    0.09,
    0.42,
    0xfff0dc,
  );
  scene.add(rimBeam.mesh);

  // pozadinsko svetlo sa narandžastim filterom
  {
    const unit = mesh(new THREE.BoxGeometry(0.3, 0.16, 0.18), black);
    unit.position.set(0, 0.1, -1.25);
    unit.rotation.x = -0.5;
    scene.add(unit);
  }
  const wash = new THREE.SpotLight(0xff8a3d, 0, 0, 0.8, 1, 2);
  wash.position.set(0, 0.25, -1.2);
  wash.target.position.set(0, 1.9, -3.2);
  scene.add(wash, wash.target);

  // svetlo koje je upaljeno od početka: samo kesa
  const pin = new THREE.SpotLight(0xffe6c4, 40, 0, 0.12, 0.5, 2);
  pin.position.set(0.25, 4.6, 0.75);
  pin.target.position.set(0, TOP, 0);
  pin.castShadow = true;
  pin.shadow.mapSize.set(512, 512);
  pin.shadow.bias = -0.0005;
  pin.shadow.normalBias = 0.02;
  scene.add(pin, pin.target);
  const pinBeam = beam(
    pin.position,
    new THREE.Vector3(0, TOP, 0),
    0.03,
    0.34,
    0xffe6c4,
  );
  scene.add(pinBeam.mesh);

  const hemi = new THREE.HemisphereLight(0xfff4e6, 0x1a1410, 0.12);
  scene.add(hemi);
  const fill = new THREE.PointLight(0xffe7cc, 0, 0, 2);
  fill.position.set(0.8, 1.6, 2.0);
  scene.add(fill);

  // kamera A na stativu, sa monitorom
  const CAM_A = new THREE.Vector3(0, 0, 2.6);
  const MON = new THREE.Vector3(0, 1.34, 2.816);
  const MON_W = 0.24;
  const MON_H = (MON_W * 12) / 17;
  const tallyMat = std(0x220000, 0.4, {
    emissive: 0xff2a1a,
    emissiveIntensity: 0,
  });
  {
    const st = tripod(0.98, 0.42, metal, 0.5);
    st.position.copy(CAM_A);
    scene.add(st);
    const head = mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.08, 14), black);
    head.position.set(0, 1.0, 2.6);
    scene.add(head);
    const body = mesh(
      new THREE.BoxGeometry(0.15, 0.15, 0.3),
      std(0x1b1b1d, 0.4),
    );
    body.position.set(0, 1.12, 2.6);
    scene.add(body);
    const lens = mesh(new THREE.CylinderGeometry(0.055, 0.06, 0.2, 20), black);
    lens.rotation.x = Math.PI / 2;
    lens.position.set(0, 1.12, 2.35);
    scene.add(lens);
    const hood = mesh(
      new THREE.CylinderGeometry(0.075, 0.06, 0.05, 20, 1, true),
      std(0x0b0b0b, 0.6, { side: THREE.DoubleSide }),
    );
    hood.rotation.x = Math.PI / 2;
    hood.position.set(0, 1.12, 2.235);
    scene.add(hood);
    const handle = mesh(new THREE.BoxGeometry(0.03, 0.03, 0.2), black);
    handle.position.set(0, 1.225, 2.6);
    scene.add(handle);
    const shotgun = mesh(
      new THREE.CylinderGeometry(0.014, 0.014, 0.2, 10),
      std(0x3a3835, 1),
    );
    shotgun.rotation.x = Math.PI / 2;
    shotgun.position.set(0.045, 1.25, 2.52);
    scene.add(shotgun);
    const tally = mesh(new THREE.SphereGeometry(0.012, 8, 6), tallyMat, false);
    tally.position.set(0.05, 1.2, 2.449);
    scene.add(tally);
    // ručka za panoramu, ka snimatelju
    scene.add(
      rod(
        new THREE.Vector3(0, 1.0, 2.62),
        new THREE.Vector3(-0.38, 0.95, 2.92),
        0.012,
        metal,
      ),
    );
    // monitor
    scene.add(
      rod(
        new THREE.Vector3(0, 1.2, 2.72),
        new THREE.Vector3(0, 1.27, 2.8),
        0.01,
        metal,
      ),
    );
    const bezel = mesh(
      new THREE.BoxGeometry(MON_W + 0.024, MON_H + 0.024, 0.026),
      std(0x161616, 0.5),
    );
    bezel.position.copy(MON).setZ(MON.z - 0.014);
    scene.add(bezel);
    const dot = mesh(new THREE.SphereGeometry(0.006, 8, 6), tallyMat, false);
    dot.position.set(
      MON_W / 2 - 0.004,
      MON.y + MON_H / 2 + 0.004,
      MON.z + 0.001,
    );
    scene.add(dot);
  }
  const rt = new THREE.WebGLRenderTarget(544, 384, {
    type: THREE.HalfFloatType,
    samples: 4,
  });
  const screenOff = new THREE.MeshBasicMaterial({ color: 0x050607 });
  const screenOn = new THREE.MeshBasicMaterial({ map: rt.texture });
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(MON_W, MON_H),
    screenOff,
  );
  screen.position.copy(MON);
  scene.add(screen);

  // kamera B na slajderu
  const SL_A = new THREE.Vector3(1.45, 0.78, 1.95);
  const SL_B = new THREE.Vector3(2.15, 0.78, 1.3);
  for (const p of [SL_A, SL_B]) {
    const st = tripod(0.76, 0.22, metal, 0.9);
    st.position.set(p.x, 0, p.z);
    scene.add(st);
  }
  scene.add(rod(SL_A, SL_B, 0.02, metal));
  const camB = new THREE.Group();
  scene.add(camB);
  {
    const b = mesh(new THREE.BoxGeometry(0.11, 0.1, 0.18), std(0x1b1b1d, 0.4));
    camB.add(b);
    const l = mesh(new THREE.CylinderGeometry(0.04, 0.045, 0.12, 16), black);
    l.rotation.x = Math.PI / 2;
    l.position.z = 0.14;
    camB.add(l);
    const tl = mesh(new THREE.SphereGeometry(0.01, 8, 6), tallyMat, false);
    tl.position.set(0.04, 0.06, 0.09);
    camB.add(tl);
  }

  /* --------------------------------------------------------------- ekipa */

  const gaffer = person({
    shirt: C.or,
    pants: 0x2b2f36,
    skin: 0xc68e64,
    shoes: 0xf0ede6,
    hair: 0x1d1410,
    hat: "beanie",
    hatColor: 0x1d1b19,
  });
  const operator = person({
    shirt: 0x2a2826,
    pants: 0x3a3f47,
    skin: 0xe2b48f,
    shoes: 0x111111,
    hair: 0x5a3a22,
    hat: "cap",
    hatColor: 0xd87928,
  });
  const sound = person({
    shirt: 0xd9cbb5,
    pants: 0x23262b,
    skin: 0x8a5a3c,
    shoes: 0x111111,
    hair: 0x120d0a,
    phones: true,
  });
  const slate = person({
    shirt: 0x3f6f5a,
    pants: 0x2a2622,
    skin: 0xe8c09e,
    shoes: 0xf0ede6,
    hair: 0x7a4b2a,
    hat: "bun",
  });
  for (const r of [gaffer, operator, sound, slate]) scene.add(r.root);

  // bum motka
  const boom = new THREE.Group();
  const BOOM_REST = new THREE.Vector3(-0.24, 1.53, 0.02);
  const BOOM_UP = new THREE.Vector3(-0.02, 1.62, 0.3);
  sound.root.add(boom);
  const POLE = 1.55;
  {
    const pole = mesh(
      new THREE.CylinderGeometry(0.011, 0.013, POLE, 8),
      std(0x9a9a9f, 0.3, { metalness: 0.8 }),
    );
    pole.geometry.rotateX(Math.PI / 2);
    pole.position.z = POLE / 2 - 0.35;
    boom.add(pole);
  }
  const micG = new THREE.Group();
  micG.position.z = POLE - 0.35;
  boom.add(micG);
  {
    const fur = mesh(
      new THREE.CapsuleGeometry(0.04, 0.13, 6, 12),
      std(0x8a847b, 1),
    );
    fur.geometry.rotateX(Math.PI / 2);
    fur.position.z = 0.1;
    micG.add(fur);
  }

  // klapa
  const slateG = new THREE.Group();
  slate.root.add(slateG);
  const stickMat = std(0xffffff, 0.5, { map: stripes() });
  let stickTop: THREE.Group;
  {
    const board = mesh(new THREE.BoxGeometry(0.3, 0.235, 0.014), [
      black,
      black,
      black,
      black,
      std(0xffffff, 0.6, { map: slateFace(font) }),
      black,
    ]);
    slateG.add(board);
    const bottom = mesh(new THREE.BoxGeometry(0.3, 0.04, 0.016), stickMat);
    bottom.position.y = 0.138;
    slateG.add(bottom);
    stickTop = new THREE.Group();
    stickTop.position.set(-0.15, 0.162, 0);
    slateG.add(stickTop);
    const st = mesh(new THREE.BoxGeometry(0.3, 0.04, 0.016), stickMat);
    st.position.x = 0.15;
    st.position.y = 0.02;
    stickTop.add(st);
  }

  const E: [number, number] = [-4.8, 1.0];
  const I: [number, number] = [-3.5, 1.0];
  const CREW: {
    rig: Rig;
    trips: Trip[];
    face: number;
    work: (t: number, arrive: number, base: Pose) => Pose;
  }[] = [
    {
      rig: gaffer,
      trips: [{ path: [E, I, [-1.98, 1.82]], start: 0.35, dur: 1.7 }],
      face: Math.atan2(0.43, -0.47),
      work: (t, arrive, base) => {
        const up =
          smooth(seg(t, arrive - 0.15, arrive + 0.25)) *
          (1 - smooth(seg(t, T.key + 0.2, T.key + 0.7)));
        let p = mixPose(
          base,
          { shR: -2.55, elR: -0.35, shRz: -0.25, headX: -0.35, lean: -0.05 },
          up,
        );
        // posle pokaže na kontra svetlo
        const point =
          smooth(seg(t, T.rim - 0.25, T.rim)) *
          (1 - smooth(seg(t, T.rim + 0.5, T.rim + 0.9)));
        p = mixPose(p, { shL: -1.7, elL: -0.1, shLz: 0.5, headY: -0.6 }, point);
        return p;
      },
    },
    {
      rig: operator,
      trips: [
        { path: [E, I, [-1.5, 2.8], [-0.66, 3.08]], start: 0.75, dur: 2.25 },
      ],
      face: 2.25,
      work: (t, arrive, base) => {
        const k = smooth(seg(t, arrive - 0.1, arrive + 0.35));
        return mixPose(
          base,
          {
            shL: -0.55,
            elL: -0.95,
            shLz: 0.1,
            shR: -0.45,
            elR: -1.05,
            shRz: -0.1,
            lean: 0.1,
            headX: 0.2,
            headY: 0.3,
          },
          k,
        );
      },
    },
    {
      rig: sound,
      trips: [
        { path: [E, I, [-0.9, 1.6], [1.35, 0.92]], start: 1.1, dur: 2.45 },
      ],
      face: Math.atan2(-1.35, -0.92),
      work: (t, _arrive, base) => {
        const carry = mixPose(base, { shR: -0.95, elR: -1.35, shRz: -0.05 }, 1);
        const k = smooth(seg(t, T.boom[0], T.boom[1]));
        return mixPose(
          carry,
          {
            shR: -1.95,
            elR: -0.45,
            shRz: 0.12,
            shL: -2.05,
            elL: -0.15,
            shLz: -0.12,
            headX: -0.3,
          },
          k,
        );
      },
    },
    {
      rig: slate,
      trips: [
        { path: [E, I, [-0.8, 1.22], [0, 1.35]], start: 1.45, dur: 1.9 },
        {
          path: [
            [0, 1.35],
            [-0.55, 1.75],
            [-0.98, 1.98],
          ],
          start: 4.2,
          dur: 0.8,
        },
      ],
      face: 0,
      work: (t, _arrive, base) => {
        const hold =
          smooth(seg(t, T.slateUp[0], T.slateUp[1])) *
          (1 - smooth(seg(t, T.clap + 0.15, T.clap + 0.35)));
        const carry = mixPose(base, { shR: -0.35, elR: -0.9 }, 1);
        return mixPose(
          carry,
          {
            shR: -1.5,
            elR: -0.2,
            shRz: 0.1,
            shL: -1.35,
            elL: -0.55,
            shLz: -0.15,
            headY: 0.35,
            headX: 0.05,
          },
          hold,
        );
      },
    },
  ];

  /* -------------------------------------------------------------- kamere */

  const view = new THREE.PerspectiveCamera(36, 17 / 12, 0.05, 60);
  view.layers.enable(1);
  const pov = new THREE.PerspectiveCamera(17, 17 / 12, 0.05, 60);
  const D =
    (MON_H / 2 / Math.tan(THREE.MathUtils.degToRad(view.fov / 2))) * 0.985;
  const W0 = {
    pos: new THREE.Vector3(4.3, 2.55, 5.9),
    at: new THREE.Vector3(-1.05, 0.98, 0.45),
  };
  const W1 = {
    pos: new THREE.Vector3(3.7, 2.3, 5.4),
    at: new THREE.Vector3(-0.75, 1.02, 0.55),
  };
  const CTRL = new THREE.Vector3(1.7, 1.7, 4.2);
  const FIN = MON.clone().add(new THREE.Vector3(0, 0, D));
  const tmpA = new THREE.Vector3();
  const tmpB = new THREE.Vector3();

  function setView(t: number) {
    if (t < T.push[0]) {
      const k = smooth(seg(t, 0, T.push[0]));
      view.position.lerpVectors(W0.pos, W1.pos, k);
      tmpA.lerpVectors(W0.at, W1.at, k);
      view.lookAt(tmpA);
      return;
    }
    const k = inOut(seg(t, T.push[0], T.push[1]));
    // kvadratna Bezijeva kriva do monitora
    const a = 1 - k;
    view.position
      .set(0, 0, 0)
      .addScaledVector(W1.pos, a * a)
      .addScaledVector(CTRL, 2 * a * k)
      .addScaledVector(FIN, k * k);
    const kt = smooth(Math.min(1, k * 1.35));
    tmpB.lerpVectors(W1.at, MON, kt);
    view.lookAt(tmpB);
  }

  /* ------------------------------------------------------------- update */

  const v3 = new THREE.Vector3();
  function update(t: number) {
    // vrata
    const open =
      smooth(seg(t, T.door[0], T.door[1])) *
      (1 - smooth(seg(t, T.doorClose[0], T.doorClose[1])));
    doorPivot.rotation.y = 1.7 * open;
    spill.intensity = 30 * open;
    corridorMat.color.setScalar(3 * Math.min(1, open * 4));

    // rasveta
    const tk = t - T.key;
    const keyOn =
      tk < 0
        ? 0
        : tk < 0.1
          ? 0.7
          : tk < 0.17
            ? 0.12
            : tk < 0.24
              ? 0.85
              : lerp(0.85, 1, seg(tk, 0.24, 0.5));
    const rimOn = smooth(seg(t, T.rim, T.rim + 0.3));
    const lit = Math.max(keyOn, rimOn);
    key.intensity = 34 * keyOn;
    keyFace.emissiveIntensity = 2.4 * keyOn;
    keyBeam.mat.uniforms.uOpacity.value = 0.09 * keyOn;
    rim.intensity = 42 * rimOn;
    rimLens.emissiveIntensity = 3 * rimOn;
    rimBeam.mat.uniforms.uOpacity.value = 0.12 * rimOn;
    wash.intensity = 55 * rimOn;
    pin.intensity = lerp(40, 14, lit);
    pinBeam.mat.uniforms.uOpacity.value = lerp(0.1, 0.035, lit);
    hemi.intensity = lerp(0.12, 0.42, lit);
    fill.intensity = 1.6 * lit;
    scene.environmentIntensity = lerp(0.06, 0.28, lit);

    // snimanje: crveno svetlo posle klape
    tallyMat.emissiveIntensity = t > T.clap + 0.3 ? 3 : 0;
    screen.material = t > 2.2 ? screenOn : screenOff;

    // kesa na gramofonu, para iz šolje
    bag.rotation.y = 0.24 * Math.sin(0.75 * t);
    steam.forEach((s, k) => {
      const ph = (((t * 0.42 + k / steam.length) % 1) + 1) % 1;
      s.position.set(
        cupG.position.x + 0.02 * Math.sin(t * 1.7 + k * 2),
        TOP + 0.1 + ph * 0.26,
        cupG.position.z + 0.015 * Math.cos(t * 1.3 + k),
      );
      const sc = 0.05 + ph * 0.09;
      s.scale.set(sc, sc * 1.3, 1);
      (s.material as THREE.SpriteMaterial).opacity =
        0.22 * Math.sin(Math.PI * ph);
    });

    // kamera B klizi
    const sl = 0.5 + 0.5 * Math.sin(t * 0.45 - 1);
    camB.position.lerpVectors(SL_A, SL_B, sl).setY(0.85);
    camB.lookAt(BAG_C);

    // ekipa
    for (const c of CREW) {
      const tr = travel(c.trips, t);
      c.rig.root.visible = t >= tr.first;
      const settle = smooth(seg(t, tr.arrive - 0.25, tr.arrive + 0.35));
      const lastTrip = c.trips[c.trips.length - 1];
      const done = t >= lastTrip.start + lastTrip.dur;
      let yaw = tr.yaw;
      if (c.rig === slate && !done && t >= c.trips[0].start + c.trips[0].dur) {
        yaw = lerpAngle(tr.yaw, 0, settle);
      } else if (c.rig === slate && done) {
        yaw = lerpAngle(tr.yaw, Math.atan2(0.98, -1.98), settle);
      } else if (c.rig !== slate) {
        yaw = lerpAngle(tr.yaw, c.face, settle);
      }
      const base: Pose = {
        ...REST,
        shL: REST.shL + 0.03 * Math.sin(t * 1.6 + tr.first),
        shR: REST.shR + 0.03 * Math.sin(t * 1.6 + tr.first + 1),
        headY: 0.1 * Math.sin(t * 0.7 + tr.first * 3),
      };
      const pose = c.work(t, tr.arrive, base);
      applyRig(
        c.rig,
        tr.x,
        tr.z,
        yaw,
        pose,
        tr.walking,
        (tr.s / 0.78) * Math.PI,
      );
    }

    // bum: na ramenu dok hoda, pa iznad kese
    const kb = inOut(seg(t, T.boom[0], T.boom[1]));
    const a = lerp(-2.55, -0.27, kb);
    boom.rotation.x = a;
    boom.position.lerpVectors(BOOM_REST, BOOM_UP, kb);
    micG.rotation.x = Math.PI / 2 - a - 0.3;

    // klapa: nosi je dole, digne je ispred kamere, klap, spusti
    const hold =
      smooth(seg(t, T.slateUp[0], T.slateUp[1])) *
      (1 - smooth(seg(t, T.clap + 0.15, T.clap + 0.35)));
    slateG.position.set(
      lerp(-0.28, -0.06, hold),
      lerp(0.82, 1.46, hold),
      lerp(0.1, 0.4, hold),
    );
    slateG.rotation.set(lerp(0.2, 0, hold), lerp(-1.4, 0, hold), 0);
    const opened = smooth(seg(t, T.slateUp[1], T.slateUp[1] + 0.2));
    stickTop.rotation.z =
      t < T.clap ? 0.5 * opened : 0.5 * (1 - seg(t, T.clap, T.clap + 0.05));

    // zrna koja padaju (samo u kadru 2)
    const sh = shotAt(t);
    falling.visible = t >= T.pov && sh.i === 2;
    if (falling.visible) {
      fallSeed.forEach((b, k) => {
        const tt = sh.tau - b.t0 * 0.8;
        let y = 1.75;
        if (tt > 0) y = Math.max(TOP + 0.01, 1.75 - 4.9 * tt * tt);
        e.set(
          b.rot + tt * b.spin,
          b.rot,
          b.rot * 0.5 + (y > TOP + 0.02 ? tt * b.spin : 0),
        );
        q.setFromEuler(e);
        v3.set(b.x, y, b.z);
        m4.compose(v3, q, sv);
        falling.setMatrixAt(k, m4);
      });
      falling.instanceMatrix.needsUpdate = true;
    }
  }

  function draw(t: number) {
    update(t);
    renderer.shadowMap.needsUpdate = true;
    if (t < T.pov) {
      setView(t);
      if (t > 2.2) {
        setShot(pov, 0, 0);
        renderer.setRenderTarget(rt);
        renderer.render(scene, pov);
        renderer.setRenderTarget(null);
      }
      renderer.render(scene, view);
    } else {
      const s = shotAt(t);
      setShot(pov, s.i, s.tau);
      renderer.render(scene, pov);
    }
  }

  // shaderi unapred, da prvi kadar ne zastane
  try {
    await renderer.compileAsync(scene, view);
  } catch {
    /* stariji drajveri: kompajlira se pri prvom crtanju */
  }

  // sličice za timeline: osvetljen studio, svaki kadar
  const thumbs: string[] = [];
  renderer.setPixelRatio(1);
  renderer.setSize(272, 192, false);
  pov.aspect = 272 / 192;
  for (let i = 0; i < 4; i++) {
    update(PHASE_T[1] + 0.5);
    falling.visible = i === 2;
    if (i === 2) {
      fallSeed.forEach((b, k) => {
        v3.set(b.x, TOP + 0.05 + ((k * 0.37) % 1) * 0.6, b.z);
        e.set(b.rot, b.rot * 2, 0);
        q.setFromEuler(e);
        falling.setMatrixAt(k, m4.compose(v3, q, sv));
      });
      falling.instanceMatrix.needsUpdate = true;
    }
    renderer.shadowMap.needsUpdate = true;
    setShot(pov, i, 0.8);
    renderer.render(scene, pov);
    thumbs.push(canvas.toDataURL("image/jpeg", 0.82));
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  return {
    canvas,
    thumbs,
    owner: 0,
    resize(w, h) {
      if (w < 2 || h < 2) return;
      renderer.setSize(w, h, false);
      const pr = renderer.getPixelRatio();
      rt.setSize(Math.round(w * pr), Math.round(h * pr));
      view.aspect = pov.aspect = w / h;
      view.updateProjectionMatrix();
      pov.updateProjectionMatrix();
    },
    frame: draw,
  };
}
