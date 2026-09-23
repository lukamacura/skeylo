"use client";

import { useEffect, useState } from "react";
import { animate } from "framer-motion";

type Props = {
  to: number;
  from?: number;
  duration?: number;
  delay?: number;
  format?: (n: number) => string;
  className?: string;
};

/** Broj koji "otkuca" do ciljne vrednosti — mali dopamine hit na rezultatu. */
export default function CountUp({
  to,
  from = 0,
  duration = 1.4,
  delay = 0,
  format = (n) => Math.round(n).toLocaleString("en-US"),
  className,
}: Props) {
  const [value, setValue] = useState(from);

  useEffect(() => {
    const controls = animate(from, to, {
      duration,
      delay,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setValue(v),
    });
    return () => controls.stop();
  }, [from, to, duration, delay]);

  return <span className={className}>{format(value)}</span>;
}
