import "server-only";

import { cache } from "react";
import type { NewsPost } from "@/components/sections/news-article";
import { parseArticleDocument } from "@/lib/cms-content";
import { db } from "@/lib/db";
import { publicAssetUrl } from "@/lib/storage";

type PostRow = {
  slug: string;
  title: string;
  body: unknown;
  published_at: Date;
  hero_object_key: string | null;
};

export const getPublishedNewsPosts = cache(async (): Promise<NewsPost[]> => {
  const result = await db.query<PostRow>(
    `
      SELECT p.slug, p.title, p.body, p.published_at, a.object_key AS hero_object_key
      FROM cms_posts p
      LEFT JOIN cms_assets a ON a.id = p.hero_asset_id
      WHERE p.status = 'published' AND p.published_at <= NOW()
      ORDER BY p.published_at DESC, p.created_at DESC
    `,
  );

  const documents = result.rows.map((row) => parseArticleDocument(row.body));
  const imageIds = [
    ...new Set(
      documents.flatMap((document) =>
        document.blocks
          .filter((block) => block.type === "image" && block.assetId)
          .map((block) => (block.type === "image" ? block.assetId : "")),
      ),
    ),
  ].filter(Boolean);
  const assets =
    imageIds.length > 0
      ? await db.query<{ id: string; object_key: string }>(
          "SELECT id::text, object_key FROM cms_assets WHERE id = ANY($1::uuid[]) AND status = 'ready'",
          [imageIds],
        )
      : { rows: [] };
  const assetUrls = Object.fromEntries(
    assets.rows.map((asset) => [asset.id, publicAssetUrl(asset.object_key)]),
  );

  return result.rows.map((row, index) => {
    const hero = row.hero_object_key ? publicAssetUrl(row.hero_object_key) : "/junior-tennis-open-cover.jpg";
    return {
      slug: row.slug,
      title: row.title,
      date: new Intl.DateTimeFormat("en-GB", { dateStyle: "long" }).format(row.published_at),
      hero,
      cardImage: hero,
      content: documents[index],
      assetUrls,
    };
  });
});
