import type { WebsiteManageContext } from "@/lib/website-store";

function publicHost(slug: string): string {
  return `${slug}.webeix.site`;
}

export default function SiteSettingsPage({ website }: { website: WebsiteManageContext }) {
  return (
    <div className="site-manage__settings">
      <section className="site-manage__settings-card">
        <h2 className="site-manage__settings-title">General</h2>
        <dl className="site-manage__settings-list">
          <div className="site-manage__settings-row">
            <dt>Site name</dt>
            <dd>{website.name}</dd>
          </div>
          <div className="site-manage__settings-row">
            <dt>URL slug</dt>
            <dd>{website.slug}</dd>
          </div>
          <div className="site-manage__settings-row">
            <dt>Public address</dt>
            <dd>{publicHost(website.slug)}</dd>
          </div>
          <div className="site-manage__settings-row">
            <dt>Pages</dt>
            <dd>{website.pageCount}</dd>
          </div>
        </dl>
        <p className="site-manage__settings-note">
          To change site name, SEO, or pages, open the visual editor.
        </p>
        <a
          href={`/dashboard/sites/${website.id}/builder`}
          target="_blank"
          rel="noopener noreferrer"
          className="dash-btn dash-btn--orange"
        >
          Open editor
        </a>
      </section>
    </div>
  );
}
