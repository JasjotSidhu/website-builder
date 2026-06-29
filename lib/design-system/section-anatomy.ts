/**
 * Canonical section structure for Webeix.
 *
 * All sections — hand-built or AI-generated — follow this anatomy so they
 * integrate with the builder, traits system, and theme engine.
 */

export const SECTION_SHELL = {
  component: "SectionShell",
  description: "Outer <section> with background, spacing, and text color from traits.",
  required: true,
  traits: ["background", "textColor", "spacing", "sectionFonts"],
} as const;

export const SECTION_ANATOMY = {
  shell: SECTION_SHELL,
  container: {
    pattern: "mx-auto {maxWidth} {horizontalPadding}",
    maxWidths: {
      narrow: "max-w-3xl",
      default: "max-w-6xl",
      wide: "max-w-7xl",
    },
    horizontalPadding: "px-4 @sm:px-6 @lg:px-8",
  },
  header: {
    component: "SectionHeader",
    optional: false,
    structure: ["eyebrow?", "heading", "subheading?"],
    alignments: ["center", "left"] as const,
    sizes: ["hero", "section", "cta"] as const,
  },
  content: {
    description: "Main content area below the header — grids, media, forms, etc.",
    placement: "Below header with mb-10 @sm:mb-14 spacing when header is present.",
  },
  actions: {
    component: "SectionButtons",
    optional: true,
    buttonClass: "site-button site-button--{variant}",
    variants: ["primary", "secondary", "outline", "light"] as const,
  },
} as const;

export const SECTION_CATEGORIES = {
  header: { fixed: true, description: "Site navigation — one per page, top slot." },
  hero: { fixed: false, description: "Above-the-fold intro with headline and CTA." },
  content: { fixed: false, description: "Features, FAQ, blog, forms, alternating layouts." },
  "social-proof": { fixed: false, description: "Testimonials, team, logos, stats." },
  cta: { fixed: false, description: "Conversion-focused banner near page end." },
  footer: { fixed: true, description: "Site footer — one per page, bottom slot." },
} as const;

export const SECTION_COMPOSITION_RULES = [
  "Every section starts with SectionShell — never a bare <div> or <section> without trait support.",
  "Use SectionHeader for any block with a heading + optional eyebrow + subheading.",
  "Use SectionEyebrow (via SectionHeader) for category labels — never invent new label styles.",
  "CTAs use SectionButtons with site-button classes — never custom button styling.",
  "List/grid sections use SectionDataProvider for each item to support inline editing.",
  "Content text uses EditableText in builder components; plain text in generated static HTML.",
  "Images use EditableImage with rounded-[var(--radius)] and ring-1 ring-black/10 shadow.",
  "Icons: Lucide only (stroke-based SVG), wrapped in feature-icon-wrap for tinted backgrounds.",
] as const;
