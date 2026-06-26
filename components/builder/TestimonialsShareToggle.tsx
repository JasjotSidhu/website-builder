"use client";

import { isTestimonialsCollectionMode } from "@/lib/collections/resolve-section-props";
import { useBuilderStore } from "@/store/builderStore";

interface TestimonialsShareToggleProps {
  sectionId: string;
  sectionProps: Record<string, unknown>;
}

export default function TestimonialsShareToggle({
  sectionId,
  sectionProps,
}: TestimonialsShareToggleProps) {
  const setTestimonialsShared = useBuilderStore((state) => state.setTestimonialsShared);
  const isShared = isTestimonialsCollectionMode(sectionProps);

  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
      <input
        type="checkbox"
        className="mt-0.5"
        checked={isShared}
        onChange={(event) => setTestimonialsShared(sectionId, event.target.checked)}
      />
      <span className="min-w-0">
        <span className="block text-sm font-medium text-gray-900">Share across site</span>
        <span className="mt-1 block text-xs leading-relaxed text-gray-500">
          {isShared
            ? "These testimonials appear on every page that uses this shared list. Edit them on the canvas below."
            : "Testimonials belong to this section only. Turn on sharing to reuse them on other pages."}
        </span>
      </span>
    </label>
  );
}
