import { CURRENT_SITE_SCHEMA_VERSION } from "@/lib/collections/types";
import { parseAndMigrateWebsiteData } from "@/lib/site-migrations";
import type { WebsiteData } from "@/lib/types";

function nowIso() {
  return new Date().toISOString();
}

export function hydrateTemplateForNewSite(
  template: WebsiteData,
  websiteId: string,
  name: string,
): WebsiteData {
  const now = nowIso();
  const collections = template.collections
    ? Object.fromEntries(
        Object.entries(template.collections).map(([id, collection]) => [
          id,
          {
            ...collection,
            createdAt: now,
            updatedAt: now,
            items: collection.items.map((item) => ({
              ...item,
              createdAt: now,
              updatedAt: now,
            })),
          },
        ]),
      )
    : undefined;

  return parseAndMigrateWebsiteData({
    ...template,
    siteId: websiteId,
    schemaVersion: CURRENT_SITE_SCHEMA_VERSION,
    meta: {
      ...template.meta,
      name,
      seo: {
        ...template.meta.seo,
        title: name,
      },
    },
    navigation: {
      ...template.navigation,
      logo: {
        ...template.navigation.logo,
        value: name,
      },
    },
    footer: {
      ...template.footer,
      props: {
        ...template.footer.props,
        logo: {
          ...(template.footer.props.logo as { type: string; value: string }),
          value: name,
        },
      },
    },
    collections: collections as WebsiteData["collections"],
  });
}
