"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

/* ------------------------------------------------------------------ */
/*  Snimak gradnje iza rezultata                                        */
/*                                                                      */
/*  Na "Izračunaj procenu" crtež se pretopi u snimak gradnje (travnjak  */
/*  → iskop → armatura → beton → mozaik → gotov bazen) koji staje na    */
/*  poslednjem kadru, iza rezultata. Snimak je 16:9, a prozor scene je  */
/*  na telefonu širi, na desktopu skoro kvadrat: kadar se uvek vidi     */
/*  ceo, a ostatak prozora popunjava zamućena kopija istog kadra.       */
/* ------------------------------------------------------------------ */

const FILM = "/clients/pool-service/videos/skimerski.mp4";
/** Poslednji kadar: za smanjeno kretanje i kad pregledač odbije autoplay. */
const LAST = "/clients/pool-service/videos/skimerski-kraj.webp";
const EASE = [0.22, 1, 0.36, 1] as const;
/** Ivice kadra se meko utapaju u zamućenu pozadinu. */
const FEATHER =
  "linear-gradient(to bottom, transparent, #000 7%, #000 93%, transparent), linear-gradient(to right, transparent, #000 5%, #000 95%, transparent)";

export default function PoolFilm({
  armed,
  play,
}: {
  /** Snimak se učitava unapred, pre klika na "Izračunaj procenu". */
  armed: boolean;
  play: boolean;
}) {
  const still = useReducedMotion() ?? false;
  const video = useRef<HTMLVideoElement>(null);
  const last = useRef<HTMLImageElement>(null);
  const blur = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(armed);
  const [rolling, setRolling] = useState(false);
  const [blocked, setBlocked] = useState(false);
  // Jednom učitan snimak ostaje, i kad se korisnik vrati na prve korake.
  if (armed && !mounted) setMounted(true);

  const mode = !play
    ? null
    : still || blocked
      ? "last"
      : rolling
        ? "film"
        : null;

  const paint = (src: CanvasImageSource) => {
    const c = blur.current;
    c?.getContext("2d")?.drawImage(src, 0, 0, c.width, c.height);
  };

  // Zamućena pozadina prati svaki prikazani kadar snimka.
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (typeof v.requestVideoFrameCallback !== "function") {
      const draw = () => paint(v);
      v.addEventListener("timeupdate", draw);
      return () => v.removeEventListener("timeupdate", draw);
    }
    let id = 0;
    const tick = () => {
      paint(v);
      id = v.requestVideoFrameCallback(tick);
    };
    id = v.requestVideoFrameCallback(tick);
    return () => v.cancelVideoFrameCallback(id);
  }, [mounted, still]);

  // Svaki ulazak u rezultat pušta gradnju od početka.
  useEffect(() => {
    const v = video.current;
    if (!play || still || !v) return;
    v.currentTime = 0;
    v.play().catch(() => setBlocked(true));
    return () => {
      v.pause();
      setRolling(false);
      setBlocked(false);
    };
  }, [play, still]);

  useEffect(() => {
    const img = last.current;
    if (mode === "last" && img?.complete) paint(img);
  }, [mode]);

  if (!mounted) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-0 grid place-items-center overflow-hidden [container-type:size]"
      initial={false}
      animate={{ opacity: mode ? 1 : 0 }}
      transition={{ duration: mode ? 0.8 : 0.45, ease: EASE }}
    >
      <canvas
        ref={blur}
        width={32}
        height={18}
        className="absolute inset-0 size-full scale-125 blur-2xl brightness-[0.55] saturate-[1.15]"
      />
      <motion.div
        className="relative aspect-video w-[min(100cqw,calc(100cqh*16/9))]"
        style={{
          maskImage: FEATHER,
          maskComposite: "intersect",
          WebkitMaskImage: FEATHER,
          WebkitMaskComposite: "source-in",
        }}
        initial={false}
        animate={{ scale: mode ? 1 : 1.04 }}
        transition={{ duration: 1.2, ease: EASE }}
      >
        {!still && (
          <video
            ref={video}
            src={FILM}
            muted
            playsInline
            preload="auto"
            disablePictureInPicture
            disableRemotePlayback
            onPlaying={() => setRolling(true)}
            className="absolute inset-0 size-full object-cover"
          />
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={last}
          src={LAST}
          alt=""
          decoding="async"
          onLoad={(e) => mode === "last" && paint(e.currentTarget)}
          className={`absolute inset-0 size-full object-cover ${mode === "last" ? "opacity-100" : "opacity-0"}`}
        />
      </motion.div>
    </motion.div>
  );
}
