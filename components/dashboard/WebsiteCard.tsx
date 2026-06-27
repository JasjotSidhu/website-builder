"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ExternalLink, MoreHorizontal } from "lucide-react";
import type { WebsiteSummary } from "@/lib/website-store";
import ClientRelativeTime from "@/components/shared/ClientRelativeTime";
import WebsitePreviewMock from "./WebsitePreviewMock";

function statusMeta(website: WebsiteSummary): { label: string; tone: "live" | "draft" } {
  const isLive = Boolean(website.publishedAt && !website.hasUnpublishedChanges);
  return isLive ? { label: "Live", tone: "live" } : { label: "Draft", tone: "draft" };
}

export default function WebsiteCard({ website }: { website: WebsiteSummary }) {
  const status = statusMeta(website);
  const builderHref = `/dashboard/sites/${website.id}/builder`;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  return (
    <article className="dash-site-card">
      <div className="dash-site-card__preview">
        <WebsitePreviewMock websiteId={website.id} />
        <span className={`dash-status-badge dash-status-badge--${status.tone}`}>
          <span className="dash-status-badge__dot" aria-hidden />
          {status.label}
        </span>
      </div>

      <div className="dash-site-card__body">
        <h2 className="dash-site-card__title">{website.name}</h2>
        <p className="dash-site-card__meta">
          Website · <ClientRelativeTime date={website.updatedAt} />
        </p>

        <div className="dash-site-card__actions">
          <Link href={builderHref} className="dash-btn dash-btn--navy dash-btn--edit">
            Edit
          </Link>
          <Link
            href={`/dashboard/sites/${website.id}`}
            className="dash-btn dash-btn--outline dash-btn--settings"
          >
            Settings
          </Link>
          <div className="dash-site-card__more" ref={menuRef}>
            <button
              type="button"
              className="dash-btn dash-btn--outline dash-btn--more"
              aria-label="More options"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <MoreHorizontal size={16} strokeWidth={1.75} />
            </button>
            {menuOpen ? (
              <div className="dash-site-card__menu" role="menu">
                <a
                  href={`/w/${website.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  role="menuitem"
                  className="dash-site-card__menu-item"
                >
                  <ExternalLink size={14} strokeWidth={1.75} aria-hidden />
                  View live site
                </a>
                <a
                  href={builderHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  role="menuitem"
                  className="dash-site-card__menu-item"
                >
                  Open builder
                </a>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
