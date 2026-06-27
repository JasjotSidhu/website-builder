import { Mail, Pencil } from "lucide-react";
import type { WebsiteManageContext } from "@/lib/website-store";

export default function SiteOverview({ website }: { website: WebsiteManageContext }) {
  const builderHref = `/dashboard/sites/${website.id}/builder`;
  const formsHref = `/dashboard/sites/${website.id}/forms`;

  return (
    <div className="site-manage__overview">
      <div className="site-manage__stats">
        <article className="site-manage__stat-card">
          <p className="site-manage__stat-label">Visitors · 30d</p>
          <p className="site-manage__stat-value">—</p>
          <p className="site-manage__stat-hint site-manage__stat-hint--muted">Analytics coming soon</p>
        </article>

        <article className="site-manage__stat-card">
          <p className="site-manage__stat-label">Form leads</p>
          <p className="site-manage__stat-value">—</p>
          <p className="site-manage__stat-hint site-manage__stat-hint--accent">View in Forms</p>
        </article>

        <article className="site-manage__stat-card">
          <p className="site-manage__stat-label">Pages</p>
          <p className="site-manage__stat-value">{website.pageCount}</p>
          <p className="site-manage__stat-hint site-manage__stat-hint--muted">in this website</p>
        </article>
      </div>

      <section className="site-manage__section">
        <h2 className="site-manage__section-title">Quick actions</h2>
        <div className="site-manage__quick-actions">
          <a
            href={builderHref}
            target="_blank"
            rel="noopener noreferrer"
            className="site-manage__quick-card"
          >
            <span className="site-manage__quick-icon site-manage__quick-icon--edit">
              <Pencil size={20} strokeWidth={1.75} aria-hidden />
            </span>
            <span className="site-manage__quick-text">
              <strong>Edit website</strong>
              <span>Open the visual editor</span>
            </span>
          </a>

          <a href={formsHref} className="site-manage__quick-card">
            <span className="site-manage__quick-icon site-manage__quick-icon--leads">
              <Mail size={20} strokeWidth={1.75} aria-hidden />
            </span>
            <span className="site-manage__quick-text">
              <strong>View leads</strong>
              <span>View and manage form submissions</span>
            </span>
          </a>
        </div>
      </section>
    </div>
  );
}
