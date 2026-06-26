import type { SectionInstance, WebsiteData } from "@/lib/types";
import type { ListSectionType } from "./list-section-config";
import { LIST_SECTION_CONFIG } from "./list-section-config";
import { isSectionCollectionMode } from "./resolve-section-props";
import { setFaqSectionShared, updateFaqCollectionItems } from "./faq-mutations";
import { setTeamSectionShared, updateTeamCollectionItems } from "./team-mutations";
import {
  setTestimonialsSectionShared,
  updateTestimonialsCollectionItems,
} from "./collection-mutations";
import type { FaqDisplayItem } from "./faq";
import type { TeamMemberDisplayItem } from "./team";
import type { TestimonialDisplayItem } from "./testimonials";

export type ListSectionDisplayItem =
  | TestimonialDisplayItem
  | TeamMemberDisplayItem
  | FaqDisplayItem;

const SET_SHARED_HANDLERS: Record<
  ListSectionType,
  (site: WebsiteData, section: SectionInstance, shared: boolean) => WebsiteData
> = {
  testimonials: setTestimonialsSectionShared,
  team: setTeamSectionShared,
  faq: setFaqSectionShared,
};

const UPDATE_ITEMS_HANDLERS: Record<
  ListSectionType,
  (site: WebsiteData, collectionId: string, items: ListSectionDisplayItem[]) => WebsiteData
> = {
  testimonials: (site, collectionId, items) =>
    updateTestimonialsCollectionItems(site, collectionId, items as TestimonialDisplayItem[]),
  team: (site, collectionId, items) =>
    updateTeamCollectionItems(site, collectionId, items as TeamMemberDisplayItem[]),
  faq: (site, collectionId, items) =>
    updateFaqCollectionItems(site, collectionId, items as FaqDisplayItem[]),
};

export function siteHasSharedListSection(
  site: WebsiteData,
  sectionType: ListSectionType,
  excludeSectionId?: string,
): boolean {
  for (const page of site.pages) {
    for (const section of page.sections) {
      if (
        section.type === sectionType &&
        section.id !== excludeSectionId &&
        isSectionCollectionMode(section.props)
      ) {
        return true;
      }
    }
  }

  return false;
}

export function setListSectionShared(
  site: WebsiteData,
  section: SectionInstance,
  sectionType: ListSectionType,
  shared: boolean,
): WebsiteData {
  return SET_SHARED_HANDLERS[sectionType](site, section, shared);
}

export function updateListSectionItems(
  site: WebsiteData,
  sectionType: ListSectionType,
  collectionId: string,
  items: ListSectionDisplayItem[],
): WebsiteData {
  return UPDATE_ITEMS_HANDLERS[sectionType](site, collectionId, items);
}

export function getListSectionCollectionId(sectionType: ListSectionType): string {
  return LIST_SECTION_CONFIG[sectionType].defaultCollectionId;
}
