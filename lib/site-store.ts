import sampleSite from "@/data/sample-site.json";
import { prisma } from "@/lib/db";
import { websiteSchema } from "@/lib/schemas";
import { normalizeSiteSections } from "@/lib/traits/normalize";
import type { WebsiteData } from "@/lib/types";

function parseSiteData(raw: string): WebsiteData {
  const parsed = websiteSchema.parse(JSON.parse(raw));
  return normalizeSiteSections(parsed as WebsiteData);
}

function serializeSiteData(site: WebsiteData): string {
  return JSON.stringify(normalizeSiteSections(websiteSchema.parse(site) as WebsiteData));
}

function seedSiteData(): WebsiteData {
  return normalizeSiteSections(websiteSchema.parse(sampleSite) as WebsiteData);
}

export async function getOrCreateSiteRow() {
  let site = await prisma.site.findFirst();
  if (!site) {
    const seed = seedSiteData();
    const payload = serializeSiteData(seed);
    site = await prisma.site.create({
      data: {
        name: seed.meta?.name ?? "My Site",
        draftData: payload,
        publishedData: payload,
        publishedAt: new Date(),
      },
    });
  }
  return site;
}

export async function getDraftSiteData(): Promise<WebsiteData> {
  const row = await getOrCreateSiteRow();
  return parseSiteData(row.draftData);
}

export async function getPublishedSiteData(): Promise<WebsiteData> {
  const row = await getOrCreateSiteRow();
  return parseSiteData(row.publishedData);
}

/** @deprecated Use getDraftSiteData or getPublishedSiteData */
export async function getSiteData(): Promise<WebsiteData> {
  return getDraftSiteData();
}

export async function saveDraftSiteData(site: WebsiteData): Promise<void> {
  const row = await getOrCreateSiteRow();
  const payload = serializeSiteData(site);

  await prisma.site.update({
    where: { id: row.id },
    data: {
      draftData: payload,
      name: site.meta?.name ?? row.name,
    },
  });
}

export async function publishSiteData(): Promise<Date> {
  const row = await getOrCreateSiteRow();
  const publishedAt = new Date();

  await prisma.site.update({
    where: { id: row.id },
    data: {
      publishedData: row.draftData,
      publishedAt,
    },
  });

  return publishedAt;
}

export async function hasUnpublishedChanges(): Promise<boolean> {
  const row = await getOrCreateSiteRow();
  return row.draftData !== row.publishedData;
}

export async function getSitePublishStatus(): Promise<{
  publishedAt: Date | null;
  hasUnpublishedChanges: boolean;
}> {
  const row = await getOrCreateSiteRow();
  return {
    publishedAt: row.publishedAt,
    hasUnpublishedChanges: row.draftData !== row.publishedData,
  };
}

export function parseAndValidateSiteBody(body: unknown): WebsiteData {
  return normalizeSiteSections(websiteSchema.parse(body) as WebsiteData);
}
