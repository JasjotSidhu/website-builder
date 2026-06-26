import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  OAUTH_REDIRECT_COOKIE,
  OAUTH_STATE_COOKIE,
  signInWithGoogleCode,
} from "@/lib/auth/google";
import { sessionCookieOptions } from "@/lib/auth/session";

function loginErrorRedirect(message: string): NextResponse {
  const params = new URLSearchParams({ error: message });
  return NextResponse.redirect(new URL(`/login?${params.toString()}`, process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"));
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const oauthError = searchParams.get("error");

  const cookieStore = await cookies();
  const expectedState = cookieStore.get(OAUTH_STATE_COOKIE)?.value;
  const redirectTo = cookieStore.get(OAUTH_REDIRECT_COOKIE)?.value ?? "/dashboard";

  cookieStore.delete(OAUTH_STATE_COOKIE);
  cookieStore.delete(OAUTH_REDIRECT_COOKIE);

  if (oauthError) {
    return loginErrorRedirect("Google sign-in was cancelled.");
  }

  if (!code || !state || !expectedState || state !== expectedState) {
    return loginErrorRedirect("Google sign-in failed. Please try again.");
  }

  try {
    const token = await signInWithGoogleCode(code);
    cookieStore.set(sessionCookieOptions(token));

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const destination = redirectTo.startsWith("/") ? redirectTo : "/dashboard";
    return NextResponse.redirect(new URL(destination, appUrl));
  } catch {
    return loginErrorRedirect("Google sign-in failed. Please try again.");
  }
}
