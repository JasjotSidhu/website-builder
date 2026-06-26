import type { TeamCollectionItem } from "./types";

export interface TeamMemberDisplayItem {
  id?: string;
  name: string;
  role: string;
  bio?: string;
  avatar?: string;
}

export function collectionItemToTeamMember(item: TeamCollectionItem): TeamMemberDisplayItem {
  return {
    id: item.id,
    name: item.name,
    role: item.role,
    bio: item.bio,
    avatar: item.avatar,
  };
}

export function syncTeamMembersToCollectionItems(
  displayItems: TeamMemberDisplayItem[],
  previousItems: TeamCollectionItem[],
): TeamCollectionItem[] {
  const now = new Date().toISOString();

  return displayItems.map((item, index) => {
    const byId = item.id ? previousItems.find((entry) => entry.id === item.id) : undefined;
    const existing = byId ?? previousItems[index];

    return {
      id: existing?.id ?? item.id ?? `team-${crypto.randomUUID()}`,
      order: index,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      name: item.name,
      role: item.role,
      bio: item.bio,
      avatar: item.avatar,
    };
  });
}

export function createEmptyTeamMember(order: number): TeamCollectionItem {
  const now = new Date().toISOString();
  return {
    id: `team-${crypto.randomUUID()}`,
    order,
    createdAt: now,
    updatedAt: now,
    name: "Name",
    role: "Role",
    bio: "Short bio",
  };
}
