/* Skeylo OS · Top Goals: nekoliko velikih ciljeva tima, svaki kao papirić sa strelom koja
   leti ka meti. Kolekcija "goals" u os.docs (vidi je samo tim, kao i ostale kolekcije van
   CRM liste; doc_set prima novu kolekciju bez migracije):
     { title, target, current, deadline: "YYYY-MM-DD" | "", order, doneAt: ms | null,
       createdAt, createdBy, updatedAt, updatedBy }
   Napredak = current / target. "3 high ticket klijenta" → target 3 se sam pročita iz broja
   na početku naslova (može da se promeni). Bez broja cilj je da/ne (target 1).
   Dashboard (#gdash): prva tri aktivna cilja po redosledu (+ ostvareni u poslednjih 7 dana),
   klik vodi na #goals. #goals: veliki papirići sa +1 / −, izmena na samom papiru, ostvareni
   ciljevi na polici ispod. Ostvaren cilj ostaje na mestu sa pečatom dok se ne izađe sa ekrana. */
window.SKGoals = function (X) {
  "use strict";
  const { S, api, esc, SV, toast, errMsg, nav, markFresh, burst, shake, nf } =
    X;
  const $ = (s, r = document) => r.querySelector(s);
  const adl = window.OS_DL || ((s) => s);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const me = () => X.me();
  const WEEK = 7 * 864e5;

  const I = {
    target: SV(
      '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/>',
      2,
    ),
    go: SV('<path d="M5 12h14M13 6l6 6-6 6"/>', 2.2),
    plus: SV('<path d="M12 5v14M5 12h14"/>', 2.4),
    minus: SV('<path d="M5 12h14"/>', 2.6),
    pen: SV('<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>', 2),
    trophy: SV(
      '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
      2,
    ),
  };

  let editId = null; // "new" | id | null
  let draft = null; // { t, n, c, d, nTouched }
  const keep = new Set(); // ostvaren u ovoj poseti: ostaje među aktivnima, sa pečatom
  let dashAnim = true,
    holdUntil = 0,
    holdT = 0;
  let lastDash = "";

  const list = () => S.goals || [];
  const tgt = (g) => Math.max(1, Math.round(+g.target || 1));
  const cur = (g) => Math.max(0, Math.round(+g.current || 0));
  const pct = (g) => Math.min(1, cur(g) / tgt(g));
  const won = (g) => cur(g) >= tgt(g);
  const byOrder = (a, b) =>
    (a.order || 0) - (b.order || 0) || (a.createdAt || 0) - (b.createdAt || 0);
  const active = () =>
    list()
      .filter((g) => !won(g))
      .sort(byOrder);
  const achieved = () =>
    list()
      .filter(won)
      .sort((a, b) => (b.doneAt || 0) - (a.doneAt || 0));
  function hashN(s) {
    let h = 2166136261;
    for (const ch of String(s)) {
      h ^= ch.charCodeAt(0);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0) / 4294967295;
  }
  const rot = (id, k = 2.6) => ((hashN(id) - 0.5) * k).toFixed(2);
  const dW = (n) => (n % 10 === 1 && n % 100 !== 11 ? "dan" : "dana");
  function daysTo(d) {
    if (!d) return null;
    const t = new Date();
    return Math.round(
      (Date.parse(d) - Date.UTC(t.getFullYear(), t.getMonth(), t.getDate())) /
        864e5,
    );
  }
  function dueHTML(g) {
    if (won(g)) {
      if (!g.doneAt) return "";
      const d = new Date(g.doneAt);
      return `<span>· ${d.getDate()}. ${d.getMonth() + 1}. ${d.getFullYear()}.</span>`;
    }
    const n = daysTo(g.deadline);
    if (n == null || isNaN(n)) return "";
    if (n > 0) return `<span>· još ${n} ${dW(n)}</span>`;
    if (n === 0) return '<span class="late">· rok je danas</span>';
    return `<span class="late">· rok prošao pre ${-n} ${dW(-n)}</span>`;
  }
  /* broj na početku naslova: "3 high ticket klijenta" → 3, "1.000.000 RSD" → 1000000 */
  function parseLead(t) {
    const m = /^\s*(\d{1,3}(?:[.\s]\d{3})+|\d+)(?![\d,.]*\d*%)/.exec(t || "");
    return m ? parseInt(m[1].replace(/[.\s]/g, ""), 10) || 0 : 0;
  }
  const numHTML = (g, cls) => {
    if (tgt(g) <= 1) return "";
    const a = nf.format(cur(g)),
      b = nf.format(tgt(g));
    return `<span class="${cls}${a.length + b.length > 9 ? " long" : ""}"><b>${a}</b><span>/${b}</span></span>`;
  };
  /* veliki cilj (npr. novac): umesto +1 se upisuje koliko je dodato */
  const BIG = 100;
  function arrowHTML(g, fly) {
    return `<span class="garrow${won(g) ? " hit" : ""}${fly ? " fly" : ""}" style="--p:${pct(g).toFixed(3)}" aria-hidden="true"><span class="ga-line"></span><span class="ga-tgt"></span><span class="ga-shot"><i class="ga-fl"></i><i class="ga-sh"></i><i class="ga-hd"></i></span></span>`;
  }
  const pctTxt = (g) => `<b>${Math.round(pct(g) * 100)}%</b> ostvareno`;

  /* ---------------- dashboard ---------------- */
  function dashNote(g, i, anim) {
    const w = won(g);
    return `<button type="button" class="gnote${w ? " won" : ""}" data-go="goals" style="--r:${rot(g.id)}deg;${anim ? `animation-delay:${adl(0.12 + i * 0.06)}s` : "animation:none"}" aria-label="${esc(g.title)}: ${Math.round(pct(g) * 100)}% ostvareno">
      <i class="pn-pin" aria-hidden="true"></i>
      <span class="gn-top">${numHTML(g, "gn-num")}<span class="gn-t">${esc(g.title)}</span></span>
      ${arrowHTML(g, anim && !reduce)}
      <span class="gn-f">${pctTxt(g)}${dueHTML(g)}</span>
      ${w ? '<span class="gstamp">Ostvareno</span>' : ""}
    </button>`;
  }
  function dash() {
    const el = $("#gdash");
    if (!el || !me()) return;
    if (!S.ready && !list().length) {
      el.hidden = true;
      return;
    }
    const now = Date.now();
    const act = active();
    const shown = [
      ...act,
      ...achieved().filter((g) => g.doneAt && now - g.doneAt < WEEK),
    ].slice(0, 3);
    const anim = dashAnim && !$("#dash").hidden;
    const more = act.length > 3 ? ` · još ${act.length - 3}` : "";
    const html = `<div class="gd-h"><h2 class="gd-t">${I.target}Top Goals</h2><button type="button" class="gd-all" data-go="goals">${shown.length ? "Svi ciljevi" + more : "Otvori"}${I.go}</button></div>${shown.length ? `<div class="gd-row">${shown.map((g, i) => dashNote(g, i, anim)).join("")}</div>` : ""}`;
    el.hidden = false;
    /* isti sadržaj → ne diraj DOM (hover i animacije ostaju) */
    const key = html.replace(
      /animation-delay:[^;"]*;?|animation:none;?| fly/g,
      "",
    );
    if (key === lastDash) return;
    lastDash = key;
    el.innerHTML = html;
    if (anim && S.ready) dashAnim = false;
  }

  /* ---------------- ekran #goals ---------------- */
  function cardHTML(g, i, anim) {
    const w = won(g);
    const fresh = S.fresh.has(g.id);
    return `<article class="gcard${w ? " won" : ""}${fresh ? " new" : ""}" data-gid="${esc(g.id)}" style="--r:${rot(g.id, 2)}deg;${fresh ? "" : anim ? `animation-delay:${adl(0.06 + i * 0.05)}s` : "animation:none"}">
      <i class="pn-pin" aria-hidden="true"></i>
      <button type="button" class="gc-ed" data-gedit="${esc(g.id)}" aria-label="Izmeni cilj">${I.pen}</button>
      ${numHTML(g, "gc-num")}
      <h3 class="gc-t">${esc(g.title)}</h3>
      ${arrowHTML(g, anim && !reduce)}
      <div class="gc-f">${pctTxt(g)}${dueHTML(g)}</div>
      <div class="gc-act">${
        tgt(g) >= BIG
          ? `<input class="gadd" type="number" min="1" step="1" inputmode="numeric" placeholder="+ koliko?" aria-label="Dodaj iznos"><button type="button" class="gplus" data-gaddbtn>${I.plus}Dodaj</button>`
          : `<button type="button" class="gminus" data-gstep="-1" aria-label="Umanji za 1"${cur(g) ? "" : " disabled"}>${I.minus}</button><button type="button" class="gplus" data-gstep="1">+1</button>`
      }</div>
      ${w ? '<span class="gstamp">Ostvareno</span>' : ""}
    </article>`;
  }
  function achHTML(g) {
    return `<article class="gcard mini won" data-gedit="${esc(g.id)}" style="--r:${rot(g.id, 3)}deg;animation:none" tabindex="0">
      <i class="pn-pin" aria-hidden="true"></i>
      <h3 class="gc-t">${esc(g.title)}</h3>
      ${arrowHTML(g, false)}
      <div class="gc-f"><b>${nf.format(cur(g))}/${nf.format(tgt(g))}</b>${dueHTML(g)}</div>
      <span class="gstamp">Ostvareno</span>
    </article>`;
  }
  function formHTML(g) {
    const d = draft;
    const first = g && active()[0] && active()[0].id === g.id;
    return `<form class="gcard gform" data-gform="${g ? esc(g.id) : "new"}" autocomplete="off" novalidate>
      <i class="pn-pin" aria-hidden="true"></i>
      <label class="gf-l">${g ? "Cilj" : "Novi cilj"}<input class="gf-t" name="t" maxlength="80" placeholder="npr. 3 high ticket klijenta" value="${esc(d.t)}"></label>
      <div class="gf-row">
        <label class="gf-l">Koliko ukupno<input name="n" type="number" min="1" step="1" inputmode="numeric" placeholder="1" value="${esc(d.n)}"></label>
        ${g ? `<label class="gf-l">Ostvareno<input name="c" type="number" min="0" step="1" inputmode="numeric" value="${esc(d.c)}"></label>` : ""}
        <label class="gf-l"><span>Rok <small>(opciono)</small></span><input name="d" type="date" value="${esc(d.d)}"></label>
      </div>
      <div class="gf-act"><button type="submit" class="gplus">${g ? "Sačuvaj" : "Zakači cilj"}</button><button type="button" class="gf-x" data-gcancel>Otkaži</button>${g ? `<span class="gf-sp"></span>${!won(g) && !first ? `<button type="button" class="gf-top" data-gtop="${esc(g.id)}">Na vrh</button>` : ""}<button type="button" class="gf-del" data-gdel="${esc(g.id)}">Obriši</button>` : ""}</div>
    </form>`;
  }
  let firstGoals = true;
  function render(fresh) {
    const root = $("#goalsBody");
    if (!root || $("#goals").hidden) return;
    if (fresh) {
      keep.clear();
      firstGoals = true;
    }
    if (performance.now() < holdUntil) {
      clearTimeout(holdT);
      holdT = setTimeout(() => render(), holdUntil - performance.now() + 20);
      return;
    }
    if (!S.ready && !list().length) {
      root.innerHTML = '<div class="state">Učitavam ciljeve…</div>';
      return;
    }
    const anim = firstGoals;
    firstGoals = false;
    const act = list()
      .filter((g) => !won(g) || keep.has(g.id))
      .sort(byOrder);
    const ach = achieved().filter((g) => !keep.has(g.id));
    if (editId && editId !== "new" && !list().some((g) => g.id === editId))
      editId = null;
    let cards = act
      .map((g, i) => (editId === g.id ? formHTML(g) : cardHTML(g, i, anim)))
      .join("");
    if (editId === "new") cards = formHTML(null) + cards;
    const focused = document.activeElement;
    const fName =
      focused && focused.closest && focused.closest(".gform")
        ? focused.name
        : null;
    root.innerHTML =
      (cards
        ? `<div class="ggrid">${cards}</div>`
        : `<div class="state">Još nema ciljeva. Zakači prvi preko „Novi cilj“.</div>`) +
      (ach.length
        ? `<h3 class="gach-h">${I.trophy}Ostvareno · ${ach.length}</h3><div class="ggrid ach">${ach.map(achHTML).join("")}</div>`
        : "");
    const f = root.querySelector(".gform");
    if (f) {
      const inp = f.querySelector(`[name="${fName || "t"}"]`);
      if (inp && (fName || f.dataset.just)) inp.focus();
    }
  }
  function openForm(id) {
    const g = id === "new" ? null : list().find((x) => x.id === id);
    editId = g ? g.id : "new";
    draft = g
      ? {
          t: g.title || "",
          n: String(tgt(g)),
          c: String(cur(g)),
          d: g.deadline || "",
          nTouched: true,
        }
      : { t: "", n: "", c: "0", d: "", nTouched: false };
    render();
    const f = $("#goalsBody .gform");
    if (f) {
      const t = f.querySelector('[name="t"]');
      t.focus();
      t.setSelectionRange(t.value.length, t.value.length);
      f.scrollIntoView({
        block: "nearest",
        behavior: reduce ? "auto" : "smooth",
      });
    }
  }
  function closeForm() {
    editId = null;
    draft = null;
    render();
  }
  async function save(form) {
    const id = form.dataset.gform;
    const t = (draft.t || "").trim().replace(/\s+/g, " ");
    if (!t) {
      const i = form.querySelector('[name="t"]');
      shake(i);
      i.focus();
      return;
    }
    const n = Math.max(1, Math.round(+draft.n || parseLead(t) || 1));
    const by = me() ? me().id : null;
    const now = Date.now();
    if (id === "new") {
      const data = {
        title: t,
        target: n,
        current: 0,
        deadline: draft.d || "",
        order: now,
        doneAt: null,
        createdAt: now,
        createdBy: by,
      };
      editId = null;
      draft = null;
      try {
        const nid = await api.add("goals", data);
        markFresh(nid);
        render();
        dash();
        toast("Cilj zakačen");
      } catch (err) {
        toast(errMsg(err));
      }
      return;
    }
    const g = list().find((x) => x.id === id);
    if (!g) return closeForm();
    const c = Math.max(0, Math.round(+draft.c || 0));
    const patch = {
      title: t,
      target: n,
      current: c,
      deadline: draft.d || "",
      doneAt: c >= n ? g.doneAt || now : null,
      updatedAt: now,
      updatedBy: by,
    };
    editId = null;
    draft = null;
    try {
      await api.upd("goals", id, patch);
      render();
      dash();
    } catch (err) {
      toast(errMsg(err));
    }
  }
  /* +1 / −1: strela se pomeri odmah na papiru (bez ponovnog crtanja), pa baza */
  async function step(card, d) {
    const id = card.dataset.gid;
    const g = list().find((x) => x.id === id);
    if (!g) return;
    const was = won(g);
    const c = Math.max(0, cur(g) + d);
    if (c === cur(g)) return;
    const n = tgt(g);
    const patch = {
      current: c,
      doneAt: c >= n ? g.doneAt || Date.now() : null,
      updatedAt: Date.now(),
      updatedBy: me() ? me().id : null,
    };
    const next = { ...g, ...patch };
    const nowWon = won(next);
    if (nowWon) keep.add(id);
    holdUntil = performance.now() + (nowWon && !was ? 1400 : 650);
    paint(card, next, d > 0);
    if (nowWon && !was) celebrate(card);
    try {
      await api.upd("goals", id, patch);
      dash();
      /* upisan iznos (ne +1): pokaži koliko je dodato, uz poništavanje */
      if (Math.abs(d) > 1 && !(nowWon && !was))
        toast(
          `Dodato ${nf.format(d)} · ${nf.format(c)}/${nf.format(n)}`,
          () => {
            const c2 = $(`#goalsBody .gcard[data-gid="${CSS.escape(id)}"]`);
            if (c2) step(c2, -d);
            else
              api
                .upd("goals", id, { current: Math.max(0, c - d), doneAt: null })
                .then(
                  () => (render(), dash()),
                  (err) => toast(errMsg(err)),
                );
          },
        );
    } catch (err) {
      holdUntil = 0;
      toast(errMsg(err));
      render();
    }
  }
  function addAmount(card) {
    const inp = card && card.querySelector(".gadd");
    if (!inp) return;
    const v = Math.round(+String(inp.value).replace(/[^\d-]/g, "") || 0);
    if (!v) {
      shake(inp);
      inp.focus();
      return;
    }
    inp.value = "";
    inp.blur();
    step(card, v);
  }
  function paint(card, g, up) {
    const b = card.querySelector(".gc-num b");
    if (b) {
      b.textContent = nf.format(cur(g));
      b.parentNode.classList.toggle(
        "long",
        b.textContent.length + nf.format(tgt(g)).length > 9,
      );
      if (up && !reduce) {
        b.classList.remove("bump");
        void b.offsetWidth;
        b.classList.add("bump");
      }
    }
    const a = card.querySelector(".garrow");
    a.classList.remove("fly");
    a.style.setProperty("--p", pct(g).toFixed(3));
    a.classList.toggle("hit", won(g));
    card.querySelector(".gc-f").innerHTML = pctTxt(g) + dueHTML(g);
    const mi = card.querySelector(".gminus");
    if (mi) mi.disabled = !cur(g);
    card.classList.toggle("won", won(g));
    const st = card.querySelector(".gstamp");
    if (won(g) && !st)
      card.insertAdjacentHTML(
        "beforeend",
        '<span class="gstamp">Ostvareno</span>',
      );
    if (!won(g) && st) st.remove();
  }
  function celebrate(card) {
    card.classList.add("win");
    const t = card.querySelector(".ga-tgt");
    if (burst) {
      setTimeout(() => burst(t || card, "var(--gold)"), reduce ? 0 : 380);
      setTimeout(() => burst(t || card, "var(--orange)"), reduce ? 0 : 520);
    }
    const g = list().find((x) => x.id === card.dataset.gid);
    toast("Cilj ostvaren: " + (g ? g.title : ""));
  }
  async function remove(id) {
    const g = list().find((x) => x.id === id);
    if (!g) return;
    const { id: _, ...data } = g;
    editId = null;
    draft = null;
    try {
      await api.del("goals", id);
      render();
      dash();
      toast("Cilj obrisan", async () => {
        try {
          await api.set("goals", id, data);
          render();
          dash();
        } catch (err) {
          toast(errMsg(err));
        }
      });
    } catch (err) {
      toast(errMsg(err));
    }
  }
  async function toTop(id) {
    const min = Math.min(...list().map((g) => g.order || 0));
    editId = null;
    draft = null;
    try {
      await api.upd("goals", id, { order: min - 1 });
      render();
      dash();
      toast("Cilj je sada prvi na dashboardu");
    } catch (err) {
      toast(errMsg(err));
    }
  }

  /* ---------------- događaji ---------------- */
  document.addEventListener("click", (e) => {
    const nw = e.target.closest("[data-gnew]");
    if (nw) {
      if ($("#goals").hidden) {
        editId = "new";
        draft = { t: "", n: "", c: "0", d: "", nTouched: false };
        nav("goals");
        setTimeout(() => {
          const t = $("#goalsBody .gform [name=t]");
          if (t) t.focus();
        }, 60);
      } else openForm("new");
    }
  });
  const body = $("#goalsBody");
  if (body) {
    body.addEventListener("click", (e) => {
      const st = e.target.closest("[data-gstep]");
      if (st) {
        step(st.closest(".gcard"), +st.dataset.gstep);
        return;
      }
      const ad = e.target.closest("[data-gaddbtn]");
      if (ad) return addAmount(ad.closest(".gcard"));
      if (e.target.closest("[data-gcancel]")) return closeForm();
      const del = e.target.closest("[data-gdel]");
      if (del) return remove(del.dataset.gdel);
      const top = e.target.closest("[data-gtop]");
      if (top) return toTop(top.dataset.gtop);
      const ed = e.target.closest("[data-gedit]");
      if (ed) return openForm(ed.dataset.gedit);
      /* klik na naslov ili broj = izmena */
      const card = e.target.closest(".gcard[data-gid]");
      if (card && e.target.closest(".gc-t, .gc-num"))
        openForm(card.dataset.gid);
    });
    body.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && editId) {
        e.stopPropagation();
        closeForm();
      }
      if (e.key === "Enter" && e.target.matches(".gcard.mini"))
        openForm(e.target.dataset.gedit);
      /* Enter u polju forme = sačuvaj (preventDefault gasi i implicitni submit, pa nema duplog upisa) */
      if (
        e.key === "Enter" &&
        !e.isComposing &&
        e.target.matches(".gform input")
      ) {
        e.preventDefault();
        save(e.target.closest(".gform"));
        return;
      }
      if (e.key === "Enter" && e.target.matches(".gadd")) {
        e.preventDefault();
        addAmount(e.target.closest(".gcard"));
      }
    });
    body.addEventListener("input", (e) => {
      const f = e.target.closest(".gform");
      if (!f || !draft) return;
      const k = e.target.name;
      if (k === "t") {
        draft.t = e.target.value;
        if (!draft.nTouched) {
          const n = parseLead(draft.t);
          draft.n = n ? String(n) : "";
          const ni = f.querySelector('[name="n"]');
          if (ni) ni.value = draft.n;
        }
      } else if (k === "n") {
        draft.n = e.target.value;
        draft.nTouched = true;
      } else if (k === "c") draft.c = e.target.value;
      else if (k === "d") draft.d = e.target.value;
    });
    body.addEventListener("submit", (e) => {
      e.preventDefault();
      save(e.target);
    });
  }

  return {
    dash,
    render,
    /* poziva app.js iz refresh(): crta samo ono što se vidi */
    refresh() {
      if (!$("#dash").hidden) dash();
      if (
        !$("#goals").hidden &&
        !(
          document.activeElement &&
          document.activeElement.closest &&
          document.activeElement.closest(".gform")
        )
      )
        render();
    },
  };
};
