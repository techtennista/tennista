import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";

/**
 * "Tennis is the means" band. The supplied circle artwork and girl cutout
 * form one composition, which is clipped by the section's shallow lime edge.
 */
export function MeansSection() {
  return (
    <section className="relative overflow-hidden bg-white md:min-h-[53.75rem]">
      <Container
        width="wide"
        className="relative z-20 pt-16 pb-16 sm:pt-20 lg:px-3 lg:pt-[7.5rem] lg:pb-0"
      >
        <Reveal>
          <div className="max-w-full lg:h-[17.5rem] lg:w-[45.9375rem]">
            <h2 className="headline text-h2 text-blue-bright lg:w-max lg:max-w-none lg:origin-top-left lg:scale-x-[0.75]">
              <span className="block lg:whitespace-nowrap">Tennis is the means.</span>
              <span className="mt-[0.08em] block lg:whitespace-nowrap">Transformation is</span>
              <span className="mt-[0.08em] block lg:whitespace-nowrap">the destination.</span>
            </h2>
          </div>
          <p className="prose-body mt-5 max-w-[42rem] text-ink">
            Nobody needs another nonprofit that hands out equipment and disappears. Tennista trains children
            on the court, funds them in the classroom, and mentors them into the future because a forehand
            can open a door, but only education keeps it open.
          </p>
          <Button href="/what-defines-us" size="lg" className="mt-8 min-w-[13.5rem]">
            What Defines Us
          </Button>
        </Reveal>
      </Container>

      <div className="pointer-events-none relative z-10 mt-4 ml-auto hidden aspect-[653/659] w-[min(100%,40.8125rem)] md:absolute md:top-[7.5rem] md:right-0 md:mt-0 md:block">
        <img src="/image_bg_border.svg" alt="" className="absolute inset-0 h-full w-full" />
        {/* <Image
          src="/tennis-means-girl.png"
          alt="A smiling child"
          width={753}
          height={845}
          quality={100}
          unoptimized
          className="absolute top-[-18%] left-[-7%] h-[128%] w-auto max-w-none"
        /> */}
      </div>

      <div
        aria-hidden
        className="pointer-events-none relative z-30 -mt-14 h-32 text-lime sm:-mt-20 sm:h-40 md:absolute md:inset-x-0 md:bottom-0 md:mt-0 md:h-[11.5rem]"
      >
        <svg viewBox="0 0 1440 184" preserveAspectRatio="none" className="block h-full w-full">
          <path
            d="M0,56 C220,102 500,128 760,126 C980,124 1130,94 1260,48 C1340,35 1400,29 1440,28 L1440,184 L0,184 Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </section>
  );
}
