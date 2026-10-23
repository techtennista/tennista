"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const years = [2024, 2025, 2026] as const;

type ImpactReport = {
  year: (typeof years)[number];
  title: string;
  href: string;
  cover: string;
  fileName: string;
};

const reports: ImpactReport[] = [
  {
    year: 2025,
    title: "Tennista Foundation Impact Report 2025",
    href: "/reports/tennista-impact-report-2025.pdf",
    cover: "/reports/tennista-impact-report-2025-cover.jpg",
    fileName: "Tennista-Foundation-Impact-Report-2025.pdf",
  },
];

export function ImpactReports() {
  const [year, setYear] = useState<(typeof years)[number]>(2025);
  const visible = reports.filter((report) => report.year === year);

  return (
    <section aria-labelledby="impact-heading" className="bg-white px-5 py-14 sm:px-8 sm:py-16 lg:px-12">
      <h1 id="impact-heading" className="headline text-display-xl">
        <span className="text-blue">Impact </span>
        <span className="text-blue-bright">Report</span>
      </h1>

      <div className="mt-6 flex flex-wrap gap-3" role="group" aria-label="Report year">
        {years.map((option) => {
          const selected = option === year;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={selected}
              onClick={() => setYear(option)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-bold",
                selected ? "bg-blue text-white" : "border-2 border-blue text-blue",
              )}
            >
              {option}
            </button>
          );
        })}
      </div>

      {visible.length > 0 ? (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((report) => (
            <article key={report.href} className="rounded-[1.25rem] bg-[#f8f8dc] p-3 sm:p-4">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1rem] bg-blue">
                <Image
                  src={report.cover}
                  alt={`${report.title} cover`}
                  fill
                  quality={90}
                  sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                  className="object-cover"
                />
              </div>
              <h2 className="headline mt-5 px-2 text-[1.05rem] leading-[1.2] text-blue sm:text-[1.2rem]">
                {report.title}
              </h2>
              <div className="mt-5 px-2 pb-2">
                <Button size="sm" href={report.href} download={report.fileName}>
                  Download Report
                </Button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-10 max-w-xl text-[1.05rem] leading-relaxed text-blue/70">
          The {year} impact report is not on the site yet. Check back here when it is published.
        </p>
      )}
    </section>
  );
}
