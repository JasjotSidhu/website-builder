import "../admin.css";
import AdminShell from "@/components/admin/AdminShell";
import { requireAdminUser } from "@/lib/auth/admin";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdminUser();
  return <AdminShell user={user}>{children}</AdminShell>;
}
