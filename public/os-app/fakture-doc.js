/* Skeylo OS · Fakture: izgled dokumenta.
   Jedan raspored (lista oblika u pt, A4, koordinate od gornjeg levog ugla) crta se dvaput:
   u SVG za živi pregled i u PDF (pdf-lib + fontkit). Širine slova su iz istog fonta
   (DejaVu Sans, bez ligatura i kerninga, kao ReportLab), pa prelomi i poravnanja
   u pregledu i PDF-u ispadaju isti. Mere su prepisane iz šablona fakture 01/2026.
   Radi i u Node-u (module.exports) zbog provere PDF-a van pregledača. */
(function (root) {
  "use strict";

  /* ---------- širine slova (jedinice fonta, upm 2048) ---------- */
  // prettier-ignore
  const METRICS = {"r":{"upm":2048,"miss":1229,"r":[[32,[651,821,942,1716,1303,1946,1597,563,799,799,1024,1716,651,739,651,690,1303,1303,1303,1303,1303,1303,1303,1303,1303,1303,690,690,1716,1716,1716,1087,2048,1401,1405,1430,1577,1294,1178,1587,1540,604,604,1343,1141,1767,1532,1612,1235,1612,1423,1300,1251,1499,1401,2025,1403,1251,1403,799,690,799,1716,1024,1024,1255,1300,1126,1300,1260,721,1300,1298,569,569,1186,569,1995,1298,1253,1300,1300,842,1067,803,1298,1212,1675,1212,1212,1075,1303,690,1303,1716]],[160,[651,821,1303,1303,1303,1303,690,1024,1024,2048,965,1253,1716,739,2048,1024,1024,1716,821,821,1024,1303,1303,651,1024,821,965,1253,1985,1985,1985,1087,1401,1401,1401,1401,1401,1401,1995,1430,1294,1294,1294,1294,604,604,604,604,1587,1532,1612,1612,1612,1612,1612,1716,1612,1499,1499,1499,1499,1251,1239,1290,1255,1255,1255,1255,1255,1255,2011,1126,1260,1260,1260,1260,569,569,569,569,1253,1298,1253,1253,1253,1253,1253,1716,1253,1298,1298,1298,1298,1212,1300,1212,1401,1255,1401,1255,1401,1255,1430,1126,1430,1126,1430,1126,1430,1126,1577,1300,1587,1300,1294,1260,1294,1260,1294,1260,1294,1260,1294,1260,1587,1300,1587,1300,1587,1300,1587,1300,1540,1298,1876,1423,604,569,604,569,604,569,604,569,604,569,1208,1138,604,569,1343,1186,1186,1141,569,1141,569,1141,768,1141,700,1151,582,1532,1298,1532,1298,1532,1298,1666,1532,1298,1612,1253,1612,1253,1612,1253,2191,2095,1423,842,1423,842,1423,842,1300,1067,1300,1067,1300,1067,1300,1067,1251,803,1251,803,1251,803,1499,1298,1499,1298,1499,1298,1499,1298,1499,1298,1499,1298,2025,1675,1251,1212,1251,1403,1075,1403,1075,1403,1075,721]],[536,[1300,1067,1251,803]],[1024,[1294,1294,1610,1249,1430,1300,604,604,604,2240,2140,1610,1454,1532,1248,1540,1401,1405,1405,1249,1600,1294,2206,1313,1532,1532,1454,1540,1767,1540,1612,1540,1235,1430,1251,1248,1763,1403,1590,1404,2190,2240,1705,1807,1405,1430,2211,1423,1255,1263,1207,1076,1416,1260,1845,1089,1331,1331,1237,1309,1545,1339,1253,1339,1300,1126,1193,1212,1751,1212,1394,1210,1874,1929,1447,1617,1207,1124,1724,1232,1260,1260,1280,1076,1124,1067,569,569,569,1848,1840,1335,1237,1331,1212,1339]],[8208,[739,739,1303,1024,2048,2048,1024,1024,651,651,651,651,1061,1061,1061,1061,1024,1024,1208,1208,685,1367,2048,651]],[8240,[2748,3554,465,765,1065,465,765,1065,694,819,819]],[8364,[1303]],[8470,[2130]],[8482,[2048]],[8722,[1716]]]},"b":{"upm":2048,"miss":1229,"r":[[32,[713,934,1067,1716,1425,2052,1786,627,936,936,1071,1716,778,850,778,748,1425,1425,1425,1425,1425,1425,1425,1425,1425,1425,819,819,1716,1716,1716,1188,2048,1585,1561,1503,1700,1399,1399,1681,1714,762,762,1587,1305,2038,1714,1741,1501,1741,1577,1475,1397,1663,1585,2259,1579,1483,1485,936,748,936,1716,1024,1024,1382,1466,1214,1466,1389,891,1466,1458,702,702,1362,702,2134,1458,1407,1466,1466,1010,1219,979,1458,1335,1892,1321,1335,1192,1458,748,1458,1716]],[160,[713,934,1425,1425,1303,1425,748,1024,1024,2048,1155,1323,1716,850,2048,1024,1024,1716,897,897,1024,1507,1303,778,1024,897,1155,1323,2120,2120,2120,1188,1585,1585,1585,1585,1585,1585,2222,1503,1399,1399,1399,1399,762,762,762,762,1716,1714,1741,1741,1741,1741,1741,1716,1741,1663,1663,1663,1663,1483,1511,1473,1382,1382,1382,1382,1382,1382,2146,1214,1389,1389,1389,1389,702,702,702,702,1407,1458,1407,1407,1407,1407,1407,1716,1407,1458,1458,1458,1458,1335,1466,1335,1585,1382,1585,1382,1585,1382,1503,1214,1503,1214,1503,1214,1503,1214,1700,1466,1716,1466,1399,1389,1399,1389,1399,1389,1399,1389,1399,1389,1681,1466,1681,1466,1681,1466,1681,1466,1714,1458,1994,1618,762,702,762,702,762,702,762,702,762,702,1524,1404,762,702,1587,1362,1362,1305,702,1305,702,1305,982,1305,1140,1315,760,1714,1458,1714,1458,1714,1458,2013,1714,1458,1741,1407,1741,1407,1741,1407,2390,2241,1577,1010,1577,1010,1577,1010,1475,1219,1475,1219,1475,1219,1475,1219,1397,979,1397,979,1397,979,1663,1458,1663,1458,1663,1458,1663,1458,1663,1458,1663,1458,2259,1892,1483,1335,1483,1485,1192,1485,1192,1485,1192,891]],[536,[1475,1219,1397,979]],[1024,[1399,1399,1799,1305,1503,1475,762,762,762,2364,2314,1799,1674,1714,1579,1714,1585,1561,1561,1305,1824,1399,2507,1455,1714,1714,1674,1701,2038,1714,1741,1714,1501,1503,1397,1579,2031,1579,1900,1655,2530,2715,1924,2122,1561,1503,2404,1577,1382,1430,1296,1070,1654,1389,2038,1190,1435,1435,1390,1500,1674,1415,1407,1415,1466,1214,1187,1335,2032,1321,1518,1406,2175,2264,1539,1852,1295,1214,1991,1315,1389,1389,1462,1070,1214,1219,702,702,702,2030,1958,1504,1390,1435,1335,1415]],[8208,[850,850,1425,1024,2048,2048,1024,1024,778,778,778,778,1346,1346,1346,1346,1024,1024,1309,1309,682,1366,2048,713]],[8240,[2949,3864,540,915,1290,540,915,1290,1501,844,844]],[8364,[1425]],[8470,[2464]],[8482,[2048]],[8722,[1716]]]}};
  const tables = {};
  for (const k of ["r", "b"]) {
    const map = new Map();
    for (const [s, ws] of METRICS[k].r) ws.forEach((w, i) => map.set(s + i, w));
    tables[k] = { map, upm: METRICS[k].upm, miss: METRICS[k].miss };
  }
  function tw(text, bold, size) {
    const t = tables[bold ? "b" : "r"];
    let s = 0;
    for (const ch of String(text)) s += t.map.get(ch.codePointAt(0)) ?? t.miss;
    return (s * size) / t.upm;
  }
  /* znak koga nema u fontu (emoji, kineski...) ide kao "?" da PDF ne pukne */
  const safe = (s) =>
    Array.from(String(s ?? ""))
      .map((ch) =>
        tables.r.map.has(ch.codePointAt(0)) || ch === "\n"
          ? ch
          : ch === "\t"
            ? " "
            : ch === "\r"
              ? ""
              : "?",
      )
      .join("");

  /* Prelom u redove do širine maxW. Deli po jednom razmaku, pa "PIB: 1   MB: 2"
     zadržava sva tri razmaka; reč duža od reda lomi se po slovima. */
  function wrap(text, bold, size, maxW) {
    const out = [];
    const fits = (s) => tw(s, bold, size) <= maxW;
    for (const para of safe(text).split(/\r?\n/)) {
      let line = null;
      for (let w of para.split(" ")) {
        if (line !== null && fits(line + " " + w)) {
          line += " " + w;
          continue;
        }
        if (line !== null) {
          out.push(line);
          if (!w) {
            line = null; // razmak na mestu preloma se gubi
            continue;
          }
        }
        while (!fits(w)) {
          let n = w.length - 1;
          while (n > 1 && !fits(w.slice(0, n))) n--;
          out.push(w.slice(0, n));
          w = w.slice(n);
        }
        line = w;
      }
      out.push(line === null ? "" : line);
    }
    return out;
  }

  /* ---------- novac i brojevi (pare = ceo broj, bez float-a) ---------- */
  const grp = (s) => s.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  function money(p) {
    p = Math.round(Number(p) || 0);
    const neg = p < 0;
    p = Math.abs(p);
    return (
      (neg ? "-" : "") +
      grp(String(Math.floor(p / 100))) +
      "," +
      String(p % 100).padStart(2, "0")
    );
  }
  /* količina u hiljaditim delovima: 1000 -> "1", 2500 -> "2,5" */
  function qty(m) {
    m = Math.round(Number(m) || 0);
    const neg = m < 0;
    m = Math.abs(m);
    const d = String(m % 1000)
      .padStart(3, "0")
      .replace(/0+$/, "");
    return (
      (neg ? "-" : "") + grp(String(Math.floor(m / 1000))) + (d ? "," + d : "")
    );
  }
  /* kao round() u Postgres-u: polovina ide dalje od nule */
  const rnd = (x) => Math.sign(x) * Math.round(Math.abs(x));
  const lineTotal = (milli, para) => rnd((milli * para) / 1000);
  const toPara = (n) => rnd(Number(n || 0) * 100);
  const toMilli = (n) => rnd(Number(n || 0) * 1000);
  function date(iso) {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || "");
    return m ? `${m[3]}.${m[2]}.${m[1]}` : "";
  }
  function days(a, b) {
    const t = (s) =>
      Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10));
    return Math.round((t(b) - t(a)) / 864e5);
  }
  const danaWord = (n) =>
    Math.abs(n) % 10 === 1 && Math.abs(n) % 100 !== 11 ? "dan" : "dana";

  /* ---------- boje i mere iz šablona ---------- */
  const PAGE = { w: 595.2756, h: 841.8898 };
  const C = {
    orange: [0.909804, 0.439216, 0.039216],
    dark: [0.105882, 0.137255, 0.156863],
    gray: [0.372549, 0.388235, 0.407843],
    card: [0.956863, 0.956863, 0.94902],
    line: [0.854902, 0.862745, 0.878431],
    white: [1, 1, 1],
  };
  const L = 50,
    R = 545.2756,
    FOOT = 781.8898, // linija iznad podnožja
    LIMIT = FOOT - 22; // dokle sme sadržaj

  /* Napomene koje uvek stoje na fakturi. */
  function notesOf(f) {
    const out = ["Obveznik nije u sistemu PDV-a."];
    if (!f.storno_za) {
      if (f.rok_placanja && f.datum_izdavanja) {
        const n = days(f.datum_izdavanja, f.rok_placanja);
        out.push(
          n > 0
            ? `Rok plaćanja: ${date(f.rok_placanja)} (${n} ${danaWord(n)} od dana izdavanja).`
            : `Rok plaćanja: ${date(f.rok_placanja)}.`,
        );
      }
      const racun = (f.izdavalac || {}).tekuci_racun;
      if (racun)
        out.push(
          `Uplatu izvršiti na tekući račun ${racun}` +
            (f.poziv_na_broj ? `, poziv na broj: ${f.poziv_na_broj}.` : "."),
        );
    }
    out.push("Faktura je punovažna bez pečata i potpisa.");
    return out;
  }

  /* f: { broj, datum_izdavanja, mesto_izdavanja, datum_prometa_od, datum_prometa_do,
          rok_placanja, poziv_na_broj, napomene, storno_za, izdavalac{}, kupac{},
          stavke: [{opis, jedinica_mere, kol (hiljaditi), cena (pare), iznos? (pare)}] }
     logo: { w, h } (piksela) ili null. Vraća { pages: [[op]], total }. */
  function faktura(f, logo) {
    const iz = f.izdavalac || {},
      ku = f.kupac || {};
    const pages = [];
    let ops;
    const text = (x, y, str, size, bold, c, align) => {
      str = safe(str);
      if (!str) return;
      const w = tw(str, bold, size);
      ops.push({
        t: "text",
        x: align === "r" ? x - w : align === "c" ? x - w / 2 : x,
        y,
        s: size,
        b: !!bold,
        c,
        str,
      });
    };
    const newPage = () => {
      ops = [];
      pages.push(ops);
      ops.push({ t: "rect", x: 0, y: 0, w: PAGE.w, h: 8, c: C.orange });
      ops.push({
        t: "rect",
        x: 0,
        y: PAGE.h - 4,
        w: PAGE.w,
        h: 4,
        c: C.orange,
      });
    };
    /* podnožje ide na kraj svake strane (redosled teksta pri kopiranju i čitanju) */
    const footer = () => {
      const f1 = [iz.naziv, iz.pib && "PIB " + iz.pib, iz.mb && "MB " + iz.mb]
        .filter(Boolean)
        .join(" · ");
      const f2 = [iz.adresa, iz.email, iz.telefon].filter(Boolean).join(" · ");
      for (const pg of pages) {
        ops = pg;
        ops.push({
          t: "line",
          x1: L,
          y1: FOOT,
          x2: R,
          y2: FOOT,
          c: C.line,
          w: 0.6,
        });
        text(PAGE.w / 2, PAGE.h - 46, f1, 8, false, C.gray, "c");
        text(PAGE.w / 2, PAGE.h - 34, f2, 8, false, C.gray, "c");
      }
    };
    newPage();

    /* zaglavlje: logo levo, naslov i podaci desno */
    if (logo && logo.w && logo.h) {
      const k = Math.min(170 / logo.w, 56.66667 / logo.h);
      const w = logo.w * k,
        h = logo.h * k;
      ops.push({ t: "img", x: 44, y: 40 + (56.66667 - h) / 2, w, h });
    } else if (iz.naziv) {
      const ln = wrap(iz.naziv, true, 14, 220).slice(0, 2);
      ln.forEach((s, i) => text(L, 62 + i * 17, s, 14, true, C.dark));
    }
    text(
      R,
      62,
      f.storno_za ? "STORNO FAKTURA" : "FAKTURA",
      26,
      true,
      C.dark,
      "r",
    );
    const promet =
      f.datum_prometa_od &&
      f.datum_prometa_do &&
      f.datum_prometa_od !== f.datum_prometa_do
        ? `${date(f.datum_prometa_od)} – ${date(f.datum_prometa_do)}`
        : date(f.datum_prometa_od || f.datum_prometa_do);
    const meta = [
      ["Broj:", f.broj],
      ["Datum izdavanja:", date(f.datum_izdavanja)],
      ["Mesto izdavanja:", f.mesto_izdavanja],
      ["Datum prometa:", promet],
      f.storno_za ? ["Storno fakture:", f.storno_za] : null,
    ].filter((r) => r && r[1]);
    meta.forEach(([k, v], i) => {
      text(395.2756, 84 + i * 15, k, 9.5, false, C.gray, "r");
      text(R, 84 + i * 15, v, 9.5, true, C.dark, "r");
    });

    /* kartice Izdavalac / Kupac */
    const top = Math.max(170, 84 + (meta.length - 1) * 15 + 41);
    const cw = 237.6378,
      inner = cw - 28;
    const card = (x, label, name, lines) => {
      const nm = wrap(name || "", true, 10, inner);
      const dl = lines.filter(Boolean).flatMap((s) => wrap(s, false, 9, inner));
      return {
        x,
        label,
        nm,
        dl,
        h:
          38 +
          (nm.length - 1) * 13 +
          (dl.length ? 13 + (dl.length - 1) * 12.5 : 0) +
          6,
      };
    };
    const pibMb = (o) =>
      [o.pib && "PIB: " + o.pib, o.mb && "MB: " + o.mb]
        .filter(Boolean)
        .join("   ");
    const cards = [
      card(L, "IZDAVALAC", iz.naziv, [
        iz.adresa,
        pibMb(iz),
        iz.tekuci_racun && "Tekući račun: " + iz.tekuci_racun,
        iz.banka,
        [iz.email, iz.telefon].filter(Boolean).join(" · "),
      ]),
      card(L + cw + 20, "KUPAC", ku.naziv, [
        [ku.adresa, ku.mesto].filter(Boolean).join(", "),
        pibMb(ku),
      ]),
    ];
    const ch = Math.max(...cards.map((c) => c.h));
    for (const c of cards) {
      ops.push({ t: "rect", x: c.x, y: top, w: cw, h: ch, c: C.card, r: 6 });
      text(c.x + 14, top + 20, c.label, 8.5, true, C.orange);
      c.nm.forEach((s, i) =>
        text(c.x + 14, top + 38 + i * 13, s, 10, true, C.dark),
      );
      const d0 = top + 38 + (c.nm.length - 1) * 13 + 13;
      c.dl.forEach((s, i) =>
        text(c.x + 14, d0 + i * 12.5, s, 9, false, C.gray),
      );
    }

    /* stavke */
    const COL = {
      rb: 58,
      opis: 94,
      jm: 295.2756,
      kol: 375.2756,
      cena: 455.2756,
      iznos: 537.2756,
    };
    const head = (y) => {
      ops.push({ t: "rect", x: L, y, w: R - L, h: 22, c: C.dark });
      const b = y + 15;
      text(COL.rb, b, "R. br.", 8.5, true, C.white);
      text(COL.opis, b, "Opis usluge", 8.5, true, C.white);
      text(COL.jm, b, "Jed. mere", 8.5, true, C.white);
      text(COL.kol, b, "Kol.", 8.5, true, C.white, "r");
      text(COL.cena, b, "Cena (RSD)", 8.5, true, C.white, "r");
      text(COL.iznos, b, "Iznos (RSD)", 8.5, true, C.white, "r");
      return y + 22;
    };
    let y = head(top + ch + 24);
    let total = 0;
    (f.stavke || []).forEach((s, i) => {
      const iznos = s.iznos != null ? s.iznos : lineTotal(s.kol, s.cena);
      total += iznos;
      const lines = wrap(s.opis || "", false, 9.5, COL.jm - COL.opis - 10);
      const jm = wrap(s.jedinica_mere || "", false, 9.5, COL.kol - COL.jm - 30);
      const n = Math.max(lines.length, jm.length);
      const h = 32 + (n - 1) * 11.4;
      if (y + h > LIMIT) {
        newPage();
        y = head(40);
      }
      const b = y + 22;
      text(COL.rb, b, i + 1 + ".", 9.5, false, C.dark);
      lines.forEach((t, j) =>
        text(COL.opis, b + j * 11.4, t, 9.5, false, C.dark),
      );
      jm.forEach((t, j) => text(COL.jm, b + j * 11.4, t, 9.5, false, C.dark));
      text(COL.kol, b, qty(s.kol), 9.5, false, C.dark, "r");
      text(COL.cena, b, money(s.cena), 9.5, false, C.dark, "r");
      text(COL.iznos, b, money(iznos), 9.5, false, C.dark, "r");
      y += h;
      ops.push({ t: "line", x1: L, y1: y, x2: R, y2: y, c: C.line, w: 0.6 });
    });

    /* ukupno */
    if (y + 12 + 34 > LIMIT) {
      newPage();
      y = 28;
    }
    const bx = R - 300,
      by = y + 12;
    ops.push({ t: "rect", x: bx, y: by, w: 300, h: 34, c: C.card, r: 6 });
    text(
      bx + 12,
      by + 22,
      f.storno_za ? "IZNOS STORNA" : "UKUPNO ZA UPLATU",
      10.5,
      true,
      C.dark,
    );
    text(R - 12, by + 22, money(total) + " RSD", 13, true, C.orange, "r");
    y = by + 34;

    /* napomene */
    const notes = notesOf(f).flatMap((s) => wrap(s, false, 9.5, R - L));
    const extra = String(f.napomene || "").trim();
    if (extra) notes.push(...wrap(extra, false, 9.5, R - L));
    let ny = y + 44;
    if (ny + 15 > LIMIT) {
      newPage();
      ny = 60;
    }
    text(L, ny, "Napomene", 9.5, true, C.dark);
    for (const s of notes) {
      ny += 15;
      if (ny > LIMIT) {
        newPage();
        ny = 60;
      }
      text(L, ny, s, 9.5, false, C.gray);
    }
    footer();
    return { pages, total, size: PAGE };
  }

  /* ---------- SVG (pregled) ---------- */
  const hex = (c) =>
    "#" +
    c
      .map((v) =>
        Math.round(v * 255)
          .toString(16)
          .padStart(2, "0"),
      )
      .join("");
  const xe = (s) =>
    String(s).replace(
      /[&<>"]/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
    );
  const n2 = (v) => +v.toFixed(2);
  function roundedPath(x, y, w, h, r) {
    return `M${n2(x + r)} ${n2(y)}H${n2(x + w - r)}A${r} ${r} 0 0 1 ${n2(x + w)} ${n2(y + r)}V${n2(y + h - r)}A${r} ${r} 0 0 1 ${n2(x + w - r)} ${n2(y + h)}H${n2(x + r)}A${r} ${r} 0 0 1 ${n2(x)} ${n2(y + h - r)}V${n2(y + r)}A${r} ${r} 0 0 1 ${n2(x + r)} ${n2(y)}Z`;
  }
  function svg(ops, size, logoUrl) {
    const W = size || PAGE;
    const body = ops
      .map((o) => {
        if (o.t === "rect")
          return o.r
            ? `<path d="${roundedPath(o.x, o.y, o.w, o.h, o.r)}" fill="${hex(o.c)}"/>`
            : `<rect x="${n2(o.x)}" y="${n2(o.y)}" width="${n2(o.w)}" height="${n2(o.h)}" fill="${hex(o.c)}"/>`;
        if (o.t === "line")
          return `<line x1="${n2(o.x1)}" y1="${n2(o.y1)}" x2="${n2(o.x2)}" y2="${n2(o.y2)}" stroke="${hex(o.c)}" stroke-width="${o.w}"/>`;
        if (o.t === "img")
          return logoUrl
            ? `<image href="${xe(logoUrl)}" x="${n2(o.x)}" y="${n2(o.y)}" width="${n2(o.w)}" height="${n2(o.h)}" preserveAspectRatio="none"/>`
            : "";
        if (o.t === "text")
          /* SVG skuplja razmake; tvrdi razmak (iste širine u DejaVu) ih čuva */
          return `<text x="${n2(o.x)}" y="${n2(o.y)}" font-size="${o.s}"${o.b ? ' font-weight="700"' : ""} fill="${hex(o.c)}">${xe(o.str.replace(/ (?= )/g, "\u00a0"))}</text>`;
        return "";
      })
      .join("");
    return `<svg class="fk-page" viewBox="0 0 ${W.w} ${W.h}" xmlns="http://www.w3.org/2000/svg" font-family="FakDejaVu, 'DejaVu Sans', sans-serif" style="white-space:pre;font-kerning:none;font-variant-ligatures:none"><rect width="${W.w}" height="${W.h}" fill="#fff"/>${body}</svg>`;
  }

  /* ---------- PDF (pdf-lib) ----------
     lib: { PDFLib, fontkit, regular: bytes, bold: bytes, logo: {bytes, type:"png"|"jpg"} | null } */
  async function pdf(doc, lib, meta) {
    const { PDFDocument, rgb } = lib.PDFLib;
    const out = await PDFDocument.create();
    out.registerFontkit(lib.fontkit);
    const fr = await out.embedFont(lib.regular, { subset: true });
    const fb = await out.embedFont(lib.bold, { subset: true });
    let img = null;
    if (lib.logo && lib.logo.bytes)
      img =
        lib.logo.type === "jpg"
          ? await out.embedJpg(lib.logo.bytes)
          : await out.embedPng(lib.logo.bytes);
    const W = doc.size || PAGE;
    const col = (c) => rgb(c[0], c[1], c[2]);
    for (const ops of doc.pages) {
      const page = out.addPage([W.w, W.h]);
      for (const o of ops) {
        if (o.t === "rect") {
          if (o.r)
            page.drawSvgPath(roundedPath(o.x, o.y, o.w, o.h, o.r), {
              x: 0,
              y: W.h,
              color: col(o.c),
              borderWidth: 0,
            });
          else
            page.drawRectangle({
              x: o.x,
              y: W.h - o.y - o.h,
              width: o.w,
              height: o.h,
              color: col(o.c),
              borderWidth: 0,
            });
        } else if (o.t === "line")
          page.drawLine({
            start: { x: o.x1, y: W.h - o.y1 },
            end: { x: o.x2, y: W.h - o.y2 },
            thickness: o.w,
            color: col(o.c),
          });
        else if (o.t === "img" && img)
          page.drawImage(img, {
            x: o.x,
            y: W.h - o.y - o.h,
            width: o.w,
            height: o.h,
          });
        else if (o.t === "text")
          page.drawText(o.str, {
            x: o.x,
            y: W.h - o.y,
            size: o.s,
            font: o.b ? fb : fr,
            color: col(o.c),
          });
      }
    }
    if (meta) {
      if (meta.title) out.setTitle(meta.title);
      if (meta.author) out.setAuthor(meta.author);
      if (meta.subject) out.setSubject(meta.subject);
    }
    out.setCreator("Skeylo OS");
    out.setProducer("Skeylo OS");
    return out.save();
  }

  /* ---------- KPO knjiga: A4 položeno, spremno za štampu ----------
     m: { god, pib, obveznik, firma, sediste, sifra }
     rows: [{ redni_broj, datum, opis, proizvodi, usluge, ukupno }] (pare) */
  const LAND = { w: 841.8898, h: 595.2756 };
  function kpo(m, rows, exported) {
    const W = LAND,
      KL = 40,
      KR = W.w - 40,
      KLIM = W.h - 42;
    const pages = [];
    let ops;
    const text = (x, y, str, size, bold, c, align) => {
      str = safe(str);
      if (!str) return;
      const w = tw(str, bold, size);
      ops.push({
        t: "text",
        x: align === "r" ? x - w : align === "c" ? x - w / 2 : x,
        y,
        s: size,
        b: !!bold,
        c,
        str,
      });
    };
    const newPage = () => {
      ops = [];
      pages.push(ops);
      ops.push({ t: "rect", x: 0, y: 0, w: W.w, h: 6, c: C.orange });
      ops.push({ t: "rect", x: 0, y: W.h - 3, w: W.w, h: 3, c: C.orange });
    };
    const col = [
      { x: KL, w: 52, a: "c", t: "Redni broj" },
      {
        x: KL + 52,
        w: KR - KL - 52 - 354,
        a: "l",
        t: "Datum i opis knjiženja",
      },
      { x: KR - 354, w: 118, a: "r", t: "Prihod od delatnosti od proizvoda" },
      { x: KR - 236, w: 118, a: "r", t: "Prihod od delatnosti od usluga" },
      { x: KR - 118, w: 118, a: "r", t: "Svega prihodi od delatnosti (3+4)" },
    ];
    const cellX = (c) =>
      c.a === "r" ? c.x + c.w - 8 : c.a === "c" ? c.x + c.w / 2 : c.x + 8;
    const head = (y) => {
      ops.push({ t: "rect", x: KL, y, w: KR - KL, h: 30, c: C.dark });
      col.forEach((c) => {
        const ln = wrap(c.t, true, 7.5, c.w - 14).slice(0, 2);
        const y0 = y + (ln.length > 1 ? 12.5 : 18.5);
        ln.forEach((s, i) =>
          text(cellX(c), y0 + i * 9.5, s, 7.5, true, C.white, c.a),
        );
      });
      ops.push({ t: "rect", x: KL, y: y + 30, w: KR - KL, h: 13, c: C.card });
      col.forEach((c, i) =>
        text(cellX(c), y + 39.5, String(i + 1), 7, true, C.gray, c.a),
      );
      return y + 43;
    };

    newPage();
    text(KL, 30, "Obrazac KPO", 8.5, false, C.gray);
    text(
      KL,
      49,
      "KNJIGA O OSTVARENOM PROMETU PAUŠALNO OPOREZOVANIH OBVEZNIKA",
      14,
      true,
      C.dark,
    );
    text(KR, 30, "Godina", 8.5, false, C.gray, "r");
    text(KR, 51, String(m.god), 18, true, C.orange, "r");
    /* podaci o obvezniku */
    const top = 64;
    ops.push({ t: "rect", x: KL, y: top, w: KR - KL, h: 62, c: C.card, r: 6 });
    const fld = (x, y, label, val, w) => {
      text(x, y, label.toUpperCase(), 6.8, true, C.orange);
      text(x, y + 12, wrap(val || "—", true, 9, w)[0], 9, true, C.dark);
    };
    fld(KL + 14, top + 17, "PIB", m.pib, 150);
    fld(KL + 180, top + 17, "Obveznik (ime i prezime)", m.obveznik, 300);
    fld(KL + 520, top + 17, "Šifra delatnosti", m.sifra, 220);
    fld(KL + 14, top + 44, "Firma radnje", m.firma, 480);
    fld(KL + 520, top + 44, "Sedište i adresa radnje", m.sediste, 230);

    let y = head(top + 62 + 16);
    const sum = { p: 0, u: 0, t: 0 };
    if (!rows.length) {
      text(
        KL + (KR - KL) / 2,
        y + 22,
        `Nema knjiženja za ${m.god}. godinu.`,
        9,
        false,
        C.gray,
        "c",
      );
      y += 34;
    }
    rows.forEach((r) => {
      sum.p += r.proizvodi;
      sum.u += r.usluge;
      sum.t += r.ukupno;
      const opis = wrap(
        `${date(r.datum)}   ${r.opis}`,
        false,
        8.5,
        col[1].w - 16,
      );
      const h = 18 + (opis.length - 1) * 10.5;
      if (y + h > KLIM - 22) {
        newPage();
        text(KL, 30, `KPO ${m.god} · ${m.firma}`, 8.5, false, C.gray);
        y = head(40);
      }
      const b = y + 12.5;
      text(cellX(col[0]), b, String(r.redni_broj), 8.5, false, C.dark, "c");
      opis.forEach((s, i) =>
        text(cellX(col[1]), b + i * 10.5, s, 8.5, false, C.dark),
      );
      text(cellX(col[2]), b, money(r.proizvodi), 8.5, false, C.dark, "r");
      text(cellX(col[3]), b, money(r.usluge), 8.5, false, C.dark, "r");
      text(cellX(col[4]), b, money(r.ukupno), 8.5, true, C.dark, "r");
      y += h;
      ops.push({ t: "line", x1: KL, y1: y, x2: KR, y2: y, c: C.line, w: 0.6 });
    });
    if (y + 22 > KLIM) {
      newPage();
      y = head(40);
    }
    ops.push({ t: "rect", x: KL, y: y + 4, w: KR - KL, h: 20, c: C.card });
    const tb = y + 17.5;
    text(cellX(col[1]), tb, `UKUPNO ${m.god}.`, 8.5, true, C.dark);
    text(cellX(col[2]), tb, money(sum.p), 8.5, true, C.dark, "r");
    text(cellX(col[3]), tb, money(sum.u), 8.5, true, C.dark, "r");
    text(cellX(col[4]), tb, money(sum.t), 9, true, C.orange, "r");
    /* podnožje: datum izvoza i broj strane */
    pages.forEach((pg, i) => {
      ops = pg;
      text(
        KL,
        W.h - 16,
        `Skeylo OS · izvezeno ${date(exported)}`,
        7.5,
        false,
        C.gray,
      );
      text(
        KR,
        W.h - 16,
        `Strana ${i + 1} od ${pages.length}`,
        7.5,
        false,
        C.gray,
        "r",
      );
    });
    return { pages, total: sum.t, size: LAND };
  }

  /* ---------- Excel (.xlsx) bez biblioteke: zip bez kompresije + SpreadsheetML ---------- */
  const CRC = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c >>> 0;
    }
    return t;
  })();
  const crc32 = (u) => {
    let c = 0xffffffff;
    for (let i = 0; i < u.length; i++) c = CRC[(c ^ u[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
  const utf8 = (s) => new TextEncoder().encode(s);
  function zip(files) {
    const parts = [],
      central = [];
    let off = 0;
    for (const f of files) {
      const name = utf8(f.name),
        data = typeof f.data === "string" ? utf8(f.data) : f.data,
        crc = crc32(data);
      const h = new DataView(new ArrayBuffer(30));
      h.setUint32(0, 0x04034b50, true);
      h.setUint16(4, 20, true);
      h.setUint16(6, 0x0800, true); // UTF-8 imena
      h.setUint16(8, 0, true); // bez kompresije
      h.setUint16(10, 0, true);
      h.setUint16(12, 0x5a21, true); // 2025-01-01
      h.setUint32(14, crc, true);
      h.setUint32(18, data.length, true);
      h.setUint32(22, data.length, true);
      h.setUint16(26, name.length, true);
      h.setUint16(28, 0, true);
      parts.push(new Uint8Array(h.buffer), name, data);
      const c = new DataView(new ArrayBuffer(46));
      c.setUint32(0, 0x02014b50, true);
      c.setUint16(4, 20, true);
      c.setUint16(6, 20, true);
      c.setUint16(8, 0x0800, true);
      c.setUint16(10, 0, true);
      c.setUint16(12, 0, true);
      c.setUint16(14, 0x5a21, true);
      c.setUint32(16, crc, true);
      c.setUint32(20, data.length, true);
      c.setUint32(24, data.length, true);
      c.setUint16(28, name.length, true);
      c.setUint32(42, off, true);
      central.push(new Uint8Array(c.buffer), name);
      off += 30 + name.length + data.length;
    }
    const cdSize = central.reduce((s, u) => s + u.length, 0);
    const e = new DataView(new ArrayBuffer(22));
    e.setUint32(0, 0x06054b50, true);
    e.setUint16(8, files.length, true);
    e.setUint16(10, files.length, true);
    e.setUint32(12, cdSize, true);
    e.setUint32(16, off, true);
    const all = [...parts, ...central, new Uint8Array(e.buffer)];
    const out = new Uint8Array(all.reduce((s, u) => s + u.length, 0));
    let p = 0;
    for (const u of all) {
      out.set(u, p);
      p += u.length;
    }
    return out;
  }
  const xmlE = (s) =>
    String(s).replace(
      /[&<>"]/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
    );
  const colName = (i) => {
    let s = "";
    for (i++; i; i = Math.floor((i - 1) / 26))
      s = String.fromCharCode(65 + ((i - 1) % 26)) + s;
    return s;
  };
  const paraDec = (p) =>
    (p < 0 ? "-" : "") +
    Math.floor(Math.abs(p) / 100) +
    "." +
    String(Math.abs(p) % 100).padStart(2, "0");
  /* stilovi: 0 običan, 1 podebljan, 2 iznos, 3 podebljan iznos na sivoj, 4 zaglavlje, 5 datum, 6 naslov */
  const XSTYLES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><numFmts count="2"><numFmt numFmtId="164" formatCode="#,##0.00"/><numFmt numFmtId="165" formatCode="dd.mm.yyyy"/></numFmts><fonts count="3"><font><sz val="11"/><name val="Calibri"/><family val="2"/></font><font><b/><sz val="11"/><name val="Calibri"/><family val="2"/></font><font><b/><sz val="14"/><name val="Calibri"/><family val="2"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFF4F4F2"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="7"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/><xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/><xf numFmtId="164" fontId="1" fillId="2" borderId="0" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment wrapText="1" vertical="center"/></xf><xf numFmtId="165" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1" applyAlignment="1"><alignment horizontal="left"/></xf><xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`;
  /* cells: [[{v, t:"s"|"n"|"d"|"f", s, f}]]; widths: širine kolona (znakova) */
  function xlsx(sheetName, widths, cells) {
    const rowsXml = cells
      .map((row, r) => {
        const cs = row
          .map((c, i) => {
            if (c == null) return "";
            const ref = colName(i) + (r + 1),
              s = c.s ? ` s="${c.s}"` : "";
            if (c.t === "s")
              return `<c r="${ref}" t="inlineStr"${s}><is><t xml:space="preserve">${xmlE(c.v)}</t></is></c>`;
            if (c.t === "d") {
              const [y, mo, d] = c.v.split("-").map(Number);
              const serial = Math.round(
                (Date.UTC(y, mo - 1, d) - Date.UTC(1899, 11, 30)) / 864e5,
              );
              return `<c r="${ref}"${s}><v>${serial}</v></c>`;
            }
            return `<c r="${ref}"${s}>${c.f ? `<f>${xmlE(c.f)}</f>` : ""}<v>${c.v}</v></c>`;
          })
          .join("");
        return `<row r="${r + 1}">${cs}</row>`;
      })
      .join("");
    const sheet = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><cols>${widths
      .map(
        (w, i) =>
          `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`,
      )
      .join(
        "",
      )}</cols><sheetData>${rowsXml}</sheetData><pageSetup orientation="landscape" paperSize="9"/></worksheet>`;
    const R =
      "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
    return zip([
      {
        name: "[Content_Types].xml",
        data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`,
      },
      {
        name: "_rels/.rels",
        data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="${R}/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
      },
      {
        name: "xl/workbook.xml",
        data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="${R}"><sheets><sheet name="${xmlE(sheetName.slice(0, 31))}" sheetId="1" r:id="rId1"/></sheets></workbook>`,
      },
      {
        name: "xl/_rels/workbook.xml.rels",
        data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="${R}/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="${R}/styles" Target="styles.xml"/></Relationships>`,
      },
      { name: "xl/worksheets/sheet1.xml", data: sheet },
      { name: "xl/styles.xml", data: XSTYLES },
    ]);
  }
  function kpoXlsx(m, rows) {
    const s = (v, st) => ({ t: "s", v, s: st });
    const n = (p, st) => ({ t: "n", v: paraDec(p), s: st ?? 2 });
    const first = 7,
      last = first + rows.length - 1;
    const cells = [
      [s(`KPO knjiga ${m.god}`, 6)],
      [
        s(
          "Knjiga o ostvarenom prometu paušalno oporezovanih obveznika (obrazac KPO)",
        ),
      ],
      [s("Obveznik", 1), s(m.obveznik), null, s("PIB", 1), s(m.pib)],
      [
        s("Firma radnje", 1),
        s(m.firma),
        null,
        s("Šifra delatnosti", 1),
        s(m.sifra),
      ],
      [s("Sedište", 1), s(m.sediste)],
      [
        s("Redni broj", 4),
        s("Datum", 4),
        s("Opis knjiženja", 4),
        s("Prihod od delatnosti od proizvoda", 4),
        s("Prihod od delatnosti od usluga", 4),
        s("Svega prihodi od delatnosti (3+4)", 4),
      ],
      ...rows.map((r, i) => [
        { t: "n", v: r.redni_broj },
        { t: "d", v: String(r.datum).slice(0, 10), s: 5 },
        s(r.opis),
        n(r.proizvodi),
        n(r.usluge),
        {
          t: "n",
          v: paraDec(r.ukupno),
          s: 2,
          f: `D${first + i}+E${first + i}`,
        },
      ]),
    ];
    const tot = (k) => rows.reduce((a, r) => a + r[k], 0);
    const rng = (c) => (rows.length ? `SUM(${c}${first}:${c}${last})` : "0");
    cells.push([
      null,
      null,
      s(`Ukupno ${m.god}.`, 1),
      { ...n(tot("proizvodi"), 3), f: rng("D") },
      { ...n(tot("usluge"), 3), f: rng("E") },
      { ...n(tot("ukupno"), 3), f: rng("F") },
    ]);
    return xlsx(`KPO ${m.god}`, [11, 12, 58, 22, 22, 24], cells);
  }

  const api = {
    faktura,
    kpo,
    kpoXlsx,
    xlsx,
    notesOf,
    svg,
    pdf,
    wrap,
    tw,
    money,
    qty,
    date,
    days,
    danaWord,
    lineTotal,
    toPara,
    toMilli,
    PAGE,
    C,
  };
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.FakDoc = api;
})(typeof self !== "undefined" ? self : this);
