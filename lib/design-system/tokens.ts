/**
 * Webeix section design tokens.
 *
 * Customer sites are themed at runtime via CSS variables (see lib/theme-utils.ts).
 * Generated sections MUST reference these variables — never hardcode brand colors.
 */

export const WEBEIX_SECTION_CSS_VARS = [
  "--color-primary",
  "--color-on-primary",
  "--color-secondary",
  "--color-background",
  "--color-title-text",
  "--color-body-text",
  "--color-accent",
  "--color-card-background",
  "--color-card-title-text",
  "--color-card-text",
  "--color-card-icon",
  "--card-border-color",
  "--card-radius",
  "--font-heading",
  "--font-body",
  "--radius",
  "--section-padding-default",
  "--content-gap-default",
  "--btn-font-size",
  "--btn-font-weight",
  "--btn-padding-y",
  "--btn-padding-x",
  "--btn-radius",
  "--btn-shadow",
  "--btn-hover-transform",
] as const;

export type WebeixSectionCssVar = (typeof WEBEIX_SECTION_CSS_VARS)[number];

/** Default reference theme — sections are designed against this, then adapt to any site theme. */
export const WEBEIX_REFERENCE_THEME = {
  colors: {
    primary: "#5B4B8A",
    secondary: "#E8A598",
    background: "#FFFBF7",
    titleText: "#2D2640",
    bodyText: "#2D2640",
    accent: "#7CB69D",
  },
  borderRadius: "md" as const,
  spacing: "comfortable" as const,
} as const;

export const TYPOGRAPHY_SCALE = {
  eyebrow: {
    className: "section-eyebrow",
    description: "Uppercase pill label above headings. Uses primary color at 10% tint.",
  },
  heading: {
    hero: "text-4xl font-bold leading-[1.1] tracking-tight @md:text-5xl @lg:text-6xl",
    section: "text-3xl font-bold tracking-tight @md:text-4xl @lg:text-[2.75rem] @lg:leading-tight",
    cta: "text-3xl font-bold tracking-tight @md:text-4xl @lg:text-5xl",
    card: "text-xl font-semibold",
  },
  body: {
    hero: "text-lg leading-relaxed opacity-90",
    section: "text-lg leading-relaxed opacity-90",
    card: "text-[15px] leading-relaxed opacity-80",
    small: "text-sm leading-relaxed opacity-75",
  },
} as const;

export const SPACING_SCALE = {
  sectionPadding: {
    sm: "2.5rem",
    md: "4rem",
    lg: "5rem",
    xl: "6rem",
  },
  container: {
    narrow: "max-w-3xl",
    default: "max-w-6xl",
    wide: "max-w-7xl",
  },
  horizontalPadding: "px-4 @sm:px-6 @lg:px-8",
  headerMarginBottom: "mb-10 @sm:mb-14",
  stackGap: {
    sm: "gap-4",
    md: "gap-6",
    lg: "gap-8",
    xl: "gap-10",
  },
} as const;

export const BORDER_RADIUS = {
  none: "0px",
  sm: "4px",
  md: "8px",
  lg: "12px",
  full: "9999px",
} as const;

export const MOTION = {
  transition: "150ms ease",
  hoverTransition: "200ms ease",
  hoverLift: "translateY(-2px)",
  reducedMotionQuery: "(prefers-reduced-motion: reduce)",
} as const;

export const ACCESSIBILITY = {
  minContrastRatio: 4.5,
  focusVisible: "outline: 2px solid var(--color-primary); outline-offset: 2px",
  touchTargetMin: "44px",
} as const;
