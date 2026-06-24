"use client";

import Link from "next/link";
import { useState } from "react";
import EditableLogo from "@/lib/editor/EditableLogo";
import EditableNavLink from "@/lib/editor/EditableNavLink";
import { useEditMode } from "@/lib/editor/EditModeContext";
import {
  SectionDataProvider,
  useSectionData,
} from "@/lib/editor/SectionDataContext";
import type { LinkValue } from "@/lib/types";
import { EditableButton } from "../shared/SectionContent";

export { headerSimpleSchema } from "./schema";
export type { HeaderSimpleProps } from "./schema";

interface HeaderLink {
  label: string;
  link: LinkValue;
}

interface HeaderCta {
  label: string;
  link: LinkValue;
  variant?: "primary" | "secondary";
}

interface HeaderLogo {
  type: "text" | "image";
  value: string;
}

function HeaderNavLinks({
  links,
  className,
  onNavigate,
}: {
  links: HeaderLink[];
  className: string;
  onNavigate?: () => void;
}) {
  const { updateField } = useSectionData();

  return (
    <>
      {links.map((link, index) => (
        <SectionDataProvider
          key={`header-link-${index}`}
          data={link as unknown as Record<string, unknown>}
          updateField={(key, value) => {
            const next = [...links];
            next[index] = { ...next[index], [key]: value };
            updateField("links", next);
          }}
          updateFields={(partial) => {
            const next = [...links];
            next[index] = { ...next[index], ...partial };
            updateField("links", next);
          }}
        >
          <EditableNavLink className={className} onNavigate={onNavigate} />
        </SectionDataProvider>
      ))}
    </>
  );
}

export default function HeaderSimple() {
  const { isEditing } = useEditMode();
  const { data, updateField } = useSectionData();
  const logo = (data.logo as HeaderLogo | undefined) ?? { type: "text", value: "" };
  const links = (data.links as HeaderLink[] | undefined) ?? [];
  const cta = data.cta as HeaderCta | undefined;
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const logoNode = (
    <SectionDataProvider
      data={logo as unknown as Record<string, unknown>}
      updateField={(key, value) => updateField("logo", { ...logo, [key]: value })}
      updateFields={(partial) => updateField("logo", { ...logo, ...partial })}
    >
      <EditableLogo />
    </SectionDataProvider>
  );

  const ctaNode = cta ? (
    <SectionDataProvider
      data={cta as unknown as Record<string, unknown>}
      updateField={(key, value) => updateField("cta", { ...cta, [key]: value })}
      updateFields={(partial) => updateField("cta", { ...cta, ...partial })}
    >
      <EditableButton appearance="header" showVariant={false} onNavigate={closeMenu} />
    </SectionDataProvider>
  ) : null;

  return (
    <header
      className="site-header sticky top-0 z-50 w-full border-b border-black/[0.06] backdrop-blur-md"
      style={{
        backgroundColor: "color-mix(in srgb, var(--color-background) 85%, transparent)",
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {isEditing ? <div className="inline-flex">{logoNode}</div> : <Link href="/">{logoNode}</Link>}

        <nav className="hidden items-center gap-8 md:flex">
          <HeaderNavLinks
            links={links}
            className="text-sm font-medium transition hover:text-[var(--color-primary)]"
          />
          {ctaNode}
        </nav>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 md:hidden"
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
        <div className="fixed inset-0 z-50 md:hidden">
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
              <HeaderNavLinks
                links={links}
                className="text-base font-medium"
                onNavigate={closeMenu}
              />
              {cta ? (
                <div className="mt-2 text-center [&_.button-item-trigger]:w-full [&_a]:block [&_a]:w-full [&_a]:px-4 [&_a]:py-3">
                  {ctaNode}
                </div>
              ) : null}
            </nav>
          </div>
        </div>
      ) : null}
    </header>
  );
}
