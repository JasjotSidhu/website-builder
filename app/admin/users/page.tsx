import Link from "next/link";
import { USER_ROLES } from "@/lib/auth/roles";
import AdminSearchForm from "@/components/admin/AdminSearchForm";
import { formatDateTime } from "@/lib/format-datetime";
import { listAdminUsers } from "@/lib/admin-store";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  const query = searchParams?.q?.trim() ?? "";
  const users = await listAdminUsers(query);

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Users</h1>
          <p className="admin-page-subtitle">All accounts on the platform.</p>
        </div>
        <AdminSearchForm
          action="/admin/users"
          placeholder="Search by name or email…"
          defaultValue={query}
        />
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Last active</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} className="admin-empty">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <Link href={`/admin/users/${user.id}`}>{user.email}</Link>
                    {user.name ? <div className="admin-submission-preview">{user.name}</div> : null}
                  </td>
                  <td>
                    <span
                      className={
                        user.role === USER_ROLES.ADMIN
                          ? "admin-badge admin-badge--admin"
                          : "admin-badge admin-badge--user"
                      }
                    >
                      {user.role === USER_ROLES.ADMIN ? "Admin" : "User"}
                    </span>
                  </td>
                  <td suppressHydrationWarning>{formatDateTime(user.createdAt, "short")}</td>
                  <td suppressHydrationWarning>
                    {user.lastActiveAt ? formatDateTime(user.lastActiveAt, "short") : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
