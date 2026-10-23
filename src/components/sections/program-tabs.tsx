"use client";

import { useEffect, useState } from "react";
import { SdgGoals } from "@/components/sections/sdg-goals";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const tabs = ["Tennis", "Educational Scholarships", "Life Skills Training"] as const;
type ProgramTab = (typeof tabs)[number];

const tabByHash: Record<string, ProgramTab> = {
  tennis: "Tennis",
  "educational-scholarships": "Educational Scholarships",
  "life-skills-training": "Life Skills Training",
};

const hashByTab: Record<ProgramTab, string> = {
  Tennis: "tennis",
  "Educational Scholarships": "educational-scholarships",
  "Life Skills Training": "life-skills-training",
};

function tabFromLocation() {
  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get("tab");
  if (fromQuery && tabByHash[fromQuery]) return tabByHash[fromQuery];
  return tabByHash[window.location.hash.replace(/^#/, "")] ?? "Tennis";
}

const chapters = [
  {
    tone: "bg-blue-tint",
    image: "/how-it-started-1.jpg",
    alt: "Players and coaches at the Tennista Foundation Junior Tennis Tournament",
    imageFirst: true,
    body: "In 2021, Tennista Foundation was founded as a non-profit based in Lagos, on a simple belief: tennis could open doors for young people, not just serve as a sport of privilege. Three years later, Tennista foundation expanded its global focus, by registering as a 501(c)(3) non-profit organization in the US in 2024.",
  },
  {
    tone: "bg-[#f7f6dc]",
    image: "/howit-started-2.jpg",
    alt: "A coach speaking with children on an outdoor court",
    imageFirst: false,
    body: "In 2025, Tennista held its first Junior Tennis Tournament at Rowe Park, Lagos, drawing 55 young athletes and awarding scholarships to winners and runners-up.",
  },
  {
    tone: "bg-blue-tint",
    image: "/how-it-started-3.jpg",
    alt: "Speakers seated at a Junior Tennis panel",
    imageFirst: true,
    body: "By April 2026, the tournament's second edition at the Lagos Country Club had grown to hundreds of participants and was even better. We announced partnerships with U.S. institutions to help top Nigerian players earn collegiate tennis scholarships, turning this supposedly local tournament into an international pipeline from courts in Lagos to campuses abroad.",
  },
] as const;

const pillars = [
  {
    title: "School Tennis Support",
    image: "/school-tennis-support.jpg",
    alt: "A scholarship cheque presented in front of a Tennista backdrop",
    href: "/programs/school-tennis-support",
    body: "Not every child gets the chance to walk onto a tennis court and discover what they're capable of. For many students, the biggest barrier isn't talent; it's access.",
  },
  {
    title: "Junior Tennis Open",
    image: "/junio-tennis-open.jpg",
    alt: "A speaker with a microphone at the Junior Tennis Open",
    href: "/junior-tennis-open",
    body: "The Tennista Foundation Junior Tennis Tournament is a competitive platform for young players aged 8 to 16 where their talent is tested and rewarded on the court.",
  },
  {
    title: "Tennis Clinic for Kids",
    image: "/tennis-clinic.jpg",
    alt: "Children with rackets at a tennis clinic",
    href: "/programs/tennis-training",
    body: "Our tennis program features eight weeks of beginner-to-expert training with meaningful and positive experiences that will be enjoyable and lead to positive development.",
  },
] as const;

export function ProgramTabs() {
  const [tab, setTab] = useState<ProgramTab>("Tennis");

  useEffect(() => {
    const apply = () => setTab(tabFromLocation());
    apply();
    window.addEventListener("hashchange", apply);
    window.addEventListener("popstate", apply);

    // Next.js same-route hash clicks use pushState and skip hashchange.
    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement | null)?.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || (!href.includes("#") && !href.includes("tab="))) return;
      const url = new URL(href, window.location.origin);
      if (url.pathname === "/programs") queueMicrotask(apply);
    };
    document.addEventListener("click", onClick);

    return () => {
      window.removeEventListener("hashchange", apply);
      window.removeEventListener("popstate", apply);
      document.removeEventListener("click", onClick);
    };
  }, []);

  const selectTab = (label: ProgramTab) => {
    setTab(label);
    const next = `/programs#${hashByTab[label]}`;
    if (`${window.location.pathname}${window.location.search}${window.location.hash}` !== next) {
      window.history.replaceState(null, "", next);
    }
  };

  return (
    <section id="program-tabs" aria-labelledby="program-tab-heading" className="bg-white px-5 py-14 sm:px-8 sm:py-16 lg:px-12">
      <div className="flex flex-wrap justify-center gap-3">
        {tabs.map((label) => {
          const selected = label === tab;
          return (
            <button
              key={label}
              id={hashByTab[label]}
              type="button"
              aria-pressed={selected}
              onClick={() => selectTab(label)}
              className={cn(
                "rounded-full px-5 py-2 text-xs font-bold tracking-wide uppercase",
                selected ? "bg-blue text-white" : "border-2 border-blue bg-white text-blue",
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      <h2 id="program-tab-heading" className="headline mt-10 text-center text-display-lg text-blue sm:text-display-xl">
        {tab}
      </h2>

      {tab === "Tennis" ? <TennisPanel /> : null}
      {tab === "Educational Scholarships" ? <ScholarshipsPanel /> : null}
      {tab === "Life Skills Training" ? <LifeSkillsPanel /> : null}
    </section>
  );
}

function ScholarshipsPanel() {
  return (
    <div className="mx-auto mt-8 max-w-[82.5rem]">
      <p className="mx-auto max-w-3xl text-center text-[0.975rem] leading-relaxed text-ink-muted">
        We leverage the platform of Tennis to identify outstanding talent and invest in it by supporting
        students with academic scholarships and essential learning materials, including textbooks and
        notebooks, across our communities and the world at large.
      </p>
      <div className="mt-12 rounded-[1.75rem] bg-blue-tint px-6 py-10 sm:px-12 sm:py-12">
        <p className="mx-auto max-w-4xl text-center text-[1.05rem] leading-relaxed font-medium text-blue">
          Our contribution to the achievement of the UN Sustainable Development Goals by 2030 is by
          rewarding high-flying students for their excellence and equipping them with the resources to
          sustain it. Because talent deserves the tools to thrive.
        </p>
      </div>
      <div className="mt-6">
        <SdgGoals ids={[1, 4]} />
      </div>
    </div>
  );
}

const activities = [
  { title: "Games", image: "/games.jpg", alt: "Children with rackets on a clay court" },
  { title: "Role play", image: "/role-play.jpg", alt: "A boy hitting a forehand" },
  { title: "Group work", image: "/group-work.jpg", alt: "Children lined up across a court" },
  { title: "Open discussion", image: "/open-discussion.jpg", alt: "A coach talking with two players" },
  { title: "Debates", image: "/debates.jpg", alt: "A student speaking into a microphone" },
  { title: "Field work", image: "/field-work.jpg", alt: "A girl smiling beside a tennis racket" },
  { title: "Panel discussions", image: "/panel-discussions.jpg", alt: "A panel seated at a table" },
  { title: "Mentoring programs", image: "/mentoring-programs.jpg", alt: "Mentors working through papers with a student" },
] as const;

/** Desktop styles: 40px, compressed extra-bold, 80% line-height, −1% tracking, #0160B4. */
const boxedLabel =
  "headline text-[clamp(1.5rem,2.8vw,2.5rem)] leading-[0.8] text-blue-bright [text-box-edge:cap_alphabetic] [text-box-trim:trim-both]";

const whoPillars = [
  "Critical thinking & decision-making",
  "Interpersonal & communication skills",
  "Coping & self-management",
] as const;

const deeperSkills = [
  "Creative thinking",
  "Self-awareness",
  "Emotional intelligence",
  "Problem-solving",
  "Wellness and health awareness",
  "Personality discovery",
  "Money management",
  "Work readiness",
  "Public speaking",
  "Technical skills",
  "Time management",
  "Teamwork",
  "Home economics",
  "Negotiation",
  "Effective planning and implementation",
  "Basic etiquette",
  "Self-discipline",
  "Research and numeracy skills",
  "Leadership",
] as const;

const deeperGroups = [3, 4, 3, 4, 3, 2].map((size, groupIndex, sizes) => {
  const start = sizes.slice(0, groupIndex).reduce((sum, count) => sum + count, 0);
  return deeperSkills.slice(start, start + size);
});

function LifeSkillsPanel() {
  return (
    <div className="mx-auto mt-8 max-w-[82.5rem]">
      <p className="mx-auto max-w-3xl text-center text-[0.975rem] leading-relaxed text-ink-muted">
        Every child on our courts learns to serve, return, win and learn. Our Life Skills program teaches
        them to do the same off the court: think clearly, speak up, and stay steady and confident under
        any pressure. The program runs monthly, open to every student in our community.
      </p>
      <div className="mt-8 flex justify-center">
        <Button href="/get-involved/enrol">Become A Student</Button>
      </div>

      <div className="mt-16 grid items-center gap-8 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] lg:gap-12">
        <div>
          <h3 className="text-[clamp(1.7rem,3vw,2.4rem)] leading-[1.15] font-bold text-blue">
            We build on three pillars defined by the World Health Organization
          </h3>
          <ul className="mt-6 flex flex-col gap-4">
            {whoPillars.map((pillar) => (
              <li key={pillar} className={cn("rounded-[1.15rem] bg-blue-tint px-6 py-7", boxedLabel)}>
                {pillar}
              </li>
            ))}
          </ul>
        </div>
        <img
          src="/critical-thinking.jpg"
          alt="A player returning a ball in front of blue stadium seats"
          className="aspect-square w-full rounded-[1.25rem] object-cover"
        />
      </div>

      <h3 className="mt-20 text-center text-[clamp(1.6rem,2.6vw,2.1rem)] font-bold text-blue">
        From there, we go deeper
      </h3>
      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:gap-10">
        <img
          src="/we-go-deeper.jpg"
          alt="A player on court with tennis balls in the foreground"
          className="aspect-[1020/929] w-full rounded-[1.25rem] object-cover lg:sticky lg:top-[5.75rem]"
        />
        <div className="flex flex-col gap-5">
          {deeperGroups.map((group, index) => (
            <ul
              key={group[0]}
              className="flex flex-col gap-4 bg-white lg:sticky lg:top-[5.75rem]"
              style={{ zIndex: index + 1 }}
            >
              {group.map((skill, skillIndex) => (
                <li
                  key={skill}
                  className={cn(
                    "rounded-[1.15rem] px-6 py-7",
                    boxedLabel,
                    (deeperGroups.slice(0, index).reduce((sum, items) => sum + items.length, 0) + skillIndex) % 2 === 0
                      ? "bg-blue-tint"
                      : "bg-[#f7f6dc]",
                  )}
                >
                  {skill}
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>

      <div className="mt-20 grid items-start gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-12">
        <h3 className="text-[clamp(1.7rem,3vw,2.35rem)] leading-[1.15] font-bold text-blue lg:sticky lg:top-[6.5rem]">
          We achieve this transformation by engaging your kid in:
        </h3>
        <div className="flex flex-col gap-5">
          {activities.map((activity, index) => (
            <article
              key={activity.title}
              className="rounded-[1.35rem] bg-[#f7f6dc] p-4 sm:p-5 lg:sticky lg:top-[5.75rem]"
              style={{ zIndex: index + 1 }}
            >
              <h4 className="text-[clamp(1.35rem,2vw,1.75rem)] font-bold text-blue">{activity.title}</h4>
              <img src={activity.image} alt={activity.alt} className="mt-3 aspect-[15/7] w-full rounded-[1rem] object-cover" />
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

function TennisPanel() {
  return (
    <>
      <div className="mx-auto mt-14 grid max-w-6xl items-start gap-6 lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-10">
        <h3 className="text-[clamp(1.6rem,2.5vw,2rem)] font-bold text-blue lg:sticky lg:top-[6.5rem]">
          How it started!
        </h3>
        <div className="flex flex-col gap-6">
          {chapters.map((chapter, index) => (
            <article
              key={chapter.body}
              className={cn("rounded-[1.5rem] p-4 sm:p-6 lg:sticky lg:top-[5.75rem] lg:p-7", chapter.tone)}
              style={{ zIndex: index + 1 }}
            >
              <div
                className={cn(
                  "grid items-center gap-5 lg:grid-cols-2 lg:gap-8",
                  !chapter.imageFirst && "lg:[&>*:first-child]:order-2",
                )}
              >
                <img src={chapter.image} alt={chapter.alt} className="aspect-[3/2] w-full rounded-[1rem] object-cover" />
                <p className="text-[0.95rem] leading-relaxed font-medium text-blue">{chapter.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-20 max-w-6xl">
        <h3 className="text-[clamp(1.5rem,2.4vw,2rem)] font-bold text-blue">
          The foundation built its mission around three pillars
        </h3>
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {pillars.map((pillar) => (
            <article key={pillar.title} className="rounded-[1.25rem] bg-[#f7f6dc] p-3 sm:p-4">
              <img src={pillar.image} alt={pillar.alt} className="aspect-[4/3] w-full rounded-[1rem] object-cover" />
              <h4 className="headline mt-5 px-2 text-[1.15rem] leading-tight text-blue">{pillar.title}</h4>
              <p className="mt-3 px-2 text-[0.95rem] leading-relaxed text-blue">{pillar.body}</p>
              <div className="mt-5 px-2 pb-2">
                <Button href={pillar.href} size="sm">
                  Learn More
                </Button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}
