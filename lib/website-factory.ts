import sampleSite from "@/data/sample-site.json";
import { CURRENT_SITE_SCHEMA_VERSION } from "@/lib/collections/types";
import { parseAndMigrateWebsiteData } from "@/lib/site-migrations";
import type { WebsiteData } from "@/lib/types";
import type { WebsiteTemplateId } from "@/lib/templates/catalog";
import { hydrateTemplateForNewSite } from "@/lib/templates/hydrate-template";
import { getTemplateWebsiteData } from "@/lib/templates/load-template";

export function createWebsiteData(websiteId: string, name: string): WebsiteData {
  return parseAndMigrateWebsiteData({
    ...sampleSite,
    siteId: websiteId,
    schemaVersion: CURRENT_SITE_SCHEMA_VERSION,
    collections: {},
    meta: {
      ...sampleSite.meta,
      name,
    },
  });
}

export function createWebsiteFromTemplate(
  websiteId: string,
  name: string,
  templateId: Exclude<WebsiteTemplateId, "blank">,
): WebsiteData {
  const template = getTemplateWebsiteData(templateId);
  return hydrateTemplateForNewSite(template, websiteId, name);
}
