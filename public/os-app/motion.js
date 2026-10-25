/* Tempo animacija Skeylo OS-a. Učitava se u <head> posle app.css, notes.css i auth.css,
   pre prvog crtanja, i jednom prepiše trajanja i kašnjenja u njihovim pravilima (isti
   algoritam kao crm-app/motion.js), pa nema nikakvog posla dok aplikacija radi.
   Kriva (vrednost iz dizajna → stvarna):
   - trajanje do 120 ms ostaje (reakcija na dodir), duže se sabija: 120 + (d − 120) · 0.42
     → 0.25 s ≈ 175 ms, 0.55 s ≈ 300 ms, 0.8 s ≈ 405 ms, 1.2 s ≈ 575 ms
   - kašnjenje × 0.3: sadržaj ne čeka dekoraciju, a redosled ostaje isti
   - beskonačne petlje (ambijent) zadržavaju ritam, skraćuje im se samo kašnjenje
   - vrednost iz promenljive ili calc(): trajanje × 0.5, kašnjenje × 0.3
   motion.css se ne dira: tamo su konačne vrednosti za ručno podešene ulaske. Pravilo sa
   shorthandom koji ima var() i posebnim animation-delay Chrome ne vraća kao tekst, pa ga
   ova kriva ne vidi; takva pravila su u motion.css, a OS_MOTION_SKIPPED ih nabraja.
   app.js istom krivom računa kašnjenja upisana u HTML (OS_DL: × 0.3, najviše 0.32 s, pa ni
   duga lista ne kaskadira sekundama) i tajmere koji čekaju animacije (OS_T). */
(() => {
  const D0 = 120,
    KD = 0.42,
    KL = 0.3,
    KV = 0.5;
  const dur = (ms) => (ms <= D0 ? ms : D0 + (ms - D0) * KD);
  window.OS_T = (ms) => Math.round(dur(ms));
  window.OS_DL = (s) => +Math.min(s * KL, 0.32).toFixed(3);

  const TIME = /^(-?\d*\.?\d+)(ms|s)$/i;
  const isTime = (t) =>
    TIME.test(t) ||
    (/^(calc|var)\(/i.test(t) && /\d(ms|s)\b/i.test(t)) ||
    /^var\(--(d|dur|td|nd|rd)\)$/.test(t);
  // deli po zarezima (comma) ili razmacima, ali ne unutar zagrada
  function split(s, comma) {
    const out = [];
    let depth = 0,
      cur = "";
    for (const ch of s) {
      if (ch === "(") depth++;
      else if (ch === ")") depth--;
      if (!depth && (comma ? ch === "," : /\s/.test(ch))) {
        if (cur.trim()) out.push(cur.trim());
        cur = "";
      } else cur += ch;
    }
    if (cur.trim()) out.push(cur.trim());
    return out;
  }
  function scale(t, delay) {
    const m = TIME.exec(t);
    if (!m) return `calc(${t} * ${delay ? KL : KV})`;
    const v = parseFloat(m[1]) * (m[2].toLowerCase() === "s" ? 1000 : 1);
    if (delay ? !v : v <= D0) return t;
    return +(delay ? v * KL : dur(v)).toFixed(1) + "ms";
  }
  // jedan sloj shorthanda: prvo vreme je trajanje, drugo kašnjenje
  function layer(l, anim) {
    const toks = split(l, false),
      loop = anim && toks.includes("infinite");
    let k = 0;
    return toks
      .map((t) => {
        if (!isTime(t)) return t;
        const i = k++;
        return i === 0
          ? loop
            ? t
            : scale(t, false)
          : i === 1
            ? scale(t, true)
            : t;
      })
      .join(" ");
  }
  function set(st, p, v, old) {
    if (v !== old) st.setProperty(p, v, st.getPropertyPriority(p));
  }
  const skipped = (window.OS_MOTION_SKIPPED = []);
  function fix(st, sel) {
    for (const p of ["animation", "transition"]) {
      const full = st.getPropertyValue(p);
      if (full) {
        set(
          st,
          p,
          split(full, true)
            .map((l) => layer(l, p === "animation"))
            .join(", "),
          full,
        );
        continue;
      }
      const d = st.getPropertyValue(p + "-duration"),
        l = st.getPropertyValue(p + "-delay");
      if (!d && [...st].includes(p + "-duration"))
        skipped.push(sel + " {" + p + "}");
      if (d) {
        const it =
          p === "animation"
            ? split(
                st.getPropertyValue("animation-iteration-count") || "1",
                true,
              )
            : ["1"];
        set(
          st,
          p + "-duration",
          split(d, true)
            .map((t, i) =>
              it[i % it.length] === "infinite" ? t : scale(t, false),
            )
            .join(", "),
          d,
        );
      }
      if (l)
        set(
          st,
          p + "-delay",
          split(l, true)
            .map((t) => scale(t, true))
            .join(", "),
          l,
        );
    }
  }
  function walk(rules) {
    for (const r of rules) {
      if (r instanceof CSSStyleRule) fix(r.style, r.selectorText);
      if (r.cssRules && !(r instanceof CSSKeyframesRule)) walk(r.cssRules);
    }
  }
  for (const s of document.styleSheets)
    if (/\/os-app\/(app|notes|auth)\.css/.test(s.href || ""))
      try {
        walk(s.cssRules);
      } catch (e) {}
})();
