import type { SectionInstance, WebsiteData } from "@/lib/types";
import { resolveSectionListItems } from "./resolve";
import { collectionItemToTestimonial } from "./testimonials";
import type { SectionDataSource, TestimonialCollectionItem } from "./types";
import { DEFAULT_TESTIMONIALS_COLLECTION_ID } from "./types";

export function resolveSectionRenderProps(
  site: WebsiteData,
  section: SectionInstance,
): Record<string, unknown> {
  if (section.type !== "testimonials") {
    return section.props;
  }

  const testimonials = resolveSectionListItems<TestimonialCollectionItem>({
    site,
    dataSource: isTestimonialsCollectionMode(section.props)
      ? {
          mode: "collection",
          collectionId: DEFAULT_TESTIMONIALS_COLLECTION_ID,
          sort: "manual",
        }
      : (section.props.dataSource as SectionDataSource | undefined),
    inlineKey: "testimonials",
    props: section.props,
  }).map(collectionItemToTestimonial);

  return {
    ...section.props,
    testimonials,
  };
}

export function isTestimonialsCollectionMode(props: Record<string, unknown>): boolean {
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

export function getTestimonialsCollectionId(props: Record<string, unknown>): string | null {
  if (!isTestimonialsCollectionMode(props)) {
    return null;
  }

  return DEFAULT_TESTIMONIALS_COLLECTION_ID;
}
