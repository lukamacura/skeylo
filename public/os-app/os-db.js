/* Skeylo OS: Supabase ispod prototipa.
   app.js traži window.claude.use("db"|"assets") (Firestore-like API iz prototipa).
   Ovde je isti API nad tabelom os.docs (col, id, data, v) + realtime,
   a window.OS daje prijavu preko Supabase naloga. */
(() => {
  const E = window.OS_ENV || {};
  const sb = supabase.createClient(E.url, E.key, {
    db: { schema: "os" },
    auth: {
      storageKey: "skeylo-os-auth",
      persistSession: true,
      autoRefreshToken: true,
    },
  });

  /* ---------- auth ---------- */
  /* Svako ima svoj email + lozinku. Prva registracija i zaboravljena lozinka:
     /os/code šalje kod na email, ovde ga potvrđujemo i postavljamo lozinku. */
  let markAuthed;
  const authed = new Promise((r) => (markAuthed = r));
  let mySlug = null;
  try {
    localStorage.removeItem("skeylo-os-pass"); // stara timska lozinka
  } catch (e) {}

  const fail = (code, extra) => ({ code, ...extra });
  const netOr = (code) => (navigator.onLine === false ? "network" : code);

  /* Sesija važi samo za člana tima (os.people); inače je odmah gasimo. */
  async function member() {
    const { data, error } = await sb.rpc("my_slug");
    if (error) throw fail(netOr("failed"));
    mySlug = data || null;
    if (!mySlug) {
      await sb.auth.signOut({ scope: "local" });
      throw fail("not_member");
    }
    markAuthed();
    return mySlug;
  }

  const OS = {
    async session() {
      const { data } = await sb.auth.getSession();
      if (!data.session) return null;
      return member().catch(() => null);
    },
    async signIn(email, password) {
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error)
        throw fail(
          error.code === "invalid_credentials"
            ? "bad_login"
            : netOr(error.status === 429 ? "too_many" : "failed"),
        );
      return member();
    },
    /* kind: "new" (prva registracija) ili "reset" (zaboravljena lozinka) */
    async sendCode(email, kind) {
      let r;
      try {
        r = await fetch("/os/code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, kind }),
        });
      } catch (e) {
        throw fail("network");
      }
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw fail(j.error || "failed", { wait: j.wait });
      return j;
    },
    async setPassword(email, code, password) {
      /* kod važi jednom: ako je potvrđen a lozinka odbijena, ponovni pokušaj
         koristi već otvorenu sesiju */
      if ((await OS.email()) !== email) {
        const v = await sb.auth.verifyOtp({
          email,
          token: code,
          type: "recovery",
        });
        if (v.error)
          throw fail(
            v.error.code === "otp_expired"
              ? "bad_code"
              : netOr(v.error.status === 429 ? "too_many" : "failed"),
          );
      }
      const { error } = await sb.auth.updateUser({ password });
      if (error && error.code !== "same_password")
        throw fail(error.code === "weak_password" ? "weak" : netOr("failed"));
      return member();
    },
    async email() {
      const { data } = await sb.auth.getSession();
      return (data.session && data.session.user.email) || "";
    },
    async signOut() {
      await sb.auth.signOut({ scope: "local" });
    },
    /* Potvrda opasne radnje: tvoja lozinka, proverena u zasebnoj sesiji
       koja se odmah gasi (ne dira prijavu na ovom uređaju). */
    async verify(password) {
      const email = password && mySlug && (await OS.email());
      if (!email) return false;
      const probe = supabase.createClient(E.url, E.key, {
        auth: {
          storageKey: "skeylo-os-verify",
          persistSession: false,
          autoRefreshToken: false,
        },
      });
      const { error } = await probe.auth.signInWithPassword({
        email,
        password,
      });
      if (!error) probe.auth.signOut({ scope: "local" }).catch(() => {});
      return !error;
    },
  };
  window.OS = OS;

  /* ---------- documents ---------- */
  const cols = new Map(); // col -> {docs: Map<id,data>, listeners:Set, loaded}
  const known = new Map(); // "col/id" -> poslednja primenjena verzija
  const pending = new Map(); // "col/id" -> broj upisa u toku
  const late = new Map(); // "col/id" -> tuđa izmena stigla dok je naš upis bio u toku
  const tomb = new Map(); // "col/id" -> verzija u trenutku brisanja

  const key = (c, id) => c + "/" + id;
  const clone = (x) =>
    typeof structuredClone === "function"
      ? structuredClone(x)
      : JSON.parse(JSON.stringify(x));
  const plain = (x) => JSON.parse(JSON.stringify(x ?? {}));
  const newId = () => {
    const a = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const r = crypto.getRandomValues(new Uint8Array(20));
    return Array.from(r, (n) => a[n % a.length]).join("");
  };

  function colState(c) {
    let s = cols.get(c);
    if (!s)
      cols.set(
        c,
        (s = {
          docs: new Map(),
          listeners: new Set(),
          loaded: false,
          queued: false,
        }),
      );
    return s;
  }

  function snapshot(s) {
    const docs = [...s.docs.entries()]
      .sort(([ia, a], [ib, b]) => {
        const oa = typeof a.order === "number" ? a.order : Infinity;
        const ob = typeof b.order === "number" ? b.order : Infinity;
        return oa === ob ? (ia < ib ? -1 : ia > ib ? 1 : 0) : oa < ob ? -1 : 1;
      })
      .map(([id, d]) => ({ id, exists: true, data: () => clone(d) }));
    return { docs, size: docs.length, empty: !docs.length };
  }

  function emit(c) {
    const s = cols.get(c);
    if (!s || !s.loaded || s.queued) return;
    s.queued = true;
    queueMicrotask(() => {
      s.queued = false;
      const snap = snapshot(s);
      s.listeners.forEach((fn) => {
        try {
          fn(snap);
        } catch (e) {
          console.error(e);
        }
      });
    });
  }

  function remoteRow(row) {
    const s = cols.get(row.col);
    if (!s) return;
    const k = key(row.col, row.id);
    if (pending.get(k)) {
      late.set(k, row);
      return;
    }
    if ((known.get(k) || 0) >= row.v) return;
    if (tomb.has(k) && tomb.get(k) >= row.v) return;
    known.set(k, row.v);
    s.docs.set(row.id, row.data || {});
    emit(row.col);
  }

  function remoteDelete(old) {
    const s = cols.get(old.col);
    if (!s) return;
    const k = key(old.col, old.id);
    tomb.set(k, Math.max(tomb.get(k) || 0, known.get(k) || 0));
    if (pending.get(k)) {
      late.set(k, { del: old });
      return;
    }
    if (s.docs.delete(old.id)) emit(old.col);
  }
  /* posle našeg upisa primeni ono što je u međuvremenu stiglo (inače bi se izgubilo) */
  function replayLate(k) {
    const r = late.get(k);
    if (!r) return;
    late.delete(k);
    if (!r.del) return remoteRow(r);
    if ((known.get(k) || 0) > (tomb.get(k) || 0)) return; // naš upis je noviji od brisanja
    const s = cols.get(r.del.col);
    if (s && s.docs.delete(r.del.id)) emit(r.del.col);
  }

  /* Jedan Realtime kanal za sve kolekcije. Kolekcija pretplaćena posle pravljenja
     kanala (npr. "focus" stigne tik pre ostalih) pravi nov kanal sa svima, pa se
     stari gasi tek kad je novi povezan. Posle povezivanja se dopuni sve što se
     upisalo dok kanal nije slušao (redovi sa v većim od poznatog). */
  let channel = null,
    chanN = 0,
    chanQ = false;
  const subscribed = new Set();
  function listen(c) {
    if (subscribed.has(c)) return;
    subscribed.add(c);
    if (chanQ) return;
    chanQ = true;
    queueMicrotask(() => {
      chanQ = false;
      const old = channel,
        ch = (channel = sb.channel("os-docs-" + ++chanN));
      subscribed.forEach((col) => {
        ch.on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "os",
            table: "docs",
            filter: "col=eq." + col,
          },
          (p) => remoteRow(p.new),
        );
        ch.on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "os",
            table: "docs",
            filter: "col=eq." + col,
          },
          (p) => remoteRow(p.new),
        );
      });
      // DELETE se ne može filtrirati; old nosi primarni ključ (col, id).
      ch.on(
        "postgres_changes",
        { event: "DELETE", schema: "os", table: "docs" },
        (p) => remoteDelete(p.old),
      );
      let up = false;
      ch.subscribe((status) => {
        if (status !== "SUBSCRIBED" || channel !== ch) return;
        if (up) {
          // posle prekida veze povuci sve iznova da ništa ne promakne
          subscribed.forEach(load);
          return;
        }
        up = true;
        if (old) sb.removeChannel(old);
        subscribed.forEach((col) =>
          (colState(col).loadP || Promise.resolve()).then(() => catchUp(col)),
        );
      });
    });
  }
  /* izmene posle učitavanja, a pre nego što je kanal počeo da sluša */
  async function catchUp(c) {
    let max = 0;
    const pre = c + "/";
    known.forEach((v, k) => {
      if (k.startsWith(pre) && v > max) max = v;
    });
    const { data, error } = await sb
      .from("docs")
      .select("id,data,v")
      .eq("col", c)
      .gt("v", max);
    if (error || !data) return;
    data.forEach((r) => remoteRow({ col: c, ...r }));
  }

  async function fetchAll(c) {
    const rows = [];
    for (let from = 0; ; from += 1000) {
      const { data, error } = await sb
        .from("docs")
        .select("id,data,v")
        .eq("col", c)
        .range(from, from + 999);
      if (error) throw error;
      rows.push(...data);
      if (data.length < 1000) return rows;
    }
  }

  async function load(c) {
    const s = colState(c);
    for (let wait = 1000; ; wait = Math.min(wait * 2, 15000)) {
      try {
        const rows = await fetchAll(c);
        const seen = new Set();
        for (const r of rows) {
          const k = key(c, r.id);
          seen.add(r.id);
          if (pending.get(k)) continue;
          if ((known.get(k) || 0) > r.v || (tomb.has(k) && tomb.get(k) >= r.v))
            continue;
          known.set(k, r.v);
          s.docs.set(r.id, r.data || {});
        }
        if (s.loaded)
          for (const id of [...s.docs.keys()])
            if (!seen.has(id) && !pending.get(key(c, id))) s.docs.delete(id);
        s.loaded = true;
        emit(c);
        return;
      } catch (e) {
        console.warn("[os] učitavanje", c, e);
        await new Promise((r) => setTimeout(r, wait));
      }
    }
  }

  async function write(c, id, local, remote) {
    const k = key(c, id);
    const s = cols.get(c);
    const had = s && s.docs.has(id);
    const prev = had ? s.docs.get(id) : undefined;
    pending.set(k, (pending.get(k) || 0) + 1);
    if (s && s.loaded) {
      local(s);
      emit(c);
    }
    try {
      const { data: v, error } = await remote();
      if (error) throw error;
      if (typeof v === "number") known.set(k, Math.max(known.get(k) || 0, v));
    } catch (e) {
      if (s && s.loaded && pending.get(k) === 1) {
        had ? s.docs.set(id, prev) : s.docs.delete(id);
        emit(c);
      }
      throw {
        code:
          e && e.code === "42501"
            ? "not_granted"
            : e && e.code === "P0002"
              ? "not_found"
              : "failed",
        cause: e,
      };
    } finally {
      const n = pending.get(k) - 1;
      if (n) pending.set(k, n);
      else {
        pending.delete(k);
        replayLate(k);
      }
    }
  }

  function docRef(c, id) {
    return {
      id,
      path: key(c, id),
      set(data) {
        const d = plain(data);
        tomb.delete(key(c, id));
        return write(
          c,
          id,
          (s) => s.docs.set(id, d),
          () => sb.rpc("doc_set", { p_col: c, p_id: id, p_data: d }),
        );
      },
      update(patch) {
        const p = plain(patch);
        return write(
          c,
          id,
          (s) => s.docs.has(id) && s.docs.set(id, { ...s.docs.get(id), ...p }),
          () => sb.rpc("doc_update", { p_col: c, p_id: id, p_patch: p }),
        );
      },
      /* Upis samo ako je polje `field` u bazi i dalje `expect`; inače vraća
         { conflict: true, data } sa trenutnim dokumentom da pozivalac spoji izmene. */
      async updateIf(patch, field, expect) {
        const p = plain(patch),
          k = key(c, id);
        let out = {};
        await write(
          c,
          id,
          (s) => s.docs.has(id) && s.docs.set(id, { ...s.docs.get(id), ...p }),
          async () => {
            const r = await sb.rpc("doc_update_if", {
              p_col: c,
              p_id: id,
              p_patch: p,
              p_key: field,
              p_expect: expect == null ? "" : String(expect),
            });
            // baza još bez doc_update_if: običan upis kao ranije
            if (r.error && r.error.code === "PGRST202")
              return sb.rpc("doc_update", { p_col: c, p_id: id, p_patch: p });
            if (r.error) return r;
            out = r.data || {};
            return { data: out.conflict ? null : out.v };
          },
        );
        if (!out.conflict) return { conflict: false };
        const s = cols.get(c);
        if ((known.get(k) || 0) <= out.v) {
          known.set(k, out.v);
          if (s && s.loaded) {
            s.docs.set(id, out.data || {});
            emit(c);
          }
        }
        const d = s && s.loaded && s.docs.has(id) ? s.docs.get(id) : out.data;
        return { conflict: true, data: clone(d || {}) };
      },
      delete() {
        return write(
          c,
          id,
          (s) => s.docs.delete(id),
          async () => {
            const r = await sb.rpc("doc_delete", { p_col: c, p_id: id });
            if (!r.error) tomb.set(key(c, id), r.data);
            return r;
          },
        );
      },
      async get() {
        const s = cols.get(c);
        if (s && s.loaded && s.docs.has(id)) {
          const d = s.docs.get(id);
          return { id, exists: true, data: () => clone(d) };
        }
        const { data, error } = await sb
          .from("docs")
          .select("data")
          .eq("col", c)
          .eq("id", id)
          .maybeSingle();
        if (error) throw error;
        return {
          id,
          exists: !!data,
          data: () => (data ? data.data : undefined),
        };
      },
    };
  }

  function collection(c) {
    const q = {
      doc: (id) => docRef(c, id || newId()),
      orderBy: () => q,
      onSnapshot(fn) {
        const s = colState(c);
        s.listeners.add(fn);
        if (s.loaded) emit(c);
        else if (!s.loading) {
          s.loading = true;
          listen(c);
          s.loadP = load(c);
        }
        return () => s.listeners.delete(fn);
      },
    };
    return q;
  }

  const db = {
    collection,
    doc(path) {
      const i = path.indexOf("/");
      return docRef(path.slice(0, i), path.slice(i + 1));
    },
  };

  /* Fajlovi: app.js pravi "/_blob/<id>", a next.config to prepisuje na Storage. */
  const assets = {
    async upload(file) {
      const id = newId() + newId().slice(0, 8);
      const { error } = await sb.storage.from("os-assets").upload(id, file, {
        contentType: file.type || "application/octet-stream",
        cacheControl: "31536000",
        upsert: false,
      });
      if (error) throw { code: "not_granted", cause: error };
      return { id };
    },
    async delete(id) {
      const { error } = await sb.storage.from("os-assets").remove([id]);
      if (error) throw { code: "failed", cause: error };
    },
  };

  /* ---------- Final Creatives: originali u Supabase Storage (bucket "creatives") ----------
     Mali fajl ide jednim zahtevom, veći u delovima od 6 MB (TUS, nastavlja posle prekida).
     Granica po fajlu: OS_UPLOAD_MAX_MB (besplatan plan 50 MB; posle Supabase Pro samo podigni). */
  const BUCKET = "creatives",
    MAX_MB = Number(E.uploadMaxMB) || 50,
    PART = 6 * 1024 * 1024;
  const objKey = (path) => String(path).replace(/^creatives\//, "");
  const encKey = (k) => k.split("/").map(encodeURIComponent).join("/");
  const b64 = (s) => btoa(unescape(encodeURIComponent(s)));

  async function authHeaders() {
    const { data } = await sb.auth.getSession();
    const t = data.session && data.session.access_token;
    if (!t) throw { code: "not_granted" };
    return { authorization: "Bearer " + t, apikey: E.key };
  }
  function send(method, url, headers, body, onUp) {
    return new Promise((res, rej) => {
      const x = new XMLHttpRequest();
      x.open(method, url);
      for (const h in headers) x.setRequestHeader(h, headers[h]);
      if (onUp && x.upload)
        x.upload.onprogress = (e) => e.lengthComputable && onUp(e.loaded);
      x.onload = () => res(x);
      x.onerror = x.ontimeout = () => rej({ code: "network" });
      x.send(body === undefined ? null : body);
    });
  }
  function failOf(x) {
    const t = (x.responseText || "").toLowerCase();
    if (x.status === 413 || /too large|maximum allowed size|exceeded/.test(t))
      return { code: "too_large" };
    if (x.status === 415 || /mime|invalid_mime/.test(t))
      return { code: "unsupported_type" };
    if (x.status === 401 || x.status === 403) return { code: "not_granted" };
    return { code: "failed", status: x.status };
  }
  async function putOnce(file, type, key, onP) {
    const x = await send(
      "POST",
      `${E.url}/storage/v1/object/${BUCKET}/${encKey(key)}`,
      {
        ...(await authHeaders()),
        "content-type": type || "application/octet-stream",
        "cache-control": "max-age=31536000",
        "x-upsert": "true",
      },
      file,
      (n) => onP(n / file.size),
    );
    if (x.status < 200 || x.status >= 300) throw failOf(x);
  }
  async function putResumable(file, type, key, onP) {
    const meta = {
      bucketName: BUCKET,
      objectName: key,
      contentType: type || "application/octet-stream",
      cacheControl: "31536000",
    };
    const start = await send("POST", `${E.url}/storage/v1/upload/resumable`, {
      ...(await authHeaders()),
      "tus-resumable": "1.0.0",
      "upload-length": String(file.size),
      "upload-metadata": Object.entries(meta)
        .map(([k, v]) => k + " " + b64(v))
        .join(","),
      "x-upsert": "true",
    });
    const loc = start.getResponseHeader("location");
    if (start.status !== 201 || !loc) throw failOf(start);
    let off = 0,
      tries = 0;
    while (off < file.size) {
      try {
        const end = Math.min(file.size, off + PART);
        const x = await send(
          "PATCH",
          loc,
          {
            ...(await authHeaders()),
            "tus-resumable": "1.0.0",
            "upload-offset": String(off),
            "content-type": "application/offset+octet-stream",
          },
          file.slice(off, end),
          (n) => onP((off + n) / file.size),
        );
        if (x.status !== 204) throw failOf(x);
        off = Number(x.getResponseHeader("upload-offset")) || end;
        tries = 0;
        onP(off / file.size);
      } catch (e) {
        if (e.code !== "network" && e.code !== "failed") throw e;
        if (++tries > 5) throw e;
        await new Promise((r) => setTimeout(r, 800 * 2 ** tries));
        // posle prekida pitaj server dokle je stigao pa nastavi odatle
        const h = await send("HEAD", loc, {
          ...(await authHeaders()),
          "tus-resumable": "1.0.0",
        }).catch(() => null);
        const o = h && Number(h.getResponseHeader("upload-offset"));
        if (Number.isFinite(o)) off = o;
      }
    }
  }
  const maxLbl =
    MAX_MB >= 1024
      ? (MAX_MB / 1024).toFixed(1).replace(".0", "").replace(".", ",") + " GB"
      : MAX_MB + " MB";
  const storage = {
    maxBytes: MAX_MB * 1024 * 1024,
    maxLabel: maxLbl,
    /* koliko je zauzeto: { total, creatives, files, quota } u bajtovima
       (kvota plana: OS_STORAGE_GB, Supabase Pro = 100 GB) */
    async usage() {
      const { data, error } = await sb.rpc("storage_usage");
      if (error || !data) return null;
      return {
        total: Number(data.total) || 0,
        creatives: Number(data.creatives) || 0,
        files: Number(data.files) || 0,
        quota: (Number(E.storageGB) || 100) * 1073741824,
      };
    },
    async put(file, { type, path, onProgress }) {
      if (file.size > MAX_MB * 1024 * 1024)
        throw {
          code: "too_large",
          msg: `„${file.name || "Fajl"}“ je veći od ${maxLbl}. Smanji ga pa probaj ponovo.`,
        };
      const key = objKey(path),
        onP = (p) => onProgress && onProgress(Math.min(1, Math.max(0, p)));
      if (file.size <= PART) await putOnce(file, type, key, onP);
      else await putResumable(file, type, key, onP);
      return {
        url: sb.storage.from(BUCKET).getPublicUrl(key).data.publicUrl,
        path,
      };
    },
    async remove(path) {
      const { error } = await sb.storage.from(BUCKET).remove([objKey(path)]);
      if (error) throw { code: "failed", cause: error };
    },
  };
  // app.js postavlja window.SkeyloOS tek kad se učita; tada mu predaj skladište.
  addEventListener("DOMContentLoaded", () => {
    if (window.SkeyloOS && window.SkeyloOS.useStorage)
      window.SkeyloOS.useStorage(storage);
  });

  /* Jednom dnevno (po uređaju) obriši fajlove kreativa koje nijedan dokument ne
     pominje: prekinut upload, zatvoren tab. Baza vraća samo starije od 2 dana. */
  const SWEEP_KEY = "skeylo-os-sweep";
  authed.then(() =>
    setTimeout(async () => {
      try {
        if (Date.now() - (Number(localStorage.getItem(SWEEP_KEY)) || 0) < 864e5)
          return;
        localStorage.setItem(SWEEP_KEY, String(Date.now()));
      } catch (e) {
        return;
      }
      const { data, error } = await sb.rpc("creative_orphans", { p_days: 2 });
      if (error || !Array.isArray(data) || !data.length) return;
      const names = data.filter((n) => typeof n === "string" && n);
      for (let i = 0; i < names.length; i += 100)
        await sb.storage.from(BUCKET).remove(names.slice(i, i + 100));
      console.info("[os] obrisano fajlova bez kreative:", names.length);
    }, 20000),
  );

  /* ---------- prisustvo: ko je na kojoj stranici (Realtime Presence) ---------- */
  let here = null,
    hereAt = null;
  const hereFns = new Set();
  function hereChan() {
    if (here || !mySlug) return here;
    here = sb.channel("os-here", {
      config: { private: true, presence: { key: mySlug } },
    });
    here.on("presence", { event: "sync" }, () => {
      const st = here.presenceState(),
        out = {};
      for (const slug in st)
        out[slug] = [...new Set(st[slug].map((m) => m.at).filter(Boolean))];
      hereFns.forEach((fn) => {
        try {
          fn(out, mySlug);
        } catch (e) {
          console.error(e);
        }
      });
    });
    here.subscribe((s) => {
      if (s === "SUBSCRIBED") here.track({ at: hereAt });
    });
    return here;
  }
  /* at = "notes/<id>" ili null; fn(mapa slug -> [at...], moj slug) */
  OS.here = (at) => {
    hereAt = at || null;
    authed.then(() => {
      const ch = hereChan();
      if (ch && ch.state === "joined") ch.track({ at: hereAt });
    });
  };
  OS.onHere = (fn) => {
    hereFns.add(fn);
    authed.then(hereChan);
    return () => hereFns.delete(fn);
  };

  window.claude = {
    async use(name) {
      if (name !== "db" && name !== "assets") return null;
      await authed;
      return name === "db" ? db : assets;
    },
  };
})();
