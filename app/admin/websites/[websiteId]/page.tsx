import Link from "next/link";
import { notFound } from "next/navigation";
import AdminDeleteWebsiteButton from "@/components/admin/AdminDeleteWebsiteButton";
import { formatDateTime } from "@/lib/format-datetime";
import { getAdminWebsiteDetail } from "@/lib/admin-store";

export default async function AdminWebsiteDetailPage({
  params,
}: {
  params: { websiteId: string };
}) {
  const website = await getAdminWebsiteDetail(params.websiteId);

  if (!website) {
    notFound();
  }

  return (
    <>
      <Link href="/admin/websites" className="admin-back">
        ← Back to websites
      </Link>

      <h1 className="admin-page-title">{website.name}</h1>
      <p className="admin-page-subtitle">{website.slug}</p>

      <div className="admin-detail-grid">
        <section className="admin-card">
          <h2 className="admin-card__title">Details</h2>
          <dl className="admin-meta">
            <div>
              <dt>Owner</dt>
              <dd>
                <Link href={`/admin/users/${website.ownerId}`}>{website.ownerEmail}</Link>
              </dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>
                {website.publishedAt && !website.hasUnpublishedChanges ? "Live" : "Draft / unpublished changes"}
              </dd>
            </div>
            <div>
              <dt>Pages</dt>
              <dd>{website.pageCount ?? "—"}</dd>
            </div>
            <div>
              <dt>Submissions</dt>
              <dd>{website.submissionCount}</dd>
            </div>
            <div>
              <dt>Created</dt>
              <dd suppressHydrationWarning>{formatDateTime(website.createdAt, "full")}</dd>
            </div>
            <div>
              <dt>Updated</dt>
              <dd suppressHydrationWarning>{formatDateTime(website.updatedAt, "full")}</dd>
            </div>
            {website.publishedAt ? (
              <div>
                <dt>Published</dt>
                <dd suppressHydrationWarning>{formatDateTime(website.publishedAt, "full")}</dd>
              </div>
            ) : null}
          </dl>

          <div className="admin-actions">
            <a
              href={website.publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="dash-btn dash-btn--orange"
            >
              View public site
            </a>
          </div>
        </section>

        <section className="admin-card">
          <h2 className="admin-card__title">Danger zone</h2>
          <p className="admin-page-subtitle">
            Permanently delete this website and all associated form submissions.
          </p>
          <AdminDeleteWebsiteButton websiteId={website.id} websiteName={website.name} />
        </section>
      </div>
    </>
  );
}
