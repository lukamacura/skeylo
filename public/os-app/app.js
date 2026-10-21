(() => {
  const IMG = {
    filip: "/os-app/img/4f7a773c71.jpg",
    luka: "/os-app/img/30003d27cd.jpg",
    mihajlo: "/os-app/img/91d1720adc.jpg",
    nina: "/os-app/img/f8e39d5612.jpg",
  };
  const ICON = "/os-app/img/e20eeaf7f1.png";
  // Pozadina Start kartice po osobi (Filip: podrazumevana iz index.html)
  const START_BG = {
    luka: "/os-app/img/start_luka.webp",
    mihajlo: "/os-app/img/start_mihajlo.webp",
    nina: "/os-app/img/start_nina.webp",
  };
  const TEAM = [
    { id: "filip", name: "Filip", voc: "Filipe", email: "filip@skeylo.com" },
    {
      id: "mihajlo",
      name: "Mihajlo",
      voc: "Mihajlo",
      email: "mihajlo@skeylo.com",
    },
    { id: "luka", name: "Luka", voc: "Luka", email: "luka@skeylo.com" },
    { id: "nina", name: "Nina", voc: "Nina", email: "nina@skeylo.com" },
  ];
  const EARN = 100000; // placeholder dok ne povežemo Finances
  const KEY = "skeylo-os-user";
  const MONTHS = [
    "Januar",
    "Februar",
    "Mart",
    "April",
    "Maj",
    "Jun",
    "Jul",
    "Avgust",
    "Septembar",
    "Oktobar",
    "Novembar",
    "Decembar",
  ];
  const COLORS = ["#4fbfa8", "#6c9cff", "#a98bff", "#e0679a", "#d9c35a"];
  const STATUSES = [
    { id: "write", name: "To Write", c: "#a39a90" },
    { id: "schedule", name: "To Schedule", c: "#e0679a" },
    { id: "record", name: "To Record", c: "#5b9cf0" },
    { id: "edit", name: "To Edit", c: "#e3b341" },
    { id: "upload", name: "To Meta Upload", c: "#a98bff" },
    { id: "uploaded", name: "Meta Uploaded", c: "#4fbf7f" },
  ];
  const FORMATS = [
    ["Sales Video", "#d08a55"],
    ["Skit", "#4fbf7f"],
    ["Static Image", "#4fb5bf"],
    ["Carousel", "#5b9cf0"],
    ["Montage", "#8a8ff0"],
    ["Short Movie", "#e0675b"],
    ["POV", "#e0679a"],
  ];
  const GREY = "#8a8580",
    GREY_RGB = "138, 133, 128",
    CREAM = "#f4ebdc";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover:hover) and (pointer:fine)").matches;
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const store = {
    get() {
      try {
        return localStorage.getItem(KEY);
      } catch (e) {
        return null;
      }
    },
    set(v) {
      try {
        localStorage.setItem(KEY, v);
      } catch (e) {}
    },
    del() {
      try {
        localStorage.removeItem(KEY);
      } catch (e) {}
    },
  };
  const esc = (s) =>
    String(s ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const SV = (p, w = 2) =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
  const IC = {
    plus: SV('<path d="M12 5v14M5 12h14"/>', 2.4),
    go: '<svg class="go" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    status: SV('<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>'),
    model: SV(
      '<circle cx="12" cy="7" r="4"/><path d="M5 21v-1a7 7 0 0 1 14 0v1"/>',
    ),
    angle: SV(
      '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    ),
    format: SV('<circle cx="12" cy="12" r="9"/><path d="m10 8 6 4-6 4z"/>'),
    pin: SV(
      '<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    ),
    box: SV(
      '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/>',
    ),
    x: SV('<path d="M18 6 6 18M6 6l12 12"/>', 2.4),
    check:
      '<svg class="check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5L20 7"/></svg>',
    text: SV('<path d="M4 7V5h16v2M9 19h6M12 5v14"/>'),
    ul: SV(
      '<path d="M9 6h12M9 12h12M9 18h12"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>',
    ),
    ol: SV(
      '<path d="M10 6h11M10 12h11M10 18h11M4 6h1v4M4 10h2M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/>',
    ),
    hr: SV('<path d="M3 12h18"/>'),
    img: SV(
      '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/>',
    ),
    file: SV(
      '<path d="M21.4 11.1 12.2 20.3a6 6 0 0 1-8.5-8.5l9.2-9.2a4 4 0 0 1 5.7 5.7l-9.2 9.2a2 2 0 0 1-2.8-2.8l8.5-8.5"/>',
    ),
    msg: SV(
      '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-5.1A8 8 0 1 1 21 12z"/>',
    ),
  };
  let me = null;

  /* ---------------- greeting ---------------- */
  function part(h) {
    return h >= 5 && h < 12 ? "jutro" : h >= 12 && h < 20 ? "dan" : "noc";
  }
  function greeting(u, p) {
    if (u.id === "nina")
      return {
        jutro: ["Jutriićć {N}, idemo polako 😌", "Niniićć"],
        dan: ["Hejj, spremna za rad?"],
        noc: ["Kraljice rade i noću 💅"],
      }[p];
    return {
      jutro: ["Dobro jutro {N}, spreman da osvajamo?", u.voc],
      dan: ["Šta kuvamo {N}?", u.voc],
      noc: ["Noćna ptico, imperija se neće sagraditi sama 🦉"],
    }[p];
  }
  function renderGreeting(u) {
    const [tpl, nm] = greeting(u, part(new Date().getHours()));
    const h = $("#greet");
    h.innerHTML = "";
    tpl.split(" ").forEach((w, i, a) => {
      const o = document.createElement("span");
      o.className = "w";
      const s = document.createElement("span");
      if (w.includes("{N}")) {
        o.classList.add("nm");
        s.textContent = w.replace("{N}", nm);
      } else s.textContent = w;
      s.style.animationDelay = 0.15 + i * 0.06 + "s";
      o.appendChild(s);
      h.appendChild(o);
      if (i < a.length - 1) h.appendChild(document.createTextNode(" "));
    });
  }
  const nf = new Intl.NumberFormat("de-DE");
  function countUp(el, to) {
    if (reduce) {
      el.textContent = nf.format(to);
      return;
    }
    const t0 = performance.now() + 500,
      ms = 1600;
    const step = (t) => {
      const p = Math.min(1, Math.max(0, (t - t0) / ms));
      el.textContent = nf.format(Math.round(to * (1 - Math.pow(1 - p, 4))));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ---------------- toast ---------------- */
  let tt,
    undoFn = null;
  function toast(msg, undo, label) {
    const el = $("#toast");
    $("#toastMsg").textContent = msg;
    undoFn = undo || null;
    $("#toastUndo").hidden = !undo;
    $("#toastUndo").textContent = label || "Poništi";
    el.classList.toggle("has-undo", !!undo);
    el.classList.add("show");
    clearTimeout(tt);
    tt = setTimeout(() => el.classList.remove("show"), undo ? 5000 : 2400);
  }
  $("#toastUndo").onclick = () => {
    const f = undoFn;
    undoFn = null;
    $("#toast").classList.remove("show");
    f && f();
  };

  /* ---------------- data ---------------- */
  const FALLBACK = {
    clients: [
      {
        id: "skeylo",
        name: "Skeylo",
        kind: "internal",
        color: "#e1802c",
        order: 0,
      },
      {
        id: "ils",
        name: "Infinity Laser",
        kind: "client",
        color: "#d4919b",
        order: 1,
      },
    ],
    items: [
      {
        id: "sk-1",
        clientId: "skeylo",
        type: "project",
        title: "Launch",
        order: 1,
      },
      {
        id: "sk-2",
        clientId: "skeylo",
        type: "project",
        title: "Podcast Simulation",
        order: 2,
      },
      {
        id: "ils-p",
        clientId: "ils",
        type: "platform",
        title: "Client Platform",
        order: 0,
      },
      {
        id: "ils-1",
        clientId: "ils",
        type: "cycle",
        title: "Ciklus 1",
        order: 1,
      },
      {
        id: "ils-2",
        clientId: "ils",
        type: "cycle",
        title: "Ciklus 2",
        order: 2,
      },
      {
        id: "ils-3",
        clientId: "ils",
        type: "cycle",
        title: "Ciklus 3",
        order: 3,
      },
      {
        id: "ils-4",
        clientId: "ils",
        type: "cycle",
        title: "Ciklus 4",
        order: 4,
      },
      {
        id: "ils-2026-10",
        clientId: "ils",
        type: "month",
        title: "Oktobar",
        year: 2026,
        month: 10,
        order: 5,
      },
    ],
    scripts: [
      {
        id: "s1",
        monthId: "ils-2026-10",
        clientId: "ils",
        title: "Studio sa 5 zvezdica",
        status: "schedule",
        angle: "Sigurne Ruke",
        format: "Sales Video",
        models: ["Iva"],
        location: "",
        props: "",
        body: "<h2>Hook</h2><p>Klijentkinje nam se vraćaju i dovode drugarice.</p><h2>Telo</h2><p>Prvi tretman je besplatan za sve nove klijentkinje.</p><p>Tretman traje kratko, a većina klijentkinja oseti samo blago toplo peckanje.</p><h2>CTA</h2><p>Zakaži termin preko linka u opisu.</p>",
        order: 1000,
      },
      {
        id: "s2",
        monthId: "ils-2026-10",
        clientId: "ils",
        title: "Otvorena Nedelja",
        status: "upload",
        angle: "",
        format: "Skit",
        models: ["Branka", "Ana Radnica ILS"],
        location: "Infinity Studio NS",
        props: "",
        body: "",
        order: 1000,
      },
      {
        id: "s3",
        monthId: "ils-2026-10",
        clientId: "ils",
        title: "POV: Leto 2027.",
        status: "upload",
        angle: "Sezona",
        format: "Montage",
        models: ["Iva"],
        location: "",
        props: "",
        body: "",
        order: 2000,
      },
    ],
  };
  const S = {
    ready: false,
    mode: "loading",
    clients: [],
    items: [],
    scripts: [],
    reports: [],
    finances: [],
    expenses: [],
    tasks: [],
    models: [],
    cpages: [],
    angles: [],
    entities: [],
    dayItems: [],
    days: [],
    leads: [],
    notes: [],
    comments: [],
    creatives: [],
    creativeComments: [],
    creativeNotes: [],
    schedules: [],
    fresh: new Set(),
  };
  let NT = null; // General stranice (notes.js)
  FALLBACK.entities = [];
  FALLBACK.dayItems = [];
  FALLBACK.notes = [
    {
      id: "n-uvod",
      title: "Kako radi General",
      icon: "👋",
      parentId: null,
      order: 1,
      createdAt: 1791750000000,
      createdBy: "luka",
      md: "Svaka stranica je **Markdown**. Ukucaj `/` za blokove i emoji.\n\n## Prečice\n\n- `#` + razmak je naslov, `-` lista, `1.` numerisana\n- `[]` + razmak je zadatak\n- `**bold**`, `_italic_` i `` `kod` `` rade dok kucaš\n\n- [ ] Probaj da prevučeš ovaj blok za ⋮⋮\n- [x] Napravi prvu stranicu\n\n> [!NOTE] 💡\n> Klikni na emoji da ga promeniš.\n",
    },
  ];
  FALLBACK.days = [];
  FALLBACK.leads = [];
  /* komentari klijenta iz CRM-a (Creative Inspection): {clientId, scriptId, monthId, text, quote, before, after, author:"client", authorName, authorUid, createdAt, order, resolved} */
  FALLBACK.comments = [
    {
      id: "cm-demo",
      clientId: "ils",
      scriptId: "s1",
      monthId: "ils-2026-10",
      text: "Promeni ovo, prvi tretman nije besplatan. Možemo da ponudimo besplatne konsultacije.",
      quote: "Prvi tretman je besplatan za sve nove klijentkinje.",
      before: "Telo",
      after: "Tretman traje kratko",
      author: "client",
      authorName: "Ana",
      authorUid: null,
      createdAt: Date.now() - 2 * 36e5,
      order: Date.now() - 2 * 36e5,
      resolved: false,
    },
  ];
  FALLBACK.cpages = [
    {
      id: "cp-skeylo-privacy",
      clientId: "skeylo",
      title: "Privacy",
      icon: "lock",
      body: "<h2>Društvene mreže</h2><table><thead><tr><th>Mreža</th><th>Korisničko ime</th><th>Lozinka</th></tr></thead><tbody><tr><td>Instagram</td><td><br></td><td><br></td></tr><tr><td>Facebook</td><td><br></td><td><br></td></tr><tr><td>TikTok</td><td><br></td><td><br></td></tr><tr><td>Meta Business</td><td><br></td><td><br></td></tr></tbody></table><p><br></p>",
      order: 1000,
      createdAt: 1791756000000,
    },
    {
      id: "cp-skeylo-research",
      clientId: "skeylo",
      title: "Researching",
      icon: "search",
      body: "<h2>Istraživanje tržišta i konkurencije</h2><p><br></p>",
      order: 2000,
      createdAt: 1791756000000,
    },
    {
      id: "cp-ils-privacy",
      clientId: "ils",
      title: "Privacy",
      icon: "lock",
      body: "<h2>Društvene mreže</h2><table><thead><tr><th>Mreža</th><th>Korisničko ime</th><th>Lozinka</th></tr></thead><tbody><tr><td>Instagram</td><td><br></td><td><br></td></tr><tr><td>Facebook</td><td><br></td><td><br></td></tr><tr><td>TikTok</td><td><br></td><td><br></td></tr><tr><td>Meta Business</td><td><br></td><td><br></td></tr></tbody></table><p><br></p>",
      order: 1000,
      createdAt: 1791756000000,
    },
    {
      id: "cp-ils-research",
      clientId: "ils",
      title: "Researching",
      icon: "search",
      body: "<h2>Istraživanje tržišta i konkurencije</h2><p><br></p>",
      order: 2000,
      createdAt: 1791756000000,
    },
  ];
  FALLBACK.angles = [
    {
      id: "a-ils-1",
      clientId: "ils",
      name: "Bol",
      pain: "Bila je u nekom salonu i bolelo ju je ili je čula od nekoga da laserska epilacija boli.",
      sell: "Laserska epilacija u Infinity-ju ne boli.",
      order: 1000,
    },
    {
      id: "a-ils-2",
      clientId: "ils",
      name: "Rezultati",
      pain: "Sumnja u rezultate, čula je od nekoga da je bio na laserskoj epilaciji da i dalje ima dlake ili je bila u nekom salonu koji joj nije doneo rezultate.",
      sell: "Četiri talasne dužine (svi tipovi)\nZagarantovani rezultati\nSombor preko 2000 žena pomogli",
      order: 2000,
    },
    {
      id: "a-ils-3",
      clientId: "ils",
      name: "Higijena",
      pain: "Bojim se da ću otići i da će sve biti prljavo, da će me dodirivati sonda koja je prethodno dodirivala nekog drugog.",
      sell: "1. Jednokratni papir i štapići\n2. Menjanje rukavica za svaku klijentkinju\n3. Detaljna dezinfikacija sonde nakon svakog tretmana\n4. Svakodnevno čišćenje studija\n5. Termini raspoređeni tako da tehničar stigne da zameni alate i dezinfikuje ih\n6. Peškiri koji se peru za svaku klijentkinju",
      order: 3000,
    },
    {
      id: "a-ils-4",
      clientId: "ils",
      name: "Sezona",
      pain: "Želi da joj koža do leta bude glatka i shvata da ako krene u jesen do leta je oslobođena dlačica.",
      sell: "Sezonska urgentnost - ako sada krene, do leta je završila.",
      order: 4000,
    },
    {
      id: "a-ils-5",
      clientId: "ils",
      name: "Sigurne Ruke",
      pain: "Zašto bih vama verovala?",
      sell: "Medicinski laser, sertifikati, Dr. Ana kao nadzornik",
      order: 5000,
    },
    {
      id: "a-ils-6",
      clientId: "ils",
      name: "Broj Tretmana",
      pain: "",
      sell: "",
      order: 6000,
    },
    {
      id: "a-ils-7",
      clientId: "ils",
      name: "Studenti Popust",
      pain: "",
      sell: "",
      order: 7000,
    },
    {
      id: "a-sk-1",
      clientId: "skeylo",
      name: "Vreme",
      pain: "Nemaju vremena da kreiraju kontent.",
      sell: "30 kreativa za 3 sata\nDostavljeni spremni za upload\nMogućnost delegacije upload-ovanja",
      order: 1000,
    },
    {
      id: "a-sk-2",
      clientId: "skeylo",
      name: "Fake Podcast",
      pain: "Videli su puno fejk podkasta na društvenim mrežama i izgleda im loše",
      sell: "Voditelj u paketu\nDve kamere",
      order: 2000,
    },
    {
      id: "a-sk-3",
      clientId: "skeylo",
      name: "Founder Kreative",
      pain: "Nemaju dovoljno kreativa za Meta Ads",
      sell: 'Mogućnost realizacije Q/A videa kao "Meta Ad ready" - Founder Led Video',
      order: 3000,
    },
    {
      id: "a-sk-4",
      clientId: "skeylo",
      name: "Marketing",
      pain: "Videli su na internetu i misle da mogu sami u studiju da urade isto.",
      sell: "U paketu dobijaju marketara koji je izgenerisao preko xy miliona pregleda u svojoj karijeri. Zna kako da istraži industriju, smisli pitanja i iz klijenta izvuče ono što publika želi da gleda.",
      order: 4000,
    },
    {
      id: "a-sk-5",
      clientId: "skeylo",
      name: "Autoritet",
      pain: "Njegova publika nije upućena u to koliko je on stručan, koliko je sposoban i koliko zna o svojoj industriji. Njegova reč ne znači koliko bi trebala da znači.",
      sell: "Kontent koji uspostavlja autoritet.",
      order: 5000,
    },
    {
      id: "a-sk-6",
      clientId: "skeylo",
      name: "Funnel Entrance",
      pain: "",
      sell: "",
      order: 6000,
    },
  ];
  FALLBACK.creatives = [];
  FALLBACK.creativeComments = [];
  FALLBACK.creativeNotes = [];
  FALLBACK.schedules = [];
  FALLBACK.reports = [];
  FALLBACK.finances = [];
  FALLBACK.expenses = [];
  FALLBACK.tasks = [];
  FALLBACK.models = [
    {
      id: "m-sara-ils",
      name: "Sara ILS",
      phone: "",
      instagram: "",
      photo: "/people/modeli/sara.webp",
      order: 1,
      createdAt: 1791750000000,
    },
    {
      id: "m-filip-dino",
      name: "Filip Dino",
      phone: "",
      instagram: "",
      photo: "/people/modeli/filip.webp",
      order: 2,
      createdAt: 1791750000001,
    },
    {
      id: "m-ognjen-stamenic",
      name: "Ognjen Stameni\u0107",
      phone: "",
      instagram: "",
      photo: "/people/modeli/ognjen.webp",
      order: 3,
      createdAt: 1791750000002,
    },
    {
      id: "m-ana-kasap",
      name: "dr Ana Kasap",
      phone: "",
      instagram: "",
      photo: "/people/modeli/ana.webp",
      order: 4,
      createdAt: 1791750000003,
    },
    {
      id: "m-branka-kasap",
      name: "Branka Kasap",
      phone: "",
      instagram: "",
      photo: "/people/modeli/branka.webp",
      order: 5,
      createdAt: 1791750000004,
    },
    {
      id: "m-tanja-ils",
      name: "Tanja ILS",
      phone: "",
      instagram: "",
      photo: "/people/modeli/tanja.webp",
      order: 6,
      createdAt: 1791750000005,
    },
    {
      id: "m-mila-juric",
      name: "Mila Juri\u0107",
      phone: "",
      instagram: "",
      photo: "/people/modeli/mila.webp",
      order: 7,
      createdAt: 1791750000006,
    },
    {
      id: "m-tara-stojsic",
      name: "Tara Stoj\u0161i\u0107",
      phone: "",
      instagram: "",
      photo: "",
      order: 8,
      createdAt: 1791750000007,
    },
    {
      id: "m-uros-djuric",
      name: "Uros Djuric",
      phone: "",
      instagram: "",
      photo: "",
      order: 9,
      createdAt: 1791750000008,
    },
  ];
  let DB = null,
    ASSETS = null;
  const api = {
    async add(col, data) {
      if (DB) {
        const ref = DB.collection(col).doc();
        await ref.set(data);
        return ref.id;
      }
      const id =
        col +
        "-" +
        Date.now().toString(36) +
        Math.random().toString(36).slice(2, 6);
      S[col].push({ id, ...data });
      refresh();
      return id;
    },
    async upd(col, id, data) {
      const loc = S[col].find((x) => x.id === id);
      if (loc) Object.assign(loc, data);
      if (DB) await DB.doc(col + "/" + id).update(data);
    },
    async set(col, id, data) {
      if (DB) {
        await DB.doc(col + "/" + id).set(data);
        return;
      }
      S[col] = S[col].filter((x) => x.id !== id);
      S[col].push({ id, ...data });
      refresh();
    },
    async del(col, id) {
      if (DB) {
        await DB.doc(col + "/" + id).delete();
        return;
      }
      S[col] = S[col].filter((x) => x.id !== id);
      refresh();
    },
  };
  function useLocal() {
    DB = null;
    S.mode = "local";
    for (const k of [
      "clients",
      "items",
      "scripts",
      "reports",
      "finances",
      "expenses",
      "tasks",
      "models",
      "cpages",
      "angles",
      "entities",
      "dayItems",
      "days",
      "leads",
      "notes",
      "comments",
      "creatives",
      "creativeComments",
      "creativeNotes",
      "schedules",
    ])
      S[k] = FALLBACK[k].map((x) => ({
        ...x,
        models: x.models ? [...x.models] : undefined,
      }));
    S.ready = true;
    refresh();
  }
  (async () => {
    let db = null;
    try {
      db =
        window.claude && window.claude.use
          ? await window.claude.use("db")
          : null;
    } catch (e) {
      db = null;
    }
    if (!db) {
      useLocal();
      return;
    }
    DB = db;
    S.mode = "db";
    try {
      ASSETS = await window.claude.use("assets");
    } catch (e) {
      ASSETS = null;
    }
    const got = {};
    const sub = (col) =>
      DB.collection(col)
        .orderBy("order")
        .onSnapshot(
          (snap) => {
            S[col] = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            got[col] = true;
            if (col === "comments") onComments();
            if (col === "creativeComments") onCreativeComments();
            if (col === "creativeNotes") onCreativeNotes();
            if (
              [
                "clients",
                "items",
                "scripts",
                "reports",
                "finances",
                "expenses",
                "tasks",
                "models",
                "cpages",
                "angles",
                "entities",
                "dayItems",
                "days",
                "leads",
                "notes",
                "comments",
                "creatives",
                "creativeComments",
                "creativeNotes",
                "schedules",
              ].every((k) => got[k])
            ) {
              S.ready = true;
              refresh(col);
            }
          },
          () => {
            if (!S.ready) useLocal();
          },
        );
    sub("clients");
    sub("items");
    sub("scripts");
    sub("reports");
    sub("finances");
    sub("expenses");
    sub("tasks");
    sub("models");
    sub("cpages");
    sub("angles");
    sub("entities");
    sub("dayItems");
    sub("days");
    sub("leads");
    sub("notes");
    sub("comments");
    sub("creatives");
    sub("creativeComments");
    sub("creativeNotes");
    sub("schedules");
  })();
  function refresh(col) {
    if (!$("#pm").hidden) renderPM();
    if (!$("#mh").hidden) renderMH();
    if (!$("#rp").hidden) renderRP();
    if (!$("#fin").hidden && $("#wiz").hidden) renderFIN();
    if (!$("#money").hidden) renderMONEY();
    if (!$("#tasks").hidden && !tBusy) renderTASKS();
    if (!$("#general").hidden) renderGEN();
    if (NT && !$("#gp").hidden) NT.sync();
    if (!$("#cplat").hidden) renderCP();
    if (!$("#cockpit").hidden && !edrag) renderCK();
    if (!$("#cal").hidden && !edrag) renderCalPage();
    if (!$("#build").hidden) renderBuild();
    if (dayOpen && !$("#dayp").hidden) renderDay(false);
    if (!$("#angles").hidden && !$("#angBody").contains(document.activeElement))
      renderANG();
    if (!$("#models").hidden) renderMODELS();
    if (!$("#mwiz").hidden) renderPick();
    if (!$("#dash").hidden) {
      updateDashEarn();
      updateDashTasks();
      updateGenAvs();
      updLeadCard();
    }
    if (!$("#lm").hidden && !ldrag) renderLM();
    if (!$("#ld").hidden) renderLD();
    if (!$("#rv").hidden) renderRV();
    if (!$("#cm").hidden && !drag) renderCM();
    if (!$("#ed").hidden) syncEditorFromStore(col);
    if (!$("#fc").hidden) {
      renderFC();
      fcSyncViewer();
    }
    syncModelNames();
    syncSchedules();
  }

  /* ---------------- routing ---------------- */
  const SCREENS = [
    "login",
    "dash",
    "lm",
    "ld",
    "cockpit",
    "cal",
    "build",
    "cplat",
    "angles",
    "general",
    "gp",
    "models",
    "tasks",
    "pm",
    "mh",
    "fin",
    "money",
    "rp",
    "rv",
    "cm",
    "ed",
    "fc",
  ];
  let view = { name: "dash" };
  function show(id) {
    setTimeout(() => {
      try {
        dwRender();
        updBar();
      } catch (e) {}
    }, 0);
    SCREENS.forEach((s) => {
      const el = $("#" + s);
      if (s === id) {
        if (el.hidden) {
          el.hidden = false;
          el.classList.remove("leave");
          el.classList.add("enter");
        }
      } else el.hidden = true;
    });
    scrollTo(0, 0);
  }
  function nav(h) {
    navAt = performance.now();
    if (location.hash.slice(1) === h) {
      route();
      return;
    }
    location.hash = h;
  }
  function route() {
    curHash = location.hash.slice(1);
    closeSlash();
    closePops();
    clearCcHl();
    if (!me) {
      show("login");
      return;
    }
    const h = location.hash.slice(1);
    if (NT) NT.leave(h);
    if (
      view.name === "ed" &&
      h !== (view.col === "cpages" ? "p-" : "s-") + view.id
    )
      flushSave();
    if (!h.startsWith("fc-")) fcCloseViewer();
    $("#vcta").hidden = true;
    if (h === "projects") {
      applyTheme(null);
      view = { name: "pm" };
      show("pm");
      firstPM = true;
      renderPM();
    } else if (h === "general") {
      applyTheme(null);
      view = { name: "general" };
      show("general");
      firstGen = true;
      renderGEN();
    } else if (h.startsWith("mg-")) {
      view = { name: "general", id: h.slice(3) };
      show("general");
      firstGen = true;
      renderGEN();
    } else if (h.startsWith("g-")) {
      const sp = (S.notes.find((n) => n.id === h.slice(2)) || {}).spaceId;
      applyTheme(
        (sp && (S.items.find((i) => i.id === sp) || {}).clientId) || null,
      );
      view = { name: "gp", id: h.slice(2) };
      show("gp");
      if (NT) NT.open(view.id);
    } else if (h === "models") {
      applyTheme(null);
      view = { name: "models" };
      show("models");
      firstModels = true;
      renderMODELS();
    } else if (h === "tasks") {
      applyTheme(null);
      view = { name: "tasks" };
      show("tasks");
      firstTasks = true;
      renderTASKS();
    } else if (h === "money") {
      view = { name: "money" };
      show("money");
      firstMoney = true;
      moneyYM = null;
      renderMONEY();
    } else if (h.startsWith("f-")) {
      view = { name: "fin", id: h.slice(2) };
      show("fin");
      firstFIN = true;
      renderFIN();
    } else if (h.startsWith("rv-")) {
      view = { name: "rv", id: h.slice(3) };
      show("rv");
      rvLoaded = null;
      renderRV();
    } else if (h.startsWith("r-")) {
      view = { name: "rp", id: h.slice(2) };
      show("rp");
      firstRP = true;
      renderRP();
    } else if (h.startsWith("m-")) {
      view = { name: "mh", id: h.slice(2) };
      show("mh");
      firstMH = true;
      renderMH();
    } else if (h.startsWith("cm-")) {
      view = { name: "cm", id: h.slice(3) };
      show("cm");
      firstCM = true;
      renderCM();
    } else if (h.startsWith("fc-")) {
      const x = h.slice(3),
        k = x.indexOf("."),
        mid = k < 0 ? x : x.slice(0, k),
        cid = k < 0 ? null : x.slice(k + 1) || null;
      const same = view.name === "fc" && view.id === mid && !$("#fc").hidden;
      view = { name: "fc", id: mid, cid };
      if (!same) {
        show("fc");
        firstFC = true;
      }
      renderFC();
      fcSyncViewer();
    } else if (h.startsWith("s-")) {
      view = { name: "ed", id: h.slice(2), col: "scripts" };
      show("ed");
      openEditor(view.id, "scripts");
    } else if (h.startsWith("p-")) {
      view = { name: "ed", id: h.slice(2), col: "cpages" };
      show("ed");
      openEditor(view.id, "cpages");
    } else if (h === "leads") {
      applyTheme(null);
      view = { name: "lm" };
      show("lm");
      firstLM = true;
      renderLM();
    } else if (h.startsWith("l-")) {
      applyTheme(null);
      view = { name: "ld", id: h.slice(2) };
      show("ld");
      firstLD = true;
      renderLD();
    } else if (h === "cockpit") {
      view = { name: "cockpit" };
      show("cockpit");
      firstCK = true;
      renderCK();
    } else if (h === "cal") {
      view = { name: "cal" };
      show("cal");
      $("#calMain").dataset.drawn = "";
      renderCalPage();
    } else if (h.startsWith("build-")) {
      view = { name: "build", id: h.slice(6) };
      buildSel = new Set();
      buildLast = null;
      show("build");
      firstBuild = true;
      renderBuild();
    } else if (h.startsWith("cp-")) {
      view = { name: "cplat", id: h.slice(3) };
      show("cplat");
      firstCP = true;
      renderCP();
    } else if (h.startsWith("ang-")) {
      view = { name: "angles", id: h.slice(4) };
      show("angles");
      firstANG = true;
      renderANG();
    } else {
      applyTheme(null);
      view = { name: "dash" };
      show("dash");
      updateDashEarn();
      updateDashTasks();
      updateGenAvs();
      updLeadCard();
    }
  }
  var curHash = location.hash.slice(1),
    navAt = 0;
  window.addEventListener("hashchange", () => {
    const h = location.hash.slice(1),
      now = performance.now();
    /* a back/forward step that lands within 1.6s of a horizontal trackpad swipe and was not started by the app = the browser's swipe gesture: undo it */
    if (
      h !== curHash &&
      now - (typeof lastHWheel === "number" ? lastHWheel : 0) < 1600 &&
      now - navAt > 800
    ) {
      try {
        history.replaceState(
          history.state,
          "",
          location.href.split("#")[0] + "#" + curHash,
        );
      } catch (err) {
        location.hash = curHash;
      }
      return;
    }
    if (typeof dwBlocking === "function" && dwBlocking() && $("#dwo").hidden)
      dwOpen();
    route();
  });
  document.addEventListener("click", (e) => {
    const g = e.target.closest("[data-go]");
    if (g) {
      nav(g.dataset.go);
      return;
    }
    const s = e.target.closest("[data-soon]");
    if (s) {
      toast(s.dataset.soon + " stiže uskoro");
      return;
    }
    const sw = e.target.closest("[data-switch]");
    if (sw) {
      switchTo(TEAM.find((t) => t.id === sw.dataset.switch));
      return;
    }
    if (e.target.closest("[data-signout]")) {
      closeSwitch();
      me = null;
      store.del();
      DW = null;
      clearInterval(dwTick);
      dwRender();
      applyTheme(null);
      OS.signOut().finally(() => location.replace(location.pathname));
      return;
    }
    const lo = e.target.closest("[data-logout]");
    if (lo) {
      $("#swp").hidden ? openSwitch(lo) : closeSwitch();
      return;
    }
    if (!$("#swp").hidden && !e.target.closest("#swp")) closeSwitch();
  });
  /* brza promena osobe: klik na sebe gore desno */
  const ROLES = {
    filip: "Skripte · Meta",
    mihajlo: "Snimanje · Montaža",
    luka: "Sajtovi · Ads",
    nina: "Organizacija",
  };
  const CHECK = SV('<path d="m5 12 5 5 9-10"/>');
  function openSwitch(anchor) {
    const p = $("#swp");
    p.innerHTML =
      `<div class="swh">Promeni osobu</div>` +
      TEAM.map((u) => {
        const cur = me && u.id === me.id;
        return `<button type="button" class="swi${cur ? " cur" : ""}" role="menuitemradio" aria-checked="${cur}" data-switch="${u.id}"><img src="${IMG[u.id]}" alt=""><span class="swt"><b>${esc(u.name)}</b><small>${ROLES[u.id] || ""}</small></span>${cur ? `<span class="swc">${CHECK}</span>` : ""}</button>`;
      }).join("") +
      `<button type="button" class="swi out" role="menuitem" data-signout>Odjavi se</button>`;
    $$("[data-logout]").forEach((b) => b.setAttribute("aria-expanded", "true"));
    const r = anchor.getBoundingClientRect();
    p.style.top = r.bottom + 8 + "px";
    p.style.right = Math.max(12, innerWidth - r.right) + "px";
    p.hidden = false;
  }
  function closeSwitch() {
    $("#swp").hidden = true;
    $$("[data-logout]").forEach((b) =>
      b.setAttribute("aria-expanded", "false"),
    );
  }
  $$("[data-logout]").forEach((b) => {
    b.setAttribute("aria-haspopup", "menu");
    b.setAttribute("aria-expanded", "false");
    b.insertAdjacentHTML(
      "beforeend",
      '<svg class="mecv" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>',
    );
  });
  let switching = false;
  async function switchTo(u) {
    closeSwitch();
    if (!u || switching || (me && me.id === u.id)) return;
    const pass = OS.savedPass();
    if (!pass) {
      toast("Odjavi se pa izaberi osobu");
      return;
    }
    switching = true;
    try {
      await flushSave();
      if (NT) await NT.flush();
    } catch (e) {}
    let slug;
    try {
      slug = await OS.signIn(u.id, pass);
    } catch (x) {
      switching = false;
      toast("Promena nije uspela");
      return;
    }
    switching = false;
    const n = TEAM.find((t) => t.id === slug);
    if (!n) return;
    clearInterval(dwTick);
    applyTheme(null);
    store.set(n.id);
    login(n);
    toast("Sada si " + n.name);
  }
  function login(u) {
    me = u;
    $$(".meImg").forEach((i) => (i.src = IMG[u.id]));
    $$(".meName").forEach((n) => (n.textContent = u.name));
    $("#heroImg").src = IMG[u.id];
    $("#heroImg").alt = u.name;
    $("#startWord").textContent = u.id === "filip" ? "Grinding" : "Working";
    const sbg = $(".card.start .sbg img");
    sbg.dataset.def ||= sbg.getAttribute("src");
    sbg.src = START_BG[u.id] || sbg.dataset.def;
    // Luka: Start vodi na njegove taskove umesto na Projects
    $(".card.start").dataset.go = u.id === "luka" ? "tasks" : "projects";
    renderGreeting(u);
    earnShown = -1;
    updateDashCal();
    updLeadCard();
    route();
    dwLoad();
  }
  $(".card.start").addEventListener("click", () => {
    if (me && me.id === "luka") tView = "member";
  });
  const team = $("#team");
  TEAM.forEach((u) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "tp";
    b.dataset.id = u.id;
    b.setAttribute("aria-pressed", "false");
    b.innerHTML = `<span class="av"><img src="${IMG[u.id]}" alt=""></span>${u.name}`;
    b.onclick = () => {
      team
        .querySelectorAll(".tp")
        .forEach((x) => x.setAttribute("aria-pressed", "false"));
      b.setAttribute("aria-pressed", "true");
      $("#err").textContent = "";
      const saved = OS.savedPass();
      if (saved) {
        $("#pass").value = saved;
        $("#lgForm").requestSubmit();
      } else $("#pass").focus();
    };
    team.appendChild(b);
  });
  $("#lgForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const pick = team.querySelector('.tp[aria-pressed="true"]'),
      pass = $("#pass").value,
      err = $("#err");
    if (!pick) {
      err.textContent = "Izaberi sebe.";
      return shake($("#lgCard"));
    }
    if (!pass) {
      err.textContent = "Unesi lozinku.";
      return shake($("#lgCard"));
    }
    const btn = $("#lgForm .btn");
    btn.disabled = true;
    let slug;
    try {
      slug = await OS.signIn(pick.dataset.id, pass);
    } catch (x) {
      btn.disabled = false;
      err.textContent =
        x && x.code === "not_member"
          ? "Ova osoba nije u timu."
          : x && x.code === "not_configured"
            ? "Lozinka nije podešena na serveru (OS_TEAM_PASSWORD)."
            : x && x.code === "network"
              ? "Nema veze. Probaj ponovo."
              : "Pogrešna lozinka.";
      $("#pass").select();
      return shake($("#lgCard"));
    }
    btn.disabled = false;
    const u = TEAM.find((t) => t.id === slug);
    if (!u) {
      err.textContent = "Ova osoba nije u timu.";
      return shake($("#lgCard"));
    }
    err.textContent = "";
    store.set(u.id);
    $("#pass").value = "";
    $("#login").classList.add("leave");
    setTimeout(() => login(u), reduce ? 0 : 380);
  });
  function shake(el) {
    el.classList.remove("shake");
    el.offsetWidth;
    el.classList.add("shake");
  }

  /* ---------------- shared helpers ---------------- */
  const THEMES = { ils: "theme-ils", nina: "theme-nina", dark: "theme-dark" };
  function applyTheme(clientId) {
    let t = THEMES[clientId] || null;
    if (me && me.id === "nina" && t !== "theme-ils") t = "theme-nina";
    Object.values(THEMES).forEach((c) =>
      document.documentElement.classList.toggle(c, c === t),
    );
  }
  const LOGOS = {
    skeylo: { src: ICON, cls: "sk" },
    ils: { src: "/os-app/img/125767882c.jpg", cls: "" },
  };
  /* logo otpremljen pri dodavanju klijenta (c.logo) ima prednost nad ugrađenim */
  const logoOf = (c) => (c.logo ? { src: c.logo, cls: "" } : LOGOS[c.id]);
  function logo(c, cls) {
    const L = logoOf(c);
    return L
      ? `<span class="${cls} ${L.cls}"><img src="${esc(L.src)}" alt=""></span>`
      : `<span class="${cls}">${esc((c.name || "?").trim().charAt(0).toUpperCase())}</span>`;
  }
  function monthIndex(it) {
    return it.year * 12 + (it.month - 1);
  }
  function currentMonthItem(items) {
    const ms = items.filter((i) => i.type === "month");
    return ms.length
      ? ms.reduce((a, b) => (monthIndex(b) > monthIndex(a) ? b : a))
      : null;
  }
  function markFresh(id) {
    S.fresh.add(id);
    setTimeout(() => S.fresh.delete(id), 1200);
  }
  function errMsg(e) {
    return e && e.code === "quota_exceeded"
      ? "Baza je puna. Obriši stare stavke."
      : "Nemaš dozvolu za ovu izmenu.";
  }
  function dragScroll(b, ignore) {
    let down = false,
      moved = false,
      x0 = 0,
      s0 = 0;
    b.addEventListener("pointerdown", (e) => {
      if (
        e.pointerType !== "mouse" ||
        e.button !== 0 ||
        (ignore && e.target.closest(ignore))
      )
        return;
      down = true;
      moved = false;
      x0 = e.clientX;
      s0 = b.scrollLeft;
    });
    addEventListener("pointermove", (e) => {
      if (!down) return;
      const dx = e.clientX - x0;
      if (!moved && Math.abs(dx) > 6) {
        moved = true;
        b.classList.add("dragging");
      }
      if (moved) b.scrollLeft = s0 - dx;
    });
    addEventListener("pointerup", () => {
      if (!down) return;
      down = false;
      if (moved) {
        b.classList.remove("dragging");
        const w = b.querySelector(".col");
        if (w) {
          const step =
            w.offsetWidth + parseFloat(getComputedStyle(b).columnGap || 20);
          b.scrollTo({
            left: Math.round(b.scrollLeft / step) * step,
            behavior: "smooth",
          });
        }
      }
    });
    b.addEventListener(
      "click",
      (e) => {
        if (moved) {
          e.stopPropagation();
          e.preventDefault();
          moved = false;
        }
      },
      true,
    );
  }

  /* ---------------- project manager ---------------- */
  let firstPM = true;
  function renderPM() {
    if ($("#pm").hidden) return;
    const root = $("#clients");
    if (!S.ready) {
      root.innerHTML = '<div class="state">Učitavam projekte…</div>';
      return;
    }
    if (!S.clients.length) {
      root.innerHTML =
        '<div class="state"><b>Još nema klijenata</b>Dodaj prvog klijenta i otvori mu mesec.<button class="pill solid" data-add-client>Novi klijent</button></div>';
      return;
    }
    const anim = firstPM;
    firstPM = false;
    const d = (v) =>
      anim
        ? ` style="animation-delay:${v.toFixed(2)}s"`
        : ' style="animation:none"';
    const sl = root.scrollLeft;
    root.innerHTML = S.clients
      .map((c, ci) => {
        const items = S.items.filter((i) => i.clientId === c.id);
        const list = [
          ...items
            .filter((i) => i.type !== "platform")
            .sort((a, b) => (a.order || 0) - (b.order || 0)),
        ];
        const cur = currentMonthItem(items);
        const addLbl = c.kind === "internal" ? "Novi projekat" : "Novi mesec";
        const rows = list
          .map((it, i) => {
            const fresh = S.fresh.has(it.id);
            return `<button class="row${it === cur ? " current" : ""}${fresh ? " new" : ""}" data-item="${esc(it.id)}"${fresh ? "" : d(0.2 + ci * 0.1 + i * 0.05)}>${logo(c, "ri")}<span class="tt">${esc(it.title)}</span>${it === cur ? '<span class="dot"></span>' : ""}${IC.go}</button>`;
          })
          .join("");
        return `<section class="col" style="--c:${esc(c.color || "#e1802c")};${anim ? `animation-delay:${(0.05 + ci * 0.1).toFixed(2)}s` : "animation:none"}">
      <div class="col-h"><button class="cplat" data-plat="${esc(c.id)}" title="Client Platform">${logo(c, "lg-ic")}<h2>${esc(c.name)}</h2></button><span class="n">${list.length}</span><button class="plus" data-add="${esc(c.id)}" aria-label="${addLbl}">${IC.plus}</button></div>
      <div class="rows">${rows || `<div class="tnone">Klikni + gore da dodaš ${c.kind === "internal" ? "projekat" : "mesec"}</div>`}</div>
      ${c.kind === "internal" ? "" : `<div class="cfoot"><button class="cdel clogo" data-clogo="${esc(c.id)}">${SV('<rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/>')}${logoOf(c) ? "Promeni logo" : "Dodaj logo"}</button><button class="cdel" data-cdel="${esc(c.id)}">${SV('<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>')}Obriši klijenta</button></div>`}
    </section>`;
      })
      .join("");
    root.scrollLeft = sl;
  }
  $("#clients").addEventListener("click", (e) => {
    const cd = e.target.closest("[data-cdel]");
    if (cd) {
      const c = S.clients.find((x) => x.id === cd.dataset.cdel);
      if (c) openSheet("delclient", c);
      return;
    }
    const cl = e.target.closest("[data-clogo]");
    if (cl) {
      const c = S.clients.find((x) => x.id === cl.dataset.clogo);
      if (c) openSheet("logo", c);
      return;
    }
    const pl = e.target.closest("[data-plat]");
    if (pl) {
      nav("cp-" + pl.dataset.plat);
      return;
    }
    const add = e.target.closest("[data-add]");
    if (add) {
      const c = S.clients.find((x) => x.id === add.dataset.add);
      if (c) c.kind === "internal" ? openSheet("project", c) : addMonth(c);
      return;
    }
    if (e.target.closest("[data-add-client]")) {
      openSheet("client");
      return;
    }
    const t = e.target.closest("[data-item]");
    if (t) {
      const it = S.items.find((x) => x.id === t.dataset.item);
      if (!it) return;
      if (it.type === "platform") toast("Client Platform stiže uskoro");
      else nav("m-" + it.id);
    }
  });
  $("#addClient").onclick = () => openSheet("client");
  dragScroll($("#clients"));

  async function create(col, data, label) {
    try {
      const id = await api.add(col, data);
      markFresh(id);
      refresh();
      if (label)
        toast(label, async () => {
          try {
            await api.del(col, id);
            if (col === "clients")
              for (const it of S.items.filter((i) => i.clientId === id))
                await api.del("items", it.id);
          } catch (e) {
            toast("Brisanje nije uspelo. Probaj ponovo.");
          }
        });
      return id;
    } catch (e) {
      toast(errMsg(e));
      return null;
    }
  }
  function addMonth(c) {
    const items = S.items.filter((i) => i.clientId === c.id);
    const cur = currentMonthItem(items);
    let y, m;
    if (cur) {
      m = cur.month + 1;
      y = cur.year;
      if (m > 12) {
        m = 1;
        y++;
      }
    } else {
      const d = new Date();
      y = d.getFullYear();
      m = d.getMonth() + 1;
    }
    const title = MONTHS[m - 1] + (cur && y !== cur.year ? " " + y : "");
    create(
      "items",
      {
        clientId: c.id,
        type: "month",
        title,
        year: y,
        month: m,
        order: Date.now(),
        createdBy: me ? me.id : null,
      },
      `${MONTHS[m - 1]} otvoren za ${c.name}`,
    );
  }

  /* ---------------- month hub ---------------- */
  let firstMH = true;
  const IC_BOARD = SV(
    '<rect x="3" y="4" width="5" height="16" rx="1.5"/><rect x="9.5" y="4" width="5" height="11" rx="1.5"/><rect x="16" y="4" width="5" height="7" rx="1.5"/>',
  );
  function idHTML(it, c, sub) {
    return `${logo(c, "lg-ic")}<div><h1><span class="w"><span>${esc(it.title)}</span></span></h1><div class="sub">${esc(sub)}</div></div>`;
  }
  function renderMH() {
    if ($("#mh").hidden) return;
    const it = S.items.find((i) => i.id === view.id);
    const root = $("#mods");
    if (!S.ready) {
      $("#mhId").innerHTML = "";
      root.innerHTML = '<div class="state">Učitavam…</div>';
      return;
    }
    if (!it) {
      $("#mhId").innerHTML = "";
      root.innerHTML =
        '<div class="state"><b>Ovaj mesec ne postoji</b>Možda je obrisan.<button class="pill" data-go="projects">Nazad na projekte</button></div>';
      return;
    }
    const c = S.clients.find((x) => x.id === it.clientId) || {
      id: "",
      name: "",
      color: "#e1802c",
    };
    applyTheme(c.id);
    const anim = firstMH;
    firstMH = false;
    $("#mhId").style.setProperty("--c", c.color || "#e1802c");
    $("#mhId").innerHTML = idHTML(it, c, c.name);
    if (!anim) $("#mhId .w>span").style.animation = "none";
    const scripts = S.scripts.filter((s) => s.monthId === it.id);
    const max = Math.max(
      1,
      ...STATUSES.map(
        (st) => scripts.filter((s) => (s.status || "write") === st.id).length,
      ),
    );
    const bars = STATUSES.map((st, i) => {
      const n = scripts.filter((s) => (s.status || "write") === st.id).length;
      return `<div class="bar${n ? "" : " zero"}" style="--c:${st.c}"><span class="stag">${st.name}</span><span class="track"><span class="fill" style="--p:${(n / max).toFixed(3)};${anim ? `animation-delay:${(0.45 + i * 0.07).toFixed(2)}s` : "animation:none"}"></span></span><span class="cnt">${n}</span></div>`;
    }).join("");
    const word = (n) =>
      n % 10 === 1 && n % 100 !== 11
        ? "skripta"
        : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14)
          ? "skripte"
          : "skripti";
    root.innerHTML = `<button class="mod" data-go="cm-${esc(it.id)}" style="--c:${esc(c.color || "#e1802c")};${anim ? "animation-delay:.12s" : "animation:none"}">
    <div class="mod-l"><div class="mod-top"><span class="mi">${IC_BOARD}</span><span class="arrow" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span></div><div><h2>Content<br>Manager</h2><div class="tot"><b id="mhTot">${scripts.length}</b>${word(scripts.length)}</div>${(() => {
      const n = S.comments.filter(
        (c) => !c.resolved && scripts.some((x) => x.id === c.scriptId),
      ).length;
      return n
        ? `<div class="mh-cc">${IC.msg}<span>${n} ${ccWord(n)} klijenta</span></div>`
        : "";
    })()}</div></div>
  </button>${creativesCard(it, c, anim, 0.18)}${reportCard(it, c, anim)}${financeCard(it, c, anim)}${generalCard(it, c, anim)}`;
    if (anim) countUp($("#mhTot"), scripts.length);
  }

  const IC_REPORT = SV('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>');
  const IC_PLAY =
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l13-7.5z"/></svg>';
  const fmtDay = new Intl.DateTimeFormat("sr-Latn-RS", {
    day: "numeric",
    month: "short",
  });
  const fmtFull = new Intl.DateTimeFormat("sr-Latn-RS", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  function reportsOf(monthId) {
    return S.reports
      .filter((r) => r.monthId === monthId)
      .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
  }
  function rword(n) {
    return n % 10 === 1 && n % 100 !== 11 ? "izveštaj" : "izveštaja";
  }
  function reportCard(it, c, anim) {
    const reps = reportsOf(it.id);
    const latest = reps.slice(-3).reverse();
    const list = latest.length
      ? latest
          .map(
            (r, i) =>
              `<div class="rp-li" style="${anim ? `animation-delay:${(0.5 + i * 0.08).toFixed(2)}s` : "animation:none"}"><span class="n">${String(reps.indexOf(r) + 1).padStart(2, "0")}</span><span class="t">${esc(r.title || "Izveštaj")}</span><span class="d">${r.createdAt ? fmtDay.format(new Date(r.createdAt)) : ""}</span></div>`,
          )
          .join("")
      : '<div class="rp-none">Još nema izveštaja za ovaj mesec</div>';
    return `<button class="mod" data-go="r-${esc(it.id)}" style="--c:${esc(c.color || "#e1802c")};${anim ? "animation-delay:.24s" : "animation:none"}">
    <div class="mod-l"><div class="mod-top"><span class="mi">${IC_REPORT}</span><span class="arrow" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span></div><div><h2>Reporting<br>Dashboard</h2><div class="tot"><b>${reps.length}</b>${rword(reps.length)}</div></div></div>
  </button>`;
  }

  /* ---------------- money helpers ---------------- */
  const RATE = 117.2; // EUR -> RSD, fiksni kurs za sabiranje
  const MEMBERS = [
    { id: "nina", m: "#ff7eb6" },
    { id: "luka", m: "#5b9cf0" },
    { id: "mihajlo", m: "#a98bff" },
    { id: "filip", m: "#f3b04c" },
  ];
  const nf2 = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 2 });
  const toRSD = (v) =>
    v && v.amount ? (v.cur === "EUR" ? v.amount * RATE : v.amount) : 0;
  const money = (v, cur) =>
    cur === "EUR" ? "€" + nf2.format(v) : nf.format(Math.round(v)) + " RSD";
  const moneyV = (v) => (v && v.amount ? money(v.amount, v.cur) : "—");
  function parseAmount(t) {
    t = String(t || "").replace(/\s|€|rsd|din/gi, "");
    if (!t) return 0;
    if (t.includes(".") && t.includes(","))
      t = t.replace(/\./g, "").replace(",", ".");
    else if (t.includes(",")) {
      t = /^\d{1,3}(,\d{3})+$/.test(t)
        ? t.replace(/,/g, "")
        : t.replace(",", ".");
    } else if (/^\d{1,3}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, "");
    const n = parseFloat(t);
    return isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : 0;
  }
  function periodOf(it) {
    if (it && it.type === "month" && it.year)
      return { year: it.year, month: it.month };
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() + 1 };
  }
  const ymKey = (y, m) => y * 12 + (m - 1);
  const ymName = (y, m) => MONTHS[m - 1] + " " + y;
  function finOf(monthId) {
    return S.finances.find((f) => f.monthId === monthId);
  }
  function memberEarnings(uid) {
    return S.finances
      .filter((f) => f.shares && f.shares[uid] && f.shares[uid].amount)
      .map((f) => {
        const it = S.items.find((i) => i.id === f.monthId);
        const c = S.clients.find((x) => x.id === f.clientId) || {
          id: "",
          name: "Klijent",
        };
        return {
          f,
          it,
          c,
          v: f.shares[uid],
          rsd: toRSD(f.shares[uid]),
          key: ymKey(f.year, f.month),
          year: f.year,
          month: f.month,
        };
      });
  }
  function memberExpenses(uid) {
    return S.expenses
      .filter((x) => x.member === uid)
      .map((x) => ({ x, rsd: toRSD(x), key: ymKey(x.year, x.month) }));
  }
  function netFor(uid, key) {
    const e = memberEarnings(uid)
      .filter((r) => r.key === key)
      .reduce((a, r) => a + r.rsd, 0);
    const x = memberExpenses(uid)
      .filter((r) => r.key === key)
      .reduce((a, r) => a + r.rsd, 0);
    return { earned: e, spent: x, net: e - x };
  }
  const thisKey = () => {
    const d = new Date();
    return ymKey(d.getFullYear(), d.getMonth() + 1);
  };
  let earnShown = -1;
  function updateDashEarn() {
    if (!me || $("#dash").hidden) return;
    const v = S.ready ? Math.round(netFor(me.id, thisKey()).net) : 0;
    if (v === earnShown) return;
    if (earnShown < 0 && !S.ready) {
      $("#earn").textContent = "0";
      return;
    }
    earnShown = v;
    countUp($("#earn"), v);
  }
  function financeCard(it, c, anim) {
    const f = finOf(it.id);
    return `<button class="mod" data-go="f-${esc(it.id)}" style="--c:${esc(c.color || "#e1802c")};${anim ? "animation-delay:.36s" : "animation:none"}">
    <div class="mod-l"><div class="mod-top"><span class="mi">${SV('<circle cx="12" cy="12" r="9"/><path d="M15 9.5c-.5-1-1.6-1.5-3-1.5-1.7 0-3 .9-3 2.2 0 3 6 1.6 6 4.6 0 1.3-1.3 2.2-3 2.2-1.4 0-2.6-.6-3-1.6M12 6.5V8M12 16.8v1.7"/>')}</span><span class="arrow" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span></div><div><h2>Finances</h2><div class="tot">${f && f.paid && f.paid.amount ? `<b>${esc(f.paid.cur === "EUR" ? "€" + nf2.format(f.paid.amount) : nf.format(f.paid.amount))}</b>${f.paid.cur === "EUR" ? "uplaćeno" : "RSD uplaćeno"}` : "Još nije upisano"}</div></div></div>
  </button>`;
  }

  /* General projekta: stranice (notes) sa spaceId = id meseca/projekta */
  function generalCard(it, c, anim) {
    const ps = S.notes.filter((n) => n.spaceId === it.id),
      n = ps.length,
      top = ps
        .filter((p) => !p.parentId)
        .sort(
          (a, b) =>
            (b.updatedAt || b.createdAt || 0) -
            (a.updatedAt || a.createdAt || 0),
        )
        .slice(0, 3);
    return `<button class="mod" data-go="mg-${esc(it.id)}" style="--c:${esc(c.color || "#e1802c")};${anim ? "animation-delay:.42s" : "animation:none"}">
    <div class="mod-l"><div class="mod-top"><span class="mi">${SV('<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>')}</span><span class="arrow" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span></div><div><h2>General</h2><div class="tot">${n ? `<b>${n}</b>${n % 10 === 1 && n % 100 !== 11 ? "stranica" : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? "stranice" : "stranica"}` : "Marketing plan, optimizacije, CRO"}</div>${top.length ? `<div class="mh-gp">${top.map((p) => `<span>${esc(p.title || "Bez naslova")}</span>`).join("")}</div>` : ""}</div></div>
  </button>`;
  }

  /* ---------------- month finances page ---------------- */
  let firstFIN = true;
  function renderFIN() {
    if ($("#fin").hidden) return;
    const it = S.items.find((i) => i.id === view.id);
    const body = $("#finBody");
    if (!S.ready) {
      $("#finId").innerHTML = "";
      body.innerHTML = '<div class="state">Učitavam…</div>';
      return;
    }
    if (!it) {
      $("#finId").innerHTML = "";
      $("#finAdd").hidden = true;
      body.innerHTML =
        '<div class="state"><b>Ovaj mesec ne postoji</b><button class="pill" data-go="projects">Nazad na projekte</button></div>';
      return;
    }
    const c = S.clients.find((x) => x.id === it.clientId) || {
      id: "",
      name: "",
      color: "#e1802c",
    };
    applyTheme(c.id);
    const anim = firstFIN;
    firstFIN = false;
    const f = finOf(it.id);
    // ciklus/projekat nema svoj mesec: pokaži u koji mesec se zarada računa
    const perLbl =
      f && f.year && it.type !== "month" ? " · " + ymName(f.year, f.month) : "";
    $("#finId").style.setProperty("--c", c.color || "#e1802c");
    $("#finId").innerHTML =
      `${logo(c, "lg-ic")}<div><h1><span class="w"><span>Finances</span></span></h1><div class="sub">${esc(c.name)} · ${esc(it.title)}${esc(perLbl)}</div></div>`;
    if (!anim) $("#finId .w>span").style.animation = "none";
    $("#finBackLbl").textContent = it.title;
    const btn = $("#finAdd");
    btn.hidden = false;
    btn.innerHTML = f
      ? `${SV('<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>')}Izmeni`
      : `${IC.plus}Add Finances`;
    if (!f) {
      body.innerHTML = `<div class="fin-empty"><div class="coin">${SV('<path d="M15 9.5c-.5-1-1.6-1.5-3-1.5-1.7 0-3 .9-3 2.2 0 3 6 1.6 6 4.6 0 1.3-1.3 2.2-3 2.2-1.4 0-2.6-.6-3-1.6M12 6.5V8M12 16.8v1.7"/>', 2.2)}</div><b>Još nema finansija za ${esc(it.title)}</b>Upiši koliko je klijent platio i kako je novac podeljen.<button class="pill solid" data-fin-add>${IC.plus}Add Finances</button></div>`;
      return;
    }
    const paidR = toRSD(f.paid);
    const rows = MEMBERS.map((mb) => ({
      mb,
      u: TEAM.find((t) => t.id === mb.id),
      v: f.shares && f.shares[mb.id],
      r: toRSD(f.shares && f.shares[mb.id]),
    }));
    const sumR = rows.reduce((a, r) => a + r.r, 0);
    const rest = paidR - sumR;
    const base = Math.max(paidR, sumR, 1);
    const d = (v) =>
      anim ? `animation-delay:${v.toFixed(2)}s` : "animation:none";
    body.innerHTML = `
    <section class="fhero" style="${d(0.08)}">
      <div><div class="flbl">Klijent je platio</div>
      <div class="fbig"><span id="finPaid">${f.paid.cur === "EUR" ? "€" : ""}0</span><small>${f.paid.cur === "EUR" ? "EUR" : "RSD"}</small></div>
      ${f.paid.cur === "EUR" ? `<div class="fconv">≈ ${nf.format(Math.round(paidR))} RSD po kursu ${String(RATE).replace(".", ",")}</div>` : ""}</div>
      <div class="split">${rows
        .filter((r) => r.r > 0)
        .map(
          (r, i) =>
            `<i style="--m:${r.mb.m};flex:${(r.r / base).toFixed(4)};${d(0.4 + i * 0.1)}"></i>`,
        )
        .join(
          "",
        )}${rest > 0 ? `<i style="--m:color-mix(in srgb,var(--cream) 22%,transparent);flex:${(rest / base).toFixed(4)};${d(0.8)}"></i>` : ""}</div>
      <div class="legend">${rows.map((r) => `<span style="--m:${r.mb.m}">${esc(r.u.name)}</span>`).join("")}${rest > 0 ? '<span style="--m:color-mix(in srgb,var(--cream) 22%,transparent)">Skeylo</span>' : ""}</div>
    </section>
    <div class="people">${rows.map((r, i) => `<div class="pcard" style="--m:${r.mb.m};${d(0.2 + i * 0.08)}"><div class="pav"><img src="${IMG[r.u.id]}" alt=""></div><div class="nm">${esc(r.u.name)}</div><div class="am">${moneyV(r.v)}</div><div class="pc">${paidR ? Math.round((r.r / paidR) * 100) + "% od uplate" : ""}</div></div>`).join("")}</div>
    <div class="frest" style="${d(0.55)}"><span class="k"><img src="${ICON}" alt="">Ostaje Skeylu</span><span class="v${rest < 0 ? " neg" : ""}">${rest < 0 ? "−" : ""}${nf.format(Math.round(Math.abs(rest)))} RSD</span></div>
    <div class="fin-foot"><button class="pill danger" data-fin-del>${SV('<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>')}Obriši finansije</button></div>`;
    if (anim)
      countUpMoney(
        $("#finPaid"),
        f.paid.amount,
        f.paid.cur === "EUR" ? "€" : "",
      );
    else
      $("#finPaid").textContent =
        (f.paid.cur === "EUR" ? "€" : "") + nf2.format(f.paid.amount);
  }
  function countUpMoney(el, to, prefix) {
    if (reduce) {
      el.textContent = prefix + nf2.format(to);
      return;
    }
    const t0 = performance.now() + 300,
      ms = 1500;
    const step = (t) => {
      const p = Math.min(1, Math.max(0, (t - t0) / ms));
      if (p >= 1) {
        el.textContent = prefix + nf2.format(to);
        return;
      }
      el.textContent =
        prefix + nf.format(Math.round(to * (1 - Math.pow(1 - p, 4))));
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  $("#finBack").onclick = () => nav("m-" + view.id);
  $("#finAdd").onclick = () => openWizard();
  $("#finBody").addEventListener("click", (e) => {
    if (e.target.closest("[data-fin-add]")) openWizard();
    if (e.target.closest("[data-fin-del]")) openSheet("delfin");
  });

  /* ---------------- finance wizard ---------------- */
  let W = null;
  function openWizard() {
    const it = S.items.find((i) => i.id === view.id);
    if (!it) return;
    const c = S.clients.find((x) => x.id === it.clientId) || {
      id: "",
      name: "Klijent",
    };
    const f = finOf(it.id);
    const defCur = f && f.paid ? f.paid.cur : "RSD";
    W = {
      it,
      c,
      step: 0,
      vals: { paid: f && f.paid ? { ...f.paid } : { amount: 0, cur: defCur } },
      // ciklus/projekat: mesec se bira u poslednjem koraku; izmena zadržava sačuvani mesec
      per:
        it.type === "month" && it.year
          ? null
          : f && f.year
            ? { year: f.year, month: f.month }
            : periodOf(it),
    };
    MEMBERS.forEach(
      (mb) =>
        (W.vals[mb.id] =
          f && f.shares && f.shares[mb.id]
            ? { ...f.shares[mb.id] }
            : { amount: 0, cur: W.vals.paid.cur }),
    );
    W.steps = ["paid", ...MEMBERS.map((m) => m.id), "sum"];
    $("#wdots").innerHTML = W.steps.map(() => "<i></i>").join("");
    const el = $("#wiz");
    el.hidden = false;
    requestAnimationFrame(() => el.classList.add("open"));
    document.body.style.overflow = "hidden";
    drawStep(false);
  }
  function closeWizard() {
    const el = $("#wiz");
    el.classList.remove("open");
    document.body.style.overflow = "";
    setTimeout(
      () => {
        el.hidden = true;
        $("#wstage").innerHTML = "";
        W = null;
        renderFIN();
      },
      reduce ? 0 : 300,
    );
  }
  function stepHTML(k) {
    if (k === "sum") {
      const paidR = toRSD(W.vals.paid);
      const sumR = MEMBERS.reduce((a, m) => a + toRSD(W.vals[m.id]), 0);
      return `<h2 class="wq">Sve <span class="nmg">ok?</span></h2>
      <div class="wsum">
        <div class="r tot" style="animation-delay:.05s">${logo(W.c, "lg-ic")}<span>${esc(W.c.name)} je platio</span><b>${moneyV(W.vals.paid)}</b></div>
        ${MEMBERS.map((m, i) => {
          const u = TEAM.find((t) => t.id === m.id);
          return `<div class="r" style="animation-delay:${(0.1 + i * 0.06).toFixed(2)}s"><img src="${IMG[u.id]}" alt=""><span>${u.name}</span><b>${moneyV(W.vals[m.id])}</b></div>`;
        }).join("")}
        <div class="r" style="animation-delay:.4s"><span class="lg-ic sk"><img src="${ICON}" alt=""></span><span>Ostaje Skeylu</span><b>${nf.format(Math.round(paidR - sumR))} RSD</b></div>
        ${W.per ? `<div class="r wper" style="animation-delay:.46s"><span>Mesec zarade</span><div class="mswitch"><button type="button" data-wper="-1" aria-label="Prethodni mesec">${SV('<path d="m15 18-6-6 6-6"/>', 2.4)}</button><span id="wperT">${ymName(W.per.year, W.per.month)}</span><button type="button" data-wper="1" aria-label="Sledeći mesec">${SV('<path d="m9 18 6-6-6-6"/>', 2.4)}</button></div></div>` : ""}
      </div>`;
    }
    const v = W.vals[k];
    let ph, q;
    if (k === "paid") {
      const L = logoOf(W.c);
      ph = `<div class="wph logo ${(L && L.cls) || ""}" style="--m:${esc(W.c.color || "var(--orange)")}"><span class="glowb"></span>${L ? `<img src="${esc(L.src)}" alt="">` : `<span class="lg-ic" style="position:relative;z-index:2;width:100%;height:100%;font-size:60px;border-radius:34px">${esc(W.c.name.charAt(0))}</span>`}</div>`;
      q = `How much did <span class="nmg">the client</span> pay?`;
    } else {
      const u = TEAM.find((t) => t.id === k),
        m = MEMBERS.find((x) => x.id === k);
      ph = `<div class="wph" style="--m:${m.m}"><span class="glowb"></span><img src="${IMG[k]}" alt=""></div>`;
      q = `How much did <span class="nmg">${u.name}</span> earn?`;
    }
    return `${ph}<h2 class="wq">${q}</h2>
    <div class="amt"><input id="wamt" type="text" inputmode="decimal" autocomplete="off" placeholder="0" value="${v.amount ? nf2.format(v.amount) : ""}" aria-label="Iznos"></div>
    <div class="seg${v.cur === "EUR" ? " eur" : ""}" id="wseg"><span class="knob"></span><button type="button" class="${v.cur !== "EUR" ? "on" : ""}" data-cur="RSD">RSD</button><button type="button" class="${v.cur === "EUR" ? "on" : ""}" data-cur="EUR">EUR</button></div>
    <div class="whint" id="whint"></div>`;
  }
  function drawStep(back) {
    const st = $("#wstage");
    const old = st.querySelector(".wstep");
    if (old) {
      old.classList.remove("in", "back");
      old.classList.add("out");
      if (back) old.classList.add("back");
      setTimeout(() => old.remove(), 400);
    }
    const k = W.steps[W.step];
    const el = document.createElement("div");
    el.className = "wstep in" + (back ? " back" : "");
    el.innerHTML = stepHTML(k);
    st.appendChild(el);
    $$("#wdots i").forEach((d, i) => {
      d.classList.toggle("on", i === W.step);
      d.classList.toggle("done", i < W.step);
    });
    $("#wback").style.visibility = W.step === 0 ? "hidden" : "visible";
    $("#wnext").textContent = k === "sum" ? "Save" : "Next";
    const inp = el.querySelector("#wamt");
    if (inp) {
      setTimeout(
        () => {
          inp.focus();
          inp.select();
        },
        reduce ? 0 : 120,
      );
      updHint();
    }
  }
  function updHint() {
    const k = W.steps[W.step];
    const h = $("#whint");
    if (!h) return;
    const v = W.vals[k];
    if (k !== "paid" && W.vals.paid.amount && v.amount) {
      h.textContent =
        Math.round((toRSD(v) / toRSD(W.vals.paid)) * 100) + "% od uplate";
    } else if (k !== "paid") {
      h.textContent = "Ostavi prazno ako nije zaradio/la ništa";
    } else
      h.textContent =
        v.cur === "EUR" && v.amount
          ? "≈ " + nf.format(Math.round(v.amount * RATE)) + " RSD"
          : "";
  }
  $("#wstage").addEventListener("input", (e) => {
    if (e.target.id === "wamt") {
      W.vals[W.steps[W.step]].amount = parseAmount(e.target.value);
      updHint();
    }
  });
  $("#wstage").addEventListener("click", (e) => {
    const pb = e.target.closest("[data-wper]");
    if (pb && W && W.per) {
      const k = ymKey(W.per.year, W.per.month) + +pb.dataset.wper;
      W.per = { year: Math.floor(k / 12), month: (k % 12) + 1 };
      pb.closest(".mswitch").querySelector("span").textContent = ymName(
        W.per.year,
        W.per.month,
      );
      return;
    }
    const b = e.target.closest("#wseg [data-cur]");
    if (!b) return;
    const k = W.steps[W.step];
    W.vals[k].cur = b.dataset.cur;
    const seg = $("#wseg");
    seg.classList.toggle("eur", b.dataset.cur === "EUR");
    seg
      .querySelectorAll("button")
      .forEach((x) => x.classList.toggle("on", x === b));
    if (k === "paid")
      MEMBERS.forEach((m) => {
        if (!W.vals[m.id].amount) W.vals[m.id].cur = b.dataset.cur;
      });
    updHint();
    $("#wamt").focus();
  });
  $("#wstage").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      if (!e.repeat) wNext();
    }
  });
  $("#wnext").onclick = () => wNext();
  $("#wback").onclick = () => {
    if (W && W.step > 0) {
      W.step--;
      drawStep(true);
    }
  };
  $("#wclose").onclick = () => closeWizard();
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && W) closeWizard();
    else if (
      e.key === "Enter" &&
      !e.repeat &&
      W &&
      W.steps[W.step] === "sum" &&
      !$("#wiz").hidden &&
      !$("#wnext").disabled
    ) {
      e.preventDefault();
      wNext();
    }
  });
  async function wNext() {
    if (!W) return;
    const k = W.steps[W.step];
    if (k === "paid" && !W.vals.paid.amount) {
      shake($("#wstage .wstep"));
      $("#whint").textContent = "Upiši iznos koji je klijent platio";
      return;
    }
    if (k !== "sum") {
      W.step++;
      drawStep(false);
      return;
    }
    const btn = $("#wnext");
    btn.disabled = true;
    btn.textContent = "Čuvam…";
    const per = W.per || periodOf(W.it);
    const shares = {};
    MEMBERS.forEach((m) => {
      const v = W.vals[m.id];
      shares[m.id] = { amount: v.amount || 0, cur: v.cur };
    });
    const data = {
      monthId: W.it.id,
      clientId: W.it.clientId,
      paid: { amount: W.vals.paid.amount, cur: W.vals.paid.cur },
      shares,
      year: per.year,
      month: per.month,
      order: ymKey(per.year, per.month),
      updatedAt: Date.now(),
      updatedBy: me ? me.id : null,
    };
    try {
      await api.set("finances", W.it.id, data);
      burst();
      btn.disabled = false;
      firstFIN = true;
      closeWizard();
      toast("Finansije sačuvane");
    } catch (err) {
      btn.disabled = false;
      btn.textContent = "Save";
      toast(errMsg(err));
    }
  }
  function burst() {
    if (reduce) return;
    const r = $("#wnext").getBoundingClientRect();
    for (let i = 0; i < 26; i++) {
      const p = document.createElement("i");
      p.className = "burst";
      const a = Math.random() * Math.PI * 2,
        d = 80 + Math.random() * 180;
      p.style.left = r.left + r.width / 2 + "px";
      p.style.top = r.top + r.height / 2 + "px";
      p.style.setProperty("--x", Math.cos(a) * d + "px");
      p.style.setProperty("--y", Math.sin(a) * d - 60 + "px");
      p.style.setProperty("--r", Math.random() * 540 + "deg");
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 1000);
    }
  }

  /* ---------------- client platform ---------------- */
  const PICONS = {
    lock: '<rect x="4" y="10" width="16" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="m10.8 12.2 9.2-9.2M17 6l3 3M14 9l2 2"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    target:
      '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    doc: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>',
    folder:
      '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z"/>',
    star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/>',
    rocket:
      '<path d="M5 15c-1.5 1.5-2 5-2 5s3.5-.5 5-2M9 15l-3-3c1-4 4.5-9 12-9 0 7.5-5 11-9 12z"/><circle cx="15" cy="9" r="1.5"/>',
    megaphone:
      '<path d="M3 11v2a1 1 0 0 0 1 1h3l6 4V6L7 10H4a1 1 0 0 0-1 1zM17 8a5 5 0 0 1 0 8"/>',
    users:
      '<circle cx="9" cy="8" r="4"/><path d="M2 21v-1a7 7 0 0 1 14 0v1M16 4a4 4 0 0 1 0 8M22 21v-1a7 7 0 0 0-4-6.3"/>',
    camera:
      '<path d="M3 8a2 2 0 0 1 2-2h2l2-2h6l2 2h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><circle cx="12" cy="13" r="4"/>',
    video:
      '<rect x="2" y="6" width="14" height="12" rx="2"/><path d="m16 10 6-3v10l-6-3"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
    gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M5 12v9h14v-9M12 8S10 3 7.5 3 6 6 8 8M12 8s2-5 4.5-5S18 6 16 8"/>',
    heart:
      '<path d="M12 21s-8-5-8-11a5 5 0 0 1 8-4 5 5 0 0 1 8 4c0 6-8 11-8 11z"/>',
    globe:
      '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    calendar:
      '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    palette:
      '<path d="M12 3a9 9 0 1 0 0 18c1 0 1.5-.8 1.5-1.5 0-1-.8-1.4-.8-2.3 0-1 .8-1.7 1.8-1.7H17a4 4 0 0 0 4-4C21 6.6 17 3 12 3z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="7" r="1"/>',
    book: '<path d="M4 19V5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2zM4 19a2 2 0 0 0 2 2h14"/>',
    flag: '<path d="M5 21V4h11l-1 4 4 0-1 4H5"/>',
    money:
      '<circle cx="12" cy="12" r="9"/><path d="M15 9.5c-.5-1-1.6-1.5-3-1.5-1.7 0-3 .9-3 2.2 0 3 6 1.6 6 4.6 0 1.3-1.3 2.2-3 2.2-1.4 0-2.6-.6-3-1.6M12 6.5V8M12 16.8v1.7"/>',
    chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 21l1.9-5.4A8 8 0 1 1 21 12z"/>',
  };
  const picon = (k) => SV(PICONS[k] || PICONS.doc, 1.9);
  const fmtEdit = new Intl.DateTimeFormat("sr-Latn-RS", {
    day: "numeric",
    month: "short",
  });
  let firstCP = true;
  function cpHead(c, title, sub) {
    return `${logo(c, "lg-ic")}<div><h1><span class="w"><span>${esc(title)}</span></span></h1><div class="sub">${esc(sub)}</div></div>`;
  }
  function renderCP() {
    if ($("#cplat").hidden) return;
    const c = S.clients.find((x) => x.id === view.id);
    const g = $("#cpGrid");
    if (!S.ready) {
      $("#cpId").innerHTML = "";
      g.innerHTML = '<div class="state">Učitavam…</div>';
      return;
    }
    if (!c) {
      $("#cpId").innerHTML = "";
      g.innerHTML =
        '<div class="state"><b>Klijent ne postoji</b><button class="pill" data-go="projects">Nazad na projekte</button></div>';
      return;
    }
    applyTheme(c.id);
    const anim = firstCP;
    firstCP = false;
    $("#cpId").style.setProperty("--c", c.color || "#e1802c");
    $("#cpId").innerHTML = cpHead(c, "Client Platform", c.name);
    if (!anim) $("#cpId .w>span").style.animation = "none";
    const col = esc(c.color || "#e1802c");
    const angs = S.angles
      .filter((a) => a.clientId === c.id)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    const pages = S.cpages
      .filter((p) => p.clientId === c.id)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    const d = (i) =>
      anim
        ? `animation-delay:${(0.08 + i * 0.06).toFixed(2)}s`
        : "animation:none";
    g.innerHTML = `<div class="cptile ang" role="button" tabindex="0" data-go="ang-${esc(c.id)}" style="--c:${col};${d(0)}">
      <div class="mod-top"><span class="ci">${SV('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>', 1.9)}</span><span class="arrow" aria-hidden="true" style="width:46px;height:46px;border-radius:50%;display:grid;place-items:center;background:var(--grad);color:var(--on-accent)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" style="width:20px;height:20px"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span></div>
      <div><h3>Angles</h3><div class="meta2">${angs.length ? angs.length + (angs.length % 10 === 1 && angs.length % 100 !== 11 ? " ugao" : " uglova") : "Još nema uglova"}</div></div>
      ${
        angs.length
          ? `<div class="achips">${angs
              .slice(0, 8)
              .map(
                (a, i) =>
                  `<span class="achip" style="${anim ? `animation-delay:${(0.35 + i * 0.05).toFixed(2)}s` : "animation:none"}">${esc(a.name || "Bez naziva")}</span>`,
              )
              .join(
                "",
              )}${angs.length > 8 ? `<span class="achip">+${angs.length - 8}</span>` : ""}</div>`
          : ""
      }
    </div>
    ${pages
      .map(
        (
          p,
          i,
        ) => `<div class="cptile${S.fresh.has(p.id) ? " new" : ""}" role="button" tabindex="0" data-go="p-${esc(p.id)}" style="--c:${col};${d(i + 1)}">
      <div class="tools2"><button data-pedit="${esc(p.id)}" aria-label="Izmeni naziv i ikonicu">${SV('<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>')}</button></div>
      <span class="ci">${picon(p.icon)}</span>
      <div><h3>${esc(p.title || "Bez naziva")}</h3><div class="meta2">${p.updatedAt || p.createdAt ? "Izmenjeno " + fmtEdit.format(new Date(p.updatedAt || p.createdAt)) : "Otvori stranicu"}</div></div>
    </div>`,
      )
      .join("")}
    <button class="cptile add" data-pnew style="${d(pages.length + 1)}"><span class="ci">${IC.plus}</span>Nova stranica</button>`;
  }
  $("#cpNew").onclick = () => openPageSheet(null);
  $("#cpGrid").addEventListener(
    "click",
    (e) => {
      const ed = e.target.closest("[data-pedit]");
      if (ed) {
        e.stopPropagation();
        openPageSheet(S.cpages.find((p) => p.id === ed.dataset.pedit));
        return;
      }
      if (e.target.closest("[data-pnew]")) {
        openPageSheet(null);
        return;
      }
    },
    true,
  );
  $("#cpGrid").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const t = e.target.closest("[data-go]");
      if (t) nav(t.dataset.go);
    }
  });
  $("#cpGrid").addEventListener("pointermove", (e) => {
    const t = e.target.closest(".cptile");
    if (!t || !fine) return;
    const r = t.getBoundingClientRect();
    t.style.setProperty("--mx", e.clientX - r.left + "px");
    t.style.setProperty("--my", e.clientY - r.top + "px");
  });
  /* page sheet */
  let psPage = null,
    psIcon = "doc";
  const icg = $("#icgrid");
  icg.innerHTML = Object.keys(PICONS)
    .map(
      (k) =>
        `<button type="button" class="icopt" data-ic="${k}" aria-label="${k}">${picon(k)}</button>`,
    )
    .join("");
  icg.addEventListener("click", (e) => {
    const b = e.target.closest("[data-ic]");
    if (!b) return;
    psIcon = b.dataset.ic;
    icg
      .querySelectorAll(".icopt")
      .forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
  });
  function openPageSheet(p) {
    psPage = p || null;
    psIcon = p ? p.icon || "doc" : "doc";
    $("#psTitle").textContent = p ? "Izmeni stranicu" : "Nova stranica";
    $("#pok").textContent = p ? "Sačuvaj" : "Napravi";
    $("#pok").disabled = false;
    $("#pname").value = p ? p.title || "" : "";
    $("#perr").textContent = "";
    icg
      .querySelectorAll(".icopt")
      .forEach((x) =>
        x.setAttribute("aria-pressed", String(x.dataset.ic === psIcon)),
      );
    const s = $("#pscrim");
    s.hidden = false;
    requestAnimationFrame(() => s.classList.add("open"));
    setTimeout(() => $("#pname").focus(), 60);
  }
  function closePageSheet() {
    const s = $("#pscrim");
    s.classList.remove("open");
    setTimeout(() => (s.hidden = true), reduce ? 0 : 250);
  }
  $("#pcancel").onclick = closePageSheet;
  $("#pscrim").addEventListener("click", (e) => {
    if (e.target.id === "pscrim") closePageSheet();
  });
  $("#psheet").addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = $("#pname").value.trim();
    if (!title) {
      $("#perr").textContent = "Upiši naziv stranice.";
      shake($("#psheet"));
      return;
    }
    const b = $("#pok");
    b.disabled = true;
    try {
      if (psPage) {
        await api.upd("cpages", psPage.id, {
          title,
          icon: psIcon,
          updatedAt: Date.now(),
        });
        closePageSheet();
        refresh();
        toast("Stranica sačuvana");
      } else {
        const cid = view.name === "cplat" ? view.id : null;
        if (!cid) {
          b.disabled = false;
          return;
        }
        const id = await api.add("cpages", {
          clientId: cid,
          title,
          icon: psIcon,
          body: "",
          order: Date.now(),
          createdAt: Date.now(),
          createdBy: me ? me.id : null,
        });
        markFresh(id);
        closePageSheet();
        nav("p-" + id);
        setTimeout(() => {
          editor.focus();
        }, 150);
      }
    } catch (err) {
      b.disabled = false;
      $("#perr").textContent = errMsg(err);
    }
  });
  /* angles */
  let firstANG = true;
  const angTimers = {};
  function renderANG() {
    if ($("#angles").hidden) return;
    const c = S.clients.find((x) => x.id === view.id);
    const body = $("#angBody");
    if (!S.ready) {
      $("#angId").innerHTML = "";
      body.innerHTML = '<div class="state">Učitavam…</div>';
      return;
    }
    if (!c) {
      $("#angId").innerHTML = "";
      body.innerHTML = '<div class="state"><b>Klijent ne postoji</b></div>';
      return;
    }
    applyTheme(c.id);
    const anim = firstANG;
    firstANG = false;
    $("#angId").style.setProperty("--c", c.color || "#e1802c");
    $("#angId").innerHTML = cpHead(c, "Angles", c.name + " · Client Platform");
    if (!anim) $("#angId .w>span").style.animation = "none";
    const angs = S.angles
      .filter((a) => a.clientId === c.id)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    const IP = SV(
      '<path d="M10.3 21a1.9 1.9 0 0 0 3.4 0M12 2a6 6 0 0 0-6 6c0 7-3 9-3 9h18s-3-2-3-9a6 6 0 0 0-6-6z"/>',
    );
    const IS = SV('<path d="m2 8 4 10h12l4-10-6 4-4-6-4 6z"/>');
    body.innerHTML = `<div class="angwrap">
    <div class="anghead"><span>${SV('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="1"/>')}Angle</span><span>${IP}Pain Point</span><span>${IS}Selling Point</span><span></span></div>
    ${angs
      .map(
        (
          a,
          i,
        ) => `<div class="angrow${S.fresh.has(a.id) ? " new" : ""}" data-aid="${esc(a.id)}" style="${anim ? `animation-delay:${(0.08 + i * 0.05).toFixed(2)}s` : "animation:none"}">
      <div class="an"><textarea rows="1" data-f="name" placeholder="Naziv ugla">${esc(a.name || "")}</textarea></div>
      <div><div class="l2">Pain Point</div><textarea rows="1" data-f="pain" placeholder="Šta ih muči?">${esc(a.pain || "")}</textarea></div>
      <div><div class="l2">Selling Point</div><textarea rows="1" data-f="sell" placeholder="Kako im mi to rešavamo?">${esc(a.sell || "")}</textarea></div>
      <button class="adel" data-adel="${esc(a.id)}" aria-label="Obriši ugao">${SV('<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>')}</button>
    </div>`,
      )
      .join("")}
    <button class="angadd" data-anew>${IC.plus}Novi ugao</button>
  </div>`;
    body.querySelectorAll("textarea").forEach(autoGrow);
  }
  $("#angBack").onclick = () => nav("cp-" + view.id);
  $("#angNew").onclick = () => addAngle();
  async function addAngle() {
    const c = view.id;
    const max = S.angles
      .filter((a) => a.clientId === c)
      .reduce((m, a) => Math.max(m, a.order || 0), 0);
    try {
      const id = await api.add("angles", {
        clientId: c,
        name: "",
        pain: "",
        sell: "",
        order: max + 1000,
        createdAt: Date.now(),
      });
      markFresh(id);
      renderANG();
      setTimeout(() => {
        const t = $(`.angrow[data-aid="${CSS.escape(id)}"] textarea`);
        t && t.focus();
      }, 60);
    } catch (err) {
      toast(errMsg(err));
    }
  }
  $("#angBody").addEventListener("input", (e) => {
    const t = e.target.closest("textarea[data-f]");
    if (!t) return;
    autoGrow(t);
    const id = t.closest("[data-aid]").dataset.aid,
      f = t.dataset.f,
      v = t.value;
    const a = S.angles.find((x) => x.id === id);
    if (a) a[f] = v;
    const key = id + f;
    clearTimeout(angTimers[key]);
    angTimers[key] = setTimeout(
      () =>
        api
          .upd("angles", id, { [f]: f === "name" ? v.trim() : v })
          .catch((err) => toast(errMsg(err))),
      600,
    );
  });
  $("#angBody").addEventListener("focusout", (e) => {
    setTimeout(() => {
      if (!$("#angBody").contains(document.activeElement)) renderANG();
    }, 300);
  });
  $("#angBody").addEventListener("click", async (e) => {
    if (e.target.closest("[data-anew]")) {
      addAngle();
      return;
    }
    const d = e.target.closest("[data-adel]");
    if (!d) return;
    const a = S.angles.find((x) => x.id === d.dataset.adel);
    if (!a) return;
    const { id, ...data } = a;
    try {
      await api.del("angles", id);
      if (!DB) S.angles = S.angles.filter((x) => x.id !== id);
      renderANG();
      toast(`Obrisan ugao: ${a.name || "Bez naziva"}`, async () => {
        try {
          await api.set("angles", id, data);
          renderANG();
        } catch (err) {
          toast(errMsg(err));
        }
      });
    } catch (err) {
      toast(errMsg(err));
    }
  });

  /* ---------------- general + models ---------------- */
  const modelsSorted = () =>
    [...S.models].sort((a, b) =>
      (a.name || "").localeCompare(b.name || "", "sr"),
    );
  const initials = (n) =>
    (n || "?")
      .split(/\s+/)
      .filter((w) => /^[A-Za-zČĆŽŠĐčćžšđ]/.test(w) && !/^dr\.?$/i.test(w))
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join("") || "?";
  function avStack(n) {
    const ms = modelsSorted()
      .filter((m) => m.photo)
      .slice(0, n);
    const rest = S.models.length - ms.length;
    return (
      ms
        .map(
          (m, i) =>
            `<img src="${esc(m.photo)}" alt="" style="animation-delay:${(0.3 + i * 0.06).toFixed(2)}s">`,
        )
        .join("") +
      (rest > 0
        ? `<span style="animation-delay:${(0.3 + ms.length * 0.06).toFixed(2)}s">+${rest}</span>`
        : "")
    );
  }
  function updateGenAvs() {
    const el = $("#genAvs");
    if (!el) return;
    if (!S.ready) {
      el.innerHTML = "";
      return;
    }
    const sig = S.models.map((m) => m.id + (m.photo ? 1 : 0)).join();
    if (el.dataset.sig === sig) return;
    el.dataset.sig = sig;
    el.innerHTML = avStack(innerWidth < 600 ? 3 : 5);
  }
  let firstGen = true;
  function renderGEN() {
    if ($("#general").hidden) return;
    const anim = firstGen;
    firstGen = false;
    /* view.id = mesec/projekat: General tog projekta (#mg-{id}), bez Models kartice */
    const it = view.id && S.items.find((i) => i.id === view.id);
    const c =
      it &&
      (S.clients.find((x) => x.id === it.clientId) || {
        id: "",
        name: "",
        color: "#e1802c",
      });
    $("#genH").hidden = !!view.id;
    $("#genId").hidden = !view.id;
    $("#gmods").hidden = !!view.id;
    $("#genBack").dataset.go = view.id ? "m-" + view.id : "";
    $("#genBackLbl").textContent = view.id
      ? it
        ? it.title
        : "Projekti"
      : "Dashboard";
    if (view.id) {
      applyTheme(c ? c.id : null);
      $("#genId").style.setProperty("--c", (c && c.color) || "#e1802c");
      $("#genId").innerHTML = it
        ? `${logo(c, "lg-ic")}<div><h1><span class="w"><span>General</span></span></h1><div class="sub">${esc(c.name)} · ${esc(it.title)}</div></div>`
        : "";
      if (!S.ready)
        $("#gpages").innerHTML = '<div class="state">Učitavam…</div>';
      else if (!it) {
        $("#gpages").innerHTML =
          '<div class="state"><b>Ovaj projekat ne postoji</b>Možda je obrisan.<button class="pill" data-go="projects">Nazad na projekte</button></div>';
        return;
      }
      if (!anim && it) $("#genId .w>span").style.animation = "none";
      if (NT && S.ready) NT.hub(anim, view.id);
      return;
    }
    if (!anim) $("#general .phead .w>span").style.animation = "none";
    $("#gmods").innerHTML =
      `<button class="gmod" data-go="models" style="${anim ? "animation-delay:.1s" : "animation:none"}">
    <div class="mod-top"><span class="mi">${SV('<circle cx="9" cy="8" r="4"/><path d="M2 21v-1a7 7 0 0 1 14 0v1"/><path d="M16 4a4 4 0 0 1 0 8M22 21v-1a7 7 0 0 0-4-6.3"/>')}</span><span class="avstack">${S.ready ? avStack(4) : ""}</span></div>
    <div><h2>Models</h2><div class="tot"><b>${S.models.length}</b>${S.models.length % 10 === 1 && S.models.length % 100 !== 11 ? "model" : "modela"}</div></div>
  </button>`;
    if (NT) NT.hub(anim, null);
  }
  let firstModels = true,
    mq = "";
  function igUrl(v) {
    v = (v || "").trim();
    if (!v) return "";
    if (/^https?:\/\//i.test(v)) return v.replace(/^http:/i, "https:");
    return (
      "https://instagram.com/" +
      v.replace(/^@/, "").replace(/^instagram\.com\//i, "")
    );
  }
  function igHandle(v) {
    v = (v || "").trim();
    if (!v) return "";
    const m = v.match(/instagram\.com\/([^/?#]+)/i);
    return "@" + (m ? m[1] : v.replace(/^@/, ""));
  }
  function renderMODELS() {
    if ($("#models").hidden) return;
    const root = $("#mdlGrid");
    if (!S.ready) {
      root.innerHTML = '<div class="state">Učitavam modele…</div>';
      return;
    }
    const anim = firstModels;
    firstModels = false;
    if (!anim) $("#models .phead .w>span").style.animation = "none";
    const q = mq.trim().toLowerCase();
    const list = modelsSorted().filter(
      (m) =>
        !q ||
        (m.name || "").toLowerCase().includes(q) ||
        (m.instagram || "").toLowerCase().includes(q),
    );
    if (!S.models.length) {
      root.className = "";
      root.innerHTML =
        '<div class="state"><b>Još nema modela</b>Dodaj prvog modela sa slikom i kontaktom.<button class="pill solid" data-madd>Novi model</button></div>';
      return;
    }
    if (!list.length) {
      root.className = "";
      root.innerHTML = `<div class="state">Nema modela za „${esc(mq)}“.</div>`;
      return;
    }
    root.className = "mdl-grid";
    root.innerHTML = list
      .map((m, i) => {
        const ig = igUrl(m.instagram);
        return `<article class="mdl${S.fresh.has(m.id) ? " new" : ""}" style="${anim ? `animation-delay:${(0.08 + i * 0.05).toFixed(2)}s` : "animation:none"}">
    <div class="ph2">${m.photo ? `<img src="${esc(m.photo)}" alt="${esc(m.name)}" loading="lazy">` : `<span class="ini">${esc(initials(m.name))}</span>`}<div class="nm">${esc(m.name)}</div>
      <div class="tools"><button data-medit="${esc(m.id)}" aria-label="Izmeni ${esc(m.name)}">${SV('<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>')}</button><button class="del" data-mdel="${esc(m.id)}" aria-label="Obriši ${esc(m.name)}">${SV('<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>')}</button></div></div>
    <div class="info">
      <div class="mrowi${m.phone ? "" : " empty"}">${SV('<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>')}<span>${m.phone ? esc(m.phone) : "Nema broja"}</span>${m.phone ? `<button class="cp" data-copy="${esc(m.phone)}" aria-label="Kopiraj broj">${SV('<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>')}</button>` : ""}</div>
      <div class="mrowi${ig ? "" : " empty"}">${SV('<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>')}<span>${ig ? esc(igHandle(m.instagram)) : "Nema Instagrama"}</span>${ig ? `<a href="${esc(ig)}" target="_blank" rel="noopener">${SV('<path d="M7 17 17 7M9 7h8v8"/>', 2.4)}Otvori</a>` : ""}</div>
    </div>
  </article>`;
      })
      .join("");
  }
  $("#mq").addEventListener("input", (e) => {
    mq = e.target.value;
    renderMODELS();
  });
  $("#addModelBtn").onclick = () => openModelSheet(null);
  $("#mdlGrid").addEventListener("click", async (e) => {
    if (e.target.closest("[data-madd]")) {
      openModelSheet(null);
      return;
    }
    const ed = e.target.closest("[data-medit]");
    if (ed) {
      openModelSheet(S.models.find((m) => m.id === ed.dataset.medit));
      return;
    }
    const dl = e.target.closest("[data-mdel]");
    if (dl) {
      pendingDel = dl.dataset.mdel;
      openSheet("delmodel");
      return;
    }
    const cp = e.target.closest("[data-copy]");
    if (cp) {
      const v = cp.dataset.copy;
      try {
        await navigator.clipboard.writeText(v);
        toast("Broj kopiran");
      } catch (err) {
        const sp = cp.parentElement.querySelector("span");
        const r = document.createRange();
        r.selectNodeContents(sp);
        const sel = getSelection();
        sel.removeAllRanges();
        sel.addRange(r);
        toast("Broj je označen, kopiraj ga");
      }
    }
  });
  /* model sheet */
  let msModel = null,
    msPhoto = "",
    msFrom = null;
  function openModelSheet(m, from) {
    msModel = m || null;
    msFrom = from || null;
    msPhoto = (m && m.photo) || "";
    msBlob = null;
    $("#msTitle").textContent = m ? "Izmeni model" : "Novi model";
    $("#mname").value = m ? m.name || "" : "";
    $("#mphone").value = m ? m.phone || "" : "";
    $("#mig").value = m ? m.instagram || "" : "";
    $("#merr").textContent = "";
    $("#mphoto").value = "";
    setPhUp();
    $("#mok").disabled = false;
    $("#mok").textContent = "Sačuvaj";
    const s = $("#mscrim");
    s.hidden = false;
    requestAnimationFrame(() => s.classList.add("open"));
    setTimeout(() => $("#mname").focus(), 60);
  }
  function setPhUp() {
    const u = $("#phup");
    u.querySelector("img")?.remove();
    if (msPhoto) {
      const i = document.createElement("img");
      i.src = msPhoto;
      i.alt = "";
      u.insertBefore(i, u.firstChild);
      $("#phT").hidden = true;
    } else $("#phT").hidden = false;
  }
  function closeModelSheet() {
    const s = $("#mscrim");
    s.classList.remove("open");
    setTimeout(() => (s.hidden = true), reduce ? 0 : 250);
  }
  $("#mcancel").onclick = closeModelSheet;
  $("#mscrim").addEventListener("click", (e) => {
    if (e.target.id === "mscrim") closeModelSheet();
  });
  async function fileToThumb(f) {
    const url = URL.createObjectURL(f);
    try {
      const img = await new Promise((res, rej) => {
        const i = new Image();
        i.onload = () => res(i);
        i.onerror = rej;
        i.src = url;
      });
      const W = 360,
        H = 480,
        c = document.createElement("canvas");
      c.width = W;
      c.height = H;
      const x = c.getContext("2d");
      const r = Math.max(W / img.width, H / img.height),
        w = img.width * r,
        h = img.height * r;
      x.drawImage(img, (W - w) / 2, Math.min(0, (H - h) * 0.3), w, h);
      return c.toDataURL("image/jpeg", 0.78);
    } finally {
      URL.revokeObjectURL(url);
    }
  }
  /* logo klijenta: kvadrat 256px; skoro kvadratan logo popuni polje, širok ili visok stane ceo (providnost ostaje) */
  async function fileToLogo(f) {
    const url = URL.createObjectURL(f);
    try {
      const img = await new Promise((res, rej) => {
        const i = new Image();
        i.onload = () => res(i);
        i.onerror = rej;
        i.src = url;
      });
      const N = 256,
        iw = img.naturalWidth || N,
        ih = img.naturalHeight || N,
        c = document.createElement("canvas");
      c.width = N;
      c.height = N;
      const x = c.getContext("2d");
      const a = iw / ih,
        r =
          a > 0.8 && a < 1.25
            ? Math.max(N / iw, N / ih)
            : (N * 0.84) / Math.max(iw, ih),
        w = iw * r,
        h = ih * r;
      x.drawImage(img, (N - w) / 2, (N - h) / 2, w, h);
      return f.type === "image/jpeg"
        ? c.toDataURL("image/jpeg", 0.86)
        : c.toDataURL("image/png");
    } finally {
      URL.revokeObjectURL(url);
    }
  }
  let msBlob = null;
  $("#mphoto").addEventListener("change", async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      $("#merr").textContent = "Izaberi sliku.";
      return;
    }
    try {
      msPhoto = await fileToThumb(f);
      msBlob = await (await fetch(msPhoto)).blob();
      setPhUp();
    } catch (err) {
      $("#merr").textContent = "Ova slika ne može da se učita.";
    }
  });
  $("#msheet").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = $("#mname").value.trim();
    if (!name) {
      $("#merr").textContent = "Upiši ime i prezime.";
      shake($("#msheet"));
      return;
    }
    const b = $("#mok");
    b.disabled = true;
    b.textContent = "Čuvam…";
    let photo = msPhoto || "";
    if (msBlob && ASSETS) {
      try {
        const r = await ASSETS.upload(msBlob);
        photo = "/_blob/" + r.id;
      } catch (err) {
        if (err && err.code === "not_granted") {
        }
      }
    }
    const data = {
      name,
      phone: $("#mphone").value.trim(),
      instagram: $("#mig").value.trim(),
      photo,
      updatedAt: Date.now(),
      updatedBy: me ? me.id : null,
    };
    try {
      let id;
      if (msModel) {
        id = msModel.id;
        await api.upd("models", id, data);
      } else {
        data.createdAt = Date.now();
        data.order = Date.now();
        id = await api.add("models", data);
        markFresh(id);
      }
      closeModelSheet();
      refresh();
      toast(msModel ? "Model sačuvan" : `${name} dodat/a`);
      if (msFrom === "pick" && !msModel && id) {
        pickSel.add(id);
        renderPick();
      }
    } catch (err) {
      b.disabled = false;
      b.textContent = "Sačuvaj";
      $("#merr").textContent = errMsg(err);
    }
  });
  async function deleteModel(id) {
    const m = S.models.find((x) => x.id === id);
    if (!m) return;
    const { id: _, ...data } = m;
    try {
      await api.del("models", id);
      if (!DB) S.models = S.models.filter((x) => x.id !== id);
      for (const sc of S.scripts.filter((x) => (x.models || []).includes(id))) {
        const arr = sc.models.map((v) => (v === id ? m.name : v));
        try {
          await api.upd("scripts", sc.id, {
            models: arr,
            modelNames: arr.map((v) => modelRef(v).name).filter(Boolean),
          });
        } catch (err) {}
      }
      refresh();
      toast(`Obrisan: ${m.name}`, async () => {
        try {
          await api.set("models", id, data);
          refresh();
        } catch (err) {
          toast(errMsg(err));
        }
      });
    } catch (err) {
      toast(errMsg(err));
    }
  }
  /* resolve script model entries (id or legacy name) */
  function modelRef(v) {
    const m = S.models.find((x) => x.id === v);
    return m
      ? { id: m.id, name: m.name, photo: m.photo, known: true }
      : { id: v, name: v, photo: "", known: false };
  }
  /* who will be modeling */
  let pickSel = new Set(),
    pickQ = "";
  function openPicker() {
    const s = curScript();
    if (!s) return;
    pickSel = new Set(s.models || []);
    pickQ = "";
    const el = $("#mwiz");
    el.hidden = false;
    requestAnimationFrame(() => el.classList.add("open"));
    document.body.style.overflow = "hidden";
    renderPick(true);
    setTimeout(() => {
      const q = $("#pq");
      if (q && fine) q.focus();
    }, 150);
  }
  function closePicker(save) {
    const el = $("#mwiz");
    if (save) {
      const s = curScript();
      if (s) {
        const arr = [...pickSel];
        s.models = arr;
        queue("models", arr);
        flushSave();
        renderProps(true);
      }
    }
    el.classList.remove("open");
    document.body.style.overflow = "";
    setTimeout(
      () => {
        el.hidden = true;
      },
      reduce ? 0 : 300,
    );
  }
  function renderPick(first) {
    const box = $("#mpick");
    if (!box) return;
    const q = pickQ.trim().toLowerCase();
    const legacy = [...pickSel].filter(
      (v) => !S.models.find((m) => m.id === v),
    );
    const list = modelsSorted().filter(
      (m) => !q || (m.name || "").toLowerCase().includes(q),
    );
    const grid =
      list
        .map(
          (m, i) =>
            `<button type="button" class="mopt" data-pick="${esc(m.id)}" aria-pressed="${pickSel.has(m.id)}" style="animation-delay:${first ? (0.05 + i * 0.03).toFixed(2) : 0}s${first ? "" : ";animation:none"}"><span class="wp">${m.photo ? `<img src="${esc(m.photo)}" alt="">` : `<span class="ini2">${esc(initials(m.name))}</span>`}<span class="ok">${IC.check.replace('class="check"', "")}</span></span><span class="nm">${esc(m.name)}</span></button>`,
        )
        .join("") +
      legacy
        .filter((v) => !q || v.toLowerCase().includes(q))
        .map(
          (v) =>
            `<button type="button" class="mopt legacy" data-pick="${esc(v)}" aria-pressed="true" style="animation:none" title="Nije u bazi modela"><span class="wp"><span class="ini2">${esc(initials(v))}</span><span class="ok">${IC.check.replace('class="check"', "")}</span></span><span class="nm">${esc(v)}</span></button>`,
        )
        .join("");
    const head = first || !box.querySelector(".wq");
    if (head) {
      box.innerHTML = `<h2 class="wq">Who will be <span class="nmg">modeling?</span></h2><label class="msearch"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg><span class="sr">Pretraga</span><input id="pq" type="search" placeholder="Pretraži modele" autocomplete="off"></label><div class="mgrid2" id="pgrid"></div><div class="whint" id="phint"></div>`;
      box.classList.remove("in");
      box.offsetWidth;
      box.classList.add("in");
    }
    $("#pgrid").innerHTML =
      grid ||
      '<div class="whint" style="grid-column:1/-1">Nema modela. Dodaj novog dugmetom dole.</div>';
    const n = pickSel.size;
    $("#phint").textContent = n
      ? n === 1
        ? "Izabran 1 model"
        : `Izabrano ${n} modela`
      : "Možeš izabrati više modela";
  }
  $("#mpick").addEventListener("input", (e) => {
    if (e.target.id === "pq") {
      pickQ = e.target.value;
      renderPick(false);
    }
  });
  $("#mpick").addEventListener("click", (e) => {
    const b = e.target.closest("[data-pick]");
    if (!b) return;
    const id = b.dataset.pick;
    pickSel.has(id) ? pickSel.delete(id) : pickSel.add(id);
    b.setAttribute("aria-pressed", pickSel.has(id));
    const n = pickSel.size;
    $("#phint").textContent = n
      ? n === 1
        ? "Izabran 1 model"
        : `Izabrano ${n} modela`
      : "Možeš izabrati više modela";
    try {
      pickSel.has(id) && navigator.vibrate && navigator.vibrate(8);
    } catch (err) {}
  });
  $("#mwdone").onclick = () => closePicker(true);
  $("#mwclose").onclick = () => closePicker(false);
  $("#mwnew").onclick = () => openModelSheet(null, "pick");
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !$("#mwiz").hidden && $("#mscrim").hidden)
      closePicker(false);
  });

  /* ---------------- task list ---------------- */
  const TCOL = {
    nina: "#ff7eb6",
    luka: "#4fbf7f",
    mihajlo: "#5b9cf0",
    filip: "#9a9ca3",
  };
  const TBLACK = { filip: true };
  let firstTasks = true,
    tView = "member",
    tBusy = false;
  try {
    tView = localStorage.getItem("skeylo-tview") || "member";
  } catch (e) {}
  const todayStr = () => {
    const d = new Date();
    return (
      d.getFullYear() +
      "-" +
      String(d.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(d.getDate()).padStart(2, "0")
    );
  };
  const fmtD = (s) => {
    if (!s) return "";
    const [y, m, d] = s.slice(0, 10).split("-").map(Number);
    return d + ". " + MONTHS[m - 1].slice(0, 3).toLowerCase();
  };
  const fmtT = (s) => (s && s.length > 10 ? s.slice(11, 16) : "");
  function activeProjects() {
    const out = [];
    S.clients.forEach((c) => {
      const items = S.items.filter(
        (i) => i.clientId === c.id && i.type !== "platform",
      );
      if (c.kind === "internal")
        items
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .forEach((it) =>
            out.push({ id: it.id, c, it, label: c.name + " " + it.title }),
          );
      else {
        const cur =
          currentMonthItem(items) ||
          items.sort((a, b) => (b.order || 0) - (a.order || 0))[0];
        if (cur)
          out.push({ id: cur.id, c, it: cur, label: c.name + " " + cur.title });
      }
    });
    out.push({
      id: "general",
      c: { id: "skeylo", name: "Skeylo", color: "#e1802c", kind: "internal" },
      it: { title: "Opšte" },
      label: "Opšte",
      general: true,
    });
    return out;
  }
  function projInfo(id) {
    if (id === "general" || !id)
      return {
        c: { id: "skeylo", name: "Skeylo", color: "#e1802c" },
        title: "Opšte",
        short: "Opšte",
      };
    const it = S.items.find((i) => i.id === id);
    if (!it)
      return {
        c: { id: "", name: "Projekat", color: "#888" },
        title: "Obrisan projekat",
        short: "Projekat",
      };
    const c = S.clients.find((x) => x.id === it.clientId) || {
      id: "",
      name: "",
      color: "#888",
    };
    const short =
      c.id === "ils"
        ? "Infinity " + it.title
        : c.kind === "internal"
          ? it.title
          : c.name + " " + it.title;
    return { c, it, title: c.name + " · " + it.title, short };
  }
  function taskClient(t) {
    let id = t.clientId;
    if (!id) {
      const pid = t.projectId || "general";
      if (pid === "general") id = "skeylo";
      else {
        const it = S.items.find((i) => i.id === pid);
        id = it ? it.clientId : "skeylo";
      }
    }
    return (
      S.clients.find((c) => c.id === id) || {
        id,
        name: id === "skeylo" ? "Skeylo" : "Klijent",
        color: "#e1802c",
      }
    );
  }
  const cName = (c) => (c.id === "ils" ? "Infinity" : c.name);
  function urgency(t) {
    if (t.kind === "task" && t.due) {
      const td = todayStr();
      return t.due < td ? 0 : t.due === td ? 1 : 2;
    }
    if (t.kind === "event" && t.start) {
      const now = new Date();
      const end = new Date(t.end || t.start);
      if (end < now) return 0;
      return t.start.slice(0, 10) === todayStr() ? 1 : 2;
    }
    return 3;
  }
  function sortKey(t) {
    const u = urgency(t);
    const d = t.kind === "task" ? t.due : t.kind === "event" ? t.start : "9999";
    return (
      u + "|" + (d || "9999") + "|" + String(t.createdAt || 0).padStart(15, "0")
    );
  }
  function dateChip(t) {
    if (t.kind === "task" && t.due) {
      const td = todayStr();
      const cls = t.done
        ? ""
        : t.due < td
          ? "late"
          : t.due === td
            ? "soon"
            : "";
      const lbl =
        t.due < td
          ? "Kasni · " + fmtD(t.due)
          : t.due === td
            ? "Danas"
            : "Rok " + fmtD(t.due);
      return `<span class="tchip ${cls}">${SV('<path d="M5 21V4h11l-1 4 4 0-1 4H5"/>')}${lbl}</span>`;
    }
    if (t.kind === "event" && t.start) {
      const sameDay = (t.end || "").slice(0, 10) === t.start.slice(0, 10);
      const lbl =
        fmtD(t.start) +
        " " +
        fmtT(t.start) +
        (t.end
          ? " – " + (sameDay ? fmtT(t.end) : fmtD(t.end) + " " + fmtT(t.end))
          : "");
      return `<span class="tchip ev">${SV('<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>')}${lbl}</span>`;
    }
    return `<span class="tchip nh">${SV('<path d="M12 21c-4-3-7-6-7-10a7 7 0 0 1 14 0c0 4-3 7-7 10z"/>')}No hurry</span>`;
  }
  function stripe(ids) {
    const cs = (ids || [])
      .map((i) => (TBLACK[i] ? "#000" : TCOL[i]))
      .filter(Boolean);
    if (cs.length < 2) return cs[0] || "var(--orange)";
    return `linear-gradient(180deg,${cs.map((c, i) => `${c} ${(i / cs.length) * 100}% ${((i + 1) / cs.length) * 100}%`).join(",")})`;
  }
  function tcardHTML(t, colColor, mode, delay) {
    const tc = taskClient(t);
    const others = mode === "member" ? t.assignees || [] : t.assignees || [];
    const showAvs = mode === "proj" || others.length > 1;
    const fresh = S.fresh.has(t.id);
    return `<div class="tcard${t.done ? " done" : ""}${fresh ? " new" : ""}" data-task="${esc(t.id)}" style="--c:${colColor};--stripe:${stripe(t.assignees)};${fresh ? "" : delay != null ? `animation-delay:${delay.toFixed(2)}s` : "animation:none"}">
    <button class="tck" data-tck="${esc(t.id)}" aria-label="${t.done ? "Vrati task" : "Završi task"}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5L20 7"/></svg></button>
    <div class="tbody"><div class="ttl">${esc(t.title)}</div>
      <div class="tmeta">${mode === "member" ? `<span class="tchip proj" style="--c:${esc(tc.color || "#888")}">${logo(tc, "ri")}${esc(cName(tc))}</span>` : ""}${dateChip(t)}${showAvs ? `<span class="avs">${others.map((i) => (IMG[i] ? `<img src="${IMG[i]}" alt="${esc(i)}">` : "")).join("")}</span>` : ""}</div>
    </div>
  </div>`;
  }
  function renderTASKS() {
    if ($("#tasks").hidden || !me) return;
    const root = $("#tboard");
    setTseg();
    if (!S.ready) {
      root.innerHTML = '<div class="state">Učitavam taskove…</div>';
      return;
    }
    const anim = firstTasks;
    firstTasks = false;
    const openStates = {};
    root
      .querySelectorAll(".tdone")
      .forEach((d) => (openStates[d.dataset.k] = d.open));
    let cols;
    if (tView === "member") {
      const order = [
        me.id,
        ...MEMBERS.map((m) => m.id).filter((i) => i !== me.id),
      ];
      cols = order.map((id) => {
        const u = TEAM.find((t) => t.id === id);
        return {
          k: id,
          color: TCOL[id],
          head: `<img class="tav" src="${IMG[id]}" alt=""><h2>${esc(u.name)}${id === me.id ? ' <span style="color:var(--muted);font-weight:500;font-size:16px">(ti)</span>' : ""}</h2>`,
          list: S.tasks.filter((t) => (t.assignees || []).includes(id)),
          pre: { who: [id] },
        };
      });
    } else {
      cols = [...S.clients]
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map((c) => ({
          k: c.id,
          color: c.color || "#e1802c",
          head: `${logo(c, "lg-ic")}<h2>${esc(cName(c))}</h2>`,
          list: S.tasks.filter((t) => taskClient(t).id === c.id),
          pre: { client: c.id },
        }));
    }
    const sl = root.scrollLeft;
    root.innerHTML = cols
      .map((col, ci) => {
        const open = col.list
          .filter((t) => !t.done)
          .sort((a, b) => (sortKey(a) < sortKey(b) ? -1 : 1));
        const done = col.list
          .filter((t) => t.done)
          .sort((a, b) => (b.doneAt || 0) - (a.doneAt || 0));
        const d = (i) => (anim ? 0.18 + ci * 0.07 + i * 0.05 : null);
        return `<section class="col tcol${TBLACK[col.k] && tView === "member" ? " blk" : ""}" data-k="${esc(col.k)}" style="--c:${col.color};${anim ? `animation-delay:${(0.05 + ci * 0.07).toFixed(2)}s` : "animation:none"}">
      <div class="col-h">${col.head}<span class="n">${open.length}</span><button class="plus" data-tadd='${esc(JSON.stringify(col.pre))}' aria-label="Add Task">${IC.plus}</button></div>
      <div class="trows">${open.length ? open.map((t, i) => tcardHTML(t, col.color, tView, d(i))).join("") : '<div class="tnone">Nema otvorenih taskova</div>'}</div>
      ${done.length ? `<details class="tdone" data-k="${esc(col.k)}"${openStates[col.k] ? " open" : ""}><summary>${SV('<path d="m9 18 6-6-6-6"/>', 2.4)}Završeno · ${done.length}</summary><div class="trows">${done.map((t) => tcardHTML(t, col.color, tView, null)).join("")}</div></details>` : ""}
    </section>`;
      })
      .join("");
    root.scrollLeft = sl;
  }
  function setTseg() {
    const seg = $("#tview");
    seg.classList.toggle("proj", tView === "proj");
    seg
      .querySelectorAll("button")
      .forEach((b) => b.classList.toggle("on", b.dataset.tv === tView));
  }
  $("#tview").addEventListener("click", (e) => {
    const b = e.target.closest("[data-tv]");
    if (!b || b.dataset.tv === tView) return;
    tView = b.dataset.tv;
    try {
      localStorage.setItem("skeylo-tview", tView);
    } catch (err) {}
    firstTasks = true;
    renderTASKS();
  });
  $("#addTask").onclick = () => openTaskWizard({});
  dragScroll($("#tboard"), ".tcard");
  $("#tboard").addEventListener("click", (e) => {
    const ck = e.target.closest("[data-tck]");
    if (ck) {
      e.stopPropagation();
      toggleTask(ck.dataset.tck, ck);
      return;
    }
    const a = e.target.closest("[data-tadd]");
    if (a) {
      try {
        openTaskWizard(JSON.parse(a.dataset.tadd));
      } catch (err) {
        openTaskWizard({});
      }
      return;
    }
    const c = e.target.closest("[data-task]");
    if (c) openTaskDetail(c.dataset.task);
  });
  async function toggleTask(id, btn) {
    const t = S.tasks.find((x) => x.id === id);
    if (!t) return;
    const done = !t.done;
    const card = btn && btn.closest(".tcard");
    if (card && done) {
      card.classList.add("done");
      miniBurst(btn, card.style.getPropertyValue("--c"));
      tBusy = true;
      setTimeout(() => {
        card.classList.add("leaving");
      }, 380);
    }
    try {
      await api.upd("tasks", id, {
        done,
        doneAt: done ? Date.now() : null,
        doneBy: me ? me.id : null,
      });
      setTimeout(
        () => {
          tBusy = false;
          renderTASKS();
          updateDashTasks();
        },
        done && card ? 900 : 0,
      );
      if (done)
        toast("Task završen", async () => {
          try {
            await api.upd("tasks", id, { done: false, doneAt: null });
            renderTASKS();
            updateDashTasks();
          } catch (err) {
            toast(errMsg(err));
          }
        });
    } catch (err) {
      tBusy = false;
      t.done = !done;
      renderTASKS();
      toast(errMsg(err));
    }
  }
  function miniBurst(el, color) {
    if (reduce) return;
    const r = el.getBoundingClientRect();
    for (let i = 0; i < 14; i++) {
      const p = document.createElement("i");
      p.className = "burst";
      p.style.background = color || "var(--orange)";
      p.style.width = p.style.height = "7px";
      const a = Math.random() * Math.PI * 2,
        d = 30 + Math.random() * 60;
      p.style.left = r.left + r.width / 2 + "px";
      p.style.top = r.top + r.height / 2 + "px";
      p.style.setProperty("--x", Math.cos(a) * d + "px");
      p.style.setProperty("--y", Math.sin(a) * d + "px");
      p.style.setProperty("--r", Math.random() * 360 + "deg");
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 1000);
    }
  }
  function updateDashTasks() {
    const el = $("#dashTasks");
    if (!el || !me) return;
    if (!S.ready) {
      el.textContent = "Tvoji zadaci";
      return;
    }
    const n = S.tasks.filter(
      (t) => !t.done && (t.assignees || []).includes(me.id),
    ).length;
    const late = S.tasks.filter(
      (t) => !t.done && (t.assignees || []).includes(me.id) && urgency(t) === 0,
    ).length;
    el.textContent =
      n === 0
        ? "Nemaš otvorenih taskova"
        : (n % 10 === 1 && n % 100 !== 11
            ? n + " otvoren task"
            : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14)
              ? n + " otvorena taska"
              : n + " otvorenih taskova") +
          (late ? " · " + late + " kasni" : "");
  }
  /* task detail = izmena taska */
  let E = null;
  function openTaskDetail(id) {
    const t = S.tasks.find((x) => x.id === id);
    if (!t) return;
    const ev = t.kind === "event";
    E = {
      id,
      title: t.title || "",
      who: new Set(t.assignees || []),
      client: taskClient(t).id,
      kind: t.kind === "task" || ev ? t.kind : "none",
      due: t.due || "",
      sd: ev && t.start ? t.start.slice(0, 10) : "",
      st: ev && t.start ? t.start.slice(11, 16) : "",
      ed: ev && t.end ? t.end.slice(0, 10) : "",
      et: ev && t.end ? t.end.slice(11, 16) : "",
    };
    const by = TEAM.find((u) => u.id === t.createdBy);
    const cs = [...S.clients].sort((a, b) => (a.order || 0) - (b.order || 0));
    if (!cs.some((c) => c.id === E.client))
      cs.unshift({ id: E.client, name: taskClient(t).name });
    $("#tdet").innerHTML =
      `<textarea class="tdtl" id="etitle" rows="1" maxlength="200" placeholder="Opiši task…">${esc(E.title)}</textarea>
    <div class="lbl">Ko radi</div>
    <div class="tdwho">${["luka", "mihajlo", "nina", "filip"]
      .map((uid) => {
        const u = TEAM.find((x) => x.id === uid) || { name: uid };
        return `<button type="button" class="tdp${TBLACK[uid] ? " blk" : ""}" data-ewho="${uid}" aria-pressed="${E.who.has(uid)}" style="--m:${TCOL[uid]}"><img src="${IMG[uid]}" alt=""><span>${esc(u.name)}</span></button>`;
      })
      .join("")}</div>
    <div class="lbl">Klijent</div>
    <select id="ecli" class="tdsel">${cs.map((c) => `<option value="${esc(c.id)}"${c.id === E.client ? " selected" : ""}>${esc(c.name)}</option>`).join("")}</select>
    <div class="lbl">Rok</div>
    <div class="tdkind">${[
      ["task", "Task"],
      ["event", "Event"],
      ["none", "No hurry"],
    ]
      .map(
        ([k, l]) =>
          `<button type="button" data-ekind="${k}" aria-pressed="${E.kind === k}">${l}</button>`,
      )
      .join("")}</div>
    <div id="ewhen">${eWhenHTML()}</div>
    ${by ? `<div class="r">Dodao/la: ${esc(by.name)}${t.createdAt ? " · " + fmtDay.format(new Date(t.createdAt)) : ""}</div>` : ""}
    <button class="pill solid" id="esave">Sačuvaj izmene</button>
    <div class="row2"><button class="pill danger" data-tdel="${esc(t.id)}">${SV('<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>')}Obriši</button><button class="pill" data-tdone="${esc(t.id)}">${t.done ? "Vrati u otvorene" : "Završi task"}</button></div>`;
    updESave();
    const s = $("#tscrim");
    s.hidden = false;
    requestAnimationFrame(() => s.classList.add("open"));
  }
  function eWhenHTML() {
    if (E.kind === "task")
      return `<div class="when"><input type="date" id="edue" value="${E.due}"></div>`;
    if (E.kind === "event")
      return `<div class="when"><div class="wrow"><span>Od</span><input type="date" id="esd" value="${E.sd}"><input type="time" id="est" value="${E.st}"></div><div class="wrow"><span>Do</span><input type="date" id="eed" value="${E.ed}"><input type="time" id="eet" value="${E.et}"></div></div>`;
    return "";
  }
  function updESave() {
    const b = $("#esave");
    if (!b || !E) return;
    const ok =
      E.title.trim().length > 0 &&
      E.who.size > 0 &&
      (E.kind === "task"
        ? !!E.due
        : E.kind === "event"
          ? !!(E.sd && E.st)
          : true);
    b.disabled = !ok;
    b.style.opacity = ok ? 1 : 0.45;
  }
  async function saveTaskEdit() {
    if (!E) return;
    const data = {
      title: E.title.trim(),
      assignees: [...E.who],
      kind: E.kind,
      due: E.kind === "task" ? E.due : "",
      start: E.kind === "event" ? `${E.sd}T${E.st || "00:00"}` : "",
      end:
        E.kind === "event" && E.ed ? `${E.ed}T${E.et || E.st || "00:00"}` : "",
    };
    if (data.kind === "event" && data.end && data.end < data.start)
      data.end = data.start;
    const id = E.id;
    const t = S.tasks.find((x) => x.id === id);
    if (t && taskClient(t).id !== E.client) {
      data.clientId = E.client;
      data.projectId = "";
    }
    closeTaskDetail();
    try {
      await api.upd("tasks", id, data);
      firstTasks = false;
      renderTASKS();
      updateDashTasks();
      toast("Task izmenjen");
    } catch (err) {
      toast(errMsg(err));
    }
  }
  $("#tdet").addEventListener("input", (e) => {
    if (!E) return;
    const id = e.target.id;
    if (id === "etitle") {
      E.title = e.target.value;
      autoGrow(e.target);
    }
    if (id === "ecli") E.client = e.target.value;
    if (id === "edue") E.due = e.target.value;
    if (id === "esd") {
      E.sd = e.target.value;
      if (!E.ed || E.ed < E.sd) {
        E.ed = E.sd;
        const ed = $("#eed");
        if (ed) ed.value = E.ed;
      }
    }
    if (id === "est") E.st = e.target.value;
    if (id === "eed") E.ed = e.target.value;
    if (id === "eet") E.et = e.target.value;
    updESave();
  });
  $("#tdet").addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && e.target.id === "etitle") {
      e.preventDefault();
      if (!$("#esave").disabled) saveTaskEdit();
    }
  });
  function closeTaskDetail() {
    const s = $("#tscrim");
    s.classList.remove("open");
    E = null;
    setTimeout(() => (s.hidden = true), reduce ? 0 : 250);
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && E) closeTaskDetail();
  });
  $("#tscrim").addEventListener("click", async (e) => {
    if (e.target.id === "tscrim") {
      closeTaskDetail();
      return;
    }
    const w = e.target.closest("[data-ewho]");
    if (w && E) {
      const uid = w.dataset.ewho;
      E.who.has(uid) ? E.who.delete(uid) : E.who.add(uid);
      w.setAttribute("aria-pressed", E.who.has(uid));
      updESave();
      return;
    }
    const kd = e.target.closest("[data-ekind]");
    if (kd && E) {
      E.kind = kd.dataset.ekind;
      $$("#tdet [data-ekind]").forEach((x) =>
        x.setAttribute("aria-pressed", x === kd),
      );
      if (E.kind === "event" && !E.sd) {
        E.sd = E.ed = todayStr();
        E.st = "10:00";
        E.et = "11:00";
      }
      if (E.kind === "task" && !E.due) E.due = todayStr();
      $("#ewhen").innerHTML = eWhenHTML();
      updESave();
      return;
    }
    if (e.target.closest("#esave")) {
      if (!$("#esave").disabled) saveTaskEdit();
      return;
    }
    const d = e.target.closest("[data-tdel]");
    if (d) {
      const t = S.tasks.find((x) => x.id === d.dataset.tdel);
      closeTaskDetail();
      if (!t) return;
      const { id, ...data } = t;
      try {
        await api.del("tasks", id);
        if (!DB) S.tasks = S.tasks.filter((x) => x.id !== id);
        renderTASKS();
        updateDashTasks();
        toast("Task obrisan", async () => {
          try {
            await api.set("tasks", id, data);
            renderTASKS();
            updateDashTasks();
          } catch (err) {
            toast(errMsg(err));
          }
        });
      } catch (err) {
        toast(errMsg(err));
      }
      return;
    }
    const dn = e.target.closest("[data-tdone]");
    if (dn) {
      closeTaskDetail();
      toggleTask(dn.dataset.tdone, null);
    }
  });

  /* add task wizard */
  let T = null;
  function openTaskWizard(pre) {
    T = {
      step: 0,
      who: new Set(pre.who || []),
      client: pre.client || null,
      job: "",
      kind: null,
      due: "",
      sd: "",
      st: "",
      ed: "",
      et: "",
    };
    T.steps = ["who", "proj", "job", "when"];
    $("#tdots").innerHTML = T.steps.map(() => "<i></i>").join("");
    const el = $("#twiz");
    el.hidden = false;
    requestAnimationFrame(() => el.classList.add("open"));
    document.body.style.overflow = "hidden";
    drawT(false);
  }
  function closeTaskWizard() {
    const el = $("#twiz");
    el.classList.remove("open");
    document.body.style.overflow = "";
    setTimeout(
      () => {
        el.hidden = true;
        $("#tstage").innerHTML = "";
        T = null;
      },
      reduce ? 0 : 300,
    );
  }
  function tStepHTML(k) {
    if (k === "who")
      return `<h2 class="wq">Who will be <span class="nmg">executing?</span></h2>
    <div class="whos">${["luka", "mihajlo", "nina", "filip"]
      .map((id, i) => {
        const u = TEAM.find((x) => x.id === id);
        return `<button type="button" class="who${TBLACK[id] ? " blk" : ""}" data-who="${id}" aria-pressed="${T.who.has(id)}" style="--m:${TCOL[id]};animation:rowIn .5s ${(0.1 + i * 0.07).toFixed(2)}s var(--ease) backwards"><span class="wp"><img src="${IMG[id]}" alt=""><span class="ok">${IC.check.replace('class="check"', "")}</span></span><span class="nm">${u.name}</span></button>`;
      })
      .join("")}</div>
    <div class="whint">Možeš izabrati više ljudi</div>`;
    if (k === "proj") {
      const cs = [...S.clients].sort((a, b) => (a.order || 0) - (b.order || 0));
      return `<h2 class="wq">Which client <span class="nmg">is it for?</span></h2>
    <div class="projs">${cs.map((c, i) => `<button type="button" class="popt" data-proj="${esc(c.id)}" aria-pressed="${T.client === c.id}" style="--c:${esc(c.color || "#e1802c")};animation-delay:${(0.08 + i * 0.05).toFixed(2)}s">${logo(c, "lg-ic")}<span>${esc(c.name)}</span></button>`).join("")}</div>`;
    }
    if (k === "job")
      return `<h2 class="wq">What's <span class="nmg">the job?</span></h2><textarea class="wjob" id="tjob" rows="1" maxlength="200" placeholder="Opiši task…">${esc(T.job)}</textarea><div class="whint">Enter za dalje</div>`;
    return `<h2 class="wq">Task ili <span class="nmg">event?</span></h2>
    <div class="kinds"><button type="button" class="kind" data-kind="task" aria-pressed="${T.kind === "task"}">${SV('<path d="M5 21V4h11l-1 4 4 0-1 4H5"/>')}Task</button><button type="button" class="kind" data-kind="event" aria-pressed="${T.kind === "event"}">${SV('<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>')}Event</button></div>
    <div id="twhen" style="display:contents">${whenHTML()}</div>
    <button type="button" class="hurry" data-hurry>${SV('<path d="M12 21c-4-3-7-6-7-10a7 7 0 0 1 14 0c0 4-3 7-7 10z"/>', 2.2)}No hurry</button>`;
  }
  function whenHTML() {
    if (T.kind === "task")
      return `<div class="when"><div class="wl">Deadline date?</div><input type="date" id="tdue" value="${T.due}" class="d1"></div>`;
    if (T.kind === "event")
      return `<div class="when"><div class="wl">Kada?</div><div class="wrow"><span>Od</span><input type="date" id="tsd" value="${T.sd}"><input type="time" id="tst" value="${T.st}"></div><div class="wrow"><span>Do</span><input type="date" id="ted" value="${T.ed}"><input type="time" id="tet" value="${T.et}"></div></div>`;
    return "";
  }
  function drawT(back) {
    const st = $("#tstage");
    const old = st.querySelector(".wstep");
    if (old) {
      old.classList.remove("in", "back");
      old.classList.add("out");
      if (back) old.classList.add("back");
      setTimeout(() => old.remove(), 400);
    }
    const k = T.steps[T.step];
    const el = document.createElement("div");
    el.className = "wstep in" + (back ? " back" : "");
    el.innerHTML = tStepHTML(k);
    st.appendChild(el);
    $$("#tdots i").forEach((d, i) => {
      d.classList.toggle("on", i === T.step);
      d.classList.toggle("done", i < T.step);
    });
    $("#tback").style.visibility = T.step === 0 ? "hidden" : "visible";
    updTNext();
    if (k === "job")
      setTimeout(
        () => {
          const t = $("#tjob");
          if (t) {
            autoGrow(t);
            t.focus();
          }
        },
        reduce ? 0 : 150,
      );
  }
  function updTNext() {
    const k = T.steps[T.step];
    const b = $("#tnext");
    b.textContent = k === "when" ? "Save" : "Next";
    let ok = true;
    if (k === "who") ok = T.who.size > 0;
    if (k === "proj") ok = !!T.client;
    if (k === "job") ok = T.job.trim().length > 0;
    if (k === "when")
      ok =
        T.kind === "task"
          ? !!T.due
          : T.kind === "event"
            ? !!(T.sd && T.st)
            : false;
    b.disabled = !ok;
    b.style.opacity = ok ? 1 : 0.45;
  }
  $("#tstage").addEventListener("click", (e) => {
    if (!T) return;
    const w = e.target.closest("[data-who]");
    if (w) {
      const id = w.dataset.who;
      T.who.has(id) ? T.who.delete(id) : T.who.add(id);
      w.setAttribute("aria-pressed", T.who.has(id));
      try {
        T.who.has(id) && navigator.vibrate && navigator.vibrate(8);
      } catch (err) {}
      updTNext();
      return;
    }
    const p = e.target.closest("[data-proj]");
    if (p) {
      T.client = p.dataset.proj;
      $$("#tstage [data-proj]").forEach((x) =>
        x.setAttribute("aria-pressed", x === p),
      );
      updTNext();
      setTimeout(() => {
        if (T && T.steps[T.step] === "proj") {
          T.step++;
          drawT(false);
        }
      }, 280);
      return;
    }
    const kd = e.target.closest("[data-kind]");
    if (kd) {
      T.kind = kd.dataset.kind;
      $$("#tstage [data-kind]").forEach((x) =>
        x.setAttribute("aria-pressed", x === kd),
      );
      if (T.kind === "event" && !T.sd) {
        T.sd = todayStr();
        T.ed = todayStr();
        T.st = "10:00";
        T.et = "11:00";
      }
      if (T.kind === "task" && !T.due) T.due = todayStr();
      $("#twhen").innerHTML = whenHTML();
      updTNext();
      return;
    }
    if (e.target.closest("[data-hurry]")) {
      T.kind = "none";
      saveTask();
    }
  });
  $("#tstage").addEventListener("input", (e) => {
    if (!T) return;
    const id = e.target.id;
    if (id === "tjob") {
      T.job = e.target.value;
      autoGrow(e.target);
    }
    if (id === "tdue") T.due = e.target.value;
    if (id === "tsd") {
      T.sd = e.target.value;
      if (!T.ed || T.ed < T.sd) {
        T.ed = T.sd;
        const ed = $("#ted");
        if (ed) ed.value = T.ed;
      }
    }
    if (id === "tst") T.st = e.target.value;
    if (id === "ted") T.ed = e.target.value;
    if (id === "tet") T.et = e.target.value;
    updTNext();
  });
  $("#tstage").addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && e.target.id === "tjob") {
      e.preventDefault();
      e.stopPropagation();
      if (T.job.trim()) {
        T.step++;
        drawT(false);
      }
    }
  });
  $("#tnext").onclick = () => {
    if (!T || $("#tnext").disabled) return;
    if (T.steps[T.step] === "when") saveTask();
    else {
      T.step++;
      drawT(false);
    }
  };
  $("#tback").onclick = () => {
    if (T && T.step > 0) {
      T.step--;
      drawT(true);
    }
  };
  $("#tclose").onclick = () => closeTaskWizard();
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && T) closeTaskWizard();
  });
  async function saveTask() {
    if (!T) return;
    const b = $("#tnext");
    b.disabled = true;
    b.textContent = "Čuvam…";
    const data = {
      title: T.job.trim(),
      assignees: [...T.who],
      clientId: T.client || "skeylo",
      projectId: "",
      kind: T.kind || "none",
      due: T.kind === "task" ? T.due : "",
      start: T.kind === "event" ? `${T.sd}T${T.st || "00:00"}` : "",
      end:
        T.kind === "event" && T.ed ? `${T.ed}T${T.et || T.st || "00:00"}` : "",
      done: false,
      doneAt: null,
      createdBy: me ? me.id : null,
      createdAt: Date.now(),
      order: Date.now(),
    };
    if (data.kind === "event" && data.end && data.end < data.start)
      data.end = data.start;
    try {
      const id = await api.add("tasks", data);
      markFresh(id);
      const btn = $("#tnext");
      if (!reduce) {
        const r = btn.getBoundingClientRect();
        miniBurst(btn, "var(--gold)");
      }
      closeTaskWizard();
      firstTasks = false;
      renderTASKS();
      updateDashTasks();
      const names = data.assignees
        .map((i) => (TEAM.find((u) => u.id === i) || { name: i }).name)
        .join(" i ");
      toast(
        `${data.kind === "event" ? "Event dodat" : "Task dodat"} za ${names}`,
      );
    } catch (err) {
      b.disabled = false;
      b.textContent = "Save";
      toast(errMsg(err));
    }
  }

  /* ---------------- personal finance panel ---------------- */
  let firstMoney = true,
    moneyYM = null;
  function renderMONEY() {
    if ($("#money").hidden || !me) return;
    applyTheme(me.id === "nina" ? "nina" : "dark");
    const body = $("#moneyBody");
    if (!S.ready) {
      body.innerHTML = '<div class="state">Učitavam tvoje finansije…</div>';
      return;
    }
    const earns = memberEarnings(me.id),
      exps = memberExpenses(me.id);
    const keys = new Set([
      thisKey(),
      ...earns.map((r) => r.key),
      ...exps.map((r) => r.key),
    ]);
    const sorted = [...keys].sort((a, b) => a - b);
    if (moneyYM == null) moneyYM = thisKey();
    const key = moneyYM,
      y = Math.floor(key / 12),
      m = (key % 12) + 1;
    const tot = netFor(me.id, key);
    const idx = sorted.indexOf(key);
    const anim = firstMoney;
    firstMoney = false;
    const d = (v) =>
      anim ? `animation-delay:${v.toFixed(2)}s` : "animation:none";
    // last 6 months ending at max(current, selected)
    const end = Math.max(thisKey(), key);
    const span = [];
    for (let k = end - 5; k <= end; k++) span.push(k);
    const nets = span.map((k) => Math.max(0, netFor(me.id, k).net));
    const mx = Math.max(1, ...nets);
    const monthEarn = earns
      .filter((r) => r.key === key)
      .sort((a, b) => b.rsd - a.rsd);
    const monthExp = exps
      .filter((r) => r.key === key)
      .sort((a, b) => xWhen(b.x) - xWhen(a.x));
    body.innerHTML = `
    <div class="mhead" style="${d(0)}"><span class="av"><img src="${IMG[me.id]}" alt=""></span><h1><span class="w"><span>Finance Panel</span></span></h1>
      <div class="mswitch"><button data-mm="-1" ${idx <= 0 ? "disabled" : ""} aria-label="Prethodni mesec">${SV('<path d="m15 18-6-6 6-6"/>', 2.4)}</button><span>${ymName(y, m)}</span><button data-mm="1" ${idx >= sorted.length - 1 ? "disabled" : ""} aria-label="Sledeći mesec">${SV('<path d="m9 18 6-6-6-6"/>', 2.4)}</button></div></div>
    <section class="mhero" style="${d(0.08)}">
      <div><div class="flbl">${me.id === "nina" ? "Tvoja zarada, kraljice" : "Tvoja zarada"} · ${MONTHS[m - 1]}</div>
        <div class="fbig"><span id="mNet">0</span><small>RSD</small></div>
        <div class="mchips"><span class="mchip up">${SV('<path d="M7 17 17 7M9 7h8v8"/>', 2.4)}Zarađeno ${nf.format(Math.round(tot.earned))}</span><span class="mchip down">${SV('<path d="M7 7l10 10M17 9v8H9"/>', 2.4)}Troškovi ${tot.spent ? "−" : ""}${nf.format(Math.round(tot.spent))}</span></div></div>
      <div class="mbars">${span.map((k, i) => `<div class="mbar${k === key ? " on" : ""}" data-mk="${k}"><span class="v">${nets[i] ? nf.format(Math.round(nets[i] / 1000)) + "k" : ""}</span><span class="col2"><i style="height:${Math.max(4, (nets[i] / mx) * 100).toFixed(1)}%;${d(0.3 + i * 0.06)}"></i></span><span class="m">${MONTHS[k % 12].slice(0, 3)}</span></div>`).join("")}</div>
    </section>
    <div class="mgrid">
      <section class="mcard" style="${d(0.2)}"><div class="mcard-h"><h2>Projekti</h2></div>
        ${monthEarn.length ? monthEarn.map((r, i) => `<div class="mrow" style="--c:${esc(r.c.color || "#e1802c")};${d(0.3 + i * 0.05)}">${logo(r.c, "lg-ic")}<div><div class="t">${esc(r.c.name)}</div><div class="s">${esc(r.it ? r.it.title : ymName(r.year, r.month))}</div></div><div class="a">${moneyV(r.v)}${r.v.cur === "EUR" ? `<small>≈ ${nf.format(Math.round(r.rsd))} RSD</small>` : ""}</div></div>`).join("") : `<div class="mnone">Još nema upisane zarade za ${MONTHS[m - 1]}.</div>`}
      </section>
      <section class="mcard" style="${d(0.28)}"><div class="mcard-h"><h2>Troškovi</h2><button class="pill" data-exp-add>${IC.plus}Dodaj trošak</button></div>
        ${monthExp.length ? monthExp.map((r, i) => `<div class="mrow exp" style="${d(0.35 + i * 0.05)}"><span class="ei">${SV('<path d="M4 7h16v12H4zM4 7l2-3h12l2 3M9 12h6"/>')}</span><div><div class="t">${esc(r.x.note || "Trošak")}</div><div class="s">${xWhen(r.x) ? fmtDay.format(new Date(xWhen(r.x))) : ""}</div></div><div class="a neg">−${moneyV(r.x)}</div><button class="x" data-exp-del="${esc(r.x.id)}" aria-label="Obriši trošak">${SV('<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>')}</button></div>`).join("") : `<div class="mnone">Nema troškova za ${MONTHS[m - 1]}.</div>`}
      </section>
    </div>`;
    if (!anim) $("#moneyBody .w>span").style.animation = "none";
    const el = $("#mNet");
    if (anim && tot.net > 0) countUp(el, Math.round(tot.net));
    else
      el.textContent =
        (tot.net < 0 ? "−" : "") + nf.format(Math.abs(Math.round(tot.net)));
  }
  $("#moneyBody").addEventListener("click", (e) => {
    const mm = e.target.closest("[data-mm]");
    if (mm) {
      const earns = memberEarnings(me.id),
        exps = memberExpenses(me.id);
      const sorted = [
        ...new Set([
          thisKey(),
          ...earns.map((r) => r.key),
          ...exps.map((r) => r.key),
        ]),
      ].sort((a, b) => a - b);
      const i = sorted.indexOf(moneyYM) + +mm.dataset.mm;
      if (sorted[i] != null) {
        moneyYM = sorted[i];
        firstMoney = true;
        renderMONEY();
      }
      return;
    }
    const mk = e.target.closest("[data-mk]");
    if (mk) {
      moneyYM = +mk.dataset.mk;
      firstMoney = true;
      renderMONEY();
      return;
    }
    if (e.target.closest("[data-exp-add]")) {
      openExpense();
      return;
    }
    const xd = e.target.closest("[data-exp-del]");
    if (xd) {
      const x = S.expenses.find((z) => z.id === xd.dataset.expDel);
      if (!x) return;
      const { id, ...data } = x;
      api
        .del("expenses", id)
        .then(() => {
          if (!DB) S.expenses = S.expenses.filter((z) => z.id !== id);
          refresh();
          toast("Trošak obrisan", async () => {
            try {
              await api.set("expenses", id, data);
              refresh();
            } catch (err) {
              toast(errMsg(err));
            }
          });
        })
        .catch((err) => toast(errMsg(err)));
    }
  });
  /* expense sheet */
  let xCur = "RSD";
  /* datum troška (x.date "YYYY-MM-DD"); stariji troškovi imaju samo createdAt */
  function xWhen(x) {
    return x.date ? new Date(x.date + "T12:00").getTime() : x.createdAt || 0;
  }
  function openExpense() {
    xCur = "RSD";
    $("#xamt").value = "";
    $("#xnote").value = "";
    // predlog: današnji dan u mesecu koji je otvoren u panelu
    const key = moneyYM ?? thisKey(),
      y = Math.floor(key / 12),
      m = (key % 12) + 1,
      day = Math.min(new Date().getDate(), new Date(y, m, 0).getDate());
    $("#xdate").value =
      `${y}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    $("#xerr").textContent = "";
    setSeg($("#xseg"), "RSD");
    const s = $("#xscrim");
    s.hidden = false;
    requestAnimationFrame(() => s.classList.add("open"));
    setTimeout(() => $("#xamt").focus(), 60);
  }
  function closeExpense() {
    const s = $("#xscrim");
    s.classList.remove("open");
    setTimeout(() => (s.hidden = true), reduce ? 0 : 250);
  }
  function setSeg(seg, cur) {
    seg.classList.toggle("eur", cur === "EUR");
    seg
      .querySelectorAll("button")
      .forEach((b) => b.classList.toggle("on", b.dataset.cur === cur));
  }
  $("#xseg").addEventListener("click", (e) => {
    const b = e.target.closest("[data-cur]");
    if (b) {
      xCur = b.dataset.cur;
      setSeg($("#xseg"), xCur);
    }
  });
  $("#xcancel").onclick = closeExpense;
  $("#xscrim").addEventListener("click", (e) => {
    if (e.target.id === "xscrim") closeExpense();
  });
  $("#xsheet").addEventListener("submit", async (e) => {
    e.preventDefault();
    const amount = parseAmount($("#xamt").value);
    if (!amount) {
      $("#xerr").textContent = "Upiši iznos troška.";
      shake($("#xsheet"));
      return;
    }
    const date = $("#xdate").value;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      $("#xerr").textContent = "Izaberi datum troška.";
      shake($("#xsheet"));
      return;
    }
    const y = +date.slice(0, 4),
      m = +date.slice(5, 7);
    try {
      const id = await api.add("expenses", {
        member: me.id,
        amount,
        cur: xCur,
        note: $("#xnote").value.trim(),
        date,
        year: y,
        month: m,
        order: Date.now(),
        createdAt: Date.now(),
      });
      closeExpense();
      // panel prelazi na mesec u koji je trošak upisan
      moneyYM = ymKey(y, m);
      firstMoney = true;
      refresh();
      toast("Trošak dodat");
    } catch (err) {
      $("#xerr").textContent = errMsg(err);
    }
  });

  /* ---------------- reporting dashboard ---------------- */
  let firstRP = true;
  function renderRP() {
    if ($("#rp").hidden) return;
    const it = S.items.find((i) => i.id === view.id);
    const root = $("#rgrid");
    if (!S.ready) {
      $("#rpId").innerHTML = "";
      root.innerHTML = '<div class="state">Učitavam izveštaje…</div>';
      return;
    }
    if (!it) {
      $("#rpId").innerHTML = "";
      root.innerHTML =
        '<div class="state"><b>Ovaj mesec ne postoji</b><button class="pill" data-go="projects">Nazad na projekte</button></div>';
      return;
    }
    const c = S.clients.find((x) => x.id === it.clientId) || {
      id: "",
      name: "",
      color: "#e1802c",
    };
    applyTheme(c.id);
    const anim = firstRP;
    firstRP = false;
    $("#rpId").style.setProperty("--c", c.color || "#e1802c");
    $("#rpId").innerHTML =
      `${logo(c, "lg-ic")}<div><h1><span class="w"><span>Reporting Dashboard</span></span></h1><div class="sub">${esc(c.name)} · ${esc(it.title)}</div></div>`;
    if (!anim) $("#rpId .w>span").style.animation = "none";
    $("#rpBackLbl").textContent = it.title;
    const reps = reportsOf(it.id);
    if (!reps.length) {
      root.className = "";
      root.innerHTML = `<div class="rempty"><div class="arch">${IC_REPORT}</div><b>Još nema izveštaja</b>Otpremi prvi .html izveštaj i dodaj Loom video.<button class="pill solid" data-new-report>Novi izveštaj</button></div>`;
      return;
    }
    root.className = "rgrid";
    root.innerHTML = reps
      .map((r, i) => ({ r, i }))
      .reverse()
      .map(({ r, i }, k) => {
        const fresh = S.fresh.has(r.id);
        return `<article class="rcard" style="--c:${esc(c.color || "#e1802c")};${fresh ? "" : anim ? `animation-delay:${(0.1 + k * 0.08).toFixed(2)}s` : "animation:none"}">
      <div class="rtools"><button class="rtool" data-edit-report="${esc(r.id)}" aria-label="Uredi izveštaj" title="Uredi">${SV('<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>')}</button><button class="rtool del" data-del-report="${esc(r.id)}" aria-label="Obriši izveštaj" title="Obriši">${SV('<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>')}</button></div>
      <div class="rn">${String(i + 1).padStart(2, "0")}</div>
      <div class="rt">${esc(r.title || "Izveštaj")}</div>
      <div class="rd">${r.createdAt ? fmtFull.format(new Date(r.createdAt)) : ""}</div>
      <div class="racts">
        <button class="pill" data-go="rv-${esc(r.id)}">${SV('<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>')}Otvori</button>
        ${okLink(r.loom) ? `<a class="pill solid" href="${esc(r.loom)}" target="_blank" rel="noopener">${IC_PLAY}Video</a>` : `<button class="pill" data-edit-report="${esc(r.id)}">${IC.plus}Loom link</button>`}
      </div>
    </article>`;
      })
      .join("");
  }
  function okLink(u) {
    return /^https:\/\/[^\s]+$/i.test(u || "");
  }
  $("#rpBack").onclick = () => nav("m-" + view.id);
  $("#newReport").onclick = () => openReportSheet("new");
  $("#rgrid").addEventListener("click", (e) => {
    if (e.target.closest("[data-new-report]")) {
      openReportSheet("new");
      return;
    }
    const d = e.target.closest("[data-del-report]");
    if (d) {
      pendingDel = d.dataset.delReport;
      openSheet("delreport");
      return;
    }
    const l = e.target.closest("[data-edit-report]");
    if (l) {
      openReportSheet(
        "edit",
        S.reports.find((r) => r.id === l.dataset.editReport),
      );
      return;
    }
  });
  let pendingDel = null;

  /* report sheet */
  let rsMode = "new",
    rsReport = null,
    rsFile = null,
    rsHTML = "";
  function openReportSheet(mode, report) {
    rsMode = mode;
    rsReport = report || null;
    rsFile = null;
    rsHTML = "";
    const isNew = mode === "new";
    $("#rsTitle").textContent = isNew ? "Novi izveštaj" : "Uredi izveštaj";
    $("#rdrop").hidden = !isNew;
    $("#rdrop").classList.remove("has", "over");
    $("#rdropT").textContent = "Izaberi .html izveštaj";
    $("#rdropS").textContent = "ili ga prevuci ovde";
    $("#rfile").value = "";
    $("#rname").value = (report && report.title) || "";
    $("#rloom").value = (report && report.loom) || "";
    $("#rerr").textContent = "";
    $("#rsOk").textContent = "Sačuvaj";
    $("#rsOk").disabled = false;
    const s = $("#rscrim");
    s.hidden = false;
    requestAnimationFrame(() => s.classList.add("open"));
    if (!isNew) setTimeout(() => $("#rname").focus(), 60);
  }
  function closeReportSheet() {
    const s = $("#rscrim");
    s.classList.remove("open");
    setTimeout(() => (s.hidden = true), reduce ? 0 : 250);
  }
  $("#rsCancel").onclick = closeReportSheet;
  $("#rscrim").addEventListener("click", (e) => {
    if (e.target.id === "rscrim") closeReportSheet();
  });
  async function takeFile(f) {
    if (!f) return;
    if (!/\.html?$/i.test(f.name) && f.type !== "text/html") {
      $("#rerr").textContent = "Izaberi .html fajl.";
      return;
    }
    if (f.size > 20 * 1024 * 1024) {
      $("#rerr").textContent = "Fajl je veći od 20 MB.";
      return;
    }
    rsFile = f;
    rsHTML = await f.text();
    $("#rerr").textContent = "";
    $("#rdrop").classList.add("has");
    $("#rdropT").textContent = f.name;
    $("#rdropS").textContent =
      (f.size / 1024).toFixed(0) + " KB · klikni za drugi fajl";
    setTimeout(() => {
      if (!$("#rname").value.trim()) $("#rname").focus();
    }, 50);
  }
  function decodeEntities(t) {
    const d = document.createElement("textarea");
    d.innerHTML = t;
    return d.value;
  }
  $("#rfile").addEventListener("change", (e) => takeFile(e.target.files[0]));
  ["dragenter", "dragover"].forEach((ev) =>
    $("#rdrop").addEventListener(ev, (e) => {
      e.preventDefault();
      $("#rdrop").classList.add("over");
    }),
  );
  ["dragleave", "drop"].forEach((ev) =>
    $("#rdrop").addEventListener(ev, (e) => {
      e.preventDefault();
      $("#rdrop").classList.remove("over");
    }),
  );
  $("#rdrop").addEventListener("drop", (e) => {
    const f = e.dataTransfer.files && e.dataTransfer.files[0];
    takeFile(f);
  });
  $("#rsheet").addEventListener("submit", async (e) => {
    e.preventDefault();
    const loom = $("#rloom").value.trim();
    if (loom && !okLink(loom)) {
      $("#rerr").textContent = "Link mora da počinje sa https://";
      shake($("#rsheet"));
      return;
    }
    if (rsMode === "edit") {
      if (!rsReport) return closeReportSheet();
      const title = $("#rname").value.trim();
      if (!title) {
        $("#rerr").textContent = "Upiši naziv izveštaja.";
        shake($("#rsheet"));
        return;
      }
      try {
        await api.upd("reports", rsReport.id, { title, loom });
        closeReportSheet();
        refresh();
        toast("Izveštaj sačuvan");
      } catch (err) {
        $("#rerr").textContent = errMsg(err);
      }
      return;
    }
    if (!rsHTML) {
      $("#rerr").textContent = "Prvo izaberi .html izveštaj.";
      shake($("#rsheet"));
      return;
    }
    const it = S.items.find((i) => i.id === view.id);
    if (!it) return;
    const title = $("#rname").value.trim();
    if (!title) {
      $("#rerr").textContent = "Upiši naziv izveštaja.";
      shake($("#rsheet"));
      $("#rname").focus();
      return;
    }
    const btn = $("#rsOk");
    btn.disabled = true;
    try {
      const id = await saveReport(it, title, loom, rsHTML, (i, n) => {
        btn.textContent = n > 1 ? `Čuvam ${i}/${n}` : "Čuvam…";
      });
      markFresh(id);
      closeReportSheet();
      refresh();
      toast("Izveštaj dodat");
    } catch (err) {
      $("#rerr").textContent = errMsg(err);
      btn.disabled = false;
      btn.textContent = "Sačuvaj";
    }
  });
  const CHUNK = 80000;
  const htmlCache = new Map();
  async function saveReport(it, title, loom, html, progress) {
    const n = Math.max(1, Math.ceil(html.length / CHUNK));
    const data = {
      monthId: it.id,
      clientId: it.clientId,
      title,
      loom,
      chunks: n,
      size: html.length,
      createdAt: Date.now(),
      order: Date.now(),
      createdBy: me ? me.id : null,
    };
    if (!DB) {
      const id = "rep-" + Date.now().toString(36);
      htmlCache.set(id, html);
      S.reports.push({ id, ...data });
      return id;
    }
    const ref = DB.collection("reports").doc();
    const id = ref.id;
    for (let i = 0; i < n; i++) {
      progress(i + 1, n);
      await DB.doc(`reportChunks/${id}_${i}`).set({
        reportId: id,
        clientId: it.clientId,
        i,
        data: html.slice(i * CHUNK, (i + 1) * CHUNK),
      });
    }
    await ref.set(data);
    htmlCache.set(id, html);
    return id;
  }
  async function loadReportHTML(r) {
    if (htmlCache.has(r.id)) return htmlCache.get(r.id);
    if (!DB) return "";
    const parts = [];
    for (let i = 0; i < (r.chunks || 1); i++) {
      const snap = await DB.doc(`reportChunks/${r.id}_${i}`).get();
      if (!snap.exists) throw { code: "missing" };
      parts.push(snap.data().data || "");
    }
    const html = parts.join("");
    htmlCache.set(r.id, html);
    return html;
  }
  async function deleteReport(id) {
    const r = S.reports.find((x) => x.id === id);
    if (!r) return;
    try {
      await api.del("reports", id);
      if (DB)
        for (let i = 0; i < (r.chunks || 1); i++) {
          try {
            await DB.doc(`reportChunks/${id}_${i}`).delete();
          } catch (e) {}
        }
      else S.reports = S.reports.filter((x) => x.id !== id);
      htmlCache.delete(id);
      refresh();
      toast("Izveštaj obrisan");
    } catch (e) {
      toast(errMsg(e));
    }
  }

  /* report viewer */
  let rvLoaded = null;
  function renderRV() {
    if ($("#rv").hidden) return;
    const r = S.reports.find((x) => x.id === view.id);
    const frame = $("#rvFrame");
    if (!S.ready) {
      frame.innerHTML =
        '<div class="rv-load"><div class="spin"></div>Učitavam izveštaj…</div>';
      return;
    }
    if (!r) {
      $("#rvTitle").textContent = "";
      $("#rvLink").hidden = true;
      $("#vcta").hidden = true;
      frame.innerHTML =
        '<div class="rv-load"><b style="font-family:var(--f-display);font-size:28px;color:var(--cream)">Izveštaj ne postoji</b>Možda je obrisan.</div>';
      return;
    }
    applyTheme(r.clientId);
    $("#rvTitle").textContent = r.title || "Izveštaj";
    const has = okLink(r.loom);
    $("#vcta").hidden = !has;
    if (has) $("#vcta").href = r.loom;
    $("#rvLink").hidden = false;
    $("#rvLink").innerHTML =
      `${SV('<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>')}<span>${has ? "Uredi" : "Dodaj Loom link"}</span>`;
    if (rvLoaded === r.id) return;
    rvLoaded = r.id;
    frame.innerHTML =
      '<div class="rv-load"><div class="spin"></div>Učitavam izveštaj…</div>';
    loadReportHTML(r)
      .then((html) => {
        if (view.name !== "rv" || view.id !== r.id) return;
        const f = document.createElement("iframe");
        f.setAttribute(
          "sandbox",
          "allow-scripts allow-popups allow-popups-to-escape-sandbox allow-forms allow-modals",
        );
        f.setAttribute("title", r.title || "Izveštaj");
        f.onload = () => {
          f.classList.add("ready");
          const l = frame.querySelector(".rv-load");
          l && l.remove();
        };
        f.srcdoc =
          html ||
          "<p style='font-family:sans-serif;padding:40px'>Izveštaj je prazan.</p>";
        frame.appendChild(f);
      })
      .catch(() => {
        frame.innerHTML =
          '<div class="rv-load">Izveštaj nije mogao da se učita. Probaj ponovo.</div>';
        rvLoaded = null;
      });
  }
  $("#rvBack").onclick = () => {
    const r = S.reports.find((x) => x.id === view.id);
    nav(r ? "r-" + r.monthId : "projects");
  };
  $("#rvLink").onclick = () => {
    const r = S.reports.find((x) => x.id === view.id);
    if (r) openReportSheet("edit", r);
  };

  /* ---------------- content manager ---------------- */
  let firstCM = true;
  function fmtColor(f) {
    const x = FORMATS.find((a) => a[0] === f);
    return x ? x[1] : "#a39a90";
  }
  function cardHTML(s, c, anim, delay) {
    const fresh = S.fresh.has(s.id);
    const models = (s.models || []).filter(Boolean).map(modelRef);
    const cc = openComments(s.id).length;
    return `<div class="scard${fresh ? " new" : ""}${cc ? " has-cc" : ""}" role="button" tabindex="0" data-script="${esc(s.id)}" style="--c:${c};${fresh ? "" : anim ? `animation-delay:${delay.toFixed(2)}s` : "animation:none"}">
    ${cc ? `<span class="sc-cc" title="Komentari klijenta" aria-label="${cc} ${ccWord(cc)} klijenta">${IC.msg}<b>${cc}</b></span>` : ""}
    <div class="st${s.title ? "" : " empty"}">${esc(s.title || "Bez naziva")}</div>
    ${s.angle ? `<div class="meta">${IC.angle}<span>${esc(s.angle)}</span></div>` : ""}
    ${s.format ? `<span class="fpill" style="--f:${fmtColor(s.format)}">${esc(s.format)}</span>` : ""}
    ${
      models.length
        ? `<div class="mavs"><span class="st2">${models
            .slice(0, 4)
            .map((r) =>
              r.photo
                ? `<img src="${esc(r.photo)}" alt="">`
                : `<i>${esc(initials(r.name))}</i>`,
            )
            .join(
              "",
            )}</span><span>${models.map((r) => esc(r.name)).join(", ")}</span></div>`
        : ""
    }
  </div>`;
  }
  function renderCM() {
    if ($("#cm").hidden) return;
    const it = S.items.find((i) => i.id === view.id);
    const root = $("#sboard");
    if (!S.ready) {
      $("#cmId").innerHTML = "";
      root.innerHTML = '<div class="state">Učitavam skripte…</div>';
      return;
    }
    if (!it) {
      $("#cmId").innerHTML = "";
      root.innerHTML =
        '<div class="state"><b>Ovaj mesec ne postoji</b>Možda je obrisan.<button class="pill" data-go="projects">Nazad na projekte</button></div>';
      return;
    }
    const c = S.clients.find((x) => x.id === it.clientId) || {
      id: "",
      name: "",
      color: "#e1802c",
    };
    applyTheme(c.id);
    $("#cmId").style.setProperty("--c", c.color || "#e1802c");
    $("#cmId").innerHTML =
      `${logo(c, "lg-ic")}<div><h1><span class="w"><span>Content Manager</span></span></h1><div class="sub">${esc(c.name)} · ${esc(it.title)}</div></div>`;
    $("#cmBackLbl").textContent = it.title;
    if (!firstCM) $("#cmId .w>span").style.animation = "none";
    const anim = firstCM;
    firstCM = false;
    const scripts = S.scripts.filter((s) => s.monthId === it.id);
    const sl = root.scrollLeft;
    root.innerHTML = STATUSES.map((st, si) => {
      const list = scripts
        .filter((s) => (s.status || "write") === st.id)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      return `<section class="col scol" data-status="${st.id}" style="--c:${st.c};${anim ? `animation-delay:${(0.05 + si * 0.07).toFixed(2)}s` : "animation:none"}">
      <div class="col-h"><span class="stag">${st.name}</span><span class="n">${list.length}</span><button class="plus" data-new="${st.id}" aria-label="Nova skripta u ${st.name}">${IC.plus}</button></div>
      <div class="srows">${list.map((s, i) => cardHTML(s, st.c, anim, 0.18 + si * 0.07 + i * 0.05)).join("")}<button class="row add" data-new="${st.id}"${anim ? ` style="animation-delay:${(0.2 + si * 0.07 + list.length * 0.05).toFixed(2)}s"` : ' style="animation:none"'}><span class="ri">${IC.plus}</span><span class="tt">Nova skripta</span></button></div>
    </section>`;
    }).join("");
    root.scrollLeft = sl;
  }
  async function newScript(status) {
    const it = S.items.find((i) => i.id === view.id);
    if (!it) return;
    const same = S.scripts.filter(
      (s) => s.monthId === it.id && (s.status || "write") === status,
    );
    const order = same.reduce((a, s) => Math.max(a, s.order || 0), 0) + 1000;
    const id = await create("scripts", {
      monthId: it.id,
      clientId: it.clientId,
      title: "",
      status,
      angle: "",
      format: "",
      models: [],
      location: "",
      props: "",
      body: "",
      order,
      createdBy: me ? me.id : null,
      updatedAt: Date.now(),
    });
    if (id) {
      edReturn = view.id;
      nav("s-" + id);
      setTimeout(() => $("#edTitle").focus(), 80);
    }
  }
  let edReturn = null;
  $("#newScript").onclick = () => newScript("write");
  $("#cmBack").onclick = () => nav("m-" + view.id);
  $("#sboard").addEventListener("click", (e) => {
    if (justDragged) {
      justDragged = false;
      return;
    }
    const n = e.target.closest("[data-new]");
    if (n) {
      newScript(n.dataset.new);
      return;
    }
    const c = e.target.closest("[data-script]");
    if (c) {
      edReturn = view.id;
      nav("s-" + c.dataset.script);
    }
  });
  $("#sboard").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const c = e.target.closest("[data-script]");
      if (c) {
        edReturn = view.id;
        nav("s-" + c.dataset.script);
      }
    }
  });
  dragScroll($("#sboard"), ".scard");

  /* card drag and drop: mouse drags after a small move, touch after a short hold */
  let drag = null,
    justDragged = false,
    scrollRAF = 0;
  const sb = $("#sboard");
  sb.addEventListener("pointerdown", (e) => {
    const card = e.target.closest(".scard");
    if (!card || (e.pointerType === "mouse" && e.button !== 0)) return;
    drag = {
      card,
      id: card.dataset.script,
      x0: e.clientX,
      y0: e.clientY,
      x: e.clientX,
      y: e.clientY,
      started: false,
      touch: e.pointerType !== "mouse",
    };
    if (drag.touch)
      drag.timer = setTimeout(() => {
        if (drag && !drag.started) startDrag();
      }, 260);
  });
  document.addEventListener(
    "touchmove",
    (e) => {
      if (drag && drag.started) e.preventDefault();
    },
    { passive: false },
  );
  sb.addEventListener("contextmenu", (e) => {
    if (e.target.closest(".scard")) e.preventDefault();
  });
  addEventListener("pointermove", (e) => {
    if (!drag) return;
    drag.x = e.clientX;
    drag.y = e.clientY;
    const dist = Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0);
    if (!drag.started) {
      if (drag.touch) {
        if (dist > 10) {
          clearTimeout(drag.timer);
          drag = null;
        }
        return;
      }
      if (dist > 6) startDrag();
      else return;
    }
    moveDrag();
  });
  addEventListener("pointerup", () => {
    if (!drag) return;
    clearTimeout(drag.timer);
    if (drag.started) dropDrag();
    else drag = null;
  });
  addEventListener("pointercancel", () => {
    if (!drag) return;
    clearTimeout(drag.timer);
    if (drag.started) dropDrag();
    else drag = null;
  });
  function startDrag() {
    const card = drag.card,
      r = card.getBoundingClientRect();
    drag.started = true;
    drag.offX = drag.x - r.left;
    drag.offY = drag.y - r.top;
    const g = card.cloneNode(true);
    g.classList.add("drag-ghost");
    g.classList.remove("new");
    g.style.width = r.width + "px";
    g.style.animation = "none";
    g.style.transform = `translate(${r.left}px,${r.top}px) rotate(2.5deg) scale(1.04)`;
    document.body.appendChild(g);
    drag.ghost = g;
    const ph = document.createElement("div");
    ph.className = "ph";
    ph.style.height = r.height + "px";
    ph.style.setProperty("--c", card.style.getPropertyValue("--c"));
    card.after(ph);
    card.classList.add("lifted");
    drag.ph = ph;
    sb.classList.add("dragging");
    document.body.style.userSelect = "none";
    $("#trash").classList.add("show");
    try {
      navigator.vibrate && navigator.vibrate(12);
    } catch (e) {}
    scrollLoop();
    moveDrag();
  }
  function moveDrag() {
    const { ghost, ph } = drag;
    const tr = $("#trash").getBoundingClientRect();
    const hot =
      drag.x >= tr.left - 10 &&
      drag.x <= tr.right + 10 &&
      drag.y >= tr.top - 16 &&
      drag.y <= tr.bottom + 10;
    if (hot !== !!drag.hot) {
      drag.hot = hot;
      $("#trash").classList.toggle("hot", hot);
      ghost.classList.toggle("doomed", hot);
      try {
        hot && navigator.vibrate && navigator.vibrate(8);
      } catch (e) {}
    }
    ghost.style.transformOrigin = `${drag.offX}px ${drag.offY}px`;
    ghost.style.transform = `translate(${drag.x - drag.offX}px,${drag.y - drag.offY}px) rotate(${drag.hot ? -6 : 2.5}deg) scale(${drag.hot ? 0.5 : 1.04})`;
    if (hot) {
      $$(".scol.over").forEach((x) => x.classList.remove("over"));
      return;
    }
    const el = document.elementFromPoint(drag.x, drag.y);
    const col = el && el.closest(".scol");
    $$(".scol.over").forEach((x) => {
      if (x !== col) x.classList.remove("over");
    });
    if (!col) return;
    col.classList.add("over");
    ph.style.setProperty("--c", col.style.getPropertyValue("--c"));
    ghost.style.setProperty("--c", col.style.getPropertyValue("--c"));
    const rows = col.querySelector(".srows");
    const cards = [...rows.querySelectorAll(".scard:not(.lifted)")];
    const before = cards.find((c) => {
      const r = c.getBoundingClientRect();
      return drag.y < r.top + r.height / 2;
    });
    const target = before || rows.querySelector(".row.add");
    if (ph.nextSibling !== target) rows.insertBefore(ph, target);
  }
  function scrollLoop() {
    cancelAnimationFrame(scrollRAF);
    const tick = () => {
      if (!drag || !drag.started) return;
      const r = sb.getBoundingClientRect(),
        edge = 70;
      let dx = 0;
      if (drag.x < r.left + edge) dx = -14;
      else if (drag.x > r.right - edge) dx = 14;
      if (dx) {
        sb.scrollLeft += dx;
        moveDrag();
      }
      let dy = 0;
      if (drag.y < 70) dy = -12;
      else if (drag.y > innerHeight - 70) dy = 12;
      if (dy) {
        scrollBy(0, dy);
        moveDrag();
      }
      scrollRAF = requestAnimationFrame(tick);
    };
    scrollRAF = requestAnimationFrame(tick);
  }
  function dropDrag() {
    const d = drag;
    drag = null;
    cancelAnimationFrame(scrollRAF);
    justDragged = true;
    setTimeout(() => (justDragged = false), 60);
    sb.classList.remove("dragging");
    document.body.style.userSelect = "";
    const trash = $("#trash");
    trash.classList.remove("show", "hot");
    if (d.hot) {
      const tr = trash.getBoundingClientRect();
      d.ghost.classList.add("gone");
      d.ghost.style.transform = `translate(${tr.left + tr.width / 2 - 40}px,${tr.top}px) scale(.2) rotate(-20deg)`;
      $$(".scol.over").forEach((x) => x.classList.remove("over"));
      setTimeout(
        () => {
          d.ghost.remove();
          d.ph.remove();
          d.card.classList.remove("lifted");
          const s = S.scripts.find((x) => x.id === d.id);
          if (s) deleteScript(s);
          else renderCM();
        },
        reduce ? 0 : 320,
      );
      return;
    }
    $$(".scol.over").forEach((x) => x.classList.remove("over"));
    const col = d.ph.closest(".scol");
    const status = col ? col.dataset.status : null;
    const prev = d.ph.previousElementSibling,
      next = d.ph.nextElementSibling;
    const ord = (el) => {
      if (!el || !el.dataset || !el.dataset.script) return null;
      const s = S.scripts.find((x) => x.id === el.dataset.script);
      return s ? s.order || 0 : null;
    };
    const p = ord(prev),
      n = ord(next);
    const order =
      p != null && n != null
        ? (p + n) / 2
        : p != null
          ? p + 1000
          : n != null
            ? n - 1000
            : 1000;
    const r = d.ph.getBoundingClientRect();
    d.ghost.classList.add("settle");
    d.ghost.style.transform = `translate(${r.left}px,${r.top}px)`;
    const s = S.scripts.find((x) => x.id === d.id);
    const changed = !!(
      s &&
      status &&
      (s.status !== status || s.order !== order)
    );
    const moved = !!(s && status && s.status !== status);
    setTimeout(
      () => {
        d.ghost.remove();
        if (changed) {
          const old = { status: s.status, order: s.order };
          api
            .upd("scripts", d.id, { status, order, updatedAt: Date.now() })
            .catch((e) => {
              Object.assign(s, old);
              renderCM();
              toast(errMsg(e));
            });
        }
        renderCM();
        const el = $(`.scard[data-script="${CSS.escape(d.id)}"]`);
        if (el) {
          el.style.animation = "";
          el.classList.add("landed");
        }
        if (moved)
          toast(`Prebačeno u ${STATUSES.find((x) => x.id === status).name}`);
      },
      reduce ? 0 : 300,
    );
  }

  /* ---------------- editor ---------------- */
  let edId = null,
    saveTimer = null,
    dirty = {},
    lastPropsSig = "";
  /* skripte pišu u blok editor iz notes.js (#edBody), stranice klijenta u stari #editor */
  const editor = $("#editor"),
    edRoot = $("#edBody"),
    edTitle = $("#edTitle");
  try {
    document.execCommand("defaultParagraphSeparator", false, "p");
  } catch (e) {}

  const ALLOWED = new Set([
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
    "FONT",
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
  const okUrl = (u) =>
    /^(\/_blob\/[A-Za-z0-9]+|https:\/\/|data:image\/|blob:)/.test(u || "");
  function isGrey(c) {
    c = (c || "").toLowerCase().replace(/\s/g, "");
    return c === GREY || c === "rgb(138,133,128)";
  }
  function sanitize(html) {
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
        if (
          [
            "SCRIPT",
            "STYLE",
            "IFRAME",
            "OBJECT",
            "EMBED",
            "SVG",
            "MATH",
            "TEMPLATE",
          ].includes(tag)
        ) {
          n.remove();
          return;
        }
        walk(n);
        if (!ALLOWED.has(tag)) {
          n.replaceWith(...n.childNodes);
          return;
        }
        if (tag === "SPAN" || tag === "FONT") {
          const grey =
            n.classList.contains("grey") ||
            isGrey(n.style && n.style.color) ||
            isGrey(n.getAttribute("color"));
          if (!grey) {
            n.replaceWith(...n.childNodes);
            return;
          }
          const sp = document.createElement("span");
          sp.className = "grey";
          sp.append(...n.childNodes);
          n.replaceWith(sp);
          return;
        }
        if (isGrey(n.style && n.style.color)) {
          const sp = document.createElement("span");
          sp.className = "grey";
          sp.append(...n.childNodes);
          n.append(sp);
        }
        const keep = {};
        if (tag === "IMG") {
          const src = n.getAttribute("src");
          if (!okUrl(src)) {
            n.remove();
            return;
          }
          keep.src = src;
        }
        if (tag === "A") {
          const href = n.getAttribute("href");
          if (!okUrl(href)) {
            n.replaceWith(...n.childNodes);
            return;
          }
          keep.href = href;
          keep.class = "file";
          keep["data-name"] = n.getAttribute("data-name") || n.textContent;
        }
        [...n.attributes].forEach((a) => n.removeAttribute(a.name));
        for (const k in keep) n.setAttribute(k, keep[k]);
      });
    };
    walk(t.content);
    return t.innerHTML;
  }
  function prepForEdit(html) {
    const t = document.createElement("template");
    t.innerHTML = sanitize(html);
    t.content.querySelectorAll("a.file").forEach((a) => {
      a.setAttribute("contenteditable", "false");
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener");
    });
    return t.innerHTML || "<p><br></p>";
  }
  function updEmpty() {
    const t = editor.textContent.trim();
    editor.classList.toggle(
      "empty",
      !t && !editor.querySelector("img,hr,a.file,li"),
    );
  }

  let edCol = "scripts";
  function curScript() {
    return edCol === "scripts" ? S.scripts.find((s) => s.id === edId) : null;
  }
  function edDoc() {
    return (S[edCol] || []).find((s) => s.id === edId);
  }
  function openEditor(id, col) {
    closeSlash();
    if (col) edCol = col;
    const isPage = edCol === "cpages";
    $("#props").hidden = false;
    edTitle.dataset.ph = isPage ? "Naziv stranice" : "Naziv skripte";
    $("#edBackLbl").textContent = isPage
      ? "Client Platform"
      : "Content Manager";
    $("#delLbl").textContent = isPage ? "Obriši stranicu" : "Obriši skriptu";
    $("#delScriptTop").setAttribute(
      "aria-label",
      isPage ? "Obriši stranicu" : "Obriši skriptu",
    );
    const s = (S[edCol] || []).find((x) => x.id === id);
    if (!S.ready || !s) {
      edId = id;
      edTitle.textContent = "";
      editor.innerHTML = "";
      $("#props").innerHTML = S.ready
        ? `<div class="state"><b>${isPage ? "Stranica" : "Skripta"} ne postoji</b>Možda je obrisana.</div>`
        : '<div class="state">Učitavam…</div>';
      editor.hidden = edRoot.hidden = true;
      $("#delScript").hidden = true;
      return;
    }
    editor.hidden = !isPage;
    edRoot.hidden = isPage;
    $("#delScript").hidden = false;
    applyTheme(s.clientId);
    const restart = edId !== id;
    edId = id;
    dirty = {};
    if (!isPage && !edReturn) edReturn = s.monthId;
    edTitle.textContent = s.title || "";
    if (isPage) {
      editor.innerHTML = prepForEdit(s.body);
      updEmpty();
      $("#props").innerHTML = "";
      $("#props").hidden = true;
    } else {
      if (NT) NT.open(id, "script");
      renderProps(true);
    }
    ccSig = "";
    renderCcmt();
    setSave(false);
    if (restart)
      [edTitle, $("#props"), isPage ? editor : edRoot].forEach((el) => {
        el.style.animation = "none";
        el.offsetHeight;
        el.style.animation = "";
      });
  }
  $("#edBack").onclick = () => {
    flushSave();
    if (edCol === "cpages") {
      const p = edDoc();
      nav(p ? "cp-" + p.clientId : "projects");
      return;
    }
    const s = curScript();
    nav("cm-" + (s ? s.monthId : edReturn || ""));
  };

  function syncEditorFromStore() {
    const s = edDoc();
    if (!s) {
      if (edId && S.ready) openEditor(edId);
      return;
    }
    if ((edCol === "scripts" ? edRoot : editor).hidden) {
      openEditor(edId);
      return;
    }
    if (
      document.activeElement !== edTitle &&
      !dirty.title &&
      edTitle.textContent !== (s.title || "")
    )
      edTitle.textContent = s.title || "";
    if (edCol === "scripts") {
      if (NT) NT.sync();
    } else if (document.activeElement !== editor && !dirty.body) {
      const html = prepForEdit(s.body);
      if (sanitize(editor.innerHTML) !== sanitize(s.body || "")) {
        editor.innerHTML = html;
        updEmpty();
      }
    }
    if (
      edCol === "scripts" &&
      !$("#props").contains(document.activeElement) &&
      !openPop
    )
      renderProps(false);
    renderCcmt();
  }
  function setSave(busy) {
    const el = $("#saveState");
    el.classList.toggle("busy", busy);
    el.querySelector("span").textContent = busy ? "Čuvam…" : "Sačuvano";
  }
  function queue(field, val) {
    dirty[field] = val;
    setSave(true);
    clearTimeout(saveTimer);
    saveTimer = setTimeout(flushSave, 800);
  }
  async function flushSave() {
    clearTimeout(saveTimer);
    const id = edId,
      patch = { ...dirty };
    dirty = {};
    if (!id || !Object.keys(patch).length) {
      setSave(false);
      return;
    }
    patch.updatedAt = Date.now();
    patch.updatedBy = me ? me.id : null;
    if (edCol === "scripts" && Array.isArray(patch.models))
      patch.modelNames = patch.models
        .map((v) => modelRef(v).name)
        .filter(Boolean);
    try {
      await api.upd(edCol, id, patch);
      if (!Object.keys(dirty).length) setSave(false);
    } catch (e) {
      toast(errMsg(e));
      setSave(false);
    }
  }
  edTitle.addEventListener("input", () => {
    queue("title", edTitle.textContent.trim());
  });
  edTitle.addEventListener("keydown", (e) => {
    if (e.isComposing) return;
    if (edCol === "scripts" && NT) {
      let atEnd = false;
      const sel = getSelection();
      if (sel.rangeCount && sel.isCollapsed) {
        const r = document.createRange();
        r.selectNodeContents(edTitle);
        r.setStart(sel.focusNode, sel.focusOffset);
        atEnd = !r.toString().length;
      }
      if (e.key === "Enter" || (e.key === "ArrowDown" && atEnd)) {
        e.preventDefault();
        NT.focusTop(e.key === "Enter");
      }
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      editor.focus();
      placeCaretStart(editor);
    }
  });
  edTitle.addEventListener("paste", (e) => {
    e.preventDefault();
    const t = (e.clipboardData || window.clipboardData)
      .getData("text/plain")
      .replace(/\s+/g, " ");
    document.execCommand("insertText", false, t);
  });
  function placeCaretStart(el) {
    const r = document.createRange();
    const first = el.firstChild || el;
    r.setStart(first, 0);
    r.collapse(true);
    const s = getSelection();
    s.removeAllRanges();
    s.addRange(r);
  }

  /* properties panel */
  let openPop = null;
  function closePops() {
    if (openPop) {
      openPop.remove();
      openPop = null;
    }
  }
  document.addEventListener("pointerdown", (e) => {
    if (
      openPop &&
      !openPop.contains(e.target) &&
      !e.target.closest("[data-pop]")
    )
      closePops();
  });
  function allValues(field, clientId) {
    const set = new Set();
    S.scripts.forEach((s) => {
      if (clientId && s.clientId !== clientId) return;
      const v = s[field];
      (Array.isArray(v) ? v : [v]).forEach((x) => {
        if (x) set.add(x);
      });
    });
    return [...set].sort((a, b) => a.localeCompare(b));
  }
  function renderProps(force) {
    const s = curScript();
    if (!s) return;
    const st =
      STATUSES.find((x) => x.id === (s.status || "write")) || STATUSES[0];
    const sig = JSON.stringify([
      s.status,
      s.format,
      s.models,
      s.angle,
      s.location,
      s.props,
      S.models.map((m) => m.id + m.name + (m.photo ? 1 : 0)).join(),
    ]);
    if (!force && sig === lastPropsSig) return;
    lastPropsSig = sig;
    const models = s.models || [];
    $("#props").innerHTML = `
    <div class="prop"><div class="k">${IC.status}Faza izrade</div><div class="v"><button class="vbtn" data-pop="status"><span class="stag" style="--c:${st.c}">${st.name}</span></button></div></div>
    <div class="prop"><div class="k">${IC.model}Model</div><div class="v">${models
      .map((v) => {
        const r = modelRef(v);
        return `<button class="mchip2" data-open-pick title="Izmeni modele">${r.photo ? `<img src="${esc(r.photo)}" alt="">` : `<span class="i">${esc(initials(r.name))}</span>`}${esc(r.name)}</button>`;
      })
      .join(
        "",
      )}<button class="mbtn" data-open-pick>${models.length ? SV('<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>') : IC.plus}${models.length ? "Izmeni" : "Izaberi modele"}</button></div></div>
    <div class="prop"><div class="k">${IC.angle}Angle</div><div class="v"><button class="vbtn" data-pop="angle">${s.angle ? `<span class="achip-v">${IC.angle}${esc(s.angle)}</span>` : '<span class="empty-v">Izaberi ugao</span>'}</button></div></div>
    <div class="prop"><div class="k">${IC.format}Format</div><div class="v"><button class="vbtn" data-pop="format">${s.format ? `<span class="fpill" style="--f:${fmtColor(s.format)}">${esc(s.format)}</span>` : '<span class="empty-v">Prazno</span>'}</button></div></div>
    <div class="prop"><div class="k">${IC.pin}Lokacija</div><div class="v"><input class="txt" id="locIn" value="${esc(s.location || "")}" placeholder="Prazno" autocomplete="off"></div></div>
    <div class="prop"><div class="k">${IC.box}Rekviziti</div><div class="v"><textarea id="propsIn" rows="1" placeholder="Prazno">${esc(s.props || "")}</textarea></div></div>`;
    autoGrow($("#propsIn"));
  }
  function autoGrow(t) {
    t.style.height = "auto";
    t.style.height = t.scrollHeight + "px";
  }
  const P = $("#props");
  P.addEventListener("click", (e) => {
    const b = e.target.closest("[data-pop]");
    if (b) {
      e.preventDefault();
      openPopFor(b);
      return;
    }
    if (e.target.closest("[data-open-pick]")) {
      openPicker();
      return;
    }
  });
  P.addEventListener("keydown", (e) => {
    if (
      (e.target.id === "angleIn" || e.target.id === "locIn") &&
      e.key === "Enter"
    ) {
      e.preventDefault();
      e.target.blur();
    }
  });
  P.addEventListener("input", (e) => {
    const s = curScript();
    if (!s) return;
    if (e.target.id === "angleIn") {
      s.angle = e.target.value.trim();
      queue("angle", s.angle);
    }
    if (e.target.id === "locIn") {
      s.location = e.target.value;
      queue("location", s.location);
    }
    if (e.target.id === "propsIn") {
      s.props = e.target.value;
      queue("props", s.props);
      autoGrow(e.target);
    }
  });
  P.addEventListener("focusout", (e) => {
    if (["angleIn", "locIn", "propsIn"].includes(e.target.id)) flushSave();
  });
  function addModel(v) {
    v = (v || "").trim();
    if (!v) return;
    const s = curScript();
    const m = [...(s.models || [])];
    if (!m.includes(v)) m.push(v);
    s.models = m;
    queue("models", m);
    flushSave();
    renderProps(true);
    setTimeout(() => $("#modelIn") && $("#modelIn").focus(), 0);
  }
  function openPopFor(btn) {
    const kind = btn.dataset.pop;
    const had = openPop && openPop.dataset.kind === kind;
    closePops();
    if (had) return;
    const s = curScript();
    const pop = document.createElement("div");
    pop.className = "pop";
    pop.dataset.kind = kind;
    if (kind === "status")
      pop.innerHTML = STATUSES.map(
        (st) =>
          `<button data-set-status="${st.id}"><span class="stag" style="--c:${st.c}">${st.name}</span>${(s.status || "write") === st.id ? IC.check : ""}</button>`,
      ).join("");
    else if (kind === "angle") {
      pop.classList.add("wide");
      const angs = S.angles
        .filter((a) => a.clientId === s.clientId && (a.name || "").trim())
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      pop.innerHTML =
        (angs.length
          ? angs
              .map(
                (a) =>
                  `<button data-set-angle="${esc(a.name)}"><span class="ao"><b>${esc(a.name)}</b>${a.pain ? `<small>${esc(a.pain)}</small>` : ""}</span>${s.angle === a.name ? IC.check : ""}</button>`,
              )
              .join("")
          : '<div class="hint">Ovaj klijent još nema uglove.</div>') +
        (s.angle
          ? `<button data-set-angle=""><span class="empty-v">Bez ugla</span></button>`
          : "") +
        `<div class="pfoot"><button data-go-ang="${esc(s.clientId)}">${SV('<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>')}Uredi uglove</button></div>`;
    } else
      pop.innerHTML =
        FORMATS.map(
          ([f, c]) =>
            `<button data-set-format="${esc(f)}"><span class="fpill" style="--f:${c}">${esc(f)}</span>${s.format === f ? IC.check : ""}</button>`,
        ).join("") +
        (s.format
          ? `<button data-set-format=""><span class="empty-v">Bez formata</span></button>`
          : "");
    btn.closest(".prop").appendChild(pop);
    openPop = pop;
    pop.addEventListener("click", (e) => {
      const a = e.target.closest("[data-set-status]"),
        f = e.target.closest("[data-set-format]");
      if (a) {
        const st = a.dataset.setStatus;
        if (st !== s.status) {
          const max = S.scripts
            .filter((x) => x.monthId === s.monthId && x.status === st)
            .reduce((m, x) => Math.max(m, x.order || 0), 0);
          s.status = st;
          s.order = max + 1000;
          queue("status", st);
          dirty.order = s.order;
          flushSave();
        }
      }
      if (f) {
        s.format = f.dataset.setFormat;
        queue("format", s.format);
        flushSave();
      }
      const ag = e.target.closest("[data-set-angle]");
      if (ag) {
        s.angle = ag.dataset.setAngle;
        queue("angle", s.angle);
        flushSave();
      }
      const ga = e.target.closest("[data-go-ang]");
      if (ga) {
        closePops();
        flushSave();
        nav("ang-" + ga.dataset.goAng);
        return;
      }
      closePops();
      renderProps(true);
    });
  }

  /* editor: keyboard shortcuts, markdown, slash menu */
  editor.addEventListener("input", (e) => {
    updEmpty();
    if (e.inputType === "insertText" && e.data === " ") mdShortcut();
    if (e.inputType === "insertText" && e.data === "/") openSlash();
    else if (slashOpen) updateSlash();
    queue("body", sanitize(editor.innerHTML));
  });
  editor.addEventListener("keydown", (e) => {
    if (slashOpen) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        moveSlash(1);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        moveSlash(-1);
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        const it = slashItems[slashIdx];
        if (it) {
          e.preventDefault();
          runSlash(it);
        } else closeSlash();
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        closeSlash();
        return;
      }
    }
    if (e.key === "Tab") {
      const cell = cellAtCaret();
      if (cell) {
        e.preventDefault();
        tabCell(cell, e.shiftKey);
        return;
      }
    }
    const mod = e.metaKey || e.ctrlKey;
    if (mod && !e.shiftKey && !e.altKey) {
      const k = e.key.toLowerCase();
      if (k === "b") {
        e.preventDefault();
        fbCmd("bold");
        afterCmd();
      } else if (k === "i") {
        e.preventDefault();
        fbCmd("italic");
        afterCmd();
      } else if (k === "u") {
        e.preventDefault();
        fbCmd("underline");
        afterCmd();
      } else if (k === "g") {
        e.preventDefault();
        toggleGrey();
        afterCmd();
      } else if (k === "s") {
        e.preventDefault();
        flushSave();
      }
    }
  });
  editor.addEventListener("blur", () => {
    setTimeout(() => {
      if (!slashEl.contains(document.activeElement)) closeSlash();
    }, 150);
    flushSave();
  });
  editor.addEventListener("click", (e) => {
    const a = e.target.closest("a.file");
    if (a) {
      e.preventDefault();
      const l = document.createElement("a");
      l.href = a.getAttribute("href");
      l.target = "_blank";
      l.rel = "noopener";
      document.body.appendChild(l);
      l.click();
      l.remove();
    }
  });
  editor.addEventListener("paste", (e) => {
    const cd = e.clipboardData;
    if (!cd) return;
    const file = [...(cd.files || [])].find((f) => f.type.startsWith("image/"));
    if (file) {
      e.preventDefault();
      insertUpload(file, "img");
      return;
    }
    const html = cd.getData("text/html");
    if (html) {
      e.preventDefault();
      document.execCommand("insertHTML", false, prepForEdit(html));
    }
  });
  editor.addEventListener("drop", (e) => {
    const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (f) {
      e.preventDefault();
      insertUpload(f, f.type.startsWith("image/") ? "img" : "file");
    }
  });
  function afterCmd() {
    queue("body", sanitize(editor.innerHTML));
  }

  /* macOS trackpad: horizontal swipes scroll, they never navigate back/forward.
   1) every horizontally-dominant wheel event is cancelled and the scroll is applied by hand,
      so the browser never sees an unconsumed horizontal scroll (Chrome / Edge / Electron);
   2) an always-present element with a real horizontal scrollbar makes Safari ask the page first
      instead of short-circuiting into its swipe gesture;
   3) if a history step still happens right after a horizontal swipe, it is undone (see hashchange). */
  var lastHWheel = 0;
  function hScroller(el) {
    for (
      ;
      el &&
      el.nodeType === 1 &&
      el !== document.documentElement &&
      el !== document.body;
      el = el.parentElement
    ) {
      const t = el.tagName;
      if (t === "INPUT" || t === "TEXTAREA") {
        if (el.scrollWidth > el.clientWidth + 1) return el;
        continue;
      }
      const ox = getComputedStyle(el).overflowX;
      if (
        (ox === "auto" || ox === "scroll") &&
        el.scrollWidth > el.clientWidth + 1
      )
        return el;
    }
    return null;
  }
  document.addEventListener(
    "wheel",
    (e) => {
      if (e.ctrlKey) return; // pinch-zoom
      const m = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? innerWidth : 1;
      let dx = e.deltaX * m,
        dy = e.deltaY * m;
      if (!dx && e.shiftKey) {
        dx = dy;
        dy = 0;
      } // shift + mouse wheel
      if (!dx || Math.abs(dx) < Math.abs(dy)) return; // vertical scroll stays native
      lastHWheel = performance.now();
      if (!e.cancelable) return; // browser already owns this gesture
      e.preventDefault();
      const sc = hScroller(e.target);
      if (sc) sc.scrollLeft += dx;
    },
    { passive: false, capture: true },
  );
  (function () {
    const g = document.createElement("div");
    g.className = "hguard";
    g.setAttribute("aria-hidden", "true");
    g.innerHTML = "<div></div>";
    document.body.appendChild(g);
  })();
  /* ---- selection format bar ---- */
  function fbCmd(c) {
    try {
      document.execCommand("styleWithCSS", false, false);
    } catch (e) {}
    document.execCommand(c);
    fbSync();
  }
  const FB_IC = {
    ul: SV(
      '<path d="M9 6h12M9 12h12M9 18h12"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>',
    ),
    ol: SV(
      '<path d="M10 6h11M10 12h11M10 18h11M4 6h1v4M4 10h2M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/>',
    ),
    quote: SV(
      '<path d="M3 21c3 0 7-1 7-8V5H3v7h4c0 4-2 5-4 5zM14 21c3 0 7-1 7-8V5h-7v7h4c0 4-2 5-4 5z"/>',
    ),
  };
  const FB = [
    ["p", "Aa", "Tekst"],
    ["h1", "H1", "Naslov 1"],
    ["h2", "H2", "Naslov 2"],
    ["h3", "H3", "Naslov 3"],
    0,
    ["bold", "<b>B</b>", "Bold (Ctrl+B)"],
    ["italic", "<i>I</i>", "Italic (Ctrl+I)"],
  ];
  const fbar = document.createElement("div");
  fbar.className = "fbar";
  fbar.hidden = true;
  fbar.setAttribute("role", "toolbar");
  fbar.setAttribute("aria-label", "Format teksta");
  fbar.innerHTML = FB.map((b, i) =>
    b
      ? `<button type="button" data-fb="${b[0]}" title="${b[2]}" aria-label="${b[2]}" style="--i:${i}">${b[1]}</button>`
      : `<i class="fbsep"></i>`,
  ).join("");
  document.body.appendChild(fbar);
  let fbShown = false,
    fbRaf = 0;
  function fbRange() {
    const sel = getSelection();
    if (!sel || !sel.rangeCount || sel.isCollapsed) return null;
    if (!editor.contains(sel.anchorNode) || !editor.contains(sel.focusNode))
      return null;
    const r = sel.getRangeAt(0);
    if (!r.toString().trim() && !r.cloneContents().querySelector("img"))
      return null;
    return r;
  }
  function fbPlace() {
    const r = fbRange();
    if (!r || slashOpen || $("#ed").hidden) {
      fbHide();
      return;
    }
    const rects = [...r.getClientRects()].filter((x) => x.width || x.height);
    const top = rects.length ? rects[0] : r.getBoundingClientRect(),
      all = r.getBoundingClientRect();
    if (!fbShown) {
      fbar.hidden = false;
      fbar.classList.remove("show");
      void fbar.offsetWidth;
      fbar.classList.add("show");
      fbShown = true;
    }
    const coarse = matchMedia("(pointer:coarse)").matches;
    fbar.classList.toggle("dock", coarse);
    if (coarse) {
      /* phone: dock above the keyboard so the native iOS/Android menu next to the selection stays visible */
      const vv = window.visualViewport,
        vt = vv ? vv.offsetTop : 0,
        vh = vv ? vv.height : innerHeight,
        vl = vv ? vv.offsetLeft : 0,
        vw = vv ? vv.width : innerWidth;
      const h = fbar.offsetHeight,
        w = fbar.offsetWidth;
      let y = vt + vh - h - 10;
      if (all.bottom > y - 60 && all.top < y + h) y = vt + 10;
      fbar.style.transform = `translate(${Math.round(vl + (vw - w) / 2)}px,${Math.round(y)}px)`;
      fbSync();
      return;
    }
    const w = fbar.offsetWidth,
      h = fbar.offsetHeight;
    let y = top.top - h - 12,
      below = false;
    if (!coarse && y < 10) {
      y = all.bottom + 12;
      below = true;
    }
    if (y + h > innerHeight - 8) y = Math.max(8, top.top - h - 12);
    const cx = rects.length
      ? (top.left + top.right) / 2
      : (all.left + all.right) / 2;
    let x = Math.max(10, Math.min(innerWidth - w - 10, cx - w / 2));
    fbar.style.transform = `translate(${Math.round(x)}px,${Math.round(y)}px)`;
    fbar.classList.toggle("below", below);
    fbar.style.setProperty(
      "--ax",
      Math.max(16, Math.min(w - 16, cx - x)) + "px",
    );
    fbSync();
  }
  function fbHide() {
    if (!fbShown) return;
    fbShown = false;
    fbar.classList.remove("show");
    fbar.hidden = true;
  }
  function fbSync() {
    if (!fbShown) return;
    const blk = blockOf(getSelection().anchorNode);
    const tag = (blk && blk.tagName) || "P";
    fbar.querySelectorAll("[data-fb]").forEach((b) => {
      const id = b.dataset.fb;
      let on = false;
      if (["bold", "italic", "underline", "strikeThrough"].includes(id)) {
        try {
          on = document.queryCommandState(id);
        } catch (e) {}
      } else if (id === "grey") {
        try {
          on =
            (document.queryCommandValue("foreColor") || "").replace(
              /\s/g,
              "",
            ) === "rgb(138,133,128)";
        } catch (e) {}
      } else if (id === "p") on = tag === "P" || tag === "DIV";
      else if (/^h[123]$/.test(id)) on = tag === id.toUpperCase();
      else if (id === "ul") on = tag === "UL";
      else if (id === "ol") on = tag === "OL";
      else if (id === "quote") on = tag === "BLOCKQUOTE";
      b.classList.toggle("on", on);
    });
  }
  document.addEventListener("selectionchange", () => {
    cancelAnimationFrame(fbRaf);
    fbRaf = requestAnimationFrame(fbPlace);
  });
  addEventListener(
    "scroll",
    () => {
      if (fbShown) fbPlace();
    },
    { passive: true },
  );
  if (window.visualViewport) {
    visualViewport.addEventListener("resize", () => {
      if (fbShown) fbPlace();
    });
    visualViewport.addEventListener("scroll", () => {
      if (fbShown) fbPlace();
    });
  }
  addEventListener("resize", () => {
    if (fbShown) fbPlace();
  });
  fbar.addEventListener("pointerdown", (e) => e.preventDefault());
  fbar.addEventListener("click", (e) => {
    const b = e.target.closest("[data-fb]");
    if (!b) return;
    const id = b.dataset.fb;
    const blk = blockOf(getSelection().anchorNode),
      tag = blk && blk.tagName;
    if (id === "p") document.execCommand("formatBlock", false, "<p>");
    else if (/^h[123]$/.test(id))
      document.execCommand(
        "formatBlock",
        false,
        tag === id.toUpperCase() ? "<p>" : "<" + id + ">",
      );
    else if (id === "quote")
      document.execCommand(
        "formatBlock",
        false,
        tag === "BLOCKQUOTE" ? "<p>" : "<blockquote>",
      );
    else if (id === "ul") document.execCommand("insertUnorderedList");
    else if (id === "ol") document.execCommand("insertOrderedList");
    else if (id === "grey") toggleGrey();
    else fbCmd(id);
    b.classList.remove("hit");
    void b.offsetWidth;
    b.classList.add("hit");
    afterCmd();
    requestAnimationFrame(fbPlace);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && fbShown) {
      fbHide();
    }
  });

  function cellAtCaret() {
    const s = getSelection();
    let n = s.anchorNode;
    while (n && n !== editor) {
      if (n.nodeType === 1 && (n.tagName === "TD" || n.tagName === "TH"))
        return n;
      n = n.parentNode;
    }
    return null;
  }
  function placeIn(el) {
    if (!el) return;
    const r = document.createRange();
    r.selectNodeContents(el);
    r.collapse(false);
    const s = getSelection();
    s.removeAllRanges();
    s.addRange(r);
  }
  function tabCell(cell, back) {
    const tb = cell.closest("table");
    const cells = [...tb.querySelectorAll("th,td")];
    let i = cells.indexOf(cell) + (back ? -1 : 1);
    if (i < 0) return;
    if (i >= cells.length) {
      const last =
        tb.querySelector("tbody tr:last-child") ||
        tb.querySelector("tr:last-child");
      const tr = document.createElement("tr");
      const n = last.children.length;
      for (let k = 0; k < n; k++) {
        const td = document.createElement("td");
        td.innerHTML = "<br>";
        tr.appendChild(td);
      }
      (tb.tBodies[0] || tb).appendChild(tr);
      placeIn(tr.firstChild);
      afterCmd();
      return;
    }
    placeIn(cells[i]);
  }
  function toggleGrey() {
    try {
      document.execCommand("styleWithCSS", false, true);
    } catch (e) {}
    const cur = (document.queryCommandValue("foreColor") || "").replace(
      /\s/g,
      "",
    );
    document.execCommand(
      "foreColor",
      false,
      cur === "rgb(138,133,128)" ? CREAM : GREY,
    );
    try {
      document.execCommand("styleWithCSS", false, false);
    } catch (e) {}
  }
  function blockOf(node) {
    while (node && node.parentNode !== editor) node = node.parentNode;
    return node;
  }
  function mdShortcut() {
    const sel = getSelection();
    if (!sel.rangeCount) return;
    const blk = blockOf(sel.anchorNode);
    if (!blk || blk.tagName === "LI") return;
    const text = blk.textContent.replace(/ /g, " ");
    const m = text.match(/^(#{1,3}|-|\*|1\.) /);
    if (!m || (text.length !== m[0].length && sel.anchorOffset !== m[0].length))
      return;
    if (!text.startsWith(m[0])) return;
    const r = document.createRange();
    r.setStart(
      blk.firstChild && blk.firstChild.nodeType === 3 ? blk.firstChild : blk,
      0,
    );
    r.setEnd(sel.anchorNode, sel.anchorOffset);
    sel.removeAllRanges();
    sel.addRange(r);
    document.execCommand("delete");
    const k = m[1];
    if (k[0] === "#")
      document.execCommand("formatBlock", false, "<h" + k.length + ">");
    else if (k === "1.") document.execCommand("insertOrderedList");
    else document.execCommand("insertUnorderedList");
  }
  const SLASH = [
    {
      id: "p",
      label: "Tekst",
      key: "",
      ic: IC.text,
      kw: "tekst text paragraf",
    },
    {
      id: "h1",
      label: "Naslov 1",
      key: "#",
      ic: "H1",
      kw: "naslov heading h1 headline",
    },
    {
      id: "h2",
      label: "Naslov 2",
      key: "##",
      ic: "H2",
      kw: "naslov heading h2 headline",
    },
    {
      id: "h3",
      label: "Naslov 3",
      key: "###",
      ic: "H3",
      kw: "naslov heading h3 headline",
    },
    { id: "ul", label: "Lista", key: "-", ic: IC.ul, kw: "lista bullet list" },
    {
      id: "ol",
      label: "Numerisana lista",
      key: "1.",
      ic: IC.ol,
      kw: "numerisana lista numbered",
    },
    {
      id: "hr",
      label: "Razdelnik",
      key: "",
      ic: IC.hr,
      kw: "razdelnik divider linija",
    },
    { id: "img", label: "Slika", key: "", ic: IC.img, kw: "slika image foto" },
    {
      id: "file",
      label: "Fajl",
      key: "",
      ic: IC.file,
      kw: "fajl file dokument pdf",
    },
    {
      id: "table",
      label: "Tabela",
      key: "Tab",
      ic: SV(
        '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 4v16M15 4v16"/>',
      ),
      kw: "tabela table grid",
    },
  ];
  const slashEl = $("#slash");
  let slashOpen = false,
    slashStart = null,
    slashItems = [],
    slashIdx = 0,
    savedRange = null;
  function caretRect() {
    const s = getSelection();
    if (!s.rangeCount) return null;
    const r = s.getRangeAt(0).cloneRange();
    r.collapse(true);
    let rect = r.getClientRects()[0];
    if (!rect) {
      const b = blockOf(s.anchorNode);
      rect = b && b.getBoundingClientRect ? b.getBoundingClientRect() : null;
    }
    return rect;
  }
  function openSlash() {
    const s = getSelection();
    if (!s.rangeCount) return;
    const r = s.getRangeAt(0);
    if (r.startContainer.nodeType !== 3 || r.startOffset < 1) return;
    slashStart = { node: r.startContainer, offset: r.startOffset - 1 };
    slashOpen = true;
    slashIdx = 0;
    updateSlash();
  }
  function slashQuery() {
    const s = getSelection();
    if (!s.rangeCount || !slashStart) return null;
    const r = s.getRangeAt(0);
    if (
      r.startContainer !== slashStart.node ||
      r.startOffset <= slashStart.offset
    )
      return null;
    const t = slashStart.node.textContent.slice(
      slashStart.offset,
      r.startOffset,
    );
    if (t[0] !== "/") return null;
    return t.slice(1);
  }
  function updateSlash() {
    const q = slashQuery();
    if (q === null || q.length > 20 || /\s{2}/.test(q)) {
      closeSlash();
      return;
    }
    const ql = q.toLowerCase().trim();
    slashItems = SLASH.filter(
      (i) => !ql || i.label.toLowerCase().includes(ql) || i.kw.includes(ql),
    );
    slashIdx = Math.min(slashIdx, Math.max(0, slashItems.length - 1));
    slashEl.innerHTML = slashItems.length
      ? slashItems
          .map(
            (it, i) =>
              `<button type="button" class="${i === slashIdx ? "on" : ""}" data-si="${i}"><span class="si">${it.ic}</span><span class="sl">${it.label}</span><span class="sk">${it.key}</span></button>`,
          )
          .join("")
      : '<div class="none">Nema rezultata</div>';
    const rect = caretRect();
    slashEl.hidden = false;
    if (rect) {
      const w = Math.min(300, innerWidth - 24);
      const x = Math.min(rect.left, innerWidth - w - 12);
      const below = innerHeight - rect.bottom - 20,
        above = rect.top - 20;
      slashEl.style.left = Math.max(12, x) + "px";
      if (below >= 220 || below >= above) {
        slashEl.style.maxHeight = Math.min(380, below) + "px";
        slashEl.style.top = rect.bottom + 8 + "px";
      } else {
        slashEl.style.maxHeight = Math.min(380, above) + "px";
        slashEl.style.top =
          Math.max(
            12,
            rect.top - 8 - Math.min(slashEl.scrollHeight, 380, above),
          ) + "px";
      }
    }
  }
  function moveSlash(d) {
    if (!slashItems.length) return;
    slashIdx = (slashIdx + d + slashItems.length) % slashItems.length;
    updateSlash();
    const on = slashEl.querySelector(".on");
    on && on.scrollIntoView({ block: "nearest" });
  }
  function closeSlash() {
    slashOpen = false;
    slashStart = null;
    slashEl.hidden = true;
  }
  slashEl.addEventListener("pointerdown", (e) => e.preventDefault());
  slashEl.addEventListener("click", (e) => {
    const b = e.target.closest("[data-si]");
    if (b) runSlash(slashItems[+b.dataset.si]);
  });
  function runSlash(it) {
    const s = getSelection();
    if (slashStart && s.rangeCount) {
      const r = document.createRange();
      const cur = s.getRangeAt(0);
      r.setStart(slashStart.node, slashStart.offset);
      r.setEnd(cur.startContainer, cur.startOffset);
      s.removeAllRanges();
      s.addRange(r);
      document.execCommand("delete");
    }
    closeSlash();
    editor.focus();
    if (it.id === "p") document.execCommand("formatBlock", false, "<p>");
    else if (/^h[123]$/.test(it.id))
      document.execCommand("formatBlock", false, "<" + it.id + ">");
    else if (it.id === "ul") document.execCommand("insertUnorderedList");
    else if (it.id === "ol") document.execCommand("insertOrderedList");
    else if (it.id === "hr")
      document.execCommand("insertHTML", false, "<hr><p><br></p>");
    else if (it.id === "table") {
      const row = (n) =>
        "<tr>" +
        Array.from({ length: 3 }, () => `<${n}><br></${n}>`).join("") +
        "</tr>";
      document.execCommand(
        "insertHTML",
        false,
        `<table><thead>${row("th")}</thead><tbody>${row("td")}${row("td")}</tbody></table><p><br></p>`,
      );
      const tb = [...editor.querySelectorAll("table")].pop();
      if (tb) {
        const c = tb.querySelector("th");
        placeIn(c);
      }
    } else if (it.id === "img" || it.id === "file") {
      const sel = getSelection();
      savedRange = sel.rangeCount ? sel.getRangeAt(0).cloneRange() : null;
      const inp = it.id === "img" ? $("#fileImg") : $("#fileAny");
      inp.value = "";
      inp.click();
      return;
    }
    updEmpty();
    afterCmd();
  }
  $("#fileImg").addEventListener("change", (e) => {
    const f = e.target.files[0];
    if (f) insertUpload(f, "img");
  });
  $("#fileAny").addEventListener("change", (e) => {
    const f = e.target.files[0];
    if (f) insertUpload(f, f.type.startsWith("image/") ? "img" : "file");
  });
  function restoreRange() {
    editor.focus();
    if (savedRange) {
      const s = getSelection();
      s.removeAllRanges();
      s.addRange(savedRange);
      savedRange = null;
    }
  }
  async function insertUpload(file, kind) {
    const scriptId = edId;
    const tmpId = "up" + Date.now();
    restoreRange();
    const label =
      kind === "img" ? "Otpremam sliku…" : "Otpremam " + file.name + "…";
    document.execCommand(
      "insertHTML",
      false,
      `<p id="${tmpId}" class="uploading">${esc(label)}</p>`,
    );
    let url = null;
    try {
      if (ASSETS) {
        const r = await ASSETS.upload(file);
        url = "/_blob/" + r.id;
      } else if (S.mode === "local") {
        url =
          kind === "img"
            ? await new Promise((res, rej) => {
                const fr = new FileReader();
                fr.onload = () => res(fr.result);
                fr.onerror = rej;
                fr.readAsDataURL(file);
              })
            : URL.createObjectURL(file);
      } else throw { code: "not_granted" };
    } catch (e) {
      const ph = document.getElementById(tmpId);
      ph && ph.remove();
      toast(
        e && e.code === "unsupported_type"
          ? "Ovaj tip fajla ne može da se otpremi."
          : e && e.code === "too_large"
            ? "Fajl je prevelik."
            : e && e.code === "not_granted"
              ? "Nemaš dozvolu za otpremanje."
              : "Otpremanje nije uspelo.",
      );
      return;
    }
    if (edId !== scriptId) return;
    const ph = document.getElementById(tmpId);
    if (!ph) return;
    const p = document.createElement("p");
    if (kind === "img") {
      const img = document.createElement("img");
      img.src = url;
      img.alt = "";
      p.appendChild(img);
    } else {
      const a = document.createElement("a");
      a.className = "file";
      a.href = url;
      a.textContent = file.name;
      a.setAttribute("data-name", file.name);
      a.setAttribute("contenteditable", "false");
      a.target = "_blank";
      p.appendChild(a);
    }
    ph.replaceWith(p);
    if (!p.nextSibling) {
      const np = document.createElement("p");
      np.innerHTML = "<br>";
      p.after(np);
    }
    updEmpty();
    queue("body", sanitize(editor.innerHTML));
  }

  /* ---------------- komentari klijenta (CRM → Creative Inspection) ----------------
   Klijent označi tekst u svojoj skripti i ostavi komentar; ovde ga vidiš u editoru,
   citat je podvučen u tekstu, a "Označi kao rešeno" klijentu u CRM-u pokaže da je gotovo. */
  function openComments(sid) {
    return S.comments.filter((c) => c.scriptId === sid && !c.resolved);
  }
  function ccWord(n) {
    return n % 10 === 1 && n % 100 !== 11 ? "komentar" : "komentara";
  }
  const CC_CHECK = SV('<path d="m5 12.5 4.5 4.5L19 7.5"/>', 2.6);
  const CC_NEW = new Set();
  let ccKnown = null,
    ccSig = "",
    ccShowDone = false,
    CCR = new Map(),
    ccHlTm = 0,
    ccEdTm = 0;
  const HLS =
    window.CSS && CSS.highlights && typeof Highlight === "function"
      ? CSS.highlights
      : null;
  function ccAgo(ts) {
    if (!ts) return "";
    const m = Math.round((Date.now() - ts) / 60000);
    if (m < 1) return "upravo";
    if (m < 60) return `pre ${m} min`;
    const h = Math.round(m / 60);
    if (h < 24) return `pre ${h} h`;
    const d = Math.round(h / 24);
    if (d === 1) return "juče";
    if (d < 7) return `pre ${d} dana`;
    return fmtDay.format(new Date(ts));
  }
  function onComments() {
    const ids = new Set(S.comments.map((c) => c.id));
    if (ccKnown) {
      const add = S.comments.filter(
        (c) => !ccKnown.has(c.id) && c.author === "client" && !c.resolved,
      );
      if (add.length && me) {
        add.forEach((c) => {
          CC_NEW.add(c.id);
          setTimeout(() => CC_NEW.delete(c.id), 8000);
        });
        const c = add[0],
          sc = S.scripts.find((x) => x.id === c.scriptId),
          cl = S.clients.find((x) => x.id === c.clientId);
        toast(
          add.length > 1
            ? `${add.length} nova komentara klijenta`
            : `Novi komentar · ${c.authorName || (cl && cl.name) || "Klijent"}${sc && sc.title ? ` · ${sc.title}` : ""}`,
          () => {
            edReturn = null;
            nav("s-" + c.scriptId);
          },
          "Otvori",
        );
      }
    }
    ccKnown = ids;
  }
  /* CRM ne čita bazu modela (tamo su telefoni), pa skripta nosi i imena modela */
  var mnTm = 0; /* var: refresh() može da se pozove pre ove linije (lokalni režim) */
  function syncModelNames() {
    clearTimeout(mnTm);
    mnTm = setTimeout(async () => {
      if (!S.ready || !me) return;
      for (const sc of S.scripts) {
        const want = (sc.models || [])
            .map((v) => modelRef(v).name)
            .filter(Boolean),
          have = Array.isArray(sc.modelNames) ? sc.modelNames : null;
        if (
          have
            ? want.length === have.length && want.every((x, i) => x === have[i])
            : !want.length
        )
          continue;
        try {
          await api.upd("scripts", sc.id, { modelNames: want });
        } catch (e) {}
      }
    }, 1500);
  }
  function findQuote(root, quote, before, after) {
    const sq = (x) => String(x || "").replace(/\s+/g, ""),
      q = sq(quote);
    if (!q) return null;
    const map = [];
    let hay = "";
    /* samo tekst blokova: brojevi lista i dugmići nisu deo skripte */
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (x) =>
        x.parentElement && x.parentElement.closest(".nb-t")
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT,
    });
    let n;
    while ((n = w.nextNode())) {
      const d = n.data;
      for (let i = 0; i < d.length; i++) {
        if (/\s/.test(d[i])) continue;
        hay += d[i];
        map.push([n, i]);
      }
    }
    const b = sq(before).slice(-24),
      a = sq(after).slice(0, 24);
    let at = -1,
      k;
    if (b && a && (k = hay.indexOf(b + q + a)) >= 0) at = k + b.length;
    if (at < 0 && b && (k = hay.indexOf(b + q)) >= 0) at = k + b.length;
    if (at < 0 && a && (k = hay.indexOf(q + a)) >= 0) at = k;
    if (at < 0) at = hay.indexOf(q);
    if (at < 0) return null;
    const s0 = map[at],
      e0 = map[at + q.length - 1],
      r = document.createRange();
    r.setStart(s0[0], s0[1]);
    r.setEnd(e0[0], e0[1] + 1);
    return r;
  }
  function ccHTML(c, cl) {
    return `<article class="cc${c.resolved ? " res" : ""}${CC_NEW.has(c.id) ? " new" : ""}" data-cc="${esc(c.id)}">
    <div class="cc-top">${logo(cl, "cc-av")}<b>${esc(c.authorName || cl.name || "Klijent")}</b><span class="cc-t">${esc(ccAgo(c.createdAt))}</span></div>
    ${c.quote ? `<button type="button" class="cc-q" data-cc-find="${esc(c.id)}" title="Pronađi u tekstu">${esc(c.quote)}</button>` : ""}
    <p class="cc-x">${esc(c.text)}</p>
    <button type="button" class="cc-ok${c.resolved ? " on" : ""}" data-cc-res="${esc(c.id)}">${CC_CHECK}<span>${c.resolved ? "Rešeno" : "Označi kao rešeno"}</span></button>
  </article>`;
  }
  function renderCcmt() {
    const rail = $("#ccmtRail"),
      box = $("#ccmt"),
      s = curScript();
    const all =
      s && !edRoot.hidden
        ? S.comments
            .filter((c) => c.scriptId === s.id)
            .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
        : [];
    if (!all.length) {
      if (!rail.hidden) {
        rail.hidden = true;
        box.innerHTML = "";
      }
      ccSig = "";
      clearCcHl();
      return;
    }
    const sig = JSON.stringify([
      s.id,
      ccShowDone,
      all.map((c) => [
        c.id,
        !!c.resolved,
        c.text,
        c.quote,
        c.authorName,
        CC_NEW.has(c.id),
      ]),
    ]);
    if (sig !== ccSig) {
      ccSig = sig;
      const open = all.filter((c) => !c.resolved),
        done = all.filter((c) => c.resolved),
        cl = S.clients.find((x) => x.id === s.clientId) || {
          id: s.clientId,
          name: "Klijent",
        };
      rail.hidden = false;
      box.innerHTML = `<div class="cc-h"><span class="cc-ic">${IC.msg}</span><h2>Komentari klijenta</h2>${open.length ? `<span class="cc-n">${open.length}</span>` : ""}</div>
      <div class="cc-list">${open.length ? open.map((c) => ccHTML(c, cl)).join("") : `<div class="cc-zero">${CC_CHECK}Sve je rešeno</div>`}</div>
      ${done.length ? `<button type="button" class="cc-tog" data-cc-tog aria-expanded="${ccShowDone}">${ccShowDone ? "Sakrij rešene" : "Rešeni"} · ${done.length}</button>${ccShowDone ? `<div class="cc-list cc-done">${done.map((c) => ccHTML(c, cl)).join("")}</div>` : ""}` : ""}`;
    }
    paintCcHl();
  }
  /* citati se podvlače u editoru bez diranja teksta (CSS Highlight API) */
  function clearCcHl() {
    if (HLS) {
      HLS.delete("cc-q");
      HLS.delete("cc-on");
    }
    CCR = new Map();
  }
  function paintCcHl() {
    if (HLS) HLS.delete("cc-q");
    CCR = new Map();
    const s = curScript();
    if (!s || edRoot.hidden) return;
    const rs = [];
    openComments(s.id).forEach((c) => {
      if (!c.quote) return;
      const r = findQuote(edRoot, c.quote, c.before, c.after);
      if (r) {
        CCR.set(c.id, r);
        rs.push(r);
      }
    });
    if (HLS && rs.length) HLS.set("cc-q", new Highlight(...rs));
    $$("#ccmt [data-cc-find]").forEach((b) => {
      const lost = !CCR.has(b.dataset.ccFind) && !b.closest(".res");
      b.classList.toggle("lost", lost);
      b.title = lost ? "Tekst je u međuvremenu izmenjen" : "Pronađi u tekstu";
    });
  }
  function ccFind(id) {
    const r = CCR.get(id);
    if (!r) return;
    const el =
      r.startContainer.nodeType === 1
        ? r.startContainer
        : r.startContainer.parentElement;
    el.scrollIntoView({
      block: "center",
      behavior: reduce ? "auto" : "smooth",
    });
    if (HLS) {
      HLS.set("cc-on", new Highlight(r));
      clearTimeout(ccHlTm);
      ccHlTm = setTimeout(() => HLS.delete("cc-on"), 1800);
    } else {
      const sel = getSelection();
      sel.removeAllRanges();
      sel.addRange(r.cloneRange());
    }
  }
  function ccPulse(id) {
    const a = $(`#ccmt [data-cc="${CSS.escape(id)}"]`);
    if (!a) return;
    a.scrollIntoView({
      block: "nearest",
      behavior: reduce ? "auto" : "smooth",
    });
    a.classList.remove("flash");
    void a.offsetWidth;
    a.classList.add("flash");
  }
  async function ccResolve(id) {
    const c = S.comments.find((x) => x.id === id);
    if (!c) return;
    const res = !c.resolved,
      patch = res
        ? {
            resolved: true,
            resolvedAt: Date.now(),
            resolvedBy: me ? me.id : null,
          }
        : { resolved: false, resolvedAt: null, resolvedBy: null };
    const old = {
      resolved: !!c.resolved,
      resolvedAt: c.resolvedAt || null,
      resolvedBy: c.resolvedBy || null,
    };
    try {
      await api.upd("comments", id, patch);
      refresh();
      toast(
        res ? "Komentar je rešen" : "Komentar je ponovo otvoren",
        async () => {
          try {
            await api.upd("comments", id, old);
            refresh();
          } catch (e) {
            toast(errMsg(e));
          }
        },
      );
    } catch (e) {
      Object.assign(c, old);
      refresh();
      toast(errMsg(e));
    }
  }
  $("#ccmt").addEventListener("click", (e) => {
    const f = e.target.closest("[data-cc-find]");
    if (f) {
      ccFind(f.dataset.ccFind);
      return;
    }
    const r = e.target.closest("[data-cc-res]");
    if (r) {
      ccResolve(r.dataset.ccRes);
      return;
    }
    if (e.target.closest("[data-cc-tog]")) {
      ccShowDone = !ccShowDone;
      ccSig = "";
      renderCcmt();
    }
  });
  $("#ccmt").addEventListener("pointerover", (e) => {
    if (!HLS) return;
    const a = e.target.closest("[data-cc]"),
      r = a && CCR.get(a.dataset.cc);
    if (r) {
      clearTimeout(ccHlTm);
      HLS.set("cc-on", new Highlight(r));
    } else if (!a) HLS.delete("cc-on");
  });
  $("#ccmt").addEventListener("pointerleave", () => {
    if (HLS) HLS.delete("cc-on");
  });
  edRoot.addEventListener("click", () => {
    if (!CCR.size) return;
    const sel = getSelection();
    if (!sel.rangeCount || !sel.isCollapsed) return;
    const p = sel.getRangeAt(0);
    for (const [id, r] of CCR) {
      try {
        if (r.isPointInRange(p.startContainer, p.startOffset)) {
          ccPulse(id);
          break;
        }
      } catch (e) {}
    }
  });
  edRoot.addEventListener("input", () => {
    if (!CCR.size) return;
    clearTimeout(ccEdTm);
    ccEdTm = setTimeout(paintCcHl, 350);
  });

  /* delete script */
  $("#delScript").onclick = () =>
    openSheet(edCol === "cpages" ? "delpage" : "delete");
  $("#delScriptTop").onclick = () =>
    openSheet(edCol === "cpages" ? "delpage" : "delete");
  async function deleteScript(s) {
    /* tekst koji blok editor još nije sačuvao ide u kopiju za "Poništi" */
    if (edId === s.id && NT) await NT.flush();
    const { id, ...data } = s;
    const copy = JSON.parse(JSON.stringify(data));
    const cms = S.comments
      .filter((c) => c.scriptId === id)
      .map((c) => JSON.parse(JSON.stringify(c)));
    if (edId === id) {
      clearTimeout(saveTimer);
      dirty = {};
    }
    try {
      await api.del("scripts", id);
      for (const c of cms) {
        try {
          await api.del("comments", c.id);
        } catch (e) {}
      }
      if (!DB) {
        S.scripts = S.scripts.filter((x) => x.id !== id);
        S.comments = S.comments.filter((c) => c.scriptId !== id);
      }
      refresh();
      toast(`Obrisano: ${s.title || "Bez naziva"}`, async () => {
        try {
          await api.set("scripts", id, copy);
          for (const c of cms) {
            const { id: cid, ...cd } = c;
            try {
              await api.set("comments", cid, cd);
            } catch (e) {}
          }
          markFresh(id);
          refresh();
        } catch (e) {
          toast(errMsg(e));
        }
      });
    } catch (e) {
      toast(errMsg(e));
      refresh();
    }
  }

  /* ---------------- sheet ---------------- */
  let sheetMode = null,
    sheetClient = null,
    pickColor = COLORS[0];
  const sw = $("#swatches");
  COLORS.forEach((c) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "sw";
    b.style.setProperty("--c", c);
    b.setAttribute("aria-label", "Boja");
    b.onclick = () => {
      pickColor = c;
      sw.querySelectorAll(".sw").forEach((x) =>
        x.setAttribute("aria-pressed", String(x === b)),
      );
    };
    sw.appendChild(b);
  });
  /* logo klijenta: pregled u sheet-u, otprema se tek na "Dodaj"/"Sačuvaj"; csCur = trenutni logo pri izmeni */
  let csLogo = null,
    csCur = null;
  function setLgUp() {
    const u = $("#lgup");
    u.querySelector("img")?.remove();
    if (csLogo || csCur) {
      const i = document.createElement("img");
      i.src = csLogo || csCur;
      i.alt = "";
      u.insertBefore(i, u.firstChild);
      $("#lgupT").hidden = true;
    } else $("#lgupT").hidden = false;
  }
  $("#clogo").addEventListener("change", async (e) => {
    const f = e.target.files[0];
    e.target.value = "";
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      toast("Izaberi sliku.");
      return;
    }
    try {
      csLogo = await fileToLogo(f);
      setLgUp();
    } catch (err) {
      toast("Ova slika ne može da se učita.");
    }
  });
  /* data URL -> "/_blob/<id>" (lokalni režim čuva data URL); null ako otpremanje ne uspe */
  async function uploadLogo(dataUrl) {
    if (ASSETS) {
      try {
        const r = await ASSETS.upload(await (await fetch(dataUrl)).blob());
        return "/_blob/" + r.id;
      } catch (err) {
        return null;
      }
    }
    return S.mode === "local" ? dataUrl : null;
  }
  function clientFootprint(cid) {
    const items = S.items.filter((i) => i.clientId === cid);
    const ids = new Set(items.map((i) => i.id));
    return {
      items,
      scripts: S.scripts.filter(
        (x) => x.clientId === cid || ids.has(x.monthId),
      ),
      reports: S.reports.filter(
        (x) => x.clientId === cid || ids.has(x.monthId),
      ),
      finances: S.finances.filter(
        (x) => x.clientId === cid || ids.has(x.monthId),
      ),
      tasks: S.tasks.filter((t) => taskClient(t).id === cid),
      cpages: S.cpages.filter((x) => x.clientId === cid),
      angles: S.angles.filter((x) => x.clientId === cid),
      entities: S.entities.filter((x) => x.clientId === cid),
      comments: S.comments.filter((x) => x.clientId === cid),
      creatives: S.creatives.filter(
        (x) => x.clientId === cid || ids.has(x.monthId),
      ),
      creativeComments: S.creativeComments.filter(
        (x) => x.clientId === cid || ids.has(x.monthId),
      ),
      creativeNotes: S.creativeNotes.filter(
        (x) => x.clientId === cid || ids.has(x.monthId),
      ),
      schedules: S.schedules.filter((x) => x.clientId === cid),
    };
  }
  function openSheet(mode, client) {
    sheetMode = mode;
    sheetClient = client || null;
    const pw = mode === "delclient";
    csLogo = null;
    csCur = mode === "logo" ? (logoOf(client) || {}).src || null : null;
    setLgUp();
    $("#lgup").hidden = mode !== "client" && mode !== "logo";
    $("#sheetText").style.color = "";
    $("#sheetOk").disabled = false;
    $("#sheetList").hidden = !pw;
    $("#sheetInput").type = pw ? "password" : "text";
    $("#sheetInput").autocomplete = pw ? "current-password" : "off";
    if (mode === "logo") {
      $("#sheetTitle").textContent = `Logo za ${client.name}`;
      $("#sheetText").hidden = false;
      $("#sheetText").textContent = csCur
        ? "Dodirni logo da izabereš novu sliku."
        : "Dodirni polje da izabereš sliku.";
      $("#sheetInput").hidden = true;
      sw.hidden = true;
      $("#sheetOk").textContent = "Sačuvaj";
      $("#sheetOk").classList.remove("danger");
      const s = $("#scrim");
      s.hidden = false;
      requestAnimationFrame(() => s.classList.add("open"));
      return;
    }
    if (pw) {
      const f = clientFootprint(client.id);
      $("#sheetTitle").textContent = `Obriši ${client.name}?`;
      $("#sheetText").hidden = false;
      $("#sheetText").textContent =
        "Sve ispod biće trajno obrisano, bez mogućnosti vraćanja. Upiši svoju lozinku da potvrdiš.";
      $("#sheetList").innerHTML = [
        [
          f.items.filter((i) => i.type !== "platform").length,
          "ciklusa i meseci",
        ],
        [f.scripts.length, "skripti"],
        [f.reports.length, "izveštaja"],
        [f.finances.length, "meseci finansija (nestaju i iz ličnih panela)"],
        [f.tasks.length, "taskova"],
        [
          f.cpages.length + (f.angles.length ? 1 : 0),
          "stranica u Client Platformi",
        ],
        [f.comments.length, "komentara klijenta"],
        [f.creatives.length, "kreativa (sa fajlovima)"],
      ]
        .map(([n, l]) => `<li><b>${n}</b> ${l}</li>`)
        .join("");
      $("#sheetInput").hidden = false;
      $("#sheetInput").placeholder = "Tvoja lozinka";
      $("#sheetInput").value = "";
      sw.hidden = true;
      $("#sheetOk").textContent = "Obriši zauvek";
      $("#sheetOk").classList.add("danger");
      const s = $("#scrim");
      s.hidden = false;
      requestAnimationFrame(() => s.classList.add("open"));
      setTimeout(() => $("#sheetInput").focus(), 60);
      return;
    }
    const del =
      mode === "delete" ||
      mode === "delreport" ||
      mode === "delfin" ||
      mode === "delmodel" ||
      mode === "delpage";
    $("#sheetTitle").textContent =
      mode === "client"
        ? "Novi klijent"
        : mode === "project"
          ? "Novi projekat"
          : mode === "delreport"
            ? "Obriši izveštaj?"
            : mode === "delfin"
              ? "Obriši finansije?"
              : mode === "delmodel"
                ? "Obriši model?"
                : mode === "delpage"
                  ? "Obriši stranicu?"
                  : "Obriši skriptu?";
    $("#sheetText").hidden = !del;
    $("#sheetText").textContent =
      mode === "delreport"
        ? "Izveštaj i njegov Loom link biće trajno obrisani."
        : mode === "delfin"
          ? "Iznosi za ovaj mesec nestaće i iz ličnih panela."
          : mode === "delmodel"
            ? "Model nestaje iz baze. U skriptama ostaje samo ime."
            : mode === "delpage"
              ? "Stranica i sav tekst u njoj biće obrisani."
              : "Skripta i sve u njoj biće trajno obrisani.";
    $("#sheetInput").hidden = del;
    $("#sheetInput").placeholder =
      mode === "client" ? "Naziv klijenta" : "Naziv projekta";
    $("#sheetInput").value = "";
    sw.hidden = mode !== "client";
    $("#sheetOk").textContent = del ? "Obriši" : "Dodaj";
    $("#sheetOk").classList.toggle("danger", del);
    pickColor = COLORS[S.clients.length % COLORS.length];
    sw.querySelectorAll(".sw").forEach((x) =>
      x.setAttribute(
        "aria-pressed",
        String(x.style.getPropertyValue("--c") === pickColor),
      ),
    );
    const s = $("#scrim");
    s.hidden = false;
    requestAnimationFrame(() => s.classList.add("open"));
    setTimeout(
      () => (del ? $("#sheetOk").focus() : $("#sheetInput").focus()),
      60,
    );
  }
  function closeSheet() {
    const s = $("#scrim");
    s.classList.remove("open");
    setTimeout(() => (s.hidden = true), reduce ? 0 : 250);
  }
  $("#sheetCancel").onclick = closeSheet;
  $("#scrim").addEventListener("click", (e) => {
    if (e.target.id === "scrim") closeSheet();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (!$("#scrim").hidden) closeSheet();
      if (!$("#rscrim").hidden) closeReportSheet();
      if (!$("#xscrim").hidden) closeExpense();
      if (!$("#tscrim").hidden) closeTaskDetail();
      if (!$("#mscrim").hidden) closeModelSheet();
      closePops();
      closeSwitch();
    }
  });
  $("#sheet").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (sheetMode === "delclient") {
      const c = sheetClient;
      if (!c) return closeSheet();
      if (!(await OS.verify($("#sheetInput").value))) {
        $("#sheetText").textContent = "Pogrešna lozinka. Probaj ponovo.";
        $("#sheetText").style.color = "var(--bad)";
        shake($("#sheet"));
        $("#sheetInput").select();
        return;
      }
      $("#sheetText").style.color = "";
      const btn = $("#sheetOk");
      btn.disabled = true;
      btn.textContent = "Brišem…";
      try {
        const f = clientFootprint(c.id);
        for (const r of f.reports) {
          await api.del("reports", r.id);
          if (DB)
            for (let i = 0; i < (r.chunks || 1); i++) {
              try {
                await DB.doc(`reportChunks/${r.id}_${i}`).delete();
              } catch (e) {}
            }
        }
        for (const x of f.scripts) await api.del("scripts", x.id);
        for (const x of f.finances) await api.del("finances", x.id);
        for (const x of f.tasks) await api.del("tasks", x.id);
        for (const x of f.cpages) await api.del("cpages", x.id);
        for (const x of f.angles) await api.del("angles", x.id);
        for (const x of f.entities) await api.del("entities", x.id);
        for (const x of f.comments) await api.del("comments", x.id);
        for (const x of f.creativeComments)
          await api.del("creativeComments", x.id);
        for (const x of f.creativeNotes) await api.del("creativeNotes", x.id);
        for (const x of f.creatives) {
          await api.del("creatives", x.id);
          fcDropAll(x);
        }
        for (const x of f.schedules) await api.del("schedules", x.id);
        for (const x of f.items) await api.del("items", x.id);
        await api.del("clients", c.id);
        if (ASSETS && (c.logo || "").startsWith("/_blob/"))
          ASSETS.delete(c.logo.slice(7)).catch(() => {});
        if (!DB) {
          const ids = (k) => new Set(f[k].map((x) => x.id));
          for (const k of [
            "reports",
            "scripts",
            "finances",
            "tasks",
            "items",
            "cpages",
            "angles",
            "entities",
            "comments",
            "creatives",
            "creativeComments",
            "creativeNotes",
            "schedules",
          ]) {
            const z = ids(k);
            S[k] = S[k].filter((x) => !z.has(x.id));
          }
          S.clients = S.clients.filter((x) => x.id !== c.id);
        }
        btn.disabled = false;
        closeSheet();
        firstPM = true;
        refresh();
        toast(`${c.name} obrisan`);
      } catch (err) {
        btn.disabled = false;
        btn.textContent = "Obriši zauvek";
        toast(errMsg(err));
        refresh();
      }
      return;
    }
    if (sheetMode === "logo") {
      const c = sheetClient;
      if (!c || !csLogo) return closeSheet();
      const btn = $("#sheetOk");
      btn.disabled = true;
      btn.textContent = "Čuvam…";
      const url = await uploadLogo(csLogo);
      btn.disabled = false;
      btn.textContent = "Sačuvaj";
      if (!url) {
        toast("Logo nije otpremljen. Probaj ponovo.");
        return;
      }
      const old = c.logo;
      try {
        await api.upd("clients", c.id, { logo: url });
        if (ASSETS && (old || "").startsWith("/_blob/"))
          ASSETS.delete(old.slice(7)).catch(() => {});
        closeSheet();
        refresh();
        toast(`Logo za ${c.name} sačuvan`);
      } catch (err) {
        toast(errMsg(err));
      }
      return;
    }
    if (sheetMode === "delpage") {
      closeSheet();
      const p = edDoc();
      if (!p) return;
      const { id, ...data } = p;
      const copy = JSON.parse(JSON.stringify(data));
      clearTimeout(saveTimer);
      dirty = {};
      nav("cp-" + p.clientId);
      try {
        await api.del("cpages", id);
        if (!DB) S.cpages = S.cpages.filter((x) => x.id !== id);
        refresh();
        toast(`Obrisano: ${p.title || "Stranica"}`, async () => {
          try {
            await api.set("cpages", id, copy);
            refresh();
          } catch (err) {
            toast(errMsg(err));
          }
        });
      } catch (err) {
        toast(errMsg(err));
      }
      return;
    }
    if (sheetMode === "delmodel") {
      closeSheet();
      if (pendingDel) await deleteModel(pendingDel);
      pendingDel = null;
      return;
    }
    if (sheetMode === "delfin") {
      closeSheet();
      const f = finOf(view.id);
      if (f) {
        try {
          await api.del("finances", f.id);
          if (!DB) S.finances = S.finances.filter((x) => x.id !== f.id);
          firstFIN = true;
          refresh();
          toast("Finansije obrisane");
        } catch (err) {
          toast(errMsg(err));
        }
      }
      return;
    }
    if (sheetMode === "delreport") {
      closeSheet();
      if (pendingDel) await deleteReport(pendingDel);
      pendingDel = null;
      return;
    }
    if (sheetMode === "delete") {
      closeSheet();
      const s = curScript();
      if (!s) return;
      const back = s.monthId;
      clearTimeout(saveTimer);
      dirty = {};
      nav("cm-" + back);
      await deleteScript(s);
      return;
    }
    const name = $("#sheetInput").value.trim();
    if (!name) {
      shake($("#sheet"));
      return;
    }
    closeSheet();
    if (sheetMode === "client") {
      const order =
        S.clients.reduce((a, c) => Math.max(a, c.order || 0), 0) + 1;
      const data = { name, kind: "client", color: pickColor, order };
      if (csLogo) {
        const url = await uploadLogo(csLogo);
        if (url) data.logo = url;
      }
      const cid = await create(
        "clients",
        data,
        csLogo && !data.logo
          ? `${name} dodat, logo nije otpremljen`
          : `${name} dodat`,
      );
      if (cid) {
        const d = new Date();
        try {
          const p = await api.add("items", {
            clientId: cid,
            type: "platform",
            title: "Client Platform",
            order: 0,
          });
          markFresh(p);
          const m = await api.add("items", {
            clientId: cid,
            type: "month",
            title: MONTHS[d.getMonth()],
            year: d.getFullYear(),
            month: d.getMonth() + 1,
            order: Date.now(),
            createdBy: me ? me.id : null,
          });
          markFresh(m);
          refresh();
        } catch (err) {}
      }
    } else if (sheetClient) {
      create(
        "items",
        {
          clientId: sheetClient.id,
          type: "project",
          title: name,
          order: Date.now(),
          createdBy: me ? me.id : null,
        },
        `${name} dodat`,
      );
    }
  });

  /* ---------------- skeylo symbol grid ---------------- */
  (() => {
    const cv = $("#gridfx");
    if (!cv) return;
    const ctx = cv.getContext("2d");
    const L = {
      W: 419.1,
      H: 640,
      parts: [
        {
          k: 1,
          x: 10.2,
          y: 2.0,
          w: 308,
          h: 374,
          p: "/os-app/img/8c0a183524.png",
          o: "/os-app/img/905ec29b7d.png",
        },
        {
          k: 2,
          x: 149.0,
          y: 72.2,
          w: 268,
          h: 247,
          p: "/os-app/img/c910de79fe.png",
          o: "/os-app/img/0c20cbc11b.png",
        },
        {
          k: 3,
          x: 95.0,
          y: 251.3,
          w: 320,
          h: 386,
          p: "/os-app/img/de4e4e9c05.png",
          o: "/os-app/img/7b8ee6424f.png",
        },
        {
          k: 4,
          x: 2.0,
          y: 312.1,
          w: 272,
          h: 255,
          p: "/os-app/img/9a52193e8d.png",
          o: "/os-app/img/048011b51b.png",
        },
      ],
    };
    let W = 0,
      H = 0,
      dpr = 1,
      small = false,
      ready = 0,
      accA = [225, 128, 44],
      accB = [243, 176, 68],
      accKey = "",
      gap = 64,
      sym = 22,
      cols = 0,
      rows = 0;
    let base = null,
      bright = null,
      glow = null,
      layerDim = null,
      layerLit = null,
      lit = [],
      last = 0,
      sweep = null,
      nextSweep = 2500;
    const raw = {};
    const hex = (c) => {
      const m = c.trim().match(/^#([0-9a-f]{6})$/i);
      if (!m) return null;
      const n = parseInt(m[1], 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    };
    const rgb = (c, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
    function logoCanvas(h, fill, blur) {
      const sc = h / L.H,
        w = Math.ceil(L.W * sc),
        pad = blur ? Math.ceil(blur * 3) : 2;
      const c = document.createElement("canvas");
      c.width = Math.ceil((w + pad * 2) * dpr);
      c.height = Math.ceil((h + pad * 2) * dpr);
      const x = c.getContext("2d");
      x.scale(dpr, dpr);
      const t = document.createElement("canvas");
      t.width = c.width;
      t.height = c.height;
      const tx = t.getContext("2d");
      tx.scale(dpr, dpr);
      L.parts.forEach((p) =>
        tx.drawImage(
          raw[p.k],
          pad + p.x * sc,
          pad + p.y * sc,
          p.w * sc,
          p.h * sc,
        ),
      );
      tx.setTransform(1, 0, 0, 1, 0, 0);
      tx.globalCompositeOperation = "source-in";
      if (fill === "grad") {
        const g = tx.createLinearGradient(0, 0, t.width, t.height);
        g.addColorStop(0, rgb(accB));
        g.addColorStop(1, rgb(accA));
        tx.fillStyle = g;
      } else tx.fillStyle = fill;
      tx.fillRect(0, 0, t.width, t.height);
      if (blur && "filter" in x) x.filter = `blur(${blur}px)`;
      x.setTransform(1, 0, 0, 1, 0, 0);
      x.drawImage(t, 0, 0);
      c.lw = w + pad * 2;
      c.lh = h + pad * 2;
      return c;
    }
    function pos(i, j) {
      const x = i * gap + (j % 2 ? gap / 2 : 0),
        y = j * gap;
      return [x, y];
    }
    function buildLayers() {
      if (ready < 4 || !W) return;
      base = logoCanvas(sym, rgb(accA));
      bright = logoCanvas(sym, "grad");
      glow = logoCanvas(sym, rgb(accB), 6);
      const mk = (src, a) => {
        const c = document.createElement("canvas");
        c.width = W * dpr;
        c.height = H * dpr;
        const x = c.getContext("2d");
        x.globalAlpha = a;
        for (let j = 0; j < rows; j++)
          for (let i = 0; i < cols; i++) {
            const [px, py] = pos(i, j);
            x.drawImage(
              src,
              (px - src.lw / 2) * dpr,
              (py - src.lh / 2) * dpr,
              src.lw * dpr,
              src.lh * dpr,
            );
          }
        return c;
      };
      layerDim = mk(base, 0.075);
      layerLit = mk(bright, 0.42);
      if (reduce) frame(performance.now());
    }
    function readAcc() {
      const cs = getComputedStyle(document.documentElement);
      const a = hex(cs.getPropertyValue("--orange")),
        b = hex(cs.getPropertyValue("--gold"));
      if (a) accA = a;
      if (b) accB = b;
      const k = accA + "|" + accB;
      if (k !== accKey) {
        accKey = k;
        buildLayers();
      }
    }
    L.parts.forEach((p) => {
      const i = new Image();
      i.onload = () => {
        ready++;
        if (ready === 4) {
          readAcc();
          buildLayers();
        }
      };
      i.src = p.p;
      raw[p.k] = i;
    });
    function spawn(t) {
      const n = small ? 1 : 2;
      for (let k = 0; k < n; k++) {
        if (lit.length > (small ? 8 : 18)) break;
        const i = Math.floor(Math.random() * cols),
          j = Math.floor(
            Math.random() * Math.min(rows, Math.ceil((H * 0.8) / gap)),
          );
        lit.push({
          i,
          j,
          t0: t,
          dur: 2400 + Math.random() * 2400,
          a: 0.45 + Math.random() * 0.45,
        });
      }
    }
    function frame(t) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, cv.width, cv.height);
      if (!layerDim) return;
      ctx.drawImage(layerDim, 0, 0);
      // diagonal light sweep across the grid
      if (!reduce && !sweep && t > nextSweep)
        sweep = { t0: t, dur: small ? 3800 : 4600 };
      if (sweep) {
        const p = (t - sweep.t0) / sweep.dur;
        if (p >= 1) {
          sweep = null;
          nextSweep = t + 6000 + Math.random() * 5000;
        } else {
          const diag = (W + H) * dpr,
            c = -H * dpr * 0.4 + p * (diag + H * dpr * 0.8);
          [
            [160, 0.25],
            [90, 0.45],
            [40, 0.7],
          ].forEach(([w, a]) => {
            ctx.save();
            ctx.beginPath();
            const ww = w * dpr;
            ctx.moveTo(c - ww, 0);
            ctx.lineTo(c + ww, 0);
            ctx.lineTo(c + ww - H * dpr, H * dpr);
            ctx.lineTo(c - ww - H * dpr, H * dpr);
            ctx.closePath();
            ctx.clip();
            ctx.globalAlpha = a * 0.55;
            ctx.drawImage(layerLit, 0, 0);
            ctx.restore();
          });
        }
      }
      // individual symbols lighting up
      lit = lit.filter((l) => t - l.t0 < l.dur);
      for (const l of lit) {
        const e = Math.sin(((t - l.t0) / l.dur) * Math.PI);
        const [px, py] = pos(l.i, l.j);
        ctx.globalAlpha = e * l.a * 0.7;
        ctx.drawImage(
          glow,
          (px - glow.lw / 2) * dpr,
          (py - glow.lh / 2) * dpr,
          glow.lw * dpr,
          glow.lh * dpr,
        );
        ctx.globalAlpha = e * l.a;
        ctx.drawImage(
          bright,
          (px - bright.lw / 2) * dpr,
          (py - bright.lh / 2) * dpr,
          bright.lw * dpr,
          bright.lh * dpr,
        );
      }
      ctx.globalAlpha = 1;
    }
    function loop(t) {
      if (!document.hidden) {
        if (t - last > 380) {
          spawn(t);
          last = t;
        }
        frame(t);
      }
      requestAnimationFrame(loop);
    }
    function size() {
      dpr = Math.min(2, devicePixelRatio || 1);
      W = cv.clientWidth;
      H = cv.clientHeight;
      small = W < 700;
      gap = small ? 52 : 66;
      sym = small ? 17 : 21;
      cols = Math.ceil(W / gap) + 2;
      rows = Math.ceil(H / gap) + 2;
      cv.width = W * dpr;
      cv.height = H * dpr;
      lit = [];
      buildLayers();
    }
    addEventListener("resize", size);
    size();
    new MutationObserver(readAcc).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    if (!reduce) requestAnimationFrame(loop);
  })();

  /* ---------------- organisation cockpit + skeylo calendar ---------------- */
  const ECOL = [
    "#ff7eb6",
    "#a98bff",
    "#5b9cf0",
    "#4fbfa8",
    "#f3b04c",
    "#ff8a65",
    "#7fd1ff",
    "#e0679a",
  ];
  const WD = ["Pon", "Uto", "Sre", "Čet", "Pet", "Sub", "Ned"];
  const dstr = (d) =>
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0");
  const pdate = (s) => {
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, m - 1, d);
  };
  const fmtDur = (m) => {
    m = Math.round(m || 0);
    const h = Math.floor(m / 60),
      r = m % 60;
    return h && r ? `${h}h ${r}min` : h ? `${h}h` : `${r}min`;
  };
  const hm = (m) => {
    m = ((m % 1440) + 1440) % 1440;
    return (
      String(Math.floor(m / 60)).padStart(2, "0") +
      ":" +
      String(m % 60).padStart(2, "0")
    );
  };
  const toMin = (s) => {
    const [h, m] = (s || "09:00").split(":").map(Number);
    return (h || 0) * 60 + (m || 0);
  };
  const fmtLong = new Intl.DateTimeFormat("sr-Latn-RS", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const ICK = {
    trash: SV('<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v6M14 11v6"/>'),
    back: SV('<path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>'),
    pin: SV(
      '<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    ),
    clock: SV('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    box: SV(
      '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/>',
    ),
    up: SV('<path d="m18 15-6-6-6 6"/>', 2.4),
    down: SV('<path d="m6 9 6 6 6-6"/>', 2.4),
    minus: SV('<path d="M5 12h14"/>', 2.6),
    plus: SV('<path d="M12 5v14M5 12h14"/>', 2.6),
    x: SV('<path d="M18 6 6 18M6 6l12 12"/>', 2.4),
    coffee: SV(
      '<path d="M17 8h1a4 4 0 0 1 0 8h-1M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z"/><path d="M6 2v2M10 2v2M14 2v2"/>',
    ),
    car: SV(
      '<path d="M5 17h14M5 17a2 2 0 1 1-4 0v-5l2-5h14l2 5v5a2 2 0 1 1-4 0"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>',
    ),
    spark:
      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z"/></svg>',
  };
  function scriptBlocks(s) {
    const t = document.createElement("template");
    t.innerHTML = sanitize((s && s.body) || "");
    const out = [];
    let i = 0;
    const push = (el) => {
      const text = (el.textContent || "").replace(/\s+/g, " ").trim();
      if (!text && !el.querySelector?.("img")) return;
      out.push({ i: i++, html: el.outerHTML, text });
    };
    [...t.content.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const tx = n.textContent.trim();
        if (tx) {
          const p = document.createElement("p");
          p.textContent = tx;
          push(p);
        }
        return;
      }
      if (n.nodeType !== 1) return;
      if (n.tagName === "HR") return;
      if (n.tagName === "UL" || n.tagName === "OL") {
        [...n.children].forEach((li) => {
          const p = document.createElement("p");
          p.innerHTML = "• " + li.innerHTML;
          push(p);
        });
        return;
      }
      push(n);
    });
    return out;
  }
  const entsOf = (sid) =>
    S.entities
      .filter((e) => e.scriptId === sid)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  function entAvs(ids, n = 4) {
    return `<span class="ckavs">${(ids || [])
      .slice(0, n)
      .map((v) => {
        const r = modelRef(v);
        return r.photo
          ? `<img src="${esc(r.photo)}" alt="" title="${esc(r.name)}">`
          : `<i title="${esc(r.name)}">${esc(initials(r.name))}</i>`;
      })
      .join("")}</span>`;
  }
  function entCard(e, delay) {
    const s = S.scripts.find((x) => x.id === e.scriptId);
    return `<div class="ent${S.fresh.has(e.id) ? " new" : ""}" data-ent="${esc(e.id)}" style="--ec:${esc(e.color || ECOL[0])};${delay != null ? `animation-delay:${delay.toFixed(2)}s` : "animation:none"}">
    <button type="button" class="edel" data-edel="${esc(e.id)}" aria-label="Obriši entitet" title="Obriši entitet">${ICK.trash}</button>
    <div class="en">${esc(e.name || "Entitet")}${(e.models || []).length ? entAvs(e.models, 3) : ""}</div>
    <div class="em">${e.location ? `<span class="ec">${ICK.pin}${esc(e.location)}</span>` : ""}<span class="ec">${ICK.clock}${fmtDur(e.duration)}</span>${e.props ? `<span class="ec">${ICK.box}Rekviziti</span>` : ""}</div>
    <div class="src">${esc(s ? s.title || "Bez naziva" : "Skripta obrisana")} · ${(e.blocks || []).length} blokova</div>
  </div>`;
  }

  /* ---- calendar component ---- */
  const calState = {};
  const stOf = (r) => (r && r.start ? toMin(r.start) : null);
  const OCOL = [
    "#f3a14c",
    "#ffbf6b",
    "#e1802c",
    "#f7c98b",
    "#d9622b",
    "#ffd28a",
    "#c8702a",
    "#ff9a3c",
  ];
  function ec(e) {
    const c = (e && e.color) || ECOL[0];
    if (me && me.id === "nina") return c;
    const i = ECOL.indexOf(c);
    return OCOL[i < 0 ? 0 : i];
  }
  const ppl = (ids) =>
    (ids || []).map((i) => (TEAM.find((u) => u.id === i) || { name: i }).name);
  const pplStr = (ids) => {
    const n = ppl(ids);
    return n.length > 1
      ? n.slice(0, -1).join(", ") + " i " + n[n.length - 1]
      : n[0] || "";
  };
  function dayEvents(d) {
    return S.tasks
      .filter((t) => t.kind === "event" && t.start)
      .map((t) => {
        const sd = t.start.slice(0, 10),
          en = t.end && t.end >= t.start ? t.end : "",
          ed = en ? en.slice(0, 10) : sd;
        if (d < sd || d > ed) return null;
        const a = sd === d ? toMin(t.start.slice(11, 16)) : 0;
        let b = en ? (ed === d ? toMin(en.slice(11, 16)) : 1440) : a + 60;
        if (b <= a) b = Math.min(1440, a + 30);
        return { t: "ev", o: 0, s: a, id: t.id, dur: b - a, ref: t };
      })
      .filter(Boolean)
      .sort((x, y) => x.s - y.s);
  }
  function evAvs(ids) {
    return `<span class="evavs">${(ids || [])
      .slice(0, 4)
      .map(
        (i) =>
          `<img src="${IMG[i] || ""}" alt="" title="${esc((TEAM.find((u) => u.id === i) || { name: i }).name)}" style="--tc:${TCOL[i] || "#999"}">`,
      )
      .join("")}</span>`;
  }
  const bySt = (a, b) => {
    const x = a.s,
      y = b.s;
    if (x != null && y != null && x !== y) return x - y;
    if (x == null && y != null) return 1;
    if (y == null && x != null) return -1;
    return a.o - b.o;
  };
  function dayEnts(d) {
    return S.entities
      .filter((e) => e.date === d)
      .map((e) => ({ s: stOf(e), o: e.dayOrder || 0, e }))
      .sort(bySt)
      .map((x) => x.e);
  }
  function dayList(d) {
    return [
      ...S.entities
        .filter((e) => e.date === d)
        .map((e) => ({
          t: "e",
          o: e.dayOrder || 0,
          s: stOf(e),
          id: e.id,
          dur: e.duration || 0,
          ref: e,
        })),
      ...S.dayItems
        .filter((x) => x.date === d)
        .map((x) => ({
          t: x.kind,
          o: x.dayOrder || 0,
          s: stOf(x),
          id: x.id,
          dur: x.duration || 0,
          ref: x,
        })),
    ].sort(bySt);
  }
  function dayAll(d) {
    return [...dayList(d), ...dayEvents(d)].sort(bySt);
  }
  const SHOOTER = "mihajlo";
  const evBlocks = (x) => (x.ref.assignees || []).includes(SHOOTER);
  function evClash(d, a, b) {
    return dayEvents(d).filter(
      (x) => evBlocks(x) && x.s < b && x.s + x.dur > a,
    );
  }
  function evSoft(d, a, b) {
    return dayEvents(d).filter(
      (x) => !evBlocks(x) && x.s < b && x.s + x.dur > a,
    );
  }
  function dayRange(d) {
    const l = dayList(d).filter((x) => x.s != null);
    if (!l.length) return null;
    return [
      Math.min(...l.map((x) => x.s)),
      Math.max(...l.map((x) => x.s + x.dur)),
    ];
  }
  function defStart(d, exId) {
    const l = dayAll(d).filter((x) => x.s != null && x.id !== exId);
    return l.length ? Math.max(...l.map((x) => x.s + x.dur)) : 600;
  }
  function renderCal(el, key) {
    if (!el) return;
    if (!calState[key]) {
      const n = new Date();
      calState[key] = { y: n.getFullYear(), m: n.getMonth() };
    }
    const st = calState[key],
      first = new Date(st.y, st.m, 1),
      startOff = (first.getDay() + 6) % 7,
      today = todayStr();
    const days = [];
    for (let i = 0; i < 42; i++) {
      days.push(new Date(st.y, st.m, 1 - startOff + i));
    }
    const anim = !el.dataset.drawn;
    el.dataset.drawn = 1;
    el.innerHTML = `<div class="calh"><h3>${MONTHS[st.m]} ${st.y}</h3><div class="nav2"><button data-cnav="-1" aria-label="Prethodni mesec">${ICK.up.replace("m18 15-6-6-6 6", "m15 18-6-6 6-6")}</button><button data-cnav="0">Danas</button><button data-cnav="1" aria-label="Sledeći mesec">${ICK.up.replace("m18 15-6-6-6 6", "m9 18 6-6-6-6")}</button></div></div>
  <div class="calgrid">${WD.map((w) => `<div class="calwd">${w}</div>`).join("")}${days
    .map((d, i) => {
      const ds = dstr(d),
        ents = dayEnts(ds),
        list = dayList(ds),
        tot = list.reduce((a, x) => a + x.dur, 0),
        evs = dayEvents(ds);
      const chipItems = [
        ...evs.map((x) => ({
          s: x.s,
          o: 0,
          h: `<span class="cchip ev" data-evt="${esc(x.id)}" title="${esc(x.ref.title || "Event")} · ${esc(pplStr(x.ref.assignees))}"><b>${hm(x.s)}</b><span class="cn">${esc(x.ref.title || "Event")}</span></span>`,
        })),
        ...ents.map((e) => ({
          s: stOf(e),
          o: e.dayOrder || 0,
          h: `<span class="cchip" data-ent="${esc(e.id)}" style="--ec:${esc(ec(e))}">${e.start ? `<b>${esc(e.start)}</b>` : ""}<span class="cn">${esc(e.name || "Entitet")}</span></span>`,
        })),
      ].sort(bySt);
      const mods = [...new Set(ents.flatMap((e) => e.models || []))];
      return `<div class="cday${d.getMonth() !== st.m ? " out" : ""}${ds === today ? " today" : ""}${ents.length ? " has" : ""}${evs.length ? " hasev" : ""}" data-day="${ds}" role="button" tabindex="0" style="${anim ? `animation-delay:${(i * 0.008).toFixed(3)}s` : "animation:none"}">
      <div class="dn"><span>${d.getDate()}</span>${tot ? `<em>${fmtDur(tot)}</em>` : ""}</div>
      <div class="chips" style="display:grid;gap:4px">${chipItems
        .slice(0, 3)
        .map((x) => x.h)
        .join(
          "",
        )}${chipItems.length > 3 ? `<span class="cmore">+${chipItems.length - 3}</span>` : ""}</div>
      ${
        mods.length
          ? `<div class="cavs">${mods
              .slice(0, 4)
              .map((v) => {
                const r = modelRef(v);
                return r.photo ? `<img src="${esc(r.photo)}" alt="">` : "";
              })
              .join("")}</div>`
          : ""
      }
    </div>`;
    })
    .join("")}</div>`;
  }
  document.addEventListener("click", (e) => {
    const n = e.target.closest("[data-cnav]");
    if (n) {
      const el = n.closest(".ckcal");
      const key = el.id;
      const st = calState[key];
      const v = +n.dataset.cnav;
      if (v === 0) {
        const d = new Date();
        st.y = d.getFullYear();
        st.m = d.getMonth();
      } else {
        st.m += v;
        if (st.m < 0) {
          st.m = 11;
          st.y--;
        }
        if (st.m > 11) {
          st.m = 0;
          st.y++;
        }
      }
      renderCal(el, key);
      return;
    }
    if (edragJust) return;
    const c = e.target.closest(".ckcal [data-day]");
    if (c && !e.target.closest("[data-cnav]")) {
      openDay(c.dataset.day);
      return;
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const c = e.target.closest && e.target.closest(".ckcal [data-day]");
      if (c) openDay(c.dataset.day);
    }
  });

  /* ---- cockpit page ---- */
  var firstCK = true;
  function renderCK() {
    if ($("#cockpit").hidden) return;
    applyTheme("nina");
    const anim = firstCK;
    firstCK = false;
    const sched = S.scripts
      .filter((s) => (s.status || "write") === "schedule")
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    const unsched = S.entities
      .filter((e) => !e.date)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    const now = new Date(),
      wk0 = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - ((now.getDay() + 6) % 7),
      ),
      wk1 = new Date(wk0.getFullYear(), wk0.getMonth(), wk0.getDate() + 7);
    const weekDays = new Set(
      S.entities
        .filter((e) => e.date && pdate(e.date) >= wk0 && pdate(e.date) < wk1)
        .map((e) => e.date),
    );
    if (anim) {
      $("#ckHero").innerHTML =
        `<h1><span class="w"><span>Organisation</span></span><br><span class="w"><span style="animation-delay:.1s">Cockpit</span></span></h1>
      ${[
        [4, 18, "0s"],
        [42, 6, "-.8s"],
        [63, 30, "-1.6s"],
        [88, 10, "-.4s"],
        [30, 70, "-2s"],
      ]
        .map(
          ([x, y, d]) =>
            `<span class="ckspark" style="left:${x}%;top:${y}%;animation-delay:${d}">${ICK.spark}</span>`,
        )
        .join("")}
      <div class="ckstats" id="ckStats"></div>`;
    }
    $("#ckStats").innerHTML =
      `<span class="ckstat" style="animation-delay:.3s"><b>${sched.length}</b>${sched.length === 1 ? "skripta za zakazivanje" : "skripti za zakazivanje"}</span><span class="ckstat" style="animation-delay:.38s"><b>${unsched.length}</b>entiteta čeka datum</span><span class="ckstat" style="animation-delay:.46s"><b>${weekDays.size}</b>${weekDays.size === 1 ? "snimajući dan" : "snimajućih dana"} ove nedelje</span>`;
    $("#ckCntS").textContent = sched.length;
    $("#ckCntE").textContent = unsched.length;
    const sc = $("#ckScripts");
    const sl = sc.scrollLeft;
    sc.innerHTML = sched.length
      ? sched
          .map((s, i) => {
            const c = S.clients.find((x) => x.id === s.clientId) || {
              id: "",
              name: "",
              color: "#ff7eb6",
            };
            const it = S.items.find((x) => x.id === s.monthId);
            const bl = scriptBlocks(s),
              ents = entsOf(s.id),
              used = new Set(ents.flatMap((e) => e.blocks || []));
            const pct = bl.length
              ? Math.round((used.size / bl.length) * 100)
              : 0;
            return `<div class="cks" role="button" tabindex="0" data-go="build-${esc(s.id)}" style="${anim ? `animation-delay:${(0.15 + i * 0.07).toFixed(2)}s` : "animation:none"}">
      <div class="top3">${logo(c, "lg-ic")}<span>${esc(c.name)}${it ? " · " + esc(it.title) : ""}</span></div>
      <h3>${esc(s.title || "Bez naziva")}</h3>
      ${(s.models || []).length ? entAvs(s.models, 5) : ""}
      <div class="prog"><span><span>${ents.length} ${ents.length === 1 ? "entitet" : "entiteta"}</span><span>${pct}%</span></span><div class="bar2"><i style="width:${pct}%"></i></div></div>
    </div>`;
          })
          .join("")
      : `<div class="ckempty" style="flex:1">Nema skripti u To Schedule statusu. Kad Filip prebaci skriptu, pojaviće se ovde.</div>`;
    sc.scrollLeft = sl;
    $("#ckTray").innerHTML = unsched.length
      ? unsched
          .map((e, i) => entCard(e, anim ? 0.25 + i * 0.05 : null))
          .join("")
      : `<div class="ckempty" style="grid-column:1/-1">Svi entiteti su zakazani ✨ Otvori skriptu gore da napraviš nove.</div>`;
    renderCal($("#ckCal"), "ckCal");
  }
  $("#ckScripts").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const t = e.target.closest("[data-go]");
      if (t) nav(t.dataset.go);
    }
  });
  dragScroll($("#ckScripts"));
  function renderCalPage() {
    if ($("#cal").hidden) return;
    applyTheme(me && me.id === "nina" ? "nina" : null);
    renderCal($("#calMain"), "calMain");
  }

  /* ---- builder ---- */
  var buildSel = new Set(),
    buildLast = null,
    firstBuild = true;
  function renderBuild() {
    if ($("#build").hidden) return;
    applyTheme("nina");
    const s = S.scripts.find((x) => x.id === view.id);
    if (!S.ready) {
      $("#bBlocks").innerHTML = '<div class="state">Učitavam skriptu…</div>';
      return;
    }
    if (!s) {
      $("#bHead").innerHTML = "";
      $("#bEnts").innerHTML = "";
      $("#bBlocks").innerHTML =
        '<div class="state"><b>Skripta ne postoji</b><button class="pill" data-go="cockpit">Nazad</button></div>';
      updBar();
      return;
    }
    const anim = firstBuild;
    firstBuild = false;
    const c = S.clients.find((x) => x.id === s.clientId) || { name: "" };
    const it = S.items.find((x) => x.id === s.monthId);
    $("#bHead").innerHTML =
      `<div><h1>${esc(s.title || "Bez naziva")}</h1><div class="sub">${esc(c.name)}${it ? " · " + esc(it.title) : ""}${(s.models || []).length ? " · " + (s.models || []).map((v) => esc(modelRef(v).name)).join(", ") : ""}</div></div>`;
    const ents = entsOf(s.id);
    const owner = {};
    ents.forEach((e) => (e.blocks || []).forEach((b) => (owner[b] = e)));
    $("#bEnts").innerHTML = ents
      .map(
        (e, i) =>
          `<button class="bent" data-ent="${esc(e.id)}" style="--ec:${esc(e.color)};animation-delay:${(i * 0.05).toFixed(2)}s">${esc(e.name)} · ${(e.blocks || []).length}<span class="bx" data-edel="${esc(e.id)}" role="button" aria-label="Obriši ${esc(e.name)}" title="Obriši entitet">${ICK.x}</span></button>`,
      )
      .join("");
    const bl = scriptBlocks(s);
    $("#bBlocks").innerHTML = bl.length
      ? bl
          .map((b, k) => {
            const o = owner[b.i];
            return `<div class="bblk${buildSel.has(b.i) ? " sel" : ""}${o ? " asg" : ""}" data-blk="${b.i}" style="${o ? `--ec:${esc(o.color)};` : ""}${anim ? `animation-delay:${Math.min(0.6, k * 0.025).toFixed(3)}s` : "animation:none"}">${b.html}${o ? `<span class="tag">${esc(o.name)}</span>` : ""}<span class="ck2">${IC.check.replace('class="check"', "")}</span></div>`;
          })
          .join("")
      : '<div class="ckempty">Skripta je prazna. Filip još nije napisao tekst.</div>';
    updBar();
  }
  function updBar() {
    const n = buildSel.size;
    $("#bCount").textContent = n;
    $("#bBar").classList.toggle(
      "show",
      n > 0 && !$("#build").hidden && $("#ewiz").hidden,
    );
  }
  $("#bBlocks").addEventListener("click", (e) => {
    const b = e.target.closest("[data-blk]");
    if (!b) return;
    const i = +b.dataset.blk;
    if (e.shiftKey && buildLast != null) {
      const [a, z] = [Math.min(buildLast, i), Math.max(buildLast, i)];
      for (let k = a; k <= z; k++) buildSel.add(k);
    } else buildSel.has(i) ? buildSel.delete(i) : buildSel.add(i);
    buildLast = i;
    $$("#bBlocks [data-blk]").forEach((el) =>
      el.classList.toggle("sel", buildSel.has(+el.dataset.blk)),
    );
    try {
      navigator.vibrate && navigator.vibrate(6);
    } catch (err) {}
    updBar();
  });
  $("#bClear").onclick = () => {
    buildSel.clear();
    $$("#bBlocks .sel").forEach((el) => el.classList.remove("sel"));
    updBar();
  };
  $("#bNext").onclick = () => openEWiz();
  $("#bEnts").addEventListener("click", (e) => {
    if (e.target.closest("[data-edel]")) return;
    const b = e.target.closest("[data-ent]");
    if (b) openEnt(b.dataset.ent);
  });

  /* ---- entity wizard ---- */
  var EW = null;
  function openEWiz() {
    const s = S.scripts.find((x) => x.id === view.id);
    if (!s || !buildSel.size) return;
    const bl = scriptBlocks(s);
    const sel = [...buildSel].sort((a, b) => a - b);
    EW = {
      s,
      step: 0,
      blocks: sel,
      texts: sel.map((i) => (bl.find((b) => b.i === i) || {}).text || ""),
      models: new Set(
        (s.models || []).filter((v) => S.models.find((m) => m.id === v)),
      ),
      props: "",
      location: s.location || "",
      duration: 60,
    };
    EW.steps = ["models", "props", "loc", "dur"];
    $("#edots").innerHTML = EW.steps.map(() => "<i></i>").join("");
    const el = $("#ewiz");
    el.hidden = false;
    requestAnimationFrame(() => el.classList.add("open"));
    document.body.style.overflow = "hidden";
    updBar();
    drawE(false);
  }
  function closeEWiz() {
    const el = $("#ewiz");
    el.classList.remove("open");
    document.body.style.overflow = "";
    setTimeout(
      () => {
        el.hidden = true;
        $("#estage").innerHTML = "";
        EW = null;
        updBar();
      },
      reduce ? 0 : 300,
    );
  }
  const prevHTML = () =>
    `<div class="eprev">${EW.texts.map((t) => `<p>${esc(t)}</p>`).join("")}</div>`;
  function eStepHTML(k) {
    if (k === "models") {
      const ms = modelsSorted();
      return `<h2 class="wq">Koji modeli su ti potrebni <span class="nmg">za ovaj entitet?</span></h2>
    <div class="mgrid2" style="max-width:720px">${ms.map((m, i) => `<button type="button" class="mopt" data-em="${esc(m.id)}" aria-pressed="${EW.models.has(m.id)}" style="animation-delay:${(0.05 + i * 0.03).toFixed(2)}s"><span class="wp">${m.photo ? `<img src="${esc(m.photo)}" alt="">` : `<span class="ini2">${esc(initials(m.name))}</span>`}<span class="ok">${IC.check.replace('class="check"', "")}</span></span><span class="nm">${esc(m.name)}</span></button>`).join("")}</div>
    <div class="whint" id="ehint">${EW.models.size ? `Izabrano: ${EW.models.size}` : "Može i bez modela (npr. pokrivalice)"}</div>`;
    }
    if (k === "props")
      return `<h2 class="wq">Koji rekviziti su ti potrebni <span class="nmg">za ovaj entitet?</span></h2>${prevHTML()}<textarea class="ewta" id="eprops" placeholder="npr. biljka za kadar 3, telefon na stativu, beli peškir…">${esc(EW.props)}</textarea>`;
    if (k === "loc") {
      const locs = [
        ...new Set(
          [EW.s.location, ...S.entities.map((e) => e.location)].filter(Boolean),
        ),
      ].slice(0, 10);
      return `<h2 class="wq">Na kojoj lokaciji se snima <span class="nmg">ovaj entitet?</span></h2>${prevHTML()}<textarea class="wjob" id="eloc" rows="1" maxlength="120" placeholder="Lokacija…" style="min-height:0">${esc(EW.location)}</textarea>${locs.length ? `<div class="locs">${locs.map((l) => `<button type="button" data-loc="${esc(l)}">${esc(l)}</button>`).join("")}</div>` : ""}`;
    }
    return `<h2 class="wq">Koliko će trajati snimanje <span class="nmg">ovog entiteta?</span></h2>
    <div class="dur"><div class="big" id="edurBig"></div><input class="durng" id="edur" type="range" min="5" max="240" step="5" value="${EW.duration}" aria-label="Trajanje"><div class="durchips">${[5, 10, 15, 20, 30, 45, 60, 90, 120].map((m) => `<button type="button" data-dur="${m}">${fmtDur(m)}</button>`).join("")}</div></div>`;
  }
  function syncDur() {
    const v = EW.duration;
    const big = $("#edurBig");
    if (!big) return;
    const h = Math.floor(v / 60),
      m = v % 60;
    big.innerHTML = `${h ? `${h}<small>h</small> ` : ""}${m || !h ? `${m}<small>min</small>` : ""}`;
    const r = $("#edur");
    r.value = v;
    r.style.setProperty(
      "--p",
      (((Math.min(240, v) - 5) / 235) * 100).toFixed(1) + "%",
    );
    $$(".durchips button").forEach((b) =>
      b.classList.toggle("on", +b.dataset.dur === v),
    );
  }
  function drawE(back) {
    const st = $("#estage");
    const old = st.querySelector(".wstep");
    if (old) {
      old.classList.remove("in", "back");
      old.classList.add("out");
      if (back) old.classList.add("back");
      setTimeout(() => old.remove(), 400);
    }
    const k = EW.steps[EW.step];
    const el = document.createElement("div");
    el.className = "wstep in" + (back ? " back" : "");
    el.innerHTML = eStepHTML(k);
    st.appendChild(el);
    $$("#edots i").forEach((d, i) => {
      d.classList.toggle("on", i === EW.step);
      d.classList.toggle("done", i < EW.step);
    });
    $("#eback").style.visibility = EW.step === 0 ? "hidden" : "visible";
    $("#enext").textContent = k === "dur" ? "Napravi entitet" : "Dalje";
    $("#enext").disabled = false;
    if (k === "dur") syncDur();
    if (k === "props")
      setTimeout(() => $("#eprops") && $("#eprops").focus(), 180);
    if (k === "loc") setTimeout(() => $("#eloc") && $("#eloc").focus(), 180);
  }
  $("#estage").addEventListener("click", (e) => {
    if (!EW) return;
    const m = e.target.closest("[data-em]");
    if (m) {
      const id = m.dataset.em;
      EW.models.has(id) ? EW.models.delete(id) : EW.models.add(id);
      m.setAttribute("aria-pressed", EW.models.has(id));
      $("#ehint").textContent = EW.models.size
        ? `Izabrano: ${EW.models.size}`
        : "Može i bez modela (npr. pokrivalice)";
      return;
    }
    const l = e.target.closest("[data-loc]");
    if (l) {
      EW.location = l.dataset.loc;
      $("#eloc").value = EW.location;
      return;
    }
    const d = e.target.closest("[data-dur]");
    if (d) {
      EW.duration = +d.dataset.dur;
      syncDur();
      return;
    }
  });
  $("#estage").addEventListener("input", (e) => {
    if (!EW) return;
    if (e.target.id === "eprops") EW.props = e.target.value;
    if (e.target.id === "eloc") EW.location = e.target.value;
    if (e.target.id === "edur") {
      EW.duration = +e.target.value;
      syncDur();
    }
  });
  $("#estage").addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.id === "eloc") {
      e.preventDefault();
      eNext();
    }
  });
  $("#eback").onclick = () => {
    if (EW && EW.step > 0) {
      EW.step--;
      drawE(true);
    }
  };
  $("#eclose").onclick = () => closeEWiz();
  $("#enext").onclick = () => eNext();
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && EW) closeEWiz();
  });
  async function eNext() {
    if (!EW) return;
    const k = EW.steps[EW.step];
    if (k !== "dur") {
      EW.step++;
      drawE(false);
      return;
    }
    const b = $("#enext");
    b.disabled = true;
    b.textContent = "Čuvam…";
    const n = entsOf(EW.s.id).length;
    const data = {
      scriptId: EW.s.id,
      clientId: EW.s.clientId,
      monthId: EW.s.monthId,
      name: `Entitet ${n + 1}`,
      color: ECOL[S.entities.length % ECOL.length],
      blocks: EW.blocks,
      blockTexts: EW.texts,
      models: [...EW.models],
      props: EW.props.trim(),
      location: EW.location.trim(),
      duration: EW.duration,
      date: "",
      dayOrder: 0,
      order: Date.now(),
      createdAt: Date.now(),
      createdBy: me ? me.id : null,
    };
    try {
      const id = await api.add("entities", data);
      markFresh(id);
      miniBurst(b, "#ff7eb6");
      buildSel.clear();
      closeEWiz();
      refresh();
      toast(`${data.name} napravljen`);
    } catch (err) {
      b.disabled = false;
      b.textContent = "Napravi entitet";
      toast(errMsg(err));
    }
  }

  /* ---- entity detail ---- */
  let entEditing = null;
  function openEnt(id) {
    const e = S.entities.find((x) => x.id === id);
    if (!e) return;
    entEditing = { ...e, models: new Set(e.models || []) };
    const s = S.scripts.find((x) => x.id === e.scriptId);
    $("#esheet").innerHTML =
      `<h3 style="display:flex;align-items:center;gap:10px"><span style="width:14px;height:14px;border-radius:50%;background:${esc(e.color)};box-shadow:0 0 12px ${esc(e.color)}"></span>Entitet</h3>
    <div class="lbl">Naziv</div><input id="enName" type="text" maxlength="60" value="${esc(e.name || "")}">
    <div class="lbl">Blokovi iz skripte${s ? " · " + esc(s.title || "") : ""}</div><div class="eprev" style="width:100%;max-height:160px">${(e.blockTexts || []).map((t) => `<p>${esc(t)}</p>`).join("") || "<p>Nema teksta</p>"}</div>
    <div class="lbl">Modeli</div><div class="mgrid2" style="grid-template-columns:repeat(auto-fill,minmax(78px,1fr));max-height:220px;padding:4px">${modelsSorted()
      .map(
        (m) =>
          `<button type="button" class="mopt" data-enm="${esc(m.id)}" aria-pressed="${entEditing.models.has(m.id)}" style="animation:none"><span class="wp" style="width:56px;height:56px">${m.photo ? `<img src="${esc(m.photo)}" alt="">` : `<span class="ini2">${esc(initials(m.name))}</span>`}<span class="ok">${IC.check.replace('class="check"', "")}</span></span><span class="nm" style="font-size:13px">${esc(m.name)}</span></button>`,
      )
      .join("")}</div>
    <div class="lbl">Rekviziti</div><textarea id="enProps" class="ewta" style="width:100%;min-height:80px">${esc(e.props || "")}</textarea>
    <div class="lbl">Lokacija</div><input id="enLoc" type="text" maxlength="120" value="${esc(e.location || "")}">
    <div class="lbl">Trajanje: <b id="enDurL">${fmtDur(e.duration)}</b></div><input class="durng" id="enDur" type="range" min="5" max="240" step="5" value="${e.duration || 60}">
    <div class="row2" style="gap:10px;margin-top:6px"><label style="flex:1.4;display:grid;gap:6px"><span class="lbl" style="margin:0">Datum snimanja</span><input id="enDate" type="date" value="${esc(e.date || "")}" style="color-scheme:dark"></label><label style="flex:1;display:grid;gap:6px"><span class="lbl" style="margin:0">Početak</span><input id="enTime" type="time" step="300" value="${esc(e.start || "")}" style="color-scheme:dark"></label></div>
    <div class="row2" style="justify-content:space-between;flex-wrap:wrap"><button type="button" class="pill danger" id="enDel">${ICK.trash}Obriši entitet</button><span style="display:flex;gap:10px;flex-wrap:wrap">${s ? `<button type="button" class="pill" id="enOpen">Otvori skriptu</button>` : ""}<button type="submit" class="pill solid">Sačuvaj</button></span></div>`;
    const r = $("#enDur");
    r.style.setProperty(
      "--p",
      (((Math.min(240, e.duration || 60) - 5) / 235) * 100).toFixed(1) + "%",
    );
    const sc = $("#escrim");
    sc.hidden = false;
    requestAnimationFrame(() => sc.classList.add("open"));
  }
  function delEnt(id) {
    const e2 = S.entities.find((x) => x.id === id);
    if (!e2) return;
    const { id: _i, ...data } = e2;
    const card = document.querySelector(
      `#ckTray .ent[data-ent="${CSS.escape(id)}"]`,
    );
    if (card && !reduce) {
      card.classList.add("dying");
    }
    setTimeout(
      () => {
        api
          .del("entities", id)
          .then(() => {
            if (!DB) S.entities = S.entities.filter((x) => x.id !== id);
            refresh();
            toast(`Obrisan: ${e2.name}`, async () => {
              try {
                await api.set("entities", id, data);
                refresh();
              } catch (err) {
                toast(errMsg(err));
              }
            });
          })
          .catch((err) => {
            card && card.classList.remove("dying");
            toast(errMsg(err));
          });
      },
      card && !reduce ? 320 : 0,
    );
  }
  document.addEventListener(
    "click",
    (e) => {
      const b = e.target.closest("[data-edel]");
      if (!b) return;
      e.preventDefault();
      e.stopPropagation();
      edragJust = true;
      setTimeout(() => (edragJust = false), 80);
      delEnt(b.dataset.edel);
    },
    true,
  );
  function closeEnt() {
    const s = $("#escrim");
    s.classList.remove("open");
    setTimeout(() => (s.hidden = true), reduce ? 0 : 250);
    entEditing = null;
  }
  $("#escrim").addEventListener("click", (e) => {
    if (e.target.id === "escrim") {
      closeEnt();
      return;
    }
    const m = e.target.closest("[data-enm]");
    if (m && entEditing) {
      const id = m.dataset.enm;
      entEditing.models.has(id)
        ? entEditing.models.delete(id)
        : entEditing.models.add(id);
      m.setAttribute("aria-pressed", entEditing.models.has(id));
      return;
    }
    if (e.target.closest("#enOpen") && entEditing) {
      const sid = entEditing.scriptId;
      closeEnt();
      nav("build-" + sid);
      return;
    }
    if (e.target.closest("#enDel") && entEditing) {
      const id = entEditing.id;
      closeEnt();
      delEnt(id);
      return;
    }
  });
  $("#escrim").addEventListener("input", (e) => {
    if (e.target.id === "enDur") {
      const v = +e.target.value;
      $("#enDurL").textContent = fmtDur(v);
      e.target.style.setProperty(
        "--p",
        (((v - 5) / 235) * 100).toFixed(1) + "%",
      );
    }
  });
  $("#esheet").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!entEditing) return;
    const id = entEditing.id,
      old = S.entities.find((x) => x.id === id);
    const date = $("#enDate").value || "";
    const patch = {
      name: $("#enName").value.trim() || "Entitet",
      models: [...entEditing.models],
      props: $("#enProps").value.trim(),
      location: $("#enLoc").value.trim(),
      duration: +$("#enDur").value,
      date,
      start: date ? $("#enTime").value || "" : "",
    };
    if (old && date && date !== old.date)
      patch.dayOrder = maxDayOrder(date) + 1000;
    if (date && patch.start) {
      const a = toMin(patch.start),
        c = evClash(date, a, a + patch.duration);
      if (c.length) {
        toast(
          `Mihajlo je zauzet: ${c[0].ref.title || "Event"} ${hm(c[0].s)}–${hm(c[0].s + c[0].dur)}`,
        );
        return;
      }
    }
    try {
      await api.upd("entities", id, patch);
      closeEnt();
      refresh();
      toast("Entitet sačuvan");
    } catch (err) {
      toast(errMsg(err));
    }
  });

  /* ---- time picker: "Kada se snima ovaj entitet?" ---- */
  var TP = null;
  const R5 = (m) => Math.max(0, Math.min(1435, Math.round(m / 5) * 5));
  const itName = (x) =>
    x.t === "e"
      ? x.ref.name
      : x.t === "ev"
        ? x.ref.title || "Event"
        : x.t === "pause"
          ? "Pauza"
          : "Prevoz";
  function ribBlocks(d, exId, R0, R1) {
    return dayAll(d)
      .filter((x) => x.s != null && x.id !== exId)
      .map((x) => {
        const a = Math.max(R0, x.s),
          b = Math.min(R1, x.s + x.dur);
        if (b <= a) return "";
        const col =
          x.t === "e"
            ? ec(x.ref)
            : x.t === "pause"
              ? "#58d08b"
              : x.t === "ev"
                ? "#ff6b5b"
                : "#7fb2ff";
        return `<i class="rbo${x.t === "pause" || x.t === "travel" ? " dash" : ""}${x.t === "ev" ? (evBlocks(x) ? " evb" : " evs") : ""}" style="--ec:${esc(col)};left:${(((a - R0) / (R1 - R0)) * 100).toFixed(2)}%;width:${(((b - a) / (R1 - R0)) * 100).toFixed(2)}%" title="${esc(itName(x))} ${hm(x.s)}–${hm(x.s + x.dur)}${x.t === "ev" ? " · zauzeti: " + esc(pplStr(x.ref.assignees)) : ""}"></i>`;
      })
      .join("");
  }
  function ribTicks(R0, R1) {
    let h = "";
    for (let t = Math.ceil(R0 / 60) * 60; t <= R1; t += 60) {
      const big = t % 180 === 0;
      h += `<span class="rtk${big ? " big" : ""}" style="left:${(((t - R0) / (R1 - R0)) * 100).toFixed(2)}%">${big ? `<em>${String((t / 60) % 24).padStart(2, "0")}</em>` : ""}</span>`;
    }
    return h;
  }
  function openTP(o) {
    TP = { ...o, start: R5(o.start) };
    if (o.ent) TP.color = ec(o.ent);
    o = TP;
    const fx = TP.start < 360 || TP.start + TP.dur > 1440;
    TP.R0 = fx ? 0 : 360;
    TP.R1 = 1440;
    const after = defStart(o.date, o.excludeId);
    const hasAfter = dayAll(o.date).some(
      (x) => x.s != null && x.id !== o.excludeId,
    );
    $("#tpbox").innerHTML = `<div class="tpglow"></div>
    <h2><span class="w"><span>${esc(o.title)}</span></span></h2>
    <div class="tpent" style="--ec:${esc(o.color || ECOL[0])}"><i></i><b>${esc(o.name)}</b><span>${esc(fmtLong.format(pdate(o.date)))}</span><span class="tdur">${ICK.clock}${fmtDur(o.dur)}</span></div>
    <div class="tpclock">
      <div class="tpcol"><button type="button" data-tpa="h" data-v="1" aria-label="Sat više">${ICK.up}</button><div class="tpd" data-wheel="h"><span id="tpH">00</span></div><button type="button" data-tpa="h" data-v="-1" aria-label="Sat manje">${ICK.down}</button></div>
      <span class="tpcolon">:</span>
      <div class="tpcol"><button type="button" data-tpa="m" data-v="5" aria-label="5 minuta više">${ICK.up}</button><div class="tpd" data-wheel="m"><span id="tpM">00</span></div><button type="button" data-tpa="m" data-v="-5" aria-label="5 minuta manje">${ICK.down}</button></div>
    </div>
    <div class="tprange"><span id="tpA">00:00</span><span class="arr"></span><span id="tpB">00:00</span></div>
    <div class="tprib" id="tprib" tabindex="0" role="slider" aria-label="Vreme početka" aria-valuemin="0" aria-valuemax="1435">
      <div class="rtrack">${ribTicks(TP.R0, TP.R1)}${ribBlocks(o.date, o.excludeId, TP.R0, TP.R1)}<i class="rbn" id="tpN" style="--ec:${esc(o.color || ECOL[0])}"><span id="tpNl"></span></i></div>
    </div>
    <div class="tpwarn" id="tpW" hidden></div>
    <div class="tpq">${hasAfter ? `<button type="button" class="tqc hot" data-tpset="${after}">Odmah posle · ${hm(after)}</button>` : ""}${[8, 10, 12, 14, 16, 18, 20].map((h) => `<button type="button" class="tqc" data-tpset="${h * 60}">${String(h).padStart(2, "0")}:00</button>`).join("")}</div>
    <div class="tpbtns"><button type="button" class="pill" id="tpNo">Otkaži</button><button type="button" class="pill solid" id="tpOk">Potvrdi</button></div>`;
    const k = $("#tpk");
    k.hidden = false;
    tpUpd(true);
    requestAnimationFrame(() => k.classList.add("open"));
    setTimeout(() => {
      try {
        $("#tpOk").focus({ preventScroll: true });
      } catch (e) {}
    }, 60);
  }
  function tpUpd(first) {
    if (!TP) return;
    const a = TP.start,
      b = a + TP.dur,
      H = $("#tpH"),
      M = $("#tpM");
    const hs = String(Math.floor(a / 60)).padStart(2, "0"),
      ms = String(a % 60).padStart(2, "0");
    if (H.textContent !== hs) {
      H.textContent = hs;
      if (!first) {
        H.classList.remove("flip");
        void H.offsetWidth;
        H.classList.add("flip");
      }
    }
    if (M.textContent !== ms) {
      M.textContent = ms;
      if (!first) {
        M.classList.remove("flip");
        void M.offsetWidth;
        M.classList.add("flip");
      }
    }
    $("#tpA").textContent = hm(a);
    $("#tpB").textContent = b >= 1440 ? hm(b) + " +1" : hm(b);
    $("#tpOk").textContent = "Potvrdi · " + hm(a);
    const { R0, R1 } = TP,
      n = $("#tpN");
    n.style.left =
      (((Math.max(R0, a) - R0) / (R1 - R0)) * 100).toFixed(2) + "%";
    n.style.width =
      Math.max(
        0.8,
        ((Math.min(R1, b) - Math.max(R0, a)) / (R1 - R0)) * 100,
      ).toFixed(2) + "%";
    $("#tpNl").textContent = hm(a);
    $("#tprib").setAttribute("aria-valuenow", a);
    $("#tprib").setAttribute("aria-valuetext", hm(a));
    const cl = dayList(TP.date).filter(
      (x) => x.s != null && x.id !== TP.excludeId && x.s < b && x.s + x.dur > a,
    );
    const evc = TP.blockEv ? evClash(TP.date, a, b) : [];
    const evs = TP.blockEv ? evSoft(TP.date, a, b) : [];
    const w = $("#tpW"),
      ok = $("#tpOk");
    TP.blocked = evc.length > 0;
    ok.disabled = TP.blocked;
    if (TP.blocked) ok.textContent = "Termin je zauzet";
    if (evc.length) {
      w.hidden = false;
      w.classList.add("busy");
      w.innerHTML = `${ICK.x}<span>Mihajlo je zauzet: ${evc.map((x) => `<b>${esc(x.ref.title || "Event")}</b> ${hm(x.s)}–${hm(x.s + x.dur)}`).join("; ")}</span>`;
      n.classList.add("clash");
    } else if (cl.length) {
      w.hidden = false;
      w.classList.remove("busy");
      w.innerHTML = `${ICK.x}<span>Preklapa se sa: ${cl.map((x) => `<b>${esc(itName(x))}</b> ${hm(x.s)}–${hm(x.s + x.dur)}`).join(", ")}</span>`;
      n.classList.add("clash");
    } else if (evs.length) {
      w.hidden = false;
      w.classList.remove("busy");
      w.classList.add("soft");
      w.innerHTML = `${ICK.clock}<span>U isto vreme: ${evs.map((x) => `<b>${esc(x.ref.title || "Event")}</b> ${hm(x.s)}–${hm(x.s + x.dur)} · ${esc(pplStr(x.ref.assignees))}`).join("; ")}</span>`;
      n.classList.remove("clash");
    } else {
      w.hidden = true;
      n.classList.remove("clash");
    }
    if (!evs.length || evc.length || cl.length) w.classList.remove("soft");
    $$("#tpbox [data-tpset]").forEach((c) =>
      c.classList.toggle("on", +c.dataset.tpset === a),
    );
  }
  function tpSet(m) {
    if (!TP) return;
    TP.start = R5(m);
    tpUpd();
  }
  function closeTP(ok) {
    const t = TP;
    if (!t) return;
    TP = null;
    const k = $("#tpk");
    k.classList.remove("open");
    setTimeout(
      () => {
        if (!TP) k.hidden = true;
      },
      reduce ? 0 : 300,
    );
    if (ok) t.onOk(t.start);
    else t.onCancel && t.onCancel();
  }
  $("#tpk").addEventListener("click", (e) => {
    if (!TP) return;
    if (e.target.id === "tpk" || e.target.closest("#tpNo")) {
      closeTP(false);
      return;
    }
    if (e.target.closest("#tpOk")) {
      if (!TP.blocked) closeTP(true);
      return;
    }
    const a = e.target.closest("[data-tpa]");
    if (a) {
      const v = +a.dataset.v;
      tpSet(TP.start + (a.dataset.tpa === "h" ? v * 60 : v));
      return;
    }
    const q = e.target.closest("[data-tpset]");
    if (q) {
      tpSet(+q.dataset.tpset);
      return;
    }
  });
  $("#tpk").addEventListener(
    "wheel",
    (e) => {
      const w = e.target.closest("[data-wheel]");
      if (!w || !TP) return;
      e.preventDefault();
      const dir = e.deltaY < 0 ? 1 : -1;
      tpSet(TP.start + (w.dataset.wheel === "h" ? dir * 60 : dir * 5));
    },
    { passive: false },
  );
  (function () {
    let on = false;
    const at = (e) => {
      const r = $("#tprib .rtrack").getBoundingClientRect();
      const f = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
      tpSet(TP.R0 + f * (TP.R1 - TP.R0) - TP.dur / 2);
    };
    $("#tpk").addEventListener("pointerdown", (e) => {
      if (!TP || !e.target.closest("#tprib")) return;
      on = true;
      e.preventDefault();
      try {
        e.target.setPointerCapture(e.pointerId);
      } catch (err) {}
      $("#tprib").classList.add("drag");
      at(e);
    });
    $("#tpk").addEventListener("pointermove", (e) => {
      if (on && TP) at(e);
    });
    const up = () => {
      if (!on) return;
      on = false;
      const r = $("#tprib");
      r && r.classList.remove("drag");
    };
    $("#tpk").addEventListener("pointerup", up);
    $("#tpk").addEventListener("pointercancel", up);
  })();
  document.addEventListener(
    "keydown",
    (e) => {
      if (!TP) return;
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        closeTP(false);
      } else if (e.key === "Enter" && !e.target.closest("#tpNo")) {
        e.preventDefault();
        if (!TP.blocked) closeTP(true);
      } else if (["ArrowLeft", "ArrowDown"].includes(e.key)) {
        e.preventDefault();
        tpSet(TP.start - (e.shiftKey ? 60 : 5));
      } else if (["ArrowRight", "ArrowUp"].includes(e.key)) {
        e.preventDefault();
        tpSet(TP.start + (e.shiftKey ? 60 : 5));
      }
    },
    true,
  );
  function burstDay(d, color) {
    const el = document.querySelector(
      `#cockpit:not([hidden]) .ckcal [data-day="${d}"],#cal:not([hidden]) .ckcal [data-day="${d}"]`,
    );
    if (el) miniBurst(el, color);
  }
  function scheduleEnt(e, day) {
    openTP({
      title: "Kada se snima ovaj entitet?",
      name: e.name || "Entitet",
      ent: e,
      blockEv: true,
      date: day,
      dur: e.duration || 60,
      start: e.start ? toMin(e.start) : defStart(day, e.id),
      excludeId: e.id,
      onOk: async (m) => {
        const ord = maxDayOrder(day) + 1000;
        const st = hm(m);
        e.date = day;
        e.start = st;
        e.dayOrder = ord;
        refresh();
        burstDay(day, ec(e));
        if (dayOpen) renderDay(false);
        try {
          await api.upd("entities", e.id, {
            date: day,
            start: st,
            dayOrder: ord,
          });
          toast(
            `${e.name} · ${fmtLong.format(pdate(day))} · ${st}–${hm(m + (e.duration || 60))}`,
          );
        } catch (err) {
          toast(errMsg(err));
          refresh();
        }
      },
    });
  }

  /* ---- day planner ---- */
  var dayOpen = null;
  function maxDayOrder(d) {
    return Math.max(0, ...dayList(d).map((x) => x.o));
  }
  function openDay(d) {
    dayOpen = d;
    const o = $("#dayp");
    o.hidden = false;
    renderDay(true);
    requestAnimationFrame(() => o.classList.add("open"));
    document.body.style.overflow = "hidden";
  }
  function closeDay() {
    const o = $("#dayp");
    o.classList.remove("open");
    document.body.style.overflow = "";
    setTimeout(
      () => {
        o.hidden = true;
        dayOpen = null;
      },
      reduce ? 0 : 350,
    );
  }
  function renderDay(anim) {
    if (!dayOpen || $("#dayp").hidden) return;
    const d = dayOpen,
      list = dayAll(d),
      rg = dayRange(d),
      ents = dayEnts(d);
    const mods = [...new Set(ents.flatMap((e) => e.models || []))];
    const R0 = rg && rg[0] < 360 ? 0 : 360,
      R1 = 1440;
    let prevEnd = null,
      rows = "";
    list.forEach((x, i) => {
      const r = x.ref,
        a = x.s,
        b = a != null ? a + x.dur : null;
      let clash = false;
      const busy = x.t === "e" && a != null && evClash(d, a, b).length > 0;
      if (a != null && prevEnd != null) {
        if (a > prevEnd)
          rows += `<div class="tgap" style="${anim ? `animation-delay:${(0.1 + i * 0.05).toFixed(2)}s` : "animation:none"}"><span>Slobodno ${fmtDur(a - prevEnd)}</span></div>`;
        else if (a < prevEnd) clash = true;
      }
      if (b != null) prevEnd = Math.max(prevEnd || 0, b);
      const nm = x.t === "e" ? "entitet" : x.t === "pause" ? "pauza" : "prevoz";
      const tm = `<button type="button" class="tm" data-dtime="${i}" aria-label="Promeni vreme">${a != null ? `${hm(a)}<small>${hm(b)}</small>` : `<span class="tset">Postavi vreme</span>`}</button>`;
      const ctl = `<div class="ctl"><button data-dd="${i}" data-v="-5" aria-label="5 minuta kraće">${ICK.minus}</button><span class="dv">${fmtDur(x.dur)}</span><button data-dd="${i}" data-v="5" aria-label="5 minuta duže">${ICK.plus}</button>${x.t === "e" ? `<button data-drm="${i}" aria-label="Vrati u Cockpit" title="Vrati u Cockpit">${ICK.back}</button><button class="dz" data-edel="${esc(x.id)}" aria-label="Obriši entitet" title="Obriši entitet">${ICK.trash}</button>` : `<button class="dz" data-drm="${i}" aria-label="Ukloni ${nm}" title="Ukloni">${ICK.trash}</button>`}</div>`;
      const st = anim
        ? `animation-delay:${(0.12 + i * 0.05).toFixed(2)}s`
        : "animation:none";
      const tag = busy
        ? `<span class="clt">Mihajlo zauzet</span>`
        : clash
          ? `<span class="clt">Preklapanje</span>`
          : "";
      if (busy) clash = true;
      if (x.t === "ev") {
        rows += `<div class="trw evt" style="${anim ? `animation-delay:${(0.12 + i * 0.05).toFixed(2)}s` : "animation:none"}"><div class="tm">${hm(a)}<small>${hm(b)}</small></div><div class="tt2"><b>${esc(r.title || "Event")}</b><div class="em">${evAvs(r.assignees)}<span class="evbusy">Zauzeti: ${esc(pplStr(r.assignees))}</span>${evBlocks(x) ? `<span class="clt">Nema snimanja</span>` : ""}</div></div><div class="evtag">${ICK.clock}Event</div></div>`;
        return;
      }
      if (x.t === "e") {
        const sc = S.scripts.find((y) => y.id === r.scriptId);
        rows += `<div class="trw${clash ? " clash" : ""}" style="--ec:${esc(ec(r))};${st}">${tm}<div class="tt2"><b role="button" tabindex="0" data-oent="${esc(r.id)}" style="cursor:pointer">${esc(r.name)}${tag}</b><div class="em">${(r.models || []).length ? entAvs(r.models, 4) : ""}${r.location ? `<span class="ec" style="background:rgba(0,0,0,.25);padding:4px 9px;border-radius:8px;font-size:13px;font-weight:600;display:inline-flex;gap:5px;align-items:center">${ICK.pin.replace("<svg", "<svg style='width:13px;height:13px'")}${esc(r.location)}</span>` : ""}<span style="font-size:13px;color:var(--muted)">${esc(sc ? sc.title : "")}</span></div>${r.props ? `<div style="font-size:14px;color:var(--muted)">Rekviziti: ${esc(r.props)}</div>` : ""}</div>${ctl}</div>`;
      } else
        rows += `<div class="trw ${x.t === "pause" ? "brk2" : "trv"}${clash ? " clash" : ""}" style="${st}">${tm}<div class="tt2"><b>${x.t === "pause" ? "Pauza" : "Prevoz"}${tag}</b></div>${ctl}</div>`;
    });
    const evn = list.filter((x) => x.t === "ev").length;
    $("#dpp").innerHTML =
      `<div class="dph"><div><h2>${esc(fmtLong.format(pdate(d)))}</h2><div class="sub">${ents.length} ${ents.length === 1 ? "entitet" : "entiteta"}${evn ? ` · ${evn} ${evn === 1 ? "event" : "eventa"}` : ""}${mods.length ? " · " + mods.map((v) => esc(modelRef(v).name)).join(", ") : ""}</div></div><button class="x" id="dpClose" aria-label="Zatvori">${ICK.x}</button></div>
    ${rg ? `<div class="dpsum"><div class="big"><b>${hm(rg[0])}</b><span class="arr"></span><b>${hm(rg[1])}</b></div><div class="tprib static"><div class="rtrack">${ribTicks(R0, R1)}${ribBlocks(d, null, R0, R1)}</div></div></div>` : ""}
    <div class="tl">${rows || `<div class="dpnone">Ovaj dan je prazan. Prevuci entitet iz Cockpita na ovaj dan ili dodaj pauzu i prevoz.</div>`}</div>
    <div class="dpadd">${schButtons(d)}<button class="pill" data-dadd="pause">${ICK.coffee.replace("<svg", "<svg style='width:18px;height:18px'")}Dodaj pauzu</button><button class="pill" data-dadd="travel">${ICK.car.replace("<svg", "<svg style='width:18px;height:18px'")}Dodaj prevoz</button></div>`;
  }
  $("#dayp").addEventListener("click", async (e) => {
    if (e.target.id === "dayp" || e.target.closest("#dpClose")) {
      closeDay();
      return;
    }
    const d = dayOpen;
    if (!d) return;
    const list = dayAll(d);
    const oe = e.target.closest("[data-oent]");
    if (oe) {
      openEnt(oe.dataset.oent);
      return;
    }
    const add = e.target.closest("[data-dadd]");
    if (add) {
      const kind = add.dataset.dadd,
        dur = kind === "pause" ? 30 : 20;
      openTP({
        title: kind === "pause" ? "Kada počinje pauza?" : "Kada kreće prevoz?",
        name: kind === "pause" ? "Pauza" : "Prevoz",
        color: kind === "pause" ? "#58d08b" : "#7fb2ff",
        date: d,
        dur,
        start: defStart(d),
        excludeId: null,
        onOk: async (m) => {
          try {
            await api.add("dayItems", {
              date: d,
              kind,
              duration: dur,
              start: hm(m),
              label: "",
              dayOrder: maxDayOrder(d) + 1000,
              order: Date.now(),
            });
            renderDay(false);
            refresh();
          } catch (err) {
            toast(errMsg(err));
          }
        },
      });
      return;
    }
    const tmb = e.target.closest("[data-dtime]");
    if (tmb) {
      const x = list[+tmb.dataset.dtime];
      if (!x) return;
      const c = x.t === "e" ? "entities" : "dayItems";
      if (x.t === "ev") return;
      openTP({
        title:
          x.t === "e"
            ? "Kada se snima ovaj entitet?"
            : x.t === "pause"
              ? "Kada počinje pauza?"
              : "Kada kreće prevoz?",
        name: x.t === "e" ? x.ref.name : x.t === "pause" ? "Pauza" : "Prevoz",
        ent: x.t === "e" ? x.ref : null,
        blockEv: x.t === "e",
        color: x.t === "pause" ? "#58d08b" : "#7fb2ff",
        date: d,
        dur: x.dur,
        start: x.s != null ? x.s : defStart(d, x.id),
        excludeId: x.id,
        onOk: async (m) => {
          const st = hm(m);
          x.ref.start = st;
          renderDay(false);
          try {
            await api.upd(c, x.id, { start: st });
            refresh();
          } catch (err) {
            toast(errMsg(err));
          }
        },
      });
      return;
    }
    const col = (x) => (x.t === "e" ? "entities" : "dayItems");
    const mv = e.target.closest("[data-dmv]");
    if (mv) {
      const i = +mv.dataset.dmv,
        j = i + +mv.dataset.dir;
      if (j < 0 || j >= list.length) return;
      const a = list[i],
        b = list[j];
      let oa = a.o,
        ob = b.o;
      if (oa === ob) {
        ob = oa + 1;
      }
      try {
        a.ref.dayOrder = ob;
        b.ref.dayOrder = oa;
        renderDay(false);
        await api.upd(col(a), a.id, { dayOrder: ob });
        await api.upd(col(b), b.id, { dayOrder: oa });
        refresh();
      } catch (err) {
        toast(errMsg(err));
      }
      return;
    }
    const dd = e.target.closest("[data-dd]");
    if (dd) {
      const x = list[+dd.dataset.dd];
      const v = Math.max(5, Math.min(600, (x.dur || 0) + +dd.dataset.v));
      x.ref.duration = v;
      renderDay(false);
      try {
        await api.upd(col(x), x.id, { duration: v });
        refresh();
      } catch (err) {
        toast(errMsg(err));
      }
      return;
    }
    const rm = e.target.closest("[data-drm]");
    if (rm) {
      const x = list[+rm.dataset.drm];
      try {
        if (x.t === "e") {
          await api.upd("entities", x.id, { date: "", dayOrder: 0 });
          toast(`${x.ref.name} vraćen u Cockpit`);
        } else {
          await api.del("dayItems", x.id);
          if (!DB) S.dayItems = S.dayItems.filter((y) => y.id !== x.id);
        }
        renderDay(false);
        refresh();
      } catch (err) {
        toast(errMsg(err));
      }
      return;
    }
  });
  $("#dayp").addEventListener("change", async (e) => {
    if (e.target.id === "dpStart" && dayOpen) {
      const v = e.target.value || "09:00";
      try {
        await api.set("days", dayOpen, { start: v, order: 0 });
        const ex = S.days.find((x) => x.id === dayOpen);
        if (ex) ex.start = v;
        else S.days.push({ id: dayOpen, start: v });
        renderDay(false);
      } catch (err) {
        toast(errMsg(err));
      }
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && dayOpen && $("#escrim").hidden && !TP) closeDay();
  });

  /* ---- drag entities onto calendar days ---- */
  var edrag = null,
    edragJust = false;
  document.addEventListener("pointerdown", (e) => {
    if (e.target.closest("[data-edel]")) return;
    const card = e.target.closest(".ent[data-ent],.cchip[data-ent]");
    if (!card || (e.pointerType === "mouse" && e.button !== 0)) return;
    if (!card.closest("#cockpit") && !card.closest("#cal")) return;
    if (e.pointerType === "mouse") e.preventDefault();
    edrag = {
      card,
      id: card.dataset.ent,
      x0: e.clientX,
      y0: e.clientY,
      x: e.clientX,
      y: e.clientY,
      started: false,
      touch: e.pointerType !== "mouse",
    };
    if (edrag.touch)
      edrag.timer = setTimeout(() => {
        if (edrag && !edrag.started) eStart();
      }, 280);
  });
  addEventListener("pointermove", (e) => {
    if (!edrag) return;
    edrag.x = e.clientX;
    edrag.y = e.clientY;
    const dist = Math.hypot(e.clientX - edrag.x0, e.clientY - edrag.y0);
    if (!edrag.started) {
      if (edrag.touch) {
        if (dist > 10) {
          clearTimeout(edrag.timer);
          edrag = null;
        }
        return;
      }
      if (dist > 6) eStart();
      else return;
    }
    eMove();
  });
  document.addEventListener(
    "touchmove",
    (e) => {
      if (edrag && edrag.started) e.preventDefault();
    },
    { passive: false },
  );
  addEventListener("pointerup", () => {
    if (!edrag) return;
    clearTimeout(edrag.timer);
    if (edrag.started) eDrop();
    else {
      const id = edrag.id;
      edrag = null;
      edragJust = true;
      setTimeout(() => (edragJust = false), 80);
      openEnt(id);
    }
  });
  addEventListener("pointercancel", () => {
    if (!edrag) return;
    clearTimeout(edrag.timer);
    if (edrag.started) eDrop();
    else edrag = null;
  });
  function eStart() {
    const c = edrag.card,
      e = S.entities.find((x) => x.id === edrag.id);
    if (!e) {
      edrag = null;
      return;
    }
    edrag.started = true;
    const g = document.createElement("div");
    g.className = "ent edrag-ghost";
    g.style.setProperty("--ec", e.color || ECOL[0]);
    g.innerHTML = entCard(e, null)
      .replace(/^<div[^>]*>/, "")
      .replace(/<\/div>\s*$/, "");
    g.style.animation = "none";
    document.body.appendChild(g);
    edrag.ghost = g;
    c.classList.add("lifted");
    document.body.style.userSelect = "none";
    $("#trash").classList.add("show");
    try {
      navigator.vibrate && navigator.vibrate(12);
    } catch (err) {}
    eMove();
  }
  function eMove() {
    const { ghost } = edrag;
    ghost.style.transform = `translate(${edrag.x - 120}px,${edrag.y - 30}px) rotate(3deg) scale(1.03)`;
    const el = document.elementFromPoint(edrag.x, edrag.y);
    const day = el && el.closest("[data-day]"),
      tray = el && el.closest("[data-tray]");
    $$(".cday.dropok").forEach((x) => {
      if (x !== day) x.classList.remove("dropok");
    });
    if (day) day.classList.add("dropok");
    const tr = $("#trash").getBoundingClientRect(),
      hot =
        edrag.x >= tr.left - 10 &&
        edrag.x <= tr.right + 10 &&
        edrag.y >= tr.top - 14 &&
        edrag.y <= tr.bottom + 14;
    if (hot !== !!edrag.hot) {
      edrag.hot = hot;
      $("#trash").classList.toggle("hot", hot);
      ghost.classList.toggle("doomed", hot);
      try {
        hot && navigator.vibrate && navigator.vibrate(8);
      } catch (err) {}
    }
    const $ck = $("#ckTray");
    $ck && $ck.classList.toggle("over", !!tray && !hot);
    edrag.target = hot
      ? { trash: true }
      : day
        ? { day: day.dataset.day, el: day }
        : tray
          ? { tray: true }
          : null;
    if (hot) return;
    const m = 70;
    if (edrag.y > tr.top - 30 && edrag.y > innerHeight - m - 90) return;
    if (edrag.y > innerHeight - m) scrollBy(0, 14);
    else if (edrag.y < m) scrollBy(0, -14);
  }
  async function eDrop() {
    const d = edrag;
    edrag = null;
    edragJust = true;
    setTimeout(() => (edragJust = false), 80);
    d.ghost.remove();
    d.card.classList.remove("lifted");
    document.body.style.userSelect = "";
    $$(".cday.dropok").forEach((x) => x.classList.remove("dropok"));
    $("#ckTray").classList.remove("over");
    $("#trash").classList.remove("show", "hot");
    if (!d.target) return;
    if (d.target.trash) {
      delEnt(d.id);
      return;
    }
    const e = S.entities.find((x) => x.id === d.id);
    if (!e) return;
    try {
      if (d.target.day) {
        if (e.date === d.target.day) return;
        scheduleEnt(e, d.target.day);
      } else if (d.target.tray && e.date) {
        e.date = "";
        refresh();
        await api.upd("entities", e.id, { date: "", dayOrder: 0 });
        toast(`${e.name} vraćen u Cockpit`);
      }
    } catch (err) {
      toast(errMsg(err));
      refresh();
    }
  }

  /* ---- dashboard cards ---- */
  function updateDashCal() {
    const ck = $("#ckCard"),
      cal = $("#calCard");
    if (!ck || !cal || !me) return;
    const nina = me.id === "nina";
    ck.hidden = !nina;
    cal.classList.toggle("wide2", !nina);
  }

  /* ================= LEAD MANAGER ================= */
  /* Leads heat up as they move toward a deal: cold steel -> violet -> magenta -> ember -> green (closed). Rejected cools to ash. */
  const LST = [
    { id: "new", name: "Not Contacted", c: "#8a96b8" },
    { id: "contacted", name: "Contacted", c: "#8f6bff" },
    { id: "meet", name: "Meet Booked", c: "#e055a8" },
    { id: "nego", name: "In-Negotiation", c: "#ff7438" },
    { id: "closed", name: "Closed", c: "#3fcf7a" },
    { id: "rejected", name: "Rejected", c: "#7a716a" },
  ];
  const LFLOW = ["new", "contacted", "meet", "nego", "closed"];
  const lstOf = (id) => LST.find((s) => s.id === id) || LST[0];
  const lNext = (id) => {
    const i = LFLOW.indexOf(id || "new");
    return i > -1 && i < 4 ? lstOf(LFLOW[i + 1]) : null;
  };
  const LIC = {
    phone: SV(
      '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>',
    ),
    mail: SV(
      '<rect x="2" y="4" width="20" height="16" rx="3"/><path d="m22 7-10 6L2 7"/>',
    ),
    ig: SV(
      '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".6" fill="currentColor"/>',
    ),
    tt: SV(
      '<path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5"/><path d="M14 3c.5 2.8 2.4 4.6 5 5"/>',
    ),
    cw: SV(
      '<path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-5h6v5M9 10h.01M15 10h.01"/>',
    ),
    user: SV(
      '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
    ),
    next: SV('<path d="M5 12h14M13 6l6 6-6 6"/>', 2.4),
    open: SV(
      '<path d="M14 4h6v6M20 4l-9 9M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/>',
    ),
    wa: SV(
      '<path d="M3 21l1.6-4.6A9 9 0 1 1 8 19.6z"/><path d="M9 9.5c.3 2 2.5 4.2 4.5 4.5l1.2-1.2 2 .8c-.3 1.3-1.3 2-2.6 1.8C11 15 9 13 8.5 9.9 8.3 8.6 9 7.6 10.3 7.3l.8 2z"/>',
    ),
    meet: SV(
      '<circle cx="9" cy="8" r="3.5"/><circle cx="17" cy="9" r="2.5"/><path d="M2.5 20c.8-3.5 3.3-5.5 6.5-5.5s5.7 2 6.5 5.5M15.5 14.6c2.8-.3 5 1.3 6 4.4"/>',
    ),
    flame: SV(
      '<path d="M12 22c3.9 0 7-2.9 7-6.9 0-2.8-1.6-5-3.2-6.7-.4 1.6-1.4 2.8-2.6 3.3.3-3.3-1-6.6-3.7-8.7.1 3.3-1.6 5.3-3.1 7.2C5.3 11.6 5 13.2 5 15.1 5 19.1 8.1 22 12 22z"/>',
    ),
    trash: SV('<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>'),
    x: SV('<path d="M18 6 6 18M6 6l12 12"/>', 2.4),
    check: SV('<path d="m5 12 5 5L20 7"/>', 2.8),
    plus: SV('<path d="M12 5v14M5 12h14"/>', 2.4),
  };
  const LCH = [
    { id: "call", n: "Poziv", ic: LIC.phone },
    { id: "ig", n: "Instagram", ic: LIC.ig },
    { id: "tt", n: "TikTok", ic: LIC.tt },
    { id: "mail", n: "Email", ic: LIC.mail },
    { id: "wa", n: "WhatsApp", ic: LIC.wa },
    { id: "live", n: "Uživo", ic: LIC.meet },
  ];
  const LFIELDS = [
    {
      k: "phone",
      n: "Broj telefona",
      ic: LIC.phone,
      ph: "+381 6x xxx xxxx",
      type: "tel",
    },
    { k: "email", n: "Email", ic: LIC.mail, ph: "ime@firma.rs", type: "email" },
    { k: "instagram", n: "Instagram", ic: LIC.ig, ph: "@biznis", type: "text" },
    { k: "tiktok", n: "TikTok", ic: LIC.tt, ph: "@biznis", type: "text" },
    {
      k: "companyWall",
      n: "Company Wall",
      ic: LIC.cw,
      ph: "companywall.rs/firma/…",
      type: "url",
    },
  ];
  function lHref(k, v) {
    v = (v || "").trim();
    if (!v) return "";
    if (k === "phone") return "tel:" + v.replace(/[^\d+]/g, "");
    if (k === "email") return "mailto:" + v;
    const url = (s) =>
      /^https?:\/\//i.test(s) ? s : "https://" + s.replace(/^\/+/, "");
    if (k === "instagram")
      return /instagram\.com/i.test(v)
        ? url(v)
        : "https://instagram.com/" + v.replace(/^@/, "");
    if (k === "tiktok")
      return /tiktok\.com/i.test(v)
        ? url(v)
        : "https://www.tiktok.com/@" + v.replace(/^@/, "");
    return url(v);
  }
  const lInit = (l) => esc(((l.name || "?").trim()[0] || "?").toUpperCase());
  const fmtLD = new Intl.DateTimeFormat("sr-Latn-RS", {
    day: "numeric",
    month: "short",
  });
  const dstrL = (d) =>
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0");
  const lDate = (d) => {
    if (!d) return "";
    const t = todayStr();
    if (d === t) return "Danas";
    const y = new Date();
    y.setDate(y.getDate() + 1);
    if (d === dstrL(y)) return "Sutra";
    return fmtLD.format(new Date(d + "T12:00"));
  };
  const lOpen = (l) => !["closed", "rejected"].includes(l.stage || "new");
  const lLate = (l) => !!l.nextDate && l.nextDate <= todayStr() && lOpen(l); // follow-up due today or overdue
  const lOver = (l) => !!l.nextDate && l.nextDate < todayStr() && lOpen(l);
  const lOf = (id) => (S.leads || []).find((x) => x.id === id);
  function animCount(el, to) {
    if (!el) return;
    const from = +el.dataset.v || 0;
    el.dataset.v = to;
    const suf = el.dataset.suf || "";
    if (reduce || from === to) {
      el.textContent = to + suf;
      return;
    }
    const t0 = performance.now(),
      dur = 900;
    const f = (t) => {
      const p = Math.min(1, (t - t0) / dur),
        e = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(from + (to - from) * e) + suf;
      if (p < 1 && +el.dataset.v === to) requestAnimationFrame(f);
    };
    requestAnimationFrame(f);
  }
  function lBump(el) {
    if (!el || reduce) return;
    el.classList.remove("bump");
    void el.offsetWidth;
    el.classList.add("bump");
  }

  /* ---- cards ---- */
  function lcardInner(l) {
    const nx = lNext(l.stage);
    const links = LFIELDS.filter((f) => (l[f.k] || "").trim())
      .map(
        (f) =>
          `<a class="lk" href="${esc(lHref(f.k, l[f.k]))}" ${f.k === "phone" || f.k === "email" ? "" : 'target="_blank" rel="noopener"'} title="${esc(f.n)}" aria-label="${esc(f.n)}" data-stop>${f.ic}</a>`,
      )
      .join("");
    const step =
      l.nextStep && lOpen(l)
        ? `<div class="lc-next${lOver(l) ? " over" : lLate(l) ? " due" : ""}"><span>${esc(l.nextStep)}</span>${l.nextDate ? `<em>${esc(lDate(l.nextDate))}</em>` : ""}</div>`
        : "";
    const side = nx
      ? `<button type="button" class="ladv" data-ladv="${esc(l.id)}" style="--n:${nx.c}" title="Pomeri u ${nx.name}" aria-label="Pomeri u ${nx.name}">${LIC.next}</button>`
      : l.stage === "closed"
        ? `<span class="lwon" title="Klijent">${LIC.check}</span>`
        : "";
    return `<div class="lc-top"><span class="lav">${lInit(l)}</span><div class="lc-id"><b>${esc(l.name || "Bez naziva")}</b>${l.owner ? `<span>${esc(l.owner)}</span>` : ""}</div>${side}</div>${step}${links ? `<div class="lc-links">${links}</div>` : ""}`;
  }
  const lcardSig = (l) =>
    JSON.stringify([
      l.name,
      l.owner,
      l.stage,
      l.nextStep,
      l.nextDate,
      lLate(l),
      lOver(l),
      l.phone,
      l.email,
      l.instagram,
      l.tiktok,
      l.companyWall,
      todayStr(),
    ]);
  function lcardApply(el, l) {
    const st = lstOf(l.stage);
    el.classList.add("lcard");
    el.classList.toggle("dead", l.stage === "rejected");
    el.classList.toggle("won", l.stage === "closed");
    el.classList.toggle("hot", lLate(l));
    el.style.setProperty("--c", st.c);
    el.dataset.lead = l.id;
    el.tabIndex = 0;
    el.setAttribute("role", "button");
    el.setAttribute("aria-label", `${l.name || "Lead"}, ${st.name}`);
    el.innerHTML = lcardInner(l);
    el.dataset.sig = lcardSig(l);
  }

  /* ---- page ---- */
  let firstLM = true,
    lmQuery = "",
    lmDueOnly = false,
    ldrag = null,
    ldragJust = false,
    lmFlipQ = null;
  const lmEls = new Map();
  function lmRail(all, anim) {
    const r = $("#lmRail");
    if (anim || !r.querySelector(".lnode")) {
      r.innerHTML = `<div class="lr-grid">
      ${LFLOW.map((id, i) => {
        const s = lstOf(id);
        return `<button type="button" class="lnode${id === "closed" ? " gold" : ""}" data-lnode="${id}" style="--c:${s.c};--i:${i}"><b data-lrn="${id}">0</b><span>${s.name}${id === "closed" ? `<em id="lmConv" data-suf="%" title="Procenat zatvorenih od svih završenih leadova">0%</em>` : ""}</span></button>`;
      }).join("")}
      <i class="lr-sep" aria-hidden="true"></i>
      <button type="button" class="lnode ash" data-lnode="rejected" style="--c:${LST[5].c};--i:5"><b data-lrn="rejected">0</b><span>Rejected</span></button>
      <div class="lr-bar" aria-hidden="true"><i class="lr-heat"></i>${LFLOW.map((id, i) => `<i class="lr-dot" data-ldot="${id}" style="--c:${lstOf(id).c};--i:${i};left:${i * 25}%"></i>`).join("")}<i class="lr-pulse"></i><i class="lr-shot" id="lmShot"></i></div>
    </div>`;
      r.classList.remove("ignite");
      if (anim && !reduce) {
        void r.offsetWidth;
        r.classList.add("ignite");
      }
    }
    LST.forEach((s) => {
      const n = all.filter((l) => (l.stage || "new") === s.id).length;
      const b = r.querySelector(`[data-lrn="${s.id}"]`);
      if (!anim && +b.dataset.v !== n) lBump(b);
      animCount(b, n);
      const d = r.querySelector(`[data-ldot="${s.id}"]`);
      if (d)
        d.style.setProperty(
          "--s",
          (12 + Math.min(16, n * 2.2)).toFixed(1) + "px",
        );
    });
    const c = all.filter((l) => l.stage === "closed").length,
      j = all.filter((l) => l.stage === "rejected").length;
    animCount($("#lmConv"), c + j ? Math.round((c / (c + j)) * 100) : 0);
    const due = all.filter(lLate).length,
      p = $("#lmDuePill");
    if (!due && lmDueOnly) lmDueOnly = false;
    p.hidden = !due && !lmDueOnly;
    p.setAttribute("aria-pressed", lmDueOnly);
    p.innerHTML = `${LIC.flame}<b>${due}</b><span>${due === 1 ? "follow-up danas" : "follow-upa danas"}</span>${lmDueOnly ? `<i class="lx">${LIC.x}</i>` : ""}`;
  }
  function lmBuildBoard(anim) {
    $("#lmBoard").innerHTML = LST.map(
      (
        st,
        ci,
      ) => `<section class="col lcol" data-lcol="${st.id}" style="--c:${st.c};${anim ? `animation-delay:${(0.32 + ci * 0.06).toFixed(2)}s` : "animation:none"}" aria-label="${st.name}">
    <header class="lch2"><h2>${st.name}</h2><b class="lcnt" data-lcnt="${st.id}">0</b></header>
    ${st.id === "new" ? `<button type="button" class="lnew" data-ladd>${LIC.plus}<span>Novi lead</span></button>` : ""}
    <div class="lrows" data-lrows="${st.id}"></div>
    ${st.id === "new" ? "" : `<div class="lempty" data-lempty="${st.id}">Prevuci lead ovde</div>`}
  </section>`,
    ).join("");
  }
  function renderLM() {
    if ($("#lm").hidden) return;
    const anim = firstLM;
    firstLM = false;
    const all = S.leads || [];
    const q = lmQuery.trim().toLowerCase();
    lmRail(all, anim);
    let vis = q
      ? all.filter((l) =>
          [l.name, l.owner, l.instagram, l.email, l.phone, l.tiktok].some((v) =>
            (v || "").toLowerCase().includes(q),
          ),
        )
      : all;
    if (lmDueOnly) vis = vis.filter(lLate);
    if (anim || !$("#lmBoard .lcol")) {
      lmBuildBoard(anim);
      lmEls.clear();
    }
    const seen = new Set();
    LST.forEach((st, ci) => {
      const rows = $(`#lmBoard [data-lrows="${st.id}"]`);
      const list = vis
        .filter((l) => (l.stage || "new") === st.id)
        .sort(
          (x, y) =>
            lLate(y) - lLate(x) ||
            (y.stageAt || y.order || 0) - (x.stageAt || x.order || 0),
        );
      let prev = null;
      list.forEach((l, i) => {
        let el = lmEls.get(l.id);
        if (!el) {
          el = document.createElement("div");
          lcardApply(el, l);
          lmEls.set(l.id, el);
          if (anim)
            el.style.animationDelay =
              (0.42 + ci * 0.06 + i * 0.045).toFixed(3) + "s";
          else if (!(lmFlipQ && lmFlipQ.id === l.id))
            el.classList.add(S.fresh.has(l.id) ? "new" : "enter");
        } else if (el.dataset.sig !== lcardSig(l)) lcardApply(el, l);
        seen.add(l.id);
        const want = prev ? prev.nextElementSibling : rows.firstElementChild;
        if (el !== want) rows.insertBefore(el, want);
        prev = el;
      });
      const cnt = $(`#lmBoard [data-lcnt="${st.id}"]`);
      if (!anim && +cnt.dataset.v !== list.length) lBump(cnt);
      animCount(cnt, list.length);
      const em = $(`#lmBoard [data-lempty="${st.id}"]`);
      if (em) {
        em.hidden = list.length > 0;
        em.textContent =
          q || lmDueOnly ? "Nema rezultata" : "Prevuci lead ovde";
      }
    });
    for (const [id, el] of lmEls)
      if (!seen.has(id)) {
        el.remove();
        lmEls.delete(id);
      }
    const nb = $("#lmBoard [data-ladd] span");
    if (nb) nb.textContent = all.length ? "Novi lead" : "Dodaj prvi lead";
    if (lmFlipQ) {
      const f = lmFlipQ;
      lmFlipQ = null;
      lmLand(f);
    }
  }

  /* a lead lands in its new column: fly from where it was, flash with heat, throw embers, run a pulse along the rail */
  function lmLand(f) {
    const el = lmEls.get(f.id);
    if (!el) return;
    const st = lstOf(f.stage);
    if (f.from && !reduce) {
      const to = el.getBoundingClientRect(),
        dx = f.from.left - to.left,
        dy = f.from.top - to.top;
      const b = $("#lmBoard"),
        br = b.getBoundingClientRect();
      let sd = 0;
      if (to.right > br.right - 16) sd = to.right - br.right + 48;
      else if (to.left < br.left + 16) sd = to.left - br.left - 48;
      if (sd) b.scrollBy({ left: sd, behavior: "smooth" });
      if (Math.abs(dx) > 1 || Math.abs(dy) > 1)
        el.animate(
          [
            {
              transform: `translate(${dx}px,${dy}px) rotate(${f.rot || 0}deg) scale(${f.scale || 1.03})`,
              boxShadow: `0 40px 70px -24px rgba(0,0,0,.9),0 0 46px -10px ${st.c}`,
              zIndex: 5,
            },
            { transform: "none", boxShadow: "0 0 0 0 transparent", zIndex: 5 },
          ],
          {
            duration: Math.min(820, 420 + Math.hypot(dx, dy) * 0.35),
            easing: "cubic-bezier(.22,.9,.26,1.1)",
          },
        );
    }
    el.classList.remove("land");
    void el.offsetWidth;
    el.classList.add("land");
    setTimeout(
      () => {
        if (!el.isConnected) return;
        const r = el.getBoundingClientRect();
        lmEmbers(
          r.left + r.width / 2,
          r.top + r.height / 2,
          st.c,
          f.stage === "closed" ? 26 : 14,
        );
      },
      reduce ? 0 : 520,
    );
    railShot(f.prev, f.stage);
  }
  function lmEmbers(x, y, c, n = 14) {
    if (reduce) return;
    for (let i = 0; i < n; i++) {
      const p = document.createElement("i");
      p.className = "lemb";
      p.style.left = x + "px";
      p.style.top = y + "px";
      p.style.background = i % 3 ? c : "#fff3d1";
      const a = Math.random() * Math.PI * 2,
        d = 26 + Math.random() * 70,
        up = -30 - Math.random() * 70,
        s = 0.5 + Math.random() * 0.9;
      document.body.appendChild(p);
      p.animate(
        [
          { transform: "translate(-50%,-50%) scale(1)", opacity: 1 },
          {
            transform: `translate(calc(-50% + ${Math.cos(a) * d}px),calc(-50% + ${Math.sin(a) * d * 0.5 + up}px)) scale(${s})`,
            opacity: 0,
          },
        ],
        {
          duration: 650 + Math.random() * 500,
          easing: "cubic-bezier(.2,.7,.3,1)",
        },
      ).onfinish = () => p.remove();
    }
  }
  function railShot(a, b) {
    const r = $("#lmRail");
    if (!r) return;
    const node = r.querySelector(`[data-lnode="${b}"]`);
    if (node) {
      node.classList.remove("hit");
      void node.offsetWidth;
      node.classList.add("hit");
    }
    const ia = LFLOW.indexOf(a),
      ib = LFLOW.indexOf(b),
      shot = $("#lmShot");
    if (ia < 0 || ib < 0 || !shot || reduce) return;
    shot.style.setProperty("--c", lstOf(b).c);
    shot.animate(
      [
        { left: ia * 25 + "%", opacity: 0 },
        { left: ia * 25 + "%", opacity: 1, offset: 0.12 },
        { left: ib * 25 + "%", opacity: 1, offset: 0.86 },
        { left: ib * 25 + "%", opacity: 0 },
      ],
      {
        duration: Math.max(520, Math.abs(ib - ia) * 300),
        easing: "cubic-bezier(.55,0,.2,1)",
      },
    );
  }

  async function setLeadStage(l, stage, o = {}) {
    const prev = l.stage || "new";
    if (prev === stage) return;
    let from = o.from;
    if (!from && !$("#lm").hidden) {
      const el = lmEls.get(l.id);
      if (el) {
        const r = el.getBoundingClientRect();
        from = { left: r.left, top: r.top };
      }
    }
    l.stage = stage;
    l.stageAt = Date.now();
    if (!$("#lm").hidden)
      lmFlipQ = {
        id: l.id,
        from,
        prev,
        stage,
        rot: o.rot || 0,
        scale: o.scale || 1,
      };
    refresh();
    try {
      await api.upd("leads", l.id, { stage, stageAt: l.stageAt });
      if (stage === "closed") await convertLead(l);
      else if (!o.quiet)
        toast(`${l.name} → ${lstOf(stage).name}`, () => {
          const cur = lOf(l.id) || l;
          setLeadStage(cur, prev, { quiet: true });
        });
    } catch (err) {
      toast(errMsg(err));
      l.stage = prev;
      refresh();
    }
  }
  async function convertLead(l) {
    const ex = l.clientId && S.clients.find((c) => c.id === l.clientId);
    if (ex) {
      lWin(l);
      return;
    }
    const order = S.clients.reduce((a, c) => Math.max(a, c.order || 0), 0) + 1,
      color = COLORS[S.clients.length % COLORS.length];
    try {
      const cid = await api.add("clients", {
        name: (l.name || "Novi klijent").trim(),
        kind: "client",
        color,
        order,
        fromLead: l.id,
      });
      markFresh(cid);
      const d = new Date();
      await api.add("items", {
        clientId: cid,
        type: "platform",
        title: "Client Platform",
        order: 0,
      });
      await api.add("items", {
        clientId: cid,
        type: "month",
        title: MONTHS[d.getMonth()],
        year: d.getFullYear(),
        month: d.getMonth() + 1,
        order: Date.now(),
        createdBy: me ? me.id : null,
      });
      l.clientId = cid;
      await api.upd("leads", l.id, { clientId: cid, closedAt: Date.now() });
      refresh();
      lWin(l);
    } catch (err) {
      toast(errMsg(err));
    }
  }

  /* ---- CLOSED: molten gold + rising embers ---- */
  function lWin(l) {
    const o = $("#lwin");
    $("#lwinName").textContent = l.name || "";
    o.hidden = false;
    o.classList.remove("open");
    void o.offsetWidth;
    o.classList.add("open");
    try {
      navigator.vibrate && navigator.vibrate([18, 40, 28]);
    } catch (err) {}
    setTimeout(() => {
      try {
        $("#lwinGo").focus({ preventScroll: true });
      } catch (e) {}
    }, 400);
    if (reduce) return;
    const cols = ["#e6fff0", "#7fe3a6", "#3fcf7a", "#22a35a", "#9df0bd"],
      W = innerWidth,
      H = innerHeight;
    let k = 0;
    const wave = () => {
      if (o.hidden || !o.classList.contains("open")) return;
      for (let i = 0; i < 14; i++) {
        const p = document.createElement("i");
        p.className = "lspark";
        const sz = 3 + Math.random() * 6;
        p.style.width = p.style.height = sz + "px";
        p.style.background = cols[(Math.random() * cols.length) | 0];
        const x = W * 0.5 + (Math.random() - 0.5) * W * 0.9,
          y = H * (0.62 + Math.random() * 0.4);
        p.style.left = x + "px";
        p.style.top = y + "px";
        o.appendChild(p);
        const rise = H * (0.35 + Math.random() * 0.55),
          sway = (Math.random() - 0.5) * 160;
        p.animate(
          [
            { transform: "translate(0,0) scale(1)", opacity: 0 },
            { opacity: 1, offset: 0.1 },
            {
              transform: `translate(${sway * 0.5}px,${-rise * 0.5}px) scale(.9)`,
              opacity: 0.9,
              offset: 0.5,
            },
            {
              transform: `translate(${sway}px,${-rise}px) scale(.2)`,
              opacity: 0,
            },
          ],
          {
            duration: 1500 + Math.random() * 1500,
            easing: "cubic-bezier(.3,.6,.4,1)",
          },
        ).onfinish = () => p.remove();
      }
      if (++k < 9) setTimeout(wave, 160);
    };
    wave();
  }
  function closeLWin() {
    const o = $("#lwin");
    o.classList.remove("open");
    setTimeout(
      () => {
        o.hidden = true;
        o.querySelectorAll(".lspark").forEach((x) => x.remove());
      },
      reduce ? 0 : 350,
    );
  }
  $("#lwin").addEventListener("click", (e) => {
    if (e.target.id === "lwin" || e.target.closest("#lwinOk")) closeLWin();
    if (e.target.closest("#lwinGo")) {
      closeLWin();
      nav("projects");
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !$("#lwin").hidden) closeLWin();
  });

  /* ---- board interactions ---- */
  $("#lmSearch").addEventListener("input", (e) => {
    lmQuery = e.target.value;
    renderLM();
  });
  $("#lmSearch").addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      e.target.value = "";
      lmQuery = "";
      renderLM();
      e.target.blur();
    }
  });
  $("#lmDuePill").addEventListener("click", () => {
    lmDueOnly = !lmDueOnly;
    renderLM();
  });
  $("#lmAdd").addEventListener("click", () => openLWiz());
  $("#lmRail").addEventListener("click", (e) => {
    const n = e.target.closest("[data-lnode]");
    if (!n) return;
    const col = $(`#lmBoard [data-lcol="${n.dataset.lnode}"]`),
      b = $("#lmBoard");
    if (!col) return;
    b.scrollBy({
      left:
        col.getBoundingClientRect().left -
        b.getBoundingClientRect().left -
        parseFloat(getComputedStyle(b).paddingLeft || 0),
      behavior: reduce ? "auto" : "smooth",
    });
    const top = b.getBoundingClientRect().top;
    if (top < 0 || top > innerHeight * 0.6)
      scrollBy({ top: top - 90, behavior: reduce ? "auto" : "smooth" });
    col.classList.remove("flash");
    void col.offsetWidth;
    col.classList.add("flash");
  });
  dragScroll($("#lmBoard"), ".lcard,.lk,.lnew,input,button");
  $("#lmBoard").addEventListener("click", (e) => {
    const adv = e.target.closest("[data-ladv]");
    if (adv) {
      e.stopPropagation();
      const l = lOf(adv.dataset.ladv),
        nx = l && lNext(l.stage);
      if (nx) setLeadStage(l, nx.id);
      return;
    }
    if (e.target.closest("[data-stop]")) return;
    if (e.target.closest("[data-ladd]")) {
      openLWiz();
      return;
    }
    if (ldragJust) return;
    const c = e.target.closest("[data-lead]");
    if (c) nav("l-" + c.dataset.lead);
  });
  $("#lmBoard").addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.matches(".lcard")) {
      nav("l-" + e.target.dataset.lead);
    }
  });
  $("#lmBoard").addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse" || ldrag) return;
    const c = e.target.closest(".lcard");
    if (!c) return;
    const r = c.getBoundingClientRect();
    c.style.setProperty("--mx", (e.clientX - r.left).toFixed(0) + "px");
    c.style.setProperty("--my", (e.clientY - r.top).toFixed(0) + "px");
  });
  document.addEventListener("keydown", (e) => {
    if ($("#lm").hidden || LW || e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.target;
    if (
      t &&
      (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))
    )
      return;
    if (e.key === "n" || e.key === "N") {
      e.preventDefault();
      openLWiz();
    } else if (e.key === "/") {
      e.preventDefault();
      $("#lmSearch").focus();
    }
  });

  /* ---- drag a lead to another stage ---- */
  document.addEventListener("pointerdown", (e) => {
    if ($("#lm").hidden) return;
    const card = e.target.closest("#lmBoard .lcard");
    if (
      !card ||
      e.target.closest("[data-stop],[data-ladv]") ||
      (e.pointerType === "mouse" && e.button !== 0)
    )
      return;
    const col = card.closest("[data-lcol]");
    ldrag = {
      card,
      id: card.dataset.lead,
      from: col ? col.dataset.lcol : "new",
      x0: e.clientX,
      y0: e.clientY,
      x: e.clientX,
      y: e.clientY,
      lx: e.clientX,
      rot: 0,
      started: false,
      touch: e.pointerType !== "mouse",
    };
    if (ldrag.touch)
      ldrag.timer = setTimeout(() => {
        if (ldrag && !ldrag.started) lStart();
      }, 280);
  });
  addEventListener("pointermove", (e) => {
    if (!ldrag) return;
    ldrag.x = e.clientX;
    ldrag.y = e.clientY;
    const dist = Math.hypot(e.clientX - ldrag.x0, e.clientY - ldrag.y0);
    if (!ldrag.started) {
      if (ldrag.touch) {
        if (dist > 10) {
          clearTimeout(ldrag.timer);
          ldrag = null;
        }
        return;
      }
      if (dist > 6) lStart();
      return;
    }
    lTarget();
  });
  document.addEventListener(
    "touchmove",
    (e) => {
      if (ldrag && ldrag.started) e.preventDefault();
    },
    { passive: false },
  );
  addEventListener("pointerup", () => {
    if (!ldrag) return;
    clearTimeout(ldrag.timer);
    if (ldrag.started) lDrop();
    else ldrag = null;
  });
  addEventListener("pointercancel", () => {
    if (!ldrag) return;
    clearTimeout(ldrag.timer);
    if (ldrag.started) lDrop();
    else ldrag = null;
  });
  function lStart() {
    const d = ldrag,
      c = d.card,
      r = c.getBoundingClientRect();
    d.started = true;
    d.ox = d.x0 - r.left;
    d.oy = d.y0 - r.top;
    const g = c.cloneNode(true);
    g.classList.remove("enter", "new", "land", "hot");
    g.classList.add("lghost");
    g.style.width = r.width + "px";
    g.style.animation = "none";
    g.removeAttribute("tabindex");
    document.body.appendChild(g);
    d.ghost = g;
    c.classList.add("slot");
    document.body.style.userSelect = "none";
    document.body.classList.add("lgrab");
    $("#lmBoard").classList.add("ldragging");
    const sc = $(`#lmBoard [data-lcol="${d.from}"]`);
    sc && sc.classList.add("src");
    try {
      navigator.vibrate && navigator.vibrate(12);
    } catch (err) {}
    lTarget();
    requestAnimationFrame(lTick);
  }
  function lTick() {
    const d = ldrag;
    if (!d || !d.started) return;
    const vx = d.x - d.lx;
    d.lx = d.x;
    d.rot += (Math.max(-14, Math.min(14, vx * 1.1)) - d.rot) * 0.16;
    d.ghost.style.transform = `translate(${d.x - d.ox}px,${d.y - d.oy}px) rotate(${d.rot.toFixed(2)}deg) scale(1.05)`;
    const b = $("#lmBoard"),
      br = b.getBoundingClientRect();
    if (d.x > br.right - 90)
      b.scrollLeft += Math.min(22, (d.x - (br.right - 90)) * 0.35);
    else if (d.x < br.left + 90)
      b.scrollLeft -= Math.min(22, (br.left + 90 - d.x) * 0.35);
    if (d.y > innerHeight - 70) scrollBy(0, 14);
    else if (d.y < 70) scrollBy(0, -14);
    requestAnimationFrame(lTick);
  }
  function lTarget() {
    const d = ldrag;
    if (!d || !d.started) return;
    const el = document.elementFromPoint(d.x, d.y);
    let col = el && el.closest("#lmBoard [data-lcol]");
    if (col && col.dataset.lcol === d.from) col = null;
    $$("#lmBoard .lcol.over").forEach((x) => {
      if (x !== col) x.classList.remove("over");
    });
    if (col && !col.classList.contains("over")) {
      col.classList.add("over");
      try {
        navigator.vibrate && navigator.vibrate(6);
      } catch (err) {}
    }
    d.ghost.style.setProperty("--c", lstOf(col ? col.dataset.lcol : d.from).c);
    d.target = col ? col.dataset.lcol : null;
  }
  function lDrop() {
    const d = ldrag;
    ldrag = null;
    ldragJust = true;
    setTimeout(() => (ldragJust = false), 80);
    document.body.style.userSelect = "";
    document.body.classList.remove("lgrab");
    $("#lmBoard").classList.remove("ldragging");
    $$("#lmBoard .lcol.over,#lmBoard .lcol.src").forEach((x) =>
      x.classList.remove("over", "src"),
    );
    const l = lOf(d.id);
    if (l && d.target && (l.stage || "new") !== d.target) {
      d.ghost.remove();
      d.card.classList.remove("slot");
      setLeadStage(l, d.target, {
        from: { left: d.x - d.ox, top: d.y - d.oy },
        rot: d.rot,
        scale: 1.05,
      });
      return;
    }
    const cr = d.card.getBoundingClientRect();
    if (reduce) {
      d.ghost.remove();
      d.card.classList.remove("slot");
      return;
    }
    d.ghost.animate(
      [
        { transform: d.ghost.style.transform },
        {
          transform: `translate(${cr.left}px,${cr.top}px) rotate(0deg) scale(1)`,
        },
      ],
      { duration: 340, easing: "cubic-bezier(.3,.9,.3,1.05)" },
    ).onfinish = () => {
      d.ghost.remove();
      d.card.classList.remove("slot");
    };
  }

  /* ---- new lead wizard ---- */
  let LW = null;
  const LWSTEPS = ["name", "owner", "contact", "social"];
  function openLWiz() {
    if (LW) return;
    LW = {
      step: 0,
      v: {
        name: "",
        owner: "",
        phone: "",
        email: "",
        instagram: "",
        tiktok: "",
        companyWall: "",
      },
    };
    $("#ldots").innerHTML = LWSTEPS.map(() => "<i></i>").join("");
    const el = $("#lwiz");
    el.hidden = false;
    requestAnimationFrame(() => el.classList.add("open"));
    document.body.style.overflow = "hidden";
    drawLW(false);
  }
  function closeLWiz() {
    const el = $("#lwiz");
    el.classList.remove("open");
    document.body.style.overflow = "";
    setTimeout(
      () => {
        el.hidden = true;
        $("#lstage").innerHTML = "";
        LW = null;
      },
      reduce ? 0 : 300,
    );
  }
  function lwField(f) {
    return `<label class="lwf"><span class="ic">${f.ic}</span><input data-lw="${f.k}" type="${f.type || "text"}" autocomplete="off" maxlength="160" placeholder="${esc(f.ph)}" aria-label="${esc(f.n)}" value="${esc(LW.v[f.k])}"></label>`;
  }
  function lwHTML(k) {
    if (k === "name")
      return `<h2 class="wq">Kako se zove <span class="nmg">biznis?</span></h2><input class="lwin" data-lw="name" maxlength="80" autocomplete="off" placeholder="npr. Studio Aura" value="${esc(LW.v.name)}"><div class="whint">Enter za dalje</div>`;
    if (k === "owner")
      return `<h2 class="wq">Ko je <span class="nmg">vlasnik ili menadžer?</span></h2><input class="lwin" data-lw="owner" maxlength="80" autocomplete="off" placeholder="Ime i prezime" value="${esc(LW.v.owner)}"><div class="whint">Možeš preskočiti</div>`;
    if (k === "contact")
      return `<h2 class="wq">Kako ga <span class="nmg">kontaktiramo?</span></h2><div class="lwfs">${LFIELDS.slice(0, 2).map(lwField).join("")}</div>`;
    return `<h2 class="wq">Gde je <span class="nmg">na mrežama?</span></h2><div class="lwfs">${LFIELDS.slice(2).map(lwField).join("")}</div>`;
  }
  function drawLW(back) {
    const st = $("#lstage");
    const old = st.querySelector(".wstep");
    if (old) {
      old.classList.remove("in", "back");
      old.classList.add("out");
      if (back) old.classList.add("back");
      setTimeout(() => old.remove(), 400);
    }
    const el = document.createElement("div");
    el.className = "wstep in" + (back ? " back" : "");
    el.innerHTML = lwHTML(LWSTEPS[LW.step]);
    st.appendChild(el);
    $$("#ldots i").forEach((d, i) => {
      d.classList.toggle("on", i === LW.step);
      d.classList.toggle("done", i < LW.step);
    });
    $("#lback").style.visibility = LW.step === 0 ? "hidden" : "visible";
    updLW();
    setTimeout(
      () => {
        const i = el.querySelector("input");
        i && i.focus({ preventScroll: true });
      },
      reduce ? 0 : 160,
    );
  }
  function updLW() {
    const last = LW.step === LWSTEPS.length - 1;
    const b = $("#lnext");
    b.textContent = last ? "Dodaj lead" : "Dalje";
    const ok = LW.v.name.trim().length > 0;
    b.disabled = !ok;
    b.style.opacity = ok ? 1 : 0.45;
  }
  $("#lstage").addEventListener("input", (e) => {
    const k = e.target.dataset.lw;
    if (k && LW) {
      LW.v[k] = e.target.value;
      updLW();
    }
  });
  $("#lstage").addEventListener("keydown", (e) => {
    if (e.key === "Enter" && LW) {
      e.preventDefault();
      const ins = [...e.target.closest(".wstep").querySelectorAll("input")];
      const i = ins.indexOf(e.target);
      if (i > -1 && i < ins.length - 1) {
        ins[i + 1].focus();
        return;
      }
      lwNext();
    }
  });
  async function lwNext() {
    if (!LW) return;
    if (!LW.v.name.trim()) {
      const i = $("#lstage .wstep.in input");
      if (i) {
        i.classList.remove("shk");
        void i.offsetWidth;
        i.classList.add("shk");
      }
      return;
    }
    if (LW.step < LWSTEPS.length - 1) {
      LW.step++;
      drawLW(false);
      return;
    }
    const b = $("#lnext");
    b.disabled = true;
    b.textContent = "Čuvam…";
    const v = LW.v;
    const data = {
      name: v.name.trim(),
      owner: v.owner.trim(),
      phone: v.phone.trim(),
      email: v.email.trim(),
      instagram: v.instagram.trim(),
      tiktok: v.tiktok.trim(),
      companyWall: v.companyWall.trim(),
      stage: "new",
      stageAt: Date.now(),
      nextStep: "",
      nextDate: "",
      notes: "",
      log: [],
      clientId: "",
      order: Date.now(),
      createdAt: Date.now(),
      createdBy: me ? me.id : null,
    };
    try {
      const id = await api.add("leads", data);
      markFresh(id);
      miniBurst(b, LST[0].c);
      closeLWiz();
      refresh();
      toast(`${data.name} dodat u leadove`);
    } catch (err) {
      toast(errMsg(err));
      b.disabled = false;
      updLW();
    }
  }
  $("#lnext").addEventListener("click", lwNext);
  $("#lback").addEventListener("click", () => {
    if (LW && LW.step > 0) {
      LW.step--;
      drawLW(true);
    }
  });
  $("#lclose").addEventListener("click", closeLWiz);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && LW) closeLWiz();
  });

  /* ---- lead detail ---- */
  let firstLD = true,
    ldCh = "call";
  const ldLead = () => lOf(view.id);
  function ldTrack(l) {
    const t = $("#ldTrack");
    if (!t) return;
    const stage = l.stage || "new",
      won = stage === "closed",
      rej = stage === "rejected",
      idx = LFLOW.indexOf(stage),
      cur = won ? 3 : rej ? -1 : idx;
    if (!t.firstElementChild) {
      t.innerHTML = `<div class="ltk-line"><div class="ltk-rail"><i class="ltk-fill"></i></div>${LFLOW.slice(
        0,
        4,
      )
        .map((id, i) => {
          const s = lstOf(id);
          return `<button type="button" class="ltk-stop" data-lst="${id}" style="--c:${s.c};left:${((i / 3) * 100).toFixed(3)}%"><i>${LIC.check}</i><span>${s.name}</span></button>`;
        })
        .join("")}</div>
      <div class="ltk-out"><button type="button" class="lout win" data-lst="closed">${LIC.check}<span>Closed</span></button><button type="button" class="lout lose" data-lst="rejected">${LIC.x}<span>Rejected</span></button></div>`;
    }
    t.classList.toggle("won", won);
    t.classList.toggle("rej", rej);
    t.dataset.now = lstOf(stage).name;
    t.style.setProperty(
      "--w",
      (won ? 100 : rej ? 0 : (Math.max(0, cur) / 3) * 100).toFixed(2) + "%",
    );
    t.querySelectorAll(".ltk-stop").forEach((b, i) => {
      const on = stage === b.dataset.lst;
      b.classList.toggle("on", on);
      b.classList.toggle("done", won || (!rej && i < cur));
      b.setAttribute("aria-pressed", on);
    });
    t.querySelector(".lout.win").classList.toggle("on", won);
    t.querySelector(".lout.lose").classList.toggle("on", rej);
  }
  function renderLD() {
    if ($("#ld").hidden) return;
    const l = ldLead();
    if (!S.ready) {
      $("#ldBody").innerHTML = '<div class="state">Učitavam…</div>';
      firstLD = true;
      return;
    }
    if (!l) {
      $("#ldBody").innerHTML =
        '<div class="state"><b>Ovaj lead više ne postoji</b><button class="pill" data-go="leads">Nazad na Lead Manager</button></div>';
      firstLD = true;
      return;
    }
    const st = lstOf(l.stage);
    $("#ld").style.setProperty("--lc", st.c);
    if (firstLD || !$("#ldBody .ldhero")) {
      firstLD = false;
      $("#ldBody").innerHTML = `
      <section class="ldhero"><span class="ldav" id="ldAv">${lInit(l)}</span><div class="ldid"><input class="ldname" id="ldName" data-lf="name" maxlength="80" value="${esc(l.name || "")}" aria-label="Naziv biznisa"><label class="ldown">${LIC.user}<input id="ldOwner" data-lf="owner" maxlength="80" placeholder="Vlasnik ili menadžer" value="${esc(l.owner || "")}" aria-label="Vlasnik ili menadžer"></label></div><div id="ldClient"></div></section>
      <section class="ltk" id="ldTrack" aria-label="Faza leada"></section>
      <div class="ldgrid">
        <section class="lbox" style="animation-delay:.16s"><h3>Kontakt</h3><div class="lfs">${LFIELDS.map((f) => `<div class="lf"><span class="ic">${f.ic}</span><input data-lf="${f.k}" type="${f.type}" maxlength="200" placeholder="${esc(f.n)}" value="${esc(l[f.k] || "")}" aria-label="${esc(f.n)}"><a class="lgo" data-lgo="${f.k}" href="${esc(lHref(f.k, l[f.k]))}" ${f.k === "phone" || f.k === "email" ? "" : 'target="_blank" rel="noopener"'} aria-label="Otvori ${esc(f.n)}" ${(l[f.k] || "").trim() ? "" : "hidden"}>${f.k === "phone" ? LIC.phone : f.k === "email" ? LIC.mail : LIC.open}</a></div>`).join("")}</div></section>
        <div class="ldcol">
          <section class="lbox lnextbox" id="ldNextBox" style="animation-delay:.22s"><h3>Sledeći korak<em id="ldDueB" hidden></em></h3><input class="lnin" data-lf="nextStep" maxlength="140" placeholder="npr. Pozvati u utorak oko ponude" value="${esc(l.nextStep || "")}" aria-label="Sledeći korak"><div class="lnd"><input type="date" data-lf="nextDate" value="${esc(l.nextDate || "")}" aria-label="Datum"><div class="lqd">${[
            ["Danas", 0],
            ["Sutra", 1],
            ["Za 3 dana", 3],
            ["Za nedelju", 7],
          ]
            .map(
              ([n, d]) => `<button type="button" data-lqd="${d}">${n}</button>`,
            )
            .join("")}</div></div></section>
          <section class="lbox" style="animation-delay:.28s"><h3>Beleške</h3><textarea class="lnotes" data-lf="notes" placeholder="Sve što treba da zapamtimo o ovom leadu" aria-label="Beleške">${esc(l.notes || "")}</textarea></section>
        </div>
      </div>
      <section class="lbox llog" style="animation-delay:.34s"><h3>Istorija kontakta</h3>
        <div class="lcomp"><div class="lchs" role="group" aria-label="Kanal">${LCH.map((c) => `<button type="button" class="lch" data-lch="${c.id}" aria-pressed="${c.id === ldCh}">${c.ic}${c.n}</button>`).join("")}</div>
        <div class="lcrow"><input id="ldLogNote" maxlength="240" placeholder="Kako je prošlo? Šta je rekao?" aria-label="Beleška o kontaktu"><button class="pill solid" id="ldLogAdd">${LIC.plus}Zapiši kontakt</button></div></div>
        <div class="ltl" id="ldTl"></div>
      </section>
      <button class="cdel" id="ldDel">${LIC.trash}Obriši lead</button>`;
    }
    $("#ldAv").textContent = ((l.name || "?").trim()[0] || "?").toUpperCase();
    ldTrack(l);
    const cl = l.clientId && S.clients.find((c) => c.id === l.clientId);
    $("#ldClient").innerHTML = cl
      ? `<button class="lclient" data-go="cp-${esc(cl.id)}">${logo(cl, "lg-ic")}<span>Otvori klijenta</span></button>`
      : "";
    $$("#ldBody [data-lf]").forEach((i) => {
      if (i === document.activeElement) return;
      const v = l[i.dataset.lf] || "";
      if (i.value !== v) i.value = v;
    });
    $$("#ldBody [data-lgo]").forEach((a) => {
      const k = a.dataset.lgo,
        v = (l[k] || "").trim();
      a.hidden = !v;
      a.href = lHref(k, v);
    });
    ldDue(l);
    const log = [...(l.log || [])].sort((a, b) => (b.at || 0) - (a.at || 0));
    $("#ldTl").innerHTML = log.length
      ? log
          .map((x, i) => {
            const c = LCH.find((y) => y.id === x.ch) || LCH[0];
            const u = TEAM.find((t) => t.id === x.by);
            return `<div class="lev" style="animation-delay:${Math.min(0.4, i * 0.04).toFixed(2)}s"><span class="lei">${c.ic}</span><div class="let"><b>${esc(c.n)}</b>${x.note ? `<p>${esc(x.note)}</p>` : ""}</div><div class="lem">${u ? `<img src="${IMG[u.id]}" alt="${esc(u.name)}" title="${esc(u.name)}">` : ""}<span>${esc(fmtLD.format(new Date(x.at)))}</span><button class="ledel" data-ledel="${esc(String(x.at))}" aria-label="Obriši zapis">${LIC.x}</button></div></div>`;
          })
          .join("")
      : `<div class="lempty">Još nema kontakta. Zapiši prvi poziv ili poruku.</div>`;
  }
  function ldDue(l) {
    const b = $("#ldDueB"),
      box = $("#ldNextBox");
    if (!b) return;
    const over = lOver(l),
      due = lLate(l);
    b.hidden = !due;
    b.textContent = over ? "Kasni" : "Danas";
    box.classList.toggle("due", due && !over);
    box.classList.toggle("over", over);
  }
  const ldSaveT = {};
  function ldSave(k, v) {
    const l = ldLead();
    if (!l) return;
    l[k] = v;
    clearTimeout(ldSaveT[k]);
    ldSaveT[k] = setTimeout(
      async () => {
        try {
          await api.upd("leads", l.id, { [k]: v });
        } catch (err) {
          toast(errMsg(err));
        }
      },
      k === "notes" ? 600 : 250,
    );
    if (k === "name")
      $("#ldAv").textContent = ((v || "?").trim()[0] || "?").toUpperCase();
    if (k === "nextDate") ldDue(l);
    if (LFIELDS.some((f) => f.k === k)) {
      const a = $(`#ldBody [data-lgo="${k}"]`);
      if (a) {
        a.hidden = !v.trim();
        a.href = lHref(k, v);
      }
    }
  }
  $("#ldBody").addEventListener("input", (e) => {
    const k = e.target.dataset.lf;
    if (k && k !== "nextDate") ldSave(k, e.target.value);
  });
  $("#ldBody").addEventListener("change", (e) => {
    const k = e.target.dataset.lf;
    if (k === "nextDate") ldSave(k, e.target.value);
  });
  $("#ldBody").addEventListener("click", async (e) => {
    const l = ldLead();
    if (!l) return;
    const s = e.target.closest("[data-lst]");
    if (s) {
      const stg = s.dataset.lst;
      if (stg === (l.stage || "new")) return;
      s.classList.remove("lbn");
      void s.offsetWidth;
      s.classList.add("lbn");
      const r = s.getBoundingClientRect();
      lmEmbers(
        r.left + r.width / 2,
        r.top + r.height / 2,
        lstOf(stg).c,
        stg === "closed" ? 24 : 12,
      );
      await setLeadStage(l, stg);
      renderLD();
      return;
    }
    const q = e.target.closest("[data-lqd]");
    if (q) {
      const d = new Date();
      d.setDate(d.getDate() + +q.dataset.lqd);
      const v = dstrL(d);
      $('#ldBody [data-lf="nextDate"]').value = v;
      ldSave("nextDate", v);
      q.classList.remove("lbn");
      void q.offsetWidth;
      q.classList.add("lbn");
      return;
    }
    const ch = e.target.closest("[data-lch]");
    if (ch) {
      ldCh = ch.dataset.lch;
      $$("#ldBody [data-lch]").forEach((x) =>
        x.setAttribute("aria-pressed", x === ch),
      );
      $("#ldLogNote").focus();
      return;
    }
    if (e.target.closest("#ldLogAdd")) {
      ldAddLog();
      return;
    }
    const dl = e.target.closest("[data-ledel]");
    if (dl) {
      const at = +dl.dataset.ledel,
        old = l.log || [];
      l.log = old.filter((x) => x.at !== at);
      renderLD();
      try {
        await api.upd("leads", l.id, { log: l.log });
      } catch (err) {
        l.log = old;
        toast(errMsg(err));
        renderLD();
      }
      return;
    }
    if (e.target.closest("#ldDel")) {
      const { id, ...data } = l;
      try {
        await api.del("leads", id);
        if (!DB) S.leads = S.leads.filter((x) => x.id !== id);
        nav("leads");
        toast(`Obrisan: ${l.name}`, async () => {
          try {
            await api.set("leads", id, data);
            refresh();
          } catch (err) {
            toast(errMsg(err));
          }
        });
      } catch (err) {
        toast(errMsg(err));
      }
      return;
    }
  });
  $("#ldBody").addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.id === "ldLogNote") {
      e.preventDefault();
      ldAddLog();
    }
    if (e.key === "Enter" && e.target.classList.contains("ldname")) {
      e.preventDefault();
      e.target.blur();
    }
  });
  async function ldAddLog() {
    const l = ldLead();
    if (!l) return;
    const inp = $("#ldLogNote");
    const note = inp.value.trim();
    const log = [
      ...(l.log || []),
      { ch: ldCh, note, at: Date.now(), by: me ? me.id : null },
    ];
    l.log = log;
    inp.value = "";
    const wasNew = (l.stage || "new") === "new";
    renderLD();
    miniBurst($("#ldLogAdd"), lstOf(wasNew ? "contacted" : l.stage).c);
    try {
      await api.upd("leads", l.id, { log });
      if (wasNew) {
        await setLeadStage(l, "contacted", { quiet: true });
        toast(`${l.name} → Contacted`);
        renderLD();
      }
    } catch (err) {
      toast(errMsg(err));
    }
  }

  /* ---- dashboard card ---- */
  function updLeadCard() {
    const c = $("#lmCard");
    if (!c || !me) return;
    $("#dash .cards").classList.toggle("lukaf", me.id === "luka");
    const n = (S.leads || []).filter(lLate).length;
    const b = $("#lmDue");
    if (b) {
      b.hidden = !n;
      b.textContent = n + (n === 1 ? " follow-up danas" : " follow-upa danas");
    }
  }

  /* ---------------- deep work ---------------- */
  const DW_DUR = 90 * 60 * 1000;
  let DW = null,
    dwTick = null,
    dwRemote = {},
    dwDone = false,
    BR = null,
    brTick = null;
  const BR_DUR = 10 * 60 * 1000;
  const brKey = () => "skeylo-br-" + (me ? me.id : "");
  const brLeft = (b = BR) =>
    b ? Math.max(0, b.dur - (Date.now() - b.start)) : 0;
  const dwBlocking = () => !!BR || (dwDone && !DW);
  const dwKey = () => "skeylo-dw-" + (me ? me.id : "");
  function dwLeft(st = DW) {
    if (!st) return 0;
    const now = Date.now();
    return Math.max(
      0,
      st.dur -
        (now -
          st.start -
          (st.pausedTotal || 0) -
          (st.pausedAt ? now - st.pausedAt : 0)),
    );
  }
  const fmtMS = (ms) => {
    const t = Math.ceil(ms / 1000);
    const m = Math.floor(t / 60),
      s = t % 60;
    return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
  };
  function dwSave() {
    try {
      DW
        ? localStorage.setItem(dwKey(), JSON.stringify(DW))
        : localStorage.removeItem(dwKey());
    } catch (e) {}
    try {
      BR
        ? localStorage.setItem(brKey(), JSON.stringify(BR))
        : localStorage.removeItem(brKey());
    } catch (e) {}
    if (DB && me) {
      const ref = DB.doc("focus/" + me.id);
      (DW
        ? ref.set({ member: me.id, ...DW })
        : BR
          ? ref.set({ member: me.id, brk: BR })
          : ref.delete()
      ).catch(() => {});
    }
  }
  function dwLoad() {
    DW = null;
    dwDone = false;
    BR = null;
    try {
      const v = localStorage.getItem(dwKey());
      if (v) DW = JSON.parse(v);
    } catch (e) {}
    try {
      const v = localStorage.getItem(brKey());
      if (v) BR = JSON.parse(v);
    } catch (e) {}
    if (BR && brLeft() <= 0) BR = null;
    if (DW && dwLeft() <= 0 && !DW.pausedAt) {
      DW = null;
      dwDone = true;
      dwSave();
      dwOpen();
    }
    if (BR) {
      dwSave();
      brLoop();
      dwOpen();
    }
    dwRender();
    dwLoop();
  }
  function brStart() {
    BR = { start: Date.now(), dur: BR_DUR };
    dwDone = false;
    dwSave();
    brLoop();
    $("#dwc").innerHTML = "";
    dwOverlay();
    dwRender();
  }
  function brLoop() {
    clearInterval(brTick);
    if (!BR) return;
    brTick = setInterval(() => {
      if (BR && brLeft() <= 0) {
        clearInterval(brTick);
        BR = null;
        dwSave();
        dwChime();
        $("#dwc").innerHTML = "";
        brOverDone = true;
        dwOverlay();
        dwRender();
        return;
      }
      if (!$("#dwo").hidden) dwOverlay();
      dwRender();
    }, 1000);
  }
  let brOverDone = false;
  function dwStart() {
    DW = { start: Date.now(), dur: DW_DUR, pausedAt: null, pausedTotal: 0 };
    dwDone = false;
    dwSave();
    dwRender();
    dwLoop();
    try {
      navigator.vibrate && navigator.vibrate(15);
    } catch (e) {}
  }
  function dwPause() {
    if (!DW) return;
    if (DW.pausedAt) {
      DW.pausedTotal += Date.now() - DW.pausedAt;
      DW.pausedAt = null;
    } else DW.pausedAt = Date.now();
    dwSave();
    dwRender();
  }
  function dwStop(done) {
    DW = null;
    dwSave();
    dwRender();
    if (done) {
      dwDone = true;
      dwChime();
      dwOpen();
    } else {
      dwClose();
      toast("Deep Work završen");
    }
  }
  function dwLoop() {
    clearInterval(dwTick);
    if (!DW) return;
    dwTick = setInterval(() => {
      if (DW && !DW.pausedAt && dwLeft() <= 0) {
        clearInterval(dwTick);
        dwStop(true);
        return;
      }
      dwRender();
    }, 1000);
  }
  function setRing(el, frac, circ) {
    if (el) el.style.strokeDashoffset = (circ * (1 - frac)).toFixed(2);
  }
  function dwRender() {
    const on = !!DW,
      left = dwLeft(),
      frac = on ? 1 - left / DW.dur : 0,
      paused = on && !!DW.pausedAt;
    const b = $("#dwbtn");
    if (b) {
      b.classList.toggle("on", on);
      b.classList.toggle("paused", paused);
      $("#dwT").hidden = !on;
      $("#dwT").textContent = fmtMS(left);
      $("#dwLbl").hidden = on;
      setRing(b.querySelector(".prg"), on ? 1 - frac : 0, 97.4);
    }
    const p = $("#dwpill");
    const showPill =
      on && me && $("#dash").hidden && $("#dwo").hidden && $("#login").hidden;
    p.classList.toggle("show", !!showPill);
    p.classList.toggle("paused", paused);
    $("#dwpillT").textContent = fmtMS(left);
    setRing(p.querySelector(".prg"), on ? 1 - frac : 0, 97.4);
    if (!$("#dwo").hidden && !BR) dwOverlay();
    $("#dwmin").hidden = dwBlocking() || brOverDone;
    const lock = dwBlocking() && !$("#dwo").hidden;
    $$(".screen").forEach((el) => {
      el.inert = lock;
    });
    $("#dwpill").inert = lock;
    document.title = BR
      ? fmtMS(brLeft()) + " · Odmor"
      : on && !paused
        ? fmtMS(left) + " · Deep Work"
        : "Skeylo OS";
    const mates = Object.values(dwRemote).filter(
      (r) => r.member !== (me && me.id) && dwLeft(r) > 0,
    );
    const mt = $("#dwMates");
    if (mt) {
      const sig = mates.map((m) => m.member).join();
      if (mt.dataset.sig !== sig) {
        mt.dataset.sig = sig;
        mt.innerHTML = mates
          .map((m) =>
            IMG[m.member]
              ? `<img src="${IMG[m.member]}" alt="" title="${esc((TEAM.find((u) => u.id === m.member) || {}).name || "")} je u Deep Work-u">`
              : "",
          )
          .join("");
      }
    }
  }
  function dwOverlay() {
    const c = $("#dwc");
    const she = me && me.id === "nina";
    if (BR) {
      const left = brLeft(),
        circ = 2 * Math.PI * 46,
        frac = 1 - left / BR.dur;
      if (!c.querySelector(".brk")) {
        c.innerHTML = `<div class="dwstart brk"><div class="dwk">Odmor · OS je zaključan</div><div class="dwbig brring"><span class="glow"></span><svg class="r" viewBox="0 0 100 100"><circle class="trk" cx="50" cy="50" r="46"/><circle class="prg" cx="50" cy="50" r="46" stroke-dasharray="${circ.toFixed(2)}"/></svg><div class="dwtime" id="brBig"></div></div>
      <h2 class="brh">Odmori se, <span style="white-space:nowrap">${she ? "zaslužila" : "zaslužio"} si 😌</span></h2>
      <ul class="brl"><li>${SV('<path d="M13 4a2 2 0 1 0 0-.01M10 21l2-6 3 3v3M9 9l3-2 3 3 3 1M8 13l1-4"/>')}Prošetaj</li><li>${SV('<path d="M7 3h10l-1.5 17a1.5 1.5 0 0 1-1.5 1.4h-4.6A1.5 1.5 0 0 1 8 20z"/><path d="M7.5 8h9"/>')}Popij vode</li><li>${SV('<rect x="4" y="3" width="16" height="18" rx="1"/><path d="M4 15h16"/>')}Gledaj u zid</li></ul>
      <p class="brno">${SV('<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M4 4l16 16"/>', 2.2)}Nikako nemoj da skroluješ!</p></div>`;
      }
      $("#brBig").textContent = fmtMS(left);
      setRing(c.querySelector(".brring .prg"), 1 - frac, circ);
      return;
    }
    if (brOverDone && !DW) {
      c.innerHTML = `<div class="dwstart"><div class="dwk">Odmor gotov</div><h2>Spreman${she ? "na" : ""} za <span class="grad">nastavak?</span></h2><p>OS je ponovo otključan.</p><div class="dwacts"><button class="pill" data-dw="close">Nazad na posao</button><button class="pill solid" data-dw="start">Nova Deep Work sesija</button></div></div>`;
      return;
    }
    if (dwDone && !DW) {
      c.innerHTML = `<div class="dwstart"><div class="dwk">Deep Work završen</div><h2>90 minuta <span class="grad">odrađeno</span></h2><p>Rad je pauziran dok ne izabereš šta dalje.</p><div class="dwacts dwchoice"><button class="pill go" data-dw="rest">${SV('<path d="M17 8a5 5 0 0 1 0 10H7A5 5 0 0 1 7 8"/><path d="M7 8V6a5 5 0 0 1 10 0v2"/>')}Aktiviraj Odmor<small>10 min, OS se zaključava</small></button><button class="pill danger solid" data-dw="skip">${SV('<path d="M18 6 6 18M6 6l12 12"/>', 2.4)}Prekini<small>nastavi da radiš odmah</small></button></div></div>`;
      return;
    }
    if (!DW) {
      c.innerHTML = `<div class="dwstart"><div class="dwk">Deep Work</div><h2>90 minuta <span class="grad">fokusa</span></h2><p>Isključi notifikacije, zatvori sve što ne treba i radi jednu stvar.</p><button class="dwgo" data-dw="start">Kreni</button></div>`;
      return;
    }
    const left = dwLeft(),
      frac = 1 - left / DW.dur,
      paused = !!DW.pausedAt,
      circ = 2 * Math.PI * 46;
    if (!c.querySelector(".dwbig")) {
      c.innerHTML = `<div class="dwk">Deep Work</div><div class="dwbig"><span class="glow"></span><svg class="r" viewBox="0 0 100 100"><circle class="trk" cx="50" cy="50" r="46"/><circle class="prg" cx="50" cy="50" r="46" stroke-dasharray="${circ.toFixed(2)}"/></svg><div class="dwtime" id="dwBig"></div><div class="dwsub" id="dwSub"></div></div><div class="dwacts"><button class="pill" data-dw="pause" id="dwPauseBtn"></button><button class="pill danger" data-dw="stop">Završi</button></div>`;
    }
    c.querySelector(".dwbig").classList.toggle("paused", paused);
    $("#dwBig").textContent = fmtMS(left);
    const end = new Date(Date.now() + left);
    $("#dwSub").textContent = paused
      ? "Pauzirano"
      : "do " +
        String(end.getHours()).padStart(2, "0") +
        ":" +
        String(end.getMinutes()).padStart(2, "0");
    $("#dwPauseBtn").textContent = paused ? "Nastavi" : "Pauza";
    setRing(c.querySelector(".dwbig .prg"), 1 - frac, circ);
  }
  function dwOpen() {
    const o = $("#dwo");
    o.hidden = false;
    $("#dwc").innerHTML = "";
    dwOverlay();
    requestAnimationFrame(() => o.classList.add("open"));
    if (dwBlocking()) document.body.style.overflow = "hidden";
    dwRender();
  }
  function dwClose() {
    if (dwBlocking()) return;
    const o = $("#dwo");
    o.classList.remove("open");
    document.body.style.overflow = "";
    setTimeout(
      () => {
        o.hidden = true;
        dwDone = false;
        brOverDone = false;
        dwRender();
      },
      reduce ? 0 : 400,
    );
  }
  function dwChime() {
    try {
      const A = new (window.AudioContext || window.webkitAudioContext)();
      [0, 0.18, 0.36].forEach((d, i) => {
        const o = A.createOscillator(),
          g = A.createGain();
        o.type = "sine";
        o.frequency.value = [660, 880, 1320][i];
        g.gain.setValueAtTime(0, A.currentTime + d);
        g.gain.linearRampToValueAtTime(0.18, A.currentTime + d + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, A.currentTime + d + 1.2);
        o.connect(g).connect(A.destination);
        o.start(A.currentTime + d);
        o.stop(A.currentTime + d + 1.3);
      });
    } catch (e) {}
  }
  $("#dwbtn").onclick = () => dwOpen();
  $("#dwpill").onclick = () => dwOpen();
  $("#dwmin").onclick = () => dwClose();
  $("#dwo").addEventListener("click", (e) => {
    const b = e.target.closest("[data-dw]");
    if (!b) {
      if (e.target.id === "dwo" && !dwBlocking()) dwClose();
      return;
    }
    const a = b.dataset.dw;
    if (a === "rest") {
      brStart();
      return;
    }
    if (a === "skip") {
      dwDone = false;
      dwClose();
      toast("Deep Work završen");
      return;
    }
    if (a === "start") {
      brOverDone = false;
      dwStart();
      $("#dwc").innerHTML = "";
      dwOverlay();
    } else if (a === "pause") dwPause();
    else if (a === "stop") dwStop(false);
    else if (a === "close") dwClose();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !$("#dwo").hidden) dwClose();
  });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) dwRender();
  });
  (async () => {
    let db = null;
    try {
      db =
        window.claude && window.claude.use
          ? await window.claude.use("db")
          : null;
    } catch (e) {}
    if (!db) return;
    db.collection("focus").onSnapshot(
      (snap) => {
        dwRemote = {};
        snap.docs.forEach((d) => {
          dwRemote[d.id] = d.data();
        });
        if (me && dwRemote[me.id] && !DW && !BR) {
          const r = dwRemote[me.id];
          if (r.brk && brLeft(r.brk) > 0) {
            BR = { start: r.brk.start, dur: r.brk.dur };
            brLoop();
            dwOpen();
          } else if (r.dur && (dwLeft(r) > 0 || r.pausedAt)) {
            DW = {
              start: r.start,
              dur: r.dur,
              pausedAt: r.pausedAt || null,
              pausedTotal: r.pausedTotal || 0,
            };
            dwLoop();
          }
        }
        dwRender();
      },
      () => {},
    );
  })();

  /* ---------------- general: Notion-style stranice ---------------- */
  if (window.SKNotes)
    NT = window.SKNotes({
      S,
      api,
      esc,
      SV,
      toast,
      errMsg,
      markFresh,
      refresh,
      applyTheme,
      fmtEdit,
      TEAM,
      IMG,
      nav,
      me: () => me,
      /* natpis za "nazad" i putanju: glavni General ili General projekta */
      spaceLabel: (sp) => {
        const it = sp && S.items.find((i) => i.id === sp);
        return it ? "General · " + it.title : "General";
      },
      assets: () => ASSETS,
      scriptRendered: () => paintCcHl(),
    });
  /* =====================================================================
   FINAL CREATIVES
   Mihajlo prevuče gotove kreative (pun kvalitet) u mesec → klijent ih
   odmah vidi u svom CRM-u (Final Creatives). Filip ostavlja beleške
   Mihajlu, Export / Export All daje originalne fajlove za Ads Manager.
   Kolekcije:
   creatives        {clientId, monthId, title, kind:"video"|"image"|"carousel",
                     files:[{asset | parts:[id…] | url,path, type, name, size, w, h, dur}],
                     poster:{asset | url,path}, order, createdAt, createdBy, updatedAt, v}
   creativeComments {clientId, creativeId, monthId, text, at, slide, author:"client",
                     authorName, authorUid, createdAt, order, resolved}   ← piše klijent (CRM)
   creativeNotes    {clientId, creativeId, monthId, text, at, slide, author:"team",
                     authorId, authorName, createdAt, order, resolved}    ← samo tim
   ===================================================================== */
  const FC_V = /^video\/(mp4|webm|quicktime)$/,
    FC_I = /^image\/(jpeg|png|webp|gif)$/;
  const FC_MAX = 20 * 1024 * 1024,
    FC_PART =
      19 * 1024 * 1024; /* artefakt: do 20 MB po fajlu; veći idu u delovima */
  const CRM_BASE =
    location.origin +
    "/crm"; /* adresa klijentskog CRM-a (klijent može imati svoj: clients.crmUrl) */
  const FC_EXT = {
    "video/mp4": "mp4",
    "video/webm": "webm",
    "video/quicktime": "mov",
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  };
  const IC_FC = SV(
    '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="m10 8.5 5 3.5-5 3.5z" fill="currentColor"/>',
  );
  const IC_FCPLAY =
    '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg>';
  const IC_FCCAR =
    '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="7.5" y="2.5" width="14" height="14" rx="3"/><path d="M3.5 7.5v10a3 3 0 0 0 3 3h10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  const IC_FCDL = SV('<path d="M12 3v12M7 10l5 5 5-5M4 20h16"/>', 2.2);
  const IC_FCUP = SV('<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>', 2);
  let firstFC = true,
    STORE_EXT = null,
    fcHov = null,
    fcQueue = false,
    fcRunOk = 0,
    fcRunErr = 0,
    fcCX = null,
    fcCxOff = false,
    fcSlide = 0,
    fcVP = null,
    fcGo = null,
    fcSending = false,
    fcDelArm = null;
  const FCUP = new Map(),
    FCBL = new Map(),
    FC_NEW = new Set();
  const fcType = (f) => {
    let t = String((f && f.type) || "").toLowerCase();
    if (t === "image/jpg") t = "image/jpeg";
    if (!t || t === "application/octet-stream") {
      const e = String((f && f.name) || "")
        .split(".")
        .pop()
        .toLowerCase();
      t =
        {
          mp4: "video/mp4",
          m4v: "video/mp4",
          webm: "video/webm",
          mov: "video/quicktime",
          jpg: "image/jpeg",
          jpeg: "image/jpeg",
          png: "image/png",
          webp: "image/webp",
          gif: "image/gif",
        }[e] || t;
    }
    return t;
  };
  const fcKind = (c) => {
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
  const fcSrc = (x) => (x ? x.url || (x.asset ? "/_blob/" + x.asset : "") : "");
  const fcPoster = (c) =>
    fcSrc(c.poster) || (fcKind(c) !== "video" ? fcSrc((c.files || [])[0]) : "");
  const fcExtOf = (x) => {
    const n = String((x && x.name) || ""),
      m = n.match(/\.([a-z0-9]{2,5})$/i);
    return m ? m[1].toLowerCase() : FC_EXT[x && x.type] || "bin";
  };
  const fcSafe = (s) =>
    String(s || "")
      .replace(/[\\/:*?"<>|\u0000-\u001f]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 80) || "Kreativa";
  const fcNN = (i) => String(i + 1).padStart(2, "0");
  const fcT = (s) => {
    s = Math.max(0, Math.floor(Number(s) || 0));
    return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
  };
  const fcJe = (n) =>
    n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? "su" : "je";
  const fcWord = (n) =>
    n % 10 === 1 && n % 100 !== 11
      ? "kreativa"
      : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14)
        ? "kreative"
        : "kreativa";
  function creativesOf(mid) {
    return S.creatives
      .filter((c) => c.monthId === mid)
      .sort(
        (a, b) =>
          (a.order || 0) - (b.order || 0) ||
          (a.createdAt || 0) - (b.createdAt || 0),
      );
  }
  function fcOpenCC(cid) {
    return S.creativeComments.filter(
      (x) => x.creativeId === cid && !x.resolved,
    );
  }
  function fcOpenN(cid) {
    return S.creativeNotes.filter((x) => x.creativeId === cid && !x.resolved);
  }
  function fcTitle(name) {
    let t = String(name || "")
      .replace(/\.[a-z0-9]{2,5}$/i, "")
      .replace(/[_]+/g, " ")
      .replace(/\s*-+\s*/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    for (let k = 0; k < 4; k++)
      t = t
        .replace(
          /(^|[\s(\[]+)(final(no)?|finalna|export(ed)?|copy|kopija|v\d{1,2}|\(\d+\)|\d{3,4}x\d{3,4})[)\]]*$/i,
          "",
        )
        .trim();
    return t ? t.charAt(0).toUpperCase() + t.slice(1) : "Kreativa";
  }
  function fcNewId() {
    return DB
      ? DB.collection("creatives").doc().id
      : "cr-" +
          Date.now().toString(36) +
          Math.random().toString(36).slice(2, 7);
  }
  function fcLinkOf(it) {
    const c = S.clients.find((x) => x.id === it.clientId) || {};
    return (
      String(c.crmUrl || CRM_BASE).replace(/#.*$/, "") +
      "#creatives." +
      encodeURIComponent(it.id)
    );
  }

  /* ---------- skladište ----------
   artefakt: assets (do 20 MB po fajlu, veći se čuvaju u delovima) · sajt: SkeyloOS.useStorage({put, remove}) (npr. Firebase Storage) */
  function fcMode() {
    return STORE_EXT ? "ext" : ASSETS ? "assets" : DB ? "none" : "local";
  }
  async function fcUp1(blob, type) {
    try {
      return await ASSETS.upload(blob, { type });
    } catch (e) {
      if (e && e.code === "store_unavailable") {
        await new Promise((r) => setTimeout(r, 1200));
        return await ASSETS.upload(blob, { type });
      }
      throw e;
    }
  }
  async function fcCut(blob, e) {
    /* deo ne sme da počne razmakom ili znakom "<" (skladište bi ga odbilo kao tekst) */
    const b = new Uint8Array(
      await blob.slice(e, Math.min(blob.size, e + 512)).arrayBuffer(),
    );
    let k = 0;
    while (
      k < b.length &&
      (b[k] === 60 ||
        b[k] === 32 ||
        b[k] === 9 ||
        b[k] === 10 ||
        b[k] === 13 ||
        b[k] === 12)
    )
      k++;
    return e + k;
  }
  async function fcPut(blob, type, onP, path) {
    const m = fcMode();
    if (m === "ext") {
      const r = await STORE_EXT.put(blob, {
        type,
        path,
        onProgress: (p) => onP && onP(p),
      });
      onP && onP(1);
      return { url: r.url, path: r.path || path };
    }
    if (m === "assets") {
      const part = window.__FC_PART || FC_PART,
        max = window.__FC_PART ? part : FC_MAX;
      if (blob.size <= max) {
        const r = await fcUp1(blob, type);
        onP && onP(1);
        return { asset: r.id };
      }
      const parts = [];
      let s = 0;
      try {
        while (s < blob.size) {
          let e = Math.min(blob.size, s + part);
          if (e < blob.size) e = await fcCut(blob, e);
          const r = await fcUp1(blob.slice(s, e, type), type);
          parts.push(r.id);
          s = e;
          onP && onP(s / blob.size);
        }
      } catch (err) {
        for (const id of parts) {
          try {
            await ASSETS.delete(id);
          } catch (x) {}
        }
        throw err;
      }
      return { parts };
    }
    if (m === "local") {
      onP && onP(1);
      return { url: URL.createObjectURL(blob) };
    }
    throw { code: "no_store" };
  }
  async function fcDrop(x) {
    /* briše fajl iz skladišta (nepovratno) */
    if (!x) return;
    try {
      if (x.path && STORE_EXT && STORE_EXT.remove)
        await STORE_EXT.remove(x.path);
      else if (ASSETS) {
        if (x.asset) await ASSETS.delete(x.asset);
        if (x.parts)
          for (const p of x.parts) {
            try {
              await ASSETS.delete(p);
            } catch (e) {}
          }
      } else if (x.url && x.url.startsWith("blob:")) URL.revokeObjectURL(x.url);
    } catch (e) {}
  }
  function fcDropAll(c, later) {
    const refs = [...(c.files || []), c.poster].filter(Boolean);
    const go = () => refs.forEach(fcDrop);
    if (later) setTimeout(go, later);
    else go();
  }
  async function fcBlob(x, onP) {
    if (x.parts) {
      const out = [];
      for (let i = 0; i < x.parts.length; i++) {
        const r = await fetch("/_blob/" + x.parts[i]);
        if (!r.ok) throw new Error("fetch");
        out.push(await r.blob());
        onP && onP((i + 1) / x.parts.length);
      }
      return new Blob(out, { type: x.type || "" });
    }
    const r = await fetch(fcSrc(x));
    if (!r.ok) throw new Error("fetch");
    const b = await r.blob();
    onP && onP(1);
    return b;
  }
  async function fcPlayURL(x, onP) {
    /* fajl u delovima: spoji ga za puštanje (čuva poslednja 3) */
    if (!x.parts) return fcSrc(x);
    const k = x.parts.join(",");
    if (FCBL.has(k)) return FCBL.get(k);
    const u = URL.createObjectURL(await fcBlob(x, onP));
    FCBL.set(k, u);
    if (FCBL.size > 3) {
      const [k0, u0] = FCBL.entries().next().value;
      URL.revokeObjectURL(u0);
      FCBL.delete(k0);
    }
    return u;
  }
  function fcErr(e) {
    const c = e && e.code;
    if (c === "too_large") return e.msg || "Fajl je prevelik za ovo skladište.";
    if (c === "unsupported_type")
      return "Ovaj format ne može da se sačuva. Probaj MP4, JPG ili PNG.";
    if (c === "quota_or_state")
      return "Nema više prostora. Obriši stare kreative pa probaj ponovo.";
    if (c === "rate_limited")
      return "Previše otpremanja odjednom. Probaj ponovo za minut.";
    if (c === "no_store" || c === "not_granted" || c === "capability_disabled")
      return "Ovde ne može da se otpremi. Otvori Skeylo OS kao urednik.";
    if (c === "quota_exceeded") return "Baza je puna.";
    return "Otpremanje nije uspelo. Probaj ponovo.";
  }

  /* ---------- podaci o fajlu: dimenzije, trajanje, sličica ---------- */
  function fcFrame(src, w, h, max) {
    max = max || 720;
    const s = Math.min(1, max / Math.max(1, w)),
      cw = Math.max(1, Math.round(w * s)),
      ch = Math.max(1, Math.round(h * s));
    const cv = document.createElement("canvas");
    cv.width = cw;
    cv.height = ch;
    const x = cv.getContext("2d");
    x.imageSmoothingQuality = "high";
    x.drawImage(src, 0, 0, cw, ch);
    return new Promise((res, rej) =>
      cv.toBlob(
        (b) => (b ? res(b) : rej(new Error("toBlob"))),
        "image/jpeg",
        0.86,
      ),
    );
  }
  function fcVideoInfo(file) {
    return new Promise((res) => {
      const v = document.createElement("video");
      v.muted = true;
      v.playsInline = true;
      v.preload = "auto";
      const u = URL.createObjectURL(file);
      let done = false;
      const fin = (o) => {
        if (done) return;
        done = true;
        clearTimeout(tm);
        try {
          v.removeAttribute("src");
          v.load();
        } catch (e) {}
        URL.revokeObjectURL(u);
        res(o);
      };
      const tm = setTimeout(() => fin({}), 20000);
      v.onloadedmetadata = () => {
        const d = isFinite(v.duration) ? v.duration : 0;
        try {
          v.currentTime = Math.min(3, d * 0.3 || 0);
        } catch (e) {
          fin({ w: v.videoWidth, h: v.videoHeight, dur: d });
        }
      };
      v.onseeked = async () => {
        const w = v.videoWidth,
          h = v.videoHeight,
          d = isFinite(v.duration) ? v.duration : 0;
        let poster = null;
        try {
          if (w && h) poster = await fcFrame(v, w, h);
        } catch (e) {}
        fin({ w, h, dur: d, poster });
      };
      v.onerror = () => fin({});
      v.src = u;
    });
  }
  async function fcImageInfo(file) {
    try {
      const bm = await createImageBitmap(file);
      const o = { w: bm.width, h: bm.height };
      try {
        o.thumb = await fcFrame(bm, bm.width, bm.height);
      } catch (e) {}
      if (bm.close) bm.close();
      return o;
    } catch (e) {
      return new Promise((res) => {
        const u = URL.createObjectURL(file),
          im = new Image();
        im.onload = async () => {
          const o = { w: im.naturalWidth, h: im.naturalHeight };
          try {
            o.thumb = await fcFrame(im, o.w, o.h);
          } catch (x) {}
          URL.revokeObjectURL(u);
          res(o);
        };
        im.onerror = () => {
          URL.revokeObjectURL(u);
          res({});
        };
        im.src = u;
      });
    }
  }

  /* ---------- stranica ---------- */
  function renderFC() {
    if ($("#fc").hidden) return;
    const it = S.items.find((i) => i.id === view.id),
      body = $("#fcBody");
    if (!S.ready) {
      $("#fcId").innerHTML = "";
      body.innerHTML = '<div class="state">Učitavam kreative…</div>';
      return;
    }
    if (!it) {
      $("#fcId").innerHTML = "";
      $("#fcActs").hidden = true;
      body.innerHTML =
        '<div class="state"><b>Ovaj mesec ne postoji</b>Možda je obrisan.<button class="pill" data-go="projects">Nazad na projekte</button></div>';
      return;
    }
    const c = S.clients.find((x) => x.id === it.clientId) || {
      id: "",
      name: "",
      color: "#e1802c",
    };
    applyTheme(c.id);
    $("#fcActs").hidden = false;
    const anim = firstFC;
    firstFC = false;
    $("#fcId").style.setProperty("--c", c.color || "#e1802c");
    $("#fcId").innerHTML =
      `${logo(c, "lg-ic")}<div><h1><span class="w"><span>Final Creatives</span></span></h1><div class="sub">${esc(c.name)} · ${esc(it.title)}</div></div>`;
    if (!anim) $("#fcId .w>span").style.animation = "none";
    $("#fcBackLbl").textContent = it.title;
    const L = creativesOf(it.id),
      ups = [...FCUP.values()].filter(
        (u) => u.monthId === it.id && !L.some((x) => x.id === u.id),
      );
    $("#fcAll").disabled = !L.length;
    $("#fcAdd").hidden = !fcCanUp();
    if (!L.length && !ups.length) {
      body.innerHTML = fcCanUp()
        ? `<div class="fcempty" id="fcEmpty" role="button" tabindex="0"><span class="fce-o">${IC_FCUP}</span><b>Prevuci kreative ovde</b><span>ili klikni da ih izabereš</span></div>`
        : `<div class="state"><b>Još nema kreativa</b>Otpremanje je dostupno uredniku Skeylo OS-a.</div>`;
      return;
    }
    const sig =
      L.map((x) =>
        [
          x.id,
          x.title,
          fcPoster(x),
          (x.files || []).length,
          x.v || 1,
          fcOpenCC(x.id).length + fcOpenN(x.id).length,
        ].join("~"),
      ).join("|") +
      "#" +
      ups.map((u) => u.id).join("|");
    const g = body.querySelector(".fcgrid");
    if (g && g.dataset.sig === sig) {
      ups.forEach(fcPaintUp);
      return;
    }
    if (fcHov) {
      fcHover(null);
    }
    body.innerHTML = `<div class="fcgrid${anim ? " enter" : ""}" data-sig="${esc(sig)}">${L.map((x, i) => fcCard(x, i)).join("")}${ups.map((u, k) => fcUpCard(u, L.length + k)).join("")}</div>`;
    ups.forEach(fcPaintUp);
    L.forEach((x) => {
      if (FC_NEW.has(x.id)) {
        FC_NEW.delete(x.id);
        const el = body.querySelector(`.fcc[data-fcid="${CSS.escape(x.id)}"]`);
        if (el) {
          el.classList.add("up", "done");
          el.querySelector(".fcc-f").insertAdjacentHTML(
            "beforeend",
            `<span class="fcc-veil">${fcRing(1)}<svg class="fcc-ok" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg></span>`,
          );
          setTimeout(
            () => {
              el.classList.remove("up", "done");
              const v = el.querySelector(".fcc-veil");
              v && v.remove();
              el.classList.add("land");
              setTimeout(() => el.classList.remove("land"), 1000);
            },
            reduce ? 300 : 1600,
          );
        }
      }
    });
  }
  function fcRing(p) {
    return `<svg class="fcc-ring" viewBox="0 0 64 64" aria-hidden="true"><circle class="t" cx="32" cy="32" r="26"/><circle class="p" cx="32" cy="32" r="26" style="--p:${p || 0}"/></svg>`;
  }
  function fcCard(x, i) {
    const k = fcKind(x),
      p = fcPoster(x),
      f = (x.files || [])[0] || {},
      n = fcOpenCC(x.id).length + fcOpenN(x.id).length;
    return `<article class="fcc" data-fcid="${esc(x.id)}" style="--i:${i}">
    <button class="fcc-f" type="button" data-fc-open="${esc(x.id)}" aria-label="${esc(x.title || "Kreativa")}">${p ? `<img class="fcc-pos" src="${esc(p)}" alt="" decoding="async" loading="lazy">` : `<span class="fcc-none">${IC_FC}</span>`}${k === "video" && !f.parts && fcSrc(f) ? `<video class="fcc-vid" muted loop playsinline preload="none" data-src="${esc(fcSrc(f))}"></video>` : ""}${k !== "image" ? `<span class="fcc-k">${k === "video" ? IC_FCPLAY : IC_FCCAR}</span>` : ""}${n ? `<span class="fcc-cc" title="Otvoreni komentari">${IC.msg}${n}</span>` : ""}</button>
    <div class="fcc-b"><span class="fcc-n">${fcNN(i)}</span><span class="fcc-t">${esc(x.title || "Kreativa")}</span><button class="fcc-dl" type="button" data-fc-export="${esc(x.id)}" aria-label="Export: ${esc(x.title || "Kreativa")}" title="Export">${IC_FCDL}</button></div>
  </article>`;
  }
  function fcUpCard(u, i) {
    return `<article class="fcc up" data-fcup="${esc(u.id)}" style="--i:${i}">
    <div class="fcc-f">${u.thumb ? `<img class="fcc-pos" src="${esc(u.thumb)}" alt="">` : `<span class="fcc-none">${IC_FC}</span>`}${u.kind !== "image" ? `<span class="fcc-k">${u.kind === "video" ? IC_FCPLAY : IC_FCCAR}</span>` : ""}<span class="fcc-veil"></span></div>
    <div class="fcc-b"><span class="fcc-n">${fcNN(i)}</span><span class="fcc-t">${esc(u.title)}</span></div>
  </article>`;
  }
  function fcPaintUp(u) {
    const el = document.querySelector(`.fcc[data-fcup="${CSS.escape(u.id)}"]`);
    if (!el) return;
    const img = el.querySelector(".fcc-pos");
    if (u.thumb && !img) {
      const f = el.querySelector(".fcc-f"),
        none = f.querySelector(".fcc-none");
      if (none) none.remove();
      f.insertAdjacentHTML(
        "afterbegin",
        `<img class="fcc-pos" src="${esc(u.thumb)}" alt="">`,
      );
    }
    const v = el.querySelector(".fcc-veil");
    el.classList.toggle(
      "wait",
      u.state === "queued" || (u.state === "up" && !u.thumb),
    );
    el.classList.toggle(
      "q",
      u.state === "queued" || (u.state === "up" && !(u.prog > 0)),
    );
    el.classList.toggle("err", u.state === "err");
    el.classList.toggle("done", u.state === "done");
    if (u.state === "err") {
      if (!v.querySelector(".fcc-e"))
        v.innerHTML = `<div class="fcc-e"><b>Nije otpremljeno</b><span>${esc(u.err || "")}</span><div><button type="button" data-fcup-retry="${esc(u.id)}">Ponovo</button><button type="button" data-fcup-x="${esc(u.id)}">Ukloni</button></div></div>`;
      return;
    }
    if (!v.querySelector(".fcc-ring"))
      v.innerHTML =
        fcRing(u.prog) +
        `<svg class="fcc-ok" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>`;
    const p = v.querySelector(".fcc-ring .p");
    if (p)
      p.style.setProperty(
        "--p",
        u.state === "done" ? 1 : Math.max(0.02, u.prog || 0),
      );
  }
  function fcCanUp() {
    const m = fcMode();
    return m === "ext" || m === "assets" || m === "local";
  }
  /* pregled videa na prelazak mišem */
  function fcHover(card) {
    if (fcHov === card) return;
    if (fcHov) {
      const v = fcHov.querySelector(".fcc-vid");
      if (v) v.pause();
      fcHov.classList.remove("playing");
    }
    fcHov = card;
    if (!card) return;
    const v = card.querySelector(".fcc-vid");
    if (!v) return;
    if (!v.getAttribute("src") && v.dataset.src) v.src = v.dataset.src;
    v.onplaying = () => {
      if (fcHov === card) card.classList.add("playing");
    };
    const p = v.play();
    if (p && p.catch) p.catch(() => {});
  }

  /* ---------- ubacivanje ---------- */
  function fcAsk(n) {
    return new Promise((res) => {
      const a = $("#fcAsk");
      $("#fcAskT").textContent =
        `${n} ${n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? "slike" : "slika"}`;
      a.hidden = false;
      requestAnimationFrame(() => a.classList.add("on"));
      setTimeout(() => a.querySelector("[data-ask=carousel]").focus(), 60);
      const done = (v) => {
        a.classList.remove("on");
        setTimeout(
          () => {
            a.hidden = true;
          },
          reduce ? 0 : 250,
        );
        a.onclick = null;
        document.removeEventListener("keydown", key, true);
        res(v);
      };
      const key = (e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
          done(null);
        }
      };
      document.addEventListener("keydown", key, true);
      a.onclick = (e) => {
        const b = e.target.closest("[data-ask]");
        if (b) {
          done(b.dataset.ask === "cancel" ? null : b.dataset.ask);
          return;
        }
        if (e.target === a) done(null);
      };
    });
  }
  async function fcIngest(list, mid, from) {
    const it = S.items.find((i) => i.id === mid);
    if (!it) return;
    if (!fcCanUp()) {
      toast(fcErr({ code: "no_store" }));
      return;
    }
    const nat = (a, b) =>
      a.name.localeCompare(b.name, undefined, {
        numeric: true,
        sensitivity: "base",
      });
    const files = [...list].filter((f) => f && f.size > 0),
      vids = [],
      imgs = [],
      bad = [];
    for (const f of files) {
      const t = fcType(f);
      if (FC_V.test(t)) {
        if (t === "video/quicktime" && fcMode() === "assets")
          bad.push([f, "mov"]);
        else vids.push(f);
      } else if (FC_I.test(t)) imgs.push(f);
      else bad.push([f, "type"]);
    }
    if (bad.length) {
      const mov = bad.find((b) => b[1] === "mov");
      toast(
        mov
          ? `„${mov[0].name}“ izvezi kao MP4 (H.264) pa ga ubaci ponovo`
          : bad.length === 1
            ? `„${bad[0][0].name}“ nije video ni slika (MP4, WebM, JPG, PNG, WebP, GIF)`
            : `${bad.length} fajla preskočena (MP4, WebM, JPG, PNG, WebP, GIF)`,
      );
    }
    if (!vids.length && !imgs.length) return;
    vids.sort(nat);
    imgs.sort(nat);
    const groups = [];
    if (imgs.length > 1) {
      const ch = await fcAsk(imgs.length);
      if (!ch) {
        if (!vids.length) return;
      } else if (ch === "carousel")
        groups.push({ kind: "carousel", files: imgs });
      else imgs.forEach((f) => groups.push({ kind: "image", files: [f] }));
    } else if (imgs.length) groups.push({ kind: "image", files: imgs });
    vids.forEach((f) => groups.push({ kind: "video", files: [f] }));
    if (!groups.length) return;
    const L = creativesOf(mid),
      base = Math.max(Date.now(), ...L.map((x) => (x.order || 0) + 1));
    const made = groups.map((g, i) => {
      const id = fcNewId(),
        u = {
          id,
          monthId: mid,
          clientId: it.clientId,
          kind: g.kind,
          files: g.files,
          title:
            g.kind === "carousel"
              ? fcCarTitle(g.files)
              : fcTitle(g.files[0].name),
          order: base + i,
          prog: 0,
          state: "queued",
          thumb: g.kind !== "video" ? URL.createObjectURL(g.files[0]) : null,
        };
      FCUP.set(id, u);
      return u;
    });
    if (fcMode() === "local")
      toast("Probni režim: kreative se ne čuvaju posle osvežavanja");
    renderFC();
    fcFly(made, from);
    fcRun();
  }
  function fcCarTitle(files) {
    const t = files.map((f) => fcTitle(f.name));
    let p = t[0] || "";
    for (const s of t) while (p && !s.startsWith(p)) p = p.slice(0, -1);
    p = p.replace(/[\s\d.,:;–-]+$/, "").trim();
    return p.length > 2 ? p : "Karusel";
  }
  async function fcRun() {
    if (fcQueue) return;
    fcQueue = true;
    fcRunOk = 0;
    fcRunErr = 0;
    try {
      let u;
      while ((u = [...FCUP.values()].find((x) => x.state === "queued"))) {
        if (await fcProcess(u)) fcRunOk++;
        else fcRunErr++;
      }
    } finally {
      fcQueue = false;
    }
    const ok = fcRunOk,
      er = fcRunErr;
    if (ok && !er) {
      if (!$("#fc").hidden)
        setTimeout(
          () => {
            if (!fcQueue) fcCelebrate(ok);
          },
          reduce ? 0 : 1100,
        );
      else toast(`${ok} ${fcWord(ok)} ${fcJe(ok)} u CRM-u`);
    } else if (ok && er)
      toast(`${ok} ${fcWord(ok)} ${fcJe(ok)} u CRM-u, ${er} nije otpremljeno`);
  }
  async function fcProcess(u) {
    u.state = "up";
    u.prog = 0;
    fcPaintUp(u);
    const done = [];
    try {
      const metas = [];
      if (u.kind === "video") {
        const m = await fcVideoInfo(u.files[0]);
        metas.push(m);
        if (m.poster) {
          u.thumb = URL.createObjectURL(m.poster);
          fcPaintUp(u);
        }
      } else for (const f of u.files) metas.push(await fcImageInfo(f));
      const pb =
          u.kind === "video" ? metas[0].poster : metas[0] && metas[0].thumb,
        total = u.files.reduce((a, f) => a + f.size, 0) + (pb ? pb.size : 0);
      let at = 0;
      const base = `creatives/${u.clientId}/${u.monthId}/${u.id}/`,
        files = [];
      for (let i = 0; i < u.files.length; i++) {
        const f = u.files[i],
          t = fcType(f),
          m = metas[i] || {};
        const ref = await fcPut(
          f,
          t,
          (p) => {
            u.prog = Math.min(0.98, (at + p * f.size) / total);
            fcPaintUp(u);
          },
          base + fcNN(i) + "." + fcExtOf({ name: f.name, type: t }),
        );
        done.push(ref);
        at += f.size;
        files.push(
          Object.assign(
            {},
            ref,
            { type: t, name: f.name, size: f.size },
            m.w ? { w: m.w, h: m.h } : {},
            m.dur ? { dur: Math.round(m.dur * 10) / 10 } : {},
          ),
        );
      }
      let poster = null;
      if (pb) {
        const ref = await fcPut(pb, "image/jpeg", null, base + "poster.jpg");
        done.push(ref);
        poster = Object.assign({}, ref, { w: metas[0].w, h: metas[0].h });
      }
      FC_NEW.add(u.id);
      setTimeout(() => FC_NEW.delete(u.id), 6000);
      u.state = "done";
      u.prog = 1;
      fcPaintUp(u);
      try {
        await api.set("creatives", u.id, {
          clientId: u.clientId,
          monthId: u.monthId,
          title: u.title,
          kind: u.kind,
          files,
          poster,
          order: u.order,
          createdAt: Date.now(),
          createdBy: me ? me.id : null,
          v: 1,
        });
      } catch (e) {
        FC_NEW.delete(u.id);
        throw e;
      }
      fcPaintUp(u);
      setTimeout(
        () => {
          FCUP.delete(u.id);
          if (u.thumb && u.thumb.startsWith("blob:") && fcMode() !== "local")
            setTimeout(() => URL.revokeObjectURL(u.thumb), 4000);
          renderFC();
        },
        reduce ? 200 : 1500,
      );
      return true;
    } catch (e) {
      done.forEach(fcDrop);
      u.state = "err";
      u.err = fcErr(e);
      fcPaintUp(u);
      return false;
    }
  }
  /* kartice doleću sa mesta gde su fajlovi pušteni */
  function fcFly(list, from) {
    if (reduce || !from) return;
    requestAnimationFrame(() =>
      list.forEach((u, k) => {
        const el = document.querySelector(
          `.fcc[data-fcup="${CSS.escape(u.id)}"]`,
        );
        if (!el) return;
        const r = el.getBoundingClientRect();
        const dx = from.x - (r.left + r.width / 2),
          dy = from.y - (r.top + r.height / 2);
        el.animate(
          [
            {
              transform: `translate(${dx}px,${dy}px) scale(.12) rotate(${k % 2 ? 8 : -8}deg)`,
              opacity: 0,
            },
            { opacity: 1, offset: 0.25 },
            { transform: "none", opacity: 1 },
          ],
          {
            duration: 900,
            delay: k * 90,
            easing: "cubic-bezier(.2,.9,.25,1.12)",
            fill: "backwards",
          },
        );
      }),
    );
  }
  /* Bravo — kad se sve otpremi */
  function fcCelebrate(n) {
    const y = $("#fcYay");
    $("#fcYayName").textContent = ((me && me.name) || "") + ".";
    $("#fcYaySub").textContent =
      fcMode() === "local"
        ? `${n} ${fcWord(n)} u probnom režimu`
        : n === 1
          ? "Kreativa je u CRM-u. Klijent je već vidi."
          : `${n} ${fcWord(n)} ${fcJe(n)} u CRM-u. Klijent ih već vidi.`;
    y.hidden = false;
    y.classList.remove("out");
    y.querySelectorAll(".fy-t span,.fy-s,.fy-l").forEach((e) => {
      e.style.animation = "none";
      void e.offsetWidth;
      e.style.animation = "";
    });
    if (!reduce) fcSparks($("#fcYayCv"));
    clearTimeout(fcCelebrate.t);
    fcCelebrate.t = setTimeout(
      () => {
        y.classList.add("out");
        setTimeout(() => {
          y.hidden = true;
        }, 700);
      },
      reduce ? 1800 : 2900,
    );
  }
  function fcSparks(cv) {
    const W = (cv.width = innerWidth * (devicePixelRatio > 1 ? 1.5 : 1)),
      H = (cv.height = innerHeight * (devicePixelRatio > 1 ? 1.5 : 1)),
      x = cv.getContext("2d");
    const cs = getComputedStyle(document.documentElement),
      cols = [
        cs.getPropertyValue("--orange").trim() || "#e1802c",
        cs.getPropertyValue("--gold").trim() || "#f3b04c",
        "#ffffff",
      ];
    const P = [];
    for (let i = 0; i < 150; i++) {
      const a = Math.random() * Math.PI * 2,
        s = (4 + Math.random() * 13) * (W / 1400 + 0.4);
      P.push({
        x: W / 2,
        y: H * 0.48,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s - 3,
        l: 1,
        d: 0.006 + Math.random() * 0.012,
        r: 1 + Math.random() * 2.6,
        c: cols[i % 3],
        t: Math.random() < 0.35,
      });
    }
    const t0 = performance.now();
    const step = (t) => {
      x.clearRect(0, 0, W, H);
      let alive = 0;
      for (const p of P) {
        if (p.l <= 0) continue;
        alive++;
        p.vx *= 0.985;
        p.vy = p.vy * 0.985 + 0.16;
        p.x += p.vx;
        p.y += p.vy;
        p.l -= p.d;
        x.globalAlpha = Math.max(0, p.l);
        x.fillStyle = p.c;
        if (p.t) {
          x.save();
          x.translate(p.x, p.y);
          x.rotate(Math.atan2(p.vy, p.vx));
          x.fillRect(-p.r * 3, -p.r * 0.45, p.r * 6, p.r * 0.9);
          x.restore();
        } else {
          x.beginPath();
          x.arc(p.x, p.y, p.r, 0, 7);
          x.fill();
        }
      }
      if (alive && t - t0 < 3200) requestAnimationFrame(step);
      else x.clearRect(0, 0, W, H);
    };
    requestAnimationFrame(step);
  }

  /* ---------- prevlačenje fajlova iz računara (portal) ---------- */
  (function () {
    const P = $("#fcPortal"),
      O = $("#fcPo");
    let depth = 0,
      on = false,
      hideT = 0;
    for (let k = 0; k < 14; k++) {
      const i = document.createElement("i");
      i.className = "fcp-p";
      i.style.setProperty(
        "--a",
        ((k * 360) / 14 + Math.random() * 12).toFixed(1) + "deg",
      );
      i.style.setProperty("--k", k);
      O.appendChild(i);
    }
    const hasFiles = (e) => {
      const t = e.dataTransfer && e.dataTransfer.types;
      return !!t && [...t].includes("Files");
    };
    const onFC = () => !$("#fc").hidden && view.name === "fc";
    const active = () =>
      onFC() &&
      fcCanUp() &&
      S.ready &&
      S.items.some((i) => i.id === view.id) &&
      (!view.cid || !!fcvCur);
    const show = () => {
      if (on) return;
      on = true;
      clearTimeout(hideT);
      P.querySelector(".fcp-t").textContent = view.cid
        ? "Nova verzija."
        : "Pusti.";
      P.hidden = false;
      P.classList.remove("drop");
      requestAnimationFrame(() => P.classList.add("on"));
    };
    const hide = () => {
      if (!on) return;
      on = false;
      P.classList.remove("on");
      hideT = setTimeout(() => {
        P.hidden = true;
      }, 300);
    };
    addEventListener("dragenter", (e) => {
      if (!hasFiles(e) || !active()) return;
      e.preventDefault();
      depth++;
      show();
    });
    addEventListener("dragover", (e) => {
      if (!hasFiles(e) || !onFC()) return;
      e.preventDefault();
      if (!active()) {
        if (e.dataTransfer) e.dataTransfer.dropEffect = "none";
        return;
      }
      if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
      O.style.setProperty(
        "--px",
        ((e.clientX - innerWidth / 2) * 0.06).toFixed(1) + "px",
      );
      O.style.setProperty(
        "--py",
        ((e.clientY - innerHeight / 2) * 0.06).toFixed(1) + "px",
      );
      if (!on) show();
    });
    addEventListener("dragleave", (e) => {
      if (!on) return;
      depth = Math.max(0, depth - 1);
      if (depth === 0 || (e.clientX <= 0 && e.clientY <= 0)) hide();
    });
    addEventListener("drop", (e) => {
      if (!hasFiles(e) || !onFC()) return;
      e.preventDefault();
      depth = 0;
      if (!active()) {
        hide();
        return;
      }
      const files = [...(e.dataTransfer.files || [])],
        pt = { x: e.clientX, y: e.clientY };
      if (on && !reduce) {
        P.classList.add("drop");
        const f = $("#fcFlash");
        f.style.left = pt.x + "px";
        f.style.top = pt.y + "px";
        f.classList.remove("go");
        void f.offsetWidth;
        f.classList.add("go");
        on = false;
        hideT = setTimeout(() => {
          P.hidden = true;
          P.classList.remove("on", "drop");
        }, 700);
      } else hide();
      if (view.cid) {
        const c = S.creatives.find((x) => x.id === fcvCur);
        if (c) fcReplace(c, files);
        return;
      }
      fcIngest(files, view.id, pt);
    });
  })();

  /* ---------- pregled jedne kreative ---------- */
  const fcv = $("#fcv"),
    fcvMedia = $("#fcvMedia"),
    fcvScroll = $("#fcvScroll");
  let fcvCur = null,
    fcvTok = 0,
    fcvSig = "";
  function fcSyncViewer() {
    if (view.name !== "fc" || !view.cid) {
      fcCloseViewer();
      return;
    }
    if (!S.ready) return;
    const c = S.creatives.find(
      (x) => x.id === view.cid && x.monthId === view.id,
    );
    if (!c) {
      fcCloseViewer();
      if (!FCUP.has(view.cid)) nav("fc-" + view.id);
      return;
    }
    if (fcvCur !== c.id) fcOpenViewer(c);
    else fcUpdViewer(c);
  }
  function fcOpenViewer(c) {
    const tok = ++fcvTok,
      first = fcv.hidden;
    fcvCur = c.id;
    fcCX = null;
    fcCxOff = false;
    fcSlide = 0;
    fcDelArm = null;
    fcv.hidden = false;
    document.documentElement.classList.add("fcv-open");
    if (first) {
      fcv.classList.remove("on");
      requestAnimationFrame(() => {
        if (tok === fcvTok) fcv.classList.add("on");
      });
    }
    fcvMedia.dataset.sig = "";
    fcUpdViewer(c, true);
    if (first)
      setTimeout(() => {
        if (
          tok === fcvTok &&
          !fcv.hidden &&
          !fcv.contains(document.activeElement)
        )
          $("#fcvIn").focus({ preventScroll: true });
      }, 60);
    $("#fcvIn").scrollTop = 0;
    fcvScroll.scrollTop = 0;
  }
  function fcCloseViewer() {
    if (fcv.hidden) return;
    ++fcvTok;
    fcStop();
    fcv.classList.remove("on");
    fcv.hidden = true;
    fcvMedia.innerHTML = "";
    fcvMedia.dataset.sig = "";
    fcvCur = null;
    fcvSig = "";
    document.documentElement.classList.remove("fcv-open");
  }
  function fcUpdViewer(c, first) {
    const L = creativesOf(c.monthId),
      i = L.findIndex((x) => x.id === c.id);
    ["#fcvPrev", "#fcvPrevM"].forEach((s) => ($(s).disabled = i <= 0));
    ["#fcvNext", "#fcvNextM"].forEach(
      (s) => ($(s).disabled = i < 0 || i >= L.length - 1),
    );
    const ti = $("#fcvTitle");
    if (document.activeElement !== ti) ti.value = c.title || "";
    const f = (c.files || [])[0] || {},
      k = fcKind(c),
      who = TEAM.find((t) => t.id === c.createdBy);
    const sz = (c.files || []).reduce((a, x) => a + (x.size || 0), 0);
    $("#fcvMeta").innerHTML = [
      `${fcNN(i)} / ${String(L.length).padStart(2, "0")}`,
      k === "video"
        ? `${f.w && f.h ? `${f.w}×${f.h}` : "Video"}${f.dur ? ` · ${fcT(f.dur)}` : ""}`
        : k === "carousel"
          ? `${(c.files || []).length} slajdova`
          : f.w
            ? `${f.w}×${f.h}`
            : "Slika",
      sz ? fcSize(sz) : "",
      who ? who.name : "",
    ]
      .filter(Boolean)
      .map(esc)
      .join("<i></i>");
    const sig =
      (c.files || [])
        .map((x) => fcSrc(x) || (x.parts || []).join(","))
        .join("|") +
      "#" +
      fcSrc(c.poster);
    if (fcvMedia.dataset.sig !== sig) {
      fcvMedia.dataset.sig = sig;
      fcStop();
      fcFit(c);
      fcvMedia.innerHTML = fcMediaHTML(c);
      fcInitMedia(c);
      fcAmb(fcPoster(c));
    }
    fcRenderSide(c, first);
  }
  const fcSize = (b) =>
    b >= 1073741824
      ? (b / 1073741824).toFixed(1).replace(".", ",") + " GB"
      : b >= 1048576
        ? Math.round(b / 1048576) + " MB"
        : Math.max(1, Math.round(b / 1024)) + " KB";
  function fcFit(c) {
    const f = (c.files || [])[0] || {},
      ar = f.w && f.h ? f.w / f.h : fcKind(c) === "video" ? 9 / 16 : 4 / 5,
      st = $("#fcvStage"),
      cs = getComputedStyle(st);
    const wide = matchMedia("(min-width:861px)").matches,
      aw =
        st.clientWidth -
        parseFloat(cs.paddingLeft) -
        parseFloat(cs.paddingRight);
    const ah = wide
      ? st.clientHeight -
        parseFloat(cs.paddingTop) -
        parseFloat(cs.paddingBottom)
      : Math.min(innerHeight * 0.72, 780);
    let w = aw,
      h = w / ar;
    if (h > ah) {
      h = ah;
      w = h * ar;
    }
    fcvMedia.style.width = Math.max(120, Math.floor(w)) + "px";
    fcvMedia.style.height = Math.max(120, Math.floor(h)) + "px";
    fcvMedia.dataset.ar = ar;
  }
  addEventListener("resize", () => {
    if (!fcv.hidden && fcvCur) {
      const c = S.creatives.find((x) => x.id === fcvCur);
      if (c) fcFit(c);
    }
  });
  let fcAmbTok = 0;
  function fcAmb(src) {
    const cv = $("#fcvAmb"),
      tok = ++fcAmbTok;
    if (!src) {
      cv.hidden = true;
      return;
    }
    const im = new Image();
    im.onload = () => {
      if (tok !== fcAmbTok) return;
      try {
        const r = im.naturalWidth / im.naturalHeight || 1,
          s = document.createElement("canvas");
        s.width = 8;
        s.height = Math.max(6, Math.round(8 / r));
        s.getContext("2d").drawImage(im, 0, 0, s.width, s.height);
        cv.width = 64;
        cv.height = Math.max(40, Math.round(64 / r));
        const x = cv.getContext("2d");
        x.imageSmoothingQuality = "high";
        x.drawImage(s, 0, 0, cv.width, cv.height);
        cv.hidden = false;
      } catch (e) {
        cv.hidden = true;
      }
    };
    im.onerror = () => {
      if (tok === fcAmbTok) cv.hidden = true;
    };
    im.src = src;
  }
  const FC_I_PL =
      '<svg class="i-pl" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg>',
    FC_I_PA =
      '<svg class="i-pa" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6.5" y="5" width="4" height="14" rx="1.2"/><rect x="13.5" y="5" width="4" height="14" rx="1.2"/></svg>';
  const FC_I_VO = SV(
      '<path d="M11 5 6 9H3v6h3l5 4z" fill="currentColor"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/>',
    ).replace("<svg ", '<svg class="i-vo" '),
    FC_I_MU = SV(
      '<path d="M11 5 6 9H3v6h3l5 4z" fill="currentColor"/><path d="m16 9 6 6M22 9l-6 6"/>',
    ).replace("<svg ", '<svg class="i-mu" ');
  const fcChev = (d) =>
    SV(
      d < 0 ? '<path d="M15 18l-6-6 6-6"/>' : '<path d="M9 18l6-6-6-6"/>',
      2.4,
    );
  function fcMediaHTML(c) {
    const k = fcKind(c),
      fs = c.files || [],
      f = fs[0] || {};
    if (k === "video")
      return `<div class="fvp"><video playsinline loop preload="auto"${c.poster ? ` poster="${esc(fcSrc(c.poster))}"` : ""}${f.parts ? "" : ` src="${esc(fcSrc(f))}"`}></video>
    <button class="fvp-big" type="button" data-fvp="play" aria-label="Pusti">${FC_I_PL.replace(' class="i-pl"', "")}</button>
    <div class="fvp-ctl"><button type="button" data-fvp="play" aria-label="Pusti ili pauziraj">${FC_I_PL}${FC_I_PA}</button><div class="fvp-s"><i class="fvp-fill"></i><span class="fvp-mk"></span><i class="fvp-kn"></i></div><span class="fvp-tm"><b class="fvp-c">0:00</b> / <span class="fvp-d">${f.dur ? fcT(f.dur) : "0:00"}</span></span><button type="button" data-fvp="mute" aria-label="Zvuk">${FC_I_VO}${FC_I_MU}</button></div>
    ${f.parts ? `<div class="fcv-load">${fcRing(0)}</div>` : ""}</div>`;
    if (k === "carousel")
      return `<div class="fcs"><div class="fcs-t">${fs.map((x, i) => `<img src="${esc(fcSrc(x))}" alt="Slajd ${i + 1}" draggable="false"${i > 1 ? ' loading="lazy"' : ""}>`).join("")}</div><button class="fcs-a p" type="button" data-fcs="-1" aria-label="Prethodni slajd">${fcChev(-1)}</button><button class="fcs-a n" type="button" data-fcs="1" aria-label="Sledeći slajd">${fcChev(1)}</button><div class="fcs-d">${fs.map((x, i) => `<i${i ? "" : ' class="on"'}></i>`).join("")}</div></div>`;
    return `<img src="${esc(fcSrc(f))}" alt="${esc(c.title || "Kreativa")}" draggable="false">`;
  }
  function fcInitMedia(c) {
    fcVP = null;
    fcGo = null;
    const tok = fcvTok;
    const v = fcvMedia.querySelector("video");
    if (v) {
      const root = fcvMedia.querySelector(".fvp");
      fcVP = { v, root, raf: 0 };
      fcWireVP(fcVP);
      const f = (c.files || [])[0] || {};
      if (f.parts) {
        const ld = root.querySelector(".fcv-load .p");
        fcPlayURL(f, (p) => {
          if (ld) ld.style.setProperty("--p", p);
        })
          .then((u) => {
            if (tok !== fcvTok || !fcVP || fcVP.v !== v) return;
            v.src = u;
            const l = root.querySelector(".fcv-load");
            l && l.remove();
            fcPlay();
          })
          .catch(() => {
            const l = root.querySelector(".fcv-load");
            if (l)
              l.innerHTML =
                '<span style="color:#fff">Video nije dostupan</span>';
          });
      } else fcPlay();
    }
    const cs = fcvMedia.querySelector(".fcs");
    if (cs) fcWireCS(cs);
  }
  function fcWireVP(P) {
    const { v, root } = P,
      fill = root.querySelector(".fvp-fill"),
      kn = root.querySelector(".fvp-kn"),
      ct = root.querySelector(".fvp-c"),
      dt = root.querySelector(".fvp-d"),
      sc = root.querySelector(".fvp-s");
    const upd = () => {
      const d = v.duration || 0,
        t = v.currentTime || 0,
        p = d ? Math.min(1, t / d) : 0;
      fill.style.transform = `scaleX(${p})`;
      kn.style.left = p * 100 + "%";
      ct.textContent = fcT(t);
      if (d && isFinite(d)) dt.textContent = fcT(d);
    };
    const loop = () => {
      upd();
      if (!v.paused && fcVP === P) P.raf = requestAnimationFrame(loop);
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
      fcMarks();
    });
    v.addEventListener("volumechange", () =>
      root.classList.toggle("muted", v.muted),
    );
    v.addEventListener("click", () => fcToggle());
    let drag = false;
    const at = (e) => {
      const r = sc.getBoundingClientRect(),
        p = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
      if (v.duration) {
        v.currentTime = p * v.duration;
        upd();
      }
    };
    sc.addEventListener("pointerdown", (e) => {
      drag = true;
      try {
        sc.setPointerCapture(e.pointerId);
      } catch (x) {}
      root.classList.add("scrub");
      at(e);
    });
    sc.addEventListener("pointermove", (e) => {
      if (drag) at(e);
    });
    const end = () => {
      drag = false;
      root.classList.remove("scrub");
    };
    sc.addEventListener("pointerup", end);
    sc.addEventListener("pointercancel", end);
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
  function fcPlay() {
    if (!fcVP) return;
    const v = fcVP.v;
    v.muted = false;
    const p = v.play();
    if (p && p.catch)
      p.catch(() => {
        if (fcVP && fcVP.v === v) {
          v.muted = true;
          const q = v.play();
          if (q && q.catch) q.catch(() => {});
        }
      });
  }
  function fcStop() {
    if (fcVP) {
      try {
        fcVP.v.pause();
      } catch (e) {}
      cancelAnimationFrame(fcVP.raf);
    }
    fcVP = null;
  }
  function fcToggle() {
    if (!fcVP) return;
    const v = fcVP.v;
    if (v.paused) {
      const p = v.play();
      if (p && p.catch) p.catch(() => {});
    } else v.pause();
  }
  function fcMarks() {
    if (!fcVP || !fcvCur) return;
    const box = fcVP.root.querySelector(".fvp-mk"),
      d = fcVP.v.duration;
    if (!box) return;
    if (!d || !isFinite(d)) {
      box.innerHTML = "";
      return;
    }
    const m = (L, c) =>
      L.filter((x) => x.at != null)
        .map(
          (x) =>
            `<i class="${c}" style="left:${Math.min(100, (x.at / d) * 100).toFixed(2)}%"></i>`,
        )
        .join("");
    box.innerHTML = m(fcOpenCC(fcvCur), "c") + m(fcOpenN(fcvCur), "n");
  }
  function fcWireCS(cs) {
    const tr = cs.querySelector(".fcs-t"),
      n = cs.querySelectorAll(".fcs-t img").length,
      dots = [...cs.querySelectorAll(".fcs-d i")];
    const go = (i) => {
      fcSlide = Math.max(0, Math.min(n - 1, i));
      tr.style.transform = `translateX(${-fcSlide * 100}%)`;
      dots.forEach((d, k) => d.classList.toggle("on", k === fcSlide));
      cs.classList.toggle("first", fcSlide === 0);
      cs.classList.toggle("last", fcSlide === n - 1);
      if (fcCX && fcCX.slide != null) {
        fcCX = { slide: fcSlide };
        fcSyncForm();
      }
    };
    fcGo = go;
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
        tr.style.transform = `translateX(calc(${-fcSlide * 100}% + ${dx}px))`;
    });
    const up = () => {
      if (x0 == null) return;
      tr.style.transition = "";
      x0 = null;
      if (lock === "x" && dx < -w * 0.16) go(fcSlide + 1);
      else if (lock === "x" && dx > w * 0.16) go(fcSlide - 1);
      else go(fcSlide);
    };
    cs.addEventListener("pointerup", up);
    cs.addEventListener("pointercancel", up);
    cs.addEventListener("pointerleave", up);
  }
  /* desna strana: komentari klijenta + beleške tima */
  function fcRenderSide(c, first) {
    const cc = S.creativeComments
      .filter((x) => x.creativeId === c.id)
      .sort(
        (a, b) =>
          (a.resolved ? 1 : 0) - (b.resolved ? 1 : 0) ||
          (b.createdAt || 0) - (a.createdAt || 0),
      );
    const nn = S.creativeNotes
      .filter((x) => x.creativeId === c.id)
      .sort(
        (a, b) =>
          (a.resolved ? 1 : 0) - (b.resolved ? 1 : 0) ||
          (b.createdAt || 0) - (a.createdAt || 0),
      );
    const sig =
      c.id +
      "|" +
      cc.map((x) => x.id + (x.resolved ? 1 : 0) + x.text).join(",") +
      "|" +
      nn.map((x) => x.id + (x.resolved ? 1 : 0) + x.text).join(",");
    const keep = fcvScroll.querySelector(".fcform textarea"),
      val = keep ? keep.value : "",
      foc = keep && document.activeElement === keep;
    if (!first && sig === fcvSig) {
      fcMarks();
      return;
    }
    fcvSig = sig;
    const occ = cc.filter((x) => !x.resolved).length,
      onn = nn.filter((x) => !x.resolved).length;
    const ph =
      me && me.id === "mihajlo" ? "Beleška za tim…" : "Komentar za Mihajla…";
    fcvScroll.innerHTML =
      (cc.length
        ? `<section><h4 class="fcv-h">Klijent${occ ? `<b>${occ}</b>` : ""}</h4><ol class="fcl">${cc.map((x) => fcNoteHTML(x, "client")).join("")}</ol></section>`
        : "") +
      `<section><h4 class="fcv-h">Tim${onn ? `<b>${onn}</b>` : ""}</h4>
      <div class="fcform" data-fcform><textarea rows="1" maxlength="2000" placeholder="${ph}" aria-label="${ph}"></textarea><div class="fcf-b"><span class="fcchip" data-fccx hidden></span><button class="pill solid" type="button" data-fcsend disabled>Pošalji</button></div></div>
      ${nn.length ? `<ol class="fcl" style="margin-top:12px">${nn.map((x) => fcNoteHTML(x, "team")).join("")}</ol>` : ""}</section>`;
    const ta = fcvScroll.querySelector(".fcform textarea");
    if (val) {
      ta.value = val;
      fcGrow(ta);
    }
    if (foc) ta.focus();
    fcSyncForm();
    fcMarks();
  }
  function fcNoteHTML(x, src) {
    const u = src === "team" ? TEAM.find((t) => t.id === x.authorId) : null,
      mine = src === "team" && me && x.authorId === me.id;
    const chip =
      x.at != null
        ? `<button type="button" class="fcchip" data-fcseek="${Number(x.at)}">${IC_FCPLAY}${fcT(x.at)}</button>`
        : x.slide != null
          ? `<button type="button" class="fcchip" data-fcslide="${Number(x.slide)}">Slajd ${Number(x.slide) + 1}</button>`
          : "";
    const who =
      src === "team"
        ? `${u ? `<img src="${IMG[u.id]}" alt="">` : ""}<span class="who">${esc(x.authorName || (u && u.name) || "Tim")}</span>`
        : `<span class="cl">${esc((x.authorName || "K").charAt(0).toUpperCase())}</span><span class="who">${esc(x.authorName || "Klijent")}</span>`;
    const nw = FC_NEW.has(x.id);
    if (nw) FC_NEW.delete(x.id);
    return `<li class="fcn${x.resolved ? " res" : ""}${nw ? " new" : ""}" data-fcn="${esc(x.id)}" data-src="${src}"><div class="fcn-h">${who}<span class="ago">${ccAgo(x.createdAt)}</span></div><p class="fcn-x">${esc(x.text)}</p><div class="fcn-f">${chip}${mine && !x.resolved ? `<button type="button" class="fcn-del" data-fcndel="${esc(x.id)}" aria-label="Obriši belešku">${SV('<path d="M4 7h16M10 11v6M14 11v6M5 7l1 13h12l1-13M9 7V4h6v3"/>')}</button>` : ""}<button type="button" class="fcn-ok" data-fcres="${esc(x.id)}" aria-pressed="${x.resolved ? "true" : "false"}">${CC_CHECK}${x.resolved ? "Rešeno" : "Reši"}</button></div></li>`;
  }
  function fcGrow(ta) {
    ta.style.height = "auto";
    ta.style.height = Math.min(200, ta.scrollHeight) + "px";
  }
  function fcSyncForm() {
    const f = fcvScroll.querySelector("[data-fcform]");
    if (!f) return;
    const ta = f.querySelector("textarea"),
      chip = f.querySelector("[data-fccx]");
    const lbl = fcCX
      ? fcCX.at != null
        ? "u " + fcT(fcCX.at)
        : fcCX.slide != null
          ? `Slajd ${fcCX.slide + 1}`
          : ""
      : "";
    chip.hidden = !lbl;
    if (lbl)
      chip.innerHTML = `${esc(lbl)}<button type="button" data-fccxx aria-label="Bez vremena">${SV('<path d="M18 6 6 18M6 6l12 12"/>', 2.6)}</button>`;
    f.querySelector("[data-fcsend]").disabled = !ta.value.trim() || fcSending;
  }
  function fcCapture() {
    if (fcCxOff || fcCX || !fcvCur) return;
    const c = S.creatives.find((x) => x.id === fcvCur);
    if (!c) return;
    const k = fcKind(c);
    if (k === "video" && fcVP) {
      fcVP.v.pause();
      fcCX = { at: Math.round(fcVP.v.currentTime * 10) / 10 };
    } else if (k === "carousel") fcCX = { slide: fcSlide || 0 };
    fcSyncForm();
  }
  async function fcSendNote() {
    const c = S.creatives.find((x) => x.id === fcvCur),
      f = fcvScroll.querySelector("[data-fcform]");
    if (!c || !f || fcSending) return;
    const ta = f.querySelector("textarea"),
      text = ta.value.trim();
    if (!text) return;
    const x = fcCX,
      now = Date.now();
    fcSending = true;
    ta.value = "";
    fcGrow(ta);
    fcCX = null;
    fcCxOff = false;
    fcSyncForm();
    try {
      const id = await api.add("creativeNotes", {
        clientId: c.clientId,
        creativeId: c.id,
        monthId: c.monthId,
        text: text.slice(0, 2000),
        at: x && x.at != null ? x.at : null,
        slide: x && x.slide != null ? x.slide : null,
        author: "team",
        authorId: me ? me.id : null,
        authorName: me ? me.name : "Tim",
        createdAt: now,
        order: now,
        resolved: false,
      });
      FC_NEW.add(id);
      setTimeout(() => FC_NEW.delete(id), 2500);
      fcKnownN && fcKnownN.add(id);
      toast("Beleška je poslata");
      if (!DB) fcRenderSide(c, true);
    } catch (e) {
      ta.value = text;
      fcGrow(ta);
      fcCX = x;
      toast(errMsg(e));
    } finally {
      fcSending = false;
      fcSyncForm();
    }
  }
  async function fcResolve(id, src) {
    const col = src === "client" ? "creativeComments" : "creativeNotes",
      x = S[col].find((y) => y.id === id);
    if (!x) return;
    const v = !x.resolved;
    try {
      await api.upd(col, id, { resolved: v });
      const c = S.creatives.find((y) => y.id === fcvCur);
      if (c) fcRenderSide(c, true);
      renderFC();
      if (v)
        toast(
          src === "client" ? "Rešeno. Klijent to vidi u CRM-u." : "Rešeno",
          async () => {
            try {
              await api.upd(col, id, { resolved: false });
              const c2 = S.creatives.find((y) => y.id === fcvCur);
              if (c2) fcRenderSide(c2, true);
              renderFC();
            } catch (e) {}
          },
        );
    } catch (e) {
      toast(errMsg(e));
    }
  }
  async function fcDelNote(id) {
    const x = S.creativeNotes.find((y) => y.id === id);
    if (!x) return;
    const { id: _, ...copy } = x;
    try {
      await api.del("creativeNotes", id);
      if (!DB) S.creativeNotes = S.creativeNotes.filter((y) => y.id !== id);
      const c = S.creatives.find((y) => y.id === fcvCur);
      if (c) fcRenderSide(c, true);
      toast("Beleška je obrisana", async () => {
        try {
          await api.set("creativeNotes", id, copy);
          const c2 = S.creatives.find((y) => y.id === fcvCur);
          if (c2) fcRenderSide(c2, true);
        } catch (e) {}
      });
    } catch (e) {
      toast(errMsg(e));
    }
  }
  function fcStep(d) {
    if (view.name !== "fc" || !view.cid) return false;
    const L = creativesOf(view.id),
      i = L.findIndex((x) => x.id === view.cid),
      n = L[i + d];
    if (i < 0 || !n) return false;
    nav(`fc-${view.id}.${n.id}`);
    return true;
  }
  async function fcRename() {
    const c = S.creatives.find((x) => x.id === fcvCur),
      ti = $("#fcvTitle");
    if (!c) return;
    const t = ti.value.trim().slice(0, 90);
    if (!t) {
      ti.value = c.title || "";
      return;
    }
    if (t === c.title) return;
    try {
      await api.upd("creatives", c.id, { title: t, updatedAt: Date.now() });
      renderFC();
    } catch (e) {
      ti.value = c.title || "";
      toast(errMsg(e));
    }
  }
  /* zamena: nova verzija istog posla (komentari ostaju) */
  async function fcReplace(c, list) {
    if (!fcCanUp()) {
      toast(fcErr({ code: "no_store" }));
      return;
    }
    const nat = (a, b) =>
      a.name.localeCompare(b.name, undefined, {
        numeric: true,
        sensitivity: "base",
      });
    const fs = [...list].filter((f) => f && f.size > 0),
      vids = fs.filter((f) => FC_V.test(fcType(f))),
      imgs = fs.filter((f) => FC_I.test(fcType(f))).sort(nat);
    if (
      vids.some((f) => fcType(f) === "video/quicktime") &&
      fcMode() === "assets"
    ) {
      toast("MOV izvezi kao MP4 (H.264) pa ga ubaci ponovo");
      return;
    }
    let kind, files;
    if (vids.length === 1 && !imgs.length) {
      kind = "video";
      files = vids;
    } else if (!vids.length && imgs.length === 1) {
      kind = "image";
      files = imgs;
    } else if (!vids.length && imgs.length > 1) {
      kind = "carousel";
      files = imgs;
    } else {
      toast("Izaberi jedan video, jednu sliku ili slike za karusel");
      return;
    }
    const box = document.createElement("div");
    box.className = "fcv-up";
    box.innerHTML = fcRing(0);
    fcvMedia.appendChild(box);
    const ring = box.querySelector(".p");
    const done = [];
    try {
      const metas = [];
      if (kind === "video") metas.push(await fcVideoInfo(files[0]));
      else for (const f of files) metas.push(await fcImageInfo(f));
      const pb =
          kind === "video" ? metas[0].poster : metas[0] && metas[0].thumb,
        total = files.reduce((a, f) => a + f.size, 0) + (pb ? pb.size : 0);
      let at = 0;
      const v = (c.v || 1) + 1,
        base = `creatives/${c.clientId}/${c.monthId}/${c.id}/v${v}-`,
        out = [];
      for (let i = 0; i < files.length; i++) {
        const f = files[i],
          t = fcType(f),
          m = metas[i] || {};
        const ref = await fcPut(
          f,
          t,
          (p) =>
            ring &&
            ring.style.setProperty(
              "--p",
              Math.min(0.98, (at + p * f.size) / total),
            ),
          base + fcNN(i) + "." + fcExtOf({ name: f.name, type: t }),
        );
        done.push(ref);
        at += f.size;
        out.push(
          Object.assign(
            {},
            ref,
            { type: t, name: f.name, size: f.size },
            m.w ? { w: m.w, h: m.h } : {},
            m.dur ? { dur: Math.round(m.dur * 10) / 10 } : {},
          ),
        );
      }
      let poster = null;
      if (pb) {
        const ref = await fcPut(pb, "image/jpeg", null, base + "poster.jpg");
        done.push(ref);
        poster = Object.assign({}, ref, { w: metas[0].w, h: metas[0].h });
      }
      const old = {
          kind: fcKind(c),
          files: c.files,
          poster: c.poster || null,
          v: c.v || 1,
        },
        neu = { files: out, poster };
      let undone = false;
      await api.upd("creatives", c.id, {
        kind,
        files: out,
        poster,
        updatedAt: Date.now(),
        v,
      });
      box.remove();
      renderFC();
      toast("Nova verzija je u CRM-u", async () => {
        undone = true;
        try {
          await api.upd(
            "creatives",
            c.id,
            Object.assign({}, old, { updatedAt: Date.now() }),
          );
          fcDropAll(neu, 4000);
          renderFC();
        } catch (e) {
          toast(errMsg(e));
        }
      });
      setTimeout(() => {
        if (!undone) fcDropAll(old);
      }, 20000);
    } catch (e) {
      done.forEach(fcDrop);
      box.remove();
      toast(fcErr(e));
    }
  }
  async function fcDelete(c) {
    const { id, ...copy } = JSON.parse(JSON.stringify(c));
    const cms = S.creativeComments
        .filter((x) => x.creativeId === id)
        .map((x) => JSON.parse(JSON.stringify(x))),
      nts = S.creativeNotes
        .filter((x) => x.creativeId === id)
        .map((x) => JSON.parse(JSON.stringify(x)));
    let undone = false;
    try {
      if (view.cid === id) nav("fc-" + c.monthId);
      await api.del("creatives", id);
      for (const x of cms) {
        try {
          await api.del("creativeComments", x.id);
        } catch (e) {}
      }
      for (const x of nts) {
        try {
          await api.del("creativeNotes", x.id);
        } catch (e) {}
      }
      if (!DB) {
        S.creatives = S.creatives.filter((x) => x.id !== id);
        S.creativeComments = S.creativeComments.filter(
          (x) => x.creativeId !== id,
        );
        S.creativeNotes = S.creativeNotes.filter((x) => x.creativeId !== id);
      }
      renderFC();
      toast(`Obrisano: ${c.title || "Kreativa"}`, async () => {
        undone = true;
        cms.forEach((x) => fcKnownC && fcKnownC.add(x.id));
        nts.forEach((x) => fcKnownN && fcKnownN.add(x.id));
        try {
          await api.set("creatives", id, copy);
          for (const x of cms) {
            const { id: k, ...d } = x;
            await api.set("creativeComments", k, d);
          }
          for (const x of nts) {
            const { id: k, ...d } = x;
            await api.set("creativeNotes", k, d);
          }
          renderFC();
        } catch (e) {
          toast(errMsg(e));
        }
      });
      setTimeout(() => {
        if (!undone && !S.creatives.some((x) => x.id === id)) fcDropAll(copy);
      }, 9000);
    } catch (e) {
      toast(errMsg(e));
      renderFC();
    }
  }

  /* ---------- Export ---------- */
  const CRC_T = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c >>> 0;
    }
    return t;
  })();
  async function fcCrc(b, onP) {
    let c = 0xffffffff;
    const step = 4194304;
    for (let i = 0; i < b.size; i += step) {
      const u = new Uint8Array(await b.slice(i, i + step).arrayBuffer());
      for (let j = 0; j < u.length; j++)
        c = CRC_T[(c ^ u[j]) & 255] ^ (c >>> 8);
      onP && onP(Math.min(1, (i + step) / b.size));
    }
    return (c ^ 0xffffffff) >>> 0;
  }
  async function fcZip(entries, onP) {
    /* ZIP bez kompresije (video i slike su već kompresovani) */
    const enc = new TextEncoder(),
      parts = [],
      cen = [],
      d = new Date();
    let off = 0;
    const tm =
        ((d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1)) &
        65535,
      dt =
        (((d.getFullYear() - 1980) << 9) |
          ((d.getMonth() + 1) << 5) |
          d.getDate()) &
        65535;
    for (let i = 0; i < entries.length; i++) {
      const e = entries[i],
        nm = enc.encode(e.name),
        sz = e.blob.size,
        crc = await fcCrc(e.blob, (p) => onP && onP((i + p) / entries.length));
      if (off + sz > 4e9) throw { code: "zip_big" };
      const h = new DataView(new ArrayBuffer(30));
      [
        [0, 0x04034b50, 4],
        [4, 20, 2],
        [6, 0x0800, 2],
        [8, 0, 2],
        [10, tm, 2],
        [12, dt, 2],
        [14, crc, 4],
        [18, sz, 4],
        [22, sz, 4],
        [26, nm.length, 2],
        [28, 0, 2],
      ].forEach(([o, v, n]) =>
        n === 4 ? h.setUint32(o, v >>> 0, true) : h.setUint16(o, v, true),
      );
      const c = new DataView(new ArrayBuffer(46));
      [
        [0, 0x02014b50, 4],
        [4, 20, 2],
        [6, 20, 2],
        [8, 0x0800, 2],
        [10, 0, 2],
        [12, tm, 2],
        [14, dt, 2],
        [16, crc, 4],
        [20, sz, 4],
        [24, sz, 4],
        [28, nm.length, 2],
        [30, 0, 2],
        [32, 0, 2],
        [34, 0, 2],
        [36, 0, 2],
        [38, 0, 4],
        [42, off, 4],
      ].forEach(([o, v, n]) =>
        n === 4 ? c.setUint32(o, v >>> 0, true) : c.setUint16(o, v, true),
      );
      parts.push(h.buffer, nm, e.blob);
      cen.push(c.buffer, nm);
      off += 30 + nm.length + sz;
    }
    const cs = cen.reduce((a, b) => a + b.byteLength, 0),
      end = new DataView(new ArrayBuffer(22));
    end.setUint32(0, 0x06054b50, true);
    end.setUint16(8, entries.length, true);
    end.setUint16(10, entries.length, true);
    end.setUint32(12, cs, true);
    end.setUint32(16, off, true);
    return new Blob([...parts, ...cen, end.buffer], {
      type: "application/zip",
    });
  }
  async function fcSave(name, blob) {
    let dl = null;
    try {
      dl =
        window.claude && window.claude.use
          ? await window.claude.use("downloads")
          : null;
    } catch (e) {
      dl = null;
    }
    if (dl) {
      try {
        await dl.save({ filename: name, data: blob });
        return true;
      } catch (e) {
        const c = e && e.code;
        if (c === "declined") return false;
        if (c === "rate_limited") {
          toast("Sačekaj trenutak pa probaj ponovo");
          return false;
        }
        if (c === "rejected_extension" || c === "extension_not_enabled") {
          toast("Ovaj format ne može da se preuzme ovde");
          return false;
        }
        if (
          c !== "unavailable" &&
          c !== "not_granted" &&
          c !== "capability_disabled" &&
          c !== "capability_removed"
        ) {
          toast("Preuzimanje nije uspelo");
          return false;
        }
      }
    }
    const a = document.createElement("a"),
      u = URL.createObjectURL(blob);
    a.href = u;
    a.download = name;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(u);
      a.remove();
    }, 6000);
    return true;
  }
  function fcEntries(c, prefix) {
    const fs = c.files || [];
    if (fcKind(c) === "carousel" || fs.length > 1)
      return fs.map((x, i) => ({
        x,
        name: `${prefix}/${fcNN(i)}.${fcExtOf(x)}`,
      }));
    return fs.slice(0, 1).map((x) => ({ x, name: `${prefix}.${fcExtOf(x)}` }));
  }
  async function fcExport(c, btn) {
    if (!c || (btn && btn.classList.contains("busy"))) return;
    btn && btn.classList.add("busy");
    try {
      const L = creativesOf(c.monthId),
        i = L.findIndex((x) => x.id === c.id),
        title = fcSafe(c.title),
        fs = c.files || [];
      if (fcKind(c) === "carousel" || fs.length > 1) {
        const list = [];
        for (const e of fcEntries(c, title))
          list.push({ name: e.name.split("/").pop(), blob: await fcBlob(e.x) });
        await fcSave(
          `${i >= 0 ? fcNN(i) + " " : ""}${title}.zip`,
          await fcZip(list),
        );
      } else if (fs[0])
        await fcSave(`${title}.${fcExtOf(fs[0])}`, await fcBlob(fs[0]));
    } catch (e) {
      toast(
        e && e.code === "zip_big"
          ? "Prevelika arhiva (preko 4 GB)"
          : "Fajl nije dostupan za preuzimanje",
      );
    } finally {
      btn && btn.classList.remove("busy");
    }
  }
  async function fcExportAll() {
    const it = S.items.find((i) => i.id === view.id),
      b = $("#fcAll"),
      lbl = $("#fcAllLbl");
    if (!it || b.classList.contains("busy")) return;
    const L = creativesOf(it.id);
    if (!L.length) return;
    const cl = S.clients.find((x) => x.id === it.clientId) || { name: "" },
      yr =
        it.type === "month" && it.year && !/\d{4}/.test(it.title || "")
          ? " " + it.year
          : "";
    const name = fcSafe(`${cl.name} – ${it.title}${yr}`);
    b.classList.add("busy");
    const set = (p, t) => {
      b.style.setProperty("--p", p);
      lbl.textContent = t;
    };
    try {
      const ents = [];
      L.forEach((c, i) =>
        fcEntries(c, `${fcNN(i)} ${fcSafe(c.title)}`).forEach((e) =>
          ents.push(e),
        ),
      );
      const list = [];
      for (let k = 0; k < ents.length; k++) {
        set((k / ents.length) * 0.6, `Preuzimam ${k + 1}/${ents.length}`);
        list.push({ name: ents[k].name, blob: await fcBlob(ents[k].x) });
      }
      set(0.6, "Pakujem…");
      const zip = await fcZip(list, (p) =>
        set(0.6 + p * 0.4, `Pakujem ${Math.round(p * 100)}%`),
      );
      set(1, "Spremno");
      await fcSave(name + ".zip", zip);
    } catch (e) {
      toast(
        e && e.code === "zip_big"
          ? "Prevelika arhiva (preko 4 GB). Preuzmi kreative pojedinačno."
          : "Export nije uspeo. Probaj ponovo.",
      );
    } finally {
      b.classList.remove("busy");
      b.style.removeProperty("--p");
      lbl.textContent = "Export All";
    }
  }

  /* ---------- link za klijenta ---------- */
  async function fcCopyLink() {
    const it = S.items.find((i) => i.id === view.id);
    if (!it) return;
    const url = fcLinkOf(it);
    let ok = false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
        ok = true;
      }
    } catch (e) {}
    if (!ok) {
      try {
        const t = document.createElement("textarea");
        t.value = url;
        t.setAttribute("readonly", "");
        t.style.cssText = "position:fixed;left:-9999px;top:0";
        document.body.appendChild(t);
        t.select();
        ok = document.execCommand("copy");
        t.remove();
      } catch (e) {}
    }
    const old = $("#fcActs .fclink");
    if (old) old.remove();
    if (ok) {
      toast("Link za klijenta je kopiran");
      return;
    }
    const p = document.createElement("div");
    p.className = "fclink";
    p.innerHTML = `<input readonly value="${esc(url)}" aria-label="Link za klijenta">`;
    $("#fcActs").appendChild(p);
    const inp = p.querySelector("input");
    inp.focus();
    inp.select();
    setTimeout(
      () =>
        document.addEventListener("pointerdown", function f(e) {
          if (!p.contains(e.target)) {
            p.remove();
            document.removeEventListener("pointerdown", f);
          }
        }),
      0,
    );
  }

  /* ---------- obaveštenja ---------- */
  let fcKnownC = null,
    fcKnownN = null;
  function onCreativeComments() {
    const ids = new Set(S.creativeComments.map((x) => x.id));
    if (fcKnownC && me) {
      const add = S.creativeComments.filter(
        (x) => !fcKnownC.has(x.id) && x.author === "client" && !x.resolved,
      );
      add.forEach((x) => {
        FC_NEW.add(x.id);
        setTimeout(() => FC_NEW.delete(x.id), 8000);
      });
      const show = add.filter(
        (x) => !(view.name === "fc" && view.cid === x.creativeId),
      );
      if (show.length) {
        const x = show[0],
          c = S.creatives.find((y) => y.id === x.creativeId);
        toast(
          show.length > 1
            ? `${show.length} nova komentara klijenta na kreative`
            : `Klijent · ${(c && c.title) || "Kreativa"}: „${String(x.text || "").slice(0, 42)}${String(x.text || "").length > 42 ? "…" : ""}“`,
          () => nav(`fc-${x.monthId}.${x.creativeId}`),
          "Otvori",
        );
      }
    }
    fcKnownC = ids;
    fcRefreshUI();
  }
  function onCreativeNotes() {
    const ids = new Set(S.creativeNotes.map((x) => x.id));
    if (fcKnownN && me) {
      const add = S.creativeNotes.filter(
        (x) => !fcKnownN.has(x.id) && x.authorId !== me.id && !x.resolved,
      );
      add.forEach((x) => {
        FC_NEW.add(x.id);
        setTimeout(() => FC_NEW.delete(x.id), 8000);
      });
      const show = add.filter(
        (x) => !(view.name === "fc" && view.cid === x.creativeId),
      );
      if (show.length) {
        const x = show[0],
          c = S.creatives.find((y) => y.id === x.creativeId);
        toast(
          `${x.authorName || "Tim"} · ${(c && c.title) || "Kreativa"}: „${String(x.text || "").slice(0, 42)}${String(x.text || "").length > 42 ? "…" : ""}“`,
          () => nav(`fc-${x.monthId}.${x.creativeId}`),
          "Otvori",
        );
      }
    }
    fcKnownN = ids;
    fcRefreshUI();
  }
  function fcRefreshUI() {
    if (!$("#fc").hidden) {
      renderFC();
      fcSyncViewer();
    }
    if (!$("#mh").hidden) renderMH();
  }

  /* kartica u mesecu */
  function creativesCard(it, c, anim, delay) {
    const L = creativesOf(it.id),
      n = L.reduce(
        (a, x) => a + fcOpenCC(x.id).length + fcOpenN(x.id).length,
        0,
      ),
      th = L.slice(-3).map(fcPoster).filter(Boolean).reverse();
    return `<button class="mod" data-go="fc-${esc(it.id)}" style="--c:${esc(c.color || "#e1802c")};${anim ? `animation-delay:${delay}s` : "animation:none"}">
    <div class="mod-l"><div class="mod-top"><span class="mi">${IC_FC}</span><span class="arrow" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span></div><div><h2>Final<br>Creatives</h2><div class="tot"><b>${L.length}</b>${fcWord(L.length)}</div>${n ? `<div class="mh-cc">${IC.msg}<span>${n} ${ccWord(n)}</span></div>` : ""}</div></div>
    ${th.length ? `<span class="mh-fc" aria-hidden="true">${th.map((s, i) => `<img src="${esc(s)}" alt="" style="--k:${i}">`).join("")}</span>` : ""}
  </button>`;
  }

  /* ---------- događaji ---------- */
  $("#fcBack").onclick = () => nav("m-" + view.id);
  $("#fcAdd").onclick = () => $("#fcFile").click();
  $("#fcAll").onclick = () => fcExportAll();
  $("#fcLink").onclick = () => fcCopyLink();
  $("#fcFile").addEventListener("change", (e) => {
    const fs = [...e.target.files];
    e.target.value = "";
    if (fs.length) {
      const r = $("#fcAdd").getBoundingClientRect();
      fcIngest(fs, view.id, {
        x: r.left + r.width / 2,
        y: r.top + r.height / 2,
      });
    }
  });
  $("#fcRep").addEventListener("change", (e) => {
    const fs = [...e.target.files];
    e.target.value = "";
    const c = S.creatives.find((x) => x.id === fcvCur);
    if (fs.length && c) fcReplace(c, fs);
  });
  $("#fcBody").addEventListener("click", (e) => {
    const em = e.target.closest("#fcEmpty");
    if (em) {
      $("#fcFile").click();
      return;
    }
    const ex = e.target.closest("[data-fc-export]");
    if (ex) {
      fcExport(
        S.creatives.find((x) => x.id === ex.dataset.fcExport),
        ex,
      );
      return;
    }
    const op = e.target.closest("[data-fc-open]");
    if (op) {
      nav(`fc-${view.id}.${op.dataset.fcOpen}`);
      return;
    }
    const rt = e.target.closest("[data-fcup-retry]");
    if (rt) {
      const u = FCUP.get(rt.dataset.fcupRetry);
      if (u) {
        u.state = "queued";
        u.err = null;
        u.prog = 0;
        renderFC();
        fcRun();
      }
      return;
    }
    const rx = e.target.closest("[data-fcup-x]");
    if (rx) {
      const u = FCUP.get(rx.dataset.fcupX);
      if (u) {
        FCUP.delete(u.id);
        renderFC();
      }
      return;
    }
  });
  $("#fcBody").addEventListener("keydown", (e) => {
    if ((e.key === "Enter" || e.key === " ") && e.target.id === "fcEmpty") {
      e.preventDefault();
      $("#fcFile").click();
    }
  });
  if (fine) {
    $("#fcBody").addEventListener("pointerover", (e) => {
      const c = e.target.closest(".fcc:not(.up)");
      fcHover(c);
    });
    $("#fcBody").addEventListener("pointerleave", () => fcHover(null));
    $("#fcBody").addEventListener(
      "pointermove",
      (e) => {
        const f = e.target.closest(".fcc-f");
        if (!f) return;
        const r = f.getBoundingClientRect();
        f.parentNode.style.setProperty(
          "--mx",
          (e.clientX - r.left).toFixed(0) + "px",
        );
        f.parentNode.style.setProperty(
          "--my",
          (e.clientY - r.top).toFixed(0) + "px",
        );
        f.style.setProperty("--mx", (e.clientX - r.left).toFixed(0) + "px");
        f.style.setProperty("--my", (e.clientY - r.top).toFixed(0) + "px");
      },
      { passive: true },
    );
  }
  fcv.addEventListener("click", (e) => {
    if (e.target.id === "fcvStage" && matchMedia("(min-width:861px)").matches) {
      nav("fc-" + view.id);
      return;
    }
    const b = e.target.closest("button");
    if (!b) return;
    if (b.id === "fcvX") {
      nav("fc-" + view.id);
      return;
    }
    if (b.id === "fcvPrev" || b.id === "fcvPrevM") {
      fcStep(-1);
      return;
    }
    if (b.id === "fcvNext" || b.id === "fcvNextM") {
      fcStep(1);
      return;
    }
    const c = S.creatives.find((x) => x.id === fcvCur);
    if (b.dataset.fvp === "play") {
      fcToggle();
      return;
    }
    if (b.dataset.fvp === "mute") {
      if (fcVP) fcVP.v.muted = !fcVP.v.muted;
      return;
    }
    if (b.dataset.fcs) {
      if (fcGo) fcGo(fcSlide + Number(b.dataset.fcs));
      return;
    }
    if (b.dataset.fcseek != null) {
      if (fcVP) {
        fcVP.v.currentTime = Math.max(0, Number(b.dataset.fcseek));
        fcVP.v.pause();
        fcVP.root.classList.add("awake");
      }
      if (!matchMedia("(min-width:861px)").matches)
        fcvMedia.scrollIntoView({
          block: "center",
          behavior: reduce ? "auto" : "smooth",
        });
      return;
    }
    if (b.dataset.fcslide != null) {
      if (fcGo) fcGo(Number(b.dataset.fcslide));
      if (!matchMedia("(min-width:861px)").matches)
        fcvMedia.scrollIntoView({
          block: "center",
          behavior: reduce ? "auto" : "smooth",
        });
      return;
    }
    if (b.dataset.fcres) {
      fcResolve(b.dataset.fcres, b.closest("[data-src]").dataset.src);
      return;
    }
    if (b.dataset.fcndel) {
      fcDelNote(b.dataset.fcndel);
      return;
    }
    if (b.hasAttribute("data-fcsend")) {
      fcSendNote();
      return;
    }
    if (b.hasAttribute("data-fccxx")) {
      fcCX = null;
      fcCxOff = true;
      fcSyncForm();
      const ta = fcvScroll.querySelector(".fcform textarea");
      ta && ta.focus();
      return;
    }
    if (!c) return;
    if (b.dataset.fcv === "export") {
      fcExport(c, b);
      return;
    }
    if (b.dataset.fcv === "replace") {
      $("#fcRep").click();
      return;
    }
    if (b.dataset.fcv === "delete") {
      if (fcDelArm === c.id) {
        fcDelArm = null;
        fcDelete(c);
        return;
      }
      fcDelArm = c.id;
      const t = b.lastChild.textContent;
      b.lastChild.textContent = "Sigurno? Klikni opet";
      b.style.borderColor = "var(--bad)";
      b.style.color = "var(--bad)";
      setTimeout(() => {
        if (b.isConnected) {
          b.lastChild.textContent = t;
          b.style.borderColor = "";
          b.style.color = "";
        }
        if (fcDelArm === c.id) fcDelArm = null;
      }, 3200);
      return;
    }
  });
  fcv.addEventListener("input", (e) => {
    if (e.target.matches(".fcform textarea")) {
      fcGrow(e.target);
      fcSyncForm();
    }
  });
  fcv.addEventListener("focusin", (e) => {
    if (e.target.matches(".fcform textarea")) fcCapture();
  });
  fcv.addEventListener("focusout", (e) => {
    if (e.target.matches(".fcform textarea"))
      setTimeout(() => {
        const ta = fcvScroll.querySelector(".fcform textarea");
        if (
          ta &&
          document.activeElement !== ta &&
          !ta.value.trim() &&
          !fcvScroll
            .querySelector("[data-fcform]")
            .contains(document.activeElement)
        ) {
          fcCX = null;
          fcCxOff = false;
          fcSyncForm();
        }
      }, 160);
    if (e.target.id === "fcvTitle") fcRename();
  });
  fcv.addEventListener("keydown", (e) => {
    if (e.target.id === "fcvTitle" && e.key === "Enter") {
      e.preventDefault();
      e.target.blur();
      return;
    }
    if (
      e.target.matches(".fcform textarea") &&
      e.key === "Enter" &&
      (e.metaKey || e.ctrlKey)
    ) {
      e.preventDefault();
      fcSendNote();
      return;
    }
  });
  (function () {
    let x0 = null,
      y0 = 0,
      t0 = 0;
    const st = $("#fcvStage");
    st.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "mouse" || e.target.closest(".fcs,.fvp-s,button"))
        return;
      x0 = e.clientX;
      y0 = e.clientY;
      t0 = performance.now();
    });
    st.addEventListener("pointerup", (e) => {
      if (x0 == null) return;
      const dx = e.clientX - x0,
        dy = e.clientY - y0;
      x0 = null;
      if (
        Math.abs(dx) > 60 &&
        Math.abs(dx) > Math.abs(dy) * 1.4 &&
        performance.now() - t0 < 700
      )
        fcStep(dx < 0 ? 1 : -1);
    });
    st.addEventListener("pointercancel", () => {
      x0 = null;
    });
  })();
  document.addEventListener("keydown", (e) => {
    if (fcv.hidden || view.name !== "fc") return;
    if (e.key === "Escape") {
      if (!$("#fcAsk").hidden) return;
      e.preventDefault();
      nav("fc-" + view.id);
      return;
    }
    const a = document.activeElement;
    if (
      e.altKey ||
      e.ctrlKey ||
      e.metaKey ||
      (a && a.matches && a.matches("input,textarea,select,[contenteditable]"))
    )
      return;
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      if (fcStep(e.key === "ArrowRight" ? 1 : -1)) e.preventDefault();
    } else if (e.key === " " && fcVP && !(a && a.tagName === "BUTTON")) {
      e.preventDefault();
      fcToggle();
    }
  });
  addEventListener("beforeunload", (e) => {
    if (
      [...FCUP.values()].some((u) => u.state === "queued" || u.state === "up")
    ) {
      e.preventDefault();
      e.returnValue = "";
    }
  });
  /* za sajt (Luka): Firebase Storage umesto skladišta artefakta — vidi integracioni dokument */
  window.SkeyloOS = Object.assign(window.SkeyloOS || {}, {
    useStorage(a) {
      STORE_EXT = a && typeof a.put === "function" ? a : null;
      if (!$("#fc").hidden) renderFC();
    },
  });

  /* =====================================================================
   RASPORED ZA KLIJENTA (CRM → Organisation)
   Kad Nina složi dan (entiteti sa datumom), OS za svakog klijenta tog dana sam
   napravi/ažurira schedules/{id} sa samo onim što klijent i modeli treba da vide:
   {clientId, date, start, end, items:[{k:"scene"|"pause"|"travel", start, end, dur, title, models[], location, props, lines[]}], models[], locations[], createdAt, updatedAt, order}
   Telefoni i ostalo iz baze modela nikad ne idu u raspored (samo imena).
   ===================================================================== */
  var schTm = 0;
  const schCanon = (v) =>
    JSON.stringify(v, (k, x) =>
      x && typeof x === "object" && !Array.isArray(x)
        ? Object.keys(x)
            .sort()
            .reduce((o, q) => ((o[q] = x[q]), o), {})
        : x,
    );
  const schSig = (p) =>
    schCanon([
      p.start || null,
      p.end || null,
      p.items || [],
      p.models || [],
      p.locations || [],
    ]);
  function schPayload(cid, d) {
    const ents = S.entities.filter((e) => e.date === d && e.clientId === cid);
    if (!ents.length) return null;
    const timed = ents.filter((e) => e.start),
      a = timed.length ? Math.min(...timed.map((e) => toMin(e.start))) : null,
      b = timed.length
        ? Math.max(...timed.map((e) => toMin(e.start) + (e.duration || 0)))
        : null;
    const items = [];
    dayList(d).forEach((x) => {
      if (x.t === "e") {
        if (x.ref.clientId !== cid) return;
        const e = x.ref,
          s = S.scripts.find((y) => y.id === e.scriptId),
          st = e.start ? toMin(e.start) : null;
        items.push({
          k: "scene",
          start: e.start || null,
          end: st != null ? hm(st + (e.duration || 0)) : null,
          dur: e.duration || 0,
          title: (s && s.title) || "Scena",
          models: (e.models || []).map((v) => modelRef(v).name).filter(Boolean),
          location: e.location || "",
          props: e.props || "",
          lines: (e.blockTexts || [])
            .map((t) => String(t || "").trim())
            .filter(Boolean)
            .slice(0, 40)
            .map((t) => t.slice(0, 600)),
        });
        return;
      }
      if (
        (x.t === "pause" || x.t === "travel") &&
        a != null &&
        x.s != null &&
        x.s >= a &&
        x.s < b
      )
        items.push({
          k: x.t,
          start: hm(x.s),
          end: hm(x.s + x.dur),
          dur: x.dur || 0,
        });
    });
    const sc = items.filter((i) => i.k === "scene");
    return {
      clientId: cid,
      date: d,
      start: a != null ? hm(a) : null,
      end: b != null ? hm(b) : null,
      items,
      models: [...new Set(sc.flatMap((i) => i.models))],
      locations: [...new Set(sc.map((i) => i.location).filter(Boolean))],
    };
  }
  const schNewId = () =>
    DB
      ? DB.collection("schedules").doc().id
      : "sch-" +
        Date.now().toString(36) +
        Math.random().toString(36).slice(2, 8);
  const schKey = (c, d) => c + "|" + d;
  function schFind(cid, d) {
    return (
      S.schedules
        .filter((s) => s.clientId === cid && s.date === d)
        .sort((x, y) => (x.createdAt || 0) - (y.createdAt || 0))[0] || null
    );
  }
  async function schSyncOne(cid, d, p) {
    const ex = S.schedules
      .filter((s) => s.clientId === cid && s.date === d)
      .sort((x, y) => (x.createdAt || 0) - (y.createdAt || 0));
    if (!p) {
      for (const s of ex) {
        try {
          await api.del("schedules", s.id);
          if (!DB) S.schedules = S.schedules.filter((y) => y.id !== s.id);
        } catch (e) {}
      }
      return null;
    }
    const now = Date.now(),
      top = ex[0];
    let id = top && top.id;
    if (!top) {
      id = schNewId();
      await api.set(
        "schedules",
        id,
        Object.assign({}, p, {
          order: Number(d.replace(/-/g, "")) || 0,
          createdAt: now,
          updatedAt: now,
        }),
      );
    } else if (schSig(top) !== schSig(p))
      await api.upd(
        "schedules",
        top.id,
        Object.assign({}, p, { updatedAt: now }),
      );
    for (const s of ex.slice(1)) {
      try {
        await api.del("schedules", s.id);
        if (!DB) S.schedules = S.schedules.filter((y) => y.id !== s.id);
      } catch (e) {}
    }
    return id;
  }
  function syncSchedules() {
    clearTimeout(schTm);
    schTm = setTimeout(async () => {
      if (!S.ready || !me) return;
      const want = new Map();
      S.entities.forEach((e) => {
        if (e.date && e.clientId) {
          const k = schKey(e.clientId, e.date);
          if (!want.has(k)) want.set(k, [e.clientId, e.date]);
        }
      });
      S.schedules.forEach((s) => {
        const k = schKey(s.clientId, s.date);
        if (!want.has(k)) want.set(k, [s.clientId, s.date]);
      });
      for (const [, [c, d]] of want) {
        try {
          await schSyncOne(c, d, schPayload(c, d));
        } catch (e) {}
      }
    }, 1500);
  }
  /* link za klijenta i modele (Nina ga šalje umesto slike na WhatsApp) */
  async function schLink(cid, d, btn) {
    const p = schPayload(cid, d);
    if (!p) {
      toast("Ovaj klijent nema ništa u rasporedu tog dana");
      return;
    }
    if (btn) btn.disabled = true;
    try {
      clearTimeout(schTm);
      const id = await schSyncOne(cid, d, p);
      if (!id) return;
      const c = S.clients.find((x) => x.id === cid) || {},
        url =
          String(c.crmUrl || CRM_BASE).replace(/#.*$/, "") +
          "#raspored." +
          encodeURIComponent(
            id,
          ); /* gost link: samo ovaj raspored, bez pristupa ostatku platforme */
      let ok = false;
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(url);
          ok = true;
        }
      } catch (e) {}
      if (!ok) {
        try {
          const t = document.createElement("textarea");
          t.value = url;
          t.setAttribute("readonly", "");
          t.style.cssText = "position:fixed;left:-9999px;top:0";
          document.body.appendChild(t);
          t.select();
          ok = document.execCommand("copy");
          t.remove();
        } catch (e) {}
      }
      toast(
        ok
          ? `Link je kopiran. Otvara samo ovaj raspored (${c.name || "klijent"}), ništa drugo.`
          : url,
      );
    } catch (e) {
      toast(errMsg(e));
    } finally {
      if (btn) btn.disabled = false;
    }
  }
  function schButtons(d) {
    const cids = [
      ...new Set(
        S.entities
          .filter((e) => e.date === d && e.clientId)
          .map((e) => e.clientId),
      ),
    ];
    return cids
      .map((cid) => {
        const c = S.clients.find((x) => x.id === cid) || { name: cid };
        return `<button class="pill solid dplink" data-dlink="${esc(cid)}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px"><path d="M10 14a5 5 0 0 0 7.1 0l3-3a5 5 0 0 0-7.1-7.1l-1.2 1.2"/><path d="M14 10a5 5 0 0 0-7.1 0l-3 3a5 5 0 0 0 7.1 7.1l1.2-1.2"/></svg>Link za ${esc(c.name)}</button>`;
      })
      .join("");
  }
  $("#dayp").addEventListener("click", (e) => {
    const b = e.target.closest("[data-dlink]");
    if (b && dayOpen) schLink(b.dataset.dlink, dayOpen, b);
  });

  /* ---------------- boot ---------------- */
  addEventListener("beforeunload", () => {
    flushSave();
    if (NT) NT.flush();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      flushSave();
      if (NT) NT.flush();
    }
  });
  async function start() {
    let slug = null;
    try {
      slug = await OS.session();
    } catch (e) {}
    const u = TEAM.find((t) => t.id === slug);
    if (u) store.set(u.id);
    else store.del();
    u ? login(u) : show("login");
  }
  setTimeout(
    () => {
      $("#boot").classList.add("done");
      start();
    },
    reduce ? 0 : 1100,
  );
})();
