"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import MarketingLogo from "@/components/marketing/MarketingLogo";
import { useAuthModal } from "@/components/auth/AuthModalProvider";
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
  const { openLogin, openSignup } = useAuthModal();

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
          <button type="button" className="wx-nav__login" onClick={() => openLogin()}>
            Log in
          </button>
          <button type="button" className="wx-btn wx-btn--primary" onClick={() => openSignup()}>
            Build a website <span aria-hidden>→</span>
          </button>
        </div>
      </div>
    </header>
  );
}
