import { Button } from "@/components/ui/button";
import Image from "next/image";

/**
 * The group photograph carries its own top notch. A white wave closes the
 * bottom edge so the next section can sit against it.
 */
export function AboutTeam() {
  return (
    <section
      aria-labelledby="team-heading"
      className="overflow-hidden bg-white pt-16 pb-4 sm:pt-20"
    >
      <div className="relative z-10 grid items-start gap-8 px-4 pb-2 sm:px-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] lg:gap-16 lg:px-12">
        <h2
          id="team-heading"
          className="headline text-display-xl text-blue sm:text-display-2xl"
        >
          The team
        </h2>
        <div className="max-w-xl lg:justify-self-end lg:pb-2">
          <p className="text-[0.975rem] leading-relaxed text-ink-muted">
            Our team is made up of coaches, educators, and program leaders who
            believe tennis can change lives, because we&apos;ve seen it happen.
            Their dedication, creativity, and commitment push us to reach
            further, dream bigger, and create lasting change for the youth we
            SERVE.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button href="/our-team">Meet The Team</Button>
            <Button href="/careers" variant="outlineBlue">
              Join The Team
            </Button>
          </div>
        </div>
      </div>

      <div className="relative mt-8 lg:-mt-14">
        <Image
          src="/the-team.jpg"
          alt="The Tennista team standing together at a junior tennis event"
          width={1401}
          height={559}
          sizes="100vw"
          className="h-auto w-full"
        />
        <svg
          aria-hidden
          viewBox="0 0 1440 90"
          preserveAspectRatio="none"
          className="absolute inset-x-0 bottom-0 h-14 w-full sm:h-20"
        >
          <path
            d="M0,34 C280,62 520,86 760,78 C1000,70 1220,36 1440,28 L1440,90 L0,90 Z"
            fill="#fff"
          />
        </svg>
      </div>
    </section>
  );
}
