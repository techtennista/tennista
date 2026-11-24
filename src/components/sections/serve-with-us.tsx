"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const stories = [
  {
    title: "Zara's Story",
    lead: "Zara has been practicing how to play tennis since when she was 6yrs old. From a very young age she learnt how to hold a racket, how to read the ball, and how to stay steady on her feet after a missed shot.",
    body: "Tennis has a way of teaching patience before it teaches power, and Zara learned both. Match after match, her footwork sharpened and her focus grew.",
    close:
      "This year, hardwork, resilience and discipline showed up on the scoreboard. Zara won the U-12 girls' category at the Tennista Foundation Junior Tennis Tournament, defeating her opponent 4-1 and 4-2 on the clay courts of Lagos Country Club.",
  },
];

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      aria-hidden
    >
      <path
        d={
          direction === "left"
            ? "M14.5 6.5 8.5 12l6 5.5"
            : "M9.5 6.5 15.5 12l-6 5.5"
        }
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ServeWithUs() {
  const [index, setIndex] = useState(0);
  const story = stories[index];
  const hasMany = stories.length > 1;

  const go = (step: number) => {
    if (!hasMany) return;
    setIndex((current) => (current + step + stories.length) % stories.length);
  };

  return (
    <section
      aria-labelledby="serve-with-us-heading"
      className="bg-white px-5 pt-10 pb-8 sm:pt-14 sm:pb-10"
    >
      <div className="mx-auto w-full max-w-[87.5rem]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
          <h1
            id="serve-with-us-heading"
            className="headline text-[clamp(3.4rem,6.4vw,5.75rem)] leading-[0.82] text-blue-bright"
          >
            Serve with us
          </h1>
          <p className="max-w-[22rem] text-[1.02rem] leading-snug text-gray lg:max-w-none lg:text-right lg:whitespace-nowrap">
            Every champion starts somewhere.
            <br className="hidden lg:block" /> For Zara Adegoke and Atilola
            Mofifun, that
            <br className="hidden lg:block" /> somewhere was the Tennista
            Foundation.
          </p>
        </div>

        <div className="relative mt-6 overflow-hidden rounded-[1.25rem] sm:mt-8 lg:aspect-[1400/647]">
          <Image
            src="/serve-with-us.jpg"
            alt="Zara mid-swing on an outdoor court, with Tennista banners behind her"
            fill
            sizes="(max-width: 1023px) 100vw, 87.5rem"
            className="object-cover object-[center_32%]"
          />
          <div className="relative flex min-h-[28rem] items-center p-4 sm:p-5 lg:absolute lg:inset-0 lg:min-h-0 lg:p-6">
            <article
              aria-roledescription="carousel"
              aria-label="Player stories"
              className="w-full max-w-[34rem] rounded-[1.35rem] bg-white px-6 py-7 shadow-[0_18px_50px_-28px_rgb(0_0_0/0.45)] sm:px-8 sm:py-8 lg:max-w-[46%] lg:px-9 lg:py-8"
            >
              <h2 className="font-display text-[clamp(2rem,3vw,2.75rem)] leading-none font-extrabold tracking-[-0.01em] text-blue-bright">
                {story.title}
              </h2>
              <p className="mt-5 text-[1.05rem] leading-snug font-medium text-blue-bright sm:text-[1.125rem]">
                {story.lead}
              </p>
              <hr className="my-5 border-0 border-t border-[#d5d5d5] sm:my-6" />
              <p className="text-[0.95rem] leading-relaxed text-gray">
                {story.body}
              </p>
              <div className="mt-4 flex items-end gap-4">
                <p className="text-[0.95rem] leading-relaxed text-gray">
                  {story.close}
                </p>
                <div className="mb-1 flex shrink-0 gap-3">
                  <button
                    type="button"
                    onClick={() => go(-1)}
                    aria-label="Previous story"
                    className="grid h-11 w-11 place-items-center rounded-full bg-[#e7eef6] text-blue transition-colors hover:bg-blue-tint"
                  >
                    <Chevron direction="left" />
                  </button>
                  <button
                    type="button"
                    onClick={() => go(1)}
                    aria-label="Next story"
                    className="grid h-11 w-11 place-items-center rounded-full bg-blue text-white transition-colors hover:bg-blue-bright"
                  >
                    <Chevron direction="right" />
                  </button>
                </div>
              </div>
            </article>
          </div>
        </div>
        <div className="mt-8 sm:mt-10">
          <Button href="/get-involved/volunteer" variant="blue">
            Become A Volunteer
          </Button>
        </div>
      </div>
    </section>
  );
}
