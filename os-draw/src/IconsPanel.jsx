/* Tab "Ikone" u bočnoj traci: kategorije i pretraga, jer ih biblioteka Excalidraw-a nema.
   Klik ubacuje ikonicu na sredinu ekrana, a prevlačenje tamo gde je pustiš. */
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CaptureUpdateAction,
  MIME_TYPES,
  exportToSvg,
  getCommonBounds,
  restoreElements,
  serializeLibraryAsJSON,
  useDevice,
  viewportCoordsToSceneCoords,
} from "@excalidraw/excalidraw";

const fold = (s) =>
  String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "dj");

const rid = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(12)), (n) =>
    n.toString(36).padStart(2, "0"),
  ).join("");

let thumbs = null;
async function loadThumbs(items) {
  if (thumbs) return thumbs;
  const out = {};
  await Promise.all(
    items.map(async (it) => {
      const svg = await exportToSvg({
        elements: it.elements,
        appState: {
          exportBackground: false,
          exportWithDarkMode: true,
          viewBackgroundColor: "transparent",
        },
        files: null,
        exportPadding: 0,
        skipInliningFonts: true,
      });
      svg.removeAttribute("width");
      svg.removeAttribute("height");
      out[it.id.replace(/^sk-/, "")] = svg.outerHTML;
    }),
  );
  thumbs = out;
  return out;
}

function insert(api, item, nth, closeAfter) {
  const a = api();
  if (!a) return;
  const st = a.getAppState();
  const c = viewportCoordsToSceneCoords(
    {
      clientX: st.offsetLeft + st.width / 2,
      clientY: st.offsetTop + st.height / 2,
    },
    st,
  );
  const off = (nth % 6) * 16;
  const [x1, y1, x2, y2] = getCommonBounds(item.elements);
  const dx = c.x + off - (x1 + x2) / 2;
  const dy = c.y + off - (y1 + y2) / 2;
  const gid = rid();
  const copies = restoreElements(
    item.elements.map((e) => ({
      ...e,
      id: rid(),
      x: e.x + dx,
      y: e.y + dy,
      groupIds: [gid],
    })),
    null,
  );
  a.updateScene({
    elements: [...a.getSceneElementsIncludingDeleted(), ...copies],
    appState: {
      selectedElementIds: Object.fromEntries(copies.map((e) => [e.id, true])),
      selectedGroupIds: { [gid]: true },
    },
    captureUpdate: CaptureUpdateAction.IMMEDIATELY,
  });
  /* na telefonu traka pokriva platno, pa se sklanja da se vidi ubačena ikonica */
  if (closeAfter) a.toggleSidebar({ name: "default", force: false });
}

export function IconsPanel({ api }) {
  const [lib, setLib] = useState(null);
  const [svg, setSvg] = useState(null);
  const [q, setQ] = useState("");
  const count = useRef(0);
  const device = useDevice();

  useEffect(() => {
    let on = true;
    import("../excalidraw-library/index.mjs").then(async (m) => {
      const cats = m.CATEGORIES;
      const items = m.libraryItems();
      const byId = Object.fromEntries(
        items.map((i) => [i.id.replace(/^sk-/, ""), i]),
      );
      if (on) setLib({ cats, byId });
      const t = await loadThumbs(items);
      if (on) setSvg(t);
    });
    return () => {
      on = false;
    };
  }, []);

  const shown = useMemo(() => {
    if (!lib) return [];
    const f = fold(q.trim());
    return lib.cats
      .map((c) => ({
        ...c,
        icons: c.icons.filter(
          (i) =>
            !f ||
            fold(i.name).includes(f) ||
            fold(c.name).includes(f) ||
            fold(i.kw).includes(f),
        ),
      }))
      .filter((c) => c.icons.length);
  }, [lib, q]);

  return (
    <div className="sk-icons">
      <input
        className="sk-q"
        type="search"
        placeholder="Pretraži ikone"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        aria-label="Pretraži ikone"
      />
      <div className="sk-scroll">
        {shown.map((c) => (
          <section key={c.id}>
            <h4>{c.name}</h4>
            <div className="sk-grid">
              {c.icons.map((i) => (
                <button
                  key={i.id}
                  type="button"
                  className="sk-i"
                  title={i.name}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData(
                      MIME_TYPES.excalidrawlib,
                      serializeLibraryAsJSON([lib.byId[i.id]]),
                    );
                  }}
                  onClick={() =>
                    insert(
                      api,
                      lib.byId[i.id],
                      count.current++,
                      device.editor.isMobile,
                    )
                  }
                >
                  <span
                    className="sk-ic"
                    dangerouslySetInnerHTML={{
                      __html: svg ? svg[i.id] || "" : "",
                    }}
                  />
                  <span className="sk-n">{i.name}</span>
                </button>
              ))}
            </div>
          </section>
        ))}
        {lib && !shown.length && <p className="sk-none">Nema takve ikonice.</p>}
      </div>
    </div>
  );
}
