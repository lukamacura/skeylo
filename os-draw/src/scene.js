/* Format crteža. Fajlovi su nepromenljivi i žive u bucket-u os-assets:
   - scena: običan .excalidraw JSON bez slika, plus skFiles { fileId: { src, mimeType, created } }
   - preview: SVG (tamni izvoz, providna pozadina) sa umanjenim kopijama slika
   Markdown čuva samo: ![excalidraw:<id scene>](/_blob/<id svg>) */
import { exportToSvg, serializeAsJSON } from "@excalidraw/excalidraw";

/* boja u editoru je providna (vidi se pozadina OS-a), a u fajlu ostaje standardna bela */
export const VIEW_BG = "transparent";
const FILE_BG = "#ffffff";
const PREVIEW_MAX = 800;

const toDataURL = (blob) =>
  new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(fr.result);
    fr.onerror = rej;
    fr.readAsDataURL(blob);
  });

export function dataURLtoBlob(url) {
  const [head, body] = url.split(",");
  const mime = (head.match(/^data:([^;]+)/) || [])[1] || "image/png";
  if (!/;base64/.test(head))
    return new Blob([decodeURIComponent(body)], { type: mime });
  const bin = atob(body);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return new Blob([out], { type: mime });
}

/* slika koja ne može da se učita se preskače, a njen link ostaje u skFiles */
export async function loadScene(id) {
  const r = await fetch("/_blob/" + encodeURIComponent(id));
  if (!r.ok) throw new Error("scene " + r.status);
  const j = await r.json();
  if (!j || !Array.isArray(j.elements)) throw new Error("scene format");
  const skFiles = j.skFiles && typeof j.skFiles === "object" ? j.skFiles : {};
  const files = {};
  await Promise.all(
    Object.entries(skFiles).map(async ([fid, m]) => {
      try {
        const f = await fetch(m.src);
        if (!f.ok) return;
        files[fid] = {
          id: fid,
          mimeType: m.mimeType,
          created: m.created,
          dataURL: await toDataURL(await f.blob()),
        };
      } catch (e) {}
    }),
  );
  return { elements: j.elements, appState: j.appState || {}, files, skFiles };
}

export function sceneText(elements, appState, skFiles) {
  const used = {};
  for (const e of elements)
    if (e.type === "image" && e.fileId && skFiles[e.fileId])
      used[e.fileId] = skFiles[e.fileId];
  const j = JSON.parse(
    serializeAsJSON(
      elements,
      { ...appState, viewBackgroundColor: FILE_BG },
      {},
      "local",
    ),
  );
  j.skFiles = used;
  return JSON.stringify(j);
}

/* SVG u <img> ne može da učita spoljne fajlove, pa preview nosi umanjene kopije slika */
const small = new Map();
async function smallFile(f) {
  if (!f || !f.dataURL || /svg|gif/.test(f.mimeType || "")) return f;
  if (small.has(f.id)) return small.get(f.id);
  const im = new Image();
  im.src = f.dataURL;
  await im.decode();
  const big = Math.max(im.naturalWidth, im.naturalHeight);
  if (big <= PREVIEW_MAX && f.dataURL.length < 200000) {
    small.set(f.id, f);
    return f;
  }
  const k = Math.min(1, PREVIEW_MAX / big);
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(im.naturalWidth * k));
  c.height = Math.max(1, Math.round(im.naturalHeight * k));
  c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
  const jpeg = f.mimeType === "image/jpeg";
  /* Safari ne ume webp iz canvas-a i vraća png, što je i dalje ispravno */
  const dataURL = c.toDataURL(jpeg ? "image/jpeg" : "image/webp", 0.8);
  const mimeType = (dataURL.match(/^data:([^;]+)/) || [])[1] || f.mimeType;
  const out = { ...f, dataURL, mimeType };
  small.set(f.id, out);
  return out;
}

export async function previewSvg(elements, appState, files) {
  const list = {};
  for (const e of elements)
    if (e.type === "image" && e.fileId && files[e.fileId])
      try {
        list[e.fileId] = await smallFile(files[e.fileId]);
      } catch (err) {
        list[e.fileId] = files[e.fileId];
      }
  const svg = await exportToSvg({
    elements,
    appState: {
      ...appState,
      exportBackground: false,
      exportWithDarkMode: true,
      exportEmbedScene: false,
      viewBackgroundColor: VIEW_BG,
    },
    files: list,
    exportPadding: 8,
  });
  return new XMLSerializer().serializeToString(svg);
}
