import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

type GameCardData = {
  title: string;
  summary: string;
  body: string;
  cta: string;
  /** The activity's own page. */
  page: string;
  /** The form that page's call to action opens. */
  form: string;
  panel: string;
  titleClass: string;
  bodyClass: string;
  button: "outlineBlue" | "outlineWhite" | "lime";
  image: string;
  alt: string;
};

const cards: GameCardData[] = [
  {
    title: "Serve",
    summary: "Be part of the story.",
    body: "Be part of the story. Every young athlete who steps onto our courts carries a dream, and dreams need mentors, coaches, and hands willing to show up. As a volunteer, you'll work directly alongside our Tennistas, offering your time, your skill, and your encouragement at the moments they matter most.",
    cta: "Become A Volunteer",
    page: "/serve-with-us",
    form: "/get-involved/volunteer",
    panel: "bg-lime",
    titleClass: "text-blue",
    bodyClass: "text-blue-dark",
    button: "outlineBlue",
    image: "/geg-serve-circle.png",
    alt: "A woman helping two children with their schoolwork",
  },
  {
    title: "Support",
    summary: "Help expand access to opportunities where it is needed most.",
    body: "Talent is everywhere; opportunity isn't. Partnering with Tennista Foundation means investing in the infrastructure, coaching, courts, mentorships, and academic support that turn raw potential into real achievement. Together, we can close the gap between where a child starts and how far their ability can actually take them.",
    cta: "Partner With Us",
    page: "/get-involved/support",
    form: "/get-involved/partner",
    panel: "bg-blue",
    titleClass: "text-white",
    bodyClass: "text-white/90",
    button: "outlineWhite",
    image: "/geg-support-circle.png",
    alt: "A coach handing supply bags to young players in the stands",
  },
  {
    title: "Sponsor",
    summary: "Put a racket and a future into the hands of a kid who's ready.",
    body: "Sponsorship is one of the most direct ways to champion a young life: funding equipment, court time, tournament fees, and academic tutoring that many families simply can't afford on their own. Your sponsorship doesn't just cover a cost. It signals a door.",
    cta: "Sponsor A Student",
    page: "/get-involved/sponsor",
    form: "/get-involved/sponsor-a-student",
    panel: "bg-black",
    titleClass: "text-white",
    bodyClass: "text-white/90",
    button: "outlineWhite",
    image: "/geg-sponsor-circle.png",
    alt: "A boy holding a trophy and a tennis racket",
  },
  {
    title: "Student",
    summary: "Become a TenniSTAR and harness your full potential!",
    body: "Become a TenniSTAR and harness your full potential! If you're ready to grow on the court and in the classroom, this is your invitation. Our program pairs elite tennis coaching with academic mentorship, building not just stronger athletes, but sharper minds and more confident young leaders.",
    cta: "Apply Now",
    page: "/get-involved/student",
    form: "/get-involved/enrol",
    panel: "bg-blue",
    titleClass: "text-lime",
    bodyClass: "text-white/90",
    button: "lime",
    image: "/geg-student-circle.png",
    alt: "A girl filling in an application at a table",
  },
];

function GameCard({ card, index, detailed }: { card: GameCardData; index: number; detailed?: boolean }) {
  return (
    <div className="lg:sticky lg:top-[5.25rem]" style={{ zIndex: index + 1 }}>
      <article
        className={`relative isolate overflow-hidden rounded-[1.75rem] ${card.panel} ${
          detailed ? "flex flex-col md:block" : ""
        }`}
      >
        <div
          className={`relative z-10 flex flex-col justify-center px-6 py-8 sm:px-10 sm:py-12 ${
            detailed
              ? "order-2 min-h-0 max-w-none md:order-none md:min-h-[16rem] md:max-w-[58%]"
              : "md:min-h-[23rem] md:max-w-[50%] md:py-14 lg:max-w-[46%] lg:px-14"
          }`}
        >
          <h3 className={`headline text-display-lg leading-[0.85] ${card.titleClass}`}>{card.title}</h3>
          <p
            className={`mt-3 text-[0.95rem] leading-relaxed ${
              detailed ? "max-w-none md:max-w-[24rem]" : "max-w-[18rem]"
            } ${card.bodyClass}`}
          >
            {detailed ? card.body : card.summary}
          </p>
          <div className="mt-6">
            <Button
              href={card.title === "Student" || (!detailed && card.title !== "Serve") ? card.form : card.page}
              variant={card.button}
            >
              {card.cta}
            </Button>
          </div>
        </div>

        <div
          className={`z-20 ${
            detailed
              ? "relative order-1 h-64 w-full sm:h-80 md:absolute md:inset-y-0 md:right-0 md:order-none md:h-auto md:w-[48%]"
              : "relative hidden h-64 md:absolute md:inset-y-0 md:right-0 md:block md:h-auto md:w-[56%] lg:w-[62%]"
          }`}
        >
          <img src={card.image} alt={card.alt} className="h-full w-full object-cover md:absolute md:inset-0" />
        </div>
      </article>
    </div>
  );
}

export function GetInTheGame({ detailed = false }: { detailed?: boolean }) {
  return (
    <section aria-labelledby="game-heading" className="bg-white py-16 sm:py-20">
      <Container>
        <h2 id="game-heading" className="headline text-center text-display-lg text-blue sm:text-display-xl">
          Get in the game.
        </h2>
        <div className="mt-10 flex flex-col gap-20 sm:mt-14 lg:gap-[11.25rem]">
          {cards.map((card, index) => (
            <GameCard key={card.title} card={card} index={index} detailed={detailed} />
          ))}
        </div>
      </Container>
    </section>
  );
}

export function ActivityDetail({ title }: { title: GameCardData["title"] }) {
  const card = cards.find((item) => item.title === title);
  if (!card) return null;

  return (
    <section aria-labelledby="activity-heading" className="bg-white px-5 py-14 sm:py-20">
      <div className="mx-auto grid w-full max-w-[87.5rem] items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <div>
          <h1 id="activity-heading" className="headline text-display-lg leading-[0.85] text-blue">
            {card.title}
          </h1>
          <p className="mt-5 max-w-[36rem] text-[1.05rem] leading-relaxed text-gray">{card.body}</p>
          <div className="mt-8">
            <Button href={card.form}>{card.cta}</Button>
          </div>
        </div>
        <img src={card.image} alt={card.alt} className="h-auto w-full rounded-[1.75rem]" />
      </div>
    </section>
  );
}
