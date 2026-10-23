import Image from "next/image";
import { Container } from "@/components/ui/container";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

export type Quote = {
  text: string;
  /** Person credit, rendered with an em dash. Omit when `caption` carries the line instead. */
  attribution?: string;
  /** Supporting line under the quote, in lime, without a dash. */
  caption?: string;
  /** Label for the photo slot until the design export replaces it. */
  photo: string;
  /** Final photograph. When set, it fills the card from the top. */
  image?: string;
  /** Object-position for the photograph. */
  imagePosition?: string;
  /** Keep the photograph on the right of the card so the person stays clear of the blue. */
  imageAlign?: "right";
};

const quotes: Quote[] = [
  {
    text: "I think sports standardises everything... but more importantly, it teaches you about life, mentorship, and how to respect your opponent.",
    attribution: "Billie Jean King",
    photo: "Billie Jean King",
    image: "/billie-jean-king.jpg",
  },
];

function QuoteMark() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 159 138"
      fill="none"
      className="block h-[8.625rem] w-[9.9375rem]"
    >
      <path
        d="M61.1188 0.135491C61.4647 0.0895591 61.812 0.0559813 62.1604 0.0343664C66.6023 -0.25512 70.877 1.67189 68.702 7.06077C67.5769 9.84832 63.3878 12.5886 61.1723 14.8983C51.9033 24.4411 45.9787 36.7321 44.2875 49.9275C43.6016 55.4291 43.6211 61.7045 43.7446 67.2304L56.1503 67.1486C59.5405 67.1349 65.309 66.6219 68.0792 68.959C69.6851 70.314 69.8841 73.4698 69.8852 75.4827C69.8924 87.6716 69.8692 99.8636 69.881 112.054L69.8912 124.185C69.8939 126.553 70.018 129.132 69.7623 131.466C69.3971 134.799 67.8584 136.667 64.4886 136.944C60.944 137.235 57.4823 137.138 53.9616 137.138L34.8512 137.13L16.25 137.144C12.8221 137.146 9.21495 137.316 5.8268 136.971C2.49887 136.633 0.732816 135.617 0.289324 132.15C-0.142203 128.775 0.0351546 125.456 0.0409443 122.075L0.0587 105.231L0.0490499 82.572C0.0486639 76.9454 0.0069778 70.017 0.588073 64.3821C2.03106 51.5488 6.78481 39.3107 14.3829 28.8681C25.6853 13.0375 42.0942 3.31791 61.1188 0.135491Z"
        fill="#E2E559"
      />
      <path
        d="M149.708 0.139828C152.918 -0.353842 158.038 0.313519 157.962 4.52573C157.886 8.75088 152.339 12.0697 149.424 15.1912C134.974 30.6694 131.732 46.0477 132.245 67.1898L144.39 67.1495C159.334 67.1228 158.295 67.8214 158.278 82.1666L158.263 100.114L158.277 120.846C158.28 124.681 158.422 128.861 158.023 132.663C157.873 134.087 157.011 135.063 156.169 136.199C152.373 137.524 145.943 137.139 141.775 137.139L123.241 137.13L104.905 137.152C100.056 137.16 95.0888 137.641 90.5005 135.963C87.7959 132.498 88.532 126.354 88.537 122.062L88.5588 104.036L88.5476 82.7574C88.5445 77.7948 88.4198 71.8555 88.8157 66.9576C89.898 53.4205 94.6465 40.4336 102.552 29.391C114.286 13.2151 130.012 3.26898 149.708 0.139828Z"
        fill="#E2E559"
      />
    </svg>
  );
}

/**
 * Pull-quote band. Add another entry to `quotes` and it renders as its own card.
 * Photography is a placeholder until the export lands.
 */
export function Quotes({
  items = quotes,
  id = "quotes-heading",
  /** `page` matches a full-width band such as the mission photo row. */
  edge = "site",
  overlapNext = false,
}: {
  items?: readonly Quote[];
  id?: string;
  edge?: "site" | "page";
  overlapNext?: boolean;
}) {
  const frame =
    edge === "page" ? (
      "space-y-6 px-5 sm:px-8 lg:px-12"
    ) : undefined;

  return (
    <section
      aria-labelledby={id}
      className={cn(
        "relative bg-white py-6 sm:py-10",
        overlapNext && "lg:z-20 lg:mb-[-4rem] lg:bg-transparent lg:pb-0",
      )}
    >
      <h2 id={id} className="sr-only">
        Quotes
      </h2>
      <Container className={frame ?? "space-y-6"} width={edge === "page" ? "wide" : "default"}>
        {items.map((quote) => (
          <Reveal key={quote.attribution ?? quote.caption ?? quote.text}>
            <figure
              className={cn(
                "relative overflow-hidden rounded-[1.25rem] bg-blue",
                quote.image
                  ? "min-h-[26rem] lg:h-[34rem] lg:min-h-0"
                  : "grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]",
              )}
            >
              {quote.image ? (
                <div
                  className={cn(
                    "pointer-events-none absolute inset-y-0",
                    quote.imageAlign === "right"
                      ? "right-0 w-[67%] [mask-image:linear-gradient(to_right,transparent_0%,black_24%)] [-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_24%)]"
                      : "inset-x-0",
                  )}
                >
                  <Image
                    src={quote.image}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 80rem, 100vw"
                    className={cn("object-cover", quote.imagePosition ?? "object-[72%_32%]")}
                  />
                </div>
              ) : null}
              <div
                aria-hidden
                className={cn(
                  "pointer-events-none absolute inset-0",
                  quote.image
                    ? "bg-[linear-gradient(90deg,#003c94_0%,#003c94_30%,rgb(0_60_148/0.72)_46%,rgb(0_60_148/0.18)_100%)]"
                    : "hidden",
                )}
              />
              <div className="relative z-10 px-7 py-9 sm:px-12 sm:py-12 lg:max-w-[46rem] lg:py-14 lg:pr-10">
                <QuoteMark />
                <blockquote className="mt-4 max-w-[38rem] text-[clamp(1.35rem,2.1vw,1.85rem)] leading-[1.35] font-bold text-white">
                  <p>{quote.text}</p>
                </blockquote>
                {quote.caption ? (
                  <figcaption className="mt-6 max-w-md text-sm leading-relaxed text-lime">{quote.caption}</figcaption>
                ) : (
                  <figcaption className="mt-6 text-sm font-medium text-lime">— {quote.attribution}</figcaption>
                )}
              </div>

              {quote.image ? null : (
                <div className="relative min-h-52 lg:min-h-full">
                  <MediaPlaceholder label={quote.photo} className="absolute inset-0 h-full" />
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-t from-blue via-blue/55 to-blue/10 lg:bg-gradient-to-r lg:from-blue lg:via-blue/75 lg:to-blue/15"
                  />
                </div>
              )}
            </figure>
          </Reveal>
        ))}
      </Container>
    </section>
  );
}
