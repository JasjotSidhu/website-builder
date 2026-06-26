import type { SiteMigration } from "./types";
import type { Collection, TestimonialCollectionItem } from "@/lib/collections/types";

/**
 * v2 adds:
 * - schemaVersion: 2
 * - collections: {}
 *
 * Optional opt-in step (run from builder UI, not automatically):
 * - lift inline testimonials from sections into a default collection
 */
export const migrateV1ToV2: SiteMigration = {
  fromVersion: 1,
  toVersion: 2,
  migrate(site) {
    return {
      ...site,
      schemaVersion: 2,
      collections: typeof site.collections === "object" && site.collections !== null
        ? site.collections
        : {},
    };
  },
};

/**
 * Example opt-in migration helper (not run on every load).
 * Converts first testimonials section with inline data to a shared collection.
 */
export function liftInlineTestimonialsToCollection(site: Record<string, unknown>): Record<string, unknown> {
  const pages = Array.isArray(site.pages) ? site.pages : [];
  const collections = (
    typeof site.collections === "object" && site.collections !== null ? site.collections : {}
  ) as Record<string, Collection>;

  const collectionId = "testimonials-default";
  if (collections[collectionId]) {
    return site;
  }

  let extracted: TestimonialCollectionItem[] | null = null;

  const nextPages = pages.map((page) => {
    if (!page || typeof page !== "object" || !Array.isArray((page as { sections?: unknown }).sections)) {
      return page;
    }

    const sections = (page as { sections: unknown[] }).sections.map((section) => {
      if (!section || typeof section !== "object") {
        return section;
      }

      const entry = section as {
        type?: string;
        props?: Record<string, unknown>;
      };

      if (entry.type !== "testimonials" || extracted || !Array.isArray(entry.props?.testimonials)) {
        return section;
      }

      const now = new Date().toISOString();
      extracted = entry.props.testimonials.map((item, index) => {
        const row = item as { quote?: string; name?: string; role?: string; avatar?: string };
        return {
          id: `testimonial-${index + 1}`,
          order: index,
          createdAt: now,
          updatedAt: now,
          quote: row.quote ?? "",
          name: row.name ?? "",
          role: row.role ?? "",
          avatar: row.avatar,
        };
      });

      return {
        ...entry,
        props: {
          ...entry.props,
          dataSource: { mode: "collection", collectionId, sort: "manual" },
          // Keep inline copy during transition; resolver prefers collection when present
          testimonials: entry.props?.testimonials,
        },
      };
    });

    return { ...(page as object), sections };
  });

  if (!extracted) {
    return site;
  }

  const now = new Date().toISOString();
  collections[collectionId] = {
    id: collectionId,
    type: "testimonials",
    name: "Testimonials",
    items: extracted,
    createdAt: now,
    updatedAt: now,
  };

  return {
    ...site,
    schemaVersion: 2,
    pages: nextPages,
    collections,
  };
}
