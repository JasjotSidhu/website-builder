import Link from "next/link";
import { redirect } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";
import AuthShell from "@/components/auth/AuthShell";
import { isGoogleAuthConfigured } from "@/lib/auth/google";
import { getSessionUser } from "@/lib/auth/session";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  const user = await getSessionUser();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <AuthShell mode="login">
      <LoginForm
        googleEnabled={isGoogleAuthConfigured()}
        initialError={searchParams?.error ?? null}
      />
    </AuthShell>
  );
}
