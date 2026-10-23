"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

const steps = ["Personal Details", "Program Details", "Competition Details"] as const;

const expects = [
  "Open to junior players from 16 years and below",
  "Competitive matches & fantastic prizes",
  "Coaching & mentorship from top trainers",
  "A fun-filled atmosphere of learning & sportsmanship",
];

const expertise = ["Novice", "Intermediate", "Professional"] as const;
const classes = ["Primary", "JSS", "SSS", "Completed Secondary Education"] as const;
const sizes = ["XS", "S", "M", "L", "XL", "XXL"] as const;
const sources = ["Friends/Family", "Social media", "Advertisement", "TV/Radio", "Online search"] as const;

const fieldClass =
  "w-full rounded-full bg-blue-tint px-6 py-4 text-[0.95rem] text-blue outline-none placeholder:text-blue/45";

function Stepper({ step }: { step: number }) {
  return (
    <ol className="flex items-center" aria-label={`Step ${step + 1} of ${steps.length}`}>
      {steps.map((label, index) => (
        <li key={label} className="flex items-center">
          {index > 0 ? <span className="h-[2px] w-6 bg-white sm:w-8" /> : null}
          <span
            className={cn(
              "grid size-9 place-items-center rounded-full text-sm font-bold",
              index === step ? "bg-white text-blue" : "border-2 border-white text-white",
            )}
          >
            <span className="sr-only">{label}, </span>
            {index + 1}
          </span>
        </li>
      ))}
    </ol>
  );
}

function Choice({
  name,
  label,
  checked,
  onChange,
}: {
  name: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="inline-flex items-center gap-2 text-[0.95rem] text-white">
      {label}
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        className="size-5 shrink-0 appearance-none rounded-full border-2 border-white bg-transparent checked:border-white checked:bg-white checked:shadow-[inset_0_0_0_4px_#003c94]"
      />
    </label>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-[0.95rem]">
      <span className="font-bold text-blue">{label}: </span>
      <span className="font-medium text-blue-bright">{value}</span>
    </p>
  );
}

