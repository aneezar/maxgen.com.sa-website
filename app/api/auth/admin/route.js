import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const PIN = process.env.ADMIN_PIN;
  if (!PIN || PIN === "ADMIN_PIN_NOT_SET") {
    return NextResponse.json({ error: "Admin not configured." }, { status: 503 });
  }
  let pin;
  try {
    const body = await request.json();
    pin = body.pin;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!pin || typeof pin !== "string" || pin !== PIN) {
    return NextResponse.json({ error: "Incorrect PIN." }, { status: 401 });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set("admin_session", PIN, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 60 * 60 * 8,
    path: "/",
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete("admin_session");
  return response;
}
