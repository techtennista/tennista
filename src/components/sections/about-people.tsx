"use client";

import { useCallback, useRef, useState } from "react";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";
import { cn } from "@/lib/utils";

type Person = {
  name: string;
  role: string;
  bio?: string;
  photo: string;
  image?: string;
  linkedin?: string;
};

const leaders: Person[] = [
  {
    name: "Michael Nwoseh",
    role: "Founder, Tennista Foundation",
    photo: "Michael Nwoseh",
    image: "/team/michael-nwoseh.jpg",
    linkedin: "https://linkedin.com/in/michael-nwosu-8a5b4279",
    bio: "Michael is a marketing professional and an experienced non-profit leader who believes in the potential of young people and provides the platform for their talents to find expression through the right mix of sports, academic support and life skill training.",
  },
];

const advisors: Person[] = [
  {
    name: "Gabriel Fagbohun",
    role: "Management Consultant",
    photo: "Gabriel Fagbohun",
    bio: "A management, education, and career consultant and a public servant who believes aptitude, attitude and interest are fundamental to developing young talent. He has worked in talent development for over 15 years.",
  },
  {
    name: "Ayodeji Dada",
    role: "Sales and Operations Director",
    photo: "Ayodeji Dada",
    bio: "Ayodeji Dada is Sales and Operations Director for West Africa at Diversey (now part of Solenis Group). A lover of golf and tennis, he volunteers his time to support operations at Tennista Foundation.",
  },
  {
    name: "Titus Emmanuel",
    role: "—",
    photo: "Titus Emmanuel",
  },
];

function PersonCard({
  person,
  open,
  onToggle,
}: {
  person: Person;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <article className="relative w-[min(100%,22rem)] shrink-0 snap-start sm:w-[calc((100%-2.5rem)/3)]">
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className="flex h-full min-h-[28rem] w-full flex-col overflow-hidden rounded-[1.35rem] text-left"
      >
        {open ? (
          <span className="flex h-full flex-1 flex-col bg-lime px-5 py-6 pr-14 sm:px-6 sm:pr-16">
            <span>
              <span className="headline block text-[1.15rem] leading-tight text-blue">{person.name}</span>
              <span className="mt-1 block text-sm text-blue-dark/80">{person.role}</span>
            </span>
            {person.bio ? (
              <span className="mt-6 block text-[0.95rem] leading-relaxed text-blue-dark/90">{person.bio}</span>
            ) : null}
          </span>
        ) : (
          <>
            <span className="relative block min-h-64 flex-1 bg-blue-tint">
              {person.image ? (
                <img
                  src={person.image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover object-[center_12%]"
                />
              ) : (
                <MediaPlaceholder label={person.photo} className="absolute inset-0 h-full w-full rounded-none" />
              )}
            </span>
            <span className="flex items-center bg-lime px-4 py-3 pr-14">
              <span>
                <span className="headline block text-[1.05rem] leading-tight text-blue">{person.name}</span>
                <span className="mt-0.5 block text-xs text-blue-dark/75">{person.role}</span>
              </span>
            </span>
          </>
        )}
      </button>
      {person.linkedin ? (
        <a
          href={person.linkedin}
          target="_blank"
          rel="noreferrer noopener"
          aria-label={`${person.name} on LinkedIn`}
          className="absolute top-4 right-4 z-10 grid size-7 place-items-center rounded-md bg-blue text-[0.65rem] font-bold text-white"
        >
          in
        </a>
      ) : (
        <span
          aria-hidden
          className="pointer-events-none absolute top-4 right-4 z-10 grid size-7 place-items-center rounded-md bg-blue text-[0.65rem] font-bold text-white"
        >
          in
        </span>
      )}
    </article>
  );
}

function Arrow({
  direction,
  disabled,
  onClick,
}: {
  direction: "left" | "right";
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={direction === "left" ? "Previous" : "Next"}
      disabled={disabled}
      onClick={onClick}
      className="grid size-11 place-items-center rounded-full bg-blue text-lime disabled:cursor-default"
    >
      <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden>
        <path
          d={direction === "left" ? "M14.5 6.5L8.5 12l6 5.5" : "M9.5 6.5L15.5 12l-6 5.5"}
          stroke="currentColor"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

function PeopleRow({
  id,
  eyebrow,
  title,
  people,
}: {
  id: string;
  eyebrow?: string;
  title: string;
  people: Person[];
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const [openName, setOpenName] = useState<string | null>(null);
  const [edges, setEdges] = useState({ atStart: true, atEnd: people.length <= 3 });

  const syncEdges = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    setEdges({
      atStart: el.scrollLeft <= 8,
      atEnd: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8,
    });
  }, []);

  const move = (direction: -1 | 1) => {
    const el = scroller.current;
    const card = el?.querySelector("article");
    if (!el || !card) return;
    el.scrollBy({ left: direction * (card.clientWidth + 20), behavior: "smooth" });
  };

  return (
    <div>
      <div className="flex items-end justify-between gap-6">
        <div>
          {eyebrow ? (
            <p className="text-[0.75rem] font-bold tracking-[0.28em] text-ink-muted uppercase">{eyebrow}</p>
          ) : null}
          <h2 id={id} className={cn("headline text-display-lg text-blue sm:text-display-xl", eyebrow && "mt-2")}>
            {title}
          </h2>
        </div>
        <div className="flex gap-3">
          <Arrow direction="left" disabled={edges.atStart} onClick={() => move(-1)} />
          <Arrow direction="right" disabled={edges.atEnd} onClick={() => move(1)} />
        </div>
      </div>

      <div
        ref={scroller}
        onScroll={syncEdges}
        className="mt-8 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {people.map((person) => (
          <PersonCard
            key={person.name}
            person={person}
            open={openName === person.name}
            onToggle={() => setOpenName((current) => (current === person.name ? null : person.name))}
          />
        ))}
      </div>
    </div>
  );
}

export function AboutPeople() {
  return (
    <section aria-labelledby="leaders-heading" className="bg-white py-16 sm:py-20">
      <div className="space-y-16 px-4 sm:space-y-20 sm:px-6 lg:px-12">
        <PeopleRow id="leaders-heading" eyebrow="Meet us" title="The team leaders" people={leaders} />
        <PeopleRow id="board-heading" title="Our advisory board" people={advisors} />
      </div>
    </section>
  );
}
