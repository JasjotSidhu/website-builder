import salonTemplate from "@/data/templates/salon.json";
import { parseAndMigrateWebsiteData } from "@/lib/site-migrations";
import type { WebsiteTemplateId } from "./catalog";
import type { WebsiteData } from "@/lib/types";

const TEMPLATE_DATA: Partial<Record<Exclude<WebsiteTemplateId, "blank">, unknown>> = {
  salon: salonTemplate,
};

export function getTemplateWebsiteData(
  templateId: Exclude<WebsiteTemplateId, "blank">,
): WebsiteData {
  const template = TEMPLATE_DATA[templateId];
  if (!template) {
    throw new Error(`Unknown template: ${templateId}`);
  }

  return parseAndMigrateWebsiteData(structuredClone(template));
}
