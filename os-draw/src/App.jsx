/* Editor za blok Crtež. OS ga otvara u iframe-u: šalje "open", dobija "opened", a posle
   otprema fajlove i piše Markdown na zahtev ("upload", "commit", "finish"). */
import { useEffect, useMemo, useRef, useState } from "react";
import {
  DefaultSidebar,
  Excalidraw,
  MainMenu,
  Sidebar,
} from "@excalidraw/excalidraw";
import { hosted, onMessage, post, rpc } from "./bridge.js";
import { IconsPanel } from "./IconsPanel.jsx";
import { VIEW_BG, loadScene } from "./scene.js";
import { createSaver, readDraft, sweepDrafts } from "./saver.js";

const LIB_KEY = "skeylo-draw-library";

function personalLibrary() {
  try {
    const v = JSON.parse(localStorage.getItem(LIB_KEY));
    return Array.isArray(v) ? v : [];
  } catch (e) {
    return [];
  }
}

function savePersonal(items) {
  try {
    localStorage.setItem(
      LIB_KEY,
      JSON.stringify(items.filter((i) => !String(i.id).startsWith("sk-"))),
    );
  } catch (e) {}
}

/* teme OS-a stižu kao CSS promenljive, pa editor nosi iste boje */
function applyTheme(t) {
  if (!t) return;
  const s = document.documentElement.style;
  for (const [k, v] of Object.entries(t)) if (v) s.setProperty("--sk-" + k, v);
}

async function prepare(session) {
  const { libraryItems } = await import("../excalidraw-library/index.mjs");
  const library = [...personalLibrary(), ...libraryItems()];
  let data = { elements: [], appState: {}, files: {}, skFiles: {} };
  if (session.scene) data = await loadScene(session.scene);
  const draft = readDraft(session.doc, session.scene);
  if (draft) data = { ...data, elements: draft.elements };
  return {
    restored: !!draft,
    skFiles: data.skFiles,
    initial: {
      elements: data.elements,
      files: data.files,
      libraryItems: library,
      scrollToContent: true,
      appState: {
        ...data.appState,
        viewBackgroundColor: VIEW_BG,
        /* traka se kači uz platno i ne pokriva dugme Gotovo */
        defaultSidebarDockedPreference: true,
      },
    },
  };
}

const LABEL = {
  saving: "Čuvam…",
  saved: "Sačuvano",
  error: "Nije sačuvano",
};

function Top({ status, onDone, closing }) {
  return (
    <div className="sk-top">
      <span className={"sk-st" + (status === "error" ? " bad" : "")}>
        {closing ? "Čuvam…" : LABEL[status] || ""}
      </span>
      <button
        type="button"
        className="sk-done"
        onClick={onDone}
        disabled={closing}
      >
        Gotovo
      </button>
    </div>
  );
}

