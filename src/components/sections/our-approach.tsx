import Image from "next/image";

/**
 * Follows the Since 2021 band on What Defines Us.
 */
export function OurApproach() {
  return (
    <section
      aria-labelledby="approach-heading"
      className="bg-white py-16 sm:py-20"
    >
      <div className="px-5 sm:px-8 lg:px-12">
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.85fr)] lg:gap-16">
          <h2
            id="approach-heading"
            className="headline text-display-lg text-blue sm:text-display-xl"
          >
            Our approach
            <br />
            extends beyond
            <br />
            the court
          </h2>
          <p className="max-w-md text-[0.975rem] leading-relaxed text-ink-muted lg:justify-self-end lg:pt-3">
            We create a supportive environment where sports lead to education
            and personal growth. Through tennis programs, academic support,
            mentorship, and community engagement, we equip youth with the
            confidence and resilience to pursue their goals.
          </p>
        </div>

        <div className="mt-10 grid items-center gap-8 rounded-[1.75rem] bg-blue-tint p-4 sm:mt-14 sm:p-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-12 lg:p-8">
          <div className="relative aspect-[4/5] w-full sm:aspect-[5/6]">
            <Image
              src="/we-envision-a-world.jpg"
              alt="A player hitting a forehand on a clay court"
              fill
              sizes="(max-width: 639px) calc(100vw - 2.5rem), (max-width: 1023px) 45vw, 40vw"
              className="rounded-[1.25rem] object-cover object-[center_28%]"
            />
          </div>
          <div className="px-2 pb-4 sm:px-4 lg:py-6 lg:pr-6">
            <p className="text-[clamp(1.45rem,2.3vw,2.05rem)] leading-[1.25] font-bold text-blue">
              We envision a world where talent is never wasted because of lack
              of opportunity and one where a young person&apos;s background
              doesn&apos;t decide their potential.
            </p>
            <p className="mt-5 max-w-xl text-[0.95rem] leading-relaxed text-ink-muted">
              We&apos;re not just creating top tennis players; we&apos;re
              shaping young leaders who are resilient and driven. They take
              their court lessons into classrooms and communities, crafting a
              future that transcends the game.
            </p>
            <h3 className="mt-8 text-lg font-bold tracking-wide text-blue">
              HOW?
            </h3>
            <p className="mt-2 max-w-xl text-[0.95rem] leading-relaxed text-ink-muted">
              Our programs unite parents, communities, and schools to enhance
              youth&apos;s physical and mental health through tennis and life
              skills. We inspire them to lead vibrant lives, excel academically,
              and make a positive mark on their communities.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
