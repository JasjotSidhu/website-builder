import type { FaqCollectionItem } from "./types";

export interface FaqDisplayItem {
  id?: string;
  question: string;
  answer: string;
}

export function collectionItemToFaq(item: FaqCollectionItem): FaqDisplayItem {
  return {
    id: item.id,
    question: item.question,
    answer: item.answer,
  };
}

export function syncFaqsToCollectionItems(
  displayItems: FaqDisplayItem[],
  previousItems: FaqCollectionItem[],
): FaqCollectionItem[] {
  const now = new Date().toISOString();

  return displayItems.map((item, index) => {
    const byId = item.id ? previousItems.find((entry) => entry.id === item.id) : undefined;
    const existing = byId ?? previousItems[index];

    return {
      id: existing?.id ?? item.id ?? `faq-${crypto.randomUUID()}`,
      order: index,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      question: item.question,
      answer: item.answer,
    };
  });
}

export function createEmptyFaq(order: number): FaqCollectionItem {
  const now = new Date().toISOString();
  return {
    id: `faq-${crypto.randomUUID()}`,
    order,
    createdAt: now,
    updatedAt: now,
    question: "Your question here?",
    answer: "Answer goes here.",
  };
}
