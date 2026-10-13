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
  let markAuthed;
  const authed = new Promise((r) => (markAuthed = r));
  let mySlug = null;

  async function slugOf() {
    const { data, error } = await sb.rpc("my_slug");
    if (error) throw error;
    return data || null;
  }

  const OS = {
    async session() {
      const { data } = await sb.auth.getSession();
      if (!data.session) return null;
      mySlug = await slugOf();
      if (!mySlug) return null;
      markAuthed();
      return mySlug;
    },
    async signIn(email, password) {
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) throw { code: "bad_login" };
      mySlug = await slugOf();
      if (!mySlug) {
        await sb.auth.signOut();
        throw { code: "not_member" };
      }
      markAuthed();
      return mySlug;
    },
    async signOut() {
      await sb.auth.signOut();
    },
    /* Potvrda opasne radnje: ponovo proverava lozinku ulogovane osobe. */
    async verify(password) {
      if (!password) return false;
      const { data } = await sb.auth.getUser();
      const email = data.user && data.user.email;
      if (!email) return false;
      const { error } = await sb.auth.signInWithPassword({ email, password });
      return !error;
    },
    async emailFor(slug) {
      const { data } = await sb.rpc("login_email", { p_slug: slug });
      return data || "";
    },
  };
  window.OS = OS;

  /* ---------- documents ---------- */
  const cols = new Map(); // col -> {docs: Map<id,data>, listeners:Set, loaded}
  const known = new Map(); // "col/id" -> poslednja primenjena verzija
  const pending = new Map(); // "col/id" -> broj upisa u toku
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
    if (pending.get(k)) return;
    if ((known.get(k) || 0) >= row.v) return;
    if ((tomb.get(k) || 0) >= row.v) return;
    known.set(k, row.v);
    s.docs.set(row.id, row.data || {});
    emit(row.col);
  }

  function remoteDelete(old) {
    const s = cols.get(old.col);
    if (!s) return;
    const k = key(old.col, old.id);
    tomb.set(k, Math.max(tomb.get(k) || 0, known.get(k) || 0));
    if (pending.get(k)) return;
    if (s.docs.delete(old.id)) emit(old.col);
  }

  let channel = null;
  const subscribed = new Set();
  function listen(c) {
    subscribed.add(c);
    if (channel) return;
    // Svi onSnapshot pozivi u app.js idu u istom tick-u, pa jedan kanal pokriva sve kolekcije.
    queueMicrotask(() => {
      channel = sb.channel("os-docs");
      subscribed.forEach((col) => {
        channel.on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "os",
            table: "docs",
            filter: "col=eq." + col,
          },
          (p) => remoteRow(p.new),
        );
        channel.on(
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
      channel.on(
        "postgres_changes",
        { event: "DELETE", schema: "os", table: "docs" },
        (p) => remoteDelete(p.old),
      );
      channel.subscribe((status) => {
        // Posle prekida veze povuci sve iznova da ništa ne promakne.
        if (status === "SUBSCRIBED" && channel._osWasUp)
          subscribed.forEach(load);
        if (status === "SUBSCRIBED") channel._osWasUp = true;
      });
    });
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
          if ((known.get(k) || 0) > r.v || (tomb.get(k) || 0) >= r.v) continue;
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
      n ? pending.set(k, n) : pending.delete(k);
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
          load(c);
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
  };

  window.claude = {
    async use(name) {
      if (name !== "db" && name !== "assets") return null;
      await authed;
      return name === "db" ? db : assets;
    },
  };
})();
