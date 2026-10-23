"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

const inputClass =
  "h-14 w-full rounded-full bg-blue-tint px-6 text-[0.95rem] text-ink outline-none focus:ring-2 focus:ring-white";

export function NewsReplyForm({ articleTitle }: { articleTitle: string }) {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  return (
    <section aria-labelledby="reply-heading" className="mt-14 rounded-[1.25rem] bg-blue px-5 py-8 text-white sm:px-8 lg:px-10">
      <h2 id="reply-heading" className="headline text-[clamp(2.2rem,4vw,3.5rem)] leading-[0.85]">
        {sent ? "Comment received" : "Leave a Reply"}
      </h2>
      {sent ? (
        <p className="mt-4 text-sm text-white/90">Thanks. The team will review your comment in the admin inbox.</p>
      ) : (
        <form
          className="mt-7 space-y-4"
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
                  type: "comment",
                  name: data.get("name"),
                  email: data.get("email"),
                  website: data.get("website"),
                  subject: `Comment on ${articleTitle}`,
                  message: data.get("comment"),
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
          <p className="text-sm text-white/90">Your email address will not be published.</p>
          <input name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
          <input aria-label="Name" name="name" placeholder="Name" required className={inputClass} />
          <input aria-label="Email" name="email" type="email" placeholder="Email" required className={inputClass} />
          <input aria-label="Website" name="website" type="url" placeholder="Website" className={inputClass} />
          <textarea
            aria-label="Comment"
            name="comment"
            placeholder="Comment"
            required
            rows={6}
            className="w-full resize-y rounded-[1rem] bg-blue-tint px-6 py-5 text-[0.95rem] text-ink outline-none focus:ring-2 focus:ring-white"
          />
          <div className="flex flex-col gap-6 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex items-center gap-4 text-sm text-white/90">
              <input type="checkbox" className="size-6 rounded border-2 border-white bg-transparent accent-lime" />
              Save my name, email, and website in this browser for the next time I comment.
            </label>
            <Button type="submit" variant="outlineWhite" disabled={submitting}>
              {submitting ? "Posting…" : "Post Comment"}
            </Button>
          </div>
          {error ? <p className="text-sm font-semibold text-lime">{error}</p> : null}
        </form>
      )}
    </section>
  );
}
