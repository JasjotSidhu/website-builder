import { cloneTheme } from "@/lib/theme-defaults";
import type { ThemePreset } from "@/lib/types";

const presets: ThemePreset[] = [
  {
    id: "atelier",
    name: "Atelier",
    builtIn: true,
    theme: cloneTheme({
      colors: {
        primary: "#5B4B8A",
        secondary: "#E8A598",
        background: "#FFFBF7",
        text: "#2D2640",
        accent: "#7CB69D",
      },
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
      buttons: {
        fontSize: "md",
        fontWeight: 600,
        padding: "md",
        borderRadius: "inherit",
        hoverEffect: "lift",
        shadow: true,
        defaultVariant: "primary",
      },
    }),
  },
  {
    id: "professional",
    name: "Professional",
    builtIn: true,
    theme: cloneTheme({
      colors: {
        primary: "#2563EB",
        secondary: "#64748B",
        background: "#FFFFFF",
        text: "#0F172A",
        accent: "#0EA5E9",
      },
      fonts: {
        heading: {
          family: "Plus Jakarta Sans",
          googleFontId: "Plus Jakarta Sans",
          weights: "600;700",
          fallback: "sans-serif",
        },
        body: {
          family: "Inter",
          googleFontId: "Inter",
          weights: "400;500;600",
          fallback: "sans-serif",
        },
      },
      borderRadius: "md",
      spacing: "comfortable",
    }),
  },
  {
    id: "minimal",
    name: "Minimal",
    builtIn: true,
    theme: cloneTheme({
      colors: {
        primary: "#111827",
        secondary: "#6B7280",
        background: "#FAFAFA",
        text: "#111827",
        accent: "#374151",
      },
      fonts: {
        heading: {
          family: "DM Sans",
          googleFontId: "DM Sans",
          weights: "500;700",
          fallback: "sans-serif",
        },
        body: {
          family: "DM Sans",
          googleFontId: "DM Sans",
          weights: "400;500",
          fallback: "sans-serif",
        },
      },
      borderRadius: "sm",
      spacing: "compact",
      buttons: {
        fontSize: "sm",
        fontWeight: 600,
        padding: "sm",
        borderRadius: "sm",
        hoverEffect: "darken",
        shadow: false,
        defaultVariant: "primary",
      },
    }),
  },
  {
    id: "warm",
    name: "Warm",
    builtIn: true,
    theme: cloneTheme({
      colors: {
        primary: "#C2410C",
        secondary: "#FDBA74",
        background: "#FFFBEB",
        text: "#431407",
        accent: "#EA580C",
      },
      fonts: {
        heading: {
          family: "Fraunces",
          googleFontId: "Fraunces",
          weights: "600;700",
          fallback: "serif",
        },
        body: {
          family: "Source Sans 3",
          googleFontId: "Source Sans 3",
          weights: "400;600",
          fallback: "sans-serif",
        },
      },
      borderRadius: "lg",
      spacing: "spacious",
    }),
  },
  {
    id: "forest",
    name: "Forest",
    builtIn: true,
    theme: cloneTheme({
      colors: {
        primary: "#166534",
        secondary: "#86EFAC",
        background: "#F0FDF4",
        text: "#14532D",
        accent: "#22C55E",
      },
      fonts: {
        heading: {
          family: "Cormorant Garamond",
          googleFontId: "Cormorant Garamond",
          weights: "600;700",
          fallback: "serif",
        },
        body: {
          family: "Nunito",
          googleFontId: "Nunito",
          weights: "400;600",
          fallback: "sans-serif",
        },
      },
      borderRadius: "md",
      spacing: "comfortable",
    }),
  },
  {
    id: "midnight",
    name: "Midnight",
    builtIn: true,
    theme: cloneTheme({
      colors: {
        primary: "#818CF8",
        secondary: "#A5B4FC",
        background: "#0F172A",
        text: "#E2E8F0",
        accent: "#38BDF8",
      },
      fonts: {
        heading: {
          family: "Sora",
          googleFontId: "Sora",
          weights: "600;700",
          fallback: "sans-serif",
        },
        body: {
          family: "Manrope",
          googleFontId: "Manrope",
          weights: "400;600",
          fallback: "sans-serif",
        },
      },
      borderRadius: "md",
      spacing: "comfortable",
      buttons: {
        fontSize: "md",
        fontWeight: 600,
        padding: "md",
        borderRadius: "full",
        hoverEffect: "lift",
        shadow: true,
        defaultVariant: "primary",
      },
    }),
  },
];

export const BUILT_IN_THEME_PRESETS = presets;

export function findBuiltInPreset(id: string): ThemePreset | undefined {
  return BUILT_IN_THEME_PRESETS.find((preset) => preset.id === id);
}
