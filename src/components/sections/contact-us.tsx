"use client";

import { useState } from "react";
import { siteConfig } from "@/config/site";
import { Facebook, Instagram, LinkedIn } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

const fieldBase =
  "w-full bg-blue-tint px-8 py-[1.15rem] text-[0.95rem] text-gray outline-none placeholder:text-gray focus:ring-2 focus:ring-blue-bright";
const fieldClass = `${fieldBase} rounded-full`;

const socials = [
  { label: "Facebook", href: siteConfig.social.facebook, Icon: Facebook },
  { label: "Instagram", href: siteConfig.social.instagram, Icon: Instagram },
  { label: "LinkedIn", href: siteConfig.social.linkedin, Icon: LinkedIn },
] as const;

export function ContactUs() {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  return (
    <section aria-labelledby="contact-heading" className="bg-white pt-12 pb-20 sm:pt-4 sm:pb-24">
      <h1 id="contact-heading" className="sr-only">
        Contact Us
      </h1>

      <div className="mx-auto w-full max-w-[131.25rem] px-4 sm:px-5">
        <img
          src="/contact-us-header.jpg"
          alt="Contact Tennista Foundation. A young player tosses a tennis ball before serving."
          className="h-auto w-full rounded-b-[1.25rem]"
        />
      </div>

      <Container>
        <form
          className="mx-auto mt-12 w-full sm:w-[74%]"
          onSubmit={async (event) => {
            event.preventDefault();
            setSubmitting(true);
            setError("");
            const form = event.currentTarget;
            const data = new FormData(form);
            try {
              const response = await fetch("/api/submissions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  type: "contact",
                  name: data.get("name"),
                  email: data.get("email"),
                  subject: data.get("subject"),
                  message: data.get("message"),
                  company: data.get("company"),
                  sourcePath: window.location.pathname,
                }),
              });
              const result = (await response.json()) as { message?: string };
              if (!response.ok) throw new Error(result.message ?? "Please try again.");
              form.reset();
              setSent(true);
            } catch (submissionError) {
              setError(submissionError instanceof Error ? submissionError.message : "Please try again.");
            } finally {
              setSubmitting(false);
            }
          }}
        >
          <div className="space-y-4">
            <input name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
            <input className={fieldClass} name="name" placeholder="Full Name" aria-label="Full Name" required />
            <input
              className={fieldClass}
              name="email"
              type="email"
              placeholder="Email"
              aria-label="Email"
              required
            />
            <input className={fieldClass} name="subject" placeholder="Subject" aria-label="Subject" required />
            <textarea
              className={`${fieldBase} min-h-[10.25rem] resize-y rounded-[1rem]`}
              name="message"
              placeholder="Subject"
              aria-label="Message"
              required
            />
          </div>

          <div className="mt-7 text-center">
            <Button type="submit" disabled={submitting}>{submitting ? "Submitting…" : "Submit"}</Button>
          </div>
          <p className="mt-4 min-h-6 text-center text-sm font-medium text-blue" aria-live="polite">
            {error || (sent ? "Thank you. Your message has been received." : "")}
          </p>
        </form>

        <div className="mt-10 grid gap-10 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
          <div>
            <h2 className="font-display text-[clamp(2rem,3.4vw,2.75rem)] leading-none font-extrabold tracking-[-0.01em] text-blue">
              Join the movement!
            </h2>
            <p className="mt-4 max-w-md text-[0.95rem] leading-relaxed text-gray">
              Reach out and let&apos;s empower the children through tennis.
              <br />
              Your ideas, questions, or support are differences we need.
            </p>
          </div>

          <div className="sm:min-w-[12rem]">
            <h2 className="headline text-[1.45rem] leading-none text-blue">Contact Us</h2>
            <a
              href={`mailto:${siteConfig.email}`}
              className="mt-4 block text-[0.95rem] text-gray transition-colors hover:text-blue-bright"
            >
              {siteConfig.email}
            </a>
            <ul className="mt-5 flex items-center gap-5">
              {socials.map(({ label, href, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={`${siteConfig.shortName} on ${label}`}
                    className="block text-blue transition-transform hover:-translate-y-0.5 hover:text-blue-bright"
                  >
                    <Icon className="size-5" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
