"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "@/components/ui/icons";
import { fallbackCourts, type TennisCourt } from "@/lib/tennis-courts";

function LocationPin() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className="mt-0.5 size-4 shrink-0"
    >
      <path d="M12 2a7 7 0 0 0-7 7c0 5.1 6.1 11.9 6.36 12.18a.86.86 0 0 0 1.28 0C12.9 20.9 19 14.1 19 9a7 7 0 0 0-7-7Zm0 9.6A2.6 2.6 0 1 1 12 6a2.6 2.6 0 0 1 0 5.2Z" />
    </svg>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="cursor-pointer appearance-none bg-transparent py-2 pr-6 pl-1 text-sm font-bold text-gray outline-none disabled:cursor-not-allowed disabled:opacity-45"
      >
        <option value="">{label}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-0 size-3 text-gray" />
    </label>
  );
}

function formatAddress(court: TennisCourt) {
  const parts = [court.address];

  if (
    court.city &&
    !court.address.toLowerCase().includes(court.city.toLowerCase())
  ) {
    parts.push(court.city);
  }

  if (
    court.state &&
    !court.address.toLowerCase().includes(court.state.toLowerCase())
  ) {
    parts.push(court.state);
  }

  return parts.join(", ");
}

export function FindTennisCourts() {
  const [courts, setCourts] = useState<TennisCourt[]>(fallbackCourts);
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/tennis-courts", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Court search unavailable");
        return response.json() as Promise<{ courts: TennisCourt[] }>;
      })
      .then((data) => {
        if (data.courts.length) setCourts(data.courts);
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error(error);
        }
      });
    return () => controller.abort();
  }, []);

  const countries = useMemo(
    () =>
      [...new Set(courts.map((court) => court.country))].sort((a, b) =>
        a.localeCompare(b),
      ),
    [courts],
  );
  const states = useMemo(
    () =>
      [
        ...new Set(
          courts
            .filter((court) => !country || court.country === country)
            .map((court) => court.state),
        ),
      ].sort((a, b) => a.localeCompare(b)),
    [country, courts],
  );
  const visibleCourts = courts.filter(
    (court) =>
      (!country || court.country === country) &&
      (!state || court.state === state),
  );

  return (
    <section
      aria-labelledby="courts-heading"
      className="bg-white pt-10 pb-20 sm:pt-14 sm:pb-24"
    >
      <div className="mx-auto w-full max-w-[96rem] px-5">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <h1 id="courts-heading" className="headline text-h3 text-blue-bright">
            Find Tennis Courts
          </h1>
          <div className="flex items-center gap-3 sm:pt-2">
            <FilterSelect
              label="Country"
              value={country}
              options={countries}
              onChange={(nextCountry) => {
                setCountry(nextCountry);
                setState("");
              }}
            />
            <FilterSelect
              label="State"
              value={state}
              options={states}
              onChange={setState}
              disabled={!states.length}
            />
          </div>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {visibleCourts.map((court) => (
            <article
              key={court.id}
              className="rounded-[1.15rem] bg-lime-tint p-3 sm:p-4"
            >
              {court.imageUrl ? (
                <img
                  src={court.imageUrl}
                  alt={`${court.name} tennis facilities`}
                  className="aspect-[627/648] w-full rounded-[0.9rem] object-cover"
                />
              ) : (
                <div className="grid aspect-[627/648] w-full place-items-center rounded-[0.9rem] bg-blue-tint px-8 text-center text-sm font-medium text-blue">
                  Court image coming soon
                </div>
              )}
              <div className="px-2 pt-6 pb-4">
                <h2 className="headline text-[clamp(1.5rem,2.25vw,2rem)] leading-[0.9] text-blue">
                  {court.name}
                </h2>
                <p className="mt-3 flex items-start gap-2 text-[0.78rem] leading-relaxed text-gray">
                  <LocationPin />
                  <span>{formatAddress(court)}</span>
                </p>
              </div>
            </article>
          ))}
        </div>

        {visibleCourts.length === 0 ? (
          <p className="mt-14 text-center text-[1rem] text-gray">
            No tennis courts are listed for this location yet.
          </p>
        ) : null}
      </div>
    </section>
  );
}
