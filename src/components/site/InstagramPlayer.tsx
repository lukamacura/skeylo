"use client";

import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Instagram, Play } from "lucide-react";

const GOLD = "#f0b656";

/**
 * Lightweight Instagram embed - mirrors `YouTubePlayer`: renders a local
 * thumbnail facade and only loads Instagram's iframe after the user clicks
 * play (keeps the landing page fast and avoids Instagram's scripts on load).
 *
 * Instagram has no public thumbnail URL, so `thumbnail` must point to a
 * local image (e.g. `/podcast/case-study-instagram.webp`).
 *
 * Some accounts disable embedding ("Allow people to embed your posts" off);
 * Instagram then renders "post may have been removed" inside the iframe. For
 * those, pass `href` and the facade opens the reel on Instagram instead.
 */
export default function InstagramPlayer({
  postId,
  title,
  thumbnail,
  caption,
  href,
  aspect = "aspect-[9/16]",
}: {
  /** Shortcode from the post URL: instagram.com/p/<postId>/ or /reel/<postId>/ */
  postId: string;
  title: string;
  thumbnail: string;
  caption?: string;
  /** When set, clicking opens this URL in a new tab instead of loading the embed. */
  href?: string;
  aspect?: string;
}) {
  const [playing, setPlaying] = useState(false);

  const facade = (children: ReactNode) =>
    href ? (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Pogledaj video na Instagramu: ${title}`}
        className="absolute inset-0 flex flex-col items-center justify-center gap-4"
      >
        {children}
      </a>
    ) : (
      <button
        type="button"
        onClick={() => setPlaying(true)}
        aria-label={`Pusti video: ${title}`}
        className="absolute inset-0 flex flex-col items-center justify-center gap-4"
      >
        {children}
      </button>
    );

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
          src={`https://www.instagram.com/p/${postId}/embed/`}
          title={title}
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          allowFullScreen
          scrolling="no"
          className="absolute inset-0 size-full bg-white"
        />
      ) : (
        facade(
          <>
            {/* thumbnail */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumbnail}
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
            {/* instagram badge */}
            <span
              aria-hidden
              className="absolute right-4 top-4 inline-flex size-9 items-center justify-center rounded-full border border-white/15 bg-[#0a0a0a]/50 text-white/90 backdrop-blur"
            >
              <Instagram className="size-4" />
            </span>
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
          </>,
        )
      )}
    </motion.div>
  );
}
