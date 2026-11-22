"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";

/**
 * VSL na početnoj. Do klika je samo slika (lokalna kopija YouTube thumbnaila,
 * public/site/vsl-thumb.jpg), pa YouTube ne usporava prvo učitavanje. Klik
 * zameni sliku iframe-om koji odmah pušta video.
 * Kad se thumbnail na YouTube-u promeni, skini novi maxresdefault.jpg pod
 * NOVIM imenom fajla (keš slika na Vercelu ide po adresi) i promeni src.
 */
export default function Vsl({
  id,
  title,
  length,
}: {
  id: string;
  title: string;
  /** Trajanje za oznaku u uglu, npr. "5:39". */
  length: string;
}) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="relative">
      {/* Topli sjaj iza videa */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-x-6 -inset-y-4 -z-10 rounded-[2.5rem] opacity-70 blur-3xl sm:-inset-x-10"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 55%, rgba(216,121,40,0.35), rgba(240,182,86,0.12) 55%, transparent 75%)",
        }}
      />

      <div className="relative aspect-video overflow-hidden rounded-2xl bg-card ring-1 ring-white/12 shadow-[0_40px_120px_-40px_rgba(216,121,40,0.6)] sm:rounded-3xl">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1&modestbranding=1`}
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
            className="group absolute inset-0 flex items-center justify-center"
          >
            <Image
              src="/site/vsl-thumb.jpg"
              alt=""
              fill
              priority
              sizes="(max-width: 896px) 100vw, 896px"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]"
            />
            <span
              aria-hidden
              className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.28),transparent_45%)] transition-opacity group-hover:opacity-60"
            />

            <span className="relative grid size-16 place-items-center rounded-full bg-primary text-primary-foreground shadow-[0_10px_40px_-6px_rgba(216,121,40,0.9)] transition-transform duration-300 group-hover:scale-110 sm:size-20">
              <span
                aria-hidden
                className="absolute inset-0 animate-ping rounded-full bg-primary/40 [animation-duration:2.2s] motion-reduce:animate-none"
              />
              <Play className="relative size-7 translate-x-0.5 fill-current sm:size-8" />
            </span>

            <span className="absolute bottom-2 right-2 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white/90 backdrop-blur sm:bottom-4 sm:right-4 sm:px-3 sm:py-1.5 sm:text-sm">
              <Play className="size-3 fill-current" />
              Pogledaj video · {length}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
