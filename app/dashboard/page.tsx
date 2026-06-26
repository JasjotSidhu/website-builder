import { redirect } from "next/navigation";
import DashboardView from "@/components/dashboard/DashboardView";
import { getSessionUser } from "@/lib/auth/session";
import { listWebsitesForUser } from "@/lib/website-store";

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  const websites = await listWebsitesForUser(user.id);

  return <DashboardView user={user} websites={websites} />;
}
