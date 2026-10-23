import "server-only";

export const EVENT_STATUSES = [
  "draft",
  "review",
  "scheduled",
  "published",
  "cancelled",
  "archived",
] as const;

export type EventStatus = (typeof EVENT_STATUSES)[number];

export type EventContentBlock = {
  id: string;
  type: "paragraph" | "heading";
  text: string;
};

export type EventContent = {
  version: 1;
  blocks: EventContentBlock[];
  featured: boolean;
};

export type ValidatedEventInput = {
  title: string;
  slug: string;
  summary: string | null;
  content: EventContent;
  venueName: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  startsAt: string;
  endsAt: string | null;
  registrationUrl: string | null;
  coverAssetId: string | null;
  status: EventStatus;
};

type ValidationResult =
  | { ok: true; value: ValidatedEventInput }
  | { ok: false; error: string };

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function normalizeEventSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function optionalText(value: unknown, maxLength: number) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string") return undefined;
  const text = value.trim();
  if (!text) return null;
  return text.length <= maxLength ? text : undefined;
}

function validHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function parseEventContent(value: unknown, featured = false): EventContent {
  if (!value || typeof value !== "object") {
    return { version: 1, blocks: [], featured };
  }

  const candidate = value as Record<string, unknown>;
  const blocks = Array.isArray(candidate.blocks)
    ? candidate.blocks
        .slice(0, 100)
        .map((block): EventContentBlock | null => {
          if (!block || typeof block !== "object") return null;
          const item = block as Record<string, unknown>;
          if (item.type !== "paragraph" && item.type !== "heading") return null;
          if (typeof item.text !== "string") return null;
          return {
            id:
              typeof item.id === "string" && item.id.length <= 100
                ? item.id
                : crypto.randomUUID(),
            type: item.type,
            text: item.text.slice(0, 20_000),
          };
        })
        .filter((block): block is EventContentBlock => block !== null)
    : [];

  return {
    version: 1,
    blocks,
    featured: typeof candidate.featured === "boolean" ? candidate.featured : featured,
  };
}

export function validateEventPayload(payload: unknown): ValidationResult {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { ok: false, error: "A valid event payload is required." };
  }

  const input = payload as Record<string, unknown>;
  const title = typeof input.title === "string" ? input.title.trim() : "";
  const slug = normalizeEventSlug(
    typeof input.slug === "string" && input.slug.trim() ? input.slug : title,
  );
  if (!title || title.length > 200 || !slug || slug.length > 200) {
    return { ok: false, error: "Title and slug are required and must be 200 characters or fewer." };
  }

  const startsAtDate = new Date(typeof input.startsAt === "string" ? input.startsAt : "");
  if (Number.isNaN(startsAtDate.getTime())) {
    return { ok: false, error: "A valid start date and time is required." };
  }

  let endsAt: string | null = null;
  if (input.endsAt) {
    const endsAtDate = new Date(typeof input.endsAt === "string" ? input.endsAt : "");
    if (Number.isNaN(endsAtDate.getTime()) || endsAtDate < startsAtDate) {
      return { ok: false, error: "End date and time must be valid and after the start." };
    }
    endsAt = endsAtDate.toISOString();
  }

  const status = typeof input.status === "string" ? input.status : "draft";
  if (!EVENT_STATUSES.includes(status as EventStatus)) {
    return { ok: false, error: "Invalid event status." };
  }

  const summary = optionalText(input.summary, 1_000);
  const venueName = optionalText(input.venueName, 200);
  const address = optionalText(input.address, 500);
  const city = optionalText(input.city, 120);
  const country = optionalText(input.country, 120);
  if ([summary, venueName, address, city, country].includes(undefined)) {
    return { ok: false, error: "One or more text fields are too long or invalid." };
  }

  const registrationUrl = optionalText(input.registrationUrl, 2_000);
  if (registrationUrl === undefined || (registrationUrl && !validHttpUrl(registrationUrl))) {
    return { ok: false, error: "Registration URL must be a valid HTTP or HTTPS URL." };
  }

  const coverAssetId = optionalText(input.coverAssetId, 36);
  if (coverAssetId === undefined || (coverAssetId && !UUID_PATTERN.test(coverAssetId))) {
    return { ok: false, error: "Invalid cover asset." };
  }

  return {
    ok: true,
    value: {
      title,
      slug,
      summary: summary ?? null,
      content: parseEventContent(input.content, input.featured === true),
      venueName: venueName ?? null,
      address: address ?? null,
      city: city ?? null,
      country: country ?? null,
      startsAt: startsAtDate.toISOString(),
      endsAt,
      registrationUrl: registrationUrl ?? null,
      coverAssetId: coverAssetId ?? null,
      status: status as EventStatus,
    },
  };
}
