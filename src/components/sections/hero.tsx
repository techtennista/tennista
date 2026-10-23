"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ease } from "@/lib/motion";

const lines = [
  [
    { text: "Every", tone: "white" },
    { text: "Serve", tone: "lime" },
  ],
  [
    { text: "Starts A", tone: "white" },
    { text: "Story", tone: "lime" },
  ],
] as const;

/**
 * Hero band. Players and the tennis-balls graphic keep their own positions.
 * Court lines are absolute and do not move either of them.
 */
export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-blue pt-14 pb-[clamp(7rem,20vw,14rem)] lg:min-h-[45.5rem]">
      {/* Court lines sit on top of the blue and do not take part in layout. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-[1]">
        <span className="absolute top-0 left-[9%] hidden h-[11.5rem] w-[7px] bg-white lg:block" />
        <span className="absolute top-0 right-[9%] hidden h-[11.5rem] w-[7px] bg-white lg:block" />
        <span className="absolute inset-x-0 top-[34.3rem] h-[6px] bg-white" />
      </div>

      <Image
        src="/tennis-hero-girl-1.png"
        alt="Young player with a racket"
        width={710}
        height={574}
        priority
        className="pointer-events-none absolute bottom-0 left-[-1rem] z-20 hidden h-[calc(44rem-12px)] w-auto max-w-[62vw] lg:block"
      />
      <Image
        src="/tennis-hero-girl-2.png"
        alt="Young player hitting a forehand"
        width={644}
        height={605}
        priority
        className="pointer-events-none absolute right-[-2.5rem] bottom-0 z-20 hidden h-[calc(44rem-12px)] w-auto max-w-[62vw] lg:block"
      />

      <Container className="relative z-30">
        <div className="mx-auto max-w-[58.5rem] text-center">
          <h1 className="headline text-h2 text-white">
            {lines.map((line, lineIndex) => (
              <motion.span
                key={lineIndex}
                initial={{ opacity: 0, y: "0.35em" }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: ease.out, delay: 0.12 * lineIndex }}
                className={lineIndex === 0 ? "block" : "block mt-[0.18em]"}
              >
                {line.map((word, wordIndex) => (
                  <span key={word.text} className={word.tone === "lime" ? "text-lime" : "text-white"}>
                    {wordIndex > 0 ? " " : ""}
                    {word.text}
                  </span>
                ))}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: ease.out, delay: 0.4 }}
            className="mx-auto mt-7 max-w-xl text-body text-white/85"
          >
            Every champion starts somewhere with a chance. At Tennista Foundation, we use tennis, education,
            and life skills to unlock potential in young people and turn it into confidence, direction, and
            possibility.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: ease.out, delay: 0.58 }}
            className="mt-9 flex flex-wrap items-center justify-center gap-4"
          >
            <Button href="/fund-a-child" size="lg">
              Fund A Child
            </Button>
            <Button href="/programs" size="lg" variant="outlineWhite">
              Programs
            </Button>
          </motion.div>
        </div>
      </Container>

      <img
        src="/tennis-balls.svg"
        alt=""
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 w-full"
      />
      {/* White space traces the ball's curve and clips the players to the same arc. */}
      <svg
        aria-hidden
        viewBox="0 0 1440 100"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[25] h-[4.75rem] w-full"
      >
        <path
          d="M0,52 C240,74 480,98 740,100 C1020,98 1240,70 1440,40 L1440,100 L0,100 Z"
          fill="white"
        />
      </svg>
    </section>
  );
}
