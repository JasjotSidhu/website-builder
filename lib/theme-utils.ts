import type { CSSProperties } from "react";
import type { ThemeConfig } from "./types";

const BORDER_RADIUS_MAP: Record<ThemeConfig["borderRadius"], string> = {
  none: "0px",
  sm: "4px",
  md: "8px",
  lg: "12px",
  full: "9999px",
};

export function buildThemeCssVariables(theme: ThemeConfig): CSSProperties {
  return {
    "--color-primary": theme.colors.primary,
    "--color-secondary": theme.colors.secondary,
    "--color-background": theme.colors.background,
    "--color-text": theme.colors.text,
    "--color-accent": theme.colors.accent ?? theme.colors.secondary,
    "--font-heading": theme.fonts.heading,
    "--font-body": theme.fonts.body,
    "--radius": BORDER_RADIUS_MAP[theme.borderRadius],
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
    fontFamily: theme.fonts.body,
    minHeight: "100vh",
  } as CSSProperties;
}
