import "server-only";

import { cache } from "react";
import type { MediaStory, PhotoFeedItem } from "@/components/sections/media-hub";
import { db } from "@/lib/db";
import { publicAssetUrl } from "@/lib/storage";

export const PHOTO_PAGE_SIZE = 16;

export type { PhotoFeedItem };

export type PhotoPage = {
  items: PhotoFeedItem[];
  nextOffset: number | null;
  total: number;
};

type PhotoRow = {
  asset_id: string;
  gallery_slug: string;
  gallery_title: string;
  caption: string | null;
  alt_text: string | null;
  object_key: string;
  sort_order: number;
};

function mapPhoto(photo: PhotoRow, index: number): PhotoFeedItem {
  return {
    id: photo.asset_id,
    title: photo.caption || photo.alt_text || `${photo.gallery_title} photo ${index + 1}`,
    image: publicAssetUrl(photo.object_key),
    href: `/media/photo-gallery#${photo.gallery_slug}`,
  };
}

export async function getPublishedPhotosPage({
  offset = 0,
  limit = PHOTO_PAGE_SIZE,
  query = "",
}: {
  offset?: number;
  limit?: number;
  query?: string;
} = {}): Promise<PhotoPage> {
  const safeOffset = Math.max(0, Math.floor(offset));
  const safeLimit = Math.min(48, Math.max(1, Math.floor(limit)));
  const term = query.trim().toLowerCase();

  const countResult = await db.query<{ total: string }>(
    `
      SELECT COUNT(*)::TEXT AS total
      FROM cms_galleries g
      JOIN cms_gallery_items gi ON gi.gallery_id = g.id
      JOIN cms_assets a ON a.id = gi.asset_id
      WHERE g.status = 'published'
        AND (g.published_at IS NULL OR g.published_at <= NOW())
        AND a.status = 'ready'
        AND (
          $1 = ''
          OR LOWER(COALESCE(gi.caption, '')) LIKE '%' || $1 || '%'
          OR LOWER(COALESCE(a.alt_text, '')) LIKE '%' || $1 || '%'
          OR LOWER(g.title) LIKE '%' || $1 || '%'
        )
    `,
    [term],
  );
  const total = Number(countResult.rows[0]?.total ?? 0);

  const result = await db.query<PhotoRow>(
    `
      SELECT a.id AS asset_id, g.slug AS gallery_slug, g.title AS gallery_title,
        gi.caption, a.alt_text, a.object_key, gi.sort_order
      FROM cms_galleries g
      JOIN cms_gallery_items gi ON gi.gallery_id = g.id
      JOIN cms_assets a ON a.id = gi.asset_id
      WHERE g.status = 'published'
        AND (g.published_at IS NULL OR g.published_at <= NOW())
        AND a.status = 'ready'
        AND (
          $1 = ''
          OR LOWER(COALESCE(gi.caption, '')) LIKE '%' || $1 || '%'
          OR LOWER(COALESCE(a.alt_text, '')) LIKE '%' || $1 || '%'
          OR LOWER(g.title) LIKE '%' || $1 || '%'
        )
      ORDER BY g.published_at DESC NULLS LAST, gi.sort_order, a.created_at
      OFFSET $2
      LIMIT $3
    `,
    [term, safeOffset, safeLimit],
  );

  const items = result.rows.map((photo, index) => mapPhoto(photo, safeOffset + index));
  const nextOffset = safeOffset + items.length < total ? safeOffset + items.length : null;

  return { items, nextOffset, total };
}

/** First page only — use getPublishedPhotosPage /api/photos for the full feed. */
export const getPublishedPhotos = cache(async (): Promise<PhotoFeedItem[]> => {
  const page = await getPublishedPhotosPage({ offset: 0, limit: PHOTO_PAGE_SIZE });
  return page.items;
});

export const getPublishedVideos = cache(async (): Promise<MediaStory[]> => {
  const result = await db.query<{
    title: string;
    external_url: string | null;
    video_object_key: string | null;
    thumbnail_object_key: string | null;
  }>(
    `
      SELECT v.title, v.external_url, video.object_key AS video_object_key,
        thumbnail.object_key AS thumbnail_object_key
      FROM cms_videos v
      LEFT JOIN cms_assets video ON video.id = v.video_asset_id
      LEFT JOIN cms_assets thumbnail ON thumbnail.id = v.thumbnail_asset_id
      WHERE v.status = 'published'
        AND (v.published_at IS NULL OR v.published_at <= NOW())
      ORDER BY v.sort_order, v.published_at DESC NULLS LAST
    `,
  );

  return result.rows.flatMap((video) => {
    const href = video.external_url || (video.video_object_key ? publicAssetUrl(video.video_object_key) : "");
    if (!href) return [];
    return [{
      title: video.title,
      image: video.thumbnail_object_key
        ? publicAssetUrl(video.thumbnail_object_key)
        : "/junior-tennis-open-cover.jpg",
      href,
    }];
  });
});
