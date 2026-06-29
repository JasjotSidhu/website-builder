export {
  ACCESSIBILITY,
  BORDER_RADIUS,
  MOTION,
  SPACING_SCALE,
  TYPOGRAPHY_SCALE,
  WEBEIX_REFERENCE_THEME,
  WEBEIX_SECTION_CSS_VARS,
} from "./tokens";
export type { WebeixSectionCssVar } from "./tokens";

export {
  CONTAINER_BREAKPOINTS,
  GRID_GAPS,
  GRID_PATTERNS,
  RESPONSIVE_RULES,
} from "./responsive";

export {
  SECTION_ANATOMY,
  SECTION_CATEGORIES,
  SECTION_COMPOSITION_RULES,
  SECTION_SHELL,
} from "./section-anatomy";

export {
  ANTI_PATTERNS,
  BUTTON_RULES,
  CARD_RULES,
  CTA_BANNER_RULES,
  FORM_RULES,
  IMAGE_RULES,
} from "./component-rules";

export {
  buildSectionGenerationPrompt,
  buildSectionGenerationSystemPrompt,
  buildSectionGenerationUserPrompt,
} from "./ai-context";
export type { SectionGenerationContext } from "./ai-context";
