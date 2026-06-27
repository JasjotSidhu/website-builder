"use client";

import { useRouter, usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const isFullWidthToolPage = pathname.endsWith("/blog") || pathname.endsWith("/forms");

  return (
    <div className="dash site-manage">
      <DashboardNav user={user} onNewWebsite={() => router.push("/dashboard")} />

      <div className="site-manage__layout">
        <SiteManageSidebar websiteId={website.id} />

        <main className={`site-manage__main${isFullWidthToolPage ? " site-manage__main--tool" : ""}`}>
          {!isFullWidthToolPage ? <SiteManageHeader website={website} /> : null}
          <div className={`site-manage__content${isFullWidthToolPage ? " site-manage__content--tool" : ""}`}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
