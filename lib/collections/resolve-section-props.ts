import type { SectionInstance, WebsiteData } from "@/lib/types";
import { resolveBlogSectionProps } from "./resolve-blog-section";
import { resolveSectionListItems } from "./resolve";
import { collectionItemToFaq } from "./faq";
import { collectionItemToTestimonial } from "./testimonials";
import { collectionItemToTeamMember } from "./team";
import type {
  FaqCollectionItem,
  SectionDataSource,
  TeamCollectionItem,
  TestimonialCollectionItem,
} from "./types";
import { DEFAULT_BLOG_COLLECTION_ID } from "./types";
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
  if (section.type === "blog") {
    return resolveBlogSectionProps(site, section);
  }

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

  const resolvedItems = resolveSectionListItems({
    site,
    dataSource,
    inlineKey: config.inlineKey,
    props: section.props,
  });

  if (section.type === "testimonials") {
    const testimonials = (resolvedItems as TestimonialCollectionItem[]).map(
      collectionItemToTestimonial,
    );
    return { ...section.props, testimonials };
  }

  if (section.type === "team") {
    const members = (resolvedItems as TeamCollectionItem[]).map(collectionItemToTeamMember);
    return { ...section.props, members };
  }

  const faqs = (resolvedItems as FaqCollectionItem[]).map(collectionItemToFaq);
  return { ...section.props, faqs };
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

export function getBlogCollectionId(props: Record<string, unknown>): string | null {
  if (!isSectionCollectionMode(props)) {
    return null;
  }

  return DEFAULT_BLOG_COLLECTION_ID;
}

export function getFaqCollectionId(props: Record<string, unknown>): string | null {
  if (!isSectionCollectionMode(props)) {
    return null;
  }

  return LIST_SECTION_CONFIG.faq.defaultCollectionId;
}
