import Image from "next/image";

/**
 * Full-bleed statement. The court photo carries the player and the circle
 * motif; the headline sits in HTML over the left of the frame.
 */
export function SinceTennista() {
  return (
    <section
      aria-labelledby="since-heading"
      className="relative isolate overflow-hidden bg-[#8aa0b0]"
    >
      <Image
        src="/serve-since-2021.jpg"
        alt="A player reaching forward with a tennis ball"
        fill
        sizes="(max-width: 1023px) 100vw, 100vw"
        className="object-cover object-[72%_center] lg:object-center"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/20 to-black/30 lg:hidden"
      />

      <div className="relative z-10 flex min-h-[32rem] items-start px-5 pt-8 sm:min-h-[36rem] sm:items-center sm:px-8 lg:aspect-[1440/899] lg:min-h-0 lg:items-center lg:px-12">
        <div className="max-w-[19rem] sm:max-w-[26rem] lg:max-w-[34rem]">
          <h2
            id="since-heading"
            className="headline text-[clamp(2.15rem,4.2vw,4.15rem)] leading-[0.88] text-white"
          >
            Since 2021, Tennista has been using tennis to create societal
            change.
          </h2>
          <p className="mt-5 max-w-md text-[0.95rem] leading-relaxed text-white lg:mt-6">
            We believe every young person deserves a chance at success, not just
            the talented or privileged. At Tennista Foundation, we harness
            tennis&apos;s power to unlock potential, promote academic
            excellence, and develop essential life skills.
          </p>
        </div>
      </div>
    </section>
  );
}
