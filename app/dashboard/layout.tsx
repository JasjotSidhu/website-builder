import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { buildUserLoginUrl } from "@/lib/auth/user-login-url";
import { getSessionUser } from "@/lib/auth/session";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) {
    const pathname = (await headers()).get("x-pathname") ?? "/dashboard";
    redirect(buildUserLoginUrl({ next: pathname }));
  }

  return children;
}
