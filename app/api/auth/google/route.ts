import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { buildGoogleAuthUrl, OAUTH_REDIRECT_COOKIE, OAUTH_STATE_COOKIE } from "@/lib/auth/google";

function safeRedirectPath(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard";
  }
  return value;
}

export async function GET(req: Request) {
  const configUrl = buildGoogleAuthUrl("");
  if (!configUrl) {
    return NextResponse.json(
      { error: "Google sign-in is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET." },
      { status: 503 },
    );
  }

  const { searchParams } = new URL(req.url);
  const redirectTo = safeRedirectPath(searchParams.get("redirect"));
  const state = crypto.randomUUID();

  const cookieStore = await cookies();
  cookieStore.set({
    name: OAUTH_STATE_COOKIE,
    value: state,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
  });
  cookieStore.set({
    name: OAUTH_REDIRECT_COOKIE,
    value: redirectTo,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
  });

  const authUrl = buildGoogleAuthUrl(state);
  if (!authUrl) {
    return NextResponse.json({ error: "Google sign-in is unavailable." }, { status: 503 });
  }

  return NextResponse.redirect(authUrl);
}
