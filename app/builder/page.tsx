import { redirect } from "next/navigation";
import { buildUserLoginUrl } from "@/lib/auth/user-login-url";
import { getSessionUser } from "@/lib/auth/session";

export default async function LegacyBuilderRedirect() {
  const user = await getSessionUser();
  redirect(user ? "/dashboard" : buildUserLoginUrl({ next: "/dashboard" }));
}
