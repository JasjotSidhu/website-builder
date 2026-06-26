import type { SectionInstance, WebsiteData } from "@/lib/types";
import { DEFAULT_TESTIMONIALS_COLLECTION_ID } from "./types";
import { isTestimonialsCollectionMode } from "./resolve-section-props";
import type { TestimonialCollectionItem } from "./types";

function nowIso() {
  return new Date().toISOString();
}

/**
 * One shared testimonials pool per site.
 * - Merges stray testimonial collections into testimonials-default
 * - Points every shared section at the default collection
 * - Strips stale inline testimonials from shared sections
 */
export function normalizeTestimonialsCollections(site: WebsiteData): WebsiteData {
  const collections = { ...(site.collections ?? {}) };
  const defaultExisting = collections[DEFAULT_TESTIMONIALS_COLLECTION_ID];

  let mergedItems: TestimonialCollectionItem[] =
    defaultExisting?.type === "testimonials"
      ? [...(defaultExisting.items as TestimonialCollectionItem[])]
      : [];

  const seenIds = new Set(mergedItems.map((item) => item.id));

  for (const [id, collection] of Object.entries(collections)) {
    if (id === DEFAULT_TESTIMONIALS_COLLECTION_ID || collection.type !== "testimonials") {
      continue;
    }

    for (const item of collection.items as TestimonialCollectionItem[]) {
      if (!seenIds.has(item.id)) {
        mergedItems.push(item);
        seenIds.add(item.id);
      }
    }

    delete collections[id];
  }

  const now = nowIso();
  collections[DEFAULT_TESTIMONIALS_COLLECTION_ID] = {
    id: DEFAULT_TESTIMONIALS_COLLECTION_ID,
    type: "testimonials",
    name: "Testimonials",
    items: mergedItems.map((item, index) => ({ ...item, order: index })),
    createdAt:
      defaultExisting?.type === "testimonials" ? defaultExisting.createdAt : now,
    updatedAt: now,
  };

  const pages = site.pages.map((page) => ({
    ...page,
    sections: page.sections.map((section) => normalizeTestimonialsSection(section)),
  }));

  return {
    ...site,
    collections,
    pages,
  };
}

function normalizeTestimonialsSection(section: SectionInstance): SectionInstance {
  if (section.type !== "testimonials" || !isTestimonialsCollectionMode(section.props)) {
    return section;
  }

  const nextProps: Record<string, unknown> = { ...section.props };
  delete nextProps.testimonials;
  delete nextProps.testimonialsPrivateEdits;
  nextProps.dataSource = {
    mode: "collection",
    collectionId: DEFAULT_TESTIMONIALS_COLLECTION_ID,
    sort: "manual",
  };

  return { ...section, props: nextProps };
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
