import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { EyeIcon, MissionIcon } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/reveal";

const cards = [
  {
    icon: EyeIcon,
    lead: "Our",
    title: "Vision",
    photo: "/our-vision.jpg",
    alt: "A boy hitting a forehand on a tennis court",
    body: "To use tennis to raise academically excellent leaders who'll build a better future for themselves and everyone around them.",
  },
  {
    icon: MissionIcon,
    lead: "Our",
    title: "Mission",
    photo: "/our-mission.jpg",
    alt: "Children outdoors, one looking through a magnifying glass",
    body: "Giving youths in underserved communities the training, the education, and the confidence to lead.",
  },
] as const;

/**
 * Vision and mission cards. The photo slots are placeholders until the
 * design export is dropped in.
 */
export function VisionMission() {
  return (
    <section className="relative bg-lime">
      <Container className="relative z-10 pt-6 lg:pt-10">
        <div className="grid items-stretch gap-5 md:grid-cols-2 lg:gap-6">
          {cards.map((card, index) => (
            <Reveal key={card.title} delay={index * 0.08}>
              <article className="flex h-full flex-col overflow-hidden rounded-t-[1.75rem] bg-blue-tint">
                <div className="px-7 pt-8 pb-6 sm:px-9 sm:pt-10">
                  <card.icon className="h-12 w-auto text-blue" />
                  <h2 className="headline mt-5 text-display-md">
                    <span className="text-blue">{card.lead} </span>
                    <span className="text-blue-bright">{card.title}</span>
                  </h2>
                  <p className="mt-3 max-w-[34rem] text-[0.975rem] leading-normal text-blue">{card.body}</p>
                </div>
                <div className="relative mt-auto min-h-56 flex-1 sm:min-h-72">
                  <Image
                    src={card.photo}
                    alt={card.alt}
                    fill
                    quality={90}
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>

      {/* White lip sags through the middle and rises at both sides, cutting both photos. */}
      <div
        aria-hidden
        className="pointer-events-none relative z-20 -mt-20 h-32 text-white sm:-mt-[7.25rem] sm:h-[8.25rem]"
      >
        <svg viewBox="0 0 1440 132" preserveAspectRatio="none" className="block h-full w-full">
          <path
            d="M0,22 C150,64 280,86 460,96 C640,106 980,104 1120,90 C1260,74 1360,40 1440,20 L1440,132 L0,132 Z"
            fill="currentColor"
          />
        </svg>
      </div>
      <div className="relative z-20 -mt-px bg-white pt-2 pb-16 text-center sm:pb-20">
        <Button href="/what-defines-us">Take A Closer Look</Button>
      </div>
    </section>
  );
}
