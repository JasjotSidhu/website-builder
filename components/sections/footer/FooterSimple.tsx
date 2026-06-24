"use client";

import Image from "next/image";
import Link from "next/link";
import { useBackgroundStyle } from "@/lib/traits/hooks";
import type { FooterSimpleProps } from "./schema";

export { footerSimpleSchema } from "./schema";
export type { FooterSimpleProps } from "./schema";

function FooterLogo({ logo }: Pick<FooterSimpleProps, "logo">) {
  if (logo.type === "image") {
    return (
      <Image
        src={logo.value}
        alt=""
        width={120}
        height={36}
        className="h-9 w-auto object-contain"
      />
    );
  }

  return (
    <span
      className="text-lg font-semibold text-[var(--color-text)]"
      style={{ fontFamily: "var(--font-heading)" }}
    >
      {logo.value}
    </span>
  );
}

export default function FooterSimple({
  logo,
  blurb,
  columns,
  copyright,
}: FooterSimpleProps) {
  const bgStyle = useBackgroundStyle();

  return (
    <footer className="border-t border-black/5 px-6 py-12" style={bgStyle}>
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <FooterLogo logo={logo} />
            <p className="mt-4 max-w-sm text-[var(--color-text)] opacity-85">{blurb}</p>
          </div>
          {columns.map((column) => (
            <div key={column.title} className="md:col-span-2">
              <p className="font-semibold text-[var(--color-text)]">{column.title}</p>
              <ul className="mt-3 space-y-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--color-text)] opacity-85 transition hover:text-[var(--color-primary)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 border-t border-black/5 pt-6">
          <p className="text-sm text-[var(--color-text)] opacity-70">{copyright}</p>
        </div>
      </div>
    </footer>
  );
}
