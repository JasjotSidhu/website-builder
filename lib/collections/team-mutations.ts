import type { Collection, TeamCollectionItem } from "./types";
import { DEFAULT_TEAM_COLLECTION_ID } from "./types";
import type { SectionInstance, WebsiteData } from "@/lib/types";
import {
  collectionItemToTeamMember,
  createEmptyTeamMember,
  syncTeamMembersToCollectionItems,
} from "./team";
import type { TeamMemberDisplayItem } from "./team";
import { resolveSectionRenderProps } from "./resolve-section-props";
import { LIST_SECTION_CONFIG } from "./list-section-config";

const TEAM_PRIVATE_EDITS_KEY = LIST_SECTION_CONFIG.team.privateEditsKey;

function nowIso() {
  return new Date().toISOString();
}

function ensureCollections(site: WebsiteData): WebsiteData {
  return {
    ...site,
    schemaVersion: site.schemaVersion ?? 2,
    collections: site.collections ?? {},
  };
}

export function ensureDefaultTeamCollection(
  site: WebsiteData,
): { site: WebsiteData; collectionId: string } {
  const next = ensureCollections(site);
  const existing = next.collections?.[DEFAULT_TEAM_COLLECTION_ID];
  if (existing?.type === "team") {
    return { site: next, collectionId: DEFAULT_TEAM_COLLECTION_ID };
  }

  const now = nowIso();
  const collection: Collection<"team"> = {
    id: DEFAULT_TEAM_COLLECTION_ID,
    type: "team",
    name: "Team",
    items: [],
    createdAt: now,
    updatedAt: now,
  };

  return {
    site: {
      ...next,
      collections: {
        ...next.collections,
        [DEFAULT_TEAM_COLLECTION_ID]: collection,
      },
    },
    collectionId: DEFAULT_TEAM_COLLECTION_ID,
  };
}

export function setTeamSectionShared(
  site: WebsiteData,
  section: SectionInstance,
  shared: boolean,
): WebsiteData {
  if (section.type !== "team") {
    return site;
  }

  const inlineKey = LIST_SECTION_CONFIG.team.inlineKey;

  if (!shared) {
    const resolved = resolveSectionRenderProps(site, section);
    const members = Array.isArray(resolved[inlineKey]) ? resolved[inlineKey] : [];

    const pages = site.pages.map((page) => ({
      ...page,
      sections: page.sections.map((entry) => {
        if (entry.id !== section.id) {
          return entry;
        }

        const nextProps: Record<string, unknown> = {
          ...entry.props,
          [inlineKey]: members,
          [TEAM_PRIVATE_EDITS_KEY]: true,
        };
        delete nextProps.dataSource;
        return { ...entry, props: nextProps };
      }),
    }));

    return { ...site, pages };
  }

  const inline = Array.isArray(section.props[inlineKey])
    ? (section.props[inlineKey] as TeamMemberDisplayItem[])
    : [];
  const wasEditedPrivately = section.props[TEAM_PRIVATE_EDITS_KEY] === true;

  let nextSite = ensureDefaultTeamCollection(site).site;
  const collection = nextSite.collections?.[DEFAULT_TEAM_COLLECTION_ID];
  const existingItems =
    collection?.type === "team" ? (collection.items as TeamCollectionItem[]) : [];

  let items = existingItems;

  if (wasEditedPrivately && inline.length > 0) {
    items = syncTeamMembersToCollectionItems(inline, existingItems);
  } else if (existingItems.length === 0 && inline.length > 0) {
    items = syncTeamMembersToCollectionItems(inline, []);
  }

  if (collection?.type === "team") {
    nextSite = {
      ...nextSite,
      collections: {
        ...nextSite.collections,
        [DEFAULT_TEAM_COLLECTION_ID]: {
          ...collection,
          items,
          updatedAt: nowIso(),
        },
      },
    };
  }

  const pages = nextSite.pages.map((page) => ({
    ...page,
    sections: page.sections.map((entry) => {
      if (entry.id !== section.id) {
        return entry;
      }

      const nextProps = { ...entry.props };
      delete nextProps[inlineKey];
      delete nextProps[TEAM_PRIVATE_EDITS_KEY];
      nextProps.dataSource = {
        mode: "collection" as const,
        collectionId: DEFAULT_TEAM_COLLECTION_ID,
        sort: "manual" as const,
      };
      return { ...entry, props: nextProps };
    }),
  }));

  return { ...nextSite, pages };
}

export function updateTeamCollectionItems(
  site: WebsiteData,
  collectionId: string,
  displayItems: TeamMemberDisplayItem[],
): WebsiteData {
  const next = ensureCollections(site);
  const collection = next.collections?.[collectionId];
  if (!collection || collection.type !== "team") {
    return site;
  }

  const items = syncTeamMembersToCollectionItems(
    displayItems,
    collection.items as TeamCollectionItem[],
  );

  return {
    ...next,
    collections: {
      ...next.collections,
      [collectionId]: {
        ...collection,
        items,
        updatedAt: nowIso(),
      },
    },
  };
}

export function addTeamMemberToCollection(site: WebsiteData, collectionId: string): WebsiteData {
  const next = ensureCollections(site);
  const collection = next.collections?.[collectionId];
  if (!collection || collection.type !== "team") {
    return site;
  }

  const items = [
    ...(collection.items as TeamCollectionItem[]),
    createEmptyTeamMember(collection.items.length),
  ];

  return {
    ...next,
    collections: {
      ...next.collections,
      [collectionId]: {
        ...collection,
        items,
        updatedAt: nowIso(),
      },
    },
  };
}
