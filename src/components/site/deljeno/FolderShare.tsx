"use client";

// Javni folder iz OS General-a (/f/<token>): fajlovi foldera i podfoldera za preuzimanje.
// Klik na karticu preuzme jedan fajl (Supabase ?download= daje pravo ime), „Preuzmi sve“
// i „Preuzmi“ kod podfoldera pakuju ZIP u pregledaču (zip.ts).
import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Download, Loader2, Play, X } from "lucide-react";
import {
  buildZip,
  pickTarget,
  safeSeg,
  uniquePaths,
  ZIP_MAX,
  type ZipEntry,
} from "./zip";

export type ShareFile = {
  id: string;
  name: string | null;
  type: string | null;
  size: number | null;
  blob: string;
  thumb: string | null;
  w: number | null;
  h: number | null;
  dur: number | null;
  folderId: string;
  createdAt: number | null;
};
export type ShareFolder = {
  id: string;
  name: string | null;
  color: string | null;
  parent: string | null;
  order: number | null;
};
export type ShareData = {
  id: string;
  name: string | null;
  color: string | null;
  folders: ShareFolder[];
  files: ShareFile[];
};

/* ista pravila kao u OS-u (notes.js: fkind, fext, EXTC, fsize, fdur) */
const kind = (f: ShareFile) =>
  /^image\//.test(f.type || "")
    ? "img"
    : /^video\//.test(f.type || "")
      ? "vid"
      : /^audio\//.test(f.type || "")
        ? "aud"
        : f.type === "application/pdf" || /\.pdf$/i.test(f.name || "")
          ? "pdf"
          : "doc";
const ext = (n: string | null) => {
  const m = /\.([a-z0-9]{1,5})$/i.exec(n || "");
  return m ? m[1].toUpperCase() : "FAJL";
};
const EXTC: Record<string, string> = {
  pdf: "#ff6b5b",
  doc: "#5b9cf0",
  docx: "#5b9cf0",
  pages: "#5b9cf0",
  txt: "#a89a88",
  md: "#a89a88",
  xls: "#4fbf7f",
  xlsx: "#4fbf7f",
  csv: "#4fbf7f",
  numbers: "#4fbf7f",
  ppt: "#f3b04c",
  pptx: "#f3b04c",
  key: "#f3b04c",
  zip: "#d9c35a",
  rar: "#d9c35a",
  "7z": "#d9c35a",
  psd: "#5bc8f0",
  ai: "#f3a04c",
  fig: "#a98bff",
  sketch: "#f3b04c",
  html: "#e0679a",
  mp3: "#a98bff",
  wav: "#a98bff",
  m4a: "#a98bff",
};
const typeColor = (f: ShareFile) =>
  EXTC[ext(f.name).toLowerCase()] ||
  (
    {
      img: "#4fbfa8",
      vid: "#e0679a",
      aud: "#a98bff",
      pdf: "#ff6b5b",
    } as Record<string, string>
  )[kind(f)] ||
  "#a89a88";
function fsize(b: number) {
  b = +b || 0;
  if (b < 1024) return b + " B";
  if (b < 1048576) return Math.round(b / 1024) + " KB";
  if (b < 1073741824)
    return (
      (b / 1048576).toFixed(b < 10485760 ? 1 : 0).replace(".", ",") + " MB"
    );
  return (b / 1073741824).toFixed(1).replace(".", ",") + " GB";
}
const fdur = (s: number | null) =>
  s && s > 0
    ? Math.floor(s / 60) + ":" + String(Math.round(s % 60)).padStart(2, "0")
    : "";
const baseName = (n: string | null) =>
  String(n || "Fajl").replace(/\.[a-z0-9]{1,5}$/i, "") || n || "Fajl";
const filesWord = (n: number) => {
  const d = n % 10,
    s = n % 100;
  return d === 1 && s !== 11
    ? "fajl"
    : d >= 2 && d <= 4 && (s < 12 || s > 14)
      ? "fajla"
      : "fajlova";
};
const okColor = (c: string | null, d: string) =>
  c && /^#[0-9a-f]{3,8}$/i.test(c) ? c : d;
const DEF = "#e1802c";

type Section = {
  id: string;
  path: string[]; // imena od korena (bez samog korena)
  color: string;
  files: ShareFile[];
  /* ovaj folder i svi ispod njega: putanje u arhivi relativne prema njemu */
  all: { f: ShareFile; rel: string[] }[];
};

