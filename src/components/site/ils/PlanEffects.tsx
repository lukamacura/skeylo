"use client";

import { useEffect } from "react";

/* All the motion for the plan, as one effect over server-rendered markup. The
   page itself stays a server component, so the only JS this route adds is
   this file and the gate. */
export default function PlanEffects({ rootId }: { rootId: string }) {
  useEffect(() => {
    const root = document.getElementById(rootId);
    if (!root) return;

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hasIO = "IntersectionObserver" in window;
    const ac = new AbortController();
    const { signal } = ac;
    const observers: IntersectionObserver[] = [];
    let alive = true;

    const all = <T extends Element = HTMLElement>(sel: string) =>
      Array.from(root.querySelectorAll<T>(sel));

    /* Hero title: once the letters have landed, hand over to the shimmer */
    const okt = root.querySelector<HTMLElement>(".okt");
    const lastCh = okt?.querySelector<HTMLElement>(".ch:last-child");
    if (okt && lastCh && !reduce) {
      const shine = () => {
        if (!alive || !okt.querySelector(".ch")) return;
        okt.textContent = okt.getAttribute("aria-label");
        okt.removeAttribute("aria-label");
        okt.classList.add("shine");
      };
      const anim = lastCh.getAnimations?.()[0];
      if (anim) anim.finished.then(shine, () => {});
      else shine();
    }

    /* Count-up numbers */
    function countUp(el: HTMLElement) {
      const target = Number(el.dataset.count);
      const start = performance.now();
      const dur = 1500;
      const step = (now: number) => {
        if (!alive) return;
        const p = Math.min(Math.max((now - start) / dur, 0), 1);
        el.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 4))));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }

    /* Reveal on scroll */
    const targets = all(".rv, .lz, .featured, .totals");
    if (hasIO && !reduce) {
      all("[data-count]").forEach((el) => (el.textContent = "0"));
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((en) => {
            if (!en.isIntersecting) return;
            const t = en.target as HTMLElement;
            t.classList.add("in");
            if (t.matches(".totals, .featured"))
              t.querySelectorAll<HTMLElement>("[data-count]").forEach(countUp);
            io.unobserve(t);
          });
        },
        { threshold: 0.16, rootMargin: "0px 0px -6% 0px" },
      );
      targets.forEach((el) => io.observe(el));
      observers.push(io);
    } else {
      targets.forEach((el) => el.classList.add("in"));
    }

    /* Scroll: progress laser, parallax numbers, timeline fill */
    const bar = root.querySelector<HTMLElement>(".progress i");
    const nums = all(".bignum");
    const tl = root.querySelector<HTMLElement>(".tlwrap");
    const fill = root.querySelector<HTMLElement>(".tl-fill");
    const phases = all(".phase");
    const cue = root.querySelector<HTMLElement>(".cue");
    let ticking = false;
    function update() {
      ticking = false;
      if (!alive) return;
      /* read everything first, then write */
      const y = window.scrollY;
      const vh = window.innerHeight;
      const max = document.documentElement.scrollHeight - vh;
      const line = vh * 0.62;
      const numTops = reduce
        ? []
        : nums.map((n) => n.parentElement!.getBoundingClientRect());
      const tlRect = !reduce && tl ? tl.getBoundingClientRect() : null;
      const phaseTops = tlRect
        ? phases.map((ph) => ph.getBoundingClientRect().top)
        : [];

      if (bar)
        bar.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;
      cue?.classList.toggle("gone", y > 40);
      numTops.forEach((r, i) => {
        if (r.bottom > -200 && r.top < vh + 200)
          nums[i].style.transform =
            `translate3d(0,${(r.top * -0.14).toFixed(1)}px,0)`;
      });
      if (tlRect && fill) {
        const p = Math.min(Math.max((line - tlRect.top) / tlRect.height, 0), 1);
        fill.style.transform = `scaleY(${p.toFixed(3)})`;
        phases.forEach((ph, i) =>
          ph.classList.toggle("lit", phaseTops[i] < line),
        );
      }
    }
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }
    window.addEventListener("scroll", onScroll, { passive: true, signal });
    window.addEventListener("resize", onScroll, { signal });
    update();

    /* Desktop only: light follows the cursor */
    if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
      root.classList.add("fine");
      all(".task, .letter, .featured").forEach((c) => {
        c.addEventListener(
          "pointermove",
          (e) => {
            const r = c.getBoundingClientRect();
            c.style.setProperty("--mx", `${e.clientX - r.left}px`);
            c.style.setProperty("--my", `${e.clientY - r.top}px`);
          },
          { passive: true, signal },
        );
      });
    }

    /* Hero light dust */
    const hero = root.querySelector<HTMLElement>(".hero");
    const orbit = root.querySelector<SVGSVGElement>(".inf");
    const cv = root.querySelector<HTMLCanvasElement>(".dust");
    const ctx = !reduce && cv ? cv.getContext("2d") : null;
    type Mote = {
      x: number;
      y: number;
      r: number;
      v: number;
      a: number;
      s: number;
      dx: number;
      big: boolean;
    };
    let motes: Mote[] = [];
    let W = 0;
    let H = 0;
    let lastW = 0;
    let running = false;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    function mote(anywhere: boolean): Mote {
      const big = Math.random() < 0.1;
      return {
        x: Math.random() * W,
        y: anywhere ? Math.random() * H : H + 10,
        r: big ? Math.random() * 2.2 + 1.8 : Math.random() * 1.4 + 0.4,
        v: Math.random() * 0.35 + 0.1,
        a: Math.random() * 6.283,
        s: Math.random() * 0.02 + 0.006,
        dx: (Math.random() - 0.5) * 0.16,
        big,
      };
    }
    function size() {
      if (!cv || !ctx) return;
      const r = cv.getBoundingClientRect();
      /* mobile address bar resizes change the height only: keep the field */
      if (Math.abs(r.width - lastW) < 2 && motes.length) {
        H = r.height;
        return;
      }
      lastW = W = r.width;
      H = r.height;
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      motes = Array.from({ length: W < 600 ? 44 : 110 }, () => mote(true));
    }
    function frame() {
      if (!running || !alive || !ctx) return;
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < motes.length; i++) {
        const p = motes[i];
        p.y -= p.v;
        p.x += p.dx;
        p.a += p.s;
        if (p.y < -12) {
          motes[i] = mote(false);
          continue;
        }
        const al = (Math.sin(p.a) * 0.5 + 0.5) * (p.big ? 0.28 : 0.8) + 0.06;
        ctx.beginPath();
        ctx.fillStyle = `rgba(242,204,194,${al.toFixed(3)})`;
        ctx.arc(p.x, p.y, p.r, 0, 6.283);
        ctx.fill();
      }
      requestAnimationFrame(frame);
    }
    if (ctx) {
      size();
      window.addEventListener("resize", size, { signal });
    }

    /* Endless animations only run while their block is on screen */
    let heroVisible = true;
    function setHero(on: boolean) {
      hero?.classList.toggle("idle", !on);
      if (on) orbit?.unpauseAnimations?.();
      else orbit?.pauseAnimations?.();
      if (on && ctx && !running) {
        running = true;
        requestAnimationFrame(frame);
      } else if (!on) running = false;
    }
    const featured = root.querySelector<HTMLElement>(".featured");
    if (hasIO) {
      const live = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (en.target === hero) {
            heroVisible = en.isIntersecting;
            setHero(heroVisible && !document.hidden);
          } else en.target.classList.toggle("idle", !en.isIntersecting);
        });
      });
      if (hero) live.observe(hero);
      if (featured) live.observe(featured);
      observers.push(live);
    } else {
      setHero(true);
      featured?.classList.remove("idle");
    }
    document.addEventListener(
      "visibilitychange",
      () => setHero(heroVisible && !document.hidden),
      { signal },
    );

    return () => {
      alive = false;
      running = false;
      ac.abort();
      observers.forEach((o) => o.disconnect());
    };
  }, [rootId]);

  return null;
}
