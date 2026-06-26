import type { TestimonialCollectionItem } from "./types";

export interface TestimonialDisplayItem {
  id?: string;
  quote: string;
  name: string;
  role: string;
  avatar?: string;
}

export function collectionItemToTestimonial(item: TestimonialCollectionItem): TestimonialDisplayItem {
  return {
    id: item.id,
    quote: item.quote,
    name: item.name,
    role: item.role,
    avatar: item.avatar,
  };
}

export function syncTestimonialsToCollectionItems(
  displayItems: TestimonialDisplayItem[],
  previousItems: TestimonialCollectionItem[],
): TestimonialCollectionItem[] {
  const now = new Date().toISOString();

  return displayItems.map((item, index) => {
    const byId = item.id ? previousItems.find((entry) => entry.id === item.id) : undefined;
    const existing = byId ?? previousItems[index];

    return {
      id: existing?.id ?? item.id ?? `testimonial-${crypto.randomUUID()}`,
      order: index,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      quote: item.quote,
      name: item.name,
      role: item.role,
      avatar: item.avatar,
    };
  });
}

export function createEmptyTestimonialItem(order: number): TestimonialCollectionItem {
  const now = new Date().toISOString();
  return {
    id: `testimonial-${crypto.randomUUID()}`,
    order,
    createdAt: now,
    updatedAt: now,
    quote: "New testimonial",
    name: "Name",
    role: "Role",
  };
}
