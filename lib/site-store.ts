import sampleSite from "@/data/sample-site.json";
import { prisma } from "@/lib/db";
import { websiteSchema } from "@/lib/schemas";
import { normalizeSiteSections } from "@/lib/traits/normalize";
import type { WebsiteData } from "@/lib/types";

function parseSiteData(raw: string): WebsiteData {
  const parsed = websiteSchema.parse(JSON.parse(raw));
  return normalizeSiteSections(parsed as WebsiteData);
}

export async function getOrCreateSiteRow() {
  let site = await prisma.site.findFirst();
  if (!site) {
    const seed = normalizeSiteSections(websiteSchema.parse(sampleSite) as WebsiteData);
    site = await prisma.site.create({
      data: {
        name: seed.meta?.name ?? "My Site",
        data: JSON.stringify(seed),
      },
    });
  }
  return site;
}

export async function getSiteData(): Promise<WebsiteData> {
  const row = await getOrCreateSiteRow();
  return parseSiteData(row.data);
}
