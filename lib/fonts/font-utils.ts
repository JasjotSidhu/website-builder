import { findGoogleFont } from "./google-fonts-catalog";
import type { ThemeFontConfig } from "../types";

const FALLBACK_BY_CATEGORY = {
  "sans-serif": "system-ui, sans-serif",
  serif: "Georgia, serif",
  display: "Georgia, serif",
  monospace: "ui-monospace, monospace",
} as const;

export function normalizeFontConfig(value: unknown): ThemeFontConfig {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return { family: "Inter", googleFontId: "Inter", fallback: "sans-serif" };
    }

    const googleMatch = findGoogleFont(trimmed.replace(/['"]/g, "").split(",")[0].trim());
    if (googleMatch) {
      return {
        family: googleMatch.family,
        googleFontId: googleMatch.family,
        weights: googleMatch.weights,
        fallback: googleMatch.category === "serif" ? "serif" : "sans-serif",
      };
    }

    return { family: trimmed, fallback: "sans-serif" };
  }

  if (value && typeof value === "object" && "family" in value) {
    const font = value as ThemeFontConfig;
    const catalog = font.googleFontId ? findGoogleFont(font.googleFontId) : findGoogleFont(font.family);
    return {
      family: font.family,
      googleFontId: font.googleFontId,
      weights: font.weights ?? catalog?.weights,
      fallback: font.fallback ?? (catalog?.category === "serif" ? "serif" : "sans-serif"),
    };
  }

  return { family: "Inter", googleFontId: "Inter", weights: "400;500;600;700", fallback: "sans-serif" };
}

export function buildFontFamily(font: ThemeFontConfig): string {
  const fallback =
    font.fallback === "serif"
      ? FALLBACK_BY_CATEGORY.serif
      : font.fallback === "monospace"
        ? FALLBACK_BY_CATEGORY.monospace
        : FALLBACK_BY_CATEGORY["sans-serif"];

  if (font.family.includes(",")) {
    return font.family;
  }

  return `"${font.family}", ${fallback}`;
}

export function buildGoogleFontsUrl(fonts: ThemeFontConfig[]): string | null {
  const families = new Map<string, string>();

  for (const font of fonts) {
    if (!font.googleFontId) {
      continue;
    }

    const weights = font.weights ?? findGoogleFont(font.googleFontId)?.weights ?? "400;700";
    families.set(font.googleFontId, weights);
  }

  if (families.size === 0) {
    return null;
  }

  const query = Array.from(families.entries())
    .map(([family, weights]) => {
      const id = family.replace(/ /g, "+");
      return `family=${id}:wght@${weights}`;
    })
    .join("&");

  return `https://fonts.googleapis.com/css2?${query}&display=swap`;
}

export function fontConfigsEqual(a: ThemeFontConfig, b: ThemeFontConfig): boolean {
  return (
    a.family === b.family &&
    a.googleFontId === b.googleFontId &&
    a.weights === b.weights &&
    a.fallback === b.fallback
  );
}
