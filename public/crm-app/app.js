/* =========================================================
   KLIJENT: jedino mesto koje se menja za novog klijenta
   ========================================================= */
const CLIENT = {
  id: "ils",
  name: "Infinity Laser Studio",
  short: "Infinity Laser",
  knot: "/crm-app/img/ils-knot.webp", // logo klijenta (PNG/WebP sa providnom pozadinom)
  privacyPass: null, // šifru za Privacy proverava server (/crm/privacy, env CRM_PRIVACY_PASSWORD)
  data: "supabase", // pravi izveštaji, skripte i kreative iz Skeylo OS-a; crm-db.js posle prijave zove SkeyloCRM.connect
  user: null, // ko piše komentare; postavlja ga SkeyloCRM.connect posle prijave
  loomEmbed: true, // Loom se pušta u stranici
  pages: {
    // "reporting", "creative-inspection", "creatives", "organisation", "privacy" i "sistem" su ugrađeni ispod; ostalo: link ka stranici kad bude gotova (null = "stiže uskoro")
    reporting: null,
    "creative-inspection": null,
    creatives: null,
    organisation: null,
    general: null,
    privacy: null,
  },
  chart: [18, 24, 21, 33, 29, 41, 38, 52, 47, 61, 58, 74, 70, 88], // samo oblik linije na Reporting kartici (dekoracija)
};
const SKEYLO_WM = "/os-app/img/d5fd595e8e.png",
  SKEYLO_ICON = "/os-app/img/e20eeaf7f1.png";
const CRM_MEDIA = {}; // samo demo kreative u pregledu (ime fajla → adresa); pravi fajlovi stižu iz Skeylo OS-a

const $ = (s) => document.querySelector(s),
  $$ = (s) => [...document.querySelectorAll(s)];
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
/* tempo animacija (motion.js): MT = trajanje po istoj krivoj kao CSS, MLAG = kašnjenje,
   TEMPO = brzina sata uvodnog amblema */
const TEMPO = window.CRM_TEMPO || 1,
  MT = window.CRM_T || ((ms) => ms),
  MLAG = window.CRM_LAG || ((ms) => ms);
const fine = matchMedia("(hover:hover) and (pointer:fine)").matches;
const esc = (s) =>
  String(s).replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
  );
const R = document.documentElement.style;
document.documentElement.lang = "sr";
document.title = CLIENT.name + " · Skeylo";
$("#knotImg").src = CLIENT.knot;
$("#whoImg").src = CLIENT.knot;
$("#whoName").textContent = CLIENT.short || CLIENT.name;
R.setProperty("--knot", `url("${CLIENT.knot}")`);
R.setProperty("--wm", `url("${SKEYLO_WM}")`);
R.setProperty("--ski", `url("${SKEYLO_ICON}")`);

const PTR = { x: innerWidth / 2, y: innerHeight / 3, in: false };
if (fine) {
  addEventListener(
    "pointermove",
    (e) => {
      PTR.x = e.clientX;
      PTR.y = e.clientY;
      PTR.in = true;
    },
    { passive: true },
  );
  document.documentElement.addEventListener("pointerleave", () => {
    PTR.in = false;
  });
}

/* ---------- ambient: rose arcs, drifting dust that moves away from the cursor, faint laser sweeps ---------- */
(function () {
  const c = $("#bg"),
    x = c.getContext("2d");
  let W,
    H,
    parts = [],
    beams = [],
    nb = performance.now() + 4200,
    t0 = performance.now(),
    sy = 0;
  function size() {
    const d = Math.min(1.5, devicePixelRatio || 1);
    W = innerWidth;
    H = innerHeight;
    c.width = W * d;
    c.height = H * d;
    x.setTransform(d, 0, 0, d, 0, 0);
    const n = Math.round(Math.min(90, (W * H) / 16000));
    parts = Array.from({ length: n }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: 0,
      vy: 0,
      r: 0.4 + Math.random() * 1.5,
      v: 0.08 + Math.random() * 0.28,
      p: Math.random() * 6.28,
    }));
  }
  size();
  addEventListener("resize", size);
  addEventListener(
    "scroll",
    () => {
      sy = scrollY;
    },
    { passive: true },
  );
  const arcs = [
    { cx: -0.15, cy: -0.1, R: 0.75, w: 1.2, s: 0.00004, o: 0.16 },
    { cx: 1.12, cy: 1.15, R: 0.62, w: 1.2, s: -0.00005, o: 0.14 },
    { cx: -0.25, cy: -0.25, R: 1.05, w: 0.8, s: 0.00003, o: 0.08 },
    { cx: 1.25, cy: 1.3, R: 0.9, w: 0.8, s: -0.00003, o: 0.07 },
  ];
  function frame(now) {
    const t = now - t0,
      m = Math.max(W, H);
    x.clearRect(0, 0, W, H);
    arcs.forEach((a, i) => {
      const cx = a.cx * W + Math.sin(t * a.s * 6 + i) * 24,
        cy =
          a.cy * H +
          Math.cos(t * a.s * 5 + i) * 24 -
          sy * 0.05 * (i % 2 ? -1 : 1),
        Rr = a.R * m;
      const g = x.createRadialGradient(cx, cy, Rr * 0.92, cx, cy, Rr * 1.08);
      g.addColorStop(0, "rgba(227,169,174,0)");
      g.addColorStop(0.5, `rgba(240,196,200,${a.o})`);
      g.addColorStop(1, "rgba(227,169,174,0)");
      x.strokeStyle = g;
      x.lineWidth = Rr * 0.16;
      x.beginPath();
      x.arc(cx, cy, Rr, 0, Math.PI * 2);
      x.stroke();
      x.strokeStyle = `rgba(251,228,223,${a.o * 1.6})`;
      x.lineWidth = a.w;
      x.beginPath();
      x.arc(cx, cy, Rr, 0, Math.PI * 2);
      x.stroke();
    });
    if (!reduce && now > nb) {
      beams.push({
        t: now,
        d: 1700,
        y0: H * (0.15 + Math.random() * 0.7),
        ang: (Math.random() - 0.5) * 0.6,
        dir: Math.random() < 0.5 ? 1 : -1,
      });
      nb = now + 7000 + Math.random() * 6000;
    }
    beams = beams.filter((b) => now - b.t < b.d);
    for (const b of beams) {
      const k = (now - b.t) / b.d,
        env = Math.sin(Math.PI * k),
        x0 = -60,
        x1 = W + 60,
        yA = b.y0 - (Math.tan(b.ang) * W) / 2,
        yB = b.y0 + (Math.tan(b.ang) * W) / 2,
        len = Math.hypot(x1 - x0, yB - yA),
        ux = (x1 - x0) / len,
        uy = (yB - yA) / len;
      x.strokeStyle = `rgba(251,228,223,${(0.05 * env).toFixed(3)})`;
      x.lineWidth = 1;
      x.beginPath();
      x.moveTo(x0, yA);
      x.lineTo(x1, yB);
      x.stroke();
      const u = b.dir > 0 ? k : 1 - k,
        px = x0 + (x1 - x0) * u,
        py = yA + (yB - yA) * u,
        tx = px - ux * 220 * b.dir,
        ty = py - uy * 220 * b.dir;
      const lg = x.createLinearGradient(tx, ty, px, py);
      lg.addColorStop(0, "rgba(255,240,232,0)");
      lg.addColorStop(1, `rgba(255,240,232,${(0.55 * env).toFixed(3)})`);
      x.strokeStyle = lg;
      x.lineWidth = 1.6;
      x.beginPath();
      x.moveTo(tx, ty);
      x.lineTo(px, py);
      x.stroke();
      const rg = x.createRadialGradient(px, py, 0, px, py, 46);
      rg.addColorStop(0, `rgba(255,240,232,${(0.35 * env).toFixed(3)})`);
      rg.addColorStop(1, "rgba(255,240,232,0)");
      x.fillStyle = rg;
      x.beginPath();
      x.arc(px, py, 46, 0, 6.283);
      x.fill();
    }
    for (const p of parts) {
      if (!reduce) {
        p.y -= p.v;
        p.x += Math.sin(t / 2400 + p.p) * 0.12;
        if (PTR.in) {
          const dx = p.x - PTR.x,
            dy = p.y - PTR.y,
            d2 = dx * dx + dy * dy;
          if (d2 < 18000) {
            const d = Math.sqrt(d2) || 1,
              f = (1 - d / 134) * 1.5;
            p.vx += (dx / d) * f;
            p.vy += (dy / d) * f;
          }
        }
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.9;
        p.vy *= 0.9;
        if (p.y < -5) {
          p.y = H + 5;
          p.x = Math.random() * W;
        }
        if (p.x < -5) p.x = W + 5;
        else if (p.x > W + 5) p.x = -5;
      }
      const a = 0.25 + 0.35 * Math.sin(t / 900 + p.p);
      x.fillStyle = `rgba(251,228,223,${Math.max(0, a).toFixed(3)})`;
      x.beginPath();
      x.arc(p.x, p.y, p.r, 0, 6.283);
      x.fill();
    }
    if (!reduce) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();

/* ---------- spotlight + cursor ring ---------- */
(function () {
  const spot = $("#spot"),
    cu = $("#cur");
  if (!fine) {
    spot.style.opacity = ".6";
    cu.remove();
    return;
  }
  let sx = PTR.x,
    sy = PTR.y,
    cx = PTR.x,
    cy = PTR.y;
  (function f() {
    sx += (PTR.x - sx) * 0.08;
    sy += (PTR.y - sy) * 0.08;
    cx += (PTR.x - cx) * 0.24;
    cy += (PTR.y - cy) * 0.24;
    spot.style.transform = `translate(${sx.toFixed(1)}px,${sy.toFixed(1)}px)`;
    cu.style.transform = `translate(${cx.toFixed(1)}px,${cy.toFixed(1)}px)`;
    cu.classList.toggle("on", PTR.in);
    if (!reduce) requestAnimationFrame(f);
  })();
  document.addEventListener("pointerover", (e) => {
    const t = e.target instanceof Element ? e.target : null;
    cu.classList.toggle(
      "big",
      !!(
        t && t.closest(".card,.prow,.ritem,.sitem,.gcard,.oi-x,.pv-cp,.pv-ey")
      ),
    );
    cu.classList.toggle("hot", !!(t && t.closest(".emb")));
  });
  addEventListener("pointerdown", () => cu.classList.add("dn"));
  addEventListener("pointerup", () => cu.classList.remove("dn"));
})();

/* ---------- front FX: laser beam, sparks, etching ---------- */
const FX = (function () {
  const c = $("#fxf"),
    x = c.getContext("2d");
  let W = 0,
    H = 0,
    sp = [],
    jobs = [],
    running = false,
    beamSrc = null;
  function size() {
    const d = Math.min(2, devicePixelRatio || 1);
    W = innerWidth;
    H = innerHeight;
    c.width = W * d;
    c.height = H * d;
    x.setTransform(d, 0, 0, d, 0, 0);
  }
  size();
  addEventListener("resize", size);
  function sparks(px, py, n, hot) {
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.5,
        s = 1.5 + Math.random() * 4.8;
      sp.push({
        x: px,
        y: py,
        px,
        py,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s - 1,
        l: 1,
        d: 0.016 + Math.random() * 0.03,
        w: 0.8 + Math.random() * 1.5,
        c:
          Math.random() < 0.35
            ? "255,246,236"
            : hot
              ? "255,160,70"
              : "251,214,206",
      });
    }
  }
  function beam(sx, sy, hx, hy) {
    const fl = 0.75 + Math.random() * 0.5;
    x.save();
    x.lineCap = "round";
    const g = x.createLinearGradient(sx, sy, hx, hy);
    g.addColorStop(0, "rgba(240,138,46,0)");
    g.addColorStop(0.12, `rgba(240,138,46,${(0.55 * fl).toFixed(3)})`);
    g.addColorStop(1, `rgba(255,196,130,${(0.95 * fl).toFixed(3)})`);
    x.strokeStyle = g;
    x.lineWidth = 5 * fl;
    x.shadowColor = "rgba(255,120,40,.9)";
    x.shadowBlur = 18;
    x.beginPath();
    x.moveTo(sx, sy);
    x.lineTo(hx, hy);
    x.stroke();
    x.shadowBlur = 0;
    x.strokeStyle = `rgba(255,248,240,${(0.9 * fl).toFixed(3)})`;
    x.lineWidth = 1.2;
    x.beginPath();
    x.moveTo(sx, sy);
    x.lineTo(hx, hy);
    x.stroke();
    const rg = x.createRadialGradient(hx, hy, 0, hx, hy, 30);
    rg.addColorStop(0, "rgba(255,240,225,.9)");
    rg.addColorStop(0.4, "rgba(255,140,60,.35)");
    rg.addColorStop(1, "rgba(255,140,60,0)");
    x.fillStyle = rg;
    x.beginPath();
    x.arc(hx, hy, 30, 0, 6.283);
    x.fill();
    x.restore();
  }
  function loop() {
    x.clearRect(0, 0, W, H);
    jobs = jobs.filter(
      (j) => j.el.isConnected && j.el.classList.contains("run"),
    );
    for (const j of jobs) {
      const r = j.head.getBoundingClientRect(),
        hx = r.left + r.width / 2,
        hy = r.top + r.height / 2;
      if (!r.width) continue;
      sparks(hx, hy, j.beam ? 3 : 2, true);
      const src =
        typeof j.beam === "function" ? j.beam : j.beam ? beamSrc : null;
      if (src) {
        const b = src();
        if (b) beam(b.x, b.y, hx, hy);
      }
    }
    sp = sp.filter((p) => p.l > 0);
    for (const p of sp) {
      p.px = p.x;
      p.py = p.y;
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.97;
      p.vy = p.vy * 0.97 + 0.18;
      p.l -= p.d;
      x.strokeStyle = `rgba(${p.c},${Math.max(0, p.l).toFixed(3)})`;
      x.lineWidth = p.w;
      x.lineCap = "round";
      x.beginPath();
      x.moveTo(p.px, p.py);
      x.lineTo(p.x, p.y);
      x.stroke();
    }
    if (jobs.length || sp.length) requestAnimationFrame(loop);
    else {
      running = false;
      x.clearRect(0, 0, W, H);
    }
  }
  function kick() {
    if (!running) {
      running = true;
      requestAnimationFrame(loop);
    }
  }
  return {
    etch(el, dur, useBeam) {
      if (!el) return Promise.resolve();
      if (reduce) {
        el.classList.add("done");
        return Promise.resolve();
      }
      return new Promise((res) => {
        el.style.setProperty("--dur", dur + "ms");
        el.classList.remove("done");
        void el.offsetWidth;
        el.classList.add("run");
        jobs.push({ el, head: el.querySelector(".lh"), beam: useBeam });
        kick();
        const h = (ev) => {
          if (ev.target !== el || ev.animationName !== "etch") return;
          el.removeEventListener("animationend", h);
          el.classList.remove("run");
          el.classList.add("done");
          res();
        };
        el.addEventListener("animationend", h);
      });
    },
    sparks(px, py, n, hot) {
      if (reduce) return;
      sparks(px, py, n, hot);
      kick();
    },
    beamFrom(fn) {
      beamSrc = fn;
    },
  };
})();
const etchHTML = (text, cls) =>
  `<span class="ew"><span class="etch ${cls || ""}">${esc(text)}<span class="hot" aria-hidden="true">${esc(text)}</span></span><i class="lh" aria-hidden="true"></i></span>`;
/* naslov stranice se pojavi mekano (bez laserskog upisivanja pri ulasku u stranicu) */
function softTitle(el, delay) {
  if (!el) return;
  el.style.animationDelay = (delay || 0) + "ms";
  el.classList.add("done", "soft");
}

/* ---------- Infinity × Skeylo: Skeylo slams into orbit and powers the medallion with its laser ---------- */
const EMB = (function () {
  const emb = $("#emb"),
    mark = $("#mark"),
    ob = $("#ob"),
    of = $("#of"),
    bx = ob.getContext("2d"),
    fx = of.getContext("2d"),
    sk = $("#sk"),
    api = {};
  let S = 0,
    C = 0,
    skW = 0; // širina bedža: čita se samo pri promeni veličine, ne u svakom kadru (prisilni layout)
  const TILT = (-16 * Math.PI) / 180;
  function size() {
    if (!emb.offsetWidth) return;
    S = emb.offsetWidth;
    skW = sk.offsetWidth;
    C = S * 1.36;
    const d = Math.min(2, devicePixelRatio || 1);
    [ob, of].forEach((c) => {
      c.width = Math.round(C * d);
      c.height = Math.round(C * d);
    });
    [bx, fx].forEach((x) => x.setTransform(d, 0, 0, d, 0, 0));
  }
  size();
  addEventListener("resize", size);
  const P = (th) => {
    const rx = S * 0.5,
      ry = S * 0.15,
      x = rx * Math.cos(th),
      y = ry * Math.sin(th);
    return {
      x: C / 2 + x * Math.cos(TILT) - y * Math.sin(TILT),
      y: C / 2 + x * Math.sin(TILT) + y * Math.cos(TILT),
      z: Math.sin(th),
    };
  };
  const OFF = () => (C * 0.18) / 1.36;
  let th = reduce ? 0.35 : Math.PI / 2,
    v = 0,
    trail = [],
    parts = [],
    phase = reduce ? 2 : 0,
    t0 = performance.now(),
    last = t0,
    LAUNCH = 1500,
    cur = P(Math.PI / 2),
    pulseAt = t0 + 6200,
    beam = null;
  function burst(px, py, n) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * 6.283,
        s = 2 + Math.random() * 9;
      parts.push({
        x: px,
        y: py,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s * 0.7 - 1.5,
        l: 1,
        d: 0.012 + Math.random() * 0.02,
        r: 1 + Math.random() * 2.6,
        c: i % 3 ? "251,228,223" : "255,160,70",
      });
    }
  }
  function place(p, sc, bl) {
    const b = skW || (skW = sk.offsetWidth);
    sk.style.transform = `translate(${(p.x - OFF() - b / 2).toFixed(1)}px,${(p.y - OFF() - b / 2).toFixed(1)}px) scale(${sc.toFixed(3)})`;
    sk.style.filter = bl > 0.2 ? `blur(${bl.toFixed(1)}px)` : "none";
  }
  function shocks(px, py) {
    ["#sh1", "#sh2", "#sh3"].forEach((id) => {
      const s = $(id);
      s.style.left = (((px - OFF()) / S) * 100).toFixed(2) + "%";
      s.style.top = (((py - OFF()) / S) * 100).toFixed(2) + "%";
    });
    emb.classList.remove("hit");
    void emb.offsetWidth;
    emb.classList.add("hit");
  }
  function zap() {
    mark.classList.remove("zap");
    void mark.offsetWidth;
    mark.classList.add("zap");
  }
  function fire() {
    beam = { t: performance.now(), d: MT(480) };
    setTimeout(zap, MT(130));
  }
  function flashAll() {
    const r = emb.getBoundingClientRect(),
      fa = $("#flashAll");
    fa.style.setProperty("--fx", r.left + r.width / 2 + "px");
    fa.style.setProperty("--fy", r.top + r.height / 2 + "px");
    fa.classList.remove("go");
    void fa.offsetWidth;
    fa.classList.add("go");
  }
  function impact() {
    const e = P(Math.PI / 2);
    phase = 2;
    v = 9;
    burst(e.x, e.y, 90);
    shocks(e.x, e.y);
    zap();
    flashAll();
    document.body.classList.add("jolt");
    setTimeout(() => document.body.classList.remove("jolt"), MT(560));
    try {
      if (
        navigator.vibrate &&
        (!navigator.userActivation || navigator.userActivation.hasBeenActive)
      )
        navigator.vibrate(30);
    } catch (err) {}
    api.onImpact && api.onImpact();
  }
  emb.addEventListener("click", () => {
    if (phase !== 2) return;
    v = Math.min(v + 9, 16);
    burst(cur.x, cur.y, 46);
    shocks(C / 2, C / 2);
    fire();
    flashAll();
  });
  function orbitLine(x, front, prog) {
    x.save();
    x.lineWidth = 1.2;
    const g = x.createLinearGradient(0, C * 0.3, C, C * 0.7);
    g.addColorStop(0, "rgba(251,228,223,0)");
    g.addColorStop(0.5, `rgba(251,228,223,${front ? 0.55 : 0.18})`);
    g.addColorStop(1, "rgba(251,228,223,0)");
    x.strokeStyle = g;
    x.beginPath();
    const a0 = front ? 0 : Math.PI,
      steps = 60;
    for (let i = 0; i <= steps * prog; i++) {
      const p = P(a0 + (i / steps) * Math.PI);
      i ? x.lineTo(p.x, p.y) : x.moveTo(p.x, p.y);
    }
    x.stroke();
    if (prog >= 1)
      for (let k = 0; k < 6; k++) {
        const a =
            (performance.now() / 2600 + k / 6) * 6.283 * (k % 2 ? 1 : -0.7),
          p = P(a);
        if (p.z > 0 === front) {
          x.fillStyle = `rgba(251,228,223,${(0.25 + 0.4 * Math.abs(p.z)).toFixed(3)})`;
          x.beginPath();
          x.arc(p.x, p.y, 1.6 + p.z * 0.8, 0, 6.283);
          x.fill();
        }
      }
    x.restore();
  }
  function laser(x, sx, sy, ex, ey, env) {
    const fl = (0.75 + Math.random() * 0.5) * env;
    x.save();
    x.lineCap = "round";
    const g = x.createLinearGradient(sx, sy, ex, ey);
    g.addColorStop(0, `rgba(240,138,46,${(0.9 * fl).toFixed(3)})`);
    g.addColorStop(1, `rgba(255,220,190,${(0.95 * fl).toFixed(3)})`);
    x.strokeStyle = g;
    x.lineWidth = 4.5 * fl + 0.5;
    x.shadowColor = "rgba(255,120,40,.95)";
    x.shadowBlur = 16;
    x.beginPath();
    x.moveTo(sx, sy);
    x.lineTo(ex, ey);
    x.stroke();
    x.shadowBlur = 0;
    x.strokeStyle = `rgba(255,250,244,${(0.95 * fl).toFixed(3)})`;
    x.lineWidth = 1.1;
    x.beginPath();
    x.moveTo(sx, sy);
    x.lineTo(ex, ey);
    x.stroke();
    const rg = x.createRadialGradient(ex, ey, 0, ex, ey, S * 0.16);
    rg.addColorStop(0, `rgba(255,240,226,${(0.8 * fl).toFixed(3)})`);
    rg.addColorStop(0.4, `rgba(255,140,60,${(0.3 * fl).toFixed(3)})`);
    rg.addColorStop(1, "rgba(255,140,60,0)");
    x.fillStyle = rg;
    x.beginPath();
    x.arc(ex, ey, S * 0.16, 0, 6.283);
    x.fill();
    x.restore();
  }
  let paused = false;
  api.pause = (v) => {
    if (paused === v) return;
    paused = v;
    if (!v) {
      last = performance.now();
      if (phase === 0) t0 = last;
    }
  };
  api.resize = size;
  function frame(now) {
    if (paused) {
      if (!reduce) requestAnimationFrame(frame);
      return;
    }
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const t = (now - t0) * TEMPO;
    bx.clearRect(0, 0, C, C);
    fx.clearRect(0, 0, C, C);
    const prog = reduce ? 1 : Math.min(1, Math.max(0, (t - 900) / 700));
    orbitLine(bx, false, prog);
    orbitLine(fx, true, prog);
    if (phase === 0 && t >= LAUNCH) phase = 1;
    if (phase === 1) {
      const q = Math.min(1, (t - LAUNCH) / 400),
        e = q * q * q,
        end = P(Math.PI / 2),
        sx0 = C * 1.15,
        sy0 = -C * 0.45;
      const p = {
        x: sx0 + (end.x - sx0) * e,
        y: sy0 + (end.y - sy0) * e,
        z: 1,
      };
      sk.style.opacity = "1";
      place(p, 2.3 - 1.2 * e, (1 - q) * 7);
      cur = p;
      trail.push(p);
      if (trail.length > 16) trail.shift();
      if (q >= 1) impact();
    } else if (phase === 2) {
      v += (0.8 - v) * Math.min(1, dt * 2.2);
      if (!reduce) th += v * dt;
      cur = P(th);
      sk.style.opacity = "1";
      place(cur, 0.84 + 0.26 * cur.z, 0);
      sk.style.zIndex = cur.z > 0 ? 4 : 1;
      trail.push(cur);
      if (trail.length > (v > 3 ? 28 : 18)) trail.shift();
      if (!reduce && now > pulseAt) {
        fire();
        pulseAt = now + 6500 + Math.random() * 3500;
      }
    }
    for (let i = 1; i < trail.length; i++) {
      const a = trail[i - 1],
        b = trail[i],
        x = b.z > 0 ? fx : bx,
        al = i / trail.length;
      x.strokeStyle = `rgba(243,${(150 + al * 60).toFixed(0)},70,${(al * 0.8 * (b.z > 0 ? 1 : 0.45)).toFixed(3)})`;
      x.lineWidth = al * (S * 0.035);
      x.lineCap = "round";
      x.beginPath();
      x.moveTo(a.x, a.y);
      x.lineTo(b.x, b.y);
      x.stroke();
    }
    if (beam) {
      const k = (now - beam.t) / beam.d;
      if (k >= 1) beam = null;
      else
        laser(
          cur.z > 0 ? fx : bx,
          cur.x,
          cur.y,
          C / 2,
          C / 2,
          Math.sin(Math.PI * Math.min(1, k * 1.25)),
        );
    }
    parts = parts.filter((p) => p.l > 0);
    for (const p of parts) {
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.95;
      p.vy = p.vy * 0.95 + 0.06;
      p.l -= p.d;
      fx.fillStyle = `rgba(${p.c},${Math.max(0, p.l).toFixed(3)})`;
      fx.beginPath();
      fx.arc(p.x, p.y, p.r * p.l + 0.3, 0, 6.283);
      fx.fill();
    }
    if (fine) {
      const r = emb.getBoundingClientRect(),
        dx = (PTR.x - (r.left + r.width / 2)) / innerWidth,
        dy = (PTR.y - (r.top + r.height / 2)) / innerHeight;
      emb.style.transform = `rotateX(${(-dy * 16).toFixed(2)}deg) rotateY(${(dx * 20).toFixed(2)}deg)`;
    }
    if (!reduce) requestAnimationFrame(frame);
  }
  if (reduce)
    requestAnimationFrame(() => {
      sk.style.opacity = "1";
    });
  requestAnimationFrame(frame);
  api.badge = () => {
    if (phase !== 2) return null;
    const r = sk.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  };
  return api;
})();

/* intro: after Skeylo hits the orbit, it burns the welcome text in with its laser */
FX.beamFrom(EMB.badge);
if (reduce) {
  $("#ew1").classList.add("done");
  $("#ew2").classList.add("done");
} else
  EMB.onImpact = () =>
    setTimeout(async () => {
      await FX.etch($("#ew1"), 760, true);
      await FX.etch($("#ew2"), 960, true);
    }, MLAG(140));

/* ---------- cards: laser trace outline, reveal, tilt + parallax + magnetic arrow ---------- */
const NS = "http://www.w3.org/2000/svg";
function rr(w, h, r) {
  const i = 0.8;
  r = Math.max(2, Math.min(r, h / 2, w / 2) - i);
  return `M${i + r},${i} H${w - i - r} A${r},${r} 0 0 1 ${w - i},${i + r} V${h - i - r} A${r},${r} 0 0 1 ${w - i - r},${h - i} H${i + r} A${r},${r} 0 0 1 ${i},${h - i - r} V${i + r} A${r},${r} 0 0 1 ${i + r},${i} Z`;
}
const FITS = new WeakMap(),
  cardRO = window.ResizeObserver
    ? new ResizeObserver((es) =>
        es.forEach((e) => {
          const f = FITS.get(e.target);
          f && f();
        }),
      )
    : null;
function disarmCard(card) {
  cardRO && cardRO.unobserve(card);
}
function armCard(card) {
  if (card._armed) return;
  card._armed = true;
  const bg = document.createElement("span");
  bg.className = "bg";
  card.prepend(bg);
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("class", "trace");
  svg.setAttribute("aria-hidden", "true");
  const p1 = document.createElementNS(NS, "path"),
    p2 = document.createElementNS(NS, "path");
  p1.setAttribute("class", "t1");
  p2.setAttribute("class", "t2");
  svg.append(p1, p2);
  card.append(svg);
  const fit = () => {
    const w = card.offsetWidth,
      h = card.offsetHeight;
    if (!w || !h) return;
    const r = parseFloat(getComputedStyle(card).borderTopLeftRadius) || 30;
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    const d = rr(w, h, r);
    p1.setAttribute("d", d);
    p2.setAttribute("d", d);
    const L = Math.ceil(p1.getTotalLength());
    [p1, p2].forEach((p) => p.style.setProperty("--L", L));
    p1.style.strokeDasharray = `${L} ${L}`;
    p2.style.strokeDasharray = `18 ${L - 18}`;
  };
  fit();
  FITS.set(card, fit);
  cardRO && cardRO.observe(card);
  if (fine) {
    const go = card.querySelector(".go"),
      k = card.matches(".rep,.priv,.phero") ? 3.5 : 7;
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect(),
        px = (e.clientX - r.left) / r.width,
        py = (e.clientY - r.top) / r.height;
      card.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
      card.style.setProperty("--my", (py * 100).toFixed(1) + "%");
      card.style.setProperty("--rx", ((0.5 - py) * k).toFixed(2) + "deg");
      card.style.setProperty("--ry", ((px - 0.5) * k).toFixed(2) + "deg");
      card.style.setProperty("--dx", (px - 0.5).toFixed(3));
      card.style.setProperty("--dy", (py - 0.5).toFixed(3));
      if (!go) return;
      const gx = e.clientX - (r.left + go.offsetLeft + go.offsetWidth / 2),
        gy = e.clientY - (r.top + go.offsetTop + go.offsetHeight / 2),
        dist = Math.hypot(gx, gy),
        f = dist < 170 ? 1 - dist / 170 : 0;
      card.style.setProperty("--gx", (gx * f * 0.4).toFixed(1));
      card.style.setProperty("--gy", (gy * f * 0.4).toFixed(1));
    });
    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--rx", "0deg");
      card.style.setProperty("--ry", "0deg");
      ["--dx", "--dy", "--gx", "--gy"].forEach((v) =>
        card.style.setProperty(v, "0"),
      );
    });
  }
}
$$(".card").forEach(armCard);
/* reveal: on first load cards come in one after another while the emblem intro plays */
const dashWake = (function () {
  const T0 = performance.now(),
    INTRO = reduce ? 0 : 300,
    away = () => $("#dash").classList.contains("away");
  let k = 0,
    fb = 0;
  const show = (el) => {
    if (el.classList.contains("on")) return;
    el.classList.add("on");
    if (el.classList.contains("rep"))
      setTimeout(() => el.classList.add("live"), MT(3200));
  };
  const io = new IntersectionObserver(
    (es) =>
      es.forEach((e) => {
        if (!e.isIntersecting || away()) return;
        const el = e.target;
        io.unobserve(el);
        const wait = Math.max(0, INTRO - (performance.now() - T0)),
          d = wait ? wait + Math.min(+el.dataset.i, 6) * 60 : (k++ % 2) * 50;
        setTimeout(() => show(el), d);
      }),
    { threshold: 0.12 },
  );
  const cards = $$("#dash .rv");
  cards.forEach((el, i) => {
    el.dataset.i = i;
    io.observe(el);
  });
  const arm = () => {
    clearTimeout(fb);
    fb = setTimeout(() => {
      if (!away()) cards.forEach(show);
    }, 1500);
  };
  arm();
  return () => {
    arm();
    cards.forEach((el) => {
      if (!el.classList.contains("on")) {
        io.unobserve(el);
        io.observe(el);
      }
    });
  };
})();

