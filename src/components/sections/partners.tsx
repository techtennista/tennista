import { Container } from "@/components/ui/container";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";

const brands = [
  { name: "USTA", src: "/brands/usta.png" },
  { name: "Google for Nonprofits", src: "/brands/google.png" },
  { name: "Microsoft", src: "/brands/microsoft.png" },
  { name: "Lagos Country Club", src: "/brands/lagos-country-club.png" },
  { name: "Munch It", src: "/brands/munch-it.png" },
  { name: "American Business Council", src: "/brands/abc.png" },
  { name: "Lagos State Sports Commission", src: "/brands/lssc.png" },
  { name: "Minimie", src: "/brands/minimie.png" },
  { name: "Indomie", src: "/brands/indomie.png" },
  { name: "Coca-Cola", src: "/brands/coca-cola.png" },
  { name: "Ewing Marion Kauffman Foundation", src: "/brands/ewing-kauffman.png" },
  { name: "goodstack", src: "/brands/goodstack.png" },
  { name: "Domain Influence Leadership Initiative", src: "/brands/domain-influence.png" },
];

const mentions = [
  {
    name: "Punch",
    src: "/public-eyes/punch.png",
    href: "https://punchng.com/tennista-foundation-eyes-grassroots-dev/",
  },
  {
    name: "ThisDay",
    src: "/public-eyes/this-day.png",
    href: "https://www.thisdaylive.com/2025/04/20/tennista-foundation-offers-junior-tennis-tournament-winners-runner-ups-scholarship/",
  },
  {
    name: "The Sun",
    src: "/public-eyes/the-sun.png",
    href: "https://thesun.ng/tennista-foundation-offers-junior-tennis-tournament-winners-runner-ups-scholarships/",
  },
  {
    name: "SportXvibe",
    src: "/public-eyes/sportxvibe.png",
    href: "https://sportxvibe.com.ng/tennista-foundation-offers-junior-tennis-tournament-winners-runner-ups-scholarship/",
  },
  { name: "Independent", src: "/public-eyes/independent.png" },
  {
    name: "msn",
    src: "/public-eyes/msn.png",
    href: "https://www.msn.com/en-xl/africa/nigeria/tennista-foundation-eyes-grassroots-dev/ar-AA1Dd63U",
  },
  {
    name: "The Guardian",
    src: "/public-eyes/the-guardian.png",
    href: "https://guardian.ng/sport/tennis/edward-aina-win-maiden-junior-tennis-tourney/",
  },
  {
    name: "Daily Trust",
    src: "/public-eyes/daily-trust.png",
    href: "https://dailytrust.com/foundation-offers-scholarship-to-junior-tennis-players/",
  },
  {
    name: "BusinessDay",
    src: "/public-eyes/business-day.png",
    href: "https://businessday.ng/sports/article/tennista-offer-junior-tennis-tournament-winners-runner-ups-scholarship/",
  },
];

type Logo = { name: string; src: string; href?: string };

function LogoSlot({ name, src, href }: Logo) {
  const mark = (
    <img
      src={src}
      alt={name}
      className="max-h-16 w-auto max-w-[12.5rem] object-contain transition-transform duration-500 ease-[var(--ease-out-expo)] hover:scale-105 sm:max-h-[4.5rem]"
    />
  );

  return (
    <div className="grid h-24 place-items-center px-3 sm:h-28">
      {href ? (
        <a href={href} target="_blank" rel="noreferrer noopener" aria-label={`${name} coverage of Tennista`}>
          {mark}
        </a>
      ) : (
        mark
      )}
    </div>
  );
}

function LogoWall({ logos }: { logos: Logo[] }) {
  const loneLast = logos.length % 3 === 1;

  return (
    <RevealGroup
      as="ul"
      gap={0.07}
      className="mt-14 grid grid-cols-2 items-center gap-x-6 gap-y-10 sm:grid-cols-3 sm:gap-y-14"
    >
      {logos.map((logo, index) => (
        <RevealItem
          as="li"
          key={logo.name}
          className={loneLast && index === logos.length - 1 ? "col-span-2 sm:col-span-1 sm:col-start-2" : undefined}
        >
          <LogoSlot name={logo.name} src={logo.src} href={logo.href} />
        </RevealItem>
      ))}
    </RevealGroup>
  );
}

export function Brands() {
  return (
    <section aria-labelledby="brands-heading" className="bg-white py-16 sm:py-20">
      <Container>
        <Reveal>
          <h2 id="brands-heading" className="headline text-center text-display-lg sm:text-display-xl">
            <span className="text-blue">Brands that have taken</span>
            <span className="block text-blue-bright">a bet on our youths</span>
          </h2>
        </Reveal>
        <LogoWall logos={brands} />
      </Container>
    </section>
  );
}

export function PublicEyes() {
  return (
    <section aria-labelledby="press-heading" className="bg-white pb-10 sm:pb-12">
      <Container>
        <Reveal>
          <h2 id="press-heading" className="headline text-center text-display-lg text-blue sm:text-display-xl">
            Tennista from
            <span className="block">the public eyes</span>
          </h2>
        </Reveal>
        <LogoWall logos={mentions} />
      </Container>
    </section>
  );
}
