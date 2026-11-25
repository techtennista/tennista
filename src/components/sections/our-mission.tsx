"use client";

import { useState } from "react";
import { useReducedMotion } from "motion/react";
import Image from "next/image";

const shots = [
  {
    src: "/our-mission-1.jpg",
    alt: "A player preparing a two-handed backhand",
    tilt: 8.5,
  },
  {
    src: "/our-mission-2.jpg",
    alt: "A player tossing the ball to serve",
    tilt: -5,
  },
  {
    src: "/our-mission-3.jpg",
    alt: "A player moving in for a forehand",
    tilt: 3.7,
  },
  {
    src: "/our-mission-4.jpg",
    alt: "A player at the net with a two-handed grip",
    tilt: -6.5,
  },
];

function Shot({
  src,
  alt,
  tilt,
  fanned,
}: {
  src: string;
  alt: string;
  tilt: number;
  fanned: boolean;
}) {
  return (
    <li
      data-mission-card
      className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
      style={{ transform: `rotate(${fanned ? tilt : 0}deg)` }}
    >
      <div className="relative aspect-[3/4] w-full">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 639px) calc(50vw - 2rem), (max-width: 1023px) calc(50vw - 2.5rem), 25vw"
          className="rounded-[1.35rem] object-cover shadow-[0_22px_36px_-26px_rgb(0_31_82_/_0.55)]"
        />
      </div>
    </li>
  );
}

export function OurMission() {
  const reduce = useReducedMotion();
  const [fanned, setFanned] = useState(false);

  return (
    <section
      aria-labelledby="mission-heading"
      className="bg-white pt-14 pb-20 sm:pt-20 sm:pb-24"
    >
      <div className="px-5 sm:px-8 lg:px-12">
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:gap-16">
          <h1
            id="mission-heading"
            className="headline text-display-xl text-blue"
          >
            Our mission
          </h1>
          <p className="max-w-xl text-[0.975rem] leading-[1.65] text-ink">
            To create a world where every young person in underserved
            communities can thrive. Through the transformative power of tennis,
            we aim to unlock their full potential, through character building,
            achieving academic excellence, embracing healthy lifestyles, and
            creating visible success both on and off the court
          </p>
        </div>

        <ul
          className="mt-12 grid grid-cols-2 gap-x-4 gap-y-8 py-6 sm:mt-16 lg:grid-cols-4 lg:gap-6"
          onMouseEnter={() => setFanned(!reduce)}
          onMouseLeave={() => setFanned(false)}
        >
          {shots.map((shot) => (
            <Shot key={shot.src} {...shot} fanned={fanned} />
          ))}
        </ul>
      </div>
    </section>
  );
}
