"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Play } from "lucide-react";

const GOLD = "#f0b656";

const hidden = { opacity: 0, y: 24 };
const shown = { opacity: 1, y: 0 };

/**
 * Lightweight YouTube embed - renders a thumbnail facade and only loads
 * the iframe after the user clicks play (keeps the landing page fast).
 *
 * `revealDelay` (seconds) keeps the player invisible after mount, e.g. while
 * a hero intro animation is still running. The reveal fires once the delay
 * has passed AND the player is in view, so scrolling to it later never waits.
 */
export default function YouTubePlayer({
  videoId,
  title,
  caption,
  aspect = "aspect-video",
  revealDelay = 0,
}: {
  videoId: string;
  title: string;
  caption?: string;
  aspect?: string;
  /** Seconds after mount before the player may appear. */
  revealDelay?: number;
}) {
  const [playing, setPlaying] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [ready, setReady] = useState(revealDelay <= 0);

  useEffect(() => {
    if (revealDelay <= 0) return;
    const t = window.setTimeout(() => setReady(true), revealDelay * 1000);
    return () => window.clearTimeout(t);
  }, [revealDelay]);

  const visible = ready && inView;

  return (
    <motion.div
      ref={ref}
      initial={hidden}
      animate={visible ? shown : hidden}
      transition={{ type: "spring", stiffness: 140, damping: 22 }}
      className={`group relative ${aspect} w-full overflow-hidden rounded-3xl border border-border card-glass ${
        visible ? "" : "pointer-events-none"
      }`}
    >
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 size-full"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`Pusti video: ${title}`}
          className="absolute inset-0 flex flex-col items-center justify-center gap-4"
        >
          {/* thumbnail */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`}
            alt=""
            aria-hidden
            loading="lazy"
            className="absolute inset-0 size-full object-cover"
          />
          {/* dark overlay + glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[#0a0a0a]/50"
            style={{
              background: `radial-gradient(circle at 50% 40%, ${GOLD}1f, #0a0a0acc 75%)`,
            }}
          />
          {/* play button */}
          <span
            className="relative inline-flex size-20 items-center justify-center rounded-full border border-[#f0b656]/40 bg-[#0a0a0a]/40 backdrop-blur transition-transform group-hover:scale-110"
            style={{ boxShadow: `0 0 40px -6px ${GOLD}66` }}
          >
            <Play className="size-8 translate-x-0.5 fill-[#f0b656] text-[#f0b656]" />
          </span>
          {caption && (
            <span className="relative px-4 text-sm text-white/80">
              {caption}
            </span>
          )}
        </button>
      )}
    </motion.div>
  );
}
