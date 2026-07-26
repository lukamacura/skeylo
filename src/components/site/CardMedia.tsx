"use client";

import Image, { type StaticImageData } from "next/image";
import type { LucideIcon } from "lucide-react";

type Props = {
  /** Izostavi dok fotografija ne stigne — renderuje se placeholder panel. */
  image?: StaticImageData;
  alt?: string;
  icon: LucideIcon;
  /** Sve fotke su portret, pa široki crop traži pomeranje kadra. */
  position?: string;
  sizes: string;
  /** Aspect ratio (i sve ostalo) po sekciji. */
  className?: string;
  /** Overlay sadržaj — npr. redni broj koraka. */
  children?: React.ReactNode;
};

export default function CardMedia({
  image,
  alt,
  icon: Icon,
  position,
  sizes,
  className = "",
  children,
}: Props) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {image ? (
        <Image
          src={image}
          alt={alt ?? ""}
          fill
          placeholder="blur"
          sizes={sizes}
          className={`object-cover ${position ?? "object-center"} transition-transform duration-700 ease-out will-change-transform group-hover:scale-[1.04] motion-reduce:transform-none`}
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(120%_100%_at_50%_0%,rgba(216,121,40,0.28),transparent_65%)]">
          <div
            aria-hidden
            className="absolute inset-0 grid-lines opacity-30 [mask-image:radial-gradient(70%_70%_at_50%_40%,black,transparent)]"
          />
          <Icon aria-hidden className="size-16 text-primary/40 sm:size-20" />
        </div>
      )}

      {/* Fade u telo kartice */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-background via-background/55 to-transparent"
      />

      {children}
    </div>
  );
}
