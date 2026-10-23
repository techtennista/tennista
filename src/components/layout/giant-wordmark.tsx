"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Closing TENNISTA mark. The curve, the blue cut through the letters, and
 * the wordmark are one exported SVG so the bend is not cropped.
 */
export function GiantWordmark({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end end"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["14%", "0%"]);

  return (
    <div ref={ref} className={cn("w-full overflow-hidden", className)}>
      <motion.img
        src="/word-play-tennista.svg"
        alt="Tennista"
        className="block h-auto w-full"
        style={reduced ? undefined : { y }}
      />
    </div>
  );
}
