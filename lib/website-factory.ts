import sampleSite from "@/data/sample-site.json";
import { websiteSchema } from "@/lib/schemas";
import { normalizeSiteSections } from "@/lib/traits/normalize";
import type { WebsiteData } from "@/lib/types";

export function createWebsiteData(websiteId: string, name: string): WebsiteData {
  const parsed = websiteSchema.parse({
    ...sampleSite,
    siteId: websiteId,
    meta: {
      ...sampleSite.meta,
      name,
    },
  });

  return normalizeSiteSections(parsed as WebsiteData);
}
