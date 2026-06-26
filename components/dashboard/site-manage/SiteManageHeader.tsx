import Link from "next/link";
import { Eye, Pencil } from "lucide-react";
import type { WebsiteManageContext } from "@/lib/website-store";

function siteStatus(website: WebsiteManageContext): { label: string; live: boolean } {
  const isLive = Boolean(website.publishedAt && !website.hasUnpublishedChanges);
  return isLive ? { label: "Live", live: true } : { label: "Draft", live: false };
}

function publicHost(slug: string): string {
  return `${slug}.webeix.site`;
}

export default function SiteManageHeader({ website }: { website: WebsiteManageContext }) {
  const status = siteStatus(website);
  const builderHref = `/dashboard/sites/${website.id}/builder`;
  const liveHref = `/w/${website.slug}`;

  return (
    <header className="site-manage__header">
      <nav className="site-manage__breadcrumbs" aria-label="Breadcrumb">
        <Link href="/dashboard">My Websites</Link>
        <span aria-hidden>/</span>
        <span>{website.name}</span>
      </nav>

      <div className="site-manage__title-row">
        <div className="site-manage__title-block">
          <h1 className="site-manage__title">{website.name}</h1>
          <p className="site-manage__subtitle">
            <span
              className={`site-manage__status-dot${status.live ? " site-manage__status-dot--live" : ""}`}
              aria-hidden
            />
            {status.label} · {publicHost(website.slug)}
          </p>
        </div>

        <div className="site-manage__actions">
          <a
            href={liveHref}
            target="_blank"
            rel="noopener noreferrer"
            className="dash-btn dash-btn--outline site-manage__action-btn"
          >
            <Eye size={16} strokeWidth={1.75} aria-hidden />
            View site
          </a>
          <a
            href={builderHref}
            target="_blank"
            rel="noopener noreferrer"
            className="dash-btn dash-btn--orange site-manage__action-btn"
          >
            <Pencil size={16} strokeWidth={1.75} aria-hidden />
            Edit website
          </a>
        </div>
      </div>
    </header>
  );
}
