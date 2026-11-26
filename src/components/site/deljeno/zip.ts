// ZIP bez kompresije koji se pravi dok fajlovi stižu (slike, video i PDF su već
// kompresovani). Svaki fajl ide kao lokalno zaglavlje + podaci + data descriptor
// (CRC i veličina posle podataka), pa ništa ne mora da se čita dvaput. Bez ZIP64:
// do 4 GB ukupno. Upis ide u izabrani fajl na disku (showSaveFilePicker, Chrome i Edge)
// ili u Blob u memoriji (ostali pregledači).

export type ZipEntry = { path: string; url: string; size: number };

export const ZIP_MAX = 4e9;

const CRC_T = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crcStep(c: number, u: Uint8Array) {
  for (let j = 0; j < u.length; j++) c = CRC_T[(c ^ u[j]) & 255] ^ (c >>> 8);
  return c;
}

type Sink = {
  write(b: Uint8Array | Blob): Promise<void>;
  /* podaci jednog fajla: u memoriji se skupe pa postanu jedan Blob */
  chunk(u: Uint8Array): Promise<void>;
  endFile(): Promise<void>;
  close(): Promise<Blob | null>;
  abort(): Promise<void>;
};

type Writable = {
  write(d: BufferSource | Blob): Promise<void>;
  close(): Promise<void>;
  abort(): Promise<void>;
};
type SaveHandle = { createWritable(): Promise<Writable> };
type PickerWindow = Window & {
  showSaveFilePicker?: (o: {
    suggestedName: string;
    types: { description: string; accept: Record<string, string[]> }[];
  }) => Promise<SaveHandle>;
};

/* Mora da se pozove odmah iz klika (pre prvog await-a), inače pregledač odbije prozor.
   null = nema prozora za čuvanje, pakuje se u memoriji. Odustajanje baca AbortError. */
export function pickTarget(name: string): Promise<SaveHandle> | null {
  const w = window as PickerWindow;
  if (typeof w.showSaveFilePicker !== "function") return null;
  return w.showSaveFilePicker({
    suggestedName: name,
    types: [{ description: "ZIP", accept: { "application/zip": [".zip"] } }],
  });
}

async function diskSink(h: SaveHandle): Promise<Sink> {
  const w = await h.createWritable();
  return {
    write: (b) => w.write(b as BufferSource | Blob),
    chunk: (u) => w.write(u as BufferSource),
    endFile: async () => {},
    close: async () => {
      await w.close();
      return null;
    },
    abort: () => w.abort().catch(() => {}),
  };
}

function memSink(): Sink {
  const parts: BlobPart[] = [];
  let cur: BlobPart[] = [];
  return {
    write: async (b) => {
      parts.push(b as BlobPart);
    },
    chunk: async (u) => {
      cur.push(u as BlobPart);
    },
    endFile: async () => {
      parts.push(new Blob(cur));
      cur = [];
    },
    close: async () => new Blob(parts, { type: "application/zip" }),
    abort: async () => {
      parts.length = 0;
      cur = [];
    },
  };
}

function dosTime(d: Date) {
  return {
    tm:
      ((d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1)) &
      65535,
    dt:
      (((d.getFullYear() - 1980) << 9) |
        ((d.getMonth() + 1) << 5) |
        d.getDate()) &
      65535,
  };
}

function bytes(fields: [number, number, 2 | 4][], len: number) {
  const v = new DataView(new ArrayBuffer(len));
  for (const [o, x, n] of fields)
    if (n === 4) v.setUint32(o, x >>> 0, true);
    else v.setUint16(o, x, true);
  return new Uint8Array(v.buffer);
}

/* Pakuje entries; onP(0..1) po bajtovima. Vraća Blob kad se pakuje u memoriji,
   null kad je upisano u fajl na disku. */
export async function buildZip(
  entries: ZipEntry[],
  target: Promise<SaveHandle> | null,
  onP: (p: number) => void,
  signal?: AbortSignal,
): Promise<Blob | null> {
  const total = entries.reduce((a, e) => a + (e.size || 0), 0) || 1;
  if (total > ZIP_MAX)
    throw Object.assign(new Error("zip_big"), { code: "zip_big" });
  const sink = target ? await diskSink(await target) : memSink();
  const enc = new TextEncoder(),
    { tm, dt } = dosTime(new Date()),
    cen: Uint8Array[] = [];
  let off = 0,
    done = 0;
  try {
    for (const e of entries) {
      const nm = enc.encode(e.path),
        flags = 0x0808; /* bit 3: data descriptor, bit 11: UTF-8 imena */
      const lh = bytes(
        [
          [0, 0x04034b50, 4],
          [4, 20, 2],
          [6, flags, 2],
          [8, 0, 2],
          [10, tm, 2],
          [12, dt, 2],
          [26, nm.length, 2],
        ],
        30,
      );
      await sink.write(lh);
      await sink.write(nm);
      const r = await fetch(e.url, { signal });
      if (!r.ok || !r.body) throw new Error("fetch");
      const rd = r.body.getReader();
      let c = 0xffffffff,
        sz = 0;
      for (;;) {
        const { done: end, value } = await rd.read();
        if (end) break;
        c = crcStep(c, value);
        sz += value.length;
        done += value.length;
        await sink.chunk(value);
        onP(Math.min(0.999, done / total));
      }
      await sink.endFile();
      const crc = (c ^ 0xffffffff) >>> 0;
      if (off + 30 + nm.length + sz + 16 > 0xffffffff)
        throw Object.assign(new Error("zip_big"), { code: "zip_big" });
      await sink.write(
        bytes(
          [
            [0, 0x08074b50, 4],
            [4, crc, 4],
            [8, sz, 4],
            [12, sz, 4],
          ],
          16,
        ),
      );
      cen.push(
        bytes(
          [
            [0, 0x02014b50, 4],
            [4, 20, 2],
            [6, 20, 2],
            [8, flags, 2],
            [10, 0, 2],
            [12, tm, 2],
            [14, dt, 2],
            [16, crc, 4],
            [20, sz, 4],
            [24, sz, 4],
            [28, nm.length, 2],
            [42, off, 4],
          ],
          46,
        ),
        nm,
      );
      off += 30 + nm.length + sz + 16;
    }
    let cs = 0;
    for (const b of cen) {
      await sink.write(b);
      cs += b.length;
    }
    const n = entries.length;
    await sink.write(
      bytes(
        [
          [0, 0x06054b50, 4],
          [8, n, 2],
          [10, n, 2],
          [12, cs, 4],
          [16, off, 4],
        ],
        22,
      ),
    );
    onP(1);
    return await sink.close();
  } catch (err) {
    await sink.abort();
    throw err;
  }
}

/* imena u arhivi: bez znakova koje Windows ili macOS ne prihvataju, bez duplikata */
export function safeSeg(s: string) {
  const v = String(s || "")
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, "-")
    .replace(/^\.+/, "")
    .trim();
  return v || "Fajl";
}

export function uniquePaths(paths: string[]) {
  const seen = new Set<string>();
  return paths.map((p) => {
    let q = p,
      i = 2;
    while (seen.has(q.toLowerCase())) {
      const m = /^(.*?)(\.[^./]{1,8})?$/.exec(p)!;
      q = `${m[1]} (${i++})${m[2] || ""}`;
    }
    seen.add(q.toLowerCase());
    return q;
  });
}
