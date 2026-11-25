import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";
import Image from "next/image";

const rows = [
  {
    image: "/school-tennis-1.jpg",
    alt: "A boy lunging for a ball on a clay court",
    tone: "bg-blue-tint",
    body: "Rather than waiting for young players to find their way to us, we go to them, partnering directly with schools to bring tennis, coaching, and opportunity right onto their own campuses.",
    height: 713,
  },
  {
    image: "/school-tennis-2.jpg",
    alt: "A player serving on a clay court, seen from above",
    tone: "bg-[#f7f6dc]",
    body: "The Tennista Foundation School Tennis Program is a flagship grassroots initiative that partners with primary and secondary schools to establish sustainable tennis programs that develop the next generation of student-athletes and leaders.",
    height: 513,
  },
  {
    image: "/school-tennis-3.jpg",
    alt: "A player hitting a forehand on a blue court",
    tone: "bg-blue-tint",
    body: "The program combines sports, education, and character development to help young people succeed both on and off the court.",
    height: 441,
  },
  {
    image: "/school-tennis-4.jpg",
    alt: "A player walking across a clay court",
    tone: "bg-[#f7f6dc]",
    body: "The program was officially launched with Igbobi College, Lagos, as its pioneer partner school, where the Foundation donated tennis equipment and ₦250,000 toward court maintenance while providing professional coaching and life-skills education for a 1-year period.",
    height: 513,
  },
  {
    image: "/school-tennis-5.jpg",
    alt: "Two players talking at the net",
    tone: "bg-blue-tint",
    body: "At the core of it, the School Tennis Support Program is about meeting young people where they already are – in the classroom, on the tennis court, among their friends – and showing them that tennis, and everything that comes with it, belongs to them too.",
    height: 561,
  },
] as const;

export function SchoolTennisSupport() {
  return (
    <section className="bg-white py-14 sm:py-16">
      <Container>
        <p className="eyebrow text-center text-ink-muted">Our programs</p>
        <h1 className="headline mt-4 text-center text-display-lg text-blue sm:text-display-xl">
          School Tennis
          <br />
          Support Program
        </h1>

        <div className="mt-14 flex flex-col gap-8 sm:mt-16 lg:gap-10">
          {rows.map((row, index) => (
            <article
              key={row.image}
              className="grid items-stretch gap-6 bg-white lg:sticky lg:top-[5.75rem] lg:grid-cols-2 lg:gap-10"
              style={{ zIndex: index + 1 }}
            >
              <Image
                src={row.image}
                alt={row.alt}
                width={890}
                height={row.height}
                sizes="(max-width: 767px) calc(100vw - 2rem), (max-width: 1279px) 45vw, 40rem"
                className="h-auto w-full rounded-[1.25rem]"
              />
              <div
                className={cn("flex h-full flex-col", index === 0 && "gap-6")}
              >
                {index === 0 ? (
                  <div>
                    <h2 className="text-[clamp(1.15rem,1.6vw,1.45rem)] leading-snug font-bold tracking-wide text-blue uppercase">
                      Bringing tennis straight to the classroom.
                    </h2>
                    <p className="mt-3 text-[0.98rem] leading-relaxed text-ink">
                      Not every child gets the chance to walk onto a tennis
                      court and discover what they&apos;re capable of. For many
                      students, the biggest barrier isn&apos;t talent; it&apos;s
                      access, and Tennista Foundation School Tennis Support
                      Programme closes that gap.
                    </p>
                  </div>
                ) : null}
                <p
                  className={cn(
                    "flex flex-1 items-center rounded-[1.35rem] px-7 py-8 text-[0.98rem] leading-relaxed text-blue sm:px-10 sm:py-10",
                    row.tone,
                  )}
                >
                  {row.body}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <Button href="/programs" variant="outlineBlue">
            Go Back To Programs
          </Button>
          <Button href="/junior-tennis-open">Next Pillar</Button>
        </div>
      </Container>
    </section>
  );
}
