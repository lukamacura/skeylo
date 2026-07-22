"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";

const GOLD = "#f0b656";

/**
 * Lightweight YouTube embed - renders a thumbnail facade and only loads
 * the iframe after the user clicks play (keeps the landing page fast).
 */
export default function YouTubePlayer({
  videoId,
  title,
  caption,
  aspect = "aspect-video",
}: {
  videoId: string;
  title: string;
  caption?: string;
  aspect?: string;
}) {
  const [playing, setPlaying] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ type: "spring", stiffness: 140, damping: 22 }}
      className={`group relative ${aspect} w-full overflow-hidden rounded-3xl border border-border card-glass`}
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
