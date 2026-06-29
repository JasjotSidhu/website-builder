export type AiIndustryId =
  | "medical"
  | "real-estate"
  | "spa-salon"
  | "photography"
  | "wedding-planner"
  | "it"
  | "logistics"
  | "life-coach"
  | "ngo"
  | "marketing"
  | "law"
  | "travel"
  | "others";

/** Section hints passed to AI when building a page */
export interface AiSuggestedSection {
  type: string;
  variant: string;
  /** Short note for the generator — what this section should do on this page */
  role: string;
}

export interface AiIndustryPageDefinition {
  id: string;
  label: string;
  slug: string;
  /** Label in site navigation (defaults to label) */
  navLabel?: string;
  required?: boolean;
  /** Plain-language purpose — used in AI prompts */
  purpose: string;
  /** Sections AI should consider for this page (may add others from the library) */
  suggestedSections: AiSuggestedSection[];
}

export interface AiIndustryDefinition {
  id: AiIndustryId;
  label: string;
  pages: AiIndustryPageDefinition[];
  recommendedPageIds: string[];
  /** When true, backend AI generation is implemented for this industry */
  generationReady: boolean;
}

/** Wizard checkbox shape (subset of page definition) */
export interface AiPageOption {
  id: string;
  label: string;
  required?: boolean;
}

export function toPageOptions(pages: AiIndustryPageDefinition[]): AiPageOption[] {
  return pages.map((page) => ({
    id: page.id,
    label: page.label,
    required: page.required,
  }));
}

export function getPageDefinition(
  industry: AiIndustryDefinition,
  pageId: string,
): AiIndustryPageDefinition | undefined {
  return industry.pages.find((page) => page.id === pageId);
}

export function getRequiredPageIds(pages: AiPageOption[]): string[] {
  return pages.filter((page) => page.required).map((page) => page.id);
}

export function normalizeSelectedPages(selected: string[], pageOptions: AiPageOption[]): string[] {
  const allowed = new Set(pageOptions.map((page) => page.id));
  const required = getRequiredPageIds(pageOptions);
  const next = selected.filter((id) => allowed.has(id));
  for (const id of required) {
    if (!next.includes(id)) {
      next.unshift(id);
    }
  }
  return next.length > 0 ? next : required;
}

export function isGenerationReadyIndustry(id: AiIndustryId | null | undefined): boolean {
  if (!id) {
    return false;
  }
  return id === "medical";
}
