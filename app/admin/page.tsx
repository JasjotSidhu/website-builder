import { getPlatformStats } from "@/lib/admin-store";

export default async function AdminOverviewPage() {
  const stats = await getPlatformStats();

  return (
    <>
      <h1 className="admin-page-title">Overview</h1>
      <p className="admin-page-subtitle">Platform-wide activity across users and websites.</p>

      <div className="admin-stats">
        <article className="admin-stat">
          <p className="admin-stat__label">Users</p>
          <p className="admin-stat__value">{stats.users}</p>
          <p className="admin-stat__hint">{stats.signupsLast7Days} joined in the last 7 days</p>
        </article>

        <article className="admin-stat">
          <p className="admin-stat__label">Websites</p>
          <p className="admin-stat__value">{stats.websites}</p>
          <p className="admin-stat__hint">{stats.publishedWebsites} published</p>
        </article>
      </div>
    </>
  );
}
