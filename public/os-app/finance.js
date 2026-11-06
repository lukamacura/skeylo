/* Skeylo OS · Skeylo Finance: ko je kada i koliko dobio.
   Jedna knjiga, kolekcija "ledger" u os.docs (vidi je samo tim, kao i ostale kolekcije van CRM liste):
     { kind: "pay" | "in" | "exp" | "skip", who, amount, cur: "RSD" | "EUR", date: "YYYY-MM-DD",
       year, month, clientId, monthId, invoiceId, invoiceNo, fkKlijent, note,
       order, createdAt, createdBy, updatedAt, updatedBy }
     date = kada je novac stvarno legao/izašao; year + month = mesec kome stavka pripada (obično
     isti kao datum, ali uplata od 3.11. za oktobarsku fakturu može da se veže za oktobar)
     pay  = isplata članu tima (who)
     in   = uplata klijenta (clientId)
     exp  = trošak (who = član, ili null = firma)
     skip = plaćena faktura koju ne treba upisivati (sakriven predlog)
   Stari podaci se ne prepisuju i ne brišu: "finances" (podela meseca: paid + shares) i "expenses" se
   čitaju uživo kao redovi iste knjige, pa i starija verzija OS-a radi nad istim dokumentima.
   Fakture (fakture.js) su opciona veza: plaćena faktura se nudi kao uplata jednim klikom, a bez
   faktura knjiga radi isto.
   Unos je jedna rečenica („Nina 15.000 ILS juče montaža“); ispod polja se odmah vidi kako je
   pročitana, a svaki delić (vrsta, osoba, valuta, datum, klijent) se ispravlja klikom.
   Rute: #money (ceo tim), #money~{član} (samo taj član). */
