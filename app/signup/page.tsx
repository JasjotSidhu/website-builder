import { redirect } from "next/navigation";
import { getPostAuthRedirectPath } from "@/lib/auth/admin";
import { buildUserSignupUrl } from "@/lib/auth/user-login-url";
import { getSessionUser } from "@/lib/auth/session";

export default async function SignupPage({
  searchParams,
}: {
  searchParams?: { prompt?: string; error?: string };
}) {
  const user = await getSessionUser();
  if (user) {
    redirect(getPostAuthRedirectPath(user));
  }

  redirect(
    buildUserSignupUrl({
      prompt: searchParams?.prompt ?? null,
      error: searchParams?.error ?? null,
    }),
  );
}
