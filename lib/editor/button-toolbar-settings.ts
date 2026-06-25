import type { LinkValue } from "@/lib/types";
import type { SitePageSummary } from "./SiteContext";

export type ButtonToolbarVariant = "primary" | "secondary" | "outline" | "light";

export interface ButtonToolbarSettings {
  variant: ButtonToolbarVariant;
  link: LinkValue;
  pages: SitePageSummary[];
  onVariantChange: (variant: ButtonToolbarVariant) => void;
  onLinkChange: (link: LinkValue) => void;
  showVariant?: boolean;
}
