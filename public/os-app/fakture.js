/* Skeylo OS · Fakture (preduzetnik paušalac, van PDV-a).
   Podaci su u pravim tabelama šeme os (izdavalac, klijenti, fakture, stavke_fakture, view kpo),
   ne u os.docs: broj + godina su unique, novac je numeric, a izdata faktura je zaključana u bazi
   (triggeri). Fakture se upisuju samo kroz RPC fak_* (os-db.js daje klijenta kao OS.sb).
   Rute:  #fakture             lista
          #fakture~klijenti    klijenti (kupci)
          #fakture~podesavanja podaci izdavaoca, logo, limiti
          #fak-nova            nova faktura (#fak-nova~k{klijent} za klijenta, #fak-nova~{id} = dupliraj)
          #fak-{id}            nacrt = forma, izdata = pregled
   Izgled fakture (pregled i PDF) je u fakture-doc.js. Novac je u parama (ceo broj). */
window.SKFakture = function (X) {
  "use strict";
  const { esc, SV, toast, nav } = X;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const adl = window.OS_DL || ((s) => s);
  const D = window.FakDoc;
  const db = () => window.OS && window.OS.sb;
  const root = $("#fakBody");
  const back = $("#fkBack"),
    backLbl = $("#fkBackLbl");

  const I = {
    plus: SV('<path d="M12 5v14M5 12h14"/>', 2.4),
    dl: SV('<path d="M12 3v12M7 10l5 5 5-5M4 20h16"/>', 2.2),
    x: SV('<path d="M18 6 6 18M6 6l12 12"/>', 2.2),
    edit: SV(
      '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    ),
    box: SV('<path d="M21 8v13H3V8"/><path d="M1 3h22v5H1zM10 12h4"/>'),
    trash: SV('<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v6M14 11v6"/>'),
    doc: SV(
      '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>',
      1.9,
    ),
    up: SV('<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>', 2.2),
    send: SV('<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>', 2),
    copy: SV(
      '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/>',
    ),
    warn: SV('<path d="M12 3 2 21h20z"/><path d="M12 10v4M12 17.5h.01"/>', 2.2),
    more: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/></svg>',
    check: SV('<path d="m5 12 5 5L20 7"/>', 2.6),
    undo: SV(
      '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
    ),
    storno: SV('<circle cx="12" cy="12" r="9"/><path d="m5.6 5.6 12.8 12.8"/>'),
  };

  /* ---------- pomoćno ---------- */
  const iso = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const today = () => iso(new Date());
  const addDays = (s, n) =>
    iso(new Date(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10) + n));
  const yearOf = (s) => +String(s || today()).slice(0, 4);
  const pad2 = (n) => (n < 10 ? "0" : "") + n;
  const brojOf = (rb, god) => (rb ? pad2(rb) + "/" + god : "—");
  const money = (p) => D.money(p);
  const fold = (s) =>
    String(s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/đ/g, "dj");
  const plural = (n, one, few, many) => {
    const a = Math.abs(n) % 10,
      b = Math.abs(n) % 100;
    return a === 1 && b !== 11
      ? one
      : a >= 2 && a <= 4 && (b < 12 || b > 14)
        ? few
        : many;
  };
  /* "383.265,00", "383265", "383265,5", "1.5" -> ceo broj u 10^dec jedinicama; "" -> null; loše -> NaN */
  function parseNum(str, dec) {
    let s = String(str ?? "")
      .trim()
      .replace(/[\s ]/g, "")
      .replace(/(rsd|din\.?)$/i, "");
    if (!s) return null;
    let neg = false;
    if (/^[-−]/.test(s)) {
      neg = true;
      s = s.slice(1);
    }
    if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
    else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, "");
    if (!/^(\d+\.?\d*|\.\d+)$/.test(s)) return NaN;
    const v = Math.round(Number(s) * 10 ** dec);
    return neg ? -v : v;
  }
  const parseMoney = (s) => parseNum(s, 2);
  const parseQty = (s) => parseNum(s, 3);
  /* pare -> "383265.00" za bazu (bez float-a) */
  const paraStr = (p) => {
    const neg = p < 0;
    p = Math.abs(p);
    return (neg ? "-" : "") + Math.floor(p / 100) + "." + pad2(p % 100);
  };
  const milliStr = (m) => {
    const neg = m < 0;
    m = Math.abs(m);
    return (
      (neg ? "-" : "") +
      Math.floor(m / 1000) +
      "." +
      String(m % 1000).padStart(3, "0")
    );
  };

  function errText(e) {
    if (!e) return "Nešto nije u redu. Probaj ponovo.";
    const c = e.code || (e.cause && e.cause.code);
    const m = e.message || "";
    if (c === "23505") return "Taj broj fakture već postoji u ovoj godini.";
    if (c === "23503")
      return "Klijent ima fakture, zato se ne briše. Arhiviraj ga.";
    if (c === "42501" || m === "not_granted")
      return "Nemaš dozvolu za ovu izmenu.";
    if (c === "P0001" && m) return m;
    if (navigator.onLine === false || /fetch|network|load failed/i.test(m))
      return "Nema veze sa serverom. Proveri internet pa probaj ponovo.";
    return m || "Nešto nije u redu. Probaj ponovo.";
  }

  /* ---------- podaci ---------- */
  const S = { iz: null, kl: [], fk: [], ready: false };
  let loadP = null;
  function norm(r) {
    const st = (r.stavke || [])
      .slice()
      .sort((a, b) => a.redni_broj - b.redni_broj)
      .map((s) => ({
        opis: s.opis || "",
        jedinica_mere: s.jedinica_mere || "",
        vrsta: s.vrsta || "usluga",
        kol: D.toMilli(s.kolicina),
        cena: D.toPara(s.cena),
        iznos: D.toPara(s.iznos),
      }));
    return { ...r, stavke: st, uk: D.toPara(r.ukupno) };
  }
  const byNewest = (a, b) =>
    b.godina - a.godina ||
    b.redni_broj - a.redni_broj ||
    String(b.created_at).localeCompare(String(a.created_at));
  function keep(r) {
    const n = norm(r);
    const i = S.fk.findIndex((x) => x.id === n.id);
    if (i < 0) S.fk.push(n);
    else S.fk[i] = n;
    S.fk.sort(byNewest);
    return n;
  }
  async function load(force) {
    if (loadP && !force) return loadP;
    const p = (async () => {
      const c = db();
      if (!c) throw new Error("Baza nije spremna.");
      const [a, b, f] = await Promise.all([
        c.from("izdavalac").select("*").eq("id", 1).maybeSingle(),
        c.from("klijenti").select("*").order("naziv"),
        c
          .from("fakture")
          .select("*, stavke:stavke_fakture(*)")
          .order("godina", { ascending: false })
          .order("redni_broj", { ascending: false }),
      ]);
      const e = a.error || b.error || f.error;
      if (e) throw e;
      S.iz = a.data || null;
      S.kl = b.data || [];
      S.fk = (f.data || []).map(norm).sort(byNewest);
      S.ready = true;
      S.at = Date.now();
      paintDash();
    })();
    loadP = p;
    try {
      await p;
    } catch (e) {
      if (loadP === p) loadP = null;
      throw e;
    }
  }
  const klOf = (id) => S.kl.find((k) => k.id === id) || null;
  const fkOf = (id) => S.fk.find((f) => f.id === id) || null;
  const isStorno = (f) => !!f.storno_za_fakturu_id;
  const kupacOf = (f) =>
    (f.kupac_snapshot && f.kupac_snapshot.naziv) ||
    (klOf(f.klijent_id) || {}).naziv ||
    "—";
  /* poslednja važeća faktura klijenta (izdata ili plaćena; ne nacrt, storno ni stornirana) */
  const lastFor = (kid, skip) =>
    S.fk
      .filter(
        (f) =>
          f.klijent_id === kid &&
          f.id !== skip &&
          !isStorno(f) &&
          (f.status === "izdata" || f.status === "placena"),
      )
      .sort(
        (a, b) =>
          String(b.datum_izdavanja).localeCompare(String(a.datum_izdavanja)) ||
          byNewest(a, b),
      )[0] || null;
  const nextNo = (god, skip) =>
    S.fk
      .filter((f) => f.godina === god && f.id !== skip)
      .reduce((m, f) => Math.max(m, f.redni_broj), 0) + 1;

  /* ---------- PDF: biblioteke, fontovi i logo se učitavaju tek kad zatrebaju ---------- */
  const ASSET = "/os-app/";
  function script(src) {
    return new Promise((res, rej) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = res;
      s.onerror = () => rej(new Error("Ne mogu da učitam " + src));
      document.head.appendChild(s);
    });
  }
  let libP = null;
  function pdfLib() {
    if (!libP)
      libP = Promise.all([
        window.PDFLib ? 0 : script(ASSET + "vendor/pdf-lib.min.js"),
        window.fontkit ? 0 : script(ASSET + "vendor/fontkit.umd.min.js"),
        fetch(ASSET + "fonts/DejaVuSans.ttf").then((r) => r.arrayBuffer()),
        fetch(ASSET + "fonts/DejaVuSans-Bold.ttf").then((r) => r.arrayBuffer()),
      ])
        .then(([, , regular, bold]) => ({
          PDFLib: window.PDFLib,
          fontkit: window.fontkit,
          regular,
          bold,
        }))
        .catch((e) => {
          libP = null;
          throw e;
        });
    return libP;
  }
  const logos = new Map(); // putanja -> Promise<{url,w,h,bytes,type}|null>
  const logoDone = new Map(); // putanja -> učitan logo (za crtanje bez čekanja)
  function logo(path) {
    if (!path) return Promise.resolve(null);
    if (!logos.has(path))
      logos.set(
        path,
        (async () => {
          const { data, error } = await db()
            .storage.from("fakture")
            .download(path);
          if (error || !data) throw error || new Error("logo");
          const bytes = new Uint8Array(await data.arrayBuffer());
          const url = URL.createObjectURL(data);
          const img = new Image();
          img.src = url;
          await img.decode();
          const lg = {
            url,
            w: img.naturalWidth,
            h: img.naturalHeight,
            bytes,
            type:
              /jpe?g/i.test(data.type) || /\.jpe?g$/i.test(path)
                ? "jpg"
                : "png",
          };
          logoDone.set(path, lg);
          return lg;
        })().catch((e) => {
          console.warn("[fakture] logo", e);
          logos.delete(path);
          return null;
        }),
      );
    return logos.get(path);
  }

  /* ulaz za fakture-doc.js: izdata faktura uzima snapshot, nacrt trenutne podatke */
  function docInput(f) {
    const issued = f.status && f.status !== "nacrt";
    const iz = (issued ? f.izdavalac_snapshot : S.iz) || {};
    const ku = (issued ? f.kupac_snapshot : klOf(f.klijent_id)) || {};
    const orig = f.storno_za_fakturu_id ? fkOf(f.storno_za_fakturu_id) : null;
    return {
      broj: f.broj,
      datum_izdavanja: f.datum_izdavanja,
      mesto_izdavanja: f.mesto_izdavanja,
      datum_prometa_od: f.datum_prometa_od,
      datum_prometa_do: f.datum_prometa_do,
      rok_placanja: f.rok_placanja,
      poziv_na_broj: f.poziv_na_broj,
      napomene: f.napomene,
      storno_za: f.storno_za_fakturu_id ? (orig ? orig.broj : "—") : null,
      izdavalac: iz,
      kupac: ku,
      stavke: f.stavke,
    };
  }
  function pagesHtml(f) {
    const inp = docInput(f);
    const lp = inp.izdavalac.logo_path;
    const lg = lp ? logoDone.get(lp) : null;
    if (lp && !lg) logo(lp).then((x) => x && repaint && repaint());
    const doc = D.faktura(inp, lg);
    return doc.pages.map((ops) => D.svg(ops, doc.size, lg && lg.url)).join("");
  }
  let repaint = null; // ponovo nacrtaj pregled kad stigne logo

  async function makePdf(f) {
    const inp = docInput(f);
    const [lib, lg] = await Promise.all([
      pdfLib(),
      logo(inp.izdavalac.logo_path),
    ]);
    const doc = D.faktura(inp, lg);
    return D.pdf(
      doc,
      { ...lib, logo: lg },
      {
        title: (isStorno(f) ? "Storno faktura " : "Faktura ") + f.broj,
        author: inp.izdavalac.naziv || "",
        subject: inp.kupac.naziv || "",
      },
    );
  }
  const pdfPath = (f) =>
    `pdf/${f.godina}/${pad2(f.redni_broj)}-${f.godina}.pdf`;
  const fileName = (f) =>
    `${isStorno(f) ? "Storno faktura" : "Faktura"} ${String(f.broj).replace("/", "-")} - ${kupacOf(f)}.pdf`
      .replace(/[\\/:*?"<>|]+/g, " ")
      .replace(/\s+/g, " ");
  async function storePdf(f, bytes) {
    const path = pdfPath(f);
    const up = await db()
      .storage.from("fakture")
      .upload(path, new Blob([bytes], { type: "application/pdf" }), {
        contentType: "application/pdf",
        upsert: true,
        cacheControl: "60",
      });
    if (up.error) throw up.error;
    const r = await db().rpc("fak_pdf", { p_id: f.id, p_path: path });
    if (r.error) throw r.error;
    f.pdf_url = path;
  }
  function saveFile(data, name, type) {
    const blob =
      data instanceof Blob
        ? data
        : new Blob([data], { type: type || "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }
  /* sačuvan PDF iz Storage-a; ako ga nema, pravi se iz snapshot-a (isti izgled) i čuva */
  async function downloadPdf(f) {
    if (f.pdf_url) {
      const { data, error } = await db()
        .storage.from("fakture")
        .download(f.pdf_url);
      if (!error && data) return saveFile(data, fileName(f));
    }
    const bytes = await makePdf(f);
    try {
      await storePdf(f, bytes);
    } catch (e) {
      console.warn("[fakture] pdf nije sačuvan", e);
    }
    saveFile(bytes, fileName(f));
  }

  /* ---------- sheet (dijalog) u stilu OS-a ---------- */
  let sheetEl = null;
  function sheet(html, onSubmit, opts = {}) {
    closeSheet();
    const scrim = document.createElement("div");
    scrim.className = "scrim fk-scrim";
    scrim.innerHTML = `<form class="sheet fk-sheet${opts.wide ? " wide" : ""}" novalidate>${html}</form>`;
    document.body.appendChild(scrim);
    sheetEl = scrim;
    const form = scrim.firstChild;
    requestAnimationFrame(() => scrim.classList.add("open"));
    scrim.addEventListener("mousedown", (e) => {
      if (e.target === scrim) closeSheet();
    });
    form.addEventListener("click", (e) => {
      if (e.target.closest("[data-close]")) closeSheet();
    });
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = e.submitter || form.querySelector("[type=submit]");
      if (btn && btn.disabled) return;
      if (btn) btn.disabled = true;
      try {
        const keepOpen = await onSubmit(form, e.submitter);
        if (!keepOpen) closeSheet();
      } catch (err) {
        const er = form.querySelector(".fk-err");
        if (er) er.textContent = errText(err);
        else toast(errText(err));
        form.classList.remove("shake");
        void form.offsetWidth;
        form.classList.add("shake");
      } finally {
        if (btn) btn.disabled = false;
      }
    });
    const first = form.querySelector("[autofocus]");
    if (first && !matchMedia("(hover: none)").matches)
      setTimeout(() => first.focus(), 60);
    return form;
  }
  function closeSheet() {
    if (!sheetEl) return;
    const s = sheetEl;
    sheetEl = null;
    s.classList.remove("open");
    setTimeout(() => s.remove(), 220);
  }
  addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sheetEl) closeSheet();
  });
  const field = (name, label, val, o = {}) =>
    `<label class="fk-f${o.cls ? " " + o.cls : ""}"><span>${esc(label)}</span><input name="${name}" value="${esc(val ?? "")}"${o.type ? ` type="${o.type}"` : ""}${o.mode ? ` inputmode="${o.mode}"` : ""}${o.ph ? ` placeholder="${esc(o.ph)}"` : ""}${o.req ? " required" : ""}${o.auto ? " autofocus" : ""}${o.max ? ` maxlength="${o.max}"` : ""} autocomplete="off"></label>`;

  /* ---------- ruter modula ---------- */
  let cur = ""; // trenutna ruta modula
  let ed = null; // stanje forme (nacrt)
  let lostEd = null; // nesačuvana forma posle odlaska sa nje
  function setBack(go, label) {
    back.dataset.go = go;
    backLbl.textContent = label;
  }
  /* odlazak sa forme sa nesačuvanim izmenama: forma se pamti i vraća samo na "Vrati se" */
  function stash() {
    if (ed && ed.dirty) {
      const was = ed,
        key = cur;
      lostEd = null;
      toast(
        "Faktura nije sačuvana.",
        () => {
          lostEd = was;
          nav(key);
        },
        "Vrati se",
      );
    }
    ed = null;
    repaint = null;
  }
  function route(h) {
    if (cur === h && ed && ed.key === h) return; // ista forma: ne diraj otkucano
    if (cur !== h) {
      stash();
      scrollTo(0, 0);
    }
    ed = null;
    repaint = null;
    cur = h;
    closeMenu();
    root.classList.toggle("fk-quiet", quiet);
    if (!S.ready) {
      setBack("", "Dashboard");
      root.innerHTML = `<div class="fk-load"><i></i><i></i><i></i></div>`;
      load()
        .then(() => cur === h && location.hash.slice(1) === h && route(h))
        .catch((e) => {
          if (cur !== h) return;
          root.innerHTML = `<div class="state">${esc(errText(e))}<button class="pill" data-fk-retry>Probaj ponovo</button></div>`;
        });
      return;
    }
    if (h === "fakture" || h.startsWith("fakture~")) {
      const tab = h.slice(8) || "lista";
      setBack("", "Dashboard");
      if (tab === "klijenti") renderKlijenti();
      else if (tab === "podesavanja") renderSettings();
      else if (tab === "kpo") renderKpo();
      else renderList();
      fresher(h);
      return;
    }
    if (h.startsWith("fak-nova")) {
      setBack("fakture", "Fakture");
      const arg = h.slice(9);
      if (lostEd && lostEd.key === h) {
        ed = lostEd;
        lostEd = null;
        return renderEditor();
      }
      // ~k{klijent} = nova za klijenta, ~s{id} = ispravka stornirane, ~{id} = dupliraj
      ed = fresh(
        arg.startsWith("k")
          ? { klijent: arg.slice(1) }
          : arg.startsWith("s")
            ? { src: fkOf(arg.slice(1)), fix: true }
            : arg
              ? { src: fkOf(arg) }
              : {},
      );
      ed.key = h;
      return renderEditor();
    }
    if (h.startsWith("fak-")) {
      setBack("fakture", "Fakture");
      const f = fkOf(h.slice(4));
      if (!f) {
        root.innerHTML = `<div class="state">Ova faktura ne postoji.<button class="pill" data-go="fakture">Sve fakture</button></div>`;
        return;
      }
      if (f.status === "nacrt") {
        if (lostEd && lostEd.key === h) {
          ed = lostEd;
          lostEd = null;
        } else ed = fromDraft(f);
        ed.key = h;
        return renderEditor();
      }
      renderView(f);
      fresher(h);
    }
  }
  /* podaci starija od 20 s se tiho osveže (neko drugi iz tima je možda izdao fakturu) */
  function fresher(h) {
    if (Date.now() - (S.at || 0) < 20000) return;
    load(true)
      .then(() => {
        paintDash();
        if (cur === h && !ed && !sheetEl && !menuEl) rerender();
      })
      .catch(() => {});
  }
  root.addEventListener("click", (e) => {
    if (e.target.closest("[data-fk-retry]")) {
      loadP = null;
      route(cur);
    }
  });
  addEventListener("beforeunload", (e) => {
    if (ed && ed.dirty) {
      e.preventDefault();
      e.returnValue = "";
    }
  });

  /* zajedničko zaglavlje: naslov, kartice i "Nova faktura" */
  function head(tab) {
    const tabs = [
      ["lista", "Fakture", "fakture"],
      ["kpo", "KPO knjiga", "fakture~kpo"],
      ["klijenti", "Klijenti", "fakture~klijenti"],
      ["podesavanja", "Podešavanja", "fakture~podesavanja"],
    ];
    return `<div class="fk-hd">
      <h1>Fakture</h1>
      <button class="pill solid" data-go="fak-nova">${I.plus}Nova faktura</button>
    </div>
    <nav class="fk-tabs" aria-label="Fakture">${tabs
      .map(
        ([id, label, go]) =>
          `<button type="button" data-go="${go}"${id === tab ? ' class="on" aria-current="page"' : ""}>${label}</button>`,
      )
      .join("")}</nav>`;
  }
  const stLabel = (f) => {
    if (isStorno(f)) return ["storno", "Storno"];
    if (f.status === "nacrt") return ["nacrt", "Nacrt"];
    if (f.status === "placena") return ["placena", "Plaćena"];
    if (f.status === "stornirana") return ["stornirana", "Stornirana"];
    if (f.rok_placanja && f.rok_placanja < today()) {
      const n = D.days(f.rok_placanja, today());
      return ["kasni", `Kasni ${n} ${plural(n, "dan", "dana", "dana")}`];
    }
    return ["izdata", "Izdata"];
  };
  const badge = (f) => {
    const [c, t] = stLabel(f);
    return `<span class="fk-st ${c}">${esc(t)}</span>`;
  };

  /* ---------- lista: pregled (limiti, udeo klijenata), zbirovi, filteri, tabela ---------- */
  const F = { god: null, kl: "", st: "", q: "" }; // filteri (važe dok je OS otvoren)
  const isIssued = (f) => f.status !== "nacrt";
  const unpaid = (f) => f.status === "izdata" && !isStorno(f);
  const late = (f) => unpaid(f) && !!f.rok_placanja && f.rok_placanja < today();
  const total = (a) => a.reduce((s, f) => s + f.uk, 0);
  const whole = (p) => {
    const n = Math.round(p / 100);
    return (
      (n < 0 ? "-" : "") +
      String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".")
    );
  };
  const fmtPct = (p) =>
    (p > 0 && p < 10 ? p.toFixed(1).replace(".", ",") : String(Math.round(p))) +
    "%";
  /* promet za limite: izdate fakture i storno (minus) po datumu izdavanja, isto kao KPO.
     Faktura izdata unapred (datum posle danas) se odmah računa: upozorenje stiže ranije. */
  const promet = (from, to) =>
    total(
      S.fk.filter(
        (f) =>
          isIssued(f) &&
          f.datum_izdavanja >= from &&
          (!to || f.datum_izdavanja <= to),
      ),
    );
  const yearsOf = () =>
    [...new Set([yearOf(today()), ...S.fk.map((f) => f.godina)])].sort(
      (a, b) => b - a,
    );

  function meter(label, sub, val, lim) {
    const iz = S.iz || {},
      w1 = iz.upozorenje_1 ?? 80,
      w2 = iz.upozorenje_2 ?? 95;
    const p = lim > 0 ? (val / lim) * 100 : 0;
    const lvl = p >= w2 ? "crit" : p >= w1 ? "warn" : "ok";
    const rest =
      val > lim
        ? `Limit je prekoračen za ${whole(val - lim)} RSD`
        : `Ostalo ${whole(lim - val)} RSD`;
    const flag =
      lvl === "ok"
        ? ""
        : `<span class="fk-flag">${I.warn}${lvl === "crit" ? `Preko ${w2}%` : `Preko ${w1}%`} limita</span>`;
    return `<div class="fk-meter ${lvl}">
      <div class="fk-meter-h"><span class="l">${label}<small>${sub}</small></span><span class="p">${fmtPct(p)}</span></div>
      <div class="fk-meter-t" role="meter" aria-valuemin="0" aria-valuemax="${Math.round(lim / 100)}" aria-valuenow="${Math.round(val / 100)}" aria-label="${esc(label)}: ${whole(val)} od ${whole(lim)} RSD" title="${whole(val)} od ${whole(lim)} RSD"><i style="width:${Math.min(100, Math.max(0, p)).toFixed(2)}%"></i></div>
      <div class="fk-meter-f"><span><b>${whole(val)}</b> / ${whole(lim)} RSD</span>${flag || `<span>${rest}</span>`}</div>
    </div>`;
  }
  function overview() {
    const t = today(),
      god = yearOf(t),
      iz = S.iz || {};
    const yearVal = promet(god + "-01-01", god + "-12-31");
    const from12 = iso(
      new Date(+t.slice(0, 4) - 1, +t.slice(5, 7) - 1, +t.slice(8, 10) + 1),
    );
    const val12 = promet(from12, null);
    const by = new Map();
    S.fk
      .filter((f) => isIssued(f) && f.godina === god)
      .forEach((f) => by.set(f.klijent_id, (by.get(f.klijent_id) || 0) + f.uk));
    const all = [...by.entries()]
      .filter(([, v]) => v > 0)
      .sort((a, b) => b[1] - a[1]);
    const sumAll = all.reduce((s, [, v]) => s + v, 0);
    const top = all.slice(0, 5);
    if (all.length > 5)
      top.push(["__ostali", all.slice(5).reduce((s, [, v]) => s + v, 0)]);
    const share = top.length
      ? `<ol class="fk-share">${top
          .map(([id, v]) => {
            const p = sumAll ? (v / sumAll) * 100 : 0;
            const name =
              id === "__ostali" ? "Ostali" : (klOf(id) || {}).naziv || "—";
            return `<li title="${esc(name)}: ${money(v)} RSD"><span class="n">${esc(name)}</span><span class="v">${fmtPct(p)}</span><span class="b"><i style="width:${p.toFixed(2)}%"></i></span></li>`;
          })
          .join("")}</ol>`
      : `<p class="fk-none">Još nema izdatih faktura u ${god}.</p>`;
    return `<section class="fk-ov" aria-label="Pregled">
      <div class="fk-ov-m">
        ${meter("Paušal", `${god}. godina`, yearVal, D.toPara(iz.limit_pausal ?? 6000000))}
        ${meter("PDV", "poslednjih 12 meseci", val12, D.toPara(iz.limit_pdv ?? 8000000))}
      </div>
      <div class="fk-ov-s"><h2>Prihod po klijentu <small>${god}.</small></h2>${share}</div>
    </section>`;
  }
  function tiles(rows) {
    const iss = rows.filter(isIssued),
      paid = rows.filter((f) => f.status === "placena"),
      open = rows.filter(unpaid),
      lt = open.filter(late);
    const cnt = (n) => `${n} ${plural(n, "faktura", "fakture", "faktura")}`;
    return `<div class="fk-tiles">
      <div class="fk-tile"><span>Izdato</span><b>${money(total(iss))}</b><small>${cnt(iss.filter((f) => !isStorno(f)).length)}${iss.some(isStorno) ? " · sa stornom" : ""}</small></div>
      <div class="fk-tile"><span>Plaćeno</span><b>${money(total(paid))}</b><small>${cnt(paid.length)}</small></div>
      <div class="fk-tile${lt.length ? " late" : ""}"><span>Neplaćeno</span><b>${money(total(open))}</b><small>${lt.length ? `${I.warn}${lt.length} ${plural(lt.length, "kasni", "kasne", "kasni")} · ${money(total(lt))}` : cnt(open.length)}</small></div>
    </div>`;
  }
  const ST = [
    ["", "Svi statusi"],
    ["nacrt", "Nacrti"],
    ["neplacene", "Neplaćene"],
    ["kasne", "Kasne"],
    ["placene", "Plaćene"],
    ["stornirane", "Stornirane i storno"],
  ];
  const stOk = (f, st) =>
    !st ||
    (st === "nacrt" && f.status === "nacrt") ||
    (st === "neplacene" && unpaid(f)) ||
    (st === "kasne" && late(f)) ||
    (st === "placene" && f.status === "placena") ||
    (st === "stornirane" && (f.status === "stornirana" || isStorno(f)));
  function filtered() {
    const q = fold(F.q.trim());
    return S.fk.filter(
      (f) =>
        (!F.god || f.godina === F.god) &&
        (!F.kl || f.klijent_id === F.kl) &&
        stOk(f, F.st) &&
        (!q || fold(f.broj).includes(q) || fold(kupacOf(f)).includes(q)),
    );
  }
  function renderList() {
    if (F.god === null) F.god = yearOf(today());
    const opt = (v, l, sel) =>
      `<option value="${esc(v)}"${String(v) === String(sel) ? " selected" : ""}>${esc(l)}</option>`;
    const kls = S.kl.filter(
      (k) => !k.arhiviran || S.fk.some((f) => f.klijent_id === k.id),
    );
    root.innerHTML =
      head("lista") +
      (S.fk.length
        ? overview() +
          `<div class="fk-filt" role="search">
            <select class="fk-sel" data-f="god" aria-label="Godina">${opt("", "Sve godine", F.god || "")}${yearsOf()
              .map((y) => opt(y, y + ".", F.god))
              .join("")}</select>
            <select class="fk-sel" data-f="kl" aria-label="Klijent">${opt("", "Svi klijenti", F.kl)}${kls
              .map((k) => opt(k.id, k.naziv, F.kl))
              .join("")}</select>
            <select class="fk-sel" data-f="st" aria-label="Status">${ST.map(([v, l]) => opt(v, l, F.st)).join("")}</select>
            <label class="fk-q"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg><input type="search" data-f="q" value="${esc(F.q)}" placeholder="Broj ili klijent" aria-label="Pretraži fakture" autocomplete="off"></label>
          </div>
          <div id="fkTiles"></div>
          <div id="fkRows"></div>`
        : `<div class="state">Još nema faktura.<button class="pill solid" data-go="fak-nova">${I.plus}Nova faktura</button></div>`);
    if (S.fk.length) paintRows();
  }
  /* zbirovi prate godinu i klijenta; tabela i status i pretragu */
  function paintRows() {
    const box = $("#fkRows");
    if (!box) return;
    const base = S.fk.filter(
      (f) => (!F.god || f.godina === F.god) && (!F.kl || f.klijent_id === F.kl),
    );
    $("#fkTiles").innerHTML = tiles(base);
    const rows = filtered();
    box.innerHTML = rows.length
      ? `<div class="fk-tbl" role="table" aria-label="Fakture">
          <div class="fk-tr fk-th" role="row"><span>Broj</span><span>Datum</span><span>Klijent</span><span class="r">Iznos</span><span>Status</span><span>Rok plaćanja</span><span></span></div>
          ${rows
            .map((f, i) => {
              const [c] = stLabel(f);
              return `<div class="fk-tr ${c}" role="row" data-open="${esc(f.id)}" tabindex="0" style="animation-delay:${adl(0.06 + Math.min(i, 12) * 0.03)}s">
                <span class="b">${esc(f.broj)}</span>
                <span class="d">${esc(D.date(f.datum_izdavanja))}</span>
                <span class="k">${esc(kupacOf(f))}</span>
                <span class="r a">${money(f.uk)}</span>
                <span>${badge(f)}</span>
                <span class="d rok">${isStorno(f) ? "—" : esc(D.date(f.rok_placanja)) || "—"}</span>
                <span class="acts">${
                  isIssued(f)
                    ? `<button class="fk-ib" data-pdf="${esc(f.id)}" title="Preuzmi PDF" aria-label="Preuzmi PDF ${esc(f.broj)}">${I.dl}</button>`
                    : ""
                }<button class="fk-ib" data-menu="${esc(f.id)}" title="Još" aria-label="Radnje za ${esc(f.broj)}" aria-haspopup="menu">${I.more}</button></span>
              </div>`;
            })
            .join("")}
        </div>`
      : `<div class="fk-empty">Nijedna faktura ne odgovara filterima.<button class="pill sm" data-clear-f>Poništi filtere</button></div>`;
  }
  root.addEventListener("input", (e) => {
    const t = e.target.closest("[data-f]");
    if (!t || !$("#fkRows")) return;
    const k = t.dataset.f;
    F[k] = k === "god" ? (t.value ? +t.value : 0) : t.value;
    // filter i pretraga: redovi se menjaju bez ulazne animacije (nema treptanja dok se kuca)
    $("#fkRows").classList.add("fk-quiet");
    $("#fkTiles").classList.add("fk-quiet");
    paintRows();
  });
  root.addEventListener("click", (e) => {
    if (e.target.closest("[data-clear-f]")) {
      F.kl = F.st = F.q = "";
      return rerender();
    }
    const p = e.target.closest("[data-pdf]");
    if (p) {
      e.stopPropagation();
      const f = fkOf(p.dataset.pdf);
      if (f) busy(p, () => downloadPdf(f));
      return;
    }
    const m = e.target.closest("[data-menu]");
    if (m) {
      e.stopPropagation();
      const f = fkOf(m.dataset.menu);
      if (f) openMenu(m, f);
      return;
    }
    const a = e.target.closest("[data-act]");
    if (a) {
      const f = fkOf(a.dataset.id);
      if (f) act(a.dataset.act, f, a);
      return;
    }
    const o = e.target.closest("[data-open]");
    if (o && !e.target.closest("button, select, input, a"))
      nav("fak-" + o.dataset.open);
  });
  root.addEventListener("keydown", (e) => {
    const o = e.target.closest && e.target.closest("[data-open]");
    if (o && e.target === o && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      nav("fak-" + o.dataset.open);
    }
  });
  async function busy(btn, fn) {
    if (btn.classList.contains("busy")) return;
    btn.classList.add("busy");
    btn.setAttribute("aria-busy", "true");
    try {
      await fn();
    } catch (e) {
      console.error(e);
      toast(errText(e));
    } finally {
      btn.classList.remove("busy");
      btn.removeAttribute("aria-busy");
    }
  }

  /* ---------- radnje nad fakturom (meni u listi i dugmad na pregledu) ---------- */
  function actsOf(f) {
    if (f.status === "nacrt")
      return [
        ["open", I.edit, "Otvori nacrt"],
        ["del", I.trash, "Obriši nacrt", "danger"],
      ];
    const out = [["pdf", I.dl, "Preuzmi PDF"]];
    const del = canDel(f) && ["del", I.trash, "Obriši fakturu", "danger"];
    if (isStorno(f)) return del ? [...out, del] : out;
    if (f.status === "izdata")
      out.push(["paid", I.check, "Označi kao plaćenu"]);
    if (f.status === "placena")
      out.push(["unpaid", I.undo, "Vrati na neplaćenu"]);
    if (f.status === "stornirana")
      out.push(["fix", I.copy, "Napravi ispravljenu fakturu"]);
    else out.push(["dup", I.copy, "Dupliraj u novu fakturu"]);
    if (f.status === "izdata" || f.status === "placena")
      out.push(["storno", I.storno, "Storniraj", "danger"]);
    if (del) out.push(del);
    return out;
  }
  /* izdata se briše samo ako je poslednja izdata u godini (bez rupe u brojevima) i nije na SEF-u;
     ista pravila proverava i fak_obrisi u bazi */
  const canDel = (f) =>
    f.status !== "nacrt" &&
    f.status !== "stornirana" &&
    !f.sef_status &&
    !S.fk.some(
      (x) =>
        x.godina === f.godina &&
        x.redni_broj > f.redni_broj &&
        x.status !== "nacrt",
    );
  let menuEl = null;
  function closeMenu() {
    if (!menuEl) return;
    const m = menuEl;
    menuEl = null;
    m.remove();
  }
  function openMenu(btn, f) {
    const same = menuEl && menuEl.dataset.for === f.id;
    closeMenu();
    if (same) return;
    const m = document.createElement("div");
    m.className = "fk-menu";
    m.setAttribute("role", "menu");
    m.dataset.for = f.id;
    m.innerHTML = actsOf(f)
      .map(
        ([a, ic, label, cls]) =>
          `<button type="button" role="menuitem" class="${cls || ""}" data-act="${a}" data-id="${esc(f.id)}">${ic}<span>${label}</span></button>`,
      )
      .join("");
    document.body.appendChild(m);
    menuEl = m;
    const r = btn.getBoundingClientRect(),
      w = m.offsetWidth,
      h = m.offsetHeight;
    const below = r.bottom + 6 + h < innerHeight - 8;
    m.style.left =
      Math.max(8, Math.min(r.right - w, innerWidth - w - 8)) + "px";
    m.style.top = (below ? r.bottom + 6 : Math.max(8, r.top - 6 - h)) + "px";
    m.addEventListener("click", (e) => {
      const a = e.target.closest("[data-act]");
      if (!a) return;
      closeMenu();
      act(a.dataset.act, fkOf(a.dataset.id), btn);
    });
    const first = m.querySelector("button");
    if (first) first.focus({ preventScroll: true });
  }
  addEventListener(
    "pointerdown",
    (e) => {
      if (
        menuEl &&
        !menuEl.contains(e.target) &&
        !e.target.closest("[data-menu]")
      )
        closeMenu();
    },
    true,
  );
  addEventListener("keydown", (e) => {
    if (!menuEl) return;
    if (e.key === "Escape") return closeMenu();
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const b = [...menuEl.querySelectorAll("button")],
        i = b.indexOf(document.activeElement);
      b[(i + (e.key === "ArrowDown" ? 1 : -1) + b.length) % b.length].focus();
    }
  });
  addEventListener("scroll", closeMenu, { passive: true });
  addEventListener("resize", closeMenu, { passive: true });

  function act(a, f, btn) {
    if (!f) return;
    if (a === "open") return nav("fak-" + f.id);
    if (a === "pdf") return busy(btn, () => downloadPdf(f));
    if (a === "dup") return nav("fak-nova~" + f.id);
    if (a === "fix") return nav("fak-nova~s" + f.id);
    if (a === "paid") return paidSheet(f);
    if (a === "unpaid") return busy(btn, () => setPaid(f, null));
    if (a === "storno") return stornoSheet(f);
    if (a === "del")
      return f.status === "nacrt" ? deleteDraft(f) : deleteIssued(f);
  }
  /* posle izmene: isti ekran se iscrta bez ulaznih animacija */
  let quiet = false;
  function rerender() {
    quiet = true;
    try {
      route(cur);
    } finally {
      quiet = false;
    }
  }
  async function setPaid(f, d) {
    const r = await db().rpc("fak_placena", { p_id: f.id, p_datum: d });
    if (r.error) throw r.error;
    keep(r.data);
    rerender();
    paintDash();
    if (d)
      toast(
        `Faktura ${f.broj} je plaćena.`,
        () => setPaid(f, null).catch((e) => toast(errText(e))),
        "Poništi",
      );
    else toast(`Faktura ${f.broj} je ponovo neplaćena.`);
  }
  function paidSheet(f) {
    sheet(
      `<h3>Plaćena faktura ${esc(f.broj)}</h3>
       <div class="fk-sum"><span>${esc(kupacOf(f))}</span><b>${money(f.uk)} RSD</b></div>
       <label class="fk-f"><span>Datum uplate</span><input name="d" type="date" value="${today()}" required></label>
       <p class="fk-err"></p>
       <div class="row2"><button type="button" class="pill" data-close>Otkaži</button><button type="submit" class="pill solid">${I.check}Označi kao plaćenu</button></div>`,
      async (form) => {
        const d = form.elements.d.value;
        if (!d) throw { code: "P0001", message: "Upiši datum uplate." };
        await setPaid(f, d);
      },
    );
  }
  function stornoSheet(f) {
    const d0 = today() < f.datum_izdavanja ? f.datum_izdavanja : today();
    const nextOf = (d) => brojOf(nextNo(yearOf(d)), yearOf(d));
    const form = sheet(
      `<h3>Storniraj fakturu ${esc(f.broj)}?</h3>
       <p>Pravi se storno dokument <b class="fk-sno">${esc(nextOf(d0))}</b> na <b>${money(-f.uk)} RSD</b>. Faktura ${esc(f.broj)} ostaje u KPO knjizi, a storno je poništava, pa je prihod od nje nula.</p>
       ${f.status === "placena" ? `<p class="fk-msg w">${I.warn}Faktura je označena kao plaćena. Povraćaj novca kupcu se radi posebno.</p>` : ""}
       <label class="fk-f"><span>Datum storna</span><input name="d" type="date" value="${d0}" min="${esc(f.datum_izdavanja)}" required></label>
       <p class="fk-err"></p>
       <div class="row2 fk-row3"><button type="button" class="pill" data-close>Otkaži</button><button type="submit" class="pill danger" value="only">Samo storniraj</button><button type="submit" class="pill solid" value="new">Storniraj i napravi novu</button></div>`,
      async (form, sub) => {
        const d = form.elements.d.value;
        if (!d) throw { code: "P0001", message: "Upiši datum storna." };
        if (d < f.datum_izdavanja)
          throw {
            code: "P0001",
            message: "Storno ne može biti pre datuma fakture.",
          };
        await doStorno(f, d, sub && sub.value === "new");
      },
    );
    form.elements.d.addEventListener("change", (e) => {
      if (e.target.value)
        $(".fk-sno", form).textContent = nextOf(e.target.value);
    });
  }
  async function doStorno(f, d, andNew) {
    pdfLib().catch(() => {});
    const r = await db().rpc("fak_storniraj", { p_id: f.id, p_datum: d });
    if (r.error) throw r.error;
    const s = keep(r.data);
    const o = fkOf(f.id);
    if (o) o.status = "stornirana";
    let bytes = null;
    try {
      bytes = await makePdf(s);
      await storePdf(s, bytes);
    } catch (e) {
      console.error("[fakture] storno pdf", e);
    }
    if (bytes) saveFile(bytes, fileName(s));
    closeSheet();
    paintDash();
    nav(andNew ? "fak-nova~s" + f.id : "fak-" + s.id);
    toast(`Storno ${s.broj} je izdat. Faktura ${f.broj} je stornirana.`);
    load(true).catch(() => {});
  }

  /* ---------- forma: nova faktura / nacrt ---------- */
  const stavkaIn = (s) => ({
    opis: s.opis || "",
    jedinica_mere: s.jedinica_mere || "",
    vrsta: s.vrsta || "usluga",
    kolS: D.qty(Math.abs(s.kol)),
    cenaS: money(Math.abs(s.cena)),
  });
  function clientDefaults(st, touched) {
    const k = klOf(st.klijent_id);
    const prev = lastFor(st.klijent_id, st.id);
    if (!touched.promet) {
      if (prev && prev.datum_prometa_do) {
        const od = addDays(prev.datum_prometa_do, 1);
        st.datum_prometa_od = od;
        st.datum_prometa_do = od > st.datum_izdavanja ? od : st.datum_izdavanja;
      } else st.datum_prometa_od = st.datum_prometa_do = st.datum_izdavanja;
    }
    if (!touched.rok)
      st.rok_placanja = addDays(st.datum_izdavanja, k ? k.rok_placanja : 8);
    if (!touched.stavke) {
      const src = st.src || prev;
      st.stavke =
        src && src.stavke.length
          ? src.stavke.map(stavkaIn)
          : [
              {
                opis: (k && k.opis_usluge) || "",
                jedinica_mere: (k && k.jedinica_mere) || "usluga",
                vrsta: "usluga",
                kolS: "1",
                cenaS: "",
              },
            ];
    }
  }
  function fresh({ klijent, src, fix }) {
    const t = today();
    const active = S.kl.filter((k) => !k.arhiviran);
    const last = S.fk.find(
      (f) =>
        !isStorno(f) && klOf(f.klijent_id) && !klOf(f.klijent_id).arhiviran,
    );
    const kid =
      (klijent && klOf(klijent) && klijent) ||
      (src && src.klijent_id) ||
      (last && last.klijent_id) ||
      (active[0] && active[0].id) ||
      null;
    const st = {
      id: null,
      klijent_id: kid,
      redni_broj: nextNo(yearOf(t)),
      datum_izdavanja: t,
      mesto_izdavanja: (S.iz && S.iz.mesto_izdavanja) || "",
      napomene: "",
      src: src || null,
      touched: {},
      dirty: false,
    };
    clientDefaults(st, st.touched);
    if (src && fix) {
      // ispravka stornirane fakture: isti period prometa
      st.datum_prometa_od = src.datum_prometa_od || st.datum_prometa_od;
      st.datum_prometa_do = src.datum_prometa_do || st.datum_prometa_do;
    }
    st.poziv_na_broj = brojOf(st.redni_broj, yearOf(t));
    return st;
  }
  function fromDraft(f) {
    return {
      id: f.id,
      klijent_id: f.klijent_id,
      redni_broj: f.redni_broj,
      datum_izdavanja: f.datum_izdavanja,
      mesto_izdavanja: f.mesto_izdavanja || "",
      datum_prometa_od: f.datum_prometa_od || "",
      datum_prometa_do: f.datum_prometa_do || "",
      rok_placanja: f.rok_placanja || "",
      poziv_na_broj: f.poziv_na_broj || "",
      napomene: f.napomene || "",
      stavke: f.stavke.length
        ? f.stavke.map(stavkaIn)
        : [
            {
              opis: "",
              jedinica_mere: "usluga",
              vrsta: "usluga",
              kolS: "1",
              cenaS: "",
            },
          ],
      touched: {
        promet: true,
        rok: true,
        stavke: true,
        poziv: f.poziv_na_broj !== f.broj,
        broj: true,
      },
      dirty: false,
    };
  }
  /* izračunate vrednosti forme + greške (blokiraju) i upozorenja (ne blokiraju) */
  function calc(st) {
    const god = yearOf(st.datum_izdavanja);
    const items = st.stavke.map((s) => {
      const kol = parseQty(s.kolS),
        cena = parseMoney(s.cenaS);
      // prazno polje je 0 (prazna stavka se preskače), a pogrešno upisano je greška
      const ok =
        (kol === null || Number.isFinite(kol)) &&
        (cena === null || Number.isFinite(cena));
      return {
        ...s,
        kol: kol ?? 0,
        cena: cena ?? 0,
        iznos: ok ? D.lineTotal(kol ?? 0, cena ?? 0) : 0,
        bad: !ok,
        empty: s.opis.trim() === "" && cena == null,
      };
    });
    const total = items.reduce((a, s) => a + s.iznos, 0);
    const save = [], // sprečava i nacrt
      issue = [], // sprečava izdavanje
      warn = [];
    if (!st.klijent_id) save.push("Izaberi klijenta.");
    if (!st.datum_izdavanja) save.push("Upiši datum izdavanja.");
    if (!(st.redni_broj >= 1)) save.push("Upiši broj fakture.");
    else {
      const others = S.fk.filter((f) => f.godina === god && f.id !== st.id);
      if (others.some((f) => f.redni_broj === st.redni_broj))
        save.push(`Faktura ${brojOf(st.redni_broj, god)} već postoji.`);
      else {
        const max = others.reduce((m, f) => Math.max(m, f.redni_broj), 0);
        if (st.redni_broj > max + 1)
          warn.push(
            max
              ? `Broj preskače redosled: poslednja u ${god}. je ${brojOf(max, god)}, sledeća bi bila ${brojOf(max + 1, god)}.`
              : `Broj preskače redosled: prva faktura u ${god}. bi bila ${brojOf(1, god)}.`,
          );
      }
    }
    if (
      st.datum_prometa_od &&
      st.datum_prometa_do &&
      st.datum_prometa_od > st.datum_prometa_do
    )
      save.push("Datum prometa „od“ je posle datuma „do“.");
    const pd = st.datum_prometa_do || st.datum_prometa_od;
    if (pd && st.datum_izdavanja && pd > st.datum_izdavanja)
      warn.push("Datum prometa je posle datuma izdavanja.");
    if (
      st.rok_placanja &&
      st.datum_izdavanja &&
      st.rok_placanja < st.datum_izdavanja
    )
      issue.push("Rok plaćanja je pre datuma izdavanja.");
    items.forEach((s, i) => {
      if (s.bad) save.push(`Stavka ${i + 1}: proveri količinu i cenu.`);
      else if (s.empty) return;
      else if (!s.opis.trim()) issue.push(`Stavka ${i + 1}: upiši opis.`);
      else if (!s.kol) issue.push(`Stavka ${i + 1}: količina ne može biti 0.`);
    });
    if (!items.some((s) => !s.empty)) issue.push("Dodaj bar jednu stavku.");
    else if (total <= 0) issue.push("Iznos za uplatu mora biti veći od nule.");
    return { god, items, total, save, issue: save.concat(issue), warn };
  }
  /* faktura kakva bi bila izdata sada (za pregled) */
  function asFaktura(st, c) {
    return {
      status: "nacrt",
      broj: brojOf(st.redni_broj, c.god),
      klijent_id: st.klijent_id,
      datum_izdavanja: st.datum_izdavanja,
      mesto_izdavanja: st.mesto_izdavanja,
      datum_prometa_od: st.datum_prometa_od,
      datum_prometa_do: st.datum_prometa_do,
      rok_placanja: st.rok_placanja,
      poziv_na_broj: st.poziv_na_broj,
      napomene: st.napomene,
      stavke: c.items.filter((s) => !s.empty),
    };
  }

  const klOptions = (sel) => {
    const list = S.kl.filter((k) => !k.arhiviran || k.id === sel);
    return (
      (sel
        ? ""
        : `<option value="" selected disabled>Izaberi klijenta</option>`) +
      list
        .map(
          (k) =>
            `<option value="${esc(k.id)}"${k.id === sel ? " selected" : ""}>${esc(k.naziv)}</option>`,
        )
        .join("") +
      `<option value="__new">+ Novi klijent…</option>`
    );
  };
  const klLine = (k) =>
    k
      ? [
          [k.adresa, k.mesto].filter(Boolean).join(", "),
          k.pib && "PIB " + k.pib,
        ]
          .filter(Boolean)
          .join(" · ")
      : "";
  const stavkaRow = (s, i, n) => `<div class="fk-it" data-i="${i}">
      <span class="fk-it-n">${i + 1}.</span>
      <label class="fk-f fk-it-opis"><span>Opis usluge</span><textarea name="opis" rows="1" placeholder="Opis usluge">${esc(s.opis)}</textarea></label>
      <label class="fk-f fk-it-jm"><span>Jed. mere</span><input name="jedinica_mere" value="${esc(s.jedinica_mere)}" list="fkJm" autocomplete="off"></label>
      <label class="fk-f fk-it-kol"><span>Kol.</span><input name="kolS" value="${esc(s.kolS)}" inputmode="decimal" autocomplete="off"></label>
      <label class="fk-f fk-it-cena"><span>Cena (RSD)</span><input name="cenaS" value="${esc(s.cenaS)}" inputmode="decimal" placeholder="0,00" autocomplete="off"></label>
      <span class="fk-it-iz" aria-label="Iznos"></span>
      ${n > 1 ? `<button type="button" class="fk-ib fk-it-x" data-del-item="${i}" title="Ukloni stavku" aria-label="Ukloni stavku ${i + 1}">${I.x}</button>` : '<span class="fk-it-x"></span>'}
    </div>`;

  const edHead = (st) =>
    `<h1>${st.id ? "Nacrt fakture" : "Nova faktura"}</h1>` +
    (st.id
      ? badge({ status: "nacrt" }) +
        `<button type="button" class="fk-ib fk-del" data-del-draft title="Obriši nacrt" aria-label="Obriši nacrt">${I.trash}</button>`
      : "");
  function renderEditor() {
    const st = ed;
    const god = yearOf(st.datum_izdavanja);
    const k = klOf(st.klijent_id);
    root.innerHTML = `
    <div class="fk-ed">
      <form class="fk-form" id="fkForm" novalidate autocomplete="off">
        <div class="fk-ed-hd" id="fkEdHd">${edHead(st)}</div>
        <section class="fk-sec">
          <label class="fk-f fk-kl"><span>Kupac</span><select name="klijent_id">${klOptions(st.klijent_id)}</select></label>
          <p class="fk-kl-l" id="fkKlL">${esc(klLine(k))}</p>
        </section>
        <section class="fk-sec fk-g2">
          <label class="fk-f"><span>Broj fakture</span><span class="fk-no"><input name="redni_broj" value="${st.redni_broj ? pad2(st.redni_broj) : ""}" inputmode="numeric" maxlength="5" autocomplete="off"><b id="fkGod">/${god}</b></span></label>
          <label class="fk-f"><span>Datum izdavanja</span><input name="datum_izdavanja" type="date" value="${esc(st.datum_izdavanja)}"></label>
          <label class="fk-f"><span>Promet od</span><input name="datum_prometa_od" type="date" value="${esc(st.datum_prometa_od || "")}"></label>
          <label class="fk-f"><span>Promet do</span><input name="datum_prometa_do" type="date" value="${esc(st.datum_prometa_do || "")}"></label>
          <label class="fk-f"><span>Rok plaćanja <em id="fkRokN"></em></span><input name="rok_placanja" type="date" value="${esc(st.rok_placanja || "")}"></label>
          <label class="fk-f"><span>Mesto izdavanja</span><input name="mesto_izdavanja" value="${esc(st.mesto_izdavanja)}" autocomplete="off"></label>
          <label class="fk-f fk-span2"><span>Poziv na broj</span><input name="poziv_na_broj" value="${esc(st.poziv_na_broj)}" autocomplete="off"></label>
        </section>
        <section class="fk-sec">
          <div class="fk-sec-h"><h2>Stavke</h2></div>
          <div class="fk-items" id="fkItems"></div>
          <button type="button" class="pill fk-add" data-add-item>${I.plus}Dodaj stavku</button>
          <datalist id="fkJm"><option value="usluga"><option value="sat"><option value="mesec"><option value="kom"><option value="paušal"></datalist>
        </section>
        <section class="fk-sec">
          <label class="fk-f"><span>Dodatna napomena (nije obavezna)</span><textarea name="napomene" rows="2" placeholder="Prikazuje se ispod fiksnih napomena">${esc(st.napomene)}</textarea></label>
        </section>
        <div class="fk-msgs" id="fkMsgs" aria-live="polite"></div>
        <div class="fk-bar">
          <div class="fk-tot"><span>Ukupno za uplatu</span><b id="fkTot"></b></div>
          <div class="fk-bar-b">
            <button type="button" class="pill" data-save>Sačuvaj nacrt</button>
            <button type="button" class="pill solid" data-issue>${I.send}Izdaj</button>
          </div>
        </div>
      </form>
      <aside class="fk-prev" aria-label="Pregled fakture"><div class="fk-pages" id="fkPrev"></div></aside>
    </div>`;
    paintItems();
    fitNo($("[name=redni_broj]"));
    update();
    repaint = () => update(true);
    const f = $("#fkForm");
    f.addEventListener("input", onInput);
    f.addEventListener("change", onChange);
    f.addEventListener("focusout", onBlur);
    f.addEventListener("click", onClick);
    f.addEventListener("keydown", (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        saveDraft();
      }
    });
  }
  /* polje broja je široko koliko i broj, pa "/2026" stoji odmah uz njega */
  function fitNo(t) {
    if (t) t.style.width = `calc(${Math.max(2, t.value.length)}ch + 16px)`;
  }
  function paintItems() {
    const box = $("#fkItems");
    if (!box) return;
    box.innerHTML = ed.stavke
      .map((s, i) => stavkaRow(s, i, ed.stavke.length))
      .join("");
    $$("textarea[name=opis]", box).forEach(grow);
  }
  function grow(t) {
    t.style.height = "auto";
    t.style.height = t.scrollHeight + 2 + "px";
  }
  let prevQ = false;
  function update(now) {
    if (!ed) return;
    const c = calc(ed);
    $("#fkTot").textContent = money(c.total) + " RSD";
    $("#fkGod").textContent = "/" + c.god;
    $$(".fk-it").forEach((row, i) => {
      const s = c.items[i];
      if (!s) return;
      row.querySelector(".fk-it-iz").textContent = s.bad ? "—" : money(s.iznos);
      row.classList.toggle("empty", s.empty);
      row.classList.toggle("bad", s.bad);
    });
    const n =
      ed.rok_placanja && ed.datum_izdavanja
        ? D.days(ed.datum_izdavanja, ed.rok_placanja)
        : null;
    $("#fkRokN").textContent =
      n == null
        ? ""
        : n > 0
          ? `${n} ${D.danaWord(n)}`
          : n === 0
            ? "isti dan"
            : "";
    $("#fkKlL").textContent = klLine(klOf(ed.klijent_id));
    const msgs = [
      ...c.save.map((m) => ["e", m]),
      ...c.issue
        .filter((m) => !c.save.includes(m) && ed.tried)
        .map((m) => ["e", m]),
      ...c.warn.map((m) => ["w", m]),
    ];
    $("#fkMsgs").innerHTML = msgs
      .map(
        ([t, m]) =>
          `<p class="fk-msg ${t}">${t === "w" ? I.warn : ""}${esc(m)}</p>`,
      )
      .join("");
    const draw = () => {
      prevQ = false;
      const box = $("#fkPrev");
      if (box && ed) box.innerHTML = pagesHtml(asFaktura(ed, calc(ed)));
    };
    if (now) draw();
    else if (!prevQ) {
      prevQ = true;
      requestAnimationFrame(draw);
    }
  }
  function onInput(e) {
    const t = e.target,
      st = ed;
    if (!st || !t.name) return;
    st.dirty = true;
    const row = t.closest(".fk-it");
    if (row) {
      st.stavke[+row.dataset.i][t.name] = t.value;
      st.touched.stavke = true;
      if (t.tagName === "TEXTAREA") grow(t);
      return update();
    }
    if (t.name === "redni_broj") {
      st.redni_broj = parseInt(t.value.replace(/\D/g, ""), 10) || 0;
      fitNo(t);
      st.touched.broj = true;
      if (!st.touched.poziv) {
        st.poziv_na_broj = brojOf(st.redni_broj, yearOf(st.datum_izdavanja));
        $("[name=poziv_na_broj]").value = st.poziv_na_broj;
      }
    } else if (t.name === "poziv_na_broj") {
      st.poziv_na_broj = t.value;
      st.touched.poziv = true;
    } else if (t.name === "mesto_izdavanja" || t.name === "napomene")
      st[t.name] = t.value;
    else if (t.type === "date") return; // datumi se primenjuju na change (dok se kuca, vrednost je prazna)
    update();
  }
  function onChange(e) {
    const t = e.target,
      st = ed;
    if (!st || !t.name) return;
    if (t.name === "klijent_id") {
      if (t.value === "__new") {
        t.value = st.klijent_id || "";
        return klijentSheet(null, (k) => {
          st.klijent_id = k.id;
          st.dirty = true;
          clientDefaults(
            st,
            st.id ? { ...st.touched, stavke: true } : st.touched,
          );
          renderEditor();
        });
      }
      st.klijent_id = t.value;
      st.dirty = true;
      st.src = null;
      clientDefaults(st, st.touched);
      // posle promene klijenta prepiši polja koja zavise od njega
      for (const n of ["datum_prometa_od", "datum_prometa_do", "rok_placanja"])
        $(`[name=${n}]`).value = st[n] || "";
      if (!st.touched.stavke) paintItems();
      return update();
    }
    if (t.type === "date") {
      st.dirty = true;
      const v = t.value;
      if (t.name === "datum_izdavanja") {
        if (!v) return update();
        const oldGod = yearOf(st.datum_izdavanja);
        st.datum_izdavanja = v;
        const god = yearOf(v);
        if (god !== oldGod && !st.touched.broj) {
          st.redni_broj = nextNo(god, st.id);
          $("[name=redni_broj]").value = st.redni_broj;
        }
        if (!st.touched.poziv) {
          st.poziv_na_broj = brojOf(st.redni_broj, god);
          $("[name=poziv_na_broj]").value = st.poziv_na_broj;
        }
        if (!st.touched.rok) {
          const k = klOf(st.klijent_id);
          st.rok_placanja = addDays(v, k ? k.rok_placanja : 8);
          $("[name=rok_placanja]").value = st.rok_placanja;
        }
      } else {
        st[t.name] = v;
        if (t.name === "rok_placanja") st.touched.rok = true;
        else st.touched.promet = true;
      }
      return update();
    }
  }
  /* iznos se formatira kad se izađe iz polja: 383265 -> 383.265,00 */
  function onBlur(e) {
    const t = e.target,
      row = t.closest && t.closest(".fk-it");
    if (t.name === "redni_broj" && ed && ed.redni_broj)
      fitNo(Object.assign(t, { value: pad2(ed.redni_broj) }));
    if (!row || !ed) return;
    const s = ed.stavke[+row.dataset.i];
    if (t.name === "cenaS") {
      const p = parseMoney(t.value);
      if (Number.isFinite(p)) t.value = s.cenaS = money(p);
    } else if (t.name === "kolS") {
      const m = parseQty(t.value);
      if (Number.isFinite(m)) t.value = s.kolS = D.qty(m);
    }
  }
  function onClick(e) {
    if (e.target.closest("[data-add-item]")) {
      const k = klOf(ed.klijent_id);
      ed.stavke.push({
        opis: "",
        jedinica_mere: (k && k.jedinica_mere) || "usluga",
        vrsta: "usluga",
        kolS: "1",
        cenaS: "",
      });
      ed.touched.stavke = ed.dirty = true;
      paintItems();
      update();
      const last = $$(".fk-it textarea").pop();
      if (last) last.focus();
      return;
    }
    const d = e.target.closest("[data-del-item]");
    if (d) {
      ed.stavke.splice(+d.dataset.delItem, 1);
      ed.touched.stavke = ed.dirty = true;
      paintItems();
      return update();
    }
    const sv = e.target.closest("[data-save]");
    if (sv) return busy(sv, () => saveDraft());
    const is = e.target.closest("[data-issue]");
    if (is) return askIssue();
    const dd = e.target.closest("[data-del-draft]");
    if (dd) return deleteDraft(null);
  }

  function payload(st, c) {
    return {
      id: st.id || null,
      redni_broj: st.redni_broj,
      klijent_id: st.klijent_id,
      datum_izdavanja: st.datum_izdavanja,
      mesto_izdavanja: st.mesto_izdavanja,
      datum_prometa_od: st.datum_prometa_od || "",
      datum_prometa_do: st.datum_prometa_do || "",
      rok_placanja: st.rok_placanja || "",
      poziv_na_broj: st.poziv_na_broj,
      napomene: st.napomene,
      stavke: c.items
        .filter((s) => !s.empty)
        .map((s) => ({
          opis: s.opis.trim(),
          jedinica_mere: s.jedinica_mere.trim(),
          vrsta: s.vrsta || "usluga",
          kolicina: milliStr(s.kol),
          cena: paraStr(s.cena),
        })),
    };
  }
  async function persist(st) {
    const c = calc(st);
    if (c.save.length) {
      ed.tried = true;
      update(true);
      throw { code: "P0001", message: c.save[0] };
    }
    const r = await db().rpc("fak_sacuvaj", { p: payload(st, c) });
    if (r.error) {
      if (r.error.code === "23505") {
        // neko je u međuvremenu uzeo ovaj broj: osveži i predloži sledeći slobodan
        await load(true).catch(() => {});
        throw {
          code: "P0001",
          message: `Broj ${brojOf(st.redni_broj, c.god)} je upravo zauzet. Sledeći slobodan je ${brojOf(nextNo(c.god, st.id), c.god)}.`,
        };
      }
      throw r.error;
    }
    const f = keep(r.data);
    st.id = f.id;
    st.dirty = false;
    return f;
  }
  async function saveDraft() {
    try {
      const f = await persist(ed);
      toast(`Nacrt ${f.broj} je sačuvan.`);
      if (cur !== "fak-" + f.id) {
        ed.key = "fak-" + f.id;
        cur = ed.key; // ista forma, nova adresa (bez ponovnog crtanja)
        history.replaceState(null, "", "#fak-" + f.id);
        const h = $("#fkEdHd");
        if (h) h.innerHTML = edHead(ed);
      }
    } catch (e) {
      toast(errText(e));
    }
  }
  function deleteDraft(f0) {
    const f = f0 && f0.id ? f0 : ed && fkOf(ed.id);
    if (!f) return;
    sheet(
      `<h3>Obriši nacrt ${esc(f.broj)}?</h3><p>Nacrt nije izdat, pa se briše zauvek. Broj ${esc(f.broj)} ostaje slobodan.</p><p class="fk-err"></p>
       <div class="row2"><button type="button" class="pill" data-close>Otkaži</button><button type="submit" class="pill danger solid">Obriši</button></div>`,
      async () => {
        const r = await db().rpc("fak_obrisi", { p_id: f.id });
        if (r.error) throw r.error;
        S.fk = S.fk.filter((x) => x.id !== f.id);
        if (ed && ed.id === f.id) ed.dirty = false;
        toast(`Nacrt ${f.broj} je obrisan.`);
        if (cur === "fakture") rerender();
        else nav("fakture");
      },
    );
  }
  function deleteIssued(f) {
    const orig = isStorno(f) ? fkOf(f.storno_za_fakturu_id) : null;
    const back = orig && (orig.datum_placanja ? "placena" : "izdata");
    sheet(
      `<h3>Obriši ${isStorno(f) ? "storno" : "fakturu"} ${esc(f.broj)}?</h3>
       <div class="fk-sum"><span>${esc(kupacOf(f))}</span><b>${money(f.uk)} RSD</b></div>
       <p>Briše se zauvek, zajedno sa PDF-om, i nestaje iz KPO knjige. Broj ${esc(f.broj)} dobija sledeća faktura.</p>
       ${orig ? `<p>Faktura ${esc(orig.broj)} se vraća na ${back === "placena" ? "plaćenu" : "izdatu"}.</p>` : ""}
       <p class="fk-msg w">${I.warn}Briši samo ono što kupac nije dobio. Ako je faktura poslata, storniraj je.</p>
       <p class="fk-err"></p>
       <div class="row2"><button type="button" class="pill" data-close>Otkaži</button><button type="submit" class="pill danger solid">Obriši</button></div>`,
      async () => {
        const r = await db().rpc("fak_obrisi", { p_id: f.id });
        if (r.error) throw r.error;
        S.fk = S.fk.filter((x) => x.id !== f.id);
        if (orig) orig.status = back;
        kpoRows = null;
        const path = f.pdf_url || pdfPath(f);
        db()
          .storage.from("fakture")
          .remove([path])
          .then((x) => x.error && console.warn("[fakture] pdf ostao", x.error))
          .catch((e) => console.warn("[fakture] pdf ostao", e));
        paintDash();
        toast(
          `${isStorno(f) ? "Storno" : "Faktura"} ${f.broj} je obrisan${isStorno(f) ? "" : "a"}.`,
        );
        if (cur === "fakture") rerender();
        else nav("fakture");
        load(true).catch(() => {});
      },
    );
  }
  function askIssue() {
    ed.tried = true;
    const c = calc(ed);
    update(true);
    if (c.issue.length) {
      toast(c.issue[0]);
      const m = $("#fkMsgs");
      if (m) m.scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }
    const k = klOf(ed.klijent_id);
    sheet(
      `<h3>Izdaj fakturu ${esc(brojOf(ed.redni_broj, c.god))}?</h3>
       <div class="fk-sum"><span>${esc(k ? k.naziv : "")}</span><b>${money(c.total)} RSD</b></div>
       ${c.warn.map((w) => `<p class="fk-msg w">${I.warn}${esc(w)}</p>`).join("")}
       <p>Izdata faktura se više ne menja. Ispravka ide samo kroz storno. PDF se pravi i preuzima odmah.</p>
       <p class="fk-err"></p>
       <div class="row2"><button type="button" class="pill" data-close>Nazad</button><button type="submit" class="pill solid">${I.send}Izdaj</button></div>`,
      async (form) => {
        const btn = form.querySelector("[type=submit]");
        btn.classList.add("busy");
        try {
          await issue();
        } finally {
          btn.classList.remove("busy");
        }
      },
    );
  }
  async function issue() {
    pdfLib().catch(() => {}); // učitavanje biblioteka paralelno sa upisom
    const draft = await persist(ed);
    const r = await db().rpc("fak_izdaj", { p_id: draft.id });
    if (r.error) throw r.error;
    const f = keep(r.data);
    ed.dirty = false;
    let bytes = null,
      pdfErr = null;
    try {
      bytes = await makePdf(f);
      await storePdf(f, bytes);
    } catch (e) {
      pdfErr = e;
      console.error("[fakture] pdf", e);
    }
    if (bytes) saveFile(bytes, fileName(f));
    closeSheet();
    ed = null;
    paintDash();
    nav("fak-" + f.id);
    toast(
      pdfErr
        ? `Faktura ${f.broj} je izdata, ali PDF nije sačuvan. Klikni „Preuzmi PDF“.`
        : `Faktura ${f.broj} je izdata.`,
    );
  }

  /* ---------- izdata faktura: pregled + radnje ---------- */
  function renderView(f) {
    const k = kupacOf(f);
    const [c, t] = stLabel(f);
    const orig = isStorno(f) ? fkOf(f.storno_za_fakturu_id) : null;
    const storno = S.fk.find((x) => x.storno_za_fakturu_id === f.id);
    const facts = [
      ["Kupac", esc(k)],
      ["Iznos", `<b class="fk-amt">${money(f.uk)} RSD</b>`],
      ["Datum izdavanja", esc(D.date(f.datum_izdavanja))],
      !isStorno(f) && ["Rok plaćanja", esc(D.date(f.rok_placanja)) || "—"],
      f.status === "placena" && ["Plaćena", esc(D.date(f.datum_placanja))],
      orig && [
        "Storno fakture",
        `<a href="#fak-${esc(orig.id)}">${esc(orig.broj)}</a>`,
      ],
      storno && [
        "Stornirana dokumentom",
        `<a href="#fak-${esc(storno.id)}">${esc(storno.broj)}</a>`,
      ],
    ].filter(Boolean);
    const acts = actsOf(f);
    const note = isStorno(f)
      ? "Storno dokument poništava fakturu u KPO knjizi."
      : f.status === "stornirana"
        ? "Faktura je stornirana. Ispravku izdaj kao novu fakturu."
        : "Izdata faktura je zaključana. Ispravka ide kroz storno.";
    root.innerHTML = `
    <div class="fk-ed fk-vw">
      <div class="fk-side">
        <div class="fk-ed-hd"><h1>${isStorno(f) ? "Storno" : "Faktura"} ${esc(f.broj)}</h1><span class="fk-st ${c}">${esc(t)}</span></div>
        <dl class="fk-facts">${facts.map(([a, b]) => `<div><dt>${a}</dt><dd>${b}</dd></div>`).join("")}</dl>
        <div class="fk-acts">${acts
          .map(
            ([a, ic, label, cls], i) =>
              `<button type="button" class="pill${i === 0 ? " solid" : ""}${cls ? " " + cls : ""}" data-act="${a}" data-id="${esc(f.id)}">${ic}${label}</button>`,
          )
          .join("")}</div>
        <p class="fk-lock">${note}</p>
      </div>
      <aside class="fk-prev" aria-label="Pregled fakture"><div class="fk-pages" id="fkPrev">${pagesHtml(f)}</div></aside>
    </div>`;
    repaint = () => {
      const box = $("#fkPrev");
      if (box) box.innerHTML = pagesHtml(f);
    };
  }

  /* ---------- KPO knjiga (view os.kpo) ---------- */
  let kpoGod = null;
  let kpoRows = null; // poslednje učitano: { god, rows }
  const obveznikOf = (naziv) => {
    const m = /^(.*?)\s+PR\b/.exec(naziv || "");
    return m ? m[1] : naziv || "";
  };
  function kpoMeta(god) {
    const iz = S.iz || {};
    return {
      god,
      pib: iz.pib || "",
      obveznik: obveznikOf(iz.naziv),
      firma: iz.naziv || "",
      sediste: iz.adresa || "",
      sifra: iz.sifra_delatnosti || "",
    };
  }
  const kpoOpis = (r) =>
    r.storno
      ? `Storno ${r.broj} (faktura ${r.storno_za_broj || "—"}), ${r.kupac}`
      : `Faktura ${r.broj}, ${r.kupac}`;
  async function renderKpo() {
    const god = kpoGod || yearOf(today());
    const h = cur;
    root.innerHTML =
      head("kpo") +
      `<div class="fk-sub fk-kpo-bar">
        <select class="fk-sel" id="fkKpoGod" aria-label="Godina">${yearsOf()
          .map(
            (y) =>
              `<option value="${y}"${y === god ? " selected" : ""}>${y}.</option>`,
          )
          .join("")}</select>
        <p>Knjiga se puni sama iz izdatih faktura i storna. Redni broj kreće od 1 svake godine.</p>
        <div class="fk-exp">
          <button class="pill sm" data-kpo-exp="pdf">${I.dl}PDF</button>
          <button class="pill sm" data-kpo-exp="xlsx">${I.dl}Excel</button>
          <button class="pill sm" data-kpo-exp="csv">${I.dl}CSV</button>
        </div>
      </div>
      <div id="fkKpo"><div class="fk-load"><i></i><i></i><i></i></div></div>`;
    $("#fkKpoGod").addEventListener("change", (e) => {
      kpoGod = +e.target.value;
      renderKpo();
    });
    let rows;
    try {
      rows = await kpoLoad(god);
    } catch (e) {
      if (cur === h)
        $("#fkKpo").innerHTML =
          `<div class="state">${esc(errText(e))}<button class="pill" data-fk-retry>Probaj ponovo</button></div>`;
      return;
    }
    if (cur !== h || !$("#fkKpo")) return;
    const sum = (k) => rows.reduce((s, r) => s + r[k], 0);
    const m = kpoMeta(god);
    $("#fkKpo").innerHTML = `
      <dl class="fk-kpo-meta">
        <div><dt>Obveznik</dt><dd>${esc(m.obveznik) || "—"}</dd></div>
        <div><dt>PIB</dt><dd>${esc(m.pib) || "—"}</dd></div>
        <div><dt>Šifra delatnosti</dt><dd>${esc(m.sifra) || "—"}</dd></div>
        <div class="w"><dt>Firma radnje</dt><dd>${esc(m.firma) || "—"}</dd></div>
        <div class="w"><dt>Sedište</dt><dd>${esc(m.sediste) || "—"}</dd></div>
      </dl>
      ${
        rows.length
          ? `<div class="fk-kpo-wrap"><table class="fk-kpo">
        <thead><tr><th class="c">Redni broj</th><th>Datum i opis knjiženja</th><th class="r">Prihod od delatnosti od proizvoda</th><th class="r">Prihod od delatnosti od usluga</th><th class="r">Svega prihodi (3+4)</th></tr>
        <tr class="nums"><th class="c">1</th><th>2</th><th class="r">3</th><th class="r">4</th><th class="r">5</th></tr></thead>
        <tbody>${rows
          .map(
            (r) =>
              `<tr${r.storno ? ' class="st"' : ""}><td class="c">${r.redni_broj}</td><td><span class="dt">${esc(D.date(r.datum))}</span> <a href="#fak-${esc(r.faktura_id)}">${esc(kpoOpis(r))}</a></td><td class="r">${money(r.proizvodi)}</td><td class="r">${money(r.usluge)}</td><td class="r b">${money(r.ukupno)}</td></tr>`,
          )
          .join("")}</tbody>
        <tfoot><tr><td></td><td>Ukupno ${god}.</td><td class="r">${money(sum("proizvodi"))}</td><td class="r">${money(sum("usluge"))}</td><td class="r">${money(sum("ukupno"))}</td></tr></tfoot>
      </table></div>`
          : `<div class="state">Nema knjiženja za ${god}. godinu.</div>`
      }`;
  }
  async function kpoLoad(god) {
    const { data, error } = await db()
      .from("kpo")
      .select("*")
      .eq("godina", god)
      .order("redni_broj");
    if (error) throw error;
    const rows = (data || []).map((r) => ({
      ...r,
      proizvodi: D.toPara(r.proizvodi),
      usluge: D.toPara(r.usluge),
      ukupno: D.toPara(r.ukupno),
    }));
    kpoRows = { god, rows };
    return rows;
  }
  root.addEventListener("click", (e) => {
    const b = e.target.closest("[data-kpo-exp]");
    if (!b) return;
    const god = kpoGod || yearOf(today());
    busy(b, async () => {
      const rows =
        kpoRows && kpoRows.god === god ? kpoRows.rows : await kpoLoad(god);
      const m = kpoMeta(god);
      const base = `KPO ${god} - ${m.obveznik || "knjiga"}`.replace(
        /[\\/:*?"<>|]+/g,
        " ",
      );
      const kind = b.dataset.kpoExp;
      if (kind === "csv")
        return saveFile(kpoCsv(rows), base + ".csv", "text/csv;charset=utf-8");
      if (kind === "xlsx")
        return saveFile(
          D.kpoXlsx(
            m,
            rows.map((r) => ({ ...r, opis: kpoOpis(r) })),
          ),
          base + ".xlsx",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        );
      const lib = await pdfLib();
      const doc = D.kpo(
        m,
        rows.map((r) => ({ ...r, opis: kpoOpis(r) })),
        today(),
      );
      const bytes = await D.pdf(doc, lib, {
        title: `KPO knjiga ${god}`,
        author: m.firma,
      });
      saveFile(bytes, base + ".pdf");
    });
  });
  function kpoCsv(rows) {
    const num = (p) => {
      const neg = p < 0;
      p = Math.abs(p);
      return (neg ? "-" : "") + Math.floor(p / 100) + "," + pad2(p % 100);
    };
    const q = (s) =>
      /[;"\n]/.test(s) ? `"${String(s).replace(/"/g, '""')}"` : String(s);
    const lines = [
      [
        "Redni broj",
        "Datum",
        "Opis knjiženja",
        "Prihod od delatnosti od proizvoda",
        "Prihod od delatnosti od usluga",
        "Svega prihodi od delatnosti (3+4)",
      ],
      ...rows.map((r) => [
        r.redni_broj,
        D.date(r.datum),
        kpoOpis(r),
        num(r.proizvodi),
        num(r.usluge),
        num(r.ukupno),
      ]),
      [
        "",
        "",
        "Ukupno",
        num(rows.reduce((s, r) => s + r.proizvodi, 0)),
        num(rows.reduce((s, r) => s + r.usluge, 0)),
        num(rows.reduce((s, r) => s + r.ukupno, 0)),
      ],
    ];
    return "﻿" + lines.map((l) => l.map(q).join(";")).join("\r\n") + "\r\n";
  }

  /* ---------- dashboard: oznaka za fakture kojima je prošao rok ---------- */
  function paintDash() {
    const el = $("#fkDue");
    if (!el || !S.ready) return;
    const n = S.fk.filter(late).length;
    el.hidden = !n;
    el.textContent = n ? `${n} ${plural(n, "kasni", "kasne", "kasni")}` : "";
  }

  /* ---------- klijenti ---------- */
  function renderKlijenti() {
    const count = (id) => S.fk.filter((f) => f.klijent_id === id).length;
    const card = (k, i) => {
      const n = count(k.id);
      return `<article class="fk-kc${k.arhiviran ? " arh" : ""}" style="animation-delay:${adl(0.08 + i * 0.04)}s">
        <h3>${esc(k.naziv)}</h3>
        <p>${esc([k.adresa, k.mesto].filter(Boolean).join(", ")) || "&nbsp;"}</p>
        <p class="m">${esc([k.pib && "PIB " + k.pib, k.mb && "MB " + k.mb].filter(Boolean).join(" · ")) || "&nbsp;"}</p>
        <p class="m">${esc([k.opis_usluge, k.jedinica_mere, k.rok_placanja + " " + D.danaWord(k.rok_placanja)].filter(Boolean).join(" · "))}</p>
        <div class="fk-kc-b">
          <span class="fk-kc-n">${n} ${plural(n, "faktura", "fakture", "faktura")}</span>
          ${k.arhiviran ? "" : `<button class="pill sm" data-go="fak-nova~k${esc(k.id)}">${I.plus}Faktura</button>`}
          <button class="fk-ib" data-kl-edit="${esc(k.id)}" title="Izmeni" aria-label="Izmeni ${esc(k.naziv)}">${I.edit}</button>
          ${
            n
              ? `<button class="fk-ib" data-kl-arh="${esc(k.id)}" title="${k.arhiviran ? "Vrati iz arhive" : "Arhiviraj"}" aria-label="${k.arhiviran ? "Vrati iz arhive" : "Arhiviraj"} ${esc(k.naziv)}">${I.box}</button>`
              : `<button class="fk-ib" data-kl-del="${esc(k.id)}" title="Obriši" aria-label="Obriši ${esc(k.naziv)}">${I.trash}</button>`
          }
        </div>
      </article>`;
    };
    const act = S.kl.filter((k) => !k.arhiviran),
      arh = S.kl.filter((k) => k.arhiviran);
    root.innerHTML =
      head("klijenti") +
      `<div class="fk-sub"><p>Kupci kojima izdaješ fakture. Klijent sa fakturama se ne briše, nego arhivira.</p><button class="pill" data-kl-new>${I.plus}Novi klijent</button></div>
      ${act.length ? `<div class="fk-kgrid">${act.map(card).join("")}</div>` : `<div class="state">Još nema klijenata.</div>`}
      ${arh.length ? `<h2 class="fk-h2">Arhivirani</h2><div class="fk-kgrid">${arh.map(card).join("")}</div>` : ""}`;
  }
  root.addEventListener("click", (e) => {
    if (e.target.closest("[data-kl-new]"))
      return klijentSheet(null, () => renderKlijenti());
    const ed_ = e.target.closest("[data-kl-edit]");
    if (ed_)
      return klijentSheet(klOf(ed_.dataset.klEdit), () => renderKlijenti());
    const a = e.target.closest("[data-kl-arh]");
    if (a)
      return busy(a, async () => {
        const k = klOf(a.dataset.klArh);
        const { data, error } = await db()
          .from("klijenti")
          .update({ arhiviran: !k.arhiviran })
          .eq("id", k.id)
          .select()
          .single();
        if (error) throw error;
        Object.assign(k, data);
        toast(
          k.arhiviran ? `${k.naziv} je u arhivi.` : `${k.naziv} je vraćen.`,
        );
        renderKlijenti();
      });
    const d = e.target.closest("[data-kl-del]");
    if (d) {
      const k = klOf(d.dataset.klDel);
      sheet(
        `<h3>Obriši klijenta?</h3><p>${esc(k.naziv)} nema nijednu fakturu, pa se briše zauvek.</p><p class="fk-err"></p>
         <div class="row2"><button type="button" class="pill" data-close>Otkaži</button><button type="submit" class="pill danger solid">Obriši</button></div>`,
        async () => {
          const { error } = await db().from("klijenti").delete().eq("id", k.id);
          if (error) throw error;
          S.kl = S.kl.filter((x) => x.id !== k.id);
          toast(`${k.naziv} je obrisan.`);
          renderKlijenti();
        },
      );
    }
  });
  function klijentSheet(k, done) {
    const v = k || { jedinica_mere: "usluga", rok_placanja: 8 };
    sheet(
      `<h3>${k ? "Izmeni klijenta" : "Novi klijent"}</h3>
       <div class="fk-g2">
         ${field("naziv", "Naziv (pun, kao u APR-u)", v.naziv, { req: true, auto: !k, cls: "fk-span2", max: 200 })}
         ${field("adresa", "Adresa", v.adresa, { ph: "Ulica i broj", max: 200 })}
         ${field("mesto", "Mesto", v.mesto, { ph: "21000 Novi Sad", max: 120 })}
         ${field("pib", "PIB", v.pib, { mode: "numeric", max: 20 })}
         ${field("mb", "Matični broj", v.mb, { mode: "numeric", max: 20 })}
         ${field("email", "Email", v.email, { type: "email", cls: "fk-span2", max: 200 })}
         ${field("opis_usluge", "Podrazumevani opis usluge", v.opis_usluge, { cls: "fk-span2", max: 300 })}
         ${field("jedinica_mere", "Jedinica mere", v.jedinica_mere, { max: 30 })}
         ${field("rok_placanja", "Rok plaćanja (dana)", v.rok_placanja, { mode: "numeric", max: 3 })}
       </div>
       <p class="fk-err"></p>
       <div class="row2"><button type="button" class="pill" data-close>Otkaži</button><button type="submit" class="pill solid">${k ? "Sačuvaj" : "Dodaj"}</button></div>`,
      async (form) => {
        const g = (n) => form.elements[n].value.trim();
        const rok = parseInt(g("rok_placanja"), 10);
        if (!g("naziv"))
          throw { code: "P0001", message: "Upiši naziv klijenta." };
        if (!(rok >= 0 && rok <= 365))
          throw {
            code: "P0001",
            message: "Rok plaćanja je broj dana od 0 do 365.",
          };
        const row = {
          naziv: g("naziv"),
          adresa: g("adresa"),
          mesto: g("mesto"),
          pib: g("pib"),
          mb: g("mb"),
          email: g("email"),
          opis_usluge: g("opis_usluge"),
          jedinica_mere: g("jedinica_mere") || "usluga",
          rok_placanja: rok,
        };
        const q = k
          ? db().from("klijenti").update(row).eq("id", k.id).select().single()
          : db().from("klijenti").insert(row).select().single();
        const { data, error } = await q;
        if (error) throw error;
        if (k) Object.assign(k, data);
        else S.kl.push(data);
        S.kl.sort((a, b) => a.naziv.localeCompare(b.naziv, "sr"));
        toast(k ? "Klijent je sačuvan." : `${data.naziv} je dodat.`);
        done && done(data);
      },
      { wide: true },
    );
  }

  /* ---------- podešavanja: izdavalac, logo, limiti ---------- */
  let newLogo = null; // { path, url } otpremljen a još nesačuvan
  function renderSettings() {
    const v = S.iz || {};
    newLogo = null;
    root.innerHTML =
      head("podesavanja") +
      `<form class="fk-set" id="fkSet" novalidate autocomplete="off">
        <section class="fk-card">
          <h2>Izdavalac</h2>
          <p class="fk-note">Ovi podaci idu na svaku novu fakturu. Već izdate fakture zadržavaju podatke iz trenutka izdavanja.</p>
          <div class="fk-logo">
            <div class="fk-logo-p" id="fkLogoP">${v.logo_path ? "" : "<span>Bez logoa</span>"}</div>
            <label class="pill"><input type="file" accept="image/png,image/jpeg" id="fkLogoIn" hidden>${I.up}${v.logo_path ? "Zameni logo" : "Dodaj logo"}</label>
            <span class="fk-note">PNG ili JPG, najviše 2 MB. Najbolje široki logo na providnoj pozadini.</span>
          </div>
          <div class="fk-g2">
            ${field("naziv", "Naziv (pun, kao u APR-u)", v.naziv, { cls: "fk-span2", max: 200 })}
            ${field("adresa", "Adresa", v.adresa, { cls: "fk-span2", ph: "Ulica i broj, poštanski broj i mesto", max: 200 })}
            ${field("pib", "PIB", v.pib, { mode: "numeric", max: 20 })}
            ${field("mb", "Matični broj", v.mb, { mode: "numeric", max: 20 })}
            ${field("tekuci_racun", "Tekući račun", v.tekuci_racun, { max: 40 })}
            ${field("banka", "Banka", v.banka, { max: 120 })}
            ${field("email", "Email", v.email, { type: "email", max: 200 })}
            ${field("telefon", "Telefon", v.telefon, { type: "tel", max: 40 })}
            ${field("mesto_izdavanja", "Mesto izdavanja", v.mesto_izdavanja, { max: 80 })}
            ${field("sifra_delatnosti", "Šifra delatnosti (za KPO)", v.sifra_delatnosti, { mode: "numeric", max: 10 })}
          </div>
        </section>
        <section class="fk-card">
          <h2>Limiti prometa</h2>
          <p class="fk-note">Za trake na pregledu faktura. Iznosi u dinarima, upozorenja u procentima.</p>
          <div class="fk-g2">
            ${field("limit_pausal", "Limit za paušal (kalendarska godina)", money(D.toPara(v.limit_pausal ?? 6000000)), { mode: "decimal" })}
            ${field("limit_pdv", "Limit za PDV (poslednjih 12 meseci)", money(D.toPara(v.limit_pdv ?? 8000000)), { mode: "decimal" })}
            ${field("upozorenje_1", "Prvo upozorenje (%)", v.upozorenje_1 ?? 80, { mode: "numeric", max: 3 })}
            ${field("upozorenje_2", "Drugo upozorenje (%)", v.upozorenje_2 ?? 95, { mode: "numeric", max: 3 })}
          </div>
        </section>
        <p class="fk-err" id="fkSetErr"></p>
        <div class="fk-set-b"><button type="submit" class="pill solid">Sačuvaj podešavanja</button></div>
      </form>`;
    if (v.logo_path)
      logo(v.logo_path).then((lg) => {
        const p = $("#fkLogoP");
        if (p && lg && !newLogo)
          p.innerHTML = `<img src="${esc(lg.url)}" alt="Logo">`;
      });
    $("#fkLogoIn").addEventListener("change", uploadLogo);
    $("#fkSet").addEventListener("submit", saveSettings);
  }
  async function uploadLogo(e) {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file) return;
    if (!/^image\/(png|jpeg)$/.test(file.type))
      return toast("Logo mora biti PNG ili JPG.");
    if (file.size > 2 * 1024 * 1024) return toast("Logo je veći od 2 MB.");
    const lbl = e.target.closest("label");
    lbl.classList.add("busy");
    try {
      const a = "abcdefghijklmnopqrstuvwxyz0123456789";
      const id = Array.from(
        crypto.getRandomValues(new Uint8Array(16)),
        (n) => a[n % 36],
      ).join("");
      const path = `logo/${id}.${file.type === "image/png" ? "png" : "jpg"}`;
      const { error } = await db().storage.from("fakture").upload(path, file, {
        contentType: file.type,
        cacheControl: "31536000",
        upsert: false,
      });
      if (error) throw error;
      newLogo = { path, url: URL.createObjectURL(file) };
      $("#fkLogoP").innerHTML =
        `<img src="${esc(newLogo.url)}" alt="Novi logo">`;
      toast("Logo je otpremljen. Sačuvaj podešavanja da važi.");
    } catch (err) {
      toast(errText(err));
    } finally {
      lbl.classList.remove("busy");
    }
  }
  async function saveSettings(e) {
    e.preventDefault();
    const form = e.target,
      err = $("#fkSetErr"),
      btn = form.querySelector("[type=submit]");
    const g = (n) => form.elements[n].value.trim();
    err.textContent = "";
    const lp = parseMoney(g("limit_pausal")),
      lv = parseMoney(g("limit_pdv"));
    const u1 = parseInt(g("upozorenje_1"), 10),
      u2 = parseInt(g("upozorenje_2"), 10);
    const bad = !(lp > 0)
      ? "Limit za paušal mora biti veći od nule."
      : !(lv > 0)
        ? "Limit za PDV mora biti veći od nule."
        : !(u1 >= 1 && u1 <= 100 && u2 >= 1 && u2 <= 100)
          ? "Upozorenja su procenti od 1 do 100."
          : !g("naziv")
            ? "Upiši naziv izdavaoca."
            : "";
    if (bad) {
      err.textContent = bad;
      return;
    }
    const row = {
      id: 1,
      naziv: g("naziv"),
      adresa: g("adresa"),
      pib: g("pib"),
      mb: g("mb"),
      tekuci_racun: g("tekuci_racun"),
      banka: g("banka"),
      email: g("email"),
      telefon: g("telefon"),
      mesto_izdavanja: g("mesto_izdavanja"),
      sifra_delatnosti: g("sifra_delatnosti"),
      limit_pausal: paraStr(lp),
      limit_pdv: paraStr(lv),
      upozorenje_1: Math.min(u1, u2),
      upozorenje_2: Math.max(u1, u2),
    };
    if (newLogo) row.logo_path = newLogo.path;
    btn.disabled = true;
    try {
      const { data, error } = await db()
        .from("izdavalac")
        .upsert(row)
        .select()
        .single();
      if (error) throw error;
      S.iz = data;
      newLogo = null;
      toast("Podešavanja su sačuvana.");
    } catch (x) {
      err.textContent = errText(x);
    } finally {
      btn.disabled = false;
    }
  }

  return {
    route,
    /* dashboard kartica: prefetch podataka da lista stoji odmah */
    warm() {
      if (!S.ready || Date.now() - (S.at || 0) > 60000)
        load(!!S.ready)
          .then(paintDash)
          .catch(() => {});
      else paintDash();
    },
    /* app.js: odlazak na ekran van faktura */
    leave() {
      stash();
      cur = "";
      closeSheet();
      closeMenu();
    },
  };
};
