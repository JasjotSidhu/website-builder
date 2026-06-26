import type { LinkValue } from "@/lib/types";

/** Bump when site JSON shape changes in a breaking or structural way. */
/** Sites without schemaVersion are treated as v1. */
export const CURRENT_SITE_SCHEMA_VERSION = 2;

/** Single shared testimonials pool per website. */
export const DEFAULT_TESTIMONIALS_COLLECTION_ID = "testimonials-default";

/** Single shared team pool per website. */
export const DEFAULT_TEAM_COLLECTION_ID = "team-default";

/** Single shared blog pool per website. */
export const DEFAULT_BLOG_COLLECTION_ID = "blog-default";

/** Single shared FAQ pool per website. */
export const DEFAULT_FAQ_COLLECTION_ID = "faq-default";

/** Discriminator for collection item shape. Defined in code, not per-site. */
export type CollectionType =
  | "testimonials"
  | "team"
  | "features"
  | "blog"
  | "faq";

export interface CollectionItemBase {
  id: string;
  /** Manual ordering in builder UI */
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface TestimonialCollectionItem extends CollectionItemBase {
  quote: string;
  name: string;
  role: string;
  avatar?: string;
}

export interface TeamCollectionItem extends CollectionItemBase {
  name: string;
  role: string;
  bio?: string;
  avatar?: string;
  socialLinks?: { label: string; link: LinkValue }[];
}

export interface FeatureCollectionItem extends CollectionItemBase {
  icon: string;
  title: string;
  description: string;
  image?: string;
}

export interface BlogCollectionItem extends CollectionItemBase {
  slug: string;
  title: string;
  excerpt?: string;
  body: string;
  coverImage?: string;
  author?: string;
  publishedAt?: string;
  featured?: boolean;
  tags?: string[];
  seo?: {
    title?: string;
    description?: string;
  };
}

export interface FaqCollectionItem extends CollectionItemBase {
  question: string;
  answer: string;
}

export type CollectionItemByType = {
  testimonials: TestimonialCollectionItem;
  team: TeamCollectionItem;
  features: FeatureCollectionItem;
  blog: BlogCollectionItem;
  faq: FaqCollectionItem;
};

export interface Collection<T extends CollectionType = CollectionType> {
  id: string;
  type: T;
  name: string;
  items: CollectionItemByType[T][];
  /** Type-specific options (e.g. blog default author) */
  meta?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

/** All collections for one website, keyed by collection id. */
export type SiteCollections = Record<string, Collection>;

/**
 * How a section gets its list data.
 * - inline: legacy props on the section (current behaviour)
 * - collection: read from site.collections[collectionId]
 */
export type SectionDataSource =
  | {
      mode: "inline";
    }
  | {
      mode: "collection";
      collectionId: string;
      /** Subset / ordering for this section instance */
      limit?: number;
      sort?: "manual" | "newest" | "oldest";
      /** Optional filter by item ids (manual pick) */
      itemIds?: string[];
    };

/** Props extension used by list-based sections (testimonials, features, team, blog list). */
export interface CollectionAwareSectionProps {
  dataSource?: SectionDataSource;
}
