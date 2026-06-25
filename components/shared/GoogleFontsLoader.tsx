"use client";

import { buildGoogleFontsUrl, normalizeFontConfig } from "@/lib/fonts/font-utils";
import type { ThemeFontConfig } from "@/lib/types";

export default function GoogleFontsLoader({ fonts }: { fonts: ThemeFontConfig[] }) {
  const normalized = fonts.map((font) => normalizeFontConfig(font));
  const href = buildGoogleFontsUrl(normalized);

  if (!href) {
    return null;
  }

  return <link rel="stylesheet" href={href} />;
}
