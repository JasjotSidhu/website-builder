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
    <span className="text-lg font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
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
  const { containerStyle, overlayStyle } = useBackgroundStyle();

  return (
    <footer
      className="site-footer relative border-t border-black/[0.06] px-6 py-16"
      style={containerStyle}
    >
      {overlayStyle ? <div style={overlayStyle} /> : null}
      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <FooterLogo logo={logo} />
            <p className="mt-5 max-w-sm text-[15px] leading-relaxed opacity-70">{blurb}</p>
          </div>
          {columns.map((column) => (
            <div key={column.title} className="md:col-span-2">
              <p className="text-sm font-semibold uppercase tracking-wider opacity-50">
                {column.title}
              </p>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm opacity-85 transition hover:text-[var(--color-primary)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t border-black/[0.06] pt-8">
          <p className="text-sm opacity-50">{copyright}</p>
        </div>
      </div>
    </footer>
  );
}
