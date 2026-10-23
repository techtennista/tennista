import { getAdminSession } from "@/lib/admin-session";
import { db } from "@/lib/db";
import { mediaBucket, publicAssetUrl } from "@/lib/storage";

type AssetRow = {
  id: string;
  bucket: string;
  object_key: string;
  original_name: string;
  mime_type: string;
  byte_size: string;
  width: number | null;
  height: number | null;
  alt_text: string | null;
  caption: string | null;
  status: "staged" | "ready" | "archived";
  created_at: Date;
};

function serializeAsset(row: AssetRow) {
  return {
    id: row.id,
    originalName: row.original_name,
    mimeType: row.mime_type,
    byteSize: Number(row.byte_size),
    width: row.width,
    height: row.height,
    altText: row.alt_text,
    caption: row.caption,
    status: row.status,
    url: publicAssetUrl(row.object_key),
    createdAt: row.created_at,
  };
}

export async function GET() {
  const session = await getAdminSession();
  if (!session) return Response.json({ message: "Unauthorised." }, { status: 401 });

  try {
    const result = await db.query<AssetRow>(`
      SELECT id, bucket, object_key, original_name, mime_type, byte_size, width, height,
             alt_text, caption, status, created_at
      FROM cms_assets
      WHERE status <> 'archived'
      ORDER BY created_at DESC
      LIMIT 100
    `);
    return Response.json({ assets: result.rows.map(serializeAsset) });
  } catch (error) {
    console.error("Unable to list media", error);
    return Response.json({ message: "Unable to load media." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return Response.json({ message: "Unauthorised." }, { status: 401 });

  const body = (await request.json()) as {
    objectKey?: unknown;
    originalName?: unknown;
    mimeType?: unknown;
    byteSize?: unknown;
    width?: unknown;
    height?: unknown;
    altText?: unknown;
    caption?: unknown;
  };
  const objectKey = typeof body.objectKey === "string" ? body.objectKey : "";
  const originalName = typeof body.originalName === "string" ? body.originalName.trim() : "";
  const mimeType = typeof body.mimeType === "string" ? body.mimeType : "";
  const byteSize = typeof body.byteSize === "number" ? body.byteSize : 0;
  const width = typeof body.width === "number" && body.width > 0 ? Math.round(body.width) : null;
  const height = typeof body.height === "number" && body.height > 0 ? Math.round(body.height) : null;
  const altText = typeof body.altText === "string" ? body.altText.trim() : null;
  const caption = typeof body.caption === "string" ? body.caption.trim() : null;

  if (!objectKey.startsWith("uploads/") || !originalName || !mimeType || byteSize <= 0) {
    return Response.json({ message: "Invalid asset metadata." }, { status: 422 });
  }

  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query<AssetRow>(
      `
        INSERT INTO cms_assets (
          bucket, object_key, original_name, mime_type, byte_size, width, height,
          alt_text, caption, status, uploaded_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'ready', $10)
        RETURNING id, bucket, object_key, original_name, mime_type, byte_size, width, height,
                  alt_text, caption, status, created_at
      `,
      [
        mediaBucket,
        objectKey,
        originalName,
        mimeType,
        byteSize,
        width,
        height,
        altText || null,
        caption || null,
        session.user.id,
      ],
    );
    const asset = result.rows[0];
    await client.query(
      `
        INSERT INTO cms_audit_log (actor_user_id, action, entity_type, entity_id, after_state)
        VALUES ($1, 'create', 'asset', $2, $3::JSONB)
      `,
      [session.user.id, asset.id, JSON.stringify(serializeAsset(asset))],
    );
    await client.query("COMMIT");
    return Response.json({ asset: serializeAsset(asset) }, { status: 201 });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Unable to save media", error);
    return Response.json({ message: "Unable to save media." }, { status: 500 });
  } finally {
    client.release();
  }
}
