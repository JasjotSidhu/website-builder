"use client";

import type { ListSectionType } from "@/lib/collections/list-section-config";
import { LIST_SECTION_CONFIG } from "@/lib/collections/list-section-config";
import { isSectionCollectionMode } from "@/lib/collections/resolve-section-props";
import { useBuilderStore } from "@/store/builderStore";

interface CollectionShareToggleProps {
  sectionType: ListSectionType;
  sectionId: string;
  sectionProps: Record<string, unknown>;
}

export default function CollectionShareToggle({
  sectionType,
  sectionId,
  sectionProps,
}: CollectionShareToggleProps) {
  const setSectionShared = useBuilderStore((state) => state.setSectionShared);
  const config = LIST_SECTION_CONFIG[sectionType];
  const isShared = isSectionCollectionMode(sectionProps);

  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
      <input
        type="checkbox"
        className="mt-0.5"
        checked={isShared}
        onChange={(event) => setSectionShared(sectionType, sectionId, event.target.checked)}
      />
      <span className="min-w-0">
        <span className="block text-sm font-medium text-gray-900">Share across site</span>
        <span className="mt-1 block text-xs leading-relaxed text-gray-500">
          {isShared
            ? `These ${config.shareItemLabel} appear on every page that uses this shared list. Edit them on the canvas below.`
            : `These ${config.shareItemLabel} belong to this section only. Turn on sharing to reuse them on other pages.`}
        </span>
      </span>
    </label>
  );
}
