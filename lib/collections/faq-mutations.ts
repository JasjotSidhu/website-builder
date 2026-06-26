import type { Collection, FaqCollectionItem } from "./types";
import { DEFAULT_FAQ_COLLECTION_ID } from "./types";
import type { SectionInstance, WebsiteData } from "@/lib/types";
import { createEmptyFaq, syncFaqsToCollectionItems } from "./faq";
import type { FaqDisplayItem } from "./faq";
import { resolveSectionRenderProps } from "./resolve-section-props";
import { LIST_SECTION_CONFIG } from "./list-section-config";

const FAQ_PRIVATE_EDITS_KEY = LIST_SECTION_CONFIG.faq.privateEditsKey;

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

export function ensureDefaultFaqCollection(
  site: WebsiteData,
): { site: WebsiteData; collectionId: string } {
  const next = ensureCollections(site);
  const existing = next.collections?.[DEFAULT_FAQ_COLLECTION_ID];
  if (existing?.type === "faq") {
    return { site: next, collectionId: DEFAULT_FAQ_COLLECTION_ID };
  }

  const now = nowIso();
  const collection: Collection<"faq"> = {
    id: DEFAULT_FAQ_COLLECTION_ID,
    type: "faq",
    name: "FAQs",
    items: [],
    createdAt: now,
    updatedAt: now,
  };

  return {
    site: {
      ...next,
      collections: {
        ...next.collections,
        [DEFAULT_FAQ_COLLECTION_ID]: collection,
      },
    },
    collectionId: DEFAULT_FAQ_COLLECTION_ID,
  };
}

export function setFaqSectionShared(
  site: WebsiteData,
  section: SectionInstance,
  shared: boolean,
): WebsiteData {
  if (section.type !== "faq") {
    return site;
  }

  const inlineKey = LIST_SECTION_CONFIG.faq.inlineKey;

  if (!shared) {
    const resolved = resolveSectionRenderProps(site, section);
    const faqs = Array.isArray(resolved[inlineKey]) ? resolved[inlineKey] : [];

    const pages = site.pages.map((page) => ({
      ...page,
      sections: page.sections.map((entry) => {
        if (entry.id !== section.id) {
          return entry;
        }

        const nextProps: Record<string, unknown> = {
          ...entry.props,
          [inlineKey]: faqs,
          [FAQ_PRIVATE_EDITS_KEY]: true,
        };
        delete nextProps.dataSource;
        return { ...entry, props: nextProps };
      }),
    }));

    return { ...site, pages };
  }

  const inline = Array.isArray(section.props[inlineKey])
    ? (section.props[inlineKey] as FaqDisplayItem[])
    : [];
  const wasEditedPrivately = section.props[FAQ_PRIVATE_EDITS_KEY] === true;

  let nextSite = ensureDefaultFaqCollection(site).site;
  const collection = nextSite.collections?.[DEFAULT_FAQ_COLLECTION_ID];
  const existingItems =
    collection?.type === "faq" ? (collection.items as FaqCollectionItem[]) : [];

  let items = existingItems;

  if (wasEditedPrivately && inline.length > 0) {
    items = syncFaqsToCollectionItems(inline, existingItems);
  } else if (existingItems.length === 0 && inline.length > 0) {
    items = syncFaqsToCollectionItems(inline, []);
  }

  if (collection?.type === "faq") {
    nextSite = {
      ...nextSite,
      collections: {
        ...nextSite.collections,
        [DEFAULT_FAQ_COLLECTION_ID]: {
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
      delete nextProps[inlineKey];
      delete nextProps[FAQ_PRIVATE_EDITS_KEY];
      nextProps.dataSource = {
        mode: "collection" as const,
        collectionId: DEFAULT_FAQ_COLLECTION_ID,
        sort: "manual" as const,
      };
      return { ...entry, props: nextProps };
    }),
  }));

  return { ...nextSite, pages };
}

export function updateFaqCollectionItems(
  site: WebsiteData,
  collectionId: string,
  displayItems: FaqDisplayItem[],
): WebsiteData {
  const next = ensureCollections(site);
  const collection = next.collections?.[collectionId];
  if (!collection || collection.type !== "faq") {
    return site;
  }

  const items = syncFaqsToCollectionItems(
    displayItems,
    collection.items as FaqCollectionItem[],
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

export function addFaqToCollection(site: WebsiteData, collectionId: string): WebsiteData {
  const next = ensureCollections(site);
  const collection = next.collections?.[collectionId];
  if (!collection || collection.type !== "faq") {
    return site;
  }

  const items = [
    ...(collection.items as FaqCollectionItem[]),
    createEmptyFaq(collection.items.length),
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
