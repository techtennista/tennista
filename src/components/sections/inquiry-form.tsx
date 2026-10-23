"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

const fieldClass =
  "w-full rounded-full bg-blue-tint px-6 py-4 text-[0.95rem] text-blue outline-none placeholder:text-blue/45";

export function InquiryForm({
  type,
  heading,
  intro,
}: {
  type: "partnership" | "sponsorship";
  heading: string;
  intro: string;
}) {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  return (
    <section aria-labelledby="inquiry-heading" className="bg-white px-5 pb-20 sm:px-8 sm:pb-24">
      <div className="mx-auto max-w-3xl">
        <h2 id="inquiry-heading" className="text-[clamp(1.8rem,3vw,2.6rem)] font-bold tracking-tight text-blue">
          {sent ? "We have your message" : heading}
        </h2>
        {sent ? (
          <p className="mt-6 text-[0.975rem] leading-relaxed text-ink">
            Thank you. The team will review this in the admin inbox and get back to you.
          </p>
        ) : (
          <form
            className="mt-8 space-y-4"
            onSubmit={async (event) => {
              event.preventDefault();
              setSubmitting(true);
              setError("");
              const data = new FormData(event.currentTarget);
              try {
                const response = await fetch("/api/submissions", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    type,
                    name: data.get("name"),
                    email: data.get("email"),
                    phone: data.get("phone"),
                    organization: data.get("organization"),
                    subject: heading,
                    message: data.get("message"),
                    company: data.get("company"),
                    sourcePath: window.location.pathname,
                  }),
                });
                const result = (await response.json()) as { message?: string };
                if (!response.ok) throw new Error(result.message ?? "Please try again.");
                event.currentTarget.reset();
                setSent(true);
              } catch (submissionError) {
                setError(submissionError instanceof Error ? submissionError.message : "Please try again.");
              } finally {
                setSubmitting(false);
              }
            }}
          >
            <p className="text-[0.975rem] leading-relaxed text-ink">{intro}</p>
            <input name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
            <input className={fieldClass} name="name" placeholder="Full name" aria-label="Full name" required />
            <input className={fieldClass} name="organization" placeholder="Organisation" aria-label="Organisation" />
            <input className={fieldClass} name="email" type="email" placeholder="Email" aria-label="Email" required />
            <input className={fieldClass} name="phone" type="tel" placeholder="Phone" aria-label="Phone" />
            <textarea
              className="min-h-36 w-full rounded-[1.25rem] bg-blue-tint px-6 py-4 text-[0.95rem] text-blue outline-none placeholder:text-blue/45"
              name="message"
              placeholder="How would you like to work with Tennista?"
              aria-label="Message"
              required
            />
            <Button type="submit" disabled={submitting}>
              {submitting ? "Sending…" : "Send message"}
            </Button>
            {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}
          </form>
        )}
      </div>
    </section>
  );
}
