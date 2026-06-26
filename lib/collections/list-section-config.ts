import type { CollectionType } from "./types";
import {
  DEFAULT_TEAM_COLLECTION_ID,
  DEFAULT_TESTIMONIALS_COLLECTION_ID,
} from "./types";

export type ListSectionType = "testimonials" | "team";

export interface ListSectionConfig {
  sectionType: ListSectionType;
  inlineKey: string;
  defaultCollectionId: string;
  privateEditsKey: string;
  collectionType: CollectionType;
  shareItemLabel: string;
  emptyStateMessage: string;
}

export const LIST_SECTION_CONFIG: Record<ListSectionType, ListSectionConfig> = {
  testimonials: {
    sectionType: "testimonials",
    inlineKey: "testimonials",
    defaultCollectionId: DEFAULT_TESTIMONIALS_COLLECTION_ID,
    privateEditsKey: "testimonialsPrivateEdits",
    collectionType: "testimonials",
    shareItemLabel: "testimonials",
    emptyStateMessage: "No testimonials yet — add one below",
  },
  team: {
    sectionType: "team",
    inlineKey: "members",
    defaultCollectionId: DEFAULT_TEAM_COLLECTION_ID,
    privateEditsKey: "teamPrivateEdits",
    collectionType: "team",
    shareItemLabel: "team members",
    emptyStateMessage: "No team members yet — add one below",
  },
};

export function isListSectionType(type: string): type is ListSectionType {
  return type in LIST_SECTION_CONFIG;
}
