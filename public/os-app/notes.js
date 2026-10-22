/* Skeylo OS · General kao Notion.
   Stranice (kolekcija "notes": title, icon, md, parentId, spaceId, order) čuvaju sadržaj kao
   Markdown u polju md. spaceId = mesec/projekat (items) čiji je to General (#mg-{id});
   bez njega stranica pripada glavnom Generalu. Podstranice nasleđuju spaceId roditelja. Editor isti Markdown prikazuje kao blokove: tekst, naslovi,
   liste, zadaci, citat, napomena, kod, razdelnik, slika, fajl i podstranica.
   "/" otvara blokove i iOS emoji. app.js zove window.SKNotes(most) i dobija
   { hub, open, sync, leave, flush, focusTop }.
   Isti editor piše i skripte (ekran #ed, open(id, "script")): skripta čuva md, a
   body (HTML za CRM i stari editor) se generiše iz njega; mdSig = otisak tog body-ja,
   pa skripta čiji je body kasnije menjan negde drugde ponovo kreće od body-ja. */
window.SKNotes = function (X) {
  "use strict";
  const { S, api, esc, SV, toast, errMsg } = X;
  const $ = (s, r = document) => r.querySelector(s);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touch = () => matchMedia("(hover: none)").matches;
  const APPLE =
    /Mac|iPhone|iPad|iPod/.test(navigator.platform || "") ||
    /iPhone|iPad|Mac OS X/.test(navigator.userAgent || "");
  const MOD = APPLE ? "⌘" : "Ctrl+";
  const me = () => X.me();
  const notes = () => S.notes || [];
  const noteOf = (id) => notes().find((n) => n.id === id);
  const spaceOf = (n) => (n && n.spaceId) || null;
  let hubSpace = null;
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
          out += OKHREF.test(L.href)
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
    return String(md || "")
      .split("\n")
      .filter(
        (l) => !/^\s*(```|~~~|([-*_])( *\2){2,}\s*$|!\[|::embed\[)/.test(l),
      )
      .map((l) =>
        l.replace(
          /^\s*(#{1,6}\s+|[-*+]\s+(\[[ xX]\]\s+)?|\d+[.)]\s+|>\s?(\[![A-Za-z]+\][^\n]*$)?)/,
          "",
        ),
      )
      .join(" ")
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
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
        add({ t, x: parts.join("\n"), l: Math.min(6, st.length - 1), c });
        i = j;
        continue;
      }
      st = [];
      /* slika; širina posle resize-a: ![alt](src){width=60%} */
      if (
        (m = ln.match(
          /^!\[([^\]]*)\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)(?:\{width=(\d{1,3})%\})?\s*$/,
        ))
      ) {
        add({ t: "img", alt: unesc(m[1]), src: m[2], w: imgW(m[3]) });
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
        if (/^#g-/.test(lk.href)) {
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
      case "file":
        return [`[${escPlain(b.name || "Fajl")}](${b.src})`];
      case "embed":
        return [`::embed[${escPlain(b.name || "HTML")}](${b.src})`];
      case "page":
        return [`[${escPlain(b.name || "Stranica")}](#g-${b.ref})`];
      default: {
        const ps = x.split("\n");
        ps[0] = escLead(ps[0]);
        return ps.map((s, k) => (k < ps.length - 1 ? s + "\\" : s));
      }
    }
  }
  function toMd(bs) {
    const out = [];
    let prev = null,
      cnt = [],
      ind = [0];
    for (const b of bs) {
      if (b.t === "p" && !String(b.x || "").trim()) {
        out.push("");
        prev = null;
        continue;
      }
      let num = 0,
        pad = "";
      if (LISTY.has(b.t)) {
        const l = Math.min(b.l || 0, ind.length - 1);
        cnt.length = l + 1;
        if (b.t === "ol") num = cnt[l] = (cnt[l] || 0) + 1;
        else cnt[l] = 0;
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
          h += "<" + tag + ">";
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
      else if ((b.t === "file" || b.t === "embed") && OKSRC.test(b.src || ""))
        h += `<p><a class="file" href="${esc(b.src)}" data-name="${esc(b.name || "Fajl")}">${esc(b.name || "Fajl")}</a></p>`;
      else if (b.t === "page") h += "<p>" + esc(b.name || "Stranica") + "</p>";
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
    else if (t === "file")
      h += `<a class="nb-x nb-file"${b.src ? ` href="${esc(b.src)}" target="_blank" rel="noopener"` : ""} draggable="false"><span class="nb-fi">${I.file}</span><span class="nb-fn">${esc(b.name || "Fajl")}</span>${b.src ? `<span class="nb-fo">${I.open}</span>` : `<span class="nb-fo">Otpremam…</span>`}</a>`;
    else if (t === "embed")
      h += `<div class="nb-x nb-emb"><div class="nb-eb"><span class="nb-fi">${I.embed}</span><span class="nb-fn">${esc(b.name || "HTML")}</span>${b.src ? `<button type="button" class="nb-ex" tabindex="-1" aria-label="Preko celog ekrana" title="Preko celog ekrana">${I.expand}</button>` : `<span class="nb-fo">Otpremam…</span>`}</div>${b.src ? `<iframe class="nb-ef" sandbox="${EMB_SB}" title="${esc(b.name || "HTML")}"></iframe>` : ""}</div>`;
    else if (t === "page")
      h += `<a class="nb-x nb-page" href="#g-${esc(b.ref || "")}" draggable="false"></a>`;
    el.innerHTML = h;
    if (t === "todo") {
      el.dataset.c = b.c ? "1" : "0";
      el.classList.toggle("done", !!b.c);
    }
    if (t === "callout") {
      el.dataset.v = b.v || "NOTE";
      el.dataset.i = b.i || "";
    }
    if (t === "code") el.dataset.lang = b.lang || "";
    if (t === "img" || t === "file" || t === "embed") {
      el.dataset.src = b.src || "";
      el.dataset.alt = b.alt || "";
      el.dataset.name = b.name || "";
    }
    if (t === "img" && b.w) el.dataset.w = b.w;
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
    if (LISTY.has(t)) b.l = lvl(el);
    const tt = tOf(el);
    if (tt)
      b.x =
        t === "code"
          ? codeText(tt).replace(/\n$/, "")
          : inlineMd(tt).replace(/\n+$/, "");
    if (t === "todo") b.c = el.dataset.c === "1";
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
        cnt[l] = (cnt[l] || 0) + 1;
        const m = el.querySelector(":scope > .nb-m");
        if (m) m.textContent = cnt[l] + ".";
      } else cnt[l] = 0;
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
        else if (c.nodeName === "BR" || c.nodeName === "IMG") n += 1;
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
        } else if (c.nodeName === "BR" || c.nodeName === "IMG") {
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
    return el ? { i: bs.indexOf(el), off: caretOff(tOf(el)) } : null;
  }
  function setPos(p) {
    if (!p) return;
    const bs = blocks();
    if (p.sel) {
      selectBlocks(p.sel.map((i) => bs[i]).filter(Boolean));
      return;
    }
    const el = bs[Math.max(0, Math.min(p.i, bs.length - 1))];
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
  /* base -> ours i base -> theirs spojeni u jedno; oursWins: u sukobu samo naše */
  function merge3(base, ours, theirs, oursWins) {
    if (ours === theirs || theirs === base) return ours;
    if (ours === base) return theirs;
    const B = units(base),
      O = units(ours),
      T = units(theirs),
      mo = lcsMap(B.ks, O.ks),
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
          else {
            out.push(O.bs[po + i]);
            if (tk[i] !== k && tk[i] !== ok[i] && !oursWins)
              out.push(T.bs[pt + i]);
          }
        });
      else {
        /* pravi sukob: naše, pa njihovi novi blokovi (ništa se ne gubi) */
        out.push(...O.bs.slice(po, eo));
        if (!oursWins)
          tk.forEach(
            (k, i) =>
              ok.includes(k) || bk.includes(k) || out.push(T.bs[pt + i]),
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
    return toMd(out);
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
        if (map[i] < 0) return make(b);
        keep.add(els[map[i]]);
        return els[map[i]];
      });
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
    !!root.querySelector(".nb.up") ||
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
  function pathOf(n) {
    const out = [];
    let q = n.parentId && noteOf(n.parentId),
      g = 0;
    while (q && g++ < 20) {
      out.unshift(q.title || "Bez naslova");
      q = q.parentId && noteOf(q.parentId);
    }
    return out.join(" / ");
  }
  function tile(n, style, withPath) {
    const k = kidsOf(n.id).length;
    const u = who(n.updatedBy || n.createdBy);
    const ts = n.updatedAt || n.createdAt;
    const ex = plainOf(n.md).slice(0, 140);
    return `<div class="cptile gtile${S.fresh.has(n.id) ? " new" : ""}" role="button" tabindex="0" data-go="g-${esc(n.id)}" style="${style}">
      <span class="ci">${n.icon ? emo(n.icon) : I.doc}</span>${n.privateTo ? `<span class="glock" title="Samo ti vidiš ovu stranicu">${I.lock}</span>` : ""}
      <div class="gt-b">${withPath && n.parentId ? `<div class="gpath">${esc(pathOf(n))}</div>` : ""}<h3>${esc(n.title || "Bez naslova")}</h3>${ex ? `<p class="gex">${esc(ex)}</p>` : ""}
      <div class="meta2">${u ? `<img src="${esc(X.IMG[u.id])}" alt="">` : ""}<span>${ts ? esc(rel(ts)) : ""}${k ? ` · ${k} ${plural(k, "podstranica", "podstranice", "podstranica")}` : ""}</span></div></div>
    </div>`;
  }
  function hub(anim, space) {
    const box = $("#gpages");
    if (!box) return;
    if (space !== undefined && (space || null) !== hubSpace) {
      hubSpace = space || null;
      hq = "";
      $("#gq").value = "";
    }
    if (!S.ready) {
      box.innerHTML = "";
      return;
    }
    const f = fold(hq.trim());
    const mine = notes().filter((n) => spaceOf(n) === hubSpace);
    const list = f
      ? mine
          .filter(
            (n) => fold(n.title).includes(f) || fold(plainOf(n.md)).includes(f),
          )
          .sort(byUpd)
      : kidsOf(null).filter((n) => !n.privateTo);
    /* privatne stranice (privateTo) su u svojoj sekciji; tuđe baza ni ne šalje */
    const own = f ? [] : kidsOf(null).filter((n) => n.privateTo);
    const d = (i) =>
      anim
        ? `animation-delay:${(0.16 + i * 0.05).toFixed(2)}s`
        : "animation:none";
    const all = mine.filter((n) => !n.privateTo).length,
      sec = anim ? "" : "animation:none";
    box.innerHTML =
      `<div class="gsec" style="${sec}"><h2>Stranice</h2><span>${all ? all + " " + plural(all, "stranica", "stranice", "stranica") : hubSpace ? "Marketing plan, optimizacije, CRO fajlovi" : "Beleške, procesi, ideje"}</span></div>` +
      (f && !list.length
        ? `<div class="state">Nema stranica za „${esc(hq.trim())}“.</div>`
        : `<div class="cpgrid gpgrid">${list.map((n, i) => tile(n, d(i + 1), !!f)).join("")}${f ? "" : `<button class="cptile add" data-gnew style="${d(list.length + 1)}"><span class="ci">${I.plus}</span>Nova stranica</button>`}</div>`) +
      (f
        ? ""
        : `<div class="gsec gsec-me" style="${sec}"><h2>Samo za tebe</h2><span>${I.lock}Niko drugi ne vidi ove stranice</span></div>` +
          `<div class="cpgrid gpgrid">${own.map((n, i) => tile(n, d(list.length + i + 2))).join("")}<button class="cptile add" data-gnew="me" style="${d(list.length + own.length + 2)}"><span class="ci">${I.lock}</span>Privatna stranica</button></div>`);
  }
  /* priv: nova stranica u "Samo za tebe"; podstranica nasleđuje privatnost roditelja */
  async function newPage(parentId, priv) {
    const now = Date.now(),
      par = parentId && noteOf(parentId);
    const id = await api.add("notes", {
      title: "",
      icon: "",
      md: "",
      parentId: parentId || null,
      spaceId: parentId ? spaceOf(par) : hubSpace,
      privateTo: par ? par.privateTo || null : priv && me() ? me().id : null,
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
    backTo = par ? "g-" + par.id : home;
    $("#gpBackLbl").textContent = par ? par.title || "Bez naslova" : homeLbl;
    const chain = [];
    let q = par,
      g = 0;
    while (q && g++ < 20) {
      chain.unshift(q);
      q = q.parentId && noteOf(q.parentId);
    }
    const cr = $("#gpCrumbs");
    cr.hidden = !chain.length;
    cr.innerHTML = chain.length
      ? `<button type="button" data-go="${esc(home)}">${esc(homeLbl)}</button>` +
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
    paintKids();
  }
  function leave(h) {
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
    const par = p.parentId && noteOf(p.parentId);
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
      X.nav(par ? "g-" + par.id : homeOf(spaceOf(p)));
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
    return (t ? "# " + t + "\n\n" : "") + serialize();
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
      el.before(make({ t: nt, l: LISTY.has(tp) ? l : 0 }));
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
      else if (/^\d{1,3}[.)] $/.test(pre)) to = "ol";
      else if (/^(>|") $/.test(pre)) to = "quote";
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
      id: "page",
      label: "Stranica",
      ic: I.doc,
      hint: "",
      kw: "stranica page podstranica subpage",
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
  function openSlash(t) {
    const s = getSelection();
    if (!s.rangeCount) return;
    const r = s.getRangeAt(0);
    if (r.startContainer.nodeType !== 3 || r.startOffset < 1) return;
    const node = r.startContainer,
      off = r.startOffset - 1,
      pc = node.nodeValue[off - 1];
    if (off > 0 && pc && !/[\s​]/.test(pc)) return;
    SL = { t, node, off, idx: 0, items: [] };
    updateSlash();
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
    return v[0] === "/" ? v.slice(1) : null;
  }
  function updateSlash() {
    const q = slashQ();
    if (q === null || q.length > 30 || /\s\s/.test(q) || /^\s/.test(q)) {
      closeSlash();
      return;
    }
    const f = fold(q.trim());
    /* skripta ide klijentu u CRM, pa u njoj nema podstranica ni linkova na General */
    const items = BLOCKS.filter(
      (b) =>
        !(b.id === "page" && isScript()) &&
        (!f || fold(b.label).includes(f) || b.kw.includes(f)),
    ).map((b) => ({ k: "b", b }));
    if (f && !isScript())
      notes()
        .filter(
          (n) =>
            n.id !== cur &&
            spaceOf(n) === spaceOf(docOf(cur)) &&
            fold(n.title || "Bez naslova").includes(f),
        )
        .slice(0, 4)
        .forEach((n) => items.push({ k: "link", n }));
    const em = EMO ? (f ? searchEmoji(f, 16) : recentEmoji().slice(0, 8)) : [];
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
      return `<button type="button" class="ns-e${on}" data-si="${i}" role="option" aria-label="Emoji ${esc(it.ch)}">${emo(it.ch)}</button>`;
    };
    let h = "",
      i = 0;
    const bl = items.filter((x) => x.k === "b"),
      ln = items.filter((x) => x.k === "link"),
      es = items.filter((x) => x.k === "e");
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
    slashEl.innerHTML = h || '<div class="none">Nema rezultata</div>';
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
    const id = it.b.id;
    if (TEXTY.has(id)) {
      convert(el, id, { focus: true });
      changed();
      return;
    }
    if (id === "hr") placeBlock(el, empty, { t: "hr" });
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
    menuEls = [];
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
      .map((b) => (tOf(b) ? tOf(b).textContent : b.dataset.name || b.dataset.t))
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
    if (e.target.closest(".nb-g,.nb-ck,.nb-ci,.nb-cbar,.nb-x")) return;
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
    return e && e.closest(sel) && e.closest(".nb-t") ? e.closest(sel) : null;
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
    if (!t || !t.classList || !t.classList.contains("nb-t")) return;
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
    if (!el || !tOf(el) || el.dataset.t === "code") return;
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
    if (!el || !tOf(el) || el.dataset.t === "code") return;
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
    const t = blockOf(r.startContainer) && tOf(blockOf(r.startContainer));
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
      const kind = n.tagName === "OL" ? "ol" : "ul";
      for (const li of n.children) {
        if (li.tagName === "LI") walkLi(li, l, kind);
        else if (/^(UL|OL)$/.test(li.tagName)) walkList(li, l + 1);
      }
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
    /^\s*(#{1,6}\s|[-*+]\s|\d+[.)]\s|>\s?|```|~~~)|\*\*[^*\n]+\*\*|\[[^\]\n]+\]\([^)\n]+\)|(^|\s)`[^`\n]+`/m;
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
    const bs =
      !html || MDISH.test(plain) || /white-space:\s*pre/.test(html)
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
  async function upload(f, kind) {
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
      upload(f, kind).then(
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
              ? "Fajl je prevelik."
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
      if (e.data === "/" && !SL) openSlash(t);
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
    if (SL) {
      if (k === "ArrowDown" || k === "ArrowUp") {
        e.preventDefault();
        moveSlash(k === "ArrowDown" ? 1 : -1);
        return;
      }
      if (k === "Enter" || k === "Tab") {
        const it = SL.items[SL.idx];
        if (it) {
          e.preventDefault();
          runSlash(it);
          return;
        }
        closeSlash();
      }
      if (k === "Escape") {
        e.preventDefault();
        closeSlash();
        return;
      }
    }
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
    const a = e.target.closest && e.target.closest(".nb-t a[href]");
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
    if (root.contains(e.target)) return; // isti taster je već obradio editor
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
      const f = sel.find((x) => tOf(x));
      if (f) focusBlock(f);
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
        p && !p.parentId && (p.privateTo || (me() && p.createdBy === me().id));
    M.innerHTML = `<button type="button" data-pm="sub">${I.doc}Nova podstranica</button>${canPriv ? (p.privateTo ? `<button type="button" data-pm="share">${I.unlock}Podeli sa timom</button>` : `<button type="button" data-pm="priv">${I.lock}Samo za mene</button>`) : ""}<button type="button" data-pm="copy">${I.md}Kopiraj kao Markdown</button><button type="button" data-pm="dl">${I.dl}Preuzmi .md fajl</button><div class="nm-sep"></div><button type="button" data-pm="del" class="danger">${I.trash}Obriši stranicu</button>`;
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
    pmenu.remove();
    pmenu = null;
    const a = b.dataset.pm;
    if (a === "sub") {
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

  /* ---------------- hub controls ---------------- */
  $("#gNew").addEventListener("click", () => createAndOpen(null));
  $("#gq").addEventListener("input", (e) => {
    hq = e.target.value;
    hub(false);
  });
  $("#gpages").addEventListener("click", (e) => {
    const g = e.target.closest("[data-gnew]");
    if (g) createAndOpen(null, g.dataset.gnew === "me");
  });
  $("#gpages").addEventListener("keydown", (e) => {
    const t = e.key === "Enter" && e.target.closest("[data-go]");
    if (t) X.nav(t.dataset.go);
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