/* ---------- Reporting chart: draws in, a light rides the line, the cursor gets a laser guide ---------- */
(function () {
  const rep = $(".card.rep"),
    chart = $("#chart"),
    line = $("#line"),
    d = CLIENT.chart,
    W = 760,
    top = 40,
    bot = 320,
    n = d.length,
    mn = Math.min(...d),
    mx = Math.max(...d);
  const pts = d.map((v, i) => [
    60 + (i * (W - 90)) / (n - 1),
    bot - ((v - mn) / (mx - mn)) * (bot - top - 30) - 10,
  ]);
  let p = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < n; i++) {
    const [x0, y0] = pts[i - 1],
      [x1, y1] = pts[i],
      cx = (x0 + x1) / 2;
    p += ` C${cx},${y0} ${cx},${y1} ${x1},${y1}`;
  }
  line.setAttribute("d", p);
  $("#area").setAttribute(
    "d",
    p + ` L${pts[n - 1][0]},${bot + 40} L${pts[0][0]},${bot + 40} Z`,
  );
  const len = line.getTotalLength();
  line.style.setProperty("--len", len);
  $("#bars").innerHTML = pts
    .map(
      ([x], i) =>
        `<rect x="${x - 9}" y="${bot - 20 - ((i * 37) % 5) * 16 - 30}" width="18" height="${50 + ((i * 37) % 5) * 16}" rx="4" style="transition-delay:${(0.9 + i * 0.05).toFixed(2)}s"/>`,
    )
    .join("");
  const samples = [];
  for (let i = 0; i <= 260; i++) {
    const q = line.getPointAtLength((len * i) / 260);
    samples.push({ x: q.x, y: q.y });
  }
  const orb = $("#orb"),
    ring = $("#orbRing"),
    s0 = performance.now();
  /* tačka na liniji iz unapred izračunatih uzoraka (getPointAtLength u svakom kadru je skup);
     svetlo ne radi dok kartica nije na ekranu ili je dashboard sklonjen */
  const at = (u) => {
    const f = u * 260,
      i = Math.min(259, Math.floor(f)),
      a = samples[i],
      b = samples[i + 1],
      k = f - i;
    return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k };
  };
  let seen = true;
  new IntersectionObserver((es) => (seen = es[0].isIntersecting)).observe(rep);
  (function ride(now) {
    if (seen && !rep.closest(".away")) {
      const T = 7000,
        q = ((now - s0) % T) / T,
        e = q < 0.85 ? q / 0.85 : 1,
        pt = at(0.55 + 0.45 * (1 - Math.pow(1 - e, 3)));
      orb.setAttribute("cx", pt.x);
      orb.setAttribute("cy", pt.y);
      ring.setAttribute("cx", pt.x);
      ring.setAttribute("cy", pt.y);
      ring.setAttribute("r", (10 + Math.sin(now / 300) * 4).toFixed(1));
      ring.style.strokeOpacity = String(0.35 + 0.35 * Math.sin(now / 300));
    }
    if (!reduce) requestAnimationFrame(ride);
  })(s0);
  if (fine) {
    const xv = $("#xv"),
      xd = $("#xd"),
      xr = $("#xr");
    rep.addEventListener("pointermove", (e) => {
      const m = chart.getScreenCTM();
      if (!m) return;
      const q = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
      if (q.x < samples[0].x - 30) {
        rep.classList.remove("xon");
        return;
      }
      let b = samples[0];
      for (const s of samples)
        if (Math.abs(s.x - q.x) < Math.abs(b.x - q.x)) b = s;
      xv.setAttribute("x1", b.x);
      xv.setAttribute("x2", b.x);
      xd.setAttribute("cx", b.x);
      xd.setAttribute("cy", b.y);
      xr.setAttribute("cx", b.x);
      xr.setAttribute("cy", b.y);
      rep.classList.add("xon");
    });
    rep.addEventListener("pointerleave", () => rep.classList.remove("xon"));
  }
})();

/* ---------- Creative Inspection: split-flap status ---------- */
(function () {
  const st = [
      "Pisanje",
      "Zakazivanje",
      "Snimanje",
      "Montaža",
      "Za objavu",
      "Objavljeno",
    ],
    el = $("#ciStat"),
    dots = $$("#ciDots i"),
    sheet = $("#ciSheet");
  let i = 0;
  const setH = () => sheet.style.setProperty("--sh", sheet.offsetHeight + "px");
  setH();
  addEventListener("resize", setH);
  if (reduce) return;
  setInterval(() => {
    i = (i + 1) % st.length;
    el.classList.remove("fi");
    el.classList.add("fo");
    setTimeout(() => {
      el.textContent = st[i];
      el.classList.remove("fo");
      void el.offsetWidth;
      el.classList.add("fi");
      dots.forEach((d, k) => d.classList.toggle("on", k <= i));
    }, 200);
  }, 1900);
})();

/* ---------- Organisation: shoot days light up ---------- */
(function () {
  const g = $("#calGd"),
    seq = [3, 9, 16, 22];
  g.innerHTML = Array.from(
    { length: 28 },
    (_, k) => `<i class="${seq.includes(k) ? "ev" : ""}"></i>`,
  ).join("");
  const cells = [...g.children];
  let i = 0;
  const hop = () => {
    cells.forEach((c) => c.classList.remove("on"));
    cells[seq[i % seq.length]].classList.add("on");
    i++;
  };
  hop();
  if (!reduce) setInterval(hop, 1400);
})();

/* ---------- page takeover: laser cut, the card grows into the page, title gets etched ---------- */
const take = $("#take"),
  pane = $("#pane"),
  cut = $("#cut");
let fromCard = null;
function openPage(card) {
  const url = CLIENT.pages[card.dataset.page];
  if (url) {
    location.href = url;
    return;
  }
  fromCard = card;
  const r = card.getBoundingClientRect(),
    bgc = getComputedStyle(card.querySelector(".bg")),
    grey = card.classList.contains("priv");
  const tt = $("#takeT");
  tt.style.fontSize = "";
  tt.innerHTML = etchHTML(card.dataset.title, "em");
  {
    const ew = tt.querySelector(".ew"),
      avail = innerWidth - 48;
    if (ew.offsetWidth > avail)
      tt.style.fontSize =
        (
          (parseFloat(getComputedStyle(tt).fontSize) * avail) /
          ew.offsetWidth
        ).toFixed(1) + "px";
  }
  take.classList.toggle("grey", grey);
  take.classList.remove("full", "bare");
  pane.style.backgroundImage = bgc.backgroundImage;
  pane.style.backgroundColor = bgc.backgroundColor;
  Object.assign(pane.style, {
    transition: "none",
    left: r.left + "px",
    top: r.top + "px",
    width: r.width + "px",
    height: r.height + "px",
    borderRadius: getComputedStyle(card).borderTopLeftRadius,
  });
  take.classList.add("on");
  take.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      pane.style.transition = reduce
        ? "none"
        : ["left", "top", "width", "height", "border-radius"]
            .map((p) => `${p} ${MT(800)}ms cubic-bezier(.75,0,.2,1)`)
            .join(",");
      Object.assign(pane.style, {
        left: "0px",
        top: "0px",
        width: "100vw",
        height: "100vh",
        borderRadius: "0px",
      });
      setTimeout(
        () => {
          take.classList.add("full");
          softTitle($("#takeT .ew"));
          setTimeout(
            () => $("#takeBack").focus({ preventScroll: true }),
            MT(300),
          );
        },
        reduce ? 0 : MT(620),
      );
    }),
  );
}
function closePage() {
  if (!fromCard) return;
  const card = fromCard,
    r = card.getBoundingClientRect();
  take.classList.remove("full");
  setTimeout(
    () => {
      Object.assign(pane.style, {
        left: r.left + "px",
        top: r.top + "px",
        width: r.width + "px",
        height: r.height + "px",
        borderRadius: getComputedStyle(card).borderTopLeftRadius,
      });
      setTimeout(
        () => {
          take.classList.remove("on", "bare");
          take.setAttribute("aria-hidden", "true");
          document.body.style.overflow = "";
          card.focus({ preventScroll: true });
          fromCard = null;
        },
        reduce ? 0 : MT(820),
      );
    },
    reduce ? 0 : MT(180),
  );
}
$("#takeBack").addEventListener("click", closePage);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (RP.esc()) return;
    if (!$("#vault").hidden) closeVault();
    else if (take.classList.contains("on") && !take.classList.contains("bare"))
      closePage();
  }
});

/* ---------- Privacy vault ---------- */
let unlocked = false;
try {
  unlocked = sessionStorage.getItem("skeylo-crm-priv-" + CLIENT.id) === "1";
} catch (e) {}
if (unlocked) $("#privCard").classList.add("open");
const vault = $("#vault"),
  vbox = $("#vbox"),
  vp = $("#vPass");
function openVault() {
  vault.hidden = false;
  vbox.classList.remove("ok", "bad");
  $("#vErr").textContent = "";
  vp.value = "";
  requestAnimationFrame(() => vault.classList.add("on"));
  setTimeout(() => vp.focus(), 120);
}
function closeVault() {
  vault.classList.remove("on");
  setTimeout(
    () => {
      vault.hidden = true;
    },
    reduce ? 0 : 350,
  );
}
$("#vNo").addEventListener("click", closeVault);
vault.addEventListener("click", (e) => {
  if (e.target === vault) closeVault();
});
/* bez submit događaja: u zaštićenom okviru (sandbox bez allow-forms) forma se ne šalje */
vbox.addEventListener("submit", (e) => {
  e.preventDefault();
  tryUnlock();
});
$("#vOk").addEventListener("click", tryUnlock);
vp.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    tryUnlock();
  }
});
let unlocking = false;
async function tryUnlock() {
  if (unlocking) return;
  unlocking = true;
  let ok = false;
  try {
    ok =
      window.CRM_AUTH && window.CRM_AUTH.privacy
        ? await window.CRM_AUTH.privacy(vp.value)
        : !!CLIENT.privacyPass &&
          vp.value.trim().toLowerCase() === CLIENT.privacyPass;
  } finally {
    unlocking = false;
  }
  if (ok) {
    vbox.classList.remove("bad");
    vbox.classList.add("ok");
    $("#vErr").textContent = "";
    unlocked = true;
    try {
      sessionStorage.setItem("skeylo-crm-priv-" + CLIENT.id, "1");
    } catch (err) {}
    $("#privCard").classList.add("open");
    setTimeout(
      () => {
        closeVault();
        setTimeout(() => RP.openPV($("#privCard")), reduce ? 0 : MT(260));
      },
      reduce ? 0 : MT(760),
    );
  } else {
    vbox.classList.remove("bad");
    void vbox.offsetWidth;
    vbox.classList.add("bad");
    $("#vErr").textContent = "Pogrešna šifra.";
    vp.select();
    try {
      navigator.vibrate && navigator.vibrate([20, 40, 20]);
    } catch (err) {}
  }
}

/* ---------- card clicks ---------- */
$$("#dash .card").forEach((c) =>
  c.addEventListener("click", (e) => {
    if (e.clientX || e.clientY)
      FX.sparks(e.clientX, e.clientY, 26, c.dataset.page !== "privacy");
    if (c.dataset.page === "reporting") {
      RP.open(c);
      return;
    }
    if (c.dataset.page === "creative-inspection") {
      RP.openCI(c);
      return;
    }
    if (c.dataset.page === "creatives") {
      RP.openCR(c);
      return;
    }
    if (c.dataset.page === "organisation") {
      RP.openOR(c);
      return;
    }
    if (c.dataset.page === "privacy") {
      if (unlocked) RP.openPV(c);
      else openVault();
      return;
    }
    if (c.dataset.page === "sistem") {
      RP.openSYS(c);
      return;
    }
    openPage(c);
  }),
);

/* =========================================================
   REPORTING DASHBOARD + CREATIVE INSPECTION + FINAL CREATIVES
   ---------------------------------------------------------
   Obe stranice čitaju ISTE podatke koje tim upisuje u Skeylo OS.
   Klijent ništa ne menja, samo čita. Jedino što klijent upisuje su
   komentari na skripte, a tim ih vidi u OS-u (Content Manager).

   Šema baze (ista u OS-u i ovde, ne menjati imena polja):
     items/{id}     {clientId, type:"cycle"|"month"|"platform"|"project", title, year?, month?, order}
                    ovde se prikazuju samo "cycle" i "month" (Ciklus 1/2/3/4, Oktobar…)
     reports/{id}   {clientId, monthId, title, loom, chunks, size, createdAt, order, createdBy}
     reportChunks/{reportId}_{i}  {reportId, clientId, i, data}  (pisani izveštaj, delovi od 80.000 znakova)
     scripts/{id}   {clientId, monthId, title, status, format, modelNames[], location, props, body, order, …}
                    status: write → schedule → record → edit → upload → uploaded
                    body = HTML iz OS editora (ovde se ponovo čisti pre prikaza)
     comments/{id}  {clientId, scriptId, monthId, text, quote, before, after,
                     author:"client", authorName, authorUid, createdAt, order, resolved}
                    quote = označeni tekst iz skripte ("" = komentar na celu skriptu)
                    before/after = tekst oko citata, da se citat nađe i kad se ponavlja
                    resolved = tim u OS-u klikne "Rešeno"

   Izvor podataka:
     CLIENT.data = "demo"      primer podaci (novi komentari ostaju samo u ovom pregledaču)
     CLIENT.data = "firebase"  posle logina klijenta pozovi:
                               SkeyloCRM.connect(firebase.firestore(), "ils", {uid:user.uid, name:"Ana"})
   Klijent sme da čita SAMO dokumente sa svojim clientId, a da piše samo komentare (Firestore pravila).

     creatives/{id} {clientId, monthId, title, kind:"video"|"image"|"carousel", files:[{url, type, w, h, dur, name, size}],
                     poster:{url}, order, createdAt, createdBy}   (Mihajlo ubacuje u OS-u → Final Creatives)
                    files = fajlovi u punom kvalitetu (karusel ima više slika), poster = mala slika za galeriju
     creativeComments/{id} {clientId, creativeId, monthId, text, at, slide, author:"client", authorName, authorUid, createdAt, order, resolved}
                    at = sekunda u videu (ili null), slide = redni broj slajda u karuselu od 0 (ili null)

   Navigacija ide samo preko location.hash, isto kao Skeylo OS:
     #reporting, #reporting.{period}, #reporting.{period}.loom|pisani, #reporting.{period}.pisani.{izveštaj}
     #creative, #creative.{period}, #creative.{period}.{skripta}
     #creatives, #creatives.{period}, #creatives.{period}.{kreativa}   (link za klijenta vodi pravo na kreative)
   ========================================================= */
