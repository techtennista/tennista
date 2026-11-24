import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";
import Image from "next/image";

type Edition = {
  tone: string;
  image: string;
  alt: string;
  body: string;
  width: number;
  height: number;
};

const editions2025: Edition[] = [
  {
    tone: "bg-blue-tint",
    image: "/2025-tournament-1.jpg",
    alt: "Players and coaches gathered at the Junior Tennis Tournament",
    body: "The maiden edition of the Tennista Foundation Junior Tennis Tournament unfolded over four days at the Lawn Tennis Court, Rowe Park, Yaba, Lagos, in partnership with the Lagos Tennis Association and with the backing of the Lagos State Sports Commission.",
    width: 611,
    height: 307,
  },
  {
    tone: "bg-[#f7f6dc]",
    image: "/2025-tournament-2.jpg",
    alt: "A coach speaking with children on the court",
    body: "A total of 150 children registered to take part, with 55 young athletes competing through preliminaries all the way to the final.",
    width: 641,
    height: 307,
  },
  {
    tone: "bg-blue-tint",
    image: "/2025-tournament-3.jpg",
    alt: "U-16 winners holding trophies and a scholarship cheque",
    body: "The tournament concluded with David Edward and Goodnews Aina winning the Boys' and Girls' U-16 categories, respectively, while Benjamin Joel and Benjamin Ndifreke were the runners-up. The Tennista Foundation awarded each winner ₦100,000 in scholarships, and the runners-up received ₦75,000 each.",
    width: 671,
    height: 307,
  },
];

const editions2026: Edition[] = [
  {
    tone: "bg-blue-tint",
    image: "/2026-tournament-1.jpg",
    alt: "A player hitting a forehand on a clay court",
    body: "The second edition marked a clear step up in scale and ambition, moving to the clay courts of the Lagos Country Club, Ikeja, and running as a three-day event from April 16 to 18, 2026.",
    width: 611,
    height: 307,
  },
  {
    tone: "bg-[#f7f6dc]",
    image: "/2026-tournament-2.jpg",
    alt: "Players seated in the stands",
    body: "Over 60 players participated in the boys' and girls' categories, with a new U-12 division added to the existing U-16 category, allowing younger talent to shine. Zara Adegoke and Mohammed Naseer claimed the U-12 titles, while Atilola Moffun and Afaramai Heman won the U-16 categories.",
    width: 641,
    height: 307,
  },
  {
    tone: "bg-blue-tint",
    image: "/2026-tournament-3.jpg",
    alt: "Winners receiving a cheque, a racket, and prizes",
    body: "Winners received educational grants of ₦150,000 along with a racket worth $260, tennis balls, and bags, while runners-up received ₦100,000 and similar items.",
    width: 671,
    height: 307,
  },
  {
    tone: "bg-blue-tint",
    image: "/2026-tournament-4.jpg",
    alt: "Organisers in front of the tournament backdrop",
    body: "Beyond the court, the Foundation announced a new strategic partnership with the American Business Council aimed at securing collegiate tennis scholarships in the United States for Nigerian players, alongside continued support from the Lagos State Sports Commission and the Lagos Country Club.",
    width: 671,
    height: 307,
  },
];

const editions2027: Edition[] = [
  {
    tone: "bg-blue-tint",
    image: "/2027-tournament-1.jpg",
    alt: "Players sitting together with rackets",
    body: "Two editions in, the tournament has shown a clear trajectory of growth, expanding from 55 competing athletes in a single age category in 2025 to over 60 players across two categories in 2026.",
    width: 611,
    height: 307,
  },
  {
    tone: "bg-[#f7f6dc]",
    image: "/2027-tournament-2.jpg",
    alt: "A player standing on a clay court",
    body: "The 2027 edition is positioned to build on that momentum, though the venue, dates, and target participant numbers are yet to be slated. It remains to be seen whether new age categories or divisions will be introduced to match the tournament's growing footprint.",
    width: 641,
    height: 307,
  },
];

