"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import MarketingLogo from "@/components/marketing/MarketingLogo";
import { marketingNavLinks } from "@/lib/marketing/content";

function isLinkActive(pathname: string, href: string) {
  if (href.startsWith("mailto:") || href.includes("#")) {
    return false;
  }
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function MarketingNav() {
  const pathname = usePathname();

  return (
    <header className="wx-nav">
      <div className="wx-container wx-nav__inner">
        <MarketingLogo />

        <nav className="wx-nav__links" aria-label="Main">
          {marketingNavLinks.map((link) => {
            const active = isLinkActive(pathname, link.href);
            return (
              <Link
                key={link.label}
                href={link.href}
                className={active ? "wx-nav__link wx-nav__link--active" : "wx-nav__link"}
                aria-current={active ? "page" : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="wx-nav__actions">
          <Link href="/login" className="wx-nav__login">
            Log in
          </Link>
          <Link href="/signup" className="wx-btn wx-btn--primary">
            Build a website <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