const RP = (function () {
  const dash = $("#dash"),
    rapp = $("#rapp"),
    rmain = $("#rmain"),
    rsw = $("#rsw"),
    rtop = $("#rtop"),
    lov = $("#lov"),
    lovScreen = $("#lovScreen"),
    cnav = $("#cnav"),
    selbtn = $("#selbtn"),
    csheet = $("#csheet");
  const WIDE = matchMedia("(min-width:1100px)"),
    wide = () => WIDE.matches;
  const MON = [
    "januar",
    "februar",
    "mart",
    "april",
    "maj",
    "jun",
    "jul",
    "avgust",
    "septembar",
    "oktobar",
    "novembar",
    "decembar",
  ];
  const pl = (n, a, b, c) => {
    const x = n % 10,
      y = n % 100;
    return x === 1 && y !== 11
      ? a
      : x >= 2 && x <= 4 && (y < 12 || y > 14)
        ? b
        : c;
  };
  const pad = (n) => String(n).padStart(2, "0");
  const okLink = (u) => /^https:\/\/\S+$/i.test(u || "");
  const hasLoom = (r) => okLink(r.loom);
  const hasDoc = (r) => (r.chunks || 0) > 0;
  /* izveštaj može biti i stranica sa sajta (href: "/ils/marketing_plan");
     chunks tada nosi rezervni HTML sa linkom, za stariji kod */
  const pageOf = (r) =>
    /^\/[a-z0-9_\/-]+$/i.test(r.href || "") ? r.href : null;
  const fmtD = (ts) => {
    if (!ts) return "";
    const d = new Date(ts);
    return `${d.getDate()}. ${MON[d.getMonth()]} ${d.getFullYear()}`;
  };
  const fmtDM = (ts) => {
    if (!ts) return "";
    const d = new Date(ts);
    return `${d.getDate()}. ${MON[d.getMonth()]}`;
  };
  const cssq = (s) => String(s).replace(/["\\]/g, "\\$&");
  const squash = (s) => String(s || "").replace(/\s+/g, "");
  const periodLabel = (it) =>
    it.type === "month" && it.year && !/\d{4}$/.test(it.title || "")
      ? `${it.title} ${it.year}`
      : it.title || "Period";
  const numOf = (it) =>
    it.type === "month" && it.month
      ? String(it.month)
      : (/(\d+)\s*$/.exec(it.title || "") || [])[1] || "";
  function nameHTML(it) {
    if (it.type === "month") {
      const base = (it.title || "").replace(/\s*\d{4}$/, "");
      return `${esc(base)}${it.year ? `<span class="em yr">${it.year}</span>` : ""}`;
    }
    const m = /^(.*?\s)(\d+)$/.exec(it.title || "");
    return m
      ? `${esc(m[1])}<span class="em">${m[2]}</span>`
      : esc(it.title || "Period");
  }
  function nameParts(it) {
    if (it.type === "month") {
      const base = (it.title || "").replace(/\s*\d{4}$/, "");
      return it.year
        ? [{ t: base + " " }, { t: String(it.year), em: true }]
        : [{ t: base }];
    }
    const m = /^(.*?\s)(\d+)$/.exec(it.title || "");
    return m
      ? [{ t: m[1] }, { t: m[2], em: true }]
      : [{ t: it.title || "Period" }];
  }
  function ago(ts) {
    if (!ts) return "";
    const m = Math.round((Date.now() - ts) / 60000);
    if (m < 1) return "upravo";
    if (m < 60) return `pre ${m} min`;
    const h = Math.round(m / 60);
    if (h < 24) return `pre ${h} h`;
    const a = new Date(ts),
      y = new Date();
    y.setDate(y.getDate() - 1);
    if (a.toDateString() === y.toDateString()) return "juče";
    return `${a.getDate()}. ${MON[a.getMonth()].slice(0, 3)}${a.getFullYear() !== new Date().getFullYear() ? " " + a.getFullYear() : ""}`;
  }
  const SV = (p, w) =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w || 2}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
  const I_PLAY =
    '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg>';
  const I_DOC = SV(
    '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
  );
  const I_ARR = SV('<path d="M5 12h14M13 6l6 6-6 6"/>', 2.2);
  const I_EXT = SV('<path d="M7 17L17 7M9 7h8v8"/>', 2.2);
  const I_PEN = SV(
    '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  );
  const I_CHECK = SV('<path d="m5 12.5 4.5 4.5L19 7.5"/>', 2.8);
  const I_TRASH = SV('<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>');
  const I_MSG = SV(
    '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-5.1A8 8 0 1 1 21 12z"/>',
  );
  const I_FILM = SV(
    '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4"/>',
  );
  const I_CAR =
    '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="7.5" y="2.5" width="14" height="14" rx="3"/><path d="M3.5 7.5v10a3 3 0 0 0 3 3h10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  const I_STACK = SV(
    '<rect x="7" y="7" width="13" height="13" rx="2.5"/><path d="M4 16V6.5A2.5 2.5 0 0 1 6.5 4H16"/>',
    2.2,
  );
  const I_IMG = SV(
    '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/>',
    2.2,
  );

  /* faze skripte: iste kao u OS-u, ovde jasnim rečima za klijenta */
  const STAGES = [
    { id: "write", n: "Pisanje" },
    { id: "schedule", n: "Zakazivanje" },
    { id: "record", n: "Snimanje" },
    { id: "edit", n: "Montaža" },
    { id: "upload", n: "Za objavu" },
    { id: "uploaded", n: "Objavljeno" },
  ];
  const stageIx = (s) => {
    const i = STAGES.findIndex((x) => x.id === (s.status || "write"));
    return i < 0 ? 0 : i;
  };

  /* tekst skripte: ponovo se čisti, prolaze samo bezbedni tagovi */
  const OK_TAGS = new Set([
    "H1",
    "H2",
    "H3",
    "P",
    "DIV",
    "BR",
    "B",
    "STRONG",
    "I",
    "EM",
    "U",
    "S",
    "STRIKE",
    "SPAN",
    "UL",
    "OL",
    "LI",
    "IMG",
    "A",
    "HR",
    "BLOCKQUOTE",
    "TABLE",
    "THEAD",
    "TBODY",
    "TR",
    "TH",
    "TD",
  ]);
  const DROP = new Set([
    "SCRIPT",
    "STYLE",
    "IFRAME",
    "OBJECT",
    "EMBED",
    "SVG",
    "MATH",
    "TEMPLATE",
    "LINK",
    "META",
    "FORM",
    "INPUT",
    "BUTTON",
    "TEXTAREA",
    "SELECT",
    "VIDEO",
    "AUDIO",
    "CANVAS",
  ]);
  function clean(html) {
    const t = document.createElement("template");
    t.innerHTML = html || "";
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) return;
        if (n.nodeType !== 1) {
          n.remove();
          return;
        }
        const tag = n.tagName;
        if (DROP.has(tag)) {
          n.remove();
          return;
        }
        walk(n);
        if (!OK_TAGS.has(tag)) {
          n.replaceWith(...n.childNodes);
          return;
        }
        const grey = tag === "SPAN" && n.classList.contains("grey");
        if (tag === "SPAN" && !grey) {
          n.replaceWith(...n.childNodes);
          return;
        }
        const keep = {};
        if (tag === "OL") {
          const st = parseInt(n.getAttribute("start"), 10);
          if (st >= 0 && st !== 1) keep.start = st;
        }
        if (tag === "IMG") {
          const src = n.getAttribute("src") || "";
          if (!/^(https:\/\/|data:image\/(png|jpe?g|gif|webp);)/i.test(src)) {
            n.remove();
            return;
          }
          Object.assign(keep, {
            src,
            alt: "",
            loading: "lazy",
            referrerpolicy: "no-referrer",
          });
        }
        if (tag === "A") {
          const href = n.getAttribute("href") || "",
            name = (
              n.getAttribute("data-name") ||
              n.textContent ||
              "Fajl"
            ).trim();
          if (!/^https:\/\//i.test(href)) {
            const sp = document.createElement("span");
            sp.className = "pfile off";
            sp.textContent = name;
            n.replaceWith(sp);
            return;
          }
          n.textContent = name;
          Object.assign(keep, {
            href,
            target: "_blank",
            rel: "noopener noreferrer",
            class: "pfile",
          });
        }
        if (grey) keep.class = "grey";
        [...n.attributes].forEach((a) => n.removeAttribute(a.name));
        for (const k in keep) n.setAttribute(k, keep[k]);
      });
    };
    walk(t.content);
    return t.innerHTML;
  }
  const plain = (h) => {
    const t = document.createElement("template");
    t.innerHTML = h || "";
    return (t.content.textContent || "").trim();
  };
  const bodyOf = (s) => {
    const h = clean(s.body);
    return plain(h) || /<img/i.test(h) ? h : "";
  };
  const visibleScript = (s) => !!((s.title || "").trim() || plain(s.body));

  /* ---------- izvori podataka ---------- */
  function demoSchedules(cid) {
    const ds = (k) => {
      const d = new Date();
      d.setDate(d.getDate() + k);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    };
    const S = (id, k, items, locs) => {
      const sc = items.filter((x) => x.k === "scene"),
        ms = [...new Set(sc.flatMap((x) => x.models || []))];
      return {
        id: "demo-o" + id,
        clientId: cid,
        date: ds(k),
        start: items[0].start,
        end: items[items.length - 1].end,
        items,
        models: ms,
        locations: locs,
        updatedAt: Date.now(),
        order: k,
        demo: true,
      };
    };
    const sc = (start, end, dur, title, models, location, props, lines) => ({
      k: "scene",
      start,
      end,
      dur,
      title,
      models,
      location,
      props,
      lines,
    });
    const L1 = "Infinity Laser Studio, Bulevar oslobođenja 12, Novi Sad",
      L2 = "Infinity Laser Studio, Sombor";
    return [
      S(
        1,
        3,
        [
          sc(
            "09:00",
            "10:00",
            60,
            "Prvi tretman",
            ["dr Ana Kasap", "Iva"],
            L1,
            "Bela uniforma, laser na kolicima",
            [
              "Brijač ti svakog dana uzme deset minuta. Hajde da to promenimo.",
              "U Infinity Laser Studiju svaki tretman se radi uz nadzor lekara.",
            ],
          ),
          sc(
            "10:00",
            "10:45",
            45,
            "POV: prvi put na laseru",
            ["Iva"],
            L1,
            "Telefon na stalku, ogledalo",
            [
              "Da li boli? Većina oseti samo blago toplo peckanje.",
              "Koliko traje? Kraće od tvoje kafe.",
            ],
          ),
          { k: "pause", start: "10:45", end: "11:15", dur: 30 },
          sc(
            "11:15",
            "12:15",
            60,
            "Dan u studiju",
            ["Branka", "dr Ana Kasap"],
            L1,
            "Kafa, rokovnik, cveće na recepciji",
            [
              "09:00 Kafa i prvi osmeh.",
              "13:00 Pauza.",
              "17:30 Poslednji termin.",
            ],
          ),
          { k: "travel", start: "12:15", end: "12:35", dur: 20 },
          sc(
            "12:35",
            "13:30",
            55,
            "Leto se sprema u oktobru",
            ["Sara"],
            "Kej, Novi Sad",
            "Lagana jakna, kalendar",
            [
              "Leto bez brijača počinje sada.",
              "Zakaži prvi tretman u oktobru.",
            ],
          ),
        ],
        [L1, "Kej, Novi Sad"],
      ),
      S(
        2,
        11,
        [
          sc(
            "10:00",
            "11:30",
            90,
            "Zašto Infinity",
            ["dr Ana Kasap", "Branka"],
            L2,
            "Logo zid, bele peškire",
            [
              "Zašto baš mi? Pokazujemo kako izgleda jedan termin, od dolaska do kraja.",
            ],
          ),
        ],
        [L2],
      ),
      S(
        3,
        -6,
        [
          sc(
            "09:30",
            "10:30",
            60,
            "3 mita o laseru",
            ["dr Ana Kasap"],
            L1,
            "",
            [
              "Mit: laser se radi samo leti. Istina: jesen i zima su najbolje vreme za početak.",
            ],
          ),
          { k: "pause", start: "10:30", end: "10:50", dur: 20 },
          sc(
            "10:50",
            "11:40",
            50,
            "Drugarica pita",
            ["Iva", "Sara"],
            L1,
            "Dve šolje kafe",
            ["Je l' te bolelo? Ni malo kako sam mislila."],
          ),
        ],
        [L1],
      ),
      S(
        4,
        -21,
        [
          sc(
            "11:00",
            "12:30",
            90,
            "Upoznaj tim",
            ["dr Ana Kasap", "Iva", "Branka"],
            L1,
            "Uniforme, cveće",
            ["Ovo je tim koji te dočekuje na svakom terminu."],
          ),
        ],
        [L1],
      ),
      S(
        5,
        -37,
        [
          sc("10:00", "11:00", 60, "Novo u Novom Sadu", ["Iva"], L1, "", [
            "Novo u Novom Sadu: laserska epilacija bez čekanja.",
          ]),
        ],
        [L1],
      ),
    ];
  }
  function guestOnly(src) {
    return {
      demo: src.demo,
      subscribe(cb, err) {
        return src.subscribe((d) => {
          const o = {};
          if (d.schedules)
            o.schedules = d.schedules.filter((x) => x.id === GUEST);
          [
            "items",
            "reports",
            "scripts",
            "comments",
            "creatives",
            "creativeComments",
          ].forEach((k) => {
            if (k in d) o[k] = [];
          });
          cb(o);
        }, err);
      },
    };
  }
  function demoVault(cid) {
    const V = (id, platform, label, login, password, note) => ({
      id: "demo-v" + id,
      clientId: cid,
      platform,
      platformName: "",
      label,
      login,
      password,
      note,
      order: id,
      demo: true,
    });
    return [
      V(
        1,
        "instagram",
        "@infinitylaserns",
        "infinitylaser.ns@gmail.com",
        "Primer#Insta2026",
        "Kod za prijavu stiže na ovaj mejl.",
      ),
      V(
        2,
        "instagram",
        "@infinitylaser.sombor",
        "infinitylaser.sombor@gmail.com",
        "Primer#Sombor26",
        "",
      ),
      V(
        3,
        "facebook",
        "Infinity Laser Studio",
        "infinitylaser.ns@gmail.com",
        "Primer#Fb2026",
        "",
      ),
      V(
        4,
        "meta",
        "Business Manager",
        "infinitylaser.ns@gmail.com",
        "Primer#Meta2026",
        "Admin: Ana i Filip.",
      ),
      V(
        5,
        "tiktok",
        "@infinitylaser",
        "infinitylaser.ns@gmail.com",
        "Primer#Tok2026",
        "",
      ),
      V(
        6,
        "google",
        "Google nalog (Maps, YouTube, Ads)",
        "infinitylaser.ns@gmail.com",
        "Primer#Gugl2026",
        "Dvostepena potvrda ide na telefon recepcije.",
      ),
    ];
  }
  function demoSource() {
    const cid = CLIENT.id,
      t = (y, m, d, h) => new Date(y, m - 1, d, h || 11, 0).getTime(),
      L = "https://www.loom.com/share/primer-";
    const items = [
      {
        id: cid + "-p",
        clientId: cid,
        type: "platform",
        title: "Client Platform",
        order: 0,
      },
      {
        id: cid + "-1",
        clientId: cid,
        type: "cycle",
        title: "Ciklus 1",
        order: 1,
      },
      {
        id: cid + "-2",
        clientId: cid,
        type: "cycle",
        title: "Ciklus 2",
        order: 2,
      },
      {
        id: cid + "-3",
        clientId: cid,
        type: "cycle",
        title: "Ciklus 3",
        order: 3,
      },
      {
        id: cid + "-4",
        clientId: cid,
        type: "cycle",
        title: "Ciklus 4",
        order: 4,
      },
      {
        id: cid + "-2026-10",
        clientId: cid,
        type: "month",
        title: "Oktobar",
        year: 2026,
        month: 10,
        order: 5,
      },
    ];
    const reports = [
      [
        "r9",
        "2026-10",
        "Google Ads · prvih 7 dana",
        L + "google-7-dana",
        t(2026, 10, 13, 16),
        "luka",
      ],
      [
        "r8",
        "2026-10",
        "Meta Ads · nedeljni pregled",
        L + "meta-nedelja",
        t(2026, 10, 9, 12),
        "filip",
      ],
      [
        "r7",
        "2026-10",
        "Plan kampanja za oktobar",
        "",
        t(2026, 10, 2, 10),
        "filip",
      ],
      [
        "r6",
        "4",
        "Meta Ads · rezultati ciklusa",
        L + "ciklus-4",
        t(2026, 9, 26, 15),
        "filip",
      ],
      [
        "r5",
        "4",
        "Kreative · šta radi, šta ne",
        L + "kreative",
        t(2026, 9, 12, 13),
        "filip",
      ],
      [
        "r4",
        "3",
        "Meta Ads · rezultati ciklusa",
        L + "ciklus-3",
        t(2026, 8, 28, 14),
        "filip",
      ],
      [
        "r3",
        "3",
        "Lead forma · prvi rezultati",
        "",
        t(2026, 8, 14, 11),
        "luka",
      ],
      [
        "r2",
        "2",
        "Meta Ads · rezultati ciklusa",
        "",
        t(2026, 7, 29, 12),
        "filip",
      ],
      [
        "r1",
        "1",
        "Početak saradnje · polazno stanje",
        L + "start",
        t(2026, 6, 30, 10),
        "filip",
      ],
    ].map(([id, m, title, loom, ts, who]) => ({
      id: "demo-" + id,
      clientId: cid,
      monthId: cid + "-" + m,
      title,
      loom,
      chunks: 1,
      size: 0,
      createdAt: ts,
      order: ts,
      createdBy: who,
      demo: true,
    }));
    const scripts = demoScripts(cid),
      creatives = demoCreatives(cid),
      schedules = demoSchedules(cid);
    let cb = null;
    /* demo šifre su izmišljene i žive samo dok je stranica otvorena (prave idu samo na sajt, preko Firebase-a) */
    let vault = demoVault(cid);
    /* komentari iz demo pregleda ostaju samo u ovom pregledaču */
    const store = (key, seed) => {
      let a = null;
      try {
        const raw = localStorage.getItem(key);
        if (raw) a = JSON.parse(raw);
      } catch (e) {}
      return { key, arr: Array.isArray(a) ? a : seed };
    };
    const DB = {
      comments: store("skeylo-crm-demo-comments-v1-" + cid, demoComments(cid)),
      creativeComments: store(
        "skeylo-crm-demo-ccomments-v1-" + cid,
        demoCComments(cid),
      ),
    };
    const save = (col) => {
      try {
        localStorage.setItem(DB[col].key, JSON.stringify(DB[col].arr));
      } catch (e) {}
    };
    const emit = (col) =>
      setTimeout(() => {
        cb && cb({ [col]: DB[col].arr.slice() });
      }, 0);
    return {
      demo: true,
      subscribe(f) {
        cb = f;
        const tm = setTimeout(
          () =>
            f({
              items,
              reports,
              scripts,
              comments: DB.comments.arr.slice(),
              creatives,
              creativeComments: DB.creativeComments.arr.slice(),
              schedules,
              vault: vault.slice(),
            }),
          0,
        );
        return () => {
          clearTimeout(tm);
          cb = null;
        };
      },
      async html(r) {
        return demoHTML(r);
      },
      newId() {
        return (
          "c-" +
          Date.now().toString(36) +
          Math.random().toString(36).slice(2, 7)
        );
      },
      async putComment(id, c, col) {
        col = col || "comments";
        DB[col].arr = DB[col].arr
          .filter((x) => x.id !== id)
          .concat([{ id, ...c }]);
        save(col);
        emit(col);
      },
      async putVault(id, c) {
        vault = vault.filter((x) => x.id !== id).concat([{ id, ...c }]);
        setTimeout(() => {
          cb && cb({ vault: vault.slice() });
        }, 0);
      },
      async delVault(id) {
        vault = vault.filter((x) => x.id !== id);
        setTimeout(() => {
          cb && cb({ vault: vault.slice() });
        }, 0);
      },
      async delComment(id, col) {
        col = col || "comments";
        DB[col].arr = DB[col].arr.filter((x) => x.id !== id);
        save(col);
        emit(col);
      },
    };
  }
  function demoScripts(cid) {
    const g = (s) => `<p><span class="grey">${s}</span></p>`;
    const S = (
      id,
      m,
      order,
      status,
      format,
      models,
      location,
      props,
      title,
      body,
    ) => ({
      id: "demo-" + id,
      clientId: cid,
      monthId: cid + "-" + m,
      title,
      status,
      format,
      modelNames: models,
      location,
      props,
      body,
      order,
      demo: true,
    });
    const STUDIO = "Infinity Laser Studio, Novi Sad";
    return [
      S(
        "s1",
        "2026-10",
        1000,
        "write",
        "Sales Video",
        ["dr Ana Kasap"],
        STUDIO,
        "",
        "Prvi tretman",
        `<h2>Hook</h2>${g("Kadar: dr Ana gleda pravo u kameru, laser je iza nje.")}<p>Brijač ti svakog dana uzme deset minuta. Hajde da to promenimo.</p><h2>Telo</h2><p>U Infinity Laser Studiju svaki tretman se radi uz nadzor lekara.</p><p>Prvi tretman je besplatan za sve nove klijentkinje.</p><p>Tretman traje kratko, a većina klijentkinja oseti samo blago toplo peckanje.</p><h2>CTA</h2><p>Zakaži konsultacije preko linka u opisu. Termini za oktobar se brzo popunjavaju.</p>`,
      ),
      S(
        "s2",
        "2026-10",
        2000,
        "write",
        "Montage",
        ["Sara ILS", "Tanja ILS"],
        "",
        "",
        "Leto se sprema u oktobru",
        `<h2>Hook</h2><p>Ako želiš leto bez brijača, počinješ sada. Ne u junu.</p><h2>Telo</h2>${g("Brza montaža: kalendar se lista od oktobra do juna, svaki mesec jedan kadar iz studija.")}<p>Laserskoj epilaciji treba nekoliko tretmana u razmaku od par nedelja. Zato je jesen najbolje vreme za početak.</p><ul><li>Oktobar: prvi tretman</li><li>Zima: dlačice su sve slabije</li><li>Jun: glatka koža, bez brijača</li></ul><h2>CTA</h2><p>Javi nam se danas i dobijaš plan tretmana do leta.</p>`,
      ),
      S(
        "s3",
        "2026-10",
        1000,
        "schedule",
        "Sales Video",
        ["Mila Jurić", "Tara Stojšić"],
        STUDIO,
        "",
        "Studio sa 5 zvezdica",
        `<h2>Hook</h2><p>Klijentkinje nam se vraćaju i dovode drugarice. Evo zašto.</p><h2>Telo</h2>${g("Tri kratka kadra. Svaka klijentkinja svojim rečima kaže jednu stvar:")}<ol><li>kako izgleda leto bez brijača</li><li>kakav je osećaj kad uđe u studio</li><li>šta joj je objašnjeno pre prvog tretmana</li></ol><h2>CTA</h2><p>Zakaži svoj termin i uveri se sama.</p>`,
      ),
      S(
        "s4",
        "2026-10",
        1000,
        "record",
        "Skit",
        ["Branka Kasap", "Tara Stojšić"],
        STUDIO,
        "Kafa i cveće na recepciji",
        "Otvorena nedelja",
        `<h2>Hook</h2>${g("Branka otvara vrata studija kao da je turistički vodič.")}<p>Dobro došli na najkraću turu u Novom Sadu.</p><h2>Telo</h2><p>Ovo je recepcija. Ovde dobijaš kafu i odgovor na svako pitanje.</p><p>Ovo je soba za tretman. Ovde brijači odlaze u penziju.</p>${g("Tara ulazi u kadar sa brijačem i baca ga u kantu.")}<h2>CTA</h2><p>Ove nedelje su vrata otvorena za sve. Svrati, upoznaj tim i pitaj šta god te zanima.</p>`,
      ),
      S(
        "s5",
        "2026-10",
        1000,
        "edit",
        "POV",
        ["Sara ILS"],
        STUDIO,
        "",
        "POV: prvi put na laseru",
        `<h2>Hook</h2><p>POV: prvi put dolaziš na lasersku epilaciju i misliš da će da boli.</p><h2>Telo</h2>${g("Kamera iz prvog lica. Ruka otvara vrata, osmeh na recepciji, kratak razgovor pre tretmana.")}<p>Prvo kratak razgovor i pregled kože. Onda zaštitne naočare. I to je to.</p><h2>CTA</h2><p>Tvoj prvi put može da bude ove nedelje. Link je u opisu.</p>`,
      ),
      S(
        "s6",
        "2026-10",
        1000,
        "upload",
        "Carousel",
        [],
        "",
        "",
        "3 mita o laseru",
        `<h2>Slajd 1</h2><p>3 mita o laserskoj epilaciji u koja si verovala.</p><h2>Slajd 2</h2><p><b>Mit:</b> Jedan tretman je dovoljan.<br><b>Istina:</b> Potrebno je nekoliko tretmana u razmaku od par nedelja.</p><h2>Slajd 3</h2><p><b>Mit:</b> Laser se radi samo leti.<br><b>Istina:</b> Jesen i zima su najbolje vreme za početak.</p><h2>Slajd 4</h2><p><b>Mit:</b> Laser je samo za žene.<br><b>Istina:</b> Sve više muškaraca dolazi na tretman leđa i ramena.</p><h2>Slajd 5</h2><p>Zakaži konsultacije i saznaj šta važi za tvoju kožu.</p>`,
      ),
      S(
        "s7",
        "2026-10",
        1000,
        "uploaded",
        "Montage",
        ["Tanja ILS"],
        STUDIO,
        "",
        "Dan u studiju",
        `<h2>Hook</h2><p>Kako izgleda jedan dan u Infinity Laser Studiju?</p><h2>Telo</h2>${g("Ubrzani snimak od otvaranja do zatvaranja: kafa, prva klijentkinja, pauza, poslednji termin.")}<p>Od jutra do večeri, svaka klijentkinja dobija isti osmeh i istu pažnju.</p><h2>CTA</h2><p>Postani deo naše priče. Termini su u opisu.</p>`,
      ),
      S(
        "s8",
        "4",
        1000,
        "uploaded",
        "Sales Video",
        ["dr Ana Kasap"],
        STUDIO,
        "",
        "Zašto Infinity",
        `<h2>Hook</h2><p>Laser nije isto što i laser. Evo razlike.</p><h2>Telo</h2><p>Kod nas tretman počinje razgovorom i pregledom kože, a ne cenovnikom.</p><h2>CTA</h2><p>Zakaži konsultacije i vidi razliku.</p>`,
      ),
      S(
        "s9",
        "4",
        2000,
        "uploaded",
        "Skit",
        ["Branka Kasap", "Mila Jurić"],
        STUDIO,
        "",
        "Drugarica pita",
        `<h2>Hook</h2><p>„Ozbiljno, gde ti je brijač?“</p><h2>Telo</h2>${g("Dve drugarice se spremaju za izlazak. Jedna se žuri, druga je mirna.")}<p>Laser. Prošle jeseni. Od tada nemam brigu.</p><h2>CTA</h2><p>Povedi drugaricu i dođite zajedno.</p>`,
      ),
      S(
        "s10",
        "4",
        3000,
        "uploaded",
        "Static Image",
        [],
        "",
        "",
        "Jesen je za laser",
        `<h2>Tekst na slici</h2><p>Jesen je za laser.</p><h2>Opis</h2><p>Sezona je idealna za početak tretmana. Termini su otvoreni.</p>`,
      ),
      S(
        "s11",
        "3",
        1000,
        "uploaded",
        "POV",
        ["Sara ILS"],
        STUDIO,
        "",
        "POV: posle trećeg tretmana",
        `<h2>Hook</h2><p>POV: treći tretman i shvataš da se brijač prašnjava.</p><h2>Telo</h2><p>Svaki tretman je kraći od kafe sa drugaricom.</p><h2>CTA</h2><p>Kreni i ti. Link je u opisu.</p>`,
      ),
      S(
        "s12",
        "3",
        2000,
        "uploaded",
        "Carousel",
        [],
        "",
        "",
        "Šta da radiš pre tretmana",
        `<h2>Slajd 1</h2><p>Spremaš se za prvi tretman? Evo šta treba da znaš.</p><h2>Slajd 2</h2><p>Dve nedelje pre tretmana ne idi na sunčanje.</p><h2>Slajd 3</h2><p>Dan pre tretmana obrij regiju koja se tretira.</p><h2>Slajd 4</h2><p>Sve ostalo ti objasnimo u studiju.</p>`,
      ),
      S(
        "s13",
        "2",
        1000,
        "uploaded",
        "Sales Video",
        ["dr Ana Kasap"],
        STUDIO,
        "",
        "Upoznaj doktorku",
        `<h2>Hook</h2><p>Ko stoji iza svakog tretmana u Infinity Laser Studiju?</p><h2>Telo</h2><p>dr Ana objašnjava kako izgleda prvi pregled i zašto je važan.</p><h2>CTA</h2><p>Zakaži konsultacije.</p>`,
      ),
      S(
        "s14",
        "2",
        2000,
        "uploaded",
        "Montage",
        ["Tanja ILS"],
        STUDIO,
        "",
        "Studio iznutra",
        `<h2>Hook</h2><p>Dobro došla u Infinity Laser Studio.</p><h2>Telo</h2>${g("Kadrovi enterijera, mirna muzika, detalji opreme.")}<p>Mesto gde se opustiš od prvog trenutka.</p><h2>CTA</h2><p>Vidimo se uskoro.</p>`,
      ),
      S(
        "s15",
        "1",
        1000,
        "uploaded",
        "Static Image",
        [],
        "",
        "",
        "Novo u Novom Sadu",
        `<h2>Tekst na slici</h2><p>Laserska epilacija u srcu Novog Sada.</p><h2>Opis</h2><p>Otvorili smo vrata. Zakaži termin.</p>`,
      ),
    ];
  }
  function demoComments(cid) {
    const now = Date.now(),
      H = 3600000,
      who = (CLIENT.user && CLIENT.user.name) || "Ana";
    const C = (id, sid, m, text, quote, before, after, age, res) => ({
      id: "demo-" + id,
      clientId: cid,
      scriptId: "demo-" + sid,
      monthId: cid + "-" + m,
      text,
      quote,
      before,
      after,
      author: "client",
      authorName: who,
      authorUid: null,
      createdAt: now - age,
      order: now - age,
      resolved: !!res,
    });
    return [
      C(
        "c1",
        "s1",
        "2026-10",
        "Promeni ovo, prvi tretman nije besplatan. Možemo da ponudimo besplatne konsultacije.",
        "Prvi tretman je besplatan za sve nove klijentkinje.",
        "radi uz nadzor lekara.",
        "Tretman traje kratko",
        2 * H,
      ),
      C(
        "c2",
        "s2",
        "2026-10",
        "Može li umesto juna da stoji maj? Kod nas sezona počinje ranije.",
        "Jun: glatka koža, bez brijača",
        "sve slabije",
        "CTA Javi nam se",
        26 * H,
      ),
      C(
        "c3",
        "s3",
        "2026-10",
        "Dodajte i kadar recepcije, tamo nas klijentkinje prvo vide.",
        "",
        "",
        "",
        3 * 24 * H,
        true,
      ),
    ];
  }
  /* primer kreativa: pravi fajlovi stižu iz Skeylo OS-a (Final Creatives) */
  function demoCreatives(cid) {
    const MAP = typeof CRM_MEDIA !== "undefined" && CRM_MEDIA ? CRM_MEDIA : {},
      M = (n) => ({ url: MAP[n] || "media/" + n });
    const V = (id, m, order, title, name, dur) => ({
      id: "demo-" + id,
      clientId: cid,
      monthId: cid + "-" + m,
      title,
      kind: "video",
      files: [
        { ...M(name + ".mp4"), type: "video/mp4", w: 1080, h: 1920, dur },
      ],
      poster: M(name + "-p.jpg"),
      order,
      demo: true,
    });
    const I = (id, m, order, title, name) => ({
      id: "demo-" + id,
      clientId: cid,
      monthId: cid + "-" + m,
      title,
      kind: "image",
      files: [{ ...M(name + ".jpg"), type: "image/jpeg", w: 1080, h: 1350 }],
      poster: M(name + "-t.jpg"),
      order,
      demo: true,
    });
    return [
      V("k1", "2026-10", 1, "Prvi tretman", "prvi", 8),
      V("k2", "2026-10", 2, "Leto se sprema u oktobru", "leto", 8),
      V("k3", "2026-10", 3, "POV: prvi put na laseru", "pov", 8),
      {
        id: "demo-k4",
        clientId: cid,
        monthId: cid + "-2026-10",
        title: "3 mita o laseru",
        kind: "carousel",
        files: [1, 2, 3, 4, 5].map((i) => ({
          ...M(`mit${i}.jpg`),
          type: "image/jpeg",
          w: 1080,
          h: 1350,
        })),
        poster: M("mit1-t.jpg"),
        order: 4,
        demo: true,
      },
      V("k5", "2026-10", 5, "Dan u studiju", "dan", 8),
      I("k6", "2026-10", 6, "Jesen je za laser", "jesen"),
      V("k7", "4", 1, "Zašto Infinity", "zasto", 6.5),
      I("k8", "4", 2, "Drugarica pita", "drugarica"),
      I("k9", "3", 1, "Posle trećeg tretmana", "treci"),
      I("k10", "3", 2, "Pre prvog tretmana", "pre"),
      I("k11", "2", 1, "Upoznaj tim", "tim"),
      I("k12", "1", 1, "Novo u Novom Sadu", "novo"),
    ];
  }
  function demoCComments(cid) {
    const now = Date.now(),
      H = 3600000,
      who = (CLIENT.user && CLIENT.user.name) || "Ana";
    const C = (id, kid, m, text, at, slide, age, res) => ({
      id: "demo-" + id,
      clientId: cid,
      creativeId: "demo-" + kid,
      monthId: cid + "-" + m,
      text,
      at,
      slide,
      author: "client",
      authorName: who,
      authorUid: null,
      createdAt: now - age,
      order: now - age,
      resolved: !!res,
    });
    return [
      C(
        "q1",
        "k1",
        "2026-10",
        "Neka „10 minuta“ ostane malo duže na ekranu.",
        2.4,
        null,
        3 * H,
      ),
      C(
        "q2",
        "k4",
        "2026-10",
        "Na ovom slajdu dodajte i noge, ne samo leđa i ramena.",
        null,
        3,
        28 * H,
      ),
      C(
        "q3",
        "k2",
        "2026-10",
        "Super je. Pošaljite nam i verziju bez teksta na kraju.",
        null,
        null,
        2 * 24 * H,
        true,
      ),
    ];
  }
  function firestoreSource(db, clientId) {
    const docs = (s) => s.docs.map((d) => ({ id: d.id, ...d.data() }));
    return {
      demo: false,
      subscribe(cb, err) {
        const u = [
          "items",
          "reports",
          "scripts",
          "comments",
          "creatives",
          "creativeComments",
          "schedules",
          "vault",
        ].map((c) =>
          db
            .collection(c)
            .where("clientId", "==", clientId)
            .onSnapshot(
              (s) => cb({ [c]: docs(s) }),
              (e) => err(c, e),
            ),
        );
        return () =>
          u.forEach((f) => {
            try {
              f();
            } catch (e) {}
          });
      },
      async html(r) {
        const n = Math.max(1, r.chunks || 1);
        const snaps = await Promise.all(
          Array.from({ length: n }, (_, i) =>
            db.doc(`reportChunks/${r.id}_${i}`).get(),
          ),
        );
        return snaps
          .map((s) => {
            if (!s.exists) throw new Error("missing");
            return (s.data() || {}).data || "";
          })
          .join("");
      },
      newId(col) {
        return db.collection(col || "comments").doc().id;
      },
      async putComment(id, c, col) {
        await db.doc((col || "comments") + "/" + id).set(c);
      },
      async delComment(id, col) {
        await db.doc((col || "comments") + "/" + id).delete();
      },
      async putVault(id, c) {
        await db.doc("vault/" + id).set(c);
      },
      async delVault(id) {
        await db.doc("vault/" + id).delete();
      },
    };
  }
  function demoHTML(r) {
    const P = ST.P.get(r.monthId),
      per = P ? periodLabel(P.it) : "";
    const seed = [...r.id].reduce(
        (a, c) => (a * 31 + c.charCodeAt(0)) >>> 0,
        7,
      ),
      v = (k) => ((seed * (k + 3) * 9301 + 49297) % 233280) / 233280;
    const spend = Math.round(240 + v(1) * 460),
      leads = Math.round(28 + v(2) * 70),
      cpl = (spend / leads).toFixed(2).replace(".", ","),
      ctr = (1.6 + v(3) * 2).toFixed(1).replace(".", ",");
    const bars = Array.from({ length: 7 }, (_, i) =>
      Math.round(28 + v(i + 5) * 72),
    );
    return `<!doctype html><html lang="sr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>
body{margin:0;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;background:#faf5f4;color:#24171c}
.w{max-width:860px;margin:0 auto;padding:40px 22px 70px}
.demo{display:inline-block;padding:7px 13px;border-radius:999px;background:#ffe6d2;color:#93450f;font-size:13px;font-weight:600;letter-spacing:.03em}
h1{font-family:Georgia,"Times New Roman",serif;font-weight:400;font-size:clamp(30px,6vw,44px);line-height:1.1;margin:18px 0 8px}
.sub{color:#7c6870;margin:0 0 28px}
.k{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin-bottom:24px}
.k div{background:#fff;border:1px solid #eadcdd;border-radius:16px;padding:16px 18px}
.k small{display:block;color:#7c6870;font-size:13px;margin-bottom:6px}.k b{font-size:28px;font-weight:600}
.c{background:#fff;border:1px solid #eadcdd;border-radius:16px;padding:18px}
.c small{color:#7c6870}
.bars{display:flex;align-items:flex-end;gap:10px;height:160px;margin-top:14px}
.bars i{flex:1;background:linear-gradient(#d79aa2,#b8737d);border-radius:6px 6px 0 0}
.days{display:flex;gap:10px;margin-top:8px;color:#7c6870;font-size:12px}.days span{flex:1;text-align:center}
h2{font-family:Georgia,"Times New Roman",serif;font-weight:400;font-size:24px;margin:30px 0 6px}
p{line-height:1.65;margin:0}
</style></head><body><div class="w">
<span class="demo">PRIMER IZVEŠTAJA · brojevi nisu pravi</span>
<h1>${esc(r.title || "Izveštaj")}</h1>
<p class="sub">${esc(CLIENT.name)} · ${esc(per)} · ${fmtD(r.createdAt)}</p>
<div class="k"><div><small>Potrošeno</small><b>${spend} €</b></div><div><small>Leadovi</small><b>${leads}</b></div><div><small>Cena po leadu</small><b>${cpl} €</b></div><div><small>CTR</small><b>${ctr} %</b></div></div>
<div class="c"><small>Leadovi po danu</small><div class="bars">${bars.map((h) => `<i style="height:${h}%"></i>`).join("")}</div><div class="days">${["pon", "uto", "sre", "čet", "pet", "sub", "ned"].map((d) => `<span>${d}</span>`).join("")}</div></div>
<h2>Šta smo uradili</h2><p>Ovako izgleda pisani izveštaj u platformi. Pravi izveštaj Skeylo tim otpremi u Skeylo OS (Projects → ${esc(CLIENT.short || CLIENT.name)} → ${esc(per)} → Reporting Dashboard) i on se odmah pojavi ovde.</p>
<h2>Sledeći koraci</h2><p>U pravom izveštaju ovde stoje zaključci i plan za naredni period.</p>
</div></body></html>`;
  }

  /* ---------- stanje ---------- */
  const ST = {
    ready: false,
    ciReady: false,
    crReady: false,
    err: null,
    ciErr: null,
    cmErr: null,
    crErr: null,
    ccErr: null,
    periods: [],
    P: new Map(),
    R: new Map(),
    S: new Map(),
    C: new Map(),
    byS: new Map(),
    CR: new Map(),
    ccBy: new Map(),
    O: new Map(),
    oList: [],
    V: [],
    pvReady: false,
    pvErr: null,
    orgReady: false,
    orgErr: null,
    oKnown: null,
    latest: null,
    known: null,
    crKnown: null,
    fresh: new Set(),
    crFresh: new Set(),
    seen: new Map(),
    cfresh: new Set(),
    resSeen: new Set(),
    shown: new Set(),
    burnt: new Set(),
  };
  const RAW = {
      items: null,
      reports: null,
      scripts: null,
      comments: null,
      creatives: null,
      creativeComments: null,
      schedules: null,
      vault: null,
    },
    ERR = {};
  let SRC = null,
    unsub = null;
  function useSource(src) {
    if (unsub) {
      try {
        unsub();
      } catch (e) {}
    }
    SRC = src;
    for (const k in RAW) RAW[k] = null;
    for (const k in ERR) delete ERR[k];
    Object.assign(ST, {
      ready: false,
      ciReady: false,
      crReady: false,
      orgReady: false,
      pvReady: false,
      pvErr: null,
      err: null,
      ciErr: null,
      cmErr: null,
      crErr: null,
      ccErr: null,
      orgErr: null,
      known: null,
      crKnown: null,
      crVer: null,
      oKnown: null,
    });
    unsub = src.subscribe(onData, onErr);
    paint("enter");
  }
  function onErr(k, e) {
    if (typeof k !== "string") {
      e = k;
      k = "items";
    }
    ERR[k] = e || { code: "error" };
    paint(derive());
  }
  function onData(d) {
    for (const k in d)
      if (k in RAW) {
        RAW[k] = Array.isArray(d[k]) ? d[k] : [];
        delete ERR[k];
      }
    paint(derive());
  }
  /* aktuelni period = kalendarski mesec (meseci otvoreni unapred ga ne preuzimaju); ciklusi: poslednji po redosledu */
  function curPeriod(ps) {
    const d = new Date(),
      now = d.getFullYear() * 12 + d.getMonth(),
      ix = (i) => i.year * 12 + (i.month - 1),
      ms = ps.filter((i) => i.type === "month" && i.year && i.month),
      past = ms.filter((i) => ix(i) <= now);
    if (past.length) return past.reduce((a, b) => (ix(b) >= ix(a) ? b : a));
    if (ms.length) return ms.reduce((a, b) => (ix(b) < ix(a) ? b : a));
    return ps.reduce(
      (a, b) => (!a || (b.order || 0) >= (a.order || 0) ? b : a),
      null,
    );
  }
  function derive() {
    const cid = CLIENT.id,
      desc = (a, b) =>
        (b.createdAt || 0) - (a.createdAt || 0) ||
        (b.order || 0) - (a.order || 0);
    const wasRep = ST.ready,
      wasCi = ST.ciReady,
      wasCr = ST.crReady,
      wasOrg = ST.orgReady;
    const periods = (RAW.items || [])
      .filter(
        (i) =>
          i && i.clientId === cid && (i.type === "cycle" || i.type === "month"),
      )
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    const P = new Map(),
      R = new Map(),
      S = new Map(),
      C = new Map(),
      byS = new Map(),
      CR = new Map(),
      ccBy = new Map();
    periods.forEach((it, i) =>
      P.set(it.id, {
        it,
        idx: i + 1,
        all: [],
        loom: [],
        doc: [],
        scripts: [],
        creatives: [],
      }),
    );
    for (const r of RAW.reports || []) {
      if (!r || r.clientId !== cid) continue;
      const p = P.get(r.monthId);
      if (!p) continue;
      R.set(r.id, r);
      p.all.push(r);
    }
    for (const s of RAW.scripts || []) {
      if (!s || s.clientId !== cid) continue;
      const p = P.get(s.monthId);
      if (!p || !visibleScript(s)) continue;
      S.set(s.id, s);
      p.scripts.push(s);
    }
    P.forEach((p) => {
      p.all.sort(desc);
      p.loom = p.all.filter(hasLoom);
      p.doc = p.all.filter(hasDoc);
      p.scripts.sort(
        (a, b) =>
          stageIx(a) - stageIx(b) ||
          (a.order || 0) - (b.order || 0) ||
          String(a.id).localeCompare(String(b.id)),
      );
    });
    for (const c of RAW.comments || []) {
      if (
        !c ||
        c.clientId !== cid ||
        !S.has(c.scriptId) ||
        !String(c.text || "").trim()
      )
        continue;
      C.set(c.id, c);
      if (!byS.has(c.scriptId)) byS.set(c.scriptId, []);
      byS.get(c.scriptId).push(c);
    }
    byS.forEach((l) =>
      l.sort(
        (a, b) =>
          (a.resolved ? 1 : 0) - (b.resolved ? 1 : 0) ||
          (b.createdAt || 0) - (a.createdAt || 0),
      ),
    );
    for (const c of RAW.creatives || []) {
      if (!c || c.clientId !== cid) continue;
      const p = P.get(c.monthId);
      if (!p || !(c.files || []).some((f) => srcOf(f))) continue;
      CR.set(c.id, c);
      p.creatives.push(c);
    }
    P.forEach((p) =>
      p.creatives.sort(
        (a, b) =>
          (a.order || 0) - (b.order || 0) ||
          (a.createdAt || 0) - (b.createdAt || 0) ||
          String(a.id).localeCompare(String(b.id)),
      ),
    );
    for (const x of RAW.creativeComments || []) {
      if (
        !x ||
        x.clientId !== cid ||
        !CR.has(x.creativeId) ||
        !String(x.text || "").trim()
      )
        continue;
      if (!ccBy.has(x.creativeId)) ccBy.set(x.creativeId, []);
      ccBy.get(x.creativeId).push(x);
    }
    ccBy.forEach((l) =>
      l.sort(
        (a, b) =>
          (a.resolved ? 1 : 0) - (b.resolved ? 1 : 0) ||
          (b.createdAt || 0) - (a.createdAt || 0),
      ),
    );
    const crOk = !!(
      RAW.items &&
      RAW.creatives &&
      (RAW.creativeComments || ERR.creativeComments)
    );
    const crAdded =
      crOk && ST.crKnown
        ? [...CR.keys()].filter((id) => !ST.crKnown.has(id))
        : [];
    const crVer = new Map();
    CR.forEach((c, id) => crVer.set(id, filesSig(c)));
    const crNew =
      crOk && ST.crVer
        ? [...CR.keys()].filter(
            (id) => ST.crVer.has(id) && ST.crVer.get(id) !== crVer.get(id),
          )
        : [];
    const O = new Map();
    for (const o of RAW.schedules || []) {
      if (
        !o ||
        o.clientId !== cid ||
        !/^\d{4}-\d{2}-\d{2}$/.test(o.date || "") ||
        !(o.items || []).some((x) => x && x.k === "scene")
      )
        continue;
      O.set(o.id, o);
    }
    const oList = [...O.values()].sort((a, b) =>
      a.date < b.date
        ? -1
        : a.date > b.date
          ? 1
          : String(a.start || "").localeCompare(String(b.start || "")),
    );
    const orgOk = !!(RAW.schedules || ERR.schedules),
      oKnown = new Map();
    O.forEach((o, id) => oKnown.set(id, oSig(o)));
    const oAdd =
        orgOk && ST.oKnown
          ? oList.filter((o) => !ST.oKnown.has(o.id) && oEnd(o) >= new Date())
          : [],
      oChg =
        orgOk && ST.oKnown
          ? oList.filter(
              (o) =>
                ST.oKnown.has(o.id) &&
                ST.oKnown.get(o.id) !== oKnown.get(o.id) &&
                oEnd(o) >= new Date(),
            )
          : [];
    const V = (RAW.vault || [])
      .filter((x) => x && x.clientId === cid)
      .sort((a, b) => platIx(a) - platIx(b) || (a.order || 0) - (b.order || 0));
    const repOk = !!(RAW.items && RAW.reports);
    const added =
      repOk && ST.known ? [...R.keys()].filter((id) => !ST.known.has(id)) : [];
    Object.assign(ST, {
      ready: repOk,
      ciReady: !!(RAW.items && RAW.scripts && (RAW.comments || ERR.comments)),
      err: ERR.items || ERR.reports || null,
      ciErr: ERR.items || ERR.scripts || null,
      cmErr: ERR.comments || null,
      crReady: crOk,
      crErr: ERR.items || ERR.creatives || null,
      ccErr: ERR.creativeComments || null,
      CR,
      ccBy,
      crKnown: crOk ? new Set(CR.keys()) : ST.crKnown,
      crVer: crOk ? crVer : ST.crVer,
      V,
      pvReady: !!(RAW.vault || ERR.vault),
      pvErr: ERR.vault || null,
      O,
      oList,
      orgReady: orgOk,
      orgErr: ERR.schedules || null,
      oKnown: orgOk ? oKnown : ST.oKnown,
      periods,
      P,
      R,
      S,
      C,
      byS,
      known: repOk ? new Set(R.keys()) : ST.known,
      latest: curPeriod(periods),
    });
    if (crAdded.length) {
      crAdded.forEach((id) => {
        ST.crFresh.add(id);
        setTimeout(() => ST.crFresh.delete(id), 4000);
      });
      const c = CR.get(crAdded[0]);
      toast(
        crAdded.length > 1
          ? `${pl(crAdded.length, "Stigla je", "Stigle su", "Stiglo je")} ${crAdded.length} ${pl(crAdded.length, "nova kreativa", "nove kreative", "novih kreativa")}`
          : `Nova kreativa · ${c.title || "Kreativa"}`,
        {
          label: "Pogledaj",
          fn: () => {
            if (ST.CR.get(c.id)) navTo(crRoute(c), null);
          },
        },
      );
    } else if (crNew.length) {
      crNew.forEach((id) => {
        ST.crFresh.add(id);
        setTimeout(() => ST.crFresh.delete(id), 4000);
      });
      const c = CR.get(crNew[0]);
      toast(
        crNew.length > 1
          ? `${crNew.length} ${pl(crNew.length, "kreativa ima", "kreative imaju", "kreativa ima")} novu verziju`
          : `Nova verzija · ${c.title || "Kreativa"}`,
        {
          label: "Pogledaj",
          fn: () => {
            if (ST.CR.get(c.id)) navTo(crRoute(c), null);
          },
        },
      );
    }
    if (oAdd.length || oChg.length) {
      const o = oAdd[0] || oChg[0],
        dl =
          cap(fmtDayL.format(odate(o.date))) +
          ", " +
          fmtODM.format(odate(o.date));
      toast(
        oAdd.length
          ? `Novi raspored snimanja · ${dl}`
          : `Raspored je promenjen · ${dl}`,
        {
          label: "Pogledaj",
          fn: () => {
            if (ST.O.get(o.id))
              navTo({ sec: "org", v: "day", oid: o.id }, null);
          },
        },
      );
    }
    if (added.length) {
      added.forEach((id) => {
        ST.fresh.add(id);
        setTimeout(() => ST.fresh.delete(id), 3000);
      });
      const r = R.get(added[0]);
      toast(
        added.length > 1
          ? `${pl(added.length, "Stigao je", "Stigla su", "Stiglo je")} ${added.length} ${pl(added.length, "novi izveštaj", "nova izveštaja", "novih izveštaja")}`
          : `Novi izveštaj · ${r.title || "Izveštaj"}`,
        {
          label: "Pogledaj",
          fn: () => {
            if (ST.R.get(r.id))
              navTo(
                {
                  sec: "rep",
                  v: "list",
                  pid: r.monthId,
                  type: hasLoom(r) ? "loom" : "pisani",
                },
                null,
              );
          },
        },
      );
    }
    return (
      cur.sec === "org"
        ? !wasOrg && ST.orgReady
        : cur.sec === "ci"
          ? !wasCi && ST.ciReady
          : cur.sec === "cr"
            ? !wasCr && ST.crReady
            : cur.sec === "rep"
              ? !wasRep && ST.ready
              : false
    )
      ? "enter"
      : "update";
  }
  function paint(kind) {
    if (INTRO) INTRO.setP();
    if (rapp.hidden) return;
    if (kind === "update") {
      /* Informacioni sistem ne zavisi od podataka: okvir ostaje, mapa se ne pokreće ponovo */
      if (cur.sec === "sys" && rmain.querySelector("#vframe")) return;
      if (isViewer(cur) && ST.R.get(cur.rid)) {
        updViewerHead();
        return;
      }
      if (
        cur.v === "script" &&
        ST.ciReady &&
        !ST.ciErr &&
        ST.S.get(cur.sid) &&
        rmain.querySelector(".v-script")
      ) {
        updScript();
        return;
      }
      if (
        cur.sec === "cr" &&
        cur.v === "gallery" &&
        ST.crReady &&
        !ST.crErr &&
        ST.P.get(cur.pid) &&
        rmain.querySelector(".v-gal")
      ) {
        updGallery();
        return;
      }
      if (
        cur.sec === "pv" &&
        ST.pvReady &&
        !ST.pvErr &&
        rmain.querySelector(".v-pv")
      ) {
        pvPaint();
        return;
      }
      if (
        cur.sec === "org" &&
        ST.orgReady &&
        !ST.orgErr &&
        rmain.querySelector(".v-org,.v-oday")
      ) {
        updOrg();
        return;
      }
    }
    render(cur, kind === "enter" ? "enter" : "update");
    if (lovRid && !ST.R.get(lovRid)) goBack();
    if (cur.sec === "cr") pendingTheater();
  }

  /* ---------- rute (samo location.hash) ---------- */
  let cur = { v: "dash" },
    curKey = "",
    pending = null;
  /* gost (model bez naloga): #raspored.{id} = samo taj jedan raspored, bez dashboarda i ostalih stranica */
  const GUEST = (/^#raspored\.(.+)$/.exec(location.hash) || [])[1] || null;
  if (GUEST) {
    document.documentElement.classList.add("guest");
    rapp.classList.add("guest");
  }
  function keyOf(r) {
    if (GUEST) return "raspored." + GUEST;
    if (r.v === "dash") return "";
    if (r.sec === "ci")
      return ["creative", r.pid, r.v === "script" ? r.sid : null]
        .filter(Boolean)
        .join(".");
    if (r.sec === "cr")
      return ["creatives", r.pid, r.fid ? "~" + r.fid : null, r.cid]
        .filter(Boolean)
        .join(".");
    if (r.sec === "pv") return "privacy";
    if (r.sec === "sys") return "sistem";
    if (r.sec === "org")
      return ["organisation", r.v === "day" ? r.oid : null]
        .filter(Boolean)
        .join(".");
    return [
      "reporting",
      r.pid,
      r.v === "list" ? r.type : null,
      r.v === "list" ? r.rid : null,
    ]
      .filter(Boolean)
      .join(".");
  }
  function parse() {
    if (GUEST) return { sec: "org", v: "day", oid: GUEST, guest: true };
    const p = location.hash.replace(/^#/, "").split(".");
    if (p[0] === "privacy") return { sec: "pv", v: "list" };
    if (p[0] === "sistem") return { sec: "sys", v: "list" };
    if (p[0] === "organisation")
      return p[1]
        ? { sec: "org", v: "day", oid: p.slice(1).join(".") }
        : { sec: "org", v: "list" };
    if (p[0] === "creatives") {
      if (!p[1]) return { sec: "cr", v: "periods" };
      /* creatives.{period}.~{folder}.{kreativa} */
      const f = p[2] && p[2][0] === "~" ? p[2].slice(1) || null : null;
      return {
        sec: "cr",
        v: "gallery",
        pid: p[1],
        fid: f,
        cid: (f ? p[3] : p[2]) || null,
      };
    }
    if (p[0] === "creative") {
      if (!p[1]) return { sec: "ci", v: "periods" };
      if (!p[2]) return { sec: "ci", v: "scripts", pid: p[1] };
      return { sec: "ci", v: "script", pid: p[1], sid: p[2] };
    }
    if (p[0] !== "reporting") return { v: "dash" };
    if (!p[1]) return { sec: "rep", v: "periods" };
    if (!p[2]) return { sec: "rep", v: "types", pid: p[1] };
    return {
      sec: "rep",
      v: "list",
      pid: p[1],
      type: p[2] === "pisani" ? "pisani" : "loom",
      rid: p[3] || null,
    };
  }
  const isViewer = (r) =>
    r.sec === "rep" && r.v === "list" && r.type === "pisani" && !!r.rid;
  const ovOf = (r) =>
    r.sec === "rep" && r.v === "list" && r.type === "loom" && r.rid
      ? r.rid
      : null;
  const pkey = (r) =>
    r.v === "dash"
      ? "d"
      : r.sec === "pv"
        ? "pv"
        : r.sec === "sys"
          ? "sys"
          : r.sec === "org"
            ? r.v === "day"
              ? "o:" + r.oid
              : "o"
            : r.v === "periods"
              ? "p:" + r.sec
              : r.v === "gallery"
                ? "g:" + r.pid + (r.fid ? ":" + r.fid : "")
                : r.v === "types"
                  ? "t:" + r.pid
                  : r.v === "scripts"
                    ? "s:" + r.pid
                    : r.v === "script"
                      ? "c:" + r.pid + ":" + r.sid
                      : isViewer(r)
                        ? "v:" + r.pid + ":" + r.rid
                        : "l:" + r.pid + ":" + r.type;
  const pdep = (r) =>
    r.v === "dash"
      ? 0
      : r.sec === "pv" || r.sec === "sys"
        ? 1
        : r.sec === "org"
          ? r.v === "day"
            ? 2
            : 1
          : r.v === "periods"
            ? 1
            : r.v === "gallery"
              ? r.fid
                ? 3
                : 2
              : r.v === "types" || r.v === "scripts"
                ? 2
                : isViewer(r)
                  ? 4
                  : 3;
  function parentOf(r) {
    if (GUEST) return r;
    if (r.sec === "pv" || r.sec === "sys") return { v: "dash" };
    if (r.sec === "org")
      return r.v === "day" ? { sec: "org", v: "list" } : { v: "dash" };
    if (r.sec === "ci")
      return r.v === "script"
        ? { sec: "ci", v: "scripts", pid: r.pid }
        : r.v === "scripts"
          ? { sec: "ci", v: "periods" }
          : { v: "dash" };
    if (r.sec === "cr")
      return r.v === "gallery" && r.cid
        ? { sec: "cr", v: "gallery", pid: r.pid, fid: r.fid }
        : r.v === "gallery" && r.fid
          ? { sec: "cr", v: "gallery", pid: r.pid }
          : r.v === "gallery"
            ? { sec: "cr", v: "periods" }
            : { v: "dash" };
    return r.v === "list" && r.rid
      ? { sec: "rep", v: "list", pid: r.pid, type: r.type }
      : r.v === "list"
        ? { sec: "rep", v: "types", pid: r.pid }
        : r.v === "types"
          ? { sec: "rep", v: "periods" }
          : { v: "dash" };
  }
  function go(r, opt) {
    const k = keyOf(r);
    pending = Object.assign({ k }, opt || {});
    if (location.hash.replace(/^#/, "") === k) {
      route();
      return;
    }
    location.hash = k;
  }
  const navTo = (r, from) => go(r, { from });
  const swapTo = (r) => go(r, { swap: true });
  const goBack = () => go(parentOf(cur), {});
  function route(force) {
    if (GUEST && location.hash !== "#raspored." + GUEST) {
      location.hash = "raspored." + GUEST;
      return;
    }
    const next = parse(),
      k = keyOf(next),
      opt = pending && pending.k === k ? pending : {};
    if (next.sec === "pv" && !unlocked) {
      pending = null;
      if (location.hash.replace(/^#/, "")) location.hash = "";
      setTimeout(openVault, cur.v === "dash" ? 0 : MT(700));
      return;
    }
    pending = null;
    if (k === curKey && !force) return;
    const prev = cur;
    cur = next;
    curKey = k;
    transit(prev, next, opt);
  }
  addEventListener("hashchange", () => route());

  /* ---------- prelazi ---------- */
  const mem = new Map();
  let tTok = 0,
    dashY = 0;
  function transit(prev, next, opt) {
    const snap = opt.from && opt.from.isConnected ? snapOf(opt.from) : null;
    if (!rapp.hidden) mem.set(pkey(prev), scrollY);
    const po = ovOf(prev),
      no = ovOf(next),
      pt = thOf(prev),
      nt = thOf(next);
    if (pkey(prev) === pkey(next) && prev.v !== "dash") {
      if (po && po !== no) closeLoom(!no);
      if (no && no !== po) openLoom(no, opt.from || null);
      if (pt && !nt) closeTheater(true);
      else if (nt && !pt) openTheater(nt, opt.from || null);
      else if (nt && pt && nt !== pt)
        switchTheater(
          nt,
          opt.dir ||
            (crOfCur().findIndex((c) => c.id === nt) <
            crOfCur().findIndex((c) => c.id === pt)
              ? -1
              : 1),
        );
      return;
    }
    if (po) closeLoom(false);
    if (pt) closeTheater(false);
    const dp = pdep(prev),
      dn = pdep(next),
      fin = () => {
        if (no) openLoom(no, null);
        if (nt) openTheater(nt, null);
      };
    if (
      opt.swap &&
      prev.sec === "rep" &&
      prev.v === "list" &&
      next.v === "list" &&
      !isViewer(prev) &&
      !isViewer(next)
    ) {
      setTop(next);
      wipeSwap(() => {
        render(next, "swap");
        fin();
      });
      return;
    }
    if (opt.swap && prev.v === "script" && next.v === "script") {
      setTop(next);
      wipeSwap(() => render(next, "swap"));
      return;
    }
    if (dn > dp) {
      growFrom(snap, () => {
        render(next, "enter");
        fin();
      });
      return;
    }
    if (dn < dp) {
      shrinkTo(landing(prev, next), () => {
        render(next, "back");
        fin();
      });
      return;
    }
    fadeTo(() => {
      render(next, "enter");
      fin();
    });
  }
  function landing(prev, next) {
    if (next.v === "dash")
      return prev.sec === "pv"
        ? "#dash .card.priv"
        : prev.sec === "sys"
          ? "#dash .card.sys"
          : prev.sec === "org"
            ? "#dash .card.org"
            : prev.sec === "ci"
              ? "#dash .card.ci"
              : prev.sec === "cr"
                ? "#dash .card.cr"
                : "#dash .card.rep";
    if (prev.sec === "org")
      return prev.v === "day" && next.v === "list"
        ? `#rmain [data-oid="${cssq(prev.oid)}"]`
        : null;
    if (prev.sec === "cr")
      return prev.v === "gallery" && next.v === "periods"
        ? `#rmain [data-pid="${cssq(prev.pid)}"]`
        : prev.v === "gallery" && prev.fid && next.v === "gallery" && !next.fid
          ? `#rmain [data-fid="${cssq(prev.fid)}"]`
          : null;
    if (prev.sec === "ci") {
      if (prev.v === "scripts" && next.v === "periods")
        return `#rmain [data-pid="${cssq(prev.pid)}"]`;
      if (prev.v === "script" && next.v === "scripts" && prev.pid === next.pid)
        return `#rmain [data-sid="${cssq(prev.sid)}"]`;
      return null;
    }
    if (prev.v === "types" && next.v === "periods")
      return `#rmain [data-pid="${cssq(prev.pid)}"]`;
    if (prev.v === "list" && next.v === "types" && prev.pid === next.pid)
      return `#rmain [data-type="${prev.type}"]`;
    if (isViewer(prev) && next.v === "list" && prev.pid === next.pid)
      return `#rmain [data-rid="${cssq(prev.rid)}"]`;
    return null;
  }
  function paneLook(el) {
    const b =
        (el.classList.contains("card") && el.querySelector(":scope>.bg")) || el,
      cs = getComputedStyle(b);
    let col = cs.backgroundColor;
    if (!col || col === "transparent" || /rgba\(0, 0, 0, 0\)/.test(col))
      col = "#1c0f15";
    return {
      img: cs.backgroundImage,
      col,
      rad: getComputedStyle(el).borderTopLeftRadius,
    };
  }
  function snapOf(el) {
    const r = el.getBoundingClientRect();
    return r.width && r.height ? { r, look: paneLook(el) } : null;
  }
  function paneOn() {
    take.classList.remove("full", "grey");
    take.classList.add("on", "bare");
    take.setAttribute("aria-hidden", "false");
  }
  function paneOff() {
    take.classList.remove("on", "bare");
    take.setAttribute("aria-hidden", "true");
    pane.style.transition = "none";
    pane.style.opacity = "";
  }
  /* prelaz među nivoima: kartica izraste u stranicu (nazad: stranica se skupi u karticu).
     Kreće u istom kadru kao klik, brzo pa mekano staje; nova stranica se crta čim panel
     prekrije ekran i izranja dok panel bledi, pa nema praznog ekrana između. */
  const EZ = "cubic-bezier(.32,.72,0,1)",
    GROW = 340,
    SHRINK = 340,
    geo = (D) =>
      ["left", "top", "width", "height", "border-radius"]
        .map((p) => `${p} ${D}ms ${EZ}`)
        .join(",");
  function growFrom(snap, mid) {
    if (reduce || !snap) {
      fadeTo(mid);
      return;
    }
    const tok = ++tTok,
      { r, look } = snap;
    paneOn();
    Object.assign(pane.style, {
      transition: "none",
      opacity: "1",
      left: r.left + "px",
      top: r.top + "px",
      width: r.width + "px",
      height: r.height + "px",
      borderRadius: look.rad,
      backgroundImage: look.img,
      backgroundColor: look.col,
    });
    void pane.offsetWidth;
    pane.style.transition = geo(GROW);
    Object.assign(pane.style, {
      left: "0px",
      top: "0px",
      width: "100vw",
      height: "100vh",
      borderRadius: "0px",
    });
    // poslednjih 60 ms panel se više ne pomera vidljivo: tada se već crta stranica
    setTimeout(() => {
      if (tok !== tTok) return;
      mid();
      requestAnimationFrame(() => {
        if (tok !== tTok) return;
        pane.style.transition = "opacity .2s ease";
        pane.style.opacity = "0";
        setTimeout(() => {
          if (tok === tTok) paneOff();
        }, 220);
      });
    }, GROW - 60);
  }
  function shrinkTo(sel, mid) {
    if (reduce) {
      tTok++;
      paneOff();
      mid();
      return;
    }
    const tok = ++tTok;
    paneOn();
    Object.assign(pane.style, {
      transition: "none",
      opacity: "0",
      left: "0px",
      top: "0px",
      width: "100vw",
      height: "100vh",
      borderRadius: "0px",
      backgroundImage: "none",
      backgroundColor: "#1c0f15",
    });
    void pane.offsetWidth;
    pane.style.transition = "opacity .1s ease";
    pane.style.opacity = "1";
    setTimeout(() => {
      if (tok !== tTok) return;
      mid();
      requestAnimationFrame(() => {
        if (tok !== tTok) return;
        const el = sel && document.querySelector(sel),
          r = el && el.getBoundingClientRect();
        if (!el || !r.width || r.bottom < 0 || r.top > innerHeight) {
          pane.style.transition = "opacity .2s ease";
          pane.style.opacity = "0";
          setTimeout(() => {
            if (tok === tTok) paneOff();
          }, 220);
          return;
        }
        const look = paneLook(el);
        pane.style.backgroundImage = look.img;
        pane.style.backgroundColor = look.col;
        pane.style.transition = geo(SHRINK);
        Object.assign(pane.style, {
          left: r.left + "px",
          top: r.top + "px",
          width: r.width + "px",
          height: r.height + "px",
          borderRadius: look.rad,
        });
        // kraj krive je skoro miran: kartica se pokaže dok panel još sleće
        setTimeout(() => {
          if (tok !== tTok) return;
          el.classList.remove("land");
          void el.offsetWidth;
          el.classList.add("land");
          setTimeout(() => el.classList.remove("land"), MT(1000));
          pane.style.transition = `opacity .18s, ${geo(SHRINK)}`;
          pane.style.opacity = "0";
          setTimeout(() => {
            if (tok === tTok) paneOff();
          }, 200);
        }, SHRINK - 100);
      });
    }, 100);
  }
  function fadeTo(mid) {
    const tok = ++tTok;
    paneOff();
    if (reduce) {
      mid();
      return;
    }
    const a = rapp.hidden ? dash : rapp;
    a.classList.add("fadeout");
    setTimeout(() => {
      a.classList.remove("fadeout");
      if (tok !== tTok) return;
      mid();
      const b = rapp.hidden ? dash : rapp;
      b.classList.remove("fadein");
      void b.offsetWidth;
      b.classList.add("fadein");
      setTimeout(() => b.classList.remove("fadein"), MT(420));
    }, MT(170));
  }
  function wipeSwap(mid) {
    const tok = ++tTok;
    paneOff();
    if (reduce) {
      mid();
      return;
    }
    const l = rmain.querySelector(".rlist,.rempty,.v-script");
    if (l) l.classList.add("out");
    setTimeout(() => {
      if (tok === tTok) mid();
    }, MT(250));
  }
  function showApp() {
    if (!rapp.hidden) return;
    dashY = scrollY;
    dash.classList.add("away");
    dash.setAttribute("aria-hidden", "true");
    rapp.hidden = false;
    EMB.pause(true);
  }
  function showDash() {
    if (GUEST) return;
    if (rapp.hidden && !dash.classList.contains("away")) return;
    closeLoom(false);
    closeTheater(false);
    resetCompose(true);
    rapp.hidden = true;
    rapp.classList.remove(
      "viewing",
      "ci",
      "ci-script",
      "cr",
      "cr-gal",
      "org",
      "pv",
    );
    pvShow.clear();
    pvClose();
    rsw.hidden = true;
    cnav.hidden = true;
    dash.classList.remove("away");
    dash.removeAttribute("aria-hidden");
    EMB.pause(false);
    EMB.resize();
    document.title = CLIENT.name + " · Skeylo";
    scrollTo(0, dashY);
    dashWake();
  }

  /* ---------- crtanje ---------- */
  let etchTok = 0;
  const wmBeam = () => {
    if (rapp.hidden) return null;
    const e = $("#rwmk"),
      r = e && e.getBoundingClientRect();
    return r && r.width
      ? { x: r.left + r.height * 0.42, y: r.top + r.height * 0.5 }
      : null;
  };
  function lineHTML(parts, done) {
    const vis = parts
        .map((p) => (p.em ? `<span class="em">${esc(p.t)}</span>` : esc(p.t)))
        .join(""),
      hot = parts.map((p) => (p.em ? `<i>${esc(p.t)}</i>` : esc(p.t))).join("");
    return `<span class="ln"><span class="ew${done ? " done" : ""}"><span class="etch">${vis}<span class="hot" aria-hidden="true">${hot}</span></span><i class="lh" aria-hidden="true"></i></span></span>`;
  }
  function headHTML(lines, mode) {
    const done = !(mode === "enter" || mode === "swap");
    return `<div class="rhead"><h1 class="rh1" tabindex="-1">${lines.map((l) => lineHTML(l, done)).join("")}</h1></div>`;
  }
  /* naslov skripte: reč po reč, da se lepo prelama u više redova */
  function wordsHTML(text, done) {
    const ws = String(text || "Skripta")
      .trim()
      .split(/\s+/);
    return ws
      .map((w, i) => {
        const em = ws.length > 1 && i === ws.length - 1,
          d = Math.min(560, 150 + w.length * 42);
        return `<span class="ew${done ? " done" : ""}" data-d="${d}"><span class="etch${em ? " em" : ""}">${esc(w)}<span class="hot" aria-hidden="true">${esc(w)}</span></span><i class="lh" aria-hidden="true"></i></span>`;
      })
      .join(" ");
  }
  function stateHTML(t, loading, up) {
    return `<div class="rstate">${loading ? '<i class="lscanbar" aria-hidden="true"></i>' : ""}<b>${esc(t)}</b>${up ? '<button class="pill" type="button" data-up>Nazad</button>' : ""}</div>`;
  }
  function render(r, mode) {
    if (r.v === "dash") {
      showDash();
      return;
    }
    showApp();
    resetCompose(true);
    document.title = `${r.sec === "pv" ? "Privacy" : r.sec === "sys" ? "Informacioni sistem" : r.sec === "org" ? "Raspored snimanja" : r.sec === "ci" ? "Creative Inspection" : r.sec === "cr" ? "Final Creatives" : "Reporting Dashboard"} · ${CLIENT.short || CLIENT.name}`;
    rmain.querySelectorAll(".card").forEach(disarmCard);
    etchTok++;
    rapp.classList.toggle("viewing", isViewer(r) || r.sec === "sys");
    rapp.classList.toggle("ci", r.sec === "ci");
    rapp.classList.toggle("ci-script", r.v === "script");
    rapp.classList.toggle("cr", r.sec === "cr");
    rapp.classList.toggle("cr-gal", r.v === "gallery");
    rapp.classList.toggle("org", r.sec === "org");
    rapp.classList.toggle("pv", r.sec === "pv");
    rapp.classList.toggle("sys", r.sec === "sys");
    if (r.sec !== "pv") {
      pvShow.clear();
      pvClose();
    }
    setTop(r);
    if (r.sec === "sys") vSys(mode);
    else if (r.sec === "pv") {
      if (ST.pvErr)
        rmain.innerHTML = stateHTML("Šifre trenutno nisu dostupne.");
      else if (!ST.pvReady) rmain.innerHTML = stateHTML("Učitavam…", true);
      else vPV(mode);
    } else if (r.sec === "org") {
      if (ST.orgErr)
        rmain.innerHTML = stateHTML("Raspored trenutno nije dostupan.");
      else if (!ST.orgReady)
        rmain.innerHTML = stateHTML("Učitavam raspored…", true);
      else if (r.v === "list") vOrg(mode);
      else vOrgDay(r.oid, mode);
    } else if (r.sec === "cr") {
      if (ST.crErr)
        rmain.innerHTML = stateHTML("Kreative trenutno nisu dostupne.");
      else if (!ST.crReady)
        rmain.innerHTML = stateHTML("Učitavam kreative…", true);
      else if (r.v === "periods") vPeriods(mode, "cr");
      else {
        const P = ST.P.get(r.pid);
        if (!P)
          rmain.innerHTML = stateHTML("Ovaj period ne postoji.", false, true);
        else vGallery(P, mode);
      }
    } else if (r.sec === "ci") {
      if (ST.ciErr)
        rmain.innerHTML = stateHTML("Skripte trenutno nisu dostupne.");
      else if (!ST.ciReady)
        rmain.innerHTML = stateHTML("Učitavam skripte…", true);
      else if (r.v === "periods") vPeriods(mode, "ci");
      else {
        const P = ST.P.get(r.pid);
        if (!P)
          rmain.innerHTML = stateHTML("Ovaj period ne postoji.", false, true);
        else if (r.v === "scripts") vScripts(P, mode);
        else vScript(P, r.sid, mode);
      }
    } else {
      if (ST.err)
        rmain.innerHTML = stateHTML("Izveštaji trenutno nisu dostupni.");
      else if (!ST.ready)
        rmain.innerHTML = stateHTML("Učitavam izveštaje…", true);
      else if (r.v === "periods") vPeriods(mode, "rep");
      else {
        const P = ST.P.get(r.pid);
        if (!P)
          rmain.innerHTML = stateHTML("Ovaj period ne postoji.", false, true);
        else if (r.v === "types") vTypes(P, mode);
        else if (isViewer(r)) vViewer(P, r.rid, mode);
        else vList(P, r.type, mode);
      }
    }
    if (mode === "enter" || (mode === "swap" && r.v === "script"))
      scrollTo(0, 0);
    else if (mode === "back") scrollTo(0, mem.get(pkey(r)) || 0);
    else if (mode === "swap" && scrollY > 240)
      scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    if (mode === "enter" || mode === "back") {
      const h = rmain.querySelector(".rh1,.vh1");
      h && h.focus({ preventScroll: true });
    }
    if (r.v === "script") startScan();
    topShadow();
  }
  function setTop(r) {
    const P = r.pid && ST.P.get(r.pid);
    $("#rbackLbl").textContent =
      r.sec === "pv" || r.sec === "sys"
        ? "Dashboard"
        : r.sec === "org"
          ? r.v === "day"
            ? "Raspored"
            : "Dashboard"
          : r.sec === "cr"
            ? r.v === "periods"
              ? "Dashboard"
              : r.fid && folderOf(P, r.fid)
                ? P
                  ? periodLabel(P.it)
                  : "Nazad"
                : "Periodi"
            : r.sec === "ci"
              ? r.v === "periods"
                ? "Dashboard"
                : r.v === "scripts"
                  ? "Periodi"
                  : P
                    ? periodLabel(P.it)
                    : "Nazad"
              : r.v === "periods"
                ? "Dashboard"
                : r.v === "types"
                  ? "Periodi"
                  : isViewer(r)
                    ? "Pisani izveštaji"
                    : P
                      ? periodLabel(P.it)
                      : "Nazad";
    const sw =
      r.sec === "rep" && r.v === "list" && !isViewer(r) && ST.ready && !!P;
    rsw.hidden = !sw;
    if (sw) {
      rsw.dataset.on = r.type;
      $("#swLoom").setAttribute("aria-selected", String(r.type === "loom"));
      $("#swDoc").setAttribute("aria-selected", String(r.type === "pisani"));
      $("#swLoom").tabIndex = r.type === "loom" ? 0 : -1;
      $("#swDoc").tabIndex = r.type === "pisani" ? 0 : -1;
    }
    const L =
        r.sec === "ci" && r.v === "script" && ST.ciReady && P
          ? P.scripts
          : null,
      i = L ? L.findIndex((s) => s.id === r.sid) : -1;
    cnav.hidden = !(L && i >= 0 && L.length > 1);
    if (!cnav.hidden) {
      $("#cprev").disabled = i <= 0;
      $("#cnext").disabled = i >= L.length - 1;
    }
  }
  function after(mode) {
    rmain.querySelectorAll(".card").forEach(armCard);
    rmain
      .querySelectorAll(".dpg.f")
      .forEach((f) => f.style.setProperty("--dh", f.offsetHeight + "px"));
    const h = rmain.querySelector(".phero");
    if (h) h.style.setProperty("--pw", h.offsetWidth + "px");
    if (mode === "enter")
      [...rmain.querySelectorAll(".rv")].forEach((el, i) =>
        setTimeout(() => el.classList.add("on"), 20 + Math.min(i, 6) * 50),
      );
    if (mode === "enter" || mode === "swap") {
      const tok = etchTok;
      setTimeout(
        () => {
          if (tok === etchTok) etchHead(mode, tok);
        },
        mode === "swap" ? 0 : 30,
      );
    }
  }
  async function etchHead(mode, tok) {
    [...rmain.querySelectorAll(".rh1 .ew:not(.done)")].forEach((el, i) => {
      if (tok === etchTok && el.isConnected)
        softTitle(el, mode === "swap" ? 0 : i * 60);
    });
  }
  const topShadow = () => rtop.classList.toggle("scrolled", scrollY > 8);
  addEventListener(
    "scroll",
    () => {
      if (!rapp.hidden) topShadow();
    },
    { passive: true },
  );

  /* periodi: aktuelni mesec + raniji periodi na šini (isto za Reporting i Creative Inspection) */
  function vPeriods(mode, sec) {
    const en = mode === "enter",
      L = ST.latest,
      ci = sec === "ci",
      cr = sec === "cr";
    const head = headHTML(
      ci
        ? [[{ t: "Creative" }], [{ t: "Inspection", em: true }]]
        : cr
          ? [[{ t: "Final" }], [{ t: "Creatives", em: true }]]
          : [[{ t: "Reporting" }], [{ t: "Dashboard", em: true }]],
      mode,
    );
    if (!L) {
      rmain.innerHTML = `<section class="v-periods">${head}<div class="rempty"><span class="ric" aria-hidden="true">${ci ? I_PEN : cr ? I_FILM : I_DOC}</span><h2>${ci ? "Još nema skripti" : cr ? "Još nema kreativa" : "Još nema izveštaja"}</h2></div></section>`;
      after(mode);
      return;
    }
    const others = ST.periods.filter((p) => p !== L).reverse();
    rmain.innerHTML = `<section class="v-periods">${head}${heroHTML(ST.P.get(L.id), mode)}${others.length ? `<div class="arch${en ? " enter" : ""}" style="--n:${others.length}"><div class="arail"><i class="rail" aria-hidden="true"></i><i class="beam" aria-hidden="true"></i><ol class="alist" aria-label="Ostali periodi">${others.map((it, i) => rowHTML(ST.P.get(it.id), i, sec)).join("")}</ol></div></div>` : ""}</section>`;
    after(mode);
  }
  function heroHTML(P, mode) {
    const en = mode === "enter",
      it = P.it,
      num = numOf(it);
    return `<button class="card phero${en ? " rv" : " still"}" type="button" data-pid="${esc(it.id)}">
      <i class="halo2" aria-hidden="true"></i><i class="halo2 b" aria-hidden="true"></i>
      ${num ? `<span class="ph-num" aria-hidden="true">${esc(num)}</span>` : ""}<i class="pscan" aria-hidden="true"></i>
      <span class="ph-top rin" style="--d:.55s"><span class="chip"><i aria-hidden="true"></i>${it.type === "month" ? "Aktuelni mesec" : "Aktuelni ciklus"}</span></span>
      <span class="ph-name rin" style="--d:.7s">${nameHTML(it)}</span>
      <span class="go" aria-hidden="true">${I_ARR}</span>
    </button>`;
  }
  function rowHTML(P, i, sec) {
    const it = P.it,
      yr =
        it.type === "month" && it.year && !/\d{4}$/.test(it.title || "")
          ? ` <em>${it.year}</em>`
          : "";
    const fr =
      sec === "rep"
        ? P.all.some((r) => ST.fresh.has(r.id))
        : sec === "cr"
          ? P.creatives.some((c) => ST.crFresh.has(c.id))
          : false;
    return `<li class="arow" style="--i:${i}"><button class="prow${fr ? " fresh" : ""}" type="button" data-pid="${esc(it.id)}">
      <i class="node" aria-hidden="true"></i><span class="pidx" aria-hidden="true">${pad(P.idx)}</span>
      <span class="pname">${esc(it.title || "Period")}${yr}</span>
      <span class="parr" aria-hidden="true">${I_ARR}</span><i class="pline" aria-hidden="true"></i>
    </button></li>`;
  }

  /* Loom video ili pisani izveštaj */
  const loomArt = () =>
    `<span class="art" aria-hidden="true"><span class="lart"><span class="lscr"><span class="lui"><i class="h"></i><i></i><i></i><span class="lch"><b></b><b></b><b></b><b></b><b></b></span></span><span class="lcam"></span><span class="lpl">${I_PLAY}</span><span class="lbar"><i></i></span></span></span></span>`;
  const docArt = () =>
    `<span class="art" aria-hidden="true"><span class="dart"><span class="dpg b2"></span><span class="dpg b1"></span><span class="dpg f"><i class="h"></i><span class="dkp"><b></b><b></b><b></b></span><span class="dch"><b></b><b></b><b></b><b></b><b></b><b></b></span><i></i><i class="s"></i><span class="dscan"></span></span></span></span>`;
  function vTypes(P, mode) {
    const en = mode === "enter";
    const tile = (type, art, a, b, n) =>
      `<button class="card ttile${en ? " rv" : ""}${n ? "" : " dim"}" type="button" data-type="${type}">${art}<span class="t"><span>${a}</span><span class="em">${b}</span></span><span class="go" aria-hidden="true">${I_ARR}</span></button>`;
    rmain.innerHTML = `<section class="v-types">${headHTML([nameParts(P.it)], mode)}<div class="tgrid">
      ${tile("loom", loomArt(), "Loom", "Video", P.loom.length)}
      ${tile("pisani", docArt(), "Pisani", "Izveštaj", P.doc.length)}
    </div></section>`;
    after(mode);
  }

  /* lista: najnoviji gore */
  function vList(P, type, mode) {
    const en = mode === "enter" || mode === "swap",
      lo = type === "loom",
      L = lo ? P.loom : P.doc,
      other = lo ? P.doc : P.loom;
    const lines = lo
      ? [[{ t: "Loom " }, { t: "video", em: true }]]
      : [[{ t: "Pisani " }, { t: "izveštaji", em: true }]];
    const body = L.length
      ? `<ol class="rlist">${L.map((r, i) => itemHTML(r, type, i)).join("")}</ol>`
      : `<div class="rempty"><span class="ric" aria-hidden="true">${lo ? I_PLAY : I_DOC}</span><h2>${lo ? "Još nema Loom videa" : "Još nema pisanih izveštaja"}</h2>${other.length ? `<button class="pill" type="button" data-sw="${lo ? "pisani" : "loom"}">${lo ? I_DOC : I_PLAY}${lo ? "Pisani izveštaji" : "Loom video"}</button>` : ""}</div>`;
    rmain.innerHTML = `<section class="v-list${en ? " enter" : ""}">${headHTML(lines, mode)}${body}</section>`;
    after(mode);
  }
  function itemHTML(r, type, i) {
    const lo = type === "loom";
    const th = lo
      ? `<span class="rth loom" aria-hidden="true"><span class="cam"></span><span class="pl">${I_PLAY}</span><span class="bar"></span></span>`
      : `<span class="rth doc" aria-hidden="true"><span class="pg"><i></i><i class="k"></i><i></i><i></i><i></i></span></span>`;
    return `<li class="rli" style="--i:${i}"><button class="ritem${i === 0 ? " first" : ""}${ST.fresh.has(r.id) ? " fresh" : ""}" type="button" data-rid="${esc(r.id)}">${th}
      <span class="rbody"><span class="rtitle">${esc(r.title || "Izveštaj")}</span><span class="rdate">${fmtDM(r.createdAt)}</span></span>
      <span class="ract" aria-hidden="true">${lo ? `${I_PLAY}Pusti` : `Otvori${I_ARR}`}</span><i class="rsweep" aria-hidden="true"></i>
    </button></li>`;
  }

  /* pisani izveštaj */
  let docTok = 0;
  const htmlCache = new Map();
  function vViewer(P, rid, mode) {
    const r = ST.R.get(rid);
    if (!r || r.monthId !== P.it.id || !hasDoc(r)) {
      rmain.innerHTML = stateHTML("Izveštaj ne postoji.", false, true);
      return;
    }
    const page = pageOf(r);
    rmain.innerHTML = `<section class="v-view${mode === "enter" ? " enter" : ""}"><div class="vhead"><h1 class="vh1" tabindex="-1">${esc(r.title || "Izveštaj")}</h1>${hasLoom(r) ? `<button class="pill" type="button" data-loom-of="${esc(r.id)}">${I_PLAY}Loom video</button>` : ""}${page ? `<a class="pill" href="${esc(page)}" target="_blank" rel="noopener">Otvori preko celog ekrana${I_EXT}</a>` : ""}</div><div class="vframe" id="vframe"><div class="vload"><i class="lscanbar" aria-hidden="true"></i></div></div></section>`;
    loadDoc(r);
  }
  function framed(box, f) {
    f.addEventListener("load", () => {
      f.classList.add("ready");
      const l = box.querySelector(".vload");
      if (l) setTimeout(() => l.remove(), MT(450));
    });
    box.appendChild(f);
  }
  function loadDoc(r) {
    const tok = ++docTok,
      box = $("#vframe");
    if (!box) return;
    const page = pageOf(r);
    if (page) {
      /* naša stranica, isti origin: bez sandbox-a, da stigne kolačić za /ils */
      Promise.resolve()
        .then(() => SRC.unlock && SRC.unlock())
        .catch(() => {})
        .then(() => {
          if (tok !== docTok || !box.isConnected) return;
          const f = document.createElement("iframe");
          f.setAttribute("title", r.title || "Stranica");
          f.src = page;
          framed(box, f);
        });
      return;
    }
    const got = htmlCache.has(r.id)
      ? Promise.resolve(htmlCache.get(r.id))
      : Promise.resolve()
          .then(() => SRC.html(r))
          .then((h) => {
            htmlCache.set(r.id, h);
            return h;
          });
    got
      .then((html) => {
        if (tok !== docTok || !box.isConnected) return;
        const f = document.createElement("iframe");
        f.setAttribute(
          "sandbox",
          "allow-scripts allow-popups allow-popups-to-escape-sandbox",
        );
        f.setAttribute("title", r.title || "Pisani izveštaj");
        f.setAttribute("referrerpolicy", "no-referrer");
        f.srcdoc =
          html ||
          '<p style="font-family:sans-serif;padding:40px">Izveštaj je prazan.</p>';
        framed(box, f);
      })
      .catch(() => {
        if (tok !== docTok || !box.isConnected) return;
        box.innerHTML =
          '<div class="vload vfail"><b>Izveštaj nije mogao da se učita.</b><button class="pill" type="button" data-retry>Probaj ponovo</button></div>';
      });
  }
  function updViewerHead() {
    const r = ST.R.get(cur.rid),
      h = rmain.querySelector(".vh1");
    if (r && h) h.textContent = r.title || "Izveštaj";
  }

  /* Informacioni sistem: mapa kako Infinity radi, stranica /ils/sistem u okviru */
  const SYS_PAGE = "/ils/sistem";
  function vSys(mode) {
    rmain.innerHTML = `<section class="v-view${mode === "enter" ? " enter" : ""}"><div class="vhead"><h1 class="vh1" tabindex="-1">Informacioni sistem</h1><a class="pill" href="${SYS_PAGE}" target="_blank" rel="noopener">Otvori preko celog ekrana${I_EXT}</a></div><div class="vframe" id="vframe"><div class="vload"><i class="lscanbar" aria-hidden="true"></i></div></div></section>`;
    loadDoc({ href: SYS_PAGE, title: "Informacioni sistem" });
  }

  /* Loom video */
  let lovRid = null,
    lovTm = 0;
  const rowThumb = (rid) =>
    rid ? rmain.querySelector(`[data-rid="${cssq(rid)}"] .rth`) : null;
  function loomEmbed(u) {
    const m = /loom\.com\/(?:share|embed)\/([0-9a-z]{10,})/i.exec(u || "");
    return m ? `https://www.loom.com/embed/${m[1]}` : null;
  }
  function posterHTML(r) {
    const inner = `<span class="lp-ui" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span class="lp-cam" aria-hidden="true"></span><span class="lp-play" aria-hidden="true">${I_PLAY}</span>`;
    return r.demo
      ? `<div class="lp demo">${inner}</div>`
      : `<a class="lp" href="${esc(r.loom)}" target="_blank" rel="noopener" aria-label="Pusti video na Loom-u">${inner}</a>`;
  }
  function openLoom(rid, from) {
    const r = ST.R.get(rid);
    if (!r || !hasLoom(r)) return;
    clearTimeout(lovTm);
    lovRid = rid;
    const emb = CLIENT.loomEmbed && !r.demo ? loomEmbed(r.loom) : null;
    $("#lovT").textContent = r.title || "Izveštaj";
    lovScreen.innerHTML = emb
      ? `<iframe src="${esc(emb)}" title="${esc(r.title || "Loom video")}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`
      : posterHTML(r);
    $("#lovActs").innerHTML =
      (r.demo
        ? `<span class="pill solid off" aria-disabled="true">${I_PLAY}Pusti na Loom-u</span>`
        : `<a class="pill solid" href="${esc(r.loom)}" target="_blank" rel="noopener">${I_PLAY}${emb ? "Otvori na Loom-u" : "Pusti na Loom-u"}${I_EXT}</a>`) +
      (hasDoc(r)
        ? `<button class="pill" type="button" data-doc-of="${esc(r.id)}">${I_DOC}Pisani izveštaj</button>`
        : "");
    lov.hidden = false;
    lov.classList.remove("on");
    document.documentElement.classList.add("noscroll");
    lovScreen.style.transition = "none";
    lovScreen.style.transform = "";
    const th =
      (from && from.querySelector && from.querySelector(".rth")) ||
      rowThumb(rid);
    requestAnimationFrame(() => {
      if (lovRid !== rid) return;
      if (th && !reduce) {
        const a = th.getBoundingClientRect(),
          b = lovScreen.getBoundingClientRect();
        if (a.width && b.width) {
          lovScreen.style.transformOrigin = "0 0";
          lovScreen.style.transform = `translate(${a.left - b.left}px,${a.top - b.top}px) scale(${a.width / b.width},${a.height / b.height})`;
          void lovScreen.offsetWidth;
          lovScreen.style.transition = `transform ${MT(660)}ms cubic-bezier(.7,0,.2,1)`;
          lovScreen.style.transform = "none";
        }
      }
      lov.classList.add("on");
    });
    setTimeout(
      () => {
        if (lovRid === rid) $("#lovX").focus({ preventScroll: true });
      },
      reduce ? 0 : 380,
    );
  }
  function closeLoom(animate) {
    if (lov.hidden) return;
    const rid = lovRid;
    lovRid = null;
    clearTimeout(lovTm);
    const done = () => {
      if (lovRid) return;
      lov.hidden = true;
      lovScreen.innerHTML = "";
      lovScreen.style.transform = "";
      lovScreen.style.transition = "";
      document.documentElement.classList.remove("noscroll");
    };
    lov.classList.remove("on");
    const fr = lovScreen.querySelector("iframe");
    if (fr) fr.remove();
    if (!animate || reduce) {
      done();
      return;
    }
    const th = rowThumb(rid);
    if (th) {
      const a = th.getBoundingClientRect(),
        b = lovScreen.getBoundingClientRect();
      if (a.width && b.width) {
        lovScreen.style.transformOrigin = "0 0";
        lovScreen.style.transition = `transform ${MT(550)}ms cubic-bezier(.7,0,.25,1)`;
        lovScreen.style.transform = `translate(${a.left - b.left}px,${a.top - b.top}px) scale(${a.width / b.width},${a.height / b.height})`;
      }
    }
    lovTm = setTimeout(() => {
      done();
      const t = rowThumb(rid);
      if (t) t.closest("button").focus({ preventScroll: true });
    }, MT(560));
  }

  /* =========================================================
     CREATIVE INSPECTION
     ========================================================= */
  /* laserska šina sa 6 faza: popunjena do trenutne faze */
  function trackHTML(ix, from, anim, delay, big) {
    const to = ix / 5,
      dur = anim ? Math.max(0.4, (to - from) * 1.6) : 0;
    const nodes = STAGES.map((st, k) => {
      const p = k / 5,
        state = k < ix ? "d" : k === ix ? "c" : "";
      const ig = anim && p >= from - 1e-6 && p <= to + 1e-6,
        nd = ig ? delay + (to > from ? (p - from) / (to - from) : 1) * dur : 0;
      return `<i class="tn${state ? " " + state : ""}" style="--x:${p}${ig ? `;--nd:${nd.toFixed(2)}s;--rd:${(nd + 0.5).toFixed(2)}s` : ""}"${ig ? " data-ig" : ""}>${k === ix && ix === 5 ? I_CHECK : ""}</i>`;
    }).join("");
    const labels = big
      ? `<span class="tls" aria-hidden="true">${STAGES.map((st, k) => `<span class="tl${k < ix ? " d" : k === ix ? " c" : ""}" style="--x:${k / 5};--k:${k}">${st.n}</span>`).join("")}</span>`
      : "";
    return `<span class="trk${big ? " big" : ""}${anim ? " anim" : ""}${ix === 5 ? " fin" : ""}" style="--from:${from.toFixed(3)};--to:${to.toFixed(3)};--td:${delay.toFixed(2)}s;--dur:${dur.toFixed(2)}s" role="img" aria-label="Faza: ${STAGES[ix].n}">
      <span class="tlab">${STAGES[ix].n}</span>
      <span class="tk" aria-hidden="true"><i class="tb"></i><i class="tf"></i>${nodes}<i class="th"></i></span>${labels}
    </span>`;
  }
  const fromOf = (s, mode) => {
    const ix = stageIx(s),
      p = ST.seen.get(s.id);
    return mode === "enter" || mode === "swap"
      ? 0
      : p != null && p !== ix
        ? p / 5
        : ix / 5;
  };

  /* lista skripti jednog perioda: po fazama, kao u OS-u */
  function vScripts(P, mode) {
    const en = mode === "enter" || mode === "swap",
      L = P.scripts;
    const body = L.length
      ? `<ol class="slist">${L.map((s, i) => stripHTML(s, i, mode)).join("")}</ol>`
      : `<div class="rempty"><span class="ric" aria-hidden="true">${I_PEN}</span><h2>Još nema skripti</h2></div>`;
    rmain.innerHTML = `<section class="v-scripts${en ? " enter" : ""}">${headHTML([nameParts(P.it)], mode)}${body}</section>`;
    L.forEach((s) => ST.seen.set(s.id, stageIx(s)));
    after(mode);
  }
  /* ikonica komentara ostaje uz poslednju reč, ne pada sama u novi red */
  function titleWithIcon(t, icon) {
    if (!icon) return esc(t);
    const m = /^(.*\s)?(\S+)$/.exec(t.trim());
    return m
      ? `${esc(m[1] || "")}<span class="nw">${esc(m[2])}${icon}</span>`
      : esc(t) + icon;
  }
  function stripHTML(s, i, mode) {
    const ix = stageIx(s),
      from = fromOf(s, mode),
      en = mode === "enter" || mode === "swap",
      anim = en || Math.abs(from - ix / 5) > 1e-6;
    const cm = (ST.byS.get(s.id) || []).filter((c) => !c.resolved).length;
    return `<li class="sli" style="--i:${i}"><button class="sitem${ix === 5 ? " done" : ""}" type="button" data-sid="${esc(s.id)}">
      <span class="sidx" aria-hidden="true">${pad(i + 1)}</span>
      <span class="stitle">${titleWithIcon(s.title || "Skripta", cm ? `<i class="scm" aria-label="Ima komentar">${I_MSG}</i>` : "")}</span>
      <span class="sstage">${trackHTML(ix, from, anim, en ? 0.3 + Math.min(i, 8) * 0.064 : 0.05, false)}</span>
      <span class="parr" aria-hidden="true">${I_ARR}</span><i class="rsweep" aria-hidden="true"></i>
    </button></li>`;
  }

  /* jedna skripta: samo za čitanje + komentari */
  let ANCH = new Map(),
    bodySig = null,
    deferBody = false;
  const sigOf = (s) =>
    bodyOf(s) +
    "\u0001" +
    (ST.byS.get(s.id) || [])
      .filter((c) => !c.resolved && c.quote)
      .map((c) => [c.id, c.quote, c.before || "", c.after || ""].join("\u0002"))
      .join("\u0003");
  function vScript(P, sid, mode) {
    const s = ST.S.get(sid);
    if (!s || s.monthId !== P.it.id) {
      rmain.innerHTML = stateHTML("Ova skripta ne postoji.", false, true);
      return;
    }
    const en = mode === "enter" || mode === "swap",
      ix = stageIx(s),
      from = fromOf(s, mode),
      anim = en || Math.abs(from - ix / 5) > 1e-6;
    (ST.byS.get(s.id) || []).forEach((c) => {
      if (c.resolved) ST.resSeen.add(c.id);
    });
    rmain.innerHTML = `<section class="v-script${en ? " enter" : ""}" data-sid="${esc(s.id)}">
      <div class="rhead"><h1 class="rh1 sh1" tabindex="-1" data-t="${esc(s.title || "Skripta")}">${wordsHTML(s.title, !en)}</h1></div>
      <div class="spipe">${trackHTML(ix, from, anim, en ? 0.4 : 0.05, true)}</div>
      <div class="sgrid">
        <article class="paper" id="paper"><i class="pline" aria-hidden="true"></i><div class="psheet"><div class="pbody" id="pbody"></div></div></article>
        <aside class="crail" id="crail" aria-label="Komentari">
          <h2 class="chd">Komentari</h2>
          ${
            ST.cmErr
              ? ""
              : `<button class="pill cnew" type="button" data-cnew>${I_MSG}Napiši komentar</button>
          <div class="ccomp" id="ccomp"><form class="cform" data-cform novalidate>
            <div class="cq" data-cq hidden><span class="cqt" data-cqt></span><button type="button" class="cqx" data-cqx aria-label="Ukloni označeni tekst">${SV('<path d="M6 6l12 12M18 6L6 18"/>', 2.6)}</button></div>
            <textarea class="cta" data-cta rows="1" maxlength="2000" placeholder="Napiši komentar…" aria-label="Komentar"></textarea>
            <div class="cfoot"><button type="button" class="csend" data-csend disabled><span>Pošalji</span>${I_ARR}</button></div>
          </form></div>`
          }
          <ol class="clist" id="clist"></ol>
        </aside>
      </div>
    </section>`;
    ST.seen.set(s.id, ix);
    paintBody(s);
    renderCList(s, en);
    after(mode);
  }
  /* pri živoj promeni (tim menja skriptu u OS-u) menja se samo ono što je drugačije */
  function updScript() {
    const s = ST.S.get(cur.sid),
      v = rmain.querySelector(".v-script");
    if (!s || !v) return;
    v.classList.remove("enter");
    const h = v.querySelector(".sh1"),
      tt = s.title || "Skripta";
    if (h && h.dataset.t !== tt) {
      h.dataset.t = tt;
      h.innerHTML = wordsHTML(tt, true);
    }
    const ix = stageIx(s),
      p = ST.seen.get(s.id);
    if (p !== ix) {
      v.querySelector(".spipe").innerHTML = trackHTML(
        ix,
        p != null ? p / 5 : ix / 5,
        p != null,
        0.05,
        true,
      );
      ST.seen.set(s.id, ix);
    }
    if (sigOf(s) !== bodySig) {
      if (SEL || sending) deferBody = true;
      else paintBody(s);
    }
    renderCList(s, false);
    setTop(cur);
  }
  function paintBody(s) {
    const b = $("#pbody");
    if (!b) return;
    const html = bodyOf(s);
    bodySig = sigOf(s);
    deferBody = false;
    b.innerHTML =
      html ||
      `<div class="pempty"><span class="ric" aria-hidden="true">${I_PEN}</span><b>Tekst stiže uskoro</b></div>`;
    ANCH = new Map();
    const fresh = [];
    (ST.byS.get(s.id) || [])
      .slice()
      .reverse()
      .forEach((c) => {
        if (c.resolved || !c.quote) return;
        const r = findRange(b, c.quote, c.before, c.after);
        if (!r) return;
        const ms = wrapRange(r, b, c.id, "hl");
        if (!ms.length) return;
        ANCH.set(c.id, ms);
        if (ST.cfresh.has(c.id) && !ST.burnt.has(c.id)) {
          ST.burnt.add(c.id);
          fresh.push(ms);
        }
      });
    markPending();
    fresh.forEach(burn);
  }
  /* citat se traži bez razmaka, pa ga ne kvare prelomi redova; tekst oko citata razrešava ponavljanja */
  function findRange(root, quote, before, after) {
    const q = squash(quote);
    if (!q) return null;
    const map = [];
    let hay = "";
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = w.nextNode())) {
      const d = n.data;
      for (let i = 0; i < d.length; i++) {
        if (/\s/.test(d[i])) continue;
        hay += d[i];
        map.push([n, i]);
      }
    }
    const b = squash(before).slice(-24),
      a = squash(after).slice(0, 24);
    let at = -1,
      k;
    if (b && a && (k = hay.indexOf(b + q + a)) >= 0) at = k + b.length;
    if (at < 0 && b && (k = hay.indexOf(b + q)) >= 0) at = k + b.length;
    if (at < 0 && a && (k = hay.indexOf(q + a)) >= 0) at = k;
    if (at < 0) at = hay.indexOf(q);
    if (at < 0) return null;
    const s = map[at],
      e = map[at + q.length - 1],
      r = document.createRange();
    r.setStart(s[0], s[1]);
    r.setEnd(e[0], e[1] + 1);
    return r;
  }
  function wrapRange(r, root, cid, cls) {
    const sc = r.startContainer,
      so = r.startOffset,
      ec = r.endContainer,
      eo = r.endOffset,
      list = [],
      out = [];
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = w.nextNode())) if (r.intersectsNode(n)) list.push(n);
    list.forEach((t) => {
      const s = t === sc ? so : 0,
        e = t === ec ? eo : t.data.length;
      if (e <= s) return;
      let mid = t;
      if (s > 0) mid = t.splitText(s);
      if (e - s < mid.data.length) mid.splitText(e - s);
      if (!mid.data.trim()) return;
      const m = document.createElement("mark");
      m.className = cls;
      if (cid) m.dataset.cid = cid;
      mid.parentNode.insertBefore(m, mid);
      m.appendChild(mid);
      out.push(m);
    });
    return out;
  }
  /* novi komentar: laser "izgori" podvlaku preko citata */
  function burn(ms) {
    if (reduce) return;
    const segs = ms.map((m) => ({
        m,
        w: [...m.getClientRects()].reduce((a, r) => a + r.width, 0),
      })),
      tot = segs.reduce((a, x) => a + x.w, 0) || 1,
      T = MT(900) / 1000;
    let acc = 0;
    segs.forEach((x) => {
      x.m.style.animationDelay = ((acc / tot) * T).toFixed(3) + "s";
      x.m.style.animationDuration =
        Math.max(0.12, (x.w / tot) * T).toFixed(3) + "s";
      x.m.classList.add("burn");
      acc += x.w;
    });
    setTimeout(
      () =>
        ms.forEach((m) => {
          m.classList.remove("burn");
          m.style.animationDelay = "";
          m.style.animationDuration = "";
        }),
      T * 1000 + 200,
    );
    const rects = ms
        .flatMap((m) => [...m.getClientRects()])
        .filter((r) => r.width > 2),
      t0 = performance.now();
    (function step(now) {
      const k = Math.min(1, (now - t0) / (T * 1000));
      let d = k * tot;
      for (const r of rects) {
        if (d <= r.width) {
          FX.sparks(r.left + d, r.bottom - 3, 3, true);
          break;
        }
        d -= r.width;
      }
      if (k < 1) requestAnimationFrame(step);
    })(t0);
  }
  function cardC(c, i, anim) {
    const res = !!c.resolved,
      anch = ANCH.has(c.id),
      lost = !!c.quote && !anch && !res,
      just = res && !ST.resSeen.has(c.id);
    if (res) ST.resSeen.add(c.id);
    else ST.resSeen.delete(c.id);
    const fresh = ST.cfresh.has(c.id) && !ST.shown.has(c.id),
      mine =
        c.author === "client" &&
        (!CLIENT.user ||
          !CLIENT.user.uid ||
          !c.authorUid ||
          (c.authorUid === CLIENT.user.uid &&
            (!c.authorName ||
              !CLIENT.user.name ||
              c.authorName === CLIENT.user.name)));
    const st = anim
      ? ""
      : fresh && !reduce
        ? `;animation:ccin ${MT(950)}ms var(--spring) both`
        : ";animation:none";
    return `<li class="cc${res ? " res" : ""}${just ? " justres" : ""}" data-cid="${esc(c.id)}" style="--i:${i}${st}">
      ${res ? `<span class="cres"><i class="cok" aria-hidden="true">${I_CHECK}</i>Rešeno</span>` : ""}
      ${c.quote ? `<button type="button" class="cquote${lost ? " lost" : ""}" data-jump="${esc(c.id)}"${anch ? "" : " disabled"}>${esc(c.quote)}</button>` : ""}
      <p class="ctext">${esc(c.text)}</p>
      <span class="cmeta"><time datetime="${new Date(c.createdAt || 0).toISOString()}">${ago(c.createdAt)}</time>${!res && mine && SRC && SRC.delComment ? `<button type="button" class="cdel" data-cdel="${esc(c.id)}" aria-label="Obriši komentar">${I_TRASH}</button>` : ""}</span>
    </li>`;
  }
  function renderCList(s, anim) {
    const l = $("#clist");
    if (!l) return;
    if (ST.cmErr) {
      l.innerHTML = '<li class="cnone">Komentari trenutno nisu dostupni.</li>';
      return;
    }
    const L = ST.byS.get(s.id) || [];
    l.innerHTML = L.map((c, i) => cardC(c, i, anim)).join("");
    L.forEach((c) => {
      if (ST.cfresh.has(c.id)) ST.shown.add(c.id);
    });
  }

  /* papir se otkriva laserskim skenom odozgo */
  function startScan() {
    const p = $("#paper"),
      v = rmain.querySelector(".v-script.enter");
    if (!p || !v || reduce) return;
    const top = p.getBoundingClientRect().top + scrollY,
      vis = Math.max(240, Math.min(p.offsetHeight, innerHeight - top + 80));
    p.style.setProperty("--vh", vis + "px");
    p.classList.add("scan");
    const end = (ev) => {
      if (ev.target !== p || ev.animationName !== "prv") return;
      p.removeEventListener("animationend", end);
      p.classList.remove("scan");
    };
    p.addEventListener("animationend", end);
  }

  /* ---------- komentari: označi tekst → Komentariši ---------- */
  let SEL = null,
    HELD = null,
    CQ = null,
    selTm = 0,
    sending = false;
  const activeForm = () =>
    wide()
      ? rmain.querySelector("#ccomp [data-cform]")
      : csheet.querySelector("[data-cform]");
  function selInfo() {
    const sel = getSelection();
    if (!sel || sel.isCollapsed || !sel.rangeCount) return null;
    const b = $("#pbody");
    if (!b) return null;
    const r = sel.getRangeAt(0);
    if (!b.contains(r.startContainer) || !b.contains(r.endContainer))
      return null;
    const quote = r.toString().replace(/\s+/g, " ").trim();
    if (squash(quote).length < 2) return null;
    const pre = document.createRange();
    pre.selectNodeContents(b);
    pre.setEnd(r.startContainer, r.startOffset);
    const post = document.createRange();
    post.selectNodeContents(b);
    post.setStart(r.endContainer, r.endOffset);
    return {
      quote: quote.slice(0, 600),
      before: pre.toString().replace(/\s+/g, " ").slice(-40),
      after: post.toString().replace(/\s+/g, " ").slice(0, 40),
      range: r.cloneRange(),
    };
  }
  function updSel() {
    if (
      rapp.hidden ||
      cur.v !== "script" ||
      ST.cmErr ||
      !SRC ||
      !SRC.putComment
    ) {
      SEL = null;
      hideSel();
      return;
    }
    SEL = selInfo();
    if (!SEL) {
      hideSel();
      if (deferBody && !sending) {
        const s = ST.S.get(cur.sid);
        if (s) {
          paintBody(s);
          renderCList(s, false);
        }
      }
      return;
    }
    placeSel();
  }
  function placeSel() {
    if (!SEL) return;
    const dock = !fine;
    selbtn.classList.toggle("dock", dock);
    if (!dock) {
      const rs = [...SEL.range.getClientRects()].filter((r) => r.width > 1),
        f = rs[0] || SEL.range.getBoundingClientRect(),
        l = rs[rs.length - 1] || f;
      let y = f.top - 58,
        below = false;
      if (y < 86) {
        y = l.bottom + 14;
        below = true;
      }
      if (l.bottom < 70 || f.top > innerHeight - 10) {
        selbtn.classList.remove("on");
        return;
      }
      selbtn.style.left =
        Math.max(
          96,
          Math.min(
            innerWidth - 96,
            below ? (l.left + l.right) / 2 : (f.left + f.right) / 2,
          ),
        ) + "px";
      selbtn.style.top = y + "px";
      selbtn.classList.toggle("below", below);
    } else {
      selbtn.style.left = "";
      selbtn.style.top = "";
    }
    clearTimeout(selbtn._t);
    if (selbtn.hidden) {
      selbtn.hidden = false;
      void selbtn.offsetWidth;
    }
    selbtn.classList.add("on");
  }
  function hideSel() {
    selbtn.classList.remove("on");
    clearTimeout(selbtn._t);
    selbtn._t = setTimeout(() => {
      if (!selbtn.classList.contains("on")) selbtn.hidden = true;
    }, MT(260));
  }
  document.addEventListener("selectionchange", () => {
    if (rapp.hidden || cur.v !== "script") return;
    clearTimeout(selTm);
    selTm = setTimeout(updSel, fine ? 70 : 240);
  });
  addEventListener(
    "scroll",
    () => {
      if (SEL && fine && !selbtn.hidden) placeSel();
    },
    { passive: true },
  );
  addEventListener("resize", () => {
    if (SEL) placeSel();
  });
  selbtn.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    HELD = SEL;
  });
  selbtn.addEventListener("click", () => {
    const info = HELD || SEL;
    HELD = null;
    if (info) startQuote(info);
  });
  function startQuote(info) {
    CQ = { quote: info.quote, before: info.before, after: info.after };
    try {
      getSelection().removeAllRanges();
    } catch (e) {}
    SEL = null;
    hideSel();
    clearPending();
    markPending();
    const ms = $("#pbody")
      ? [...$("#pbody").querySelectorAll("mark.pend")]
      : [];
    if (ms.length && !reduce) {
      const r = ms[ms.length - 1].getBoundingClientRect();
      FX.sparks(r.right, r.bottom - 3, 14, true);
    }
    openComposer();
  }
  function markPending() {
    const b = $("#pbody");
    if (!b || !CQ) return;
    const r = findRange(b, CQ.quote, CQ.before, CQ.after);
    if (r) wrapRange(r, b, null, "pend");
  }
  function clearPending() {
    const b = $("#pbody");
    if (!b) return;
    const ms = b.querySelectorAll("mark.pend");
    if (!ms.length) return;
    ms.forEach((m) => m.replaceWith(...m.childNodes));
    b.normalize();
  }
  function autoGrow(t) {
    t.style.height = "auto";
    t.style.height = Math.min(t.scrollHeight, 240) + "px";
  }
  function syncComposer() {
    document.querySelectorAll("[data-cform]").forEach((f) => {
      const q = f.querySelector("[data-cq]"),
        ta = f.querySelector("[data-cta]"),
        lab = f.hasAttribute("data-cr") ? cxLabel() : CQ ? CQ.quote : "";
      q.hidden = !lab;
      f.classList.toggle("has-q", !!lab);
      if (lab) f.querySelector("[data-cqt]").textContent = lab;
      f.querySelector("[data-csend]").disabled = !ta.value.trim() || sending;
    });
  }
  function openComposer() {
    syncComposer();
    if (wide()) {
      const f = activeForm();
      if (!f) return;
      f.classList.add("open");
      const ta = f.querySelector("[data-cta]");
      ta.focus({ preventScroll: true });
      f.classList.remove("ping");
      void f.offsetWidth;
      f.classList.add("ping");
      const r = f.getBoundingClientRect();
      if (r.top < 70 || r.bottom > innerHeight)
        f.scrollIntoView({
          block: "nearest",
          behavior: reduce ? "auto" : "smooth",
        });
    } else openSheet();
  }
  const VV = window.visualViewport;
  function kbFit() {
    if (!VV || csheet.hidden) return;
    csheet.style.setProperty(
      "--kb",
      Math.max(0, innerHeight - VV.height - VV.offsetTop) + "px",
    );
  }
  if (VV) {
    VV.addEventListener("resize", kbFit);
    VV.addEventListener("scroll", kbFit);
  }
  function openSheet() {
    clearTimeout(csheet._t);
    csheet.hidden = false;
    void csheet.offsetWidth;
    csheet.classList.add("on");
    document.documentElement.classList.add("noscroll");
    const ta = csheet.querySelector("[data-cta]");
    autoGrow(ta);
    ta.focus({ preventScroll: true });
    kbFit();
  }
  function closeSheet(instant) {
    if (csheet.hidden) return;
    csheet.classList.remove("on");
    document.documentElement.classList.remove("noscroll");
    const ta = csheet.querySelector("[data-cta]");
    if (document.activeElement === ta) ta.blur();
    clearTimeout(csheet._t);
    csheet._t = setTimeout(
      () => {
        if (!csheet.classList.contains("on")) csheet.hidden = true;
      },
      instant || reduce ? 0 : 460,
    );
  }
  function cancelSheet() {
    CQ = null;
    clearPending();
    const ta = csheet.querySelector("[data-cta]");
    ta.value = "";
    autoGrow(ta);
    syncComposer();
    closeSheet();
  }
  function resetCompose(instant) {
    CQ = null;
    SEL = null;
    HELD = null;
    deferBody = false;
    hideSel();
    closeSheet(instant);
    if (instant) {
      selbtn.classList.remove("on");
      selbtn.hidden = true;
    }
    document.querySelectorAll("[data-cform] [data-cta]").forEach((t) => {
      if (t.closest("#csheet")) {
        t.value = "";
        autoGrow(t);
      }
    });
    syncComposer();
  }
  async function sendFrom(form) {
    if (form && form.hasAttribute("data-cr")) return sendCreative(form);
    if (sending || !form) return;
    const s = ST.S.get(cur.sid),
      ta = form.querySelector("[data-cta]"),
      text = ta.value.trim();
    if (!s || !text || !SRC || !SRC.putComment) return;
    const now = Date.now(),
      q = CQ,
      u = CLIENT.user || {};
    const data = {
      clientId: CLIENT.id,
      scriptId: s.id,
      monthId: s.monthId,
      text: text.slice(0, 2000),
      quote: q ? q.quote : "",
      before: q ? q.before : "",
      after: q ? q.after : "",
      author: "client",
      authorName: u.name || CLIENT.short || CLIENT.name,
      authorUid: u.uid || null,
      createdAt: now,
      order: now,
      resolved: false,
    };
    const id = SRC.newId();
    ST.cfresh.add(id);
    setTimeout(() => ST.cfresh.delete(id), 5000);
    const btn = form.querySelector("[data-csend]"),
      br = btn.getBoundingClientRect();
    if (!reduce && br.width)
      FX.sparks(br.left + br.width / 2, br.top + br.height / 2, 26, true);
    sending = true;
    ta.value = "";
    autoGrow(ta);
    CQ = null;
    clearPending();
    syncComposer();
    if (form.closest("#csheet")) closeSheet();
    else {
      ta.blur();
      form.classList.remove("open");
    }
    try {
      await SRC.putComment(id, data);
      toast("Komentar je poslat");
    } catch (e) {
      ST.cfresh.delete(id);
      ta.value = text;
      autoGrow(ta);
      CQ = q;
      markPending();
      toast("Komentar nije poslat. Probaj ponovo.");
      if (form.closest("#csheet")) openSheet();
      else form.classList.add("open");
    } finally {
      sending = false;
      syncComposer();
      if (deferBody && !SEL) {
        const x = ST.S.get(cur.sid);
        if (x) {
          paintBody(x);
          renderCList(x, false);
        }
      }
    }
  }
  async function delComment(cid, col) {
    col = col || "comments";
    const c =
      col === "comments"
        ? ST.C.get(cid)
        : [].concat(...ST.ccBy.values()).find((x) => x.id === cid);
    if (!c || !SRC || !SRC.delComment) return;
    const { id, ...data } = c,
      el =
        col === "comments"
          ? rmain.querySelector(`.cc[data-cid="${cssq(cid)}"]`)
          : thList.querySelector(`.cc[data-ccid="${cssq(cid)}"]`);
    if (el && !reduce) {
      el.classList.add("gone");
      await new Promise((r) => setTimeout(r, MT(260)));
    }
    try {
      await SRC.delComment(id, col);
      toast("Komentar je obrisan", {
        label: "Vrati",
        fn: () => {
          SRC.putComment(id, data, col).catch(() =>
            toast("Komentar nije vraćen."),
          );
        },
      });
    } catch (e) {
      if (el) el.classList.remove("gone");
      toast("Komentar nije obrisan.");
    }
  }
  /* veza između podvlake u tekstu i kartice komentara */
  let litId = null;
  function lit(cid) {
    if (cid === litId) return;
    litId = cid;
    rmain.querySelectorAll(".lit").forEach((x) => x.classList.remove("lit"));
    if (cid)
      rmain
        .querySelectorAll(`.v-script [data-cid="${cssq(cid)}"]`)
        .forEach((x) => x.classList.add("lit"));
  }
  function jumpTo(cid) {
    const ms = ANCH.get(cid);
    if (!ms || !ms.length || !ms[0].isConnected) return;
    ms[0].scrollIntoView({
      block: "center",
      behavior: reduce ? "auto" : "smooth",
    });
    ms.forEach((m) => {
      m.classList.remove("flash");
      void m.offsetWidth;
      m.classList.add("flash");
    });
    setTimeout(() => ms.forEach((m) => m.classList.remove("flash")), 1500);
  }
  function focusCard(cid) {
    const c = rmain.querySelector(`.cc[data-cid="${cssq(cid)}"]`);
    if (!c) return;
    c.scrollIntoView({
      block: wide() ? "nearest" : "center",
      behavior: reduce ? "auto" : "smooth",
    });
    c.classList.remove("flash");
    void c.offsetWidth;
    c.classList.add("flash");
  }
  function stepScript(d) {
    const P = ST.P.get(cur.pid);
    if (!P || cur.v !== "script") return false;
    const L = P.scripts,
      i = L.findIndex((s) => s.id === cur.sid),
      n = L[i + d];
    if (i < 0 || !n) return false;
    swapTo({ sec: "ci", v: "script", pid: cur.pid, sid: n.id });
    return true;
  }

  /* =========================================================
     FINAL CREATIVES
     galerija kreativa jednog perioda → pozornica u punom kvalitetu → komentari klijenta
     ========================================================= */
  const THW = matchMedia("(min-width:900px)"),
    thWide = () => THW.matches;
  const th = $("#th"),
    thMedia = $("#thMedia"),
    thList = $("#thList"),
    thComp = $("#thComp"),
    thStage = $("#thStage"),
    thAmb = $("#thAmb");
  const srcOf = (x) => (x ? x.url || (x.asset ? "/_blob/" + x.asset : "") : "");
  const kindOf = (c) => {
    const fs = c.files || [];
    return (
      c.kind ||
      (fs.length > 1
        ? "carousel"
        : /^video\//.test((fs[0] || {}).type || "")
          ? "video"
          : "image")
    );
  };
  const arOf = (c) => {
    const f = (c.files || [])[0] || {};
    return f.w && f.h ? f.w / f.h : kindOf(c) === "video" ? 9 / 16 : 4 / 5;
  };
  const posterOf = (c) =>
    srcOf(c.poster) || (kindOf(c) !== "video" ? srcOf((c.files || [])[0]) : "");
  const filesSig = (c) =>
    (c.files || []).map(srcOf).join("|") + "#" + srcOf(c.poster);
  const fmtT = (s) => {
    s = Math.max(0, Math.floor(Number(s) || 0));
    return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
  };
  const openCC = (id) => (ST.ccBy.get(id) || []).filter((x) => !x.resolved);
  /* folderi iz Skeylo OS-a: period.fcFolders + kreativa.folderId; kreativa čiji folder
     više ne postoji je u glavnom prikazu */
  const foldersOf = (P) =>
    ((P && P.it.fcFolders) || [])
      .filter((f) => f && f.id)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  const folderOf = (P, fid) =>
    (fid && foldersOf(P).find((f) => f.id === fid)) || null;
  const fidOf = (P, c) =>
    c && c.folderId && folderOf(P, c.folderId) ? c.folderId : null;
  const crIn = (P, fid) =>
    P.creatives.filter((c) => fidOf(P, c) === (fid || null));
  const crRoute = (c) => ({
    sec: "cr",
    v: "gallery",
    pid: c.monthId,
    fid: fidOf(ST.P.get(c.monthId), c),
    cid: c.id,
  });
  const crOfCur = () => {
    const P = cur.pid && ST.P.get(cur.pid);
    if (!P) return [];
    const c = cur.cid && P.creatives.find((x) => x.id === cur.cid);
    return crIn(P, c ? fidOf(P, c) : cur.fid);
  };

  /* galerija */
  function galSig(P) {
    return (
      (cur.fid || "") +
      "@" +
      foldersOf(P)
        .map((f) => [f.id, f.name, f.color].join("~"))
        .join("|") +
      "@" +
      P.creatives
        .map((c) =>
          [
            c.id,
            c.title || "",
            posterOf(c),
            filesSig(c),
            openCC(c.id).length,
            fidOf(P, c) || "",
          ].join("~"),
        )
        .join("|")
    );
  }
  /* glavni prikaz: folderi (samo oni sa kreativama), pa kreative van foldera; u folderu: njegove kreative */
  function galBody(P) {
    const F = folderOf(P, cur.fid),
      L = crIn(P, F ? F.id : null),
      FS = F
        ? []
        : foldersOf(P)
            .map((f) => ({ f, L: crIn(P, f.id) }))
            .filter((x) => x.L.length);
    if (!L.length && !FS.length)
      return `<div class="rempty"><span class="ric" aria-hidden="true">${I_FILM}</span><h2>${F ? "Folder je prazan" : "Kreative stižu uskoro"}</h2></div>`;
    return (
      (FS.length
        ? `<ol class="gfolds">${FS.map((x, i) => gfoldHTML(x.f, x.L, i)).join("")}</ol>`
        : "") +
      (FS.length && L.length
        ? `<div class="gsec" style="--i:${FS.length}"><span>Ostale kreative</span><i></i></div>`
        : "") +
      (L.length
        ? `<ol class="glist">${L.map((c, i) => gcardHTML(c, i + FS.length)).join("")}</ol>`
        : "")
    );
  }
  function gfoldHTML(f, L, i) {
    const th = L.map(posterOf).filter(Boolean).slice(0, 3),
      cm = L.reduce((a, c) => a + openCC(c.id).length, 0),
      n = `${L.length} ${pl(L.length, "kreativa", "kreative", "kreativa")}`;
    return `<li class="gfi" style="--i:${i};--fc:${esc(f.color || "#d4919b")}"><button class="gfold" type="button" data-fid="${esc(f.id)}" aria-label="Folder ${esc(f.name || "Folder")}, ${n}">
      <span class="gf-back" aria-hidden="true"></span>
      <span class="gf-th" aria-hidden="true">${th.map((src, k) => `<img src="${esc(src)}" alt="" decoding="async" style="--k:${k};--n:${th.length}">`).join("")}</span>
      <span class="gf-front"><span class="gf-n">${esc(f.name || "Folder")}</span><span class="gf-c">${n}${cm ? `<i class="scm" aria-label="Ima komentar">${I_MSG}</i>` : ""}</span><span class="gf-go" aria-hidden="true">${I_ARR}</span></span>
    </button></li>`;
  }
  function folderHead(P, F, mode) {
    const ws = String(F.name || "Folder")
        .trim()
        .split(/\s+/),
      n = crIn(P, F.id).length;
    return (
      headHTML(
        [
          ws.length > 1
            ? [
                { t: ws.slice(0, -1).join(" ") + " " },
                { t: ws[ws.length - 1], em: true },
              ]
            : [{ t: ws[0] }],
        ],
        mode,
      ) +
      `<p class="gfk"><i aria-hidden="true"></i>${esc(periodLabel(P.it))} · ${n} ${pl(n, "kreativa", "kreative", "kreativa")}</p>`
    );
  }
  function gcardHTML(c, i) {
    const k = kindOf(c),
      f = (c.files || [])[0] || {},
      p = posterOf(c),
      cm = openCC(c.id).length;
    return `<li class="gli${ST.crFresh.has(c.id) ? " fresh" : ""}" style="--i:${i}"><button class="gcard" type="button" data-crid="${esc(c.id)}" data-kind="${k}">
      <span class="gframe">${p ? `<img class="gpos" src="${esc(p)}" alt="" decoding="async"${i > 5 ? ' loading="lazy"' : ""}>` : `<span class="gnone">${I_FILM}</span>`}${k === "video" ? `<video class="gvid" muted loop playsinline preload="none" data-src="${esc(srcOf(f))}"></video>` : ""}${k !== "image" ? `<span class="gk" aria-hidden="true">${k === "video" ? I_PLAY : I_CAR}</span>` : ""}<i class="gscan" aria-hidden="true"></i></span>
      <span class="gtitle">${titleWithIcon(c.title || "Kreativa", cm ? `<i class="scm" aria-label="Ima komentar">${I_MSG}</i>` : "")}</span>
    </button></li>`;
  }
  const galHead = (P) => {
    const F = folderOf(P, cur.fid);
    return F ? `${F.id}~${F.name}~${F.color}~${crIn(P, F.id).length}` : "";
  };
  function vGallery(P, mode) {
    const en = mode === "enter" || mode === "swap",
      F = folderOf(P, cur.fid);
    hovCard = null;
    rmain.innerHTML = `<section class="v-gal${en ? " enter" : ""}${F ? " infold" : ""}" data-sig="${esc(galSig(P))}" data-head="${esc(galHead(P))}"${F ? ` style="--fc:${esc(F.color || "#d4919b")}"` : ""}>${F ? folderHead(P, F, mode) : headHTML([nameParts(P.it)], mode)}<div class="gbody">${galBody(P)}</div></section>`;
    after(mode);
  }
  function updGallery() {
    const P = ST.P.get(cur.pid),
      sec = rmain.querySelector(".v-gal");
    if (!P || !sec) return;
    /* otvoren folder je obrisan u OS-u: nazad na sve kreative perioda */
    if (cur.fid && !folderOf(P, cur.fid) && !cur.cid) {
      go({ sec: "cr", v: "gallery", pid: cur.pid });
      return;
    }
    const sig = galSig(P);
    if (sec.dataset.head !== galHead(P)) {
      vGallery(P, "update");
      if (!th.hidden) updTheater();
      return;
    }
    if (sec.dataset.sig !== sig) {
      sec.dataset.sig = sig;
      sec.classList.remove("enter");
      hovCard = null;
      sec.querySelector(".gbody").innerHTML = galBody(P);
    }
    if (!th.hidden) updTheater();
    else pendingTheater();
  }
  /* pregled videa na prelazak mišem */
  let hovCard = null;
  function hoverCard(card) {
    if (hovCard === card) return;
    if (hovCard) {
      const v = hovCard.querySelector(".gvid");
      if (v) v.pause();
      hovCard.classList.remove("playing");
    }
    hovCard = card;
    if (!card) return;
    const v = card.querySelector(".gvid");
    if (!v) return;
    if (!v.getAttribute("src") && v.dataset.src) v.src = v.dataset.src;
    v.onplaying = () => {
      if (hovCard === card) card.classList.add("playing");
    };
    const pr = v.play();
    if (pr && pr.catch) pr.catch(() => {});
  }

  /* pozornica */
  let TH = { cid: null },
    CX = null,
    VP = null,
    thTok = 0;
  const thOf = (r) =>
    r.sec === "cr" && r.v === "gallery" && r.cid ? r.cid : null;
  function pendingTheater() {
    if (TH.pending && ST.crReady && !ST.crErr) {
      const p = TH.pending;
      TH.pending = null;
      if (ST.CR.get(p)) openTheater(p, null);
      else goBack();
    }
  }
  function openTheater(cid, from) {
    if (!ST.crReady || ST.crErr) {
      TH = { cid: null, pending: cid };
      return;
    }
    const c = ST.CR.get(cid);
    if (!c || c.monthId !== cur.pid) {
      goBack();
      return;
    }
    const tok = ++thTok;
    TH = { cid, c, ar: arOf(c), slide: 0, cxOff: false };
    CX = null;
    th.hidden = false;
    th.classList.remove("on");
    document.documentElement.classList.add("noscroll");
    $("#thKnot").src = CLIENT.knot;
    (ST.ccBy.get(cid) || []).forEach((x) => {
      if (x.resolved) ST.resSeen.add(x.id);
    });
    fillTheater(true);
    thMedia.classList.remove("in");
    requestAnimationFrame(() => {
      if (tok !== thTok) return;
      fitMedia();
      th.classList.add("on");
      const card =
          (from && from.closest && from.closest(".gcard")) ||
          rmain.querySelector(`.gcard[data-crid="${cssq(cid)}"]`),
        fr = card && card.querySelector(".gframe"),
        a = fr && fr.getBoundingClientRect();
      if (a && a.width && !reduce && a.bottom > 0 && a.top < innerHeight)
        ghost(
          a,
          thMedia.getBoundingClientRect(),
          posterOf(c),
          getComputedStyle(fr).borderTopLeftRadius,
          getComputedStyle(thMedia).borderTopLeftRadius,
          640,
          () => {
            if (tok === thTok) {
              thMedia.classList.add("in");
              startMedia();
            }
          },
          "cubic-bezier(.2,.8,.2,1)",
        );
      else {
        thMedia.classList.add("in");
        startMedia();
      }
    });
    setTimeout(
      () => {
        if (tok === thTok && !th.hidden && !th.contains(document.activeElement))
          $("#thIn").focus({ preventScroll: true });
      },
      reduce ? 0 : 420,
    );
  }
  function closeTheater(animate) {
    TH.pending = null;
    if (th.hidden) return;
    const tok = ++thTok,
      cid = TH.cid,
      c = ST.CR.get(cid);
    stopMedia();
    const card = rmain.querySelector(`.gcard[data-crid="${cssq(cid)}"]`),
      fr = card && card.querySelector(".gframe");
    const done = () => {
      if (tok !== thTok) return;
      th.hidden = true;
      th.classList.remove("on");
      thMedia.innerHTML = "";
      thMedia.classList.remove("in");
      document.documentElement.classList.remove("noscroll");
      TH = { cid: null };
      CX = null;
      if (card) card.focus({ preventScroll: true });
    };
    th.classList.remove("on");
    if (!animate || reduce) {
      done();
      return;
    }
    const a = thMedia.getBoundingClientRect(),
      b = fr && fr.getBoundingClientRect();
    if (c && b && b.width && b.bottom > 0 && b.top < innerHeight) {
      thMedia.classList.remove("in");
      ghost(
        a,
        b,
        posterOf(c),
        getComputedStyle(thMedia).borderTopLeftRadius,
        getComputedStyle(fr).borderTopLeftRadius,
        520,
        () => {
          done();
          /* bez .enter: kad .land ode, kartica ne sme ponovo da pusti ulaznu animaciju */
          card.closest(".v-gal")?.classList.remove("enter");
          card.classList.remove("land");
          void card.offsetWidth;
          card.classList.add("land");
          setTimeout(() => card.classList.remove("land"), MT(900));
        },
        "cubic-bezier(.45,0,.2,1)",
      );
    } else {
      thMedia.classList.remove("in");
      setTimeout(done, MT(380));
    }
  }
  function switchTheater(cid, dir) {
    const c = ST.CR.get(cid);
    if (!c) {
      goBack();
      return;
    }
    const tok = ++thTok;
    stopMedia();
    const swap = () => {
      TH = { cid, c, ar: arOf(c), slide: 0, cxOff: false };
      (ST.ccBy.get(cid) || []).forEach((x) => {
        if (x.resolved) ST.resSeen.add(x.id);
      });
      fillTheater(false);
      fitMedia();
    };
    if (reduce) {
      swap();
      thMedia.classList.add("in");
      startMedia();
      return;
    }
    thMedia.classList.add(dir < 0 ? "go-r" : "go-l");
    $(".th-amb").classList.add("swap");
    setTimeout(() => {
      if (tok !== thTok) return;
      swap();
      thMedia.classList.remove("go-l", "go-r");
      thMedia.classList.add(dir < 0 ? "from-l" : "from-r");
      void thMedia.offsetWidth;
      requestAnimationFrame(() => {
        if (tok !== thTok) return;
        thMedia.classList.remove("from-l", "from-r");
        $(".th-amb").classList.remove("swap");
        startMedia();
      });
    }, MT(230));
  }
  /* kartica "izraste" u kreativu (i vrati se nazad) */
  function ghost(a, b, img, r1, r2, D, cb, E) {
    D = MT(D);
    const g = document.createElement("div");
    g.className = "th-ghost";
    const A = {
        left: a.left + "px",
        top: a.top + "px",
        width: a.width + "px",
        height: a.height + "px",
        borderRadius: r1,
      },
      B = {
        left: b.left + "px",
        top: b.top + "px",
        width: b.width + "px",
        height: b.height + "px",
        borderRadius: r2,
      };
    Object.assign(g.style, B, {
      backgroundImage: img
        ? `url("${String(img).replace(/["\\]/g, "")}")`
        : "none",
    });
    document.body.appendChild(g);
    let done = false;
    const fin = () => {
      if (done) return;
      done = true;
      cb && cb();
      requestAnimationFrame(() => {
        g.style.transition = `opacity ${MT(280)}ms`;
        g.style.opacity = "0";
        setTimeout(() => g.remove(), MT(320));
      });
    };
    /* Web Animations: ceo let se uvek vidi, i kad prvi kadar zakasni */
    if (g.animate) {
      const an = g.animate([A, B], {
        duration: D,
        easing: E || "cubic-bezier(.2,.8,.2,1)",
      });
      an.finished.then(fin, fin);
      setTimeout(fin, D + 1600);
    } else setTimeout(fin, D);
  }
  function fillTheater(first) {
    const c = TH.c,
      L = crOfCur(),
      i = L.findIndex((x) => x.id === c.id);
    setAmb(posterOf(c));
    navState(L, i);
    $("#thT").textContent = c.title || "Kreativa";
    thMedia.innerHTML = mediaHTML(c);
    thMedia.dataset.sig = filesSig(c);
    if (first || !thComp.firstChild)
      thComp.innerHTML = ST.ccErr ? "" : compHTML();
    else {
      const ta = thComp.querySelector("[data-cta]");
      if (ta) {
        ta.value = "";
        autoGrow(ta);
      }
      const f = thComp.querySelector("[data-cform]");
      if (f) f.classList.remove("open");
    }
    CX = null;
    syncComposer();
    renderThList(first);
    initMedia();
    $("#thIn").scrollTop = 0;
    thList.scrollTop = 0;
  }
  function updTheater() {
    const c = ST.CR.get(TH.cid);
    if (!c || c.monthId !== cur.pid) {
      goBack();
      return;
    }
    TH.c = c;
    $("#thT").textContent = c.title || "Kreativa";
    const L = crOfCur();
    navState(
      L,
      L.findIndex((x) => x.id === c.id),
    );
    if (thMedia.dataset.sig !== filesSig(c)) {
      stopMedia();
      TH.ar = arOf(c);
      thMedia.innerHTML = mediaHTML(c);
      thMedia.dataset.sig = filesSig(c);
      fitMedia();
      initMedia();
      setAmb(posterOf(c));
    }
    renderThList(false);
  }
  function navState(L, i) {
    $("#thCount").textContent = L.length > 1 ? `${i + 1} / ${L.length}` : "";
    const a = i <= 0,
      z = i < 0 || i >= L.length - 1;
    $("#thPrev").disabled = a;
    $("#thPrevM").disabled = a;
    $("#thNext").disabled = z;
    $("#thNextM").disabled = z;
    $(".th-pg").hidden = L.length < 2;
  }
  /* ambijent: boje kreative razlivene iza nje (mala slika, bez skupog blur filtera) */
  let ambTok = 0,
    ambSrc = null;
  function setAmb(src) {
    if (src === ambSrc) return;
    ambSrc = src;
    const tok = ++ambTok;
    if (!src) {
      thAmb.hidden = true;
      return;
    }
    const im = new Image();
    im.decoding = "async";
    im.onload = () => {
      if (tok !== ambTok) return;
      try {
        const r = im.naturalWidth / im.naturalHeight || 1,
          s = document.createElement("canvas"),
          sw = 8,
          sh = Math.max(6, Math.round(8 / r));
        s.width = sw;
        s.height = sh;
        const sx = s.getContext("2d");
        sx.imageSmoothingQuality = "high";
        sx.drawImage(im, 0, 0, sw, sh);
        const W = 64,
          H = Math.max(40, Math.round(64 / r));
        thAmb.width = W;
        thAmb.height = H;
        const x = thAmb.getContext("2d");
        x.imageSmoothingEnabled = true;
        x.imageSmoothingQuality = "high";
        x.drawImage(s, 0, 0, W, H);
        thAmb.hidden = false;
      } catch (e) {
        thAmb.hidden = true;
      }
    };
    im.onerror = () => {
      if (tok === ambTok) thAmb.hidden = true;
    };
    im.src = src;
  }
  function fitMedia() {
    if (th.hidden || !TH.c) return;
    const cs = getComputedStyle(thStage),
      aw =
        thStage.clientWidth -
        parseFloat(cs.paddingLeft) -
        parseFloat(cs.paddingRight);
    const ah = thWide()
      ? thStage.clientHeight -
        parseFloat(cs.paddingTop) -
        parseFloat(cs.paddingBottom)
      : Math.min(innerHeight * 0.74, 820);
    let w = aw,
      h = w / TH.ar;
    if (h > ah) {
      h = ah;
      w = h * TH.ar;
    }
    thMedia.style.width = Math.max(120, Math.floor(w)) + "px";
    thMedia.style.height = Math.max(120, Math.floor(h)) + "px";
  }
  addEventListener("resize", () => {
    if (!th.hidden) fitMedia();
  });
  const iPlay =
    '<svg class="i-play" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg>';
  const iPause =
    '<svg class="i-pause" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6.5" y="5" width="4" height="14" rx="1.2"/><rect x="13.5" y="5" width="4" height="14" rx="1.2"/></svg>';
  const iVol = SV(
    '<path d="M11 5 6 9H3v6h3l5 4z" fill="currentColor"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/>',
  ).replace("<svg ", '<svg class="i-vol" ');
  const iMute = SV(
    '<path d="M11 5 6 9H3v6h3l5 4z" fill="currentColor"/><path d="m16 9 6 6M22 9l-6 6"/>',
  ).replace("<svg ", '<svg class="i-mute" ');
  const chev = (d) =>
    SV(
      d < 0 ? '<path d="M15 18l-6-6 6-6"/>' : '<path d="M9 18l6-6-6-6"/>',
      2.4,
    );
  function mediaHTML(c) {
    const k = kindOf(c),
      fs = c.files || [],
      f = fs[0] || {};
    if (k === "video")
      return `<div class="vp" data-vp><video class="vpv" src="${esc(srcOf(f))}"${c.poster ? ` poster="${esc(srcOf(c.poster))}"` : ""} playsinline loop preload="auto"></video>
      <button class="vp-big" type="button" data-vpplay aria-label="Pusti">${iPlay}</button>
      <div class="vp-ctl"><button class="vp-pp" type="button" data-vpplay aria-label="Pusti ili pauziraj">${iPlay}${iPause}</button>
        <div class="vp-scrub" data-scrub><i class="vp-buf"></i><i class="vp-fill"></i><span class="vp-marks"></span><i class="vp-knob"></i></div>
        <span class="vp-time"><b class="vp-cur">0:00</b> / <span class="vp-dur">${f.dur ? fmtT(f.dur) : "0:00"}</span></span>
        <button class="vp-mute" type="button" data-vpmute aria-label="Zvuk">${iVol}${iMute}</button></div></div>`;
    if (k === "carousel")
      return `<div class="cs" data-cs><div class="cs-track">${fs.map((x, i) => `<img src="${esc(srcOf(x))}" alt="Slajd ${i + 1}" draggable="false"${i > 1 ? ' loading="lazy"' : ""}>`).join("")}</div>
      <button class="cs-a prev" type="button" data-csd="-1" aria-label="Prethodni slajd">${chev(-1)}</button><button class="cs-a next" type="button" data-csd="1" aria-label="Sledeći slajd">${chev(1)}</button>
      <div class="cs-dots" aria-hidden="true">${fs.map((x, i) => `<i${i ? "" : ' class="on"'}></i>`).join("")}</div></div>`;
    return `<img class="im" src="${esc(srcOf(f))}" alt="${esc(c.title || "Kreativa")}" draggable="false">`;
  }
  function initMedia() {
    VP = null;
    TH.goSlide = null;
    const v = thMedia.querySelector("video");
    if (v) {
      VP = { v, root: thMedia.querySelector(".vp"), raf: 0 };
      wireVP(VP);
    }
    const cs = thMedia.querySelector("[data-cs]");
    if (cs) wireCS(cs);
  }
  function wireVP(P) {
    const { v, root } = P,
      fill = root.querySelector(".vp-fill"),
      knob = root.querySelector(".vp-knob"),
      buf = root.querySelector(".vp-buf"),
      curT = root.querySelector(".vp-cur"),
      durT = root.querySelector(".vp-dur"),
      scrub = root.querySelector("[data-scrub]");
    const upd = () => {
      const d = v.duration || 0,
        t = v.currentTime || 0,
        p = d ? Math.min(1, t / d) : 0;
      fill.style.transform = `scaleX(${p})`;
      knob.style.left = p * 100 + "%";
      curT.textContent = fmtT(t);
      if (d && isFinite(d)) durT.textContent = fmtT(d);
    };
    const loop = () => {
      upd();
      if (!v.paused && VP === P) P.raf = requestAnimationFrame(loop);
    };
    v.addEventListener("play", () => {
      root.classList.add("playing");
      cancelAnimationFrame(P.raf);
      P.raf = requestAnimationFrame(loop);
    });
    v.addEventListener("pause", () => {
      root.classList.remove("playing");
      upd();
    });
    v.addEventListener("loadedmetadata", () => {
      upd();
      renderMarks();
    });
    v.addEventListener("progress", () => {
      try {
        const d = v.duration;
        if (d && v.buffered.length)
          buf.style.transform = `scaleX(${v.buffered.end(v.buffered.length - 1) / d})`;
      } catch (e) {}
    });
    v.addEventListener("volumechange", () =>
      root.classList.toggle("muted", v.muted),
    );
    v.addEventListener("click", () => togglePlay());
    let drag = false;
    const seekAt = (e) => {
      const r = scrub.getBoundingClientRect(),
        p = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
      if (v.duration) {
        v.currentTime = p * v.duration;
        upd();
      }
    };
    scrub.addEventListener("pointerdown", (e) => {
      drag = true;
      try {
        scrub.setPointerCapture(e.pointerId);
      } catch (err) {}
      root.classList.add("scrubbing");
      seekAt(e);
    });
    scrub.addEventListener("pointermove", (e) => {
      if (drag) seekAt(e);
    });
    const end = () => {
      drag = false;
      root.classList.remove("scrubbing");
    };
    scrub.addEventListener("pointerup", end);
    scrub.addEventListener("pointercancel", end);
    let idle = 0;
    const wake = () => {
      root.classList.add("awake");
      clearTimeout(idle);
      idle = setTimeout(() => root.classList.remove("awake"), 2200);
    };
    root.addEventListener("pointermove", wake);
    root.addEventListener("pointerdown", wake);
    wake();
    root.classList.toggle("muted", v.muted);
    upd();
  }
  function startMedia() {
    if (!VP) return;
    const v = VP.v;
    v.muted = false;
    const p = v.play();
    if (p && p.catch)
      p.catch(() => {
        if (VP && VP.v === v) {
          v.muted = true;
          const q = v.play();
          if (q && q.catch) q.catch(() => {});
        }
      });
  }
  function stopMedia() {
    if (VP) {
      try {
        VP.v.pause();
      } catch (e) {}
      cancelAnimationFrame(VP.raf);
    }
    VP = null;
  }
  function togglePlay() {
    if (!VP) return;
    const v = VP.v;
    if (v.paused) {
      const p = v.play();
      if (p && p.catch) p.catch(() => {});
    } else v.pause();
  }
  function seekTo(t) {
    if (!VP) return;
    VP.v.currentTime = Math.max(0, t);
    VP.v.pause();
    VP.root.classList.add("awake");
    if (!thWide())
      thMedia.scrollIntoView({
        block: "center",
        behavior: reduce ? "auto" : "smooth",
      });
  }
  function renderMarks() {
    if (!VP || !TH.c) return;
    const box = VP.root.querySelector(".vp-marks"),
      d = VP.v.duration;
    if (!box) return;
    box.innerHTML =
      d && isFinite(d)
        ? openCC(TH.c.id)
            .filter((x) => x.at != null)
            .map(
              (x) =>
                `<i style="left:${Math.min(100, (x.at / d) * 100).toFixed(2)}%"></i>`,
            )
            .join("")
        : "";
  }
  function wireCS(cs) {
    const tr = cs.querySelector(".cs-track"),
      n = cs.querySelectorAll(".cs-track img").length,
      dots = [...cs.querySelectorAll(".cs-dots i")];
    const go = (i) => {
      TH.slide = Math.max(0, Math.min(n - 1, i));
      tr.style.transform = `translateX(${-TH.slide * 100}%)`;
      dots.forEach((d, k) => d.classList.toggle("on", k === TH.slide));
      cs.classList.toggle("first", TH.slide === 0);
      cs.classList.toggle("last", TH.slide === n - 1);
      if (CX && CX.slide != null) {
        CX = { slide: TH.slide };
        syncComposer();
      }
    };
    TH.goSlide = go;
    go(0);
    let x0 = null,
      y0 = 0,
      dx = 0,
      w = 1,
      lock = null;
    cs.addEventListener("pointerdown", (e) => {
      if (e.target.closest("button")) return;
      x0 = e.clientX;
      y0 = e.clientY;
      dx = 0;
      lock = null;
      w = cs.clientWidth || 1;
      tr.style.transition = "none";
    });
    cs.addEventListener("pointermove", (e) => {
      if (x0 == null) return;
      dx = e.clientX - x0;
      const dy = e.clientY - y0;
      if (lock == null && (Math.abs(dx) > 8 || Math.abs(dy) > 8))
        lock = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      if (lock === "x")
        tr.style.transform = `translateX(calc(${-TH.slide * 100}% + ${dx}px))`;
    });
    const up = () => {
      if (x0 == null) return;
      tr.style.transition = "";
      x0 = null;
      if (lock === "x" && dx < -w * 0.16) go(TH.slide + 1);
      else if (lock === "x" && dx > w * 0.16) go(TH.slide - 1);
      else go(TH.slide);
    };
    cs.addEventListener("pointerup", up);
    cs.addEventListener("pointercancel", up);
    cs.addEventListener("pointerleave", up);
  }
  /* komentari na kreativu (vreme u videu ili broj slajda ide uz komentar) */
  function compHTML() {
    return `<form class="cform" data-cform data-cr novalidate><div class="cq" data-cq hidden><span class="cqt" data-cqt></span><button type="button" class="cqx" data-cqx aria-label="Ukloni">${SV('<path d="M6 6l12 12M18 6L6 18"/>', 2.6)}</button></div><textarea class="cta" data-cta rows="1" maxlength="2000" placeholder="Napiši komentar…" aria-label="Komentar"></textarea><div class="cfoot"><button type="button" class="csend" data-csend disabled><span>Pošalji</span>${I_ARR}</button></div></form>`;
  }
  const cxLabel = () =>
    CX
      ? CX.at != null
        ? "u " + fmtT(CX.at)
        : CX.slide != null
          ? `Slajd ${CX.slide + 1}`
          : ""
      : "";
  function captureCX() {
    if (TH.cxOff || !TH.c || CX) return;
    const k = kindOf(TH.c);
    if (k === "video" && VP) {
      VP.v.pause();
      CX = { at: Math.round(VP.v.currentTime * 10) / 10 };
    } else if (k === "carousel") CX = { slide: TH.slide || 0 };
    syncComposer();
  }
  function renderThList(anim) {
    if (!TH.c) return;
    if (ST.ccErr) {
      thList.innerHTML =
        '<li class="cnone">Komentari trenutno nisu dostupni.</li>';
      return;
    }
    const L = ST.ccBy.get(TH.c.id) || [];
    thList.innerHTML = L.map((x, i) => ccHTML(x, i, anim)).join("");
    L.forEach((x) => {
      if (ST.cfresh.has(x.id)) ST.shown.add(x.id);
    });
    renderMarks();
  }
  function ccHTML(x, i, anim) {
    const res = !!x.resolved,
      just = res && !ST.resSeen.has(x.id);
    if (res) ST.resSeen.add(x.id);
    else ST.resSeen.delete(x.id);
    const fresh = ST.cfresh.has(x.id) && !ST.shown.has(x.id),
      mine =
        x.author === "client" &&
        (!CLIENT.user ||
          !CLIENT.user.uid ||
          !x.authorUid ||
          (x.authorUid === CLIENT.user.uid &&
            (!x.authorName ||
              !CLIENT.user.name ||
              x.authorName === CLIENT.user.name)));
    const chip =
      x.at != null
        ? `<button type="button" class="cchip" data-seek="${Number(x.at)}">${I_PLAY}<span>${fmtT(x.at)}</span></button>`
        : x.slide != null
          ? `<button type="button" class="cchip" data-slide="${Number(x.slide)}"><span>Slajd ${Number(x.slide) + 1}</span></button>`
          : "";
    const st = anim
      ? ""
      : fresh && !reduce
        ? `;animation:ccin ${MT(950)}ms var(--spring) both`
        : ";animation:none";
    return `<li class="cc${res ? " res" : ""}${just ? " justres" : ""}" data-ccid="${esc(x.id)}" style="--i:${i}${st}">${res ? `<span class="cres"><i class="cok" aria-hidden="true">${I_CHECK}</i>Rešeno</span>` : ""}${chip}<p class="ctext">${esc(x.text)}</p><span class="cmeta"><time datetime="${new Date(x.createdAt || 0).toISOString()}">${ago(x.createdAt)}</time>${!res && mine && SRC && SRC.delComment ? `<button type="button" class="cdel" data-ccdel="${esc(x.id)}" aria-label="Obriši komentar">${I_TRASH}</button>` : ""}</span></li>`;
  }
  async function sendCreative(form) {
    if (sending) return;
    const c = TH.c,
      ta = form.querySelector("[data-cta]"),
      text = ta.value.trim();
    if (!c || !text || !SRC || !SRC.putComment) return;
    const now = Date.now(),
      x = CX,
      u = CLIENT.user || {};
    const data = {
      clientId: CLIENT.id,
      creativeId: c.id,
      monthId: c.monthId,
      text: text.slice(0, 2000),
      at: x && x.at != null ? x.at : null,
      slide: x && x.slide != null ? x.slide : null,
      author: "client",
      authorName: u.name || CLIENT.short || CLIENT.name,
      authorUid: u.uid || null,
      createdAt: now,
      order: now,
      resolved: false,
    };
    const id = SRC.newId("creativeComments");
    ST.cfresh.add(id);
    setTimeout(() => ST.cfresh.delete(id), 5000);
    const btn = form.querySelector("[data-csend]"),
      br = btn.getBoundingClientRect();
    if (!reduce && br.width)
      FX.sparks(br.left + br.width / 2, br.top + br.height / 2, 26, true);
    sending = true;
    ta.value = "";
    autoGrow(ta);
    CX = null;
    TH.cxOff = false;
    syncComposer();
    ta.blur();
    form.classList.remove("open");
    try {
      await SRC.putComment(id, data, "creativeComments");
      toast("Komentar je poslat");
    } catch (e) {
      ST.cfresh.delete(id);
      ta.value = text;
      autoGrow(ta);
      CX = x;
      form.classList.add("open");
      toast("Komentar nije poslat. Probaj ponovo.");
    } finally {
      sending = false;
      syncComposer();
    }
  }
  function stepCreative(d) {
    if (cur.sec !== "cr" || !cur.cid) return false;
    const L = crOfCur(),
      i = L.findIndex((x) => x.id === cur.cid),
      n = L[i + d];
    if (i < 0 || !n) return false;
    go(
      { sec: "cr", v: "gallery", pid: cur.pid, fid: cur.fid, cid: n.id },
      { dir: d },
    );
    return true;
  }
  th.addEventListener("click", (e) => {
    if (e.target === thStage && thWide()) {
      goBack();
      return;
    }
    const b = e.target.closest("button");
    if (!b || !th.contains(b)) return;
    if (b.id === "thX") {
      goBack();
      return;
    }
    if (b.id === "thPrev" || b.id === "thPrevM") {
      stepCreative(-1);
      return;
    }
    if (b.id === "thNext" || b.id === "thNextM") {
      stepCreative(1);
      return;
    }
    if (b.hasAttribute("data-vpplay")) {
      togglePlay();
      return;
    }
    if (b.hasAttribute("data-vpmute")) {
      if (VP) VP.v.muted = !VP.v.muted;
      return;
    }
    if (b.dataset.csd) {
      if (TH.goSlide) TH.goSlide(TH.slide + Number(b.dataset.csd));
      return;
    }
    if (b.dataset.seek != null) {
      seekTo(Number(b.dataset.seek));
      return;
    }
    if (b.dataset.slide != null) {
      if (TH.goSlide) TH.goSlide(Number(b.dataset.slide));
      if (!thWide())
        thMedia.scrollIntoView({
          block: "center",
          behavior: reduce ? "auto" : "smooth",
        });
      return;
    }
    if (b.dataset.ccdel) {
      delComment(b.dataset.ccdel, "creativeComments");
      return;
    }
    if (b.hasAttribute("data-cqx")) {
      CX = null;
      TH.cxOff = true;
      syncComposer();
      const ta = thComp.querySelector("[data-cta]");
      if (ta) ta.focus();
      return;
    }
  });
  th.addEventListener("focusin", (e) => {
    const f = e.target.closest && e.target.closest("#thComp [data-cform]");
    if (!f) return;
    f.classList.add("open");
    if (e.target.matches("[data-cta]")) captureCX();
  });
  th.addEventListener("focusout", (e) => {
    const f = e.target.closest && e.target.closest("#thComp [data-cform]");
    if (!f) return;
    setTimeout(() => {
      if (
        f.isConnected &&
        !f.contains(document.activeElement) &&
        !f.querySelector("[data-cta]").value.trim()
      ) {
        f.classList.remove("open");
        CX = null;
        syncComposer();
      }
    }, 160);
  });
  /* prevlačenje prstom levo/desno = sledeća kreativa (na telefonu) */
  (function () {
    let x0 = null,
      y0 = 0,
      t0 = 0;
    thStage.addEventListener("pointerdown", (e) => {
      if (
        e.pointerType === "mouse" ||
        e.target.closest("[data-cs],[data-scrub],button")
      )
        return;
      x0 = e.clientX;
      y0 = e.clientY;
      t0 = performance.now();
    });
    thStage.addEventListener("pointerup", (e) => {
      if (x0 == null) return;
      const dx = e.clientX - x0,
        dy = e.clientY - y0;
      x0 = null;
      if (
        Math.abs(dx) > 60 &&
        Math.abs(dx) > Math.abs(dy) * 1.4 &&
        performance.now() - t0 < 700
      )
        stepCreative(dx < 0 ? 1 : -1);
    });
    thStage.addEventListener("pointercancel", () => {
      x0 = null;
    });
  })();

  /* uvod kad klijent otvori link za kreative */
  let INTRO = null;
  function runIntro(cb) {
    const ci = $("#cintro");
    $("#ciKnot").src = CLIENT.knot;
    ci.hidden = false;
    $("#ciT").innerHTML =
      cur.sec === "org"
        ? 'Raspored <span class="em">snimanja</span>'
        : 'Final <span class="em">Creatives</span>';
    const setP = () => {
      if (cur.sec === "org") {
        const o = cur.oid && ST.O.get(cur.oid);
        $("#ciP").textContent = o
          ? cap(fmtDayL.format(odate(o.date))) +
            " · " +
            fmtODM.format(odate(o.date))
          : "";
        return;
      }
      const P = cur.pid && ST.P.get(cur.pid);
      $("#ciP").textContent = P ? periodLabel(P.it) : "";
    };
    INTRO = { setP };
    setP();
    void ci.offsetWidth;
    ci.classList.add("go");
    setTimeout(() => {
      setP();
      cb();
      ci.classList.add("open");
    }, MT(1800));
    setTimeout(() => {
      ci.hidden = true;
      ci.classList.remove("go", "open");
      INTRO = null;
    }, MT(2900));
  }

  /* =========================================================
     ORGANISATION
     raspored snimanja: Nina ga složi u Skeylo OS-u, ovde ga klijent (i modeli preko linka) vide
     schedules/{id}: {clientId, date:"2026-10-21", start, end, items:[{k:"scene"|"pause"|"travel", start, end, dur, title, models[], location, props, lines[]}], models[], locations[], updatedAt, order}
     ========================================================= */
  const fmtDayL = new Intl.DateTimeFormat("sr-Latn-RS", { weekday: "long" }),
    fmtODM = new Intl.DateTimeFormat("sr-Latn-RS", {
      day: "numeric",
      month: "long",
    }),
    fmtDMY = new Intl.DateTimeFormat("sr-Latn-RS", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
  const odate = (d) => {
    const [y, m, dd] = String(d || "")
      .split("-")
      .map(Number);
    return new Date(y || 1970, (m || 1) - 1, dd || 1);
  };
  const omin = (t) => {
    if (!t) return null;
    const [h, m] = String(t).split(":").map(Number);
    return isFinite(h) ? h * 60 + (m || 0) : null;
  };
  const oAt = (d, t) => {
    const x = odate(d),
      m = omin(t);
    if (m != null) x.setMinutes(m);
    return x;
  };
  const oStart = (o) => oAt(o.date, o.start || "00:00"),
    oEnd = (o) =>
      o.end
        ? oAt(o.date, o.end)
        : (() => {
            const x = odate(o.date);
            x.setHours(23, 59);
            return x;
          })();
  const oDur = (m) => {
    m = Math.max(0, Math.round(m || 0));
    const h = Math.floor(m / 60),
      r = m % 60;
    return h ? `${h} h${r ? ` ${r} min` : ""}` : `${r} min`;
  };
  const initials = (n) =>
    String(n || "?")
      .trim()
      .split(/\s+/)
      .filter((w) => !/^dr\.?$/i.test(w))
      .slice(0, 2)
      .map((w) => w.charAt(0).toUpperCase())
      .join("") || "?";
  function oWhen(o, now) {
    now = now || new Date();
    const s = oStart(o),
      e = oEnd(o);
    if (now >= s && now <= e) return { t: "U toku", live: true };
    if (now > e) return { t: "Završeno", past: true };
    const d0 = new Date(now.getFullYear(), now.getMonth(), now.getDate()),
      days = Math.round((odate(o.date) - d0) / 864e5);
    if (days <= 0) {
      const m = Math.round((s - now) / 6e4);
      return {
        t:
          m < 60
            ? `Za ${Math.max(1, m)} min`
            : `Danas · za ${Math.floor(m / 60)} h${m % 60 ? ` ${m % 60} min` : ""}`,
        soon: true,
      };
    }
    if (days === 1) return { t: "Sutra", soon: true };
    return { t: `Za ${days} ${pl(days, "dan", "dana", "dana")}` };
  }
  function oSplit() {
    const now = new Date(),
      L = ST.oList,
      up = L.filter((o) => oEnd(o) >= now),
      past = L.filter((o) => oEnd(o) < now).reverse();
    return { next: up[0] || null, later: up.slice(1), past };
  }
  const oSig = (o) =>
    JSON.stringify([o.date, o.start, o.end, o.items, o.models, o.locations]);
  const OI_PIN = SV(
    '<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    2,
  );
  const OI_CLK = SV(
    '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    2,
  );
  const OI_BOX = SV(
    '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/>',
    2,
  );
  const OI_CUP = SV(
    '<path d="M4 8h13v5a6 6 0 0 1-6 6h-1a6 6 0 0 1-6-6z"/><path d="M17 10h1.5a2.5 2.5 0 0 1 0 5H17M8 2v3M12 2v3"/>',
    2,
  );
  const OI_CAR = SV(
    '<path d="M5 17h14M6 17v2M18 17v2M4 13l2-5a2 2 0 0 1 2-1h8a2 2 0 0 1 2 1l2 5v4H4z"/><circle cx="8" cy="14" r="1"/><circle cx="16" cy="14" r="1"/>',
    2,
  );
  const OI_CAL = SV(
    '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4M12 14v4M10 16h4"/>',
    2,
  );
  const mapsURL = (q) =>
    "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q);
  function gcalURL(o) {
    const f = (x) =>
      `${x.getFullYear()}${String(x.getMonth() + 1).padStart(2, "0")}${String(x.getDate()).padStart(2, "0")}T${String(x.getHours()).padStart(2, "0")}${String(x.getMinutes()).padStart(2, "0")}00`;
    const sc = (o.items || [])
      .filter((x) => x.k === "scene")
      .map(
        (x) =>
          `${x.start || "–"} ${x.title || "Scena"}${(x.models || []).length ? " · " + x.models.join(", ") : ""}`,
      )
      .join("\n");
    return (
      "https://calendar.google.com/calendar/render?action=TEMPLATE&text=" +
      encodeURIComponent(`Snimanje · ${CLIENT.short || CLIENT.name}`) +
      "&dates=" +
      f(oStart(o)) +
      "/" +
      f(oEnd(o)) +
      "&ctz=Europe/Belgrade" +
      ((o.locations || []).length
        ? "&location=" + encodeURIComponent(o.locations.join(" · "))
        : "") +
      "&details=" +
      encodeURIComponent(sc)
    );
  }
  const avsHTML = (names, max) =>
    `<span class="oavs">${(names || [])
      .slice(0, max || 5)
      .map(
        (n, i) =>
          `<i style="--k:${i}" title="${esc(n)}">${esc(initials(n))}</i>`,
      )
      .join(
        "",
      )}${(names || []).length > (max || 5) ? `<i class="more">+${names.length - (max || 5)}</i>` : ""}</span>`;

  /* lista: sledeće snimanje + stari rasporedi */
  function vOrg(mode) {
    const en = mode === "enter",
      { next, later, past } = oSplit();
    const head = headHTML(
      [[{ t: "Raspored" }], [{ t: "snimanja", em: true }]],
      mode,
    );
    if (!ST.oList.length) {
      rmain.innerHTML = `<section class="v-org">${head}<div class="rempty"><span class="ric" aria-hidden="true">${OI_CAL}</span><h2>Još nema rasporeda</h2></div></section>`;
      after(mode);
      return;
    }
    const row = (o, i) => {
      const w = oWhen(o),
        d = odate(o.date);
      return `<li class="arow" style="--i:${i}"><button class="prow orow${w.past ? "" : " up"}" type="button" data-oid="${esc(o.id)}">
      <i class="node" aria-hidden="true"></i><span class="pidx" aria-hidden="true">${String(d.getDate()).padStart(2, "0")}</span>
      <span class="pname">${esc(cap(fmtDayL.format(d)))}, ${esc(d.getFullYear() !== new Date().getFullYear() ? fmtDMY.format(d) : fmtODM.format(d))}<span class="osub">${esc(o.start || "")}${o.end ? " – " + esc(o.end) : ""}${w.past ? "" : ` · ${esc(w.t)}`}</span></span>
      <span class="parr" aria-hidden="true">${I_ARR}</span><i class="pline" aria-hidden="true"></i></button></li>`;
    };
    const list = (t, L, off) =>
      L.length
        ? `<div class="arch ogrp${en ? " enter" : ""}" style="--n:${L.length}"><h2 class="ogh">${t}</h2><div class="arail"><i class="rail" aria-hidden="true"></i><i class="beam" aria-hidden="true"></i><ol class="alist">${L.map((o, i) => row(o, i + off)).join("")}</ol></div></div>`
        : "";
    rmain.innerHTML = `<section class="v-org">${head}${next ? oHero(next, mode) : ""}${list("Zakazano", later, 0)}${list("Stari rasporedi", past, later.length)}</section>`;
    after(mode);
  }
  function oHero(o, mode) {
    const en = mode === "enter",
      d = odate(o.date),
      w = oWhen(o),
      sc = (o.items || []).filter((x) => x.k === "scene").length;
    return `<button class="card phero ohero${en ? " rv" : " still"}${w.live ? " live" : ""}" type="button" data-oid="${esc(o.id)}">
      <i class="halo2" aria-hidden="true"></i><i class="halo2 b" aria-hidden="true"></i>
      <span class="ph-num" aria-hidden="true">${d.getDate()}</span><i class="pscan" aria-hidden="true"></i>
      <span class="ph-top rin" style="--d:.55s"><span class="chip"><i aria-hidden="true"></i>Sledeće snimanje · <b data-owhen="${esc(o.id)}">${esc(w.t)}</b></span></span>
      <span class="ph-name rin" style="--d:.7s">${esc(cap(fmtDayL.format(d)))}<br><span class="em">${esc(fmtODM.format(d))}</span></span>
      <span class="oh-meta rin" style="--d:.85s"><span class="oh-t">${OI_CLK}<b>${esc(o.start || "–")}</b>${o.end ? `<i class="oh-a"></i><b>${esc(o.end)}</b>` : ""}</span>${(o.locations || []).length ? `<span>${OI_PIN}${esc(o.locations.join(" · "))}</span>` : ""}<span>${sc} ${pl(sc, "scena", "scene", "scena")}</span>${(o.models || []).length ? avsHTML(o.models, 6) : ""}</span>
      <span class="go" aria-hidden="true">${I_ARR}</span>
    </button>`;
  }
  /* jedan dan */
  function vOrgDay(id, mode) {
    const o = ST.O.get(id);
    if (!o) {
      rmain.innerHTML = stateHTML(
        "Ovaj raspored više ne postoji.",
        false,
        true,
      );
      return;
    }
    const en = mode === "enter" || mode === "swap",
      d = odate(o.date),
      w = oWhen(o);
    const yr =
      d.getFullYear() !== new Date().getFullYear() ? " " + d.getFullYear() : "";
    rmain.innerHTML = `<section class="v-oday${en ? " enter" : ""}" data-oid="${esc(o.id)}" data-sig="${esc(oSig(o))}">
      ${headHTML([[{ t: cap(fmtDayL.format(d)) }], [{ t: fmtODM.format(d) + yr, em: true }]], mode)}
      <div class="od-sum rin" style="--d:.5s">
        <div class="od-time"><b>${esc(o.start || "–")}</b>${o.end ? `<i class="oh-a"></i><b>${esc(o.end)}</b>` : ""}</div>
        <span class="od-when${w.live ? " live" : w.soon ? " soon" : ""}" data-owhen="${esc(o.id)}">${esc(w.t)}</span>
        ${w.past ? "" : `<a class="pill od-cal" href="${esc(gcalURL(o))}" target="_blank" rel="noopener">${OI_CAL}<span>Dodaj u kalendar</span></a>`}
      </div>
      ${oFacts(o)}
      <ol class="otl" id="otl">${oItems(o)}</ol>
    </section>`;
    after(mode);
    oNow();
  }
  function oFacts(o) {
    const locs = o.locations || [],
      ms = o.models || [];
    if (!locs.length && !ms.length) return "";
    return `<div class="od-facts rin" style="--d:.62s">${locs.map((l) => `<a class="ofact" href="${esc(mapsURL(l))}" target="_blank" rel="noopener">${OI_PIN}<span>${esc(l)}</span><em>Mapa</em></a>`).join("")}${ms.length ? `<div class="ofact oppl">${avsHTML(ms, 8)}<span>${esc(ms.join(", "))}</span></div>` : ""}</div>`;
  }
  function oItems(o) {
    const L = (o.items || []).slice();
    return L.map((x, i) => {
      const tm = `<div class="oi-t"><b>${esc(x.start || "–")}</b>${x.end ? `<span>${esc(x.end)}</span>` : ""}</div>`;
      if (x.k !== "scene")
        return `<li class="oi brk" style="--i:${i}" data-s="${esc(x.start || "")}" data-e="${esc(x.end || "")}">${tm}<div class="oi-c"><span class="oi-b">${x.k === "pause" ? OI_CUP : OI_CAR}${x.k === "pause" ? "Pauza" : "Prevoz"}<em>${oDur(x.dur)}</em></span></div></li>`;
      const lines = (x.lines || []).filter((t) => String(t || "").trim());
      return `<li class="oi" style="--i:${i}" data-s="${esc(x.start || "")}" data-e="${esc(x.end || "")}"><i class="oi-n" aria-hidden="true"></i>${tm}<div class="oi-c">
        <h3 class="oi-h">${esc(x.title || "Scena")}</h3>
        <div class="oi-m">${(x.models || []).length ? `<span class="oi-pp">${avsHTML(x.models, 4)}${esc(x.models.join(", "))}</span>` : ""}${x.location ? `<span>${OI_PIN}${esc(x.location)}</span>` : ""}${x.dur ? `<span>${OI_CLK}${oDur(x.dur)}</span>` : ""}</div>
        ${x.props ? `<p class="oi-p">${OI_BOX}<span>${esc(x.props)}</span></p>` : ""}
        ${lines.length ? `<button class="oi-x" type="button" data-olines aria-expanded="false"><span>Tekst za snimanje</span>${SV('<path d="m6 9 6 6 6-6"/>', 2.4)}</button><div class="olines" hidden>${lines.map((t) => `<p>${esc(t)}</p>`).join("")}</div>` : ""}
      </div></li>`;
    }).join("");
  }
  /* šta se upravo snima, šta je gotovo */
  function oNow() {
    const sec = rmain.querySelector(".v-oday");
    if (!sec) return;
    const o = ST.O.get(sec.dataset.oid);
    if (!o) return;
    const now = new Date(),
      today = odate(o.date).toDateString() === now.toDateString(),
      nm = now.getHours() * 60 + now.getMinutes(),
      past = now > oEnd(o);
    sec.querySelectorAll(".oi").forEach((li) => {
      const a = omin(li.dataset.s),
        b = omin(li.dataset.e);
      li.classList.toggle("done", past || (today && b != null && nm >= b));
      li.classList.toggle(
        "now",
        today && a != null && b != null && nm >= a && nm < b,
      );
    });
    rmain.querySelectorAll("[data-owhen]").forEach((el) => {
      const x = ST.O.get(el.dataset.owhen);
      if (x) {
        const w = oWhen(x);
        el.textContent = w.t;
        el.classList.toggle("live", !!w.live);
      }
    });
  }
  setInterval(() => {
    if (!rapp.hidden && cur.sec === "org") oNow();
  }, 30000);
  function updOrg() {
    if (cur.v === "day") {
      const sec = rmain.querySelector(".v-oday"),
        o = ST.O.get(cur.oid);
      if (!o) {
        render(cur, "update");
        return;
      }
      if (sec && sec.dataset.sig === oSig(o)) {
        oNow();
        return;
      }
      const open = [...rmain.querySelectorAll(".oi")].map(
        (li) =>
          !!(
            li.querySelector(".olines") && !li.querySelector(".olines").hidden
          ),
      );
      vOrgDay(cur.oid, "update");
      rmain.querySelectorAll(".oi").forEach((li, i) => {
        const l = li.querySelector(".olines");
        if (l && open[i]) {
          l.hidden = false;
          li.querySelector("[data-olines]").setAttribute(
            "aria-expanded",
            "true",
          );
        }
      });
      return;
    }
    render(cur, "update");
  }

  /* =========================================================
     PRIVACY: šifre i mejlovi naloga klijenta (iza šifre "tajna")
     vault/{id}: {clientId, platform, label, login, password, note, order, updatedAt, updatedBy}
     ========================================================= */
  const PLAT = [
    ["instagram", "Instagram"],
    ["facebook", "Facebook"],
    ["meta", "Meta Business"],
    ["tiktok", "TikTok"],
    ["google", "Google"],
    ["youtube", "YouTube"],
    ["linkedin", "LinkedIn"],
    ["x", "X (Twitter)"],
    ["mail", "Email"],
    ["web", "Sajt"],
    ["other", "Drugo"],
  ];
  const platName = (x) =>
    x.platform === "other" && x.platformName
      ? x.platformName
      : (PLAT.find((p) => p[0] === x.platform) || [
          0,
          x.platformName || "Nalog",
        ])[1];
  const platIx = (x) => {
    const i = PLAT.findIndex((p) => p[0] === x.platform);
    return i < 0 ? 99 : i;
  };
  const I_COPY = SV(
    '<rect x="9" y="9" width="12" height="12" rx="2.5"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
    2,
  );
  const I_EYE = SV(
    '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    2,
  );
  const I_EYEX = SV(
    '<path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4.1M6.6 6.6C3.8 8.4 2 12 2 12s3.6 7 10 7a9.6 9.6 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
    2,
  );
  const I_EDIT = SV(
    '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    2,
  );
  const I_LOCK = SV(
    '<rect x="4" y="11" width="16" height="10" rx="2.5"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    2,
  );
  const I_SRCH = SV(
    '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    2,
  );
  const I_OK = SV('<path d="m5 12.5 4.5 4.5L19 7.5"/>', 2.6);
  let pvQ = "",
    pvF = "all",
    pvShow = new Set(),
    pvTm = new Map(),
    pvEdit = null;
  const pvDots = (p) =>
    "•".repeat(Math.min(14, Math.max(8, String(p || "").length)));
  function pvList() {
    const q = pvQ.trim().toLowerCase();
    return ST.V.filter(
      (x) =>
        (pvF === "all" || x.platform === pvF) &&
        (!q ||
          [platName(x), x.label, x.login, x.note].some((s) =>
            String(s || "")
              .toLowerCase()
              .includes(q),
          )),
    );
  }
  function vPV(mode) {
    const en = mode === "enter";
    rmain.innerHTML = `<section class="v-pv${en ? " enter" : ""}">
      ${headHTML([[{ t: "Šifre" }], [{ t: "naloga", em: true }]], mode)}
      <div class="pv-bar">
        <label class="pv-q">${I_SRCH}<input id="pvQ" type="search" placeholder="Traži: Instagram, mejl, nalog…" autocomplete="off" spellcheck="false" value="${esc(pvQ)}" aria-label="Traži nalog"></label>
        ${SRC && SRC.putVault ? `<button class="pill pv-add" type="button" data-pvadd>${SV('<path d="M12 5v14M5 12h14"/>', 2.4)}<span>Dodaj nalog</span></button>` : ""}
        <button class="pill pv-lock" type="button" data-pvlock aria-label="Zaključaj" title="Zaključaj">${I_LOCK}</button>
      </div>
      <div id="pvF">${pvChips()}</div>
      <div class="pv-body" id="pvBody">${pvBody()}</div>
    </section>`;
    after(mode);
    if (en && fine)
      setTimeout(() => {
        const q = $("#pvQ");
        if (q && !rmain.querySelector(".pv-sheet"))
          q.focus({ preventScroll: true });
      }, MT(700));
  }
  function pvBody() {
    if (!ST.V.length)
      return `<div class="rempty"><span class="ric" aria-hidden="true">${I_LOCK}</span><h2>Još nema sačuvanih naloga</h2></div>`;
    const L = pvList();
    if (!L.length) return `<p class="pv-none">Ništa ne odgovara pretrazi.</p>`;
    return `<ol class="pv-grid">${L.map((x, i) => pvCard(x, i)).join("")}</ol>`;
  }
  function pvCard(x, i) {
    const sh = pvShow.has(x.id),
      pn = platName(x);
    return `<li class="pv-c" data-vid="${esc(x.id)}" style="--i:${i}">
      <div class="pv-h"><span class="pv-m" aria-hidden="true">${esc(pn.charAt(0))}</span><span class="pv-t"><b>${esc(pn)}</b>${x.label ? `<span>${esc(x.label)}</span>` : ""}</span>${SRC && SRC.putVault ? `<button class="pv-e" type="button" data-pvedit="${esc(x.id)}" aria-label="Izmeni ${esc(pn)}">${I_EDIT}</button>` : ""}</div>
      ${x.login ? `<div class="pv-r"><span class="pv-k">Mejl / korisničko ime</span><span class="pv-v">${esc(x.login)}</span><button class="pv-cp" type="button" data-pvcp="login" aria-label="Kopiraj mejl">${I_COPY}<i>${I_OK}</i></button></div>` : ""}
      ${x.password ? `<div class="pv-r pw"><span class="pv-k">Šifra</span><span class="pv-v${sh ? "" : " hid"}">${sh ? esc(x.password) : pvDots(x.password)}</span><button class="pv-ey" type="button" data-pveye aria-label="${sh ? "Sakrij" : "Prikaži"} šifru">${sh ? I_EYEX : I_EYE}</button><button class="pv-cp" type="button" data-pvcp="password" aria-label="Kopiraj šifru">${I_COPY}<i>${I_OK}</i></button></div>` : ""}
      ${x.note ? `<p class="pv-n">${esc(x.note)}</p>` : ""}
    </li>`;
  }
  function pvChips() {
    const has = [...new Set(ST.V.map((x) => x.platform))].sort(
      (a, b) =>
        PLAT.findIndex((p) => p[0] === a) - PLAT.findIndex((p) => p[0] === b),
    );
    if (pvF !== "all" && !has.includes(pvF)) pvF = "all";
    return has.length > 1
      ? `<div class="pv-f" role="tablist" aria-label="Platforma"><button type="button" data-pvf="all" aria-pressed="${pvF === "all"}">Sve</button>${has.map((p) => `<button type="button" data-pvf="${esc(p)}" aria-pressed="${pvF === p}">${esc(platName({ platform: p }))}</button>`).join("")}</div>`
      : "";
  }
  function pvPaint() {
    const f = $("#pvF"),
      h = f && pvChips();
    if (f && f.innerHTML !== h) f.innerHTML = h;
    const b = $("#pvBody");
    if (b) b.innerHTML = pvBody();
  }
  async function pvCopy(txt, btn, what) {
    let ok = false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(txt);
        ok = true;
      }
    } catch (e) {}
    if (!ok) {
      try {
        const t = document.createElement("textarea");
        t.value = txt;
        t.setAttribute("readonly", "");
        t.style.cssText = "position:fixed;left:-9999px;top:0";
        document.body.appendChild(t);
        t.select();
        ok = document.execCommand("copy");
        t.remove();
      } catch (e) {}
    }
    if (ok) {
      btn.classList.remove("ok");
      void btn.offsetWidth;
      btn.classList.add("ok");
      setTimeout(() => btn.classList.remove("ok"), 1600);
      toast(what === "password" ? "Šifra je kopirana" : "Mejl je kopiran");
    } else toast("Kopiranje nije uspelo. Prikaži šifru i prepiši je.");
  }
  /* dodavanje / izmena */
  function pvForm(x) {
    pvEdit = x ? x.id : null;
    const pl = x ? x.platform : "instagram";
    const sh = document.createElement("div");
    sh.className = "pv-sheet";
    sh.setAttribute("role", "dialog");
    sh.setAttribute("aria-modal", "true");
    sh.setAttribute("aria-label", x ? "Izmeni nalog" : "Novi nalog");
    sh.innerHTML = `<div class="pv-scr" data-pvx></div><div class="pv-box">
      <h3>${x ? "Izmeni nalog" : "Novi nalog"}</h3>
      <div class="pv-pl" role="radiogroup" aria-label="Platforma">${PLAT.map((p) => `<button type="button" role="radio" data-pvp="${p[0]}" aria-checked="${p[0] === pl}">${esc(p[1])}</button>`).join("")}</div>
      <label class="pv-in pv-other"${pl === "other" ? "" : " hidden"}><span>Naziv platforme</span><input data-pvi="platformName" maxlength="40" value="${esc((x && x.platformName) || "")}" autocomplete="off"></label>
      <label class="pv-in"><span>Naziv naloga <em>(nije obavezno)</em></span><input data-pvi="label" maxlength="60" placeholder="npr. @infinitylaserns" value="${esc((x && x.label) || "")}" autocomplete="off"></label>
      <label class="pv-in"><span>Mejl / korisničko ime</span><input data-pvi="login" maxlength="200" value="${esc((x && x.login) || "")}" autocomplete="off" spellcheck="false" autocapitalize="off"></label>
      <label class="pv-in"><span>Šifra</span><span class="pv-pw"><input data-pvi="password" type="password" maxlength="200" value="${esc((x && x.password) || "")}" autocomplete="new-password" spellcheck="false" autocapitalize="off"><button type="button" data-pvpw aria-label="Prikaži šifru">${I_EYE}</button></span></label>
      <label class="pv-in"><span>Napomena <em>(nije obavezno)</em></span><input data-pvi="note" maxlength="300" placeholder="npr. kod za prijavu stiže na Aninu email adresu" value="${esc((x && x.note) || "")}" autocomplete="off"></label>
      <div class="pv-act">${x ? `<button type="button" class="pv-del" data-pvdel>Obriši</button>` : ""}<button type="button" class="pill" data-pvx>Otkaži</button><button type="button" class="pill solid" data-pvsave>Sačuvaj</button></div>
    </div>`;
    document.body.appendChild(sh);
    sh.dataset.pl = pl;
    document.documentElement.classList.add("noscroll");
    requestAnimationFrame(() => sh.classList.add("on"));
    setTimeout(() => {
      const f = sh.querySelector(
        x ? '[data-pvi="password"]' : '[data-pvi="login"]',
      );
      f && f.focus();
    }, 120);
    sh.addEventListener("click", (e) => {
      const t = e.target.closest("button,[data-pvx]");
      if (!t) return;
      if (t.hasAttribute("data-pvx")) {
        pvClose();
        return;
      }
      if (t.dataset.pvp) {
        sh.dataset.pl = t.dataset.pvp;
        sh.querySelectorAll("[data-pvp]").forEach((b) =>
          b.setAttribute("aria-checked", String(b === t)),
        );
        sh.querySelector(".pv-other").hidden = t.dataset.pvp !== "other";
        return;
      }
      if (t.hasAttribute("data-pvpw")) {
        const i = sh.querySelector('[data-pvi="password"]'),
          s = i.type === "password";
        i.type = s ? "text" : "password";
        t.innerHTML = s ? I_EYEX : I_EYE;
        return;
      }
      if (t.hasAttribute("data-pvsave")) {
        pvSave(sh, t);
        return;
      }
      if (t.hasAttribute("data-pvdel")) {
        if (t.dataset.arm) {
          pvDel(pvEdit);
          pvClose();
          return;
        }
        t.dataset.arm = "1";
        t.textContent = "Sigurno? Klikni opet";
        setTimeout(() => {
          if (t.isConnected) {
            delete t.dataset.arm;
            t.textContent = "Obriši";
          }
        }, 3000);
        return;
      }
    });
    sh.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && e.target.matches("input")) {
        e.preventDefault();
        pvSave(sh, sh.querySelector("[data-pvsave]"));
      }
    });
  }
  function pvClose() {
    const sh = document.querySelector(".pv-sheet");
    if (!sh) return;
    sh.classList.remove("on");
    document.documentElement.classList.remove("noscroll");
    setTimeout(() => sh.remove(), reduce ? 0 : MT(280));
    pvEdit = null;
  }
  async function pvSave(sh, btn) {
    const v = (k) => sh.querySelector(`[data-pvi="${k}"]`).value.trim(),
      pl = sh.dataset.pl || "other";
    const login = v("login"),
      password = sh.querySelector('[data-pvi="password"]').value;
    if (!login && !password) {
      toast("Upiši mejl ili šifru");
      sh.querySelector('[data-pvi="login"]').focus();
      return;
    }
    const old = pvEdit && ST.V.find((x) => x.id === pvEdit),
      now = Date.now(),
      u = CLIENT.user || {};
    const data = {
      clientId: CLIENT.id,
      platform: pl,
      platformName: pl === "other" ? v("platformName").slice(0, 40) : "",
      label: v("label").slice(0, 60),
      login: login.slice(0, 200),
      password: password.slice(0, 200),
      note: v("note").slice(0, 300),
      order: old ? old.order || now : now,
      createdAt: old ? old.createdAt || now : now,
      updatedAt: now,
      updatedBy: u.name || CLIENT.short || "",
    };
    btn.disabled = true;
    try {
      await SRC.putVault(old ? old.id : SRC.newId("vault"), data);
      pvClose();
      toast(old ? "Nalog je sačuvan" : "Nalog je dodat");
    } catch (e) {
      btn.disabled = false;
      toast("Čuvanje nije uspelo. Probaj ponovo.");
    }
  }
  async function pvDel(id) {
    const x = ST.V.find((y) => y.id === id);
    if (!x) return;
    const { id: _, ...copy } = x;
    try {
      await SRC.delVault(id);
      toast("Nalog je obrisan", {
        label: "Vrati",
        fn: () => SRC.putVault(id, copy),
      });
    } catch (e) {
      toast("Brisanje nije uspelo");
    }
  }
  function pvLock() {
    try {
      sessionStorage.removeItem("skeylo-crm-priv-" + CLIENT.id);
    } catch (e) {}
    unlocked = false;
    pvShow.clear();
    $("#privCard").classList.remove("open");
    go({ v: "dash" }, {});
    toast("Privacy je zaključan");
  }
  /* zaključa se sam posle 10 minuta bez aktivnosti */
  let pvIdle = 0;
  const pvWake = () => {
    clearTimeout(pvIdle);
    if (cur.sec === "pv")
      pvIdle = setTimeout(() => {
        if (cur.sec === "pv" && !document.querySelector(".pv-sheet")) pvLock();
      }, 600000);
  };
  ["pointerdown", "keydown"].forEach((ev) =>
    addEventListener(ev, pvWake, { passive: true }),
  );
  rmain.addEventListener("input", (e) => {
    if (e.target.id === "pvQ") {
      pvQ = e.target.value;
      pvPaint();
    }
  });
  rmain.addEventListener("keydown", (e) => {
    if (e.target.id === "pvQ" && e.key === "Enter") {
      const b = rmain.querySelector('.pv-c [data-pvcp="password"]');
      if (b && pvList().length === 1) {
        e.preventDefault();
        b.click();
      }
    }
  });
  rmain.addEventListener("click", (e) => {
    if (cur.sec !== "pv") return;
    const t = e.target.closest("button");
    if (!t || !rmain.contains(t)) return;
    if (t.hasAttribute("data-pvadd")) {
      pvForm(null);
      return;
    }
    if (t.hasAttribute("data-pvlock")) {
      pvLock();
      return;
    }
    if (t.dataset.pvf) {
      pvF = t.dataset.pvf;
      rmain
        .querySelectorAll("[data-pvf]")
        .forEach((b) => b.setAttribute("aria-pressed", String(b === t)));
      pvPaint();
      return;
    }
    if (t.dataset.pvedit) {
      const x = ST.V.find((y) => y.id === t.dataset.pvedit);
      if (x) pvForm(x);
      return;
    }
    const c = t.closest(".pv-c"),
      x = c && ST.V.find((y) => y.id === c.dataset.vid);
    if (!x) return;
    if (t.hasAttribute("data-pveye")) {
      if (pvShow.has(x.id)) pvShow.delete(x.id);
      else {
        pvShow.add(x.id);
        clearTimeout(pvTm.get(x.id));
        pvTm.set(
          x.id,
          setTimeout(() => {
            pvShow.delete(x.id);
            const el = rmain.querySelector(`.pv-c[data-vid="${cssq(x.id)}"]`);
            if (el)
              el.outerHTML = pvCard(x, +el.style.getPropertyValue("--i") || 0);
          }, 20000),
        );
      }
      c.outerHTML = pvCard(x, +c.style.getPropertyValue("--i") || 0);
      const n = rmain.querySelector(
        `.pv-c[data-vid="${cssq(x.id)}"] [data-pveye]`,
      );
      n && n.focus();
      return;
    }
    if (t.dataset.pvcp) {
      pvCopy(
        t.dataset.pvcp === "password" ? x.password : x.login,
        t,
        t.dataset.pvcp,
      );
      return;
    }
  });

  /* obaveštenje (novi izveštaj uživo, poslat komentar…) */
  let toastTm = 0,
    toastAct = null;
  function toast(msg, act) {
    const t = $("#toast"),
      b = $("#toastGo");
    $("#toastMsg").textContent = msg;
    toastAct = act || null;
    b.hidden = !act;
    if (act) b.textContent = act.label || "Pogledaj";
    t.classList.add("show");
    clearTimeout(toastTm);
    toastTm = setTimeout(() => t.classList.remove("show"), act ? 6500 : 3200);
  }
  $("#toastGo").addEventListener("click", () => {
    const a = toastAct;
    toastAct = null;
    $("#toast").classList.remove("show");
    if (a && a.fn) a.fn();
  });

  /* ---------- klikovi ---------- */
  rmain.addEventListener("click", (e) => {
    const m = e.target.closest("mark.hl[data-cid]");
    if (m && rmain.contains(m)) {
      const s = getSelection();
      if (!s || s.isCollapsed) focusCard(m.dataset.cid);
      return;
    }
    const t = e.target.closest("button");
    if (!t || !rmain.contains(t)) return;
    const d = t.dataset;
    if (d.oid && cur.sec === "org" && cur.v === "list") {
      if (e.clientX || e.clientY) FX.sparks(e.clientX, e.clientY, 20, true);
      navTo({ sec: "org", v: "day", oid: d.oid }, t);
      return;
    }
    if (t.hasAttribute("data-olines")) {
      const l = t.nextElementSibling,
        o = l.hidden;
      l.hidden = !o;
      t.setAttribute("aria-expanded", String(o));
      return;
    }
    if (
      (e.clientX || e.clientY) &&
      (d.pid || d.type || d.rid || d.sid || d.crid || d.fid)
    )
      FX.sparks(e.clientX, e.clientY, 20, true);
    if (d.pid && cur.v === "periods")
      navTo(
        cur.sec === "ci"
          ? { sec: "ci", v: "scripts", pid: d.pid }
          : cur.sec === "cr"
            ? { sec: "cr", v: "gallery", pid: d.pid }
            : { sec: "rep", v: "types", pid: d.pid },
        t,
      );
    else if (d.fid && cur.sec === "cr" && cur.v === "gallery" && !cur.fid)
      navTo({ sec: "cr", v: "gallery", pid: cur.pid, fid: d.fid }, t);
    else if (d.crid && cur.v === "gallery")
      navTo(
        { sec: "cr", v: "gallery", pid: cur.pid, fid: cur.fid, cid: d.crid },
        t,
      );
    else if (d.type && cur.v === "types")
      navTo({ sec: "rep", v: "list", pid: cur.pid, type: d.type }, t);
    else if (d.rid && cur.v === "list" && !isViewer(cur))
      navTo(
        { sec: "rep", v: "list", pid: cur.pid, type: cur.type, rid: d.rid },
        t,
      );
    else if (d.sid && cur.v === "scripts")
      navTo({ sec: "ci", v: "script", pid: cur.pid, sid: d.sid }, t);
    else if (d.sw && cur.v === "list")
      swapTo({ sec: "rep", v: "list", pid: cur.pid, type: d.sw });
    else if (d.loomOf) {
      const r = ST.R.get(d.loomOf);
      if (r)
        navTo(
          { sec: "rep", v: "list", pid: r.monthId, type: "loom", rid: r.id },
          null,
        );
    } else if (d.jump) jumpTo(d.jump);
    else if (d.cdel) delComment(d.cdel);
    else if (t.hasAttribute("data-cnew")) {
      CQ = null;
      clearPending();
      openComposer();
    } else if (t.hasAttribute("data-cqx")) {
      CQ = null;
      clearPending();
      syncComposer();
      const f = t.closest("[data-cform]");
      f && f.querySelector("[data-cta]").focus();
    } else if (t.hasAttribute("data-retry")) {
      const r = ST.R.get(cur.rid),
        P = ST.P.get(cur.pid);
      if (r && P) {
        htmlCache.delete(r.id);
        vViewer(P, r.id, "update");
      }
    } else if (t.hasAttribute("data-up")) goBack();
  });
  if (fine) {
    rmain.addEventListener(
      "pointermove",
      (e) => {
        const t = e.target.closest(".prow,.ritem,.sitem,.gcard");
        if (!t) return;
        const r = t.getBoundingClientRect();
        t.style.setProperty("--mx", (e.clientX - r.left).toFixed(0) + "px");
        t.style.setProperty("--my", (e.clientY - r.top).toFixed(0) + "px");
      },
      { passive: true },
    );
    rmain.addEventListener("pointerover", (e) => {
      if (cur.v === "gallery") {
        hoverCard(e.target.closest(".gcard"));
        return;
      }
      if (cur.v !== "script") return;
      const x = e.target.closest("mark.hl[data-cid],.cc[data-cid]");
      lit(x ? x.dataset.cid : null);
    });
    rmain.addEventListener("pointerleave", () => {
      lit(null);
      hoverCard(null);
    });
  }
  /* sastavljanje komentara (u traci desno i u donjem prozoru na telefonu) */
  document.addEventListener("input", (e) => {
    const ta = e.target.closest && e.target.closest("[data-cta]");
    if (!ta) return;
    autoGrow(ta);
    syncComposer();
  });
  /* bez <form submit>: u zaštićenom okviru (sandbox bez allow-forms) submit se ne okida */
  document.addEventListener("submit", (e) => {
    const f = e.target.closest && e.target.closest("[data-cform]");
    if (f) e.preventDefault();
  });
  document.addEventListener("click", (e) => {
    const b = e.target.closest && e.target.closest("[data-csend]");
    if (b && !b.disabled) sendFrom(b.closest("[data-cform]"));
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      const ta = e.target.closest && e.target.closest("[data-cta]");
      if (ta) {
        e.preventDefault();
        sendFrom(ta.closest("[data-cform]"));
      }
      return;
    }
    if (!th.hidden) {
      const a = document.activeElement;
      if (
        e.altKey ||
        e.ctrlKey ||
        e.metaKey ||
        (a && a.matches && a.matches("input,textarea,select,[contenteditable]"))
      )
        return;
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        if (stepCreative(e.key === "ArrowRight" ? 1 : -1)) e.preventDefault();
      } else if (e.key === " " && VP && !(a && a.tagName === "BUTTON")) {
        e.preventDefault();
        togglePlay();
      }
      return;
    }
    if (
      rapp.hidden ||
      cur.v !== "script" ||
      e.altKey ||
      e.ctrlKey ||
      e.metaKey ||
      e.shiftKey ||
      (e.key !== "ArrowLeft" && e.key !== "ArrowRight")
    )
      return;
    const a = document.activeElement;
    if (a && a.matches && a.matches("input,textarea,select,[contenteditable]"))
      return;
    if (!csheet.hidden || !lov.hidden) return;
    const s = getSelection();
    if (s && !s.isCollapsed) return;
    if (stepScript(e.key === "ArrowRight" ? 1 : -1)) e.preventDefault();
  });
  rmain.addEventListener("focusin", (e) => {
    const f = e.target.closest("#ccomp [data-cform]");
    if (f) f.classList.add("open");
  });
  rmain.addEventListener("focusout", (e) => {
    const f = e.target.closest("#ccomp [data-cform]");
    if (!f) return;
    setTimeout(() => {
      if (
        f.isConnected &&
        !f.contains(document.activeElement) &&
        !f.querySelector("[data-cta]").value.trim() &&
        !CQ
      )
        f.classList.remove("open");
    }, 150);
  });
  csheet.addEventListener("click", (e) => {
    if (e.target.closest("[data-csx]") || e.target.id === "csScrim") {
      cancelSheet();
      return;
    }
    if (e.target.closest("[data-cqx]")) {
      CQ = null;
      clearPending();
      syncComposer();
      csheet.querySelector("[data-cta]").focus();
    }
  });
  WIDE.addEventListener &&
    WIDE.addEventListener("change", () => {
      if (wide()) closeSheet(true);
    });
  rsw.addEventListener("click", (e) => {
    const b = e.target.closest("[data-sw]");
    if (!b || cur.v !== "list" || isViewer(cur) || b.dataset.sw === cur.type)
      return;
    swapTo({ sec: "rep", v: "list", pid: cur.pid, type: b.dataset.sw });
  });
  rsw.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const t = cur.type === "loom" ? "pisani" : "loom";
    swapTo({ sec: "rep", v: "list", pid: cur.pid, type: t });
    setTimeout(() => $(t === "loom" ? "#swLoom" : "#swDoc").focus(), 0);
  });
  $("#cprev").addEventListener("click", () => stepScript(-1));
  $("#cnext").addEventListener("click", () => stepScript(1));
  $("#rback").addEventListener("click", goBack);
  $("#rhome").addEventListener("click", () => go({ v: "dash" }, {}));
  $("#lovX").addEventListener("click", goBack);
  $("#lovScrim").addEventListener("click", goBack);
  $("#lovActs").addEventListener("click", (e) => {
    const b = e.target.closest("[data-doc-of]");
    if (!b) return;
    const r = ST.R.get(b.dataset.docOf);
    if (r)
      navTo(
        { sec: "rep", v: "list", pid: r.monthId, type: "pisani", rid: r.id },
        lovScreen,
      );
  });
  function onEsc() {
    if (document.querySelector(".pv-sheet")) {
      pvClose();
      return true;
    }
    if (!th.hidden) {
      goBack();
      return true;
    }
    if (!lov.hidden) {
      goBack();
      return true;
    }
    if (!csheet.hidden) {
      cancelSheet();
      return true;
    }
    if (CQ) {
      CQ = null;
      clearPending();
      syncComposer();
      return true;
    }
    return false;
  }

  /* ---------- start ---------- */
  cur = parse();
  if (cur.sec === "pv" && !unlocked) {
    cur = { v: "dash" };
    try {
      location.hash = "";
    } catch (e) {}
    setTimeout(openVault, MT(900));
  }
  curKey = keyOf(cur);
  if (cur.v !== "dash") {
    const first = () => {
      render(cur, "enter");
      const nt = thOf(cur);
      if (nt) openTheater(nt, null);
    };
    if ((cur.sec === "cr" || cur.sec === "org") && !reduce) {
      showApp();
      runIntro(first);
    } else first();
  }
  window.SkeyloCRM = {
    connect(db, clientId, user) {
      if (GUEST) return;
      if (clientId) CLIENT.id = clientId;
      if (user) CLIENT.user = Object.assign({}, CLIENT.user, user);
      useSource(
        typeof db === "function"
          ? db(CLIENT.id)
          : firestoreSource(db, CLIENT.id),
      ); /* na sajtu: crm-db.js daje izvor nad Supabase-om */
    },
    useSource,
    connectSchedule(db, id) {
      useSource({
        demo: false,
        subscribe(cb, err) {
          const empty = {
            items: [],
            reports: [],
            scripts: [],
            comments: [],
            creatives: [],
            creativeComments: [],
          };
          setTimeout(() => cb(empty), 0);
          return db.doc("schedules/" + id).onSnapshot(
            (s) => {
              const d = s.exists ? s.data() : null;
              if (d) {
                CLIENT.id = d.clientId || CLIENT.id;
                cb({ schedules: [{ id: s.id, ...d }] });
              } else cb({ schedules: [] });
            },
            (e) => err("schedules", e),
          );
        },
      });
    },
    get state() {
      return ST;
    },
  };
  if (CLIENT.data === "demo")
    useSource(GUEST ? guestOnly(demoSource()) : demoSource());
  return {
    open: (card) => navTo({ sec: "rep", v: "periods" }, card),
    openCI: (card) => navTo({ sec: "ci", v: "periods" }, card),
    openCR: (card) => navTo({ sec: "cr", v: "periods" }, card),
    openOR: (card) => navTo({ sec: "org", v: "list" }, card),
    openPV: (card) => navTo({ sec: "pv", v: "list" }, card),
    openSYS: (card) => navTo({ sec: "sys", v: "list" }, card),
    back: goBack,
    esc: onEsc,
    overlayOpen: () => !lov.hidden || !th.hidden,
  };
})();
