import { notFound, redirect } from "next/navigation";
import SiteManageShell from "@/components/dashboard/site-manage/SiteManageShell";
import { getSessionUser } from "@/lib/auth/session";
import { getWebsiteManageContext, WebsiteAccessError } from "@/lib/website-store";

interface LayoutProps {
  children: React.ReactNode;
  params: { websiteId: string };
}

export default async function SiteManageLayout({ children, params }: LayoutProps) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  try {
    const website = await getWebsiteManageContext(user.id, params.websiteId);
    return (
      <SiteManageShell user={user} website={website}>
        {children}
      </SiteManageShell>
    );
  } catch (error) {
    if (error instanceof WebsiteAccessError) {
      notFound();
    }
    throw error;
  }
}
