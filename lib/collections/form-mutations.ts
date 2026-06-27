import { DEFAULT_FORMS_COLLECTION_ID } from "./types";
import type { FormCollectionItem } from "./types";
import type { WebsiteData } from "@/lib/types";

function nowIso() {
  return new Date().toISOString();
}

export function ensureDefaultFormsCollection(site: WebsiteData): WebsiteData {
  const collections = { ...(site.collections ?? {}) };
  const existing = collections[DEFAULT_FORMS_COLLECTION_ID];

  if (existing?.type === "forms") {
    return site;
  }

  const now = nowIso();
  collections[DEFAULT_FORMS_COLLECTION_ID] = {
    id: DEFAULT_FORMS_COLLECTION_ID,
    type: "forms",
    name: "Forms",
    items: [],
    createdAt: now,
    updatedAt: now,
  };

  return { ...site, collections };
}

export function updateFormsCollectionItems(
  site: WebsiteData,
  items: FormCollectionItem[],
): WebsiteData {
  const now = nowIso();
  const collections = { ...(site.collections ?? {}) };
  const existing = collections[DEFAULT_FORMS_COLLECTION_ID];

  collections[DEFAULT_FORMS_COLLECTION_ID] = {
    id: DEFAULT_FORMS_COLLECTION_ID,
    type: "forms",
    name: "Forms",
    items: items.map((item, index) => ({ ...item, order: index, updatedAt: now })),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  return { ...site, collections };
}
