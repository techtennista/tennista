"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const steps = ["Personal Details", "Location Information", "Contact Information", "Qualifications & Interests"] as const;

const ages = ["15 - 20", "21 - 25", "26 - 30", "31 - 35", "36 - 40"] as const;
const experience = ["Rookie", "Intermediate", "Professional"] as const;
const roles = [
  "Tennis Coaching",
  "Life Skills Facilitator",
  "Event Co-ordination",
  "Fundraising and Community Partnerships",
  "Grant Applications",
] as const;

const fieldClass =
  "w-full rounded-full bg-blue-tint px-6 py-4 text-[0.95rem] text-blue outline-none placeholder:text-blue/45";

function Stepper({ step }: { step: number }) {
  return (
    <ol className="flex items-center" aria-label={`Step ${step + 1} of 4`}>
      {steps.map((label, index) => {
        const reached = index <= step;
        return (
          <li key={label} className="flex items-center">
            {index > 0 ? (
              <span className={cn("h-[3px] w-7 sm:w-10", index <= step ? "bg-blue" : "bg-blue/20")} />
            ) : null}
            <span
              className={cn(
                "grid size-9 place-items-center rounded-full text-sm font-bold",
                reached ? "bg-blue text-white" : "border-2 border-blue bg-white text-blue",
              )}
            >
              <span className="sr-only">{label}, </span>
              {index + 1}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function Choice({
  type,
  name,
  label,
  checked,
  onChange,
}: {
  type: "radio" | "checkbox";
  name: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="inline-flex items-center gap-2 text-[0.95rem] text-ink">
      <input
        type={type}
        name={name}
        checked={checked}
        onChange={onChange}
        className={cn(
          "size-[1.15rem] appearance-none border-2 border-blue bg-white checked:bg-blue",
          type === "radio" ? "rounded-full" : "rounded-[3px]",
        )}
      />
      {label}
    </label>
  );
}

export function CareersForm({
  type = "volunteer",
}: {
  type?: "volunteer" | "partnership" | "sponsorship" | "student_enrolment";
}) {
  const [step, setStep] = useState(0);
  const [sent, setSent] = useState(false);
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [level, setLevel] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [details, setDetails] = useState<Record<string, unknown>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const toggleRole = (role: string) => {
    setPicked((current) => (current.includes(role) ? current.filter((item) => item !== role) : [...current, role]));
  };

  return (
    <section aria-labelledby="application-heading" className="bg-white px-5 pt-4 pb-20 sm:px-8 sm:pb-24">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <h2 id="application-heading" className="text-[clamp(1.8rem,3vw,2.6rem)] font-bold tracking-tight text-blue">
            {sent ? "Application received" : steps[step]}
          </h2>
          {sent ? null : <Stepper step={step} />}
        </div>

        {sent ? (
          <p className="mt-8 max-w-xl text-[0.975rem] leading-relaxed text-ink">
            Thank you for reaching out. We&apos;ll read your application and be in touch.
          </p>
        ) : (
          <form
            className="mt-8"
            onSubmit={async (event) => {
              event.preventDefault();
              const currentFields = Object.fromEntries(new FormData(event.currentTarget));
              const nextDetails: Record<string, unknown> = {
                ...details,
                ...currentFields,
                gender,
                age,
                experience: level,
                roles: picked,
              };
              setDetails(nextDetails);
              if (step < steps.length - 1) {
                setStep(step + 1);
                return;
              }
              setSubmitting(true);
              setError("");
              try {
                const response = await fetch("/api/submissions", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    type,
                    ...nextDetails,
                    name: nextDetails.fullName,
                    sourcePath: window.location.pathname,
                  }),
                });
                const result = (await response.json()) as { message?: string };
                if (!response.ok) throw new Error(result.message ?? "Please try again.");
                setSent(true);
              } catch (submissionError) {
                setError(submissionError instanceof Error ? submissionError.message : "Please try again.");
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {step === 0 ? (
              <div className="space-y-4">
                <input className={fieldClass} name="fullName" placeholder="Full Name" aria-label="Full Name" required />
                <input className={fieldClass} name="email" type="email" placeholder="Email" aria-label="Email" required />
                <input className={fieldClass} name="phone" type="tel" placeholder="Phone Number" aria-label="Phone Number" />
              </div>
            ) : null}

            {step === 1 ? (
              <div className="space-y-4">
                <input className={fieldClass} name="address" placeholder="Address" aria-label="Address" />
                <input className={fieldClass} name="street" placeholder="Street Address" aria-label="Street Address" />
                <input className={fieldClass} name="city" placeholder="City" aria-label="City" />
                <input className={fieldClass} name="state" placeholder="State / Province" aria-label="State or province" />
              </div>
            ) : null}

            {step === 2 ? (
              <div className="space-y-6">
                <fieldset>
                  <legend className="text-sm font-bold text-ink">Gender</legend>
                  <div className="mt-3 flex flex-wrap gap-6">
                    {["Female", "Male"].map((option) => (
                      <Choice
                        key={option}
                        type="radio"
                        name="gender"
                        label={option}
                        checked={gender === option}
                        onChange={() => setGender(option)}
                      />
                    ))}
                  </div>
                </fieldset>
                <fieldset>
                  <legend className="text-sm font-bold text-ink">Age Range</legend>
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-3">
                    {ages.map((option) => (
                      <Choice
                        key={option}
                        type="radio"
                        name="age"
                        label={option}
                        checked={age === option}
                        onChange={() => setAge(option)}
                      />
                    ))}
                  </div>
                </fieldset>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="space-y-6">
                <fieldset>
                  <legend className="text-sm font-bold text-ink">Tennis Experience</legend>
                  <div className="mt-3 flex flex-wrap gap-6">
                    {experience.map((option) => (
                      <Choice
                        key={option}
                        type="radio"
                        name="experience"
                        label={option}
                        checked={level === option}
                        onChange={() => setLevel(option)}
                      />
                    ))}
                  </div>
                </fieldset>
                <fieldset>
                  <legend className="text-sm font-bold text-blue">
                    Which Volunteer Role Interest You? Check All That Apply
                  </legend>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {roles.map((role) => (
                      <Choice
                        key={role}
                        type="checkbox"
                        name="roles"
                        label={role}
                        checked={picked.includes(role)}
                        onChange={() => toggleRole(role)}
                      />
                    ))}
                  </div>
                </fieldset>
              </div>
            ) : null}

            <div className="mt-10 flex justify-center gap-4">
              {step > 0 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="rounded-full border-2 border-blue px-7 py-2.5 text-sm font-bold text-blue"
                >
                  {step === steps.length - 1 ? "Go Back" : "Previous"}
                </button>
              ) : null}
              {step === steps.length - 1 ? (
                <Button type="submit" disabled={submitting}>{submitting ? "SUBMITTING…" : "SUBMIT"}</Button>
              ) : (
                <button
                  type="submit"
                  className="rounded-full border-2 border-blue px-8 py-2.5 text-sm font-bold text-blue"
                >
                  Next
                </button>
              )}
            </div>
            {error ? <p className="mt-4 text-center text-sm font-semibold text-red-600">{error}</p> : null}
          </form>
        )}
      </div>
    </section>
  );
}
