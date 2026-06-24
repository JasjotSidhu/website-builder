"use client";

import { sectionRegistry, findSectionVariant } from "@/lib/registry";
import { useBuilderStore } from "@/store/builderStore";

export default function SectionOutline() {
  const sections = useBuilderStore((state) => state.site.pages[0].sections);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-900">Outline</h2>
        <p className="text-xs text-gray-500">{sections.length} sections</p>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {sections.length === 0 ? (
          <p className="px-2 py-4 text-sm text-gray-500">No sections yet.</p>
        ) : (
          <ul className="space-y-1">
            {sections.map((section, index) => {
              const variant = findSectionVariant(section.type, section.variant);

              return (
                <li
                  key={section.id}
                  className={`rounded-md px-3 py-2 ${section.hidden ? "opacity-50" : ""}`}
                >
                  <span className="block text-xs text-gray-400">{index + 1}</span>
                  <span className="block text-sm font-medium text-gray-800">
                    {sectionRegistry[section.type]?.label ?? section.type}
                    {section.hidden ? " (hidden)" : ""}
                  </span>
                  <span className="block text-xs text-gray-500">
                    {variant?.label ?? section.variant}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
