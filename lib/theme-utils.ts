import type { CSSProperties } from "react";
import { buildFontFamily, normalizeFontConfig } from "./fonts/font-utils";
import { normalizeTheme } from "./theme-defaults";
import type { ButtonStyleConfig, ThemeConfig } from "./types";

const BORDER_RADIUS_MAP: Record<ThemeConfig["borderRadius"], string> = {
  none: "0px",
  sm: "4px",
  md: "8px",
  lg: "12px",
  full: "9999px",
};

const BUTTON_RADIUS_MAP: Record<NonNullable<ButtonStyleConfig["borderRadius"]>, string> = {
  inherit: "var(--radius)",
  none: "0px",
  sm: "4px",
  md: "8px",
  lg: "12px",
  full: "9999px",
};

const CARD_RADIUS_MAP: Record<NonNullable<ThemeConfig["cards"]["borderRadius"]>, string> = {
  inherit: "var(--radius)",
  none: "0px",
  sm: "4px",
  md: "8px",
  lg: "12px",
  full: "9999px",
};

const SIZE_MAP = {
  sm: { fontSize: "0.8125rem", paddingY: "0.625rem", paddingX: "1.25rem" },
  md: { fontSize: "0.875rem", paddingY: "0.875rem", paddingX: "1.75rem" },
  lg: { fontSize: "1rem", paddingY: "1rem", paddingX: "2rem" },
} as const;

const SPACING_MAP = {
  compact: { section: "3rem", gap: "1rem" },
  comfortable: { section: "4rem", gap: "1.5rem" },
  spacious: { section: "6rem", gap: "2rem" },
} as const;

const HOVER_VARS: Record<ButtonStyleConfig["hoverEffect"], Record<string, string>> = {
  lift: {
    "--btn-hover-transform": "translateY(-2px)",
    "--btn-hover-filter": "none",
  },
  darken: {
    "--btn-hover-transform": "none",
    "--btn-hover-filter": "brightness(0.92)",
  },
  "outline-fill": {
    "--btn-hover-transform": "none",
    "--btn-hover-filter": "none",
  },
  none: {
    "--btn-hover-transform": "none",
    "--btn-hover-filter": "none",
  },
};

export function buildSectionTypographyStyle(
  settings: Record<string, unknown>,
): CSSProperties {
  const style: Record<string, string> = {};

  if (settings.headingFontInherit === false && settings.headingFont) {
    style["--section-font-heading"] = buildFontFamily(
      normalizeFontConfig(settings.headingFont),
    );
  }

  if (settings.bodyFontInherit === false && settings.bodyFont) {
    style["--section-font-body"] = buildFontFamily(normalizeFontConfig(settings.bodyFont));
  }

  return style as CSSProperties;
}

export function buildThemeCssVariables(
  theme: ThemeConfig,
  options?: { embed?: boolean },
): CSSProperties {
  const normalized = normalizeTheme(theme);
  const headingFont = normalizeFontConfig(normalized.fonts.heading);
  const bodyFont = normalizeFontConfig(normalized.fonts.body);
  const buttons = normalized.buttons;
  const cards = normalized.cards;
  const size = SIZE_MAP[buttons.fontSize];
  const padding = SIZE_MAP[buttons.padding];
  const spacing = SPACING_MAP[normalized.spacing];

  const hoverVars = HOVER_VARS[buttons.hoverEffect];

  const cssVariables = {
    "--color-primary": normalized.colors.primary,
    "--color-secondary": normalized.colors.secondary,
    "--color-background": normalized.colors.background,
    "--color-title-text": normalized.colors.titleText,
    "--color-body-text": normalized.colors.bodyText,
    "--color-card-background": cards.background,
    "--color-card-title-text": cards.titleColor,
    "--color-card-text": cards.textColor,
    "--color-card-icon": cards.iconColor,
    "--card-border-color": cards.borderColor,
    "--card-radius": CARD_RADIUS_MAP[cards.borderRadius],
    "--color-text": normalized.colors.bodyText,
    "--color-accent": normalized.colors.accent ?? normalized.colors.secondary,
    "--font-heading": buildFontFamily(headingFont),
    "--font-body": buildFontFamily(bodyFont),
    "--radius": BORDER_RADIUS_MAP[normalized.borderRadius],
    "--section-padding-default": spacing.section,
    "--content-gap-default": spacing.gap,
    "--btn-font-size": size.fontSize,
    "--btn-font-weight": String(buttons.fontWeight),
    "--btn-padding-y": padding.paddingY,
    "--btn-padding-x": padding.paddingX,
    "--btn-radius": BUTTON_RADIUS_MAP[buttons.borderRadius],
    "--btn-shadow": buttons.shadow ? "0 4px 14px rgba(0, 0, 0, 0.12)" : "none",
    "--btn-shadow-hover": buttons.shadow ? "0 8px 24px rgba(0, 0, 0, 0.16)" : "none",
    "--btn-hover-effect": buttons.hoverEffect,
    ...hoverVars,
  };

  if (options?.embed) {
    return cssVariables as CSSProperties;
  }

  return {
    ...cssVariables,
    backgroundColor: normalized.colors.background,
    color: normalized.colors.bodyText,
    fontFamily: buildFontFamily(bodyFont),
    minHeight: "100vh",
  } as CSSProperties;
}
