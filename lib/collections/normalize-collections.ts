import type { SectionInstance, WebsiteData } from "@/lib/types";
import {
  DEFAULT_BLOG_COLLECTION_ID,
  DEFAULT_FAQ_COLLECTION_ID,
  DEFAULT_TEAM_COLLECTION_ID,
  DEFAULT_TESTIMONIALS_COLLECTION_ID,
} from "./types";
import type {
  BlogCollectionItem,
  FaqCollectionItem,
  TeamCollectionItem,
  TestimonialCollectionItem,
} from "./types";
import { isSectionCollectionMode } from "./resolve-section-props";
import { isListSectionType, LIST_SECTION_CONFIG } from "./list-section-config";

function nowIso() {
  return new Date().toISOString();
}

type NormalizableCollectionItem =
  | TestimonialCollectionItem
  | TeamCollectionItem
  | BlogCollectionItem
  | FaqCollectionItem;

function normalizeDefaultCollection<T extends NormalizableCollectionItem>(
  collections: Record<string, unknown>,
  defaultId: string,
  collectionType: T extends TestimonialCollectionItem
    ? "testimonials"
    : T extends TeamCollectionItem
      ? "team"
      : T extends BlogCollectionItem
        ? "blog"
        : "faq",
  collectionName: string,
): T[] {
  const existing = collections[defaultId] as { type?: string; items?: T[]; createdAt?: string } | undefined;
  let mergedItems: T[] =
    existing?.type === collectionType && Array.isArray(existing.items) ? [...existing.items] : [];

  const seenIds = new Set(mergedItems.map((item) => item.id));

  for (const [id, collection] of Object.entries(collections)) {
    const entry = collection as { type?: string; items?: T[] };
    if (id === defaultId || entry.type !== collectionType) {
      continue;
    }

    for (const item of entry.items ?? []) {
      if (!seenIds.has(item.id)) {
        mergedItems.push(item);
        seenIds.add(item.id);
      }
    }

    delete collections[id];
  }

  const now = nowIso();
  collections[defaultId] = {
    id: defaultId,
    type: collectionType,
    name: collectionName,
    items: mergedItems.map((item, index) => ({ ...item, order: index })),
    createdAt: existing?.type === collectionType ? existing.createdAt : now,
    updatedAt: now,
  };

  return mergedItems;
}

function normalizeSharedListSection(section: SectionInstance): SectionInstance {
  if (!isListSectionType(section.type) || !isSectionCollectionMode(section.props)) {
    return section;
  }

  const config = LIST_SECTION_CONFIG[section.type];
  const nextProps: Record<string, unknown> = { ...section.props };
  delete nextProps[config.inlineKey];
  delete nextProps[config.privateEditsKey];
  nextProps.dataSource = {
    mode: "collection",
    collectionId: config.defaultCollectionId,
    sort: "manual",
  };

  return { ...section, props: nextProps };
}

/**
 * Merges stray collection pools and normalizes shared list-based sections.
 */
export function normalizeSiteCollections(site: WebsiteData): WebsiteData {
  const collections = { ...(site.collections ?? {}) } as Record<string, unknown>;

  normalizeDefaultCollection<TestimonialCollectionItem>(
    collections,
    DEFAULT_TESTIMONIALS_COLLECTION_ID,
    "testimonials",
    "Testimonials",
  );
  normalizeDefaultCollection<TeamCollectionItem>(
    collections,
    DEFAULT_TEAM_COLLECTION_ID,
    "team",
    "Team",
  );
  normalizeDefaultCollection<BlogCollectionItem>(
    collections,
    DEFAULT_BLOG_COLLECTION_ID,
    "blog",
    "Blog",
  );
  normalizeDefaultCollection<FaqCollectionItem>(
    collections,
    DEFAULT_FAQ_COLLECTION_ID,
    "faq",
    "FAQs",
  );

  const pages = site.pages.map((page) => ({
    ...page,
    sections: page.sections.map((section) => normalizeSharedListSection(section)),
  }));

  return {
    ...site,
    collections: collections as WebsiteData["collections"],
    pages,
  };
}

export function findSectionInSite(
  site: WebsiteData,
  sectionId: string,
): SectionInstance | null {
  for (const page of site.pages) {
    const section = page.sections.find((entry) => entry.id === sectionId);
    if (section) {
      return section;
    }
  }

  return null;
}