window.SKFinance = function (X) {
  "use strict";
  const {
    S,
    api,
    esc,
    SV,
    toast,
    errMsg,
    nav,
    TEAM,
    IMG,
    ICON,
    MEMBERS,
    RATE,
    MONTHS,
  } = X;
  const { nf, nf2, parseAmount, logo, markFresh, shake } = X;
  const $ = (s, r = document) => r.querySelector(s);
  const adl = window.OS_DL || ((s) => s);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover:hover) and (pointer:fine)").matches;
  const me = () => X.me();
  const body = $("#moneyBody");

  const I = {
    pay: SV(
      '<path d="M12 3v18M17 7.5C17 5.6 14.8 4.5 12 4.5S7 5.7 7 7.7c0 4.6 10 2.4 10 7.1 0 2-2.2 3.2-5 3.2s-5-1.2-5-3.2"/>',
      2.1,
    ),
    in: SV('<path d="M12 4v12M6 10l6 6 6-6M4 20h16"/>', 2.2),
    exp: SV(
      '<path d="M5 4h14v17l-3-2-2 2-2-2-2 2-2-2-3 2z"/><path d="M9 9h6M9 13h4"/>',
      2,
    ),
    user: SV(
      '<circle cx="12" cy="8" r="4"/><path d="M5 21v-1a7 7 0 0 1 14 0v1"/>',
      2,
    ),
    biz: SV(
      '<path d="M4 21V7l8-4 8 4v14"/><path d="M9 21v-5h6v5M9 10h.01M15 10h.01"/>',
      2,
    ),
    cal: SV(
      '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>',
      2,
    ),
    coin: SV(
      '<circle cx="12" cy="12" r="9"/><path d="M14.8 9.4c-.5-.9-1.5-1.4-2.8-1.4-1.6 0-2.8.8-2.8 2 0 2.8 5.6 1.5 5.6 4.3 0 1.2-1.2 2-2.8 2-1.3 0-2.4-.5-2.8-1.5M12 6.5V8M12 16.3V18"/>',
      2,
    ),
    doc: SV(
      '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>',
      2,
    ),
    dn: SV('<path d="m6 9 6 6 6-6"/>', 2.4),
    plus: SV('<path d="M12 5v14M5 12h14"/>', 2.4),
    x: SV('<path d="M18 6 6 18M6 6l12 12"/>', 2.4),
    l: SV('<path d="m15 18-6-6 6-6"/>', 2.4),
    r: SV('<path d="m9 18 6-6-6-6"/>', 2.4),
    up: SV('<path d="M7 17 17 7M9 7h8v8"/>', 2.4),
    down: SV('<path d="M7 7l10 10M17 9v8H9"/>', 2.4),
    pen: SV(
      '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
      2,
    ),
    csv: SV('<path d="M12 3v12M7 10l5 5 5-5M4 20h16"/>', 2.2),
    check: SV('<path d="m5 12 5 5L20 7"/>', 2.6),
    split: SV('<path d="M4 6h16M4 12h10M4 18h6"/>', 2.2),
    back: SV(
      '<path d="M3 12a9 9 0 1 0 2.6-6.4L3 8"/><path d="M3 3v5h5"/>',
      2.2,
    ),
  };
  const KINDS = {
    pay: { n: "Isplata", d: "Član tima je dobio novac", ic: I.pay },
    in: { n: "Uplata", d: "Klijent je platio", ic: I.in },
    exp: { n: "Trošak", d: "Firma ili član je potrošio", ic: I.exp },
  };

  /* ---------------- datumi i novac ---------------- */
  const pad = (n) => String(n).padStart(2, "0");
  const iso = (d) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const today = () => iso(new Date());
  const isoOk = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s || "");
  const dOf = (s) =>
    new Date(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10), 12);
  const addD = (s, n) => {
    const d = dOf(s);
    d.setDate(d.getDate() + n);
    return iso(d);
  };
  const ymKey = (y, m) => y * 12 + (m - 1);
  const keyOf = (s) => ymKey(+s.slice(0, 4), +s.slice(5, 7));
  const thisKey = () => keyOf(today());
  const kY = (k) => Math.floor(k / 12),
    kM = (k) => (k % 12) + 1;
  const ymName = (k) => MONTHS[kM(k) - 1] + " " + kY(k);
  /* „za oktobar“ (godina samo kad nije tekuća) */
  const zaLbl = (k) =>
    "za " +
    MONTHS[kM(k) - 1].toLowerCase() +
    (kY(k) !== new Date().getFullYear() ? " " + kY(k) : "");
  const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
  /* mesec napisan bez godine („za decembar“) → najbliži datumu: do 10 meseci unazad ili 1 unapred */
  const nearKey = (m, dk) => {
    for (let y = kY(dk) - 1; y <= kY(dk) + 1; y++) {
      const k = ymKey(y, m);
      if (k >= dk - 10 && k <= dk + 1) return k;
    }
    return dk;
  };
  const fDay = new Intl.DateTimeFormat("sr-Latn-RS", {
    day: "numeric",
    month: "short",
  });
  const fWk = new Intl.DateTimeFormat("sr-Latn-RS", { weekday: "long" });
  function dayLbl(s) {
    const t = today();
    if (s === t) return "Danas";
    if (s === addD(t, -1)) return "Juče";
    if (s === addD(t, 1)) return "Sutra";
    return fDay.format(dOf(s));
  }
  const toRSD = (a, cur) => (cur === "EUR" ? a * RATE : a);
  const fmt = (a, cur) =>
    cur === "EUR" ? "€" + nf2.format(a) : nf.format(Math.round(a)) + " RSD";
  const fmtR = (v) => nf.format(Math.round(v));
  const fmtK = (v) =>
    Math.abs(v) >= 1e6
      ? nf2.format(Math.round(v / 1e5) / 10) + "M"
      : Math.abs(v) >= 1000
        ? nf.format(Math.round(v / 1000)) + "k"
        : fmtR(v);
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
  const newId = () => {
    const a = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
      r = crypto.getRandomValues(new Uint8Array(20));
    return Array.from(r, (n) => a[n % a.length]).join("");
  };
  const userOf = (id) => TEAM.find((u) => u.id === id) || null;
  const colOf = (id) =>
    (MEMBERS.find((m) => m.id === id) || {}).m || "var(--orange)";
  const clientOf = (id) => (id && S.clients.find((c) => c.id === id)) || null;
  const extClients = () => S.clients.filter((c) => c.kind !== "internal");
  const itemOf = (id) => (id && S.items.find((i) => i.id === id)) || null;
  /* mesec klijenta kome stavka pripada (k): tako se uplata sama pojavi i na stranici Finances tog meseca */
  const monthFor = (cid, k) =>
    (cid &&
      k != null &&
      (
        S.items.find(
          (i) =>
            i.clientId === cid &&
            i.type === "month" &&
            i.year === kY(k) &&
            i.month === kM(k),
        ) || {}
      ).id) ||
    null;
  /* mesec kome stavka knjige pripada: year + month, a bez njih mesec datuma */
  const keyOfDoc = (d) =>
    +d.year && +d.month ? ymKey(+d.year, +d.month) : keyOf(d.date);

  /* ---------------- knjiga: novi i stari podaci kao isti redovi ---------------- */
  let memo = null;
  function rows() {
    const L = S.ledger || [],
      F = S.finances || [],
      E = S.expenses || [];
    if (memo && memo.L === L && memo.F === F && memo.E === E) return memo.out;
    const out = [];
    for (const d of L) {
      if (!d || d.kind === "skip" || !(+d.amount > 0) || !isoOk(d.date))
        continue;
      const cur = d.cur === "EUR" ? "EUR" : "RSD",
        amount = +d.amount,
        key = keyOfDoc(d);
      out.push({
        id: d.id,
        src: "lg",
        kind: KINDS[d.kind] ? d.kind : "pay",
        who: d.who || null,
        amount,
        cur,
        rsd: toRSD(amount, cur),
        date: d.date,
        key,
        shift: key !== keyOf(d.date),
        clientId: d.clientId || null,
        monthId: d.monthId || null,
        invoiceId: d.invoiceId || null,
        invoiceNo: d.invoiceNo || "",
        note: d.note || "",
        by: d.createdBy || null,
        at: d.createdAt || 0,
      });
    }
    for (const f of F) {
      if (!f || !f.year || !f.month) continue;
      const base = {
        src: "fin",
        ref: f.id,
        date: null,
        key: ymKey(f.year, f.month),
        clientId: f.clientId || null,
        monthId: f.monthId || f.id,
        invoiceId: null,
        invoiceNo: "",
        note: "",
        by: f.updatedBy || null,
        at: f.updatedAt || 0,
      };
      const one = (v) => {
        const cur = v.cur === "EUR" ? "EUR" : "RSD";
        return { amount: +v.amount, cur, rsd: toRSD(+v.amount, cur) };
      };
      if (f.paid && +f.paid.amount > 0)
        out.push({
          ...base,
          ...one(f.paid),
          id: "fin:" + f.id + ":in",
          kind: "in",
          who: null,
        });
      for (const m of MEMBERS) {
        const v = f.shares && f.shares[m.id];
        if (v && +v.amount > 0)
          out.push({
            ...base,
            ...one(v),
            id: "fin:" + f.id + ":" + m.id,
            kind: "pay",
            who: m.id,
          });
      }
    }
    for (const x of E) {
      if (!x || !(+x.amount > 0)) continue;
      const date = isoOk(x.date)
        ? x.date
        : x.createdAt
          ? iso(new Date(x.createdAt))
          : null;
      if (!date) continue;
      const cur = x.cur === "EUR" ? "EUR" : "RSD",
        key = x.year && x.month ? ymKey(x.year, x.month) : keyOf(date);
      out.push({
        id: "exp:" + x.id,
        src: "exp",
        ref: x.id,
        kind: "exp",
        who: x.member || null,
        amount: +x.amount,
        cur,
        rsd: toRSD(+x.amount, cur),
        date,
        key,
        shift: key !== keyOf(date),
        clientId: null,
        monthId: null,
        invoiceId: null,
        invoiceNo: "",
        note: x.note || "",
        by: x.member || null,
        at: x.createdAt || 0,
      });
    }
    memo = { L, F, E, out };
    return out;
  }
  function sums(list) {
    const s = { in: 0, pay: 0, exp: 0, expCo: 0, by: {} };
    MEMBERS.forEach((m) => (s.by[m.id] = { pay: 0, exp: 0, n: 0 }));
    for (const r of list) {
      s[r.kind] += r.rsd;
      if (r.kind === "exp" && !r.who) s.expCo += r.rsd;
      const b = r.who && s.by[r.who];
      if (b && r.kind !== "in") {
        b[r.kind] += r.rsd;
        b.n++;
      }
    }
    s.sk = s.in - s.pay - s.expCo;
    return s;
  }
  const inMonth = (k) => rows().filter((r) => r.key === k);
  /* zarada člana u mesecu (dashboard: „Zarada ovog meseca“) */
  function net(uid, k) {
    const b = sums(inMonth(k)).by[uid] || { pay: 0, exp: 0 };
    return { earned: b.pay, spent: b.exp, net: b.pay - b.exp };
  }
  /* zarada člana za poslednjih 30 dana, danas uključen (dashboard): ide po datumu kada je novac
     legao, ne po mesecu kome stavka pripada, pa se oktobarska isplata od 6.11. vidi odmah.
     Stara podela meseca (finances) nema datum: računa se poslednjim danom svog meseca, a tekući
     mesec današnjim danom. */
  function netRecent(uid, days = 30) {
    const to = today(),
      from = addD(to, 1 - days);
    let pay = 0,
      exp = 0;
    for (const r of rows()) {
      if (r.who !== uid || (r.kind !== "pay" && r.kind !== "exp")) continue;
      let d = r.date;
      if (!d) {
        d = iso(new Date(kY(r.key), kM(r.key), 0, 12));
        if (d > to) d = to;
      }
      if (d < from || d > to) continue;
      if (r.kind === "pay") pay += r.rsd;
      else exp += r.rsd;
    }
    return { earned: pay, spent: exp, net: pay - exp };
  }
  /* stavke knjige vezane za mesec/projekat (stranica Finances meseca) */
  const monthRows = (monthId) =>
    rows().filter((r) => r.src === "lg" && r.monthId === monthId);

  /* ---------------- rečenica → stavka ---------------- */
  const SUF = "(a|e|i|u|o|om|ov|ova|ove|ovu|in|ina|ine|inu|oj)?";
  const WHO = TEAM.map((u) => {
    const n = fold(u.name),
      st = /[aeiou]$/.test(n) ? n.slice(0, -1) : n;
    return [u.id, new RegExp("^@?" + st + SUF + "$")];
  });
  const W = (s) => new Set(s.split(" "));
  const ME_W = W("ja meni mene sebi"),
    CO_W = W("firma firmi firmu firme skeylo skeylu agencija agenciji"),
    EXP_W = W(
      "trosak troskovi troska troskove trosku kupio kupila kupili potrosio potrosila potrosili racun racuna",
    ),
    PAID_W = W("platio platila platili"),
    IN_W = W(
      "uplata uplatu uplate uplatio uplatila uplatili prihod naplata naplatili naplaceno legla leglo stiglo stigla",
    ),
    PAY_W = W(
      "isplata isplatu isplate isplaceno isplacen isplacena plata platu dobio dobila dobili honorar zaradio zaradila primio primila",
    ),
    CUR_W = {
      eur: "EUR",
      evra: "EUR",
      evro: "EUR",
      evri: "EUR",
      "€": "EUR",
      e: "EUR",
      rsd: "RSD",
      din: "RSD",
      dinara: "RSD",
      dinar: "RSD",
      d: "RSD",
    },
    K_W = W("k hiljada hiljade hiljadu hilj"),
    FILL = W("je su sam smo si"),
    EDGE = W("za u na od i - · , je");
  const MONW = [
    /^januar(a|u)?$/,
    /^februar(a|u)?$/,
    /^mart(a|u)?$/,
    /^april(a|u)?$/,
    /^maj(a|u)?$/,
    /^jun(a|u)?$/,
    /^jul(a|u)?$/,
    /^avgust(a|u)?$/,
    /^septemb(ar|ra|ru)$/,
    /^oktob(ar|ra|ru)$/,
    /^novemb(ar|ra|ru)$/,
    /^decemb(ar|ra|ru)$/,
  ];
  const MONA = [
    "jan",
    "feb",
    "mar",
    "apr",
    "maj",
    "jun",
    "jul",
    "avg",
    "sep",
    "okt",
    "nov",
    "dec",
  ];
  const WEEK = [
    /^nedelj(a|u|e)$/,
    /^ponedelj(ak|ka)$/,
    /^utor(ak|ka)$/,
    /^sred(a|u|e)$/,
    /^cetvrt(ak|ka)$/,
    /^pet(ak|ka)$/,
    /^subot(a|u|e)$/,
  ];
  const realDate = (y, m, d) => {
    const x = new Date(y, m - 1, d, 12);
    return x.getFullYear() === y && x.getMonth() === m - 1 && x.getDate() === d
      ? iso(x)
      : null;
  };
  /* godina koja nije napisana: tekuća, osim ako bi datum bio dva meseca u budućnosti */
  function guessYear(m, d) {
    const t = dOf(today()),
      y = t.getFullYear(),
      x = realDate(y, m, d);
    return x && dOf(x) - t > 60 * 864e5 ? y - 1 : y;
  }
  function clientTok(t) {
    if (t.length < 3) return null;
    for (const c of extClients()) {
      const words = fold(c.name)
          .split(/[^a-z0-9]+/)
          .filter(Boolean),
        ini = words.length > 1 ? words.map((w) => w[0]).join("") : "";
      if (
        t === fold(c.id) ||
        t === ini ||
        words.some(
          (w) => w === t || (t.length >= 4 && w.length >= 4 && w.startsWith(t)),
        )
      )
        return c;
    }
    return null;
  }
  function invTok(t) {
    const m = /^(\d{1,3})\/(\d{4})$/.exec(t);
    if (!m || !inv.list) return null;
    const broj = pad(+m[1]) + "/" + m[2];
    return inv.list.find((f) => f.broj === broj && !f.storno) || null;
  }
  function parse(q) {
    const toks = String(q || "")
        .trim()
        .split(/\s+/)
        .filter(Boolean),
      used = new Array(toks.length).fill(false);
    const p = {
      who: null,
      co: false,
      client: null,
      amount: 0,
      cur: null,
      date: null,
      inv: null,
      kind: null,
      mm: null,
      rel: 0,
      note: "",
    };
    let wExp = false,
      wIn = false,
      wPay = false,
      wPaid = false;
    /* brojevi su kandidati za iznos; iznos je najveći („Luka 3 videa 20.000“), ostali idu u napomenu */
    const cand = [],
      candAt = (i) => cand.find((c) => c.i === i);
    const F = toks.map((t) => fold(t).replace(/^[„"“'(]+|[”"'),;:!?]+$/g, ""));
    for (let i = 0; i < toks.length; i++) {
      const t = F[i];
      if (!t) continue;
      /* broj fakture: 01/2026 */
      if (!p.inv) {
        const f = invTok(t);
        if (f) {
          p.inv = f;
          used[i] = true;
          continue;
        }
      }
      /* datum: 4.11, 4.11.2026, 04/11 */
      if (!p.date) {
        const m = /^(\d{1,2})[./](\d{1,2})(?:[./](\d{4}|\d{2}))?\.?$/.exec(t);
        if (m && +m[2] >= 1 && +m[2] <= 12) {
          const y = m[3]
              ? m[3].length === 2
                ? 2000 + +m[3]
                : +m[3]
              : guessYear(+m[2], +m[1]),
            d = realDate(y, +m[2], +m[1]);
          if (d) {
            p.date = d;
            used[i] = true;
            continue;
          }
        }
        /* 4. nov / 4 novembra */
        const dm = /^(\d{1,2})\.?$/.exec(t),
          nx = F[i + 1] || "";
        const mi = dm ? MONW.findIndex((r) => r.test(nx)) : -1,
          ma = dm && mi < 0 ? MONA.indexOf(nx.replace(/\.$/, "")) : -1,
          mm = mi >= 0 ? mi + 1 : ma >= 0 ? ma + 1 : 0;
        if (mm) {
          const d = realDate(guessYear(mm, +dm[1]), mm, +dm[1]);
          if (d) {
            p.date = d;
            used[i] = used[i + 1] = true;
            i++;
            continue;
          }
        }
        if (t === "danas") {
          p.date = today();
          used[i] = true;
          continue;
        }
        if (t === "juce" || t === "jucer" || t === "sinoc") {
          p.date = addD(today(), -1);
          used[i] = true;
          continue;
        }
        if (t === "prekjuce" || t === "prekjucer") {
          p.date = addD(today(), -2);
          used[i] = true;
          continue;
        }
        const wd = WEEK.findIndex((r) => r.test(t));
        if (wd >= 0) {
          const now = dOf(today()).getDay();
          p.date = addD(today(), -((now - wd + 7) % 7));
          used[i] = true;
          if (i && F[i - 1] === "u") used[i - 1] = true;
          continue;
        }
      }
      /* mesec: „za oktobar“ / „oktobar“ = mesec kome stavka pripada (datum ostaje danas);
         „u oktobru“ = kada se desilo: tekući mesec = danas, inače poslednji dan tog meseca */
      const mo = MONW.findIndex((r) => r.test(t));
      if (mo >= 0) {
        const inM = i > 0 && F[i - 1] === "u";
        if (inM && !p.date) {
          const y = guessYear(mo + 1, 1),
            k = ymKey(y, mo + 1);
          p.date = k === thisKey() ? today() : iso(new Date(y, mo + 1, 0, 12));
        } else if (!inM && p.mm == null && !p.rel) p.mm = mo + 1;
        else continue;
        used[i] = true;
        if (i && /^(za|u)$/.test(F[i - 1])) used[i - 1] = true;
        continue;
      }
      /* „za prošli mesec“, „pretprošli mesec“ */
      const pm = /^(pret)?prosl(i|og|om|e)$/.exec(t);
      if (
        pm &&
        p.mm == null &&
        !p.rel &&
        /^mesec(a|u)?$/.test(F[i + 1] || "")
      ) {
        p.rel = pm[1] ? -2 : -1;
        used[i] = used[i + 1] = true;
        if (i && F[i - 1] === "za") used[i - 1] = true;
        i++;
        continue;
      }
      /* iznos: 15000, 15.000, 1,5k, 200€, €200 (+ „k“ ili valuta kao sledeća reč) */
      const am =
        /^([€$]?)(\d[\d.,]*)(k|hilj(?:ada|ade|adu)?|m|mil)?(€|e|eur|evra|evro|rsd|din|dinara|d)?$/.exec(
          t,
        );
      if (am) {
        let v = parseAmount(am[2].replace(/[.,]$/, ""));
        if (v) {
          if (am[3]) v *= /^m/.test(am[3]) ? 1e6 : 1e3;
          cand.push({
            i,
            v,
            cur:
              am[1] === "€" || (am[4] && CUR_W[am[4]] === "EUR")
                ? "EUR"
                : am[4]
                  ? "RSD"
                  : null,
            ex: [],
          });
          continue;
        }
      }
      const pc = candAt(i - 1);
      if (pc && K_W.has(t) && pc.v < 1000 && !pc.ex.length) {
        pc.v *= 1000;
        pc.ex.push(i);
        continue;
      }
      if (CUR_W[t] && (pc || candAt(i - 2)) && t.length <= 6) {
        const c = pc || candAt(i - 2);
        if (!c.cur) {
          c.cur = CUR_W[t];
          c.ex.push(i);
          continue;
        }
      }
      if (CUR_W[t] && t.length > 1) {
        if (!p.cur) p.cur = CUR_W[t];
        used[i] = true;
        continue;
      }
      if (!p.who && !p.co) {
        const w = WHO.find(([, rx]) => rx.test(t));
        if (w || ME_W.has(t)) {
          p.who = w ? w[0] : me() ? me().id : null;
          used[i] = true;
          continue;
        }
        if (CO_W.has(t)) {
          p.co = true;
          used[i] = true;
          continue;
        }
      }
      if (EXP_W.has(t)) {
        wExp = used[i] = true;
        continue;
      }
      if (PAID_W.has(t)) {
        wPaid = used[i] = true;
        continue;
      }
      if (IN_W.has(t)) {
        wIn = used[i] = true;
        continue;
      }
      if (PAY_W.has(t)) {
        wPay = used[i] = true;
        continue;
      }
      if (!p.client) {
        const c = clientTok(t);
        if (c) {
          p.client = c.id;
          used[i] = true;
          continue;
        }
      }
      if (FILL.has(t)) used[i] = true;
    }
    if (cand.length) {
      const b = cand.reduce((a, c) => (c.v > a.v ? c : a));
      p.amount = Math.round(b.v * 100) / 100;
      if (b.cur) p.cur = b.cur;
      used[b.i] = true;
      b.ex.forEach((j) => (used[j] = true));
    }
    p.kind = wExp
      ? "exp"
      : wPaid && p.who
        ? "exp"
        : (wIn || wPaid) && !p.who
          ? "in"
          : wPay || p.who
            ? "pay"
            : p.co
              ? "exp"
              : p.client || p.inv
                ? "in"
                : null;
    if (p.inv) {
      if (!p.amount) {
        p.amount = p.inv.iznos / 100;
        p.cur = "RSD";
      }
      if (!p.client) p.client = guessClient(p.inv);
      if (!p.date && p.inv.placena) p.date = p.inv.placena;
    }
    const rest = toks.filter((t, i) => !used[i]);
    while (rest.length && EDGE.has(fold(rest[0]))) rest.shift();
    while (rest.length && EDGE.has(fold(rest[rest.length - 1]))) rest.pop();
    p.note = rest
      .join(" ")
      .replace(/^[,;:·\-–—]+\s*|\s*[,;:·\-–—]+$/g, "")
      .slice(0, 120);
    return p;
  }

  /* ---------------- stanje ekrana ---------------- */
  const V = { key: null, who: null, kind: "all", next: null, flash: null };
  const C = { q: "", ov: {}, pre: null, busy: false };
  let built = false,
    first = true;

  function eff() {
    const p = parse(C.q),
      o = C.ov;
    const kind =
      o.kind || p.kind || (C.pre && C.pre.clientId && !p.who ? "pay" : "pay");
    let who = "who" in o ? o.who : p.who;
    if (kind === "in") who = null;
    if (kind === "exp" && p.co && !("who" in o)) who = null;
    const clientId =
      "clientId" in o
        ? o.clientId
        : p.client || (C.pre && C.pre.clientId) || null;
    const date = o.date || p.date || today(),
      dk = keyOf(date);
    /* mesec kome stavka pripada: izbor na čipu, pa rečenica („za oktobar“), pa mesec klijenta
       sa čije stranice je unos otvoren, pa mesec datuma */
    const pre = C.pre && clientId === C.pre.clientId ? C.pre : null;
    const mk =
      "mk" in o
        ? o.mk == null
          ? dk
          : o.mk
        : p.mm
          ? nearKey(p.mm, dk)
          : p.rel
            ? dk + p.rel
            : pre && pre.key != null
              ? pre.key
              : dk;
    return {
      kind,
      who: who || null,
      cur: o.cur || p.cur || "RSD",
      date,
      mk,
      clientId,
      amount: p.amount || 0,
      note: p.note,
      inv: p.inv,
      monthId:
        pre && pre.monthId && (pre.key == null || pre.key === mk)
          ? pre.monthId
          : monthFor(clientId, mk),
    };
  }
  /* stavka iz unosa ili sa fakture → dokument knjige */
  function docOf(e, extra) {
    const now = Date.now(),
      u = me(),
      k = e.mk != null ? e.mk : keyOf(e.date);
    return {
      kind: e.kind,
      who: e.kind === "in" ? null : e.who || null,
      amount: Math.round(e.amount * 100) / 100,
      cur: e.cur === "EUR" ? "EUR" : "RSD",
      date: e.date,
      year: kY(k),
      month: kM(k),
      clientId: e.clientId || null,
      monthId: e.monthId || null,
      invoiceId: e.inv ? e.inv.id : null,
      invoiceNo: e.inv ? e.inv.broj : null,
      fkKlijent: e.inv ? e.inv.klijentId || null : null,
      note: e.note || "",
      order: now,
      createdAt: now,
      createdBy: u ? u.id : null,
      updatedAt: now,
      updatedBy: u ? u.id : null,
      ...(extra || {}),
    };
  }
  function label(d) {
    const u = userOf(d.who),
      c = clientOf(d.clientId);
    const who =
      d.kind === "in" ? (c ? c.name : "Uplata") : u ? u.name : "Firma";
    const k = isoOk(d.date) ? keyOfDoc(d) : null;
    return `${who} · ${d.kind === "exp" ? "−" : d.kind === "in" ? "+" : ""}${fmt(d.amount, d.cur)}${k != null && k !== keyOf(d.date) ? " · " + zaLbl(k) : ""}`;
  }

  /* ---------------- fakture (opciono) ---------------- */
  const inv = { list: null, at: 0, p: null };
  function loadInv(force) {
    const FK = X.FK && X.FK();
    if (!FK || !FK.list || inv.p) return;
    if (!force && inv.list && Date.now() - inv.at < 30000) return;
    inv.p = FK.list()
      .then((l) => {
        inv.list = Array.isArray(l) ? l : [];
        inv.at = Date.now();
        render();
      })
      .catch(() => {})
      .finally(() => (inv.p = null));
  }
  /* klijent u OS-u za kupca sa fakture: kako je ranije upisan, pa po imenu („INFINITY“ → Infinity Laser Studio) */
  function guessClient(f) {
    const prev = (S.ledger || []).find(
      (d) => d.fkKlijent && d.fkKlijent === f.klijentId && d.clientId,
    );
    if (prev) return prev.clientId;
    const kw = fold(f.kupac)
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length >= 4);
    const c = extClients().find((c) =>
      fold(c.name)
        .split(/[^a-z0-9]+/)
        .some((w) => w.length >= 4 && kw.includes(w)),
    );
    return c ? c.id : null;
  }
  const entryOfInv = (id) =>
    (S.ledger || []).find((d) => d.invoiceId === id) || null;
  function invSuggest(k) {
    if (!inv.list) return [];
    const done = new Set(
      (S.ledger || []).filter((d) => d.invoiceId).map((d) => d.invoiceId),
    );
    return inv.list.filter(
      (f) =>
        f.status === "placena" &&
        !f.storno &&
        isoOk(f.placena) &&
        keyOf(f.placena) === k &&
        !done.has(f.id),
    );
  }
  async function recordInv(f, quiet) {
    const date = isoOk(f.placena) ? f.placena : today(),
      clientId = guessClient(f),
      id = newId();
    const data = docOf({
      kind: "in",
      who: null,
      amount: f.iznos / 100,
      cur: "RSD",
      date,
      clientId,
      monthId: monthFor(clientId, keyOf(date)),
      inv: f,
      note: "",
    });
    markFresh(id);
    await api.set("ledger", id, data);
    if (!quiet)
      toast(`Uplata po fakturi ${f.broj} je upisana`, () =>
        api.del("ledger", id).catch((e) => toast(errMsg(e))),
      );
    return id;
  }
  async function skipInv(f) {
    const id = newId(),
      u = me();
    try {
      await api.set("ledger", id, {
        kind: "skip",
        invoiceId: f.id,
        invoiceNo: f.broj,
        order: Date.now(),
        createdAt: Date.now(),
        createdBy: u ? u.id : null,
      });
      toast(`Faktura ${f.broj} se više ne nudi`, () =>
        api.del("ledger", id).catch((e) => toast(errMsg(e))),
      );
    } catch (e) {
      toast(errMsg(e));
    }
  }

  /* ---------------- ekran ---------------- */
  function build() {
    built = true;
    body.innerHTML = `
    <div class="mhead sf-head"><h1><span class="w"><span>Skeylo</span></span> <span class="w"><span class="grad">Finance</span></span></h1>
      <div class="mswitch"><button type="button" data-sfm="-1" aria-label="Prethodni mesec">${I.l}</button><span id="sfMon"></span><button type="button" data-sfm="1" aria-label="Sledeći mesec">${I.r}</button></div></div>
    <section class="sf-comp" id="sfComp">
      <form class="sf-in" id="sfForm" autocomplete="off" novalidate>
        <input id="sfQ" type="text" autocomplete="off" spellcheck="false" enterkeyhint="done" maxlength="200" aria-label="Nova stavka: ko, koliko, kada" placeholder="${matchMedia("(max-width: 600px)").matches ? "Npr. Nina 15.000 ILS juče" : "Ko je dobio, koliko i kada… npr. Nina 15.000 ILS juče"}">
        <button class="pill solid" type="submit" id="sfGo">${I.check}<span>Upiši</span></button>
      </form>
      <div class="sf-chips" id="sfChips" aria-live="polite"></div>
      <p class="sf-hint" id="sfHint"></p>
    </section>
    <section class="mhero sf-hero" id="sfHero"></section>
    <div class="sf-ppl" id="sfPpl"></div>
    <div id="sfFk"></div>
    <section class="mcard sf-list">
      <div class="mcard-h"><h2 id="sfListH">Stavke</h2><div class="sf-lt"><div class="sf-tabs" id="sfTabs" role="tablist"></div><button type="button" class="pill sf-csv" id="sfCsv" title="Preuzmi stavke meseca kao CSV">${I.csv}<span>CSV</span></button></div></div>
      <div id="sfRows"></div>
    </section>`;
    const q = $("#sfQ");
    q.addEventListener("input", () => {
      C.q = q.value;
      hint("");
      chips();
    });
    q.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && (C.q || Object.keys(C.ov).length)) {
        e.preventDefault();
        e.stopPropagation();
        reset();
      }
    });
    $("#sfForm").addEventListener("submit", (e) => {
      e.preventDefault();
      save();
    });
    $("#sfChips").addEventListener("click", onChip);
    $("#sfChips").addEventListener("change", (e) => {
      const d = e.target.closest("[data-date]");
      if (d && isoOk(d.value)) {
        C.ov.date = d.value;
        chips();
        focusQ();
      }
    });
    body.addEventListener("click", onBody);
    $("#sfCsv").addEventListener("click", csv);
  }
  const focusQ = () =>
    fine && $("#sfQ") && $("#sfQ").focus({ preventScroll: true });
  function reset() {
    C.q = "";
    C.ov = {};
    C.pre = null;
    const q = $("#sfQ");
    if (q) q.value = "";
    hint("");
    chips();
  }
  function hint(t, bad) {
    const h = $("#sfHint");
    if (!h) return;
    h.classList.toggle("bad", !!bad);
    h.innerHTML = t || "";
  }
  function clientChip(c, pop) {
    return `<button type="button" class="sfc cl" data-pop="${pop}" style="--m:${esc(c.color || "var(--orange)")}">${logo(c, "lg-ic")}<span>${esc(c.name)}</span></button>`;
  }
  function chips() {
    const box = $("#sfChips");
    if (!box) return;
    const e = eff(),
      K = KINDS[e.kind],
      u = userOf(e.who),
      c = clientOf(e.clientId),
      out = [];
    out.push(
      `<button type="button" class="sfc k k-${e.kind}" data-pop="kind" aria-label="Vrsta: ${K.n}">${K.ic}<span>${K.n}</span>${I.dn}</button>`,
    );
    if (e.kind === "in")
      out.push(
        c
          ? clientChip(c, "client")
          : `<button type="button" class="sfc ph" data-pop="client">${I.biz}<span>Koji klijent?</span></button>`,
      );
    else
      out.push(
        u
          ? `<button type="button" class="sfc who" data-pop="who" style="--m:${colOf(u.id)}"><img src="${esc(IMG[u.id])}" alt=""><span>${esc(u.name)}</span></button>`
          : e.kind === "exp"
            ? `<button type="button" class="sfc who" data-pop="who"><img class="sk" src="${esc(ICON)}" alt=""><span>Firma</span></button>`
            : `<button type="button" class="sfc ph" data-pop="who">${I.user}<span>Ko?</span></button>`,
      );
    out.push(
      e.amount
        ? `<span class="sfc sfa"><b>${nf2.format(e.amount)}</b><span class="sfcur${e.cur === "EUR" ? " eur" : ""}" role="radiogroup" aria-label="Valuta"><i aria-hidden="true"></i><button type="button" role="radio" aria-checked="${e.cur === "RSD"}" data-cur="RSD" class="${e.cur === "RSD" ? "on" : ""}">RSD</button><button type="button" role="radio" aria-checked="${e.cur === "EUR"}" data-cur="EUR" class="${e.cur === "EUR" ? "on" : ""}">EUR</button></span></span>`
        : "", // iznos se pojavi tek kad se upiše
    );
    out.push(
      `<label class="sfc date">${I.cal}<span>${esc(dayLbl(e.date))}</span><input type="date" data-date value="${esc(e.date)}" aria-label="Datum"></label>`,
    );
    /* mesec kome pripada: jedan dodir veže stavku za prošli mesec (novac stiže mesec posle fakture) */
    const dk = keyOf(e.date);
    out.push(
      e.mk !== dk
        ? `<button type="button" class="sfc mon" data-pop="mon" aria-label="Pripada mesecu: ${esc(ymName(e.mk))}">${I.back}<span>${esc(cap(zaLbl(e.mk)))}</span>${I.dn}</button>`
        : `<button type="button" class="sfc add" data-mk="${dk - 1}" title="Novac je stigao sada, a pripada prošlom mesecu">${I.back}<span>${esc(cap(zaLbl(dk - 1)))}</span></button>`,
    );
    if (e.kind !== "in")
      out.push(
        c
          ? clientChip(c, "client")
          : `<button type="button" class="sfc add" data-pop="client">${I.plus}<span>Klijent</span></button>`,
      );
    if (e.inv)
      out.push(
        `<span class="sfc inv">${I.doc}<span>Faktura ${esc(e.inv.broj)}</span></span>`,
      );
    if (e.note) out.push(`<span class="sfc note">„${esc(e.note)}“</span>`);
    box.innerHTML = out.join("");
    $("#sfGo").disabled = C.busy;
    box.classList.toggle("ready", !!(e.amount && (e.kind !== "pay" || e.who)));
  }

  /* ---------------- iskačući izbor (vrsta, osoba, klijent) ---------------- */
  let pop = null;
  function closePop() {
    if (!pop) return;
    pop.remove();
    pop = null;
  }
  function openPop(btn, what) {
    const same = pop && pop.dataset.what === what;
    closePop();
    if (same) return;
    const e = eff();
    let h = "";
    if (what === "kind")
      h = Object.entries(KINDS)
        .map(
          ([k, v]) =>
            `<button type="button" data-set-kind="${k}" class="${k === e.kind ? "on" : ""}"><span class="pi k-${k}">${v.ic}</span><span><b>${v.n}</b><small>${v.d}</small></span></button>`,
        )
        .join("");
    else if (what === "who")
      h =
        TEAM.map(
          (u) =>
            `<button type="button" data-set-who="${u.id}" class="${u.id === e.who ? "on" : ""}" style="--m:${colOf(u.id)}"><img src="${esc(IMG[u.id])}" alt=""><span><b>${esc(u.name)}</b></span></button>`,
        ).join("") +
        (e.kind === "exp"
          ? `<button type="button" data-set-who="" class="${!e.who ? "on" : ""}"><img class="sk" src="${esc(ICON)}" alt=""><span><b>Firma</b><small>Trošak Skeyla</small></span></button>`
          : "");
    else if (what === "mon") {
      const dk = keyOf(e.date),
        ks = [dk, dk - 1, dk - 2, dk - 3],
        sub = [
          "mesec datuma",
          "prošli mesec",
          "pre dva meseca",
          "pre tri meseca",
        ];
      if (!ks.includes(e.mk)) ks.push(e.mk);
      h = ks
        .map(
          (k, i) =>
            `<button type="button" data-set-mk="${k === dk ? "" : k}" class="${k === e.mk ? "on" : ""}"><span class="pi">${k === dk ? I.cal : I.back}</span><span><b>${esc(ymName(k))}</b>${sub[i] ? `<small>${sub[i]}</small>` : ""}</span></button>`,
        )
        .join("");
    } else
      h =
        extClients()
          .map(
            (c) =>
              `<button type="button" data-set-client="${esc(c.id)}" class="${c.id === e.clientId ? "on" : ""}">${logo(c, "lg-ic")}<span><b>${esc(c.name)}</b></span></button>`,
          )
          .join("") +
        `<button type="button" data-set-client="" class="${!e.clientId ? "on" : ""}"><span class="pi">${I.x}</span><span><b>Bez klijenta</b></span></button>`;
    pop = document.createElement("div");
    pop.className = "sf-pop";
    pop.dataset.what = what;
    pop.setAttribute("role", "menu");
    pop.innerHTML = h;
    document.body.appendChild(pop);
    const r = btn.getBoundingClientRect(),
      w = pop.offsetWidth,
      ph = pop.offsetHeight,
      below = r.bottom + 8 + ph < innerHeight - 8;
    pop.style.left = Math.max(8, Math.min(r.left, innerWidth - w - 8)) + "px";
    pop.style.top = (below ? r.bottom + 8 : Math.max(8, r.top - 8 - ph)) + "px";
    pop.addEventListener("click", (ev) => {
      const b = ev.target.closest("button");
      if (!b) return;
      if (b.dataset.setKind) C.ov.kind = b.dataset.setKind;
      if (b.dataset.setWho !== undefined) {
        C.ov.who = b.dataset.setWho || null;
        if (C.ov.kind === "in" || (!C.ov.kind && eff().kind === "in"))
          C.ov.kind = "pay";
      }
      if (b.dataset.setClient !== undefined)
        C.ov.clientId = b.dataset.setClient || null;
      if (b.dataset.setMk !== undefined)
        C.ov.mk = b.dataset.setMk ? +b.dataset.setMk : null;
      closePop();
      chips();
      focusQ();
    });
    const f = pop.querySelector("button.on") || pop.querySelector("button");
    if (f && fine) f.focus({ preventScroll: true });
  }
  addEventListener(
    "pointerdown",
    (e) => {
      if (pop && !pop.contains(e.target) && !e.target.closest("[data-pop]"))
        closePop();
    },
    true,
  );
  addEventListener("keydown", (e) => {
    if (!pop) return;
    if (e.key === "Escape") {
      e.stopPropagation();
      closePop();
      focusQ();
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const b = [...pop.querySelectorAll("button")],
        i = b.indexOf(document.activeElement);
      b[(i + (e.key === "ArrowDown" ? 1 : -1) + b.length) % b.length].focus();
    }
  });
  addEventListener("scroll", closePop, { passive: true });
  addEventListener("resize", closePop, { passive: true });

  function onChip(e) {
    const cur = e.target.closest("[data-cur]");
    if (cur) {
      /* prekidač se pomera na mestu (bez ponovnog crtanja čipova) */
      C.ov.cur = cur.dataset.cur;
      const g = cur.parentElement;
      g.classList.toggle("eur", C.ov.cur === "EUR");
      g.querySelectorAll("button").forEach((b) => {
        b.classList.toggle("on", b === cur);
        b.setAttribute("aria-checked", b === cur);
      });
      focusQ();
      return;
    }
    const dt = e.target.closest(".sfc.date");
    if (dt) {
      const inp = dt.querySelector("input");
      try {
        if (inp.showPicker) {
          e.preventDefault();
          inp.showPicker();
        }
      } catch (x) {}
      return;
    }
    const mk = e.target.closest("[data-mk]");
    if (mk) {
      C.ov.mk = +mk.dataset.mk;
      chips();
      focusQ();
      return;
    }
    const p = e.target.closest("[data-pop]");
    if (p) openPop(p, p.dataset.pop);
  }

  async function save() {
    if (C.busy) return;
    const e = eff();
    if (!e.amount) {
      hint("Koliko? Upiši iznos, npr. <b>15.000</b> ili <b>200€</b>.", true);
      shake($("#sfComp"));
      return;
    }
    if (e.kind === "pay" && !e.who) {
      hint(
        "Ko je dobio? Napiši ime (<b>Nina</b>, <b>Luka</b>…) ili ga izaberi gore.",
        true,
      );
      shake($("#sfComp"));
      return;
    }
    const id = newId(),
      data = docOf(e),
      q = C.q,
      ov = C.ov,
      pre = C.pre;
    C.busy = true;
    markFresh(id);
    V.key = e.mk;
    V.flash = id;
    reset();
    try {
      await api.set("ledger", id, data);
      toast(`Upisano: ${label(data)}`, () =>
        api.del("ledger", id).catch((x) => toast(errMsg(x))),
      );
    } catch (err) {
      C.q = q;
      C.ov = ov;
      C.pre = pre;
      $("#sfQ").value = q;
      chips();
      hint(esc(errMsg(err)), true);
    } finally {
      C.busy = false;
      chips();
      render();
      focusQ();
    }
  }

  /* ---------------- crtanje ---------------- */
  const cache = {};
  /* isti sadržaj se ne crta ponovo (refresh stiže za svaku kolekciju); ulazne animacije
     ulaze samo u prvo crtanje, a poređenje je bez njih */
  function put(el, mk, anim) {
    const plain = mk(false);
    if (cache[el.id] === plain && !anim) return false;
    cache[el.id] = plain;
    el.innerHTML = anim ? mk(true) : plain;
    return true;
  }
  const dl = (anim, s) =>
    anim ? `animation-delay:${adl(s)}s` : "animation:none";
  function rowHTML(r, i, anim) {
    const u = userOf(r.who),
      c = clientOf(r.clientId),
      it = itemOf(r.monthId);
    const ic =
      r.kind === "in"
        ? c
          ? logo(c, "lg-ic")
          : `<span class="lg-ic sf-ii">${I.in}</span>`
        : u
          ? `<span class="sf-av" style="--m:${colOf(u.id)}"><img src="${esc(IMG[u.id])}" alt="" loading="lazy"></span>`
          : `<span class="lg-ic sk"><img src="${esc(ICON)}" alt=""></span>`;
    const t = r.kind === "in" ? (c ? c.name : "Uplata") : u ? u.name : "Skeylo";
    const by = r.src === "lg" && r.by && userOf(r.by);
    const sub = [
      r.kind === "exp" ? "Trošak" : r.kind === "in" ? "Uplata" : "",
      r.shift ? zaLbl(r.key) : "",
      r.kind !== "in" && c ? c.name : "",
      r.src === "fin" && it ? "podela · " + it.title : "",
      r.invoiceNo ? "Faktura " + r.invoiceNo : "",
      r.note,
    ].filter(Boolean);
    const sign = r.kind === "in" ? "+" : r.kind === "exp" ? "−" : "";
    return `<button type="button" class="sf-row k-${r.kind}${r.src !== "lg" ? " old" : ""}${S.fresh.has(r.id) ? " new" : ""}" data-sfe="${esc(r.id)}" style="${dl(anim, 0.2 + Math.min(i, 10) * 0.04)}">
      ${ic}<span class="sf-t"><b>${esc(t)}</b><small>${esc(sub.join(" · ")) || "&nbsp;"}</small></span>
      <span class="sf-a"><b>${sign}${esc(fmt(r.amount, r.cur))}</b>${r.cur === "EUR" ? `<small>≈ ${fmtR(r.rsd)} RSD</small>` : by ? `<small class="by"><img src="${esc(IMG[by.id])}" alt="">${esc(by.name)}</small>` : ""}</span>
    </button>`;
  }
  function render() {
    if (!built || $("#money").hidden) return;
    const anim = first;
    first = false;
    if (V.key == null) V.key = thisKey();
    const k = V.key,
      tk = thisKey(),
      all = rows();
    const keys = all.map((r) => r.key),
      lo = Math.min(tk - 12, ...keys),
      hi = Math.max(tk, ...keys);
    $("#sfMon").textContent = ymName(k);
    body.querySelector('[data-sfm="-1"]').disabled = k <= lo;
    body.querySelector('[data-sfm="1"]').disabled = k >= hi;
    if (!S.ready) {
      put($("#sfRows"), () => '<div class="mnone">Učitavam finansije…</div>');
      return;
    }
    const month = all.filter((r) => r.key === k),
      s = sums(month),
      who = V.who,
      wu = userOf(who),
      mine = me() && who === me().id;
    /* hero: tim = isplaćeno timu; član = njegova zarada (isplate − troškovi) */
    const big = who ? s.by[who].pay - s.by[who].exp : s.pay;
    const end = Math.max(tk, k),
      span = [];
    for (let q = end - 5; q <= end; q++) span.push(q);
    const val = (q) => {
      const x = sums(all.filter((r) => r.key === q));
      return Math.max(0, who ? x.by[who].pay - x.by[who].exp : x.pay);
    };
    const bars = span.map(val),
      mx = Math.max(1, ...bars);
    const M = MONTHS[kM(k) - 1];
    put(
      $("#sfHero"),
      (
        a,
      ) => `<div><div class="flbl">${who ? (mine ? (who === "nina" ? "Tvoja zarada, kraljice" : "Tvoja zarada") : "Zarada · " + esc(wu.name)) : "Isplaćeno timu"} · ${M}</div>
        <div class="fbig"><span id="sfBig">${a && big > 0 ? "0" : (big < 0 ? "−" : "") + fmtR(Math.abs(big))}</span><small>RSD</small></div>
        <div class="mchips">${
          who
            ? `<span class="mchip up">${I.up}Isplate ${fmtR(s.by[who].pay)}</span><span class="mchip down">${I.down}Troškovi ${s.by[who].exp ? "−" : ""}${fmtR(s.by[who].exp)}</span>`
            : `<span class="mchip up">${I.up}Uplate ${fmtR(s.in)}</span><span class="mchip down">${I.down}Troškovi ${s.exp ? "−" : ""}${fmtR(s.exp)}</span><span class="mchip sk${s.sk < 0 ? " neg" : ""}"><img src="${esc(ICON)}" alt="">Ostaje Skeylu ${s.sk < 0 ? "−" : ""}${fmtR(Math.abs(s.sk))}</span>`
        }</div></div>
        <div class="mbars">${span
          .map(
            (q, i) =>
              `<button type="button" class="mbar${q === k ? " on" : ""}" data-sfk="${q}" aria-label="${ymName(q)}"><span class="v">${bars[i] ? fmtK(bars[i]) : ""}</span><span class="col2"><i style="height:${Math.max(4, (bars[i] / mx) * 100).toFixed(1)}%;${dl(a, 0.3 + i * 0.06)}"></i></span><span class="m">${MONTHS[q % 12].slice(0, 3)}</span></button>`,
          )
          .join("")}</div>`,
      anim,
    );
    if (anim && big > 0) X.countUp($("#sfBig"), Math.round(big));
    /* članovi: koliko je ko dobio ovog meseca; klik = samo taj član */
    put(
      $("#sfPpl"),
      (a) =>
        MEMBERS.map((m, i) => {
          const u = userOf(m.id),
            b = s.by[m.id],
            v = b.pay - b.exp;
          return `<button type="button" class="sf-p${who === m.id ? " on" : ""}${who && who !== m.id ? " dim" : ""}" data-who="${m.id}" aria-pressed="${who === m.id}" style="--m:${m.m};${dl(a, 0.12 + i * 0.05)}">
            <span class="sf-pav"><img src="${esc(IMG[m.id])}" alt=""></span>
            <span class="sf-pt"><span class="sf-pn">${esc(u.name)}${me() && me().id === m.id ? " <i>ti</i>" : ""}</span><b>${v ? (v < 0 ? "−" : "") + fmtR(Math.abs(v)) : "0"}<small> RSD</small></b><small>${b.n ? b.n + " " + plural(b.n, "stavka", "stavke", "stavki") : "ništa još"}</small></span>
          </button>`;
        }).join(""),
      anim,
    );
    /* plaćene fakture ovog meseca koje još nisu u knjizi */
    const sug = who ? [] : invSuggest(k);
    put(
      $("#sfFk"),
      (a) =>
        sug.length
          ? `<section class="sf-fk" style="${dl(a, 0.2)}"><div class="sf-fkh">${I.doc}<b>Plaćene fakture</b><span>Još nisu upisane kao uplata</span></div>${sug
              .map((f) => {
                const c = clientOf(guessClient(f));
                return `<div class="sf-fkr"><span class="sf-fkn">${esc(f.broj)}</span><span class="sf-t"><b>${esc(c ? c.name : f.kupac)}</b><small>${esc(f.kupac)} · plaćena ${esc(dayLbl(f.placena).toLowerCase())}</small></span><b class="sf-fka">+${esc(fmt(f.iznos / 100, "RSD"))}</b><button type="button" class="pill solid" data-fk-rec="${esc(f.id)}">${I.check}<span>Upiši</span></button><button type="button" class="sf-fkx" data-fk-skip="${esc(f.id)}" aria-label="Ne nudi više fakturu ${esc(f.broj)}" title="Ne nudi više">${I.x}</button></div>`;
              })
              .join("")}</section>`
          : "",
      anim,
    );
    /* stavke meseca po danima; podela meseca (stari unos bez dana) je na vrhu */
    let list = who ? month.filter((r) => r.who === who) : month;
    const cnt = { all: list.length, pay: 0, in: 0, exp: 0 };
    list.forEach((r) => cnt[r.kind]++);
    if (V.kind !== "all" && !cnt[V.kind]) V.kind = "all";
    if (V.kind !== "all") list = list.filter((r) => r.kind === V.kind);
    $("#sfListH").textContent = wu ? "Stavke · " + wu.name : "Stavke";
    put($("#sfTabs"), () =>
      [
        ["all", "Sve"],
        ["pay", "Isplate"],
        ["in", "Uplate"],
        ["exp", "Troškovi"],
      ]
        .filter(([t]) => t === "all" || cnt[t] || (who && t === "pay"))
        .filter(([t]) => !(who && t === "in"))
        .map(
          ([t, n]) =>
            `<button type="button" role="tab" aria-selected="${V.kind === t}" class="${V.kind === t ? "on" : ""}" data-sfkind="${t}">${n}<i>${cnt[t]}</i></button>`,
        )
        .join(""),
    );
    $("#sfCsv").hidden = !list.length;
    const groups = new Map();
    list
      .slice()
      .sort(
        (a, b) =>
          (b.date || "9999").localeCompare(a.date || "9999") || b.at - a.at,
      )
      .forEach((r) => {
        const g = r.date || "";
        if (!groups.has(g)) groups.set(g, []);
        groups.get(g).push(r);
      });
    let n = 0;
    put(
      $("#sfRows"),
      (a) => {
        n = 0;
        return list.length
          ? [...groups]
              .map(([d, rs]) => {
                const tot = rs.reduce(
                    (x, r) =>
                      x +
                      (r.kind === "in" ? r.rsd : r.kind === "exp" ? -r.rsd : 0),
                    0,
                  ),
                  pays = rs
                    .filter((r) => r.kind === "pay")
                    .reduce((x, r) => x + r.rsd, 0);
                return `<div class="sf-day"><div class="sf-dh" style="${dl(a, 0.18 + Math.min(n, 10) * 0.04)}"><b>${d ? esc(dayLbl(d)) : "Podela meseca"}</b><span>${d ? esc(dayLbl(d) === fDay.format(dOf(d)) ? fWk.format(dOf(d)) : fDay.format(dOf(d))) : "uneto u mesecu klijenta"}</span><i></i>${pays ? `<span class="sf-ds">isplaćeno ${fmtR(pays)}</span>` : ""}${tot ? `<span class="sf-ds ${tot > 0 ? "up" : "down"}">${tot > 0 ? "+" : "−"}${fmtR(Math.abs(tot))}</span>` : ""}</div>${rs.map((r) => rowHTML(r, n++, a)).join("")}</div>`;
              })
              .join("")
          : `<div class="mnone">${wu ? esc(wu.name) + " još nema" : "Još nema"} stavki za ${M}. Upiši prvu gore: <b>ko · koliko · kada</b>.</div>`;
      },
      anim,
    );
    if (V.flash) {
      const el = body.querySelector(`[data-sfe="${CSS.escape(V.flash)}"]`);
      V.flash = null;
      if (el && !reduce) {
        el.classList.add("flash");
        const r = el.getBoundingClientRect();
        if (r.top < 70 || r.bottom > innerHeight)
          el.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    }
  }

  function onBody(e) {
    const m = e.target.closest("[data-sfm]");
    if (m && !m.disabled) {
      V.key += +m.dataset.sfm;
      first = true;
      render();
      return;
    }
    const k = e.target.closest("[data-sfk]");
    if (k) {
      if (+k.dataset.sfk !== V.key) {
        V.key = +k.dataset.sfk;
        first = true;
        render();
      }
      return;
    }
    const w = e.target.closest("[data-who]");
    if (w) {
      nav(V.who === w.dataset.who ? "money" : "money~" + w.dataset.who);
      return;
    }
    const t = e.target.closest("[data-sfkind]");
    if (t) {
      V.kind = t.dataset.sfkind;
      render();
      return;
    }
    const rec = e.target.closest("[data-fk-rec]");
    if (rec) {
      const f = inv.list && inv.list.find((x) => x.id === rec.dataset.fkRec);
      if (f) {
        rec.disabled = true;
        recordInv(f).catch((x) => {
          rec.disabled = false;
          toast(errMsg(x));
        });
      }
      return;
    }
    const sk = e.target.closest("[data-fk-skip]");
    if (sk) {
      const f = inv.list && inv.list.find((x) => x.id === sk.dataset.fkSkip);
      if (f) skipInv(f);
      return;
    }
    const r = e.target.closest("[data-sfe]");
    if (r) {
      const row = rows().find((x) => x.id === r.dataset.sfe);
      if (!row) return;
      if (row.src === "fin") nav("f-" + row.monthId);
      else edit(row);
    }
  }

  /* ---------------- izmena stavke ---------------- */
  let E = null;
  function sheetEl() {
    let s = $("#sfScrim");
    if (s) return s;
    s = document.createElement("div");
    s.className = "scrim sf-scrim";
    s.id = "sfScrim";
    s.hidden = true;
    s.innerHTML = `<form class="sheet sf-sheet" id="sfEd" novalidate>
      <h3>Izmeni stavku</h3>
      <div class="sf-kinds" id="sfEdK" role="radiogroup" aria-label="Vrsta">${Object.entries(
        KINDS,
      )
        .map(
          ([k, v]) =>
            `<button type="button" role="radio" data-k="${k}"><span class="pi k-${k}">${v.ic}</span>${v.n}</button>`,
        )
        .join("")}</div>
      <div class="sf-f" id="sfEdWhoF"><div class="lbl">Ko</div><div class="sf-whos" id="sfEdWho"></div></div>
      <div class="sf-f"><div class="lbl">Iznos</div><div class="sf-amt"><input id="sfEdA" type="text" inputmode="decimal" autocomplete="off" placeholder="0" aria-label="Iznos"><div class="seg" id="sfEdSeg"><span class="knob"></span><button type="button" data-cur="RSD">RSD</button><button type="button" data-cur="EUR">EUR</button></div></div></div>
      <div class="sf-2"><label class="sf-f"><span class="lbl">Datum</span><input id="sfEdD" type="date"></label><label class="sf-f"><span class="lbl">Pripada mesecu</span><select id="sfEdMk"></select></label></div>
      <label class="sf-f"><span class="lbl">Klijent</span><select id="sfEdC"></select></label>
      <label class="sf-f"><span class="lbl">Napomena</span><input id="sfEdN" type="text" maxlength="120" autocomplete="off" placeholder="za šta, npr. montaža 10 videa"></label>
      <p class="sf-meta" id="sfEdM"></p>
      <p class="serr" id="sfEdE"></p>
      <div class="row2"><button type="button" class="pill danger" id="sfEdDel">Obriši</button><span class="sf-sp"></span><button type="button" class="pill" id="sfEdX">Otkaži</button><button type="submit" class="pill solid" id="sfEdOk">Sačuvaj</button></div>
    </form>`;
    document.body.appendChild(s);
    const f = $("#sfEd");
    f.addEventListener("click", (e) => {
      const k = e.target.closest("[data-k]");
      if (k) {
        E.kind = k.dataset.k;
        if (E.kind === "in") E.who = null;
        paintEd();
      }
      const w = e.target.closest("[data-w]");
      if (w) {
        E.who = w.dataset.w || null;
        paintEd();
      }
      const c = e.target.closest("#sfEdSeg [data-cur]");
      if (c) {
        E.cur = c.dataset.cur;
        paintEd();
      }
    });
    f.addEventListener("submit", (e) => {
      e.preventDefault();
      saveEd();
    });
    /* nov datum: lista meseca se pomera za njim; izabran raniji mesec ostaje */
    $("#sfEdD").addEventListener("change", () => {
      if (!E) return;
      const v = $("#sfEdMk").value;
      E.mk = v ? +v : null;
      monOpts();
    });
    $("#sfEdX").onclick = closeEd;
    $("#sfEdDel").onclick = delEd;
    s.addEventListener("click", (e) => {
      if (e.target === s) closeEd();
    });
    addEventListener("keydown", (e) => {
      if (e.key === "Escape" && E && !s.hidden) {
        e.stopPropagation();
        closeEd();
      }
    });
    return s;
  }
  /* izbor „Pripada mesecu“: mesec datuma ("") i tri pre njega, plus izabrani ako je van toga */
  function monOpts() {
    const d = $("#sfEdD").value,
      dk = keyOf(isoOk(d) ? d : today()),
      sel = E.mk != null && E.mk !== dk ? E.mk : null,
      ks = [dk - 1, dk - 2, dk - 3];
    if (sel != null && !ks.includes(sel)) ks.push(sel);
    ks.sort((a, b) => b - a);
    $("#sfEdMk").innerHTML =
      `<option value="">${esc(ymName(dk))} · kao datum</option>` +
      ks
        .map(
          (k) =>
            `<option value="${k}"${k === sel ? " selected" : ""}>${esc(ymName(k))}</option>`,
        )
        .join("");
  }
  function edit(r) {
    const s = sheetEl();
    E = {
      r,
      kind: r.kind,
      who: r.who,
      cur: r.cur,
      mk: r.shift ? r.key : null,
    };
    $("#sfEdA").value = nf2.format(r.amount);
    $("#sfEdD").value = r.date || today();
    monOpts();
    $("#sfEdN").value = r.note || "";
    $("#sfEdC").innerHTML =
      `<option value="">Bez klijenta</option>` +
      extClients()
        .map(
          (c) =>
            `<option value="${esc(c.id)}"${c.id === r.clientId ? " selected" : ""}>${esc(c.name)}</option>`,
        )
        .join("") +
      (r.clientId &&
      !extClients().some((c) => c.id === r.clientId) &&
      clientOf(r.clientId)
        ? `<option value="${esc(r.clientId)}" selected>${esc(clientOf(r.clientId).name)}</option>`
        : "");
    const by = userOf(r.by);
    $("#sfEdM").innerHTML =
      r.src === "exp"
        ? "Stari trošak iz ličnog panela: posle čuvanja prelazi u knjigu."
        : by
          ? `Upisao/la ${esc(by.name)}${r.at ? " · " + esc(fDay.format(new Date(r.at))) : ""}${r.invoiceNo ? " · faktura " + esc(r.invoiceNo) : ""}`
          : "";
    $("#sfEdE").textContent = "";
    paintEd();
    s.hidden = false;
    requestAnimationFrame(() => s.classList.add("open"));
    if (fine) setTimeout(() => $("#sfEdA").focus(), 60);
  }
  function paintEd() {
    $("#sfEdK")
      .querySelectorAll("[data-k]")
      .forEach((b) => b.setAttribute("aria-checked", b.dataset.k === E.kind));
    $("#sfEdWhoF").hidden = E.kind === "in";
    $("#sfEdWho").innerHTML =
      TEAM.map(
        (u) =>
          `<button type="button" data-w="${u.id}" aria-pressed="${E.who === u.id}" style="--m:${colOf(u.id)}"><img src="${esc(IMG[u.id])}" alt=""><span>${esc(u.name)}</span></button>`,
      ).join("") +
      (E.kind === "exp"
        ? `<button type="button" data-w="" aria-pressed="${!E.who}"><img class="sk" src="${esc(ICON)}" alt=""><span>Firma</span></button>`
        : "");
    const seg = $("#sfEdSeg");
    seg.classList.toggle("eur", E.cur === "EUR");
    seg
      .querySelectorAll("button")
      .forEach((b) => b.classList.toggle("on", b.dataset.cur === E.cur));
  }
  function closeEd() {
    const s = $("#sfScrim");
    if (!s) return;
    s.classList.remove("open");
    setTimeout(() => (s.hidden = true), reduce ? 0 : 220);
    E = null;
  }
  async function saveEd() {
    if (!E) return;
    const r = E.r,
      amount = parseAmount($("#sfEdA").value),
      date = $("#sfEdD").value,
      clientId = $("#sfEdC").value || null,
      mkv = $("#sfEdMk").value;
    const err = (t) => {
      $("#sfEdE").textContent = t;
      shake($("#sfEd"));
    };
    if (!amount) return err("Upiši iznos.");
    if (!isoOk(date)) return err("Izaberi datum.");
    if (E.kind === "pay" && !E.who) return err("Izaberi ko je dobio novac.");
    const k = mkv ? +mkv : keyOf(date);
    const old = r.src === "lg" && (S.ledger || []).find((d) => d.id === r.id);
    /* projekat (ciklus) ostaje ako se klijent nije menjao; mesec se računa iz datuma */
    const keepIt =
      old &&
      old.monthId &&
      old.clientId === clientId &&
      (itemOf(old.monthId) || {}).type !== "month";
    const patch = {
      kind: E.kind,
      who: E.kind === "in" ? null : E.who || null,
      amount,
      cur: E.cur,
      date,
      year: kY(k),
      month: kM(k),
      clientId,
      monthId: keepIt ? old.monthId : monthFor(clientId, k),
      note: $("#sfEdN").value.trim().slice(0, 120),
      updatedAt: Date.now(),
      updatedBy: me() ? me().id : null,
    };
    $("#sfEdOk").disabled = true;
    try {
      if (old) await api.upd("ledger", r.id, patch);
      else {
        /* stari trošak (kolekcija expenses) prelazi u knjigu */
        const id = newId(),
          u = me();
        await api.set("ledger", id, {
          invoiceId: null,
          invoiceNo: null,
          fkKlijent: null,
          order: Date.now(),
          createdAt: r.at || Date.now(),
          createdBy: r.by || (u ? u.id : null),
          ...patch,
        });
        await api.del("expenses", r.ref);
      }
      V.key = k;
      V.flash = r.src === "lg" ? r.id : null;
      closeEd();
      render();
      toast("Stavka sačuvana");
    } catch (x) {
      err(errMsg(x));
    } finally {
      $("#sfEdOk").disabled = false;
    }
  }
  async function delEd() {
    if (!E) return;
    const r = E.r;
    const col = r.src === "exp" ? "expenses" : "ledger",
      id = r.src === "exp" ? r.ref : r.id,
      doc = (S[col] || []).find((d) => d.id === id);
    if (!doc) return;
    const { id: _, ...data } = doc;
    closeEd();
    try {
      await api.del(col, id);
      toast(
        `Obrisano: ${label({ ...data, who: data.who || data.member })}`,
        () => api.set(col, id, data).catch((x) => toast(errMsg(x))),
      );
    } catch (x) {
      toast(errMsg(x));
    }
  }

  /* ---------------- CSV meseca (za knjigovođu) ---------------- */
  function csv() {
    const k = V.key,
      list = rows()
        .filter(
          (r) =>
            r.key === k &&
            (!V.who || r.who === V.who) &&
            (V.kind === "all" || r.kind === V.kind),
        )
        .sort((a, b) => (a.date || "").localeCompare(b.date || ""));
    const q = (v) => '"' + String(v ?? "").replace(/"/g, '""') + '"';
    const num = (v) => String(Math.round(v * 100) / 100).replace(".", ",");
    const lines = [
      [
        "Datum",
        "Za mesec",
        "Vrsta",
        "Ko",
        "Klijent",
        "Iznos",
        "Valuta",
        "RSD",
        "Napomena",
        "Faktura",
      ]
        .map(q)
        .join(";"),
    ].concat(
      list.map((r) =>
        [
          r.date ? r.date.split("-").reverse().join(".") : ymName(k),
          ymName(r.key),
          KINDS[r.kind].n,
          r.kind === "in" ? "" : (userOf(r.who) || { name: "Firma" }).name,
          (clientOf(r.clientId) || { name: "" }).name,
          num(r.amount),
          r.cur,
          num(r.rsd),
          r.src === "fin" ? "podela meseca" : r.note,
          r.invoiceNo,
        ]
          .map(q)
          .join(";"),
      ),
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" }),
    );
    a.download = `skeylo-finance-${kY(k)}-${pad(kM(k))}${V.who ? "-" + V.who : ""}.csv`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 500);
  }

  /* ---------------- javno ---------------- */
  return {
    /* app.js: ulazak na #money / #money~{član}; again = ekran je već otvoren (samo filtar) */
    route(h, again) {
      X.applyTheme(me() && me().id === "nina" ? "nina" : "dark");
      if (!built) build();
      const w = h.startsWith("money~") ? h.slice(6) : "";
      V.who = userOf(w) ? w : null;
      if (!again) {
        V.key = V.next != null ? V.next : thisKey();
        V.next = null;
        V.kind = "all";
        first = true;
        /* klijent sa stranice meseca važi samo za ovaj ulazak */
        if (!C.preNow) reset();
        else chips();
        C.preNow = false;
        hint("");
        if (fine) setTimeout(focusQ, 80);
      }
      render();
      loadInv(true);
    },
    render,
    leave() {
      closePop();
      closeEd();
    },
    net,
    netRecent,
    monthRows,
    rows,
    /* otvori stavku knjige u njenom mesecu (stranica Finances meseca) */
    open(id) {
      const r = rows().find((x) => x.id === id);
      if (!r) return;
      V.next = r.key;
      V.flash = id;
      nav("money");
    },
    /* stranica Finances meseca → unos sa već izabranim klijentom i projektom */
    prefill(o) {
      C.pre =
        o && o.clientId
          ? {
              clientId: o.clientId,
              monthId: o.monthId || null,
              key: o.key != null ? o.key : null,
            }
          : null;
      C.preNow = !!C.pre;
      C.q = "";
      C.ov = {};
      if ($("#sfQ")) $("#sfQ").value = "";
      if (o && o.key != null) V.next = o.key;
    },
    /* fakture.js: plaćena faktura → knjiga (upiše je ako nije, pa otvori njen mesec) */
    invLabel: (f) =>
      entryOfInv(f.id) && entryOfInv(f.id).kind !== "skip"
        ? "Otvori u Skeylo Finance"
        : "Upiši u Skeylo Finance",
    async fromInvoice(f) {
      const ex = entryOfInv(f.id);
      let id = ex && ex.kind !== "skip" ? ex.id : null;
      if (ex && ex.kind === "skip") await api.del("ledger", ex.id);
      if (!id) id = await recordInv(f, true);
      const d = (S.ledger || []).find((x) => x.id === id);
      V.next = d && isoOk(d.date) ? keyOfDoc(d) : thisKey();
      V.flash = id;
      nav("money");
      if (!ex || ex.kind === "skip")
        toast(`Uplata po fakturi ${f.broj} je upisana`, () =>
          api.del("ledger", id).catch((e) => toast(errMsg(e))),
        );
    },
  };
};