export function JuniorTennisTournament() {
  const [step, setStep] = useState(0);
  const [sent, setSent] = useState(false);
  const [gender, setGender] = useState("");
  const [lagos, setLagos] = useState("");
  const [level, setLevel] = useState("");
  const [schoolClass, setSchoolClass] = useState("");
  const [shirt, setShirt] = useState("");
  const [heard, setHeard] = useState("");
  const [agreed, setAgreed] = useState("");
  const [details, setDetails] = useState<Record<string, unknown>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [lead, accent] = steps[step].split(" ");

  return (
    <section className="bg-white pt-12 pb-20 sm:pt-16 sm:pb-28">
      <Container>
        <h1 className="headline text-center text-[clamp(2.6rem,6.2vw,5.5rem)] leading-[0.82] text-blue">
          <span className="block">Junior Tennis Tournament</span>
          <span className="block">Registration Form</span>
        </h1>

        <div className="relative mt-10 sm:mt-14">
          <div className="rounded-[1.75rem] bg-blue-tint px-6 pt-8 pb-16 sm:px-10 sm:pt-12 sm:pb-20 lg:px-14 lg:pt-14 lg:pb-32">
            <div className="relative grid items-start gap-8 lg:grid-cols-2 lg:gap-10">
              <div className="max-w-xl">
                <h2 className="headline text-[clamp(1.15rem,1.6vw,1.45rem)] leading-none text-blue">
                  Calling all junior tennis stars!
                </h2>
                <p className="mt-5 text-[0.98rem] leading-relaxed text-gray">
                  Join us for an exciting 4-day Junior Tennis tournament at Rowe Park, Yaba, Lagos, this April! Show
                  off your talent, compete with fellow rising stars, and enjoy an unforgettable tennis experience!
                </p>
                <h3 className="headline mt-7 text-[clamp(1.15rem,1.6vw,1.45rem)] leading-none text-blue">
                  What to expect:
                </h3>
                <ul className="mt-4 space-y-1 text-[0.98rem] leading-relaxed text-gray">
                  {expects.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <div className="mt-6 space-y-1">
                  <Fact label="Venue" value="Rowe Park, Yaba, Lagos" />
                  <Fact label="Duration" value="4 days" />
                  <Fact label="Date" value="Wednesday 16th of April – Saturday 19th of April, 2025" />
                </div>
                <p className="mt-6 text-[1.02rem] leading-relaxed font-medium text-blue-bright">
                  Register Now &amp; Be Part of the Action!
                  <br />
                  Let&apos;s serve, rally, and make history!
                </p>
              </div>
              <img
                src="/junior-tennis-tournament.jpg"
                alt="A junior player in a mint cap hitting a forehand with a red racket"
                className="h-72 w-full rounded-[1.25rem] object-cover sm:h-96 lg:absolute lg:top-0 lg:right-0 lg:h-[calc(100%+6.5rem)] lg:w-[calc(50%-1.25rem)]"
              />
            </div>
          </div>

          <div className="relative z-10 mx-auto -mt-20 w-full max-w-[68rem] sm:-mt-24 lg:-mt-[6rem]">
            <div className="rounded-[1.6rem] bg-blue px-5 py-8 text-white sm:px-10 sm:py-10 lg:px-12 lg:py-12">
              {sent ? (
                <h2 className="font-display text-[clamp(2rem,4vw,3.15rem)] leading-none font-extrabold tracking-[-0.01em]">
                  Registration received
                </h2>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-6">
                  <h2 className="font-display text-[clamp(2rem,4vw,3.15rem)] leading-none font-extrabold tracking-[-0.01em]">
                    <span className="text-white">{lead} </span>
                    <span className="text-lime">{accent}</span>
                  </h2>
                  <Stepper step={step} />
                </div>
              )}

              {sent ? (
                <p className="mt-6 max-w-xl text-[1.02rem] leading-relaxed text-white/90">
                  Thank you for registering. We&apos;ll be in touch with the next steps.
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
                      basedInLagos: lagos,
                      expertise: level,
                      schoolClass,
                      shirtSize: shirt,
                      heardFrom: heard,
                      agreedToRules: agreed,
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
                          type: "tournament_registration",
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
                      <input className={fieldClass} name="fullName" placeholder="Full Name" aria-label="Full Name" />
                      <input className={fieldClass} name="email" type="email" placeholder="Email" aria-label="Email" />
                      <input
                        className={fieldClass}
                        name="dob"
                        placeholder="Date of Birth"
                        aria-label="Date of Birth"
                      />
                      <fieldset>
                        <legend className="text-sm font-bold text-white">Gender</legend>
                        <div className="mt-3 flex flex-wrap gap-x-8 gap-y-3">
                          {["Female", "Male"].map((option) => (
                            <Choice
                              key={option}
                              name="gender"
                              label={option}
                              checked={gender === option}
                              onChange={() => setGender(option)}
                            />
                          ))}
                        </div>
                      </fieldset>
                      <fieldset>
                        <legend className="text-sm font-bold text-white">Are You Based In Lagos</legend>
                        <div className="mt-3 flex flex-wrap gap-x-8 gap-y-3">
                          {["Yes", "No"].map((option) => (
                            <Choice
                              key={option}
                              name="lagos"
                              label={option}
                              checked={lagos === option}
                              onChange={() => setLagos(option)}
                            />
                          ))}
                        </div>
                      </fieldset>
                      <input className={fieldClass} name="address" placeholder="Address" aria-label="Address" />
                    </div>
                  ) : null}

                  {step === 1 ? (
                    <div className="space-y-6">
                      <fieldset>
                        <legend className="text-sm font-bold text-white">Level Of Expertise In Tennis</legend>
                        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-3">
                          {expertise.map((option) => (
                            <Choice
                              key={option}
                              name="expertise"
                              label={option}
                              checked={level === option}
                              onChange={() => setLevel(option)}
                            />
                          ))}
                        </div>
                      </fieldset>
                      <fieldset>
                        <legend className="text-sm font-bold text-white">
                          What Class Level Are You In Your Academics
                        </legend>
                        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-3">
                          {classes.map((option) => (
                            <Choice
                              key={option}
                              name="class"
                              label={option}
                              checked={schoolClass === option}
                              onChange={() => setSchoolClass(option)}
                            />
                          ))}
                        </div>
                      </fieldset>
                      <input
                        className={fieldClass}
                        name="school"
                        placeholder="Name of School"
                        aria-label="Name of School"
                      />
                    </div>
                  ) : null}

                  {step === 2 ? (
                    <div className="space-y-6">
                      <input
                        className={fieldClass}
                        name="phone"
                        type="tel"
                        placeholder="Phone Number"
                        aria-label="Phone Number"
                      />
                      <fieldset>
                        <legend className="text-sm font-bold text-white">T-Shirt Size</legend>
                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-3">
                          {sizes.map((option) => (
                            <Choice
                              key={option}
                              name="shirt"
                              label={option}
                              checked={shirt === option}
                              onChange={() => setShirt(option)}
                            />
                          ))}
                        </div>
                      </fieldset>
                      <input
                        className={fieldClass}
                        name="guardian"
                        type="tel"
                        placeholder="Parent's/Guardian's Number"
                        aria-label="Parent's or guardian's number"
                      />
                      <fieldset>
                        <legend className="text-sm font-bold text-white">How Did You Hear About The Competition?</legend>
                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-3">
                          {sources.map((option) => (
                            <Choice
                              key={option}
                              name="heard"
                              label={option}
                              checked={heard === option}
                              onChange={() => setHeard(option)}
                            />
                          ))}
                        </div>
                      </fieldset>
                      <fieldset>
                        <legend className="text-sm font-bold text-white">
                          Do You Agree To The Rules And Regulations On The Competition?
                        </legend>
                        <div className="mt-3 flex flex-wrap gap-x-8 gap-y-3">
                          {["Yes", "No"].map((option) => (
                            <Choice
                              key={option}
                              name="agree"
                              label={option}
                              checked={agreed === option}
                              onChange={() => setAgreed(option)}
                            />
                          ))}
                        </div>
                      </fieldset>
                      <input
                        className={fieldClass}
                        name="declaration"
                        placeholder="I hereby declare that by the 30th of April, 2025, my age will be 16 years or below. Kindly write your full name to confirm."
                        aria-label="Age declaration"
                      />
                    </div>
                  ) : null}

                  <div className="mt-8 flex items-center justify-center gap-4">
                    {step > 0 ? (
                      <Button type="button" variant="outlineWhite" onClick={() => setStep(step - 1)}>
                        Previous
                      </Button>
                    ) : null}
                    <Button type="submit" disabled={submitting} variant={step === steps.length - 1 ? "lime" : "outlineWhite"}>
                      {submitting ? "Submitting…" : step === steps.length - 1 ? "Submit" : "Next"}
                    </Button>
                  </div>
                  {error ? <p className="mt-4 text-center text-sm font-semibold text-lime">{error}</p> : null}
                </form>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
