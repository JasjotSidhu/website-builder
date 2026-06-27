"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, Globe, LayoutDashboard, LayoutTemplate, UsersRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { SessionUser } from "@/lib/auth/session";

const NAV: { href: string; label: string; icon: LucideIcon; exact?: boolean }[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Users", icon: UsersRound },
  { href: "/admin/websites", label: "Websites", icon: Globe },
  { href: "/admin/templates", label: "Templates", icon: LayoutTemplate },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

interface AdminShellProps {
  user: SessionUser;
  children: React.ReactNode;
}

export default function AdminShell({ user, children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login?next=/admin");
    router.refresh();
  }

  return (
    <div className="admin">
      <div className="admin__layout">
        <aside className="admin-sidebar">
          <div className="admin-sidebar__brand">
            <span className="admin-sidebar__eyebrow">Platform</span>
            <span className="admin-sidebar__title">Webeix Admin</span>
          </div>

          <nav className="admin-sidebar__nav" aria-label="Admin">
            {NAV.map((item) => {
              const Icon = item.icon;
              const active = isActive(pathname, item.href, item.exact);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={active ? "admin-sidebar__link admin-sidebar__link--active" : "admin-sidebar__link"}
                >
                  <Icon size={18} strokeWidth={1.75} aria-hidden />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="admin-sidebar__footer">
            <Link href="/dashboard">
              <ArrowLeft size={16} strokeWidth={1.75} aria-hidden />
              <span>Back to dashboard</span>
            </Link>
          </div>
        </aside>

        <div className="admin-main">
          <header className="admin-topbar">
            <span className="admin-topbar__email">{user.email}</span>
            <button type="button" className="admin-topbar__signout" onClick={() => void handleSignOut()}>
              Sign out
            </button>
          </header>
          <div className="admin-content">{children}</div>
        </div>
      </div>
    </div>
  );
}
