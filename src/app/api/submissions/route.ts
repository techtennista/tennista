import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notifyInbox } from "@/lib/notify";

const TYPES = new Set([
  "contact",
  "newsletter",
  "volunteer",
  "tournament_registration",
  "event_registration",
  "partnership",
  "sponsorship",
  "student_enrolment",
  "comment",
]);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request: Request) {
  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request." }, { status: 400 });
  }

  if (typeof payload.company === "string" && payload.company.trim()) {
    return NextResponse.json({ message: "Thank you. Your submission has been received." });
  }

  const type = String(payload.type ?? "");
  const email = String(payload.email ?? "").trim();
  const name = String(payload.name ?? payload.fullName ?? "").trim();
  const phone = String(payload.phone ?? "").trim();
  const subject = String(payload.subject ?? "").trim();
  const message = String(payload.message ?? "").trim();
  const sourcePath = String(payload.sourcePath ?? "").slice(0, 500);

  if (!TYPES.has(type)) {
    return NextResponse.json({ message: "Unknown submission type." }, { status: 400 });
  }
  if (email && !EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ message: "Please enter a valid email address." }, { status: 422 });
  }
  if (type === "contact" && (!name || !email || !subject || !message)) {
    return NextResponse.json({ message: "Please complete every required field." }, { status: 422 });
  }
  if (JSON.stringify(payload).length > 40_000) {
    return NextResponse.json({ message: "Submission is too large." }, { status: 413 });
  }

  const data: Record<string, unknown> = {
    ...payload,
    name: name || null,
    email: email || null,
    phone: phone || null,
    subject: subject || null,
    message: message || null,
    sourcePath: sourcePath || null,
    userAgent: request.headers.get("user-agent"),
  };
  delete data.type;
  delete data.company;

  await db.query(
    `
      INSERT INTO cms_submissions (id, form_type, payload)
      VALUES ($1, $2, $3::jsonb)
    `,
    [
      crypto.randomUUID(),
      type,
      JSON.stringify(data),
    ],
  );

  await notifyInbox({
    type,
    name,
    email,
    subject,
    message,
  });

  return NextResponse.json(
    { message: "Thank you. Your submission has been received." },
    { status: 201 },
  );
}