function useSections(d: ShareData): Section[] {
  return useMemo(() => {
    const kids = new Map<string, ShareFolder[]>();
    for (const F of d.folders) {
      const p = F.parent || d.id;
      if (!kids.has(p)) kids.set(p, []);
      kids.get(p)!.push(F);
    }
    for (const L of kids.values())
      L.sort((a, b) => (a.order || 0) - (b.order || 0));
    const byFolder = new Map<string, ShareFile[]>();
    for (const f of d.files) {
      if (!byFolder.has(f.folderId)) byFolder.set(f.folderId, []);
      byFolder.get(f.folderId)!.push(f);
    }
    const out: Section[] = [];
    const seen = new Set<string>();
    /* vraća sve fajlove ispod (za „Preuzmi“ podfoldera), putanje relativne prema id */
    function walk(
      id: string,
      path: string[],
      color: string,
    ): { f: ShareFile; rel: string[] }[] {
      if (seen.has(id)) return [];
      seen.add(id);
      const own = byFolder.get(id) || [];
      const sec: Section = { id, path, color, files: own, all: [] };
      out.push(sec);
      const all = own.map((f) => ({ f, rel: [] as string[] }));
      for (const F of kids.get(id) || []) {
        const nm = F.name || "Folder";
        const sub = walk(F.id, [...path, nm], okColor(F.color, color));
        for (const x of sub) all.push({ f: x.f, rel: [nm, ...x.rel] });
      }
      sec.all = all;
      return all;
    }
    walk(d.id, [], okColor(d.color, DEF));
    return out.filter((s) => s.files.length);
  }, [d]);
}

type Job = { key: string; p: number; ac: AbortController } | null;

