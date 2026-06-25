import type { ThemeConfig } from "./types";

export const AUTO_TEXT_COLOR = "auto";

type ResolvableThemeColorKey = Exclude<
  keyof ThemeConfig["colors"],
  "text" | "accent" | "cardBackground" | "cardText"
>;

const THEME_COLOR_VARS: Record<string, ResolvableThemeColorKey | "accent"> = {
  "var(--color-primary)": "primary",
  "var(--color-secondary)": "secondary",
  "var(--color-background)": "background",
  "var(--color-text)": "bodyText",
  "var(--color-body-text)": "bodyText",
  "var(--color-title-text)": "titleText",
  "var(--color-accent)": "accent",
};

const CARD_COLOR_VARS: Record<string, keyof ThemeConfig["cards"]> = {
  "var(--color-card-background)": "background",
  "var(--color-card-text)": "textColor",
  "var(--color-card-title-text)": "titleColor",
  "var(--color-card-icon)": "iconColor",
  "var(--card-border-color)": "borderColor",
};

const KNOWN_BACKGROUND_HEXES = new Set(
  [
    "#fffbf7",
    "#ffffff",
    "#fafafa",
    "#fffbeb",
    "#f0fdf4",
    "#0f172a",
    "#f5f0eb",
  ],
);

const KNOWN_PRIMARY_HEXES = new Set([
  "#5b4b8a",
  "#2563eb",
  "#111827",
  "#c2410c",
  "#166534",
  "#818cf8",
]);

const LEGACY_DEFAULT_TEXT_COLORS = new Set(["#111111", "#111827", "#2d2640"]);

export function resolveThemeColor(color: string, theme: ThemeConfig): string {
  const trimmed = color.trim();
  const cardKey = CARD_COLOR_VARS[trimmed];
  if (cardKey) {
    return theme.cards[cardKey];
  }

  const themeKey = THEME_COLOR_VARS[trimmed];
  if (themeKey) {
    if (themeKey === "accent") {
      return theme.colors.accent ?? theme.colors.secondary;
    }
    return theme.colors[themeKey];
  }
  return trimmed;
}

function parseHexColor(color: string): [number, number, number] | null {
  const normalized = color.trim().toLowerCase();
  const match = normalized.match(/^#([0-9a-f]{6})$/);
  if (!match) {
    return null;
  }

  const hex = match[1];
  return [
    Number.parseInt(hex.slice(0, 2), 16),
    Number.parseInt(hex.slice(2, 4), 16),
    Number.parseInt(hex.slice(4, 6), 16),
  ];
}

function parseRgbColor(color: string): [number, number, number] | null {
  const match = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (!match) {
    return null;
  }

  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

export function parseColorToRgb(color: string): [number, number, number] | null {
  return parseHexColor(color) ?? parseRgbColor(color);
}

export function getRelativeLuminance(rgb: [number, number, number]): number {
  const channels = rgb.map((value) => {
    const channel = value / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

export function getContrastingTextColor(
  background: string,
  options?: { light?: string; dark?: string },
): string {
  const rgb = parseColorToRgb(background);
  if (!rgb) {
    return options?.dark ?? "#111827";
  }

  const luminance = getRelativeLuminance(rgb);
  return luminance > 0.45
    ? (options?.dark ?? "#111827")
    : (options?.light ?? "#f9fafb");
}

function averageHexColors(a: string, b: string): string {
  const rgbA = parseColorToRgb(a);
  const rgbB = parseColorToRgb(b);
  if (!rgbA || !rgbB) {
    return a;
  }

  const mixed = rgbA.map((value, index) => Math.round((value + rgbB[index]) / 2));
  return `#${mixed.map((value) => value.toString(16).padStart(2, "0")).join("")}`;
}

export function resolveSectionBackgroundColor(
  settings: Record<string, unknown>,
  theme: ThemeConfig,
): string {
  const type = String(settings.type ?? "solid");

  if (type === "gradient") {
    const from = resolveThemeColor(String(settings.gradientFrom ?? "#ffffff"), theme);
    const to = resolveThemeColor(String(settings.gradientTo ?? "#f0f0f0"), theme);
    return averageHexColors(from, to);
  }

  if (type === "image") {
    const overlay = resolveThemeColor(String(settings.overlayColor ?? "#000000"), theme);
    const opacity = Number(settings.overlayOpacity ?? 0.4);
    if (opacity >= 0.25) {
      return overlay;
    }
    return resolveThemeColor(String(settings.color ?? theme.colors.background), theme);
  }

  return resolveThemeColor(String(settings.color ?? theme.colors.background), theme);
}

export function resolveSectionTextColor(
  settings: Record<string, unknown>,
  theme: ThemeConfig,
): string {
  const textColor = settings.textColor;

  if (
    textColor &&
    textColor !== AUTO_TEXT_COLOR &&
    !LEGACY_DEFAULT_TEXT_COLORS.has(String(textColor).toLowerCase())
  ) {
    return resolveThemeColor(String(textColor), theme);
  }

  const background = resolveSectionBackgroundColor(settings, theme);
  return getContrastingTextColor(background);
}

export function migrateThemeBoundSectionSettings(
  settings: Record<string, unknown>,
  sectionType: string,
  variantId: string,
): Record<string, unknown> {
  const migrated = { ...settings };
  const color = String(migrated.color ?? "").toLowerCase();

  if (sectionType === "cta" && variantId === "cta-banner") {
    if (!color || KNOWN_PRIMARY_HEXES.has(color)) {
      migrated.type = migrated.type ?? "solid";
      migrated.color = "var(--color-primary)";
    }
  } else if (!color || KNOWN_BACKGROUND_HEXES.has(color)) {
    migrated.type = migrated.type ?? "solid";
    migrated.color = "var(--color-background)";
  }

  const textColor = migrated.textColor;
  if (
    !textColor ||
    textColor === AUTO_TEXT_COLOR ||
    LEGACY_DEFAULT_TEXT_COLORS.has(String(textColor).toLowerCase()) ||
    (sectionType === "cta" && String(textColor).toLowerCase() === "#ffffff")
  ) {
    migrated.textColor = AUTO_TEXT_COLOR;
  }

  return migrated;
}
