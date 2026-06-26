import { prisma } from "@/lib/db";
import { websiteSchema } from "@/lib/schemas";
import { normalizeSiteSections } from "@/lib/traits/normalize";
import type { WebsiteData } from "@/lib/types";
import { createWebsiteData } from "./website-factory";
import { ensureUniqueWebsiteSlug, slugifyWebsiteName, validateWebsiteSlug } from "./website-slugs";

function parseWebsiteData(raw: string): WebsiteData {
  const parsed = websiteSchema.parse(JSON.parse(raw));
  return normalizeSiteSections(parsed as WebsiteData);
}

function serializeWebsiteData(site: WebsiteData): string {
  return JSON.stringify(normalizeSiteSections(websiteSchema.parse(site) as WebsiteData));
}

export class WebsiteAccessError extends Error {
  constructor(message = "Website not found") {
    super(message);
    this.name = "WebsiteAccessError";
  }
}

export interface WebsiteSummary {
  id: string;
  name: string;
  slug: string;
  publishedAt: Date | null;
  hasUnpublishedChanges: boolean;
  updatedAt: Date;
}

export async function listWebsitesForUser(userId: string): Promise<WebsiteSummary[]> {
  const rows = await prisma.website.findMany({
    where: { ownerId: userId },
    orderBy: { updatedAt: "desc" },
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    publishedAt: row.publishedAt,
    hasUnpublishedChanges: row.draftData !== row.publishedData,
    updatedAt: row.updatedAt,
  }));
}

export async function getOwnedWebsite(userId: string, websiteId: string) {
  const website = await prisma.website.findFirst({
    where: { id: websiteId, ownerId: userId },
  });

  if (!website) {
    throw new WebsiteAccessError();
  }

  return website;
}

export async function getWebsiteBySlug(slug: string) {
  return prisma.website.findUnique({ where: { slug } });
}

export async function createWebsiteForUser(
  userId: string,
  input: { name: string; slug?: string },
) {
  const name = input.name.trim() || "Untitled website";
  const baseSlug = slugifyWebsiteName(input.slug?.trim() || name);
  const slugError = validateWebsiteSlug(baseSlug);
  if (slugError) {
    throw new Error(slugError);
  }

  const slug = await ensureUniqueWebsiteSlug(baseSlug, async (candidate) => {
    const existing = await prisma.website.findUnique({ where: { slug: candidate } });
    return Boolean(existing);
  });

  const websiteId = crypto.randomUUID();
  const data = createWebsiteData(websiteId, name);
  const payload = serializeWebsiteData(data);

  return prisma.website.create({
    data: {
      id: websiteId,
      ownerId: userId,
      name,
      slug,
      draftData: payload,
      publishedData: payload,
      publishedAt: new Date(),
    },
  });
}

export async function getDraftWebsiteData(userId: string, websiteId: string): Promise<WebsiteData> {
  const row = await getOwnedWebsite(userId, websiteId);
  return parseWebsiteData(row.draftData);
}

export async function getPublishedWebsiteDataBySlug(slug: string): Promise<WebsiteData | null> {
  const row = await getWebsiteBySlug(slug);
  if (!row) {
    return null;
  }
  return parseWebsiteData(row.publishedData);
}

export async function saveDraftWebsiteData(
  userId: string,
  websiteId: string,
  site: WebsiteData,
): Promise<void> {
  const row = await getOwnedWebsite(userId, websiteId);
  const payload = serializeWebsiteData({ ...site, siteId: websiteId });

  await prisma.website.update({
    where: { id: row.id },
    data: {
      draftData: payload,
      name: site.meta?.name?.trim() || row.name,
    },
  });
}

export async function publishWebsiteData(userId: string, websiteId: string): Promise<Date> {
  const row = await getOwnedWebsite(userId, websiteId);
  const publishedAt = new Date();

  await prisma.website.update({
    where: { id: row.id },
    data: {
      publishedData: row.draftData,
      publishedAt,
    },
  });

  return publishedAt;
}

export async function getWebsitePublishStatus(userId: string, websiteId: string) {
  const row = await getOwnedWebsite(userId, websiteId);
  return {
    publishedAt: row.publishedAt,
    hasUnpublishedChanges: row.draftData !== row.publishedData,
    slug: row.slug,
  };
}

export function parseAndValidateWebsiteBody(body: unknown): WebsiteData {
  return normalizeSiteSections(websiteSchema.parse(body) as WebsiteData);
}
