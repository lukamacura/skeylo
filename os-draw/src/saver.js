/* Čuvanje dok se crta: nacrt u browseru posle svake izmene (za pad taba) i otpremanje
   posle 4 s mirovanja, najkasnije na 30 s. Svako čuvanje je novi par nepromenljivih
   fajlova; među-verzije OS briše kad se editor zatvori. */
import {
  getNonDeletedElements,
  hashElementsVersion,
} from "@excalidraw/excalidraw";
import { rpc } from "./bridge.js";
import { dataURLtoBlob, previewSvg, sceneText } from "./scene.js";

const IDLE = 4000;
const MAX_WAIT = 30000;
const RETRY = 8000;
const DRAFT = "skeylo-draw-draft:";
const DRAFT_DAYS = 14;

const store = {
  get(k) {
    try {
      return JSON.parse(localStorage.getItem(k));
    } catch (e) {
      return null;
    }
  },
  set(k, v) {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch (e) {}
  },
  del(k) {
    try {
      localStorage.removeItem(k);
    } catch (e) {}
  },
};

const draftKey = (doc, scene) => DRAFT + doc + ":" + scene;

export function readDraft(doc, scene) {
  if (!scene) return null;
  const d = store.get(draftKey(doc, scene));
  return d && Array.isArray(d.elements) ? d : null;
}

export function sweepDrafts() {
  try {
    const old = Date.now() - DRAFT_DAYS * 864e5;
    for (const k of Object.keys(localStorage))
      if (k.startsWith(DRAFT) && !((store.get(k) || {}).at > old)) store.del(k);
  } catch (e) {}
}

export function createSaver({ api, session, skFiles, restored, onStatus }) {
  let scene = session.scene || "";
  let baseline = restored ? -1 : null;
  let touched = !!restored;
  let dirty = !!restored;
  let firstDirty = restored ? Date.now() : 0;
  let timer = 0;
  let draftT = 0;
  let running = null;
  let dead = false;
  const known = { ...skFiles };

  const all = () => api().getSceneElementsIncludingDeleted();
  const live = () => getNonDeletedElements(all());
  const status = (s) => onStatus(s);

  function draftNow() {
    clearTimeout(draftT);
    /* nov crtež nema gde da se vrati dok nije prvi put sačuvan, a to traje par sekundi */
    if (!scene || !dirty || !api()) return;
    store.set(draftKey(session.doc, scene), {
      at: Date.now(),
      elements: live(),
    });
  }

  function arm(ms) {
    clearTimeout(timer);
    if (!dead) timer = setTimeout(tick, ms);
  }

  function tick() {
    if (dead || !dirty) return;
    const s = api().getAppState();
    if (
      s.newElement ||
      s.resizingElement ||
      s.selectedElementsAreBeingDragged ||
      s.editingTextElement ||
      s.multiElement
    )
      return arm(1500);
    save().catch(() => {});
  }

  async function write() {
    const elements = live();
    const stamp = hashElementsVersion(all());
    const appState = api().getAppState();
    const files = api().getFiles();
    /* prvo slike: scena čuva samo njihove linkove */
    for (const e of elements) {
      const id = e.type === "image" && e.fileId;
      if (!id || known[id] || !files[id]) continue;
      const f = files[id];
      const up = await rpc("upload", { blob: dataURLtoBlob(f.dataURL) });
      known[id] = { src: up.src, mimeType: f.mimeType, created: f.created };
    }
    const svg = await previewSvg(elements, appState, files);
    const text = sceneText(elements, appState, known);
    const a = await rpc("upload", {
      blob: new Blob([text], { type: "application/json" }),
    });
    const b = await rpc("upload", {
      blob: new Blob([svg], { type: "image/svg+xml" }),
    });
    await rpc("commit", { scene: a.id, src: b.src });
    const was = scene;
    scene = a.id;
    if (was) store.del(draftKey(session.doc, was));
    if (hashElementsVersion(all()) === stamp) {
      dirty = false;
      firstDirty = 0;
      baseline = stamp;
    } else {
      baseline = stamp;
      draftNow();
    }
  }

  /* jedno čuvanje u jednom trenutku; izmene nastale u toku čekaju sledeći krug */
  function save() {
    if (running) return running;
    if (!dirty || !live().length) return Promise.resolve();
    status("saving");
    running = write().then(
      () => {
        running = null;
        status(dirty ? "dirty" : "saved");
        if (dirty) arm(IDLE);
      },
      (err) => {
        running = null;
        status("error");
        arm(RETRY);
        throw err;
      },
    );
    return running;
  }

  return {
    touch() {
      touched = true;
    },
    change(elements) {
      if (dead) return;
      const hash = hashElementsVersion(elements);
      /* bez dodira korisnika promene su samo Excalidraw-ove (fontovi, restore) */
      if (baseline === null || (!touched && !dirty)) {
        baseline = hash;
        return;
      }
      if (hash === baseline) return;
      if (!dirty) {
        dirty = true;
        firstDirty = Date.now();
        status("dirty");
      }
      clearTimeout(draftT);
      draftT = setTimeout(draftNow, 800);
      arm(Math.max(0, Math.min(IDLE, firstDirty + MAX_WAIT - Date.now())));
    },
    draftNow,
    saveNow: () => save(),
    isEmpty: () => !live().length,
    async finish() {
      clearTimeout(timer);
      while (running) await running.catch(() => {});
      /* izmena nastala tokom čuvanja ide u sledeći krug; greška prekida zatvaranje */
      for (let n = 0; n < 3 && dirty && live().length; n++) await save();
      while (running) await running;
    },
    /* zatvoren editor: nacrt ostaje samo ako čuvanje nije uspelo */
    stop() {
      dead = true;
      clearTimeout(timer);
      clearTimeout(draftT);
    },
    clearDraft() {
      if (scene) store.del(draftKey(session.doc, scene));
    },
  };
}
