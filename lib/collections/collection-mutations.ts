import type { Collection, TestimonialCollectionItem } from "./types";
import { DEFAULT_TESTIMONIALS_COLLECTION_ID } from "./types";
import type { SectionInstance, WebsiteData } from "@/lib/types";
import { createEmptyTestimonialItem, syncTestimonialsToCollectionItems } from "./testimonials";
import type { TestimonialDisplayItem } from "./testimonials";
import { resolveSectionRenderProps } from "./resolve-section-props";

function nowIso() {
  return new Date().toISOString();
}

function ensureCollections(site: WebsiteData): WebsiteData {
  return {
    ...site,
    schemaVersion: site.schemaVersion ?? 2,
    collections: site.collections ?? {},
  };
}

export function ensureDefaultTestimonialsCollection(
  site: WebsiteData,
): { site: WebsiteData; collectionId: string } {
  const next = ensureCollections(site);
  const existing = next.collections?.[DEFAULT_TESTIMONIALS_COLLECTION_ID];
  if (existing?.type === "testimonials") {
    return { site: next, collectionId: DEFAULT_TESTIMONIALS_COLLECTION_ID };
  }

  const now = nowIso();
  const collection: Collection<"testimonials"> = {
    id: DEFAULT_TESTIMONIALS_COLLECTION_ID,
    type: "testimonials",
    name: "Testimonials",
    items: [],
    createdAt: now,
    updatedAt: now,
  };

  return {
    site: {
      ...next,
      collections: {
        ...next.collections,
        [DEFAULT_TESTIMONIALS_COLLECTION_ID]: collection,
      },
    },
    collectionId: DEFAULT_TESTIMONIALS_COLLECTION_ID,
  };
}

const TESTIMONIALS_PRIVATE_EDITS_KEY = "testimonialsPrivateEdits";

export function setTestimonialsSectionShared(
  site: WebsiteData,
  section: SectionInstance,
  shared: boolean,
): WebsiteData {
  if (section.type !== "testimonials") {
    return site;
  }

  if (!shared) {
    const resolved = resolveSectionRenderProps(site, section);
    const testimonials = Array.isArray(resolved.testimonials) ? resolved.testimonials : [];

    const pages = site.pages.map((page) => ({
      ...page,
      sections: page.sections.map((entry) => {
        if (entry.id !== section.id) {
          return entry;
        }

        const nextProps: Record<string, unknown> = {
          ...entry.props,
          testimonials,
          [TESTIMONIALS_PRIVATE_EDITS_KEY]: true,
        };
        delete nextProps.dataSource;
        return { ...entry, props: nextProps };
      }),
    }));

    return { ...site, pages };
  }

  const inline = Array.isArray(section.props.testimonials)
    ? (section.props.testimonials as TestimonialDisplayItem[])
    : [];
  const wasEditedPrivately = section.props[TESTIMONIALS_PRIVATE_EDITS_KEY] === true;

  let nextSite = ensureDefaultTestimonialsCollection(site).site;
  const collection = nextSite.collections?.[DEFAULT_TESTIMONIALS_COLLECTION_ID];
  const existingItems =
    collection?.type === "testimonials"
      ? (collection.items as TestimonialCollectionItem[])
      : [];

  let items = existingItems;

  if (wasEditedPrivately && inline.length > 0) {
    items = syncTestimonialsToCollectionItems(inline, existingItems);
  } else if (existingItems.length === 0 && inline.length > 0) {
    items = syncTestimonialsToCollectionItems(inline, []);
  }

  if (collection?.type === "testimonials") {
    nextSite = {
      ...nextSite,
      collections: {
        ...nextSite.collections,
        [DEFAULT_TESTIMONIALS_COLLECTION_ID]: {
          ...collection,
          items,
          updatedAt: nowIso(),
        },
      },
    };
  }

  const pages = nextSite.pages.map((page) => ({
    ...page,
    sections: page.sections.map((entry) => {
      if (entry.id !== section.id) {
        return entry;
      }

      const nextProps = { ...entry.props };
      delete nextProps.testimonials;
      delete nextProps[TESTIMONIALS_PRIVATE_EDITS_KEY];
      nextProps.dataSource = {
        mode: "collection" as const,
        collectionId: DEFAULT_TESTIMONIALS_COLLECTION_ID,
        sort: "manual" as const,
      };
      return { ...entry, props: nextProps };
    }),
  }));

  return { ...nextSite, pages };
}

export function updateTestimonialsCollectionItems(
  site: WebsiteData,
  collectionId: string,
  displayItems: TestimonialDisplayItem[],
): WebsiteData {
  const next = ensureCollections(site);
  const collection = next.collections?.[collectionId];
  if (!collection || collection.type !== "testimonials") {
    return site;
  }

  const items = syncTestimonialsToCollectionItems(
    displayItems,
    collection.items as TestimonialCollectionItem[],
  );

  return {
    ...next,
    collections: {
      ...next.collections,
      [collectionId]: {
        ...collection,
        items,
        updatedAt: nowIso(),
      },
    },
  };
}

export function addTestimonialToCollection(
  site: WebsiteData,
  collectionId: string,
): WebsiteData {
  const next = ensureCollections(site);
  const collection = next.collections?.[collectionId];
  if (!collection || collection.type !== "testimonials") {
    return site;
  }

  const items = [
    ...(collection.items as TestimonialCollectionItem[]),
    createEmptyTestimonialItem(collection.items.length),
  ];

  return {
    ...next,
    collections: {
      ...next.collections,
      [collectionId]: {
        ...collection,
        items,
        updatedAt: nowIso(),
      },
    },
  };
}

export function removeTestimonialFromCollection(
  site: WebsiteData,
  collectionId: string,
  itemId: string,
): WebsiteData {
  const next = ensureCollections(site);
  const collection = next.collections?.[collectionId];
  if (!collection || collection.type !== "testimonials") {
    return site;
  }

  const items = (collection.items as TestimonialCollectionItem[])
    .filter((item) => item.id !== itemId)
    .map((item, index) => ({ ...item, order: index, updatedAt: nowIso() }));

  return {
    ...next,
    collections: {
      ...next.collections,
      [collectionId]: {
        ...collection,
        items,
        updatedAt: nowIso(),
      },
    },
  };
}
