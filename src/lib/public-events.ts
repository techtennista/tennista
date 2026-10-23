import "server-only";

import { cache } from "react";
import type { MediaStory } from "@/components/sections/media-hub";
import { db } from "@/lib/db";
import { publicAssetUrl } from "@/lib/storage";

export const getPublishedEvents = cache(async (): Promise<MediaStory[]> => {
  const result = await db.query<{
    slug: string;
    title: string;
    starts_at: Date;
    registration_url: string | null;
    object_key: string | null;
  }>(
    `
      SELECT e.slug, e.title, e.starts_at, e.registration_url, a.object_key
      FROM cms_events e
      LEFT JOIN cms_assets a ON a.id = e.cover_asset_id
      WHERE e.status = 'published'
        AND (e.published_at IS NULL OR e.published_at <= NOW())
      ORDER BY e.starts_at DESC
    `,
  );

  return result.rows.map((event) => ({
    title: event.title,
    image: event.object_key ? publicAssetUrl(event.object_key) : "/junior-tennis-open-cover.jpg",
    href: event.registration_url ? event.registration_url : "/events",
    date: new Intl.DateTimeFormat("en-GB", { dateStyle: "long" }).format(event.starts_at),
  }));
});
