"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { USER_ROLES } from "@/lib/auth/roles";
import { useEffect, useRef, useState } from "react";
import type { SessionUser } from "@/lib/auth/session";
import WebeixLogo from "./WebeixLogo";

interface DashboardNavProps {
  user: SessionUser;
  onNewWebsite: () => void;
}

function userInitial(user: SessionUser): string {
  const source = user.name?.trim() || user.email;
  return source.charAt(0).toUpperCase();
}

export default function DashboardNav({ user, onNewWebsite }: DashboardNavProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <header className="dash-nav">
      <div className="dash-nav__inner">
        <div className="dash-nav__left">
          <WebeixLogo />
          <nav className="dash-nav__links" aria-label="Main">
            <a href="/dashboard" className="dash-nav__link dash-nav__link--active">
              My Websites
            </a>
            <a href="#" className="dash-nav__link" onClick={(event) => event.preventDefault()}>
              Templates
            </a>
            <a href="#" className="dash-nav__link" onClick={(event) => event.preventDefault()}>
              Pricing
            </a>
            <a href="#" className="dash-nav__link" onClick={(event) => event.preventDefault()}>
              Help
            </a>
          </nav>
        </div>

        <div className="dash-nav__right">
          <button type="button" className="dash-btn dash-btn--orange" onClick={onNewWebsite}>
            + New website
          </button>

          <div className="dash-nav__avatar-wrap" ref={menuRef}>
            <button
              type="button"
              className="dash-nav__avatar"
              aria-label="Account menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {userInitial(user)}
            </button>
            {menuOpen ? (
              <div className="dash-nav__menu" role="menu">
                <p className="dash-nav__menu-email">{user.email}</p>
                {user.role === USER_ROLES.ADMIN ? (
                  <Link href="/admin" role="menuitem" className="dash-nav__menu-item" onClick={() => setMenuOpen(false)}>
                    Admin panel
                  </Link>
                ) : null}
                <button type="button" role="menuitem" className="dash-nav__menu-item" onClick={() => void handleLogout()}>
                  Sign out
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
