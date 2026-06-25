import { normalizeFontConfig } from "./fonts/font-utils";
import { normalizeButtonVariant } from "./button-styles";
import { getContrastingTextColor, getRelativeLuminance, parseColorToRgb } from "./theme-color-utils";
import type { ButtonStyleConfig, CardStyleConfig, ThemeConfig } from "./types";

export const DEFAULT_BUTTON_STYLE: ButtonStyleConfig = {
  fontSize: "md",
  fontWeight: 600,
  padding: "md",
  borderRadius: "inherit",
  hoverEffect: "lift",
  shadow: true,
  defaultVariant: "primary",
};

export const DEFAULT_CARD_STYLE: CardStyleConfig = {
  background: "#FFFFFF",
  titleColor: "#2D2640",
  textColor: "#374151",
  borderRadius: "inherit",
  borderColor: "#E5E7EB",
  iconColor: "#5B4B8A",
};

const DEFAULT_COLORS: ThemeConfig["colors"] = {
  primary: "#5B4B8A",
  secondary: "#E8A598",
  background: "#FFFBF7",
  titleText: "#2D2640",
  bodyText: "#2D2640",
  accent: "#7CB69D",
};

type ThemeColorsInput = Partial<ThemeConfig["colors"]> & { text?: string };

export function normalizeThemeColors(
  colors: ThemeColorsInput | undefined,
): ThemeConfig["colors"] {
  const input = colors ?? {};
  const background = input.background ?? DEFAULT_COLORS.background;
  const legacyText = input.text;
  const bodyText = input.bodyText ?? legacyText ?? DEFAULT_COLORS.bodyText;
  const titleText = input.titleText ?? legacyText ?? DEFAULT_COLORS.titleText;

  return {
    primary: input.primary ?? DEFAULT_COLORS.primary,
    secondary: input.secondary ?? DEFAULT_COLORS.secondary,
    background,
    titleText,
    bodyText,
    accent: input.accent ?? DEFAULT_COLORS.accent,
    text: bodyText,
    cardBackground: input.cardBackground,
    cardText: input.cardText,
  };
}

type ThemeCardsInput = Partial<CardStyleConfig>;

export function normalizeThemeCards(
  cards: ThemeCardsInput | undefined,
  colors?: ThemeColorsInput,
): CardStyleConfig {
  const input = cards ?? {};
  const normalizedColors = normalizeThemeColors(colors);
  const background = input.background ?? colors?.cardBackground;

  let resolvedBackground = background;
  if (!resolvedBackground) {
    const bgRgb = parseColorToRgb(normalizedColors.background);
    resolvedBackground =
      bgRgb && getRelativeLuminance(bgRgb) < 0.45 ? "#1E293B" : DEFAULT_CARD_STYLE.background;
  }

  const textColor =
    input.textColor ??
    colors?.cardText ??
    (resolvedBackground === DEFAULT_CARD_STYLE.background
      ? DEFAULT_CARD_STYLE.textColor
      : getContrastingTextColor(resolvedBackground));

  const titleColor =
    input.titleColor ??
    (resolvedBackground === DEFAULT_CARD_STYLE.background
      ? normalizedColors.titleText
      : getContrastingTextColor(resolvedBackground));

  return {
    background: resolvedBackground,
    titleColor,
    textColor,
    borderRadius: input.borderRadius ?? DEFAULT_CARD_STYLE.borderRadius,
    borderColor: input.borderColor ?? DEFAULT_CARD_STYLE.borderColor,
    iconColor: input.iconColor ?? normalizedColors.primary ?? DEFAULT_CARD_STYLE.iconColor,
  };
}

export const DEFAULT_THEME: ThemeConfig = {
  colors: DEFAULT_COLORS,
  fonts: {
    heading: {
      family: "Playfair Display",
      googleFontId: "Playfair Display",
      weights: "400;600;700",
      fallback: "serif",
    },
    body: {
      family: "Inter",
      googleFontId: "Inter",
      weights: "400;500;600;700",
      fallback: "sans-serif",
    },
  },
  borderRadius: "md",
  spacing: "comfortable",
  buttons: DEFAULT_BUTTON_STYLE,
  cards: DEFAULT_CARD_STYLE,
};

export function normalizeTheme(theme: Partial<ThemeConfig> | Record<string, unknown>): ThemeConfig {
  const partial = theme as Partial<Omit<ThemeConfig, "colors" | "cards">> & {
    colors?: ThemeColorsInput;
    cards?: ThemeCardsInput;
  };
  const colors = normalizeThemeColors(partial.colors);

  return {
    ...DEFAULT_THEME,
    ...partial,
    colors,
    cards: normalizeThemeCards(partial.cards, partial.colors ?? colors),
    fonts: {
      heading: normalizeFontConfig(partial.fonts?.heading ?? DEFAULT_THEME.fonts.heading),
      body: normalizeFontConfig(partial.fonts?.body ?? DEFAULT_THEME.fonts.body),
    },
    borderRadius: partial.borderRadius ?? DEFAULT_THEME.borderRadius,
    spacing: partial.spacing ?? DEFAULT_THEME.spacing,
    buttons: {
      ...DEFAULT_BUTTON_STYLE,
      ...partial.buttons,
      defaultVariant: normalizeButtonVariant(partial.buttons?.defaultVariant ?? DEFAULT_BUTTON_STYLE.defaultVariant),
    },
  };
}

export function cloneTheme(
  theme: Partial<Omit<ThemeConfig, "colors" | "cards">> & {
    colors?: ThemeColorsInput;
    cards?: ThemeCardsInput;
  },
): ThemeConfig {
  const colors = normalizeThemeColors(theme.colors);

  return normalizeTheme({
    ...DEFAULT_THEME,
    ...theme,
    colors,
    cards: normalizeThemeCards(theme.cards, theme.colors ?? colors),
    fonts: {
      heading: theme.fonts?.heading ?? DEFAULT_THEME.fonts.heading,
      body: theme.fonts?.body ?? DEFAULT_THEME.fonts.body,
    },
    buttons: {
      ...DEFAULT_BUTTON_STYLE,
      ...theme.buttons,
      defaultVariant: normalizeButtonVariant(
        theme.buttons?.defaultVariant ?? DEFAULT_BUTTON_STYLE.defaultVariant,
      ),
    },
  });
}
