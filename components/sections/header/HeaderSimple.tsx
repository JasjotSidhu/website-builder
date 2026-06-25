"use client";

import Link from "next/link";
import { useState } from "react";
import EditableNavLinksList from "@/lib/editor/EditableNavLinksList";
import { useSectionData } from "@/lib/editor/SectionDataContext";
import { useSitePages } from "@/lib/editor/SiteContext";
import { resolveLink } from "@/lib/links";
import type { LinkValue } from "@/lib/types";

export { headerSimpleSchema } from "./schema";
export type { HeaderSimpleProps } from "./schema";

interface HeaderCtaItem {
  id: string;
  label: string;
  link: LinkValue;
  variant?: "primary" | "secondary";
}

interface HeaderLogoImage {
  type: "image";
  value: string;
}

export default function HeaderSimple() {
  const { data } = useSectionData();
  const pages = useSitePages();
  const logo = (data.logo as HeaderLogoImage | undefined) ?? { type: "image", value: "" };
  const ctas = ((data.ctas as HeaderCtaItem[] | undefined) ?? []).filter(
    (cta) => cta && typeof cta.label === "string",
  );
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header
      className="site-header sticky top-0 z-50 w-full border-b border-black/[0.06] backdrop-blur-md"
      style={{
        backgroundColor: "color-mix(in srgb, var(--color-background) 85%, transparent)",
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/">
          {logo.value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo.value} alt="Site logo" className="h-10 w-auto object-contain" />
          ) : (
            <div className="rounded border border-dashed border-gray-300 px-3 py-2 text-xs text-gray-500">
              Upload logo
            </div>
          )}
        </Link>

        <nav className="hidden items-center gap-8 @md:flex">
          <EditableNavLinksList editMode="never" />
          {ctas.map((cta) => {
            const href = resolveLink(cta.link, pages);
            return (
              <a key={cta.id} href={href} className="rounded-[var(--radius)] bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg hover:opacity-95">
                {cta.label}
              </a>
            );
          })}
        </nav>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 @md:hidden"
          aria-label="Open navigation menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M4 7h16M4 12h16M4 17h16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {menuOpen ? (
        <div className="fixed inset-0 z-50 @md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close navigation menu"
            onClick={closeMenu}
          />
          <div className="absolute right-0 top-0 flex h-full w-72 flex-col bg-[var(--color-background)] p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-base font-semibold">Menu</span>
              <button
                type="button"
                aria-label="Close menu"
                className="rounded-md p-2"
                onClick={closeMenu}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
            <nav className="flex flex-col gap-4">
              <EditableNavLinksList layout="column" onNavigate={closeMenu} editMode="never" />
              {ctas.length > 0 ? (
                <div className="mt-2 flex flex-col gap-2">
                  {ctas.map((cta) => {
                    const href = resolveLink(cta.link, pages);
                    return (
                      <a
                        key={cta.id}
                        href={href}
                        className="block rounded-md bg-[var(--color-primary)] px-4 py-3 text-center text-sm font-semibold text-white"
                        onClick={closeMenu}
                      >
                        {cta.label}
                      </a>
                    );
                  })}
                </div>
              ) : null}
            </nav>
          </div>
        </div>
      ) : null}
    </header>
  );
}
