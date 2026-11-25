import Image from "next/image";

export function ProgramsHero() {
  return (
    <section
      aria-labelledby="programs-heading"
      className="bg-white pt-14 sm:pt-16"
    >
      <div className="grid items-center gap-8 px-5 sm:px-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] lg:gap-16 lg:px-12">
        <h1
          id="programs-heading"
          className="headline text-display-xl text-blue"
        >
          Our programs
        </h1>
        <p className="max-w-xl text-[0.975rem] leading-relaxed text-ink lg:justify-self-end">
          We turn potential into purpose through the power of sport. By
          combining tennis instruction with educational development and
          essential life skills, our programs equip young people with the
          discipline, confidence, and resilience needed to excel in the
          classroom, on the court, and in their communities.
        </p>
      </div>

      <div className="relative mt-10 overflow-hidden rounded-t-[1.75rem] sm:mt-12">
        <Image
          src="/our-programs-bg.jpg"
          alt="A coach and a young player on a clay court"
          width={2100}
          height={870}
          sizes="100vw"
          className="block h-auto w-full"
        />
        <svg
          viewBox="0 0 1440 140"
          preserveAspectRatio="none"
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[clamp(3.25rem,8vw,6.75rem)] w-full text-white"
        >
          <path
            d="M0,92 C220,104 420,34 700,26 C980,18 1220,48 1440,82 L1440,140 L0,140 Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </section>
  );
}
