/* Razgovor sa OS-om (notes.js) preko postMessage. Primamo samo od roditelja sa istog
   origin-a. rpc() čeka odgovor; uploaded fajlovi i Markdown su na strani OS-a. */
export const hosted = window.parent !== window;
const waiting = new Map();
const listeners = new Set();
let seq = 0;

export function post(type, data) {
  if (hosted)
    window.parent.postMessage({ skd: 1, type, ...data }, location.origin);
}

export function rpc(type, data, ms = 90000) {
  return new Promise((res, rej) => {
    const rid = ++seq;
    const timer = setTimeout(() => {
      waiting.delete(rid);
      rej(new Error("timeout"));
    }, ms);
    waiting.set(rid, { res, rej, timer });
    post(type, { ...data, rid });
  });
}

export function onMessage(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

window.addEventListener("message", (e) => {
  const m = e.data;
  if (e.origin !== location.origin || e.source !== window.parent) return;
  if (!m || m.skd !== 1) return;
  if (m.type === "reply") {
    const w = waiting.get(m.rid);
    if (!w) return;
    waiting.delete(m.rid);
    clearTimeout(w.timer);
    if (m.ok) w.res(m.value);
    else w.rej(new Error(m.error || "failed"));
    return;
  }
  listeners.forEach((fn) => fn(m));
});
