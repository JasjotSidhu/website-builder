import type { SiteCollections, SectionDataSource } from "./types";
import type { WebsiteData } from "@/lib/types";

export interface ResolveListItemsOptions<T> {
  site: WebsiteData;
  dataSource?: SectionDataSource;
  /** Legacy inline array on section props */
  inlineItems?: T[];
  /** Key used in section props for inline data (e.g. "testimonials", "items") */
  inlineKey: string;
  props: Record<string, unknown>;
}

/**
 * Single resolver for list-based sections.
 * Published sites keep working: missing dataSource → inline props.
 */
export function resolveSectionListItems<T>({
  site,
  dataSource,
  inlineItems,
  inlineKey,
  props,
}: ResolveListItemsOptions<T>): T[] {
  const source = dataSource ?? inferDataSource(props);
  const fallbackInline =
    inlineItems ?? (Array.isArray(props[inlineKey]) ? (props[inlineKey] as T[]) : []);

  if (source.mode === "inline") {
    return fallbackInline;
  }

  const collection = site.collections?.[source.collectionId];
  if (!collection) {
    return fallbackInline;
  }

  let items = [...collection.items] as T[];

  if (source.itemIds?.length) {
    const picked = new Set(source.itemIds);
    items = items.filter((item) => picked.has((item as { id: string }).id));
    const order = new Map(source.itemIds.map((id, index) => [id, index]));
    items.sort(
      (a, b) =>
        (order.get((a as { id: string }).id) ?? 0) - (order.get((b as { id: string }).id) ?? 0),
    );
  } else if (source.sort === "newest" || source.sort === "oldest") {
    items.sort((a, b) => {
      const aTime = Date.parse((a as { updatedAt?: string }).updatedAt ?? "");
      const bTime = Date.parse((b as { updatedAt?: string }).updatedAt ?? "");
      return source.sort === "newest" ? bTime - aTime : aTime - bTime;
    });
  } else {
    items.sort(
      (a, b) =>
        ((a as { order?: number }).order ?? 0) - ((b as { order?: number }).order ?? 0),
    );
  }

  if (typeof source.limit === "number" && source.limit > 0) {
    items = items.slice(0, source.limit);
  }

  return items;
}

function inferDataSource(props: Record<string, unknown>): SectionDataSource {
  const raw = props.dataSource;
  if (
    raw &&
    typeof raw === "object" &&
    "mode" in raw &&
    (raw as SectionDataSource).mode === "collection" &&
    "collectionId" in raw &&
    typeof (raw as { collectionId: unknown }).collectionId === "string"
  ) {
    return raw as SectionDataSource;
  }

  return { mode: "inline" };
}

export function emptyCollections(): SiteCollections {
  return {};
}
