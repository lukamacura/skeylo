"use client";

import { useEffect, useRef } from "react";

type Props = {
  /** Promeni vrednost da ponovo ispališ. */
  fire: number;
  colors: string[];
};

/**
 * Lagani canvas confetti bez zavisnosti. Ispaljuje se jednom po `fire` promeni,
 * traje ~2s i sam se čisti. Poštuje prefers-reduced-motion.
 */
export default function Confetti({ fire, colors }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!fire) return;
    const canvas = ref.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = (canvas.width = canvas.offsetWidth * dpr);
    const h = (canvas.height = canvas.offsetHeight * dpr);

    type P = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      rot: number;
      vr: number;
      color: string;
      shape: 0 | 1;
      life: number;
    };

    const count = 140;
    const particles: P[] = Array.from({ length: count }, (_, i) => {
      const side = i % 2 === 0 ? -1 : 1;
      const angle = -Math.PI / 2 + side * (Math.random() * 0.6 + 0.15);
      const speed = (Math.random() * 9 + 7) * dpr;
      return {
        x: w / 2 + side * w * 0.18,
        y: h * 0.55,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: (Math.random() * 4 + 3) * dpr,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        color: colors[i % colors.length],
        shape: Math.random() > 0.5 ? 0 : 1,
        life: 1,
      };
    });

    let raf = 0;
    const start = performance.now();
    const gravity = 0.32 * dpr;

    const tick = (now: number) => {
      const t = (now - start) / 1000;
      ctx.clearRect(0, 0, w, h);
      let alive = false;
      for (const p of particles) {
        p.vy += gravity;
        p.vx *= 0.985;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.life = Math.max(0, 1 - Math.max(0, t - 1.2) / 0.8);
        if (p.life <= 0 || p.y > h + 20) continue;
        alive = true;
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        if (p.shape === 0) ctx.fillRect(-p.r, -p.r * 0.6, p.r * 2, p.r * 1.2);
        else {
          ctx.beginPath();
          ctx.arc(0, 0, p.r * 0.7, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
      if (alive && t < 2.4) raf = requestAnimationFrame(tick);
      else ctx.clearRect(0, 0, w, h);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [fire, colors]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[60] h-full w-full"
    />
  );
}
