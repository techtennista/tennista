"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Goal = {
  id: number;
  title: string;
  color: string;
  body: string;
  icon: string;
};

const goals: Goal[] = [
  {
    id: 1,
    title: "No poverty",
    color: "#e02030",
    icon: "/sdg-no-poverty.png",
    body: "Our objective is to use the platform of tennis to develop talents. Although tennis is perceived to be a sport of privilege and wealth, we want to change this narrative and encourage young people to aspire for wealth creation by offering a unique sport-based training programme for character development and financial literacy.",
  },
  {
    id: 4,
    title: "Quality education",
    color: "#bc1428",
    icon: "/sdg-quality-education.png",
    body: "Our plan is to use the platform of Tennis to support academic excellence by rewarding high-flying students with academic scholarships and providing academic support materials such as textbooks and notebooks.",
  },
  {
    id: 5,
    title: "Gender equality",
    color: "#ec3824",
    icon: "/sdg-gender-equality.png",
    body: "Our aim is to drive gender equality; we are encouraging more girls to participate in our Tennis training programme by providing equal opportunities for both boys and girls. We want to see more young girls playing Tennis in Africa.",
  },
  {
    id: 8,
    title: "Decent work and economic growth",
    color: "#981838",
    icon: "/sdg-decent-work.png",
    body: "The work reaches past the court. Coaching, mentoring and programme roles create decent jobs, and the skills young people build here travel with them into the wider economy.",
  },
];

const growEase = [0.16, 1, 0.3, 1] as const;

export function SdgGoals({ ids }: { ids?: number[] } = {}) {
  const visibleGoals = ids?.length ? goals.filter((goal) => ids.includes(goal.id)) : goals;
  const [openId, setOpenId] = useState<number | null>(null);
  const [flowId, setFlowId] = useState<number | null>(null);
  const reduced = useReducedMotion();
  const [wide, setWide] = useState(false);
  const grow = reduced ? { duration: 0 } : { duration: 0.7, ease: growEase };

  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const update = () => setWide(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (openId == null || reduced || !wide) {
      setFlowId(openId);
      return;
    }
    const timer = window.setTimeout(() => setFlowId(openId), 420);
    return () => window.clearTimeout(timer);
  }, [openId, reduced, wide]);

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-stretch">
      {visibleGoals.map((goal) => {
        const open = openId === goal.id;
        const flow = flowId === goal.id;
        return (
          <motion.div
            key={goal.id}
            role="group"
            tabIndex={0}
            aria-expanded={open}
            onMouseEnter={() => setOpenId(goal.id)}
            onMouseLeave={() => setOpenId((current) => (current === goal.id ? null : current))}
            onFocus={() => setOpenId(goal.id)}
            onBlur={() => setOpenId((current) => (current === goal.id ? null : current))}
            onClick={() => {
              if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
              setOpenId(open ? null : goal.id);
            }}
            initial={false}
            animate={{ flexGrow: wide && open ? 2.45 : 1 }}
            transition={grow}
            style={{ backgroundColor: goal.color, flexBasis: 0 }}
            className="flex min-h-[17.5rem] min-w-0 cursor-pointer flex-col overflow-hidden rounded-[1.35rem] p-5 text-left text-white outline-offset-4 sm:p-6"
          >
            <span className="flex items-start gap-3">
              <span className="text-[2.4rem] leading-none font-bold">{goal.id}</span>
              <span className="pt-1 text-left text-[0.72rem] leading-tight font-bold tracking-[0.04em] uppercase">
                {goal.title}
              </span>
            </span>
            <span
              className={cn(
                "flex w-full",
                open ? "items-center justify-start pt-5" : "flex-1 items-center justify-center py-4",
              )}
            >
              <img
                src={goal.icon}
                alt=""
                className="h-[5.25rem] w-auto max-w-[11rem] object-contain object-left"
              />
            </span>
            {flow ? (
              <motion.p
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: reduced ? 0 : 0.28, ease: growEase }}
                className="max-w-xl pt-6 text-left text-[0.92rem] leading-relaxed text-white/95"
              >
                {goal.body}
              </motion.p>
            ) : null}
          </motion.div>
        );
      })}
    </div>
  );
}
