export type PlaceholderPlanType = "free_trial" | "monthly" | "yearly";

export interface PlaceholderWebsitePlan {
  type: PlaceholderPlanType;
  planTag: string;
  detailTag: string;
}

const PLACEHOLDER_PLANS: PlaceholderWebsitePlan[] = [
  { type: "free_trial", planTag: "Free trial", detailTag: "14 days left" },
  { type: "monthly", planTag: "Monthly", detailTag: "Renews Apr 12, 2026" },
  { type: "yearly", planTag: "Yearly", detailTag: "Renews Jan 8, 2027" },
];

export function getPlaceholderWebsitePlan(index: number): PlaceholderWebsitePlan {
  return PLACEHOLDER_PLANS[index % PLACEHOLDER_PLANS.length];
}
