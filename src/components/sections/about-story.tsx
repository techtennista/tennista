"use client";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";
import Image from "next/image";

const chapters = [
  {
    tone: "bg-blue-tint",
    image: "/about-section-1.jpg",
    alt: "A girl in a pink skirt ready at the net",
    imageFirst: false,
    body: "Tennista aims to extend tennis, education, and life skills to underserved youth. As a 501(c)(3) nonprofit, we focus on communities where talent often lacks access, providing spaces for young people to not only learn tennis but also develop leadership skills.",
  },
  {
    tone: "bg-lime-tint",
    image: "/about-section-2.jpg",
    alt: "A player tossing the ball to serve",
    imageFirst: true,
    body: "Since 2021, our mission has remained to inspire and nurture the next generation of leaders while fostering positive societal change by combining tennis, education, and life skills programmes.",
  },
  {
    tone: "bg-blue-tint",
    image: "/about-section-3.jpg",
    alt: "A girl hitting a forehand on a clay court",
    imageFirst: false,
    body: "We're building healthier bodies, sharper minds, and the next generation of changemakers. Today, we reach 300 young people across various communities.",
  },
  {
    tone: "bg-lime-tint",
    image: "/we-believe.jpg",
    alt: "A boy hitting a forehand on a clay court",
    imageFirst: true,
    body: "We believe access to tennis and education isn't a privilege. It's a right.",
  },
] as const;

export function AboutStory() {
  return (
    <section aria-label="Our story" className="bg-white py-16 sm:py-20">
      <Container>
        <div className="flex flex-col gap-5 sm:gap-6">
          {chapters.map((chapter, index) => (
            <article
              key={chapter.body}
              className={cn(
                "rounded-[1.75rem] p-4 sm:p-6 lg:sticky lg:top-[5.75rem] lg:p-8",
                chapter.tone,
              )}
              style={{ zIndex: index + 1 }}
            >
              <div
                className={cn(
                  "grid items-center gap-6",
                  chapter.image && "lg:grid-cols-2 lg:gap-12",
                  chapter.image &&
                    chapter.imageFirst &&
                    "lg:[&>*:first-child]:order-2",
                )}
              >
                <p className="max-w-xl px-2 text-[1.05rem] leading-relaxed font-medium text-blue sm:px-4 sm:text-lg">
                  {chapter.body}
                </p>
                {chapter.image ? (
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[1.15rem]">
                    <Image
                      src={chapter.image}
                      alt={chapter.alt}
                      fill
                      sizes="(max-width: 1023px) calc(100vw - 4rem), (max-width: 1279px) 45vw, 42vw"
                      className="object-cover"
                    />
                  </div>
                ) : null}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <Button href="/what-defines-us">See What Defines Us</Button>
        </div>
      </Container>
    </section>
  );
}
