"use client";

import { useEffect, useRef, useState } from "react";
import { MoreHorizontal, Plus, Search } from "lucide-react";
import type { SessionUser } from "@/lib/auth/session";
import type { WebsiteSummary } from "@/lib/website-store";
import CreateWebsiteCard from "./CreateWebsiteCard";
import DashboardNav from "./DashboardNav";
import WebsiteCard from "./WebsiteCard";

export type DashboardFilter = "all" | "live" | "drafts" | "medical" | "real-estate";

interface DashboardViewProps {
  user: SessionUser;
  websites: WebsiteSummary[];
}

function countStats(websites: WebsiteSummary[]) {
  const live = websites.filter((w) => w.publishedAt && !w.hasUnpublishedChanges).length;
  const drafts = websites.length - live;
  return { total: websites.length, live, drafts };
}

function matchesFilter(website: WebsiteSummary, filter: DashboardFilter): boolean {
  const isLive = Boolean(website.publishedAt && !website.hasUnpublishedChanges);
  const isDraft = !isLive;

  switch (filter) {
    case "live":
      return isLive;
    case "drafts":
      return isDraft;
    case "medical":
    case "real-estate":
      return false;
    default:
      return true;
  }
}

const FILTERS: { id: DashboardFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "live", label: "Live" },
  { id: "drafts", label: "Drafts" },
  { id: "medical", label: "Medical" },
  { id: "real-estate", label: "Real Estate" },
];

export default function DashboardView({ user, websites }: DashboardViewProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<DashboardFilter>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const createTriggerRef = useRef<HTMLButtonElement>(null);

  const stats = countStats(websites);
  const normalizedQuery = query.trim().toLowerCase();

  const filteredWebsites = websites.filter((website) => {
    if (!matchesFilter(website, filter)) {
      return false;
    }
    if (!normalizedQuery) {
      return true;
    }
    return (
      website.name.toLowerCase().includes(normalizedQuery) ||
      website.slug.toLowerCase().includes(normalizedQuery)
    );
  });

  useEffect(() => {
    if (!createOpen) {
      createTriggerRef.current?.focus();
    }
  }, [createOpen]);

  return (
    <div className="dash">
      <DashboardNav
        user={user}
        onNewWebsite={() => setCreateOpen(true)}
      />

      <main className="dash__main">
        <div className="dash__container">
          <div className="dash__toolbar">
            <div className="dash__heading-block">
              <h1 className="dash__title">Your websites</h1>
              <p className="dash__stats-line">
                {stats.total} {stats.total === 1 ? "site" : "sites"} · {stats.live} live · {stats.drafts}{" "}
                {stats.drafts === 1 ? "draft" : "drafts"}
              </p>
            </div>

            <label className="dash__search">
              <Search size={18} strokeWidth={1.75} aria-hidden />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search websites..."
                aria-label="Search websites"
              />
            </label>
          </div>

          <div className="dash__filters" role="tablist" aria-label="Filter websites">
            {FILTERS.map((entry) => (
              <button
                key={entry.id}
                type="button"
                role="tab"
                aria-selected={filter === entry.id}
                className={`dash-filter-chip${filter === entry.id ? " dash-filter-chip--active" : ""}`}
                onClick={() => setFilter(entry.id)}
              >
                {entry.label}
              </button>
            ))}
          </div>

          <ul className="dash-grid">
            <li>
              <CreateWebsiteCard
                open={createOpen}
                onOpen={() => setCreateOpen(true)}
                onClose={() => setCreateOpen(false)}
                triggerRef={createTriggerRef}
              />
            </li>
            {filteredWebsites.map((website) => (
              <li key={website.id}>
                <WebsiteCard website={website} />
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
