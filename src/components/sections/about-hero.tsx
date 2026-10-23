"use client";

import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { ease } from "@/lib/motion";

export function AboutHero() {
  const reduced = useReducedMotion();

  return (
    <section
      aria-labelledby="about-heading"
      className="overflow-visible bg-white pt-8 pb-8 sm:pt-12 sm:pb-12 lg:relative lg:h-[clamp(38rem,45vw,41rem)] lg:overflow-hidden lg:pt-0 lg:pb-0"
    >
      <div className="relative z-20 grid items-end gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.6fr)] lg:items-start lg:gap-10 lg:px-4">
        <div>
          <p className="text-[0.75rem] font-bold tracking-[0.28em] text-ink-muted uppercase">About us</p>
          <h1
            id="about-heading"
            className="headline mt-3 text-display-xl sm:text-display-2xl lg:origin-left lg:scale-x-[0.88] lg:text-h3"
          >
            <motion.span
              initial={reduced ? false : { opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: ease.out }}
              className="text-blue"
            >
              About{" "}
            </motion.span>
            <motion.span
              initial={reduced ? false : { opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: ease.out, delay: reduced ? 0 : 0.08 }}
              className="text-blue-bright"
            >
              Tennista
            </motion.span>
          </h1>
        </div>

        <motion.div
          initial={reduced ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: ease.out, delay: reduced ? 0 : 0.2 }}
          className="max-w-md lg:justify-self-end lg:pb-2"
        >
          <p className="text-[0.975rem] leading-relaxed text-ink-muted">
            Tennis was never truly the sport of the privileged few; it has always belonged to everyone. What
            was missing was access.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 lg:mt-4">
            <Button href="/fund-a-child">Fund A Child</Button>
            <Button href="/programs" variant="outlineBlue">
              Programs
            </Button>
          </div>
        </motion.div>
      </div>

      <div className="relative mt-10 px-4 sm:mt-12 sm:px-6 lg:absolute lg:inset-x-2 lg:top-[9.25rem] lg:mt-0 lg:h-[27.5rem] lg:px-0">
        <div className="relative h-[clamp(32rem,58vw,44rem)] overflow-hidden rounded-tl-[2.75rem] bg-blue lg:h-full lg:rounded-[1.25rem]">
          <img
            src="/about-us-bg.jpg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-[18%_center]"
          />
          <img
            src="/about-us-motif.svg"
            alt=""
            className="pointer-events-none absolute top-1/2 right-0 w-[70%] max-w-none -translate-y-1/2 lg:top-[calc(50%+10px)] lg:w-[calc(70%+1.875rem)]"
          />
        </div>
        <motion.img
          src="/about-us-girl.png"
          alt="A young player holding a tennis racket"
          className="pointer-events-none absolute bottom-5 left-[61%] z-10 h-[112%] w-auto max-w-none -translate-x-1/2 grayscale lg:top-[-8.5rem] lg:bottom-auto lg:left-[59.5%] lg:h-[52rem] lg:[clip-path:inset(0_0_16rem_0)]"
          initial={reduced ? false : { y: "8%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, ease: ease.out, delay: reduced ? 0 : 0.2 }}
        />
      </div>
    </section>
  );
}
