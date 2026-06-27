import type { WebsiteData } from "@/lib/types";

export type WebsiteTemplateId = "blank" | "salon";

export interface WebsiteTemplateCatalogItem {
  id: WebsiteTemplateId;
  name: string;
  description: string;
}

export const WEBSITE_TEMPLATE_CATALOG: WebsiteTemplateCatalogItem[] = [
  {
    id: "blank",
    name: "Blank",
    description: "Start with a minimal layout and add your own sections.",
  },
  {
    id: "salon",
    name: "Salon & spa",
    description: "Booking and contact forms for hair, beauty, and wellness businesses.",
  },
];

export function isWebsiteTemplateId(value: string): value is WebsiteTemplateId {
  return value === "blank" || value === "salon";
}
