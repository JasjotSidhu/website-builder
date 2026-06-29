/**
 * Component-level design rules for Webeix sections.
 */

export const BUTTON_RULES = {
  baseClass: "site-button",
  variants: {
    primary: "site-button--primary",
    secondary: "site-button--secondary",
    outline: "site-button--outline",
    light: "site-button--light",
  },
  rules: [
    "Always use site-button + variant class — never inline background/color on buttons.",
    "Primary CTA per section; secondary/outline for supporting actions.",
    "Hover: inherit from theme (--btn-hover-transform, typically translateY(-2px)).",
    "Border-radius from --btn-radius (inherits --radius by default).",
    "Max 2 visible CTAs per section block; wrap with flex flex-wrap gap-4.",
  ],
} as const;

export const CARD_RULES = {
  baseClass: "feature-card",
  iconWrapClass: "feature-icon-wrap",
  rules: [
    "Cards use feature-card class: themed background, border, radius, hover lift.",
    "Card titles use themeTextRole='cardTitle'; body text uses themeTextRole='card'.",
    "Icon containers use feature-icon-wrap with 10% primary tint background.",
    "Padding: 1.75rem internal. Border: 1px solid var(--card-border-color).",
    "Hover: translateY(-2px) + elevated shadow — do not add custom hover animations.",
    "Never hardcode card background (#fff) — use var(--color-card-background).",
  ],
} as const;

export const IMAGE_RULES = {
  rules: [
    "Hero images: aspect-[16/9], rounded-[var(--radius)], shadow-2xl, ring-1 ring-black/10.",
    "Optional glow: absolute blur behind image using var(--color-primary) at 40% opacity.",
    "Team/portrait: aspect-square or aspect-[3/4], object-cover, rounded-[var(--radius)].",
    "Background images: via trait system (background.type = image), not inline on content.",
    "Always include meaningful alt text prop.",
  ],
} as const;

export const FORM_RULES = {
  rules: [
    "Inputs: border border-gray-200 rounded-[var(--radius)] px-4 py-3, focus ring primary.",
    "Labels: text-sm font-medium, color var(--color-title-text).",
    "Submit button: site-button site-button--primary, full-width on mobile.",
    "Form container: max-w-xl mx-auto within section.",
  ],
} as const;

export const CTA_BANNER_RULES = {
  className: "cta-banner",
  rules: [
    "CTA sections add cta-banner class to SectionShell for inverted/light text.",
    "Use SectionHeader with size='cta' and SectionEyebrow light variant.",
    "Background: typically primary gradient or solid via traits — not hardcoded.",
    "Subtle radial gradient overlay for depth (white at 10-15% opacity).",
    "Single primary button; maxButtons=1.",
  ],
} as const;

export const ANTI_PATTERNS = [
  "Hardcoded hex colors for primary, background, or text (use CSS variables).",
  "Custom font families outside theme (--font-heading, --font-body).",
  "Emojis as icons — use Lucide SVG icons only.",
  "Viewport breakpoints (md:flex) instead of container queries (@md:flex).",
  "Excessive animation, parallax, or auto-playing media.",
  "Dark mode overrides — sections inherit site theme; no prefers-color-scheme hacks.",
  "Fixed pixel widths on containers (use max-w-* + mx-auto).",
  "Box shadows with hardcoded brand colors — use neutral rgba shadows.",
  "More than 6 grid columns or items without responsive collapse.",
  "Custom button shapes (always inherit --btn-radius from theme).",
] as const;