export default function FolderShare({
  data,
  base,
}: {
  data: ShareData;
  base: string;
}) {
  const sections = useSections(data);
  const root = sections.find((s) => s.id === data.id);
  const everything = useMemo(() => {
    /* „Preuzmi sve“: koren + svi podfolderi, kao u OS-u */
    const top = { id: data.id, all: [] as { f: ShareFile; rel: string[] }[] };
    for (const s of sections)
      for (const f of s.files) top.all.push({ f, rel: s.path });
    return top.all;
  }, [sections, data.id]);
  const total = everything.reduce((a, x) => a + (x.f.size || 0), 0);
  const color = okColor(data.color, DEF);
  const name = data.name || "Folder";
  const [job, setJob] = useState<Job>(null);
  const [err, setErr] = useState("");
  const jobRef = useRef<Job>(null);

  const dl = (f: ShareFile) =>
    `${base}${encodeURIComponent(f.blob)}?download=${encodeURIComponent(f.name || "Fajl")}`;
  const src = (b: string) => base + encodeURIComponent(b);

  async function zip(
    key: string,
    zipName: string,
    list: { f: ShareFile; rel: string[] }[],
  ) {
    if (jobRef.current) {
      if (jobRef.current.key === key) {
        jobRef.current.ac.abort();
      }
      return;
    }
    setErr("");
    const size = list.reduce((a, x) => a + (x.f.size || 0), 0);
    if (size > ZIP_MAX) {
      setErr("Folder je veći od 4 GB. Preuzmi fajlove pojedinačno.");
      return;
    }
    /* velika arhiva ide pravo na disk (Chrome, Edge); manja se spakuje u memoriji */
    let target: ReturnType<typeof pickTarget> = null;
    try {
      target =
        size > 300 * 1048576 ? pickTarget(safeSeg(zipName) + ".zip") : null;
    } catch {
      target = null;
    }
    const ac = new AbortController();
    const j = { key, p: 0, ac };
    jobRef.current = j;
    setJob(j);
    const paths = uniquePaths(
      list.map((x) =>
        [...x.rel.map(safeSeg), safeSeg(x.f.name || "Fajl")].join("/"),
      ),
    );
    const entries: ZipEntry[] = list.map((x, i) => ({
      path: paths[i],
      url: src(x.f.blob),
      size: x.f.size || 0,
    }));
    let last = 0;
    try {
      const blob = await buildZip(
        entries,
        target,
        (p) => {
          const now = performance.now();
          if (p < 1 && now - last < 120) return;
          last = now;
          setJob({ key, p, ac });
        },
        ac.signal,
      );
      if (blob) {
        const u = URL.createObjectURL(blob),
          a = document.createElement("a");
        a.href = u;
        a.download = safeSeg(zipName) + ".zip";
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(u), 60_000);
      }
    } catch (e) {
      const n = (e as { name?: string; code?: string }) || {};
      if (n.name !== "AbortError")
        setErr(
          n.code === "zip_big"
            ? "Folder je veći od 4 GB. Preuzmi fajlove pojedinačno."
            : "Pakovanje nije uspelo. Probaj ponovo ili preuzmi fajlove pojedinačno.",
        );
    } finally {
      jobRef.current = null;
      setJob(null);
    }
  }

  const count = everything.length;

  return (
    <main className="min-h-dvh pb-24" style={{ ["--fc" as string]: color }}>
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <header className="flex items-center pt-5 sm:pt-7">
          <Link
            href="/"
            aria-label="Skeylo"
            className="opacity-80 transition-opacity hover:opacity-100"
          >
            <Image
              src="/brand/logo.webp"
              alt="Skeylo"
              width={2000}
              height={717}
              className="h-7 w-auto"
              priority
            />
          </Link>
        </header>

        <section
          className="mt-8 sm:mt-12 flex flex-col gap-6 rounded-[28px] border p-5 sm:p-8 sm:flex-row sm:items-end"
          style={{
            background: `linear-gradient(110deg, color-mix(in srgb, var(--fc) 22%, #0e0d0b), #0e0d0b 70%)`,
          }}
        >
          <div className="flex min-w-0 flex-1 items-center gap-4 sm:gap-5">
            <FolderGlyph />
            <div className="min-w-0">
              <h1 className="break-words text-3xl font-bold leading-[1.05] sm:text-5xl">
                {name}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground tabular-nums sm:text-base">
                {count
                  ? `${count} ${filesWord(count)} · ${fsize(total)}`
                  : "Folder je prazan"}
              </p>
            </div>
          </div>
          {count > 1 && (
            <ZipButton
              big
              label="Preuzmi sve"
              job={job}
              k="all"
              onClick={() => zip("all", name, everything)}
            />
          )}
          {count === 1 && (
            <a
              href={dl(everything[0].f)}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-6 font-semibold text-primary-foreground transition hover:brightness-110"
            >
              <Download className="h-5 w-5" strokeWidth={2.2} />
              Preuzmi
            </a>
          )}
        </section>

        {err && (
          <p
            role="alert"
            className="mt-4 rounded-2xl border border-[#ff6b5b]/30 bg-[#ff6b5b]/10 px-4 py-3 text-sm text-[#ffb4aa]"
          >
            {err}
          </p>
        )}

        {sections.map((s, si) => (
          <section
            key={s.id}
            className={si === 0 && s === root ? "mt-8" : "mt-12"}
          >
            {s.path.length > 0 && (
              <div
                className="mb-4 flex items-center gap-3"
                style={{ ["--fc" as string]: s.color }}
              >
                <span
                  className="h-3 w-3 flex-none rounded-[4px]"
                  style={{ background: s.color }}
                  aria-hidden="true"
                />
                <h2 className="min-w-0 flex-1 truncate text-xl font-semibold sm:text-2xl">
                  {s.path.map((p, i) => (
                    <span key={i}>
                      {i > 0 && (
                        <span className="px-1.5 text-muted-foreground">/</span>
                      )}
                      {p}
                    </span>
                  ))}
                </h2>
                <span className="hidden text-sm text-muted-foreground tabular-nums sm:inline">
                  {s.all.length} {filesWord(s.all.length)}
                </span>
                {s.all.length > 1 && (
                  <ZipButton
                    label="Preuzmi"
                    job={job}
                    k={s.id}
                    onClick={() => zip(s.id, s.path[s.path.length - 1], s.all)}
                  />
                )}
              </div>
            )}
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
              {s.files.map((f, i) => (
                <li
                  key={f.id}
                  className="fs-in"
                  style={{ animationDelay: `${Math.min(i, 12) * 35}ms` }}
                >
                  <FileCard f={f} href={dl(f)} src={src} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <style>{`
        .fs-in { animation: fs-in .5s cubic-bezier(.2,.8,.2,1) backwards; }
        @keyframes fs-in { from { opacity: 0; transform: translateY(8px); } }
        @media (prefers-reduced-motion: reduce) { .fs-in { animation: none; } }
      `}</style>
    </main>
  );
}

function ZipButton({
  label,
  job,
  k,
  big,
  onClick,
}: {
  label: string;
  job: Job;
  k: string;
  big?: boolean;
  onClick: () => void;
}) {
  const mine = job && job.key === k;
  const busyElse = !!job && !mine;
  const pct = mine ? Math.round(job!.p * 100) : 0;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busyElse}
      aria-label={mine ? "Otkaži pakovanje" : label}
      className={
        "group relative inline-flex flex-none items-center justify-center gap-2 overflow-hidden font-semibold transition disabled:opacity-40 " +
        (big
          ? "h-12 rounded-2xl bg-primary px-6 text-primary-foreground hover:brightness-110"
          : "h-10 rounded-xl border bg-card px-4 text-sm hover:border-[color-mix(in_srgb,var(--fc)_60%,transparent)]")
      }
    >
      {mine && (
        <span
          aria-hidden="true"
          className={
            "absolute inset-y-0 left-0 transition-[width] duration-150 " +
            (big
              ? "bg-black/20"
              : "bg-[color-mix(in_srgb,var(--fc)_25%,transparent)]")
          }
          style={{ width: pct + "%" }}
        />
      )}
      <span className="relative inline-flex items-center gap-2">
        {mine ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin group-hover:hidden" />
            <X className="hidden h-4 w-4 group-hover:block" />
            <span className="tabular-nums">{pct}%</span>
          </>
        ) : (
          <>
            <Download
              className={big ? "h-5 w-5" : "h-4 w-4"}
              strokeWidth={2.2}
            />
            {label}
          </>
        )}
      </span>
    </button>
  );
}

function FileCard({
  f,
  href,
  src,
}: {
  f: ShareFile;
  href: string;
  src: (b: string) => string;
}) {
  const k = kind(f);
  const pic = f.thumb ? src(f.thumb) : k === "img" ? src(f.blob) : "";
  return (
    <a
      href={href}
      className="group flex h-full flex-col rounded-[22px] border bg-card p-2 transition duration-200 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--fc)_45%,transparent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fc)]"
      aria-label={`Preuzmi ${f.name || "fajl"}, ${fsize(f.size || 0)}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#15130f]">
        {pic ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={pic}
            alt=""
            loading="lazy"
            decoding="async"
            draggable={false}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <Sheet f={f} />
        )}
        {k === "vid" && (
          <span className="absolute bottom-2 left-2 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
            <Play className="h-3 w-3 fill-current" />
            {fdur(f.dur)}
          </span>
        )}
      </div>
      <div className="flex flex-1 items-end gap-2 px-1.5 pb-1 pt-2.5">
        <div className="min-w-0 flex-1">
          <p
            className="line-clamp-2 break-words text-sm font-medium leading-snug"
            title={f.name || ""}
          >
            {pic ? f.name || "Fajl" : baseName(f.name)}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
            {fsize(f.size || 0)}
          </p>
        </div>
        <span
          aria-hidden="true"
          className="grid h-9 w-9 flex-none place-items-center rounded-full border text-muted-foreground transition group-hover:border-transparent group-hover:bg-[var(--fc)] group-hover:text-[#120c07]"
        >
          <Download className="h-4 w-4" strokeWidth={2.2} />
        </span>
      </div>
    </a>
  );
}

/* fajl bez sličice: list papira sa presavijenim uglom i ekstenzijom (kao u OS-u) */
function Sheet({ f }: { f: ShareFile }) {
  const c = typeColor(f);
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div
        className="relative grid aspect-[3/4] w-[42%] place-items-center rounded-md bg-[#f4ebdc] shadow-[0_10px_30px_rgba(0,0,0,.45)] transition duration-300 group-hover:-rotate-2"
        style={{ clipPath: "polygon(0 0, 72% 0, 100% 21%, 100% 100%, 0 100%)" }}
      >
        <span
          aria-hidden="true"
          className="absolute right-0 top-0 h-[21%] w-[28%] rounded-bl-md"
          style={{ background: `color-mix(in srgb, ${c} 35%, #d9cdb8)` }}
        />
        <span
          className="font-[family-name:var(--font-display)] text-[clamp(14px,3.4vw,22px)] font-extrabold tracking-tight"
          style={{ color: c }}
        >
          {ext(f.name)}
        </span>
      </div>
    </div>
  );
}

function FolderGlyph() {
  return (
    <svg
      viewBox="0 0 64 52"
      className="h-14 w-16 flex-none sm:h-20 sm:w-24"
      aria-hidden="true"
    >
      <path
        d="M4 10a6 6 0 0 1 6-6h14.5a6 6 0 0 1 4.4 1.9L33 10h21a6 6 0 0 1 6 6v26a6 6 0 0 1-6 6H10a6 6 0 0 1-6-6z"
        style={{ fill: "color-mix(in srgb, var(--fc) 70%, #000)" }}
      />
      <path
        d="M4 18a6 6 0 0 1 6-6h44a6 6 0 0 1 6 6v24a6 6 0 0 1-6 6H10a6 6 0 0 1-6-6z"
        style={{ fill: "var(--fc)" }}
      />
    </svg>
  );
}
