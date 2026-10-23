import "server-only";

export const CONTENT_STATUSES = ["draft", "review", "published", "archived"] as const;

export type ContentStatus = (typeof CONTENT_STATUSES)[number];

export function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function parseContentStatus(value: unknown): ContentStatus | null {
  const status = value === "in_review" ? "review" : String(value ?? "draft");
  return CONTENT_STATUSES.includes(status as ContentStatus) ? (status as ContentStatus) : null;
}

export function parsePublishedAt(value: unknown, status: ContentStatus, fallback?: Date | null) {
  if (status !== "published") return null;
  if (typeof value !== "string" || !value) return fallback ?? new Date();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function isContributorEditable(status: string) {
  return status === "draft" || status === "review";
}

export function optionalText(value: unknown) {
  const text = typeof value === "string" ? value.trim() : "";
  return text || null;
}

export function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}
