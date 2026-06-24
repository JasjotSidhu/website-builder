import type { LinkValue } from "@/lib/types";
import type { SitePageSummary } from "./SiteContext";

export interface ButtonToolbarSettings {
  variant: "primary" | "secondary";
  link: LinkValue;
  pages: SitePageSummary[];
  onVariantChange: (variant: "primary" | "secondary") => void;
  onLinkChange: (link: LinkValue) => void;
}
