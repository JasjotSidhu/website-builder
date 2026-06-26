import type { SectionInstance, WebsiteData } from "@/lib/types";
import { resolveSectionListItems } from "./resolve";
import { collectionItemToTestimonial } from "./testimonials";
import { collectionItemToTeamMember } from "./team";
import type { SectionDataSource, TeamCollectionItem, TestimonialCollectionItem } from "./types";
import { isListSectionType, LIST_SECTION_CONFIG } from "./list-section-config";

export function isSectionCollectionMode(props: Record<string, unknown>): boolean {
  const source = props.dataSource;
  return (
    typeof source === "object" &&
    source !== null &&
    "mode" in source &&
    (source as SectionDataSource).mode === "collection" &&
    "collectionId" in source &&
    typeof (source as { collectionId: unknown }).collectionId === "string"
  );
}

/** @deprecated Use isSectionCollectionMode */
export const isTestimonialsCollectionMode = isSectionCollectionMode;

export function resolveSectionRenderProps(
  site: WebsiteData,
  section: SectionInstance,
): Record<string, unknown> {
  if (!isListSectionType(section.type)) {
    return section.props;
  }

  const config = LIST_SECTION_CONFIG[section.type];
  const dataSource = isSectionCollectionMode(section.props)
    ? {
        mode: "collection" as const,
        collectionId: config.defaultCollectionId,
        sort: "manual" as const,
      }
    : (section.props.dataSource as SectionDataSource | undefined);

  if (section.type === "testimonials") {
    const testimonials = resolveSectionListItems<TestimonialCollectionItem>({
      site,
      dataSource,
      inlineKey: config.inlineKey,
      props: section.props,
    }).map(collectionItemToTestimonial);

    return { ...section.props, testimonials };
  }

  const members = resolveSectionListItems<TeamCollectionItem>({
    site,
    dataSource,
    inlineKey: config.inlineKey,
    props: section.props,
  }).map(collectionItemToTeamMember);

  return { ...section.props, members };
}

export function getTestimonialsCollectionId(props: Record<string, unknown>): string | null {
  if (!isSectionCollectionMode(props)) {
    return null;
  }

  return LIST_SECTION_CONFIG.testimonials.defaultCollectionId;
}

export function getTeamCollectionId(props: Record<string, unknown>): string | null {
  if (!isSectionCollectionMode(props)) {
    return null;
  }

  return LIST_SECTION_CONFIG.team.defaultCollectionId;
}
