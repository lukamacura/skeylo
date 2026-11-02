/* Pravi public/os-app/draw (statičke fajlove koje OS otvara u iframe-u). Pokreni posle
   svake izmene u os-draw:  cd os-draw && npm install && npm run build
   Rezultat se commituje, kao public/os-app/supabase.js. Next build ga ne dira. */
import { build } from "esbuild";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(here, "../public/os-app/draw");
const assets = path.join(out, "assets");
const pkgDist = path.join(
  here,
  "node_modules/@excalidraw/excalidraw/dist/prod",
);
/* Xiaolai (kineski, 12 od 13 MB) se ne kopira: taj tekst ide sistemskim fontom */
const FONTS = [
  "Excalifont",
  "Virgil",
  "Nunito",
  "Lilita",
  "ComicShanns",
  "Cascadia",
  "Liberation",
  "Assistant",
];

fs.rmSync(out, { recursive: true, force: true });

/* Excalidraw nema srpski, a interfejs je zaključan na engleski: ostali jezici se ne pakuju */
const onlyEnglish = {
  name: "only-english",
  setup(b) {
    b.onResolve({ filter: /locales\/.+\.js$/ }, (a) =>
      /locales\/(en|percentages)-/.test(a.path)
        ? null
        : { path: a.path, external: true },
    );
  },
};

const r = await build({
  absWorkingDir: here,
  entryPoints: { main: "src/main.jsx" },
  bundle: true,
  splitting: true,
  format: "esm",
  target: "es2020",
  jsx: "automatic",
  minify: true,
  conditions: ["production"],
  outdir: assets,
  entryNames: "[name]-[hash]",
  chunkNames: "[name]-[hash]",
  assetNames: "[name]-[hash]",
  metafile: true,
  logLevel: "warning",
  plugins: [onlyEnglish],
  loader: { ".woff2": "file" },
  define: {
    "process.env.NODE_ENV": '"production"',
    "import.meta.env": '{"PROD":true,"DEV":false,"MODE":"production"}',
  },
});

for (const f of FONTS)
  fs.cpSync(path.join(pkgDist, "fonts", f), path.join(out, "fonts", f), {
    recursive: true,
  });

const entry = (ext) =>
  path.basename(
    Object.keys(r.metafile.outputs).find(
      (p) => path.basename(p).startsWith("main-") && p.endsWith(ext),
    ),
  );
fs.writeFileSync(
  path.join(out, "index.html"),
  `<!doctype html>
<html lang="sr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex">
<title>Crtež</title>
<style>html,body,#root{height:100%;margin:0;overflow:hidden;background:#0b0806}</style>
<link rel="stylesheet" href="assets/${entry(".css")}">
<script>window.EXCALIDRAW_ASSET_PATH="/os-app/draw/";</script>
</head>
<body><div id="root"></div><script type="module" src="assets/${entry(".js")}"></script></body>
</html>
`,
);

const size = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).reduce((n, e) => {
    const p = path.join(dir, e.name);
    return n + (e.isDirectory() ? size(p) : fs.statSync(p).size);
  }, 0);
console.log(
  `public/os-app/draw: ${(size(out) / 1048576).toFixed(1)} MB, ${fs.readdirSync(assets).length} fajlova u assets`,
);