export function JuniorTennisOpen() {
  return (
    <>
      <section className="bg-white pt-14 pb-20 sm:pt-16 sm:pb-24">
        <Container>
          <div className="grid items-end gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-12">
            <h1 className="headline text-display-lg text-blue sm:text-display-xl">
              Junior Tennis Open
            </h1>
            <p className="max-w-md text-[0.98rem] leading-relaxed text-ink lg:justify-self-end">
              The Tennista Junior Tennis Open is our flagship annual tournament,
              a competitive stage where young players aged 8–16 test their
              skills in real match play, with certified officials, real draws,
              and prizes that go beyond trophies.
            </p>
          </div>

          <article className="relative isolate mt-12 overflow-hidden rounded-[1.75rem] bg-blue">
            <div className="relative z-10 flex flex-col justify-center px-6 py-10 sm:px-10 sm:py-12 lg:min-h-[23rem] lg:max-w-[40%] lg:px-12 lg:py-14">
              <h2 className="max-w-[16rem] text-[clamp(1.8rem,2.6vw,2.45rem)] leading-[1.05] font-bold text-white sm:max-w-[18rem]">
                Winners Don&apos;t Only Get To Lift Cups
              </h2>
              <p className="mt-4 max-w-[18rem] text-[0.98rem] leading-relaxed text-white/90 sm:max-w-[20rem]">
                They earn educational scholarships, rackets, and kits because at
                Tennista, every big swing is backed by a bigger future.
              </p>
              <p className="mt-5 max-w-[18rem] text-[0.98rem] leading-relaxed text-white/90 sm:max-w-[20rem]">
                What began in 2025 with 55 athletes at Rowe Park, Yaba, has
                grown into a multi-category tournament at the Lagos Country
                Club, with a pathway toward US collegiate scholarships now in
                the making. Here&apos;s the journey so far, edition by edition
              </p>
            </div>
            <div className="relative z-20 h-72 sm:h-96 lg:absolute lg:inset-y-0 lg:right-0 lg:h-auto lg:w-[60%]">
              <Image
                src="/jtopen.png"
                alt="A winner and a coach holding a trophy and a scholarship cheque"
                fill
                sizes="(max-width: 639px) 100vw, (max-width: 1023px) 100vw, 60vw"
                className="object-cover object-[center_46%] [clip-path:circle(92%_at_76%_50%)]"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute top-1/2 left-[76%] aspect-square h-[232%] -translate-x-1/2 -translate-y-1/2"
              />
            </div>
          </article>

          <EditionStack year="2025" editions={editions2025} className="mt-16" />
        </Container>
      </section>

      <section className="relative bg-lime">
        <svg
          aria-hidden
          viewBox="0 0 1440 90"
          preserveAspectRatio="none"
          className="absolute inset-x-0 top-0 h-14 w-full -translate-y-[99%] text-white sm:h-20"
        >
          <path
            fill="currentColor"
            d="M0,90 C320,90 460,10 720,10 C980,10 1120,90 1440,90 L1440,0 L0,0 Z"
          />
        </svg>
        <Container className="py-16 sm:py-20">
          <EditionStack year="2026" editions={editions2026} />
        </Container>
        <svg
          aria-hidden
          viewBox="0 0 1440 90"
          preserveAspectRatio="none"
          className="absolute inset-x-0 bottom-0 h-14 w-full translate-y-[99%] text-white sm:h-20"
        >
          <path
            fill="currentColor"
            d="M0,0 C320,0 460,80 720,80 C980,80 1120,0 1440,0 L1440,90 L0,90 Z"
          />
        </svg>
      </section>

      <section className="bg-white pt-24 pb-16 sm:pt-28">
        <Container>
          <EditionStack year="2027" editions={editions2027} />
          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <Button href="/fund-a-child">Donate Here</Button>
            <Button href="/get-involved/partner" variant="outlineBlue">
              Partner With Us
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}

function EditionStack({
  year,
  editions,
  className,
}: {
  year: string;
  editions: readonly Edition[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid items-start gap-8 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-10",
        className,
      )}
    >
      <h2 className="text-[clamp(1.8rem,3vw,2.5rem)] leading-none font-bold text-blue lg:sticky lg:top-[6.5rem]">
        {year} Tournament
      </h2>
      <div className="flex flex-col gap-5">
        {editions.map((edition, index) => (
          <article
            key={edition.body}
            className={cn(
              "grid items-center gap-5 rounded-[1.35rem] p-4 sm:p-6 lg:sticky lg:top-[5.75rem] lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:gap-8",
              edition.tone,
            )}
            style={{ zIndex: index + 1 }}
          >
            <p className="text-[0.98rem] leading-relaxed font-medium text-blue">
              {edition.body}
            </p>
            <Image
              src={edition.image}
              alt={edition.alt}
              width={edition.width}
              height={edition.height}
              sizes="(max-width: 1023px) calc(100vw - 4rem), 40vw"
              className="h-auto w-full rounded-[1rem]"
            />
          </article>
        ))}
      </div>
    </div>
  );
}
