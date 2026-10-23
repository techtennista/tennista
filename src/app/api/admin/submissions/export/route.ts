import { getAdminSession } from "@/lib/admin-session";
import { db } from "@/lib/db";

function csvEscape(value: unknown) {
  const text = value == null ? "" : String(value);
  if (/[",\n\r]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status")?.trim() ?? "";
  const type = searchParams.get("type")?.trim() ?? "";

  const result = await db.query<{
    id: string;
    form_type: string;
    status: string;
    submitted_at: Date;
    updated_at: Date;
    name: string | null;
    email: string | null;
    phone: string | null;
    subject: string | null;
    message: string | null;
    source_path: string | null;
    payload: Record<string, unknown>;
  }>(
    `
      SELECT id, form_type, status, submitted_at, updated_at,
        payload->>'name' AS name,
        payload->>'email' AS email,
        payload->>'phone' AS phone,
        payload->>'subject' AS subject,
        payload->>'message' AS message,
        payload->>'sourcePath' AS source_path,
        payload
      FROM cms_submissions
      WHERE ($1 = '' OR status = $1)
        AND ($2 = '' OR form_type = $2)
      ORDER BY submitted_at DESC
      LIMIT 5000
    `,
    [status, type],
  );

  const header = [
    "id",
    "form_type",
    "status",
    "submitted_at",
    "updated_at",
    "name",
    "email",
    "phone",
    "subject",
    "message",
    "source_path",
    "payload_json",
  ];

  const lines = [
    header.join(","),
    ...result.rows.map((row) =>
      [
        row.id,
        row.form_type,
        row.status,
        row.submitted_at.toISOString(),
        row.updated_at.toISOString(),
        row.name,
        row.email,
        row.phone,
        row.subject,
        row.message,
        row.source_path,
        JSON.stringify(row.payload),
      ]
        .map(csvEscape)
        .join(","),
    ),
  ];

  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(`${lines.join("\n")}\n`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="tennista-submissions-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
