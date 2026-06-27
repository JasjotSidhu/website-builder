import { Suspense } from "react";
import { redirect } from "next/navigation";
import { isAdminUser, getPostAuthRedirectPath } from "@/lib/auth/admin";
import { buildUserLoginUrl, isAdminLoginNext } from "@/lib/auth/user-login-url";
import LoginForm from "@/components/auth/LoginForm";
import AuthShell from "@/components/auth/AuthShell";
import { getSessionUser } from "@/lib/auth/session";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: { error?: string; next?: string };
}) {
  const user = await getSessionUser();
  const next = searchParams?.next?.startsWith("/") ? searchParams.next : null;
  const isAdminLogin = isAdminLoginNext(next);

  if (user) {
    if (next && (next.startsWith("/admin") ? isAdminUser(user) : true)) {
      redirect(next);
    }
    redirect(getPostAuthRedirectPath(user));
  }

  if (!isAdminLogin) {
    redirect(
      buildUserLoginUrl({
        next,
        error: searchParams?.error ?? null,
        from: "/",
      }),
    );
  }

  return (
    <AuthShell mode="login" admin>
      <Suspense fallback={null}>
        <LoginForm
          initialError={searchParams?.error ?? null}
          nextPath={next}
        />
      </Suspense>
    </AuthShell>
  );
}
