import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  clearSessionCookieOptions,
  deleteSession,
} from "@/lib/auth/session";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await deleteSession(token);
  }

  cookieStore.set(clearSessionCookieOptions());
  return NextResponse.json({ ok: true });
}