function Editor({ session, ready }) {
  const apiRef = useRef(null);
  const saverRef = useRef(null);
  const closingRef = useRef(false);
  const openedRef = useRef(false);
  const [status, setStatus] = useState(ready.restored ? "dirty" : "");
  const [closing, setClosing] = useState(false);

  if (!saverRef.current)
    saverRef.current = createSaver({
      api: () => apiRef.current,
      session,
      skFiles: ready.skFiles,
      restored: ready.restored,
      onStatus: setStatus,
    });
  const saver = saverRef.current;

  async function finish() {
    if (closingRef.current) return;
    closingRef.current = true;
    setClosing(true);
    /* tekst koji se još kuca se upisuje tek kad polje izgubi fokus */
    if (document.activeElement && document.activeElement.blur)
      document.activeElement.blur();
    await new Promise((r) => setTimeout(r, 30));
    try {
      if (saver.isEmpty()) await rpc("finish", { empty: true });
      else {
        await saver.finish();
        await rpc("finish", {});
      }
      saver.clearDraft();
    } catch (e) {
      closingRef.current = false;
      setClosing(false);
      setStatus("error");
      apiRef.current?.setToast?.({
        message: "Čuvanje nije uspelo. Proveri vezu i probaj ponovo.",
        closable: true,
        duration: 6000,
      });
    }
  }

  useEffect(() => {
    const touched = () => saver.touch();
    const key = (e) => {
      saver.touch();
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        finish();
      } else if (mod && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
        e.stopPropagation();
        saver.saveNow().catch(() => {});
      } else if (e.key === "Escape" && !mod) {
        const s = apiRef.current?.getAppState();
        const free =
          s &&
          !s.editingTextElement &&
          !s.editingLinearElement &&
          !s.editingGroupId &&
          !s.newElement &&
          !s.multiElement &&
          !s.openDialog &&
          !s.openMenu &&
          !s.openPopup &&
          !s.openSidebar &&
          s.activeTool.type === "selection" &&
          !document.querySelector(".Modal, .dropdown-menu, .context-menu");
        if (!free) return;
        e.stopPropagation();
        /* Excalidraw na Esc ne skida izbor: prvi Esc skida izbor, drugi zatvara */
        if (Object.keys(s.selectedElementIds || {}).length)
          apiRef.current.updateScene({
            appState: { selectedElementIds: {}, selectedGroupIds: {} },
          });
        else finish();
      }
    };
    const stop = onMessage((m) => {
      if (m.type === "requestFinish" && m.n === session.n) finish();
    });
    const hide = () => saver.draftNow();
    /* platno koje se ne promeni ne javlja onChange, a zavesa mora da se skloni */
    const shown = setTimeout(() => {
      if (openedRef.current) return;
      openedRef.current = true;
      post("opened", { n: session.n });
    }, 1500);
    window.addEventListener("pointerdown", touched, true);
    window.addEventListener("keydown", key, true);
    window.addEventListener("paste", touched, true);
    window.addEventListener("drop", touched, true);
    window.addEventListener("pagehide", hide);
    return () => {
      stop();
      clearTimeout(shown);
      saver.stop();
      window.removeEventListener("pointerdown", touched, true);
      window.removeEventListener("keydown", key, true);
      window.removeEventListener("paste", touched, true);
      window.removeEventListener("drop", touched, true);
      window.removeEventListener("pagehide", hide);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="sk-editor">
      <Excalidraw
        theme="dark"
        langCode="en"
        autoFocus
        handleKeyboardGlobally
        name={session.title || "Crtež"}
        initialData={ready.initial}
        excalidrawAPI={(a) => {
          apiRef.current = a;
          window.__skDraw = a;
        }}
        onChange={(elements) => {
          saver.change(elements);
          if (!openedRef.current) {
            openedRef.current = true;
            post("opened", { n: session.n });
          }
        }}
        onLibraryChange={savePersonal}
        UIOptions={{
          canvasActions: {
            changeViewBackgroundColor: false,
            toggleTheme: false,
            saveToActiveFile: false,
          },
        }}
        renderTopRightUI={(isMobile) =>
          isMobile ? null : (
            <Top status={status} onDone={finish} closing={closing} />
          )
        }
      >
        <MainMenu>
          <MainMenu.DefaultItems.LoadScene />
          <MainMenu.DefaultItems.Export />
          <MainMenu.DefaultItems.SaveAsImage />
          <MainMenu.DefaultItems.SearchMenu />
          <MainMenu.DefaultItems.Help />
          <MainMenu.DefaultItems.ClearCanvas />
        </MainMenu>
        <DefaultSidebar>
          <DefaultSidebar.TabTriggers>
            <Sidebar.TabTrigger tab="ikone" className="sk-tab">
              Ikone
            </Sidebar.TabTrigger>
          </DefaultSidebar.TabTriggers>
          <Sidebar.Tab tab="ikone">
            <IconsPanel api={() => apiRef.current} />
          </Sidebar.Tab>
        </DefaultSidebar>
      </Excalidraw>
      {/* na telefonu su gornja i donja traka pune alatki, pa Gotovo lebdi iznad donje */}
      <div className="sk-mobile-top">
        <Top status={status} onDone={finish} closing={closing} />
      </div>
    </div>
  );
}

export function App() {
  const [open, setOpen] = useState(null);

  useEffect(() => {
    sweepDrafts();
    const stop = onMessage((m) => {
      if (m.type === "close") {
        setOpen(null);
        return;
      }
      if (m.type !== "open") return;
      applyTheme(m.theme);
      setOpen({ session: m, ready: null });
      prepare(m).then(
        (ready) => {
          setOpen((o) =>
            o && o.session.n === m.n ? { session: m, ready } : o,
          );
        },
        () => post("failed", { n: m.n }),
      );
    });
    post("ready");
    return stop;
  }, []);

  const body = useMemo(() => {
    if (!hosted)
      return <p className="sk-alone">Crtež se otvara iz Skeylo OS-a.</p>;
    if (!open || !open.ready) return null;
    return (
      <Editor key={open.session.n} session={open.session} ready={open.ready} />
    );
  }, [open]);

  return body;
}
