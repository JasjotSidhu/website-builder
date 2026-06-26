import sampleSite from "@/data/sample-site.json";
import { CURRENT_SITE_SCHEMA_VERSION } from "@/lib/collections/types";
import { parseAndMigrateWebsiteData } from "@/lib/site-migrations";
import type { WebsiteData } from "@/lib/types";

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
