/* Skeylo OS · prijava (ekran #login).
   Tri koraka u jednoj kartici: prijava (email + lozinka) → email za kod → kod + lozinka.
   Isti put služi za prvu registraciju (mode "new") i zaboravljenu lozinku ("reset").
   Nalozi prijavljeni na ovom uređaju pamte se kao lica za brzi izbor.
   app.js: const auth = OSAuth({ team, img, shake, done(slug, how) }) → { show, next }. */
window.OSAuth = function ({ team, img, shake, done }) {
  const $ = (s, r = document) => r.querySelector(s);
  const card = $("#lgCard"),
    who = $("#auWho"),
    resend = $("#auResend");
  const panes = { in: $("#auIn"), mail: $("#auMail"), set: $("#auSet") };
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const EASE = "cubic-bezier(0.2, 0.8, 0.2, 1)";
  const KNOWN = "skeylo-os-known", // slug -> email, nalozi sa ovog uređaja
    NEXT = "skeylo-os-next"; // osoba izabrana u "Promeni osobu" (preživi reload)
  const MAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const norm = (s) =>
    String(s || "")
      .trim()
      .toLowerCase();
  let pane = "in",
    email = "",
    digits = 0,
    tick = 0;

  function known() {
    try {
      return JSON.parse(localStorage.getItem(KNOWN)) || {};
    } catch (e) {
      return {};
    }
  }
  function remember(slug, mail) {
    try {
      localStorage.setItem(KNOWN, JSON.stringify({ ...known(), [slug]: mail }));
    } catch (e) {}
  }

  const MSG = {
    bad_login: "Pogrešan email ili lozinka.",
    not_member: "Ovaj email nije u Skeylo timu.",
    bad_email: "Upiši ispravan email.",
    bad_code: "Kod nije tačan ili je istekao.",
    weak: "Lozinka je preslaba. Probaj dužu.",
    too_many: "Previše pokušaja. Sačekaj malo pa probaj ponovo.",
    network: "Nema veze. Probaj ponovo.",
    mail: "Email nije poslat. Probaj ponovo za minut.",
    not_configured: "Slanje emaila nije podešeno na serveru (OS_MAIL_FROM).",
  };
  const msgOf = (x) => MSG[x && x.code] || "Nešto nije u redu. Probaj ponovo.";

  function say(form, text, calm) {
    const el = $(".err", form);
    el.textContent = text || "";
    el.classList.toggle("ok", !!calm);
    if (text && !calm) shake(card);
  }
  /* dugme čeka dok traje poziv; vraća grešku ili ništa */
  async function busy(form, fn) {
    const btn = $(".btn", form);
    btn.disabled = true;
    btn.classList.add("wait");
    try {
      await fn();
    } catch (x) {
      return x || {};
    } finally {
      btn.disabled = false;
      btn.classList.remove("wait");
    }
  }

  /* prelaz između koraka: kartica glatko menja visinu, novi korak ulazi odozdo */
  function go(to, mode) {
    if (mode) card.dataset.mode = mode;
    const h0 = card.offsetHeight,
      moved = to !== pane;
    pane = to;
    for (const k in panes) {
      panes[k].hidden = k !== to;
      say(panes[k]);
    }
    if (moved && !reduce) {
      card.animate(
        { height: [h0 + "px", card.offsetHeight + "px"] },
        { duration: 340, easing: EASE },
      );
      panes[to].animate(
        { opacity: [0, 1], transform: ["translateY(10px)", "none"] },
        { duration: 340, easing: EASE },
      );
    }
    focusFirst();
  }
  function focusFirst() {
    const f = panes[pane];
    const el =
      [...f.querySelectorAll(".field input")].find((i) => !i.value) ||
      $(".btn", f);
    el.focus({ preventScroll: true });
  }

  /* lica naloga sa ovog uređaja: klik popuni email */
  function paintWho() {
    const k = known(),
      list = team.filter((u) => k[u.id]);
    who.hidden = !list.length;
    who.innerHTML = list
      .map(
        (u) =>
          `<button type="button" class="tp" data-who="${u.id}" aria-pressed="false"><span class="av"><img src="${img[u.id]}" alt=""></span>${u.name}</button>`,
      )
      .join("");
  }
  function markWho() {
    const mail = norm($("#auEmail").value),
      k = known();
    who
      .querySelectorAll(".tp")
      .forEach((b) =>
        b.setAttribute("aria-pressed", String(k[b.dataset.who] === mail)),
      );
  }
  function pick(slug, focus) {
    const mail = known()[slug];
    if (!mail) return;
    $("#auEmail").value = mail;
    $("#auPass").value = "";
    markWho();
    say(panes.in);
    if (focus) $("#auPass").focus();
  }

  function finish(slug, mail, how) {
    if (!done(slug, how)) {
      OS.signOut();
      throw { code: "not_member" };
    }
    remember(slug, mail);
    [$("#auPass"), $("#auCode"), $("#auNew")].forEach((i) => (i.value = ""));
  }

  /* 1. prijava */
  panes.in.addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = panes.in,
      mail = norm($("#auEmail").value),
      pass = $("#auPass").value;
    if (!MAIL_RE.test(mail)) {
      say(f, MSG.bad_email);
      return $("#auEmail").focus();
    }
    if (!pass) {
      say(f, "Upiši lozinku.");
      return $("#auPass").focus();
    }
    const x = await busy(f, async () =>
      finish(await OS.signIn(mail, pass), mail, "in"),
    );
    if (!x) return;
    say(f, msgOf(x));
    if (x.code !== "bad_login") return;
    $("#auPass").select();
    /* najčešće: neko ko još nije napravio nalog */
    if (!Object.keys(known()).length) {
      $("#auNewLink").classList.remove("pulse");
      void $("#auNewLink").offsetWidth;
      $("#auNewLink").classList.add("pulse");
    }
  });
  $("#auEmail").addEventListener("input", markWho);
  who.addEventListener("click", (e) => {
    const b = e.target.closest("[data-who]");
    if (b) pick(b.dataset.who, true);
  });

  /* 2. email za kod */
  async function send(mail) {
    const r = await OS.sendCode(mail, card.dataset.mode);
    digits = r.digits || 0;
    return r;
  }
  function toCode(mail, wait) {
    email = mail;
    $("#auTo").textContent = mail;
    $("#auUser").value = mail;
    $("#auCode").value = "";
    $("#auNew").value = "";
    $("#auCode").placeholder = digits ? "•".repeat(digits) : "";
    go("set");
    countdown(wait || 60);
  }
  panes.mail.addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = panes.mail,
      mail = norm($("#auMailIn").value);
    if (!MAIL_RE.test(mail)) {
      say(f, MSG.bad_email);
      return $("#auMailIn").focus();
    }
    const x = await busy(f, async () => toCode(mail, (await send(mail)).wait));
    if (!x) return;
    if (x.code === "too_soon") {
      /* kod je već poslat (npr. pre reload-a): idi pravo na unos */
      toCode(mail, x.wait);
      say(panes.set, "Kod je poslat pre manje od minut. Proveri email.", true);
    } else say(f, msgOf(x));
  });

  /* 3. kod + lozinka */
  function countdown(s) {
    clearInterval(tick);
    const end = Date.now() + s * 1000;
    const paint = () => {
      const left = Math.ceil((end - Date.now()) / 1000);
      resend.disabled = left > 0;
      resend.textContent =
        left > 0 ? `Pošalji ponovo (${left})` : "Pošalji ponovo";
      if (left <= 0) clearInterval(tick);
    };
    paint();
    tick = setInterval(paint, 1000);
  }
  resend.addEventListener("click", async () => {
    resend.disabled = true;
    try {
      countdown((await send(email)).wait);
      $("#auCode").value = "";
      say(panes.set, "Poslali smo novi kod.", true);
      $("#auCode").focus();
    } catch (x) {
      if (x.code === "too_soon") countdown(x.wait);
      else {
        resend.disabled = false;
        say(panes.set, msgOf(x));
      }
    }
  });
  $("#auCode").addEventListener("input", (e) => {
    const t = e.target,
      v = t.value.replace(/\D/g, "");
    if (v !== t.value) t.value = v;
    if (digits && v.length === digits && !$("#auNew").value)
      $("#auNew").focus();
  });
  panes.set.addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = panes.set,
      code = $("#auCode").value,
      pass = $("#auNew").value;
    if (code.length < 6) {
      say(f, "Upiši kod iz emaila.");
      return $("#auCode").focus();
    }
    if (pass.length < 8) {
      say(f, "Lozinka mora imati bar 8 znakova.");
      return $("#auNew").focus();
    }
    const how = card.dataset.mode;
    const x = await busy(f, async () =>
      finish(await OS.setPassword(email, code, pass), email, how),
    );
    if (!x) return;
    say(f, msgOf(x) + (x.code === "bad_code" ? " Pošalji novi." : ""));
    (x.code === "bad_code" ? $("#auCode") : $("#auNew")).select();
  });

  /* prelazi između koraka i oko za lozinku */
  card.addEventListener("click", (e) => {
    const eye = e.target.closest(".au-eye");
    if (eye) {
      const i = eye.previousElementSibling,
        on = i.type === "password";
      i.type = on ? "text" : "password";
      eye.setAttribute("aria-pressed", String(on));
      eye.setAttribute("aria-label", on ? "Sakrij lozinku" : "Prikaži lozinku");
      i.focus();
      return;
    }
    const t = e.target.closest("[data-to]");
    if (!t) return;
    const to = t.dataset.to;
    if (to === "new" || to === "reset") {
      $("#auMailIn").value = norm($("#auEmail").value) || email;
      go("mail", to);
    } else if (to === "in") {
      if (email) $("#auEmail").value = email;
      markWho();
      go("in");
    } else go(to);
  });

  paintWho();
  let next = null;
  try {
    next = sessionStorage.getItem(NEXT);
    sessionStorage.removeItem(NEXT);
  } catch (e) {}
  const ids = Object.keys(known());
  pick(next && known()[next] ? next : ids.length === 1 ? ids[0] : null);

  return {
    /* app.js je upravo pokazao #login */
    show() {
      if (matchMedia("(hover: hover)").matches) focusFirst();
    },
    /* "Promeni osobu": posle odjave login dočeka tu osobu */
    next(slug) {
      try {
        sessionStorage.setItem(NEXT, slug);
      } catch (e) {}
    },
  };
};
