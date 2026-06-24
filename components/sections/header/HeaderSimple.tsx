"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useBackgroundStyle } from "@/lib/traits/hooks";
import type { HeaderSimpleProps } from "./schema";

export { headerSimpleSchema } from "./schema";
export type { HeaderSimpleProps } from "./schema";

function Logo({ logo }: Pick<HeaderSimpleProps, "logo">) {
  if (logo.type === "image") {
    return (
      <Image
        src={logo.value}
        alt=""
        width={140}
        height={40}
        className="h-10 w-auto object-contain"
      />
    );
  }

  return (
    <span className="text-lg font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
      {logo.value}
    </span>
  );
}

export default function HeaderSimple({ logo, links, cta }: HeaderSimpleProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { containerStyle } = useBackgroundStyle();

  return (
    <header
      className="site-header sticky top-0 z-50 w-full border-b border-black/[0.06] backdrop-blur-md"
      style={{
        ...containerStyle,
        backgroundColor:
          containerStyle.backgroundColor ??
          "color-mix(in srgb, var(--color-background) 85%, transparent)",
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/">
          <Logo logo={logo} />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium transition hover:text-[var(--color-primary)]"
            >
              {link.label}
            </Link>
          ))}
          {cta ? (
            <Link
              href={cta.href}
              className="rounded-[var(--radius)] bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg hover:opacity-95"
            >
              {cta.label}
            </Link>
          ) : null}
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
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute right-0 top-0 flex h-full w-72 flex-col bg-[var(--color-background)] p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-base font-semibold">Menu</span>
              <button
                type="button"
                aria-label="Close menu"
                className="rounded-md p-2"
                onClick={() => setMenuOpen(false)}
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
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-base font-medium"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {cta ? (
                <Link
                  href={cta.href}
                  className="mt-2 rounded-[var(--radius)] bg-[var(--color-primary)] px-4 py-3 text-center text-sm font-medium text-white"
                  onClick={() => setMenuOpen(false)}
                >
                  {cta.label}
                </Link>
              ) : null}
            </nav>
          </div>
        </div>
      ) : null}
    </header>
  );
}
