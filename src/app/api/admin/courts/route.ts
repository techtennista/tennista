import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-session";
import { normalizeSlug, optionalText } from "@/lib/admin-content";
import { db } from "@/lib/db";
import { publicAssetUrl } from "@/lib/storage";

const STATUSES = new Set(["pending", "published"]);

function parseCoordinate(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : null;
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payload = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!payload) return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });

  const name = String(payload.name ?? "").trim();
  const address = String(payload.address ?? "").trim();
  const city = String(payload.city ?? "").trim();
  const state = String(payload.state ?? "").trim();
  const country = String(payload.country ?? "").trim() || "Nigeria";
  const requestedStatus = String(payload.status ?? "published");
  const status =
    session.role === "contributor" || !STATUSES.has(requestedStatus) ? "pending" : requestedStatus;
  if (!name || !address || !city || !state) {
    return NextResponse.json({ error: "Name, address, city, and state are required." }, { status: 400 });
  }

  let imageUrl = optionalText(payload.imageUrl);
  const imageAssetId = optionalText(payload.imageAssetId);
  if (imageAssetId) {
    const asset = await db.query<{ object_key: string }>(
      `
        SELECT object_key
        FROM cms_assets
        WHERE id = $1 AND status = 'ready' AND mime_type LIKE 'image/%'
      `,
      [imageAssetId],
    );
    if (!asset.rowCount) {
      return NextResponse.json({ error: "Choose a ready image for this location." }, { status: 422 });
    }
    imageUrl = publicAssetUrl(asset.rows[0].object_key);
  }

  const latitude = parseCoordinate(payload.latitude);
  const longitude = parseCoordinate(payload.longitude);
  if ((payload.latitude || payload.longitude) && (latitude === null || longitude === null)) {
    return NextResponse.json({ error: "Latitude and longitude must be valid numbers." }, { status: 400 });
  }

  const baseSlug = normalizeSlug(name) || "tennis-court";
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const taken = await client.query<{ slug: string }>(
      `SELECT slug FROM tennis_courts WHERE slug = $1 OR slug LIKE $2`,
      [baseSlug, `${baseSlug}-%`],
    );
    const used = new Set(taken.rows.map((row) => row.slug));
    let slug = baseSlug;
    let suffix = 2;
    while (used.has(slug)) {
      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    const result = await client.query<{ id: string }>(
      `
        INSERT INTO tennis_courts (
          slug, name, address, city, state, country, image_url, latitude, longitude,
          source, active, moderation_status, description, phone, website_url
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9,
          'curated', $10, $11, $12, $13, $14
        )
        RETURNING id::text
      `,
      [
        slug,
        name,
        address,
        city,
        state,
        country,
        imageUrl,
        latitude,
        longitude,
        status === "published",
        status,
        optionalText(payload.description),
        optionalText(payload.phone),
        optionalText(payload.websiteUrl),
      ],
    );
    const id = result.rows[0].id;
    await client.query(
      `
        INSERT INTO cms_audit_log (actor_user_id, action, entity_type, entity_id, after_state)
        VALUES ($1, 'create', 'tennis_court', $2, $3::jsonb)
      `,
      [
        session.user.id,
        id,
        JSON.stringify({
          slug,
          name,
          address,
          city,
          state,
          country,
          imageUrl,
          status,
        }),
      ],
    );
    await client.query("COMMIT");
    return NextResponse.json({ id, slug, status }, { status: 201 });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Unable to create tennis court", error);
    return NextResponse.json({ error: "Unable to create that location." }, { status: 500 });
  } finally {
    client.release();
  }
}
