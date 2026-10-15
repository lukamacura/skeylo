/* Skeylo CRM na sajtu: prijava klijenta + podaci iz Skeylo OS-a (Supabase, tabela os.docs).
   app.js je dizajn CRM-a; ovde je samo veza:
   - prijava (ime + šifra klijenta → /crm/login), pa se učita app.js i pozove SkeyloCRM.connect
   - izvor podataka za app.js (subscribe/html/putComment/delComment/putVault/delVault) uz realtime
   - gost link #raspored.{id}: bez prijave, samo taj jedan raspored (os.schedule_get)
   Šta klijent sme da čita i piše čuvaju RLS pravila i funkcije u bazi, ne ovaj fajl. */
(() => {
  const E = window.OS_ENV || {};
  const CLIENT_ID = document.documentElement.dataset.client;
  const NAME_KEY = "skeylo-crm-name";
  const COLS = [
    "items",
    "reports",
    "scripts",
    "comments",
    "creatives",
    "creativeComments",
    "schedules",
    "vault",
  ];
  const sb = supabase.createClient(E.url, E.key, {
    db: { schema: "os" },
    auth: {
      storageKey: "skeylo-crm-auth",
      persistSession: true,
      autoRefreshToken: true,
    },
  });
  const $ = (s) => document.querySelector(s);
  const root = document.documentElement;
  const GUEST = (/^#raspored\.(.+)$/.exec(location.hash) || [])[1] || null;
  const newId = () => {
    const a = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const r = crypto.getRandomValues(new Uint8Array(20));
    return Array.from(r, (n) => a[n % a.length]).join("");
  };
  const fail = (e) => {
    throw {
      code: e && e.code === "42501" ? "not_granted" : "failed",
      cause: e,
    };
  };

  /* ---------- app.js se učitava tek kad znamo ko je unutra ---------- */
  let appLoaded = null;
  function loadApp() {
    if (!appLoaded)
      appLoaded = new Promise((res, rej) => {
        const s = document.createElement("script");
        s.src = "/crm-app/app.js";
        s.onload = res;
        s.onerror = rej;
        document.body.appendChild(s);
      });
    return appLoaded;
  }
  function reveal() {
    root.classList.remove("gated");
    requestAnimationFrame(() => root.classList.remove("booting"));
  }

  /* ---------- izvor podataka: dokumenti klijenta + realtime ---------- */
  function liveSource(cid) {
    const store = new Map(COLS.map((c) => [c, new Map()])); // col → id → {data, v}
    const pending = new Map(); // "col/id" → broj upisa u toku
    let cb = null,
      ch = null,
      wasUp = false,
      dirty = new Set();
    const k = (c, id) => c + "/" + id;
    function emit(col) {
      dirty.add(col);
      if (dirty.size > 1) return;
      queueMicrotask(() => {
        const out = {};
        dirty.forEach((c) => {
          out[c] = [...store.get(c)].map(([id, r]) => ({ id, ...r.data }));
        });
        dirty = new Set();
        cb && cb(out);
      });
    }
    async function loadAll() {
      const rows = [];
      for (let from = 0; ; from += 1000) {
        const { data, error } = await sb
          .from("docs")
          .select("col,id,data,v")
          .in("col", COLS)
          .eq("client_id", cid)
          .range(from, from + 999);
        if (error) throw error;
        rows.push(...data);
        if (data.length < 1000) break;
      }
      const seen = new Set();
      for (const r of rows) {
        seen.add(k(r.col, r.id));
        if (pending.get(k(r.col, r.id))) continue;
        const cur = store.get(r.col).get(r.id);
        if (!cur || cur.v <= r.v) store.get(r.col).set(r.id, r);
      }
      for (const c of COLS)
        for (const id of [...store.get(c).keys()])
          if (!seen.has(k(c, id)) && !pending.get(k(c, id)))
            store.get(c).delete(id);
      COLS.forEach(emit);
    }
    function onRow(r) {
      const m = r && store.get(r.col);
      if (!m || pending.get(k(r.col, r.id))) return;
      const cur = m.get(r.id);
      if (cur && cur.v >= r.v) return;
      m.set(r.id, { data: r.data || {}, v: r.v });
      emit(r.col);
    }
    function onDel(o) {
      const m = o && store.get(o.col);
      if (!m || pending.get(k(o.col, o.id))) return;
      if (m.delete(o.id)) emit(o.col);
    }
    /* upis: odmah lokalno (brz odziv), pa u bazu; ako baza odbije, vrati staro */
    async function write(col, id, data, rpc, args) {
      const m = store.get(col),
        key = k(col, id),
        prev = m.get(id);
      pending.set(key, (pending.get(key) || 0) + 1);
      if (data) m.set(id, { data, v: prev ? prev.v : 0 });
      else m.delete(id);
      emit(col);
      try {
        const { data: v, error } = await sb.rpc(rpc, args);
        if (error) fail(error);
        if (data && typeof v === "number") m.set(id, { data, v });
      } catch (e) {
        if (pending.get(key) === 1) {
          prev ? m.set(id, prev) : m.delete(id);
          emit(col);
        }
        throw e;
      } finally {
        const n = pending.get(key) - 1;
        n ? pending.set(key, n) : pending.delete(key);
      }
    }
    const set = (col, id, data) =>
      write(col, id, data, "doc_set", { p_col: col, p_id: id, p_data: data });
    const del = (col, id) =>
      write(col, id, null, "doc_delete", { p_col: col, p_id: id });

    return {
      demo: false,
      subscribe(fn, err) {
        cb = fn;
        (async function first(wait) {
          try {
            await loadAll();
          } catch (e) {
            console.warn("[crm] učitavanje", e);
            if (wait > 8000) COLS.forEach((c) => err(c, e));
            setTimeout(() => first(Math.min(wait * 2, 15000)), wait);
          }
        })(1000);
        // RLS u bazi propušta klijentu samo dokumente njegovog klijenta
        ch = sb
          .channel("crm-" + cid)
          .on(
            "postgres_changes",
            { event: "INSERT", schema: "os", table: "docs" },
            (p) => onRow(p.new),
          )
          .on(
            "postgres_changes",
            { event: "UPDATE", schema: "os", table: "docs" },
            (p) => onRow(p.new),
          )
          .on(
            "postgres_changes",
            { event: "DELETE", schema: "os", table: "docs" },
            (p) => onDel(p.old),
          )
          .subscribe((status) => {
            // posle prekida veze povuci sve iznova da ništa ne promakne
            if (status === "SUBSCRIBED" && wasUp) loadAll().catch(() => {});
            if (status === "SUBSCRIBED") wasUp = true;
          });
        return () => {
          cb = null;
          if (ch) sb.removeChannel(ch);
        };
      },
      async html(r) {
        const n = Math.max(1, r.chunks || 1),
          ids = Array.from({ length: n }, (_, i) => `${r.id}_${i}`);
        const { data, error } = await sb
          .from("docs")
          .select("id,data")
          .eq("col", "reportChunks")
          .in("id", ids);
        if (error) throw error;
        const by = new Map(data.map((d) => [d.id, d.data]));
        return ids
          .map((id) => {
            if (!by.has(id)) throw new Error("missing");
            return by.get(id).data || "";
          })
          .join("");
      },
      newId,
      putComment: (id, c, col) => set(col || "comments", id, c),
      delComment: (id, col) => del(col || "comments", id),
      putVault: (id, c) => set("vault", id, c),
      delVault: (id) => del("vault", id),
    };
  }

  /* gost: jedan raspored, osvežava se dok je stranica otvorena */
  function guestSource(id) {
    return {
      demo: false,
      subscribe(cb, err) {
        let last = null,
          tm = 0,
          off = false;
        cb({
          items: [],
          reports: [],
          scripts: [],
          comments: [],
          creatives: [],
          creativeComments: [],
        });
        async function poll() {
          clearTimeout(tm);
          if (off) return;
          try {
            const { data, error } = await sb.rpc("schedule_get", { p_id: id });
            if (error) throw error;
            const sig = data ? data.v : 0;
            if (sig !== last) {
              last = sig;
              cb({ schedules: data ? [{ id: data.id, ...data.data }] : [] });
            }
          } catch (e) {
            if (last === null) err("schedules", e);
          }
          tm = setTimeout(poll, document.hidden ? 60000 : 15000);
        }
        const wake = () => !document.hidden && poll();
        document.addEventListener("visibilitychange", wake);
        poll();
        return () => {
          off = true;
          clearTimeout(tm);
          document.removeEventListener("visibilitychange", wake);
        };
      },
    };
  }

  /* ---------- Privacy: šifru proverava server ---------- */
  window.CRM_AUTH = {
    async privacy(password) {
      try {
        const r = await fetch("/crm/privacy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ client: CLIENT_ID, password }),
        });
        return r.ok;
      } catch (e) {
        return false;
      }
    },
  };

  /* ---------- meni naloga: klik na logo gore desno ---------- */
  function wireAccount(me) {
    const who = $("#dash .top .who");
    if (!who || who.dataset.acct) return;
    who.dataset.acct = "1";
    who.setAttribute("role", "button");
    who.setAttribute("tabindex", "0");
    who.setAttribute("aria-haspopup", "menu");
    who.title = me.name;
    let pop = null;
    const close = () => {
      if (!pop) return;
      pop.remove();
      pop = null;
      who.setAttribute("aria-expanded", "false");
      removeEventListener("pointerdown", outside, true);
    };
    const outside = (e) => {
      if (pop && !pop.contains(e.target) && !who.contains(e.target)) close();
    };
    const open = () => {
      if (pop) return close();
      const r = who.getBoundingClientRect();
      pop = document.createElement("div");
      pop.className = "acct";
      pop.setAttribute("role", "menu");
      pop.innerHTML = `<div class="an">Prijavljen nalog<b></b></div><button type="button" role="menuitem">Odjavi se</button>`;
      pop.querySelector("b").textContent = me.name;
      pop.style.top = r.bottom + 10 + "px";
      pop.style.right = Math.max(12, innerWidth - r.right) + "px";
      pop.querySelector("button").onclick = async () => {
        close();
        await sb.auth.signOut().catch(() => {});
        try {
          sessionStorage.removeItem("skeylo-crm-priv-" + CLIENT_ID);
        } catch (e) {}
        location.replace(location.pathname);
      };
      document.body.appendChild(pop);
      who.setAttribute("aria-expanded", "true");
      addEventListener("pointerdown", outside, true);
    };
    who.addEventListener("click", open);
    who.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open();
      } else if (e.key === "Escape") close();
    });
  }

  /* ---------- prijava ---------- */
  async function whoAmI() {
    const { data } = await sb.auth.getSession();
    if (!data.session) return null;
    const { data: me, error } = await sb.rpc("crm_me");
    if (error || !me) return null;
    if (me.clientId !== CLIENT_ID) {
      await sb.auth.signOut().catch(() => {});
      return null;
    }
    return me;
  }
  function askLogin() {
    return new Promise((done) => {
      const gate = $("#gate"),
        box = $("#gbox"),
        nm = $("#gName"),
        pw = $("#gPass"),
        err = $("#gErr"),
        btn = $("#gGo");
      root.classList.add("gated");
      root.classList.remove("booting");
      gate.hidden = false;
      try {
        nm.value = localStorage.getItem(NAME_KEY) || "";
      } catch (e) {}
      setTimeout(
        () => (nm.value ? pw : nm).focus({ preventScroll: true }),
        300,
      );
      const shake = (msg, el) => {
        err.textContent = msg;
        box.classList.remove("bad");
        void box.offsetWidth;
        box.classList.add("bad");
        el && el.select && el.select();
        try {
          navigator.vibrate && navigator.vibrate([20, 40, 20]);
        } catch (e) {}
      };
      box.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (btn.disabled) return;
        const name = nm.value.replace(/\s+/g, " ").trim();
        if (!name) return shake("Upiši svoje ime (ide uz komentare).", nm);
        if (!pw.value) return shake("Upiši šifru.", pw);
        btn.disabled = true;
        err.textContent = "";
        let j = {},
          r = null;
        try {
          r = await fetch("/crm/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              client: CLIENT_ID,
              name,
              password: pw.value,
            }),
          });
          j = await r.json().catch(() => ({}));
        } catch (x) {}
        if (!r || !r.ok) {
          btn.disabled = false;
          return shake(
            !r
              ? "Nema veze. Probaj ponovo."
              : j.error === "not_configured"
                ? "Prijava još nije podešena. Javi se Skeylo timu."
                : j.error === "no_name"
                  ? "Upiši ime slovima."
                  : r.status >= 500
                    ? "Nešto nije u redu. Probaj ponovo za minut."
                    : "Pogrešna šifra.",
            r && r.status < 500 && j.error !== "no_name" ? pw : nm,
          );
        }
        const { error } = await sb.auth.setSession(j);
        const me = !error && (await whoAmI());
        if (!me) {
          btn.disabled = false;
          return shake("Nešto nije u redu. Probaj ponovo.", pw);
        }
        try {
          localStorage.setItem(NAME_KEY, me.name);
        } catch (x) {}
        pw.value = "";
        done(me);
      });
    });
  }

  async function start() {
    if (GUEST) {
      // gost nikad ne vidi prijavu, dashboard ni vault: samo taj jedan raspored
      await loadApp();
      SkeyloCRM.useSource(guestSource(GUEST));
      reveal();
      return;
    }
    // sa sačuvanom sesijom app.js se učitava paralelno sa proverom
    let hasSaved = false;
    try {
      hasSaved = !!localStorage.getItem("skeylo-crm-auth");
    } catch (e) {}
    if (hasSaved) loadApp().catch(() => {});
    let me = await whoAmI().catch(() => null);
    if (!me) {
      me = await askLogin();
      const g = $("#gate");
      g.classList.add("out");
      setTimeout(() => (g.hidden = true), 600);
    }
    await loadApp();
    SkeyloCRM.connect(liveSource, me.clientId, { uid: me.uid, name: me.name });
    wireAccount(me);
    reveal();
  }
  start().catch((e) => {
    console.error("[crm]", e);
    reveal();
  });
})();
