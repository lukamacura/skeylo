/* Skeylo OS · General kao Notion.
   Stranice (kolekcija "notes": title, icon, md, parentId, spaceId, order) čuvaju sadržaj kao
   Markdown u polju md. spaceId = mesec/projekat (items) čiji je to General (#mg-{id});
   bez njega stranica pripada glavnom Generalu. Podstranice nasleđuju spaceId roditelja. Editor isti Markdown prikazuje kao blokove: tekst, naslovi,
   liste, zadaci, citat, napomena, kod, razdelnik, slika, fajl, podstranica, tabela i crtež.
   "/" otvara blokove i iOS emoji, "@" vezu ka drugoj stranici. app.js zove window.SKNotes(most) i dobija
   { hub, open, sync, leave, flush, focusTop }.
   Isti editor piše i skripte (ekran #ed, open(id, "script")): skripta čuva md, a
   body (HTML za CRM i stari editor) se generiše iz njega; mdSig = otisak tog body-ja,
   pa skripta čiji je body kasnije menjan negde drugde ponovo kreće od body-ja. */
/* Editor crteža pokriva stranicu, pa nazad u browseru tada znači "gotovo", a ne odlazak.
   Registruje se ovde, pre rutera iz app.js, jer listeneri rade redom registrovanja. */
window.addEventListener(
  "hashchange",
  (e) => {
    if (window.SKDrawHash && window.SKDrawHash()) e.stopImmediatePropagation();
  },
  true,
);
window.SKNotes = function (X) {
  "use strict";
  const { S, api, esc, SV, toast, errMsg } = X;
  const $ = (s, r = document) => r.querySelector(s);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const adl = window.OS_DL || ((s) => s); // kašnjenje ulaska po krivoj iz motion.js
  const touch = () => matchMedia("(hover: none)").matches;
  const APPLE =
    /Mac|iPhone|iPad|iPod/.test(navigator.platform || "") ||
    /iPhone|iPad|Mac OS X/.test(navigator.userAgent || "");
  const MOD = APPLE ? "⌘" : "Ctrl+";
  const me = () => X.me();
  const notes = () => S.notes || [];
  const noteOf = (id) => notes().find((n) => n.id === id);
  const spaceOf = (n) => (n && n.spaceId) || null;
  let hubSpace = null,
    hubFid = null; // otvoren folder u hubu (#general~{id}, #mg-{id}~{folder})
  /* id === null: koreni stranice trenutnog huba (glavni General ili General projekta) */
  const kidsOf = (id) =>
    notes()
      .filter((n) =>
        id ? n.parentId === id : !n.parentId && spaceOf(n) === hubSpace,
      )
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  const plural = (n, one, few, many) => {
    const a = n % 10,
      b = n % 100;
    return a === 1 && b !== 11
      ? one
      : a >= 2 && a <= 4 && (b < 12 || b > 14)
        ? few
        : many;
  };
  const fold = (s) =>
    String(s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/đ/g, "dj");

  const I = {
    plus: SV('<path d="M12 5v14M5 12h14"/>', 2.2),
    lock: SV(
      '<rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    ),
    unlock: SV(
      '<rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 7.6-1.8"/>',
    ),
    grip: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.6"/><circle cx="15" cy="6" r="1.6"/><circle cx="9" cy="12" r="1.6"/><circle cx="15" cy="12" r="1.6"/><circle cx="9" cy="18" r="1.6"/><circle cx="15" cy="18" r="1.6"/></svg>',
    check: SV('<path d="m5 12 5 5L20 7"/>', 3),
    tint: SV(
      '<path d="M12 3.2s6.8 6.9 6.8 11.6a6.8 6.8 0 0 1-13.6 0C5.2 10.1 12 3.2 12 3.2z"/>',
      2,
    ),
    fold: SV(
      '<path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h3.6l2.2 2.4h7.2A2.5 2.5 0 0 1 21 9.9v7.6a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5z"/>',
    ),
    doc: SV(
      '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>',
      1.9,
    ),
    text: SV('<path d="M4 7V5h16v2M9 19h6M12 5v14"/>'),
    ul: SV(
      '<path d="M9 6h12M9 12h12M9 18h12"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>',
    ),
    ol: SV(
      '<path d="M10 6h11M10 12h11M10 18h11M4 6h1v4M4 10h2M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/>',
    ),
    todo: SV(
      '<rect x="3" y="3" width="18" height="18" rx="5"/><path d="m8 12 3 3 5-6"/>',
    ),
    quote: SV(
      '<path d="M3 21c3 0 7-1 7-8V5H3v7h4c0 4-2 5-4 5zM14 21c3 0 7-1 7-8V5h-7v7h4c0 4-2 5-4 5z"/>',
    ),
    callout: SV(
      '<rect x="3" y="4" width="18" height="16" rx="4"/><path d="M8 10h8M8 14h5"/>',
    ),
    code: SV('<path d="m8 8-5 4 5 4M16 8l5 4-5 4M14 4l-4 16"/>'),
    hr: SV('<path d="M3 12h18"/>'),
    embed: SV(
      '<rect x="2" y="4" width="20" height="16" rx="3"/><path d="M2 9h20M10 12.5 7.5 15l2.5 2.5M14 12.5l2.5 2.5-2.5 2.5"/>',
    ),
    expand: SV('<path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>'),
    shrink: SV('<path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7"/>'),
    img: SV(
      '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/>',
    ),
    file: SV(
      '<path d="M21.4 11.1 12.2 20.3a6 6 0 0 1-8.5-8.5l9.2-9.2a4 4 0 0 1 5.7 5.7l-9.2 9.2a2 2 0 0 1-2.8-2.8l8.5-8.5"/>',
    ),
    link: SV(
      '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
    ),
    smile: SV(
      '<circle cx="12" cy="12" r="9"/><path d="M8.5 14.5a4.5 4.5 0 0 0 7 0M9 9.5h.01M15 9.5h.01"/>',
    ),
    trash: SV('<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>'),
    copy: SV(
      '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
    ),
    dup: SV(
      '<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
    ),
    up: SV('<path d="M12 19V5M6 11l6-6 6 6"/>'),
    down: SV('<path d="M12 5v14M6 13l6 6 6-6"/>'),
    indent: SV('<path d="M3 5h18M11 12h10M11 19h10M3 9l4 3.5L3 16"/>'),
    outdent: SV('<path d="M3 5h18M11 12h10M11 19h10M7 9l-4 3.5L7 16"/>'),
    md: SV(
      '<rect x="2" y="5" width="20" height="14" rx="3"/><path d="M6 15V9l2.5 3L11 9v6M17 9v6M14.5 12.5 17 15l2.5-2.5"/>',
    ),
    dl: SV('<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>'),
    open: SV('<path d="M7 17 17 7M9 7h8v8"/>', 2.2),
    kb: SV('<path d="m6 9 6 6 6-6"/>', 2.4),
    dice: SV(
      '<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M8 8h.01M16 8h.01M12 12h.01M8 16h.01M16 16h.01" stroke-width="3"/>',
    ),
    search: SV('<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>'),
    clock: SV('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    paw: SV(
      '<circle cx="6.5" cy="10" r="2"/><circle cx="17.5" cy="10" r="2"/><circle cx="9.5" cy="5.5" r="2"/><circle cx="14.5" cy="5.5" r="2"/><path d="M12 12c-3 0-6 3.5-6 6 0 1.5 1.3 2 2.5 2 1.4 0 2.2-.8 3.5-.8s2.1.8 3.5.8c1.2 0 2.5-.5 2.5-2 0-2.5-3-6-6-6z"/>',
    ),
    food: SV(
      '<path d="M3 11h18a9 9 0 0 1-18 0zM8 7c0-1.5 1-2 1-3.5M12 7c0-1.5 1-2 1-3.5M16 7c0-1.5 1-2 1-3.5"/>',
    ),
    ball: SV(
      '<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6c3.4 2.7 4.9 7.3 4 12.8M18.4 18.4c-3.4-2.7-4.9-7.3-4-12.8"/>',
    ),
    car: SV(
      '<path d="M4 16h16v-3.5L18 8H6l-2 4.5zM4 16v3M20 16v3M4 12.5h16"/><circle cx="8" cy="14.3" r=".6"/><circle cx="16" cy="14.3" r=".6"/>',
    ),
    bulb: SV(
      '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z"/>',
    ),
    heart: SV(
      '<path d="M12 21s-8-5-8-11a5 5 0 0 1 8-4 5 5 0 0 1 8 4c0 6-8 11-8 11z"/>',
    ),
    flag: SV('<path d="M5 21V4h11l-1 4h4l-1 4H5"/>'),
    table: SV(
      '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 10h18M3 15h18M9 10v10"/>',
    ),
    pen: SV(
      '<path d="M4 20l1.2-4.6L16.6 4a2.2 2.2 0 0 1 3.1 0l.3.3a2.2 2.2 0 0 1 0 3.1L8.6 18.8z"/><path d="m14.5 6 3.5 3.5"/>',
    ),
    hash: SV('<path d="M5 9h14M5 15h14M10 4 8 20M16 4l-2 16"/>'),
    sum: SV('<path d="M17.5 5h-11l6 7-6 7h11"/>'),
    mul: SV('<path d="m6.5 6.5 11 11M17.5 6.5l-11 11"/>'),
    div: SV(
      '<path d="M5 12h14"/><path d="M12 6.5h.01M12 17.5h.01" stroke-width="3.4"/>',
    ),
    avg: SV('<circle cx="12" cy="12" r="6.5"/><path d="M5.5 18.5 18.5 5.5"/>'),
    tag: SV(
      '<circle cx="12" cy="12" r="9"/><path d="m8.5 10.5 3.5 3.5 3.5-3.5"/>',
    ),
    cal: SV(
      '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    ),
    who: SV(
      '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>',
    ),
    left: SV('<path d="M19 12H5M11 18l-6-6 6-6"/>'),
    right: SV('<path d="M5 12h14M13 6l6 6-6 6"/>'),
    dots: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/></svg>',
  };

  /* ---------------- emoji (iOS / Apple set) ---------------- */
  const emoSrc = (ch) =>
    "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.1.2/img/apple/64/" +
    [...ch]
      .map((c) => c.codePointAt(0).toString(16).padStart(4, "0"))
      .join("-") +
    ".png";
  /* Apple uređaji crtaju Apple Color Emoji sami; ostali dobijaju Apple sliku. */
  const emo = (ch) =>
    APPLE
      ? `<span class="emo">${esc(ch)}</span>`
      : `<img class="emo" src="${emoSrc(ch)}" alt="${esc(ch)}" draggable="false" loading="lazy" onerror="this.replaceWith(this.alt)">`;
  const isEmoji = (s) =>
    !!s &&
    s.length <= 16 &&
    !/\s/.test(s) &&
    /\p{Extended_Pictographic}|\p{Regional_Indicator}/u.test(s);
  let EMO = null,
    emoP = null;
  function loadEmoji() {
    if (EMO) return Promise.resolve(EMO);
    if (emoP) return emoP;
    emoP = new Promise((res, rej) => {
      if (window.OS_EMOJI) return res();
      const s = document.createElement("script");
      s.src = "/os-app/emoji.js";
      s.onload = res;
      s.onerror = rej;
      document.head.appendChild(s);
    })
      .then(() => {
        EMO = window.OS_EMOJI.map(([k, n, s]) => ({
          k,
          n,
          list: s.split("\n").map((r) => {
            const [ch, p, kw] = r.split("\t");
            return { ch, p: fold(p), kw: " " + fold(kw) + " " };
          }),
        }));
        return EMO;
      })
      .catch((e) => {
        emoP = null;
        throw e;
      });
    return emoP;
  }
  function searchEmoji(f, n) {
    const ws = f.split(/\s+/).filter(Boolean);
    const hit = [];
    let pos = 0;
    for (const c of EMO)
      for (const e of c.list) {
        pos++;
        let score = 0;
        for (const w of ws) {
          if (e.p === w) continue; // tačan primarni naziv ("fire" -> 🔥)
          if ((" " + e.p + " ").includes(" " + w + " ")) score += 1;
          else if (e.kw.includes(" " + w + " ")) score += 2;
          else if (e.kw.includes(" " + w)) score += 3;
          else if (e.kw.includes(w)) score += 5;
          else {
            score = -1;
            break;
          }
        }
        if (score >= 0) hit.push([score, e.p.length, pos, e.ch]);
      }
    hit.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);
    return hit.slice(0, n).map((h) => h[3]);
  }
  const REC = "skeylo-os-emoji";
  function recentEmoji() {
    try {
      const v = JSON.parse(localStorage.getItem(REC) || "[]");
      return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
    } catch (e) {
      return [];
    }
  }
  function addRecent(ch) {
    if (!ch) return;
    const v = [ch, ...recentEmoji().filter((x) => x !== ch)].slice(0, 32);
    try {
      localStorage.setItem(REC, JSON.stringify(v));
    } catch (e) {}
  }

  /* ---------------- markdown: inline ---------------- */
  const OKHREF =
    /^(https?:\/\/|mailto:|tel:|#g-|\/_blob\/|blob:|data:image\/)/i;
  const URLG = /https?:\/\/[^\s<>"]*[^\s<>"'.,;:!?)\]}*_~]/g;
  const URLY = /https?:\/\/[^\s<>"]*[^\s<>"'.,;:!?)\]}*_~]/y;
  const WORD = /[\p{L}\p{N}]/u;
  function escPlain(t) {
    return t.replace(/[\\`*[]|~(?=~)|(?<=~)~|_/g, (c, i, s) =>
      c === "_" && WORD.test(s[i - 1] || "") && WORD.test(s[i + 1] || "")
        ? c
        : "\\" + c,
    );
  }
  /* URL-ovi ostaju sirovi da bi bili klikabilni u bilo kom Markdown pregledu */
  function escText(t) {
    let out = "",
      last = 0,
      m;
    URLG.lastIndex = 0;
    while ((m = URLG.exec(t))) {
      out += escPlain(t.slice(last, m.index)) + m[0];
      last = m.index + m[0].length;
    }
    return out + escPlain(t.slice(last));
  }
  const unesc = (s) => String(s || "").replace(/\\([!-/:-@[-`{-~])/g, "$1");
  function codeSpan(v) {
    const runs = (v.match(/`+/g) || []).map((r) => r.length);
    const f = "`".repeat(runs.length ? Math.max(...runs) + 1 : 1);
    const pad = v[0] === "`" || v[v.length - 1] === "`" ? " " : "";
    return f + pad + v + pad + f;
  }
  function wrapM(x, m) {
    if (!x.trim()) return x;
    const a = x.match(/^\s*/)[0],
      z = x.match(/\s*$/)[0];
    return a + m + x.trim() + m + z;
  }
  function isBoldStyle(n) {
    const fw = n.style && n.style.fontWeight;
    if (!fw) return null;
    return fw === "bold" || fw === "bolder" || +fw >= 600;
  }
  /* veza ka stranici: [@Naslov](#g-id), u editoru nedeljiv čip koji se otvara na klik.
     Naslov u md-u ostaje kakav je bio pri ubacivanju (preimenovanje ne menja tuđe
     stranice ni spajanje izmena), a prikaz, izvod i izvoz uzimaju trenutni. */
  const RELG = /\[@(?:\\.|[^\]\\\n])*\]\(#g-([^)\s]+)\)/g;
  const relMd = (id, name) =>
    "[@" + escPlain(name).replace(/]/g, "\\]") + "](#g-" + id + ")";
  const relFresh = (md) =>
    md.replace(RELG, (m, id) => {
      const n = noteOf(id);
      return n ? relMd(id, n.title || "Bez naslova") : m;
    });
  const isRel = (c) => !!c.classList && c.classList.contains("nb-rel");
  function relIn(id, name) {
    const n = noteOf(id);
    return `${n && n.icon ? emo(n.icon) : I.doc}<span class="rl-n">${esc(n ? n.title || "Bez naslova" : name || "Stranica")}</span>`;
  }
  /* skripta ide klijentu u CRM, pa veza u njoj ostaje običan tekst. Znak iza čipa drži
     mesto za kursor kad je čip poslednji u bloku (Safari ga inače ne može da postavi). */
  const relHtml = (id, name) =>
    isScript()
      ? esc(name)
      : `<a class="nb-rel${noteOf(id) ? "" : " gone"}" href="#g-${esc(id)}" data-ref="${esc(id)}" data-name="${esc(name)}" contenteditable="false" draggable="false" tabindex="-1">${relIn(id, name)}</a>\u200b`;
  /* DOM (inline) -> Markdown */
  function inlineMd(node, o = {}) {
    let out = "";
    for (const n of node.childNodes) {
      if (n.nodeType === 3) {
        let v = n.nodeValue.replace(/​/g, "").replace(/ /g, " ");
        if (o.collapse) v = v.replace(/\s+/g, " ");
        out += escText(v);
        continue;
      }
      if (n.nodeType !== 1) continue;
      const tag = n.tagName.toUpperCase();
      if (tag === "BR") {
        out += "\n";
        continue;
      }
      if (tag === "IMG") {
        if (n.classList.contains("emo")) out += n.alt || "";
        continue;
      }
      if (isRel(n) && n.dataset.ref) {
        out += relMd(n.dataset.ref, n.dataset.name || "Stranica");
        continue;
      }
      if (
        /^(SCRIPT|STYLE|TEMPLATE|SVG|BUTTON|INPUT|SELECT|TEXTAREA|NOSCRIPT)$/.test(
          tag,
        )
      )
        continue;
      if (
        /^(P|DIV|LI|H[1-6]|BLOCKQUOTE|TR|PRE|SECTION|ARTICLE)$/.test(tag) &&
        out &&
        !out.endsWith("\n")
      )
        out += "\n";
      if (tag === "CODE" || tag === "KBD" || tag === "SAMP") {
        const v = n.textContent.replace(/​/g, "");
        out += v.trim() ? codeSpan(v) : v;
        continue;
      }
      if (tag === "A") {
        const h = (n.getAttribute("href") || "").trim();
        const inner = inlineMd(n, { ...o, a: true });
        if (!o.a && OKHREF.test(h) && inner.trim()) {
          const txt = n.textContent.replace(/​/g, "").trim();
          out +=
            txt === h && /^https?:/i.test(h)
              ? h
              : wrapLink(inner, h.replace(/[()\s]/g, encodeURIComponent));
        } else out += inner;
        continue;
      }
      let b = tag === "B" || tag === "STRONG",
        it = tag === "I" || tag === "EM",
        s = tag === "S" || tag === "DEL" || tag === "STRIKE";
      const fw = isBoldStyle(n);
      if (fw !== null) b = fw;
      const st = n.style || {};
      if (st.fontStyle === "italic") it = true;
      if (/line-through/.test(st.textDecoration || st.textDecorationLine || ""))
        s = true;
      let inner = inlineMd(n, { ...o, b: o.b || b, i: o.i || it, s: o.s || s });
      if (s && !o.s) inner = wrapM(inner, "~~");
      if (it && !o.i)
        inner = wrapM(inner, WORD.test(out.slice(-1)) ? "*" : "_");
      if (b && !o.b) inner = wrapM(inner, "**");
      out += inner;
    }
    return out;
  }
  function wrapLink(inner, h) {
    const a = inner.match(/^\s*/)[0],
      z = inner.match(/\s*$/)[0];
    return a + "[" + inner.trim() + "](" + h + ")" + z;
  }
  function linkAt(s, i) {
    if (s[i] !== "[") return null;
    let depth = 0,
      j = i;
    for (; j < s.length; j++) {
      const c = s[j];
      if (c === "\\") {
        j++;
        continue;
      }
      if (c === "\n") return null;
      if (c === "[") depth++;
      else if (c === "]" && !--depth) break;
    }
    if (j >= s.length || s[j + 1] !== "(") return null;
    let k = j + 2,
      par = 0;
    for (; k < s.length; k++) {
      const c = s[k];
      if (c === "\\") {
        k++;
        continue;
      }
      if (c === "\n") return null;
      if (c === "(") par++;
      else if (c === ")") {
        if (!par) break;
        par--;
      }
    }
    if (k >= s.length) return null;
    let href = s
      .slice(j + 2, k)
      .trim()
      .replace(/\s+"[^"]*"$/, "");
    if (href[0] === "<" && href[href.length - 1] === ">")
      href = href.slice(1, -1);
    return { text: s.slice(i + 1, j), href, end: k + 1 };
  }
  function closeAt(s, from, d) {
    for (let j = from; j < s.length; j++) {
      const c = s[j];
      if (c === "\\") {
        j++;
        continue;
      }
      if (c === "`") {
        let k = j;
        while (s[k] === "`") k++;
        const e = s.indexOf(s.slice(j, k), k);
        j = e > 0 ? e + (k - j) - 1 : k - 1;
        continue;
      }
      if (c === "[") {
        const L = linkAt(s, j);
        if (L) {
          j = L.end - 1;
          continue;
        }
      }
      if (!s.startsWith(d, j)) continue;
      if (d === "*" && s[j + 1] === "*") {
        j++;
        continue;
      }
      if (j === from || /\s/.test(s[j - 1])) continue;
      if (d[0] === "_" && WORD.test(s[j + d.length] || "")) continue;
      if (d.length === 2 && s[j + 2] === d[0]) return j + 1;
      return j;
    }
    return -1;
  }
  /* Markdown (inline) -> HTML */
  function mdInline(s) {
    s = String(s || "");
    let out = "",
      i = 0;
    const n = s.length;
    while (i < n) {
      const c = s[i];
      if (c === "\\" && i + 1 < n && /[!-/:-@[-`{-~]/.test(s[i + 1])) {
        out += esc(s[i + 1]);
        i += 2;
        continue;
      }
      if (c === "\n") {
        out += "<br>";
        i++;
        continue;
      }
      if (c === "`") {
        let k = i;
        while (s[k] === "`") k++;
        const f = k - i;
        let j = k,
          e = -1;
        while ((j = s.indexOf("`".repeat(f), j)) !== -1) {
          let q = j;
          while (s[q] === "`") q++;
          if (q - j === f) {
            e = j;
            break;
          }
          j = q;
        }
        if (e > 0) {
          let v = s.slice(k, e);
          if (
            v.length > 2 &&
            v[0] === " " &&
            v[v.length - 1] === " " &&
            v.trim()
          )
            v = v.slice(1, -1);
          out += "<code>" + esc(v) + "</code>";
          i = e + f;
          continue;
        }
        out += esc(s.slice(i, k));
        i = k;
        continue;
      }
      if (c === "h" && !WORD.test(s[i - 1] || "")) {
        URLY.lastIndex = i;
        const m = URLY.exec(s);
        if (m) {
          out += `<a href="${esc(m[0])}">${esc(m[0])}</a>`;
          i += m[0].length;
          continue;
        }
      }
      if (c === "[") {
        const L = linkAt(s, i);
        if (L) {
          out +=
            L.text[0] === "@" && /^#g-/.test(L.href)
              ? relHtml(L.href.slice(3), unesc(L.text.slice(1)))
              : OKHREF.test(L.href)
                ? `<a href="${esc(L.href)}">${mdInline(L.text)}</a>`
                : mdInline(L.text);
          i = L.end;
          continue;
        }
      }
      if (
        ((c === "*" || c === "~") && s[i + 1] === c) ||
        (c === "_" && s[i + 1] === "_" && !WORD.test(s[i - 1] || ""))
      ) {
        const j = closeAt(s, i + 2, c + c);
        if (j > 0) {
          const tag = c === "~" ? "s" : "b";
          out += `<${tag}>${mdInline(s.slice(i + 2, j))}</${tag}>`;
          i = j + 2;
          continue;
        }
      }
      if (
        (c === "*" || c === "_") &&
        s[i + 1] &&
        !/\s/.test(s[i + 1]) &&
        !(c === "_" && WORD.test(s[i - 1] || ""))
      ) {
        const j = closeAt(s, i + 1, c);
        if (j > 0) {
          out += `<i>${mdInline(s.slice(i + 1, j))}</i>`;
          i = j + 1;
          continue;
        }
      }
      out += esc(c);
      i++;
    }
    return out;
  }
  function plainOf(md) {
    return relFresh(String(md || ""))
      .split("\n")
      .filter(
        (l) =>
          !/^\s*(```|~~~|([-*_])( *\2){2,}\s*$|!\[|::embed\[|<!--tbl )/.test(
            l,
          ) && !/^\s*\|?(\s*:?-+:?\s*\|)+\s*(:?-+:?\s*)?$/.test(l),
      )
      .map((l) =>
        l
          .replace(
            /^\s*(#{1,6}\s+|[-*+]\s+(\[[ xX]\]\s+)?|\d+[.)]\s+|>\s?(\[![A-Za-z]+\][^\n]*$)?)/,
            "",
          )
          .replace(/\s*(?<!\\)\|\s*/g, " ")
          .replace(/(^|\s)\[[ xX]\](?=\s|$)/g, " "),
      )
      .join(" ")
      .replace(/\[((?:\\.|[^\]\\])*)\]\([^)]*\)/g, "$1")
      .replace(/\\(.)/g, "$1")
      .replace(/[*_~`]+/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  /* ---------------- markdown: blocks ---------------- */
  const LISTY = new Set(["ul", "ol", "todo"]);
  const TEXTY = new Set([
    "p",
    "h1",
    "h2",
    "h3",
    "ul",
    "ol",
    "todo",
    "quote",
    "callout",
    "code",
  ]);
  const isBlobHref = (h) => /^(\/_blob\/|blob:)/i.test(h);
  const DRAW_ALT = /^excalidraw:([A-Za-z0-9]+)$/;
  const endsBreak = (s) => /(^|[^\\])(\\\\)*\\$/.test(s) || /\S {2,}$/.test(s);
  const stripBreak = (s) =>
    / {2,}$/.test(s) ? s.replace(/ +$/, "") : s.slice(0, -1);
  const isBlockStart = (l) =>
    /^(#{1,6}(\s|$)|[-*+](\s|$)|\d{1,9}[.)](\s|$)|>|```|~~~|!\[)/.test(l);
  /* širina slike u % kolone (10–100); 0 = prirodna veličina */
  const imgW = (v) => {
    const n = Math.round(+v);
    return n >= 10 && n <= 100 ? n : 0;
  };
  /* tabela = GFM tabela (| Naziv | Status |, pa red sa ---); tip i širina kolona idu u
     komentar odmah ispod (<!--tbl {"k":[…],"w":[…]}-->), koji drugi Markdown pregledi ne
     prikazuju. Ćelija je inline Markdown; | je \|, novi red <br>. Tipovi: text, num,
     sel (izbor), date (YYYY-MM-DD), check ([x] / [ ]), who (ime iz tima). */
  const TK = ["text", "num", "sel", "date", "check", "who"];
  /* računanje ispod kolone broja, u komentaru tbl kao f: ["", "avg", …]. Prazno je
     zbir koji se vidi tek kad ima bar dva broja; "none" znači bez računanja */
  const FX = ["sum", "mul", "div", "avg", "none"];
  const fxOf = (k, f) => (k === "num" && FX.includes(f) ? f : "");
  /* boje tabele: pozadina kolone, reda i ćelije, i boja opcije izbora. U komentaru tbl:
     c = boje kolona, o = {kolona: {opcija: boja}}, r = {red: boja}, x = {"red:kolona": boja}.
     Čuva se naziv boje, a ćelija može i "none" (bez boje, iako red ili kolona imaju boju) */
  const TINTS = [
    ["gray", "Siva", "#a39a90"],
    ["orange", "Narandžasta", "#d08a55"],
    ["yellow", "Žuta", "#e3b341"],
    ["green", "Zelena", "#4fbf7f"],
    ["teal", "Tirkizna", "#4fbfa8"],
    ["blue", "Plava", "#5b9cf0"],
    ["purple", "Ljubičasta", "#a98bff"],
    ["pink", "Roze", "#e0679a"],
    ["red", "Crvena", "#ff7a6b"],
  ];
  const TINT = Object.fromEntries(TINTS.map(([id, , hex]) => [id, hex]));
  const tintId = (v) =>
    typeof v === "string" && Object.hasOwn(TINT, v) ? v : "";
  /* opcije sortirane po nazivu: isti skup boja je uvek isti Markdown */
  function optMap(o) {
    const m = {};
    if (o && typeof o === "object")
      for (const k of Object.keys(o).sort()) if (tintId(o[k])) m[k] = o[k];
    return Object.keys(m).length ? m : null;
  }
  const rowTintKey = (r) => (r.bg || "") + ":" + (r.tc ? r.tc.join(".") : "");
  const colW = (v) => {
    const n = Math.round(+v);
    return n >= 40 && n <= 1200 ? n : 0;
  };
  function rowCells(line) {
    let s = line.trim(),
      cur = "";
    if (s[0] === "|") s = s.slice(1);
    const out = [];
    for (let k = 0; k < s.length; k++) {
      const c = s[k];
      if (c === "\\" && k + 1 < s.length) {
        cur += s[k + 1] === "|" ? "|" : c + s[k + 1];
        k++;
      } else if (c === "|") {
        out.push(cur);
        cur = "";
      } else cur += c;
    }
    if (cur.trim() || !/\|\s*$/.test(s)) out.push(cur);
    return out.map((x) => x.trim().replace(/(?<!\\)<br\s*\/?>/gi, "\n"));
  }
  const cellMd = (x) =>
    String(x || "")
      .replace(/\n+$/, "")
      .replace(/<(br\s*\/?)>/gi, "\\<$1>")
      .replace(/\|/g, "\\|")
      .replace(/\n/g, "<br>");
  /* L[i] je zaglavlje, L[i+1] red sa ---; vraća { b, end } ili null */
  function tblAt(L, i) {
    const dl = L[i + 1];
    if (dl == null || !L[i].includes("|") || !/^[\s|:-]*-[\s|:-]*$/.test(dl))
      return null;
    const hs = rowCells(L[i]),
      ds = rowCells(dl);
    if (
      !dl.includes("|") ||
      ds.length !== hs.length ||
      !ds.every((d) => /^:?-+:?$/.test(d))
    )
      return null;
    const n = hs.length,
      rows = [];
    let j = i + 2;
    for (; j < L.length; j++) {
      const s = L[j].trim();
      if (!s || !s.includes("|") || /^(#{1,6}(\s|$)|>|```|~~~|<!--)/.test(s))
        break;
      const cs = rowCells(L[j]);
      cs.length = n;
      rows.push(Array.from(cs, (c) => c || ""));
    }
    let meta = {};
    const mm =
      j < L.length && L[j].trim().match(/^<!--\s*tbl\s+(\{.*\})\s*-->$/);
    if (mm) {
      try {
        meta = JSON.parse(mm[1]) || {};
      } catch (e) {}
      j++;
    }
    const K = Array.isArray(meta.k) ? meta.k : [],
      W = Array.isArray(meta.w) ? meta.w : [],
      C = Array.isArray(meta.c) ? meta.c : [],
      F = Array.isArray(meta.f) ? meta.f : [];
    /* boje idu uz red kao njegova svojstva, pa prate red kroz sortiranje i spajanje */
    rows.forEach((r, i) => {
      const bg = meta.r ? tintId(meta.r[i]) : "";
      if (bg) r.bg = bg;
    });
    for (const [key, v] of Object.entries(meta.x || {})) {
      const [ri, ci] = key.split(":").map(Number);
      if (rows[ri] && ci >= 0 && ci < n && (v === "none" || tintId(v))) {
        rows[ri].tc = rows[ri].tc || Array(n).fill("");
        rows[ri].tc[ci] = v;
      }
    }
    const cols = hs.map((h, c) => {
      const d = ds[c],
        k = TK.includes(K[c]) ? K[c] : "text";
      return {
        n: h.replace(/\n/g, " "),
        k,
        w: colW(W[c]),
        a:
          k !== "text"
            ? ""
            : d[0] === ":" && d.endsWith(":")
              ? "c"
              : d.endsWith(":")
                ? "r"
                : d[0] === ":"
                  ? "l"
                  : "",
        c: tintId(C[c]),
        o: optMap(meta.o && meta.o[c]),
        f: fxOf(k, F[c]),
      };
    });
    return { b: { t: "tbl", cols, rows }, end: j - 1 };
  }
  /* kolone poravnate razmacima (do 24 znaka), da je i sirov Markdown pregledan */
  function tblLines(b) {
    const cols = b.cols;
    const grid = [
      cols.map((c) => c.n),
      ...b.rows.map((r) => cols.map((_, c) => r[c] || "")),
    ].map((r) => r.map(cellMd));
    const al = cols.map((c) =>
      c.k === "num" ? "r" : c.k === "check" ? "c" : c.k === "text" ? c.a : "",
    );
    const wd = cols.map((_, c) =>
      Math.min(24, Math.max(3, ...grid.map((r) => r[c].length))),
    );
    const line = (r) =>
      "| " +
      r
        .map((s, c) => s + " ".repeat(Math.max(0, wd[c] - s.length)))
        .join(" | ") +
      " |";
    const dash = (a, w) =>
      a === "c"
        ? ":" + "-".repeat(w - 2) + ":"
        : a === "r"
          ? "-".repeat(w - 1) + ":"
          : a === "l"
            ? ":" + "-".repeat(w - 1)
            : "-".repeat(w);
    const out = [
      line(grid[0]),
      "| " + al.map((a, c) => dash(a, wd[c])).join(" | ") + " |",
      ...grid.slice(1).map(line),
    ];
    const meta = {};
    if (cols.some((c) => c.k !== "text")) meta.k = cols.map((c) => c.k);
    if (cols.some((c) => c.w)) meta.w = cols.map((c) => c.w || 0);
    if (cols.some((c) => c.c)) meta.c = cols.map((c) => c.c || "");
    if (cols.some((c) => fxOf(c.k, c.f)))
      meta.f = cols.map((c) => fxOf(c.k, c.f));
    const O = {},
      R = {},
      XC = {};
    cols.forEach((c, i) => {
      const m = optMap(c.o);
      if (m) O[i] = m;
    });
    b.rows.forEach((r, i) => {
      if (r.bg) R[i] = r.bg;
      if (r.tc) r.tc.forEach((id, j) => id && (XC[i + ":" + j] = id));
    });
    if (Object.keys(O).length) meta.o = O;
    if (Object.keys(R).length) meta.r = R;
    if (Object.keys(XC).length) meta.x = XC;
    /* naziv opcije može da sadrži -->, a to ne sme da zatvori komentar */
    if (Object.keys(meta).length)
      out.push(
        "<!--tbl " + JSON.stringify(meta).replace(/>/g, "\\u003e") + "-->",
      );
    return out;
  }
  /* vrednosti ćelija po tipu kolone */
  const isChecked = (x) => /^\[?[xX✓✔☑]\]?$/.test(String(x || "").trim());
  function isoDate(s) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || "").trim());
    const d = m && new Date(+m[1], m[2] - 1, +m[3]);
    return d && d.getDate() === +m[3] ? d : null;
  }
  const iso = (d) =>
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0");
  /* "29.10.2026.", "29/10/2026", "29.10." (ove godine), "2026-10-29" -> ISO */
  function toIso(s) {
    s = String(s || "").trim();
    if (isoDate(s)) return s;
    const m = /^(\d{1,2})[./-]\s*(\d{1,2})[./-]?\s*(\d{4})?\.?$/.exec(s);
    if (!m) return "";
    const d = new Date(
      m[3] ? +m[3] : new Date().getFullYear(),
      m[2] - 1,
      +m[1],
    );
    return d.getDate() === +m[1] && d.getMonth() === m[2] - 1 ? iso(d) : "";
  }
  const DFMT = new Intl.DateTimeFormat("sr-Latn-RS", {
      day: "numeric",
      month: "short",
    }),
    DFMTY = new Intl.DateTimeFormat("sr-Latn-RS", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    NUMF = new Intl.NumberFormat("sr-Latn-RS", { maximumFractionDigits: 2 });
  /* abs: bez "Danas"/"Sutra" (CRM, title) */
  function dateLabel(s, abs) {
    const d = isoDate(s);
    if (!d) return unesc(s);
    if (!abs) {
      const t = new Date();
      t.setHours(0, 0, 0, 0);
      const dd = Math.round((d - t) / 864e5);
      if (dd === 0) return "Danas";
      if (dd === 1) return "Sutra";
      if (dd === -1) return "Juče";
    }
    return (d.getFullYear() === new Date().getFullYear() ? DFMT : DFMTY).format(
      d,
    );
  }
  /* "1.250,50 €" = 1250.5 (zarez je decimala; tačka između trojki su hiljade) */
  function parseNum(s) {
    let t = String(s || "")
      .replace(/[\s ']/g, "")
      .replace(/[^\d.,-]/g, "");
    if (!/\d/.test(t)) return null;
    const lc = t.lastIndexOf(","),
      ld = t.lastIndexOf(".");
    if (lc >= 0 && ld >= 0)
      t =
        lc > ld ? t.replace(/\./g, "").replace(",", ".") : t.replace(/,/g, "");
    else if (lc >= 0) t = t.replace(/,/g, ".");
    else if (/^-?\d{1,3}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, "");
    const v = parseFloat(t);
    return isFinite(v) ? v : null;
  }
  /* boja opcije izbora: poznata stanja imaju svoju, ostale stalnu boju po nazivu */
  const OPTC = [
    "#5b9cf0",
    "#e0679a",
    "#a98bff",
    "#d08a55",
    "#4fbfa8",
    "#c9a227",
  ];
  function optColor(v, o) {
    const f = fold(v);
    if (o && tintId(o[f])) return TINT[o[f]];
    if (
      /(gotov|zavrs|uradjen|objavljen|odobren|placen|potvrdjen|done|complete|^da$|aktivn|live)/.test(
        f,
      )
    )
      return "#4fbf7f";
    if (/(u toku|radi se|u izradi|in progress|doing|pregled|review)/.test(f))
      return "#e3b341";
    if (
      /(hitno|problem|kasni|blokiran|odbijen|otkazan|urgent|blocked|^ne$|gresk)/.test(
        f,
      )
    )
      return "#ff7a6b";
    if (/(nije poc|ceka|cekanj|todo|to do|planiran|ideja|draft|nacrt)/.test(f))
      return "#a39a90";
    let h = 0;
    for (const ch of f) h = (h * 31 + ch.codePointAt(0)) >>> 0;
    return OPTC[h % OPTC.length];
  }
  function parseMd(md) {
    const L = String(md || "")
      .replace(/\r\n?/g, "\n")
      .split("\n");
    const out = [];
    let blank = 0,
      st = [];
    const add = (b) => {
      for (let k = 1; k < blank; k++) out.push({ t: "p", x: "" });
      blank = 0;
      out.push(b);
    };
    for (let i = 0; i < L.length; i++) {
      const raw = L[i];
      if (!raw.trim()) {
        blank++;
        continue;
      }
      const lead = raw.match(/^[ \t]*/)[0],
        ind = lead.replace(/\t/g, "  ").length,
        ln = raw.slice(lead.length);
      let m;
      if (
        (m = ln.match(/^(`{3,}|~{3,})(.*)$/)) &&
        !(m[1][0] === "`" && m[2].includes("`"))
      ) {
        const f = m[1],
          body = [];
        let j = i + 1;
        for (; j < L.length; j++) {
          const cl = L[j].trim();
          if (
            cl[0] === f[0] &&
            /^(`{3,}|~{3,})$/.test(cl) &&
            cl.length >= f.length
          )
            break;
          body.push(
            ind ? L[j].replace(new RegExp("^ {0," + ind + "}"), "") : L[j],
          );
        }
        add({ t: "code", x: body.join("\n"), lang: m[2].trim() });
        i = j;
        st = [];
        continue;
      }
      if (/^([-*_])( *\1){2,} *$/.test(ln)) {
        add({ t: "hr" });
        st = [];
        continue;
      }
      if ((m = ln.match(/^(#{1,6})(?:\s+(.*?))?\s*$/))) {
        add({
          t: "h" + Math.min(3, m[1].length),
          x: (m[2] || "").replace(/\s+#+$/, ""),
        });
        st = [];
        continue;
      }
      if (ln[0] === ">") {
        const head = ln.match(/^>\s?\[!([A-Za-z]+)\][ \t]*(.*)$/);
        const lines = head ? [] : [ln.replace(/^>\s?/, "")];
        let j = i + 1;
        while (j < L.length && /^\s*>/.test(L[j]))
          (lines.push(L[j].replace(/^\s*>\s?/, "")), j++);
        const x = lines
          .map((l) => (endsBreak(l) ? stripBreak(l) : l))
          .join("\n");
        if (head) {
          const rest = head[2].trim();
          const icon = isEmoji(rest) ? rest : "";
          add({
            t: "callout",
            v: head[1].toUpperCase(),
            i: icon,
            x: !icon && rest ? rest + (x ? "\n" + x : "") : x,
          });
        } else add({ t: "quote", x });
        i = j - 1;
        st = [];
        continue;
      }
      if ((m = ln.match(/^([-*+]|\d{1,9}[.)])(?:[ \t]+(.*))?$/))) {
        let t = /^\d/.test(m[1]) ? "ol" : "ul",
          x = m[2] || "",
          c = false,
          tm;
        if (t === "ul" && (tm = x.match(/^\[([ xX])\](?:[ \t]+(.*))?$/))) {
          t = "todo";
          c = tm[1] !== " ";
          x = tm[2] || "";
        }
        while (st.length && st[st.length - 1] > ind) st.pop();
        if (!st.length || st[st.length - 1] < ind) st.push(ind);
        const parts = [x];
        let j = i;
        while (j + 1 < L.length && L[j + 1].trim()) {
          const nx = L[j + 1],
            nind = nx.match(/^[ \t]*/)[0].replace(/\t/g, "  ").length,
            last = parts.length - 1;
          if (endsBreak(parts[last])) parts[last] = stripBreak(parts[last]);
          else if (!(nind > ind && !isBlockStart(nx.trim()))) break;
          parts.push(nx.trim());
          j++;
        }
        const b = { t, x: parts.join("\n"), l: Math.min(6, st.length - 1), c };
        if (t === "ol" && parseInt(m[1], 10) !== 1) b.n = parseInt(m[1], 10);
        add(b);
        i = j;
        continue;
      }
      st = [];
      const tb = ind < 4 && ln.includes("|") ? tblAt(L, i) : null;
      if (tb) {
        add(tb.b);
        i = tb.end;
        continue;
      }
      /* slika; širina posle resize-a: ![alt](src){width=60%} */
      if (
        (m = ln.match(
          /^!\[([^\]]*)\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)(?:\{width=(\d{1,3})%\})?\s*$/,
        ))
      ) {
        /* crtež je slika sa id-jem scene u alt-u: ![excalidraw:id](/_blob/svg) */
        const dk = m[1].match(DRAW_ALT);
        add(
          dk && isBlobHref(m[2])
            ? { t: "draw", scene: dk[1], src: m[2], w: imgW(m[3]) }
            : { t: "img", alt: unesc(m[1]), src: m[2], w: imgW(m[3]) },
        );
        continue;
      }
      /* HTML fajl ugrađen u stranicu: ::embed[ime](/_blob/id) */
      const ek = ln.startsWith("::embed[") ? linkAt(ln, 7) : null;
      if (
        ek &&
        ek.end === ln.replace(/\s+$/, "").length &&
        /^(\/_blob\/|blob:|https:\/\/)/i.test(ek.href)
      ) {
        add({ t: "embed", src: ek.href, name: unesc(ek.text) });
        continue;
      }
      const lk = ln[0] === "[" ? linkAt(ln, 0) : null;
      if (lk && lk.end === ln.replace(/\s+$/, "").length) {
        if (/^#g-/.test(lk.href) && lk.text[0] !== "@") {
          add({ t: "page", ref: lk.href.slice(3), name: unesc(lk.text) });
          continue;
        }
        if (isBlobHref(lk.href)) {
          add({ t: "file", src: lk.href, name: unesc(lk.text) });
          continue;
        }
      }
      const parts = [ln.replace(/\s+$/, (z) => (/ {2,}$/.test(z) ? "  " : ""))];
      let j = i;
      while (
        j + 1 < L.length &&
        L[j + 1].trim() &&
        endsBreak(parts[parts.length - 1])
      ) {
        parts[parts.length - 1] = stripBreak(parts[parts.length - 1]);
        parts.push(L[++j].trim());
      }
      add({ t: "p", x: parts.join("\n").replace(/ {2,}$/, "") });
      i = j;
    }
    /* broj iz md važi samo za prvu stavku niza: od njega kreće numeracija */
    let rc = [];
    for (const b of out) {
      if (!LISTY.has(b.t)) {
        rc = [];
        continue;
      }
      const l = b.l || 0;
      rc.length = l + 1;
      if (b.t === "ol" && rc[l]) delete b.n;
      rc[l] = b.t === "ol";
    }
    return out;
  }
  function escLead(s) {
    if (/^(#{1,6}(\s|$)|[-*+](\s|$)|>|::embed\[|([-*_])( *\3){2,} *$)/.test(s))
      return "\\" + s;
    const m = s.match(/^(\d{1,9})([.)])(\s|$)/);
    return m ? m[1] + "\\" + s.slice(m[1].length) : s;
  }
  function contLines(first, x, rest) {
    const ps = x.split("\n");
    return ps.map(
      (s, k) => (k ? rest : first) + s + (k < ps.length - 1 ? "\\" : ""),
    );
  }
  const quoteLines = (x) => x.split("\n").map((s) => (s ? "> " + s : ">"));
  function blockLines(b, num, pad = "") {
    const x = String(b.x || "").replace(/\n+$/, "");
    switch (b.t) {
      case "h1":
      case "h2":
      case "h3":
        return ["#".repeat(+b.t[1]) + " " + x.replace(/\n/g, " ")];
      case "ul":
        return contLines(pad + "- ", x, pad + "  ");
      case "ol":
        return contLines(
          pad + num + ". ",
          x,
          pad + " ".repeat(String(num).length + 2),
        );
      case "todo":
        return contLines(pad + (b.c ? "- [x] " : "- [ ] "), x, pad + "  ");
      case "quote":
        return quoteLines(x);
      case "callout":
        return [
          "> [!" + (b.v || "NOTE") + "]" + (b.i ? " " + b.i : ""),
          ...(x ? quoteLines(x) : []),
        ];
      case "code": {
        const runs = (x.match(/`{3,}/g) || []).map((r) => r.length + 1);
        const f = "`".repeat(Math.max(3, ...runs));
        return [f + (b.lang || ""), ...x.split("\n"), f];
      }
      case "hr":
        return ["---"];
      case "img":
        return [
          `![${escPlain(b.alt || "")}](${b.src})` +
            (b.w ? `{width=${b.w}%}` : ""),
        ];
      case "draw":
        return [
          `![excalidraw:${b.scene}](${b.src})` + (b.w ? `{width=${b.w}%}` : ""),
        ];
      case "file":
        return [`[${escPlain(b.name || "Fajl")}](${b.src})`];
      case "embed":
        return [`::embed[${escPlain(b.name || "HTML")}](${b.src})`];
      case "page":
        return [`[${escPlain(b.name || "Stranica")}](#g-${b.ref})`];
      case "tbl":
        return tblLines(b);
      default: {
        const ps = x.split("\n");
        ps[0] = escLead(ps[0]);
        return ps.map((s, k) => (k < ps.length - 1 ? s + "\\" : s));
      }
    }
  }
  /* početni broj numerisane liste (1 ako nije zadat) */
  const olStart = (n) => (n >= 0 && n !== 1 ? +n : 1);
  function toMd(bs) {
    const out = [];
    let prev = null,
      cnt = [],
      ind = [0];
    for (const b of bs) {
      if (b.t === "p" && !String(b.x || "").trim()) {
        out.push("");
        prev = null;
        cnt = [];
        ind = [0];
        continue;
      }
      let num = 0,
        pad = "";
      if (LISTY.has(b.t)) {
        const l = Math.min(b.l || 0, ind.length - 1);
        cnt.length = l + 1;
        if (b.t === "ol")
          num = cnt[l] = cnt[l] != null ? cnt[l] + 1 : olStart(b.n);
        else cnt[l] = null;
        /* deca počinju tamo gde počinje tekst roditelja (CommonMark) */
        pad = " ".repeat(ind[l]);
        ind.length = l + 1;
        ind.push(ind[l] + (b.t === "ol" ? String(num).length + 2 : 2));
      } else {
        cnt = [];
        ind = [0];
      }
      if (out.length && !(prev && LISTY.has(prev.t) && LISTY.has(b.t)))
        out.push("");
      out.push(...blockLines(b, num, pad));
      prev = b;
    }
    const s = out.join("\n").replace(/\n+$/, "");
    return s ? s + "\n" : "";
  }

  /* ---------------- skripte: Markdown -> body (HTML) ---------------- */
  /* body čitaju CRM i stari editor, pa sadrži samo tagove koje oba propuštaju */
  const OKSRC = /^(\/_blob\/|https:\/\/|data:image\/|blob:)/i;
  function htmlOf(md) {
    let h = "";
    const st = [];
    const closeTo = (n) => {
      while (st.length > n) h += "</li></" + st.pop() + ">";
    };
    for (const b of parseMd(md)) {
      const x = String(b.x || "");
      if (LISTY.has(b.t)) {
        const tag = b.t === "ol" ? "ol" : "ul",
          l = Math.min(b.l || 0, st.length);
        closeTo(l + 1);
        if (st.length === l + 1 && st[l] === tag) h += "</li>";
        else {
          if (st.length === l + 1) h += "</li></" + st.pop() + ">";
          h +=
            "<" +
            tag +
            (tag === "ol" && olStart(b.n) !== 1
              ? ` start="${olStart(b.n)}"`
              : "") +
            ">";
          st.push(tag);
        }
        h +=
          "<li>" + (b.t === "todo" ? (b.c ? "☑ " : "☐ ") : "") + mdInline(x);
        continue;
      }
      closeTo(0);
      if (b.t === "p")
        h += x.trim() ? "<p>" + mdInline(x) + "</p>" : "<p><br></p>";
      else if (/^h[123]$/.test(b.t)) h += `<${b.t}>${mdInline(x)}</${b.t}>`;
      else if (b.t === "quote")
        h += "<blockquote>" + mdInline(x) + "</blockquote>";
      else if (b.t === "callout")
        h +=
          "<blockquote>" +
          esc(b.i || "💡") +
          " " +
          mdInline(x) +
          "</blockquote>";
      else if (b.t === "code")
        h += "<p>" + esc(x).replace(/\n/g, "<br>") + "</p>";
      else if (b.t === "hr") h += "<hr>";
      else if (b.t === "img" && OKSRC.test(b.src || ""))
        h += `<p><img src="${esc(b.src)}" alt=""></p>`;
      /* alt je znak za CRM, koji inače ne prikazuje slike sa /_blob/ */ else if (
        b.t === "draw" &&
        OKSRC.test(b.src || "")
      )
        h += `<p><img src="${esc(b.src)}" alt="excalidraw"></p>`;
      else if ((b.t === "file" || b.t === "embed") && OKSRC.test(b.src || ""))
        h += `<p><a class="file" href="${esc(b.src)}" data-name="${esc(b.name || "Fajl")}">${esc(b.name || "Fajl")}</a></p>`;
      else if (b.t === "page") h += "<p>" + esc(b.name || "Stranica") + "</p>";
      else if (b.t === "tbl")
        h +=
          "<table><thead><tr>" +
          b.cols.map((c) => "<th>" + mdInline(c.n) + "</th>").join("") +
          "</tr></thead><tbody>" +
          b.rows
            .map(
              (r) =>
                "<tr>" +
                b.cols
                  .map(
                    (c, i) =>
                      "<td>" +
                      (c.k === "check"
                        ? isChecked(r[i])
                          ? "☑"
                          : "☐"
                        : c.k === "date"
                          ? esc(dateLabel(r[i], true))
                          : mdInline(r[i])) +
                      "</td>",
                  )
                  .join("") +
                "</tr>",
            )
            .join("") +
          "</tbody></table>";
    }
    closeTo(0);
    return h;
  }
  function sig(s) {
    let h = 0x811c9dc5;
    for (let i = 0; i < s.length; i++)
      h = Math.imul(h ^ s.charCodeAt(i), 0x01000193);
    return (h >>> 0).toString(36) + "." + s.length;
  }
  /* md skripte; ako je body u međuvremenu menjan van ovog editora, kreće se od body-ja */
  let smKey = null,
    smVal = "";
  function scriptMd(s) {
    const body = s.body || "";
    if (typeof s.md === "string" && s.mdSig === sig(body)) return s.md;
    if (smKey !== body) {
      smKey = body;
      smVal = toMd(htmlToBlocks(body));
    }
    return smVal;
  }

  /* ---------------- block DOM ---------------- */
  /* host = ekran u kome editor trenutno radi (General stranica ili skripta) */
  const HOSTS = {
    page: {
      col: "notes",
      hash: "g-",
      screen: "#gp",
      root: $("#gpBody"),
      title: $("#gpTitle"),
      save: "#gpSave",
    },
    script: {
      col: "scripts",
      hash: "s-",
      screen: "#ed",
      root: $("#edBody"),
      title: $("#edTitle"),
      save: "#saveState",
    },
  };
  let H = HOSTS.page,
    SP = false, // tekst označen preko više blokova (vidi spanOn)
    root = H.root,
    titleEl = H.title;
  const onRoot = (type, fn, opt) =>
    [HOSTS.page.root, HOSTS.script.root].forEach((r) =>
      r.addEventListener(type, fn, opt),
    );
  const isScript = () => H === HOSTS.script;
  const live = () => !$(H.screen).hidden && !root.hidden;
  const docOf = (id) => (S[H.col] || []).find((n) => n.id === id);
  const PH = {
    p: "Piši ili ukucaj „/“ za blokove i emoji",
    h1: "Naslov 1",
    h2: "Naslov 2",
    h3: "Naslov 3",
    ul: "Lista",
    ol: "Lista",
    todo: "Zadatak",
    quote: "Citat",
    callout: "Napomena…",
    code: "Kod",
  };
  const PT = (() => {
    try {
      const d = document.createElement("div");
      d.contentEditable = "plaintext-only";
      return d.contentEditable === "plaintext-only";
    } catch (e) {
      return false;
    }
  })();
  const isNb = (n) => !!n && n.nodeType === 1 && n.classList.contains("nb");
  const blocks = () => [...root.children].filter(isNb);
  const tOf = (el) => (el ? el.querySelector(":scope > .nb-t") : null);
  function blockOf(n) {
    const e = n && (n.nodeType === 1 ? n : n.parentElement);
    const b = e && e.closest(".nb");
    return b && b.parentElement === root ? b : null;
  }
  const lvl = (el) => +el.dataset.l || 0;
  function setLevel(el, l) {
    el.dataset.l = l;
    el.style.setProperty("--l", l);
  }
  function make(b) {
    const el = document.createElement("div");
    const t = b.t;
    el.className = "nb";
    el.dataset.t = t;
    setLevel(el, LISTY.has(t) ? b.l || 0 : 0);
    let h = `<div class="nb-g" contenteditable="false"><button type="button" class="nb-add" tabindex="-1" aria-label="Dodaj blok ispod" title="Dodaj blok">${I.plus}</button><button type="button" class="nb-h" tabindex="-1" aria-label="Prevuci ili otvori meni" title="Prevuci za pomeranje · klik za meni">${I.grip}</button></div>`;
    if (t === "ul") h += `<span class="nb-m" aria-hidden="true"></span>`;
    if (t === "ol") h += `<span class="nb-m" aria-hidden="true">1.</span>`;
    if (t === "todo")
      h += `<button type="button" class="nb-ck" role="checkbox" aria-checked="${!!b.c}" aria-label="Završeno" tabindex="-1">${I.check}</button>`;
    if (t === "callout")
      h += `<button type="button" class="nb-ci" tabindex="-1" aria-label="Promeni ikonicu napomene">${emo(b.i || "💡")}</button>`;
    if (t === "code")
      h += `<div class="nb-cbar" contenteditable="false"><button type="button" class="nb-copy" tabindex="-1">${I.copy}<span>Kopiraj</span></button></div><pre class="nb-t" contenteditable="${PT ? "plaintext-only" : "true"}" spellcheck="false" data-ph="${PH.code}"></pre>`;
    else if (TEXTY.has(t))
      h += `<div class="nb-t" contenteditable="true" spellcheck="false" data-ph="${PH[t]}"></div>`;
    else if (t === "hr") h += `<div class="nb-x nb-hr"><hr></div>`;
    else if (t === "img")
      h += `<figure class="nb-x nb-img">${b.src ? `<span class="nb-iw"${b.w ? ` style="width:${b.w}%"` : ""}><img src="${esc(b.src)}" alt="${esc(b.alt || "")}" loading="lazy" draggable="false"><span class="nb-rz" aria-hidden="true" title="Prevuci za veličinu · dupli klik vraća original"></span></span>` : `<span class="nb-up">Otpremam sliku…</span>`}</figure>`;
    else if (t === "draw")
      h += `<figure class="nb-x nb-draw">${b.src ? `<span class="nb-iw"${b.w ? ` style="width:${b.w}%"` : ""}><img src="${esc(b.src)}" alt="Crtež" loading="lazy" draggable="false" onerror="this.closest('.nb-draw').classList.add('bad')"><span class="nb-de">${I.pen}<span>Izmeni</span></span><span class="nb-dx">Preview nije mogao da se učita. Klikni da otvoriš crtež.</span><span class="nb-rz" aria-hidden="true" title="Prevuci za veličinu · dupli klik vraća original"></span></span>` : `<span class="nb-up">Crtež je otvoren…</span>`}</figure>`;
    else if (t === "file")
      h += `<a class="nb-x nb-file"${b.src ? ` href="${esc(b.src)}" target="_blank" rel="noopener"` : ""} draggable="false"><span class="nb-fi">${I.file}</span><span class="nb-fn">${esc(b.name || "Fajl")}</span>${b.src ? `<span class="nb-fo">${I.open}</span>` : `<span class="nb-fo">Otpremam…</span>`}</a>`;
    else if (t === "embed")
      h += `<div class="nb-x nb-emb"><div class="nb-eb"><span class="nb-fi">${I.embed}</span><span class="nb-fn">${esc(b.name || "HTML")}</span>${b.src ? `<button type="button" class="nb-ex" tabindex="-1" aria-label="Preko celog ekrana" title="Preko celog ekrana">${I.expand}</button>` : `<span class="nb-fo">Otpremam…</span>`}</div>${b.src ? `<iframe class="nb-ef" sandbox="${EMB_SB}" title="${esc(b.name || "HTML")}"></iframe>` : ""}</div>`;
    else if (t === "page")
      h += `<a class="nb-x nb-page" href="#g-${esc(b.ref || "")}" draggable="false"></a>`;
    else if (t === "tbl")
      h += `<div class="nb-tbl" contenteditable="false">${tbHtml(b)}</div>`;
    el.innerHTML = h;
    if (t === "tbl") tbSum(el);
    if (t === "todo") {
      el.dataset.c = b.c ? "1" : "0";
      el.classList.toggle("done", !!b.c);
    }
    if (t === "callout") {
      el.dataset.v = b.v || "NOTE";
      el.dataset.i = b.i || "";
    }
    if (t === "code") el.dataset.lang = b.lang || "";
    if (t === "ol" && olStart(b.n) !== 1) el.dataset.n = olStart(b.n);
    if (t === "img" || t === "file" || t === "embed") {
      el.dataset.src = b.src || "";
      el.dataset.alt = b.alt || "";
      el.dataset.name = b.name || "";
    }
    if (t === "img" && b.w) el.dataset.w = b.w;
    if (t === "draw") {
      el.dataset.src = b.src || "";
      el.dataset.scene = b.scene || "";
      if (b.w) el.dataset.w = b.w;
    }
    if (t === "embed" && b.src) loadEmbed(el);
    if (t === "page") {
      el.dataset.ref = b.ref || "";
      el.dataset.name = b.name || "";
      paintPage(el);
    }
    const tt = tOf(el);
    if (tt) {
      if (t === "code") tt.textContent = b.x || "";
      else tt.innerHTML = mdInline(b.x || "");
    }
    return el;
  }
  /* HTML fajl ide u sandbox iframe bez allow-same-origin: njegove skripte rade,
     ali ne vide OS (sesiju, kolačiće). Visinu javlja ubačena skripta. */
  const embCache = new Map();
  function embText(src) {
    let p = embCache.get(src);
    if (!p) {
      p = fetch(src).then((r) => {
        if (!r.ok) throw r.status;
        return r.text();
      });
      embCache.set(src, p);
      p.catch(() => embCache.delete(src));
    }
    return p;
  }
  const EMB_JS =
    '<script>(function(){var l=0;function s(){var d=document.documentElement,b=document.body,h=Math.max(d.scrollHeight,b?b.scrollHeight:0);if(h!==l){l=h;parent.postMessage({skEmbH:h},"*")}}addEventListener("load",s);addEventListener("DOMContentLoaded",s);if(window.ResizeObserver)new ResizeObserver(s).observe(document.documentElement);setTimeout(s,60)})()<\/script>';
  function withEmbJs(html) {
    /* skripta mora posle <!doctype>, inače stranica pada u quirks mode */
    if (/<head[^>]*>/i.test(html))
      return html.replace(/<head[^>]*>/i, (m) => m + EMB_JS);
    const d = html.match(/^\s*<!doctype[^>]*>/i);
    return d ? d[0] + EMB_JS + html.slice(d[0].length) : EMB_JS + html;
  }
  const EMB_SB =
    "allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox";
  function loadInto(f, src) {
    embText(src).then(
      (html) => (f.srcdoc = withEmbJs(html)),
      () =>
        (f.srcdoc =
          '<p style="font:14px system-ui;color:#999;text-align:center;margin-top:40px">HTML fajl nije mogao da se učita.</p>'),
    );
  }
  function loadEmbed(el) {
    const f = el.querySelector(".nb-ef");
    if (f) loadInto(f, el.dataset.src);
  }
  addEventListener("message", (e) => {
    const h = e.data && e.data.skEmbH;
    if (typeof h !== "number") return;
    for (const f of document.querySelectorAll("iframe.nb-ef"))
      if (f.contentWindow === e.source) {
        f.style.height = Math.min(2000, Math.max(120, Math.ceil(h))) + "px";
        break;
      }
  });
  /* preko celog ekrana: zaseban sloj u body-ju (ekrani imaju transform, pa
     position: fixed unutar editora ne bi pokrio ceo ekran) */
  let embOv = null;
  function embClose() {
    if (embOv) embOv.remove();
    embOv = null;
  }
  function embFull(box) {
    const el = box && box.closest(".nb");
    if (!el || !el.dataset.src) return;
    embClose();
    const ov = (embOv = document.createElement("div"));
    ov.className = "nb-emb nb-embov";
    ov.innerHTML = `<div class="nb-eb"><span class="nb-fi">${I.embed}</span><span class="nb-fn">${esc(el.dataset.name || "HTML")}</span><button type="button" class="nb-ex" aria-label="Zatvori" title="Zatvori (Esc)">${I.shrink}</button></div><iframe class="nb-ef" sandbox="${EMB_SB}" title="${esc(el.dataset.name || "HTML")}"></iframe>`;
    ov.querySelector(".nb-ex").addEventListener("click", embClose);
    document.body.appendChild(ov);
    loadInto(ov.querySelector(".nb-ef"), el.dataset.src);
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && embOv) embClose();
  });
  addEventListener("hashchange", embClose);
  function codeText(t) {
    let s = "";
    const w = (x) => {
      for (const c of x.childNodes) {
        if (c.nodeType === 3) s += c.nodeValue;
        else if (c.nodeName === "BR") s += "\n";
        else if (c.nodeType === 1) {
          if (/^(DIV|P)$/.test(c.nodeName) && s && !s.endsWith("\n")) s += "\n";
          w(c);
        }
      }
    };
    w(t);
    return s.replace(/​/g, "");
  }
  function readBlock(el) {
    const t = el.dataset.t,
      b = { t };
    if (t === "tbl") return tbRead(el);
    if (LISTY.has(t)) b.l = lvl(el);
    const tt = tOf(el);
    if (tt)
      b.x =
        t === "code"
          ? codeText(tt).replace(/\n$/, "")
          : inlineMd(tt).replace(/\n+$/, "");
    if (t === "todo") b.c = el.dataset.c === "1";
    if (t === "ol" && el.dataset.n) b.n = +el.dataset.n;
    if (t === "callout") {
      b.v = el.dataset.v || "NOTE";
      b.i = el.dataset.i || "";
    }
    if (t === "code") b.lang = el.dataset.lang || "";
    if (t === "img" || t === "file" || t === "embed") {
      b.src = el.dataset.src || "";
      b.alt = el.dataset.alt || "";
      b.name = el.dataset.name || "";
    }
    if (t === "img") b.w = imgW(el.dataset.w);
    if (t === "draw") {
      b.src = el.dataset.src || "";
      b.scene = el.dataset.scene || "";
      b.w = imgW(el.dataset.w);
    }
    if (t === "page") {
      b.ref = el.dataset.ref;
      const n = noteOf(b.ref);
      b.name = n ? n.title || "Bez naslova" : el.dataset.name || "Stranica";
    }
    return b;
  }
  const serialize = () =>
    toMd(
      blocks()
        .filter((e) => !e.classList.contains("up"))
        .map(readBlock),
    );
  function paintPage(el) {
    const a = el.querySelector(".nb-page");
    if (!a) return;
    const n = noteOf(el.dataset.ref);
    a.classList.toggle("gone", !n);
    a.innerHTML = `<span class="pi">${n && n.icon ? emo(n.icon) : I.doc}</span><span class="pn">${esc(n ? n.title || "Bez naslova" : el.dataset.name || "Obrisana stranica")}</span>${n ? `<span class="pa">${I.open}</span>` : ""}`;
  }
  function paintRel(a) {
    const h = relIn(a.dataset.ref, a.dataset.name);
    a.classList.toggle("gone", !noteOf(a.dataset.ref));
    if (a._h !== h) a.innerHTML = a._h = h;
  }
  function renum() {
    let cnt = [],
      prevL = -1;
    for (const el of blocks()) {
      const t = el.dataset.t;
      if (!LISTY.has(t)) {
        cnt = [];
        prevL = -1;
        continue;
      }
      let l = lvl(el);
      if (l > prevL + 1) setLevel(el, (l = prevL + 1));
      cnt.length = l + 1;
      if (t === "ol") {
        /* zadati početni broj važi samo za prvu stavku niza */
        if (cnt[l] != null) delete el.dataset.n;
        cnt[l] = cnt[l] != null ? cnt[l] + 1 : olStart(+el.dataset.n);
        const m = el.querySelector(":scope > .nb-m");
        if (m) m.textContent = cnt[l] + ".";
      } else cnt[l] = null;
      prevL = l;
    }
  }
  const isEmpty = (t) =>
    !t || (!t.textContent.replace(/​/g, "") && !t.querySelector("img"));
  function tidy(t) {
    t.querySelectorAll("b,strong,i,em,s,del,strike,code,a,span,u,font").forEach(
      (e) => {
        if (!e.textContent && !e.querySelector("img,br")) e.remove();
      },
    );
    if (isEmpty(t)) t.replaceChildren();
    else if (
      t.lastChild &&
      t.lastChild.nodeName === "BR" &&
      t.dataset &&
      t.parentElement.dataset.t !== "code"
    )
      t.lastChild.remove();
  }
  function solo() {
    const bs = blocks();
    root.classList.toggle(
      "solo",
      bs.length === 1 && bs[0].dataset.t === "p" && isEmpty(tOf(bs[0])),
    );
  }
  function renderBlocks(md) {
    const bs = parseMd(md);
    if (!bs.length || !TEXTY.has(bs[bs.length - 1].t))
      bs.push({ t: "p", x: "" });
    clearSel();
    root.replaceChildren(...bs.map(make));
    renum();
    solo();
    if (isScript() && X.scriptRendered) X.scriptRendered();
  }

  /* ---------------- caret ---------------- */
  function lenOf(node) {
    let n = 0;
    const w = (x) => {
      for (const c of x.childNodes) {
        if (c.nodeType === 3) n += c.nodeValue.length;
        else if (c.nodeName === "BR" || c.nodeName === "IMG" || isRel(c))
          n += 1;
        else if (c.nodeType === 1) w(c);
      }
    };
    w(node);
    return n;
  }
  function caretOff(t) {
    const s = getSelection();
    if (!t || !s.rangeCount) return -1;
    const r = s.getRangeAt(0);
    if (!t.contains(r.startContainer)) return -1;
    const q = document.createRange();
    q.selectNodeContents(t);
    q.setEnd(r.startContainer, r.startOffset);
    return lenOf(q.cloneContents());
  }
  function pointAt(t, off) {
    let left = off,
      res = null;
    const w = (x) => {
      for (const c of x.childNodes) {
        if (res) return;
        if (c.nodeType === 3) {
          if (left <= c.nodeValue.length) {
            res = [c, left];
            return;
          }
          left -= c.nodeValue.length;
        } else if (c.nodeName === "BR" || c.nodeName === "IMG" || isRel(c)) {
          if (left === 0) {
            res = [c.parentNode, [...c.parentNode.childNodes].indexOf(c)];
            return;
          }
          left -= 1;
        } else if (c.nodeType === 1) w(c);
      }
    };
    if (off !== Infinity) w(t);
    return res || [t, t.childNodes.length];
  }
  function setCaret(t, off) {
    const p = pointAt(t, off == null ? Infinity : off);
    const r = document.createRange();
    r.setStart(p[0], p[1]);
    r.collapse(true);
    const s = getSelection();
    s.removeAllRanges();
    s.addRange(r);
  }
  function caretRect() {
    const s = getSelection();
    if (!s.rangeCount) return null;
    const r = s.getRangeAt(0).cloneRange();
    r.collapse(true);
    const rc = r.getClientRects()[0];
    if (rc && (rc.height || rc.width)) return rc;
    const n = r.startContainer,
      e = n.nodeType === 1 ? n : n.parentElement;
    const t = e && e.closest(".nb-t");
    if (!t) return e ? e.getBoundingClientRect() : null;
    const off = caretOff(t);
    const sp = document.createElement("span");
    sp.textContent = "​";
    r.insertNode(sp);
    const out = sp.getBoundingClientRect();
    sp.remove();
    setCaret(t, off);
    return out;
  }
  function keepVisible(t) {
    const r = caretRect() || t.getBoundingClientRect();
    const vv = window.visualViewport;
    const top = 90,
      bot = (vv ? vv.height : innerHeight) - (touch() ? 140 : 70);
    if (r.bottom > bot) scrollBy(0, r.bottom - bot);
    else if (r.top < top) scrollBy(0, r.top - top);
  }
  function focusBlock(el, off = Infinity) {
    const t = tOf(el);
    if (!t) {
      selectBlocks([el]);
      return;
    }
    clearSel();
    t.focus({ preventScroll: true });
    setCaret(t, off);
    keepVisible(t);
  }
  function sibText(el, d) {
    let n = d < 0 ? el.previousElementSibling : el.nextElementSibling;
    while (n && !(isNb(n) && tOf(n)))
      n = d < 0 ? n.previousElementSibling : n.nextElementSibling;
    return n;
  }
  /* sadržaj bez padding-a (blok koda ima unutrašnji razmak) */
  function textBox(t) {
    const r = t.getBoundingClientRect(),
      cs = getComputedStyle(t);
    return {
      top: r.top + parseFloat(cs.paddingTop),
      bottom: r.bottom - parseFloat(cs.paddingBottom),
      lh: parseFloat(cs.lineHeight) || 26,
    };
  }
  function lineEdge(t, up) {
    const r = caretRect();
    if (!r) return true;
    const b = textBox(t);
    return up ? r.top - b.top < b.lh * 0.7 : b.bottom - r.bottom < b.lh * 0.7;
  }
  function caretToX(el, x, top) {
    const t = tOf(el);
    el.scrollIntoView({ block: "nearest" });
    t.focus({ preventScroll: true });
    const b = textBox(t),
      half = Math.min(b.lh, b.bottom - b.top) / 2;
    const y = top ? b.top + half : b.bottom - half;
    let r = null;
    if (document.caretPositionFromPoint) {
      const p = document.caretPositionFromPoint(x, y);
      if (p && t.contains(p.offsetNode)) {
        r = document.createRange();
        r.setStart(p.offsetNode, p.offset);
      }
    } else if (document.caretRangeFromPoint) {
      const q = document.caretRangeFromPoint(x, y);
      if (q && t.contains(q.startContainer)) r = q;
    }
    if (r) {
      r.collapse(true);
      const s = getSelection();
      s.removeAllRanges();
      s.addRange(r);
    } else setCaret(t, top ? 0 : Infinity);
    clearSel();
    keepVisible(t);
  }
  function rangeAt(t, a, b) {
    const r = document.createRange(),
      p = pointAt(t, a),
      q = pointAt(t, b);
    r.setStart(p[0], p[1]);
    r.setEnd(q[0], q[1]);
    return r;
  }
  function textBefore(t) {
    const s = getSelection();
    if (!s.rangeCount) return "";
    const r = s.getRangeAt(0),
      q = document.createRange();
    q.selectNodeContents(t);
    q.setEnd(r.startContainer, r.startOffset);
    return q.toString();
  }

  /* ---------------- undo ---------------- */
  let undoS = [],
    redoS = [],
    typedAt = 0,
    typedIn = null;
  function caretPos() {
    const bs = blocks();
    if (sel.length) return { sel: sel.map((e) => bs.indexOf(e)) };
    const a = SP ? getSelection().anchorNode : document.activeElement,
      el = a && root.contains(a) && blockOf(a);
    if (!el) return null;
    const c = el.dataset.t === "tbl" && cellOf(a);
    if (c) {
      const p = cellRC(c);
      return {
        i: bs.indexOf(el),
        r: p.r,
        c: p.c,
        off: isTextCell(c) ? caretOff(c) : -1,
      };
    }
    return { i: bs.indexOf(el), off: caretOff(tOf(el)) };
  }
  function setPos(p) {
    if (!p) return;
    const bs = blocks();
    if (p.sel) {
      selectBlocks(p.sel.map((i) => bs[i]).filter(Boolean));
      return;
    }
    const el = bs[Math.max(0, Math.min(p.i, bs.length - 1))];
    if (
      el &&
      p.c != null &&
      el.dataset.t === "tbl" &&
      focusCell(el, p.r, p.c, p.off)
    )
      return;
    if (el) focusBlock(el, p.off < 0 ? Infinity : p.off);
  }
  /* tuđe izmene primenjene posle nekog undo koraka: [pre, posle]; undo ih ne briše */
  const rb = [];
  function rebased(s) {
    let md = s.md;
    for (let k = s.ri || 0; k < rb.length; k++)
      md = merge3(rb[k][0], md, rb[k][1], true);
    return md;
  }
  function pushUndo() {
    typedIn = null;
    const s = { md: serialize(), pos: caretPos(), ri: rb.length };
    if (undoS.length && rebased(undoS[undoS.length - 1]) === s.md) return;
    undoS.push(s);
    if (undoS.length > 150) undoS.shift();
    redoS = [];
  }
  function noteTyping(t) {
    const now = performance.now();
    if (now - typedAt > 1000 || typedIn !== t) {
      pushUndo();
      typedIn = t;
    }
    typedAt = now;
  }
  function restore(s) {
    patchBlocks(rebased(s));
    setPos(s.pos);
    changed();
  }
  function undo() {
    closeSlash();
    const now = serialize();
    let s = undoS.pop();
    while (s && rebased(s) === now) s = undoS.pop();
    if (!s) return;
    redoS.push({ md: now, pos: caretPos(), ri: rb.length });
    typedIn = null;
    restore(s);
  }
  function redo() {
    closeSlash();
    const s = redoS.pop();
    if (!s) return;
    undoS.push({ md: serialize(), pos: caretPos(), ri: rb.length });
    typedIn = null;
    restore(s);
  }

  /* ---------------- spajanje izmena (dvoje piše istu stranicu) ----------------
     Jedinica je blok, kao u Notionu: blok koji je menjao samo jedan ostaje njegov;
     ako su oba menjala isti blok, ostaju obe verzije (ništa se ne gubi). */
  const ukey = (b) => (b.l || 0) + "|" + toMd([b]);
  const umemo = new Map();
  function units(md) {
    let u = umemo.get(md);
    if (!u) {
      const bs = parseMd(md);
      u = { bs, ks: bs.map(ukey) };
      if (umemo.size > 40) umemo.delete(umemo.keys().next().value);
      umemo.set(md, u);
    }
    return u;
  }
  /* najduži zajednički podniz: za svaki a[i] indeks istog elementa u b ili -1 */
  function lcsMap(a, b) {
    const n = a.length,
      m = b.length,
      map = new Int32Array(n).fill(-1);
    let s = 0,
      ea = n,
      eb = m;
    while (s < n && s < m && a[s] === b[s]) map[s] = s++;
    while (ea > s && eb > s && a[ea - 1] === b[eb - 1]) map[--ea] = --eb;
    const N = ea - s,
      M = eb - s;
    if (!N || !M) return map;
    const W = M + 1,
      L = new Uint32Array((N + 1) * W);
    for (let i = N - 1; i >= 0; i--)
      for (let j = M - 1; j >= 0; j--)
        L[i * W + j] =
          a[s + i] === b[s + j]
            ? L[(i + 1) * W + j + 1] + 1
            : Math.max(L[(i + 1) * W + j], L[i * W + j + 1]);
    for (let i = 0, j = 0; i < N && j < M; )
      if (a[s + i] === b[s + j]) map[s + i++] = s + j++;
      else if (L[(i + 1) * W + j] >= L[i * W + j + 1]) i++;
      else j++;
    return map;
  }
  /* tri niza jedinica ({ bs: vrednosti, ks: ključevi }) spojena u jedan.
     both(b, o, t) = jedinica koju su menjala oba; pair(bs, os, ts) = { o, t, m } kada se u
     većem sukobu ista jedinica (tabela) ipak može spojiti, umesto da ostanu obe */
  function mergeSeq(B, O, T, oursWins, both, pair) {
    const mo = lcsMap(B.ks, O.ks),
      mt = lcsMap(B.ks, T.ks),
      out = [];
    const same = (x, y) =>
      x.length === y.length && x.every((k, i) => k === y[i]);
    let pb = 0,
      po = 0,
      pt = 0;
    const chunk = (eb, eo, et) => {
      const bk = B.ks.slice(pb, eb),
        ok = O.ks.slice(po, eo),
        tk = T.ks.slice(pt, et);
      if (same(ok, bk)) out.push(...T.bs.slice(pt, et));
      else if (same(tk, bk) || same(ok, tk)) out.push(...O.bs.slice(po, eo));
      else if (ok.length === bk.length && tk.length === bk.length)
        /* susedni blokovi: svaki je menjao svoj, spoji blok po blok */
        bk.forEach((k, i) => {
          if (ok[i] === k) out.push(T.bs[pt + i]);
          else if (tk[i] === k || tk[i] === ok[i]) out.push(O.bs[po + i]);
          else out.push(...both(B.bs[pb + i], O.bs[po + i], T.bs[pt + i]));
        });
      else {
        /* pravi sukob: naše, pa njihovi novi blokovi (ništa se ne gubi) */
        const os = O.bs.slice(po, eo),
          p = pair && pair(B.bs.slice(pb, eb), os, T.bs.slice(pt, et));
        out.push(...(p ? os.map((x) => (x === p.o ? p.m : x)) : os));
        if (!oursWins)
          tk.forEach(
            (k, i) =>
              ok.includes(k) ||
              bk.includes(k) ||
              (p && T.bs[pt + i] === p.t) ||
              out.push(T.bs[pt + i]),
          );
      }
    };
    for (let i = 0; i < B.ks.length; i++) {
      if (mo[i] < 0 || mt[i] < 0) continue;
      chunk(i, mo[i], mt[i]);
      out.push(O.bs[mo[i]]);
      pb = i + 1;
      po = mo[i] + 1;
      pt = mt[i] + 1;
    }
    chunk(B.ks.length, O.ks.length, T.ks.length);
    return out;
  }
  /* tabela koju su menjala oba: kolone po polju, redovi kao jedinice, a red koji su
     menjala oba ćelija po ćeliju; ista ćelija različito = naš red, pa i njihov */
  function tblMerge(b, o, t, oursWins) {
    if (![b, o, t].every((x) => x && x.t === "tbl")) return null;
    const n = b.cols.length;
    if (o.cols.length !== n || t.cols.length !== n) return null;
    const pick = (x, y, z) => (y !== x ? y : z);
    const optPick = (x, y, z) => {
      const m = {};
      for (const k of Object.keys({ ...x, ...y, ...z })) {
        const v = pick((x || {})[k], (y || {})[k], (z || {})[k]);
        if (v) m[k] = v;
      }
      return optMap(m);
    };
    const cols = b.cols.map((c, i) => {
      const p = o.cols[i],
        q = t.cols[i];
      return {
        n: pick(c.n, p.n, q.n),
        k: pick(c.k, p.k, q.k),
        w: pick(c.w, p.w, q.w),
        a: pick(c.a, p.a, q.a),
        c: pick(c.c, p.c, q.c),
        o: optPick(c.o, p.o, q.o),
        f: pick(c.f || "", p.f || "", q.f || ""),
      };
    });
    const U = (x) => ({
      bs: x.rows,
      ks: x.rows.map((r) => r.join("\u0001") + "\u0002" + rowTintKey(r)),
    });
    const rows = mergeSeq(U(b), U(o), U(t), oursWins, (rb, ro, rt) => {
      let clash = false;
      const m = ro.map((x, i) => {
        if (x === rb[i]) return rt[i];
        if (rt[i] !== rb[i] && rt[i] !== x) clash = true;
        return x;
      });
      const own = (r, i) => (r.tc && r.tc[i]) || "",
        tc = ro.map((_, i) => pick(own(rb, i), own(ro, i), own(rt, i))),
        bg = pick(rb.bg || "", ro.bg || "", rt.bg || "");
      if (bg) m.bg = bg;
      if (tc.some(Boolean)) m.tc = tc;
      return clash && !oursWins ? [m, rt] : [m];
    });
    return { t: "tbl", cols, rows };
  }
  /* base -> ours i base -> theirs spojeni u jedno; oursWins: u sukobu samo naše */
  function merge3(base, ours, theirs, oursWins) {
    if (ours === theirs || theirs === base) return ours;
    if (ours === base) return theirs;
    const one = (a) => {
      const x = a.filter((y) => y.t === "tbl");
      return x.length === 1 ? x[0] : null;
    };
    return toMd(
      mergeSeq(
        units(base),
        units(ours),
        units(theirs),
        oursWins,
        (b, o, t) => {
          const m = tblMerge(b, o, t, oursWins);
          return m ? [m] : oursWins ? [o] : [o, t];
        },
        (bs, os, ts) => {
          const o = one(os),
            t = one(ts),
            m = tblMerge(one(bs), o, t, oursWins);
          return m ? { o, t, m } : null;
        },
      ),
    );
  }
  /* DOM na novi md, ali menja samo blokove koji su drugačiji: kursor, fokus i
     IME u bloku koji niko drugi nije dirao ostaju netaknuti (nema treptanja) */
  function patchBlocks(md) {
    const bs = parseMd(md);
    if (!bs.length || !TEXTY.has(bs[bs.length - 1].t))
      bs.push({ t: "p", x: "" });
    const els = blocks(),
      pos = caretPos(),
      act = pos && !pos.sel ? els[pos.i] : null,
      map = lcsMap(
        bs.map(ukey),
        els.map((el) => ukey(readBlock(el))),
      ),
      keep = new Set(),
      list = bs.map((b, i) => {
        if (map[i] < 0) return null;
        keep.add(els[map[i]]);
        return els[map[i]];
      });
    /* izmenjena tabela se menja na mestu (samo drugačije ćelije), da kursor ostane u ćeliji */
    for (let i = 0, lo = -1; i < bs.length; i++) {
      if (list[i]) {
        lo = map[i];
        continue;
      }
      let hi = els.length;
      for (let k = i + 1; k < bs.length; k++)
        if (map[k] >= 0) {
          hi = map[k];
          break;
        }
      const old =
        bs[i].t === "tbl" &&
        els
          .slice(lo + 1, hi)
          .find((e) => e.dataset.t === "tbl" && !keep.has(e));
      if (old) {
        tbPatch(old, bs[i]);
        keep.add(old);
        list[i] = old;
      } else list[i] = make(bs[i]);
    }
    if (sel.some((e) => !keep.has(e))) clearSel();
    els.forEach((el) => keep.has(el) || el.remove());
    let prev = null;
    for (const el of list) {
      const want = prev ? prev.nextSibling : root.firstChild;
      if (el !== want) root.insertBefore(el, want);
      prev = el;
    }
    renum();
    solo();
    if (isScript() && X.scriptRendered) X.scriptRendered();
    if (act && !keep.has(act)) setPos(pos);
  }

  /* ---------------- page state + saving ----------------
     D = stanje dokumenta u bazi: srv je poslednji md za koji znamo da je upisan,
     srvRaw sirovo polje md (po njemu baza proverava da niko nije upisao između).
     domBase = md od kog se razlikuju još neposlate izmene u editoru.
     Snimanje ide redom (jedno po jedno). Ako je neko u međuvremenu upisao,
     baza vrati njegovu verziju, izmene se spoje (merge3) i šalje se ponovo. */
  let cur = null,
    rendered = null,
    saveT = 0,
    D = null,
    domBase = "",
    lastTitle = "",
    dirtyMd = false,
    dirtyTitle = false,
    pendingRemote = false,
    composing = false,
    kidsT = 0;
  const DOCS = new Map(), // "col/id" -> D
    queued = new Map(); // D -> posao koji još nije poslat
  let running = null,
    saveFail = false,
    jobs = 0,
    chain = Promise.resolve();
  function setSave(busy, sel = H.save) {
    const el = $(sel);
    el.classList.toggle("busy", busy);
    el.querySelector("span").textContent = busy ? "Čuvam…" : "Sačuvano";
  }
  const docMdOf = (col, p) => (col === "scripts" ? scriptMd(p) : p.md || "");
  const rawOf = (p) => (typeof p.md === "string" ? p.md : "");
  const docMd = (p) => docMdOf(H.col, p);
  const busyD = (d) => !!d && (running === d || queued.has(d));
  function docState(p) {
    const k = H.col + "/" + cur;
    let d = DOCS.get(k);
    if (!d) DOCS.set(k, (d = { col: H.col, id: cur }));
    if (!busyD(d)) {
      d.srv = docMd(p);
      d.srvRaw = rawOf(p);
    }
    return d;
  }
  function changed() {
    dirtyMd = true;
    setSave(true);
    clearTimeout(saveT);
    saveT = setTimeout(flush, 700);
    solo();
    clearTimeout(kidsT);
    kidsT = setTimeout(paintKids, 300);
  }
  function titleChanged() {
    dirtyTitle = true;
    setSave(true);
    clearTimeout(saveT);
    saveT = setTimeout(flush, 700);
  }
  /* uzima izmene iz editora odmah (sinhrono), a šalje ih kad dođu na red */
  function flush() {
    clearTimeout(saveT);
    if (!cur || rendered !== cur || !D) return chain;
    const job = { D, from: domBase, sv: H.save };
    if (dirtyMd) {
      dirtyMd = false;
      const md = serialize();
      if (md !== domBase) job.md = domBase = md;
    }
    if (dirtyTitle) {
      dirtyTitle = false;
      const t = titleEl.textContent.replace(/\s+/g, " ").trim();
      if (t !== lastTitle) job.title = lastTitle = t;
    }
    if (job.md === undefined && job.title === undefined) {
      if (!busyD(D)) setSave(false, job.sv);
      return chain;
    }
    const q = queued.get(D);
    if (q) {
      /* novi snimak obuhvata i prethodni neposlati; from ostaje stari */
      if (job.md !== undefined) q.md = job.md;
      if (job.title !== undefined) q.title = job.title;
      return chain;
    }
    queued.set(D, job);
    jobs++;
    chain = chain
      .then(() => {
        queued.delete(D);
        return send(job);
      })
      .finally(() => {
        jobs--;
        afterSend(job);
      });
    return chain;
  }
  async function retry(fn) {
    for (let n = 0; ; n++)
      try {
        return await fn();
      } catch (e) {
        if (n >= 3 || !e || e.code !== "failed") throw e;
        await new Promise((r) => setTimeout(r, 800 * 2 ** n));
      }
  }
  async function send(job) {
    const d = job.D;
    running = d;
    try {
      const patch = {
        updatedAt: Date.now(),
        updatedBy: me() ? me().id : null,
      };
      if (job.title !== undefined) patch.title = job.title;
      let md = job.md;
      if (md !== undefined && job.from !== d.srv)
        md = merge3(job.from, md, d.srv);
      if (md === undefined || md === d.srv) {
        if (job.title !== undefined)
          await retry(() => api.upd(d.col, d.id, patch));
        return;
      }
      for (let n = 0; ; n++) {
        patch.md = md;
        if (d.col === "scripts") {
          patch.body = htmlOf(md);
          patch.mdSig = sig(patch.body);
        }
        const r = await retry(() =>
          api.updIf(d.col, d.id, patch, "md", d.srvRaw),
        );
        if (!r.conflict) {
          d.srv = d.srvRaw = md;
          return;
        }
        if (n >= 5) throw { code: "failed" };
        const remote = docMdOf(d.col, r.data || {});
        md = merge3(d.srv, md, remote);
        d.srv = remote;
        d.srvRaw = rawOf(r.data || {});
        if (md === remote) return;
      }
    } catch (e) {
      job.err = e;
    } finally {
      running = null;
    }
  }
  function afterSend(job) {
    const d = job.D,
      isCur = d === D && rendered === cur;
    if (job.err) {
      if (job.err.code === "not_found") return;
      if (!saveFail) toast(errMsg(job.err));
      saveFail = true;
      /* izmene su i dalje u editoru: vrati ih u neposlate i probaj ponovo */
      const q = queued.get(d);
      if (q) {
        q.from = job.from;
        if (q.md === undefined) q.md = job.md;
        if (q.title === undefined) q.title = job.title;
      } else if (isCur && job.md !== undefined && domBase === job.md) {
        domBase = job.from;
        dirtyMd = true;
      }
      if (isCur && job.title !== undefined && !q) {
        lastTitle = null;
        dirtyTitle = true;
      }
      if (isCur) {
        clearTimeout(saveT);
        saveT = setTimeout(flush, 5000);
      }
      return;
    }
    saveFail = false;
    if (!isCur) return;
    if (!busyD(d) && !dirtyMd && !dirtyTitle) setSave(false, job.sv);
    if (!busyD(d)) {
      const p = docOf(cur);
      if (p && !isScript()) head(p);
      if (p && docMd(p) !== domBase) {
        if (busy()) pendingRemote = true;
        else applyRemote();
      }
    }
  }
  const busy = () =>
    composing ||
    !!DG ||
    !!DR ||
    !!root.querySelector(".nb.up, .tb-di, .tb.rz") ||
    !!SL ||
    !EP.hidden ||
    !!menuEl ||
    !LK.hidden;
  /* tuđa izmena: spoji je sa onim što je u editoru, a još nije poslato */
  function applyRemote() {
    pendingRemote = false;
    const p = docOf(cur);
    if (!p || !D || rendered !== cur) return;
    if (busyD(D)) {
      pendingRemote = true;
      return;
    }
    const remote = docMd(p);
    if (remote !== domBase) {
      const local = serialize(),
        merged = merge3(domBase, local, remote);
      if (merged !== local) {
        patchBlocks(merged);
        rb.push([local, merged]);
      }
      domBase = D.srv = remote;
      D.srvRaw = rawOf(p);
      if (merged !== remote) {
        dirtyMd = true;
        setSave(true);
        clearTimeout(saveT);
        saveT = setTimeout(flush, 700);
      }
    }
    paintKids();
  }

  /* ---------------- hub (General) ---------------- */
  let hq = "";
  const homeOf = (sp) => (sp ? "mg-" + sp : "general");
  const byUpd = (a, b) =>
    (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0);
  const who = (id) => X.TEAM.find((u) => u.id === id);
  function rel(ts) {
    const d = Date.now() - ts;
    if (d < 60e3) return "upravo";
    if (d < 3600e3) return "pre " + Math.floor(d / 60e3) + " min";
    if (d < 86400e3 && new Date(ts).getDate() === new Date().getDate())
      return "pre " + Math.floor(d / 3600e3) + " h";
    const y = new Date();
    y.setDate(y.getDate() - 1);
    if (new Date(ts).toDateString() === y.toDateString()) return "juče";
    return X.fmtEdit.format(new Date(ts));
  }
  /* ---------------- folderi ----------------
     noteFolders/{id} = {name, color, order, spaceId, createdAt, createdBy}; glavna stranica
     ima folderId. Podstranica, privatna stranica i stranica čiji folder više ne postoji su
     van foldera (brisanje foldera ne dira stranice, pa ih „Poništi“ vraća baš u taj folder). */
  const foldersOf = (sp) =>
    (S.noteFolders || [])
      .filter((f) => (f.spaceId || null) === (sp || null))
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  const folderOf = (fid, sp) =>
    (fid && foldersOf(sp).find((f) => f.id === fid)) || null;
  const fidOf = (n) =>
    n && !n.parentId && !n.privateTo && folderOf(n.folderId, spaceOf(n))
      ? n.folderId
      : null;
  const fcol = (F) => (F && F.color) || X.foldCols()[0];
  const pagesWord = (n) => plural(n, "stranica", "stranice", "stranica");
  /* glavna stranica (koren) kojoj pripada n */
  function rootOf(n) {
    let q = n,
      g = 0;
    while (q.parentId && noteOf(q.parentId) && g++ < 20) q = noteOf(q.parentId);
    return q;
  }
  /* hub u koji se stranica vraća: General, General projekta ili folder u njemu */
  function hubOf(n) {
    const f = fidOf(rootOf(n));
    return homeOf(spaceOf(n)) + (f ? "~" + f : "");
  }
  function pathOf(n) {
    const out = [];
    let q = n.parentId && noteOf(n.parentId),
      g = 0;
    while (q && g++ < 20) {
      out.unshift(q.title || "Bez naslova");
      q = q.parentId && noteOf(q.parentId);
    }
    const F = folderOf(fidOf(rootOf(n)), spaceOf(n));
    if (F) out.unshift(F.name || "Folder");
    return out.join(" / ");
  }
  function tile(n, style, withPath) {
    const k = kidsOf(n.id).length;
    const u = who(n.updatedBy || n.createdBy);
    const ts = n.updatedAt || n.createdAt;
    const ex = plainOf(n.md).slice(0, 140);
    const path = withPath ? pathOf(n) : "";
    /* mišem se glavna stranica prevlači na folder */
    const drag = !touch() && !n.parentId && !n.privateTo;
    return `<div class="cptile gtile${S.fresh.has(n.id) ? " new" : ""}" role="button" tabindex="0" data-go="g-${esc(n.id)}" data-gid="${esc(n.id)}"${drag ? ' draggable="true"' : ""} style="${style}">
      <span class="ci">${n.icon ? emo(n.icon) : I.doc}</span>${n.privateTo ? `<span class="glock" title="Samo ti vidiš ovu stranicu">${I.lock}</span>` : ""}
      <div class="gt-b">${path ? `<div class="gpath">${esc(path)}</div>` : ""}<h3>${esc(n.title || "Bez naslova")}</h3>${ex ? `<p class="gex">${esc(ex)}</p>` : ""}
      <div class="meta2">${u ? `<img src="${esc(X.IMG[u.id])}" alt="" draggable="false">` : ""}<span>${ts ? esc(rel(ts)) : ""}${k ? ` · ${k} ${plural(k, "podstranica", "podstranice", "podstranica")}` : ""}</span></div></div>
      ${PUP.has(n.id) ? `<span class="gf-up" style="--p:${PUP.get(n.id).p}"><i></i><b>${Math.round(PUP.get(n.id).p * 100)}%</b></span>` : ""}
    </div>`;
  }
  /* red foldera iznad stranica: fascikla iz koje vire listovi poslednjih stranica */
  function folderRow(FS, roots, anim) {
    const home = homeOf(hubSpace);
    return `<div class="fcfolders${anim ? " enter" : ""}">${FS.map((F, i) => {
      const L = roots.filter((n) => fidOf(n) === F.id),
        FL = filesIn(hubSpace, F.id),
        th = [
          ...L.map((n) => ({ n, t: n.updatedAt || n.createdAt || 0 })),
          ...FL.map((x) => ({ x, t: x.createdAt || 0 })),
        ]
          .sort((a, b) => b.t - a.t)
          .slice(0, 3);
      const cnt =
        [
          L.length ? L.length + " " + pagesWord(L.length) : "",
          FL.length ? FL.length + " " + filesWord(FL.length) : "",
        ]
          .filter(Boolean)
          .join(" · ") || "prazan";
      return `<button class="fcf" type="button" data-go="${esc(home + "~" + F.id)}" data-gf="${esc(F.id)}" style="--fc:${esc(fcol(F))};--i:${i}" aria-label="Folder ${esc(F.name || "Folder")}, ${esc(cnt)}">
      <span class="fcf-back" aria-hidden="true"></span>
      <span class="fcf-th" aria-hidden="true">${th
        .map(({ n, x }, k) => {
          const st = `--k:${k};--n:${th.length}`;
          if (n)
            return `<span class="gsh" style="${st}"><span class="gsh-i">${n.icon ? emo(n.icon) : I.doc}</span><b>${esc(n.title || "Bez naslova")}</b><i></i><i></i><i></i></span>`;
          const src = x.thumb || (fkind(x) === "img" ? x.url : "");
          return src
            ? `<img class="gsh-ph" src="${esc(src)}" alt="" loading="lazy" decoding="async" draggable="false" style="${st}">`
            : `<span class="gsh gsh-f" style="${st};--fx:${fcolor(x)}"><span class="gsh-i">${FI.doc}</span><b>${esc(x.name || "Fajl")}</b><em>${esc(fext(x.name))}</em></span>`;
        })
        .join("")}</span>
      <span class="fcf-front"><span class="fcf-tx"><span class="fcf-n">${esc(F.name || "Folder")}</span><span class="fcf-c">${esc(cnt)}</span></span></span>
    </button>`;
    }).join("")}</div>`;
  }
  function folderHead(F, n, anim) {
    return `<div class="fcfh gfh${anim ? " enter" : ""}" style="--fc:${esc(fcol(F))}">
      <button class="fcfh-up" type="button" data-go="${esc(homeOf(hubSpace))}" data-gf-up title="Nazad na sve stranice · prevuci stranicu ovde da je izvadiš iz foldera">${SV('<path d="M19 12H5M11 18l-6-6 6-6"/>', 2.2)}<span>Sve stranice</span></button>
      <span class="fcfh-sl" aria-hidden="true">/</span>
      <span class="fcfh-ic" aria-hidden="true">${I.fold}</span>
      <h2 class="fcfh-n">${esc(F.name || "Folder")}</h2>
      <span class="fcfh-c">${typeof n === "string" ? n : n + " " + pagesWord(n)}</span>
      <button class="fcfh-ed" type="button" data-gf-edit="${esc(F.id)}" aria-label="Uredi folder" title="Naziv, boja, brisanje">${SV('<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>', 2)}<span>Uredi</span></button>
    </div>`;
  }
  let hubHtml = "";
  function hub(anim, space, fid) {
    const box = $("#gpages");
    if (!box) return;
    if (space !== undefined && (space || null) !== hubSpace) {
      hubSpace = space || null;
      hq = "";
      $("#gq").value = "";
    }
    if (fid !== undefined) hubFid = fid || null;
    if (!S.ready) {
      box.innerHTML = hubHtml = "";
      return;
    }
    const F = folderOf(hubFid, hubSpace),
      FS = F ? [] : foldersOf(hubSpace);
    const f = fold(hq.trim());
    const mine = notes().filter((n) => spaceOf(n) === hubSpace),
      roots = kidsOf(null).filter((n) => !n.privateTo);
    const list = f
      ? mine
          .filter(
            (n) => fold(n.title).includes(f) || fold(plainOf(n.md)).includes(f),
          )
          .sort(byUpd)
      : roots.filter((n) => fidOf(n) === (F ? F.id : null));
    /* privatne stranice (privateTo) su u svojoj sekciji; tuđe baza ni ne šalje */
    const own = f || F ? [] : kidsOf(null).filter((n) => n.privateTo);
    const d = (i) =>
      anim ? `animation-delay:${adl(0.16 + i * 0.05)}s` : "animation:none";
    const all = mine.filter((n) => !n.privateTo).length,
      sec = anim ? "" : "animation:none",
      row = f || !FS.length ? "" : folderRow(FS, roots, anim);
    /* fajlovi: u otvorenom folderu njegovi, inače oni van foldera; pretraga traži po imenu */
    const fl = f
        ? allFiles().filter(
            (x) => (x.spaceId || null) === hubSpace && fold(x.name).includes(f),
          )
        : filesIn(hubSpace, F ? F.id : null),
      ups = f ? [] : upIn(hubSpace, F ? F.id : null),
      nAll = allFiles().filter((x) => (x.spaceId || null) === hubSpace).length;
    /* stranice i fajlovi u jednoj mreži: redom kako su nastali (nova stavka je na kraju,
       kod pločica za dodavanje); pretraga: najnovije izmenjeno prvo */
    const items = f
      ? [
          ...list.map((n) => ({ n, t: n.updatedAt || n.createdAt || 0 })),
          ...fl.map((x) => ({ x, t: x.updatedAt || x.createdAt || 0 })),
        ].sort((a, b) => b.t - a.t)
      : [
          ...list.map((n) => ({ n, t: n.order || n.createdAt || 0 })),
          ...fl.map((x) => ({ x, t: x.order || x.createdAt || 0 })),
        ].sort((a, b) => a.t - b.t);
    const nI = items.length + ups.length;
    if (S.ready) loadUsage();
    const cnt = (np, nf) =>
      [np ? np + " " + pagesWord(np) : "", nf ? nf + " " + filesWord(nf) : ""]
        .filter(Boolean)
        .join(" · ");
    const html =
      (F && !f
        ? folderHead(F, cnt(list.length, fl.length) || "prazan", anim)
        : `<div class="gsec" style="${sec}"><h2>Stranice i fajlovi</h2><span>${all || nAll ? cnt(all, nAll) : hubSpace ? "Marketing plan, optimizacije, CRO fajlovi" : "Beleške, procesi, ideje, fajlovi"}</span></div>`) +
      row +
      (row
        ? `<div class="fcsec gfsec" style="${sec}"><span>Van foldera</span><i></i></div>`
        : "") +
      (f && !items.length
        ? `<div class="state">Nema stranica ni fajlova za „${esc(hq.trim())}“.</div>`
        : `<div class="cpgrid gpgrid">${items
            .map((it, i) =>
              it.n
                ? tile(it.n, d(i + 1), !!f)
                : fileTile(it.x, d(Math.min(i + 1, 14))),
            )
            .join(
              "",
            )}${ups.map((u, i) => fileTile(u, d(Math.min(items.length + i + 1, 14)), u)).join("")}${f ? "" : addTiles(d(Math.min(nI + 1, 15)), F)}</div>`) +
      (F && !f && !nI
        ? `<p class="gf-empty" style="${sec}">Folder je prazan. ${touch() ? "Dodaj fajl ili sliku, napravi stranicu ovde ili je premesti iz menija stranice (⋯)." : "Prevuci fajlove ili slike na ekran, napravi stranicu ili premesti postojeću: prevuci je na folder ili izaberi folder u meniju stranice (⋯)."}</p>`
        : "") +
      (f || F
        ? ""
        : `<div class="gsec gsec-me" style="${sec}"><h2>Samo za tebe</h2><span>${I.lock}Niko drugi ne vidi ove stranice</span></div>` +
          `<div class="cpgrid gpgrid">${own.map((n, i) => tile(n, d(nI + i + 2))).join("")}<button class="cptile add" data-gnew="me" style="${d(nI + own.length + 2)}"><span class="ci">${I.lock}</span>Privatna stranica</button></div>`) +
      (usage && !f
        ? `<div class="gstore" style="${sec}" title="Fajlovi u General-u, Final Creatives i slike u stranicama"><span class="gst-b"><i style="width:${Math.min(100, Math.max(0.5, (usage.total / usage.quota) * 100)).toFixed(1)}%"></i></span><span>Skladište: <b>${esc(fsize(usage.total))}</b> od ${esc(fsize(usage.quota))}</span></div>`
        : "");
    /* isti sadržaj se ne crta ponovo: hover, prevlačenje i animacija foldera ostaju */
    if (html === hubHtml && box.firstChild) return;
    box.innerHTML = hubHtml = html;
  }
  /* priv: nova stranica u "Samo za tebe"; podstranica nasleđuje privatnost roditelja;
     glavna stranica napravljena u otvorenom folderu ide u taj folder */
  async function newPage(parentId, priv) {
    const now = Date.now(),
      par = parentId && noteOf(parentId),
      fid = !par && !priv && folderOf(hubFid, hubSpace) ? hubFid : null;
    const id = await api.add("notes", {
      title: "",
      icon: "",
      md: "",
      parentId: parentId || null,
      spaceId: parentId ? spaceOf(par) : hubSpace,
      privateTo: par ? par.privateTo || null : priv && me() ? me().id : null,
      ...(fid ? { folderId: fid } : {}),
      order: now,
      createdAt: now,
      createdBy: me() ? me().id : null,
      updatedAt: now,
      updatedBy: me() ? me().id : null,
    });
    X.markFresh(id);
    return id;
  }
  async function createAndOpen(parentId, priv) {
    try {
      const id = await newPage(parentId, priv);
      X.nav("g-" + id);
      setTimeout(() => titleEl.focus(), 120);
    } catch (e) {
      toast(errMsg(e));
    }
  }

  /* ---------------- page screen ---------------- */
  let backTo = "general";
  function head(p) {
    const par = p.parentId && noteOf(p.parentId);
    const home = homeOf(spaceOf(p)),
      homeLbl = X.spaceLabel(spaceOf(p));
    const chain = [];
    let q = par,
      g = 0;
    while (q && g++ < 20) {
      chain.unshift(q);
      q = q.parentId && noteOf(q.parentId);
    }
    /* glavna stranica u folderu: folder je u putanji, a „nazad“ vodi u njega */
    const F = folderOf(fidOf(chain[0] || p), spaceOf(p)),
      fhome = F ? home + "~" + F.id : home;
    backTo = par ? "g-" + par.id : fhome;
    $("#gpBackLbl").textContent = par
      ? par.title || "Bez naslova"
      : F
        ? F.name || "Folder"
        : homeLbl;
    const cr = $("#gpCrumbs");
    cr.hidden = !chain.length && !F;
    cr.innerHTML =
      chain.length || F
        ? `<button type="button" data-go="${esc(home)}">${esc(homeLbl)}</button>` +
          (F
            ? `<i aria-hidden="true">/</i><button type="button" class="gp-cf" data-go="${esc(fhome)}" style="--fc:${esc(fcol(F))}">${I.fold}<span>${esc(F.name || "Folder")}</span></button>`
            : "") +
          chain
            .map(
              (n) =>
                `<i aria-hidden="true">/</i><button type="button" data-go="g-${esc(n.id)}">${n.icon ? emo(n.icon) : ""}<span>${esc(n.title || "Bez naslova")}</span></button>`,
            )
            .join("")
        : "";
    const ic = $("#gpIcon");
    ic.hidden = !p.icon;
    if (p.icon && ic.dataset.ch !== p.icon) {
      ic.innerHTML = emo(p.icon);
      ic.dataset.ch = p.icon;
    }
    $("#gpAddIcon").hidden = !!p.icon;
    const u = who(p.updatedBy || p.createdBy),
      ts = p.updatedAt || p.createdAt;
    $("#gpMeta").innerHTML =
      (ts
        ? `${u ? `<img src="${esc(X.IMG[u.id])}" alt="">` : ""}<span>${u ? "Izmenio " + esc(u.name) + " · " : ""}${esc(rel(ts))}</span>`
        : "") +
      (p.privateTo
        ? `<span class="gp-priv">${I.lock}Samo ti vidiš ovu stranicu</span>`
        : "");
  }
  /* md za prikaz: ako je stranica i dalje u redu za slanje, njen poslednji snimak */
  function startMd(p) {
    D = docState(p);
    const q = queued.get(D);
    return q && q.md !== undefined ? q.md : docMd(p);
  }
  function paint() {
    const p = docOf(cur),
      ok = S.ready && !!p;
    if (isScript()) {
      /* naslov, polja i stanje "skripta ne postoji" crta app.js */
      rendered = null;
      if (!ok) return;
      domBase = startMd(p);
      dirtyMd = pendingRemote = false;
      clearTimeout(saveT);
      renderBlocks(domBase);
      rendered = cur;
      return;
    }
    $("#gpMain").hidden = !ok;
    $("#gpState").hidden = ok;
    if (!ok) {
      rendered = null;
      $("#gpBackLbl").textContent = "General";
      backTo = "general";
      $("#gpState").innerHTML = S.ready
        ? `<b>Stranica ne postoji</b>Možda je obrisana.<button class="pill" data-go="general">Nazad na General</button>`
        : "Učitavam…";
      return;
    }
    head(p);
    titleEl.textContent = p.title || "";
    lastTitle = p.title || "";
    domBase = startMd(p);
    dirtyMd = dirtyTitle = pendingRemote = false;
    clearTimeout(saveT);
    setSave(busyD(D));
    renderBlocks(domBase);
    rendered = cur;
    paintKids();
    here();
    [$("#gpHead"), root].forEach((el) => {
      el.style.animation = "none";
      el.offsetHeight;
      el.style.animation = "";
    });
  }
  /* ---------------- ko je još na ovoj stranici (Realtime Presence) ---------------- */
  let hereMap = {},
    hereMe = null;
  function here() {
    if (!window.OS || !OS.here) return;
    OS.here(rendered ? H.col + "/" + rendered : null);
    paintHere();
  }
  function paintHere() {
    const box = $("#gpHere");
    if (!box) return;
    const at = rendered && !isScript() ? "notes/" + rendered : null,
      ppl = at
        ? Object.keys(hereMap)
            .filter((s) => s !== hereMe && hereMap[s].includes(at))
            .map(who)
            .filter(Boolean)
        : [];
    box.hidden = !ppl.length;
    box.innerHTML = ppl.length
      ? ppl
          .map(
            (u) =>
              `<img src="${esc(X.IMG[u.id])}" alt="" title="${esc(u.name)} je na ovoj stranici">`,
          )
          .join("") +
        `<span>${ppl.length === 1 ? esc(ppl[0].name) + " je ovde" : ppl.length + " osobe su ovde"}</span>`
      : "";
  }
  if (window.OS && OS.onHere)
    OS.onHere((m, slug) => {
      hereMap = m;
      hereMe = slug;
      paintHere();
    });
  function paintKids() {
    const box = $("#gpKids");
    if (!cur || isScript()) return;
    const linked = new Set(
      blocks()
        .filter((b) => b.dataset.t === "page")
        .map((b) => b.dataset.ref),
    );
    const ks = kidsOf(cur).filter((n) => !linked.has(n.id));
    box.hidden = !ks.length;
    box.innerHTML = ks.length
      ? `<div class="gk-h">Podstranice</div>` +
        ks
          .map(
            (n) =>
              `<button type="button" class="gk" data-go="g-${esc(n.id)}"><span class="pi">${n.icon ? emo(n.icon) : I.doc}</span><span class="pn">${esc(n.title || "Bez naslova")}</span></button>`,
          )
          .join("")
      : "";
  }
  /* kind: "page" (General, #gp) ili "script" (#ed) */
  function open(id, kind = "page") {
    const h = HOSTS[kind];
    if (H === h && cur === id && rendered === id) {
      sync();
      return;
    }
    if (cur && (cur !== id || H !== h)) flush();
    if (cur !== id || H !== h) {
      undoS = [];
      redoS = [];
      rb.length = 0;
    }
    closeAll();
    clearSel();
    H = h;
    root = h.root;
    titleEl = h.title;
    cur = id;
    paint();
  }
  function sync() {
    if (!cur || !live()) return;
    const p = docOf(cur);
    if (!S.ready || !p || rendered !== cur) {
      paint();
      return;
    }
    if (!isScript()) {
      head(p);
      if (
        !dirtyTitle &&
        document.activeElement !== titleEl &&
        titleEl.textContent !== (p.title || "")
      ) {
        titleEl.textContent = p.title || "";
        lastTitle = p.title || "";
      }
    }
    if (docMd(p) !== domBase) {
      if (busy() || busyD(D)) pendingRemote = true;
      else applyRemote();
    }
    blocks()
      .filter((b) => b.dataset.t === "page")
      .forEach(paintPage);
    root.querySelectorAll(".nb-rel").forEach(paintRel);
    paintKids();
  }
  function leave(h) {
    if (typeof closeFv === "function" && !/^(general|mg-)/.test(h || ""))
      closeFv();
    if (!cur || h === H.hash + cur) return;
    flush();
    closeAll();
    clearSel();
    rendered = null;
    here();
  }
  function closeAll() {
    closeSlash();
    closePicker();
    closeMenu();
    closeLink();
    fbHide();
    MB.hidden = true;
  }
  async function delPage(id) {
    const p = noteOf(id);
    if (!p) return;
    const ids = [id];
    for (let k = 0; k < ids.length; k++)
      kidsOf(ids[k]).forEach((n) => ids.push(n.id));
    const docs = ids
      .map(noteOf)
      .filter(Boolean)
      .map(({ id, ...data }) => ({
        id,
        data: JSON.parse(JSON.stringify(data)),
      }));
    const par = p.parentId && noteOf(p.parentId),
      back = par ? "g-" + par.id : hubOf(p);
    let parMd = null,
      newParMd = null;
    if (par && String(par.md || "").includes("(#g-" + id + ")")) {
      parMd = par.md;
      newParMd = toMd(
        parseMd(par.md).filter((b) => !(b.t === "page" && b.ref === id)),
      );
    }
    if (cur === id) {
      clearTimeout(saveT);
      dirtyMd = dirtyTitle = false;
      rendered = null;
    }
    try {
      for (const d of docs) await api.del("notes", d.id);
      if (parMd !== null) await api.upd("notes", par.id, { md: newParMd });
      X.nav(back);
      const more = docs.length - 1;
      toast(
        `Obrisano: ${p.title || "Bez naslova"}${more ? ` (+${more} ${plural(more, "podstranica", "podstranice", "podstranica")})` : ""}`,
        async () => {
          try {
            for (const d of docs) await api.set("notes", d.id, d.data);
            if (parMd !== null) await api.upd("notes", par.id, { md: parMd });
            X.refresh();
          } catch (e) {
            toast(errMsg(e));
          }
        },
      );
    } catch (e) {
      toast(errMsg(e));
    }
  }
  const pageMd = () => {
    const t = titleEl.textContent.trim();
    return (t ? "# " + t + "\n\n" : "") + relFresh(serialize());
  };
  async function copyText(s, msg) {
    try {
      await navigator.clipboard.writeText(s);
      toast(msg || "Kopirano");
    } catch (e) {
      toast("Kopiranje nije uspelo");
    }
  }
  function download() {
    const name =
      fold(titleEl.textContent.trim() || "stranica")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "stranica";
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob([pageMd()], { type: "text/markdown;charset=utf-8" }),
    );
    a.download = name + ".md";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 0);
  }

  /* ---------------- block operations ---------------- */
  function convert(el, t, extra = {}) {
    const b = readBlock(el),
      tt = tOf(el),
      off = tt && tt.contains(document.activeElement) ? caretOff(tt) : -1;
    let x = b.x || "";
    if (t === "code" && b.t !== "code")
      x = tt ? tt.textContent.replace(/​/g, "") : "";
    if (b.t === "code" && t !== "code") x = escText(x);
    const nb = make({
      ...b,
      ...extra,
      t,
      x,
      l: LISTY.has(t) && LISTY.has(b.t) ? b.l || 0 : 0,
      i: t === "callout" ? b.i || extra.i || "💡" : b.i,
    });
    el.replaceWith(nb);
    renum();
    if (off >= 0 || extra.focus) focusBlock(nb, off >= 0 ? off : Infinity);
    return nb;
  }
  function splitTail(t) {
    const s = getSelection(),
      r = s.getRangeAt(0);
    if (!r.collapsed) r.deleteContents();
    const q = document.createRange();
    q.setStart(r.startContainer, r.startOffset);
    q.setEnd(t, t.childNodes.length);
    return q.extractContents();
  }
  function enter(el, t) {
    const tp = el.dataset.t,
      l = lvl(el);
    pushUndo();
    if (isEmpty(t) && tp !== "p") {
      if (LISTY.has(tp) && l > 0) {
        setLevel(el, l - 1);
        renum();
      } else convert(el, "p");
      changed();
      return;
    }
    const nt = LISTY.has(tp) ? tp : "p";
    const s = getSelection();
    if (s.rangeCount && !s.isCollapsed) s.getRangeAt(0).deleteContents();
    if (caretOff(t) === 0 && !isEmpty(t)) {
      el.before(make({ t: nt, l: LISTY.has(tp) ? l : 0, n: el.dataset.n }));
      renum();
      focusBlock(el, 0);
      changed();
      return;
    }
    const frag = splitTail(t);
    tidy(t);
    const nb = make({ t: nt, l: LISTY.has(tp) ? l : 0 });
    const nt2 = tOf(nb);
    nt2.append(frag);
    tidy(nt2);
    el.after(nb);
    renum();
    focusBlock(nb, 0);
    changed();
  }
  function softBreak(t) {
    noteTyping(t);
    const s = getSelection(),
      r = s.getRangeAt(0);
    r.deleteContents();
    const br = document.createElement("br");
    r.insertNode(br);
    const q = document.createRange();
    q.setStartAfter(br);
    q.setEnd(t, t.childNodes.length);
    if (!lenOf(q.cloneContents())) br.after(document.createElement("br"));
    const c = document.createRange();
    c.setStartAfter(br);
    c.collapse(true);
    s.removeAllRanges();
    s.addRange(c);
    keepVisible(t);
    changed();
  }
  /* novi red u kodu ide direktno u tekst (insertText bi ga pretvorio u paragraf) */
  function codeNL(t) {
    noteTyping(t);
    const s = getSelection(),
      r = s.getRangeAt(0);
    r.deleteContents();
    const off = caretOff(t),
      txt = codeText(t);
    /* poslednji red je vidljiv tek ako iza njega postoji još jedan "\n" */
    const atEnd = off >= txt.length && !txt.endsWith("\n");
    r.insertNode(document.createTextNode(atEnd ? "\n\n" : "\n"));
    t.normalize();
    setCaret(t, off + 1);
    keepVisible(t);
    changed();
  }
  function merge(a, b) {
    const ta = tOf(a),
      tb = tOf(b);
    if (isEmpty(ta)) ta.replaceChildren();
    const off = lenOf(ta);
    if (a.dataset.t === "code" || b.dataset.t === "code")
      ta.append(document.createTextNode(tb.textContent));
    else ta.append(...tb.childNodes);
    b.remove();
    ta.focus({ preventScroll: true });
    setCaret(ta, off);
  }
  function backStart(el, t) {
    const tp = el.dataset.t,
      l = lvl(el);
    if (tp === "code") {
      if (isEmpty(t)) {
        pushUndo();
        convert(el, "p");
        changed();
      }
      return;
    }
    if (tp !== "p") {
      pushUndo();
      if (LISTY.has(tp) && l > 0) {
        setLevel(el, l - 1);
        renum();
      } else convert(el, "p");
      changed();
      return;
    }
    const prev = el.previousElementSibling;
    if (!isNb(prev)) return;
    pushUndo();
    if (tOf(prev)) merge(prev, el);
    else {
      if (isEmpty(t)) el.remove();
      selectBlocks([prev]);
    }
    renum();
    changed();
  }
  function delEnd(el) {
    const nx = el.nextElementSibling;
    if (!isNb(nx)) return;
    pushUndo();
    if (tOf(nx)) merge(el, nx);
    else selectBlocks([nx]);
    renum();
    changed();
  }
  /* uvlačenje nosi i "decu" bloka (blokove ispod sa većim nivoom) */
  function indentTree(el, d) {
    if (!LISTY.has(el.dataset.t)) return;
    const prev = el.previousElementSibling;
    const max = isNb(prev) && LISTY.has(prev.dataset.t) ? lvl(prev) + 1 : 0;
    const l0 = lvl(el),
      nl = Math.max(0, Math.min(max, 6, l0 + d));
    if (nl === l0) return;
    pushUndo();
    const kids = [];
    for (
      let n = el.nextElementSibling;
      isNb(n) && LISTY.has(n.dataset.t) && lvl(n) > l0;
      n = n.nextElementSibling
    )
      kids.push(n);
    setLevel(el, nl);
    kids.forEach((k) =>
      setLevel(k, Math.max(0, Math.min(6, lvl(k) + (nl - l0)))),
    );
    renum();
    changed();
  }
  function indentEls(els, d) {
    const list = els.filter((e) => LISTY.has(e.dataset.t));
    if (!list.length) return;
    pushUndo();
    for (const e of list) {
      const p = e.previousElementSibling;
      const max = isNb(p) && LISTY.has(p.dataset.t) ? lvl(p) + 1 : 0;
      setLevel(e, Math.max(0, Math.min(max, 6, lvl(e) + d)));
    }
    renum();
    changed();
  }
  function moveBlocks(els, d) {
    if (!els.length) return false;
    if (d < 0) {
      const p = els[0].previousElementSibling;
      if (!isNb(p)) return false;
      pushUndo();
      p.before(...els);
    } else {
      const n = els[els.length - 1].nextElementSibling;
      if (!isNb(n)) return false;
      pushUndo();
      n.after(...els);
    }
    renum();
    changed();
    return true;
  }
  function dup(els) {
    pushUndo();
    const copies = els.map((e) => make(readBlock(e)));
    els[els.length - 1].after(...copies);
    renum();
    changed();
    return copies;
  }
  function removeBlocks(els) {
    if (!els.length) return null;
    pushUndo();
    const prev = els[0].previousElementSibling,
      next = els[els.length - 1].nextElementSibling;
    els.forEach((e) => e.remove());
    if (!blocks().length) root.prepend(make({ t: "p", x: "" }));
    renum();
    changed();
    return (
      (isNb(prev) && prev.isConnected && prev) ||
      (isNb(next) && next.isConnected && next) ||
      blocks()[0]
    );
  }
  function toggleTodo(el) {
    pushUndo();
    const c = el.dataset.c !== "1";
    el.dataset.c = c ? "1" : "0";
    el.classList.toggle("done", c);
    const ck = el.querySelector(".nb-ck");
    ck.setAttribute("aria-checked", String(c));
    if (c && !reduce) {
      ck.classList.remove("ckpop");
      void ck.offsetWidth;
      ck.classList.add("ckpop");
    }
    changed();
  }
  function addBelow(el) {
    pushUndo();
    let p = el;
    if (!(el.dataset.t === "p" && isEmpty(tOf(el)))) {
      p = make({ t: "p", x: "" });
      el.after(p);
      renum();
    }
    focusBlock(p, 0);
    document.execCommand("insertText", false, "/");
  }
  function insertP(after) {
    pushUndo();
    const p = make({ t: "p", x: "" });
    after.after(p);
    focusBlock(p, 0);
    changed();
  }
  function placeBlock(el, replace, b) {
    const nb = make(b);
    if (replace) el.replaceWith(nb);
    else el.after(nb);
    let nx = nb.nextElementSibling;
    if (!(isNb(nx) && nx.dataset.t === "p" && isEmpty(tOf(nx)))) {
      nx = make({ t: "p", x: "" });
      nb.after(nx);
    }
    renum();
    focusBlock(nx, 0);
    changed();
    return nb;
  }

  /* ---------------- markdown shortcuts while typing ---------------- */
  function blockShortcut(el, t) {
    const tp = el.dataset.t;
    if (!["p", "ul", "ol"].includes(tp)) return false;
    const s = getSelection();
    if (!s.isCollapsed) return false;
    const pre = textBefore(t).replace(/ /g, " ");
    let to = null;
    const extra = {};
    if (tp === "p") {
      if (/^#{1,3} $/.test(pre)) to = "h" + (pre.length - 1);
      else if (/^[-*+] $/.test(pre)) to = "ul";
      else if (/^\d{1,3}[.)] $/.test(pre)) {
        /* "3. " posle teksta nastavlja numeraciju od 3 */
        to = "ol";
        extra.n = parseInt(pre, 10);
      } else if (/^(>|") $/.test(pre)) to = "quote";
    }
    if (/^\[[ xX]?\] $/.test(pre)) {
      to = "todo";
      extra.c = /x/i.test(pre);
    }
    if (!to) return false;
    pushUndo();
    rangeAt(t, 0, pre.length).deleteContents();
    tidy(t);
    const nb = convert(el, to, extra);
    focusBlock(nb, 0);
    changed();
    return true;
  }
  function fenceShortcut(el, t) {
    if (el.dataset.t !== "p" || textBefore(t) !== "```") return false;
    pushUndo();
    rangeAt(t, 0, 3).deleteContents();
    tidy(t);
    focusBlock(convert(el, "code"), 0);
    changed();
    return true;
  }
  /* iOS/macOS pametne crtice od "--" prave "—", pa "—-" i "-—" isto znače "---" */
  function hrShortcut(el, t) {
    if (el.dataset.t !== "p") return false;
    const v = t.textContent.replace(/​/g, "").trim().replace(/[—–]/g, "--");
    if (v !== "---") return false;
    pushUndo();
    placeBlock(el, true, { t: "hr" });
    return true;
  }
  function inlineShortcut(t, ch) {
    const s = getSelection();
    if (!s.isCollapsed) return;
    const node = s.anchorNode,
      off = s.anchorOffset;
    if (
      !node ||
      node.nodeType !== 3 ||
      !t.contains(node) ||
      node.parentElement.closest("code")
    )
      return;
    const v = node.nodeValue.slice(0, off);
    let m = null,
      tag = null;
    if (
      ch === "*" &&
      (m = v.match(/(^|[^*\\])\*\*([^*\s](?:[^*]*?[^*\s])?)\*\*$/))
    )
      tag = "b";
    else if (
      ch === "*" &&
      (m = v.match(/(^|[^*\\])\*([^*\s](?:[^*]*?[^*\s])?)\*$/))
    )
      tag = "i";
    else if (
      ch === "_" &&
      (m = v.match(/(^|[^\p{L}\p{N}_\\])_([^_\s](?:[^_]*?[^_\s])?)_$/u))
    )
      tag = "i";
    else if (
      ch === "~" &&
      (m = v.match(/(^|[^~\\])~~([^~\s](?:[^~]*?[^~\s])?)~~$/))
    )
      tag = "s";
    else if (ch === "`" && (m = v.match(/(^|[^`\\])`([^`]+)`$/))) tag = "code";
    if (!tag) return;
    pushUndo();
    const whole = m[0].length - m[1].length;
    const r = document.createRange();
    r.setStart(node, off - whole);
    r.setEnd(node, off);
    r.deleteContents();
    const e = document.createElement(tag);
    e.textContent = m[2];
    r.insertNode(e);
    const z = document.createTextNode("​");
    e.after(z);
    const c = document.createRange();
    c.setStart(z, 1);
    c.collapse(true);
    s.removeAllRanges();
    s.addRange(c);
  }

  /* ---------------- slash menu ---------------- */
  const BLOCKS = [
    {
      id: "p",
      label: "Tekst",
      ic: "Aa",
      hint: "",
      kw: "tekst text paragraf obican",
    },
    {
      id: "h1",
      label: "Naslov 1",
      ic: "H1",
      hint: "#",
      kw: "naslov heading h1 veliki",
    },
    {
      id: "h2",
      label: "Naslov 2",
      ic: "H2",
      hint: "##",
      kw: "naslov heading h2 srednji",
    },
    {
      id: "h3",
      label: "Naslov 3",
      ic: "H3",
      hint: "###",
      kw: "naslov heading h3 mali",
    },
    {
      id: "todo",
      label: "Lista zadataka",
      ic: I.todo,
      hint: "[]",
      kw: "todo zadatak zadaci checkbox kvacica check task",
    },
    {
      id: "ul",
      label: "Lista",
      ic: I.ul,
      hint: "-",
      kw: "lista bullet nabrajanje tacke",
    },
    {
      id: "ol",
      label: "Numerisana lista",
      ic: I.ol,
      hint: "1.",
      kw: "numerisana numbered brojevi",
    },
    {
      id: "quote",
      label: "Citat",
      ic: I.quote,
      hint: ">",
      kw: "citat quote navod",
    },
    {
      id: "callout",
      label: "Napomena",
      ic: I.callout,
      hint: "",
      kw: "callout napomena istaknuto info kutija box",
    },
    {
      id: "code",
      label: "Kod",
      ic: I.code,
      hint: "```",
      kw: "kod code snippet",
    },
    {
      id: "hr",
      label: "Razdelnik",
      ic: I.hr,
      hint: "---",
      kw: "razdelnik divider linija",
    },
    {
      id: "tbl",
      label: "Tabela",
      ic: I.table,
      hint: "",
      kw: "tabela table baza database tablica kolone redovi grid spreadsheet",
    },
    {
      id: "draw",
      label: "Crtež",
      ic: I.pen,
      hint: "",
      kw: "crtez draw drawing excalidraw skica sketch dijagram diagram whiteboard tabla shema",
    },
    {
      id: "page",
      label: "Stranica",
      ic: I.doc,
      hint: "",
      kw: "stranica page podstranica subpage",
    },
    {
      id: "rel",
      label: "Veza ka stranici",
      ic: I.link,
      hint: "@",
      kw: "veza relacija relation mention pomen link povezi stranica",
    },
    {
      id: "img",
      label: "Slika",
      ic: I.img,
      hint: "",
      kw: "slika image foto fotografija",
    },
    {
      id: "embed",
      label: "HTML fajl",
      ic: I.embed,
      hint: "",
      kw: "html embed ugradi ugradjeni iframe sajt stranica web",
    },
    {
      id: "file",
      label: "Fajl",
      ic: I.file,
      hint: "",
      kw: "fajl file pdf dokument prilog",
    },
    {
      id: "emoji",
      label: "Emoji",
      ic: I.smile,
      hint: "",
      kw: "emoji smajli emotikon ikonica",
    },
  ];
  const slashEl = document.createElement("div");
  slashEl.className = "slash nslash";
  slashEl.hidden = true;
  slashEl.setAttribute("role", "listbox");
  document.body.appendChild(slashEl);
  let SL = null;
  /* m = "/" blokovi i emoji, "@" veza ka stranici */
  function openSlash(t, m) {
    const s = getSelection();
    if (!s.rangeCount) return;
    const r = s.getRangeAt(0);
    if (r.startContainer.nodeType !== 3 || r.startOffset < 1) return;
    const node = r.startContainer,
      off = r.startOffset - 1,
      pc = node.nodeValue[off - 1];
    if (off > 0 && pc && !/[\s​]/.test(pc)) return;
    SL = { t, node, off, m, idx: 0, items: [] };
    updateSlash();
    if (m === "/")
      loadEmoji().then(
        () => SL && updateSlash(),
        () => {},
      );
  }
  function slashQ() {
    if (!SL || !SL.node.isConnected) return null;
    const s = getSelection();
    if (!s.rangeCount) return null;
    const r = s.getRangeAt(0);
    if (r.startContainer !== SL.node || r.startOffset <= SL.off) return null;
    const v = SL.node.nodeValue.slice(SL.off, r.startOffset);
    return v[0] === SL.m ? v.slice(1) : null;
  }
  /* privatna stranica samo iz privatne: ostali je ne vide, a naslov bi im ostao u tekstu */
  function relPages(f, max) {
    const here = docOf(cur);
    return notes()
      .filter(
        (n) =>
          n.id !== cur &&
          (!n.privateTo || (here && here.privateTo)) &&
          (!f || fold(n.title || "Bez naslova").includes(f)),
      )
      .sort(
        (a, b) =>
          (f ? fold(b.title).startsWith(f) - fold(a.title).startsWith(f) : 0) ||
          byUpd(a, b),
      )
      .slice(0, max);
  }
  function relHint(n) {
    const sp = spaceOf(n) !== spaceOf(docOf(cur)) && X.spaceLabel(spaceOf(n));
    return [sp, pathOf(n)].filter(Boolean).join(" / ");
  }
  function updateSlash() {
    const q = slashQ();
    if (q === null || q.length > 30 || /\s\s/.test(q) || /^\s/.test(q)) {
      closeSlash();
      return;
    }
    const f = fold(q.trim()),
      rel = SL.m === "@";
    /* skripta ide klijentu u CRM, pa u njoj nema podstranica ni linkova na General */
    const items = rel
      ? relPages(f, 8).map((n) => ({ k: "rel", n }))
      : BLOCKS.filter(
          (b) =>
            !((b.id === "page" || b.id === "rel") && isScript()) &&
            (!f || fold(b.label).includes(f) || b.kw.includes(f)),
        ).map((b) => ({ k: "b", b }));
    if (!rel && f && !isScript())
      relPages(f, 4).forEach((n) => items.push({ k: "link", n }));
    const em =
      !rel && EMO ? (f ? searchEmoji(f, 16) : recentEmoji().slice(0, 8)) : [];
    em.forEach((ch) => items.push({ k: "e", ch }));
    if (!items.length && /\s$/.test(q)) {
      closeSlash();
      return;
    }
    SL.items = items;
    SL.idx = Math.min(SL.idx, Math.max(0, items.length - 1));
    const row = (it, i) => {
      const on = i === SL.idx ? " on" : "";
      if (it.k === "b")
        return `<button type="button" class="${on}" data-si="${i}" role="option"><span class="si">${it.b.ic}</span><span class="sl">${it.b.label}</span><span class="sk">${it.b.hint}</span></button>`;
      if (it.k === "link")
        return `<button type="button" class="${on}" data-si="${i}" role="option"><span class="si">${it.n.icon ? emo(it.n.icon) : I.doc}</span><span class="sl">${esc(it.n.title || "Bez naslova")}</span><span class="sk">Link</span></button>`;
      if (it.k === "rel") {
        const hint = relHint(it.n);
        return `<button type="button" class="ns-rel${on}" data-si="${i}" role="option"><span class="si">${it.n.icon ? emo(it.n.icon) : I.doc}</span><span class="sl"><span>${esc(it.n.title || "Bez naslova")}</span>${hint ? `<span class="sk">${esc(hint)}</span>` : ""}</span></button>`;
      }
      return `<button type="button" class="ns-e${on}" data-si="${i}" role="option" aria-label="Emoji ${esc(it.ch)}">${emo(it.ch)}</button>`;
    };
    let h = "",
      i = 0;
    const bl = items.filter((x) => x.k === "b"),
      ln = items.filter((x) => x.k === "link"),
      rl = items.filter((x) => x.k === "rel"),
      es = items.filter((x) => x.k === "e");
    if (rl.length)
      h +=
        `<div class="ns-h">Veza ka stranici</div>` +
        rl.map((it) => row(it, i++)).join("");
    if (bl.length)
      h +=
        `<div class="ns-h">Blokovi</div>` +
        bl.map((it) => row(it, i++)).join("");
    if (ln.length)
      h +=
        `<div class="ns-h">Poveži stranicu</div>` +
        ln.map((it) => row(it, i++)).join("");
    if (es.length)
      h += `<div class="ns-h">${f ? "Emoji" : "Nedavni emoji"}</div><div class="ns-emo">${es.map((it) => row(it, i++)).join("")}</div>`;
    slashEl.innerHTML =
      h ||
      `<div class="none">${rel ? "Nema te stranice" : "Nema rezultata"}</div>`;
    slashEl.hidden = false;
    placeFloat(slashEl, caretRect(), 300, 400);
  }
  function placeFloat(el, rect, w, maxH) {
    if (!rect) return;
    const vv = window.visualViewport,
      vh = vv ? vv.height : innerHeight,
      vt = vv ? vv.offsetTop : 0;
    const W = Math.min(w, innerWidth - 24);
    el.style.width = W + "px";
    el.style.left =
      Math.max(12, Math.min(rect.left, innerWidth - W - 12)) + "px";
    const below = vt + vh - rect.bottom - 16 - (touch() ? 64 : 0),
      above = rect.top - vt - 16;
    if (below >= 220 || below >= above) {
      el.style.maxHeight = Math.min(maxH, below) + "px";
      el.style.top = rect.bottom + 8 + "px";
    } else {
      const h = Math.min(el.scrollHeight, maxH, above);
      el.style.maxHeight = Math.min(maxH, above) + "px";
      el.style.top = Math.max(vt + 12, rect.top - 8 - h) + "px";
    }
  }
  function moveSlash(d) {
    if (!SL.items.length) return;
    SL.idx = (SL.idx + d + SL.items.length) % SL.items.length;
    slashEl
      .querySelectorAll("[data-si]")
      .forEach((b) => b.classList.toggle("on", +b.dataset.si === SL.idx));
    const on = slashEl.querySelector(".on");
    on && on.scrollIntoView({ block: "nearest" });
  }
  function closeSlash() {
    SL = null;
    slashEl.hidden = true;
  }
  slashEl.addEventListener("pointerdown", (e) => e.preventDefault());
  slashEl.addEventListener("click", (e) => {
    const b = e.target.closest("[data-si]");
    if (b && SL) runSlash(SL.items[+b.dataset.si]);
  });
  slashEl.addEventListener("pointermove", (e) => {
    const b = e.target.closest("[data-si]");
    if (b && SL && +b.dataset.si !== SL.idx) {
      SL.idx = +b.dataset.si;
      slashEl
        .querySelectorAll("[data-si]")
        .forEach((x) => x.classList.toggle("on", x === b));
    }
  });
  function runSlash(it) {
    if (!SL || !it) return;
    const { t, node, off } = SL;
    const q = slashQ() ?? "";
    const el = t.parentElement;
    closeSlash();
    const r = document.createRange();
    r.setStart(node, off);
    r.setEnd(node, Math.min(node.nodeValue.length, off + 1 + q.length));
    r.deleteContents();
    t.focus({ preventScroll: true });
    if (isEmpty(t)) {
      t.replaceChildren();
      setCaret(t, 0);
    } else {
      const s = getSelection();
      s.removeAllRanges();
      s.addRange(r);
    }
    pushUndo();
    const empty = isEmpty(t);
    if (it.k === "e") {
      document.execCommand("insertText", false, it.ch);
      addRecent(it.ch);
      return;
    }
    if (it.k === "link") {
      placeBlock(el, empty, { t: "page", ref: it.n.id });
      return;
    }
    if (it.k === "rel") {
      relInsert(t, it.n);
      return;
    }
    const id = it.b.id;
    if (id === "rel") {
      document.execCommand("insertText", false, "@"); // input otvara izbor stranice
      return;
    }
    if (TEXTY.has(id)) {
      convert(el, id, { focus: true });
      changed();
      return;
    }
    if (id === "hr") placeBlock(el, empty, { t: "hr" });
    else if (id === "tbl") focusCell(placeBlock(el, empty, tbNew()), 0, 0);
    else if (id === "draw") drNew(el, empty);
    else if (id === "embed")
      pickFiles(".html,.htm,text/html", (fs) => uploadInto(fs, el, empty));
    else if (id === "img" || id === "file")
      pickFiles(id === "img" ? "image/*" : "", (fs) =>
        uploadInto(fs, el, empty),
      );
    else if (id === "page") subpage(el, empty);
    else if (id === "emoji") {
      const off2 = caretOff(t),
        at = caretRect();
      if (touch()) t.blur();
      openPicker(at, (ch) => {
        if (!ch || !el.isConnected) return;
        focusBlock(el, off2);
        document.execCommand("insertText", false, ch);
      });
    }
  }
  function relInsert(t, n) {
    insertInline(t, relMd(n.id, n.title || "Bez naslova"));
    const s = getSelection(),
      r = s.getRangeAt(0),
      nx = r.startContainer.childNodes[r.startOffset];
    if (!(nx && nx.nodeType === 3 && /^\s/.test(nx.nodeValue))) {
      const sp = document.createTextNode("\u00a0");
      r.insertNode(sp);
      r.setStart(sp, 1);
      r.collapse(true);
      s.removeAllRanges();
      s.addRange(r);
    }
    changed();
  }
  function relOpen(a) {
    if (noteOf(a.dataset.ref)) X.nav("g-" + a.dataset.ref);
    else toast("Stranica je obrisana ili nemaš pristup");
  }
  /* čip do kursora u smeru d (-1 levo, 1 desno); znak koji drži mesto se preskače */
  function relAdj(d) {
    const s = getSelection();
    if (!s.rangeCount || !s.isCollapsed) return null;
    const ZW = /\u200b/g,
      step = (x) => (d < 0 ? x.previousSibling : x.nextSibling);
    let n = s.anchorNode,
      o = s.anchorOffset;
    if (n.nodeType === 3) {
      const rest = d < 0 ? n.nodeValue.slice(0, o) : n.nodeValue.slice(o);
      if (rest.replace(ZW, "")) return null;
      n = step(n);
    } else n = n.childNodes[d < 0 ? o - 1 : o];
    while (n && n.nodeType === 3 && !n.nodeValue.replace(ZW, "")) n = step(n);
    return n && isRel(n) ? n : null;
  }
  /* čip je jedna celina: strelica ga preskače, Backspace i Delete ga brišu odjednom */
  function relKey(e, t) {
    const k = e.key,
      left = k === "Backspace" || k === "ArrowLeft";
    if (
      (!left && k !== "Delete" && k !== "ArrowRight") ||
      e.shiftKey ||
      e.altKey ||
      e.metaKey ||
      e.ctrlKey
    )
      return false;
    const a = relAdj(left ? -1 : 1);
    if (!a) return false;
    e.preventDefault();
    const s = getSelection(),
      r = document.createRange(),
      z = a.nextSibling,
      zw = z && z.nodeType === 3 && z.nodeValue[0] === "\u200b";
    if (k === "ArrowLeft") r.setStartBefore(a);
    else if (k === "ArrowRight") {
      if (zw) r.setStart(z, 1);
      else r.setStartAfter(a);
    } else {
      pushUndo();
      r.setStartBefore(a);
      a.remove();
      if (zw) z.deleteData(0, 1);
      tidy(t);
    }
    r.collapse(true);
    s.removeAllRanges();
    s.addRange(r);
    if (k === "Backspace" || k === "Delete") changed();
    return true;
  }
  function slashKey(e) {
    const k = e.key;
    if (k === "ArrowDown" || k === "ArrowUp") {
      e.preventDefault();
      moveSlash(k === "ArrowDown" ? 1 : -1);
      return true;
    }
    if (k === "Enter" || k === "Tab") {
      const it = SL.items[SL.idx];
      if (it) {
        e.preventDefault();
        runSlash(it);
        return true;
      }
      closeSlash();
    }
    if (k === "Escape") {
      e.preventDefault();
      closeSlash();
      return true;
    }
    return false;
  }
  async function subpage(el, replace) {
    try {
      const id = await newPage(cur);
      if (!el.isConnected) return;
      placeBlock(el, replace, { t: "page", ref: id });
      await flush();
      X.nav("g-" + id);
      setTimeout(() => titleEl.focus(), 120);
    } catch (e) {
      toast(errMsg(e));
    }
  }

  /* ---------------- emoji picker ---------------- */
  const EP = document.createElement("div");
  EP.className = "emop";
  EP.hidden = true;
  EP.setAttribute("role", "dialog");
  EP.setAttribute("aria-label", "Emoji");
  document.body.appendChild(EP);
  const TABS = [
    ["recent", I.clock, "Često korišćeni"],
    ["people", I.smile, "Smajliji i ljudi"],
    ["nature", I.paw, "Životinje i priroda"],
    ["food", I.food, "Hrana i piće"],
    ["activity", I.ball, "Aktivnosti"],
    ["travel", I.car, "Putovanja i mesta"],
    ["objects", I.bulb, "Predmeti"],
    ["symbols", I.heart, "Simboli"],
    ["flags", I.flag, "Zastave"],
  ];
  let epCb = null,
    epAnchor = null,
    epRaf = 0;
  async function openPicker(anchor, cb, opts = {}) {
    closeSlash();
    closeMenu();
    epCb = cb;
    epAnchor = anchor;
    EP.innerHTML = `<div class="emop-top"><label class="emop-q">${I.search}<input type="search" placeholder="Pretraži emoji" autocomplete="off" spellcheck="false" aria-label="Pretraži emoji"></label>${opts.random ? `<button type="button" class="emop-b" data-er title="Nasumično" aria-label="Nasumičan emoji">${I.dice}</button>` : ""}${opts.remove ? `<button type="button" class="emop-b txt" data-ex>Ukloni</button>` : ""}</div><div class="emop-body"><div class="emop-none">Učitavam emoji…</div></div><nav class="emop-tabs">${TABS.map(([k, ic, n]) => `<button type="button" data-tab="${k}" aria-label="${n}" title="${n}">${ic}</button>`).join("")}</nav>`;
    EP.hidden = false;
    EP.classList.remove("show");
    void EP.offsetWidth;
    EP.classList.add("show");
    placePicker();
    try {
      await loadEmoji();
    } catch (e) {
      EP.querySelector(".emop-body").innerHTML =
        '<div class="emop-none">Emoji nisu učitani. Proveri internet.</div>';
      return;
    }
    if (EP.hidden || epCb !== cb) return;
    paintGrid("");
    if (!touch()) EP.querySelector("input").focus({ preventScroll: true });
  }
  function placePicker() {
    if (EP.hidden) return;
    const vv = window.visualViewport,
      vh = vv ? vv.height : innerHeight,
      vt = vv ? vv.offsetTop : 0;
    if (innerWidth < 560 || !epAnchor) {
      const H = Math.round(Math.min(420, vh * 0.6));
      EP.classList.add("is-sheet");
      Object.assign(EP.style, {
        left: "8px",
        right: "8px",
        width: "",
        height: H + "px",
        top: vt + vh - H - 8 + "px",
      });
      return;
    }
    EP.classList.remove("is-sheet");
    const W = 360,
      H = Math.min(420, vh - 24),
      r = epAnchor;
    let y = r.bottom + 8;
    if (y + H > vt + vh - 8) y = Math.max(vt + 8, r.top - H - 8);
    Object.assign(EP.style, {
      right: "",
      width: W + "px",
      height: H + "px",
      left: Math.max(8, Math.min(r.left, innerWidth - W - 8)) + "px",
      top: y + "px",
    });
  }
  const sec = (k, n, list) =>
    `<section data-sec="${k}"><h4>${esc(n)}</h4><div class="emop-grid">${list.map((ch) => `<button type="button" data-e="${esc(ch)}">${emo(ch)}</button>`).join("")}</div></section>`;
  function paintGrid(q) {
    const body = EP.querySelector(".emop-body");
    if (!body || !EMO) return;
    const f = fold(q.trim());
    EP.classList.toggle("q", !!f);
    if (f) {
      const res = searchEmoji(f, 160);
      body.innerHTML = res.length
        ? sec("res", "Rezultati", res)
        : `<div class="emop-none">Nema emoji za „${esc(q.trim())}“</div>`;
      body.scrollTop = 0;
      return;
    }
    const rec = recentEmoji();
    body.innerHTML =
      (rec.length ? sec("recent", "Često korišćeni", rec) : "") +
      EMO.map((c) =>
        sec(
          c.k,
          c.n,
          c.list.map((e) => e.ch),
        ),
      ).join("");
    EP.querySelector('[data-tab="recent"]').hidden = !rec.length;
    body.scrollTop = 0;
    syncTab();
  }
  function syncTab() {
    const body = EP.querySelector(".emop-body");
    if (!body) return;
    let on = null;
    for (const s of body.querySelectorAll("section"))
      if (s.offsetTop - body.offsetTop <= body.scrollTop + 12)
        on = s.dataset.sec;
    EP.querySelectorAll("[data-tab]").forEach((b) =>
      b.classList.toggle("on", b.dataset.tab === on),
    );
  }
  function pickEmoji(ch) {
    const cb = epCb;
    addRecent(ch);
    closePicker();
    cb && cb(ch);
  }
  function closePicker() {
    if (EP.hidden) return;
    EP.hidden = true;
    EP.innerHTML = "";
    epCb = null;
  }
  EP.addEventListener("pointerdown", (e) => {
    if (!e.target.closest("input")) e.preventDefault();
  });
  EP.addEventListener("input", (e) => {
    if (e.target.matches("input")) paintGrid(e.target.value);
  });
  EP.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      closePicker();
    } else if (e.key === "Enter" && e.target.matches("input")) {
      e.preventDefault();
      const b = EP.querySelector("[data-e]");
      if (b) pickEmoji(b.dataset.e);
    }
  });
  EP.addEventListener("click", (e) => {
    const b = e.target.closest("[data-e]");
    if (b) {
      pickEmoji(b.dataset.e);
      return;
    }
    const tb = e.target.closest("[data-tab]");
    if (tb) {
      const inp = EP.querySelector("input");
      if (inp && inp.value) {
        inp.value = "";
        paintGrid("");
      }
      const body = EP.querySelector(".emop-body"),
        s = body.querySelector(`[data-sec="${tb.dataset.tab}"]`);
      if (s)
        body.scrollTo({
          top: s.offsetTop - body.offsetTop,
          behavior: reduce ? "auto" : "smooth",
        });
      return;
    }
    if (e.target.closest("[data-ex]")) {
      const cb = epCb;
      closePicker();
      cb && cb("");
      return;
    }
    if (e.target.closest("[data-er]") && EMO) {
      const all = EMO.filter((c) => c.k !== "flags").flatMap((c) => c.list);
      pickEmoji(all[Math.floor(Math.random() * all.length)].ch);
    }
  });
  EP.addEventListener(
    "scroll",
    () => {
      cancelAnimationFrame(epRaf);
      epRaf = requestAnimationFrame(syncTab);
    },
    true,
  );

  /* ---------------- block selection ---------------- */
  let sel = [];
  function selectBlocks(els) {
    spanOff();
    clearSel();
    sel = els.filter(Boolean);
    if (!sel.length) return;
    sel.forEach((e) => e.classList.add("sel"));
    const a = document.activeElement;
    if (a && root.contains(a)) a.blur();
    getSelection().removeAllRanges();
    fbHide();
    closeSlash();
  }
  function clearSel() {
    sel.forEach((e) => e.classList.remove("sel"));
    sel = [];
  }
  function blockAtY(y) {
    const bs = blocks();
    for (const b of bs) if (y < b.getBoundingClientRect().bottom) return b;
    return bs[bs.length - 1] || null;
  }
  const mdOf = (els) => toMd(els.map(readBlock));

  /* ---------------- block menu ---------------- */
  const TYPES = [
    ["p", "Aa", "Tekst"],
    ["h1", "H1", "Naslov 1"],
    ["h2", "H2", "Naslov 2"],
    ["h3", "H3", "Naslov 3"],
    ["ul", I.ul, "Lista"],
    ["ol", I.ol, "Numerisana lista"],
    ["todo", I.todo, "Zadaci"],
    ["quote", I.quote, "Citat"],
    ["callout", I.callout, "Napomena"],
    ["code", I.code, "Kod"],
  ];
  let menuEl = null,
    menuEls = [],
    TP = null; // otvoren izbor opcije u ćeliji tabele
  function openMenu(el, rect) {
    closeMenu();
    closeSlash();
    closePicker();
    if (!sel.includes(el)) selectBlocks([el]);
    const els = (menuEls = sel.slice());
    const one = els.length === 1 ? els[0] : null,
      t1 = one && one.dataset.t;
    const texty = els.every((e) => TEXTY.has(e.dataset.t));
    const M = (menuEl = document.createElement("div"));
    M.className = "pop nmenu";
    M.setAttribute("role", "menu");
    M.innerHTML =
      (texty
        ? `<div class="nm-h">Pretvori u</div><div class="nm-types">${TYPES.map(([id, ic, l]) => `<button type="button" data-to="${id}" title="${l}" aria-label="${l}"${t1 === id ? ' class="on"' : ""}>${ic}</button>`).join("")}</div><div class="nm-sep"></div>`
        : "") +
      `<button type="button" data-act="add">${I.plus}Novi blok ispod</button>` +
      (t1 === "page"
        ? `<button type="button" data-act="openp">${I.open}Otvori stranicu</button>`
        : "") +
      (t1 === "draw"
        ? `<button type="button" data-act="draw">${I.pen}Izmeni crtež</button>`
        : "") +
      ((t1 === "img" || t1 === "file") && one.dataset.src
        ? `<button type="button" data-act="openf">${I.open}Otvori u novom tabu</button>`
        : "") +
      (t1 === "callout"
        ? `<button type="button" data-act="icon">${I.smile}Promeni ikonicu</button>`
        : "") +
      (els.some((e) => LISTY.has(e.dataset.t))
        ? `<button type="button" data-act="in">${I.indent}Uvuci<span class="kb">Tab</span></button><button type="button" data-act="out">${I.outdent}Izvuci<span class="kb">⇧Tab</span></button>`
        : "") +
      `<button type="button" data-act="dup">${I.dup}Dupliraj<span class="kb">${MOD}D</span></button><button type="button" data-act="up">${I.up}Pomeri gore</button><button type="button" data-act="down">${I.down}Pomeri dole</button><button type="button" data-act="md">${I.md}Kopiraj kao Markdown</button><div class="nm-sep"></div><button type="button" data-act="del" class="danger">${I.trash}Obriši<span class="kb">Del</span></button>`;
    document.body.appendChild(M);
    placeMenu(M, rect);
  }
  function placeMenu(M, rect) {
    const vv = window.visualViewport,
      vh = vv ? vv.height : innerHeight,
      vt = vv ? vv.offsetTop : 0;
    const W = Math.min(286, innerWidth - 16);
    M.style.width = W + "px";
    const h = Math.min(M.scrollHeight, vh - 24);
    M.style.maxHeight = vh - 24 + "px";
    if (touch() && !MB.hidden) {
      const mt = MB.getBoundingClientRect().top;
      M.style.left =
        Math.max(8, Math.min(rect.left, innerWidth - W - 8)) + "px";
      M.style.top = Math.max(vt + 8, mt - h - 8) + "px";
      return;
    }
    let x = rect.right + 8;
    if (x + W > innerWidth - 8) x = Math.max(8, rect.left - W - 8);
    let y = rect.top - 6;
    if (y + h > vt + vh - 8) y = Math.max(vt + 8, vt + vh - h - 8);
    M.style.left = x + "px";
    M.style.top = y + "px";
  }
  function closeMenu() {
    if (menuEl) menuEl.remove();
    menuEl = null;
    menuEls = [];
    TP = null;
  }
  document.addEventListener("click", (e) => {
    if (!menuEl || !menuEl.contains(e.target)) return;
    const els = menuEls.filter((x) => x.isConnected);
    const to = e.target.closest("[data-to]");
    const act = e.target.closest("[data-act]");
    if (!to && !act) return;
    closeMenu();
    if (!els.length) return;
    if (to) {
      pushUndo();
      const out = els.map((x) => convert(x, to.dataset.to));
      changed();
      if (out.length === 1 && tOf(out[0])) focusBlock(out[0]);
      else selectBlocks(out);
      return;
    }
    const a = act.dataset.act,
      one = els[0];
    if (a === "add") addBelow(els[els.length - 1]);
    else if (a === "openp") X.nav("g-" + one.dataset.ref);
    else if (a === "openf") window.open(one.dataset.src, "_blank", "noopener");
    else if (a === "draw") drOpen(one);
    else if (a === "icon") calloutIcon(one);
    else if (a === "in" || a === "out") {
      indentEls(els, a === "in" ? 1 : -1);
      selectBlocks(els);
    } else if (a === "dup") selectBlocks(dup(els));
    else if (a === "up" || a === "down") {
      moveBlocks(els, a === "up" ? -1 : 1);
      selectBlocks(els);
      els[0].scrollIntoView({ block: "nearest" });
    } else if (a === "md") copyText(mdOf(els), "Kopirano kao Markdown");
    else if (a === "del") {
      const tg = removeBlocks(els);
      clearSel();
      if (tg && tOf(tg)) focusBlock(tg);
    }
  });
  function calloutIcon(el) {
    const ci = el.querySelector(".nb-ci");
    openPicker(
      ci.getBoundingClientRect(),
      (ch) => {
        if (!ch || !el.isConnected) return;
        pushUndo();
        el.dataset.i = ch;
        ci.innerHTML = emo(ch);
        changed();
      },
      { random: true },
    );
  }

  /* ---------------- drag to reorder ---------------- */
  let DG = null;
  const dropLine = document.createElement("div");
  dropLine.className = "nb-drop";
  function dragBegin() {
    DG.moved = true;
    if (!sel.includes(DG.el)) selectBlocks([DG.el]);
    DG.els = blocks().filter((b) => sel.includes(b));
    DG.els.forEach((b) => b.classList.add("drag"));
    const g = (DG.ghost = document.createElement("div"));
    g.className = "nb-ghost";
    const txt = DG.els
      .map((b) =>
        tOf(b)
          ? tOf(b).textContent
          : b.dataset.t === "tbl"
            ? "Tabela"
            : b.dataset.name || b.dataset.t,
      )
      .join(" · ");
    g.textContent = (txt.trim() || "Blok").slice(0, 80);
    if (DG.els.length > 1) g.dataset.n = DG.els.length;
    document.body.appendChild(g);
    root.appendChild(dropLine);
    document.body.classList.add("nb-dragging");
    closeMenu();
  }
  function dragMove(x, y) {
    DG.lx = x;
    DG.ly = y;
    DG.ghost.style.transform = `translate(${x + 14}px, ${y - 18}px)`;
    const bs = blocks().filter((b) => !DG.els.includes(b));
    let before = null;
    for (const b of bs) {
      const r = b.getBoundingClientRect();
      if (y < r.top + r.height / 2) {
        before = b;
        break;
      }
    }
    DG.before = before;
    DG.after = before ? null : bs[bs.length - 1] || null;
    const ref = before || DG.after;
    if (!ref) return;
    dropLine.style.top =
      (before ? ref.offsetTop - 3 : ref.offsetTop + ref.offsetHeight + 1) +
      "px";
    dropLine.style.left = (LISTY.has(ref.dataset.t) ? lvl(ref) * 28 : 0) + "px";
  }
  function dragLoop() {
    if (!DG || !DG.moved) return;
    const vv = window.visualViewport,
      vh = vv ? vv.height : innerHeight;
    const y = DG.ly;
    const sp =
      y < 90
        ? -Math.min(18, (90 - y) / 4)
        : y > vh - 60
          ? Math.min(18, (y - vh + 60) / 4)
          : 0;
    if (sp) {
      scrollBy(0, sp);
      dragMove(DG.lx, DG.ly);
    }
    DG.raf = requestAnimationFrame(dragLoop);
  }
  function dragEnd(drop) {
    const d = DG;
    DG = null;
    if (!d) return;
    cancelAnimationFrame(d.raf);
    if (!d.moved) return;
    d.els.forEach((b) => b.classList.remove("drag"));
    d.ghost.remove();
    dropLine.remove();
    document.body.classList.remove("nb-dragging");
    if (!drop) return;
    const target = d.before || d.after;
    if (!target) return;
    const order = blocks();
    const same = d.before
      ? order.indexOf(d.before) === order.indexOf(d.els[d.els.length - 1]) + 1
      : order[order.length - 1] === d.els[d.els.length - 1];
    if (
      same &&
      d.els.every(
        (b, i) =>
          i === 0 || order.indexOf(b) === order.indexOf(d.els[i - 1]) + 1,
      )
    ) {
      selectBlocks(d.els);
      return;
    }
    pushUndo();
    if (d.before) d.before.before(...d.els);
    else d.after.after(...d.els);
    renum();
    changed();
    selectBlocks(d.els);
  }
  onRoot("pointerdown", (e) => {
    const h = e.target.closest(".nb-h");
    if (!h || e.button !== 0) return;
    e.preventDefault();
    const el = h.closest(".nb");
    DG = { el, h, x: e.clientX, y: e.clientY, moved: false, id: e.pointerId };
    try {
      h.setPointerCapture(e.pointerId);
    } catch (err) {}
  });
  onRoot("pointermove", (e) => {
    if (!DG || e.pointerId !== DG.id) return;
    if (!DG.moved) {
      if (Math.hypot(e.clientX - DG.x, e.clientY - DG.y) < 5) return;
      dragBegin();
      DG.raf = requestAnimationFrame(dragLoop);
    }
    dragMove(e.clientX, e.clientY);
  });
  onRoot("pointerup", (e) => {
    if (!DG || e.pointerId !== DG.id) return;
    const d = DG;
    if (!d.moved) {
      DG = null;
      openMenu(d.el, d.h.getBoundingClientRect());
      return;
    }
    dragEnd(true);
  });
  onRoot("pointercancel", () => dragEnd(false));

  /* ---------------- slika: veličina (ručka na desnoj ivici) ---------------- */
  /* širina se pamti u % kolone, pa slika ostaje srazmerna i na telefonu */
  onRoot(
    "pointerdown",
    (e) => {
      const h = e.target.closest(".nb-rz");
      if (!h || e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      const el = h.closest(".nb"),
        w = h.parentElement,
        col = w.parentElement.getBoundingClientRect().width,
        x0 = e.clientX,
        w0 = w.getBoundingClientRect().width;
      let pct = 0;
      pushUndo();
      try {
        h.setPointerCapture(e.pointerId);
      } catch (err) {}
      w.classList.add("rz");
      const move = (ev) => {
        pct = Math.round(
          Math.min(100, Math.max(10, ((w0 + ev.clientX - x0) / col) * 100)),
        );
        w.style.width = pct + "%";
        w.dataset.pct = pct + "%";
      };
      const up = () => {
        h.removeEventListener("pointermove", move);
        h.removeEventListener("pointerup", up);
        h.removeEventListener("pointercancel", up);
        w.classList.remove("rz");
        if (!pct || String(pct) === el.dataset.w) return;
        el.dataset.w = pct;
        changed();
      };
      h.addEventListener("pointermove", move);
      h.addEventListener("pointerup", up);
      h.addEventListener("pointercancel", up);
    },
    true,
  );
  /* klik na ručku ne bira blok; dupli klik vraća prirodnu veličinu */
  onRoot(
    "click",
    (e) => e.target.closest(".nb-rz") && e.stopPropagation(),
    true,
  );
  onRoot("dblclick", (e) => {
    const h = e.target.closest(".nb-rz"),
      el = h && h.closest(".nb");
    if (!el || !el.dataset.w) return;
    pushUndo();
    delete el.dataset.w;
    h.parentElement.style.width = "";
    changed();
  });

  /* ---------------- tabela (baza) ----------------
     Zaglavlje su nazivi kolona; ikonica pored naziva otvara tip, sortiranje i kolone,
     ručica levo od reda otvara opcije reda. Tekst i broj se kucaju u ćeliju; izbor,
     osoba, datum i kvačica se biraju. Tab, Enter i strelice idu kroz ćelije. */
  const TKS = {
    text: ["Tekst", I.text, ""],
    num: ["Broj", I.hash, ""],
    sel: ["Izbor", I.tag, "Izaberi"],
    date: ["Datum", I.cal, "Datum"],
    check: ["Kvačica", I.todo, ""],
    who: ["Osoba", I.who, "Osoba"],
  };
  /* bez ručnih širina tabela zauzima celu kolonu teksta (udeli po tipu), a ispod
     najmanjih širina se skroluje (telefon); posle prevlačenja ivice sve kolone su u px */
  const TBW = {
      text: 200,
      num: 110,
      sel: 140,
      date: 130,
      check: 104,
      who: 140,
    },
    TBMIN = { text: 140, num: 84, sel: 104, date: 100, check: 88, who: 116 };
  const colShare = (c, i) => (i === 0 && c.k === "text" ? 260 : TBW[c.k]),
    colMin = (c, i) => (i === 0 && c.k === "text" ? 170 : TBMIN[c.k]),
    colPx = (c, i) => c.w || colShare(c, i);
  const isTextCell = (c) =>
    !!c &&
    c.classList.contains("tb-c") &&
    c.getAttribute("contenteditable") === "true";
  function cellOf(n) {
    const e = n && (n.nodeType === 1 ? n : n.parentElement),
      c = e && e.closest(".tb-c");
    return c && root.contains(c) ? c : null;
  }
  /* r = -1 je zaglavlje */
  function cellRC(c) {
    const td = c.closest("td,th"),
      tr = td.parentElement;
    return {
      r: tr.parentElement.tagName === "THEAD" ? -1 : tr.sectionRowIndex,
      c: td.cellIndex,
    };
  }
  const tbT = (el) => el.querySelector("table.tb");
  const headTh = (el) => [...tbT(el).tHead.rows[0].cells];
  const kindAt = (el, ci) => {
    const th = headTh(el)[ci];
    return (th && th.dataset.k) || "text";
  };
  const rowsN = (el) => tbT(el).tBodies[0].rows.length;
  function cellAt(el, r, c) {
    const t = tbT(el);
    if (!t || c < 0 || c >= headTh(el).length) return null;
    const tr = r < 0 ? t.tHead.rows[0] : t.tBodies[0].rows[r];
    return (tr && tr.cells[c] && tr.cells[c].querySelector(".tb-c")) || null;
  }
  function tbVal(k, x, o) {
    if (k === "check") return `<span class="tb-ck">${I.check}</span>`;
    if (!String(x || "").trim()) return "";
    if (k === "date") {
      const d = isoDate(x),
        l = dateLabel(x);
      return `<span class="tb-date${d ? "" : " raw"}${l === "Danas" ? " now" : ""}"${d ? ` title="${esc(dateLabel(x, true))}"` : ""}>${esc(l)}</span>`;
    }
    const v = unesc(x);
    if (k === "who") {
      const u = X.TEAM.find((p) => fold(p.name) === fold(v));
      return `<span class="tb-who">${u && X.IMG[u.id] ? `<img src="${esc(X.IMG[u.id])}" alt="" draggable="false">` : `<i>${esc([...v][0].toUpperCase())}</i>`}<span>${esc(v)}</span></span>`;
    }
    return `<span class="tb-pill" style="--c:${optColor(v, o)}">${esc(v)}</span>`;
  }
  function tbCell(k, x, first, o) {
    const rh =
      (first
        ? `<button type="button" class="tb-rh" tabindex="-1" aria-label="Red: novi, dupliraj, obriši" title="Opcije reda">${I.grip}</button>`
        : "") +
      `<button type="button" class="tb-cb" tabindex="-1" aria-label="Boja ćelije" title="Boja ćelije">${I.tint}</button>`;
    if (k === "text" || k === "num")
      return (
        rh +
        `<div class="tb-c" contenteditable="true" spellcheck="false"${k === "num" ? ' inputmode="decimal"' : ""}>${mdInline(x)}</div>`
      );
    return (
      rh +
      `<div class="tb-c tb-v" tabindex="-1" role="${k === "check" ? "checkbox" : "button"}" data-v="${esc(x || "")}"${k === "check" ? ` aria-checked="${isChecked(x)}" aria-label="Označeno"` : ` data-ph="${TKS[k][2]}"`}>${tbVal(k, x, o)}</div>`
    );
  }
  const tintAttr = (id) =>
    TINT[id] ? ` class="tn" style="--tn:${TINT[id]}"` : "";
  /* boja ćelije je jača od boje reda, a boja reda od boje kolone */
  const tbRow = (cols, r) =>
    `<tr${r.bg ? ` data-c="${r.bg}"` : ""}>${cols
      .map((c, i) => {
        const own = (r.tc && r.tc[i]) || "";
        return `<td data-k="${c.k}"${c.a ? ` data-a="${c.a}"` : ""}${own ? ` data-c="${own}"` : ""}${tintAttr(own === "none" ? "" : own || r.bg || c.c)}>${tbCell(c.k, r[i] || "", i === 0, c.o)}</td>`;
      })
      .join("")}</tr>`;
  function tbHtml(b) {
    const cols = b.cols,
      fixed = cols.some((c) => c.w),
      ws = cols.map(colPx),
      sum = ws.reduce((a, w) => a + w, 0);
    const head = cols
      .map(
        (c) =>
          `<th data-k="${c.k}"${c.w ? ` data-w="${c.w}"` : ""}${c.a ? ` data-a="${c.a}"` : ""}${c.c ? ` data-c="${c.c}"` : ""}${fxOf(c.k, c.f) ? ` data-f="${c.f}"` : ""}${c.o ? ` data-o="${esc(JSON.stringify(c.o))}"` : ""}${tintAttr(c.c)}><div class="tb-hd"><button type="button" class="tb-ti" tabindex="-1" title="${TKS[c.k][0]} · tip, sortiranje, kolone" aria-label="Kolona, tip ${TKS[c.k][0]}">${TKS[c.k][1]}</button><div class="tb-c tb-hn" contenteditable="true" spellcheck="false" data-ph="Kolona">${mdInline(c.n)}</div></div><span class="tb-rz" aria-hidden="true" title="Prevuci za širinu · dupli klik vraća automatsku"></span></th>`,
      )
      .join("");
    const style = fixed
      ? `width:${sum}px`
      : `width:100%;min-width:${cols.map(colMin).reduce((a, w) => a + w, 0)}px`;
    return `<div class="tb-sc"><table class="tb${fixed ? " fixed" : ""}" style="${style}"><colgroup>${ws.map((w) => `<col style="width:${fixed ? w + "px" : ((w / sum) * 100).toFixed(3) + "%"}">`).join("")}</colgroup><thead><tr>${head}</tr></thead><tbody>${b.rows.map((r) => tbRow(cols, r)).join("")}</tbody><tfoot><tr class="tb-sum" hidden></tr><tr><td class="tb-foot" colspan="${cols.length}"><div class="tb-fb"><button type="button" class="tb-addr" tabindex="-1">${I.plus}<span>Novi red</span></button><button type="button" class="tb-addc" tabindex="-1" title="Nova kolona na kraju">${I.plus}<span>Kolona</span></button><button type="button" class="tb-more" tabindex="-1" aria-label="Opcije tabele" title="Opcije tabele">${I.dots}</button></div></td></tr></tfoot></table></div>`;
  }
  /* računanje ispod kolone broja: naziv, ikonica i kratko objašnjenje za meni */
  const FXL = {
    sum: ["Zbir", I.sum, "sabira sve"],
    mul: ["Proizvod", I.mul, "množi sve"],
    div: ["Količnik", I.div, "prvi ÷ ostali"],
    avg: ["Prosek", I.avg, "zbir ÷ broj"],
  };
  /* prazne ćelije se preskaču; deljenje ide odozgo nadole, a nulom daje NaN */
  function fxCalc(f, xs) {
    if (f === "mul") return xs.reduce((a, v) => a * v, 1);
    if (f === "div")
      return xs.slice(1).reduce((a, v) => (v === 0 ? NaN : a / v), xs[0]);
    const s = xs.reduce((a, v) => a + v, 0);
    return f === "avg" ? s / xs.length : s;
  }
  const NUMS = new Intl.NumberFormat("sr-Latn-RS", {
    maximumSignificantDigits: 3,
  });
  /* 0,004 ne sme da postane 0 */
  const fxNum = (v) =>
    v !== 0 && Math.abs(v) < 0.01 ? NUMS.format(v) : NUMF.format(v);
  /* red ispod tabele: izabrano računanje po koloni broja (podrazumevano zbir, kad ima bar
     dva broja). Klik na vrednost menja ili uklanja računanje; kolona bez njega nudi
     "Računaj" kad je red vidljiv zbog druge kolone */
  function tbSum(el) {
    const t = tbT(el);
    if (!t) return;
    const tr = t.tFoot.rows[0];
    let any = false;
    const html = headTh(el)
      .map((th, i) => {
        if (th.dataset.k !== "num") return "<td></td>";
        const f = fxOf("num", th.dataset.f),
          xs = [];
        for (const row of t.tBodies[0].rows) {
          const v = parseNum(row.cells[i] ? row.cells[i].textContent : "");
          if (v !== null) xs.push(v);
        }
        if (f === "none" || xs.length < (f ? 1 : 2))
          return `<td data-k="num"><button type="button" class="tb-fx add" tabindex="-1" title="Zbir, proizvod, količnik ili prosek kolone">Računaj</button></td>`;
        any = true;
        const l = FXL[f || "sum"][0],
          v = fxCalc(f, xs);
        return `<td data-k="num"><button type="button" class="tb-fx" tabindex="-1" title="${l} · klik menja ili uklanja računanje"><span>${l}</span><b>${isNaN(v) ? "—" : esc(fxNum(v))}</b></button></td>`;
      })
      .join("");
    tr.hidden = !any;
    if (tr.innerHTML !== html) tr.innerHTML = html;
  }
  function calcMenu(el, ci, anchor) {
    const th = headTh(el)[ci],
      cur = fxOf("num", th.dataset.f) || "sum";
    tbMenu(
      `<div class="nm-h">Računanje</div>` +
        Object.entries(FXL)
          .map(
            ([id, [l, ic, d]]) =>
              `<button type="button" data-tm="fx:${id}"${id === cur ? ' aria-current="true"' : ""}>${ic}${l}<span class="kb">${d}</span><span class="tb-pok">${id === cur ? I.check : ""}</span></button>`,
          )
          .join("") +
        (cur !== "none"
          ? `<div class="nm-sep"></div><button type="button" data-tm="fx:none" class="tb-pclr">${I.trash}Bez računanja</button>`
          : ""),
      anchor,
      256,
      (a) => colAct(el, ci, a),
    );
  }
  const thOpts = (th) =>
    th.dataset.o ? optMap(JSON.parse(th.dataset.o)) : null;
  function tbRead(el) {
    const t = tbT(el);
    const cols = headTh(el).map((th) => ({
      n: inlineMd(th.querySelector(".tb-hn"))
        .replace(/\s*\n\s*/g, " ")
        .trim(),
      k: TK.includes(th.dataset.k) ? th.dataset.k : "text",
      w: colW(th.dataset.w),
      a: th.dataset.a || "",
      c: tintId(th.dataset.c),
      o: thOpts(th),
      f: fxOf(th.dataset.k, th.dataset.f),
    }));
    const rows = [...t.tBodies[0].rows].map((tr) => {
      const r = cols.map((_, i) => {
        const x = tr.cells[i] && tr.cells[i].querySelector(".tb-c");
        return !x ? "" : isTextCell(x) ? inlineMd(x).trim() : x.dataset.v || "";
      });
      const tc = cols.map(
        (_, i) => (tr.cells[i] && tr.cells[i].dataset.c) || "",
      );
      if (tr.dataset.c) r.bg = tr.dataset.c;
      if (tc.some(Boolean)) r.tc = tc;
      return r;
    });
    return { t: "tbl", cols, rows };
  }
  function tbPaint(el, b) {
    el.querySelector(".nb-tbl").innerHTML = tbHtml(b);
    tbSum(el);
  }
  /* tuđa izmena: menjaju se samo drugačije ćelije; kursor ostaje ako njegova nije dirana */
  function tbPatch(el, b) {
    const ae = document.activeElement,
      ac = el.contains(ae) ? ae.closest(".tb-c") : null,
      at = ac && cellRC(ac),
      off = isTextCell(ac) ? caretOff(ac) : -1,
      old = tbRead(el),
      /* promena boje crta celu tabelu: retka je, a kursor se vraća na isto mesto */
      shape = (x) =>
        x.cols
          .map((c) =>
            [
              c.k,
              c.w,
              c.a,
              c.c || "",
              JSON.stringify(c.o || null),
              fxOf(c.k, c.f),
            ].join("/"),
          )
          .join() +
        "#" +
        x.rows.length +
        "#" +
        x.rows.map(rowTintKey).join();
    let hit = false;
    if (shape(old) !== shape(b)) {
      tbPaint(el, b);
      hit = true;
    } else {
      const t = tbT(el),
        ths = headTh(el);
      b.cols.forEach((c, i) => {
        if (c.n === old.cols[i].n) return;
        const hn = ths[i].querySelector(".tb-hn");
        hn.innerHTML = mdInline(c.n);
        hit = hit || hn === ac;
      });
      b.rows.forEach((r, ri) =>
        r.forEach((x, ci) => {
          if (x === old.rows[ri][ci]) return;
          const td = t.tBodies[0].rows[ri].cells[ci];
          hit = hit || td.contains(ac);
          td.innerHTML = tbCell(b.cols[ci].k, x, ci === 0, b.cols[ci].o);
        }),
      );
      tbSum(el);
    }
    if (at && hit) focusCell(el, at.r, at.c, off);
  }
  function keepCell(x) {
    const td = x.closest("td,th"),
      sc = td.closest(".tb-sc"),
      s = sc.getBoundingClientRect();
    let r = td.getBoundingClientRect();
    if (r.right > s.right) sc.scrollLeft += r.right - s.right + 8;
    else if (r.left < s.left + 28) sc.scrollLeft -= s.left + 28 - r.left;
    r = td.getBoundingClientRect();
    const vv = window.visualViewport,
      bot = (vv ? vv.height : innerHeight) - (touch() ? 140 : 70);
    if (r.bottom > bot) scrollBy(0, r.bottom - bot);
    else if (r.top < 90) scrollBy(0, r.top - 90);
  }
  function focusCell(el, r, c, off = Infinity) {
    const x = cellAt(el, r, c);
    if (!x) return null;
    clearSel();
    x.focus({ preventScroll: true });
    /* ćelija sa vrednošću nema kursor: stara selekcija ne sme da ostane u drugoj ćeliji */
    if (isTextCell(x)) setCaret(x, off == null || off < 0 ? Infinity : off);
    else getSelection().removeAllRanges();
    keepCell(x);
    return x;
  }
  /* izmena strukture: pročitaj, izmeni, nacrtaj; fn vraća [red, kolona] za fokus */
  function tbEdit(el, fn) {
    pushUndo();
    const b = tbRead(el),
      at = fn(b);
    tbPaint(el, b);
    changed();
    if (at) return focusCell(el, at[0], at[1]);
    return null;
  }
  function newCol(b) {
    let n = b.cols.length + 1;
    while (b.cols.some((c) => c.n === "Kolona " + n)) n++;
    return { n: "Kolona " + n, k: "text", w: 0, a: "" };
  }
  function addCol(el, at) {
    const h = tbEdit(el, (b) => {
      b.cols.splice(at, 0, newCol(b));
      b.rows.forEach((r) => {
        r.splice(at, 0, "");
        if (r.tc) r.tc.splice(at, 0, "");
      });
      return [-1, at];
    });
    /* naziv je označen: odmah se kuca pravi */
    if (h) {
      const q = document.createRange();
      q.selectNodeContents(h);
      getSelection().removeAllRanges();
      getSelection().addRange(q);
    }
  }
  const addRow = (el, at, ci = 0) =>
    tbEdit(el, (b) => {
      b.rows.splice(
        at,
        0,
        b.cols.map(() => ""),
      );
      return [at, ci];
    });
  function mdPlain(x) {
    const t = document.createElement("template");
    t.innerHTML = mdInline(x);
    return t.content.textContent.replace(/\u200b/g, "");
  }
  /* vrednost ćelije kad kolona promeni tip (prazno ostaje prazno) */
  function conv(from, to, x) {
    if (from === to) return x;
    const d = from === "date" && isoDate(x);
    const p = (
      from === "check"
        ? isChecked(x)
          ? "✓"
          : ""
        : d
          ? `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}.`
          : from === "text" || from === "num"
            ? mdPlain(x)
            : unesc(x)
    )
      .replace(/\s+/g, " ")
      .trim();
    if (!p) return "";
    if (to === "text" || to === "num")
      return from === "text" || from === "num" ? x : escText(p);
    if (to === "check")
      return /^(x|\[x\]|✓|✔|☑|da|yes|true|1|gotovo|done)$/i.test(p)
        ? "[x]"
        : "[ ]";
    if (to === "date") return toIso(p) || escPlain(p);
    return escPlain(p);
  }
  const COLL = new Intl.Collator("sr-Latn", {
    numeric: true,
    sensitivity: "base",
  });
  /* prazne ćelije su uvek na kraju */
  function sortRows(b, ci, dir) {
    const k = b.cols[ci].k;
    const key = (x) => {
      if (k === "check") return isChecked(x) ? 1 : 0;
      if (k === "num") return parseNum(mdPlain(x));
      if (k === "date") return isoDate(x) ? x : null;
      return (k === "text" ? mdPlain(x) : unesc(x)).trim() || null;
    };
    b.rows = b.rows
      .map((r, i) => [key(r[ci] || ""), i, r])
      .sort((a, z) => {
        if (a[0] === null || z[0] === null)
          return a[0] === z[0] ? a[1] - z[1] : a[0] === null ? 1 : -1;
        const d =
          typeof a[0] === "number" ? a[0] - z[0] : COLL.compare(a[0], z[0]);
        return d ? d * dir : a[1] - z[1];
      })
      .map((x) => x[2]);
  }
  /* meni kolone, reda i izbora: isti izgled kao meni bloka (menuEl, pa ga zatvara isto) */
  function tbPlace(M, rect, w) {
    const vv = window.visualViewport,
      vh = vv ? vv.height : innerHeight,
      vt = vv ? vv.offsetTop : 0;
    const W = Math.min(w, innerWidth - 16);
    M.style.width = W + "px";
    M.style.maxHeight = vh - 24 + "px";
    const h = Math.min(M.scrollHeight, vh - 24);
    let y = rect.bottom + 6;
    if (y + h > vt + vh - 8)
      y =
        rect.top - 6 - h >= vt + 8
          ? rect.top - 6 - h
          : Math.max(vt + 8, vt + vh - h - 8);
    M.style.left = Math.max(8, Math.min(rect.left, innerWidth - W - 8)) + "px";
    M.style.top = y + "px";
  }
  function tbMenu(html, anchor, w, fn) {
    closeMenu();
    closeSlash();
    closePicker();
    fbHide();
    const M = (menuEl = document.createElement("div"));
    M.className = "pop nmenu tb-menu";
    M.setAttribute("role", "menu");
    M.innerHTML = html;
    document.body.appendChild(M);
    tbPlace(M, anchor.getBoundingClientRect(), w);
    M.addEventListener(
      "pointerdown",
      (e) => e.target.closest("input") || e.preventDefault(),
    );
    M.addEventListener("click", (e) => {
      const b = e.target.closest("[data-tm]");
      if (!b) return;
      closeMenu();
      fn(b.dataset.tm);
    });
    return M;
  }
  const SORTL = {
    num: ["Od najmanjeg", "Od najvećeg"],
    date: ["Od najranijeg", "Od najkasnijeg"],
    check: ["Prvo neoznačeni", "Prvo označeni"],
  };
  function colMenu(el, ci, anchor) {
    const k = kindAt(el, ci),
      n = headTh(el).length,
      sl = SORTL[k] || ["Sortiraj A → Z", "Sortiraj Z → A"];
    tbMenu(
      `<div class="nm-h">Tip kolone</div><div class="tb-types">${TK.map((id) => `<button type="button" data-tm="k:${id}"${id === k ? ' class="on"' : ""}>${TKS[id][1]}<span>${TKS[id][0]}</span></button>`).join("")}</div><div class="nm-sep"></div>` +
        `<div class="nm-h">Boja kolone</div>${swatches(headTh(el)[ci].dataset.c || "", "bg:")}<div class="nm-sep"></div>` +
        (k === "num"
          ? `<button type="button" data-tm="fx">${I.sum}Računanje<span class="kb">${(FXL[fxOf(k, headTh(el)[ci].dataset.f) || "sum"] || ["Isključeno"])[0]}</span></button><div class="nm-sep"></div>`
          : "") +
        `<button type="button" data-tm="asc">${I.up}${sl[0]}</button><button type="button" data-tm="desc">${I.down}${sl[1]}</button><div class="nm-sep"></div>` +
        `<button type="button" data-tm="ins-l">${I.plus}Nova kolona levo</button><button type="button" data-tm="ins-r">${I.plus}Nova kolona desno</button>` +
        (ci > 0
          ? `<button type="button" data-tm="mv-l">${I.left}Pomeri levo</button>`
          : "") +
        (ci < n - 1
          ? `<button type="button" data-tm="mv-r">${I.right}Pomeri desno</button>`
          : "") +
        (n > 1
          ? `<div class="nm-sep"></div><button type="button" data-tm="cdel" class="danger">${I.trash}Obriši kolonu</button>`
          : ""),
      anchor,
      264,
      (a) => colAct(el, ci, a),
    );
  }
  function colAct(el, ci, a) {
    if (a.startsWith("k:")) {
      const k = a.slice(2);
      if (k !== kindAt(el, ci))
        tbEdit(el, (b) => {
          const c = b.cols[ci],
            from = c.k;
          c.k = k;
          c.a = "";
          c.f = "";
          b.rows.forEach((r) => (r[ci] = conv(from, k, r[ci])));
        });
    } else if (a === "fx")
      calcMenu(el, ci, headTh(el)[ci].querySelector(".tb-ti"));
    else if (a.startsWith("fx:")) {
      const f = fxOf("num", a.slice(3));
      if (f !== (fxOf("num", headTh(el)[ci].dataset.f) || "sum"))
        tbEdit(el, (b) => {
          b.cols[ci].f = f;
        });
    } else if (a === "asc" || a === "desc")
      tbEdit(el, (b) => sortRows(b, ci, a === "asc" ? 1 : -1));
    else if (a === "ins-l" || a === "ins-r")
      addCol(el, a === "ins-r" ? ci + 1 : ci);
    else if (a === "mv-l" || a === "mv-r") {
      const d = a === "mv-l" ? -1 : 1;
      tbEdit(el, (b) => {
        const sw = (x) => ([x[ci], x[ci + d]] = [x[ci + d], x[ci]]);
        sw(b.cols);
        b.rows.forEach((r) => {
          sw(r);
          if (r.tc) sw(r.tc);
        });
      });
    } else if (a === "cdel")
      tbEdit(el, (b) => {
        b.cols.splice(ci, 1);
        b.rows.forEach((r) => {
          r.splice(ci, 1);
          if (r.tc) r.tc.splice(ci, 1);
        });
      });
    else if (a.startsWith("bg:")) {
      const id = a.slice(3);
      tbEdit(el, (b) => {
        b.cols[ci].c = id;
        /* poslednja izabrana boja se vidi: i preko obojenih redova i ćelija */
        b.rows.forEach((r) => {
          if (id && r.bg) {
            r.tc = r.tc || b.cols.map(() => "");
            r.tc[ci] = id;
          } else if (r.tc) r.tc[ci] = "";
        });
      });
    }
  }
  function rowMenu(el, r, anchor) {
    const n = rowsN(el);
    tbMenu(
      `<div class="nm-h">Boja reda</div>${swatches(tbT(el).tBodies[0].rows[r].dataset.c || "", "bg:")}<div class="nm-sep"></div>` +
        `<button type="button" data-tm="above">${I.plus}Novi red iznad</button><button type="button" data-tm="below">${I.plus}Novi red ispod<span class="kb">${MOD}↵</span></button><button type="button" data-tm="dup">${I.dup}Dupliraj red<span class="kb">${MOD}D</span></button>` +
        (r > 0
          ? `<button type="button" data-tm="rup">${I.up}Pomeri gore</button>`
          : "") +
        (r < n - 1
          ? `<button type="button" data-tm="rdown">${I.down}Pomeri dole</button>`
          : "") +
        `<div class="nm-sep"></div><button type="button" data-tm="rdel" class="danger">${I.trash}Obriši red</button>`,
      anchor,
      236,
      (a) => rowAct(el, r, a),
    );
  }
  function rowAct(el, r, a) {
    if (a === "above" || a === "below") addRow(el, a === "below" ? r + 1 : r);
    else if (a === "dup")
      tbEdit(el, (b) => {
        const o = b.rows[r],
          n = o.slice();
        if (o.bg) n.bg = o.bg;
        if (o.tc) n.tc = o.tc.slice();
        b.rows.splice(r + 1, 0, n);
        return [r + 1, 0];
      });
    else if (a === "rup" || a === "rdown") {
      const d = a === "rup" ? -1 : 1;
      tbEdit(el, (b) => {
        [b.rows[r], b.rows[r + d]] = [b.rows[r + d], b.rows[r]];
      });
    } else if (a === "rdel")
      tbEdit(el, (b) => {
        b.rows.splice(r, 1);
      });
    else if (a.startsWith("bg:"))
      tbEdit(el, (b) => {
        const row = b.rows[r];
        delete row.tc;
        if (a.length > 3) row.bg = a.slice(3);
        else delete row.bg;
      });
  }
  /* mreža boja za meni: tag + id boje je akcija, sam tag znači bez boje */
  function swatches(cur, tag, none = "Bez boje") {
    const one = (id, label, hex) =>
      `<button type="button" data-tm="${tag}${id}"${hex ? ` style="--tn:${hex}"` : ""} class="${id ? "" : "none"}${cur === id ? " on" : ""}" title="${label}" aria-label="${label}"${cur === id ? ' aria-current="true"' : ""}>${cur === id ? I.check : ""}</button>`;
    return `<div class="tb-sw">${one("", none)}${TINTS.map(([id, label, hex]) => one(id, label, hex)).join("")}</div>`;
  }
  function cellMenu(el, r, ci, anchor) {
    const td = tbT(el).tBodies[0].rows[r].cells[ci],
      own = td.dataset.c || "",
      cur =
        own === "none"
          ? ""
          : own || td.parentElement.dataset.c || headTh(el)[ci].dataset.c || "";
    tbMenu(
      `<div class="nm-h">Boja ćelije</div>${swatches(cur, "cc:")}`,
      anchor,
      236,
      (a) =>
        tbEdit(el, (b) => {
          const row = b.rows[r],
            id = a.slice(3);
          row.tc = row.tc || b.cols.map(() => "");
          /* bez boje u obojenom redu ili koloni znači baš bez boje, ne njihovu boju */
          row.tc[ci] = id || (row.bg || b.cols[ci].c ? "none" : "");
          return [r, ci];
        }),
    );
  }
  /* boja opcije izbora važi za celu kolonu; izbor se odmah vraća, sa novom bojom */
  function optMenu(st, v) {
    const c = cellAt(st.el, st.r, st.ci);
    if (!c) return;
    const f = fold(v),
      m = thOpts(headTh(st.el)[st.ci]) || {},
      M = tbMenu(
        `<div class="nm-h">Boja opcije</div><div class="tb-pv"><span class="tb-pill" style="--c:${optColor(v, m)}">${esc(v)}</span></div>${swatches(tintId(m[f]), "oc:", "Automatska")}`,
        c.closest("td"),
        236,
        (a) => {
          const id = a.slice(3);
          tbEdit(st.el, (b) => {
            const o = { ...(b.cols[st.ci].o || {}) };
            if (id) o[f] = id;
            else delete o[f];
            b.cols[st.ci].o = optMap(o);
          });
          const x = cellAt(st.el, st.r, st.ci);
          if (x) openPick(x, st.q);
        },
      );
    M.querySelector(".tb-sw .on").focus({ preventScroll: true });
  }
  /* upis izabrane vrednosti (izbor/osoba: tekst, datum: ISO, kvačica: true/false) */
  function setVal(c, v) {
    const el = c.closest(".nb"),
      { c: ci } = cellRC(c),
      k = kindAt(el, ci);
    const md =
      k === "check"
        ? v
          ? "[x]"
          : "[ ]"
        : k === "date"
          ? v || ""
          : escPlain(
              String(v || "")
                .replace(/\s+/g, " ")
                .trim(),
            );
    if (md === (c.dataset.v || "")) return c;
    pushUndo();
    const td = c.closest("td");
    td.innerHTML = tbCell(k, md, ci === 0, thOpts(headTh(el)[ci]));
    changed();
    return td.querySelector(".tb-c");
  }
  function toggleCheck(c) {
    const n = setVal(c, !isChecked(c.dataset.v));
    n.focus({ preventScroll: true });
    if (!reduce && isChecked(n.dataset.v)) n.classList.add("ckpop");
  }
  /* izbor / osoba: lista opcija iz kolone (ili tima) + pretraga koja pravi novu opciju */
  function openPick(c, q) {
    const el = c.closest(".nb"),
      { r, c: ci } = cellRC(c),
      k = kindAt(el, ci);
    let opts;
    if (k === "who") opts = X.TEAM.map((u) => u.name);
    else {
      const seen = new Map();
      for (const tr of tbT(el).tBodies[0].rows) {
        const x = tr.cells[ci] && tr.cells[ci].querySelector(".tb-c"),
          v = x ? unesc(x.dataset.v || "").trim() : "";
        if (v && !seen.has(fold(v))) seen.set(fold(v), v);
      }
      opts = [...seen.values()];
      if (
        !opts.length &&
        /status|stanje|faza|progres/.test(fold(headTh(el)[ci].textContent))
      )
        opts = ["Nije počelo", "U toku", "Gotovo"];
    }
    const st = {
      el,
      r,
      ci,
      k,
      opts,
      o: thOpts(headTh(el)[ci]),
      cur: unesc(c.dataset.v || "").trim(),
      q: q || "",
      idx: 0,
      items: [],
    };
    st.M = tbMenu(
      (k === "sel"
        ? `<input class="tb-pq" type="text" placeholder="Traži ili dodaj opciju…" autocomplete="off" spellcheck="false" aria-label="Opcija">`
        : "") + `<div class="tb-pl" role="listbox"></div>`,
      c.closest("td"),
      264,
      (a) =>
        a[0] === "c"
          ? optMenu(st, st.items[+a.slice(2)].v)
          : pickApply(st, st.items[+a.slice(2)]),
    );
    TP = st;
    paintPick(st);
    const inp = st.M.querySelector(".tb-pq");
    if (inp) {
      inp.value = st.q;
      inp.addEventListener("input", () => {
        st.q = inp.value;
        st.idx = 0;
        paintPick(st);
      });
      inp.addEventListener("keydown", (e) => pickKey(e, st));
      /* na telefonu tastatura tek kad se dodirne polje (izbor je češći od kucanja) */
      if (!touch() || q) inp.focus({ preventScroll: true });
    }
  }
  function paintPick(st) {
    const f = fold(st.q.trim()),
      nq = st.q.trim().replace(/\s+/g, " ");
    st.items = st.opts
      .filter((o) => !f || fold(o).includes(f))
      .map((v) => ({ v }));
    if (st.k === "sel" && nq && !st.opts.some((o) => fold(o) === f))
      st.items.push({ v: nq, add: true });
    if (st.cur) st.items.push({ clear: true });
    st.idx = Math.min(st.idx, Math.max(0, st.items.length - 1));
    const lab = (v) =>
      st.k === "who"
        ? tbVal("who", escPlain(v))
        : `<span class="tb-pill" style="--c:${optColor(v, st.o)}">${esc(v)}</span>`;
    st.M.querySelector(".tb-pl").innerHTML =
      st.items
        .map(
          (it, i) =>
            `<div class="tb-po"><button type="button" role="option" data-tm="p:${i}" class="${i === st.idx ? "on" : ""}${it.clear ? " tb-pclr" : ""}">${
              it.clear
                ? `${I.trash}Ukloni`
                : (it.add ? `<span class="tb-pnew">Dodaj</span>` : "") +
                  lab(it.v) +
                  (!it.add && fold(it.v) === fold(st.cur)
                    ? `<span class="tb-pok">${I.check}</span>`
                    : "")
            }</button>${st.k === "sel" && !it.clear && !it.add ? `<button type="button" class="tb-pc" data-tm="c:${i}" title="Boja opcije" aria-label="Boja opcije ${esc(it.v)}">${I.tint}</button>` : ""}</div>`,
        )
        .join("") ||
      `<div class="tb-pnone">${st.k === "sel" ? "Ukucaj naziv nove opcije" : "Nema rezultata"}</div>`;
  }
  /* tastatura u izboru (iz polja za pretragu ili iz same ćelije) */
  function pickKey(e, st) {
    const k = e.key;
    if (k === "ArrowDown" || k === "ArrowUp") {
      e.preventDefault();
      if (st.items.length)
        st.idx =
          (st.idx + (k === "ArrowDown" ? 1 : -1) + st.items.length) %
          st.items.length;
      st.M.querySelectorAll('[data-tm^="p:"]').forEach((b, i) =>
        b.classList.toggle("on", i === st.idx),
      );
      const on = st.M.querySelector(".on");
      if (on) on.scrollIntoView({ block: "nearest" });
      return true;
    }
    if (k === "Enter") {
      e.preventDefault();
      const it = st.items[st.idx];
      closeMenu();
      if (it) pickApply(st, it);
      else focusCell(st.el, st.r, st.ci);
      return true;
    }
    if (k === "Escape" || k === "Tab") {
      e.preventDefault();
      e.stopPropagation();
      closeMenu();
      focusCell(st.el, st.r, st.ci);
      return true;
    }
    return false;
  }
  function pickApply(st, it) {
    const c = cellAt(st.el, st.r, st.ci);
    if (!c || !it) return;
    const n = setVal(c, it.clear ? "" : it.v);
    if (n) n.focus({ preventScroll: true });
  }
  /* datum: sistemski izbor datuma preko ćelije (telefon dobija svoj točkić) */
  function openDate(c) {
    const td = c.closest("td"),
      el = c.closest(".nb"),
      at = cellRC(c),
      v0 = isoDate(c.dataset.v) ? c.dataset.v : "";
    root.querySelectorAll(".tb-di").forEach((x) => x.remove());
    const inp = document.createElement("input");
    inp.type = "date";
    inp.className = "tb-di";
    inp.tabIndex = -1;
    inp.value = v0;
    td.appendChild(inp);
    let done = false;
    const apply = () => {
      if (done || inp.value === v0) return;
      done = true;
      const v = inp.value,
        x = cellAt(el, at.r, at.c);
      inp.remove();
      const n = x && setVal(x, v);
      if (n) n.focus({ preventScroll: true });
    };
    inp.addEventListener("change", apply);
    inp.addEventListener("blur", () => {
      apply();
      setTimeout(() => inp.remove(), 0);
    });
    try {
      inp.showPicker();
    } catch (e) {
      inp.focus();
    }
  }
  function activate(c) {
    const el = c.closest(".nb"),
      { r, c: ci } = cellRC(c);
    if (r < 0) return;
    const k = kindAt(el, ci);
    if (k === "check") toggleCheck(c);
    else if (k === "date") openDate(c);
    else if (k === "sel" || k === "who") openPick(c);
  }
  /* gore/dole van tabele: susedni blok (ili naslov / novi red ispod) */
  function vMove(el, r, ci, d, grow) {
    const R = r + d,
      n = rowsN(el);
    if (R >= -1 && R < n) {
      focusCell(el, R, ci);
      return;
    }
    if (d > 0 && grow) {
      addRow(el, n, ci);
      return;
    }
    const x = (cellAt(el, r, ci) || el).getBoundingClientRect().left + 10,
      nx = sibText(el, d);
    if (nx) caretToX(nx, x, d > 0);
    else if (d < 0) {
      titleEl.focus();
      setCaret(titleEl, Infinity);
    } else insertP(el);
  }
  function tabMove(el, r, ci, d) {
    const nc = headTh(el).length;
    let R = r,
      C = ci + d;
    if (C >= nc) ((C = 0), R++);
    else if (C < 0) ((C = nc - 1), R--);
    if (R < -1) return;
    if (R >= rowsN(el)) addRow(el, R, 0);
    else focusCell(el, R, C);
  }
  /* iz bloka iznad/ispod u tabelu: kolona ispod kursora, prvi ili poslednji red */
  function tbEnter(el, x, top) {
    const ths = headTh(el);
    let ci = ths.findIndex((th) => x < th.getBoundingClientRect().right);
    if (ci < 0) ci = ths.length - 1;
    return focusCell(el, top ? -1 : rowsN(el) - 1, ci, top ? 0 : Infinity);
  }
  function gridOf(tb) {
    const rows = [...tb.querySelectorAll("tr")]
      .filter((tr) => tr.closest("table") === tb)
      .map((tr) =>
        [...tr.children]
          .filter((x) => /^T[DH]$/.test(x.tagName))
          .map((x) => inlineMd(x, { collapse: true }).trim()),
      )
      .filter((r) => r.length);
    const n = Math.max(0, ...rows.map((r) => r.length));
    return n
      ? rows.map((r) => Array.from({ length: n }, (_, i) => r[i] || ""))
      : null;
  }
  /* nalepljena tabela (Sheets, Excel, Numbers, TSV) puni ćelije od ove nadalje */
  function pasteGrid(el, r0, c0, grid) {
    tbEdit(el, (b) => {
      const need = (ci) => {
        while (b.cols.length <= ci) {
          b.cols.push(newCol(b));
          b.rows.forEach((r) => r.push(""));
        }
      };
      let g = grid,
        r = r0,
        last = [r0, c0];
      if (r < 0) {
        g[0].forEach((x, j) => {
          need(c0 + j);
          b.cols[c0 + j].n = x.replace(/\s*\n\s*/g, " ");
        });
        g = g.slice(1);
        r = 0;
      }
      g.forEach((row, i) => {
        while (b.rows.length <= r + i) b.rows.push(b.cols.map(() => ""));
        row.forEach((x, j) => {
          need(c0 + j);
          b.rows[r + i][c0 + j] = conv("text", b.cols[c0 + j].k, x);
          last = [r + i, c0 + j];
        });
      });
      return last;
    });
  }
  const TSV = (s) => {
    const ls = s.replace(/\n+$/, "").split("\n");
    return ls.length > 1 && ls.every((l) => l.includes("\t"))
      ? ls.map((l) => l.split("\t").map((x) => escText(x.trim())))
      : null;
  };
  /* tip kolone nalepljene tabele: samo kvačice, samo datumi (bar jedan sa godinom) ili
     samo brojevi (i sa € / din / %); sve ostalo je tekst */
  function guessKind(vals) {
    const v = vals.map((x) => mdPlain(x).trim()).filter(Boolean);
    if (!v.length) return "text";
    if (v.every((x) => /^(\[[ xX]\]|[✓✔☑☐])$/.test(x))) return "check";
    if (v.every((x) => toIso(x)) && v.some((x) => /\d{4}/.test(x)))
      return "date";
    if (
      v.every((x) =>
        /^[-+]?[\d\s.,]*\d[\d\s.,]*\s?(€|eur|rsd|din\.?|\$|%|km)?$/i.test(x),
      )
    )
      return "num";
    return "text";
  }
  function tbFromGrid(g) {
    const n = g[0].length,
      rows = g
        .slice(1)
        .map((r) => Array.from({ length: n }, (_, i) => r[i] || ""));
    const cols = g[0].map((x, i) => ({
      n: x.replace(/\s*\n\s*/g, " ") || "Kolona " + (i + 1),
      k: guessKind(rows.map((r) => r[i])),
      w: 0,
      a: "",
    }));
    cols.forEach((c, i) => {
      if (c.k !== "text") rows.forEach((r) => (r[i] = conv("text", c.k, r[i])));
    });
    return { t: "tbl", cols, rows };
  }
  const tbNew = () => ({
    t: "tbl",
    cols: [
      { n: "Naziv", k: "text", w: 0, a: "" },
      { n: "Status", k: "sel", w: 0, a: "" },
      { n: "Datum", k: "date", w: 0, a: "" },
    ],
    rows: [0, 1, 2].map(() => ["", "", ""]),
  });

  onRoot("keydown", (e) => {
    if (SP || e.isComposing || e.keyCode === 229) return;
    const c = e.target.closest && e.target.closest(".tb-c");
    if (!c || !root.contains(c)) return;
    if (SL && slashKey(e)) return;
    if (isTextCell(c) && relKey(e, c)) return;
    const el = c.closest(".nb"),
      { r, c: ci } = cellRC(c),
      k = e.key,
      mod = e.metaKey || e.ctrlKey,
      low = k.length === 1 ? k.toLowerCase() : k,
      txt = isTextCell(c),
      kind = r < 0 ? "text" : kindAt(el, ci);
    if (TP && TP.el === el && TP.r === r && TP.ci === ci && pickKey(e, TP))
      return;
    if (mod && !e.altKey) {
      if (low === "z") {
        e.preventDefault();
        e.shiftKey ? redo() : undo();
      } else if (low === "y") {
        e.preventDefault();
        redo();
      } else if (low === "s" && !e.shiftKey) {
        e.preventDefault();
        flush();
      } else if (low === "d" && !e.shiftKey) {
        e.preventDefault();
        if (r >= 0) rowAct(el, r, "dup");
      } else if (k === "Enter") {
        e.preventDefault();
        addRow(el, r + 1, ci);
      } else if (!txt && low === "a") {
        e.preventDefault();
        selectBlocks([el]);
      } else if (txt && !e.shiftKey && (low === "b" || low === "i")) {
        e.preventDefault();
        mark(low === "b" ? "bold" : "italic");
      } else if (txt && !e.shiftKey && low === "u") e.preventDefault();
      else if (txt && e.shiftKey && (low === "s" || low === "x")) {
        e.preventDefault();
        mark("strikeThrough");
      } else if (txt && !e.shiftKey && low === "e") {
        e.preventDefault();
        markCode();
      } else if (txt && !e.shiftKey && low === "k") {
        e.preventDefault();
        linkPrompt();
      }
      return;
    }
    if (k === "Escape") {
      e.preventDefault();
      selectBlocks([el]);
      return;
    }
    if (k === "Tab") {
      e.preventDefault();
      tabMove(el, r, ci, e.shiftKey ? -1 : 1);
      return;
    }
    if (k === "Enter" && !e.altKey) {
      e.preventDefault();
      if (e.shiftKey) {
        if (txt && r >= 0) softBreak(c);
      } else if (!txt && kind !== "check") activate(c);
      else vMove(el, r, ci, 1, true);
      return;
    }
    if (!txt) {
      if (k === " ") {
        e.preventDefault();
        activate(c);
        return;
      }
      if ((k === "Backspace" || k === "Delete") && r >= 0) {
        e.preventDefault();
        const n = setVal(c, kind === "check" ? false : "");
        if (n) n.focus({ preventScroll: true });
        return;
      }
      if (k.length === 1 && !e.altKey && (kind === "sel" || kind === "who")) {
        e.preventDefault();
        openPick(c, kind === "sel" ? k : "");
        return;
      }
    }
    if ((k === "ArrowUp" || k === "ArrowDown") && !e.shiftKey && !e.altKey) {
      const up = k === "ArrowUp";
      if (txt && (!getSelection().isCollapsed || !lineEdge(c, up))) return;
      e.preventDefault();
      vMove(el, r, ci, up ? -1 : 1);
      return;
    }
    if ((k === "ArrowLeft" || k === "ArrowRight") && !e.shiftKey && !e.altKey) {
      const left = k === "ArrowLeft",
        to = ci + (left ? -1 : 1);
      if (
        txt &&
        (!getSelection().isCollapsed || caretOff(c) !== (left ? 0 : lenOf(c)))
      )
        return;
      if (cellAt(el, r, to)) {
        e.preventDefault();
        focusCell(el, r, to, left ? Infinity : 0);
      }
    }
  });
  /* telefon: Enter i novi red stižu samo kao beforeinput */
  onRoot("beforeinput", (e) => {
    if (SP || e.defaultPrevented) return;
    const c = e.target.closest && e.target.closest(".tb-c");
    if (!c || !root.contains(c)) return;
    const it = e.inputType;
    if (/^history/.test(it)) return;
    if (it === "insertParagraph" && !composing) {
      e.preventDefault();
      const p = cellRC(c);
      vMove(c.closest(".nb"), p.r, p.c, 1, true);
      return;
    }
    if (it === "insertLineBreak") {
      e.preventDefault();
      if (cellRC(c).r >= 0) softBreak(c);
      return;
    }
    noteTyping(c);
  });
  onRoot("input", (e) => {
    const c = e.target.closest && e.target.closest(".tb-c");
    if (!c || !root.contains(c)) return;
    if (isEmpty(c) && c.firstChild) c.replaceChildren();
    if (
      !composing &&
      e.inputType === "insertText" &&
      e.data &&
      "*_~`".includes(e.data)
    )
      inlineShortcut(c, e.data);
    const el = c.closest(".nb"),
      p = cellRC(c);
    if (
      !composing &&
      e.data === "@" &&
      !SL &&
      !isScript() &&
      p.r >= 0 &&
      kindAt(el, p.c) === "text"
    )
      openSlash(c, "@");
    else if (SL) updateSlash();
    changed();
    if (p.r >= 0 && kindAt(el, p.c) === "num") tbSum(el);
  });
  onRoot("paste", (e) => {
    if (SP) return;
    const c = e.target.closest && e.target.closest(".tb-c"),
      cd = e.clipboardData;
    if (!c || !cd || !root.contains(c)) return;
    e.preventDefault();
    const el = c.closest(".nb"),
      at = cellRC(c),
      html = cd.getData("text/html") || "",
      plain = (cd.getData("text/plain") || "")
        .replace(/\r\n?/g, "\n")
        .replace(/\n+$/, "");
    let grid = null;
    if (/<table/i.test(html)) {
      const tp = document.createElement("template");
      tp.innerHTML = html;
      const tb = tp.content.querySelector("table");
      if (tb) grid = gridOf(tb);
    }
    if (!grid && (plain.includes("\t") || (!html && plain.includes("\n"))))
      grid = plain
        .split("\n")
        .map((l) => l.split("\t").map((x) => escText(x.trim())));
    if (grid && (grid.length > 1 || grid[0].length > 1)) {
      pasteGrid(el, at.r, at.c, grid);
      return;
    }
    const one = (grid ? mdPlain(grid[0][0]) : plain)
      .replace(/\s*\n\s*/g, " ")
      .trim();
    if (!isTextCell(c)) {
      if (at.r < 0) return;
      const k = kindAt(el, at.c),
        n = setVal(
          c,
          k === "check"
            ? isChecked(conv("text", "check", escText(one)))
            : k === "date"
              ? toIso(one) || escPlain(one)
              : one,
        );
      if (n) n.focus({ preventScroll: true });
      return;
    }
    pushUndo();
    if (/^https?:\/\/\S+$/.test(one) && !getSelection().isCollapsed) {
      document.execCommand("createLink", false, one);
      getSelection().collapseToEnd();
      changed();
      return;
    }
    document.execCommand("insertText", false, one);
  });
  onRoot("click", (e) => {
    const nb = e.target.closest(".nb");
    if (!nb || nb.dataset.t !== "tbl" || !e.target.closest(".nb-tbl")) return;
    let b;
    if ((b = e.target.closest(".tb-ti")))
      colMenu(nb, b.closest("th").cellIndex, b);
    else if ((b = e.target.closest(".tb-rh")))
      rowMenu(nb, b.closest("tr").sectionRowIndex, b);
    else if ((b = e.target.closest(".tb-cb"))) {
      const td = b.closest("td");
      cellMenu(nb, td.parentElement.sectionRowIndex, td.cellIndex, b);
    } else if ((b = e.target.closest(".tb-fx")))
      calcMenu(nb, b.closest("td").cellIndex, b);
    else if (e.target.closest(".tb-addc")) addCol(nb, headTh(nb).length);
    else if (e.target.closest(".tb-addr")) addRow(nb, rowsN(nb));
    else if ((b = e.target.closest(".tb-more")))
      openMenu(nb, b.getBoundingClientRect());
    else if ((b = e.target.closest(".tb-v"))) {
      getSelection().removeAllRanges();
      activate(b);
    } else if ((b = e.target.closest(".tb-c a[href]:not(.nb-rel)"))) {
      e.preventDefault();
      if (e.metaKey || e.ctrlKey) openHref(b.getAttribute("href"));
    }
  });
  /* dugme za boju ćelije ne uzima fokus: kursor i tastatura na telefonu ostaju */
  onRoot("mousedown", (e) => {
    if (e.target.closest && e.target.closest(".tb-cb")) e.preventDefault();
  });
  onRoot("mouseover", (e) => {
    const a =
      e.target.closest && e.target.closest(".tb-c a[href]:not(.nb-rel)");
    if (a && !a.title) a.title = MOD + "klik otvara link";
  });
  /* širina kolone: ručka na desnoj ivici zaglavlja. Prvo prevlačenje zamrzne sve kolone
     na trenutne širine u px; dupli klik vraća automatsku širinu cele tabele */
  onRoot(
    "pointerdown",
    (e) => {
      const h = e.target.closest(".tb-rz");
      if (!h || e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      const th = h.closest("th"),
        t = th.closest("table"),
        ths = [...th.parentElement.cells],
        cols = t.querySelectorAll("col"),
        px = ths.map((x) => Math.round(x.getBoundingClientRect().width)),
        ci = th.cellIndex,
        x0 = e.clientX,
        sum0 = px.reduce((a, w) => a + w, 0);
      let w = 0;
      try {
        h.setPointerCapture(e.pointerId);
      } catch (err) {}
      t.classList.add("rz");
      const move = (ev) => {
        w = Math.round(Math.max(56, Math.min(800, px[ci] + ev.clientX - x0)));
        px.forEach((v, i) => (cols[i].style.width = (i === ci ? w : v) + "px"));
        t.style.minWidth = "";
        t.style.width = sum0 - px[ci] + w + "px";
      };
      const up = () => {
        h.removeEventListener("pointermove", move);
        h.removeEventListener("pointerup", up);
        h.removeEventListener("pointercancel", up);
        t.classList.remove("rz");
        const el = th.closest(".nb");
        if (!w) return;
        if (w === px[ci]) {
          tbPaint(el, tbRead(el));
          return;
        }
        pushUndo();
        ths.forEach((x, i) => (x.dataset.w = i === ci ? w : px[i]));
        tbPaint(el, tbRead(el));
        changed();
      };
      h.addEventListener("pointermove", move);
      h.addEventListener("pointerup", up);
      h.addEventListener("pointercancel", up);
    },
    true,
  );
  onRoot("dblclick", (e) => {
    const h = e.target.closest(".tb-rz"),
      el = h && h.closest(".nb");
    if (!el || !tbT(el).classList.contains("fixed")) return;
    pushUndo();
    headTh(el).forEach((x) => delete x.dataset.w);
    tbPaint(el, tbRead(el));
    changed();
  });

  /* ---------------- tekst preko više blokova ----------------
     svaki blok je zaseban contenteditable i browser ne pušta selekciju van njega;
     kad selekcija pređe u drugi blok, ceo root privremeno postaje jedan editor
     (SP), pa rade obično označavanje, kopiranje i bold preko više redova */
  let DS = null,
    justSel = false;
  function spanOn(an, ao, fn, fo) {
    if (!SP) {
      SP = true;
      root.contentEditable = "true";
      root.classList.add("span");
      root.focus({ preventScroll: true });
    }
    getSelection().setBaseAndExtent(an, ao, fn, fo);
  }
  function spanOff() {
    if (!SP) return;
    SP = false;
    root.removeAttribute("contenteditable");
    root.classList.remove("span");
  }
  const tAt = (n) => {
    const e = n && (n.nodeType === 1 ? n : n.parentElement);
    return e && root.contains(e) ? e.closest(".nb-t") : null;
  };
  /* izlaz iz SP kad je selekcija opet u jednom bloku */
  function spanCheck(force) {
    if (!SP || DS) return;
    const s = getSelection();
    if (!s.rangeCount || !root.contains(s.anchorNode)) return spanOff();
    const t = tAt(s.anchorNode);
    /* na telefonu tek na tap (click), da fokus ne zatvori tastaturu */
    if (t !== tAt(s.focusNode) || (touch() && !force)) return;
    const an = s.anchorNode,
      ao = s.anchorOffset,
      fn = s.focusNode,
      fo = s.focusOffset;
    spanOff();
    if (t) {
      t.focus({ preventScroll: true });
      s.setBaseAndExtent(an, ao, fn, fo);
    } else if (s.isCollapsed && tOf(blockOf(an))) focusBlock(blockOf(an), 0); // kursor na oznaci liste
  }
  /* deo selekcije u svakom tekstualnom bloku: [{ el, t, r }] */
  function spanParts() {
    const s = getSelection();
    if (!s.rangeCount) return [];
    const r = s.getRangeAt(0),
      out = [];
    for (const el of blocks()) {
      const t = tOf(el);
      if (!t || !r.intersectsNode(t)) continue;
      const q = document.createRange();
      q.selectNodeContents(t);
      if (q.compareBoundaryPoints(Range.START_TO_START, r) < 0)
        q.setStart(r.startContainer, r.startOffset);
      if (q.compareBoundaryPoints(Range.END_TO_END, r) > 0)
        q.setEnd(r.endContainer, r.endOffset);
      out.push({ el, t, r: q });
    }
    return out;
  }
  /* briše označeno: prvi blok zadržava početak, poslednji daje kraj, sve između nestaje */
  function spanDel() {
    const ps = spanParts();
    spanOff();
    if (!ps.length) return null;
    const a = ps[0],
      z = ps[ps.length - 1];
    a.r.deleteContents();
    if (z !== a) {
      z.r.deleteContents();
      const bs = blocks();
      bs.slice(bs.indexOf(a.el) + 1, bs.indexOf(z.el)).forEach((e) =>
        e.remove(),
      );
      merge(a.el, z.el);
    } else {
      a.t.focus({ preventScroll: true });
      const s = getSelection();
      s.removeAllRanges();
      s.addRange(a.r);
    }
    if (isEmpty(a.t)) a.t.replaceChildren();
    renum();
    changed();
    return a.t;
  }
  /* bold/italic/precrtano po blokovima, da ne dira oznake lista i dugmad */
  function spanMark(cmd) {
    const ps = spanParts().filter(
      (p) => !p.r.collapsed && p.el.dataset.t !== "code",
    );
    if (!ps.length) return;
    pushUndo();
    const s = getSelection();
    const pick = (r) => {
      s.removeAllRanges();
      s.addRange(r);
    };
    try {
      document.execCommand("styleWithCSS", false, false);
    } catch (e) {}
    const want = ps.some((p) => {
      pick(p.r);
      return !document.queryCommandState(cmd);
    });
    const done = ps.map((p) => {
      pick(p.r);
      if (document.queryCommandState(cmd) !== want) document.execCommand(cmd);
      return s.getRangeAt(0).cloneRange();
    });
    const a = done[0],
      z = done[done.length - 1];
    s.setBaseAndExtent(
      a.startContainer,
      a.startOffset,
      z.endContainer,
      z.endOffset,
    );
    changed();
  }
  const SPTAG = {
    h1: "h1",
    h2: "h2",
    h3: "h3",
    quote: "blockquote",
    code: "pre",
  };
  function spanCopy(e) {
    const ps = spanParts().filter(
      (p, i, a) => !p.r.collapsed || (i > 0 && i < a.length - 1),
    );
    if (!ps.length || !e.clipboardData) return false;
    e.preventDefault();
    e.clipboardData.setData(
      "text/plain",
      ps.map((p) => p.r.toString().replace(/​/g, "")).join("\n"),
    );
    const box = document.createElement("div");
    e.clipboardData.setData(
      "text/html",
      ps
        .map((p) => {
          const g = SPTAG[p.el.dataset.t] || "p";
          box.replaceChildren(p.r.cloneContents());
          return `<${g}>${box.innerHTML}</${g}>`;
        })
        .join(""),
    );
    return true;
  }
  /* tačka u tekstu ispod pokazivača; van teksta: početak/kraj najbližeg bloka */
  function pointFrom(x, y) {
    let n = null,
      o = 0;
    if (document.caretPositionFromPoint) {
      const p = document.caretPositionFromPoint(x, y);
      if (p) ((n = p.offsetNode), (o = p.offset));
    } else if (document.caretRangeFromPoint) {
      const q = document.caretRangeFromPoint(x, y);
      if (q) ((n = q.startContainer), (o = q.startOffset));
    }
    if (tAt(n)) return [n, o];
    const b = blockAtY(y),
      t = b && (tOf(b) || tOf(sibText(b, 1) || sibText(b, -1)));
    if (!t) return null;
    const r = t.getBoundingClientRect();
    return pointAt(
      t,
      y < r.top || (y <= r.bottom && x < r.left) ? 0 : Infinity,
    );
  }
  function spanTo(x, y) {
    const s = getSelection(),
      p = pointFrom(x, y);
    if (!p || !s.rangeCount || !root.contains(s.anchorNode)) return false;
    spanOn(s.anchorNode, s.anchorOffset, p[0], p[1]);
    return true;
  }
  onRoot("pointerdown", (e) => {
    justSel = false;
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    if (e.target.closest(".nb-g,.nb-ck,.nb-ci,.nb-cbar,.nb-x,.nb-tbl,.nb-rel"))
      return;
    if (e.shiftKey && spanTo(e.clientX, e.clientY)) {
      e.preventDefault();
      justSel = true;
      return;
    }
    DS = { a: blockAtY(e.clientY), on: false };
  });
  document.addEventListener("pointermove", (e) => {
    if (!DS || !(e.buttons & 1)) return;
    if (!DS.on) {
      if (blockAtY(e.clientY) === DS.a) return;
      DS.on = true;
    }
    spanTo(e.clientX, e.clientY);
  });
  document.addEventListener("pointerup", () => {
    if (!DS) return;
    if (DS.on) justSel = true;
    DS = null;
    spanCheck();
  });
  /* Shift+strelica sa ivice bloka nastavlja u susedni blok */
  function spanLine(t, up) {
    const s = getSelection(),
      nx = sibText(t.parentElement, up ? -1 : 1);
    if (!s.rangeCount || !nx) return false;
    const f = document.createRange();
    f.setStart(s.focusNode, s.focusOffset);
    const rc = f.getClientRects()[0],
      b = textBox(t);
    if (
      rc &&
      (up ? rc.top - b.top >= b.lh * 0.7 : b.bottom - rc.bottom >= b.lh * 0.7)
    )
      return false;
    /* tačka na istoj visini x u prvom/poslednjem redu suseda (modify("line") ne prelazi blok pouzdano) */
    nx.scrollIntoView({ block: "nearest" });
    const n = textBox(tOf(nx)),
      half = Math.min(n.lh, n.bottom - n.top) / 2,
      p = pointFrom(
        rc ? rc.left : t.getBoundingClientRect().left,
        up ? n.bottom - half : n.top + half,
      );
    if (!p) return false;
    spanOn(s.anchorNode, s.anchorOffset, p[0], p[1]);
    return true;
  }
  function spanAll() {
    const ts = blocks().map(tOf).filter(Boolean),
      z = ts[ts.length - 1];
    if (ts.length) spanOn(ts[0], 0, z, z.childNodes.length);
  }
  onRoot("keydown", (e) => {
    if (!SP || e.isComposing || e.keyCode === 229) return;
    const k = e.key,
      mod = e.metaKey || e.ctrlKey,
      low = k.length === 1 ? k.toLowerCase() : k;
    if (k === "Escape") {
      e.preventDefault();
      getSelection().collapseToEnd();
    } else if (k === "Tab") e.preventDefault();
    else if (mod && !e.altKey) {
      if (!e.shiftKey && (low === "b" || low === "i")) {
        e.preventDefault();
        spanMark(low === "b" ? "bold" : "italic");
      } else if (e.shiftKey && (low === "s" || low === "x")) {
        e.preventDefault();
        spanMark("strikeThrough");
      } else if (low === "z") {
        e.preventDefault();
        e.shiftKey ? redo() : undo();
      } else if (low === "y") {
        e.preventDefault();
        redo();
      } else if (low === "a") {
        e.preventDefault();
        spanAll();
      } else if ("uek".includes(low) || low === "d") e.preventDefault();
    }
  });
  onRoot("copy", (e) => SP && spanCopy(e));
  onRoot("cut", (e) => {
    if (!SP || !spanCopy(e)) return;
    pushUndo();
    spanDel();
  });
  onRoot("dragstart", (e) => SP && e.preventDefault());
  /* kucanje, brisanje i Enter preko više blokova */
  function spanInput(e) {
    const it = e.inputType,
      fmt = {
        formatBold: "bold",
        formatItalic: "italic",
        formatStrikeThrough: "strikeThrough",
      };
    e.preventDefault();
    if (/^format/.test(it)) {
      if (fmt[it]) spanMark(fmt[it]);
      return;
    }
    if (/^history/.test(it)) return;
    pushUndo();
    const t = spanDel();
    if (!t) return;
    if (it === "insertParagraph") enter(t.parentElement, t);
    else if (/^insert/.test(it)) {
      const x =
        e.data || (e.dataTransfer && e.dataTransfer.getData("text/plain"));
      if (x) document.execCommand("insertText", false, x);
    }
  }

  /* ---------------- format bar (desktop) + link ---------------- */
  const FBX = document.createElement("div");
  FBX.className = "fbar nfbar";
  FBX.hidden = true;
  FBX.setAttribute("role", "toolbar");
  FBX.setAttribute("aria-label", "Format teksta");
  const FBB = [
    ["bold", "<b>B</b>", "Bold (" + MOD + "B)"],
    ["italic", "<i>I</i>", "Italic (" + MOD + "I)"],
    ["strikeThrough", "<s>S</s>", "Precrtano (" + MOD + "⇧S)"],
    ["code", "&lt;/&gt;", "Kod (" + MOD + "E)"],
    ["link", I.link, "Link (" + MOD + "K)"],
  ];
  FBX.innerHTML = FBB.map(
    (b, i) =>
      `<button type="button" data-nf="${b[0]}" title="${b[2]}" aria-label="${b[2]}" style="--i:${i}">${b[1]}</button>`,
  ).join("");
  document.body.appendChild(FBX);
  let fbShown = false,
    fbRaf = 0;
  function selBlockRange() {
    const s = getSelection();
    if (!s.rangeCount || s.isCollapsed) return null;
    const r = s.getRangeAt(0),
      a = blockOf(r.startContainer),
      b = blockOf(r.endContainer);
    if (SP) return a && b && r.toString().trim() ? r : null;
    const c = cellOf(r.startContainer);
    if (isTextCell(c))
      return c === cellOf(r.endContainer) && r.toString().trim() ? r : null;
    if (
      !a ||
      a !== b ||
      a.dataset.t === "code" ||
      !tOf(a) ||
      !tOf(a).contains(r.startContainer)
    )
      return null;
    return r.toString().trim() ? r : null;
  }
  const inTag = (n, sel) => {
    const e = n && (n.nodeType === 1 ? n : n.parentElement);
    return e && e.closest(sel) && e.closest(".nb-t,.tb-c")
      ? e.closest(sel)
      : null;
  };
  function fbPlace() {
    const r =
      !touch() && !SL && EP.hidden && LK.hidden && live()
        ? selBlockRange()
        : null;
    if (!r) {
      fbHide();
      return;
    }
    FBX.classList.toggle(
      "span",
      SP && blockOf(r.startContainer) !== blockOf(r.endContainer),
    );
    if (!fbShown) {
      FBX.hidden = false;
      FBX.classList.remove("show");
      void FBX.offsetWidth;
      FBX.classList.add("show");
      fbShown = true;
    }
    const rects = [...r.getClientRects()].filter((x) => x.width || x.height);
    const top = rects[0] || r.getBoundingClientRect(),
      all = r.getBoundingClientRect();
    const w = FBX.offsetWidth,
      h = FBX.offsetHeight;
    let y = top.top - h - 12,
      below = false;
    if (y < 76) {
      y = all.bottom + 12;
      below = true;
    }
    const cx = (top.left + top.right) / 2;
    const x = Math.max(10, Math.min(innerWidth - w - 10, cx - w / 2));
    FBX.style.transform = `translate(${Math.round(x)}px,${Math.round(y)}px)`;
    FBX.classList.toggle("below", below);
    FBX.style.setProperty(
      "--ax",
      Math.max(16, Math.min(w - 16, cx - x)) + "px",
    );
    FBX.querySelectorAll("[data-nf]").forEach((b) => {
      const id = b.dataset.nf;
      let on = false;
      try {
        if (id === "code") on = !!inTag(r.startContainer, "code");
        else if (id === "link") on = !!inTag(r.startContainer, "a");
        else on = document.queryCommandState(id);
      } catch (e) {}
      b.classList.toggle("on", on);
    });
  }
  function fbHide() {
    if (!fbShown) return;
    fbShown = false;
    FBX.hidden = true;
    FBX.classList.remove("show");
  }
  FBX.addEventListener("pointerdown", (e) => e.preventDefault());
  FBX.addEventListener("click", (e) => {
    const b = e.target.closest("[data-nf]");
    if (!b) return;
    const id = b.dataset.nf;
    if (id === "code") markCode();
    else if (id === "link") linkPrompt();
    else mark(id);
    requestAnimationFrame(fbPlace);
  });
  function mark(cmd) {
    if (SP) return spanMark(cmd);
    const t = document.activeElement;
    if (!t || !t.classList || !(t.classList.contains("nb-t") || isTextCell(t)))
      return;
    pushUndo();
    try {
      document.execCommand("styleWithCSS", false, false);
    } catch (e) {}
    document.execCommand(cmd);
    changed();
  }
  function markCode() {
    spanCheck(true);
    if (SP) return;
    const s = getSelection();
    if (!s.rangeCount) return;
    const r = s.getRangeAt(0),
      el = blockOf(r.startContainer);
    if (
      !el ||
      el.dataset.t === "code" ||
      !(tOf(el) || isTextCell(cellOf(r.startContainer)))
    )
      return;
    const c = inTag(r.startContainer, "code");
    if (c && c === inTag(r.endContainer, "code")) {
      pushUndo();
      const tx = document.createTextNode(c.textContent);
      c.replaceWith(tx);
      const q = document.createRange();
      q.selectNodeContents(tx);
      s.removeAllRanges();
      s.addRange(q);
      changed();
      return;
    }
    if (r.collapsed) return;
    pushUndo();
    const text = r.toString();
    r.deleteContents();
    const code = document.createElement("code");
    code.textContent = text;
    r.insertNode(code);
    const q = document.createRange();
    q.selectNodeContents(code);
    s.removeAllRanges();
    s.addRange(q);
    changed();
  }
  const LK = document.createElement("form");
  LK.className = "nlink";
  LK.hidden = true;
  document.body.appendChild(LK);
  let lkRange = null,
    lkA = null;
  function normUrl(v) {
    v = v.trim();
    if (!v) return "";
    if (/^(https?:\/\/|mailto:|tel:|#g-)/i.test(v)) return v;
    if (/^[^@\s/]+@[^@\s]+\.[a-z]{2,}$/i.test(v)) return "mailto:" + v;
    return "https://" + v.replace(/^\/+/, "");
  }
  function linkPrompt() {
    spanCheck(true);
    if (SP) return;
    const s = getSelection();
    if (!s.rangeCount) return;
    const r = s.getRangeAt(0),
      el = blockOf(r.startContainer);
    if (
      !el ||
      el.dataset.t === "code" ||
      !(tOf(el) || isTextCell(cellOf(r.startContainer)))
    )
      return;
    lkA = inTag(r.startContainer, "a");
    if (r.collapsed && !lkA) {
      toast("Označi tekst koji postaje link");
      return;
    }
    if (lkA && r.collapsed) {
      const q = document.createRange();
      q.selectNodeContents(lkA);
      s.removeAllRanges();
      s.addRange(q);
    }
    lkRange = s.getRangeAt(0).cloneRange();
    const rect = lkRange.getBoundingClientRect();
    fbHide();
    LK.innerHTML = `${I.link}<input type="text" inputmode="url" placeholder="Nalepi link i pritisni Enter" value="${lkA ? esc(lkA.getAttribute("href") || "") : ""}" autocomplete="off" spellcheck="false" aria-label="Adresa linka">${lkA ? `<button type="button" data-lx>Ukloni</button>` : ""}<button type="submit" class="ok">Primeni</button>`;
    LK.hidden = false;
    const W = Math.min(380, innerWidth - 20);
    LK.style.width = W + "px";
    LK.style.left =
      Math.max(
        10,
        Math.min(innerWidth - W - 10, rect.left + rect.width / 2 - W / 2),
      ) + "px";
    LK.style.top =
      (rect.bottom + 10 + 60 > innerHeight
        ? Math.max(10, rect.top - 60)
        : rect.bottom + 10) + "px";
    const inp = LK.querySelector("input");
    inp.focus();
    inp.select();
  }
  function closeLink(apply, url) {
    if (LK.hidden) return;
    LK.hidden = true;
    const r = lkRange,
      a = lkA;
    lkRange = lkA = null;
    if (!r) return;
    const t =
      cellOf(r.startContainer) ||
      (blockOf(r.startContainer) && tOf(blockOf(r.startContainer)));
    if (!t) return;
    t.focus({ preventScroll: true });
    const s = getSelection();
    s.removeAllRanges();
    s.addRange(r);
    if (!apply) return;
    pushUndo();
    if (!url) {
      if (a) a.replaceWith(...a.childNodes);
      else document.execCommand("unlink");
    } else if (a) a.setAttribute("href", url);
    else document.execCommand("createLink", false, url);
    s.collapseToEnd();
    changed();
  }
  LK.addEventListener("submit", (e) => {
    e.preventDefault();
    closeLink(true, normUrl(LK.querySelector("input").value));
  });
  LK.addEventListener("click", (e) => {
    if (e.target.closest("[data-lx]")) closeLink(true, "");
  });
  LK.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      closeLink(false);
    }
  });
  LK.addEventListener("focusout", () =>
    setTimeout(() => {
      if (!LK.hidden && !LK.contains(document.activeElement)) {
        LK.hidden = true;
        lkRange = lkA = null;
      }
    }, 0),
  );

  /* ---------------- mobile toolbar (touch) ---------------- */
  const MB = document.createElement("div");
  MB.className = "nmbar";
  MB.hidden = true;
  MB.setAttribute("role", "toolbar");
  MB.setAttribute("aria-label", "Alati bloka");
  MB.innerHTML = [
    ["add", I.plus, "Novi blok"],
    ["menu", "Aa", "Pretvori i opcije"],
    ["emo", I.smile, "Emoji"],
    ["out", I.outdent, "Izvuci"],
    ["in", I.indent, "Uvuci"],
    ["todo", I.todo, "Završeno"],
    ["b", "<b>B</b>", "Bold"],
    ["i", "<i>I</i>", "Italic"],
    ["link", I.link, "Link"],
    ["open", I.open, "Otvori link"],
    ["done", I.kb, "Gotovo"],
  ]
    .map(
      ([k, ic, l]) =>
        `<button type="button" data-m="${k}" aria-label="${l}">${ic}</button>`,
    )
    .join("");
  document.body.appendChild(MB);
  const activeBlock = () => {
    const a = document.activeElement;
    return a && a.classList && a.classList.contains("nb-t") && root.contains(a)
      ? a.parentElement
      : null;
  };
  const spanBlock = () =>
    SP ? blockOf(getSelection().anchorNode) : activeBlock();
  function mbarSync() {
    const el = touch() && live() ? spanBlock() : null;
    if (!el) {
      MB.hidden = true;
      return;
    }
    const tp = el.dataset.t,
      s = getSelection(),
      ranged = !s.isCollapsed && !!selBlockRange();
    const a = s.rangeCount ? inTag(s.anchorNode, "a") : null;
    const multi = SP && el !== blockOf(s.focusNode);
    const show = SP
      ? { b: ranged, i: ranged, link: ranged && !multi, done: true }
      : {
          add: true,
          menu: true,
          emo: tp !== "code",
          out: LISTY.has(tp) && lvl(el) > 0,
          in: LISTY.has(tp),
          todo: tp === "todo",
          b: ranged,
          i: ranged,
          link: ranged || !!a,
          open: !!a,
          done: true,
        };
    MB.querySelectorAll("[data-m]").forEach(
      (b) => (b.hidden = !show[b.dataset.m]),
    );
    MB.hidden = false;
    const vv = window.visualViewport,
      vt = vv ? vv.offsetTop : 0,
      vh = vv ? vv.height : innerHeight;
    MB.style.transform = `translateY(${Math.round(vt + vh - MB.offsetHeight - 8)}px)`;
  }
  MB.addEventListener("pointerdown", (e) => e.preventDefault());
  MB.addEventListener("click", (e) => {
    const b = e.target.closest("[data-m]");
    const el = spanBlock();
    if (!b || !el) return;
    const t = tOf(el),
      k = b.dataset.m;
    if (k === "add") addBelow(el);
    else if (k === "menu") openMenu(el, MB.getBoundingClientRect());
    else if (k === "emo") {
      const off = caretOff(t);
      t.blur(); // bez tastature panel dobija punu visinu; izbor vraća kursor
      openPicker(null, (ch) => {
        if (!ch || !el.isConnected) return;
        focusBlock(el, off);
        document.execCommand("insertText", false, ch);
      });
    } else if (k === "in" || k === "out") {
      const off = caretOff(t);
      indentTree(el, k === "in" ? 1 : -1);
      focusBlock(el, off);
    } else if (k === "todo") toggleTodo(el);
    else if (k === "b") mark("bold");
    else if (k === "i") mark("italic");
    else if (k === "link") linkPrompt();
    else if (k === "open") {
      const s = getSelection(),
        a = s.rangeCount && inTag(s.anchorNode, "a");
      if (a) openHref(a.getAttribute("href"));
    } else if (k === "done") {
      document.activeElement.blur();
      MB.hidden = true;
    }
    requestAnimationFrame(mbarSync);
  });
  function openHref(h) {
    if (!h) return;
    if (/^#g-/.test(h)) X.nav(h.slice(1));
    else window.open(h, "_blank", "noopener");
  }

  /* ---------------- paste / drop / upload ---------------- */
  const BLOCK_SEL =
    "p,div,section,article,main,header,footer,aside,nav,h1,h2,h3,h4,h5,h6,ul,ol,li,blockquote,pre,hr,table,tr,figure,img,dl";
  function htmlToBlocks(html) {
    const tp = document.createElement("template");
    tp.innerHTML = html;
    const out = [];
    let buf = null;
    const flushBuf = () => {
      if (!buf) return;
      const x = inlineMd(buf, { collapse: true }).trim();
      if (x) out.push({ t: "p", x });
      buf = null;
    };
    const keepImg = (src) =>
      /^(https:\/\/|data:image\/|\/_blob\/)/.test(src || "");
    function walkLi(li, l, kind) {
      const cb = li.querySelector('input[type="checkbox"]');
      const c = li.cloneNode(true);
      c.querySelectorAll("ul,ol").forEach((x) => x.remove());
      const x = inlineMd(c, { collapse: true }).trim();
      out.push({
        t: cb ? "todo" : kind,
        x,
        l: Math.min(6, l),
        c: !!(cb && (cb.checked || cb.hasAttribute("checked"))),
      });
      for (const sub of li.querySelectorAll(
        ":scope > ul, :scope > ol, :scope > div > ul, :scope > div > ol",
      ))
        walkList(sub, l + 1);
    }
    function walkList(n, l) {
      const kind = n.tagName === "OL" ? "ol" : "ul",
        k0 = out.length,
        st = parseInt(n.getAttribute("start"), 10);
      for (const li of n.children) {
        if (li.tagName === "LI") walkLi(li, l, kind);
        else if (/^(UL|OL)$/.test(li.tagName)) walkList(li, l + 1);
      }
      if (kind === "ol" && st >= 0 && st !== 1 && out[k0]) out[k0].n = st;
    }
    function walk(node) {
      for (const n of [...node.childNodes]) {
        if (n.nodeType === 3) {
          if (n.nodeValue.trim())
            (buf || (buf = document.createElement("span"))).append(
              n.cloneNode(),
            );
          else if (buf) buf.append(" ");
          continue;
        }
        if (n.nodeType !== 1) continue;
        const tag = n.tagName.toUpperCase();
        if (
          /^(SCRIPT|STYLE|META|LINK|TITLE|TEMPLATE|NOSCRIPT|BUTTON|SELECT|TEXTAREA|SVG|HEAD)$/.test(
            tag,
          )
        )
          continue;
        const isBlock = n.matches(BLOCK_SEL);
        if (!isBlock) {
          if (n.querySelector(BLOCK_SEL)) {
            flushBuf();
            walk(n);
          } else
            (buf || (buf = document.createElement("span"))).append(
              n.cloneNode(true),
            );
          continue;
        }
        flushBuf();
        if (/^H[1-6]$/.test(tag)) {
          const x = inlineMd(n, { collapse: true }).trim();
          if (x) out.push({ t: "h" + Math.min(3, +tag[1]), x });
        } else if (tag === "HR") out.push({ t: "hr" });
        else if (tag === "PRE")
          out.push({ t: "code", x: n.textContent.replace(/\n$/, "") });
        else if (tag === "BLOCKQUOTE") {
          const x = inlineMd(n, { collapse: true }).trim();
          if (x) out.push({ t: "quote", x });
        } else if (tag === "UL" || tag === "OL") walkList(n, 0);
        else if (tag === "LI") walkLi(n, 0, "ul");
        else if (tag === "IMG") {
          if (keepImg(n.getAttribute("src")))
            out.push({
              t: "img",
              src: n.getAttribute("src"),
              alt: n.getAttribute("alt") || "",
            });
        } else if (tag === "TABLE") {
          const g = gridOf(n);
          if (g) out.push(tbFromGrid(g));
        } else if (tag === "TR") {
          const cells = [...n.children].map((c) =>
            inlineMd(c, { collapse: true }).trim(),
          );
          if (cells.some(Boolean)) out.push({ t: "p", x: cells.join(" · ") });
        } else if (n.querySelector(BLOCK_SEL)) walk(n);
        else {
          const x = inlineMd(n, { collapse: true }).trim();
          if (x) out.push({ t: "p", x });
        }
      }
    }
    walk(tp.content);
    flushBuf();
    return out;
  }
  const MDISH =
    /^\s*(#{1,6}\s|[-*+]\s|\d+[.)]\s|>\s?|```|~~~)|\*\*[^*\n]+\*\*|\[[^\]\n]+\]\([^)\n]+\)|(^|\s)`[^`\n]+`|^\s*\|?(\s*:?-+:?\s*\|)+/m;
  function insertInline(t, x) {
    const s = getSelection(),
      r = s.getRangeAt(0);
    r.deleteContents();
    const tp = document.createElement("template");
    tp.innerHTML = mdInline(x);
    const last = tp.content.lastChild;
    r.insertNode(tp.content);
    if (last) {
      const c = document.createRange();
      c.setStartAfter(last);
      c.collapse(true);
      s.removeAllRanges();
      s.addRange(c);
    }
    keepVisible(t);
  }
  function insertBlocks(el, t, bs) {
    const tail = splitTail(t);
    tidy(t);
    let anchor = el,
      first = 0;
    if (isEmpty(t)) {
      const nb = make(bs[0]);
      el.replaceWith(nb);
      anchor = nb;
      first = 1;
    } else if (bs[0].t === "p" && el.dataset.t !== "code") {
      t.insertAdjacentHTML("beforeend", mdInline(bs[0].x || ""));
      first = 1;
    }
    for (let k = first; k < bs.length; k++) {
      const nb = make(bs[k]);
      anchor.after(nb);
      anchor = nb;
    }
    let lt = tOf(anchor);
    if (!lt) {
      const nb = make({ t: "p", x: "" });
      anchor.after(nb);
      anchor = nb;
      lt = tOf(nb);
    }
    const off = lenOf(lt);
    if (lenOf(tail)) {
      if (anchor.dataset.t === "code")
        lt.append(document.createTextNode(tail.textContent));
      else lt.append(tail);
    }
    renum();
    focusBlock(anchor, off);
    changed();
  }
  onRoot("paste", (e) => {
    const cd = e.clipboardData;
    let st = null;
    if (SP && cd) {
      pushUndo();
      st = spanDel();
    }
    const t = st || (e.target.closest && e.target.closest(".nb-t"));
    if (!t || !cd) return;
    const el = t.parentElement;
    const files = [...(cd.files || [])];
    if (files.length) {
      e.preventDefault();
      pushUndo();
      uploadInto(files, el, isEmpty(t));
      return;
    }
    const plain = cd.getData("text/plain") || "",
      html = cd.getData("text/html") || "";
    e.preventDefault();
    if (el.dataset.t === "code") {
      noteTyping(t);
      document.execCommand("insertText", false, plain);
      return;
    }
    pushUndo();
    const single = plain.trim() && !/\n/.test(plain.trim());
    if (
      single &&
      /^https?:\/\/\S+$/.test(plain.trim()) &&
      !getSelection().isCollapsed
    ) {
      document.execCommand("createLink", false, plain.trim());
      getSelection().collapseToEnd();
      changed();
      return;
    }
    const tsv = !/<table/i.test(html) && TSV(plain.replace(/\r\n?/g, "\n"));
    const bs = tsv
      ? [tbFromGrid(tsv)]
      : !html || MDISH.test(plain) || /white-space:\s*pre/.test(html)
        ? parseMd(plain)
        : htmlToBlocks(html);
    if (!bs.length) return;
    if (bs.length === 1 && bs[0].t === "p") insertInline(t, bs[0].x);
    else insertBlocks(el, t, bs);
    changed();
  });
  onRoot("dragover", (e) => {
    if (e.dataTransfer && [...e.dataTransfer.types].includes("Files"))
      e.preventDefault();
  });
  onRoot("drop", (e) => {
    const fs = [...((e.dataTransfer && e.dataTransfer.files) || [])];
    if (!fs.length) return;
    e.preventDefault();
    const b = blockAtY(e.clientY);
    if (!b) return;
    pushUndo();
    uploadInto(fs, b, b.dataset.t === "p" && isEmpty(tOf(b)));
  });
  const fileIn = document.createElement("input");
  fileIn.type = "file";
  fileIn.multiple = true;
  fileIn.hidden = true;
  document.body.appendChild(fileIn);
  let fileCb = null;
  fileIn.addEventListener("change", () => {
    const fs = [...fileIn.files];
    fileIn.value = "";
    if (fs.length && fileCb) fileCb(fs);
    fileCb = null;
  });
  function pickFiles(accept, cb) {
    fileIn.accept = accept;
    fileCb = cb;
    fileIn.click();
  }
  const readURL = (f) =>
    new Promise((res, rej) => {
      const fr = new FileReader();
      fr.onload = () => res(fr.result);
      fr.onerror = rej;
      fr.readAsDataURL(f);
    });
  async function upload(f, kind, onP) {
    const st = store();
    if (st) return (await st.put(f, { onProgress: onP })).url;
    const A = X.assets();
    if (A) return "/_blob/" + (await A.upload(f)).id;
    if (S.mode === "local")
      return kind === "img" ? readURL(f) : URL.createObjectURL(f);
    throw { code: "not_granted" };
  }
  const isHtml = (f) => f.type === "text/html" || /\.html?$/i.test(f.name);
  function uploadInto(files, after, replace) {
    let anchor = after;
    files.forEach((f, k) => {
      const kind = f.type.startsWith("image/")
        ? "img"
        : isHtml(f)
          ? "embed"
          : "file";
      const nb = make({ t: kind, src: "", name: f.name });
      nb.classList.add("up");
      if (replace && k === 0) after.replaceWith(nb);
      else anchor.after(nb);
      anchor = nb;
      upload(f, kind, (p) => {
        const s = nb.querySelector(".nb-up, .nb-fo");
        if (s)
          s.textContent =
            (kind === "img" ? "Otpremam sliku… " : "Otpremam… ") +
            Math.round(p * 100) +
            "%";
      }).then(
        (url) => {
          if (!nb.isConnected) return;
          nb.replaceWith(make({ t: kind, src: url, name: f.name, alt: "" }));
          changed();
          if (pendingRemote && !busy()) applyRemote();
        },
        (e) => {
          nb.remove();
          if (!blocks().length) root.append(make({ t: "p", x: "" }));
          toast(
            e && e.code === "too_large"
              ? e.msg || "Fajl je prevelik."
              : e && e.code === "not_granted"
                ? "Nemaš dozvolu za otpremanje."
                : "Otpremanje nije uspelo.",
          );
          changed();
        },
      );
    });
    let nx = anchor.nextElementSibling;
    if (!(isNb(nx) && tOf(nx))) {
      nx = make({ t: "p", x: "" });
      anchor.after(nx);
    }
    renum();
    focusBlock(nx, 0);
    changed();
  }

  /* ---------------- crtež (Excalidraw) ----------------
     Excalidraw je React, pa živi u svom iframe-u (izvor: os-draw/, build: os-app/draw) i
     učitava se tek kad zatreba. Iframe posle prvog otvaranja ostaje učitan. Crtež je u
     Markdownu jedan red, ![excalidraw:<scena>](/_blob/<svg>), a fajlovi su nepromenljivi:
     iframe traži "upload" za scenu, preview i slike, pa "commit" kad su svi otpremljeni.
     Tako undo vraća prethodnu verziju, a duplirani blok je nezavisna kopija. Među-verzije
     autosave-a se brišu na zatvaranju; verzija pre otvaranja ostaje zbog undo-a. */
  const DR_URL = "/os-app/draw/index.html";
  let DR = null, // otvorena sesija
    drOv = null,
    drWin = null,
    drReady = false,
    drQueued = null,
    drN = 0;
  function drSend(m) {
    if (!drWin) return;
    if (!drReady) {
      drQueued = m;
      return;
    }
    drWin.postMessage({ skd: 1, ...m }, location.origin);
  }
  function drFrame() {
    if (drOv) return;
    drOv = document.createElement("div");
    drOv.className = "dr-ov";
    drOv.innerHTML = `<span class="dr-wait" aria-hidden="true"></span><iframe class="dr-f" src="${DR_URL}" title="Crtež" allow="clipboard-read; clipboard-write"></iframe>`;
    document.body.appendChild(drOv);
    drWin = drOv.querySelector("iframe").contentWindow;
  }
  function drTheme() {
    const c = getComputedStyle(document.documentElement),
      g = (k) => c.getPropertyValue(k).trim();
    return {
      ink: g("--ink"),
      surface: g("--surface"),
      surface2: g("--surface-2"),
      line: g("--line"),
      cream: g("--cream"),
      muted: g("--muted"),
      accent: g("--orange"),
      gold: g("--gold"),
      onAccent: g("--on-accent"),
    };
  }
  function drStart(el, fresh) {
    if (DR || !cur) return;
    if (!X.assets()) {
      if (fresh) drDropNew(el);
      toast("Nemaš dozvolu za otpremanje.");
      return;
    }
    drFrame();
    closeAll();
    const r = el.getBoundingClientRect();
    drOv.style.transformOrigin = `${r.left + r.width / 2}px ${r.top + r.height / 2}px`;
    DR = {
      n: ++drN,
      el,
      fresh,
      id: cur,
      host: H,
      hash: location.hash,
      pushed: false,
      trail: [],
    };
    drOv.getBoundingClientRect(); // polazno stanje prelaza
    drOv.classList.add("on");
    drSend({
      type: "open",
      n: DR.n,
      scene: el.dataset.scene || "",
      doc: H.col + "/" + cur,
      title: titleEl ? titleEl.textContent.trim() : "",
      theme: drTheme(),
    });
  }
  const drOpen = (el) => drStart(el, false);
  function drNew(el, replace) {
    /* .up se ne upisuje u Markdown: blok postoji tek od prvog čuvanja */
    const nb = make({ t: "draw", src: "", scene: "" });
    nb.classList.add("up");
    if (replace) el.replaceWith(nb);
    else el.after(nb);
    let nx = nb.nextElementSibling;
    if (!(isNb(nx) && nx.dataset.t === "p" && isEmpty(tOf(nx)))) {
      nx = make({ t: "p", x: "" });
      nb.after(nx);
    }
    renum();
    changed();
    drStart(nb, true);
  }
  function drDropNew(el) {
    el.remove();
    if (!blocks().length) root.append(make({ t: "p", x: "" }));
    renum();
    changed();
  }
  /* editor je pokrio stranicu, pa ona ne može da se promeni osim kroz istoriju (vidi dole) */
  const drLive = (d) => rendered === cur && cur === d.id && H === d.host;
  function drCommit(d, scene, src) {
    if (!drLive(d)) throw new Error("page");
    if (!d.pushed) {
      pushUndo();
      d.pushed = true;
    }
    const w = imgW(d.el.dataset.w);
    const nb = make({ t: "draw", scene, src, w });
    if (d.el.isConnected) d.el.replaceWith(nb);
    else {
      /* blok je u međuvremenu nestao: crtež je važniji, vraća se na kraj stranice */
      const last = blocks().pop();
      if (last) last.after(nb);
      else root.append(nb);
      toast("Blok je bio uklonjen, pa je crtež vraćen na kraj stranice");
    }
    d.el = nb;
    d.trail.push({ scene, src });
    renum();
    changed();
  }
  function drBlobId(src) {
    return String(src || "").replace(/^\/_blob\//, "");
  }
  function drSweep(list) {
    const A = X.assets();
    if (!A) return;
    for (const v of list) {
      A.delete(v.scene).catch(() => {});
      A.delete(drBlobId(v.src)).catch(() => {});
    }
  }
  function drClose() {
    const d = DR;
    drOv.classList.remove("on", "ready");
    drSend({ type: "close" });
    DR = null;
    drWin.blur();
    if (pendingRemote && !busy()) applyRemote();
    return d;
  }
  async function drFinish(d, empty) {
    if (!drLive(d)) throw new Error("page");
    if (empty) {
      if (d.el.classList.contains("up")) drDropNew(d.el);
      else removeBlocks([d.el]);
      await flush();
      drClose();
      drSweep(d.trail);
      return;
    }
    await flush();
    /* preview je spreman pre nego što se editor skloni, da stranica ne blesne praznim */
    const last = d.trail[d.trail.length - 1];
    if (last) {
      const im = new Image();
      im.src = last.src;
      await Promise.race([
        im.decode().catch(() => {}),
        new Promise((r) => setTimeout(r, 1500)),
      ]);
    }
    const el = d.el;
    drClose();
    drSweep(d.trail.slice(0, -1));
    if (el.isConnected && !el.classList.contains("up")) {
      const nx = el.nextElementSibling;
      if (d.fresh && isNb(nx) && tOf(nx)) focusBlock(nx, 0);
      else selectBlocks([el]);
    }
  }
  function drFailed(d) {
    drClose();
    if (d.fresh && d.el.classList.contains("up")) drDropNew(d.el);
    toast("Crtež nije mogao da se učita. Proveri vezu i probaj ponovo.");
  }
  addEventListener("message", (e) => {
    const m = e.data;
    if (!drOv || e.source !== drWin || e.origin !== location.origin) return;
    if (!m || m.skd !== 1) return;
    if (m.type === "ready") {
      drReady = true;
      if (drQueued) {
        const q = drQueued;
        drQueued = null;
        drSend(q);
      }
      return;
    }
    const d = DR;
    if (m.rid) {
      const reply = (ok, value, error) =>
        drSend({ type: "reply", rid: m.rid, ok, value, error });
      const fail = (err) =>
        reply(false, null, String((err && err.code) || err));
      if (!d) return fail("closed");
      if (m.type === "upload")
        upload(m.blob, "draw").then((src) => {
          reply(true, { src, id: drBlobId(src) });
        }, fail);
      else if (m.type === "commit") {
        try {
          drCommit(d, m.scene, m.src);
          reply(true);
        } catch (err) {
          fail(err);
        }
      } else if (m.type === "finish") {
        drFinish(d, !!m.empty).then(() => reply(true), fail);
      }
      return;
    }
    if (!d || m.n !== d.n) return;
    if (m.type === "opened") {
      drOv.classList.add("ready");
      drOv.querySelector("iframe").focus();
    } else if (m.type === "failed") drFailed(d);
  });
  /* adresa se vraća, a editor sačuva crtež i zatvori se (listener je na vrhu fajla) */
  window.SKDrawHash = () => {
    if (!DR || location.hash === DR.hash) return false;
    history.replaceState(
      history.state,
      "",
      location.href.split("#")[0] + DR.hash,
    );
    drSend({ type: "requestFinish", n: DR.n });
    return true;
  };
  /* iframe se učitava čim se pokazivač nađe na crtežu, pa se otvara bez čekanja */
  onRoot("pointerover", (e) => {
    if (!drOv && e.target.closest && e.target.closest(".nb-draw")) drFrame();
  });

  /* ---------------- editor events ---------------- */
  onRoot("compositionstart", () => {
    if (SP) {
      pushUndo();
      spanDel();
    }
    composing = true;
  });
  onRoot("compositionend", () => {
    composing = false;
    changed();
  });
  onRoot("beforeinput", (e) => {
    if (e.inputType === "historyUndo" || e.inputType === "historyRedo") {
      e.preventDefault();
      e.inputType === "historyUndo" ? undo() : redo();
      return;
    }
    if (SP) {
      spanInput(e);
      return;
    }
    const t = e.target.closest && e.target.closest(".nb-t");
    if (!t) return;
    const el = t.parentElement;
    /* mobilne tastature šalju Enter/Backspace samo kao beforeinput */
    if (e.inputType === "insertParagraph" && !composing) {
      e.preventDefault();
      el.dataset.t === "code" ? codeNL(t) : enter(el, t);
      return;
    }
    if (e.inputType === "insertLineBreak" && el.dataset.t === "code") {
      e.preventDefault();
      codeNL(t);
      return;
    }
    if (
      e.inputType === "deleteContentBackward" &&
      getSelection().isCollapsed &&
      caretOff(t) === 0
    ) {
      e.preventDefault();
      backStart(el, t);
      return;
    }
    noteTyping(t);
  });
  onRoot("input", (e) => {
    const t = e.target.closest && e.target.closest(".nb-t");
    if (!t) return;
    const el = t.parentElement;
    if (isEmpty(t) && t.firstChild) t.replaceChildren();
    if (
      !composing &&
      e.inputType === "insertText" &&
      e.data &&
      el.dataset.t !== "code"
    ) {
      if (e.data === " " && blockShortcut(el, t)) return;
      if (e.data === "`" && fenceShortcut(el, t)) return;
      if (/[-—–]/.test(e.data) && hrShortcut(el, t)) return;
      if ("*_~`".includes(e.data)) inlineShortcut(t, e.data);
      if ((e.data === "/" || (e.data === "@" && !isScript())) && !SL)
        openSlash(t, e.data);
      else if (SL) updateSlash();
    } else if (SL) updateSlash();
    changed();
  });
  onRoot("keydown", (e) => {
    if (e.isComposing || e.keyCode === 229) return;
    const t = e.target.closest && e.target.closest(".nb-t");
    if (!t) return;
    const el = t.parentElement,
      tp = el.dataset.t,
      k = e.key,
      mod = e.metaKey || e.ctrlKey,
      low = k.length === 1 ? k.toLowerCase() : k;
    if (SL && slashKey(e)) return;
    if (tp !== "code" && relKey(e, t)) return;
    if (mod && !e.altKey) {
      if (low === "z") {
        e.preventDefault();
        e.shiftKey ? redo() : undo();
      } else if (low === "y") {
        e.preventDefault();
        redo();
      } else if (low === "s" && !e.shiftKey) {
        e.preventDefault();
        flush();
      } else if (tp !== "code" && !e.shiftKey && (low === "b" || low === "i")) {
        e.preventDefault();
        mark(low === "b" ? "bold" : "italic");
      } else if (tp !== "code" && !e.shiftKey && low === "u")
        e.preventDefault();
      else if (tp !== "code" && e.shiftKey && (low === "s" || low === "x")) {
        e.preventDefault();
        mark("strikeThrough");
      } else if (tp !== "code" && !e.shiftKey && low === "e") {
        e.preventDefault();
        markCode();
      } else if (tp !== "code" && !e.shiftKey && low === "k") {
        e.preventDefault();
        linkPrompt();
      } else if (low === "d" && !e.shiftKey) {
        e.preventDefault();
        const c = dup([el]);
        focusBlock(c[0]);
      } else if (e.shiftKey && (k === "ArrowUp" || k === "ArrowDown")) {
        e.preventDefault();
        const off = caretOff(t);
        if (moveBlocks([el], k === "ArrowUp" ? -1 : 1)) focusBlock(el, off);
      } else if (k === "Enter") {
        e.preventDefault();
        if (tp === "todo") toggleTodo(el);
        else if (tp === "code") insertP(el);
      } else if (low === "a" && !e.shiftKey) {
        const s = getSelection();
        if (
          isEmpty(t) ||
          s.toString().length >= t.textContent.replace(/​/g, "").length
        ) {
          e.preventDefault();
          spanAll();
        }
      }
      return;
    }
    if (k === "Enter" && !e.altKey) {
      e.preventDefault();
      if (tp === "code") codeNL(t);
      else if (e.shiftKey) softBreak(t);
      else enter(el, t);
      return;
    }
    if (k === "Backspace") {
      if (getSelection().isCollapsed && caretOff(t) === 0) {
        e.preventDefault();
        backStart(el, t);
      }
      return;
    }
    if (k === "Delete") {
      if (getSelection().isCollapsed && caretOff(t) === lenOf(t)) {
        e.preventDefault();
        delEnd(el);
      }
      return;
    }
    if (k === "Tab") {
      e.preventDefault();
      if (tp === "code") {
        if (!e.shiftKey) document.execCommand("insertText", false, "  ");
      } else if (LISTY.has(tp)) {
        const off = caretOff(t);
        indentTree(el, e.shiftKey ? -1 : 1);
        focusBlock(el, off);
      }
      return;
    }
    if (k === "Escape") {
      e.preventDefault();
      selectBlocks([el]);
      return;
    }
    if (
      (k === "ArrowUp" || k === "ArrowDown") &&
      e.shiftKey &&
      !mod &&
      !e.altKey &&
      spanLine(t, k === "ArrowUp")
    ) {
      e.preventDefault();
      return;
    }
    if ((k === "ArrowUp" || k === "ArrowDown") && !e.shiftKey && !e.altKey) {
      const up = k === "ArrowUp";
      if (!getSelection().isCollapsed || !lineEdge(t, up)) return;
      const adj = up ? el.previousElementSibling : el.nextElementSibling;
      if (isNb(adj) && adj.dataset.t === "tbl") {
        e.preventDefault();
        tbEnter(adj, (caretRect() || t.getBoundingClientRect()).left, !up);
        return;
      }
      const nx = sibText(el, up ? -1 : 1);
      if (nx) {
        e.preventDefault();
        caretToX(nx, (caretRect() || t.getBoundingClientRect()).left, !up);
      } else if (up) {
        e.preventDefault();
        titleEl.focus();
        setCaret(titleEl, Infinity);
      } else if (tp === "code") {
        e.preventDefault();
        insertP(el);
      }
      return;
    }
    if ((k === "ArrowLeft" || k === "ArrowRight") && !e.shiftKey && !e.altKey) {
      if (!getSelection().isCollapsed) return;
      const left = k === "ArrowLeft";
      if (left ? caretOff(t) === 0 : caretOff(t) === lenOf(t)) {
        const nx = sibText(el, left ? -1 : 1);
        if (nx) {
          e.preventDefault();
          focusBlock(nx, left ? Infinity : 0);
        }
      }
    }
  });
  onRoot("click", (e) => {
    if (SP) spanCheck(true);
    if (justSel) {
      justSel = false;
      return;
    }
    const rl = e.target.closest(".nb-rel");
    if (rl) {
      e.preventDefault();
      relOpen(rl);
      return;
    }
    const a = e.target.closest(".nb-t a[href]");
    if (a) {
      e.preventDefault();
      if (e.metaKey || e.ctrlKey) openHref(a.getAttribute("href"));
      return;
    }
    if (e.target.closest(".nb-h")) return;
    const ck = e.target.closest(".nb-ck");
    if (ck) {
      toggleTodo(ck.parentElement);
      return;
    }
    const ci = e.target.closest(".nb-ci");
    if (ci) {
      calloutIcon(ci.parentElement);
      return;
    }
    const cp = e.target.closest(".nb-copy");
    if (cp) {
      copyText(codeText(tOf(cp.closest(".nb"))), "Kod kopiran");
      return;
    }
    const add = e.target.closest(".nb-add");
    if (add) {
      addBelow(add.closest(".nb"));
      return;
    }
    const pg = e.target.closest(".nb-page");
    if (pg) {
      e.preventDefault();
      const ref = pg.parentElement.dataset.ref;
      if (noteOf(ref)) X.nav("g-" + ref);
      else selectBlocks([pg.parentElement]);
      return;
    }
    const ex = e.target.closest(".nb-ex");
    if (ex) {
      e.preventDefault();
      embFull(ex.closest(".nb-emb"));
      return;
    }
    const fl = e.target.closest(".nb-file");
    if (fl) {
      if (!fl.getAttribute("href")) e.preventDefault();
      return;
    }
    const dw = e.target.closest(".nb-draw");
    if (
      dw &&
      dw.parentElement.dataset.src &&
      !e.shiftKey &&
      !e.metaKey &&
      !e.ctrlKey
    ) {
      drOpen(dw.parentElement);
      return;
    }
    const x = e.target.closest(".nb-x");
    if (x) {
      selectBlocks([x.parentElement]);
      return;
    }
    if (e.target === root) {
      const last = blocks().pop();
      if (!last) return;
      if (e.clientY > last.getBoundingClientRect().bottom) clickBelow();
      else {
        const b = blockAtY(e.clientY);
        if (b && tOf(b))
          focusBlock(
            b,
            e.clientX < b.getBoundingClientRect().left + 40 ? 0 : Infinity,
          );
      }
      return;
    }
    if (isNb(e.target) && tOf(e.target)) focusBlock(e.target);
  });
  function clickBelow() {
    const last = blocks().pop();
    if (!last) return;
    if (last.dataset.t === "p" && isEmpty(tOf(last))) focusBlock(last, 0);
    else {
      pushUndo();
      const p = make({ t: "p", x: "" });
      last.after(p);
      focusBlock(p, 0);
      changed();
    }
  }
  $("#gpFill").addEventListener("click", clickBelow);
  onRoot("mouseover", (e) => {
    const a =
      e.target.closest && e.target.closest(".nb-t a[href]:not(.nb-rel)");
    if (a && !a.title) a.title = MOD + "klik otvara link";
  });
  onRoot("focusin", () => {
    clearSel();
    requestAnimationFrame(mbarSync);
  });
  onRoot("focusout", () => {
    setTimeout(() => {
      mbarSync();
      if (!root.contains(document.activeElement)) {
        if (SL && !slashEl.contains(document.activeElement)) closeSlash();
        flush();
        if (pendingRemote && !busy()) applyRemote();
      }
    }, 150);
  });
  document.addEventListener("selectionchange", () => {
    if (!live()) return;
    spanCheck();
    /* telefon: ručke selekcije moraju moći da pređu u drugi blok, pa SP od prvog označavanja */
    const s = getSelection();
    if (touch() && !SP && !composing && !s.isCollapsed && activeBlock())
      spanOn(s.anchorNode, s.anchorOffset, s.focusNode, s.focusOffset);
    if (SL && slashQ() === null) closeSlash();
    cancelAnimationFrame(fbRaf);
    fbRaf = requestAnimationFrame(() => {
      fbPlace();
      mbarSync();
    });
  });
  const reflow = () => {
    if (!live()) return;
    if (fbShown) fbPlace();
    mbarSync();
    placePicker();
  };
  addEventListener("resize", reflow);
  addEventListener("scroll", () => fbShown && fbPlace(), { passive: true });
  if (window.visualViewport) {
    visualViewport.addEventListener("resize", reflow);
    visualViewport.addEventListener("scroll", reflow);
  }
  document.addEventListener("pointerdown", (e) => {
    if (!live()) return;
    if (
      !EP.hidden &&
      !EP.contains(e.target) &&
      !e.target.closest(".nb-ci,#gpIcon,#gpAddIcon,[data-m=emo]")
    )
      closePicker();
    if (
      menuEl &&
      !menuEl.contains(e.target) &&
      !e.target.closest(".nb-h,[data-m=menu]")
    )
      closeMenu();
    if (SL && !slashEl.contains(e.target) && !root.contains(e.target))
      closeSlash();
    if (
      sel.length &&
      !e.target.closest(".nb.sel,.nmenu,.nmbar") &&
      !(e.shiftKey && root.contains(e.target))
    )
      clearSel();
  });
  document.addEventListener("keydown", (e) => {
    if (!live()) return;
    const k = e.key,
      mod = e.metaKey || e.ctrlKey,
      low = k.length === 1 ? k.toLowerCase() : k;
    if (k === "Escape" && menuEl) {
      e.preventDefault();
      closeMenu();
      return;
    }
    const ae = document.activeElement;
    /* isti taster je već obradio editor; ćelija ili blok iz kog je stigao može već biti
       precrtan (undo), pa bez provere isConnected jedan Cmd+Z vraća dva koraka */
    if (root.contains(e.target) || !e.target.isConnected) return;
    if (
      ae &&
      ae !== document.body &&
      (ae.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName))
    )
      return;
    if (!$("#scrim").hidden) return;
    if (mod && low === "z" && !e.altKey) {
      e.preventDefault();
      e.shiftKey ? redo() : undo();
      return;
    }
    if (!sel.length) return;
    const bs = blocks();
    if (k === "Escape") {
      e.preventDefault();
      clearSel();
    } else if (k === "Backspace" || k === "Delete") {
      e.preventDefault();
      const tg = removeBlocks(sel.slice());
      clearSel();
      closeMenu();
      if (tg && tOf(tg)) focusBlock(tg);
    } else if (k === "Enter") {
      e.preventDefault();
      if (sel.length === 1 && sel[0].dataset.t === "draw") {
        drOpen(sel[0]);
        return;
      }
      const f = sel.find((x) => tOf(x) || x.dataset.t === "tbl");
      if (f && tOf(f)) focusBlock(f);
      else if (f) focusCell(f, 0, 0) || focusCell(f, -1, 0);
    } else if (mod && (low === "c" || low === "x")) {
      e.preventDefault();
      copyText(mdOf(sel), low === "x" ? "Isečeno" : "Kopirano kao Markdown");
      if (low === "x") {
        const tg = removeBlocks(sel.slice());
        clearSel();
        if (tg && tOf(tg)) focusBlock(tg);
      }
    } else if (mod && low === "d") {
      e.preventDefault();
      selectBlocks(dup(sel.slice()));
    } else if (mod && low === "a") {
      e.preventDefault();
      selectBlocks(bs);
    } else if (mod && e.shiftKey && (k === "ArrowUp" || k === "ArrowDown")) {
      e.preventDefault();
      const s = sel.slice();
      moveBlocks(s, k === "ArrowUp" ? -1 : 1);
      selectBlocks(s);
      s[0].scrollIntoView({ block: "nearest" });
    } else if (k === "ArrowUp" || k === "ArrowDown") {
      e.preventDefault();
      const up = k === "ArrowUp",
        i0 = bs.indexOf(sel[0]),
        i1 = bs.indexOf(sel[sel.length - 1]);
      if (e.shiftKey)
        selectBlocks(
          bs.slice(
            Math.max(0, up ? i0 - 1 : i0),
            Math.min(bs.length, up ? i1 + 1 : i1 + 2),
          ),
        );
      else if (bs[up ? i0 - 1 : i1 + 1])
        selectBlocks([bs[up ? i0 - 1 : i1 + 1]]);
      sel[0] &&
        sel[up ? 0 : sel.length - 1].scrollIntoView({ block: "nearest" });
    } else if (k === "Tab") {
      e.preventDefault();
      const s = sel.slice();
      indentEls(s, e.shiftKey ? -1 : 1);
      selectBlocks(s);
    }
  });

  /* ---------------- title + header controls ---------------- */
  /* iz naslova u prvi blok; Enter ubacuje prazan red na vrh ako prvi blok nije prazan */
  function focusTop(insert) {
    const f = blocks()[0];
    if (insert && f && !(f.dataset.t === "p" && isEmpty(tOf(f)))) {
      pushUndo();
      const p = make({ t: "p", x: "" });
      root.prepend(p);
      focusBlock(p, 0);
      changed();
    } else if (f) focusBlock(f, 0);
  }
  titleEl.addEventListener("input", titleChanged);
  titleEl.addEventListener("keydown", (e) => {
    if (e.isComposing) return;
    const atEnd = caretOff(titleEl) >= titleEl.textContent.length;
    if (e.key === "Enter" || (e.key === "ArrowDown" && atEnd)) {
      e.preventDefault();
      focusTop(e.key === "Enter");
    }
  });
  titleEl.addEventListener("paste", (e) => {
    e.preventDefault();
    const t = (e.clipboardData || window.clipboardData)
      .getData("text/plain")
      .replace(/\s+/g, " ");
    document.execCommand("insertText", false, t);
  });
  titleEl.addEventListener("blur", flush);
  $("#gpBack").addEventListener("click", () => X.nav(backTo));
  function pageIcon(anchor) {
    const p = noteOf(cur);
    if (!p) return;
    openPicker(
      anchor.getBoundingClientRect(),
      async (ch) => {
        const q = noteOf(cur);
        if (!q) return;
        try {
          await api.upd("notes", q.id, {
            icon: ch,
            updatedAt: Date.now(),
            updatedBy: me() ? me().id : null,
          });
          head(noteOf(q.id));
        } catch (e) {
          toast(errMsg(e));
        }
      },
      { remove: !!p.icon, random: true },
    );
  }
  $("#gpIcon").addEventListener("click", (e) => pageIcon(e.currentTarget));
  $("#gpAddIcon").addEventListener("click", (e) => pageIcon(e.currentTarget));
  let pmenu = null;
  $("#gpMore").addEventListener("click", (e) => {
    if (pmenu) {
      pmenu.remove();
      pmenu = null;
      return;
    }
    const b = e.currentTarget.getBoundingClientRect();
    const M = (pmenu = document.createElement("div"));
    M.className = "pop nmenu gpmenu";
    M.setAttribute("role", "menu");
    /* privatnost bira autor glavne stranice; podstranice je nasleđuju */
    const p = noteOf(cur),
      canPriv =
        p && !p.parentId && (p.privateTo || (me() && p.createdBy === me().id)),
      F = p && folderOf(fidOf(p), spaceOf(p));
    /* folder biraju samo glavne stranice vidljive timu */
    M.innerHTML = `<button type="button" data-pm="sub">${I.doc}Nova podstranica</button>${p && !p.parentId && !p.privateTo ? `<button type="button" data-pm="fold" class="gm-fold"${F ? ` style="--fc:${esc(fcol(F))}"` : ""}>${I.fold}<span>${F ? "Folder: " + esc(F.name || "Folder") : "Premesti u folder"}</span></button>` : ""}${canPriv ? (p.privateTo ? `<button type="button" data-pm="share">${I.unlock}Podeli sa timom</button>` : `<button type="button" data-pm="priv">${I.lock}Samo za mene</button>`) : ""}<button type="button" data-pm="copy">${I.md}Kopiraj kao Markdown</button><button type="button" data-pm="dl">${I.dl}Preuzmi .md fajl</button><div class="nm-sep"></div><button type="button" data-pm="del" class="danger">${I.trash}Obriši stranicu</button>`;
    document.body.appendChild(M);
    const W = Math.min(260, innerWidth - 16);
    M.style.width = W + "px";
    M.style.left = Math.max(8, b.right - W) + "px";
    M.style.top = b.bottom + 8 + "px";
  });
  document.addEventListener("pointerdown", (e) => {
    if (pmenu && !pmenu.contains(e.target) && !e.target.closest("#gpMore")) {
      pmenu.remove();
      pmenu = null;
    }
  });
  document.addEventListener("click", (e) => {
    const b = pmenu && e.target.closest("[data-pm]");
    if (!b) return;
    const a = b.dataset.pm;
    /* „Premesti u folder“: isti meni prikaže spisak foldera */
    if (a === "fold") {
      foldMenu(pmenu, noteOf(cur));
      return;
    }
    pmenu.remove();
    pmenu = null;
    if (a === "mv") moveTo(noteOf(cur), b.dataset.f || null);
    else if (a === "mvnew") newFolder(noteOf(cur));
    else if (a === "sub") {
      flush();
      createAndOpen(cur);
    } else if (a === "copy")
      copyText(pageMd(), "Stranica kopirana kao Markdown");
    else if (a === "dl") download();
    else if (a === "del") delPage(cur);
    else if (a === "priv" || a === "share") setPrivate(cur, a === "priv");
  });
  /* privatna stranica: samo autor je vidi (RLS u bazi), zajedno sa podstranicama */
  async function setPrivate(id, on) {
    if (!noteOf(id) || !me()) return;
    const ids = [id];
    for (let k = 0; k < ids.length; k++)
      kidsOf(ids[k]).forEach((n) => ids.push(n.id));
    try {
      for (const i of ids)
        await api.upd("notes", i, { privateTo: on ? me().id : null });
      if (id === cur) head(noteOf(id));
      toast(
        on
          ? "Sada samo ti vidiš ovu stranicu"
          : "Stranica je sada vidljiva timu",
        () => setPrivate(id, !on),
      );
    } catch (e) {
      toast(errMsg(e));
    }
  }

  /* ---------------- folderi: pravljenje, uređivanje, premeštanje ---------------- */
  function foldUI() {
    if (!$("#general").hidden) hub(false);
    const p = rendered && !isScript() && noteOf(rendered);
    if (p) head(p);
  }
  function foldMenu(M, p) {
    if (!p) return;
    const cf = fidOf(p),
      ck = `<span class="check">${I.check}</span>`;
    M.innerHTML =
      `<div class="nm-h">Premesti u folder</div>` +
      `<button type="button" data-pm="mv" data-f="">${I.doc}<span>Bez foldera</span>${cf ? "" : ck}</button>` +
      foldersOf(spaceOf(p))
        .map(
          (F) =>
            `<button type="button" data-pm="mv" data-f="${esc(F.id)}" class="gm-fold" style="--fc:${esc(fcol(F))}">${I.fold}<span>${esc(F.name || "Folder")}</span>${F.id === cf ? ck : ""}</button>`,
        )
        .join("") +
      `<div class="nm-sep"></div><button type="button" data-pm="mvnew">${I.plus}<span>Novi folder…</span></button>`;
  }
  async function moveTo(n, fid, quiet) {
    if (!n || n.parentId || n.privateTo) return;
    const to = folderOf(fid, spaceOf(n)) ? fid : null,
      from = fidOf(n);
    if (from === to) return;
    const p = api.upd("notes", n.id, { folderId: to });
    foldUI();
    const tile = to && $(`#gpages .fcf[data-gf="${CSS.escape(to)}"]`);
    if (tile) {
      tile.classList.add("got");
      setTimeout(() => tile.classList.remove("got"), 700);
    }
    try {
      await p;
    } catch (e) {
      n.folderId = from;
      foldUI();
      toast(errMsg(e));
      return;
    }
    if (quiet) return;
    const F = folderOf(to, spaceOf(n));
    toast(
      F ? `Premešteno u „${F.name || "Folder"}“` : "Premešteno u sve stranice",
      () => moveTo(noteOf(n.id), from, true),
    );
  }
  /* move: stranica koja odmah ide u novi folder (meni stranice) */
  function newFolder(move) {
    const sp = move ? spaceOf(move) : hubSpace,
      cols = X.foldCols();
    X.foldDlg({
      color: cols[foldersOf(sp).length % cols.length],
      save: async (name, color) => {
        const id = "f" + Math.random().toString(36).slice(2, 11),
          now = Date.now();
        try {
          await api.set("noteFolders", id, {
            name,
            color,
            spaceId: sp,
            order: now,
            createdAt: now,
            createdBy: me() ? me().id : null,
          });
        } catch (e) {
          toast(errMsg(e));
          return;
        }
        foldUI();
        if (move) moveTo(noteOf(move.id), id);
        else toast(`Folder „${name}“ je spreman. Prevuci stranice na njega.`);
      },
    });
  }
  function editFolder(F) {
    X.foldDlg({
      F,
      save: async (name, color) => {
        const p = api.upd("noteFolders", F.id, { name, color });
        foldUI();
        try {
          await p;
        } catch (e) {
          toast(errMsg(e));
        }
      },
      del: async () => {
        const { id, ...data } = F,
          n = notes().filter((x) => fidOf(x) === id).length,
          nf = allFiles().filter((x) => ffidOf(x) === id).length;
        if (hubFid === id && !$("#general").hidden)
          X.nav(homeOf(F.spaceId || null));
        /* stranice zadržavaju folderId, pa ih „Poništi“ vraća baš u ovaj folder */
        try {
          await api.del("noteFolders", id);
        } catch (e) {
          toast(errMsg(e));
          return;
        }
        toast(
          n || nf
            ? `Folder obrisan. ${[n ? n + " " + pagesWord(n) : "", nf ? nf + " " + filesWord(nf) : ""].filter(Boolean).join(" i ")} ${n + nf === 1 ? "je" : "su"} sad van foldera.`
            : "Folder obrisan",
          () => api.set("noteFolders", id, data).catch((e) => toast(errMsg(e))),
        );
      },
    });
  }

  /* ---------------- fajlovi u General-u (kolekcija "files") ----------------
     files/{id} = {name, type, size, blob, url, thumb, thumbBlob, w, h, dur, folderId, spaceId,
                   order, createdAt, createdBy, updatedAt, updatedBy}
     Original je u bucketu os-assets ("/_blob/<id>", OS.files u os-db.js); slike i video dobiju
     malu sličicu pri otpremanju, pa mreža i fascikle ostaju brze i sa velikim fajlovima.
     Fajl je u folderu kao i stranica (folderId); folder koji više ne postoji = van foldera. */
  const allFiles = () => S.files || [];
  const fileOf = (id) => allFiles().find((f) => f.id === id);
  const ffidOf = (f) =>
    f && folderOf(f.folderId, f.spaceId || null) ? f.folderId : null;
  const byNew = (a, b) => (b.createdAt || 0) - (a.createdAt || 0);
  const filesIn = (sp, fid) =>
    allFiles()
      .filter(
        (f) =>
          (f.spaceId || null) === (sp || null) && ffidOf(f) === (fid || null),
      )
      .sort(byNew);
  const filesWord = (n) => plural(n, "fajl", "fajla", "fajlova");
  const fkind = (f) =>
    /^image\//.test(f.type || "")
      ? "img"
      : /^video\//.test(f.type || "")
        ? "vid"
        : /^audio\//.test(f.type || "")
          ? "aud"
          : f.type === "application/pdf" || /\.pdf$/i.test(f.name || "")
            ? "pdf"
            : "doc";
  const fext = (n) => {
    const m = /\.([a-z0-9]{1,5})$/i.exec(n || "");
    return m ? m[1].toUpperCase() : "FAJL";
  };
  const EXTC = {
    pdf: "#ff6b5b",
    doc: "#5b9cf0",
    docx: "#5b9cf0",
    pages: "#5b9cf0",
    txt: "#a89a88",
    md: "#a89a88",
    xls: "#4fbf7f",
    xlsx: "#4fbf7f",
    csv: "#4fbf7f",
    numbers: "#4fbf7f",
    ppt: "#f3b04c",
    pptx: "#f3b04c",
    key: "#f3b04c",
    zip: "#d9c35a",
    rar: "#d9c35a",
    "7z": "#d9c35a",
    psd: "#5bc8f0",
    ai: "#f3a04c",
    fig: "#a98bff",
    sketch: "#f3b04c",
    html: "#e0679a",
    mp3: "#a98bff",
    wav: "#a98bff",
    m4a: "#a98bff",
  };
  const fcolor = (f) =>
    EXTC[fext(f.name).toLowerCase()] ||
    { img: "#4fbfa8", vid: "#e0679a", aud: "#a98bff", pdf: "#ff6b5b" }[
      fkind(f)
    ] ||
    "#a89a88";
  function fsize(b) {
    b = +b || 0;
    if (b < 1024) return b + " B";
    if (b < 1048576) return Math.round(b / 1024) + " KB";
    if (b < 1073741824)
      return (
        (b / 1048576).toFixed(b < 10485760 ? 1 : 0).replace(".", ",") + " MB"
      );
    return (b / 1073741824).toFixed(1).replace(".", ",") + " GB";
  }
  const fdur = (s) =>
    s > 0
      ? Math.floor(s / 60) + ":" + String(Math.round(s % 60)).padStart(2, "0")
      : "";
  const FI = {
    up: SV('<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>', 2.2),
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5z"/></svg>',
    doc: SV(
      '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/>',
      1.8,
    ),
    aud: SV(
      '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
      1.8,
    ),
    x: SV('<path d="M18 6 6 18M6 6l12 12"/>', 2.4),
    l: SV('<path d="m15 18-6-6 6-6"/>', 2.4),
    r: SV('<path d="m9 18 6-6-6-6"/>', 2.4),
    link: SV(
      '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
    ),
  };
  /* otpremanja u toku: id → {id, name, type, size, folderId, spaceId, p, preview} */
  const UP = new Map();
  const upIn = (sp, fid) =>
    [...UP.values()].filter(
      (u) =>
        (u.spaceId || null) === (sp || null) &&
        (u.folderId || null) === (fid || null),
    );
  /* fajl u istoj mreži kao stranice: slika/video kao pozadina, ostalo kao ikonica tipa */
  const baseName = (n) =>
    String(n || "Fajl").replace(/\.[a-z0-9]{1,5}$/i, "") || n;
  function fileTile(f, style, up) {
    const k = fkind(f),
      u = !up && who(f.createdBy),
      th = up ? up.preview : f.thumb || (k === "img" ? f.url : ""),
      media = !!th || (k === "vid" && !up && f.url);
    const bg = th
      ? `<img src="${esc(th)}" alt="" loading="lazy" decoding="async" draggable="false">`
      : media
        ? `<video src="${esc(f.url)}#t=0.5" preload="metadata" muted playsinline tabindex="-1"></video>`
        : "";
    const tag =
      k === "vid"
        ? `${FI.play}${f.dur ? fdur(f.dur) : fext(f.name)}`
        : esc(fext(f.name));
    const drag = !up && !touch();
    return `<div class="cptile gfile k-${k}${media ? " media" : ""}${up ? " up" : ""}${!up && S.fresh.has(f.id) ? " new" : ""}" ${up ? `data-upf="${esc(f.id)}"` : `role="button" tabindex="0" data-file="${esc(f.id)}" aria-label="Fajl ${esc(f.name)}"`}${drag ? ' draggable="true"' : ""} style="--c:${fcolor(f)};${style}">
      ${media ? `<span class="gf-bg">${bg}</span>` : `<span class="ci gf-ci">${k === "aud" ? FI.aud : FI.doc}</span>`}<span class="gf-tag">${tag}</span>
      <div class="gt-b"><h3 class="gf-n" title="${esc(f.name)}">${esc(baseName(f.name))}</h3>
      <div class="meta2">${up ? "<span>Otpremam…</span>" : `${u ? `<img src="${esc(X.IMG[u.id])}" alt="" draggable="false">` : ""}<span>${esc(fsize(f.size))}${f.createdAt ? " · " + esc(rel(f.createdAt)) : ""}</span>`}</div></div>
      ${up ? `<span class="gf-up" style="--p:${up.p || 0}"><i></i><b>${Math.round((up.p || 0) * 100)}%</b></span>` : ""}
    </div>`;
  }
  /* pločice na kraju mreže: nova stranica i fajl (klik ili prevlačenje) */
  const addTiles = (style, F) =>
    `<button class="cptile add" data-gnew style="${style}"><span class="ci">${I.plus}</span>Nova stranica</button>` +
    `<button type="button" class="cptile add gf-add" data-gup style="${style}"><span class="ci">${FI.up}</span><span class="gf-at">${touch() ? "Dodaj fajl ili sliku" : "Dodaj fajl"}<small>${touch() ? "slike, video, PDF…" : "ili prevuci fajlove bilo gde na ekran"}${F ? " · ide u „" + esc(F.name || "Folder") + "“" : ""}</small></span></button>`;
  /* jedan red u stranici za otpremljen fajl (isti Markdown koji pravi editor) */
  const fileLine = (name, type, url) =>
    /^image\//.test(type || "") && !/heic|heif|tiff/i.test(type)
      ? `![](${url})`
      : type === "text/html" || /\.html?$/i.test(name || "")
        ? `::embed[${escPlain(name || "HTML")}](${url})`
        : `[${escPlain(name || "Fajl")}](${url})`;
  /* dopiši blokove na kraj stranice (compare-and-set na md; tuđa izmena u međuvremenu = ponovi) */
  async function addToPage(id, lines) {
    for (let k = 0; k < 5; k++) {
      const n = noteOf(id);
      if (!n) throw { code: "not_found" };
      const md0 = n.md || "",
        md =
          md0.replace(/\s+$/, "") +
          (md0.trim() ? "\n\n" : "") +
          lines.join("\n\n") +
          "\n";
      const r = await api.updIf(
        "notes",
        id,
        { md, updatedAt: Date.now(), updatedBy: me() ? me().id : null },
        "md",
        md0,
      );
      if (!r.conflict) return lines.join("\n\n");
      const loc = noteOf(id);
      if (loc && r.data && typeof r.data.md === "string") loc.md = r.data.md;
      await new Promise((ok) => setTimeout(ok, 150));
    }
    throw { code: "failed" };
  }
  /* „Poništi“: izvadi dopisane blokove ako su još tu */
  async function takeFromPage(id, chunk) {
    for (let k = 0; k < 5; k++) {
      const n = noteOf(id);
      if (!n) return;
      const md0 = n.md || "",
        at = md0.lastIndexOf(chunk);
      if (at < 0) return;
      const md = (
        md0.slice(0, at).replace(/\s+$/, "") +
        "\n" +
        md0.slice(at + chunk.length).replace(/^\s+/, "\n")
      ).replace(/^\s+$/, "");
      const r = await api.updIf(
        "notes",
        id,
        { md: md.trim() ? md.replace(/\n{3,}/g, "\n\n") : "" },
        "md",
        md0,
      );
      if (!r.conflict) return;
      const loc = noteOf(id);
      if (loc && r.data && typeof r.data.md === "string") loc.md = r.data.md;
    }
  }
  /* otpremanja u stranicu iz huba: id stranice → {p, n} (prsten na pločici) */
  const PUP = new Map();
  function pupPaint(id) {
    const u = PUP.get(id),
      el = $(`#gpages .gtile[data-gid="${CSS.escape(id)}"] .gf-up`);
    if (!u || !el) return;
    el.style.setProperty("--p", u.p);
    el.lastElementChild.textContent = Math.round(u.p * 100) + "%";
  }
  async function uploadToPage(n, list) {
    const st = store(),
      max = st ? st.maxBytes : Infinity;
    const ok = list.filter((f) => f.size > 0 && f.size <= max);
    if (ok.length < list.length)
      toast(
        `${list.length - ok.length} ${filesWord(list.length - ok.length)} veći od ${st ? st.maxLabel : "dozvoljenog"} nije otpremljen.`,
      );
    if (!ok.length || !n) return;
    const tot = ok.reduce((a, f) => a + f.size, 0),
      got = new Map(),
      u = { p: 0, n: ok.length };
    PUP.set(n.id, u);
    foldUI();
    try {
      const urls = await Promise.all(
        ok.map((f) =>
          putBlob(f, (p) => {
            got.set(f, p * f.size);
            u.p = [...got.values()].reduce((a, v) => a + v, 0) / tot;
            pupPaint(n.id);
          }),
        ),
      );
      const chunk = await addToPage(
        n.id,
        ok.map((f, i) => fileLine(f.name, f.type, urls[i].url)),
      );
      PUP.delete(n.id);
      foldUI();
      const t = noteOf(n.id);
      toast(
        `Dodato u „${(t && t.title) || "Bez naslova"}“: ${ok.length} ${filesWord(ok.length)}`,
        () => X.nav("g-" + n.id),
        "Otvori",
      );
      return chunk;
    } catch (e) {
      PUP.delete(n.id);
      foldUI();
      toast(
        e && e.code === "too_large"
          ? e.msg || "Fajl je prevelik."
          : e && e.code === "not_granted"
            ? "Nemaš dozvolu za ovu stranicu."
            : "Otpremanje u stranicu nije uspelo. Probaj ponovo.",
      );
    }
  }
  /* fajl iz huba prevučen na stranicu: prelazi u stranicu (original ostaje u skladištu) */
  async function fileIntoPage(f, n) {
    if (!f || !n) return;
    const { id, ...data } = f;
    let chunk;
    try {
      chunk = await addToPage(n.id, [fileLine(f.name, f.type, f.url)]);
      await api.del("files", id);
    } catch (e) {
      toast(errMsg(e));
      return;
    }
    foldUI();
    toast(
      `„${f.name}“ je sad u stranici „${n.title || "Bez naslova"}“`,
      async () => {
        try {
          await api.set("files", id, data);
          await takeFromPage(n.id, chunk);
        } catch (e) {
          toast(errMsg(e));
        }
      },
    );
  }

  /* sličica: slika do 520 px (webp ili jpeg), video = kadar sa 10% trajanja */
  function canvasBlob(c) {
    return new Promise((res) =>
      c.toBlob(
        (b) =>
          b && b.type === "image/webp"
            ? res(b)
            : c.toBlob((j) => res(j), "image/jpeg", 0.82),
        "image/webp",
        0.82,
      ),
    );
  }
  function drawThumb(src, w, h) {
    const M = 520,
      r = Math.min(1, M / Math.max(w, h)),
      c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(w * r));
    c.height = Math.max(1, Math.round(h * r));
    c.getContext("2d").drawImage(src, 0, 0, c.width, c.height);
    return canvasBlob(c);
  }
  async function makeThumb(file) {
    const k = fkind(file);
    if (k === "img") {
      if (/svg|gif/.test(file.type)) return null; // svg se skalira sam, gif zadržava animaciju
      const url = URL.createObjectURL(file);
      try {
        const img = await new Promise((res, rej) => {
          const i = new Image();
          i.onload = () => res(i);
          i.onerror = rej;
          i.src = url;
        });
        const w = img.naturalWidth,
          h = img.naturalHeight;
        const blob =
          file.size > 300 * 1024 || Math.max(w, h) > 1400
            ? await drawThumb(img, w, h)
            : null;
        return { blob, w, h };
      } catch (e) {
        return null; // npr. HEIC van Safarija: ostaje ikonica
      } finally {
        URL.revokeObjectURL(url);
      }
    }
    if (k === "vid") {
      const url = URL.createObjectURL(file),
        v = document.createElement("video");
      try {
        v.muted = true;
        v.playsInline = true;
        v.preload = "auto";
        v.src = url;
        await new Promise((res, rej) => {
          v.onloadeddata = res;
          v.onerror = rej;
          setTimeout(() => rej("timeout"), 8000);
        });
        const dur = isFinite(v.duration) ? v.duration : 0;
        v.currentTime = Math.min(2, dur * 0.1 || 0.1);
        await new Promise((res) => {
          v.onseeked = res;
          setTimeout(res, 2500);
        });
        const blob = await drawThumb(v, v.videoWidth || 16, v.videoHeight || 9);
        return { blob, w: v.videoWidth, h: v.videoHeight, dur };
      } catch (e) {
        return null;
      } finally {
        v.removeAttribute("src");
        v.load();
        URL.revokeObjectURL(url);
      }
    }
    return null;
  }
  const store = () => (window.OS && window.OS.files) || null;
  async function putBlob(file, onP) {
    const st = store();
    if (st) return st.put(file, { onProgress: onP });
    if (S.mode === "local") {
      onP && onP(1);
      return { id: "", url: URL.createObjectURL(file) };
    }
    throw { code: "not_granted" };
  }
  function upPaint(u) {
    const el = $(`#gpages [data-upf="${CSS.escape(u.id)}"] .gf-up`);
    if (!el) return;
    el.style.setProperty("--p", u.p);
    el.lastElementChild.textContent = Math.round(u.p * 100) + "%";
  }
  let upQ = [],
    upRun = 0,
    upDone = { n: 0, F: null, fail: 0 };
  /* fajlovi → folder (fid) u trenutnom hubu; najviše 3 otpremanja odjednom */
  function uploadFiles(list, fid) {
    const st = store(),
      max = st ? st.maxBytes : Infinity,
      sp = hubSpace,
      F = folderOf(fid, sp);
    const big = list.filter((f) => f.size > max),
      ok = list.filter((f) => f.size <= max && f.size > 0);
    if (big.length)
      toast(
        big.length === 1
          ? `„${big[0].name}“ je veći od ${st.maxLabel}.`
          : `${big.length} fajla su veća od ${st.maxLabel} i nisu otpremljena.`,
      );
    if (!ok.length) return;
    upDone.F = F;
    for (const file of ok) {
      const id =
        "u" + Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
      const u = {
        id,
        file,
        name: file.name || "Fajl",
        type: file.type || "",
        size: file.size,
        folderId: F ? fid : null,
        spaceId: sp,
        p: 0,
        preview:
          fkind(file) === "img" && !/heic|heif|tiff/i.test(file.type)
            ? URL.createObjectURL(file)
            : "",
      };
      UP.set(id, u);
      upQ.push(u);
    }
    foldUI();
    pump();
  }
  function pump() {
    while (upRun < 3 && upQ.length) {
      const u = upQ.shift();
      upRun++;
      upOne(u).finally(() => {
        upRun--;
        pump();
        if (!upRun && !upQ.length) {
          const { n, F, fail } = upDone;
          upDone = { n: 0, F: null, fail: 0 };
          if (n)
            toast(
              `Otpremljeno: ${n} ${filesWord(n)}${F ? ` u „${F.name || "Folder"}“` : ""}${fail ? ` · ${fail} nije uspelo` : ""}`,
            );
        }
      });
    }
  }
  async function upOne(u) {
    const file = u.file;
    try {
      const th = await makeThumb(file).catch(() => null);
      const tb =
        th && th.blob ? await putBlob(th.blob).catch(() => null) : null;
      const r = await putBlob(file, (p) => {
        u.p = p;
        upPaint(u);
      });
      const now = Date.now(),
        id = "f" + Math.random().toString(36).slice(2, 10) + now.toString(36);
      const doc = {
        name: u.name,
        type: u.type,
        size: u.size,
        blob: r.id || null,
        url: r.url,
        thumb: tb ? tb.url : null,
        thumbBlob: tb ? tb.id || null : null,
        ...(th && th.w ? { w: th.w, h: th.h } : {}),
        ...(th && th.dur ? { dur: Math.round(th.dur * 10) / 10 } : {}),
        folderId: u.folderId,
        spaceId: u.spaceId,
        order: now,
        createdAt: now,
        createdBy: me() ? me().id : null,
        updatedAt: now,
        updatedBy: me() ? me().id : null,
      };
      X.markFresh(id);
      UP.delete(u.id);
      await api.set("files", id, doc);
      upDone.n++;
    } catch (e) {
      UP.delete(u.id);
      upDone.fail++;
      toast(
        e && e.code === "too_large"
          ? e.msg || "Fajl je prevelik."
          : e && e.code === "not_granted"
            ? "Nemaš dozvolu za otpremanje."
            : `„${u.name}“ nije otpremljen. Proveri internet pa probaj ponovo.`,
      );
    } finally {
      if (u.preview) setTimeout(() => URL.revokeObjectURL(u.preview), 4000);
      foldUI();
    }
  }
  addEventListener("beforeunload", (e) => {
    if (UP.size) {
      e.preventDefault();
      e.returnValue = "";
    }
  });
  async function moveFile(f, fid, quiet) {
    if (!f) return;
    const to = folderOf(fid, f.spaceId || null) ? fid : null,
      from = ffidOf(f);
    if (from === to) return;
    const p = api.upd("files", f.id, { folderId: to });
    foldUI();
    const tile = to && $(`#gpages .fcf[data-gf="${CSS.escape(to)}"]`);
    if (tile) {
      tile.classList.add("got");
      setTimeout(() => tile.classList.remove("got"), 700);
    }
    try {
      await p;
    } catch (e) {
      toast(errMsg(e));
      return;
    }
    if (quiet) return;
    const F = folderOf(to, f.spaceId || null);
    toast(
      F
        ? `„${f.name}“ je u „${F.name || "Folder"}“`
        : `„${f.name}“ je u svim stranicama`,
      () => moveFile(fileOf(f.id), from, true),
    );
  }
  async function deleteFile(f) {
    if (!f) return;
    const { id, ...data } = f;
    try {
      await api.del("files", id);
    } catch (e) {
      toast(errMsg(e));
      return;
    }
    let undone = false;
    toast(`Obrisan fajl „${f.name}“`, () => {
      undone = true;
      api.set("files", id, data).catch((e) => toast(errMsg(e)));
    });
    /* original se briše iz skladišta tek kad prođe vreme za „Poništi“ */
    setTimeout(() => {
      if (undone || fileOf(id) || !store()) return;
      if (allFiles().some((x) => x.blob === f.blob)) return;
      store()
        .remove([f.blob, f.thumbBlob])
        .catch(() => {});
    }, 7000);
  }

  /* ---------------- pregled fajla ---------------- */
  let FV = null; // {id, list}
  function fvEl() {
    let el = $("#gfv");
    if (el) return el;
    el = document.createElement("div");
    el.className = "gfv";
    el.id = "gfv";
    el.hidden = true;
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-modal", "true");
    el.setAttribute("aria-label", "Pregled fajla");
    el.innerHTML = `<div class="gfv-top">
        <input class="gfv-n" id="gfvN" maxlength="120" spellcheck="false" aria-label="Naziv fajla">
        <span class="gfv-m" id="gfvM"></span>
        <span class="gfv-sp"></span>
        <a class="pill" id="gfvDl" download>${I.dl}<span>Preuzmi</span></a>
        <button type="button" class="pill" id="gfvLn" title="Kopiraj link">${FI.link}<span>Link</span></button>
        <label class="pill gfv-fold">${I.fold}<span id="gfvFL">Folder</span><select id="gfvF" aria-label="Premesti u folder"></select></label>
        <button type="button" class="pill danger" id="gfvDel" aria-label="Obriši fajl">${I.trash}</button>
        <button type="button" class="gfv-x" id="gfvX" aria-label="Zatvori">${FI.x}</button>
      </div>
      <div class="gfv-st" id="gfvS"></div>
      <button type="button" class="gfv-nav p" id="gfvP" aria-label="Prethodni fajl">${FI.l}</button>
      <button type="button" class="gfv-nav n" id="gfvNx" aria-label="Sledeći fajl">${FI.r}</button>`;
    document.body.appendChild(el);
    $("#gfvX").onclick = closeFv;
    $("#gfvP").onclick = () => stepFv(-1);
    $("#gfvNx").onclick = () => stepFv(1);
    $("#gfvDel").onclick = () => {
      const f = FV && fileOf(FV.id);
      if (!f) return;
      const nx =
        FV.list[FV.list.indexOf(f.id) + 1] ||
        FV.list[FV.list.indexOf(f.id) - 1];
      FV.list = FV.list.filter((x) => x !== f.id);
      deleteFile(f);
      if (nx && fileOf(nx)) openFv(nx, FV.list);
      else closeFv();
    };
    $("#gfvLn").onclick = async () => {
      const f = FV && fileOf(FV.id);
      if (!f) return;
      try {
        await navigator.clipboard.writeText(new URL(f.url, location.href).href);
        toast("Link je kopiran");
      } catch (e) {
        toast("Link nije kopiran");
      }
    };
    $("#gfvF").onchange = (e) => {
      const f = FV && fileOf(FV.id);
      if (f) moveFile(f, e.target.value || null);
      setTimeout(paintFvMeta, 0);
    };
    const nm = $("#gfvN");
    const saveName = () => {
      const f = FV && fileOf(FV.id),
        v = nm.value.trim();
      if (!f || !v || v === f.name) {
        if (f) nm.value = f.name;
        return;
      }
      api
        .upd("files", f.id, {
          name: v,
          updatedAt: Date.now(),
          updatedBy: me() ? me().id : null,
        })
        .then(() => foldUI())
        .catch((e) => toast(errMsg(e)));
    };
    nm.addEventListener("blur", saveName);
    nm.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        nm.blur();
      }
      if (e.key === "Escape") {
        e.stopPropagation();
        const f = FV && fileOf(FV.id);
        if (f) nm.value = f.name;
        nm.blur();
      }
    });
    el.addEventListener("click", (e) => {
      if (e.target === el || e.target.id === "gfvS") closeFv();
    });
    addEventListener("keydown", (e) => {
      if (!FV || el.hidden) return;
      if (e.target.closest && e.target.closest("input,select,textarea")) return;
      if (e.key === "Escape") {
        e.stopPropagation();
        closeFv();
      } else if (e.key === "ArrowLeft") stepFv(-1);
      else if (e.key === "ArrowRight") stepFv(1);
    });
    return el;
  }
  function paintFvMeta() {
    const f = FV && fileOf(FV.id);
    if (!f) return;
    const u = who(f.createdBy),
      sp = f.spaceId || null,
      cf = ffidOf(f);
    $("#gfvM").textContent = [
      fsize(f.size),
      u ? u.name : "",
      f.createdAt ? rel(f.createdAt) : "",
    ]
      .filter(Boolean)
      .join(" · ");
    $("#gfvF").innerHTML =
      `<option value="">Bez foldera</option>` +
      foldersOf(sp)
        .map(
          (F) =>
            `<option value="${esc(F.id)}"${F.id === cf ? " selected" : ""}>${esc(F.name || "Folder")}</option>`,
        )
        .join("");
    const F = folderOf(cf, sp);
    $("#gfvFL").textContent = F ? F.name || "Folder" : "Bez foldera";
  }
  function openFv(id, list) {
    const f = fileOf(id);
    if (!f) return;
    const el = fvEl();
    FV = { id, list: list || [id] };
    const k = fkind(f),
      st = $("#gfvS");
    $("#gfvN").value = f.name || "";
    const dl = $("#gfvDl");
    dl.href = f.url;
    dl.setAttribute("download", f.name || "fajl");
    paintFvMeta();
    st.className = "gfv-st k-" + k;
    st.innerHTML =
      k === "img"
        ? `<img src="${esc(f.url)}" alt="${esc(f.name)}" decoding="async">`
        : k === "vid"
          ? `<video src="${esc(f.url)}" controls playsinline preload="metadata"${f.thumb ? ` poster="${esc(f.thumb)}"` : ""}></video>`
          : k === "aud"
            ? `<div class="gfv-card" style="--fx:${fcolor(f)}">${FI.aud}<b>${esc(f.name)}</b><audio src="${esc(f.url)}" controls preload="metadata"></audio></div>`
            : k === "pdf"
              ? `<iframe src="${esc(f.url)}#view=FitH" title="${esc(f.name)}"></iframe>`
              : `<div class="gfv-card" style="--fx:${fcolor(f)}"><span class="gf-ic">${FI.doc}<b>${esc(fext(f.name))}</b></span><b>${esc(f.name)}</b><span>${esc(fsize(f.size))} · pregled nije moguć u pregledaču</span><a class="pill solid" href="${esc(f.url)}" download="${esc(f.name)}">${I.dl}<span>Preuzmi fajl</span></a></div>`;
    const i = FV.list.indexOf(id);
    $("#gfvP").hidden = i <= 0;
    $("#gfvNx").hidden = i < 0 || i >= FV.list.length - 1;
    if (el.hidden) {
      el.hidden = false;
      document.body.style.overflow = "hidden";
      requestAnimationFrame(() => el.classList.add("open"));
    }
  }
  function stepFv(d) {
    if (!FV) return;
    const i = FV.list.indexOf(FV.id) + d;
    if (FV.list[i]) openFv(FV.list[i], FV.list);
  }
  function closeFv() {
    const el = $("#gfv");
    if (!el || el.hidden) return;
    const v = el.querySelector("video,audio");
    if (v) v.pause();
    el.classList.remove("open");
    document.body.style.overflow = "";
    FV = null;
    setTimeout(
      () => {
        if (FV) return;
        el.hidden = true;
        $("#gfvS").innerHTML = "";
      },
      reduce ? 0 : 200,
    );
  }
  /* fajlovi koji su trenutno na ekranu (redom kao u mreži): strelice u pregledu */
  const shownFiles = () =>
    [...document.querySelectorAll("#gpages [data-file]")].map(
      (e) => e.dataset.file,
    );

  /* ---------------- prevlačenje fajlova sa računara ---------------- */
  let dropN = 0,
    dropT = null;
  const isFileDrag = (e) =>
    !dragId &&
    e.dataTransfer &&
    [...(e.dataTransfer.types || [])].includes("Files") &&
    !$("#general").hidden &&
    (!$("#gfv") || $("#gfv").hidden);
  const DROP_T = "#gpages .fcf[data-gf], #gpages .gtile[data-gid]";
  function dropEl() {
    let el = $("#gdropx");
    if (!el) {
      el = document.createElement("div");
      el.id = "gdropx";
      el.className = "gdropx";
      el.setAttribute("aria-hidden", "true");
      el.innerHTML = `<span class="gdx-p">${FI.up}<span id="gdxT"></span></span><i class="gdx-l" id="gdxL"></i>`;
      document.body.appendChild(el);
    }
    return el;
  }
  function dropUI(on, t) {
    const F = t && t.dataset.gf ? folderOf(t.dataset.gf, hubSpace) : null,
      P = t && t.dataset.gid ? noteOf(t.dataset.gid) : null;
    const el = dropEl();
    el.classList.remove("pg");
    $("#gpages").classList.toggle("fdrag", !!on);
    if (!on) {
      el.classList.remove("on");
      $("#gpages")
        .querySelectorAll(".drop")
        .forEach((x) => x.classList.remove("drop"));
      return;
    }
    const cur = folderOf(hubFid, hubSpace),
      T = F || (!P && cur);
    el.style.setProperty("--fc", T ? fcol(T) : "var(--orange)");
    $("#gdxT").textContent = P
      ? `Pusti u stranicu „${P.title || "Bez naslova"}“`
      : T
        ? `Pusti u folder „${T.name || "Folder"}“`
        : `Pusti da otpremiš u ${X.spaceLabel(hubSpace)}`;
    el.classList.add("on");
  }
  addEventListener("dragenter", (e) => {
    if (!isFileDrag(e)) return;
    dropN++;
    dropUI(true);
  });
  addEventListener("dragleave", (e) => {
    if (!dropN) return;
    dropN = Math.max(0, dropN - 1);
    clearTimeout(dropT);
    if (!dropN) dropT = setTimeout(() => !dropN && dropUI(false), 60);
  });
  addEventListener("dragover", (e) => {
    if (!isFileDrag(e)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    const t = e.target.closest && e.target.closest(DROP_T);
    $("#gpages")
      .querySelectorAll(".drop")
      .forEach((x) => x !== t && x.classList.remove("drop"));
    if (t && !t.classList.contains("drop")) t.classList.add("drop");
    dropUI(true, t);
  });
  addEventListener("drop", (e) => {
    if (!dropN && !isFileDrag(e)) return;
    dropN = 0;
    const ok = isFileDrag(e);
    const t = e.target.closest && e.target.closest(DROP_T);
    dropUI(false);
    if (!ok) return;
    e.preventDefault();
    const items = [...(e.dataTransfer.items || [])];
    const dirs = items.filter(
      (it) => it.webkitGetAsEntry && (it.webkitGetAsEntry() || {}).isDirectory,
    ).length;
    const list = [...(e.dataTransfer.files || [])].filter(
      (f, i) =>
        !(
          items[i] &&
          items[i].webkitGetAsEntry &&
          (items[i].webkitGetAsEntry() || {}).isDirectory
        ),
    );
    if (dirs)
      toast(
        "Folderi se ne otpremaju: otvori folder i prevuci fajlove iz njega.",
      );
    if (!list.length) return;
    if (t && t.dataset.gid) uploadToPage(noteOf(t.dataset.gid), list);
    else uploadFiles(list, t ? t.dataset.gf : hubFid);
  });

  /* ---------------- fajl prevučen na otvorenu stranicu ----------------
     Editor već prima fajl na blok; ovde je i ostatak ekrana (naslov, margine, prostor ispod
     poslednjeg bloka), da pregledač ne otvori fajl umesto OS-a. Linija pokazuje gde fajl ide. */
  let gpN = 0,
    gpT = null;
  const isGpDrag = (e) =>
    e.dataTransfer &&
    [...(e.dataTransfer.types || [])].includes("Files") &&
    !$("#gp").hidden &&
    !!rendered &&
    !isScript();
  /* iznad prvog bloka (naslov, ikonica): fajl ide na vrh stranice */
  const atTop = (y) => {
    const b0 = blocks()[0];
    return !!b0 && y < b0.getBoundingClientRect().top;
  };
  function gpUI(on, y) {
    const el = dropEl();
    if (!on) {
      el.classList.remove("on", "pg");
      return;
    }
    const p = noteOf(rendered),
      b = blockAtY(y),
      ln = $("#gdxL");
    el.style.setProperty("--fc", "var(--orange)");
    $("#gdxT").textContent = `Pusti u „${(p && p.title) || "Bez naslova"}“`;
    if (b) {
      const r = b.getBoundingClientRect(),
        top = atTop(y),
        empty = b.dataset.t === "p" && isEmpty(tOf(b));
      ln.style.transform = `translate(${Math.round(r.left)}px, ${Math.round(top ? r.top - 4 : empty ? r.top + r.height / 2 : r.bottom + 3)}px)`;
      ln.style.width = Math.round(r.width) + "px";
    }
    el.classList.add("on", "pg");
  }
  addEventListener("dragenter", (e) => {
    if (!isGpDrag(e)) return;
    gpN++;
    gpUI(true, e.clientY);
  });
  addEventListener("dragleave", () => {
    if (!gpN) return;
    gpN = Math.max(0, gpN - 1);
    clearTimeout(gpT);
    if (!gpN) gpT = setTimeout(() => !gpN && gpUI(false), 60);
  });
  addEventListener("dragover", (e) => {
    if (!isGpDrag(e)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    gpUI(true, e.clientY);
  });
  addEventListener("drop", (e) => {
    if (!gpN && !isGpDrag(e)) return;
    gpN = 0;
    gpUI(false);
    if (!isGpDrag(e) || e.defaultPrevented) return; // blok u editoru ga je već primio
    e.preventDefault();
    const fs = [...(e.dataTransfer.files || [])];
    const b = fs.length && blockAtY(e.clientY);
    if (!b) return;
    pushUndo();
    if (atTop(e.clientY) && !(b.dataset.t === "p" && isEmpty(tOf(b)))) {
      const nb = make({ t: "p", x: "" });
      root.prepend(nb);
      uploadInto(fs, nb, true);
    } else uploadInto(fs, b, b.dataset.t === "p" && isEmpty(tOf(b)));
  });
  /* nalepljena slika ili fajl (⌘V) dok je General otvoren */
  addEventListener("paste", (e) => {
    if ($("#general").hidden || !e.clipboardData) return;
    if (
      e.target.closest &&
      e.target.closest("input,textarea,[contenteditable]")
    )
      return;
    const list = [...(e.clipboardData.files || [])];
    if (!list.length) return;
    e.preventDefault();
    uploadFiles(
      list.map((f, i) =>
        f.name && f.name !== "image.png"
          ? f
          : new File(
              [f],
              `Snimak ekrana ${new Date().toLocaleString("sr-Latn-RS").replace(/[/:]/g, ".")}${list.length > 1 ? " " + (i + 1) : ""}.${(f.type.split("/")[1] || "png").replace("jpeg", "jpg")}`,
              { type: f.type },
            ),
      ),
      hubFid,
    );
  });
  /* skladište: koliko je zauzeto (osveži najviše jednom u minuti) */
  let usage = null,
    usageAt = 0;
  function loadUsage() {
    const st = store();
    if (!st || !st.usage || Date.now() - usageAt < 60000) return;
    usageAt = Date.now();
    st.usage()
      .then((u) => {
        if (!u) return;
        usage = u;
        if (!$("#general").hidden) hub(false);
      })
      .catch(() => {});
  }

  /* ---------------- hub controls ---------------- */
  $("#gNew").addEventListener("click", () => createAndOpen(null));
  $("#gNewF").addEventListener("click", () => newFolder());
  $("#gq").addEventListener("input", (e) => {
    hq = e.target.value;
    hub(false);
  });
  const pickInto = () => pickFiles("", (fs) => uploadFiles(fs, hubFid));
  $("#gUp") && $("#gUp").addEventListener("click", pickInto);
  $("#gpages").addEventListener("click", (e) => {
    if (e.target.closest("[data-gup]")) {
      pickInto();
      return;
    }
    const fe0 = e.target.closest("[data-file]");
    if (fe0) {
      openFv(fe0.dataset.file, shownFiles());
      return;
    }
    const g = e.target.closest("[data-gnew]");
    if (g) createAndOpen(null, g.dataset.gnew === "me");
    const fe = e.target.closest("[data-gf-edit]");
    if (fe) {
      const F = folderOf(fe.dataset.gfEdit, hubSpace);
      if (F) editFolder(F);
    }
  });
  /* dugmad (folder, „Sve stranice“) Enter već pretvara u klik */
  $("#gpages").addEventListener("keydown", (e) => {
    const fe =
      (e.key === "Enter" || e.key === " ") && e.target.closest("[data-file]");
    if (fe) {
      e.preventDefault();
      openFv(fe.dataset.file, shownFiles());
      return;
    }
    const t = e.key === "Enter" && e.target.closest("[data-go]:not(button)");
    if (t) X.nav(t.dataset.go);
  });
  /* prevlačenje stranice (miš) na folder, ili na „Sve stranice“ dok je folder otvoren */
  let dragId = null;
  const dropAt = (e) =>
    dragId && e.target.closest
      ? e.target.closest(
          dragId.startsWith("f:")
            ? "[data-gf], [data-gf-up], .gtile[data-gid]"
            : "[data-gf], [data-gf-up]",
        )
      : null;
  const dropOff = () =>
    $("#gpages")
      .querySelectorAll(".drop")
      .forEach((x) => x.classList.remove("drop"));
  /* hub se može ponovo nacrtati usred prevlačenja (tuđa izmena), pa dragend ne stigne do
     #gpages: stanje se čisti i na drop i na nivou prozora */
  function dragEnd() {
    dragId = null;
    dropOff();
    $("#gpages")
      .querySelectorAll(".gtile.drag, .gfile.drag")
      .forEach((x) => x.classList.remove("drag"));
    $("#gpages").classList.remove("dragging", "fdrag");
  }
  $("#gpages").addEventListener("dragstart", (e) => {
    const t =
      e.target.closest &&
      e.target.closest(".gtile[draggable=true], .gfile[draggable=true]");
    if (!t || !e.dataTransfer) return;
    if (t.dataset.file) {
      /* fajl: na folder = premesti; na radnu površinu (Chrome) = preuzmi */
      const f = fileOf(t.dataset.file);
      if (!f) return;
      dragId = "f:" + f.id;
      e.dataTransfer.effectAllowed = "copyMove";
      e.dataTransfer.setData("text/x-skeylo-file", f.id);
      try {
        e.dataTransfer.setData(
          "DownloadURL",
          `${f.type || "application/octet-stream"}:${f.name}:${new URL(f.url, location.href).href}`,
        );
      } catch (x) {}
    } else {
      dragId = t.dataset.gid;
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/x-skeylo-page", dragId);
    }
    const isF = !!t.dataset.file;
    requestAnimationFrame(() => {
      t.classList.add("drag");
      $("#gpages").classList.add("dragging");
      $("#gpages").classList.toggle("fdrag", isF);
    });
  });
  $("#gpages").addEventListener("dragend", dragEnd);
  addEventListener("dragend", () => dragId && dragEnd(), true);
  addEventListener("drop", () => dragId && setTimeout(dragEnd), true);
  $("#gpages").addEventListener("dragover", (e) => {
    const t = dropAt(e);
    if (!t) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (!t.classList.contains("drop")) {
      dropOff();
      t.classList.add("drop");
    }
  });
  $("#gpages").addEventListener("dragleave", (e) => {
    const t = dropAt(e);
    if (t && !t.contains(e.relatedTarget)) t.classList.remove("drop");
  });
  $("#gpages").addEventListener("drop", (e) => {
    const t = dropAt(e);
    if (!t) return;
    e.preventDefault();
    const id = dragId;
    dragEnd();
    if (id.startsWith("f:") && t.dataset.gid)
      fileIntoPage(fileOf(id.slice(2)), noteOf(t.dataset.gid));
    else if (id.startsWith("f:"))
      moveFile(fileOf(id.slice(2)), t.dataset.gf || null);
    else moveTo(noteOf(id), t.dataset.gf || null);
  });
  $("#gpages").addEventListener("pointermove", (e) => {
    const t = e.target.closest(".cptile");
    if (!t || touch()) return;
    const r = t.getBoundingClientRect();
    t.style.setProperty("--mx", e.clientX - r.left + "px");
    t.style.setProperty("--my", e.clientY - r.top + "px");
  });

  return { hub, open, sync, leave, flush, focusTop };
};
