import type { CollectionType } from "./types";

export interface CollectionTypeDefinition {
  type: CollectionType;
  label: string;
  pluralLabel: string;
  /** Section types that may bind to this collection */
  compatibleSectionTypes: string[];
  /** Max items recommended in JSON for this type before SQL split */
  softItemLimit: number;
}

/**
 * Collection schemas live in code. Site JSON only stores instances.
 * Add new types here when shipping team, blog, etc.
 */
export const COLLECTION_TYPE_REGISTRY: Record<CollectionType, CollectionTypeDefinition> = {
  testimonials: {
    type: "testimonials",
    label: "Testimonial",
    pluralLabel: "Testimonials",
    compatibleSectionTypes: ["testimonials"],
    softItemLimit: 50,
  },
  team: {
    type: "team",
    label: "Team member",
    pluralLabel: "Team",
    compatibleSectionTypes: ["team"],
    softItemLimit: 40,
  },
  features: {
    type: "features",
    label: "Feature",
    pluralLabel: "Features",
    compatibleSectionTypes: ["features"],
    softItemLimit: 30,
  },
  blog: {
    type: "blog",
    label: "Post",
    pluralLabel: "Blog posts",
    compatibleSectionTypes: ["blog"],
    /** Blog may move to SQL later; JSON ok for early MVP */
    softItemLimit: 100,
  },
};

export function isCollectionType(value: string): value is CollectionType {
  return value in COLLECTION_TYPE_REGISTRY;
}

export function canSectionUseCollectionType(
  sectionType: string,
  collectionType: CollectionType,
): boolean {
  return COLLECTION_TYPE_REGISTRY[collectionType].compatibleSectionTypes.includes(sectionType);
}
