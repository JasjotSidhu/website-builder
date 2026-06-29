import { ANTI_PATTERNS, BUTTON_RULES, CARD_RULES, CTA_BANNER_RULES, FORM_RULES, IMAGE_RULES } from "./component-rules";
import { RESPONSIVE_RULES } from "./responsive";
import { SECTION_ANATOMY, SECTION_COMPOSITION_RULES } from "./section-anatomy";
import { TYPOGRAPHY_SCALE, WEBEIX_REFERENCE_THEME, WEBEIX_SECTION_CSS_VARS } from "./tokens";

export interface SectionGenerationContext {
  screenshotDescription?: string;
  userPrompt?: string;
  refinementPrompt?: string;
  sectionType?: string;
}

/**
 * Builds the system prompt injected when generating a section from a screenshot + prompt.
 * Keeps AI output aligned with the Webeix section family regardless of source design.
 */
export function buildSectionGenerationSystemPrompt(): string {
  const lines: string[] = [
    "You are a Webeix section generator. Webeix is a website builder where every section must look like part of the same design family.",
    "",
    "## Core principle",
    "Match the LAYOUT and CONTENT STRUCTURE from the user's screenshot, but apply the Webeix design system for all visual styling.",
    "Never copy colors, fonts, or decorative styles from the screenshot — translate them into Webeix tokens.",
    "",
    "## Reference theme (default)",
    `Primary: ${WEBEIX_REFERENCE_THEME.colors.primary}`,
    `Background: ${WEBEIX_REFERENCE_THEME.colors.background}`,
    `Title text: ${WEBEIX_REFERENCE_THEME.colors.titleText}`,
    `Border radius: ${WEBEIX_REFERENCE_THEME.borderRadius} (8px)`,
    "",
    "## CSS variables (REQUIRED)",
    "All colors, fonts, radii, and spacing MUST use these variables:",
    ...WEBEIX_SECTION_CSS_VARS.map((v) => `- var(${v})`),
    "",
    "## Section anatomy",
    `- Shell: ${SECTION_ANATOMY.shell.component} — ${SECTION_ANATOMY.shell.description}`,
    `- Container: ${SECTION_ANATOMY.container.pattern}`,
    `- Header: ${SECTION_ANATOMY.header.component} with eyebrow, heading, subheading`,
    `- Buttons: ${SECTION_ANATOMY.actions.component} with classes ${SECTION_ANATOMY.actions.buttonClass}`,
    "",
    "## Composition rules",
    ...SECTION_COMPOSITION_RULES.map((r) => `- ${r}`),
    "",
    "## Typography",
    `- Eyebrow: class "${TYPOGRAPHY_SCALE.eyebrow.className}"`,
    `- Hero heading: ${TYPOGRAPHY_SCALE.heading.hero}`,
    `- Section heading: ${TYPOGRAPHY_SCALE.heading.section}`,
    `- Card title: ${TYPOGRAPHY_SCALE.heading.card}`,
    `- Body text: ${TYPOGRAPHY_SCALE.body.section}`,
    "",
    "## Buttons",
    ...BUTTON_RULES.rules.map((r) => `- ${r}`),
    "",
    "## Cards",
    ...CARD_RULES.rules.map((r) => `- ${r}`),
    "",
    "## Images",
    ...IMAGE_RULES.rules.map((r) => `- ${r}`),
    "",
    "## Forms",
    ...FORM_RULES.rules.map((r) => `- ${r}`),
    "",
    "## CTA banners",
    ...CTA_BANNER_RULES.rules.map((r) => `- ${r}`),
    "",
    "## Responsive (mandatory)",
    ...RESPONSIVE_RULES.map((r) => `- ${r}`),
    "",
    "## Anti-patterns (never do these)",
    ...ANTI_PATTERNS.map((r) => `- ${r}`),
    "",
    "## Output format",
    "Return a React component (TypeScript, 'use client') that:",
    "1. Uses SectionShell, SectionHeader, SectionButtons from @/components/sections/shared/",
    "2. Exports a Zod props schema (schema.ts) for all editable content fields",
    "3. Uses Tailwind with container queries (@sm, @md, @lg)",
    "4. Is fully responsive without media queries on viewport",
    "5. Registers traits: background, textColor, spacing, sectionFonts (plus grid if applicable)",
  ];

  return lines.join("\n");
}

export function buildSectionGenerationUserPrompt(ctx: SectionGenerationContext): string {
  const parts: string[] = [];

  if (ctx.sectionType) {
    parts.push(`Section type: ${ctx.sectionType}`);
  }

  if (ctx.screenshotDescription) {
    parts.push(`Screenshot layout description:\n${ctx.screenshotDescription}`);
  }

  if (ctx.userPrompt) {
    parts.push(`User request:\n${ctx.userPrompt}`);
  }

  if (ctx.refinementPrompt) {
    parts.push(`Refinement (apply on top of existing section):\n${ctx.refinementPrompt}`);
  }

  return parts.join("\n\n");
}

export function buildSectionGenerationPrompt(ctx: SectionGenerationContext = {}): {
  system: string;
  user: string;
} {
  return {
    system: buildSectionGenerationSystemPrompt(),
    user: buildSectionGenerationUserPrompt(ctx),
  };
}
