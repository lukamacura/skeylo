"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

type Props = {
  src: string;
  alt: string;
  icon: LucideIcon;
  className?: string;
};

/**
 * Prikazuje generisanu sliku iz /public/calculator. Fallback (gradijent + ikona
 * u boji brenda) se renderuje odmah, a slika se fade-uje preko njega tek kad se
 * učita — tako nikad nema "broken image" ikonice dok slike još nisu ubačene.
 */
export default function SmartImage({ src, alt, icon: Icon, className }: Props) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    const img = new Image();
    img.onload = () => alive && setReady(true);
    img.onerror = () => alive && setReady(false);
    img.src = src;
    return () => {
      alive = false;
    };
  }, [src]);

  return (
    <div
      className={`relative flex items-center justify-center bg-[linear-gradient(135deg,var(--rc-soft),var(--rc-soft-2))] ${className ?? ""}`}
    >
      <Icon className="size-8 text-[var(--rc)]" strokeWidth={1.6} aria-hidden />
      {ready && (
        <motion.img
          src={src}
          alt={alt}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35 }}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
    </div>
  );
}
