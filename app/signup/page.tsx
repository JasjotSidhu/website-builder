import { redirect } from "next/navigation";
import SignupForm from "@/components/auth/SignupForm";
import AuthShell from "@/components/auth/AuthShell";
import { isGoogleAuthConfigured } from "@/lib/auth/google";
import { getSessionUser } from "@/lib/auth/session";

export default async function SignupPage() {
  const user = await getSessionUser();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <AuthShell mode="signup">
      <SignupForm googleEnabled={isGoogleAuthConfigured()} />
    </AuthShell>
  );
}
