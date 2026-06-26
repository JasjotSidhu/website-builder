import type { SectionInstance, WebsiteData } from "@/lib/types";
import type { ListSectionType } from "./list-section-config";
import { LIST_SECTION_CONFIG } from "./list-section-config";
import { isSectionCollectionMode } from "./resolve-section-props";
import { setTeamSectionShared, updateTeamCollectionItems } from "./team-mutations";
import {
  setTestimonialsSectionShared,
  updateTestimonialsCollectionItems,
} from "./collection-mutations";
import type { TeamMemberDisplayItem } from "./team";
import type { TestimonialDisplayItem } from "./testimonials";

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
  if (sectionType === "testimonials") {
    return setTestimonialsSectionShared(site, section, shared);
  }

  return setTeamSectionShared(site, section, shared);
}

export function updateListSectionItems(
  site: WebsiteData,
  sectionType: ListSectionType,
  collectionId: string,
  items: TestimonialDisplayItem[] | TeamMemberDisplayItem[],
): WebsiteData {
  if (sectionType === "testimonials") {
    return updateTestimonialsCollectionItems(
      site,
      collectionId,
      items as TestimonialDisplayItem[],
    );
  }

  return updateTeamCollectionItems(site, collectionId, items as TeamMemberDisplayItem[]);
}

export function getListSectionCollectionId(sectionType: ListSectionType): string {
  return LIST_SECTION_CONFIG[sectionType].defaultCollectionId;
}
