import Link from "next/link";
import AdminSearchForm from "@/components/admin/AdminSearchForm";
import AdminWebsiteActions from "@/components/admin/AdminWebsiteActions";
import AdminWebsitePlanTags from "@/components/admin/AdminWebsitePlanTags";
import { getPlaceholderWebsitePlan } from "@/lib/admin-plan-placeholder";
import { formatDateTime } from "@/lib/format-datetime";
import { listAdminWebsites } from "@/lib/admin-store";

export default async function AdminWebsitesPage({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  const query = searchParams?.q?.trim() ?? "";
  const websites = await listAdminWebsites(query);

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Websites</h1>
          <p className="admin-page-subtitle">All websites across the platform.</p>
        </div>
        <AdminSearchForm
          action="/admin/websites"
          placeholder="Search by site, slug, or owner email…"
          defaultValue={query}
        />
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Website</th>
              <th>Owner</th>
              <th>Status</th>
              <th>Plan</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {websites.length === 0 ? (
              <tr>
                <td colSpan={6} className="admin-empty">
                  No websites found.
                </td>
              </tr>
            ) : (
              websites.map((website, index) => {
                const plan = getPlaceholderWebsitePlan(index);

                return (
                  <tr key={website.id}>
                    <td>
                      <Link href={`/w/${website.slug}`} target="_blank" rel="noopener noreferrer">
                        {website.name}
                      </Link>
                      <div className="admin-submission-preview">{website.slug}</div>
                    </td>
                    <td>
                      <Link href={`/admin/users/${website.ownerId}`}>{website.ownerEmail}</Link>
                    </td>
                    <td>
                      {website.publishedAt && !website.hasUnpublishedChanges ? (
                        <span className="admin-badge admin-badge--live">Live</span>
                      ) : (
                        <span className="admin-badge admin-badge--draft">Draft</span>
                      )}
                    </td>
                    <td>
                      <AdminWebsitePlanTags plan={plan} />
                    </td>
                    <td suppressHydrationWarning>{formatDateTime(website.updatedAt, "short")}</td>
                    <td>
                      <AdminWebsiteActions websiteId={website.id} websiteName={website.name} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
