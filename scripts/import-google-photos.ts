import { createHash, randomUUID } from "crypto";
import { readFileSync } from "fs";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import * as GooglePhotosAlbum from "google-photos-album-image-url-fetch";
import pg from "pg";

type AlbumSpec = {
  url: string;
  slug: string;
  title: string;
  description: string;
};

type PhotoInfo = {
  uid: string;
  url: string;
  width: number;
  height: number;
};

type PreparedAsset = {
  assetId: string;
  objectKey: string;
  originalName: string;
  mimeType: string;
  byteSize: number;
  width: number;
  height: number;
  altText: string;
  sortOrder: number;
};

const albums: AlbumSpec[] = [
  {
    url: "https://photos.google.com/share/AF1QipPFu_67zDwy3abkiGUlSdyFLd0elIl7yBY3Bf5TIlq0a1J5qBJjcYWyy_EKN9hgkw?key=clBMUWtoVXQ5ZC02bjNSR2p0Ti1MRFBSdnFoZFZB",
    slug: "tennista-2026-day-1",
    title: "TENNISTA 2026 Day 1",
    description: "Photos from day one of the Tennista 2026 junior tennis tournament.",
  },
  {
    url: "https://photos.google.com/share/AF1QipOhbMabfWaCgZYA0wemxvbiKsM6CiMwj-W_muQ4ceCusJvC8N6ipZ0uSJO_Ln2BgA?key=NC1NSFlFaThiTUpYNWMyLVFiQkg3S3BUNjRGQlZn",
    slug: "tennista-2026-day-3",
    title: "TENNISTA 2026 Day 3",
    description: "Photos from day three of the Tennista 2026 junior tennis tournament.",
  },
];

const MAX_EDGE = 1600;
const CONCURRENCY = 8;
const IMPORT_ACTOR = "google-photos-import";

function loadEnvFile() {
  try {
    const raw = readFileSync(".env.local", "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
      const eq = trimmed.indexOf("=");
      const key = trimmed.slice(0, eq);
      const value = trimmed.slice(eq + 1).replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // optional
  }
}

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function storageClient() {
  return new S3Client({
    endpoint: requiredEnv("NEON_STORAGE_ENDPOINT"),
    region: process.env.NEON_STORAGE_REGION ?? "us-east-2",
    forcePathStyle: true,
    credentials: {
      accessKeyId: requiredEnv("NEON_STORAGE_ACCESS_KEY_ID"),
      secretAccessKey: requiredEnv("NEON_STORAGE_SECRET_ACCESS_KEY"),
    },
  });
}

function sizedUrl(photo: PhotoInfo) {
  const scale = Math.min(1, MAX_EDGE / Math.max(photo.width, photo.height));
  const width = Math.max(1, Math.round(photo.width * scale));
  const height = Math.max(1, Math.round(photo.height * scale));
  return {
    downloadUrl: `${photo.url}=w${width}-h${height}`,
    width,
    height,
  };
}

async function mapPool<T, R>(items: T[], limit: number, worker: (item: T, index: number) => Promise<R>) {
  const results = new Array<R>(items.length);
  let next = 0;
  async function run() {
    while (next < items.length) {
      const index = next++;
      results[index] = await worker(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => run()));
  return results;
}

async function uploadPhotos(s3: S3Client, bucket: string, album: AlbumSpec, photos: PhotoInfo[]) {
  let uploaded = 0;
  return mapPool(photos, CONCURRENCY, async (photo, index) => {
    const { downloadUrl, width, height } = sizedUrl(photo);
    const response = await fetch(downloadUrl);
    if (!response.ok) {
      throw new Error(`Download failed for ${photo.uid}: ${response.status}`);
    }
    const mimeType = response.headers.get("content-type")?.split(";")[0]?.trim() || "image/jpeg";
    const extension = mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpg";
    const bytes = Buffer.from(await response.arrayBuffer());
    const hash = createHash("sha1").update(photo.uid).digest("hex").slice(0, 12);
    const objectKey = `uploads/galleries/${album.slug}/${String(index + 1).padStart(4, "0")}-${hash}.${extension}`;
    const assetId = randomUUID();

    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: objectKey,
        Body: bytes,
        ContentType: mimeType,
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );

    uploaded += 1;
    if (uploaded % 25 === 0 || uploaded === photos.length) {
      console.log(`  uploaded ${uploaded}/${photos.length}`);
    }

    const prepared: PreparedAsset = {
      assetId,
      objectKey,
      originalName: `${album.slug}-${String(index + 1).padStart(4, "0")}.${extension}`,
      mimeType,
      byteSize: bytes.byteLength,
      width,
      height,
      altText: `${album.title} photo ${index + 1}`,
      sortOrder: index,
    };
    return prepared;
  });
}

async function importAlbum(pool: pg.Pool, s3: S3Client, bucket: string, album: AlbumSpec) {
  const existing = await pool.query(`SELECT id FROM cms_galleries WHERE slug = $1`, [album.slug]);
  if (existing.rowCount) {
    console.log(`Skipping ${album.slug} — gallery already exists`);
    return;
  }

  console.log(`Fetching album metadata: ${album.title}`);
  const photos = (await GooglePhotosAlbum.fetchImageUrls(album.url)) as PhotoInfo[] | null;
  if (!photos?.length) throw new Error(`No photos found for ${album.slug}`);
  console.log(`  ${photos.length} photos — uploading to Neon Storage`);

  const assets = await uploadPhotos(s3, bucket, album, photos);
  const galleryId = randomUUID();
  const coverAssetId = assets[0]?.assetId ?? null;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    for (const asset of assets) {
      await client.query(
        `
          INSERT INTO cms_assets (
            id, bucket, object_key, original_name, mime_type, byte_size,
            width, height, alt_text, caption, status, uploaded_by
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NULL, 'ready', $10)
        `,
        [
          asset.assetId,
          bucket,
          asset.objectKey,
          asset.originalName,
          asset.mimeType,
          asset.byteSize,
          asset.width,
          asset.height,
          asset.altText,
          IMPORT_ACTOR,
        ],
      );
    }

    await client.query(
      `
        INSERT INTO cms_galleries (
          id, slug, title, description, cover_asset_id, status, published_at, created_by
        )
        VALUES ($1, $2, $3, $4, $5, 'published', NOW(), $6)
      `,
      [galleryId, album.slug, album.title, album.description, coverAssetId, IMPORT_ACTOR],
    );

    for (const asset of assets) {
      await client.query(
        `
          INSERT INTO cms_gallery_items (gallery_id, asset_id, caption, sort_order)
          VALUES ($1, $2, NULL, $3)
        `,
        [galleryId, asset.assetId, asset.sortOrder],
      );
    }

    await client.query(
      `
        INSERT INTO cms_audit_log (actor_user_id, action, entity_type, entity_id, after_state)
        VALUES ($1, 'import', 'gallery', $2, $3::JSONB)
      `,
      [
        IMPORT_ACTOR,
        galleryId,
        JSON.stringify({
          slug: album.slug,
          title: album.title,
          source: album.url,
          itemCount: photos.length,
        }),
      ],
    );
    await client.query("COMMIT");
    console.log(`Published gallery ${album.slug} with ${photos.length} photos`);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  loadEnvFile();
  const bucket = process.env.NEON_STORAGE_BUCKET ?? "tennista-media";
  const pool = new pg.Pool({ connectionString: requiredEnv("DATABASE_URL"), max: 3 });
  const s3 = storageClient();
  try {
    for (const album of albums) {
      await importAlbum(pool, s3, bucket, album);
    }
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
