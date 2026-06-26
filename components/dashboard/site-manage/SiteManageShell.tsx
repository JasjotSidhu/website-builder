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
  const isBlogPage = pathname.endsWith("/blog");

  return (
    <div className="dash site-manage">
      <DashboardNav user={user} onNewWebsite={() => router.push("/dashboard")} />

      <div className="site-manage__layout">
        <SiteManageSidebar websiteId={website.id} />

        <main className={`site-manage__main${isBlogPage ? " site-manage__main--blog" : ""}`}>
          {!isBlogPage ? <SiteManageHeader website={website} /> : null}
          <div className={`site-manage__content${isBlogPage ? " site-manage__content--blog" : ""}`}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
