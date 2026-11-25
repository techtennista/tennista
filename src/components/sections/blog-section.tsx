"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";

const posts = [
  {
    title:
      "Atilola, Zara, others shine at Tennista Foundation Junior Tennis' tourney",
    href: "/media/tennis-news/atilola-zara-others-shine-at-tennista-foundation-junior-tennis-tourney",
    image: "/2025-tournament-1.jpg",
  },
  {
    title:
      "Tennista offer junior tennis tournament winners, runner-ups scholarship",
    href: "/media/tennis-news/tennista-offer-junior-tennis-tournament-winners-runner-ups-scholarship",
    image: "/2026-tournament-3.jpg",
  },
  {
    title: "55 kids serve off maiden Tennista Junior Tennis Open",
    href: "/media/tennis-news/55-kids-serve-off-maiden-tennista-junior-tennis-open",
    image: "/junior-tennis-open-cover.jpg",
  },
] as const;

function ArrowButton({
  direction,
  disabled,
  onClick,
}: {
  direction: "left" | "right";
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={direction === "left" ? "Previous stories" : "Next stories"}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "absolute top-[38%] z-10 grid size-14 -translate-y-1/2 place-items-center rounded-full bg-white text-blue shadow-card",
        "transition-[transform,opacity] duration-200 hover:scale-105 disabled:pointer-events-none disabled:opacity-45",
        direction === "left" ? "left-3 sm:left-5" : "right-3 sm:right-5",
      )}
    >
      <svg viewBox="0 0 24 24" className="size-6" fill="none" aria-hidden>
        <path
          d={
            direction === "left"
              ? "M14.5 6.5L8.5 12l6 5.5"
              : "M9.5 6.5L15.5 12l-6 5.5"
          }
          stroke="currentColor"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

export function BlogSection() {
  const scroller = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ atStart: true, atEnd: false });

  const syncEdges = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    setEdges({
      atStart: el.scrollLeft <= 24,
      atEnd: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
    });
  }, []);

  const move = (direction: -1 | 1) => {
    const el = scroller.current;
    const card = el?.querySelector("article");
    if (!el || !card) return;
    const gap = 20;
    el.scrollBy({
      left: direction * (card.clientWidth + gap),
      behavior: "smooth",
    });
  };

  return (
    <section aria-labelledby="blog-heading" className="bg-white py-16 sm:py-20">
      <div className="grid items-end gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.7fr)] lg:gap-16">
        <h2
          id="blog-heading"
          className="headline text-display-lg text-blue sm:text-display-xl"
        >
          Latest news
          <br />
          from the blog
        </h2>
        <div className="max-w-sm lg:justify-self-end lg:pb-2">
          <p className="text-[0.975rem] leading-relaxed text-ink-muted">
            Grab all latest news for charity, donations, crowdfunding,
            fund-raising or new campaigns Tennista launch.
          </p>
          <div className="mt-5">
            <Button href="/media/tennis-news">Read All Stories</Button>
          </div>
        </div>
      </div>

      <div className="relative mt-10 w-full sm:mt-14">
        <div
          ref={scroller}
          onScroll={syncEdges}
          className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth bg-white [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {posts.map((post) => (
            <article
              key={post.href}
              className="w-[min(100%,34rem)] shrink-0 snap-start rounded-[1.25rem] bg-[#f8f8dc] p-3 sm:w-[calc((100%-1.25rem)/2)] sm:p-4 lg:w-[calc((100%-2.5rem)/3)]"
            >
              <Link href={post.href} className="group block">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[1.15rem]">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.01]"
                  />
                </div>
                <h3 className="headline mt-5 px-2 text-[1.15rem] leading-[1.2] text-blue sm:text-[1.35rem]">
                  {post.title}
                </h3>
              </Link>
              <div className="mx-2 mt-5 border-t border-blue/15 pt-4">
                <div className="flex items-center justify-between gap-4 text-sm text-ink-muted">
                  <span className="inline-flex items-center gap-2">
                    <span className="grid size-6 place-items-center rounded-full border border-current">
                      <svg
                        viewBox="0 0 24 24"
                        className="size-3.5"
                        fill="currentColor"
                        aria-hidden
                      >
                        <circle cx="12" cy="8" r="3.2" />
                        <path d="M5 19.2c.8-3.2 3.4-4.8 7-4.8s6.2 1.6 7 4.8" />
                      </svg>
                    </span>
                    tennismaster
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <svg
                      viewBox="0 0 24 24"
                      className="size-4"
                      fill="none"
                      aria-hidden
                    >
                      <path
                        d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12z"
                        stroke="currentColor"
                        strokeWidth="1.6"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="2.4"
                        stroke="currentColor"
                        strokeWidth="1.6"
                      />
                    </svg>
                    0 Comments
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

        <ArrowButton
          direction="left"
          disabled={edges.atStart}
          onClick={() => move(-1)}
        />
        <ArrowButton
          direction="right"
          disabled={edges.atEnd}
          onClick={() => move(1)}
        />
      </div>
    </section>
  );
}
