import { NextResponse } from "next/server";
import { acceptInvite } from "@/lib/admin-invites";

export async function POST(request: Request) {
  const payload = (await request.json()) as Record<string, unknown>;
  const token = String(payload.token ?? "").trim();
  const name = String(payload.name ?? "").trim();
  const password = String(payload.password ?? "");

  if (!token) return NextResponse.json({ error: "Missing invite token." }, { status: 400 });
  if (name.length < 2) {
    return NextResponse.json({ error: "Please add the name you want on the account." }, { status: 400 });
  }
  if (password.length < 12) {
    return NextResponse.json({ error: "Password must be at least 12 characters." }, { status: 400 });
  }

  try {
    const result = await acceptInvite({ token, name, password });
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ ok: true, email: result.email });
  } catch (error) {
    console.error("Unable to accept admin invite", error);
    return NextResponse.json({ error: "Unable to create that account. Try again." }, { status: 500 });
  }
}
