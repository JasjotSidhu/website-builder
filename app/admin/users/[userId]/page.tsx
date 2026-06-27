import Link from "next/link";
import { notFound } from "next/navigation";
import AdminUserRoleSelect from "@/components/admin/AdminUserRoleSelect";
import { requireAdminUser } from "@/lib/auth/admin";
import { formatDateTime } from "@/lib/format-datetime";
import { getAdminUserDetail } from "@/lib/admin-store";

export default async function AdminUserDetailPage({
  params,
}: {
  params: { userId: string };
}) {
  const admin = await requireAdminUser();
  const user = await getAdminUserDetail(params.userId);

  if (!user) {
    notFound();
  }

  return (
    <>
      <Link href="/admin/users" className="admin-back">
        ← Back to users
      </Link>

      <h1 className="admin-page-title">{user.email}</h1>
      <p className="admin-page-subtitle">{user.name ?? "No display name"}</p>

      <div className="admin-detail-grid">
        <section className="admin-card">
          <h2 className="admin-card__title">Account</h2>
          <dl className="admin-meta">
            <div>
              <dt>Email</dt>
              <dd>{user.email}</dd>
            </div>
            <div>
              <dt>Joined</dt>
              <dd suppressHydrationWarning>{formatDateTime(user.createdAt, "full")}</dd>
            </div>
            <div>
              <dt>Last active</dt>
              <dd suppressHydrationWarning>
                {user.lastActiveAt ? formatDateTime(user.lastActiveAt, "full") : "—"}
              </dd>
            </div>
            <div>
              <dt>Websites</dt>
              <dd>{user.websiteCount}</dd>
            </div>
          </dl>
        </section>

        <section className="admin-card">
          <h2 className="admin-card__title">Role</h2>
          <AdminUserRoleSelect
            userId={user.id}
            currentRole={user.role}
            disabled={admin.id === user.id}
          />
          {admin.id === user.id ? (
            <p className="admin-page-subtitle" style={{ marginTop: "0.75rem" }}>
              You cannot change your own role here.
            </p>
          ) : null}
        </section>
      </div>

      <section className="admin-card" style={{ marginTop: "1rem" }}>
        <h2 className="admin-card__title">Websites</h2>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Website</th>
                <th>Status</th>
                <th>Pages</th>
                <th>Submissions</th>
              </tr>
            </thead>
            <tbody>
              {user.websites.length === 0 ? (
                <tr>
                  <td colSpan={4} className="admin-empty">
                    No websites yet.
                  </td>
                </tr>
              ) : (
                user.websites.map((website) => (
                  <tr key={website.id}>
                    <td>
                      <Link href={`/w/${website.slug}`} target="_blank" rel="noopener noreferrer">
                        {website.name}
                      </Link>
                      <div className="admin-submission-preview">{website.slug}</div>
                    </td>
                    <td>
                      {website.publishedAt && !website.hasUnpublishedChanges ? (
                        <span className="admin-badge admin-badge--live">Live</span>
                      ) : (
                        <span className="admin-badge admin-badge--draft">Draft</span>
                      )}
                    </td>
                    <td>{website.pageCount ?? "—"}</td>
                    <td>{website.submissionCount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
