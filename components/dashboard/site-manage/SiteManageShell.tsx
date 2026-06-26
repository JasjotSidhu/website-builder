"use client";

import { useRouter } from "next/navigation";
import type { SessionUser } from "@/lib/auth/session";
import type { WebsiteManageContext } from "@/lib/website-store";
import DashboardNav from "../DashboardNav";
import SiteManageHeader from "./SiteManageHeader";
import SiteManageSidebar from "./SiteManageSidebar";

interface SiteManageShellProps {
  user: SessionUser;
  website: WebsiteManageContext;
  children: React.ReactNode;
}

export default function SiteManageShell({ user, website, children }: SiteManageShellProps) {
  const router = useRouter();

  return (
    <div className="dash site-manage">
      <DashboardNav user={user} onNewWebsite={() => router.push("/dashboard")} />

      <div className="site-manage__layout">
        <SiteManageSidebar websiteId={website.id} />

        <main className="site-manage__main">
          <SiteManageHeader website={website} />
          <div className="site-manage__content">{children}</div>
        </main>
      </div>
    </div>
  );
}
