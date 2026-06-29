import type { AiIndustryId } from "@/lib/ai/industries/types";
import {
  getIndustryConfig,
  getIndustryPageOptions,
  listIndustryIds,
} from "@/lib/ai/industries/registry";
import { normalizeSelectedPages as normalizeSelectedPagesCore } from "@/lib/ai/industries/types";
export type { AiIndustryId } from "@/lib/ai/industries/types";
export {
  getIndustryConfig,
  getIndustryDefinition,
  getIndustryPageOptions,
  listIndustryIds,
  resolveIndustryPages,
} from "@/lib/ai/industries/registry";
export {
  toPageOptions,
  getPageDefinition,
  getRequiredPageIds,
  isGenerationReadyIndustry,
  normalizeSelectedPages as normalizeSelectedPagesCore,
} from "@/lib/ai/industries/types";
export { medicalIndustry } from "@/lib/ai/industries/medical";

export type {
  AiIndustryDefinition,
  AiIndustryPageDefinition,
  AiPageOption,
  AiSuggestedSection,
} from "@/lib/ai/industries/types";

export type AiColorSchemeId = "blue" | "purple" | "green" | "orange" | "pink" | "neutral";

export type AiFeatureId =
  | "contact-form"
  | "testimonials"
  | "faq"
  | "newsletter"
  | "gallery"
  | "blog"
  | "video"
  | "search"
  | "social-links"
  | "pricing";

/** @deprecated Use AiPageOption from industries/types */
export type { AiPageOption as AiWizardPageOption } from "@/lib/ai/industries/types";

export interface AiIndustryConfig {
  id: AiIndustryId;
  label: string;
  pages: import("@/lib/ai/industries/types").AiPageOption[];
  recommendedPageIds: string[];
}

export interface AiColorScheme {
  id: AiColorSchemeId;
  label: string;
  swatches: [string, string, string];
}

export interface AiFeatureOption {
  id: AiFeatureId;
  label: string;
  sectionTypes: string[];
}

export const AI_PROMPT_MAX_LENGTH = 2000;

/** Industry pills for Step 1 — derived from registry */
export const AI_INDUSTRIES: AiIndustryConfig[] = listIndustryIds().map((id) => getIndustryConfig(id));

export const AI_COLOR_SCHEMES: AiColorScheme[] = [
  { id: "blue", label: "Blue", swatches: ["#1e40af", "#3b82f6", "#93c5fd"] },
  { id: "purple", label: "Purple", swatches: ["#5b21b6", "#8b5cf6", "#c4b5fd"] },
  { id: "green", label: "Green", swatches: ["#166534", "#22c55e", "#86efac"] },
  { id: "orange", label: "Orange", swatches: ["#c2410c", "#f97316", "#fdba74"] },
  { id: "pink", label: "Pink", swatches: ["#be185d", "#ec4899", "#f9a8d4"] },
  { id: "neutral", label: "Neutral", swatches: ["#1c1733", "#6b7280", "#e5e7eb"] },
];

export const AI_FEATURES: AiFeatureOption[] = [
  { id: "contact-form", label: "Contact Form", sectionTypes: ["form"] },
  { id: "testimonials", label: "Testimonials", sectionTypes: ["testimonials"] },
  { id: "faq", label: "FAQ Section", sectionTypes: ["faq"] },
  { id: "newsletter", label: "Newsletter Signup", sectionTypes: ["form", "cta"] },
  { id: "gallery", label: "Image Gallery", sectionTypes: ["features"] },
  { id: "blog", label: "Blog", sectionTypes: ["blog"] },
  { id: "video", label: "Video Embeds", sectionTypes: ["hero", "features"] },
  { id: "search", label: "Search Functionality", sectionTypes: [] },
  { id: "social-links", label: "Social Media Links", sectionTypes: ["footer"] },
  { id: "pricing", label: "Pricing Tables", sectionTypes: ["features"] },
];

export const AI_VISION_PLACEHOLDER =
  "E.g., I want a modern website for my dental clinic with online appointment booking and patient resources.";

export function normalizeSelectedPages(
  selected: string[],
  industry: AiIndustryConfig | AiIndustryId,
): string[] {
  const pageOptions =
    typeof industry === "string" ? getIndustryPageOptions(industry) : industry.pages;
  return normalizeSelectedPagesCore(selected, pageOptions);
}
