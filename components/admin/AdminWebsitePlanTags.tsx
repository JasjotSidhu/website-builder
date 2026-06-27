import type { PlaceholderWebsitePlan } from "@/lib/admin-plan-placeholder";

export default function AdminWebsitePlanTags({ plan }: { plan: PlaceholderWebsitePlan }) {
  return (
    <div className="admin-plan-tags">
      <span className={`admin-tag admin-tag--plan admin-tag--${plan.type}`}>{plan.planTag}</span>
      <span className="admin-tag admin-tag--detail">{plan.detailTag}</span>
    </div>
  );
}
