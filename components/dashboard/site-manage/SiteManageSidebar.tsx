"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE_MANAGE_NAV, type SiteManageNavId } from "./site-manage-nav";

function resolveActiveNav(pathname: string, websiteId: string): SiteManageNavId {
  const base = `/dashboard/sites/${websiteId}`;

  if (pathname === base) {
    return "overview";
  }

  for (const item of SITE_MANAGE_NAV) {
    if (item.id === "overview") {
      continue;
    }

    if (pathname.startsWith(item.href(websiteId))) {
      return item.id;
    }
  }

  return "overview";
}

export default function SiteManageSidebar({ websiteId }: { websiteId: string }) {
  const pathname = usePathname();
  const active = resolveActiveNav(pathname, websiteId);

  return (
    <>
      <nav className="site-manage__mobile-nav" aria-label="Site management">
        {SITE_MANAGE_NAV.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;

          return (
            <Link
              key={item.id}
              href={item.soon ? "#" : item.href(websiteId)}
              className={`site-manage__mobile-link${isActive ? " site-manage__mobile-link--active" : ""}`}
              aria-current={isActive ? "page" : undefined}
              onClick={item.soon ? (event) => event.preventDefault() : undefined}
            >
              <Icon size={16} strokeWidth={1.75} aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <aside className="site-manage__sidebar">
      <p className="site-manage__sidebar-label">Manage site</p>
      <nav className="site-manage__nav" aria-label="Site management">
        {SITE_MANAGE_NAV.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;

          return (
            <Link
              key={item.id}
              href={item.soon ? "#" : item.href(websiteId)}
              className={`site-manage__nav-link${isActive ? " site-manage__nav-link--active" : ""}${item.soon ? " site-manage__nav-link--disabled" : ""}`}
              aria-current={isActive ? "page" : undefined}
              onClick={item.soon ? (event) => event.preventDefault() : undefined}
            >
              <Icon size={18} strokeWidth={1.75} aria-hidden />
              <span>{item.label}</span>
              {item.soon ? <span className="site-manage__soon">Soon</span> : null}
            </Link>
          );
        })}
      </nav>
      </aside>
    </>
  );
}
