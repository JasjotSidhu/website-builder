import SiteFormsManager from "@/components/dashboard/site-manage/SiteFormsManager";
import { getSessionUser } from "@/lib/auth/session";
import { getWebsiteManageContext, WebsiteAccessError } from "@/lib/website-store";
import { notFound, redirect } from "next/navigation";

interface PageProps {
  params: { websiteId: string };
}

export default async function SiteFormsPage({ params }: PageProps) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  try {
    const website = await getWebsiteManageContext(user.id, params.websiteId);
    return <SiteFormsManager websiteId={website.id} />;
  } catch (error) {
    if (error instanceof WebsiteAccessError) {
      notFound();
    }
    throw error;
  }
}
