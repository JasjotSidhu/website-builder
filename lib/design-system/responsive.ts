/**
 * Responsive rules for Webeix sections.
 *
 * Sections use Tailwind container queries (@sm, @md, @lg) scoped to
 * `.site-theme-root` / `@container` — NOT viewport breakpoints.
 */

export const CONTAINER_BREAKPOINTS = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
} as const;

/** Standard grid column patterns used across section types. */
export const GRID_PATTERNS = {
  1: "grid-cols-1",
  2: "grid-cols-1 @sm:grid-cols-2",
  3: "grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-3",
  4: "grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-4",
  5: "grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-5",
  6: "grid-cols-1 @sm:grid-cols-2 @md:grid-cols-3 @lg:grid-cols-6",
} as const;

export const GRID_GAPS = {
  sm: "gap-4",
  md: "gap-4 @md:gap-6",
  lg: "gap-4 @md:gap-6 @lg:gap-10",
} as const;

export const RESPONSIVE_RULES = [
  "Wrap every section in a container with @container site-theme-root classes.",
  "Use container queries (@sm, @md, @lg) for layout — not viewport breakpoints (sm:, md:, lg:).",
  "Mobile-first: single column by default, expand columns at @sm / @lg.",
  "Horizontal padding: px-4 @sm:px-6 @lg:px-8 on inner containers.",
  "Images: use aspect-ratio classes (aspect-video, aspect-square) and object-cover.",
  "Text: hero headings scale from text-4xl → @md:text-5xl → @lg:text-6xl.",
  "Buttons: flex-wrap with gap-4; stack vertically only when space is tight.",
  "Test at container widths: 375px (mobile), 768px (tablet), 1024px+ (desktop).",
] as const;
