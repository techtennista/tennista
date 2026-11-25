import type { ReactNode } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";

type ChampionProps = {
  id?: string;
  title?: ReactNode;
  photo?: string;
  image?: string;
  cutout?: string;
};

type ChampionPhotoProps = {
  image: string;
  cutout: string;
  alt: string;
};

/**
 * Reusable desktop photo treatment: the court image is curved into the card,
 * while the enlarged foreground player breaks above it and is clipped at the
 * card's bottom edge.
 */
export function ChampionPhoto({ image, cutout, alt }: ChampionPhotoProps) {
  return (
    <>
      <div
        className="absolute inset-y-0 right-0 hidden w-[55%] overflow-hidden rounded-r-[1.25rem] lg:block"
        style={{ clipPath: "ellipse(80% 142% at 100% 52%)" }}
      >
        <Image
          src={image}
          alt=""
          fill
          sizes="(min-width: 1024px) 55vw, 100vw"
          className="object-cover object-[center_22%]"
        />
      </div>

      <div className="pointer-events-none absolute -top-[22%] right-0 hidden h-[122%] w-[55%] overflow-hidden lg:block">
        <Image
          src={cutout}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 55vw, 100vw"
          className="origin-top translate-x-[4%] scale-[1.28] object-cover object-[center_18%] grayscale"
        />
      </div>
    </>
  );
}

/**
 * The court photo has the supplied one-sided curve. A grayscale copy of the
 * foreground player sits above it and is not clipped by the blue panel.
 */
export function Champion({
  id = "champion-heading",
  title = (
    <>
      Every champion
      <br />
      starts with someone
      <br />
      who believed first.
    </>
  ),
  photo = "On the court",
  image,
  cutout,
}: ChampionProps) {
  const framed = Boolean(image && cutout);

  return (
    <section
      aria-labelledby={id}
      className="overflow-visible bg-white py-8 sm:py-14 lg:pt-24"
    >
      <Container>
        <div className="relative">
          <div className="relative overflow-hidden rounded-[1.25rem] bg-blue px-6 py-10 sm:px-10 sm:py-12 lg:min-h-[23rem] lg:px-14 lg:py-14 lg:pr-[46%]">
            <div className="relative z-10 lg:max-w-[36rem]">
              <h2
                id={id}
                className="headline text-display-lg leading-[0.88] text-white"
              >
                {title}
              </h2>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button href="/get-involved/sponsor-a-student" variant="lime">
                  Sponsor A Child&apos;s Journey
                </Button>
                <Button href="/get-involved/partner" variant="outlineWhite">
                  Partner With Us
                </Button>
              </div>
            </div>
          </div>

          {framed ? (
            <>
              <ChampionPhoto image={image!} cutout={cutout!} alt={photo} />

              <div className="relative mt-5 h-72 overflow-hidden rounded-[1.25rem] lg:hidden">
                <Image
                  src={image!}
                  alt=""
                  fill
                  sizes="(max-width: 1023px) 100vw, 55vw"
                  className="object-cover"
                />
                <Image
                  src={cutout!}
                  alt={photo}
                  fill
                  sizes="(max-width: 1023px) 100vw, 55vw"
                  className="object-cover"
                />
              </div>
            </>
          ) : (
            <>
              <div className="mt-4 h-72 overflow-hidden rounded-[1.75rem] sm:h-80 lg:hidden">
                <MediaPlaceholder label={photo} className="h-full w-full" />
              </div>

              <div
                className="absolute inset-y-0 -right-14 left-[42%] hidden lg:block"
                style={{
                  clipPath:
                    "polygon(34% 0%, 31% 8%, 27% 16%, 22% 26%, 17% 36%, 13% 46%, 10% 56%, 8% 66%, 7% 76%, 7% 88%, 7% 100%, 100% 100%, 100% 0%)",
                }}
              >
                <MediaPlaceholder label={photo} className="h-full w-full" />
              </div>
            </>
          )}
        </div>
      </Container>
    </section>
  );
}
