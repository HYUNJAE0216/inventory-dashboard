import { NextResponse } from "next/server";
import { createSession, getLockoutRemainingMs, verifyPin, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function POST(request: Request) {
  const alreadyLocked = getLockoutRemainingMs();
  if (alreadyLocked > 0) {
    return NextResponse.json({ ok: false, lockedMs: alreadyLocked }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const pin = typeof body?.pin === "string" ? body.pin : "";

  const result = verifyPin(pin);
  if (!result.ok) {
    const status = result.lockedMs > 0 ? 429 : 401;
    return NextResponse.json({ ok: false, lockedMs: result.lockedMs }, { status });
  }

  const token = createSession();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return res;
}
