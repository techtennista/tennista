import { Button } from "@/components/ui/button";
import Image from "next/image";

export function DonationMatters() {
  return (
    <section
      aria-labelledby="donation-matters-heading"
      className="bg-white px-5 pt-6 pb-20 sm:pt-8 sm:pb-24"
    >
      <div className="mx-auto w-full max-w-[87.5rem]">
        <h2
          id="donation-matters-heading"
          className="headline text-center text-[clamp(2.8rem,5.6vw,6.25rem)] leading-[0.82] text-blue-bright"
        >
          Why your donation
          <br />
          or support matters
        </h2>

        <div className="relative mt-8 lg:mt-28">
          <div className="relative overflow-hidden rounded-[1.75rem] bg-blue-tint lg:overflow-visible">
            <div className="px-6 py-8 sm:px-10 sm:py-10 lg:min-h-[34rem] lg:py-14 lg:pr-14 lg:pl-[48%]">
              <div className="max-w-[40rem] space-y-6 text-[1.05rem] leading-snug font-medium text-blue-bright sm:text-[1.25rem] sm:leading-[1.22] lg:ml-auto">
                <p>
                  Zara and Mofifun didn&apos;t get here on their own. Someone
                  showed up to coach them. A court was open when they needed it.
                  Someone made sure a racket was in their hands before they ever
                  won a single point.
                </p>
                <p>
                  We&apos;re saying all this because there are more kids just
                  like them out in the world, right now, with the same hunger
                  and the same potential just waiting for their own shot.
                  Zara&apos;s and Mofifun&apos;s story aren&apos;t rare.
                  It&apos;s something we can give to another child if we keep
                  showing up for them.
                </p>
                <hr className="border-0 border-t border-[#c5d4e8]" />
                <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <p className="text-base leading-relaxed font-normal text-gray lg:max-w-[28rem]">
                    This is what your donation makes possible: it gives a chance
                    to every child out there. Give a child their own court to
                    grow on. Your donation puts a racket in the next
                    child&apos;s hand and a shot at their own story of growth.
                  </p>
                  <Button href="/fund-a-child" className="shrink-0">
                    Donate Here
                  </Button>
                </div>
              </div>
            </div>

            <div className="relative mt-16 h-[22rem] w-full lg:hidden">
              <Image
                src="/support-matter-bg.png"
                alt=""
                width={923}
                height={879}
                sizes="(max-width: 1023px) 923px"
                className="absolute top-0 left-0 h-full w-auto max-w-none"
              />
              <Image
                src="/your-donation-matters.png"
                alt="A young player holding a racket and two tennis balls"
                width={888}
                height={1120}
                sizes="(max-width: 1023px) 888px"
                className="absolute bottom-0 left-0 h-[122%] w-auto max-w-none"
              />
            </div>

            <Image
              src="/support-matter-bg.png"
              alt=""
              width={923}
              height={879}
              sizes="923px"
              className="pointer-events-none absolute top-0 left-0 hidden h-full w-auto lg:block"
            />
            <Image
              src="/your-donation-matters.png"
              alt="A young player holding a racket and two tennis balls"
              width={888}
              height={1120}
              sizes="888px"
              className="pointer-events-none absolute bottom-0 left-0 hidden h-[122%] w-auto lg:block"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
