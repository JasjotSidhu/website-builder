import { prisma } from "@/lib/db";
import { isAdminUser, syncAdminRoleForUser } from "./admin";
import { createSession } from "./session";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

export const OAUTH_STATE_COOKIE = "wb_oauth_state";
export const OAUTH_REDIRECT_COOKIE = "wb_oauth_redirect";

export interface GoogleProfile {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
}

function getGoogleConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!clientId || !clientSecret) {
    return null;
  }

  return {
    clientId,
    clientSecret,
    redirectUri: `${appUrl.replace(/\/$/, "")}/api/auth/google/callback`,
  };
}

export function isGoogleAuthConfigured(): boolean {
  return getGoogleConfig() !== null;
}

export function buildGoogleAuthUrl(state: string): string | null {
  const config = getGoogleConfig();
  if (!config) {
    return null;
  }

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
    access_type: "online",
  });

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

async function exchangeCodeForProfile(code: string): Promise<GoogleProfile> {
  const config = getGoogleConfig();
  if (!config) {
    throw new Error("Google auth is not configured.");
  }

  const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    throw new Error("Failed to exchange Google authorization code.");
  }

  const tokenPayload = (await tokenRes.json()) as { access_token?: string };
  if (!tokenPayload.access_token) {
    throw new Error("Google token response missing access token.");
  }

  const profileRes = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${tokenPayload.access_token}` },
  });

  if (!profileRes.ok) {
    throw new Error("Failed to load Google profile.");
  }

  const profile = (await profileRes.json()) as GoogleProfile;
  if (!profile.sub || !profile.email) {
    throw new Error("Google profile is missing required fields.");
  }

  return profile;
}

export async function signInWithGoogleCode(code: string): Promise<{ token: string; isAdmin: boolean }> {
  const profile = await exchangeCodeForProfile(code);
  const email = profile.email.trim().toLowerCase();

  const byGoogleId = await prisma.user.findUnique({ where: { googleId: profile.sub } });
  if (byGoogleId) {
    const role = await syncAdminRoleForUser(byGoogleId.id, byGoogleId.email, byGoogleId.role);
    return {
      token: await createSession(byGoogleId.id),
      isAdmin: isAdminUser({ email: byGoogleId.email, role }),
    };
  }

  const byEmail = await prisma.user.findUnique({ where: { email } });
  if (byEmail) {
    const user = await prisma.user.update({
      where: { id: byEmail.id },
      data: {
        googleId: profile.sub,
        name: byEmail.name ?? profile.name ?? null,
      },
    });
    const role = await syncAdminRoleForUser(user.id, user.email, user.role);
    return {
      token: await createSession(user.id),
      isAdmin: isAdminUser({ email: user.email, role }),
    };
  }

  const user = await prisma.user.create({
    data: {
      email,
      googleId: profile.sub,
      name: profile.name ?? null,
    },
  });

  const role = await syncAdminRoleForUser(user.id, user.email, user.role);
  return {
    token: await createSession(user.id),
    isAdmin: isAdminUser({ email: user.email, role }),
  };
}
